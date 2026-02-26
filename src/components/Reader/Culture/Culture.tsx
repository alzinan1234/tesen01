"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';

import { cultureArticles } from '@/components/data/cultureData';
import UnlimitedAccess from '../ReaderHome/UnlimitedAccess';

const Culture = () => {
  // --- Pagination & Data State ---
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 2; // Protiti page-e koiti article thakbe

  const [articles, setArticles] = useState(cultureArticles.map(a => ({
    ...a,
    isLiked: false,
    showCommentBox: false,
    commentText: "",
    // String "9M" ke number-e convert korar jonno (optional but recommended for logic)
    displayLikes: a.likes 
  })));

  // Calculate Paginated Data
  const indexOfLastArticle = currentPage * articlesPerPage;
  const currentArticles = articles.slice(0, indexOfLastArticle);
  const hasMore = indexOfLastArticle < articles.length;

  // 1. Like Functionality
  const handleLike = (id) => {
    setArticles(prev => prev.map(art => {
      if (art.id === id) {
        return {
          ...art,
          isLiked: !art.isLiked
          // Note: Likes data string "9M" howay ekhane math calculation kora hoyni
        };
      }
      return art;
    }));
  };

  // 2. Share Functionality
  const handleShare = async (article) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url: window.location.href });
      } catch (err) { console.log(err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  // 3. Comment Toggle & Submit
  const toggleComment = (id) => {
    setArticles(prev => prev.map(art => 
      art.id === id ? { ...art, showCommentBox: !art.showCommentBox } : art
    ));
  };

  const submitComment = (id) => {
    setArticles(prev => prev.map(art => 
      art.id === id ? { ...art, commentText: "", showCommentBox: false } : art
    ));
  };

  return (
    <main className="bg-white min-h-screen pt-28 md:pt-64 pb-10">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-16 px-4">
        <h1 className="text-6xl font-sans text-gray-900 mb-4 font-extrabold">Culture</h1>
        <p className="text-black font-serif text-lg">Every New Yorker post.</p>
        <div className="h-[1px] bg-gray-100 w-full mt-10"></div>
      </div>

      {/* Articles List */}
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
                    <span className="text-[19px] font-bold font-sans text-gray-900 ">{article.author}</span>
                    <span className="text-[14px] font-serif text-gray-400 mt-1">{article.date}</span>
                  </div>
                </div>

                <Link href={`/reader/culture/${article.id}`}>
                  <h2 className="text-2xl font-sans font-extrabold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors cursor-pointer">
                    {article.title}
                  </h2>
                </Link>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-6 font-serif">
                  {article.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button onClick={() => handleLike(article.id)} className={`flex items-center gap-2 font-sans transition-all active:scale-90 ${article.isLiked ? 'text-blue-600' : 'text-black'}`}>
                      <ThumbsUp size={20} fill={article.isLiked ? "currentColor" : "none"} /> 
                      <span className="text-xs font-bold">{article.likes}</span>
                    </button>

                    <button onClick={() => toggleComment(article.id)} className="flex items-center gap-2 font-sans text-black transition-all active:scale-90">
                      <MessageSquare size={20} /> <span className="text-xs font-bold">{article.comments}</span>
                    </button>

                    <button onClick={() => handleShare(article)} className="flex items-center gap-2 font-sans text-black transition-all active:scale-90">
                      <Share2 size={20} /> <span className="text-xs font-bold">{article.shares}</span>
                    </button>
                  </div>
                  <button className="p-2.5 bg-gray-50 rounded-full hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                    <Bookmark size={18} className="text-gray-700" />
                  </button>
                </div>
              </div>
            
              <Link href={`/reader/culture/${article.id}`} className="w-full md:w-[320px] h-[200px] rounded-2xl overflow-hidden order-1 md:order-2 cursor-pointer relative shadow-sm">
                <img src={article.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={article.title} />
              </Link>
            </div>

            {/* Comment Box */}
            {article.showCommentBox && (
              <div className="mt-6 bg-[#F2F2F2] rounded-2xl p-6 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">US</span>
                  </div>
                  <span className="font-sans font-bold text-sm">Your Account</span>
                </div>
                <textarea 
                  className="w-full bg-transparent border-none outline-none focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-400 font-serif resize-none p-0"
                  placeholder="Write a comment..."
                  rows={2}
                  autoFocus
                  value={article.commentText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setArticles(prev => prev.map(art => art.id === article.id ? {...art, commentText: val} : art));
                  }}
                />
                <div className="flex justify-start items-center gap-6 mt-4">
                  <button onClick={() => toggleComment(article.id)} className="text-gray-500 hover:text-black transition-colors font-serif text-sm">Cancel</button>
                  <button onClick={() => submitComment(article.id)} className="px-8 py-2.5 bg-[#D1D5DB] hover:bg-gray-300 text-gray-900 rounded-full font-serif text-sm transition-colors">Submit</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination Button */}
      {hasMore && (
        <div className="flex justify-center mt-20 pb-18">
          <button 
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-12 py-3.5 bg-black text-white rounded-xl font-serif text-lg hover:bg-gray-800 transition-all shadow-xl active:scale-95"
          >
            Next Page
          </button>
        </div>
      )}

      <UnlimitedAccess />
    </main>
  );
};

export default Culture;