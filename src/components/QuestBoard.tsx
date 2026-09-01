"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "./Pagination";

type Tag = "STUDY" | "PERSONAL" | "PROJECT" | "OTHER";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  completedAt: string | null;
  dueDate: string | null;
  tag: Tag;
};

const CONFETTI_COLORS = ["#FF5D8F", "#FFC93C", "#00C2A8", "#7C5CFC"];

const TAG_META: Record<Tag, { label: string; icon: string }> = {
  STUDY: { label: "Study", icon: "📖" },
  PERSONAL: { label: "Personal", icon: "🌱" },
  PROJECT: { label: "Project", icon: "🛠️" },
  OTHER: { label: "Other", icon: "✨" },
};

function safeTag(tag: Tag | null | undefined): Tag {
  return tag && TAG_META[tag] ? tag : "OTHER";
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function toDateInputValue(iso: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function formatDue(dueDate: string) {
  const d = new Date(dueDate);
  const diffDays = Math.round((new Date(d.toDateString()).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000);
  const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (diffDays < 0) return { text: `Overdue · ${label}`, overdue: true };
  if (diffDays === 0) return { text: `Due today`, overdue: false, today: true };
  if (diffDays === 1) return { text: `Due tomorrow`, overdue: false };
  return { text: `Due ${label}`, overdue: false };
}

export default function QuestBoard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [todoText, setTodoText] = useState("");
  const [todoTag, setTodoTag] = useState<Tag>("OTHER");
  const [todoDue, setTodoDue] = useState("");
  const [filterTag, setFilterTag] = useState<Tag | "ALL">("ALL");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [stampedId, setStampedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editTag, setEditTag] = useState<Tag>("OTHER");
  const [editDue, setEditDue] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const [todosRes, streakRes] = await Promise.all([
          fetch("/api/todos"),
          fetch("/api/streak", { method: "POST" }),
        ]);
        if (todosRes.ok) setTodos(await todosRes.json());
        if (streakRes.ok) {
          const data = await streakRes.json();
          setStreak(data.streak ?? 0);
        }
      } catch {
        setError("Couldn't load your board. Try refreshing.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const active = todos.filter((t) => !t.done);
  const filtered = filterTag === "ALL" ? active : active.filter((t) => t.tag === filterTag);

  const visible = useMemo(() => {
    const withDue = filtered.filter((t) => t.dueDate);
    const withoutDue = filtered.filter((t) => !t.dueDate);
    withDue.sort((a, b) => {
      const diff = new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime();
      return sortDir === "asc" ? diff : -diff;
    });
    // Tasks with no due date always trail behind dated ones, regardless of sort direction.
    return [...withDue, ...withoutDue];
  }, [filtered, sortDir]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filterTag, sortDir, active.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const doneToday = todos.filter(
    (t) => t.done && t.completedAt && t.completedAt.slice(0, 10) === todayKey()
  ).length;

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const text = todoText.trim();
    if (!text) return;
    setTodoText("");
    const dueDate = todoDue ? new Date(todoDue).toISOString() : null;
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, tag: todoTag, dueDate }),
    });
    if (res.ok) {
      const todo = await res.json();
      setTodos((prev) => [todo, ...prev]);
      setTodoDue("");
    } else {
      setError("Couldn't add that quest. Try again.");
    }
  }

  async function toggleTodo(todo: Todo) {
    const nextDone = !todo.done;
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id
          ? { ...t, done: nextDone, completedAt: nextDone ? new Date().toISOString() : null }
          : t
      )
    );
    if (nextDone) {
      setStampedId(todo.id);
      setTimeout(() => setStampedId((cur) => (cur === todo.id ? null : cur)), 700);
    }
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: nextDone }),
    });
    if (!res.ok) {
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, done: todo.done, completedAt: todo.completedAt } : t))
      );
      setError("Couldn't update that quest.");
    }
  }

  async function deleteTodo(id: string) {
    const prev = todos;
    setTodos((cur) => cur.filter((t) => t.id !== id));
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setTodos(prev);
      setError("Couldn't delete that quest.");
    }
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditTag(safeTag(todo.tag));
    setEditDue(toDateInputValue(todo.dueDate));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    const text = editText.trim();
    if (!text) return;
    const dueDate = editDue ? new Date(editDue).toISOString() : null;
    const prev = todos;
    setTodos((cur) => cur.map((t) => (t.id === id ? { ...t, text, tag: editTag, dueDate } : t)));
    setEditingId(null);
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, tag: editTag, dueDate }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos((cur) => cur.map((t) => (t.id === id ? updated : t)));
    } else {
      setTodos(prev);
      setError("Couldn't save those changes.");
    }
  }

  function confettiPieces() {
    const n = 10;
    return Array.from({ length: n }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const dist = 40 + Math.random() * 30;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist - 10;
      return (
        <span
          key={i}
          style={{
            // @ts-expect-error custom property
            "--fly": `translate(${x}px, ${y}px)`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${Math.random() * 0.05}s`,
          }}
        />
      );
    });
  }

  return (
    <>
      <div className="quick-stats">
        <div className="stat streak">🔥 {streak}-day streak</div>
        <div className="stat done-today">✅ {doneToday} done today</div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p className="empty-state show">Loading your board…</p>
      ) : (
        <section className="panel quests" aria-label="Todo quests">
          <div className="section-head">
            <h2>Today&apos;s Quests</h2>
          </div>

          <form className="add-row quest-add-row" onSubmit={addTodo}>
            <input
              value={todoText}
              onChange={(e) => setTodoText(e.target.value)}
              type="text"
              placeholder="What's the next quest?"
              autoComplete="off"
            />
            <select value={todoTag} onChange={(e) => setTodoTag(e.target.value as Tag)} aria-label="Tag">
              {(Object.keys(TAG_META) as Tag[]).map((tag) => (
                <option key={tag} value={tag}>
                  {TAG_META[tag].icon} {TAG_META[tag].label}
                </option>
              ))}
            </select>
            <input
              value={todoDue}
              onChange={(e) => setTodoDue(e.target.value)}
              type="date"
              aria-label="Due date"
            />
            <button type="submit">+ Add</button>
          </form>

          <div className="tag-filters">
            <button
              className={`tag-chip${filterTag === "ALL" ? " active" : ""}`}
              onClick={() => setFilterTag("ALL")}
            >
              All
            </button>
            {(Object.keys(TAG_META) as Tag[]).map((tag) => (
              <button
                key={tag}
                className={`tag-chip tag-${tag.toLowerCase()}${filterTag === tag ? " active" : ""}`}
                onClick={() => setFilterTag(tag)}
              >
                {TAG_META[tag].icon} {TAG_META[tag].label}
              </button>
            ))}
            <button
              className="tag-chip sort-chip"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              title="Toggle sort direction by due date"
            >
              Due date {sortDir === "asc" ? "↑ soonest first" : "↓ latest first"}
            </button>
          </div>

          <ul className="quest-list">
            {pageItems.map((todo) => {
              const tag = safeTag(todo.tag);
              const due = todo.dueDate ? formatDue(todo.dueDate) : null;

              if (editingId === todo.id) {
                return (
                  <li key={todo.id} className="quest editing">
                    <div className="quest-edit-fields">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        type="text"
                        autoFocus
                      />
                      <select value={editTag} onChange={(e) => setEditTag(e.target.value as Tag)} aria-label="Tag">
                        {(Object.keys(TAG_META) as Tag[]).map((t) => (
                          <option key={t} value={t}>
                            {TAG_META[t].icon} {TAG_META[t].label}
                          </option>
                        ))}
                      </select>
                      <input
                        value={editDue}
                        onChange={(e) => setEditDue(e.target.value)}
                        type="date"
                        aria-label="Due date"
                      />
                    </div>
                    <button className="save-btn" onClick={() => saveEdit(todo.id)}>
                      Save
                    </button>
                    <button className="cancel-btn" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </li>
                );
              }

              return (
                <li
                  key={todo.id}
                  className={`quest${todo.done ? " done" : ""}${stampedId === todo.id ? " stamped" : ""}`}
                >
                  <button
                    className="check"
                    aria-label={todo.done ? "Mark quest as not done" : "Mark quest as done"}
                    onClick={() => toggleTodo(todo)}
                  >
                    {todo.done ? "✓" : ""}
                  </button>
                  <div className="quest-body">
                    <span className="quest-text">{todo.text}</span>
                    <div className="quest-meta">
                      <span className={`tag-pill tag-${tag.toLowerCase()}`}>
                        {TAG_META[tag].icon} {TAG_META[tag].label}
                      </span>
                      {due && (
                        <span className={`due-pill${due.overdue ? " overdue" : ""}${due.today ? " today" : ""}`}>
                          {due.text}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="edit-btn" aria-label="Edit quest" onClick={() => startEdit(todo)}>
                    ✎
                  </button>
                  <button className="del-btn" aria-label="Delete quest" onClick={() => deleteTodo(todo.id)}>
                    ×
                  </button>
                  <span className="stamp">DONE!</span>
                  <span className="confetti" aria-hidden="true">
                    {stampedId === todo.id && confettiPieces()}
                  </span>
                </li>
              );
            })}
          </ul>
          {visible.length === 0 && (
            <p className="empty-state show">
              {filterTag === "ALL"
                ? "Your quest board is empty — add your first mission above."
                : "No quests with this tag right now."}
            </p>
          )}
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </section>
      )}
    </>
  );
}
