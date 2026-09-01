"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "./Pagination";

type Link = {
  id: string;
  title: string | null;
  url: string;
  category: string;
  createdAt: string;
};

const PAGE_SIZE = 10;

export default function Resources() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkCategory, setLinkCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/links")
      .then((res) => (res.ok ? res.json() : []))
      .then(setLinks)
      .catch(() => setError("Couldn't load your links."))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(links.map((l) => l.category || "General"));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [links]);

  const visible =
    activeCategory === "ALL" ? links : links.filter((l) => (l.category || "General") === activeCategory);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, links.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    const url = linkUrl.trim();
    if (!url) return;
    const title = linkTitle.trim();
    const category = linkCategory.trim() || "General";
    setLinkTitle("");
    setLinkUrl("");
    setLinkCategory("");
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, category }),
    });
    if (res.ok) {
      const link = await res.json();
      setLinks((prev) => [link, ...prev]);
    } else {
      setError("Couldn't save that link. Check the URL.");
    }
  }

  async function deleteLink(id: string) {
    const prev = links;
    setLinks((cur) => cur.filter((l) => l.id !== id));
    const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setLinks(prev);
      setError("Couldn't delete that link.");
    }
  }

  function startEdit(link: Link) {
    setEditingId(link.id);
    setEditTitle(link.title ?? "");
    setEditUrl(link.url);
    setEditCategory(link.category || "General");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    const url = editUrl.trim();
    if (!url) return;
    const title = editTitle.trim();
    const category = editCategory.trim() || "General";
    const prev = links;
    setLinks((cur) => cur.map((l) => (l.id === id ? { ...l, title: title || null, url, category } : l)));
    setEditingId(null);
    const res = await fetch(`/api/links/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, category }),
    });
    if (res.ok) {
      const updated = await res.json();
      setLinks((cur) => cur.map((l) => (l.id === id ? updated : l)));
    } else {
      setLinks(prev);
      setError("Couldn't save those changes. Check the URL.");
    }
  }

  return (
    <>
      {error && <div className="error-banner">{error}</div>}
      <section className="panel resources-page" aria-label="Saved resources">
        <div className="section-head">
          <h2>Resources</h2>
          <span className="count-badge">{links.length} saved</span>
        </div>
        <form className="add-row link-row" onSubmit={addLink}>
          <input
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            type="text"
            placeholder="Title"
            autoComplete="off"
          />
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            type="url"
            placeholder="https://..."
            autoComplete="off"
          />
          <input
            value={linkCategory}
            onChange={(e) => setLinkCategory(e.target.value)}
            type="text"
            placeholder="Section (e.g. Compilers)"
            list="category-options"
            autoComplete="off"
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <button type="submit">+ Save</button>
        </form>

        {categories.length > 0 && (
          <div className="tag-filters">
            <button
              className={`tag-chip${activeCategory === "ALL" ? " active" : ""}`}
              onClick={() => setActiveCategory("ALL")}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                className={`tag-chip${activeCategory === c ? " active" : ""}`}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="empty-state show">Loading your links…</p>
        ) : (
          <ul className="link-list">
            {pageItems.map((link) =>
              editingId === link.id ? (
                <li key={link.id} className="link-card editing">
                  <span className="link-dot" />
                  <span className="link-edit-fields">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      type="text"
                      placeholder="Title"
                      autoFocus
                    />
                    <input
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      type="url"
                      placeholder="https://..."
                    />
                    <input
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      type="text"
                      placeholder="Section"
                      list="category-options"
                    />
                  </span>
                  <button className="save-btn" onClick={() => saveEdit(link.id)}>
                    Save
                  </button>
                  <button className="cancel-btn" onClick={cancelEdit}>
                    Cancel
                  </button>
                </li>
              ) : (
                <li key={link.id} className="link-card">
                  <span className="link-dot" />
                  <span className="link-info">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.title || link.url}
                    </a>
                    <span className="link-meta-row">
                      <span className="link-url">{link.url}</span>
                      <span className="tag-pill">{link.category || "General"}</span>
                    </span>
                  </span>
                  <button className="edit-btn" aria-label="Edit link" onClick={() => startEdit(link)}>
                    ✎
                  </button>
                  <button className="del-btn" aria-label="Delete link" onClick={() => deleteLink(link.id)}>
                    ×
                  </button>
                </li>
              )
            )}
          </ul>
        )}
        {!loading && links.length === 0 && (
          <p className="empty-state show">No links saved yet — drop a study resource here.</p>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </section>
    </>
  );
}
