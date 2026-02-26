"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';

import { cultureArticles as gastronomyArticles } from '@/components/data/cultureData'; 
import UnlimitedAccess from '../ReaderHome/UnlimitedAccess';

const Gastronomy = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 2;

  const [articles, setArticles] = useState(gastronomyArticles.map(a => ({
    ...a,
    isLiked: false,
    showCommentBox: false,
    commentText: "",
  })));

  const indexOfLastArticle = currentPage * articlesPerPage;
  const currentArticles = articles.slice(0, indexOfLastArticle);
  const hasMore = indexOfLastArticle < articles.length;

  const handleLike = (id) => {
    setArticles(prev => prev.map(art => 
      art.id === id ? { ...art, isLiked: !art.isLiked } : art
    ));
  };

  return (
    <main className="bg-white min-h-screen pt-28 md:pt-64 pb-10">
      <div className="max-w-4xl mx-auto text-center mb-16 px-4">
        <h1 className="text-6xl font-sans text-gray-900 mb-4 font-extrabold">Gastronomy</h1>
        <p className="text-black font-serif text-lg">Exploring the intersection of food, culture, and history.</p>
        <div className="h-[1px] bg-gray-100 w-full mt-10"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-12">
        {currentArticles.map((article) => (
          <div key={article.id} className="flex flex-col border-b border-gray-50 pb-12 group">
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="flex-1 order-2 md:order-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${article.author}&background=random`} alt="" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[19px] font-bold font-sans text-gray-900">{article.author}</span>
                    <span className="text-[14px] font-serif text-gray-400 mt-1">{article.date}</span>
                  </div>
                </div>

                <Link href={`/reader/gastronomy/${article.id}`}>
                  <h2 className="text-2xl font-sans font-extrabold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors cursor-pointer">
                    {article.title}
                  </h2>
                </Link>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-6 font-serif">{article.description}</p>

                <div className="flex items-center justify-between font-sans text-black">
                  <div className="flex items-center gap-6">
                    <button onClick={() => handleLike(article.id)} className={`flex items-center gap-2 transition-all active:scale-90 ${article.isLiked ? 'text-blue-600' : 'text-black'}`}>
                      <ThumbsUp size={20} fill={article.isLiked ? "currentColor" : "none"} /> 
                      <span className="text-xs font-bold">{article.likes}</span>
                    </button>
                    <button onClick={() => setArticles(prev => prev.map(a => a.id === article.id ? {...a, showCommentBox: !a.showCommentBox} : a))} className="flex items-center gap-2 text-black active:scale-90">
                      <MessageSquare size={20} /> <span className="text-xs font-bold">{article.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-black active:scale-90">
                      <Share2 size={20} /> <span className="text-xs font-bold">{article.shares}</span>
                    </button>
                  </div>
                  <button className="p-2.5 bg-gray-50 rounded-full hover:shadow-md transition-all">
                    <Bookmark size={18} className="text-gray-700" />
                  </button>
                </div>
              </div>
            
              <Link href={`/reader/gastronomy/${article.id}`} className="w-full md:w-[320px] h-[200px] rounded-2xl overflow-hidden order-1 md:order-2 shadow-sm">
                <img src={article.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={article.title} />
              </Link>
            </div>

            {/* Comment Box */}
            {article.showCommentBox && (
              <div className="mt-6 bg-[#F2F2F2] rounded-2xl p-6 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-[10px]">US</div>
                  <span className="font-sans font-bold text-sm text-black">Your Account</span>
                </div>
                <textarea 
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-black font-serif resize-none p-0"
                  placeholder="Share your culinary thoughts..." rows={2} autoFocus
                />
                <div className="flex justify-start items-center gap-6 mt-4">
                  <button onClick={() => setArticles(prev => prev.map(a => a.id === article.id ? {...a, showCommentBox: false} : a))} className="text-gray-500 font-serif text-sm">Cancel</button>
                  <button className="px-8 py-2.5 bg-[#D1D5DB] text-black rounded-full font-serif text-sm hover:bg-gray-300">Submit</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-20 pb-18">
          <button onClick={() => setCurrentPage(prev => prev + 1)} className="px-12 py-3.5 bg-black text-white rounded-xl font-serif text-lg hover:bg-gray-800 transition-all active:scale-95 shadow-xl">
            Next Page
          </button>
        </div>
      )}
      <UnlimitedAccess />
    </main>
  );
};

export default Gastronomy;