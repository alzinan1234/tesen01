"use client";
import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, ArrowUpRight } from 'lucide-react';

type StatusType = 'Publish Status' | 'Scheduled' | 'Request Revision' | 'Draft' | 'Save' | 'Rejected';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  status: StatusType;
  likes: number;
  comments: number;
  shares: number;
}

const SaveAndDraft = () => {
  const [activeTab, setActiveTab] = useState<StatusType>('Publish Status');

  // Dummy Data
  const allArticles: Article[] = [
    {
      id: 1,
      title: "The Future of Digital Media and the Changing Voice of Independent Journalism",
      excerpt: "As technology evolves and reader habits shift, independent platforms are redefining how stories are told, shared, and trusted the world.",
      date: "22 January, 2026",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800",
      status: 'Publish Status',
      likes: 0, comments: 0, shares: 0
    },
    {
      id: 2,
      title: "The Future of Digital Media and the Changing Voice of Independent Journalism",
      excerpt: "As technology evolves and reader habits shift, independent platforms are redefining how stories are told, shared, and trusted the world.",
      date: "22 January, 2026",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800",
      status: 'Scheduled',
      likes: 0, comments: 0, shares: 0
    },
    {
      id: 3,
      title: "The Future of Digital Media and the Changing Voice of Independent Journalism",
      excerpt: "As technology evolves and reader habits shift, independent platforms are redefining how stories are told, shared, and trusted the world.",
      date: "22 January, 2026",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800",
      status: 'Rejected',
      likes: 0, comments: 0, shares: 0
    },
    // Add more dummy items for Draft (10) and Save (8) counts...
  ];

  const tabs: StatusType[] = ['Publish Status', 'Scheduled', 'Request Revision', 'Draft', 'Save', 'Rejected'];

  const filteredArticles = allArticles.filter(art => {
    if (activeTab === 'Publish Status') return art.status === 'Publish Status';
    return art.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12  min-h-screen text-black font-sans pt-28 ">
      {/* --- Main Heading --- */}
      <h1 className="text-5xl font-serif font-bold mb-10 tracking-tight">
        Save & Draft
      </h1>

      {/* --- Navigation Tabs --- */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-gray-100 mb-12">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[15px] font-medium transition-all relative ${
              activeTab === tab 
                ? 'text-black font-bold' 
                : 'text-gray-400 hover:text-black'
            }`}
          >
            {tab}
            {tab === 'Draft' && ' (10)'}
            {tab === 'Save' && ' (8)'}
            
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></div>
            )}
          </button>
        ))}
      </div>

      {/* --- Article List --- */}
      <div className="space-y-12">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <div key={article.id} className="flex flex-col md:flex-row gap-8 items-start group relative">
              
              {/* Image Section */}
              <div className="w-full md:w-64 shrink-0">
                <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <img 
                    src={article.image} 
                    alt="Article" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-serif font-bold leading-snug max-w-lg cursor-pointer hover:text-blue-700 transition-colors">
                    {article.title}
                  </h2>
                  
                  {/* Dynamic Badges based on activeTab */}
                  {activeTab === 'Publish Status' && (
                    <span className="bg-[#F3F5E9] text-[#7A8A45] px-4 py-1 rounded-full text-xs font-semibold">
                      In Review
                    </span>
                  )}
                  {activeTab === 'Scheduled' && (
                    <span className="bg-[#F3F5E9] text-[#7A8A45] px-4 py-1 rounded-full text-xs font-semibold">
                      {article.date}
                    </span>
                  )}
                  {activeTab === 'Rejected' && (
                    <span className="bg-[#FFE9E9] text-[#FF5F5F] px-4 py-1 rounded-full text-xs font-semibold">
                      Rejected
                    </span>
                  )}
                   {activeTab === 'Request Revision' && (
                    <span className="bg-[#E9F0FF] text-[#5F8BFF] px-4 py-1 rounded-full text-xs font-semibold cursor-pointer">
                      View Feedback
                    </span>
                  )}
                </div>

                <p className="text-black/60 text-sm leading-relaxed mb-4 max-w-2xl">
                  {article.excerpt}
                </p>

                {(activeTab === 'Publish Status' || activeTab === 'Scheduled' || activeTab === 'Request Revision') && (
                  <a href="#" className="inline-flex items-center text-blue-700 text-sm font-semibold mb-6 hover:underline">
                    Read More <ArrowUpRight className="ml-1 w-4 h-4" />
                  </a>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-1.5 text-black hover:opacity-70 transition-opacity">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-xs font-bold">{article.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-black hover:opacity-70 transition-opacity">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-bold">{article.comments}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-black hover:opacity-70 transition-opacity">
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs font-bold">{article.shares}</span>
                    </button>
                  </div>
                  <button className="text-black/40 hover:text-black">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mt-4 text-[11px] font-bold text-black/40 uppercase tracking-widest">
                  {article.date}
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="py-20 text-center text-gray-400 font-serif italic text-xl">
            No items found in {activeTab}.
          </div>
        )}
      </div>
    </div>
  );
};

export default SaveAndDraft;