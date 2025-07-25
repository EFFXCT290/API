"use client";
import React, { useEffect, useState } from "react";
import { FormField } from "@/components/ui/FigmaFloatingLabelInput";
import { API_BASE_URL } from "@/app/lib/api";

interface PeerBan {
  id: string;
  userId?: string;
  passkey?: string;
  peerId?: string;
  ip?: string;
  reason: string;
  expiresAt?: string | null;
  createdAt: string;
  bannedBy: { id: string; username: string; role: string };
}

export default function AdminPeerBansPage() {
  const [bans, setBans] = useState<PeerBan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ userId: "", passkey: "", peerId: "", ip: "", reason: "", expiresAt: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [viewModal, setViewModal] = useState<{ open: boolean; ban: PeerBan | null }>({ open: false, ban: null });
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const fetchBans = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE_URL}/admin/peerban`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch peer bans");
      const data = await res.json();
      setBans(Array.isArray(data) ? data : data.bans || data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBans();
  }, []);

  const handleInput = (name: string, value: string) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/peerban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create peer ban");
      }
      setShowModal(false);
      setForm({ userId: "", passkey: "", peerId: "", ip: "", reason: "", expiresAt: "" });
      fetchBans();
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this ban?")) return;
    setRemoveLoading(true);
    setRemoveError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/peerban/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove ban");
      }
      setViewModal({ open: false, ban: null });
      fetchBans();
    } catch (e: any) {
      setRemoveError(e.message);
    } finally {
      setRemoveLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">Peer Ban Management</h1>
          <p className="text-text-secondary">Ban or unban users, passkeys, peers, or IPs from the tracker</p>
        </div>
        <button
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow"
          onClick={() => setShowModal(true)}
        >
          + New Ban
        </button>
      </div>
      {loading ? (
        <div className="text-text-secondary">Loading peer bans...</div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : (
        <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-bg-hover">
                <th className="px-4 py-3 text-left text-text font-medium">User ID</th>
                <th className="px-4 py-3 text-left text-text font-medium">Passkey</th>
                <th className="px-4 py-3 text-left text-text font-medium">Peer ID</th>
                <th className="px-4 py-3 text-left text-text font-medium">IP</th>
                <th className="px-4 py-3 text-left text-text font-medium">Reason</th>
                <th className="px-4 py-3 text-left text-text font-medium">Expires</th>
                <th className="px-4 py-3 text-left text-text font-medium">Created</th>
                <th className="px-4 py-3 text-left text-text font-medium">Banned By</th>
                <th className="px-4 py-3 text-left text-text font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bans.map(ban => (
                <tr key={ban.id} className="border-t border-border hover:bg-primary/5 transition-colors">
                  <td className="px-4 py-3 text-text">{ban.userId || "-"}</td>
                  <td className="px-4 py-3 text-text">{ban.passkey || "-"}</td>
                  <td className="px-4 py-3 text-text">{ban.peerId || "-"}</td>
                  <td className="px-4 py-3 text-text">{ban.ip || "-"}</td>
                  <td className="px-4 py-3 text-text-secondary">{ban.reason}</td>
                  <td className="px-4 py-3 text-text">{ban.expiresAt ? new Date(ban.expiresAt).toLocaleString() : "Never"}</td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(ban.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-primary font-semibold">{ban.bannedBy?.username || "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      className="text-primary hover:underline text-sm font-semibold"
                      onClick={() => setViewModal({ open: true, ban })}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 p-10 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-text/70 hover:text-text text-2xl font-bold"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-primary">Create Peer Ban</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <FormField
                label="User ID"
                value={form.userId}
                onChange={val => handleInput("userId", val)}
              />
              <FormField
                label="Passkey"
                value={form.passkey}
                onChange={val => handleInput("passkey", val)}
              />
              <FormField
                label="Peer ID"
                value={form.peerId}
                onChange={val => handleInput("peerId", val)}
              />
              <FormField
                label="IP"
                value={form.ip}
                onChange={val => handleInput("ip", val)}
              />
              <FormField
                label="Reason"
                value={form.reason}
                onChange={val => handleInput("reason", val)}
              />
              <FormField
                label="Expires At (optional, ISO or YYYY-MM-DD)"
                value={form.expiresAt}
                onChange={val => handleInput("expiresAt", val)}
              />
              <div className="text-xs text-text-secondary">At least one of User ID, Passkey, Peer ID, or IP is required.</div>
              {createError && <div className="text-error text-sm">{createError}</div>}
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-dark transition-colors w-full shadow"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Ban"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* View Modal */}
      {viewModal.open && viewModal.ban && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 p-10 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-text/70 hover:text-text text-2xl font-bold"
              onClick={() => setViewModal({ open: false, ban: null })}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-primary">Peer Ban Details</h2>
            <div className="mb-2"><span className="font-semibold text-primary">User ID:</span> {viewModal.ban.userId || "-"}</div>
            <div className="mb-2"><span className="font-semibold text-primary">Passkey:</span> {viewModal.ban.passkey || "-"}</div>
            <div className="mb-2"><span className="font-semibold text-primary">Peer ID:</span> {viewModal.ban.peerId || "-"}</div>
            <div className="mb-2"><span className="font-semibold text-primary">IP:</span> {viewModal.ban.ip || "-"}</div>
            <div className="mb-2"><span className="font-semibold text-primary">Reason:</span> {viewModal.ban.reason}</div>
            <div className="mb-2"><span className="font-semibold text-primary">Expires At:</span> {viewModal.ban.expiresAt ? new Date(viewModal.ban.expiresAt).toLocaleString() : "Never"}</div>
            <div className="mb-2"><span className="font-semibold text-primary">Created At:</span> {new Date(viewModal.ban.createdAt).toLocaleString()}</div>
            <div className="mb-2"><span className="font-semibold text-primary">Banned By:</span> {viewModal.ban.bannedBy?.username || "-"}</div>
            {removeError && <div className="text-error text-sm mt-2">{removeError}</div>}
            <button
              className="bg-error text-white px-4 py-2 rounded-xl font-semibold hover:bg-error/80 transition-colors w-full mt-4 shadow"
              onClick={() => handleRemove(viewModal.ban!.id)}
              disabled={removeLoading}
            >
              {removeLoading ? "Removing..." : "Remove Ban"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 