"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, MessageSquare, Share2, ArrowUpRight, Bookmark, BookmarkCheck, Crown, X } from "lucide-react";
import { useRouter } from "next/navigation";
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

// Premium Modal Component
interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onSubscribe }) => {
  return (
    <div>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
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
          </div>
        </div>
      )}
    </div>
  );
};

const Newsome = ({ storyId, storySlug }: NewsomeProps) => {
  const router = useRouter();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiTimeout, setApiTimeout] = useState(false);
  
  // Premium modal state
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [pendingStory, setPendingStory] = useState<any>(null);
  
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

  // Check if story is premium
  const isStoryPremium = story?.isPremium === true;

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
        // If specific story ID is provided and valid
        if (storyId && /^[0-9a-fA-F]{24}$/.test(storyId)) {
          try {
            const detailResponse = await fetchStoryDetail(storyId);
            if (isMounted) {
              if (detailResponse.success && detailResponse.data) {
                // Check if premium - show modal instead of loading content
                if (detailResponse.data.isPremium === true) {
                  setPendingStory(detailResponse.data);
                  setShowPremiumModal(true);
                  setLoading(false);
                  clearTimeout(timeoutId);
                  return;
                }
                setStory(detailResponse.data);
              } else if (detailResponse.subscriptionRequired) {
                setShowPremiumModal(true);
                setLoading(false);
                clearTimeout(timeoutId);
                return;
              }
            }
          } catch (err) {
            console.error("Failed to fetch specific story:", err);
          }
        }
        
        // If no story found or no storyId, fetch from list
        if (!story && isMounted) {
          const response = await fetchStories({ page: 1, limit: 5 });
          
          if (!isMounted) return;
          
          if (response.success && response.data && response.data.length > 0) {
            const firstStory = response.data[0];
            // Check if first story is premium
            if (firstStory.isPremium === true) {
              setPendingStory(firstStory);
              setShowPremiumModal(true);
              setLoading(false);
              clearTimeout(timeoutId);
              return;
            }
            setStory(firstStory);
          } else {
            setStory(FALLBACK_STORY);
          }
        }
        setLoading(false);
        clearTimeout(timeoutId);
      } catch (err) {
        console.error("Error loading stories:", err);
        if (isMounted) {
          setStory(FALLBACK_STORY);
          setError(null);
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
      if (!story?._id || story?._id === FALLBACK_STORY._id || isStoryPremium) return;
      
      try {
        const response = await getMyReaction("story", story._id);
        if (response.success && response.data) {
          setReactionSummary(response.data.summary);
          setMyReaction(response.data.myReaction || null);
        }
      } catch (err) {
        console.error("Failed to load reactions:", err);
      }
    };

    if (story?._id && !isStoryPremium) {
      loadReactions();
    }
  }, [story?._id, isStoryPremium]);

  // Fetch comments count (non-blocking)
  useEffect(() => {
    const loadComments = async () => {
      if (!story?._id || story?._id === FALLBACK_STORY._id || isStoryPremium) return;
      
      try {
        const response = await getComments("story", story._id, 1, 1);
        if (response.success) {
          setCommentCount(response.pagination.total);
        }
      } catch (err) {
        console.error("Failed to load comments:", err);
      }
    };

    if (story?._id && !isStoryPremium) {
      loadComments();
    }
  }, [story?._id, isStoryPremium]);

  // Check if story is saved (non-blocking)
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!story?._id || story?._id === FALLBACK_STORY._id || isStoryPremium) return;
      
      try {
        const response = await checkSaved(story._id, "saved");
        if (response.success) {
          setIsSaved(response.data.isSaved);
        }
      } catch (err) {
        console.error("Failed to check saved status:", err);
      }
    };

    if (story?._id && !isStoryPremium) {
      checkIfSaved();
    }
  }, [story?._id, isStoryPremium]);

  // Handle reaction click
  const handleReaction = async (type: ReactionType) => {
    if (!story?._id || story?._id === FALLBACK_STORY._id || reactionLoading || isStoryPremium) return;
    
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

  // Handle read more click
  const handleReadMore = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isStoryPremium) {
      setPendingStory(story);
      setShowPremiumModal(true);
    } else if (story?._id) {
      router.push(`/reader/story/${story._id}`);
    }
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!story?._id || story?._id === FALLBACK_STORY._id || isStoryPremium) {
      alert("Please login to comment");
      return;
    }
  };

  // Handle save/unsave
  const handleToggleSave = async () => {
    if (!story?._id || story?._id === FALLBACK_STORY._id || savingLoading || isStoryPremium) {
      alert("Please login to save stories");
      return;
    }
    
    setSavingLoading(true);
    try {
      const response = await toggleSave("story", story._id, "saved");
      if (response.success) {
        setIsSaved(response.data.isSaved);
        toast.success(response.data.isSaved ? "Story saved!" : "Removed from saved.");
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

  // Premium modal handlers
  const handleSubscribeRedirect = () => {
    setShowPremiumModal(false);
    router.push("/reader/subscribe");
  };

  const handleModalClose = () => {
    setShowPremiumModal(false);
    setPendingStory(null);
    // If no story loaded, use fallback
    if (!story) {
      setStory(FALLBACK_STORY);
    }
  };

  // Format large numbers
  const formatNumber = (num?: number): string => {
    if (typeof num !== "number" || isNaN(num)) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  // Simple toast function (since no toast import)
  const toast = {
    success: (msg: string) => {
      console.log(msg);
      alert(msg);
    }
  };

  // Show loading with timeout indicator
  if (loading && !apiTimeout && !showPremiumModal) {
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

  // Show premium modal if needed
  if (showPremiumModal) {
    return (
      <>
        <section className="relative w-full min-h-[500px] flex items-center justify-center bg-black">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B55E6] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </section>
        <PremiumModal
          isOpen={showPremiumModal}
          onClose={handleModalClose}
          onSubscribe={handleSubscribeRedirect}
        />
      </>
    );
  }

  // Always show story (either from API or fallback)
  const displayStory = story || FALLBACK_STORY;

  return (
    <>
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={handleModalClose}
        onSubscribe={handleSubscribeRedirect}
      />
      
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
                {isStoryPremium && (
                  <span className="inline-block ml-2 text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">Premium</span>
                )}
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
            <button
              onClick={handleReadMore}
              className="flex items-center gap-1 text-[#3B55E6] text-[16px] font-sans font-medium mb-10 hover:text-blue-400 transition-colors"
            >
              Read More
              <ArrowUpRight size={16} />
            </button>

            {/* Stats Bar */}
            <div className="flex items-center gap-10 text-white pt-6 border-t border-white/10 w-full justify-center">
              {/* Reactions section */}
              <div>
                <button
                  onClick={() => handleReaction("like")}
                  className={`flex items-center gap-2 cursor-pointer transition-colors ${
                    myReaction === "like" ? "text-[#3B55E6]" : "hover:text-white"
                  } ${isStoryPremium ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={reactionLoading || isStoryPremium}
                >
                  <ThumbsUp size={16} strokeWidth={1.5} />
                  <span className="text-[13px] font-sans">{formatNumber(reactionSummary.like)}</span>
                </button>
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
                disabled={savingLoading || isStoryPremium}
                className={`flex items-center gap-2 cursor-pointer transition-colors ${isStoryPremium ? "opacity-50 cursor-not-allowed" : "hover:text-white"}`}
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
    </>
  );
};

export default Newsome;