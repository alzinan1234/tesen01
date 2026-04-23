// app/reader/live-news/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Radio,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";
import { getLiveNews, LiveNewsItem } from "@/components/liveNewsApiClient";

// ─── Types ─────────────────────────────────────────────────────────────────

// ─── Live News Card Component ─────────────────────────────────────────────

const LiveNewsCard: React.FC<{ news: LiveNewsItem; index: number }> = ({ news, index }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className={`group relative bg-white rounded-[20px] border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 ${
      index === 0 ? "border-l-4 border-l-red-500" : ""
    }`}>
      {/* Live Badge for latest news */}
      {index === 0 && (
        <div className="absolute -top-3 left-6">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
        </div>
      )}
      
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {news.author?.profileImage ? (
            <img
              src={news.author.profileImage}
              alt={news.author.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#343E87] to-[#3448D6] flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="font-serif text-[16px] font-semibold text-black">
              {news.author?.name || "Anonymous"}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-[#8C8C8C]">
              <Clock size={11} />
              <span>{formatTime(news.postedAt || news.createdAt)}</span>
            </div>
          </div>
          
          <p className="text-[15px] text-[#636363] leading-relaxed">
            {news.content}
          </p>
          
          {/* Live indicator dot */}
          <div className="mt-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-red-500 uppercase font-bold tracking-wider">
              Breaking News
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-[20px] border border-gray-100 p-6 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-200" />
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────

const LiveNews: React.FC = () => {
  const [news, setNews] = useState<LiveNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const limit = 20;

  // Fetch live news
  const fetchLiveNews = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      
      const response = await getLiveNews({
        page: currentPage,
        limit,
      });
      
      setNews(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch live news:", err);
      setError(err instanceof Error ? err.message : "Failed to load live news");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchLiveNews();
  }, [fetchLiveNews]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveNews(true);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchLiveNews]);

  const handleRefresh = () => {
    fetchLiveNews(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="max-w-4xl mx-auto px-4 py-8 pt-49">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <Radio size={20} className="text-white" />
            </div>
            <h1 className="font-serif text-[32px] font-bold text-black">
              Live News
            </h1>
            <span className="px-2 py-1 font-serif bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
              LIVE UPDATES
            </span>
          </div>
          <p className="text-[14px] text-[#8C8C8C] font-serif">
            Breaking news and real-time updates from around the world
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-[16px] border border-gray-100 p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[13px] font-medium text-gray-700 font-serif">
                Live Updates
              </span>
            </div>
            <div className="text-[13px] text-[#8C8C8C] font-serif">
              Total News: <span className="font-semibold text-black">{totalItems}</span>
            </div>
            <div className="text-[12px] text-[#B5B5B5] font-serif">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#E9ECFF] rounded-[10px] text-[13px] text-[#3448D6] hover:bg-[#3448D6] hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Updating..." : "Refresh"}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-[20px] p-8 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchLiveNews()}
              className="px-4 py-2 bg-[#3448D6] font-serif text-white rounded-[8px] text-sm hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        )}

        {/* News List */}
        {!loading && !error && (
          <>
            {news.length === 0 ? (
              <div className="bg-white rounded-[20px] border border-gray-100 p-12 text-center">
                <Radio size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-[#8C8C8C] font-serif">No live news available at the moment</p>
                <p className="text-[12px] text-[#B5B5B5] font-serif mt-1">
                  Check back later for breaking news updates
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {news.map((item, index) => (
                  <LiveNewsCard key={item._id} news={item} index={index} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-[8px] border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-[8px] text-[14px] font-medium transition-all ${
                          currentPage === pageNum
                            ? "bg-[#3448D6] text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-[8px] border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-white rounded-full shadow-lg px-3 py-1.5 flex items-center gap-2 border border-gray-100">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-gray-500 font-serif">Auto-refreshing</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default LiveNews;