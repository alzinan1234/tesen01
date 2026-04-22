"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Calendar, Clock, Tag, Lock, Eye, Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getWriterStoryDetail } from "@/components/writerStoryApiClient";
import toast, { Toaster } from "react-hot-toast";

interface StoryDetail {
  _id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
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
  feedback: string | null;
  scheduledAt: string | null;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

const WriterStoryDetailPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getWriterStoryDetail(id);
        setStory(res.data);
      } catch (err: any) {
        console.error("Detail fetch error:", err);
        setError(err.message || "Failed to load story");
        toast.error(err.message || "Failed to load story");
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

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-200 text-gray-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "published": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "revision": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 font-sans text-black pt-28 md:pt-40">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-8" />
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

  if (error || !story) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-red-500">{error || "Story not found"}</p>
        <Link href="/writer" className="mt-4 inline-block px-4 py-2 bg-black text-white rounded-lg">
          Back to Stories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans text-black pt-28 md:pt-40">
      <Toaster position="bottom-center" />

      {/* Back button */}
      <Link href="/writer" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition">
        <ArrowLeft size={20} />
        <span>Back to all stories</span>
      </Link>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-sans font-bold mb-6 tracking-tight">
          {story.title}
        </h1>
        <p className="text-xl font-serif text-gray-600 max-w-3xl mx-auto">
          {story.summary}
        </p>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>{story.readingTime} min read</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>Created: {formatDate(story.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>Updated: {formatDate(story.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Tag size={16} />
          <span>{story.category}</span>
        </div>
        {story.isPremium && (
          <div className="flex items-center gap-2 text-blue-600">
            <Lock size={16} />
            <span>Premium</span>
          </div>
        )}
        <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(story.status)}`}>
          <Eye size={12} />
          <span>{story.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Scheduled Date (if exists) */}
      {story.scheduledAt && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
            <Calendar size={14} />
            <span>Scheduled for: {formatDateTime(story.scheduledAt)}</span>
          </div>
        </div>
      )}

      {/* Author */}
      <div className="flex items-center justify-center gap-3 mb-16">
        <img
          src={story.author.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.author.name)}&background=random`}
          alt={story.author.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-sans font-bold">{story.author.name}</p>
          <p className="text-sm text-gray-500">{story.author.email}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="flex-1 order-2 md:order-1">
          <div className="prose prose-lg font-serif text-black leading-relaxed max-w-none">
            {story.content.split("\n\n").map((para, idx) => (
              <p key={idx} className="mb-4">{para}</p>
            ))}
          </div>

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-sans font-bold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Editor Feedback (if any) */}
          {story.feedback && (
            <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <h3 className="text-sm font-sans font-bold mb-1 text-yellow-800">Editor Feedback</h3>
              <p className="text-sm text-yellow-700">{story.feedback}</p>
            </div>
          )}

          {/* Edit Button (link to edit page – you can implement later) */}
          {/* <div className="mt-10">
            <Link
              href={`/writer/stories/edit/${story._id}`}
              className="inline-flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition"
            >
              <Edit size={16} />
              Edit Story
            </Link>
          </div> */}
        </div>

        {/* Cover Image */}
        <div className="w-full md:w-[450px] order-1 md:order-2 relative group shrink-0">
          <div className="aspect-[16/10] rounded-[2rem] overflow-hidden shadow-lg">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-full object-cover"
              onError={(e) => (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriterStoryDetailPage;