"use client";
import React from 'react';
import { Headphones, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

const podcastData = [1, 2, 3, 4, 5].map((id) => ({
  id,
  category: "Expert opinions",
  title: "İran'dan uyarı, Halep'te tahliye | 12 Ocak 2026",
  duration: "6 min",
  date: "19 january 2026",
  image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=400" // Blue abstract theme
}));

const PodcastCard: React.FC<{ data: typeof podcastData[0] }> = ({ data }) => (
  <div className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_45%] lg:flex-[0_0_31%] px-3">
    <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 h-full flex flex-col">
      <div className="flex gap-4 mb-6">
        {/* Thumbnail with Overlay Icon */}
        <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-blue-900">
          <img src={data.image} alt="" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-1.5 shadow-sm">
              <Headphones size={16} className="text-black" />
            </div>
          </div>
        </div>
        
        {/* Card Content */}
        <div className="flex flex-col justify-center">
          <span className="text-[11px] uppercase font-serif tracking-wider text-black font-medium mb-1">
            {data.category}
          </span>
          <h3 className="text-sm font-sans font-bold leading-snug text-gray-900 line-clamp-3">
            {data.title}
          </h3>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 w-full mb-4" />

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <div className="text-[11px] text-black font-serif font-medium">
          {data.duration} • {data.date}
        </div>
        <button className="hover:scale-110 transition-transform border border-gray-300 rounded-full p-2 bg-gray-100">
          <Play size={20} fill="black" className="text-black" />
        </button>
      </div>
    </div>
  </div>
);

const TheOPEDPodcast: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'center', 
    containScroll: 'trimSnaps',
    loop: true 
  });

  const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <section className="bg-white py-16 px-4 overflow-hidden">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Headphones size={32} className="text-gray-400" />
          <h2 className="text-4xl md:text-5xl font-sans text-black">The OPED Podcast</h2>
        </div>
        <p className="text-black text-lg font-serif ">
          Bold opinions, deep analysis, and conversations beyond the headlines.
        </p>
      </div>

      {/* Slider Container */}
      <div className="relative max-w-7xl mx-auto px-10">
        {/* Navigation Buttons */}
        <button 
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gray-800/40 hover:bg-gray-800/60 text-white p-2 rounded-full transition-all -translate-x-1/2 md:-translate-x-full"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-3">
            {podcastData.map((item) => (
              <PodcastCard key={item.id} data={item} />
            ))}
          </div>
        </div>

        <button 
          onClick={scrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gray-800/40 hover:bg-gray-800/60 text-white p-2 rounded-full transition-all translate-x-1/2 md:translate-x-full"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </section>
  );
};

export default TheOPEDPodcast;