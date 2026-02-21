"use client";

import React from "react";
import { motion } from "framer-motion";
import { ThumbsUp, MessageSquare, Share2, ArrowUpRight } from "lucide-react";

const Newsome = () => {
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
          {/* Main Headline - Serif, elegant, large */}
          <h1
            className="text-white text-[38px] md:text-[48px] lg:text-[52px] leading-[1.15] mb-6 tracking-tight font-sans"
          
          >
            Gavin Newsom Is Playing the Long Game
          </h1>

          {/* Subtext */}
          <p
            className="text-gray-400 text-[14px] md:text-[15px] font-serif leading-relaxed mb-6 max-w-[400px]"
            
          >
            As technology evolves and reader habits shift, independent platforms are
            redefining how stories are told, shared, and trusted the world.
          </p>

          {/* Read More Link */}
          <motion.a
            href="#"
            whileHover={{ x: 4 }}
            className="flex items-center gap-1 text-[#3B55E6] text-[16px] font-sans font-medium mb-10 hover:text-blue-400 transition-colors"
           
          >
            Read More
            <ArrowUpRight size={16} />
          </motion.a>

          {/* Stats Bar */}
          <div className="flex items-center gap-10 text-white pt-6 border-t border-white/10 w-full justify-center">
            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <ThumbsUp size={16} strokeWidth={1.5} />
              <span className="text-[13px] font-sans">9M</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <MessageSquare size={16} strokeWidth={1.5} />
              <span className="text-[13px] font-sans">45K</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <Share2 size={16} strokeWidth={1.5} />
              <span className="text-[13px] font-sans">854</span>
            </div>
          </div>
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
          {/* Actual image */}
          <img
            src="/newsome.png"
            alt="Gavin Newsom"
            className="w-full h-full object-cover block"
            style={{ display: "block" }}
          />

          {/* Red color overlay using mix-blend-mode multiply — creates the exact red tint */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "#C0170B",
              mixBlendMode: "multiply",
              opacity: 1,
            }}
          />

          {/* Extra red hue overlay to deepen the effect */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(180,20,10,0.55) 0%, rgba(220,60,20,0.35) 100%)",
              mixBlendMode: "screen",
              opacity: 0.4,
            }}
          />

          {/* Left fade to blend with black background */}
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