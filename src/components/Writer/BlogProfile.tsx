"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, ArrowUpRight, X, Send, ChevronDown, ThumbsDown, MoreHorizontal as MoreHoriz, Edit2, Trash2, Reply } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { getWriterStories, GetWriterStoriesParams } from "@/components/writerStoryApiClient";
import { getMyReaction, getComments, addReaction, addComment, editComment, deleteComment, likeComment, dislikeComment, Comment, CommentAuthor } from "@/components/socialApiClient";

// ── Helper functions (same as in other components) ───────────
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

function resolveAuthor(author: string | CommentAuthor): CommentAuthor {
  return typeof author === "string" ? { _id: author, name: "User", profileImage: "" } : author;
}

function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const u = localStorage.getItem("oped_user");
    if (u) return JSON.parse(u).id ?? null;
  } catch {}
  return null;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ── Toast style ───────────────────────────────────────────────
const toastStyle = {
  success: {
    style: { background: "#000", color: "#fff", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", fontFamily: "serif", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" },
    iconTheme: { primary: "#fff", secondary: "#000" },
  },
  error: {
    style: { background: "#fff", color: "#ef4444", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", fontFamily: "serif", border: "1px solid #fecaca", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  },
};

// ── CommentItem (same as in Explore) ─────────────────────────
interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReplySubmit: (parentId: string, content: string) => Promise<void>;
  onEdit: (commentId: string, oldContent: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onLike: (commentId: string) => Promise<{ likesCount: number; dislikesCount: number }>;
  onDislike: (commentId: string) => Promise<{ likesCount: number; dislikesCount: number }>;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment, currentUserId, onReplySubmit, onEdit, onDelete, onLike, onDislike, level = 0,
}) => {
  const author = resolveAuthor(comment.author);
  const isOwner = !!currentUserId && currentUserId === author._id;

  const [showMenu, setShowMenu] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [localLikes, setLocalLikes] = useState(comment.likesCount ?? 0);
  const [localDislikes, setLocalDislikes] = useState(comment.dislikesCount ?? 0);
  const [liking, setLiking] = useState(false);
  const [disliking, setDisliking] = useState(false);

  const menuRef = React.useRef<HTMLDivElement>(null);
  const replyRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  React.useEffect(() => { if (showReplyBox) replyRef.current?.focus(); }, [showReplyBox]);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await onLike(comment._id);
      setLocalLikes(res.likesCount);
      setLocalDislikes(res.dislikesCount);
    } finally { setLiking(false); }
  };

  const handleDislike = async () => {
    if (disliking) return;
    setDisliking(true);
    try {
      const res = await onDislike(comment._id);
      setLocalLikes(res.likesCount);
      setLocalDislikes(res.dislikesCount);
    } finally { setDisliking(false); }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await onReplySubmit(comment._id, replyText.trim());
      setReplyText("");
      setShowReplyBox(false);
    } finally { setSubmittingReply(false); }
  };

  return (
    <div className={`flex gap-3 mb-5 ${level > 0 ? "ml-10 pl-4 border-l-2 border-gray-100" : ""}`}>
      <img
        src={author.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random&size=40`}
        className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5" alt={author.name}
      />
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-2xl px-4 py-3">
          <div className="flex justify-between items-start gap-2">
            <div>
              <span className="font-sans font-bold text-sm text-black">{author.name}</span>
              <span className="text-xs text-gray-400 ml-2">{formatDate(comment.createdAt)}</span>
            </div>
            {isOwner && (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowMenu(v => !v)} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                  <MoreHoriz size={14} className="text-gray-500" />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -4 }}
                      className="absolute right-0 mt-1 w-36 bg-white shadow-xl rounded-xl border border-gray-100 z-20 overflow-hidden"
                    >
                      <button
                        onClick={() => { setShowMenu(false); onEdit(comment._id, comment.content); }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full transition-colors"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => { setShowMenu(false); onDelete(comment._id); }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-1.5 leading-relaxed font-serif">{comment.content}</p>
        </div>

        <div className="flex items-center gap-5 mt-1.5 ml-1 text-xs text-gray-500 select-none">
          <button onClick={handleLike} disabled={liking} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
            <ThumbsUp size={12} /><span>{localLikes}</span>
          </button>
          <button onClick={handleDislike} disabled={disliking} className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
            <ThumbsDown size={12} /><span>{localDislikes}</span>
          </button>
          {level === 0 && (
            <button onClick={() => setShowReplyBox(v => !v)} className="flex items-center gap-1.5 hover:text-black transition-colors font-medium">
              <Reply size={12} />Reply
            </button>
          )}
        </div>

        <AnimatePresence>
          {showReplyBox && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex gap-2 overflow-hidden"
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-[10px] font-bold shrink-0">US</div>
              <div className="flex-1 bg-[#F2F2F2] rounded-2xl p-3">
                <textarea
                  ref={replyRef} rows={2}
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-black font-serif text-sm resize-none placeholder:text-gray-400"
                  placeholder={`Reply to ${author.name}…`}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleReply();
                    if (e.key === "Escape") setShowReplyBox(false);
                  }}
                />
                <div className="flex items-center gap-4 mt-2">
                  <button onClick={() => setShowReplyBox(false)} className="text-gray-500 font-serif text-xs hover:text-gray-800 transition-colors">Cancel</button>
                  <button
                    onClick={handleReply} disabled={submittingReply || !replyText.trim()}
                    className="px-4 py-1.5 bg-black text-white rounded-full font-serif text-xs flex items-center gap-1.5 disabled:opacity-40 hover:bg-gray-800 transition-colors"
                  >
                    {submittingReply ? "Posting…" : <><Send size={11} /> Post</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply._id} comment={reply} currentUserId={currentUserId}
                onReplySubmit={onReplySubmit} onEdit={onEdit} onDelete={onDelete}
                onLike={onLike} onDislike={onDislike} level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── EditCommentModal ─────────────────────────────────────────
const EditCommentModal: React.FC<{
  open: boolean;
  initialContent: string;
  onConfirm: (newContent: string) => Promise<void>;
  onClose: () => void;
}> = ({ open, initialContent, onConfirm, onClose }) => {
  const [text, setText] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setText(initialContent); }, [initialContent, open]);

  const handleSave = async () => {
    if (!text.trim() || text.trim() === initialContent) { onClose(); return; }
    setSaving(true);
    try { await onConfirm(text.trim()); } finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-sans font-extrabold text-lg text-black">Edit comment</h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><X size={18} /></button>
            </div>
            <textarea
              autoFocus value={text} onChange={e => setText(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl p-4 font-serif text-sm text-black resize-none focus:outline-none focus:ring-2 focus:ring-black/10 min-h-[100px]"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={onClose} className="px-6 py-2 rounded-full text-sm font-serif text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
              <button
                onClick={handleSave} disabled={saving || !text.trim()}
                className="px-8 py-2 bg-black text-white rounded-full text-sm font-serif disabled:opacity-40 hover:bg-gray-800 transition-colors"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── CommentModal (full comments with replies) ────────────────
interface CommentModalProps {
  storyId: string;
  storyTitle: string;
  currentUserId?: string;
  onClose: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ storyId, storyTitle, currentUserId, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [newText, setNewText] = useState("");
  const [showBox, setShowBox] = useState(false);
  const [posting, setPosting] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; id: string; content: string }>({ open: false, id: "", content: "" });

  const load = useCallback(async (p: number, append = false) => {
    try {
      if (append) setLoadingMore(true);
      const res = await getComments("story", storyId, p, 10);
      if (res.success) {
        if (append) setComments(prev => [...prev, ...res.data]);
        else setComments(res.data);
        setTotal(res.pagination.total);
        setPage(p);
        setHasMore(p < res.pagination.totalPages);
      }
    } catch {}
    finally { setLoadingInit(false); setLoadingMore(false); }
  }, [storyId]);

  useEffect(() => { load(1); }, [load]);

  const post = async () => {
    if (!newText.trim()) return;
    setPosting(true);
    try {
      await addComment("story", storyId, newText.trim());
      setNewText("");
      setShowBox(false);
      await load(1);
      toast.success("Comment posted!", toastStyle.success);
    } catch (e: any) {
      toast.error(e.message || "Failed to post. Please login.", toastStyle.error);
    } finally { setPosting(false); }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      await addComment("story", storyId, content, parentId);
      await load(1);
      toast.success("Reply posted!", toastStyle.success);
    } catch (e: any) {
      toast.error(e.message || "Failed to reply. Please login.", toastStyle.error);
    }
  };

  const handleLike = async (id: string) => {
    const res = await likeComment(id);
    return res.data;
  };

  const handleDislike = async (id: string) => {
    const res = await dislikeComment(id);
    return res.data;
  };

  const handleEditOpen = (id: string, content: string) => setEditModal({ open: true, id, content });

  const handleEditSave = async (newContent: string) => {
    await editComment(editModal.id, newContent);
    setEditModal({ open: false, id: "", content: "" });
    await load(1);
    toast.success("Comment updated!", toastStyle.success);
  };

  const handleDelete = async (id: string) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[200px]">
          <p className="font-sans text-sm font-semibold text-gray-900">Delete this comment?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteComment(id);
                  await load(1);
                  toast.success("Comment deleted.", toastStyle.success);
                } catch (e: any) {
                  toast.error(e.message || "Failed to delete.", toastStyle.error);
                }
              }}
              className="px-4 py-1.5 bg-red-500 text-white text-xs rounded-full font-serif hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-serif hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 6000, style: { borderRadius: "16px", padding: "16px 20px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)" } }
    );
  };

  return (
    <>
      <EditCommentModal
        open={editModal.open} initialContent={editModal.content}
        onConfirm={handleEditSave} onClose={() => setEditModal({ open: false, id: "", content: "" })}
      />
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm px-0 md:px-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
            <div>
              <h3 className="font-sans font-extrabold text-base text-black">
                Comments <span className="text-gray-400 font-normal text-sm">({total})</span>
              </h3>
              <p className="text-xs text-gray-400 font-serif mt-0.5 line-clamp-1">{storyTitle}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {loadingInit ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm font-serif">No comments yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {comments.map(c => (
                  <CommentItem
                    key={c._id} comment={c} currentUserId={currentUserId}
                    onReplySubmit={handleReply} onEdit={handleEditOpen} onDelete={handleDelete}
                    onLike={handleLike} onDislike={handleDislike}
                  />
                ))}
                {hasMore && (
                  <button
                    onClick={() => load(page + 1, true)} disabled={loadingMore}
                    className="flex items-center gap-2 mx-auto mt-4 text-sm text-gray-500 hover:text-black transition-colors font-serif disabled:opacity-50"
                  >
                    {loadingMore ? <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin" /> : <ChevronDown size={16} />}
                    {loadingMore ? "Loading…" : "Load more comments"}
                  </button>
                )}
              </div>
            )}
          </div>

          <AnimatePresence>
            {showBox && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="px-5 overflow-hidden border-t border-gray-100"
              >
                <div className="py-4 flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-[10px] font-bold shrink-0">US</div>
                  <div className="flex-1 bg-[#F2F2F2] rounded-2xl p-4">
                    <textarea
                      autoFocus rows={2}
                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-black font-serif text-sm resize-none placeholder:text-gray-400"
                      placeholder="Write a comment…"
                      value={newText}
                      onChange={e => setNewText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) post();
                        if (e.key === "Escape") setShowBox(false);
                      }}
                    />
                    <div className="flex items-center gap-4 mt-2">
                      <button onClick={() => setShowBox(false)} className="text-gray-500 font-serif text-xs hover:text-gray-800 transition-colors">Cancel</button>
                      <button
                        onClick={post} disabled={posting || !newText.trim()}
                        className="px-5 py-1.5 bg-black text-white rounded-full font-serif text-xs flex items-center gap-1.5 disabled:opacity-40 hover:bg-gray-800 transition-colors"
                      >
                        {posting ? "Posting…" : <><Send size={11} /> Post</>}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showBox && (
            <div className="px-5 py-3 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowBox(true)} className="w-full py-2.5 bg-black text-white rounded-full text-sm font-serif hover:bg-gray-800 transition-colors">
                Add comment
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

// ── Main BlogProfile Component ───────────────────────────────
interface Story {
  _id: string;
  title: string;
  summary: string;
  coverImage: string;
  category: string;
  tags: string[];
  isPremium: boolean;
  status: string;
  createdAt: string;
  readingTime: number;
}

const BlogProfile = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GetWriterStoriesParams>({
    status: "",
    category: "",
    page: 1,
    limit: 5,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});
  const [likingState, setLikingState] = useState<Record<string, boolean>>({});

  const [commentModal, setCommentModal] = useState<{ storyId: string; title: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const u = localStorage.getItem("oped_user");
      if (u) setCurrentUserId(JSON.parse(u).id ?? undefined);
    } catch {}
  }, []);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWriterStories(filters);
      const storiesData = res.data || [];
      setStories(storiesData);
      if (res.pagination) {
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }

      // Fetch like, comment counts and user's reaction
      for (const story of storiesData) {
        try {
          const [reactRes, commentRes] = await Promise.allSettled([
            getMyReaction("story", story._id),
            getComments("story", story._id, 1, 1),
          ]);
          if (reactRes.status === "fulfilled" && reactRes.value.success) {
            setLikeCounts(prev => ({ ...prev, [story._id]: reactRes.value.data.summary?.like ?? 0 }));
            setUserLiked(prev => ({ ...prev, [story._id]: reactRes.value.data.myReaction === "like" }));
          }
          if (commentRes.status === "fulfilled" && commentRes.value.success) {
            setCommentCounts(prev => ({ ...prev, [story._id]: commentRes.value.pagination.total }));
          }
        } catch (err) {
          console.error("Error fetching stats for story", story._id, err);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load stories");
      toast.error(err.message || "Failed to load stories");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleFilterChange = (key: keyof GetWriterStoriesParams, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleLike = async (storyId: string) => {
    if (likingState[storyId]) return;
    const wasLiked = userLiked[storyId] || false;
    const prevCount = likeCounts[storyId] || 0;

    // Optimistic update
    setUserLiked(prev => ({ ...prev, [storyId]: !wasLiked }));
    setLikeCounts(prev => ({ ...prev, [storyId]: wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1 }));
    setLikingState(prev => ({ ...prev, [storyId]: true }));

    try {
      await addReaction("story", storyId, "like");
      // Refresh to get accurate counts
      const fresh = await getMyReaction("story", storyId);
      if (fresh.success) {
        setUserLiked(prev => ({ ...prev, [storyId]: fresh.data.myReaction === "like" }));
        setLikeCounts(prev => ({ ...prev, [storyId]: fresh.data.summary?.like ?? 0 }));
      }
    } catch (err: any) {
      // Rollback
      setUserLiked(prev => ({ ...prev, [storyId]: wasLiked }));
      setLikeCounts(prev => ({ ...prev, [storyId]: prevCount }));
      toast.error(err.message || "Failed to like. Please login.", toastStyle.error);
    } finally {
      setLikingState(prev => ({ ...prev, [storyId]: false }));
    }
  };

  const handleShare = async (story: Story) => {
    const url = `${window.location.origin}/writer/stories/${story._id}`;
    if (navigator.share) {
      try { await navigator.share({ title: story.title, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!", toastStyle.success);
    }
  };

  const formatDateLocal = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-200 text-gray-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "published": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "revision": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && stories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 pt-28 md:pt-40 font-sans text-black">
        <div className="animate-pulse">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 pb-12">
            <div className="w-36 h-36 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
          {[1, 2].map(i => (
            <div key={i} className="flex flex-col md:flex-row gap-8 items-start mt-12">
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
              <div className="w-full md:w-[320px] h-[240px] bg-gray-200 rounded-3xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-red-500">{error}</p>
        <button onClick={fetchStories} className="mt-4 px-4 py-2 bg-black text-white rounded-lg">Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pt-28 md:pt-40 font-sans text-black">
      <Toaster position="bottom-center" />

      <AnimatePresence>
        {commentModal && (
          <CommentModal
            storyId={commentModal.storyId}
            storyTitle={commentModal.title}
            currentUserId={currentUserId}
            onClose={() => setCommentModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Profile Header */}
      <header className="flex flex-col md:flex-row items-center md:items-start gap-8 pb-12 border-b border-gray-100">
        {/* <div className="w-36 h-36 rounded-full overflow-hidden flex-shrink-0 bg-blue-50 relative">
          <div className="absolute inset-0 bg-blue-400/20 mix-blend-overlay"></div>
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400"
            alt="Writer"
            className="w-full h-full object-cover"
          />
        </div> */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl font-sans font-bold text-black mb-4 tracking-tight text-center">Your Stories</h1>
          <p className="text-black text-[15px] leading-relaxed font-serif max-w-2xl text-center mx-auto">
            Manage your submitted stories. Filter by status or category, and see how your audience is engaging.
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 my-8 justify-center md:justify-start">
        <select
          value={filters.status || ""}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="border border-gray-200 rounded-full px-4 py-2 text-sm font-sans bg-white"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
          <option value="revision">Revision</option>
        </select>
        <input
          type="text"
          placeholder="Category"
          value={filters.category || ""}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="border border-gray-200 rounded-full px-4 py-2 text-sm font-sans"
        />
        <div className="text-sm text-gray-500 self-center">
          {total} story{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Stories List */}
      <div className="mt-8 space-y-12">
        {stories.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-400">No stories found.</div>
        )}
        {stories.map((story) => (
          <article key={story._id} className="flex flex-col md:flex-row gap-8 items-start group">
            {/* Left Content */}
            <div className="flex-1 order-2 md:order-1">
              <h2 className="text-2xl font-sans font-bold text-black leading-tight mb-3 group-hover:text-blue-700 transition-colors cursor-pointer">
                {story.title}
              </h2>
              <p className="text-black text-sm leading-relaxed font-serif mb-4 line-clamp-3">
                {story.summary}
              </p>

              <Link href={`/writer/stories/${story._id}`} className="inline-flex items-center text-blue-700 text-sm font-semibold mb-6 hover:underline">
                Read More <ArrowUpRight className="ml-1 w-4 h-4" />
              </Link>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-black">
                    <button
                      onClick={() => handleLike(story._id)}
                      disabled={likingState[story._id]}
                      className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                    >
                      <ThumbsUp
                        className={`w-4 h-4 ${userLiked[story._id] ? "text-blue-600 fill-blue-600" : ""}`}
                      />
                      <span className="text-xs font-bold">{formatCount(likeCounts[story._id] || 0)}</span>
                    </button>
                    <button
                      onClick={() => setCommentModal({ storyId: story._id, title: story.title })}
                      className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-bold">{formatCount(commentCounts[story._id] || 0)}</span>
                    </button>
                    <button
                      onClick={() => handleShare(story)}
                      className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs font-bold">—</span>
                    </button>
                  </div>
                  <button className="text-black hover:opacity-70">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <time className="text-[11px] font-bold text-black/60 uppercase tracking-widest">
                    {formatDateLocal(story.createdAt)}
                  </time>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(story.status)}`}>
                    {story.status}
                  </span>
                  {story.isPremium && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Premium</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="w-full md:w-[320px] order-1 md:order-2">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-sm">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800"}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-12">
          <button
            onClick={() => handleFilterChange("page", (filters.page || 1) - 1)}
            disabled={filters.page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {filters.page} of {totalPages}
          </span>
          <button
            onClick={() => handleFilterChange("page", (filters.page || 1) + 1)}
            disabled={filters.page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogProfile;