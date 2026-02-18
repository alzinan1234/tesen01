"use client";

import React from "react";
import { motion } from "framer-motion";
import { ThumbsUp, MessageSquare, Share2, ArrowUpRight } from "lucide-react";

const ReaderBanner = () => {
  return (
    // Changed h-screen to min-h-screen and added responsive padding/height
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
            Gavin Newsom Is Playing <br className="hidden sm:block" /> the Long Game
          </h1>

          {/* Subtext: Font size scales down for mobile */}
          <p className="text-white/80 text-sm md:text-lg lg:text-xl leading-relaxed mb-6 md:mb-8 font-serif font-light max-w-[440px]">
            As technology evolves and reader habits shift, independent platforms are 
            redefining how stories are told, shared, and trusted the world.
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
              <span className="text-xs md:text-sm font-bold tracking-tighter">9M</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-all">
              <MessageSquare size={18} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-bold tracking-tighter">45K</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-all">
              <Share2 size={18} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-bold tracking-tighter">854</span>
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
            src="/image4.png" 
            alt="Billboard in city"
            className="w-full h-full object-cover object-center block"
          />
          {/* Visual depth overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-gradient-to-r md:from-black/40" />
        </motion.div>
      </div>
    </section>
  );
};

export default ReaderBanner;