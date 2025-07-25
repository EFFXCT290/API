import React, { useState } from 'react';
import { API_BASE_URL } from '@/app/lib/api';

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
    role: string;
  } | null;
  isOP: boolean;
  upvotes: number;
  downvotes: number;
  score: number;
  parentId: string | null;
  replies: Comment[];
  hasMoreReplies?: boolean; // Added for new logic
  torrentId?: string;
  requestId?: string;
}

interface CommentThreadProps {
  comment: Comment;
  depth?: number;
  currentUserId?: string;
  onReply?: (parentId: string, content: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onVote?: (commentId: string, value: 1 | -1) => void;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  depth = 0,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onVote,
}) => {
  // Debug log for depth and replies
  console.log('CommentThread:', { depth, content: comment.content, replies: comment.replies.length });
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showModal, setShowModal] = useState(false);
  const [modalThread, setModalThread] = useState<Comment | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Helper to fetch the full thread for the modal
  const fetchThread = async () => {
    setModalLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/comments/${comment.id}/thread`);
      if (!res.ok) throw new Error('Failed to load thread');
      const data = await res.json();
      setModalThread(data);
    } catch {
      setModalThread(null);
    } finally {
      setModalLoading(false);
    }
  };

  // Handler for reply in modal
  const handleModalReply = async (parentId: string, content: string) => {
    // Try both endpoints: torrents and requests (they share the same comment model)
    // We'll try /torrent first, then /requests if it fails
    let success = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    // Try /torrent/:id/comments
    try {
      const res = await fetch(`${API_BASE_URL}/torrent/${comment.torrentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content, parentId })
      });
      if (res.ok) success = true;
    } catch {}
    // If not success, try /requests/:id/comments
    if (!success && comment.requestId) {
      try {
        const res = await fetch(`${API_BASE_URL}/requests/${comment.requestId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content, parentId })
        });
        if (res.ok) success = true;
      } catch {}
    }
    if (success) {
      await fetchThread();
    }
  };

  const canEdit = currentUserId && comment.user && comment.user.id === currentUserId;
  const canDelete = canEdit; // or admin logic

  return (
    <div className={`pl-${depth * 6} py-3 border-l border-border/30` + (depth === 0 ? ' border-none' : '')}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <img
          src={
            comment.user?.avatarUrl
              ? comment.user.avatarUrl.startsWith('/uploads/')
                ? `${API_BASE_URL}${comment.user.avatarUrl}`
                : comment.user.avatarUrl
              : '/default-avatar.png'
          }
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border border-border"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-primary">{comment.user?.username || 'User'}</span>
            {comment.isOP && (
              <span className="bg-yellow-400/20 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded">OP</span>
            )}
            <span className="text-xs text-text-secondary">{comment.user?.role}</span>
            <span className="text-xs text-text-secondary">{new Date(comment.createdAt).toLocaleString()}</span>
          </div>
          {showEdit ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                onEdit && onEdit(comment.id, editContent);
                setShowEdit(false);
              }}
              className="mb-2"
            >
              <textarea
                className="w-full rounded border border-border p-2 text-sm"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={2}
                required
              />
              <div className="flex gap-2 mt-1">
                <button type="submit" className="px-3 py-1 bg-primary text-white rounded text-xs">Save</button>
                <button type="button" className="px-3 py-1 bg-background border border-border rounded text-xs" onClick={() => setShowEdit(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className={comment.deleted ? 'italic text-text-secondary' : 'text-text'}>
              {comment.content}
            </div>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs">
            {/* Voting */}
            <button
              className={`px-2 py-1 rounded hover:bg-primary/10 ${comment.score > 0 ? 'text-green-600' : comment.score < 0 ? 'text-red-600' : 'text-text-secondary'}`}
              onClick={() => onVote && onVote(comment.id, 1)}
              disabled={!currentUserId}
            >
              ▲ {comment.upvotes}
            </button>
            <button
              className={`px-2 py-1 rounded hover:bg-primary/10 ${comment.score < 0 ? 'text-red-600' : 'text-text-secondary'}`}
              onClick={() => onVote && onVote(comment.id, -1)}
              disabled={!currentUserId}
            >
              ▼ {comment.downvotes}
            </button>
            <span className="font-bold text-text ml-2">Score: {comment.score}</span>
            {/* Actions */}
            {currentUserId && (
              <>
                <button className="ml-2 text-primary hover:underline" onClick={() => setShowReply(!showReply)}>Reply</button>
                {canEdit && <button className="ml-2 text-primary hover:underline" onClick={() => setShowEdit(true)}>Edit</button>}
                {canDelete && <button className="ml-2 text-error hover:underline" onClick={() => onDelete && onDelete(comment.id)}>Delete</button>}
              </>
            )}
          </div>
          {/* Reply Form */}
          {showReply && (
            <form
              onSubmit={e => {
                e.preventDefault();
                onReply && onReply(comment.id, replyContent);
                setReplyContent('');
                setShowReply(false);
              }}
              className="mt-2"
            >
              <textarea
                className="w-full rounded border border-border p-2 text-sm"
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                rows={2}
                required
              />
              <div className="flex gap-2 mt-1">
                <button type="submit" className="px-3 py-1 bg-primary text-white rounded text-xs">Reply</button>
                <button type="button" className="px-3 py-1 bg-background border border-border rounded text-xs" onClick={() => setShowReply(false)}>Cancel</button>
              </div>
            </form>
          )}
          {/* Replies or Continue Thread */}
          {depth < 4 && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map(reply => (
                <CommentThread
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onVote={onVote}
                />
              ))}
            </div>
          )}
          {depth === 4 && comment.hasMoreReplies && (
            <div className="mt-3">
              <button
                className="text-primary underline text-xs px-2 py-1 rounded hover:bg-primary/10"
                onClick={async () => {
                  setShowModal(true);
                  setModalLoading(true);
                  try {
                    const res = await fetch(`${API_BASE_URL}/comments/${comment.id}/thread`);
                    if (!res.ok) throw new Error('Failed to load thread');
                    const data = await res.json();
                    setModalThread(data);
                  } catch {
                    setModalThread(null);
                  } finally {
                    setModalLoading(false);
                  }
                }}
              >
                Continue this thread
              </button>
              {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
                  <div className="bg-surface/95 backdrop-blur-lg rounded-2xl border border-border/50 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-text">Thread</h3>
                      <button onClick={() => setShowModal(false)} className="p-2 hover:bg-background/50 rounded-lg transition-colors">
                        <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {modalLoading ? (
                      <div className="text-center text-text-secondary py-8">Loading thread...</div>
                    ) : modalThread ? (
                      <CommentThread
                        comment={modalThread}
                        depth={0}
                        currentUserId={currentUserId}
                        onReply={handleModalReply}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onVote={onVote}
                      />
                    ) : (
                      <div className="text-center text-error py-8">Failed to load thread.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 