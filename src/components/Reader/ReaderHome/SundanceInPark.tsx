import React from 'react';
import { Headphones, ArrowUpRight } from 'lucide-react';

const SundanceInPark: React.FC = () => {
  return (
    <section className="bg-black text-white min-h-[600px] flex items-center justify-center p-8 md:p-16">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Content Side */}
        <div className="flex flex-col items-center text-center   space-y-6 max-w-md mx-auto">
          <h1 className="text-4xl md:text-5xl font-sans  ">
            One Last Sundance in Park City
          </h1>
          
          <p className="text-gray-400 text-sm md:text-base leading-relaxed font-serif font-light">
            BM Genel Sekreteri Guterres, Maduro operasyonunun emsal teşkil etmesinden 
            endişe ettiğini söyledi. Danimarka Başbakanı, ABD'nin olası
          </p>

          <a 
            href="#" 
            className="flex items-center gap-1 text-blue-500 font-sans hover:text-blue-400 transition-colors font-medium text-[16px]"
          >
            Read More <ArrowUpRight size={16} />
          </a>

          {/* Listen Button */}
          <button className="mt-4 flex items-center gap-3 px-8 py-2.5 border border-gray-500 rounded-full hover:bg-white/10 transition-all group">
            <div className="bg-white rounded-full p-1 group-hover:scale-110 transition-transform">
              <Headphones size={18} className="text-black" />
            </div>
            <span className="text-sm font-medium tracking-wide">Listen</span>
          </button>
        </div>

        {/* Right Image Side */}
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm shadow-2xl">
          <img 
            src="./image-m.png" // Replacing with a high-quality cinematic placeholder
            alt="Sundance Painting"
            className="w-full h-full object-cover"
          />
          {/* Subtle overlay to match the painting vibe */}
          <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
        </div>

      </div>
    </section>
  );
};

export default SundanceInPark;