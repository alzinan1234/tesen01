"use client";
import React, { useState } from 'react';
import { Plus, Radio, Headphones, Upload, MoreHorizontal } from 'lucide-react';

type Category = 'story' | 'news' | 'podcast';

const Write = () => {
  const [activeTab, setActiveTab] = useState<Category>('story');
  const [uploadedFiles, setUploadedFiles] = useState<{
    image?: File;
    audio?: File;
    coverImage?: File;
  }>({});

  const handleFileUpload = (type: 'image' | 'audio' | 'coverImage', file: File) => {
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [type]: file }));
      console.log(`${type} uploaded:`, file.name);
    }
  };

  // Specific Styling based on Active Tab
  const getTabStyles = (type: Category) => {
    if (activeTab !== type) return "bg-[#F0F2F5] text-black border border-[#0000000F]";
    
    switch (type) {
      case 'story':
        return "bg-gradient-to-b from-[#343E87] to-[#3448D6] text-white shadow-[0px_4px_12px_0px_#00000014]";
      case 'news':
        return "bg-[#EE1F24] text-white shadow-[0px_4px_12px_0px_#00000014] border border-[#0000000F]";
      case 'podcast':
        return "bg-[#000000FA] text-white shadow-[0px_4px_12px_0px_#00000014] border border-[#0000000F]";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans min-h-screen pt-28 md:pt-44 text-black">
      {/* --- Main Heading --- */}
      <h1 className="text-5xl font-sans text-center font-bold mb-12 tracking-tight text-black">
        Please select your upload <br /> category/type
      </h1>

      {/* --- Category Tabs --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Add Story Tab */}
        <button 
          onClick={() => setActiveTab('story')}
          className={`flex flex-col items-center justify-center py-10 rounded-2xl transition-all duration-300 ${getTabStyles('story')}`}
        >
          <Plus className={`w-8 h-8 mb-2 ${activeTab === 'story' ? 'text-white' : 'text-black'}`} />
          <span className={`text-xl font-sans font-medium ${activeTab === 'story' ? 'text-white' : 'text-black'}`}>Add Story</span>
        </button>

        {/* Add Live News Tab */}
        <button 
          onClick={() => setActiveTab('news')}
          className={`flex flex-col items-center justify-center py-10 rounded-2xl transition-all duration-300 ${getTabStyles('news')}`}
        >
          <Radio className={`w-8 h-8 mb-2 ${activeTab === 'news' ? 'text-white' : 'text-[#EE1F24]'}`} />
          <span className={`text-xl font-sans font-medium ${activeTab === 'news' ? 'text-white' : 'text-black'}`}>Add Live News</span>
        </button>

        {/* Add Podcast Tab */}
        <button 
          onClick={() => setActiveTab('podcast')}
          className={`flex flex-col items-center justify-center py-10 rounded-2xl transition-all duration-300 ${getTabStyles('podcast')}`}
        >
          <Headphones className={`w-8 h-8 mb-2 ${activeTab === 'podcast' ? 'text-white' : 'text-black'}`} />
          <span className={`text-xl font-sans font-medium ${activeTab === 'podcast' ? 'text-white' : 'text-black'}`}>Add Podcast</span>
        </button>
      </div>

      {/* --- Dynamic Form Header --- */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-8">
        <h2 className="text-2xl font-sans font-medium capitalize text-black">
          Add {activeTab === 'news' ? 'Live News' : activeTab}
        </h2>
        <div className="flex items-center gap-4">
          <button className="bg-[#1D931D] text-white px-6 py-1.5 rounded-full text-sm font-medium">
            Send to Editor
          </button>
          <MoreHorizontal className="text-gray-400 cursor-pointer" />
        </div>
      </div>

      {/* --- Dynamic Content Forms --- */}
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* 1. Upload Section (Conditional) */}
        {(activeTab === 'story' || activeTab === 'podcast') && (
          <div className="space-y-6">
             {activeTab === 'podcast' && (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl py-12 bg-[#FAFBFF] group cursor-pointer hover:border-blue-400 transition-colors">
                    <Upload className="w-8 h-8 text-blue-600 mb-3" />
                    <p className="text-black font-semibold font-sans">Upload Audio</p>
                    <p className="text-black text-xs mt-1 text-center px-4 font-serif">File must be in MP3 or WAV format and less than 100MB.</p>
                    <input 
                      type="file" 
                      accept="audio/mp3,audio/wav,.mp3,.wav"
                      onChange={(e) => e.target.files && handleFileUpload('audio', e.target.files[0])}
                      className="hidden"
                    />
                    {uploadedFiles.audio && <p className="text-green-600 text-xs mt-2">✓ {uploadedFiles.audio.name}</p>}
                </label>
             )}

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl py-20 bg-[#FAFBFF] group cursor-pointer hover:border-blue-400 transition-colors">
              <Upload className="w-8 h-8 text-blue-600 mb-3" />
              <p className="text-black font-semibold font-sans">Upload {activeTab === 'podcast' ? 'Cover' : 'Image'}</p>
              <p className="text-black text-xs mt-1 text-center px-4 font-serif">Image must be in JPG or PNG format and at least 300*300 pixels.</p>
              <input 
                type="file" 
                accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files && handleFileUpload(activeTab === 'podcast' ? 'coverImage' : 'image', e.target.files[0])}
                className="hidden"
              />
              {uploadedFiles.image && <p className="text-green-600 text-xs mt-2">✓ {uploadedFiles.image.name}</p>}
              {uploadedFiles.coverImage && <p className="text-green-600 text-xs mt-2">✓ {uploadedFiles.coverImage.name}</p>}
            </label>
          </div>
        )}

        {/* 2. Text Inputs */}
        <div className="space-y-6">
          {activeTab !== 'news' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-black ml-1 font-sans">Title</label>
              <input 
                type="text" 
                placeholder="Enter your story title" 
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gray-300 text-black placeholder:text-black placeholder:opacity-40 font-sans"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-black ml-1 font-sans">
                {activeTab === 'news' ? 'News Content' : 'Summary'}
            </label>
            <div className="relative">
              <textarea 
                rows={activeTab === 'news' ? 8 : 4}
                placeholder={activeTab === 'news' ? "Enter a brief news summary..." : "Enter your article summary"}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gray-300 text-black placeholder:text-black placeholder:opacity-40 resize-none font-serif"
              />
              <span className="absolute bottom-3 right-4 text-[10px] text-black">
                {activeTab === 'news' ? '99/1000' : '100/300'}
              </span>
            </div>
          </div>

          {activeTab === 'podcast' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-black ml-1 font-sans">About this episode</label>
              <textarea 
                placeholder="Enter your episode description..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gray-300 text-black placeholder:text-black placeholder:opacity-40 min-h-[120px] font-serif"
              />
            </div>
          )}
        </div>

        {/* Bottom Helper */}
        <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
           <div className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center text-black cursor-pointer hover:bg-gray-50">
              <Plus className="w-5 h-5" />
           </div>
           <p className="text-black text-sm font-serif">Tell your story...</p>
        </div>
      </div>
    </div>
  );
};

export default Write;