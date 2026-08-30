import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignIn from "@/components/SignIn";
import QuestBoard from "@/components/QuestBoard";

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return <SignIn />;
  return <QuestBoard userName={session.user.name ?? "Adventurer"} userImage={session.user.image ?? null} view="progress" />;
}
