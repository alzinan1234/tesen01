import React from 'react';
import { Play, Headphones } from 'lucide-react';

const Podcasts = () => {
  const podcasts = [
    {
      id: 1,
      title: "In the Dark",
      description: "As technology evolves and reader habits shift, independent platforms are redefining how stories are told, shared, and trusted the world.",
      duration: "6 min",
      date: "19 January 2026",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 2,
      title: "In the Dark",
      description: "As technology evolves and reader habits shift, independent platforms are redefining how stories are told, shared, and trusted the world.",
      duration: "6 min",
      date: "19 January 2026",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-20  font-sans text-black pt-28 md:pt-40">
      {/* Section Title */}
      <h2 className="text-5xl font-sans font-bold text-center mb-16 tracking-tight">
        Podcasts
      </h2>

      <div className="space-y-16">
        {podcasts.map((podcast) => (
          <div key={podcast.id} className="flex flex-col md:flex-row gap-10 items-start pb-16 border-b border-gray-100 last:border-0">
            
            {/* Left Content */}
            <div className="flex-1 order-2 md:order-1">
              <h3 className="text-3xl font-sans font-bold mb-4">
                {podcast.title}
              </h3>
              <p className="text-black text-base font-serif leading-relaxed mb-6 max-w-2xl">
                {podcast.description}
              </p>
              
              <div className="flex items-center gap-2 text-sm font-medium mb-8 text-black/80">
                <span>{podcast.duration}</span>
                <span>•</span>
                <span>{podcast.date}</span>
              </div>

              {/* Gradient Button */}
              <button 
                style={{
                  background: 'linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)'
                }}
                className="flex items-center gap-3 px-8 py-4 rounded-xl text-white hover:opacity-90 transition-all shadow-lg active:scale-95"
              >
                <div className="bg-white/20 rounded-full p-1">
                  <Play className="w-4 h-4 fill-white text-white" />
                </div>
                <span className="font-serif text-lg tracking-wide">Start Listening</span>
              </button>
            </div>

            {/* Right Image Container */}
            <div className="w-full md:w-[450px] order-1 md:order-2 relative group">
              <div className="aspect-[16/10] rounded-[2rem] overflow-hidden shadow-sm">
                <img 
                  src={podcast.image} 
                  alt={podcast.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating Headphones Icon */}
              <div className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-md">
                <Headphones className="w-5 h-5 text-black" />
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Podcasts;