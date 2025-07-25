"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CommentThread, Comment } from '@/components/comments/CommentThread';
import { API_BASE_URL } from "@/app/lib/api";

export default function RequestDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFillModal, setShowFillModal] = useState(false);
  const [fillTorrentId, setFillTorrentId] = useState("");
  const [fillLoading, setFillLoading] = useState(false);
  const [fillError, setFillError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState("");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchRequest = () => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/requests/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject("Not found"))
      .then(data => setRequest(data))
      .catch(() => setError("Request not found."))
      .finally(() => setLoading(false));
  };

  const fetchComments = () => {
    if (!id) return;
    setCommentsLoading(true);
    setCommentsError("");
    fetch(`${API_BASE_URL}/requests/${id}/comments`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed to load comments"))
      .then(data => setComments(Array.isArray(data) ? data : data.comments || []))
      .catch(() => setCommentsError("Failed to load comments."))
      .finally(() => setCommentsLoading(false));
  };

  useEffect(() => {
    fetchRequest();
    fetchComments();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => setCurrentUserId(data?.id || null));
    }
  }, []);

  const handleFill = async (e: React.FormEvent) => {
    e.preventDefault();
    setFillLoading(true);
    setFillError(null);
    setSuccessMsg(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/requests/${id}/fill`, {
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
      setShowFillModal(false);
      setFillTorrentId("");
      fetchRequest();
    } catch (e: any) {
      setFillError(e.message);
    } finally {
      setFillLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingComment(true);
    setCommentSuccess("");
    setCommentsError("");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setCommentsError("You must be logged in to comment.");
      setPostingComment(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/requests/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      setNewComment("");
      setCommentSuccess("Comment posted!");
      fetchComments();
    } catch {
      setCommentsError("Failed to post comment.");
    } finally {
      setPostingComment(false);
      setTimeout(() => setCommentSuccess(""), 1500);
    }
  };

  const canFill = request && request.status === "OPEN" && (!request.filledBy) && (typeof window !== "undefined" ? localStorage.getItem("userId") !== request.user?.id : true);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-background/70 border border-border/50 rounded-xl text-primary font-semibold shadow hover:bg-primary/10 hover:text-primary-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Back to Requests"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Requests
        </button>
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent mb-2">
            Request Details
          </h2>
          <p className="text-text-secondary">View the request and participate in the discussion</p>
        </div>
        <div className="bg-surface/50 backdrop-blur-lg rounded-2xl border border-border/50 shadow-2xl p-10">
          {loading ? (
            <div className="flex flex-col gap-6 animate-pulse">
              <div className="h-6 bg-border/30 rounded w-2/3 mb-2" />
              <div className="h-6 bg-border/30 rounded w-1/2 mb-2" />
              <div className="h-6 bg-border/30 rounded w-1/3" />
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
          ) : !request ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-text-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-text mb-2">Request Not Found</div>
              <div className="text-text-secondary">The requested request could not be found.</div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="text-2xl font-bold text-primary mb-2">{request.title}</div>
                <div className="text-xs text-text-secondary mb-2">{new Date(request.createdAt).toLocaleString()} • Status: <span className="font-semibold text-primary">{request.status}</span></div>
                <div className="text-text-secondary whitespace-pre-line mb-4">{request.description}</div>
                {canFill && (
                  <button
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors"
                    onClick={() => setShowFillModal(true)}
                  >
                    Fill Request
                  </button>
                )}
                {successMsg && <div className="text-success mt-2">{successMsg}</div>}
              </div>

              {/* Comments Section */}
              <CommentsSection requestId={id as string} currentUserId={currentUserId || ''} />
            </>
          )}
        </div>
        {/* Fill Modal */}
        {showFillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-[color:var(--color-surface)] rounded-lg p-8 w-full max-w-md border border-border relative">
              <button
                className="absolute top-2 right-2 text-text/70 hover:text-text"
                onClick={() => setShowFillModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-xl font-semibold mb-4 text-text">Fill Request</h2>
              <form onSubmit={handleFill} className="space-y-4">
                <div>
                  <label className="block text-text mb-1">Torrent ID</label>
                  <input
                    type="text"
                    value={fillTorrentId}
                    onChange={e => setFillTorrentId(e.target.value)}
                    className="w-full rounded border border-border bg-bg-secondary text-text p-2"
                    required
                  />
                </div>
                {fillError && <div className="text-error text-sm">{fillError}</div>}
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors w-full"
                  disabled={fillLoading}
                >
                  {fillLoading ? "Filling..." : "Fill Request"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentsSection({ requestId, currentUserId }: { requestId: string, currentUserId?: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  // Fetch comments
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/requests/${requestId}/comments`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to load comments'))
      .then(setComments)
      .catch(() => setError('Failed to load comments.'))
      .finally(() => setLoading(false));
  }, [requestId]);

  // Get current user token/id
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Add new root comment
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setError('You must be logged in to comment.');
    setPosting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/requests/${requestId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newComment, parentId: null })
      });
      if (!res.ok) throw new Error('Failed to post comment');
      setNewComment('');
      // Refetch comments
      const data = await fetch(`${API_BASE_URL}/requests/${requestId}/comments`).then(r => r.json());
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
      const res = await fetch(`${API_BASE_URL}/requests/${requestId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content, parentId })
      });
      if (!res.ok) throw new Error('Failed to reply');
      const data = await fetch(`${API_BASE_URL}/requests/${requestId}/comments`).then(r => r.json());
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
      const data = await fetch(`${API_BASE_URL}/requests/${requestId}/comments`).then(r => r.json());
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
      const data = await fetch(`${API_BASE_URL}/requests/${requestId}/comments`).then(r => r.json());
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
      const data = await fetch(`${API_BASE_URL}/requests/${requestId}/comments`).then(r => r.json());
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