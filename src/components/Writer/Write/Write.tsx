"use client";

import React, { useState } from "react";
import { Plus, Radio, Headphones, Upload, MoreHorizontal } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { createLiveNews, createPodcast, createStory } from "@/components/writerApiClient";


type Category = "story" | "news" | "podcast";

const Write = () => {
  const [activeTab, setActiveTab] = useState<Category>("story");
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [aboutEpisode, setAboutEpisode] = useState("");
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  // File states
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [storyImageFile, setStoryImageFile] = useState<File | null>(null);

  // For live news
  const [newsContent, setNewsContent] = useState("");

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setContent("");
    setAboutEpisode("");
    setCategory("");
    setTagsInput("");
    setIsPremium(false);
    setAudioDuration(0);
    setCoverImageFile(null);
    setAudioFile(null);
    setStoryImageFile(null);
    setNewsContent("");
  };

  const handleFileUpload = (type: "image" | "audio" | "coverImage", file: File) => {
    if (type === "image") setStoryImageFile(file);
    if (type === "coverImage") setCoverImageFile(file);
    if (type === "audio") setAudioFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === "story") {
        if (!title.trim()) throw new Error("Title is required");
        if (!summary.trim()) throw new Error("Summary is required");
        if (!content.trim()) throw new Error("Content is required");
        if (!category.trim()) throw new Error("Category is required");
        if (!storyImageFile) throw new Error("Cover image is required");

        const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
        await createStory({
          title,
          summary,
          content,
          category,
          tags,
          isPremium,
          coverImage: storyImageFile,
        });
        toast.success("Story created as draft!", toastStyle.success);
        resetForm();
      } 
      else if (activeTab === "podcast") {
        if (!title.trim()) throw new Error("Title is required");
        if (!summary.trim()) throw new Error("Summary is required");
        if (!aboutEpisode.trim()) throw new Error("Episode description is required");
        if (!category.trim()) throw new Error("Category is required");
        if (!coverImageFile) throw new Error("Cover image is required");
        if (!audioFile) throw new Error("Audio file is required");
        if (audioDuration <= 0) throw new Error("Audio duration must be greater than 0");

        const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
        await createPodcast({
          title,
          summary,
          aboutEpisode,
          category,
          tags,
          isPremium,
          audioDuration,
          audioFile,
          coverImage: coverImageFile,
        });
        toast.success("Podcast created as draft!", toastStyle.success);
        resetForm();
      } 
      else if (activeTab === "news") {
        if (!newsContent.trim()) throw new Error("News content is required");
        await createLiveNews({ content: newsContent });
        toast.success("Live news posted successfully!", toastStyle.success);
        resetForm();
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong", toastStyle.error);
    } finally {
      setLoading(false);
    }
  };

  // Toast styles (same as in other components)
  const toastStyle = {
    success: {
      style: { background: "#000", color: "#fff", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", fontFamily: "serif", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" },
      iconTheme: { primary: "#fff", secondary: "#000" },
    },
    error: {
      style: { background: "#fff", color: "#ef4444", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", fontFamily: "serif", border: "1px solid #fecaca", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
    },
  };

  const getTabStyles = (type: Category) => {
    if (activeTab !== type) return "bg-[#F0F2F5] text-black border border-[#0000000F]";
    switch (type) {
      case "story":
        return "bg-gradient-to-b from-[#343E87] to-[#3448D6] text-white shadow-[0px_4px_12px_0px_#00000014]";
      case "news":
        return "bg-[#EE1F24] text-white shadow-[0px_4px_12px_0px_#00000014] border border-[#0000000F]";
      case "podcast":
        return "bg-[#000000FA] text-white shadow-[0px_4px_12px_0px_#00000014] border border-[#0000000F]";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans min-h-screen pt-28 md:pt-44 text-black">
      <Toaster position="bottom-center" />

      <h1 className="text-5xl font-sans text-center font-bold mb-12 tracking-tight text-black">
        Please select your upload <br /> category/type
      </h1>

      {/* Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <button onClick={() => setActiveTab("story")} className={`flex flex-col items-center justify-center py-10 rounded-2xl transition-all duration-300 ${getTabStyles("story")}`}>
          <Plus className={`w-8 h-8 mb-2 ${activeTab === "story" ? "text-white" : "text-black"}`} />
          <span className={`text-xl font-sans font-medium ${activeTab === "story" ? "text-white" : "text-black"}`}>Add Story</span>
        </button>
        <button onClick={() => setActiveTab("news")} className={`flex flex-col items-center justify-center py-10 rounded-2xl transition-all duration-300 ${getTabStyles("news")}`}>
          <Radio className={`w-8 h-8 mb-2 ${activeTab === "news" ? "text-white" : "text-[#EE1F24]"}`} />
          <span className={`text-xl font-sans font-medium ${activeTab === "news" ? "text-white" : "text-black"}`}>Add Live News</span>
        </button>
        <button onClick={() => setActiveTab("podcast")} className={`flex flex-col items-center justify-center py-10 rounded-2xl transition-all duration-300 ${getTabStyles("podcast")}`}>
          <Headphones className={`w-8 h-8 mb-2 ${activeTab === "podcast" ? "text-white" : "text-black"}`} />
          <span className={`text-xl font-sans font-medium ${activeTab === "podcast" ? "text-white" : "text-black"}`}>Add Podcast</span>
        </button>
      </div>

      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-8">
        <h2 className="text-2xl font-sans font-medium capitalize text-black">
          Add {activeTab === "news" ? "Live News" : activeTab}
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#1D931D] text-white px-6 py-1.5 rounded-full text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send to Editor"}
          </button>
          <MoreHorizontal className="text-gray-400 cursor-pointer" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
        {/* File Upload Section (conditional) */}
        {(activeTab === "story" || activeTab === "podcast") && (
          <div className="space-y-6">
            {activeTab === "podcast" && (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl py-12 bg-[#FAFBFF] group cursor-pointer hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 text-blue-600 mb-3" />
                <p className="text-black font-semibold font-sans">Upload Audio</p>
                <p className="text-black text-xs mt-1 text-center px-4 font-serif">File must be in MP3 or WAV format and less than 100MB.</p>
                <input
                  type="file"
                  accept="audio/mp3,audio/wav,.mp3,.wav"
                  onChange={(e) => e.target.files && handleFileUpload("audio", e.target.files[0])}
                  className="hidden"
                />
                {audioFile && <p className="text-green-600 text-xs mt-2">✓ {audioFile.name}</p>}
              </label>
            )}

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl py-20 bg-[#FAFBFF] group cursor-pointer hover:border-blue-400 transition-colors">
              <Upload className="w-8 h-8 text-blue-600 mb-3" />
              <p className="text-black font-semibold font-sans">Upload {activeTab === "podcast" ? "Cover" : "Image"}</p>
              <p className="text-black text-xs mt-1 text-center px-4 font-serif">Image must be in JPG or PNG format and at least 300*300 pixels.</p>
              <input
                type="file"
                accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files && handleFileUpload(activeTab === "podcast" ? "coverImage" : "image", e.target.files[0])}
                className="hidden"
              />
              {activeTab === "story" && storyImageFile && <p className="text-green-600 text-xs mt-2">✓ {storyImageFile.name}</p>}
              {activeTab === "podcast" && coverImageFile && <p className="text-green-600 text-xs mt-2">✓ {coverImageFile.name}</p>}
            </label>
          </div>
        )}

        {/* Text Inputs */}
        <div className="space-y-6">
          {activeTab !== "news" && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-black ml-1 font-sans">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your story title"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gray-300 text-black placeholder:text-black placeholder:opacity-40 font-sans"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-black ml-1 font-sans">
              {activeTab === "news" ? "News Content" : "Summary"}
            </label>
            <div className="relative">
              <textarea
                rows={activeTab === "news" ? 8 : 4}
                value={activeTab === "news" ? newsContent : summary}
                onChange={(e) => activeTab === "news" ? setNewsContent(e.target.value) : setSummary(e.target.value)}
                placeholder={activeTab === "news" ? "Enter a brief news summary..." : "Enter your article summary"}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gray-300 text-black placeholder:text-black placeholder:opacity-40 resize-none font-serif"
              />
              <span className="absolute bottom-3 right-4 text-[10px] text-black">
                {activeTab === "news" ? `${newsContent.length}/1000` : `${summary.length}/300`}
              </span>
            </div>
          </div>

          {activeTab === "story" && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-black ml-1 font-sans">Content (Full story)</label>
              <textarea
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your full story here..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gray-300 text-black placeholder:text-black placeholder:opacity-40 resize-none font-serif"
              />
            </div>
          )}

          {activeTab === "podcast" && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-black ml-1 font-sans">About this episode</label>
              <textarea
                rows={6}
                value={aboutEpisode}
                onChange={(e) => setAboutEpisode(e.target.value)}
                placeholder="Enter your episode description..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gray-300 text-black placeholder:text-black placeholder:opacity-40 min-h-[120px] font-serif"
              />
            </div>
          )}

          {/* Common fields: Category, Tags, Premium, Duration (for podcast) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-black ml-1 font-sans">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., technology, politics, business"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gray-300 text-black placeholder:text-black placeholder:opacity-40 font-sans"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-black ml-1 font-sans">Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="media, digital, journalism"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-gray-300 text-black placeholder:text-black placeholder:opacity-40 font-sans"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-sans">Mark as Premium</span>
            </label>

            {activeTab === "podcast" && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-sans">Audio duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={audioDuration}
                  onChange={(e) => setAudioDuration(Number(e.target.value))}
                  className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-center"
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom helper (unchanged) */}
        <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
          <div className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center text-black cursor-pointer hover:bg-gray-50">
            <Plus className="w-5 h-5" />
          </div>
          <p className="text-black text-sm font-serif">Tell your story...</p>
        </div>
      </form>
    </div>
  );
};

export default Write;