"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Bookmark, ThumbsUp, MessageSquare, Share2, ArrowUpRight } from 'lucide-react';

const OpedRadyo = () => {
  // Audio Engine States
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Dynamic Data
  const [episodes, setEpisodes] = useState([
    { id: 1, title: "İran'dan uyarı, Halep'te tahliye | 12 Ocak 2026", date: "19 January 2026", length: "6:00", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600" },
    { id: 2, title: "Modern Journalism & Digital Media Trends", date: "20 January 2026", length: "4:30", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=600" },
    { id: 3, title: "Global Market Updates: February 2026", date: "21 January 2026", length: "5:15", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600" },
  ]);

  const [currentTrack, setCurrentTrack] = useState(episodes[0]);

  // Handle Play/Pause logic
  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  const onTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
  };

  const handleTrackChange = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-white min-h-screen pt-28 md:pt-64 pb-20 text-black">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={currentTrack.src} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onTimeUpdate} />

      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-sans font-extrabold mb-4 text-black">Oped Radyo</h1>
        <p className="text-gray-500 font-serif text-sm px-4">
          OPED's editors present interviews, profiles, and in-depth conversations, produced in collaboration with our podcast team.
        </p>
      </div>

      {/* Main Player Box (Exact Image Layout) */}
      <div className="max-w-6xl mx-auto px-4 mb-20">
        <div className="border border-gray-200 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center bg-white shadow-sm">
          <div className="flex-1 w-full">
             <div className="flex items-center gap-2 mb-4">
                <img src={`https://ui-avatars.com/api/?name=MU&background=random`} className="w-8 h-8 rounded-full" alt="MU" />
                <div className="text-xs">
                  <p className="font-bold text-black">Manchester United</p>
                  <p className="text-gray-400">22 Jan, 2026</p>
                </div>
             </div>
             <p className="text-gray-400 text-xs mb-1 font-serif">Expert opinions</p>
             <h2 className="text-xl font-sans font-extrabold mb-2 text-black">{currentTrack.title}</h2>
             <p className="text-gray-400 text-xs mb-6 font-serif">{currentTrack.date}</p>

             {/* Progress Bar */}
             <div className="w-full bg-gray-100 h-1 rounded-full mb-2 relative cursor-pointer" 
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    audioRef.current.currentTime = percent * duration;
                  }}>
                <div className="absolute left-0 top-0 bg-black h-full rounded-full" style={{ width: `${(currentTime/duration)*100}%` }}></div>
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full shadow-md" style={{ left: `${(currentTime/duration)*100}%` }}></div>
             </div>
             <div className="flex justify-end text-[10px] text-gray-400 mb-6 font-sans">
               {formatTime(currentTime)} / {formatTime(duration)}
             </div>

             {/* Controls */}
             <div className="flex items-center justify-center gap-8">
                <RotateCcw size={20} className="text-gray-600 cursor-pointer" onClick={() => audioRef.current.currentTime -= 10}/>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 bg-white border border-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all"
                >
                  {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                </button>
                <RotateCw size={20} className="text-gray-600 cursor-pointer" onClick={() => audioRef.current.currentTime += 10}/>
             </div>
          </div>
          <div className="w-full md:w-[350px] h-[220px] rounded-2xl overflow-hidden shadow-lg">
             <img src={currentTrack.image} className="w-full h-full object-cover" alt="Episode" />
          </div>
        </div>

        {/* Episode List Section (Same to Image) */}
        <div className="mt-8 border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex justify-between items-center px-6">
             <span className="font-sans font-bold text-sm text-black uppercase tracking-wider">All Podcast</span>
             <span className="text-xs text-gray-400">100 Episodes</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
             {episodes.map((ep) => (
               <div key={ep.id} 
                    onClick={() => handleTrackChange(ep)}
                    className="p-5 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50 cursor-pointer group px-8">
                  <div>
                    <h4 className={`text-sm font-sans font-bold transition-colors ${currentTrack.id === ep.id ? 'text-blue-600' : 'text-black group-hover:text-blue-600'}`}>
                      {ep.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1 font-serif">{ep.date} | {ep.length}</p>
                  </div>
                  {currentTrack.id === ep.id && isPlaying ? <Pause size={20} /> : <Play size={20} className="text-gray-800" />}
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* All Episodes Bottom Section (Same to Image) */}
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-5xl font-sans text-center  font-extrabold mb-9 text-black border-b border-t py-3 border-gray-100">All Episodes</h3>
        <div className="space-y-12">
          {episodes.map((ep) => (
            <div key={ep.id} className="flex flex-col md:flex-row gap-10 items-start border-b border-gray-50 pb-12">
               <div className="flex-1">
                  <h4 className="text-xl font-sans font-extrabold mb-3 text-black">The Future of Digital Media and the Changing Voice of Independent Journalism</h4>
                  <p className="text-gray-500 text-sm font-serif leading-relaxed mb-4">As technology evolves and reader habits shift, independent platforms are redefining how stories are told, shared, and trusted the world.</p>
                  <button className="text-blue-600 text-xs font-bold flex items-center gap-1 font-sans mb-6">Read More <ArrowUpRight size={14}/></button>
                  <div className="flex gap-6 text-gray-500 font-sans">
                    <span className="flex items-center gap-1 text-xs cursor-pointer hover:text-blue-600"><ThumbsUp size={16}/> 9M</span>
                    <span className="flex items-center gap-1 text-xs cursor-pointer hover:text-blue-600"><MessageSquare size={16}/> 45K</span>
                    <span className="flex items-center gap-1 text-xs cursor-pointer hover:text-blue-600"><Share2 size={16}/> 854</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-4 font-sans">{ep.date}</p>
               </div>
               <div className="w-full md:w-[280px] h-[180px] rounded-2xl overflow-hidden relative group shadow-md">
                  <img src={ep.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Episode" />
                  <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow-md text-black hover:bg-blue-600 hover:text-white transition-all">
                    <Bookmark size={16} />
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OpedRadyo;