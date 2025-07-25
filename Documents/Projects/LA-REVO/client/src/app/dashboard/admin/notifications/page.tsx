"use client";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/lib/api";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (unreadOnly) params.append("unread", "true");
    fetch(`${API_BASE_URL}/admin/notifications?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch notifications"))
      .then(data => {
        setNotifications(data.notifications || []);
        setTotal(data.total || 0);
      })
      .catch(() => setError("Failed to load notifications."))
      .finally(() => setLoading(false));
  }, [page, limit, unreadOnly]);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
      <div className="mb-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">Admin Notifications</h1>
        <p className="text-text-secondary">System notifications for admin actions and events</p>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm text-text">
          <input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)} className="accent-primary w-4 h-4 rounded" />
          Show only unread
        </label>
        <span className="text-text-secondary text-xs">Total: {total}</span>
      </div>
      {loading ? (
        <div className="text-text-secondary">Loading notifications...</div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="text-text-secondary">No notifications found.</div>
      ) : (
        <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-bg-hover">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Message</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Read</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(n => (
                <tr key={n.id} className={"border-b border-border " + (n.read ? "bg-background" : "bg-primary/5") }>
                  <td className="px-4 py-3 text-xs font-mono text-text">{n.type}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{n.message}</td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{new Date(n.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-center">{n.read ? "Yes" : <span className="text-primary font-bold">No</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination */}
      {total > limit && (
        <div className="flex gap-2 mt-6 justify-center">
          <button
            className="px-4 py-2 rounded-xl font-semibold border border-border bg-background text-text hover:bg-primary/10 transition disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="px-2 text-sm">Page {page} of {Math.ceil(total / limit)}</span>
          <button
            className="px-4 py-2 rounded-xl font-semibold border border-border bg-background text-text hover:bg-primary/10 transition disabled:opacity-50"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / limit)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
} 