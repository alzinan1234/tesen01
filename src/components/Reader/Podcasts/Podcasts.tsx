"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Headset, Lock, Crown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAllPodcasts, Podcast } from "@/components/podcastApiClient";

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
            <div className="p-6">
              <p className="text-gray-700 text-center mb-8 font-serif leading-relaxed">
                Would you like to subscribe to access all premium content?
              </p>
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
  const router = useRouter();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Premium modal state
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [pendingPodcast, setPendingPodcast] = useState<Podcast | null>(null);

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

  const handlePodcastClick = (podcast: Podcast, e: React.MouseEvent) => {
    e.preventDefault();
    if (podcast.isPremium) {
      setPendingPodcast(podcast);
      setShowPremiumModal(true);
    } else {
      router.push(`/reader/podcasts/${podcast._id}`);
    }
  };

  const handleSubscribeRedirect = () => {
    setShowPremiumModal(false);
    router.push("/reader/subscribe");
  };

  const handleModalClose = () => {
    setShowPremiumModal(false);
    setPendingPodcast(null);
  };

  return (
    <div className="bg-white min-h-screen pt-28 md:pt-64 pb-10">
      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={handleModalClose}
        onSubscribe={handleSubscribeRedirect}
      />

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
                      {podcast.isPremium && (
                        <span className="inline-block ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full align-middle">Premium</span>
                      )}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8 font-serif tracking-wide">
                      {podcast.summary}
                    </p>

                    <div className="flex flex-col gap-3 max-w-md">
                      <div onClick={(e) => handlePodcastClick(podcast, e)} className="cursor-pointer">
                        <button
                          style={{ background: 'linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)' }}
                          className="w-full py-3 text-white rounded-lg font-sans font-bold text-sm shadow-lg hover:opacity-90 transition-all tracking-wide"
                        >
                          Start Listening
                        </button>
                      </div>
                      <div onClick={(e) => handlePodcastClick(podcast, e)} className="cursor-pointer">
                        <button className="w-full py-3 border border-[#3448D6] text-[#3448D6] rounded-lg font-sans font-bold text-sm hover:bg-blue-50 transition-all tracking-wide">
                          All Episodes
                        </button>
                      </div>
                    </div>
                  </div>

                  <div onClick={(e) => handlePodcastClick(podcast, e)} className="cursor-pointer w-full md:w-[400px] h-[250px] rounded-2xl overflow-hidden relative shadow-xl order-1 md:order-2">
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