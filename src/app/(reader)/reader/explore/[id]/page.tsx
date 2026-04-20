"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Bookmark, ThumbsUp, ThumbsDown, MessageSquare, Share2,
  Send, ArrowUpRight, Lock, MoreHorizontal, Edit2, Trash2,
  Reply, X, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { fetchStoryDetail } from "@/components/storyApiClient";
import { Story } from "@/components/theLedApiClient";
import {
  toggleSave, checkSaved, addReaction, getMyReaction,
  getComments, addComment, editComment, deleteComment,
  likeComment, dislikeComment, Comment, CommentAuthor,
} from "@/components/socialApiClient";

// ── Utilities ─────────────────────────────────────────────────
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

// ── Toast config ───────────────────────────────────────────────
const toastStyle = {
  success: {
    style: { background: "#000", color: "#fff", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", fontFamily: "serif", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" },
    iconTheme: { primary: "#fff", secondary: "#000" },
  },
  error: {
    style: { background: "#fff", color: "#ef4444", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", fontFamily: "serif", border: "1px solid #fecaca", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  },
};

// ── CommentItem ────────────────────────────────────────────────
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

  const menuRef = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { if (showReplyBox) replyRef.current?.focus(); }, [showReplyBox]);

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
                <button onClick={() => setShowMenu(v => !v)} className="p-1 rounded-full hover:bg-gray-200 transition-colors" aria-label="Comment options">
                  <MoreHorizontal size={14} className="text-gray-500" />
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

// ── EditCommentModal ───────────────────────────────────────────
interface EditModalProps {
  open: boolean;
  initialContent: string;
  onConfirm: (newContent: string) => Promise<void>;
  onClose: () => void;
}

const EditCommentModal: React.FC<EditModalProps> = ({ open, initialContent, onConfirm, onClose }) => {
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

// ── ExploreStory ───────────────────────────────────────────────
const ExploreStory = () => {
  const params = useParams();
  const storyId = params?.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPremiumLocked, setIsPremiumLocked] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [reactionCount, setReactionCount] = useState(0);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editModal, setEditModal] = useState<{ open: boolean; id: string; content: string }>({ open: false, id: "", content: "" });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => getCurrentUserId());

  useEffect(() => {
    const id = getCurrentUserId();
    if (id) setCurrentUserId(id);
  }, []);

  const loadComments = useCallback(async (page = 1, append = false) => {
    try {
      if (append) setLoadingMoreComments(true);
      const res = await getComments("story", storyId, page, 10);
      if (res.success) {
        if (append) setComments(prev => [...prev, ...res.data]);
        else { setComments(res.data); setCommentCount(res.pagination.total); }
        setCommentsPage(page);
        setHasMoreComments(page < res.pagination.totalPages);
        if (!append) setCommentCount(res.pagination.total);
      }
    } catch (err) { console.error("Failed to load comments", err); }
    finally { setLoadingMoreComments(false); }
  }, [storyId]);

  useEffect(() => {
    if (!storyId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const storyRes = await fetchStoryDetail(storyId);
        if (cancelled) return;
        if (storyRes.success && storyRes.data) {
          setStory(storyRes.data);
          const [checkRes, reactRes] = await Promise.allSettled([
            checkSaved(storyId, "saved"),
            getMyReaction("story", storyId),
          ]);
          if (checkRes.status === "fulfilled" && checkRes.value.success) setIsSaved(checkRes.value.data.isSaved);
          if (reactRes.status === "fulfilled" && reactRes.value.success) {
            const d = reactRes.value.data;
            setMyReaction(d.myReaction ?? null);
            setReactionCount(d.summary?.like ?? 0);
          }
          await loadComments(1);
          const freshId = getCurrentUserId();
          if (freshId && !cancelled) setCurrentUserId(freshId);
        } else if (storyRes.subscriptionRequired) {
          setIsPremiumLocked(true);
        } else {
          setError(storyRes.message || "Failed to load story");
        }
      } catch (err: unknown) {
        if (!cancelled) setError((err as Error).message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [storyId, loadComments]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (savingToggle) return;
    setSavingToggle(true);
    const prev = isSaved;
    setIsSaved(!prev);
    try {
      const res = await toggleSave("story", storyId, "saved");
      setIsSaved(res.data.isSaved);
      toast.success(res.data.isSaved ? "Story saved!" : "Removed from saved.", toastStyle.success);
    } catch (err: unknown) {
      setIsSaved(prev);
      toast.error((err as Error).message || "Failed to save. Please login.", toastStyle.error);
    } finally { setSavingToggle(false); }
  };

  const handleReaction = async () => {
    const wasLiked = myReaction === "like";
    setMyReaction(wasLiked ? null : "like");
    setReactionCount(c => (wasLiked ? Math.max(0, c - 1) : c + 1));
    try {
      await addReaction("story", storyId, "like");
      try {
        const fresh = await getMyReaction("story", storyId);
        if (fresh.success) {
          setMyReaction(fresh.data.myReaction ?? null);
          setReactionCount(fresh.data.summary?.like ?? 0);
        }
      } catch {}
    } catch (err: unknown) {
      setMyReaction(wasLiked ? "like" : null);
      setReactionCount(c => (wasLiked ? c + 1 : Math.max(0, c - 1)));
      toast.error((err as Error).message || "Failed to react. Please login.", toastStyle.error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: story?.title || "", url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!", toastStyle.success);
    }
  };

  const submitTopComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await addComment("story", storyId, newComment.trim());
      setNewComment("");
      setShowCommentBox(false);
      await loadComments(1);
      toast.success("Comment posted!", toastStyle.success);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to add comment. Please login.", toastStyle.error);
    } finally { setSubmitting(false); }
  };

  const handleReplySubmit = async (parentId: string, content: string) => {
    try {
      await addComment("story", storyId, content, parentId);
      await loadComments(1);
      toast.success("Reply posted!", toastStyle.success);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to reply. Please login.", toastStyle.error);
    }
  };

  const handleEditRequest = (commentId: string, oldContent: string) =>
    setEditModal({ open: true, id: commentId, content: oldContent });

  const handleEditConfirm = async (newContent: string) => {
    await editComment(editModal.id, newContent);
    setEditModal({ open: false, id: "", content: "" });
    await loadComments(commentsPage);
    toast.success("Comment updated!", toastStyle.success);
  };

  const handleDelete = async (commentId: string) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[200px]">
          <p className="font-sans text-sm font-semibold text-gray-900">Delete this comment?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteComment(commentId);
                  await loadComments(1);
                  toast.success("Comment deleted.", toastStyle.success);
                } catch (err: unknown) {
                  toast.error((err as Error).message || "Failed to delete.", toastStyle.error);
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

  const handleLikeComment = async (commentId: string) => {
    const res = await likeComment(commentId);
    return res.data;
  };

  const handleDislikeComment = async (commentId: string) => {
    const res = await dislikeComment(commentId);
    return res.data;
  };

  // ── Render states ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-serif text-sm">Loading story…</p>
        </div>
      </div>
    );
  }

  if (isPremiumLocked) {
    return (
      <main className="bg-white min-h-screen">
        <section className="relative w-full min-h-[80vh] flex flex-col md:flex-row bg-black pt-20 md:pt-24 overflow-hidden">
          <div className="w-full flex items-center justify-center bg-black text-white px-6 py-20 z-10">
            <div className="max-w-[540px] text-center flex flex-col items-center">
              <Lock size={48} className="mb-6 text-gray-400" />
              <h1 className="font-sans text-[40px] md:text-[68px] leading-[1.1] mb-6">Premium Content</h1>
              <p className="text-white/70 text-lg mb-8 font-serif font-light">This story is available only for our subscribers.</p>
              <Link href="/reader/subscribe">
                <motion.button whileHover={{ scale: 1.05 }} className="px-8 py-3 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-full font-bold shadow-lg">
                  Subscribe to Read
                </motion.button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-serif">{error}</p>
      </div>
    );
  }

  if (!story) return null;

  return (
    <main className="bg-white min-h-screen">
      <Toaster position="bottom-center" />

      <EditCommentModal
        open={editModal.open} initialContent={editModal.content}
        onConfirm={handleEditConfirm} onClose={() => setEditModal({ open: false, id: "", content: "" })}
      />

      {/* Hero */}
      <section className="relative w-full min-h-[80vh] md:h-screen flex flex-col md:flex-row bg-black pt-20 md:pt-24 overflow-hidden">
        <div className="w-full md:w-1/2 flex items-center justify-center bg-black text-white px-6 py-12 lg:px-20 z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            className="max-w-[540px] text-center flex flex-col items-center"
          >
            <h1 className="font-sans text-[32px] md:text-[60px] leading-[1.1] mb-6 font-extrabold">{story.title}</h1>
            <p className="text-white/70 text-base md:text-lg mb-8 font-serif font-light leading-relaxed">{story.summary}</p>
            <motion.a href="#content" whileHover={{ scale: 1.05 }} className="flex items-center gap-2 font-sans text-[#3448D6] font-bold text-lg mb-12">
              Read Story <ArrowUpRight size={20} />
            </motion.a>
            <div className="flex items-center font-sans gap-10 pt-8 border-t border-white/10 w-full justify-center">
              <button onClick={handleReaction} className={`flex items-center gap-2 cursor-pointer transition-colors ${myReaction === "like" ? "text-blue-400" : "text-white"}`} aria-label="Like story">
                <ThumbsUp size={20} fill={myReaction === "like" ? "currentColor" : "none"} />
                <span className="text-sm font-bold">{reactionCount}</span>
              </button>
              <button
                onClick={() => { setShowCommentBox(true); setTimeout(() => document.getElementById("comment-section")?.scrollIntoView({ behavior: "smooth" }), 100); }}
                className="flex items-center gap-2 cursor-pointer text-white" aria-label="Comments"
              >
                <MessageSquare size={20} />
                <span className="text-sm font-bold">{commentCount}</span>
              </button>
              <button onClick={handleShare} className="flex items-center gap-2 cursor-pointer text-white" aria-label="Share">
                <Share2 size={20} />
              </button>
              <button onClick={handleSave} disabled={savingToggle} className="flex items-center gap-2 cursor-pointer text-white" aria-label={isSaved ? "Unsave" : "Save"}>
                <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} className={isSaved ? "text-blue-400" : "text-white"} />
              </button>
            </div>
          </motion.div>
        </div>
        <div className="w-full md:w-1/2 h-[300px] md:h-full relative">
          <img src={story.coverImage} className="w-full h-full object-cover" alt={story.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-gradient-to-r md:from-black/40" />
        </div>
      </section>

      {/* Content */}
      <section id="content" className="max-w-6xl mx-auto px-6 py-20 flex gap-10">
        <aside className="hidden md:flex flex-col items-center gap-4 sticky top-32 h-fit">
          <button onClick={handleSave} disabled={savingToggle} className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all" aria-label={isSaved ? "Unsave story" : "Save story"}>
            <Bookmark size={22} className={isSaved ? "text-blue-600 fill-blue-600" : "text-gray-400"} />
          </button>
          <button onClick={handleReaction} className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all" aria-label="Like story">
            <ThumbsUp size={22} className={myReaction === "like" ? "text-blue-600 fill-blue-600" : "text-gray-400"} />
          </button>
        </aside>

        <div className="flex-1 min-w-0">
          <article className="prose prose-lg max-w-none text-black leading-loose mb-12">
            {story.content?.split("\n\n").map((para, idx) => (
              <p key={idx} className="mb-6 font-serif text-lg text-gray-800 leading-relaxed">{para}</p>
            ))}
          </article>

          <div className="flex items-center gap-8 py-8 border-y border-gray-100 mb-12 font-sans text-black">
            <button onClick={handleReaction} className={`flex items-center gap-2 cursor-pointer transition-colors ${myReaction === "like" ? "text-blue-600" : "text-gray-600 hover:text-black"}`}>
              <ThumbsUp size={20} fill={myReaction === "like" ? "currentColor" : "none"} />
              <span className="text-sm font-bold">{reactionCount}</span>
            </button>
            <button onClick={() => setShowCommentBox(v => !v)} className={`flex items-center gap-2 cursor-pointer transition-colors ${showCommentBox ? "text-blue-600" : "text-gray-600 hover:text-black"}`}>
              <MessageSquare size={20} />
              <span className="text-sm font-bold">{commentCount}</span>
            </button>
            <button onClick={handleShare} className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-black transition-colors">
              <Share2 size={20} />
            </button>
          </div>

          {/* Comment Section */}
          <div id="comment-section">
            <AnimatePresence>
              {showCommentBox && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="mb-8 flex gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">US</div>
                  <div className="flex-1 bg-[#F2F2F2] rounded-2xl p-6">
                    <textarea
                      autoFocus
                      className="w-full bg-transparent border-none outline-none focus:ring-0 text-black font-serif min-h-[80px] resize-none placeholder:text-gray-400"
                      placeholder="Write a comment…"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitTopComment();
                        if (e.key === "Escape") setShowCommentBox(false);
                      }}
                    />
                    <div className="flex justify-start gap-6 mt-4">
                      <button onClick={() => setShowCommentBox(false)} className="text-gray-500 font-serif text-sm font-medium hover:text-gray-800 transition-colors">Cancel</button>
                      <button
                        onClick={submitTopComment} disabled={submitting || !newComment.trim()}
                        className="bg-black text-white px-8 py-2.5 rounded-full font-serif text-sm flex items-center gap-2 disabled:opacity-40 hover:bg-gray-800 transition-colors"
                      >
                        {submitting ? "Posting…" : "Post"} <Send size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-sans font-extrabold text-black tracking-wide">
                Comments <span className="text-gray-400 font-normal text-base">({commentCount})</span>
              </h3>
              {!showCommentBox && (
                <button onClick={() => setShowCommentBox(true)} className="px-5 py-2 bg-black text-white rounded-full text-sm font-serif hover:bg-gray-800 transition-colors">
                  Add comment
                </button>
              )}
            </div>

            {comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 font-serif">No comments yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {comments.map(comment => (
                  <CommentItem
                    key={comment._id} comment={comment} currentUserId={currentUserId || undefined}
                    onReplySubmit={handleReplySubmit} onEdit={handleEditRequest}
                    onDelete={handleDelete} onLike={handleLikeComment} onDislike={handleDislikeComment}
                  />
                ))}
              </div>
            )}

            {hasMoreComments && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => loadComments(commentsPage + 1, true)} disabled={loadingMoreComments}
                  className="flex items-center gap-2 mx-auto text-sm text-gray-500 hover:text-black transition-colors font-serif disabled:opacity-50"
                >
                  {loadingMoreComments ? <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin" /> : <ChevronDown size={16} />}
                  {loadingMoreComments ? "Loading…" : "Load more comments"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ExploreStory;