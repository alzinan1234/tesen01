"use client";

import React, { useEffect, useState, useRef } from "react";
import { Headphones, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { fetchAllPodcasts, Podcast } from "@/components/podcastApiClient";

// ── Skeleton Card (matches your exact design) ─────────────────
const SkeletonCard = () => (
  <div className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_45%] lg:flex-[0_0_31%] px-3">
    <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 h-full flex flex-col animate-pulse">
      <div className="flex gap-4 mb-6">
        <div className="w-24 h-24 shrink-0 rounded-xl bg-gray-200" />
        <div className="flex flex-col justify-center gap-2 flex-1">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="h-px bg-gray-100 w-full mb-4" />
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>
    </div>
  </div>
);

// ── Format helpers ────────────────────────────────────────────
const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ── Podcast Card Component (UI untouched, now with audio) ────────
interface PodcastCardProps {
  podcast: Podcast;
  isPlaying: boolean;
  onPlay: (podcastId: string, audioUrl: string) => void;
  onPause: () => void;
}

const PodcastCard: React.FC<PodcastCardProps> = ({ podcast, isPlaying, onPlay, onPause }) => {
  const handlePlayClick = () => {
    if (isPlaying) {
      onPause();
    } else {
      // The podcast must have an audioUrl field – adjust if your API uses a different name
      const audioUrl = (podcast as any).audioUrl || (podcast as any).audio_url;
      if (!audioUrl) {
        console.warn("No audio URL for podcast:", podcast._id);
        return;
      }
      onPlay(podcast._id, audioUrl);
    }
  };

  return (
    <div className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_45%] lg:flex-[0_0_31%] px-3">
      <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 h-full flex flex-col">
        <div className="flex gap-4 mb-6">
          {/* Thumbnail with Overlay Icon */}
          <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-blue-900">
            <img
              src={podcast.coverImage}
              alt={podcast.title}
              className="w-full h-full object-cover opacity-80"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=400";
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 rounded-full p-1.5 shadow-sm">
                <Headphones size={16} className="text-black" />
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="flex flex-col justify-center">
            <span className="text-[11px] uppercase font-serif tracking-wider text-black font-medium mb-1">
              {podcast.category}
            </span>
            <h3 className="text-sm font-sans font-bold leading-snug text-gray-900 line-clamp-3">
              {podcast.title}
            </h3>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 w-full mb-4" />

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div className="text-[11px] text-black font-serif font-medium">
            {podcast.audioDuration} min • {formatDate(podcast.createdAt)}
          </div>
          <button
            onClick={handlePlayClick}
            className="hover:scale-110 transition-transform border border-gray-300 rounded-full p-2 bg-gray-100"
          >
            {isPlaying ? (
              <Pause size={20} className="text-black" fill="black" />
            ) : (
              <Play size={20} fill="black" className="text-black" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const TheOPEDPodcast: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    loop: true,
  });

  const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlay = (podcastId: string, audioUrl: string) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Create new audio element and play
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setPlayingId(podcastId);
    audio.play().catch((err) => console.error("Playback failed:", err));

    // When audio ends, reset playing state
    audio.onended = () => {
      setPlayingId(null);
      audioRef.current = null;
    };
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingId(null);
  };

  // Fetch podcasts
  useEffect(() => {
    let cancelled = false;

    const loadPodcasts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAllPodcasts(1, 10);
        if (!cancelled && res.success) {
          setPodcasts(res.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Failed to load podcasts.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPodcasts();
    return () => {
      cancelled = true;
    };
  }, []);

  const skeletonCount = 5;

  return (
    <section className="bg-white py-16 px-4 overflow-hidden">
      {/* Header Section (unchanged) */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Headphones size={32} className="text-gray-400" />
          <h2 className="text-4xl md:text-5xl font-sans text-black">The OPED Podcast</h2>
        </div>
        <p className="text-black text-lg font-serif">
          Bold opinions, deep analysis, and conversations beyond the headlines.
        </p>
      </div>

      {/* Slider Container */}
      <div className="relative max-w-7xl mx-auto px-10">
        {/* Navigation Buttons */}
        <button
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gray-800/40 hover:bg-gray-800/60 text-white p-2 rounded-full transition-all -translate-x-1/2 md:-translate-x-full"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-3">
            {loading ? (
              Array.from({ length: skeletonCount }).map((_, i) => <SkeletonCard key={i} />)
            ) : error ? (
              <div className="w-full text-center py-10 text-red-500">{error}</div>
            ) : podcasts.length === 0 ? (
              <div className="w-full text-center py-10 text-gray-400">No podcasts found.</div>
            ) : (
              podcasts.map((podcast) => (
                <PodcastCard
                  key={podcast._id}
                  podcast={podcast}
                  isPlaying={playingId === podcast._id}
                  onPlay={handlePlay}
                  onPause={handlePause}
                />
              ))
            )}
          </div>
        </div>

        <button
          onClick={scrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gray-800/40 hover:bg-gray-800/60 text-white p-2 rounded-full transition-all translate-x-1/2 md:translate-x-full"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </section>
  );
};

export default TheOPEDPodcast;