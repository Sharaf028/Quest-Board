import { requireSession } from "@/lib/session";
import { getQuoteOfDay } from "@/lib/quotes";
import Nav from "@/components/Nav";
import QuestBoard from "@/components/QuestBoard";

export default async function BoardPage() {
  const session = await requireSession();
  const quote = getQuoteOfDay();

  return (
    <div className="app">
      <Nav userName={session.user?.name ?? "Adventurer"} userImage={session.user?.image ?? null} />
      <div className="quote-banner">
        <span className="quote-mark">“</span>
        <p>{quote}</p>
      </div>
      <QuestBoard />
    </div>
  );
}
