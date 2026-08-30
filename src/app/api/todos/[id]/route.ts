import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const existing = await prisma.todo.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const data: {
    done?: boolean;
    completedAt?: Date | null;
    text?: string;
    tag?: "STUDY" | "PERSONAL" | "PROJECT" | "OTHER";
    dueDate?: Date | null;
  } = {};

  if (typeof body.done === "boolean") {
    data.done = body.done;
    data.completedAt = body.done ? new Date() : null;
  }
  if (typeof body.text === "string" && body.text.trim()) {
    data.text = body.text.trim().slice(0, 280);
  }
  if (["STUDY", "PERSONAL", "PROJECT", "OTHER"].includes(body.tag)) {
    data.tag = body.tag;
  }
  if (body.dueDate === null) {
    data.dueDate = null;
  } else if (typeof body.dueDate === "string" && body.dueDate) {
    const parsed = new Date(body.dueDate);
    if (!Number.isNaN(parsed.getTime())) data.dueDate = parsed;
  }

  const todo = await prisma.todo.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(todo);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const existing = await prisma.todo.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.todo.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
