"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X } from "lucide-react";

const navLinks = [
  { name: "Explore", href: "/reader/explore" },
  { name: "Politics", href: "/reader/politics" },
  { name: "Business", href: "/reader/business" },
  { name: "Finance", href: "/reader/finance" },
  { name: "Technology", href: "/reader/technology" },
  { name: "Culture", href: "/reader/culture" },
  { name: "Travel", href: "/reader/travel" },
  { name: "Gastronomy", href: "/reader/gastronomy" },
  { name: "Podcasts", href: "/reader/podcasts" },
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
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b font-sans ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"
      } border-gray-200`}
    >
      {/* 1. Top Section */}
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 h-20 md:h-24 flex items-center justify-between relative">
        
        {/* Mobile Menu Toggle (Left on Mobile) */}
        <div className="flex-1 md:hidden">
          <button onClick={() => setIsOpen(true)} className="text-gray-900 p-2 -ml-2">
            <Menu size={28} />
          </button>
        </div>

        {/* LOGO - Centered across all screens */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <Link href="/">
            <img
              src="/nav-logo.png" 
              alt="OPED"
              className="h-8 md:h-12 w-auto object-contain"
            />
          </Link>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex-1 flex justify-end items-center gap-3 sm:gap-6 lg:gap-8">
          <Link
            href="/login"
            className="hidden md:block text-gray-900 hover:text-[#3448D6] transition-colors"
            style={{
              fontWeight: 900,
              fontSize: '18px',
              lineHeight: '140%',
              letterSpacing: '0.06em'
            }}
          >
            Sign In
          </Link>
          
          <button className="px-4 sm:px-8 py-2 bg-gradient-to-r from-[#343E87] via-[#3448D6] hidden sm:inline to-[#343E87] text-white rounded-full font-bold shadow-lg shadow-blue-900/20 hover:scale-105 transition-all active:scale-95 whitespace-nowrap"
            style={{
              fontWeight: 900,
              fontSize: '14px', // Smaller on mobile via class, base style here
              lineHeight: '140%',
              letterSpacing: '0.06em'
            }}>
            <span className="">Subscribe</span>
           
          </button>

          <button className="text-gray-900 hover:text-[#3448D6] transition-colors p-1">
            <Search size={24} className="md:w-[28px] md:h-[28px]" />
          </button>
        </div>
      </div>

      {/* 2. Bottom Section: Nav Links */}
      <div className="hidden md:block w-full border-t border-gray-100 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-6 h-14 flex justify-center items-center gap-6 lg:gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative group text-gray-800 hover:text-black whitespace-nowrap transition-colors py-1"
              style={{
                fontWeight: 900,
                fontSize: '16px', // Slightly smaller for better fit on 1024px screens
                lineHeight: '140%',
                letterSpacing: '0.06em'
              }}
            >
              {link.name}
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
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[60] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b">
                <img src="/oped.png" alt="Logo" className="h-6" />
                <button onClick={() => setIsOpen(false)} className="text-gray-500 p-2">
                  <X size={28} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block text-gray-900 hover:text-[#3448D6] transition-colors"
                    style={{
                      fontWeight: 900,
                      fontSize: '20px',
                      lineHeight: '140%',
                      letterSpacing: '0.06em'
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="p-6 border-t space-y-4 bg-gray-50">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-4 text-gray-900 font-bold text-lg border border-gray-300 rounded-xl bg-white"
                >
                  Sign In
                </Link>
                <button className="w-full py-4 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-xl font-bold text-lg">
                  Subscribe Now
                </button>
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