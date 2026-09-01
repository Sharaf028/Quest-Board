import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const SYSTEM_PROMPT = `You are the Quest Board assistant, a friendly and encouraging helper built into a
personal todo/study app called Quest Board. The app frames tasks as "quests" and tracks a daily streak.
Help the user brainstorm and break down tasks, plan their day or study session, answer study questions,
and stay motivated. Keep replies concise (a few sentences unless more detail is clearly needed) and
warm without being over-the-top. You are not able to see or modify the user's actual quests or
resources yet — if asked to add/check off/delete something, say you can't do that directly yet and
suggest they do it on the board.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

const GEMINI_MODEL = "gemini-3.6-flash";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
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
