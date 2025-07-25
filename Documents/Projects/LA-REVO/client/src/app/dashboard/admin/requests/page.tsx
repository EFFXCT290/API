"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/lib/api";

interface Request {
  id: string;
  title: string;
  description?: string;
  status: string;
  user: { id: string; username: string };
  filledBy?: { id: string; username: string } | null;
  filledTorrent?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
  createdAt: string;
}

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + "..." : str;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<{ open: boolean; request: Request | null }>({ open: false, request: null });
  const [fillTorrentId, setFillTorrentId] = useState("");
  const [fillLoading, setFillLoading] = useState(false);
  const [fillError, setFillError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE_URL}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, action: "close" | "reject") => {
    setActionLoading(id + action);
    setActionError(null);
    setSuccessMsg(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/request/${id}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${action} request`);
      }
      setSuccessMsg(`Request ${action}d successfully!`);
      fetchRequests();
      setShowEditModal({ open: false, request: null });
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal.request) return;
    setFillLoading(true);
    setFillError(null);
    setSuccessMsg(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/requests/${showEditModal.request.id}/fill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ torrentId: fillTorrentId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fill request");
      }
      setSuccessMsg("Request filled successfully!");
      setFillTorrentId("");
      fetchRequests();
      setShowEditModal({ open: false, request: null });
    } catch (e: any) {
      setFillError(e.message);
    } finally {
      setFillLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
      <div className="mb-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">Request Management</h1>
        <p className="text-text-secondary">Review, fill, close, or reject user requests</p>
      </div>
      {loading ? (
        <div className="text-text-secondary">Loading requests...</div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : (
        <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-bg-hover">
                <th className="px-4 py-3 text-left text-text font-medium">Title</th>
                <th className="px-4 py-3 text-left text-text font-medium">Description</th>
                <th className="px-4 py-3 text-left text-text font-medium">User</th>
                <th className="px-4 py-3 text-left text-text font-medium">Category</th>
                <th className="px-4 py-3 text-left text-text font-medium">Status</th>
                <th className="px-4 py-3 text-left text-text font-medium">Created</th>
                <th className="px-4 py-3 text-left text-text font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} className="border-t border-border hover:bg-primary/5 transition-colors">
                  <td className="px-4 py-3 font-semibold text-primary">{req.title}</td>
                  <td className="px-4 py-3 max-w-xs whitespace-pre-line text-text-secondary">
                    <span title={req.description || ""}>{truncate(req.description || "", 120)}</span>
                  </td>
                  <td className="px-4 py-3 text-text">{req.user?.username}</td>
                  <td className="px-4 py-3 text-text">{req.category?.name || "-"}</td>
                  <td className="px-4 py-3 font-semibold text-text">{req.status}</td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(req.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow text-xs"
                      onClick={() => setShowEditModal({ open: true, request: req })}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {actionError && <div className="text-error p-2">{actionError}</div>}
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal.open && showEditModal.request && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50 p-10 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-text/70 hover:text-text text-2xl font-bold"
              onClick={() => setShowEditModal({ open: false, request: null })}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-primary">Edit Request</h2>
            <div className="mb-2">
              <span className="font-semibold text-primary">Title:</span> {showEditModal.request.title}
            </div>
            <div className="mb-2">
              <span className="font-semibold text-primary">Description:</span>
              <div className="whitespace-pre-line text-text-secondary mt-1">{showEditModal.request.description}</div>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-primary">User:</span> {showEditModal.request.user?.username}
            </div>
            <div className="mb-2">
              <span className="font-semibold text-primary">Category:</span> {showEditModal.request.category?.name || "-"}
            </div>
            <div className="mb-2">
              <span className="font-semibold text-primary">Status:</span> {showEditModal.request.status}
            </div>
            <div className="mb-2">
              <span className="font-semibold text-primary">Created:</span> {new Date(showEditModal.request.createdAt).toLocaleString()}
            </div>
            {showEditModal.request.filledBy && (
              <div className="mb-2">
                <span className="font-semibold text-primary">Filled By:</span> {showEditModal.request.filledBy.username}
              </div>
            )}
            {showEditModal.request.filledTorrent && (
              <div className="mb-2">
                <span className="font-semibold text-primary">Filled Torrent:</span> {showEditModal.request.filledTorrent.name}
              </div>
            )}
            <div className="mt-6 flex flex-col gap-3">
              {showEditModal.request.status === "OPEN" && (
                <>
                  <button
                    className="bg-amber-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-600 transition-colors w-full shadow"
                    onClick={() => handleAction(showEditModal.request!.id, "close")}
                    disabled={actionLoading === showEditModal.request!.id + "close"}
                  >
                    {actionLoading === showEditModal.request!.id + "close" ? "Closing..." : "Close Request"}
                  </button>
                  <button
                    className="bg-error text-white px-4 py-2 rounded-xl font-semibold hover:bg-error/80 transition-colors w-full shadow"
                    onClick={() => handleAction(showEditModal.request!.id, "reject")}
                    disabled={actionLoading === showEditModal.request!.id + "reject"}
                  >
                    {actionLoading === showEditModal.request!.id + "reject" ? "Rejecting..." : "Reject Request"}
                  </button>
                  <form onSubmit={handleFill} className="space-y-2">
                    <div>
                      <label className="block text-text mb-1">Torrent ID</label>
                      <input
                        type="text"
                        value={fillTorrentId}
                        onChange={e => setFillTorrentId(e.target.value)}
                        className="w-full rounded-xl border border-border bg-bg-secondary text-text p-2"
                        required
                      />
                    </div>
                    {fillError && <div className="text-error text-sm">{fillError}</div>}
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-dark transition-colors w-full shadow"
                      disabled={fillLoading}
                    >
                      {fillLoading ? "Filling..." : "Fill Request"}
                    </button>
                  </form>
                </>
              )}
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors w-full shadow"
                onClick={() => setShowEditModal({ open: false, request: null })}
              >
                Close
              </button>
              {successMsg && <div className="text-success text-center mt-2">{successMsg}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 