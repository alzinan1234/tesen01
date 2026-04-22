"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Headphones, Calendar, Clock, Tag, Lock } from "lucide-react";
import { getWriterPodcastDetail } from "@/components/writerPodcastApiClient";
import toast, { Toaster } from "react-hot-toast";

interface PodcastDetail {
  _id: string;
  title: string;
  summary: string;
  aboutEpisode: string;
  coverImage: string;
  audioFile: string;
  audioDuration: number;
  category: string;
  tags: string[];
  isPremium: boolean;
  status: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profileImage: string;
  };
  createdAt: string;
  updatedAt: string;
}

const PodcastDetailPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const [podcast, setPodcast] = useState<PodcastDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getWriterPodcastDetail(id);
        setPodcast(res.data);
      } catch (err: any) {
        console.error("Detail fetch error:", err);
        setError(err.message || "Failed to load podcast");
        toast.error(err.message || "Failed to load podcast");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 font-sans text-black pt-28 md:pt-40">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-6" />
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8" />
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-1 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
            <div className="w-full md:w-[450px] h-[280px] bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !podcast) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-red-500">{error || "Podcast not found"}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-black text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans text-black pt-28 md:pt-40">
      <Toaster position="bottom-center" />

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-sans font-bold mb-6 tracking-tight">
          {podcast.title}
        </h1>
        <p className="text-xl font-serif text-gray-600 max-w-3xl mx-auto">
          {podcast.summary}
        </p>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>{podcast.audioDuration} min</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{formatDate(podcast.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Tag size={16} />
          <span>{podcast.category}</span>
        </div>
        {podcast.isPremium && (
          <div className="flex items-center gap-2 text-blue-600">
            <Lock size={16} />
            <span>Premium</span>
          </div>
        )}
        {podcast.status === "draft" && (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">Draft</span>
        )}
      </div>

      {/* Author */}
      <div className="flex items-center justify-center gap-3 mb-16">
        <img
          src={podcast.author.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(podcast.author.name)}&background=random`}
          alt={podcast.author.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-sans font-bold">{podcast.author.name}</p>
          <p className="text-sm text-gray-500">{podcast.author.email}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="flex-1 order-2 md:order-1">
          <h2 className="text-2xl font-sans font-bold mb-4">About this episode</h2>
          <div className="prose prose-lg font-serif text-black leading-relaxed">
            {podcast.aboutEpisode?.split("\n\n").map((para, idx) => (
              <p key={idx} className="mb-4">{para}</p>
            ))}
          </div>

          {podcast.tags && podcast.tags.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-sans font-bold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {podcast.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Audio Player */}
          <div className="mt-10">
            <h3 className="text-lg font-sans font-bold mb-3">Listen to the episode</h3>
            <audio controls className="w-full rounded-lg">
              <source src={podcast.audioFile} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>

        <div className="w-full md:w-[450px] order-1 md:order-2 relative group shrink-0">
          <div className="aspect-[16/10] rounded-[2rem] overflow-hidden shadow-lg">
            <img
              src={podcast.coverImage}
              alt={podcast.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-md">
            <Headphones className="w-5 h-5 text-black" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastDetailPage;