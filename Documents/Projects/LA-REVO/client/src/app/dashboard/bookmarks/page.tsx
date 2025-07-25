"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/app/lib/api";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteSaving, setNoteSaving] = useState<string | null>(null);
  const [noteEdits, setNoteEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("You must be logged in to view bookmarks.");
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE_URL}/bookmarks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to load"))
      .then(data => {
        const bms = Array.isArray(data) ? data : data.bookmarks || [];
        setBookmarks(bms);
        setNoteEdits(Object.fromEntries((bms as any[]).map((bm: any) => [bm.id, bm.note || ""])));
      })
      .catch(() => setError("Failed to load bookmarks."))
      .finally(() => setLoading(false));
  }, []);

  function formatBytes(bytes: number | string) {
    const num = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
    if (!num || num === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  const handleDelete = async (torrentId: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    await fetch(`${API_BASE_URL}/bookmarks/${torrentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setBookmarks(bookmarks.filter(bm => bm.id !== torrentId));
    setNoteEdits(prev => { const copy = { ...prev }; delete copy[torrentId]; return copy; });
  };

  const handleNoteInput = (torrentId: string, value: string) => {
    setNoteEdits(prev => ({ ...prev, [torrentId]: value }));
  };

  const handleNoteBlur = async (torrentId: string) => {
    const bm = bookmarks.find(b => b.id === torrentId);
    const note = noteEdits[torrentId] || "";
    if (!bm || bm.note === note) return; // Only save if changed
    setNoteSaving(torrentId);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    await fetch(`${API_BASE_URL}/bookmarks/${torrentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ note }),
    });
    setBookmarks(bookmarks.map(bm => bm.id === torrentId ? { ...bm, note } : bm));
    setNoteSaving(null);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent mb-2">
            Bookmarks
          </h2>
          <p className="text-text-secondary">Your saved torrents for quick access</p>
        </div>

        {/* Main Card */}
        <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl p-8">
          {loading ? (
            <div className="flex flex-col gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-background/50 border border-border/30 rounded-2xl p-6 flex flex-col gap-2 relative">
                  <div className="h-4 bg-border/30 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-border/30 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-border/30 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-border/30 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-error mb-2">{error}</div>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-text-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-text mb-2">No Bookmarks Found</div>
              <div className="text-text-secondary">You haven't bookmarked any torrents yet.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {bookmarks.map(bm => (
                <div key={bm.id} className="relative bg-gradient-to-r from-primary/10 to-primary-dark/10 backdrop-blur-lg rounded-2xl border-2 border-primary/30 p-6 shadow-lg group hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col gap-2">
                  <button
                    onClick={() => handleDelete(bm.id)}
                    className="absolute top-4 right-4 text-error hover:text-primary text-xl font-bold focus:outline-none"
                    title="Remove bookmark"
                  >
                    &times;
                  </button>
                  <Link href={`/dashboard/${bm.id}`} className="block">
                    <div className="text-xl font-bold text-text mb-1 group-hover:text-primary transition-colors truncate">{bm.name}</div>
                    <div className="text-xs text-text-secondary mb-2">{new Date(bm.createdAt).toLocaleString()} • Size: {formatBytes(bm.size)}</div>
                    <div className="text-text-secondary whitespace-pre-line line-clamp-2">{bm.description}</div>
                  </Link>
                  <div className="mt-2">
                    <label className="block text-xs text-text mb-1">Note:</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-xl border border-border/50 bg-background/70 text-text focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      value={noteEdits[bm.id] || ""}
                      onChange={e => handleNoteInput(bm.id, e.target.value)}
                      onBlur={e => handleNoteBlur(bm.id)}
                      disabled={noteSaving === bm.id}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 