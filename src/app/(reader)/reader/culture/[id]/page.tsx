"use client";
import React, { useState } from 'react';
import { Bookmark, ThumbsUp, MessageSquare, Share2, Send } from 'lucide-react';
import { motion } from "framer-motion";
import {  ArrowUpRight } from "lucide-react";
import { cultureArticles } from '@/components/data/cultureData';



const CultureStory = ({ params }: { params: { id: string } }) => {
  const story = cultureArticles.find(s => s.id === params.id) || cultureArticles[0];
  const [comment, setComment] = useState("");

  return (
    <main className="bg-white min-h-screen">



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
             {story.description}
          </p>

          {/* Call to Action */}
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 text-[#3448D6] font-bold text-base md:text-lg mb-8 md:mb-12 transition-colors hover:text-blue-400"
          >
            Read More 
            <ArrowUpRight size={20} />
          </motion.a>

          {/* Icon Stats Bar: Scales gap for smaller screens */}
          <div className="flex items-center gap-6 sm:gap-10 text-white pt-6 md:pt-8 border-t border-white/10 w-full justify-center">
            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-all">
              <ThumbsUp size={18} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-bold tracking-tighter">{story.likes}</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-all">
              <MessageSquare size={18} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-bold tracking-tighter">{story.comments}</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-all">
              <Share2 size={18} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-bold tracking-tighter">{story.shares}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT CONTENT - The Billboard Image */}
      {/* On mobile, we give this a fixed height so it doesn't disappear, but stays proportional */}
      <div className="w-full md:w-1/2 h-[300px] sm:h-[400px] md:h-full relative">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full h-full"
        >
          <img 
            src={story.image}
            alt="Billboard in city"
            className="w-full h-full object-cover object-center block"
          />
          {/* Visual depth overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-gradient-to-r md:from-black/40" />
        </motion.div>
      </div>
    </section>
      {/* 1. Hero Section (Image on Right, Dark Overlay on Left) */}
      {/* <section className="relative h-[80vh] flex flex-col md:flex-row bg-black overflow-hidden">
        <div className="md:w-1/2 flex flex-col justify-center p-12 md:p-24 z-10 bg-black">
          <h1 className="text-white text-5xl md:text-6xl font-serif font-bold leading-tight mb-8">
            {story.title}
          </h1>
          <p className="text-gray-400 font-serif leading-relaxed max-w-md mb-8">
            {story.description}
          </p>
          <div className="flex items-center gap-8 text-white">
            <div className="flex items-center gap-2"><ThumbsUp size={18}/> {story.likes}</div>
            <div className="flex items-center gap-2"><MessageSquare size={18}/> {story.comments}</div>
            <div className="flex items-center gap-2"><Share2 size={18}/> {story.shares}</div>
          </div>
          <span className="text-gray-500 mt-6 font-serif italic text-sm">{story.date}</span>
        </div>
        <div className="md:w-1/2 relative h-full">
          <img src={story.image} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Hero" />
        </div>
      </section> */}

      {/* 2. Content Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 flex gap-10">
        <aside className="sticky top-32 h-fit">
          <button className="p-3 border rounded-xl hover:bg-gray-50 transition-all">
            <Bookmark size={24} className="text-gray-400" />
          </button>
        </aside>

        <div className="flex-1">
          <div className="prose prose-lg font-serif text-black leading-loose">
            <p className="mb-6 font-bold text-xl leading-relaxed">
              I didn't want a regular job, so my friend and I decided to start a business selling digital products...
            </p>
            <p className="mb-6">
              Eventually, we found a product to sell. My friend handled Facebook ads, and I created the ad designs in Canva. 
              We started investing Rs. 800 each day in ads. I know it's not much, but that's all we could afford.
            </p>
            {/* Additional content matching image prototype */}
            <p className="mb-10 italic border-l-4 border-gray-200 pl-6 py-2 text-black">
              Even though it felt like we had wasted our money and got nothing in return, I reminded myself that every...
            </p>
          </div>

          <div className="flex items-center gap-8 py-8 border-y border-gray-100 mb-12 text-black">
             <div className="flex items-center gap-2"><ThumbsUp size={20}/> 9M</div>
             <div className="flex items-center gap-2"><MessageSquare size={20}/> 45K</div>
             <div className="flex items-center gap-2"><Share2 size={20}/> 854</div>
          </div>

          {/* 3. Comments Section */}
          <div className="space-y-10">
             <div className="flex gap-4">
                <img src={`https://ui-avatars.com/api/?name=MU`} className="w-10 h-10 rounded-full" alt="" />
                <div className="flex-1">
                   <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full bg-transparent border-none outline-none resize-none font-serif min-h-[80px]"
                      />
                      <div className="flex justify-between items-center mt-4">
                         <button className="text-gray-500 text-sm font-medium">Cancel</button>
                         <button className="bg-[#B5C2FF] text-blue-900 px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm">
                            Submit <Send size={16}/>
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>
   
    </main>
  );
};

export default CultureStory;