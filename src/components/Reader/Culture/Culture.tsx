"use client";
import React from 'react';
import Link from 'next/link';
import { Bookmark, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';

import { cultureArticles } from '@/components/data/cultureData';
import UnlimitedAccess from '../ReaderHome/UnlimitedAccess';


const Culture = () => {
  return (
    <main className="bg-white min-h-screen pt-28 md:pt-64 pb-10">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-16 px-4">
        <h1 className="text-6xl font-sans text-gray-900 mb-4 font-extrabold ">Culture</h1>
        <p className="text-black font-serif  text-lg">Every New Yorker post.</p>
        <div className="h-[1px] bg-gray-100 w-full mt-10"></div>
      </div>

      {/* Articles List */}
      <div className="max-w-5xl mx-auto px-6 space-y-12">
        {cultureArticles.map((article) => (
          <div key={article.id} className="flex flex-col md:flex-row gap-10 items-start border-b border-gray-50 pb-12 group">
            
            {/* Left Content */}
            <div className="flex-1 order-2 md:order-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                   <img src={`https://ui-avatars.com/api/?name=${article.author}&background=random`} alt="" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[19px] font-bold font-sans text-gray-900 ">{article.author}</span>
                    <span className="text-[14px] font-serif text-gray-400 mt-1">{article.date}</span>
                </div>
              </div>

              <Link href={`/reader/culture/${article.id}`}>
                <h2 className="text-2xl font-sans font-extrabold text-gray-900 mb-4 letter-spacing-5 group-hover:text-blue-700 transition-colors cursor-pointer">
                  {article.title}
                </h2>
              </Link>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-6 font-serif">
                {article.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 font-sans text-black hover:text-black transition-all active:scale-90">
                    <ThumbsUp size={20} /> <span className="text-xs font-bold">{article.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 font-sans text-black hover:text-black transition-all active:scale-90">
                    <MessageSquare size={20} /> <span className="text-xs font-bold">{article.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 font-sans text-black hover:text-black transition-all active:scale-90">
                    <Share2 size={20} /> <span className="text-xs font-bold">{article.shares}</span>
                  </button>
                </div>
                <button className="p-2.5 bg-gray-50 rounded-full hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                  <Bookmark size={18} className="text-gray-700" />
                </button>
              </div>
            </div>
         
            {/* Right Thumbnail */}
            <Link href={`/reader/culture/${article.id}`} className="w-full md:w-[320px] h-[200px] rounded-2xl overflow-hidden order-1 md:order-2 cursor-pointer relative shadow-sm">
                <img 
                    src={article.image} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={article.title} 
                />
            </Link>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-20 pb-18">
        <button className="px-12 py-3.5 bg-black text-white rounded-xl font-serif text-lg hover:bg-gray-800 transition-all shadow-xl active:scale-95">
          Next Page
        </button>
      </div>
         <UnlimitedAccess />
    </main>
  );
};

export default Culture;