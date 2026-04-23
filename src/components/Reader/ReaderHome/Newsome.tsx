"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, MessageSquare, Share2, ArrowUpRight, Bookmark, BookmarkCheck } from "lucide-react";
import { fetchStoryDetail, StoryDetailResponse, fetchStories } from "@/components/storyApiClient";
import { 
  getMyReaction, 
  addReaction, 
  getComments, 
  addComment,
  likeComment,
  checkSaved,
  toggleSave,
  ReactionType,
  Comment
} from "@/components/socialApiClient";

interface NewsomeProps {
  storyId?: string;
  storySlug?: string;
}

// Fallback story data in case API fails completely
const FALLBACK_STORY = {
  _id: "fallback-1",
  title: "Gavin Newsom Is Playing the Long Game",
  summary: "As technology evolves and reader habits shift, independent platforms are redefining how stories are told, shared, and trusted the world.",
  coverImage: "/newsome.png",
  category: "Politics",
  isPremium: false,
  author: {
    _id: "author-1",
    name: "Editorial Team",
    profileImage: ""
  },
  readingTime: 5,
  createdAt: new Date().toISOString()
};

const Newsome = ({ storyId, storySlug }: NewsomeProps) => {
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiTimeout, setApiTimeout] = useState(false);
  
  // Reaction states
  const [reactionSummary, setReactionSummary] = useState({
    like: 9000000,
    love: 0,
    wow: 0,
    sad: 0,
    angry: 0,
    total: 9000000
  });
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
  const [reactionLoading, setReactionLoading] = useState(false);
  
  // Comments states
  const [commentCount, setCommentCount] = useState(45000);
  
  // Library states
  const [isSaved, setIsSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);
  
  // Share state
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  // Main story loading with timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const loadStory = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);
      setApiTimeout(false);
      
      // Set timeout to show fallback after 5 seconds
      timeoutId = setTimeout(() => {
        if (isMounted && loading) {
          console.log("API timeout, using fallback data");
          setApiTimeout(true);
          setStory(FALLBACK_STORY);
          setLoading(false);
        }
      }, 5000);

      try {
        // Try to fetch real stories first
        const response = await fetchStories({ page: 1, limit: 5 });
        
        if (!isMounted) return;
        
        if (response.success && response.data && response.data.length > 0) {
          // If specific story ID is requested, try to find it
          if (storyId && /^[0-9a-fA-F]{24}$/.test(storyId)) {
            try {
              const detailResponse = await fetchStoryDetail(storyId);
              if (detailResponse.success && detailResponse.data) {
                setStory(detailResponse.data);
                setLoading(false);
                clearTimeout(timeoutId);
                return;
              }
            } catch (err) {
              console.error("Failed to fetch specific story:", err);
            }
          }
          
          // Otherwise use first story from list
          setStory(response.data[0]);
          setLoading(false);
          clearTimeout(timeoutId);
        } else {
          // No stories from API, use fallback
          setStory(FALLBACK_STORY);
          setLoading(false);
          clearTimeout(timeoutId);
        }
      } catch (err) {
        console.error("Error loading stories:", err);
        if (isMounted) {
          // Use fallback data on error
          setStory(FALLBACK_STORY);
          setError(null); // Clear error to show content
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    loadStory();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [storyId, storySlug]);

  // Fetch reactions (non-blocking)
  useEffect(() => {
    const loadReactions = async () => {
      if (!story?._id || story?._id === FALLBACK_STORY._id) return;
      
      try {
        const response = await getMyReaction("story", story._id);
        if (response.success && response.data) {
          setReactionSummary(response.data.summary);
          setMyReaction(response.data.myReaction || null);
        }
      } catch (err) {
        console.error("Failed to load reactions:", err);
        // Keep default values, don't show error
      }
    };

    if (story?._id) {
      loadReactions();
    }
  }, [story?._id]);

  // Fetch comments count (non-blocking)
  useEffect(() => {
    const loadComments = async () => {
      if (!story?._id || story?._id === FALLBACK_STORY._id) return;
      
      try {
        const response = await getComments("story", story._id, 1, 1);
        if (response.success) {
          setCommentCount(response.pagination.total);
        }
      } catch (err) {
        console.error("Failed to load comments:", err);
        // Keep default value
      }
    };

    if (story?._id) {
      loadComments();
    }
  }, [story?._id]);

  // Check if story is saved (non-blocking)
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!story?._id || story?._id === FALLBACK_STORY._id) return;
      
      try {
        const response = await checkSaved(story._id, "saved");
        if (response.success) {
          setIsSaved(response.data.isSaved);
        }
      } catch (err) {
        console.error("Failed to check saved status:", err);
      }
    };

    if (story?._id) {
      checkIfSaved();
    }
  }, [story?._id]);

  // Handle reaction click
  const handleReaction = async (type: ReactionType) => {
    if (!story?._id || story?._id === FALLBACK_STORY._id || reactionLoading) return;
    
    setReactionLoading(true);
    try {
      const response = await addReaction("story", story._id, type);
      if (response.success) {
        setReactionSummary(response.data);
        if (myReaction === type) {
          setMyReaction(null);
        } else {
          setMyReaction(type);
        }
      }
    } catch (err) {
      console.error("Failed to add reaction:", err);
    } finally {
      setReactionLoading(false);
    }
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!story?._id || story?._id === FALLBACK_STORY._id) {
      alert("Please login to comment");
      return;
    }
    // Implement comment modal or redirect to login
  };

  // Handle save/unsave
  const handleToggleSave = async () => {
    if (!story?._id || story?._id === FALLBACK_STORY._id || savingLoading) {
      alert("Please login to save stories");
      return;
    }
    
    setSavingLoading(true);
    try {
      const response = await toggleSave("story", story._id, "saved");
      if (response.success) {
        setIsSaved(response.data.isSaved);
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
    } finally {
      setSavingLoading(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = story?.title || "Check out this story";
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: story?.title || "Story",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share cancelled or failed");
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  // Show loading with timeout indicator
  if (loading && !apiTimeout) {
    return (
      <section className="relative w-full min-h-[500px] flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B55E6] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading story...</p>
          <p className="text-gray-500 text-xs mt-2">This may take a moment</p>
        </div>
      </section>
    );
  }

  // Always show story (either from API or fallback)
  const displayStory = story || FALLBACK_STORY;

  return (
    <section className="relative w-full min-h-[500px] flex flex-col md:flex-row bg-black overflow-hidden">

      {/* LEFT CONTENT - Editorial Text Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-black text-white px-8 sm:px-12 lg:px-20 py-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[480px] text-center flex flex-col items-center"
        >
          {/* Category Badge */}
          {displayStory.category && (
            <span className="text-[#3B55E6] text-xs uppercase tracking-wider font-sans mb-3">
              {displayStory.category}
            </span>
          )}

          {/* Main Headline */}
          <h1 className="text-white text-[38px] md:text-[48px] lg:text-[52px] leading-[1.15] mb-6 tracking-tight font-sans">
            {displayStory.title}
          </h1>

          {/* Author Info */}
          {displayStory.author && (
            <div className="flex items-center gap-3 mb-4">
              {displayStory.author.profileImage && (
                <img 
                  src={displayStory.author.profileImage} 
                  alt={displayStory.author.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <span className="text-gray-400 text-sm">By {displayStory.author.name}</span>
            </div>
          )}

          {/* Subtext / Summary */}
          <p className="text-gray-400 text-[14px] md:text-[15px] font-serif leading-relaxed mb-6 max-w-[400px]">
            {displayStory.summary}
          </p>

          {/* Reading Time */}
          {displayStory.readingTime && (
            <p className="text-gray-500 text-xs mb-4">
              {displayStory.readingTime} min read
            </p>
          )}

          {/* Read More Link */}
          <motion.a
            href={`/story/${displayStory._id}`}
            whileHover={{ x: 4 }}
            className="flex items-center gap-1 text-[#3B55E6] text-[16px] font-sans font-medium mb-10 hover:text-blue-400 transition-colors"
          >
            Read More
            <ArrowUpRight size={16} />
          </motion.a>

          {/* Stats Bar */}
          <div className="flex items-center gap-10 text-white pt-6 border-t border-white/10 w-full justify-center">
            {/* Reactions section */}
            <div className="relative group">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleReaction("like")}
                  className={`flex items-center gap-2 cursor-pointer transition-colors ${
                    myReaction === "like" ? "text-[#3B55E6]" : "hover:text-white"
                  }`}
                  disabled={reactionLoading}
                >
                  <ThumbsUp size={16} strokeWidth={1.5} />
                  <span className="text-[13px] font-sans">{formatNumber(reactionSummary.like)}</span>
                </button>
                {/* Reactions dropdown */}
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex bg-white rounded-lg shadow-lg p-2 gap-2 z-20">
                  {(["like", "love", "wow", "sad", "angry"] as ReactionType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleReaction(type)}
                      className={`px-2 py-1 text-xs rounded capitalize ${
                        myReaction === type ? "bg-[#3B55E6] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Comments */}
            <button
              onClick={handleSubmitComment}
              className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
            >
              <MessageSquare size={16} strokeWidth={1.5} />
              <span className="text-[13px] font-sans">{formatNumber(commentCount)}</span>
            </button>

            {/* Share */}
            <div className="relative">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
              >
                <Share2 size={16} strokeWidth={1.5} />
                <span className="text-[13px] font-sans">Share</span>
              </button>
              {showShareTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-30">
                  Link copied!
                </div>
              )}
            </div>

            {/* Save/Bookmark */}
            <button
              onClick={handleToggleSave}
              disabled={savingLoading}
              className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
            >
              {isSaved ? (
                <BookmarkCheck size={16} strokeWidth={1.5} className="text-[#3B55E6]" />
              ) : (
                <Bookmark size={16} strokeWidth={1.5} />
              )}
              <span className="text-[13px] font-sans">{isSaved ? "Saved" : "Save"}</span>
            </button>
          </div>

          {/* API timeout notice (only shown when using fallback) */}
          {apiTimeout && (
            <div className="mt-4 text-xs text-gray-500">
              <span>Using cached content</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* RIGHT CONTENT - Red Tinted Portrait */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-black py-10 md:py-0">
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="relative"
          style={{ width: 303, height: 405 }}
        >
          <img
            src={displayStory.coverImage || "/newsone.png"}
            alt={displayStory.title}
            className="w-full h-full object-cover block"
            style={{ display: "block" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/newsone.png";
            }}
          />

          {/* Red color overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "#C0170B",
              mixBlendMode: "multiply",
              opacity: 1,
            }}
          />

          {/* Extra red hue overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(180,20,10,0.55) 0%, rgba(220,60,20,0.35) 100%)",
              mixBlendMode: "screen",
              opacity: 0.4,
            }}
          />

          {/* Left fade */}
          <div
            className="absolute inset-y-0 left-0 w-16"
            style={{
              background: "linear-gradient(to right, #000000 0%, transparent 100%)",
            }}
          />

          {/* Bottom fade */}
          <div
            className="absolute inset-x-0 bottom-0 h-16"
            style={{
              background: "linear-gradient(to top, #000000 0%, transparent 100%)",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Newsome;