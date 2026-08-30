"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

type Stats = {
  totalCompleted: number;
  totalActive: number;
  totalLinks: number;
  streak: number;
};

export default function Profile({
  userName,
  userEmail,
  userImage,
}: {
  userName: string;
  userEmail: string;
  userImage: string | null;
}) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  return (
    <section className="panel profile-page" aria-label="Profile">
      <div className="profile-header">
        {userImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="profile-avatar" src={userImage} alt="" width={64} height={64} />
        ) : (
          <div className="profile-avatar placeholder">🙂</div>
        )}
        <div>
          <h2>{userName}</h2>
          <p className="profile-email">{userEmail}</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat-num">{stats ? stats.streak : "—"}</span>
          <span className="profile-stat-label">🔥 day streak</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-num">{stats ? stats.totalCompleted : "—"}</span>
          <span className="profile-stat-label">✅ quests completed</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-num">{stats ? stats.totalActive : "—"}</span>
          <span className="profile-stat-label">🗡️ quests active</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-num">{stats ? stats.totalLinks : "—"}</span>
          <span className="profile-stat-label">📚 links saved</span>
        </div>
      </div>

      <div className="profile-actions">
        <button className="signout-btn" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </button>
      </div>
    </section>
  );
}
