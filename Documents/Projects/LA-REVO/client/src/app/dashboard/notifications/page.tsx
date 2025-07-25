"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/lib/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError("");
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : data.notifications || []);
      } catch {
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async (id: string) => {
    setActionLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    setActionLoading(false);
  };

  // Mark all as read
  const markAllAsRead = async () => {
    setActionLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setActionLoading(false);
  };

  // Clear all notifications
  const clearAll = async () => {
    setActionLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    await fetch(`${API_BASE_URL}/notifications/clear`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications([]);
    setActionLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-primary">Notifications</h1>
      <div className="flex gap-4 mb-4">
        <button
          onClick={markAllAsRead}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition disabled:opacity-50"
          disabled={actionLoading || notifications.length === 0}
        >
          Mark all as read
        </button>
        <button
          onClick={clearAll}
          className="bg-error text-white px-4 py-2 rounded hover:bg-error/80 transition disabled:opacity-50"
          disabled={actionLoading || notifications.length === 0}
        >
          Clear all
        </button>
        <Link href="/dashboard" className="ml-auto text-primary hover:underline">Back to Dashboard</Link>
      </div>
      {loading ? (
        <div className="text-center text-text-secondary py-8">Loading...</div>
      ) : error ? (
        <div className="text-center text-error py-8">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-text-secondary py-8">No notifications.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map(n => (
            <div key={n.id} className={`bg-surface rounded-lg border border-border p-4 flex items-start gap-4 ${!n.read ? 'bg-primary/5' : ''}`}>
              <div className="flex-1 text-left">
                <div className="text-sm text-text-secondary">{n.type}</div>
                <div className="text-text mb-1">{n.message}</div>
                <div className="text-xs text-text-tertiary">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="text-xs text-primary hover:underline ml-2"
                  disabled={actionLoading}
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 