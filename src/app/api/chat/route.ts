import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BASE_PROMPT = `You are the Quest Board assistant, a friendly and encouraging helper built into a
personal todo/study app called Quest Board. The app frames tasks as "quests" and tracks a daily streak.
Help the user brainstorm and break down tasks, plan their day or study session, answer study questions
using their saved resources, and stay motivated. Keep replies concise (a few sentences unless more detail
is clearly needed) and warm without being over-the-top. You can see the user's current quests and saved
resources below and should use that data to answer questions about them (e.g. "what's due soon", "what do
I have saved on X"). You cannot yet create, edit, or delete anything directly — if asked to do that,
say so and suggest they do it on the board or resources page.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

const GEMINI_MODEL = "gemini-3.6-flash";

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

type TodoRow = { text: string; tag: string; dueDate: Date | null; completedAt: Date | null };
type LinkRow = { title: string | null; url: string; category: string };

async function buildContext(userId: string): Promise<string> {
  const [activeTodos, recentDone, links] = await Promise.all([
    prisma.todo.findMany({
      where: { userId, done: false },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 60,
    }) as Promise<TodoRow[]>,
    prisma.todo.findMany({
      where: { userId, done: true },
      orderBy: { completedAt: "desc" },
      take: 20,
    }) as Promise<TodoRow[]>,
    prisma.link.findMany({
      where: { userId },
      orderBy: { category: "asc" },
      take: 100,
    }) as Promise<LinkRow[]>,
  ]);

  const activeLines = activeTodos.length
    ? activeTodos
        .map((t: TodoRow) => `- "${t.text}" [${t.tag}]${t.dueDate ? ` due ${formatDate(t.dueDate)}` : ""}`)
        .join("\n")
    : "(none)";

  const doneLines = recentDone.length
    ? recentDone
        .map(
          (t: TodoRow) =>
            `- "${t.text}" [${t.tag}]${t.completedAt ? ` completed ${formatDate(t.completedAt)}` : ""}`
        )
        .join("\n")
    : "(none)";

  const byCategory = new Map<string, LinkRow[]>();
  for (const link of links) {
    const cat = link.category || "General";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(link);
  }
  const resourceLines = links.length
    ? Array.from(byCategory.entries())
        .map(
          ([cat, items]) =>
            `[${cat}]\n` + items.map((l: LinkRow) => `- "${l.title || l.url}" - ${l.url}`).join("\n")
        )
        .join("\n\n")
    : "(none)";

  return `Today's date: ${formatDate(new Date())}

ACTIVE QUESTS:
${activeLines}

RECENTLY COMPLETED QUESTS:
${doneLines}

SAVED RESOURCES:
${resourceLines}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The AI assistant isn't configured yet. Add GEMINI_API_KEY to your environment variables." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }

  // Keep the payload bounded: last 20 turns
  const trimmed = messages
    .slice(-20)
    .filter(
      (m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim()
    );

  // Gemini uses "model" instead of "assistant" for the assistant role
  const contents = trimmed.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const context = await buildContext(userId);
    const systemPrompt = `${BASE_PROMPT}\n\nHere is the user's current data on Quest Board:\n\n${context}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Gemini API error:", res.status, errText);
      return NextResponse.json({ error: "The assistant hit a snag. Try again in a moment." }, { status: 502 });
    }

    const data = await res.json();
    const reply: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!reply) {
      return NextResponse.json({ error: "The assistant didn't return a reply. Try again." }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({ error: "Couldn't reach the assistant. Try again in a moment." }, { status: 502 });
  }
}
