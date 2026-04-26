"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { Bookmark, ThumbsUp, MessageSquare, Share2, ArrowUpRight, Lock, X, Send, ChevronDown, ThumbsDown, MoreHorizontal, Edit2, Trash2, Reply, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

// API clients
import { fetchAllLedeStories, Story } from "@/components/theLedApiClient";
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

// ── Helper functions (shared with Explore) ───────────────────
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

// ── Toast style (same as Explore) ────────────────────────────
const toastStyle = {
  success: {
    style: { background: "#000", color: "#fff", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", fontFamily: "serif", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" },
    iconTheme: { primary: "#fff", secondary: "#000" },
  },
  error: {
    style: { background: "#fff", color: "#ef4444", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", fontFamily: "serif", border: "1px solid #fecaca", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  },
};

// ── Premium Modal Component ───────────────────────────────────
interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onSubscribe }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
          >
            {/* Premium Header */}
            <div className="relative bg-gradient-to-br from-[#343E87] via-[#3448D6] to-[#343E87] pt-8 pb-12 px-6 text-center">
              <div className="absolute top-4 right-4">
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Premium Content</h2>
              <p className="text-white/80 text-sm">
                This content is only available for premium subscribers.
              </p>
            </div>

            {/* Content - Simplified */}
            <div className="p-6">
              <p className="text-gray-700 text-center mb-8 font-serif leading-relaxed">
                Would you like to subscribe to access all premium content?
              </p>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={onSubscribe}
                  className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:shadow-lg active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)"
                  }}
                >
                  SUBSCRIBE NOW
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                >
                  MAYBE LATER
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── CommentItem component (same as in Explore) ────────────────
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
                        onClick={async () => { 
                          setShowMenu(false); 
                          await onEdit(comment._id, comment.content); 
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full transition-colors"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={async () => { 
                          setShowMenu(false); 
                          await onDelete(comment._id); 
                        }}
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

// ── Comment Modal (same as in Explore listing) ───────────────
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

  // Fixed: Changed to async function that returns Promise<void>
  const handleReply = async (parentId: string, content: string): Promise<void> => {
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

  // Fixed: Changed to async function that returns Promise<void>
  const handleEditOpen = async (id: string, content: string): Promise<void> => {
    setEditModal({ open: true, id, content });
  };

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
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 text-black flex items-center justify-center hover:bg-gray-200 transition-colors">
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

// ── Main TodayMixCard Component ──────────────────────────────
const TodayMixCard = () => {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Premium modal state
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [pendingStory, setPendingStory] = useState<Story | null>(null);

  // Social states per story
  const [savedState, setSavedState] = useState<Record<string, boolean>>({});
  const [savingState, setSavingState] = useState<Record<string, boolean>>({});
  const [likedState, setLikedState] = useState<Record<string, boolean>>({});
  const [likingState, setLikingState] = useState<Record<string, boolean>>({});
  const [likeCount, setLikeCount] = useState<Record<string, number>>({});
  const [commentCount, setCommentCount] = useState<Record<string, number>>({});

  const [commentModal, setCommentModal] = useState<{ storyId: string; title: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  // Load user id once
  useEffect(() => {
    try {
      const u = localStorage.getItem("oped_user");
      if (u) setCurrentUserId(JSON.parse(u).id ?? undefined);
    } catch {}
  }, []);

  // Fetch stories and their social data - Fixed: fetchAllLedeStories expects page number and limit
  useEffect(() => {
    let cancelled = false;
    const loadStories = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAllLedeStories(1, 10);
        if (cancelled || !res.success) return;
        const newStories = res.data;
        setStories(newStories);

        // For each story, fetch reaction, saved status, comment count
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
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Failed to load stories.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadStories();
    return () => { cancelled = true; };
  }, []);

  // Like handler (optimistic)
  const handleLike = async (storyId: string) => {
    if (likingState[storyId]) return;
    const was = !!likedState[storyId];
    const prevCount = likeCount[storyId] ?? 0;
    setLikedState(p => ({ ...p, [storyId]: !was }));
    setLikeCount(p => ({ ...p, [storyId]: was ? Math.max(0, prevCount - 1) : prevCount + 1 }));
    setLikingState(p => ({ ...p, [storyId]: true }));
    try {
      await addReaction("story", storyId, "like");
      // Optionally refresh to be safe
      const fresh = await getMyReaction("story", storyId);
      if (fresh.success) {
        setLikedState(p => ({ ...p, [storyId]: fresh.data.myReaction === "like" }));
        setLikeCount(p => ({ ...p, [storyId]: fresh.data.summary?.like ?? 0 }));
      }
    } catch (e: any) {
      setLikedState(p => ({ ...p, [storyId]: was }));
      setLikeCount(p => ({ ...p, [storyId]: prevCount }));
      toast.error(e.message || "Failed to react. Please login.", toastStyle.error);
    } finally {
      setLikingState(p => ({ ...p, [storyId]: false }));
    }
  };

  // Save handler (optimistic)
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

  // Share handler
  const handleShare = async (story: Story) => {
    const url = `${window.location.origin}/story/${story._id}`;
    if (navigator.share) {
      try { await navigator.share({ title: story.title, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!", toastStyle.success);
    }
  };

  // Handle story click with premium modal
  const handleStoryClick = (story: Story, e: React.MouseEvent) => {
    e.preventDefault();
    if (story.isPremium) {
      setPendingStory(story);
      setShowPremiumModal(true);
    } else {
      router.push(`/reader/story/${story._id}`);
    }
  };

  const handleSubscribeRedirect = () => {
    setShowPremiumModal(false);
    router.push("/reader/subscribe");
  };

  const handleModalClose = () => {
    setShowPremiumModal(false);
    setPendingStory(null);
  };

  const skeletonCount = 4;

  return (
    <section className="py-16 px-4 md:px-10 bg-white">
      <Toaster position="bottom-center" />

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={handleModalClose}
        onSubscribe={handleSubscribeRedirect}
      />

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

      <div className="text-center mb-12">
        <h2 className="text-[42px] md:text-[54px] font-sans text-gray-900">Today's Mix</h2>
      </div>

      {error && <p className="text-center text-red-500 text-sm mb-6">{error}</p>}

      <div className="relative max-w-7xl mx-auto py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: skeletonCount }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : stories.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No stories found.</p>
        ) : (
          <>
            <Swiper
              modules={[Autoplay, Navigation]}
              spaceBetween={24}
              slidesPerView={1}
              loop={stories.length > 1}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              navigation={{
                nextEl: ".swiper-button-next-custom",
                prevEl: ".swiper-button-prev-custom",
              }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              className="pb-10"
            >
              {stories.map((story) => (
                <SwiperSlide key={story._id}>
                  <div className="rounded-[20px] overflow-hidden flex flex-col border shadow-xl">
                    {/* Image Container */}
                    <div className="relative p-4">
                      <div 
                        onClick={(e) => handleStoryClick(story, e)}
                        className="relative h-[200px] w-full rounded-[15px] overflow-hidden cursor-pointer"
                      >
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1519681393784-d120267933ba";
                          }}
                        />
                        {story.isPremium && (
                          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                            <Lock size={10} />
                            Premium
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave(story._id);
                          }}
                          disabled={savingState[story._id]}
                          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
                        >
                          <Bookmark
                            size={16}
                            className={savedState[story._id] ? "text-blue-600 fill-blue-600" : "text-gray-700"}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pt-2 pb-6 flex flex-col items-center text-center">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                          {story.author.profileImage ? (
                            <img
                              src={story.author.profileImage}
                              alt={story.author.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                              }}
                            />
                          ) : (
                            <span className="text-[10px] text-white font-bold">
                              {story.author.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-[14px] font-sans font-bold tracking-widest text-black truncate max-w-[140px]">
                          {story.author.name}
                        </span>
                      </div>

                      <div onClick={(e) => handleStoryClick(story, e)} className="cursor-pointer">
                        <h3 className="text-xl font-sans font-medium leading-tight mb-4 text-black px-2 line-clamp-2 hover:text-blue-600 transition-colors">
                          {story.title}
                        </h3>
                      </div>

                      <p className="text-gray-500 text-[13px] font-serif leading-relaxed mb-4 line-clamp-3">
                        {story.summary}
                      </p>

                      <div onClick={(e) => handleStoryClick(story, e)} className="cursor-pointer">
                        <span className="flex items-center gap-1 text-[#4B59B3] font-sans text-xs font-bold mb-6 hover:underline">
                          Read More <ArrowUpRight size={14} />
                        </span>
                      </div>

                      {/* Footer Stats with real data */}
                      <div className="w-full flex items-center justify-between pt-4 border-t border-gray-100 text-gray-400">
                        <button
                          onClick={() => handleLike(story._id)}
                          disabled={likingState[story._id]}
                          className="flex items-center gap-1.5 transition-all active:scale-90"
                        >
                          <ThumbsUp
                            size={14}
                            className={likedState[story._id] ? "text-blue-600 fill-blue-600" : "text-black"}
                          />
                          <span className="text-[11px] font-sans font-bold text-black">
                            {likeCount[story._id] ?? 0}
                          </span>
                        </button>
                        <button
                          onClick={() => setCommentModal({ storyId: story._id, title: story.title })}
                          className="flex items-center gap-1.5 transition-all active:scale-90"
                        >
                          <MessageSquare size={14} className="text-black" />
                          <span className="text-[11px] font-sans font-bold text-black">
                            {commentCount[story._id] ?? 0}
                          </span>
                        </button>
                        <button
                          onClick={() => handleShare(story)}
                          className="flex items-center gap-1.5 transition-all active:scale-90"
                        >
                          <Share2 size={14} className="text-black" />
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-400/50 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-400/50 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
};

// Skeleton Card component (unchanged)
const SkeletonCard = () => (
  <div className="rounded-[20px] overflow-hidden flex flex-col border shadow-xl animate-pulse">
    <div className="relative p-4">
      <div className="h-[200px] w-full rounded-[15px] bg-gray-200" />
    </div>
    <div className="px-6 pt-2 pb-6 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-200" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
      <div className="h-3 w-full bg-gray-100 rounded" />
      <div className="h-3 w-5/6 bg-gray-100 rounded" />
      <div className="h-3 w-4/6 bg-gray-100 rounded" />
      <div className="w-full border-t border-gray-100 pt-4 flex justify-between">
        <div className="h-3 w-10 bg-gray-200 rounded" />
        <div className="h-3 w-10 bg-gray-200 rounded" />
        <div className="h-3 w-10 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

export default TodayMixCard;