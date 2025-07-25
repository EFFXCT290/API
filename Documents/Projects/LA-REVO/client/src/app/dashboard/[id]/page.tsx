"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CommentThread, Comment } from '@/components/comments/CommentThread';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from "@/app/lib/api";

export default function TorrentDetailsPage() {
  const { id } = useParams();
  const torrentId = Array.isArray(id) ? id[0] : id;
  const [torrent, setTorrent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookmarkMsg, setBookmarkMsg] = useState("");
  // For future: NFO modal
  const [showNfo, setShowNfo] = useState(false);
  const [nfoContent, setNfoContent] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!torrentId || typeof torrentId !== "string") return;
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch(`${API_BASE_URL}/torrent/${encodeURIComponent(torrentId)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(res => res.ok ? res.json() : Promise.reject("Not found"))
      .then(data => setTorrent(data))
      .catch(() => setError("Torrent not found."))
      .finally(() => setLoading(false));
    // Fetch current user id
    if (token) {
      fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => setCurrentUserId(data?.id || null));
    }
  }, [torrentId]);

  function formatBytes(bytes: number | string) {
    const num = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
    if (!num || num === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Secure download for torrent and NFO files
  const handleDownload = async (type: "torrent" | "nfo") => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || typeof torrentId !== "string") return;
    let url = type === "torrent"
      ? `${API_BASE_URL}/torrent/${encodeURIComponent(torrentId)}/download`
      : `${API_BASE_URL}/torrent/${encodeURIComponent(torrentId)}/nfo`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to download file");
      const blob = await res.blob();
      // Figure out filename
      let filename = torrent?.name || "download";
      if (type === "torrent") filename += ".torrent";
      if (type === "nfo") filename += ".nfo";
      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      alert("Download failed. Please try again.");
    }
  };

  const handleBookmark = async () => {
    setBookmarkMsg("");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setBookmarkMsg("You must be logged in to bookmark.");
      return;
    }
    try {
      if (!torrent?.bookmarked) {
        const res = await fetch(`${API_BASE_URL}/bookmarks`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ torrentId: torrentId })
        });
        if (!res.ok) throw new Error();
        setBookmarkMsg("Bookmarked!");
        setTorrent((t: any) => t ? { ...t, bookmarked: true } : t);
      } else if (typeof torrentId === "string") {
        const res = await fetch(`${API_BASE_URL}/bookmarks/${encodeURIComponent(torrentId)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        setBookmarkMsg("Removed from bookmarks.");
        setTorrent((t: any) => t ? { ...t, bookmarked: false } : t);
      }
    } catch {
      setBookmarkMsg(torrent?.bookmarked ? "Failed to remove bookmark." : "Failed to bookmark.");
    }
  };

  // For future: fetch and show NFO inline
  const handleViewNfo = async () => {
    setShowNfo(true);
    setNfoContent("Loading...");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!torrentId) throw new Error("No torrentId");
      const res = await fetch(`${API_BASE_URL}/torrent/${encodeURIComponent(String(torrentId))}/nfo?token=${token}`);
      if (!res.ok) throw new Error();
      const text = await res.text();
      setNfoContent(text);
    } catch {
      setNfoContent("Failed to load NFO.");
    }
  };

  // Helper to get the correct poster URL
  function getPosterUrl() {
    if (!torrent?.posterUrl) return "/placeholder-poster.png";
    if (torrent.posterUrl.startsWith("/uploads/")) {
      return `${API_BASE_URL}${torrent.posterUrl}`;
    }
    return torrent.posterUrl;
  }

  function PosterImage({ src, alt }: { src: string; alt: string }) {
    const [aspectRatio, setAspectRatio] = useState(2 / 3); // default 2:3
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: aspectRatio,
          maxWidth: 300,
          background: "var(--color-surface-light)",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid var(--color-border)",
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onLoad={e => {
            const img = e.currentTarget;
            setAspectRatio(img.naturalWidth / img.naturalHeight);
          }}
        />
      </div>
    );
  }

  const getStatusColor = (seeders: number, leechers: number) => {
    if (seeders === 0) return "text-red-500";
    if (seeders < 5) return "text-yellow-500";
    return "text-green-500";
  };

  function CommentsSection({ torrentId, currentUserId }: { torrentId: string, currentUserId?: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newComment, setNewComment] = useState('');
    const [posting, setPosting] = useState(false);

    // Fetch comments
    useEffect(() => {
      setLoading(true);
      fetch(`${API_BASE_URL}/torrent/${torrentId}/comments`)
        .then(res => res.ok ? res.json() : Promise.reject('Failed to load comments'))
        .then(setComments)
        .catch(() => setError('Failed to load comments.'))
        .finally(() => setLoading(false));
    }, [torrentId]);

    // Get current user token/id
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Add new root comment
    const handlePost = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!token) return setError('You must be logged in to comment.');
      setPosting(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/torrent/${torrentId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content: newComment, parentId: null })
        });
        if (!res.ok) throw new Error('Failed to post comment');
        setNewComment('');
        // Refetch comments
          const data = await fetch(`${API_BASE_URL}/torrent/${torrentId}/comments`).then(r => r.json());
        setComments(data);
      } catch {
        setError('Failed to post comment.');
      } finally {
        setPosting(false);
      }
    };

    // Reply to a comment
    const handleReply = async (parentId: string, content: string) => {
      if (!token) return setError('You must be logged in to comment.');
      try {
        const res = await fetch(`${API_BASE_URL}/torrent/${torrentId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content, parentId })
        });
        if (!res.ok) throw new Error('Failed to reply');
        const data = await fetch(`${API_BASE_URL}/torrent/${torrentId}/comments`).then(r => r.json());
        setComments(data);
      } catch {
        setError('Failed to reply.');
      }
    };

    // Edit a comment
    const handleEdit = async (commentId: string, content: string) => {
      if (!token) return setError('You must be logged in.');
      try {
        const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content })
        });
        if (!res.ok) throw new Error('Failed to edit');
        const data = await fetch(`${API_BASE_URL}/torrent/${torrentId}/comments`).then(r => r.json());
        setComments(data);
      } catch {
        setError('Failed to edit comment.');
      }
    };

    // Delete a comment
    const handleDelete = async (commentId: string) => {
      if (!token) return setError('You must be logged in.');
      try {
        const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete');
        const data = await fetch(`${API_BASE_URL}/torrent/${torrentId}/comments`).then(r => r.json());
        setComments(data);
      } catch {
        setError('Failed to delete comment.');
      }
    };

    // Vote on a comment
    const handleVote = async (commentId: string, value: 1 | -1) => {
      if (!token) return setError('You must be logged in.');
      try {
        const res = await fetch(`${API_BASE_URL}/comments/${commentId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ value })
        });
        if (!res.ok) throw new Error('Failed to vote');
        const data = await fetch(`${API_BASE_URL}/torrent/${torrentId}/comments`).then(r => r.json());
        setComments(data);
      } catch {
        setError('Failed to vote.');
      }
    };

    return (
      <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl overflow-hidden mt-6">
        <div className="p-6 border-b border-border/30">
          <h2 className="text-xl font-bold text-text">Comments</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-text-secondary italic text-center py-8">Loading comments...</div>
          ) : error ? (
            <div className="text-error text-center py-8">{error}</div>
          ) : (
            <>
              {comments.length === 0 ? (
                <div className="text-text-secondary italic text-center py-8">
                  <svg className="w-12 h-12 mx-auto mb-3 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.map(comment => (
                    <CommentThread
                      key={comment.id}
                      comment={comment}
                      currentUserId={currentUserId}
                      onReply={handleReply}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onVote={handleVote}
                    />
                  ))}
                </div>
              )}
              {/* Add Comment */}
              <form onSubmit={handlePost} className="mt-8 flex flex-col gap-3">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  rows={3}
                  placeholder="Write a comment..."
                  className="w-full rounded-xl border border-border/50 bg-background/70 text-text p-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-primary-dark transition-all duration-200 disabled:opacity-50"
                    disabled={posting || !newComment.trim()}
                  >
                    {posting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {loading ? (
          <div className="space-y-8">
            {/* Loading Header */}
            <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 p-8 shadow-lg animate-pulse">
              <div className="h-8 bg-border/30 rounded w-1/2 mb-4" />
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-border/30 rounded w-20" />
                <div className="h-6 bg-border/30 rounded w-16" />
              </div>
              <div className="h-4 bg-border/30 rounded w-3/4 mb-4" />
              <div className="flex gap-6 text-sm">
                <div className="h-4 bg-border/30 rounded w-24" />
                <div className="h-4 bg-border/30 rounded w-32" />
                <div className="h-4 bg-border/30 rounded w-48" />
              </div>
            </div>

            {/* Loading Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 p-6 shadow-lg animate-pulse">
                  <div className="h-6 bg-border/30 rounded w-24 mb-4" />
                  <div className="h-4 bg-border/30 rounded w-full mb-2" />
                  <div className="h-4 bg-border/30 rounded w-2/3" />
                </div>
                <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 p-6 shadow-lg animate-pulse">
                  <div className="h-6 bg-border/30 rounded w-24 mb-4" />
                  <div className="h-4 bg-border/30 rounded w-full" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="w-full h-80 bg-border/30 rounded-2xl animate-pulse" />
                <div className="space-y-3">
                  <div className="h-12 bg-border/30 rounded-xl animate-pulse" />
                  <div className="h-12 bg-border/30 rounded-xl animate-pulse" />
                  <div className="h-12 bg-border/30 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-error mb-2">Torrent Not Found</div>
            <div className="text-text-secondary">{error}</div>
          </div>
        ) : !torrent ? (
          <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-text-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-text mb-2">No Torrent Found</div>
            <div className="text-text-secondary">The requested torrent could not be found.</div>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border/30">
                <div className="flex items-start gap-6">
                  {/* Torrent Icon */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-primary-dark/20 rounded-2xl flex items-center justify-center border border-primary/20">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  </div>
                  
                  {/* Title and Info */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent mb-3">
                      {torrent.name}
                    </h1>
                    
                    {/* Tags/Category */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full border border-primary/20">
                        {torrent.category || 'General'}
                      </span>
                      {torrent.featured && (
                        <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 text-sm font-semibold rounded-full border border-yellow-500/20">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-text-secondary text-lg leading-relaxed mb-4">
                      {torrent.description || 'No description available'}
                    </p>
                    
                    {/* Stats Row */}
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-text-secondary">Size:</span>
                        <span className="font-semibold text-text">{formatBytes(torrent.size)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-secondary">Uploaded:</span>
                        <span className="font-semibold text-text">{new Date(torrent.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-secondary">By:</span>
                        <span className="font-semibold text-text">{torrent.uploader?.username || 'Anonymous'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* NFO Section */}
                <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-border/30">
                    <h2 className="text-xl font-bold text-text">NFO Information</h2>
                  </div>
                  <div className="p-6">
                    {torrent.nfoPath ? (
                      <div className="flex gap-3 flex-wrap">
                        <button 
                          onClick={() => handleDownload("nfo")}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download NFO
                        </button>
                        <button 
                          onClick={handleViewNfo}
                          className="flex items-center gap-2 px-6 py-3 bg-background/50 border border-border/50 text-text hover:bg-primary/10 hover:border-primary/50 font-semibold rounded-xl transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View NFO
                        </button>
                      </div>
                    ) : (
                      <div className="text-text-secondary italic text-center py-8">
                        <svg className="w-12 h-12 mx-auto mb-3 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        No NFO file available
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                <CommentsSection torrentId={torrentId || ''} currentUserId={currentUserId || ''} />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-text mb-4">Uploader Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary-dark/20 rounded-full flex items-center justify-center border border-primary/20">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-text">{torrent.uploader?.username || 'Anonymous'}</div>
                          <div className="text-sm text-text-secondary">Uploader</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-text mb-4">Torrent Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Seeders:</span>
                        <span className={`font-semibold ${getStatusColor(torrent.seeders || 0, torrent.leechers || 0)}`}>
                          {torrent.seeders || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Leechers:</span>
                        <span className="font-semibold text-blue-500">{torrent.leechers || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Completed:</span>
                        <span className="font-semibold text-text">{torrent.completed || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Bookmarks:</span>
                        <span className="font-semibold text-text">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Poster & Actions */}
              <div className="space-y-6">
                {/* Poster */}
                {torrent?.posterUrl && (
                  <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 p-6 shadow-2xl">
                    <h3 className="text-lg font-bold text-text mb-4">Poster</h3>
                    <PosterImage src={getPosterUrl()} alt="Poster" />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 p-6 shadow-2xl">
                  <h3 className="text-lg font-bold text-text mb-4">Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleDownload("torrent")}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      Download Torrent
                    </button>
                    
                    <button 
                      onClick={handleBookmark}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-xl transition-all duration-200 border ${torrent?.bookmarked
                        ? 'bg-red-500/10 border-red-500 text-red-600 hover:bg-red-500/20 hover:border-red-600'
                        : 'bg-background/50 border-border/50 text-text hover:bg-primary/10 hover:border-primary/50'}`}
                    >
                      {torrent?.bookmarked ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Unbookmark
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          Bookmark
                        </>
                      )}
                    </button>
                    
                    {torrent.nfoPath && (
                      <button 
                        onClick={() => handleDownload("nfo")}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-background/50 border border-border/50 text-text hover:bg-primary/10 hover:border-primary/50 font-semibold rounded-xl transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download NFO
                      </button>
                    )}
                  </div>
                  
                  {bookmarkMsg && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 text-center text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {bookmarkMsg}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* NFO Modal */}
            {showNfo && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={e => {
                  if (e.target === e.currentTarget) setShowNfo(false);
                }}
              >
                <div className="bg-surface/95 backdrop-blur-lg rounded-2xl border border-border/50 max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-border/30 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-text">NFO Preview</h3>
                    <button 
                      onClick={() => setShowNfo(false)}
                      className="p-2 hover:bg-background/50 rounded-lg transition-colors"
                    >
                      <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <pre className="bg-background/50 p-4 rounded-xl overflow-x-auto text-sm whitespace-pre-wrap font-mono text-text border border-border/30">
                      {nfoContent}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 