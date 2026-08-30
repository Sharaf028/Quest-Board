import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const [totalCompleted, totalActive, totalLinks, user] = await Promise.all([
    prisma.todo.count({ where: { userId, done: true } }),
    prisma.todo.count({ where: { userId, done: false } }),
    prisma.link.count({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { streak: true, lastVisit: true } }),
  ]);

  return NextResponse.json({
    totalCompleted,
    totalActive,
    totalLinks,
    streak: user?.streak ?? 0,
  });
}
