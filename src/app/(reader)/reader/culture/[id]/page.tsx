"use client";
import React, { useState } from 'react';
import { Bookmark, ThumbsUp, MessageSquare, Share2, Send, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cultureArticles } from '@/components/data/cultureData';

const CultureStory = ({ params }: { params: { id: string } }) => {
  // --- Data Fetch & State ---
  const story = cultureArticles.find(s => s.id === params.id) || cultureArticles[0];
  
  const [likes, setLikes] = useState(story.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState("");

  // --- Functions ---
  const handleLike = () => {
    setIsLiked(!isLiked);
    // Real logic ekhane 9M theke number-e convert kore change kora jabe
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, url: window.location.href });
      } catch (err) { console.log(err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <main className="bg-white min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[80vh] md:h-screen flex flex-col md:flex-row bg-black font-sans overflow-hidden pt-20 md:pt-24">
        <div className="w-full md:w-1/2 flex items-center justify-center bg-black text-white px-6 py-12 sm:px-12 lg:px-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-[540px] text-center flex flex-col items-center"
          >
            <h1 className="editorial-title font-sans text-[32px] sm:text-[42px] md:text-[48px] lg:text-[60px] leading-[1.1] mb-4 md:mb-6">
              {story.title}
            </h1>

            <p className="text-white/80 text-sm md:text-lg lg:text-xl leading-relaxed mb-6 md:mb-8 font-serif font-light max-w-[440px]">
              {story.description}
            </p>

            <motion.a
              href="#content"
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 text-[#3448D6] font-bold text-base md:text-lg mb-8 md:mb-12 transition-colors hover:text-blue-400"
            >
              Read More <ArrowUpRight size={20} />
            </motion.a>

            <div className="flex items-center gap-6 sm:gap-10 text-white pt-6 md:pt-8 border-t border-white/10 w-full justify-center">
              <div 
                onClick={handleLike}
                className={`flex items-center gap-2 cursor-pointer transition-all ${isLiked ? 'text-blue-500' : 'hover:text-gray-300'}`}
              >
                <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} className="md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-bold tracking-tighter">{likes}</span>
              </div>
              <div 
                onClick={() => setShowCommentBox(true)}
                className="flex items-center gap-2 cursor-pointer hover:text-gray-300 transition-all"
              >
                <MessageSquare size={18} className="md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-bold tracking-tighter">{story.comments}</span>
              </div>
              <div 
                onClick={handleShare}
                className="flex items-center gap-2 cursor-pointer hover:text-gray-300 transition-all"
              >
                <Share2 size={18} className="md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-bold tracking-tighter">{story.shares}</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="w-full md:w-1/2 h-[300px] sm:h-[400px] md:h-full relative">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="w-full h-full">
            <img src={story.image} alt="Story visual" className="w-full h-full object-cover object-center block" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-gradient-to-r md:from-black/40" />
          </motion.div>
        </div>
      </section>

      {/* 2. CONTENT SECTION */}
      <section id="content" className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-10">
        <aside className="hidden md:block sticky top-32 h-fit">
          <button 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-3 border rounded-xl transition-all ${isBookmarked ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
          >
            <Bookmark size={24} className={isBookmarked ? "text-blue-600 fill-blue-600" : "text-gray-400"} />
          </button>
        </aside>

        <div className="flex-1">
          <div className="prose prose-lg text-black leading-loose">
            <p className="mb-6 font-extrabold text-2xl leading-relaxed font-sans">
              I didn't want a regular job, so my friend and I decided to start a business selling digital products...
            </p>
            <p className="mb-6 font-serif text-lg leading-relaxed text-gray-800">
              The journey wasn't easy. Eventually, we found a product to sell. My friend handled Facebook ads, and I created the ad designs in Canva. 
              We started investing Rs. 800 each day in ads. I know it's not much, but that's all we could afford. For the first two weeks, we saw zero returns. 
              The skepticism from those around us was loud, but our vision was louder.
            </p>
            <p className="mb-8 font-serif border-l-4 border-black pl-6 py-2 text-black italic text-xl">
              "Even though it felt like we had wasted our money and got nothing in return, I reminded myself that every failure is a lesson in disguise."
            </p>
            <p className="mb-6 font-serif text-lg leading-relaxed text-gray-800">
              By the third month, things changed. One morning I woke up to my phone buzzing with notifications. We had our first big sale. 
              Then another. The Rs. 800 ad budget had finally hit the right audience. It taught us that consistency in digital marketing is more 
              important than the initial capital. Today, we've scaled that small business into a full-fledged independent journalism and 
              media platform.
            </p>
          </div>

          <div className="flex items-center gap-8 py-8 border-y border-gray-100 mb-12 text-black font-sans">
              <div onClick={handleLike} className="flex items-center gap-2 cursor-pointer group">
                <ThumbsUp size={20} className={`group-hover:scale-110 transition-transform ${isLiked ? 'text-blue-600 fill-blue-600' : ''}`}/> 9M
              </div>
              <div onClick={() => setShowCommentBox(!showCommentBox)} className="flex items-center gap-2 cursor-pointer group">
                <MessageSquare size={20} className="group-hover:scale-110 transition-transform"/> 45K
              </div>
              <div onClick={handleShare} className="flex items-center gap-2 cursor-pointer group">
                <Share2 size={20} className="group-hover:scale-110 transition-transform"/> 854
              </div>
          </div>

          {/* 3. COMMENTS SECTION */}
          <div className="space-y-6">
              <AnimatePresence>
                {showCommentBox && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold shrink-0">
                      US
                    </div>
                    <div className="flex-1">
                      <div className="bg-[#F2F2F2] rounded-2xl p-6 border border-gray-100">
                        <textarea 
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="w-full bg-transparent border-none text-black outline-none focus:ring-0 resize-none font-serif min-h-[80px]"
                        />
                        <div className="flex justify-start items-center gap-6 mt-4">
                           <button onClick={() => setShowCommentBox(false)} className="text-black text-sm font-medium font-serif hover:text-black">Cancel</button>
                           <button 
                             onClick={() => {
                               console.log("Commented:", comment);
                               setComment("");
                               setShowCommentBox(false);
                             }}
                             className="bg-[#D1D5DB] hover:bg-gray-300 text-gray-900 px-8 py-2.5 rounded-full font-serif text-sm transition-colors flex items-center gap-2"
                           >
                             Submit <Send size={14}/>
                           </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!showCommentBox && (
                <button 
                  onClick={() => setShowCommentBox(true)}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-serif hover:bg-gray-50 transition-all"
                >
                  Click here to join the conversation...
                </button>
              )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default CultureStory;