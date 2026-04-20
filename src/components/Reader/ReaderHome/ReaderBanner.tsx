"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, MessageSquare, Share2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { fetchAllLedeStories, Story } from "@/components/theLedApiClient";
import { getMyReaction, getComments } from "@/components/socialApiClient";

// Helper to format large numbers
const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

const ReaderBanner = () => {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetchAllLedeStories(1, 1);
        if (!cancelled && res.success && res.data.length > 0) {
          const featured = res.data[0];
          setStory(featured);
          const [reactRes, commentRes] = await Promise.allSettled([
            getMyReaction("story", featured._id),
            getComments("story", featured._id, 1, 1),
          ]);
          if (reactRes.status === "fulfilled" && reactRes.value.success) {
            setLikeCount(reactRes.value.data.summary?.like ?? 0);
          }
          if (commentRes.status === "fulfilled" && commentRes.value.success) {
            setCommentCount(commentRes.value.pagination.total);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="relative w-full min-h-[80vh] md:h-screen flex flex-col md:flex-row bg-black font-sans overflow-hidden pt-20 md:pt-24">
        <div className="w-full md:w-1/2 flex items-center justify-center bg-black text-white px-6 py-12 sm:px-12 lg:px-20 relative z-10">
          <div className="max-w-[540px] text-center flex flex-col items-center">
            <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-gray-700 rounded w-full mb-2 animate-pulse" />
            <div className="h-4 bg-gray-700 rounded w-5/6 mb-8 animate-pulse" />
            <div className="h-6 w-24 bg-gray-700 rounded mx-auto mb-8 animate-pulse" />
            <div className="flex gap-10">
              <div className="h-5 w-12 bg-gray-700 rounded animate-pulse" />
              <div className="h-5 w-12 bg-gray-700 rounded animate-pulse" />
              <div className="h-5 w-12 bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 h-[300px] sm:h-[400px] md:h-full relative bg-gray-800 animate-pulse" />
      </section>
    );
  }

  if (!story) return null;

  return (
    <section className="relative w-full min-h-[80vh] md:h-screen flex flex-col md:flex-row bg-black font-sans overflow-hidden pt-20 md:pt-24">
      {/* LEFT CONTENT - Text Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-black text-white px-6 py-12 sm:px-12 lg:px-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[540px] text-center flex flex-col items-center"
        >
          {/* Headline: Uses responsive text sizes that scale down on small screens */}
          <h1 className="editorial-title font-sans text-[32px] sm:text-[42px] md:text-[48px] lg:text-[68px] leading-[1.1] mb-4 md:mb-6">
            {story.title}
          </h1>
          {/* Subtext: Font size scales down for mobile */}
          <p className="text-white/80 text-sm md:text-lg lg:text-xl leading-relaxed mb-6 md:mb-8 font-serif font-light max-w-[440px]">
            {story.summary}
          </p>

          {/* Call to Action */}
          <Link
            href={`/story/${story._id}`}
            className="flex items-center gap-2 text-[#3448D6] font-bold text-base md:text-lg mb-8 md:mb-12 transition-colors hover:text-blue-400"
          >
            Read More
            <ArrowUpRight size={20} />
          </Link>

          {/* Icon Stats Bar: Scales gap for smaller screens */}
          <div className="flex items-center gap-6 sm:gap-10 text-white pt-6 md:pt-8 border-t border-white/10 w-full justify-center">
            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-all">
              <ThumbsUp size={18} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-bold tracking-tighter">
                {formatCount(likeCount)}
              </span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-all">
              <MessageSquare size={18} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-bold tracking-tighter">
                {formatCount(commentCount)}
              </span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-all">
              <Share2 size={18} className="md:w-5 md:h-5" />
             
            </div>
          </div>
        </motion.div>
      </div>

      {/* On mobile, we give this a fixed height so it doesn't disappear, but stays proportional */}
      <div className="w-full md:w-1/2 h-[300px] sm:h-[400px] md:h-full relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full h-full"
        >
          <img
            src={story.coverImage}
            alt={story.title}
            className="w-full h-full object-cover object-center block"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1519681393784-d120267933ba";
            }}
          />
          {/* Visual depth overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-gradient-to-r md:from-black/40" />
        </motion.div>
      </div>
    </section>
  );
};

export default ReaderBanner;