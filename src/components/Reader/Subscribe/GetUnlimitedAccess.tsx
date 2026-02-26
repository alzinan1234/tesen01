import React from 'react';

const GetUnlimitedAccess = () => {
  return (
    <section className="bg-[#F1FAD8] py-20 px-6 md:px-20 overflow-hidden min-h-[380px] flex items-center">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 w-full">
        
        {/* Left Side: Content */}
        <div className="flex-1 space-y-6">
          <h2 className="text-5xl md:text-6xl font-sans font-bold text-black tracking-tight leading-tight">
            Get unlimited access.
          </h2>
          
          <p className="text-lg text-gray-800 font-sans max-w-lg leading-relaxed">
            Essential journalism, bold opinions, exclusive podcasts, and stories that matter – 
            all in one place, anytime.
          </p>

          {/* Dash Moving Border Container */}
          <div className="relative inline-block mt-4 group">
            {/* Moving Border SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="none"
                rx="14" 
                ry="14"
                stroke="#000"
                strokeWidth="1.5"
                strokeDasharray="8, 6"
                className="animate-march"
              />
            </svg>
            
            {/* Button Content */}
            <div className="px-6 py-3 relative z-10">
              <span className="text-sm font-semibold text-black font-serif">
                Plus, full access with our annual subscription.
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: OPED Logo Layout */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <img src="/Horizontal.png" alt="" />
        </div>

      </div>
    </section>
  );
};

export default GetUnlimitedAccess;