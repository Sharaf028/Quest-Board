import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LandingCTA from "@/components/LandingCTA";

export default async function Landing() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/board");
  }

  return (
    <div className="landing">
      <div className="landing-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Quest Board logo" className="brand-logo large" width={96} height={96} />
        <h1>Quest Board</h1>
        <p className="landing-tagline">
          A playful place to log your daily quests, save what you're studying, and build a streak
          you actually want to keep.
        </p>
        <LandingCTA />
      </div>

      <div className="landing-features">
        <div className="feature-card">
          <div className="feature-icon">🗡️</div>
          <h3>Quests, not chores</h3>
          <p>Add todos, watch them get a satisfying stamp when done, tag them, and set due dates.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📚</div>
          <h3>Resources</h3>
          <p>Save articles, docs, and study resources in one place instead of a dozen browser tabs.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔥</div>
          <h3>Daily streaks</h3>
          <p>Open it, do one thing, keep the flame alive. Your progress is private to your account.</p>
        </div>
      </div>
    </div>
  );
}