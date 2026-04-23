"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  MessageSquare,
  Heart,
  Bookmark,
  Radio,
  AlertCircle,
  Loader2,
  Newspaper,
  ThumbsUp,
} from "lucide-react";
import {
getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  NotificationItem,
} from "../notificationApiClient"; // adjust path as needed


// ── Helpers ───────────────────────────────────────────────────

const timeAgo = (dateStr: string): string => {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const notifIcon = (type: string) => {
  const cls = "flex-shrink-0";
  switch (type) {
    case "comment_reply": return <MessageSquare size={15} className={`text-[#3448D6] ${cls}`} />;
    case "like":          return <Heart         size={15} className={`text-rose-500 ${cls}`}  />;
    case "saved":         return <Bookmark      size={15} className={`text-amber-500 ${cls}`} />;
    case "live_news":     return <Radio         size={15} className={`text-red-500 ${cls}`}   />;
    case "follow":        return <Newspaper     size={15} className={`text-violet-500 ${cls}`}/>;
    case "reaction":      return <ThumbsUp      size={15} className={`text-sky-500 ${cls}`}   />;
    default:              return <Bell          size={15} className={`text-gray-400 ${cls}`}  />;
  }
};

const notifColors = (type: string) => {
  switch (type) {
    case "comment_reply": return { bg: "bg-blue-50",   ring: "ring-blue-200"   };
    case "like":          return { bg: "bg-rose-50",   ring: "ring-rose-200"   };
    case "saved":         return { bg: "bg-amber-50",  ring: "ring-amber-200"  };
    case "live_news":     return { bg: "bg-red-50",    ring: "ring-red-200"    };
    case "follow":        return { bg: "bg-violet-50", ring: "ring-violet-200" };
    case "reaction":      return { bg: "bg-sky-50",    ring: "ring-sky-200"    };
    default:              return { bg: "bg-gray-100",  ring: "ring-gray-200"   };
  }
};

// ── Single notification row ────────────────────────────────────

interface NotifRowProps {
  item:     NotificationItem;
  onRead:   (id: string) => void;
  onDelete: (id: string) => void;
  onClick:  (item: NotificationItem) => void;
}

const NotifRow: React.FC<NotifRowProps> = ({ item, onRead, onDelete, onClick }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const colors = notifColors(item.type);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    // Small delay so exit animation plays before state change
    setTimeout(() => onDelete(item._id), 180);
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.isRead) onRead(item._id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: isDeleting ? 0 : 1, y: 0, height: isDeleting ? 0 : "auto" }}
      exit={{ opacity: 0, x: 40, height: 0 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      onClick={() => {
        onClick(item);
        if (!item.isRead) onRead(item._id);
      }}
      className={`group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer border-b border-gray-50 last:border-0 transition-all duration-150
        ${!item.isRead
          ? "bg-gradient-to-r from-[#EEF1FF] to-white hover:from-[#E4E8FF]"
          : "bg-white hover:bg-gray-50"
        }`}
    >
      {/* Unread indicator bar */}
      <AnimatePresence>
        {!item.isRead && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            className="absolute left-0 top-3 bottom-3 w-[3px] bg-[#3448D6] rounded-r-full origin-top"
          />
        )}
      </AnimatePresence>

      {/* Icon bubble */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ring-1 mt-0.5 ${colors.bg} ${colors.ring}`}>
        {notifIcon(item.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        <p className={`text-[13px] leading-[1.45] break-words ${
          !item.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-600"
        }`}>
          {item.message}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[11px] text-gray-400 font-medium">{timeAgo(item.createdAt)}</span>
          {item.contentType && (
            <>
              <span className="text-gray-200 text-[10px]">•</span>
              <span className={`text-[11px] font-bold capitalize px-1.5 py-0.5 rounded-full ${colors.bg} ${
                item.type === "comment_reply" ? "text-[#3448D6]" :
                item.type === "like"          ? "text-rose-500"  :
                item.type === "saved"         ? "text-amber-600" :
                item.type === "live_news"     ? "text-red-500"   :
                "text-gray-500"
              }`}>
                {item.contentType}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action buttons – fade in on hover */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0 self-center">
        {!item.isRead && (
          <button
            onClick={handleMarkRead}
            title="Mark as read"
            className="p-1.5 rounded-lg hover:bg-blue-100 text-[#3448D6] hover:text-blue-700 transition-colors"
          >
            <Check size={13} />
          </button>
        )}
        <button
          onClick={handleDelete}
          title="Delete"
          className="p-1.5 rounded-lg hover:bg-red-100 text-gray-300 hover:text-red-500 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
};

// ── Skeleton loader ────────────────────────────────────────────

const SkeletonRow: React.FC<{ idx: number }> = ({ idx }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: idx * 0.06 }}
    className="flex items-start gap-3 px-4 py-3.5 border-b border-gray-50"
  >
    <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <div className="h-3 bg-gray-100 rounded-full animate-pulse w-4/5" />
      <div className="h-3 bg-gray-100 rounded-full animate-pulse w-3/5" />
      <div className="h-2.5 bg-gray-100 rounded-full animate-pulse w-1/4 mt-1" />
    </div>
  </motion.div>
);

// ── Main NotificationBell Component ───────────────────────────

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = "" }) => {
  const [open,        setOpen]        = useState(false);
  const [items,       setItems]       = useState<NotificationItem[]>([]);
  const [unread,      setUnread]      = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [marking,     setMarking]     = useState(false);
  const [error,       setError]       = useState("");
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [justReceived, setJustReceived] = useState(false); // for bell flash

  const panelRef = useRef<HTMLDivElement>(null);
  const prevUnread = useRef(0);
  const router = useRouter();

  // ── Fetch ─────────────────────────────────────────────────

  const fetchNotifications = useCallback(async (p = 1, append = false) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      setError("");
      const res = await getNotifications
      ({ page: p, limit: 10 });
      setItems((prev) => append ? [...prev, ...res.data] : res.data);
      setUnread(res.unreadCount);
      setTotalPages(res.pagination.totalPages);
      setPage(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Fetch on panel open
  useEffect(() => {
    if (open) fetchNotifications(1);
  }, [open, fetchNotifications]);

  // Poll unread count every 60s
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await getNotifications({ page: 1, limit: 1 });
        const newCount = res.unreadCount;
        // Trigger flash animation if new notifications arrived
        if (newCount > prevUnread.current) {
          setJustReceived(true);
          setTimeout(() => setJustReceived(false), 2000);
        }
        prevUnread.current = newCount;
        setUnread(newCount);
      } catch { /* silent */ }
    };
    poll();
    const id = setInterval(poll, 60000);
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // ── Handlers ──────────────────────────────────────────────

  const handleRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setItems((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnread((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string) => {
    const wasUnread = items.find((n) => n._id === id)?.isRead === false;
    // Optimistic update
    setItems((prev) => prev.filter((n) => n._id !== id));
    if (wasUnread) setUnread((c) => Math.max(0, c - 1));
    try {
      await deleteNotification(id);
    } catch {
      // Re-fetch on failure
      fetchNotifications(1);
    }
  };

  const handleMarkAll = async () => {
    try {
      setMarking(true);
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch { /* silent */ } finally {
      setMarking(false);
    }
  };

  const handleClick = (item: NotificationItem) => {
    setOpen(false);
    if (item.contentType && item.contentId) {
      router.push(`/reader/${item.contentType}/${item.contentId}`);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) fetchNotifications(page + 1, true);
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <div className={`relative ${className}`} ref={panelRef}>

      {/* ── Bell Button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        className={`relative p-1.5 rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#3448D6] focus-visible:ring-offset-2
          ${open
            ? "text-[#3448D6] bg-[#EEF1FF]"
            : "text-gray-700 hover:text-[#3448D6] hover:bg-[#EEF1FF]"
          }`}
      >
        {/* Bell shake animation when unread > 0 and panel closed */}
        <motion.div
          animate={
            unread > 0 && !open
              ? { rotate: [0, -18, 18, -12, 12, -6, 6, 0] }
              : justReceived
              ? { scale: [1, 1.3, 1] }
              : {}
          }
          transition={{
            duration: 0.6,
            repeat: unread > 0 && !open ? Infinity : 0,
            repeatDelay: 5,
            ease: "easeInOut",
          }}
        >
          <Bell
            size={24}
            className={`transition-colors md:w-[26px] md:h-[26px] ${
              justReceived ? "text-[#3448D6]" : ""
            }`}
            strokeWidth={open ? 2.5 : 2}
          />
        </motion.div>

        {/* Unread badge */}
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full leading-none shadow-sm shadow-red-300 tabular-nums"
            >
              {unread > 99 ? "99+" : unread}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Ping ring for new notifications */}
        <AnimatePresence>
          {unread > 0 && !open && (
            <motion.span
              key="ping"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-red-400 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </button>

      {/* ── Dropdown Panel ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop blur overlay (mobile) */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] md:hidden bg-black/20 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />

            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={  { opacity: 0, y: 8,  scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-[calc(100%+12px)] w-[380px] max-w-[calc(100vw-16px)] bg-white rounded-2xl shadow-[0_8px_40px_-4px_rgba(52,72,214,0.18),0_2px_12px_-2px_rgba(0,0,0,0.08)] border border-gray-100/80 z-[9999] overflow-hidden flex flex-col"
              style={{ maxHeight: "540px" }}
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#EEF1FF] flex items-center justify-center">
                    <Bell size={14} className="text-[#3448D6]" />
                  </div>
                  <h3 className="font-serif font-bold text-[15px] text-gray-900 tracking-tight">
                    Notifications
                  </h3>
                  <AnimatePresence>
                    {unread > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="px-2 py-0.5 bg-[#3448D6] text-white text-[10px] font-black rounded-full leading-none"
                      >
                        {unread} new
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-1">
                  {unread > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleMarkAll}
                      disabled={marking}
                      title="Mark all as read"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-[#3448D6] hover:bg-[#EEF1FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {marking
                        ? <Loader2 size={11} className="animate-spin" />
                        : <CheckCheck size={11} />
                      }
                      Mark all read
                    </motion.button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors ml-0.5"
                    aria-label="Close notifications"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* ── Body ── */}
              <div className="overflow-y-auto flex-1 overscroll-contain">

                {/* Loading skeleton */}
                {loading && (
                  <div>
                    {[...Array(5)].map((_, i) => <SkeletonRow key={i} idx={i} />)}
                  </div>
                )}

                {/* Error state */}
                {error && !loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 px-6 text-center"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
                      <AlertCircle size={22} className="text-red-400" />
                    </div>
                    <p className="text-[13px] font-semibold text-gray-700 mb-1">Couldn't load</p>
                    <p className="text-[12px] text-gray-400 mb-4 leading-relaxed">{error}</p>
                    <button
                      onClick={() => fetchNotifications(1)}
                      className="px-4 py-2 bg-[#3448D6] text-white text-[12px] font-black rounded-xl hover:bg-[#2d3db8] transition-colors"
                    >
                      Try again
                    </button>
                  </motion.div>
                )}

                {/* Empty state */}
                {!loading && !error && items.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-14 px-6 text-center"
                  >
                    <motion.div
                      animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4"
                    >
                      <Bell size={24} className="text-gray-300" />
                    </motion.div>
                    <p className="text-[15px] font-serif font-bold text-gray-700 mb-1">All caught up!</p>
                    <p className="text-[12px] font-serif text-gray-400">You have no new notifications</p>
                  </motion.div>
                )}

                {/* Notification list */}
                {!loading && !error && items.length > 0 && (
                  <AnimatePresence initial={false} mode="popLayout">
                    {items.map((item) => (
                      <NotifRow
                        key={item._id}
                        item={item}
                        onRead={handleRead}
                        onDelete={handleDelete}
                        onClick={handleClick}
                      />
                    ))}
                  </AnimatePresence>
                )}

                {/* Load more */}
                {!loading && !error && page < totalPages && (
                  <div className="px-4 py-3">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="w-full py-2.5 text-[12px] font-black text-[#3448D6] hover:bg-[#EEF1FF] rounded-xl transition-colors flex items-center justify-center gap-2 border border-[#3448D6]/20"
                    >
                      {loadingMore
                        ? <><Loader2 size={12} className="animate-spin" /> Loading...</>
                        : "Load more"
                      }
                    </button>
                  </div>
                )}
              </div>

              {/* ── Footer ── */}
              {items.length > 0 && !loading && (
                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 flex-shrink-0 flex items-center justify-center">
                  <p className="text-[10px] text-gray-400 font-medium">
                    Tap a notification to view the content
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;