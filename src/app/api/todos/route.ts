import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const todos = await prisma.todo.findMany({
    where: { userId: (session.user as { id: string }).id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(todos);
}

const VALID_TAGS = ["STUDY", "PERSONAL", "PROJECT", "OTHER"] as const;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });
  if (text.length > 280) return NextResponse.json({ error: "Text too long" }, { status: 400 });

  const tag = VALID_TAGS.includes(body?.tag) ? body.tag : "OTHER";
  let dueDate: Date | null = null;
  if (typeof body?.dueDate === "string" && body.dueDate) {
    const parsed = new Date(body.dueDate);
    if (!Number.isNaN(parsed.getTime())) dueDate = parsed;
  }

  const todo = await prisma.todo.create({
    data: { text, tag, dueDate, userId: (session.user as { id: string }).id },
  });
  return NextResponse.json(todo, { status: 201 });
}
