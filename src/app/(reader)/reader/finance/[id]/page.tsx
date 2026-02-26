"use client";
import React, { useState } from 'react';
import { Bookmark, ThumbsUp, MessageSquare, Share2, Send, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cultureArticles as financeArticles } from '@/components/data/cultureData';

const FinanceStory = ({ params }: { params: { id: string } }) => {
  const story = financeArticles.find(s => s.id === params.id) || financeArticles[0];
  const [isLiked, setIsLiked] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full min-h-[80vh] md:h-screen flex flex-col md:flex-row bg-black pt-20 md:pt-24 overflow-hidden">
        <div className="w-full md:w-1/2 flex items-center justify-center bg-black text-white px-6 py-12 lg:px-20 z-10">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="max-w-[540px] text-center flex flex-col items-center">
            <h1 className="font-sans text-[32px] md:text-[68px] leading-[1.1] mb-6 ">{story.title}</h1>
            <p className="text-white/80 text-lg mb-8 font-serif font-light">{story.description}</p>
            <motion.a href="#content" whileHover={{ scale: 1.05 }} className="flex items-center font-sans gap-2 text-[#3448D6] font-bold text-lg mb-12">
              Financial Analysis <ArrowUpRight size={20} />
            </motion.a>
            <div className="flex items-center gap-10 font-sans pt-8 border-t border-white/10 w-full justify-center">
              <div onClick={() => setIsLiked(!isLiked)} className={`flex items-center gap-2 cursor-pointer transition-colors ${isLiked ? 'text-blue-500' : ''}`}>
                <ThumbsUp size={20} fill={isLiked ? "currentColor" : "none"} /> <span className="text-sm font-bold">{story.likes}</span>
              </div>
              <div onClick={() => setShowCommentBox(true)} className="flex items-center gap-2 cursor-pointer"><MessageSquare size={20} /> <span className="text-sm font-bold">{story.comments}</span></div>
              <div className="flex items-center gap-2 cursor-pointer"><Share2 size={20} /> <span className="text-sm font-bold">{story.shares}</span></div>
            </div>
          </motion.div>
        </div>
        <div className="w-full md:w-1/2 h-[300px] md:h-full relative">
          <img src={story.image} className="w-full h-full object-cover" alt="Finance Hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-gradient-to-r md:from-black/40" />
        </div>
      </section>

      {/* Content Section */}
      <section id="content" className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-10">
        <aside className="hidden md:block sticky top-32 h-fit">
          <button className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
            <Bookmark size={24} className="text-gray-400" />
          </button>
        </aside>

        <div className="flex-1">
          <article className="prose prose-lg text-black leading-loose">
            <p className="mb-6 font-extrabold text-2xl font-sans text-black">
              Understanding the velocity of money in a digital-first economy is critical for long-term wealth preservation...
            </p>
            <p className="mb-6 font-serif text-lg text-black">
              The shift from centralized banking models to more fluid, fintech-driven solutions is creating unprecedented opportunities for individual investors. However, with this freedom comes the responsibility of risk management in a highly volatile market.
            </p>
            <p className="mb-8 font-serif border-l-4 border-black pl-6 py-2 italic text-xl text-black">
              "Wealth is not just about what you earn, but how much you keep and how effectively you put that capital to work."
            </p>
            <p className="mb-6 font-serif text-lg text-black">
              As we examine the fiscal reports for Q1 2026, the trend indicates a significant move toward alternative assets. Institutional investors are no longer looking just at equity; they are diversifying into commodities and high-yield tech ventures. This shift is reshaping how we define a "balanced" portfolio for the modern era.
            </p>
          </article>

          {/* Interaction Bar */}
          <div className="flex items-center gap-8 py-8 border-y border-gray-100 my-12 font-sans text-black">
              <div onClick={() => setIsLiked(!isLiked)} className="flex items-center gap-2 cursor-pointer group">
                <ThumbsUp size={20} className={`group-hover:scale-110 transition-transform ${isLiked ? "text-blue-600 fill-blue-600" : ""}`}/> 9M
              </div>
              <div onClick={() => setShowCommentBox(!showCommentBox)} className="flex items-center gap-2 cursor-pointer group">
                <MessageSquare size={20} className="group-hover:scale-110 transition-transform"/> 45K
              </div>
              <div className="flex items-center gap-2 cursor-pointer group">
                <Share2 size={20} className="group-hover:scale-110 transition-transform"/> 854
              </div>
          </div>

          {/* Comment Section */}
          <AnimatePresence>
            {showCommentBox && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">US</div>
                <div className="flex-1 bg-[#F2F2F2] rounded-2xl p-6">
                  <textarea 
                    className="w-full bg-transparent border-none outline-none focus:ring-0 font-serif text-black min-h-[80px] p-0" 
                    placeholder="Contribute to the economic dialogue..." 
                  />
                  <div className="flex justify-start gap-6 mt-4">
                    <button onClick={() => setShowCommentBox(false)} className="text-gray-500 text-sm font-serif font-medium">Cancel</button>
                    <button className="bg-[#D1D5DB] text-black px-8 py-2.5 rounded-full font-serif text-sm flex items-center gap-2 hover:bg-gray-300">
                      Submit <Send size={14}/>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
};

export default FinanceStory;