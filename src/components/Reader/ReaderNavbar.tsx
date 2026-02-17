"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X } from "lucide-react";

const navLinks = [
  { name: "Explore", href: "/explore" },
  { name: "Politics", href: "/politics" },
  { name: "Business", href: "/business" },
  { name: "Finance", href: "/finance" },
  { name: "Technology", href: "/technology" },
  { name: "Culture", href: "/culture" },
  { name: "Travel", href: "/travel" },
  { name: "Gastronomy", href: "/gastronomy" },
  { name: "Podcasts", href: "/podcasts" },
];

const ReaderNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-gray-200 ${
        isScrolled ? "bg-white/95 backdrop-blur-md" : "bg-white"
      }`}
    >
      {/* 1. Top Section: Centered Logo & Right Actions */}
      <div className="w-full px-6 lg:px-20 h-24 flex items-center justify-between relative">
        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex-1">
          <button onClick={() => setIsOpen(true)} className="text-gray-900">
            <Menu size={28} />
          </button>
        </div>

        {/* LOGO - Absolute centered to match design perfectly */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/">
            <img
              src="/oped.png" 
              alt="OPED"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>
        </div>

        {/* RIGHT ACTIONS - Aligned to the far right */}
        <div className="flex-1 flex justify-end items-center gap-6 lg:gap-10">
          <Link
            href="/login"
            className="hidden md:block text-[16px] font-serif font-bold text-gray-900 hover:text-[#3448D6] transition-colors"
          >
            Sign In
          </Link>
          
          <button className="px-8 py-2.5 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-full font-serif font-bold text-[15px] shadow-lg shadow-blue-900/20 hover:scale-105 transition-all active:scale-95">
            Subscribe
          </button>

          <button className="text-gray-900 hover:text-[#3448D6] transition-colors">
            <Search size={28} />
          </button>
        </div>
      </div>

      {/* 2. Bottom Section: Nav Links - Centered Alignment */}
      <div className="hidden md:block w-full border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex justify-center items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative group text-[15px] font-serif font-medium text-gray-800 hover:text-black whitespace-nowrap transition-colors py-1"
            >
              {link.name}
              {/* Animated Underline */}
              <motion.div
                className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#3448D6]"
                whileHover={{ width: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Mobile Sidebar Navigation */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 bottom-0 w-[300px] bg-white z-[60] md:hidden shadow-2xl p-8"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-12">
                  <img src="/oped.png" alt="Logo" className="h-8" />
                  <button onClick={() => setIsOpen(false)} className="text-gray-400 p-1">
                    <X size={28} />
                  </button>
                </div>
                
                <div className="flex flex-col gap-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-[20px] font-serif font-bold text-gray-900 hover:text-[#3448D6]"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                <div className="mt-auto space-y-4">
                  <Link
                    href="/login"
                    className="block w-full text-center py-4 text-gray-900 font-bold font-serif text-lg border border-gray-200 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <button className="w-full py-4 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-xl font-bold font-serif text-lg">
                    Subscribe Now
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </nav>
  );
};

export default ReaderNavbar;