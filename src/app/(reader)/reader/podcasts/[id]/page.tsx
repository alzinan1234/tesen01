"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Play, Pause, RotateCcw, RotateCw, Bookmark, ThumbsUp, MessageSquare, Share2, ArrowUpRight, Lock } from "lucide-react";
import Link from "next/link";
import { fetchPodcastDetail, fetchAllPodcasts, Podcast } from "@/components/podcastApiClient";

const OpedRadyo = () => {
  const params = useParams();
  const podcastId = params?.id as string;

  // State for current podcast detail
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPremiumLocked, setIsPremiumLocked] = useState(false);

  // State for all podcasts (episode list)
  const [allPodcasts, setAllPodcasts] = useState<Podcast[]>([]);
  const [allLoading, setAllLoading] = useState(true);

  // Audio player states
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Fetch current podcast detail
  useEffect(() => {
    let cancelled = false;
    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchPodcastDetail(podcastId);
        if (!cancelled) {
          if (res.success && res.data) {
            setPodcast(res.data);
            setIsPremiumLocked(false);
          } else if (res.subscriptionRequired) {
            setIsPremiumLocked(true);
            setError(res.message || "Subscribe to listen to premium content");
          } else {
            setError(res.message || "Failed to load podcast");
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (podcastId) loadDetail();
    return () => { cancelled = true; };
  }, [podcastId]);

  // Fetch all podcasts for episode list
  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      setAllLoading(true);
      try {
        const res = await fetchAllPodcasts({ limit: 50 });
        if (!cancelled && res.success) {
          setAllPodcasts(res.data);
        }
      } catch (err) {
        console.error("Failed to load episode list", err);
      } finally {
        if (!cancelled) setAllLoading(false);
      }
    };
    loadAll();
    return () => { cancelled = true; };
  }, []);

  // Audio play/pause sync
  useEffect(() => {
    if (audioRef.current && !isPremiumLocked && podcast?.audioFile) {
      if (isPlaying) audioRef.current.play();
      else audioRef.current.pause();
    }
  }, [isPlaying, podcast, isPremiumLocked]);

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleTrackChange = (newPodcast: Podcast) => {
    if (newPodcast._id === podcast?._id) return;
    window.location.href = `/reader/podcasts/${newPodcast._id}`;
  };

  // Loading skeleton for main player
  if (loading) {
    return (
      <div className="bg-white min-h-screen pt-28 md:pt-64 pb-20 text-black flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading podcast...</div>
      </div>
    );
  }

  // Premium locked view
  if (isPremiumLocked) {
    return (
      <div className="bg-white min-h-screen pt-28 md:pt-64 pb-20 text-black">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h1 className="text-5xl font-sans font-extrabold mb-4 text-black tracking-wide">Oped Radyo</h1>
          <p className="text-gray-500 font-serif text-sm px-4 tracking-wide">
            OPED's editors present interviews, profiles, and in-depth conversations.
          </p>
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <div className="border border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center bg-white shadow-sm text-center py-20">
            <Lock size={48} className="text-gray-400 mb-4" />
            <h2 className="text-2xl font-sans font-bold mb-2">Premium Content</h2>
            <p className="text-gray-500 mb-6">Subscribe to listen to this podcast episode.</p>
            <Link href="/reader/subscribe">
              <button className="px-6 py-2 bg-black text-white rounded-full font-sans text-sm">
                Subscribe Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !podcast) {
    return (
      <div className="bg-white min-h-screen pt-28 md:pt-64 pb-20 text-black flex items-center justify-center">
        <p className="text-red-500">{error || "Podcast not found"}</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-28 md:pt-64 pb-20 text-black">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={podcast.audioFile} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onTimeUpdate} />

      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-sans font-extrabold mb-4 text-black tracking-wide">Oped Radyo</h1>
        <p className="text-gray-500 font-serif text-sm px-4 tracking-wide">
          OPED's editors present interviews, profiles, and in-depth conversations, produced in collaboration with our podcast team.
        </p>
      </div>

      {/* Main Player Box */}
      <div className="max-w-6xl mx-auto px-4 mb-20">
        <div className="border border-gray-200 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center bg-white shadow-sm">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-4">
              <img
                src={podcast.author.profileImage || `https://ui-avatars.com/api/?name=${podcast.author.name}&background=random`}
                className="w-8 h-8 rounded-full object-cover"
                alt={podcast.author.name}
              />
              <div className="text-xs">
                <p className="font-bold text-black tracking-wide">{podcast.author.name}</p>
                <p className="text-gray-400 tracking-wide">{new Date(podcast.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs mb-1 font-serif tracking-wide">{podcast.category}</p>
            <h2 className="text-xl font-sans font-extrabold mb-2 text-black tracking-wide">{podcast.title}</h2>
            <p className="text-gray-400 text-xs mb-6 font-serif tracking-wide">
              {podcast.audioDuration} min • {new Date(podcast.createdAt).toLocaleDateString()}
            </p>

            {/* Progress Bar */}
            <div
              className="w-full bg-gray-100 h-1 rounded-full mb-2 relative cursor-pointer"
              onClick={(e) => {
                if (!audioRef.current) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                audioRef.current.currentTime = percent * duration;
              }}
            >
              <div
                className="absolute left-0 top-0 bg-black h-full rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full shadow-md"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-end text-[10px] text-gray-400 mb-6 font-sans tracking-wide">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-8">
              <RotateCcw size={20} className="text-gray-600 cursor-pointer" onClick={() => audioRef.current && (audioRef.current.currentTime -= 10)} />
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 bg-white border border-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all"
              >
                {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
              </button>
              <RotateCw size={20} className="text-gray-600 cursor-pointer" onClick={() => audioRef.current && (audioRef.current.currentTime += 10)} />
            </div>
          </div>
          <div className="w-full md:w-[350px] h-[220px] rounded-2xl overflow-hidden shadow-lg relative">
            <img src={podcast.coverImage} className="w-full h-full object-cover" alt={podcast.title} />
            {podcast.isPremium && (
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                <Lock size={10} />
                Premium
              </div>
            )}
          </div>
        </div>

        {/* Episode List Section */}
        <div className="mt-8 border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex justify-between items-center px-6">
            <span className="font-sans font-bold text-sm text-black uppercase tracking-wider">All Podcast</span>
            <span className="text-xs text-gray-400 tracking-wide">{allPodcasts.length} Episodes</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {allLoading ? (
              <div className="p-4 text-center text-gray-400">Loading episodes...</div>
            ) : (
              allPodcasts.map((ep) => (
                <div
                  key={ep._id}
                  onClick={() => handleTrackChange(ep)}
                  className="p-5 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50 cursor-pointer group px-8"
                >
                  <div>
                    <h4
                      className={`text-sm font-sans font-bold transition-colors tracking-wide ${
                        podcast._id === ep._id ? "text-blue-600" : "text-black group-hover:text-blue-600"
                      }`}
                    >
                      {ep.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1 font-serif tracking-wide">
                      {new Date(ep.createdAt).toLocaleDateString()} | {ep.audioDuration} min
                    </p>
                  </div>
                  {podcast._id === ep._id && isPlaying ? <Pause size={20} /> : <Play size={20} className="text-gray-800" />}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* All Episodes Bottom Section (Static cards – replaced with dynamic) */}
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-5xl font-sans text-center font-extrabold mb-9 text-black border-b border-t py-3 border-gray-100 tracking-wide">
          All Episodes
        </h3>
        <div className="space-y-12">
          {allPodcasts.map((ep) => (
            <div key={ep._id} className="flex flex-col md:flex-row gap-10 items-start border-b border-gray-50 pb-12">
              <div className="flex-1">
                <h4 className="text-xl font-sans font-extrabold mb-3 text-black tracking-wide">{ep.title}</h4>
                <p className="text-gray-500 text-sm font-serif leading-relaxed mb-4 tracking-wide">{ep.summary}</p>
                <Link href={`/reader/podcasts/${ep._id}`}>
                  <button className="text-blue-600 text-xs font-bold flex items-center gap-1 font-sans mb-6 tracking-wide">
                    Read More <ArrowUpRight size={14} />
                  </button>
                </Link>
                <div className="flex gap-6 text-gray-500 font-sans tracking-wide">
                  <span className="flex items-center gap-1 text-xs cursor-pointer hover:text-blue-600">
                    <ThumbsUp size={16} /> —
                  </span>
                  <span className="flex items-center gap-1 text-xs cursor-pointer hover:text-blue-600">
                    <MessageSquare size={16} /> —
                  </span>
                  <span className="flex items-center gap-1 text-xs cursor-pointer hover:text-blue-600">
                    <Share2 size={16} /> —
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-4 font-sans tracking-wide">
                  {new Date(ep.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="w-full md:w-[280px] h-[180px] rounded-2xl overflow-hidden relative group shadow-md">
                <img
                  src={ep.coverImage}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={ep.title}
                />
                <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow-md text-black hover:bg-blue-600 hover:text-white transition-all">
                  <Bookmark size={16} />
                </button>
                {ep.isPremium && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    <Lock size={10} />
                    Premium
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OpedRadyo;