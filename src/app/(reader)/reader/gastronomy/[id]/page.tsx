"use client";
import React, { useState } from 'react';
import { Bookmark, ThumbsUp, MessageSquare, Share2, Send, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cultureArticles as gastronomyArticles } from '@/components/data/cultureData';

const GastronomyStory = ({ params }: { params: { id: string } }) => {
  const story = gastronomyArticles.find(s => s.id === params.id) || gastronomyArticles[0];
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
              Full Recipe & Story <ArrowUpRight size={20} />
            </motion.a>
            <div className="flex items-center gap-10 pt-8 border-t border-white/10 w-full justify-center">
              <div onClick={() => setIsLiked(!isLiked)} className={`flex items-center gap-2 cursor-pointer transition-colors ${isLiked ? 'text-blue-500' : ''}`}>
                <ThumbsUp size={20} fill={isLiked ? "currentColor" : "none"} /> <span className="text-sm font-bold">{story.likes}</span>
              </div>
              <div onClick={() => setShowCommentBox(true)} className="flex items-center gap-2 cursor-pointer"><MessageSquare size={20} /> <span className="text-sm font-bold">{story.comments}</span></div>
              <div className="flex items-center gap-2 cursor-pointer"><Share2 size={20} /> <span className="text-sm font-bold">{story.shares}</span></div>
            </div>
          </motion.div>
        </div>
        <div className="w-full md:w-1/2 h-[300px] md:h-full relative">
          <img src={story.image} className="w-full h-full object-cover" alt="Gastronomy Hero" />
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
              Gastronomy is the study of the relationship between food and culture, the art of preparing and serving rich or delicate and appetizing food...
            </p>
            <p className="mb-6 font-serif text-lg text-black">
              It is not just about the taste on the tongue; it's about the heritage of the ingredients and the hands that prepared them. From the spice markets of Marrakech to the Michelin-starred kitchens of Tokyo, food tells a story of migration, survival, and celebration.
            </p>
            <p className="mb-8 font-serif border-l-4 border-black pl-6 py-2 italic text-xl text-black">
              "Cooking is like love. It should be entered into with abandonment or not at all."
            </p>
            <p className="mb-6 font-serif text-lg text-black">
              In recent years, we've seen a shift towards "farm-to-table" transparency. Diners are no longer satisfied with just a delicious meal; they want to know the soil it grew in and the ethics of the farm. This conscious consumption is reshaping the global culinary landscape, making gastronomy one of the most dynamic fields of cultural study today.
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
                    placeholder="Tell us about your favorite culinary experience..." 
                  />
                  <div className="flex justify-start gap-6 mt-4">
                    <button onClick={() => setShowCommentBox(false)} className="text-gray-500 font-serif text-sm font-medium">Cancel</button>
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

export default GastronomyStory;