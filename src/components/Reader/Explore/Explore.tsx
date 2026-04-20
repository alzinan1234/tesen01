"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Bookmark, ThumbsUp, ThumbsDown, MessageSquare, Share2,
  Lock, Send, X, MoreHorizontal, Trash2, Edit2, Reply,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

import UnlimitedAccess from "../ReaderHome/UnlimitedAccess";
import { Story } from "@/components/theLedApiClient";
import { fetchStories } from "@/components/storyApiClient";
import {
  checkSaved,
  toggleSave,
  addReaction,
  getMyReaction,
  getComments,
  addComment,
  editComment,
  deleteComment,
  likeComment,
  dislikeComment,
  Comment,
  CommentAuthor,
} from "@/components/socialApiClient";

// ── helpers ─────────────────────────────────────────────────
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function resolveAuthor(a: string | CommentAuthor): CommentAuthor {
  return typeof a === "string" ? { _id: a, name: "User", profileImage: "" } : a;
}

function avatar(author: CommentAuthor) {
  return (
    author.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random&size=40`
  );
}

// ── Toast config (shared style) ───────────────────────────────
const toastStyle = {
  success: {
    style: { background: "#000", color: "#fff", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", fontFamily: "serif", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" },
    iconTheme: { primary: "#fff", secondary: "#000" },
  },
  error: {
    style: { background: "#fff", color: "#ef4444", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", fontFamily: "serif", border: "1px solid #fecaca", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  },
};

// ── Skeleton ─────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex flex-col border-b border-gray-100 pb-12 animate-pulse">
    <div className="flex flex-col md:flex-row gap-10 items-start">
      <div className="flex-1 order-2 md:order-1 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="space-y-1">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-2 w-16 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 rounded" />
      </div>
      <div className="w-full md:w-[300px] h-[180px] rounded-2xl bg-gray-200 order-1 md:order-2" />
    </div>
  </div>
);

// ── CommentItem ───────────────────────────────────────────────
interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply: (parentId: string, content: string) => Promise<void>;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onLike: (id: string) => Promise<{ likesCount: number; dislikesCount: number }>;
  onDislike: (id: string) => Promise<{ likesCount: number; dislikesCount: number }>;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment, currentUserId, onReply, onEdit, onDelete, onLike, onDislike, level = 0,
}) => {
  const author = resolveAuthor(comment.author);
  const isOwner = !!currentUserId && currentUserId === author._id;
  const [showMenu, setShowMenu] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [postingReply, setPostingReply] = useState(false);
  const [likes, setLikes] = useState(comment.likesCount ?? 0);
  const [dislikes, setDislikes] = useState(comment.dislikesCount ?? 0);
  const [liking, setLiking] = useState(false);
  const [disliking, setDisliking] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { if (showReply) replyRef.current?.focus(); }, [showReply]);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await onLike(comment._id);
      setLikes(res.likesCount);
      setDislikes(res.dislikesCount);
    } finally { setLiking(false); }
  };

  const handleDislike = async () => {
    if (disliking) return;
    setDisliking(true);
    try {
      const res = await onDislike(comment._id);
      setLikes(res.likesCount);
      setDislikes(res.dislikesCount);
    } finally { setDisliking(false); }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setPostingReply(true);
    await onReply(comment._id, replyText.trim());
    setReplyText("");
    setShowReply(false);
    setPostingReply(false);
  };

  return (
    <div className={`flex gap-3 mb-5 ${level > 0 ? "ml-10 pl-4 border-l-2 border-gray-100" : ""}`}>
      <img src={avatar(author)} className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5" alt={author.name} />
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-2xl px-4 py-3">
          <div className="flex justify-between items-start gap-2">
            <div>
              <span className="font-sans font-bold text-sm text-black">{author.name}</span>
              <span className="text-xs text-gray-400 ml-2">{fmtDate(comment.createdAt)}</span>
            </div>
            {isOwner && (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowMenu(v => !v)} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                  <MoreHorizontal size={14} className="text-gray-500" />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -4 }}
                      className="absolute right-0 mt-1 w-36 bg-white shadow-xl rounded-xl border border-gray-100 z-30 overflow-hidden"
                    >
                      <button onClick={() => { setShowMenu(false); onEdit(comment._id, comment.content); }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full transition-colors">
                        <Edit2 size={13} /> Edit
                      </button>
                      <button onClick={() => { setShowMenu(false); onDelete(comment._id); }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors">
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
            <ThumbsUp size={12} /><span>{likes}</span>
          </button>
          <button onClick={handleDislike} disabled={disliking} className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
            <ThumbsDown size={12} /><span>{dislikes}</span>
          </button>
          {level === 0 && (
            <button onClick={() => setShowReply(v => !v)} className="flex items-center gap-1.5 hover:text-black transition-colors font-medium">
              <Reply size={12} />Reply
            </button>
          )}
        </div>

        <AnimatePresence>
          {showReply && (
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
                    if (e.key === "Escape") setShowReply(false);
                  }}
                />
                <div className="flex items-center gap-4 mt-2">
                  <button onClick={() => setShowReply(false)} className="text-gray-500 font-serif text-xs hover:text-gray-800 transition-colors">Cancel</button>
                  <button
                    onClick={handleReply} disabled={postingReply || !replyText.trim()}
                    className="px-4 py-1.5 bg-black text-white rounded-full font-serif text-xs flex items-center gap-1.5 disabled:opacity-40 hover:bg-gray-800 transition-colors"
                  >
                    {postingReply ? "Posting…" : <><Send size={10} /> Post</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {comment.replies?.map(r => (
          <CommentItem
            key={r._id} comment={r} currentUserId={currentUserId}
            onReply={onReply} onEdit={onEdit} onDelete={onDelete}
            onLike={onLike} onDislike={onDislike} level={level + 1}
          />
        ))}
      </div>
    </div>
  );
};

// ── Edit Modal ────────────────────────────────────────────────
const EditModal: React.FC<{
  open: boolean;
  content: string;
  onSave: (c: string) => Promise<void>;
  onClose: () => void;
}> = ({ open, content, onSave, onClose }) => {
  const [text, setText] = useState(content);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setText(content); }, [content, open]);

  const save = async () => {
    if (!text.trim() || text.trim() === content) { onClose(); return; }
    setSaving(true);
    try { await onSave(text.trim()); } finally { setSaving(false); }
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
                onClick={save} disabled={saving || !text.trim()}
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

// ── Comment Modal ─────────────────────────────────────────────
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
      {
        duration: 6000,
        style: { borderRadius: "16px", padding: "16px 20px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)" },
      }
    );
  };

  return (
    <>
      <EditModal
        open={editModal.open} content={editModal.content}
        onSave={handleEditSave} onClose={() => setEditModal({ open: false, id: "", content: "" })}
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
                    onReply={handleReply} onEdit={handleEditOpen} onDelete={handleDelete}
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

// ── Main Explore Component ─────────────────────────────────────
const Explore = () => {
  const params = useParams();
  const category = (params?.category as string) || "explore";

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [savedState, setSavedState] = useState<Record<string, boolean>>({});
  const [savingState, setSavingState] = useState<Record<string, boolean>>({});
  const [likedState, setLikedState] = useState<Record<string, boolean>>({});
  const [likingState, setLikingState] = useState<Record<string, boolean>>({});
  const [likeCount, setLikeCount] = useState<Record<string, number>>({});
  const [commentCount, setCommentCount] = useState<Record<string, number>>({});

  const [commentModal, setCommentModal] = useState<{ storyId: string; title: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const u = localStorage.getItem("oped_user");
      if (u) setCurrentUserId(JSON.parse(u).id ?? undefined);
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchStories({ category, page, limit: 5 });
        if (cancelled || !res.success) return;

        const newStories = res.data;
        if (page === 1) setStories(newStories);
        else setStories(prev => [...prev, ...newStories]);
        setHasMore(page < res.pagination.totalPages);

        await Promise.all(newStories.map(async story => {
          const sid = story._id;
          try {
            const r = await getMyReaction("story", sid);
            if (r.success) {
              setLikedState(p => ({ ...p, [sid]: r.data.myReaction === "like" }));
              setLikeCount(p => ({ ...p, [sid]: r.data.summary?.like ?? 0 }));
            }
          } catch {}
          try {
            const r = await checkSaved(sid, "saved");
            if (r.success) setSavedState(p => ({ ...p, [sid]: r.data.isSaved }));
          } catch {}
          try {
            const r = await getComments("story", sid, 1, 1);
            if (r.success) setCommentCount(p => ({ ...p, [sid]: r.pagination.total }));
          } catch {}
        }));
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load stories");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [category, page]);

  useEffect(() => {
    setPage(1);
    setStories([]);
    setSavedState({});
    setLikedState({});
    setLikeCount({});
    setCommentCount({});
  }, [category]);

  const handleLike = async (storyId: string) => {
    if (likingState[storyId]) return;
    const was = !!likedState[storyId];
    const prevCount = likeCount[storyId] ?? 0;
    setLikedState(p => ({ ...p, [storyId]: !was }));
    setLikeCount(p => ({ ...p, [storyId]: was ? Math.max(0, prevCount - 1) : prevCount + 1 }));
    setLikingState(p => ({ ...p, [storyId]: true }));
    try {
      await addReaction("story", storyId, "like");
      try {
        const fresh = await getMyReaction("story", storyId);
        if (fresh.success) {
          setLikedState(p => ({ ...p, [storyId]: fresh.data.myReaction === "like" }));
          setLikeCount(p => ({ ...p, [storyId]: fresh.data.summary?.like ?? 0 }));
        }
      } catch {}
    } catch (e: any) {
      setLikedState(p => ({ ...p, [storyId]: was }));
      setLikeCount(p => ({ ...p, [storyId]: prevCount }));
      toast.error(e.message || "Failed to react. Please login.", toastStyle.error);
    } finally {
      setLikingState(p => ({ ...p, [storyId]: false }));
    }
  };

  const handleSave = async (storyId: string) => {
    if (savingState[storyId]) return;
    const was = !!savedState[storyId];
    setSavedState(p => ({ ...p, [storyId]: !was }));
    setSavingState(p => ({ ...p, [storyId]: true }));
    try {
      const res = await toggleSave("story", storyId, "saved");
      setSavedState(p => ({ ...p, [storyId]: res.data.isSaved }));
      toast.success(res.data.isSaved ? "Story saved!" : "Removed from saved.", toastStyle.success);
    } catch (e: any) {
      setSavedState(p => ({ ...p, [storyId]: was }));
      toast.error(e.message || "Failed to save. Please login.", toastStyle.error);
    } finally {
      setSavingState(p => ({ ...p, [storyId]: false }));
    }
  };

  const handleShare = async (story: Story) => {
    const url = `${window.location.origin}/reader/${category}/${story._id}`;
    if (navigator.share) {
      try { await navigator.share({ title: story.title, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!", toastStyle.success);
    }
  };

  return (
    <main className="bg-white min-h-screen pt-28 md:pt-64 pb-10">
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

      <div className="max-w-4xl mx-auto text-center mb-16 px-4">
        <h1 className="text-6xl font-sans text-gray-900 mb-4 font-extrabold tracking-wide capitalize">{category}</h1>
        <p className="text-black font-serif text-lg tracking-wide">Discover stories from the world of {category}.</p>
        <div className="h-[1px] bg-gray-100 w-full mt-10" />
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-12">
        {loading && page === 1
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : stories.map(story => (
            <div key={story._id} className="flex flex-col border-b border-gray-50 pb-12 group">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="flex-1 order-2 md:order-1">
                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src={story.author.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.author.name)}&background=random`}
                      className="w-8 h-8 rounded-full object-cover" alt={story.author.name}
                    />
                    <div>
                      <span className="text-[15px] font-bold font-sans text-gray-900">{story.author.name}</span>
                      <p className="text-[12px] font-serif text-gray-400">{new Date(story.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <Link href={`/reader/${category}/${story._id}`}>
                    <h2 className="text-2xl font-sans font-extrabold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors tracking-wide">
                      {story.title}
                    </h2>
                  </Link>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5 font-serif line-clamp-3">{story.summary}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => handleLike(story._id)}
                        disabled={likingState[story._id]}
                        className={`flex items-center gap-1.5 transition-all active:scale-90 font-sans text-sm font-bold ${likedState[story._id] ? "text-blue-600" : "text-gray-500 hover:text-blue-600"}`}
                      >
                        <ThumbsUp size={18} fill={likedState[story._id] ? "currentColor" : "none"} />
                        <span>{likeCount[story._id] ?? 0}</span>
                      </button>
                      <button
                        onClick={() => setCommentModal({ storyId: story._id, title: story.title })}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors font-sans text-sm font-bold active:scale-90"
                      >
                        <MessageSquare size={18} />
                        <span>{commentCount[story._id] ?? 0}</span>
                      </button>
                      <button
                        onClick={() => handleShare(story)}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors active:scale-90"
                      >
                        <Share2 size={18} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleSave(story._id)}
                      disabled={savingState[story._id]}
                      className="p-2.5 bg-gray-50 rounded-full hover:shadow-md transition-all active:scale-90"
                    >
                      <Bookmark size={18} className={savedState[story._id] ? "text-blue-600 fill-blue-600" : "text-gray-500"} />
                    </button>
                  </div>
                </div>

                <Link href={`/reader/${category}/${story._id}`}
                  className="w-full md:w-[300px] h-[180px] rounded-2xl overflow-hidden order-1 md:order-2 shadow-sm relative shrink-0">
                  <img src={story.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={story.title} />
                  {story.isPremium && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      <Lock size={10} /> Premium
                    </div>
                  )}
                </Link>
              </div>
            </div>
          ))
        }
      </div>

      {!loading && hasMore && (
        <div className="flex justify-center mt-16 pb-10">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-10 py-3 bg-black text-white rounded-xl font-serif hover:bg-gray-800 transition-all active:scale-95 shadow-lg tracking-wide"
          >
            Load More
          </button>
        </div>
      )}
      {loading && page > 1 && (
        <div className="flex justify-center mt-10">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {error && <p className="text-center text-red-500 mt-10 font-serif">{error}</p>}

      <UnlimitedAccess />
    </main>
  );
};

export default Explore;