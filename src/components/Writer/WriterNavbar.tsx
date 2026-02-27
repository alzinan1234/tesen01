"use client";

import React from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

const WriterNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full h-20 bg-white border-b border-gray-100 z-50 flex items-center px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between relative">
        
        {/* Left Side (Empty to maintain centering) */}
        <div className="flex-1" />

        {/* Center: Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/writer">
           <img src="/nav-logo.png" alt="" />
          </Link>
        </div>

        {/* Right Side: Actions */}
        <div className="flex-1 flex justify-end items-center gap-6">
          <Link 
            href="/" 
            className="text-black font-sans font-bold text-2xl hover:text-gray-600 transition-colors"
          >
            Sign In
          </Link>
          
          <button className="p-2 hover:bg-gray-50 rounded-full transition-colors relative">
            <Bell size={28} strokeWidth={1.5} className="text-black" />
            {/* Optional Notification Dot */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
        
      </div>
    </nav>
  );
};

export default WriterNavbar;