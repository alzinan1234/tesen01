"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, ArrowUpRight } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getWriterStories, Story } from "@/components/writerStoryApiClient";
import { getMyReaction, getComments, addReaction } from "@/components/socialApiClient";

type TabType = "pending" | "scheduled" | "revision" | "draft" | "saved" | "rejected";

interface TabConfig {
  label: string;
  status?: string;        // for writer API
  isScheduled?: boolean;  // special filter for scheduled
  isSaved?: boolean;      // special filter for saved stories (needs separate API)
}

const tabs: { [key in TabType]: TabConfig } = {
  pending: { label: "Publish Status", status: "pending" },
  scheduled: { label: "Scheduled", isScheduled: true },
  revision: { label: "Request Revision", status: "revision" },
  draft: { label: "Draft", status: "draft" },
  saved: { label: "Save", isSaved: true },
  rejected: { label: "Rejected", status: "rejected" },
};

// Helper to format date
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

// Helper to format large numbers
const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

const SaveAndDraft = () => {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Social stats per story
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  // Fetch stories based on active tab
  const fetchStories = useCallback(async (resetPage = true) => {
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);
    setLoading(true);
    setError(null);

    const tabConfig = tabs[activeTab];

    try {
      let fetchedStories: Story[] = [];
      let pagination = { total: 0, page: currentPage, limit: 5, totalPages: 1 };

      // Handle saved stories (bookmarked) - needs separate API
      if (tabConfig.isSaved) {
        // TODO: Implement getSavedStories API call
        // For now, show empty state with message
        setStories([]);
        setTotal(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      // Handle scheduled stories (filter by scheduledAt not null)
      if (tabConfig.isScheduled) {
        // Fetch all statuses and filter those with scheduledAt
        const res = await getWriterStories({ status: "", page: currentPage, limit: 10 });
        if (res.success && res.data) {
          const scheduled = res.data.filter(s => s.scheduledAt);
          fetchedStories = scheduled;
          pagination = { ...res.pagination, total: scheduled.length, totalPages: Math.ceil(scheduled.length / (res.pagination?.limit || 10)) };
        } else {
          throw new Error(res.message || "Failed to load scheduled stories");
        }
      } else {
        // Normal status filter
        const res = await getWriterStories({ status: tabConfig.status, page: currentPage, limit: 5 });
        if (res.success && res.data) {
          fetchedStories = res.data;
          pagination = res.pagination!;
        } else {
          throw new Error(res.message || "Failed to load stories");
        }
      }

      setStories(fetchedStories);
      setTotal(pagination.total);
      setTotalPages(pagination.totalPages);

      // Fetch like & comment counts for each story
      for (const story of fetchedStories) {
        try {
          const [reactRes, commentRes] = await Promise.allSettled([
            getMyReaction("story", story._id),
            getComments("story", story._id, 1, 1),
          ]);
          if (reactRes.status === "fulfilled" && reactRes.value.success) {
            const summary = reactRes.value.data.summary;
            setLikeCounts(prev => ({ ...prev, [story._id]: summary?.like ?? 0 }));
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
  }, [activeTab, page]);

  useEffect(() => {
    fetchStories(true);
  }, [activeTab]);

  // Handle like action
  const handleLike = async (storyId: string) => {
    const wasLiked = userLiked[storyId];
    const prevCount = likeCounts[storyId] || 0;
    // Optimistic update
    setUserLiked(prev => ({ ...prev, [storyId]: !wasLiked }));
    setLikeCounts(prev => ({ ...prev, [storyId]: wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1 }));

    try {
      await addReaction("story", storyId, "like");
      // Refresh actual data to stay in sync
      const reactRes = await getMyReaction("story", storyId);
      if (reactRes.success) {
        setUserLiked(prev => ({ ...prev, [storyId]: reactRes.data.myReaction === "like" }));
        setLikeCounts(prev => ({ ...prev, [storyId]: reactRes.data.summary?.like ?? 0 }));
      }
    } catch (err: any) {
      // Rollback on error
      setUserLiked(prev => ({ ...prev, [storyId]: wasLiked }));
      setLikeCounts(prev => ({ ...prev, [storyId]: prevCount }));
      toast.error(err.message || "Failed to like. Please login.");
    }
  };

  // Handle share
  const handleShare = async (story: Story) => {
    const url = `${window.location.origin}/writer/stories/${story._id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, url });
      } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  // Pagination
  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchStories(false);
  };

  // Loading skeleton
  if (loading && stories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 pt-28 min-h-screen">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-64 mb-10" />
          <div className="flex gap-8 border-b mb-12">
            {Object.values(tabs).map((tab, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-24" />
            ))}
          </div>
          {[1, 2].map(i => (
            <div key={i} className="flex flex-col md:flex-row gap-8 mb-12">
              <div className="w-full md:w-64 h-48 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => fetchStories(true)} className="px-4 py-2 bg-black text-white rounded-lg">
          Retry
        </button>
      </div>
    );
  }

  const currentTabConfig = tabs[activeTab];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pt-28 min-h-screen text-black font-sans">
      <Toaster position="bottom-center" />

      {/* Main Heading */}
      <h1 className="text-5xl font-serif font-bold mb-10 tracking-tight">Save & Draft</h1>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-gray-100 mb-12">
        {(Object.keys(tabs) as TabType[]).map((key) => {
          const tab = tabs[key];
          let countDisplay = "";
          if (key === "draft" && total && activeTab === "draft") countDisplay = ` (${total})`;
          if (key === "saved" && total && activeTab === "saved") countDisplay = ` (${total})`;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pb-4 text-[15px] font-medium transition-all relative ${
                activeTab === key ? "text-black font-bold" : "text-gray-400 hover:text-black"
              }`}
            >
              {tab.label}
              {countDisplay}
              {activeTab === key && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />}
            </button>
          );
        })}
      </div>

      {/* Stories List */}
      <div className="space-y-12">
        {stories.length === 0 && !loading ? (
          <div className="py-20 text-center text-gray-400 font-serif italic text-xl">
            No {currentTabConfig.label.toLowerCase()} stories found.
          </div>
        ) : (
          stories.map((story) => (
            <article key={story._id} className="flex flex-col md:flex-row gap-8 items-start group relative">
              {/* Image Section */}
              <div className="w-full md:w-64 shrink-0">
                <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800")
                    }
                  />
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <Link href={`/writer/stories/${story._id}`}>
                    <h2 className="text-xl font-serif font-bold leading-snug max-w-lg cursor-pointer hover:text-blue-700 transition-colors">
                      {story.title}
                    </h2>
                  </Link>

                  {/* Dynamic Badges based on activeTab */}
                  {activeTab === "pending" && (
                    <span className="bg-[#F3F5E9] text-[#7A8A45] px-4 py-1 rounded-full text-xs font-semibold">
                      In Review
                    </span>
                  )}
                  {activeTab === "scheduled" && story.scheduledAt && (
                    <span className="bg-[#F3F5E9] text-[#7A8A45] px-4 py-1 rounded-full text-xs font-semibold">
                      {formatDate(story.scheduledAt)}
                    </span>
                  )}
                  {activeTab === "rejected" && (
                    <span className="bg-[#FFE9E9] text-[#FF5F5F] px-4 py-1 rounded-full text-xs font-semibold">
                      Rejected
                    </span>
                  )}
                  {activeTab === "revision" && (
                    <span className="bg-[#E9F0FF] text-[#5F8BFF] px-4 py-1 rounded-full text-xs font-semibold cursor-pointer">
                      View Feedback
                    </span>
                  )}
                </div>

                <p className="text-black/60 text-sm leading-relaxed mb-4 max-w-2xl">{story.summary}</p>

                {(activeTab === "pending" || activeTab === "scheduled" || activeTab === "revision") && (
                  <Link href={`/writer/stories/${story._id}`} className="inline-flex items-center text-blue-700 text-sm font-semibold mb-6 hover:underline">
                    Read More <ArrowUpRight className="ml-1 w-4 h-4" />
                  </Link>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(story._id)}
                      className={`flex items-center gap-1.5 transition-all ${
                        userLiked[story._id] ? "text-blue-600" : "text-black hover:text-blue-600"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" fill={userLiked[story._id] ? "currentColor" : "none"} />
                      <span className="text-xs font-bold">{formatCount(likeCounts[story._id] || 0)}</span>
                    </button>
                    <Link href={`/writer/stories/${story._id}#comment-section`} className="flex items-center gap-1.5 text-black hover:text-blue-600 transition-all">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-bold">{formatCount(commentCounts[story._id] || 0)}</span>
                    </Link>
                    <button onClick={() => handleShare(story)} className="flex items-center gap-1.5 text-black hover:text-gray-600 transition-all">
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs font-bold">Share</span>
                    </button>
                  </div>
                  <button className="text-black/40 hover:text-black">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 text-[11px] font-bold text-black/40 uppercase tracking-widest">
                  {formatDate(story.createdAt)}
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-12">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SaveAndDraft;