// ============================================================
//  storyApiClient.ts  –  Story listing & detail API client
// ============================================================

import { BASE_URL, READER_STORIES, StoryListParams } from "./api";

// ── Types (matching your API response) ─────────────────────

export interface StoryAuthor {
  _id: string;
  name: string;
  profileImage: string;
  bio?: string;
}

export interface Story {
  _id: string;
  title: string;
  summary: string;
  coverImage: string;
  category: string;
  isPremium: boolean;
  author: StoryAuthor;
  scheduledAt: string | null;
  readingTime: number;
  createdAt: string;
  // optional for detail
  content?: string;
  tags?: string[];
  status?: string;
  feedback?: any;
}

export interface StoriesPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StoriesResponse {
  success: boolean;
  data: Story[];
  pagination: StoriesPagination;
}

export interface StoryDetailResponse {
  success: boolean;
  isPremium?: boolean;
  subscriptionRequired?: boolean;
  message?: string;
  data?: Story;
}

// ── Helpers ─────────────────────────────────────────────────

function buildQueryString(params: StoryListParams): string {
  const query = new URLSearchParams();
  if (params.category && params.category !== "explore")
    query.set("category", params.category);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("oped_access_token") ??
    localStorage.getItem("reader_access_token") ??
    localStorage.getItem("accessToken") ??
    localStorage.getItem("token") ??
    null
  );
}

// ── Core fetch functions ───────────────────────────────────

export async function fetchStories(
  params: StoryListParams = {}
): Promise<StoriesResponse> {
  const token = getAccessToken();
  const qs = buildQueryString(params);
  const url = `${BASE_URL}${READER_STORIES.GET_ALL}${qs}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      msg = body?.message ?? msg;
    } catch {}
    throw new Error(msg);
  }

  const data: StoriesResponse = await res.json();
  if (!data.success) throw new Error("Server returned success: false");
  return data;
}

export async function fetchStoryDetail(id: string): Promise<StoryDetailResponse> {
  const token = getAccessToken();
  const url = `${BASE_URL}${READER_STORIES.GET_DETAIL(id)}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      msg = body?.message ?? msg;
    } catch {}
    throw new Error(msg);
  }

  return await res.json();
}