"use client";

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { Bookmark, ThumbsUp, MessageSquare, Share2, ArrowUpRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const TodayMixCard = () => {
  const cards = [1, 2, 3, 4, 5, 6]; // Array for demo slides

  return (
    <section className=" py-16 px-4 md:px-10 bg-white">
      {/* Title Section */}
      <div className="text-center mb-12">
        <h2 className="text-[42px] md:text-[54px] font-sans  text-gray-900">
          Today's Mix
        </h2>
      </div>

      {/* Slider Container */}
      <div className="relative max-w-7xl mx-auto py-10">
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={24}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          navigation={{ 
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="pb-10"
        >
          {cards.map((_, index) => (
            <SwiperSlide key={index}>
              <div
                className=""
               
              >
                {/* Image Container */}
                <div className='rounded-[20px] overflow-hidden flex flex-col  border shadow-xl'>
                  <div className="relative p-4">
                    <div className="relative h-[200px] w-full rounded-[15px] overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1519681393784-d120267933ba"
                        alt="Article"
                        className="w-full h-full object-cover"
                      />
                      {/* Floating Bookmark */}
                      <button className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors">
                        <Bookmark size={16} className="text-gray-700" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-6 pt-2 pb-6 flex flex-col items-center text-center">
                    {/* Author / Brand */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center overflow-hidden">
                        <span className="text-[10px] text-white font-bold">MU</span>
                      </div>
                      <span className="text-[14px] font-sans font-bold tracking-widest text-black">Manchester United</span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-xl font-sans font-medium leading-tight mb-4 text-black px-2">
                      How Consent Can—and Cannot—Help Us Have Better Sex
                    </h3>

                    {/* Description */}
                    <p className="text-gray-500 text-[13px] font-serif leading-relaxed mb-4 line-clamp-3">
                      As technology evolves and reader habits shift, independent platforms are redefining how stories are told, shared, and trusted the world.
                    </p>

                    {/* Read More */}
                    <a href="#" className="flex items-center gap-1 text-[#4B59B3] font-sans text-xs font-bold mb-6 hover:underline">
                      Read More <ArrowUpRight size={14} />
                    </a>

                    {/* Footer Stats */}
                    <div className="w-full flex items-center justify-between pt-4 border-t border-gray-100 text-gray-400">
                      <div className="flex items-center gap-1.5 text-black">
                        <ThumbsUp size={14} />
                        <span className="text-[11px] font-sans font-bold text-black">9M</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-black">
                        <MessageSquare size={14} />
                        <span className="text-[11px] font-sans font-bold text-black">45K</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-black">
                        <Share2 size={14} />
                        <span className="text-[11px] font-sans font-bold text-black">854</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-400/50 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-400/50 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </section>
  );
};

export default TodayMixCard;