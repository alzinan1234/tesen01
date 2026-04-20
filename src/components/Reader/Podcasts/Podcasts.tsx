"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Headset, Lock } from "lucide-react";
import { fetchAllPodcasts, Podcast } from "@/components/podcastApiClient";

// ── Skeleton Card (matches your design) ────────────────────
const SkeletonCard = () => (
  <div className="flex flex-col md:flex-row gap-10 items-center border-b border-gray-50 pb-16 animate-pulse">
    <div className="flex-1 order-2 md:order-1">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="flex flex-col gap-1">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-3" />
      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
      <div className="h-4 w-5/6 bg-gray-200 rounded mb-8" />
      <div className="flex flex-col gap-3 max-w-md">
        <div className="h-10 w-full bg-gray-200 rounded-lg" />
        <div className="h-10 w-full bg-gray-200 rounded-lg" />
      </div>
    </div>
    <div className="w-full md:w-[400px] h-[250px] rounded-2xl bg-gray-200 order-1 md:order-2" />
  </div>
);

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAllPodcasts({ page, limit: 10 });
        if (!cancelled && res.success) {
          if (page === 1) setPodcasts(res.data);
          else setPodcasts(prev => [...prev, ...res.data]);
          setHasMore(page < res.pagination.totalPages);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load podcasts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white min-h-screen pt-28 md:pt-64 pb-10">
      <div className="max-w-4xl mx-auto text-center mb-12 px-4">
        <h1 className="text-6xl font-sans text-gray-900 mb-4 font-extrabold tracking-wide">Podcasts</h1>
        <p className="text-gray-600 font-serif text-sm max-w-2xl mx-auto tracking-wide">
          Access every OPED podcast, from politics and culture to bold opinions and real stories.
        </p>
        <div className="h-[1px] bg-gray-100 w-full mt-8"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-16">
        {loading && page === 1
          ? Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
          : podcasts.length === 0 && !loading ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg font-serif">No podcasts found at the moment.</p>
              </div>
            ) : (
              podcasts.map((podcast) => (
                <div key={podcast._id} className="flex flex-col md:flex-row gap-10 items-center border-b border-gray-50 pb-16">
                  <div className="flex-1 order-2 md:order-1">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        <img
                          src={podcast.author.profileImage || `https://ui-avatars.com/api/?name=${podcast.author.name}&background=random`}
                          alt="author"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold font-sans text-gray-900 tracking-wide">
                          {podcast.author.name}
                        </span>
                        <span className="text-xs font-serif text-gray-400 tracking-wide">
                          {formatDate(podcast.createdAt)}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-2xl font-sans font-extrabold text-gray-900 mb-3 tracking-wide">
                      {podcast.title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8 font-serif tracking-wide">
                      {podcast.summary}
                    </p>

                    <div className="flex flex-col gap-3 max-w-md">
                      <Link href={`/reader/podcasts/${podcast._id}`}>
                        <button
                          style={{ background: 'linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)' }}
                          className="w-full py-3 text-white rounded-lg font-sans font-bold text-sm shadow-lg hover:opacity-90 transition-all tracking-wide"
                        >
                          Start Listening
                        </button>
                      </Link>
                      <Link href={`/reader/podcasts/${podcast._id}`} className="w-full">
                        <button className="w-full py-3 border border-[#3448D6] text-[#3448D6] rounded-lg font-sans font-bold text-sm hover:bg-blue-50 transition-all tracking-wide">
                          All Episodes
                        </button>
                      </Link>
                    </div>
                  </div>

                  <div className="w-full md:w-[400px] h-[250px] rounded-2xl overflow-hidden relative shadow-xl order-1 md:order-2">
                    <img
                      src={podcast.coverImage}
                      className="w-full h-full object-cover"
                      alt={podcast.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=400";
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md">
                      <Headset size={20} className="text-gray-700" />
                    </div>
                    {podcast.isPremium && (
                      <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        <Lock size={10} />
                        Premium
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
      </div>

      {!loading && hasMore && podcasts.length > 0 && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-10 py-3 bg-black text-white rounded-xl font-sans font-bold text-sm hover:bg-gray-800 transition-all tracking-wide"
          >
            Next Page
          </button>
        </div>
      )}

      {error && <p className="text-center text-red-500 mt-10">{error}</p>}
    </div>
  );
};

export default Podcasts;