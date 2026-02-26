"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Headset } from 'lucide-react';

// Sample Data mimicking your images
const podcastSeries = [
  {
    id: "in-the-dark",
    title: "In the Dark",
    author: "Manchester United",
    date: "22 Jan, 2026",
    description: "As technology evolves and reader habits shift, independent platforms are redefining how stories are told, shared, and trusted the world.",
    image: "/full-shot-girl-.png"
  },
  {
    id: "interests-lie",
    title: "Discovering Where Your Interests Lie",
    author: "Manchester United",
    date: "22 Jan, 2026",
    description: "As technology evolves and reader habits shift, independent platforms are redefining how stories are told, shared, and trusted the world.",
    image: "/image-podcust.png"
  }
];

const Podcasts = () => {
  return (
    <div className="bg-white min-h-screen pt-28 md:pt-64 pb-10">
      <div className="max-w-4xl mx-auto text-center mb-12 px-4">
        <h1 className="text-6xl font-sans text-gray-900 mb-4 font-extrabold tracking-tight">Podcasts</h1>
        <p className="text-gray-600 font-serif text-sm max-w-2xl mx-auto">
          Access every OPED podcast, from politics and culture to bold opinions and real stories.
        </p>
        <div className="h-[1px] bg-gray-100 w-full mt-8"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-16">
        {podcastSeries.map((podcast) => (
          <div key={podcast.id} className="flex flex-col md:flex-row gap-10 items-center border-b border-gray-50 pb-16">
            <div className="flex-1 order-2 md:order-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                   <img src="https://ui-avatars.com/api/?name=MU&background=random" alt="author" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold font-sans text-gray-900">{podcast.author}</span>
                  <span className="text-xs font-serif text-gray-400">{podcast.date}</span>
                </div>
              </div>

              <h2 className="text-2xl font-sans font-extrabold text-gray-900 mb-3">{podcast.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 font-serif">{podcast.description}</p>

              <div className="flex flex-col gap-3 max-w-md">
                <button 
                  style={{ background: 'linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)' }}
                  className="w-full py-3 text-white rounded-lg font-sans font-bold text-sm shadow-lg hover:opacity-90 transition-all"
                >
                  Start Listening
                </button>
                <Link href={`/reader/podcasts/${podcast.id}`} className="w-full">
                  <button className="w-full py-3 border border-[#3448D6] text-[#3448D6] rounded-lg font-sans font-bold text-sm hover:bg-blue-50 transition-all">
                    All Episodes
                  </button>
                </Link>
              </div>
            </div>

            <div className="w-full md:w-[400px] h-[250px] rounded-2xl overflow-hidden relative shadow-xl order-1 md:order-2">
              <img src={podcast.image} className="w-full h-full object-cover" alt={podcast.title} />
              <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md">
                <Headset size={20} className="text-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <button className="px-10 py-3 bg-black text-white rounded-xl font-sans font-bold text-sm hover:bg-gray-800 transition-all">
          Next Page
        </button>
      </div>
    </div>
  );
};

export default Podcasts;