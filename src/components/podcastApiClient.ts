// ============================================================
//  podcastApiClient.ts  –  API client for podcasts
// ============================================================

import { BASE_URL, READER_PODCASTS } from "./api";

// ── Types (based on your API response) ─────────────────────

export interface PodcastAuthor {
  _id: string;
  name: string;
  profileImage: string;
  bio?: string;
}

export interface Podcast {
  _id: string;
  title: string;
  summary: string;
  coverImage: string;
  audioDuration: number;       // in minutes
  category: string;
  tags: string[];
  isPremium: boolean;
  author: PodcastAuthor;
  createdAt: string;
  // optional for detail
  aboutEpisode?: string;
  audioFile?: string;
  status?: string;
}

export interface PodcastsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PodcastsResponse {
  success: boolean;
  data: Podcast[];
  pagination: PodcastsPagination;
}

export interface PodcastDetailResponse {
  success: boolean;
  isPremium?: boolean;
  subscriptionRequired?: boolean;
  message?: string;
  data?: Podcast;
}

// ── PodcastListParams type definition ─────────────────────
export interface PodcastListParams {
  category?: string;
  page?: number;
  limit?: number;
}

// ── Helpers ─────────────────────────────────────────────────

function buildQueryString(params: PodcastListParams): string {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
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

export async function fetchAllPodcasts(
  params: PodcastListParams = {}
): Promise<PodcastsResponse> {
  const token = getAccessToken();
  const qs = buildQueryString(params);
  const url = `${BASE_URL}${READER_PODCASTS.GET_ALL}${qs}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",

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

  const data: PodcastsResponse = await res.json();
  if (!data.success) throw new Error("Server returned success: false");
  return data;
}

export async function fetchPodcastDetail(id: string): Promise<PodcastDetailResponse> {
  const token = getAccessToken();
  const url = `${BASE_URL}${READER_PODCASTS.GET_DETAIL(id)}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  
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