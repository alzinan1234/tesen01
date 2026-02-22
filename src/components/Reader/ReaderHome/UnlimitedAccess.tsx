import { div } from 'framer-motion/client';
import React from 'react';

const UnlimitedAccess: React.FC = () => {
  return (
   <div className='py-10 pb-26 bg-white'>
     <section className="bg-[#F1FAD8] max-w-7xl mx-auto py-12 px-6 border-y border-gray-200 ">
      <div className=" gap-10 px-10 ">
        
        {/* Left Side: Logo & Main Text */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mx-auto ">
          {/* Custom TH Logo Placeholder */}
          <div className="flex flex-col items-center text-black">
           <img src="/black-logo.png" alt="" />
          </div>

          <div className="max-w-md">
            <h2 className="text-3xl md:text-4xl font-sans font-bold text-gray-900 mb-2">
              Unlimited Access to OPED
            </h2>
            <p className="text-sm md:text-base font-serif text-gray-700 leading-relaxed">
              Subscribe for <span className="line-through text-gray-400">49.99</span> <span className="font-bold">$99.99</span> 1 year and get full access to exclusive stories, opinions, and podcasts.
            </p>
          </div>
            <div className="flex flex-col items-center">
          <div className="text-5xl font-serif tracking-[0.4em] text-gray-900 mb-4 ml-4">
            <img src="/black-oped.png" alt="" />
          </div>
          <button className="bg-black text-white px-12 py-3 rounded-xl font-serif text-lg hover:bg-gray-800 transition-all shadow-lg active:scale-95">
            Subscribe
          </button>
          <p className="text-[16px] font-serif mt-4 text-gray-600 ">
            Cancel or pause anytime.
          </p>
        </div>
        </div>

        {/* Right Side: Subscribe Action */}
      

      </div>
    </section>
   </div>
  );
};

export default UnlimitedAccess;