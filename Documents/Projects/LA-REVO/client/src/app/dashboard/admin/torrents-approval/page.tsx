"use client";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/lib/api";

interface Torrent {
  id: string;
  name: string;
  description: string | null;
  infoHash: string;
  size: string;
  createdAt: string;
  uploader: {
    id: string;
    username: string;
    role: string;
  };
  category: {
    id: string;
    name: string;
  };
  posterUrl?: string;
}

const fetchPendingTorrents = async (token: string): Promise<Torrent[]> => {
  const res = await fetch(`${API_BASE_URL}/admin/torrents?status=pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch pending torrents");
  const data = await res.json();
  return data.torrents;
};

function PosterImage({ src, alt }: { src: string; alt: string }) {
  const [aspectRatio, setAspectRatio] = useState(2 / 3);
  return (
    <div
      style={{
        width: 80,
        aspectRatio: aspectRatio,
        background: "#eee",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        onLoad={e => {
          const img = e.currentTarget;
          setAspectRatio(img.naturalWidth / img.naturalHeight);
        }}
      />
    </div>
  );
}

export default function AdminTorrentApprovalsPage() {
  const [pendingTorrents, setPendingTorrents] = useState<Torrent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    setLoading(true);
    fetchPendingTorrents(token)
      .then(setPendingTorrents)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (torrentId: string) => {
    setActionLoading(torrentId);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/torrent/${torrentId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to approve torrent");
      }
      // Refresh pending torrents
      setPendingTorrents(prev => prev.filter(t => t.id !== torrentId));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to approve torrent");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (torrentId: string) => {
    if (!confirm("Are you sure you want to reject this torrent? This action cannot be undone.")) return;
    setActionLoading(torrentId);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/torrent/${torrentId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to reject torrent");
      }
      // Refresh pending torrents
      setPendingTorrents(prev => prev.filter(t => t.id !== torrentId));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to reject torrent");
    } finally {
      setActionLoading(null);
    }
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
      <div className="mb-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">Torrent Approvals</h1>
        <p className="text-text-secondary">Review and approve or reject newly uploaded torrents</p>
          </div>
      {loading ? (
        <div className="text-text-secondary">Loading pending torrents...</div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : (
        <div className="bg-surface/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-xl p-6 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4 text-text">Pending Approval ({pendingTorrents.length})</h2>
        {pendingTorrents.length === 0 ? (
          <div className="bg-bg-secondary rounded-lg p-8 text-center text-text border border-border">
            No pending torrents
          </div>
        ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-bg-hover">
                  <tr>
                    <th className="py-3 px-4 text-left text-text font-medium">Name</th>
                    <th className="py-3 px-4 text-left text-text font-medium">Category</th>
                    <th className="py-3 px-4 text-left text-text font-medium">Size</th>
                    <th className="py-3 px-4 text-left text-text font-medium">Uploader</th>
                    <th className="py-3 px-4 text-left text-text font-medium">Date</th>
                    <th className="py-3 px-4 text-left text-text font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTorrents.map(torrent => (
                  <tr key={torrent.id} className="border-t border-border hover:bg-primary/5 transition-colors">
                      <td className="py-3 px-4 text-text">
                        <div>
                          {torrent.posterUrl && (
                            <PosterImage src={torrent.posterUrl.startsWith('/uploads/') ? `${API_BASE_URL}${torrent.posterUrl}` : torrent.posterUrl} alt="Poster" />
                          )}
                          <div className="font-medium">{torrent.name}</div>
                          {torrent.description && (
                            <div className="text-xs text-text/70 mt-1 line-clamp-2">{torrent.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text">{torrent.category.name}</td>
                      <td className="py-3 px-4 text-text">{formatFileSize(torrent.size)}</td>
                      <td className="py-3 px-4 text-text">
                        <div>
                          <div className="font-medium">{torrent.uploader.username}</div>
                          <div className="text-xs text-text/70">{torrent.uploader.role}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text">{formatDate(torrent.createdAt)}</td>
                      <td className="py-3 px-4 text-text">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(torrent.id)}
                            disabled={actionLoading === torrent.id}
                          className="bg-green text-white px-3 py-1 rounded-xl text-xs hover:bg-green/80 transition-colors disabled:opacity-50 shadow"
                          >
                            {actionLoading === torrent.id ? "Approving..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleReject(torrent.id)}
                            disabled={actionLoading === torrent.id}
                          className="bg-error text-white px-3 py-1 rounded-xl text-xs hover:bg-error/80 transition-colors disabled:opacity-50 shadow"
                          >
                            {actionLoading === torrent.id ? "Rejecting..." : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          )}
          </div>
        )}
    </div>
  );
} 