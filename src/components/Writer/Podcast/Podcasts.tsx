"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Headphones } from "lucide-react";
import { getWriterPodcasts, GetWriterPodcastsParams } from "@/components/writerPodcastApiClient";
import toast, { Toaster } from "react-hot-toast";

interface Podcast {
  _id: string;
  title: string;
  summary: string;
  coverImage: string;
  audioDuration: number;
  category: string;
  tags: string[];
  isPremium: boolean;
  status: string;
  createdAt: string;
}

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GetWriterPodcastsParams>({
    status: "",
    category: "",
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPodcasts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching podcasts with filters:", filters);
      const res = await getWriterPodcasts(filters);
      console.log("API response:", res);
      setPodcasts(res.data || []);
      if (res.pagination) {
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load podcasts");
      toast.error(err.message || "Failed to load podcasts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, [filters]);

  const handleFilterChange = (key: keyof GetWriterPodcastsParams, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  if (loading && podcasts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 font-sans text-black pt-28 md:pt-40">
        <h2 className="text-5xl font-sans font-bold text-center mb-16 tracking-tight">Podcasts</h2>
        <div className="space-y-16 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="flex flex-col md:flex-row gap-10 items-start pb-16 border-b border-gray-100">
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-6" />
                <div className="h-4 bg-gray-200 rounded w-32 mb-8" />
                <div className="h-12 bg-gray-200 rounded w-40" />
              </div>
              <div className="w-full md:w-[450px] h-[280px] bg-gray-200 rounded-2xl" />
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
        <button
          onClick={fetchPodcasts}
          className="mt-4 px-4 py-2 bg-black text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans text-black pt-28 md:pt-40">
      <Toaster position="bottom-center" />

      <h2 className="text-5xl font-sans font-bold text-center mb-16 tracking-tight">Podcasts</h2>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 mb-10 justify-center">
        <select
          value={filters.status || ""}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="border border-gray-200 rounded-full px-4 py-2 text-sm font-sans bg-white"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <input
          type="text"
          placeholder="Category"
          value={filters.category || ""}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="border border-gray-200 rounded-full px-4 py-2 text-sm font-sans"
        />
        <div className="text-sm text-gray-500 self-center">
          {total} podcast{total !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="space-y-16">
        {podcasts.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-400">No podcasts found.</div>
        )}
        {podcasts.map((podcast) => (
          <div key={podcast._id} className="flex flex-col md:flex-row gap-10 items-start pb-16 border-b border-gray-100 last:border-0">
            <div className="flex-1 order-2 md:order-1">
              <h3 className="text-3xl font-sans font-bold mb-4">{podcast.title}</h3>
              <p className="text-black text-base font-serif leading-relaxed mb-6 max-w-2xl">
                {podcast.summary}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium mb-8 text-black/80">
                <span>{podcast.audioDuration} min</span>
                <span>•</span>
                <span>{formatDate(podcast.createdAt)}</span>
                {podcast.status === "draft" && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Draft</span>
                )}
                {podcast.isPremium && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Premium</span>
                )}
              </div>

              <Link href={`/writer/podcast/${podcast._id}`}>
                <button
                  style={{
                    background: "linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)",
                  }}
                  className="flex items-center gap-3 px-8 py-4 rounded-xl text-white hover:opacity-90 transition-all shadow-lg active:scale-95"
                >
                  <div className="bg-white/20 rounded-full p-1">
                    <Play className="w-4 h-4 fill-white text-white" />
                  </div>
                  <span className="font-serif text-lg tracking-wide">View Details</span>
                </button>
              </Link>
            </div>

            <div className="w-full md:w-[450px] order-1 md:order-2 relative group">
              <div className="aspect-[16/10] rounded-[2rem] overflow-hidden shadow-sm">
                <img
                  src={podcast.coverImage}
                  alt={podcast.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800";
                  }}
                />
              </div>
              <div className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-md">
                <Headphones className="w-5 h-5 text-black" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-12">
          <button
            onClick={() => handleFilterChange("page", (filters.page || 1) - 1)}
            disabled={filters.page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {filters.page} of {totalPages}
          </span>
          <button
            onClick={() => handleFilterChange("page", (filters.page || 1) + 1)}
            disabled={filters.page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Podcasts;