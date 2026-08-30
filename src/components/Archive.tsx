"use client";

import { useEffect, useState } from "react";

type Tag = "STUDY" | "PERSONAL" | "PROJECT" | "OTHER";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  completedAt: string | null;
  tag: Tag;
};

const TAG_META: Record<Tag, { label: string; icon: string }> = {
  STUDY: { label: "Study", icon: "📖" },
  PERSONAL: { label: "Personal", icon: "🌱" },
  PROJECT: { label: "Project", icon: "🛠️" },
  OTHER: { label: "Other", icon: "✨" },
};

function safeTag(tag: Tag | null | undefined): Tag {
  return tag && TAG_META[tag] ? tag : "OTHER";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function Archive() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/todos")
      .then((res) => (res.ok ? res.json() : []))
      .then((all: Todo[]) => setTodos(all.filter((t) => t.done)))
      .catch(() => setError("Couldn't load your archive."))
      .finally(() => setLoading(false));
  }, []);

  async function restore(id: string) {
    const prev = todos;
    setTodos((cur) => cur.filter((t) => t.id !== id));
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: false }),
    });
    if (!res.ok) {
      setTodos(prev);
      setError("Couldn't restore that quest.");
    }
  }

  async function remove(id: string) {
    const prev = todos;
    setTodos((cur) => cur.filter((t) => t.id !== id));
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setTodos(prev);
      setError("Couldn't delete that quest.");
    }
  }

  // group by completion date
  const groups: Record<string, Todo[]> = {};
  for (const t of todos) {
    const key = t.completedAt ? formatDate(t.completedAt) : "Unknown date";
    groups[key] = groups[key] || [];
    groups[key].push(t);
  }

  return (
    <>
      {error && <div className="error-banner">{error}</div>}
      <section className="panel archive-page" aria-label="Completed quests">
        <div className="section-head">
          <h2>Archive</h2>
          <span className="count-badge">{todos.length} completed</span>
        </div>

        {loading ? (
          <p className="empty-state show">Loading your archive…</p>
        ) : todos.length === 0 ? (
          <p className="empty-state show">Nothing here yet — completed quests will show up as trophies.</p>
        ) : (
          Object.entries(groups).map(([date, items]) => (
            <div key={date} className="archive-group">
              <h3 className="archive-date">{date}</h3>
              <ul className="quest-list">
                {items.map((todo) => (
                  <li key={todo.id} className="quest done archived">
                    <span className="check done-mark">✓</span>
                    <div className="quest-body">
                      <span className="quest-text">{todo.text}</span>
                      <div className="quest-meta">
                        <span className={`tag-pill tag-${safeTag(todo.tag).toLowerCase()}`}>
                          {TAG_META[safeTag(todo.tag)].icon} {TAG_META[safeTag(todo.tag)].label}
                        </span>
                      </div>
                    </div>
                    <button className="restore-btn" onClick={() => restore(todo.id)}>
                      Restore
                    </button>
                    <button className="del-btn" aria-label="Delete permanently" onClick={() => remove(todo.id)}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </>
  );
}
