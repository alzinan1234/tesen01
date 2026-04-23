'use client'
import React, { useEffect, useState } from 'react';
import { Headphones, ArrowUpRight } from 'lucide-react';
import { fetchAllPodcasts, fetchPodcastDetail, Podcast } from '@/components//podcastApiClient';
import { addReaction, getMyReaction, checkSaved, toggleSave, ReactionType } from '@/components/socialApiClient';

interface SundanceInParkProps {
  podcastId?: string;
}

// Fallback podcast data (original content)
const FALLBACK_PODCAST = {
  _id: "fallback-1",
  title: "One Last Sundance in Park City",
  summary: "BM Genel Sekreteri Guterres, Maduro operasyonunun emsal teşkil etmesinden endişe ettiğini söyledi. Danimarka Başbakanı, ABD'nin olası",
  coverImage: "./image-m.png",
  audioDuration: 45,
  category: "Culture",
  tags: ["sundance", "film", "festival"],
  isPremium: false,
  author: {
    _id: "author-1",
    name: "Cultural Desk",
    profileImage: ""
  },
  createdAt: new Date().toISOString()
};

const SundanceInPark: React.FC<SundanceInParkProps> = ({ podcastId }) => {
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiTimeout, setApiTimeout] = useState(false);
  
  // Social features states
  const [isSaved, setIsSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);
  const [reactionCount, setReactionCount] = useState(12500);
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
  const [reactionLoading, setReactionLoading] = useState(false);

  // Load podcast
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const loadPodcast = async () => {
      setLoading(true);
      setApiTimeout(false);
      
      // 5-second timeout fallback
      timeoutId = setTimeout(() => {
        if (isMounted && loading) {
          console.log("Podcast API timeout, using fallback");
          setApiTimeout(true);
          setPodcast(FALLBACK_PODCAST);
          setLoading(false);
        }
      }, 5000);

      try {
        let podcastData: Podcast | null = null;
        
        // If specific podcast ID provided
        if (podcastId && /^[0-9a-fA-F]{24}$/.test(podcastId)) {
          try {
            const detailResponse = await fetchPodcastDetail(podcastId);
            if (detailResponse.success && detailResponse.data) {
              podcastData = detailResponse.data;
            }
          } catch (err) {
            console.error("Failed to fetch specific podcast:", err);
          }
        }
        
        // If no podcast found, fetch from list
        if (!podcastData) {
          const listResponse = await fetchAllPodcasts({ page: 1, limit: 5 });
          if (listResponse.success && listResponse.data.length > 0) {
            podcastData = listResponse.data[0];
          }
        }
        
        if (isMounted) {
          if (podcastData) {
            setPodcast(podcastData);
          } else {
            setPodcast(FALLBACK_PODCAST);
          }
          setLoading(false);
          clearTimeout(timeoutId);
        }
      } catch (err) {
        console.error("Error loading podcast:", err);
        if (isMounted) {
          setPodcast(FALLBACK_PODCAST);
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    loadPodcast();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [podcastId]);

  // Load social features
  useEffect(() => {
    const loadSocialFeatures = async () => {
      if (!podcast?._id || podcast._id === FALLBACK_PODCAST._id) return;
      
      try {
        // Load reactions
        const reactionResponse = await getMyReaction("podcast", podcast._id);
        if (reactionResponse.success && reactionResponse.data) {
          setReactionCount(reactionResponse.data.summary.total);
          setMyReaction(reactionResponse.data.myReaction || null);
        }
        
        // Check if saved
        const saveResponse = await checkSaved(podcast._id, "saved");
        if (saveResponse.success) {
          setIsSaved(saveResponse.data.isSaved);
        }
      } catch (err) {
        console.error("Failed to load social features:", err);
      }
    };

    if (podcast?._id) {
      loadSocialFeatures();
    }
  }, [podcast?._id]);

  const handleReaction = async (type: ReactionType) => {
    if (!podcast?._id || podcast._id === FALLBACK_PODCAST._id || reactionLoading) {
      alert("Please login to like");
      return;
    }
    
    setReactionLoading(true);
    try {
      const response = await addReaction("podcast", podcast._id, type);
      if (response.success) {
        setReactionCount(response.data.total);
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

  const handleToggleSave = async () => {
    if (!podcast?._id || podcast._id === FALLBACK_PODCAST._id || savingLoading) {
      alert("Please login to save");
      return;
    }
    
    setSavingLoading(true);
    try {
      const response = await toggleSave("podcast", podcast._id, "saved");
      if (response.success) {
        setIsSaved(response.data.isSaved);
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
    } finally {
      setSavingLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <section className="bg-black text-white min-h-[600px] flex items-center justify-center p-8 md:p-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading podcast...</p>
        </div>
      </section>
    );
  }

  const displayPodcast = podcast || FALLBACK_PODCAST;

  return (
    <section className="bg-black text-white min-h-[600px] flex items-center justify-center p-8 md:p-16">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Content Side - ORIGINAL DESIGN PRESERVED */}
        <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
          <h1 className="text-4xl md:text-5xl font-sans">
            {displayPodcast.title}
          </h1>
          
          <p className="text-gray-400 text-sm md:text-base leading-relaxed font-serif font-light">
            {displayPodcast.summary}
          </p>

          <a 
            href={`/podcast/${displayPodcast._id}`} 
            className="flex items-center gap-1 text-blue-500 font-sans hover:text-blue-400 transition-colors font-medium text-[16px]"
          >
            Read More <ArrowUpRight size={16} />
          </a>

          {/* Listen Button - ORIGINAL DESIGN */}
          <button 
            onClick={() => handleReaction("like")}
            disabled={reactionLoading}
            className="flex items-center gap-3 px-8 py-2.5 border border-gray-500 rounded-full hover:bg-white/10 transition-all group"
          >
            <div className="bg-white rounded-full p-1 group-hover:scale-110 transition-transform">
              <Headphones size={18} className="text-black" />
            </div>
            <span className="text-sm font-medium tracking-wide">
              {myReaction === "like" ? `Liked (${formatNumber(reactionCount)})` : `Listen (${formatNumber(reactionCount)})`}
            </span>
          </button>

          {/* Save Button - Added without breaking design */}
          <button
            onClick={handleToggleSave}
            disabled={savingLoading}
            className="text-gray-500 text-xs hover:text-white transition-colors mt-2"
          >
            {isSaved ? "★ Saved" : "☆ Save"}
          </button>
        </div>

        {/* Right Image Side - ORIGINAL DESIGN PRESERVED */}
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm shadow-2xl">
          <img 
            src={displayPodcast.coverImage || "./image-m.png"} 
            alt={displayPodcast.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "./image-m.png";
            }}
          />
          {/* Subtle overlay to match the painting vibe */}
          <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
          
          {/* Premium Badge (only if premium) */}
          {displayPodcast.isPremium && (
            <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
              Premium
            </div>
          )}
        </div>

        {/* API Timeout Notice */}
        {apiTimeout && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
            Using cached content
          </div>
        )}
      </div>
    </section>
  );
};

export default SundanceInPark;