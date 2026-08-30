import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const today = new Date();
  const todayKey = dayKey(today);
  let streak = user.streak || 0;

  if (!user.lastVisit) {
    streak = 1;
  } else {
    const lastKey = dayKey(user.lastVisit);
    if (lastKey === todayKey) {
      // already counted today, no change
    } else {
      const diffDays = Math.round(
        (new Date(todayKey).getTime() - new Date(lastKey).getTime()) / 86400000
      );
      streak = diffDays === 1 ? streak + 1 : 1;
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { streak, lastVisit: today },
  });

  return NextResponse.json({ streak: updated.streak });
}
