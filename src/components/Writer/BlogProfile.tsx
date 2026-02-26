import React from 'react';
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, ArrowUpRight } from 'lucide-react';

const BlogProfile = () => {
  const articles = [
    {
      id: 1,
      title: "The Future of Digital Media and the Changing Voice of Independent Journalism",
      description: "As technology evolves and reader habits shift, independent platforms are redefining how stories are told, shared, and trusted the world.",
      date: "22 January, 2026",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
      likes: "9M",
      comments: "43K",
      shares: "834"
    },
    {
      id: 2,
      title: "Discovering Where Your Interests Lie",
      description: "As technology evolves and reader habits shift, independent platforms are redefining how stories are told, shared, and trusted the world.",
      date: "22 January, 2026",
      image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800",
      likes: "9M",
      comments: "43K",
      shares: "834"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pt-28 md:pt-40 font-sans  text-black">
      
      {/* --- Header Section --- */}
      <header className="flex flex-col md:flex-row items-center md:items-start gap-8 pb-12 border-b border-gray-100">
        <div className="w-36 h-36 rounded-full overflow-hidden flex-shrink-0 bg-blue-50 relative">
          {/* Circular Glow Effect like image */}
          <div className="absolute inset-0 bg-blue-400/20 mix-blend-overlay"></div>
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400" 
            alt="Eric Lach" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-sans font-bold text-black mb-4 tracking-tight">
            Eric Lach
          </h1>
          <p className="text-black text-[15px] leading-relaxed font-serif max-w-2xl">
            Katy Waldman is a culture and lifestyle writer who explores modern trends, human stories, and creative 
            perspectives. Her writing focuses on thoughtful analysis and engaging storytelling. She brings clarity and 
            insight to complex topics through well-researched and compelling articles.
          </p>
        </div>
      </header>

      {/* --- Article List --- */}
      <div className="mt-8 space-y-12">
        {articles.map((article) => (
          <article key={article.id} className="flex flex-col md:flex-row gap-8 items-start group">
            
            {/* Left Content */}
            <div className="flex-1 order-2 md:order-1">
              <h2 className="text-2xl font-sans font-bold text-black leading-tight mb-3 group-hover:text-blue-700 transition-colors cursor-pointer">
                {article.title}
              </h2>
              <p className="text-black text-sm leading-relaxed font-serif mb-4">
                {article.description}
              </p>
              
              <a href="#" className="inline-flex items-center text-blue-700 text-sm font-semibold mb-6 hover:underline">
                Read More <ArrowUpRight className="ml-1 w-4 h-4" />
              </a>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-black">
                    <button className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-xs font-bold">{article.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-bold">{article.comments}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs font-bold">{article.shares}</span>
                    </button>
                  </div>
                  <button className="text-black hover:opacity-70">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                <time className="text-[11px] font-bold text-black/60 uppercase tracking-widest">
                  {article.date}
                </time>
              </div>
            </div>

            {/* Right Image */}
            <div className="w-full md:w-[320px] order-1 md:order-2">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-sm">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

          </article>
        ))}
      </div>

     
    </div>
  );
};

export default BlogProfile;