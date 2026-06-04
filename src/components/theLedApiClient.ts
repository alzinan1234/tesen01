// ============================================================
//  theLedApiClient.ts  –  API client for "The Lede" story slider
// ============================================================

import { BASE_URL, READER_STORIES } from "./api";

// ── StoryListParams type definition ───────────────────────────
export interface StoryListParams {
  category?: string;
  page?: number;
  limit?: number;
}

// ── Types ─────────────────────────────────────────────────────

export interface StoryAuthor {
  _id:          string;
  name:         string;
  profileImage: string;
}

export interface Story {
  _id:         string;
  title:       string;
  summary:     string;
  coverImage:  string;
  category:    string;
  isPremium:   boolean;
  author:      StoryAuthor;
  scheduledAt: string | null;
  readingTime: number;
  createdAt:   string;
}

export interface StoriesPagination {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface StoriesResponse {
  success:    boolean;
  data:       Story[];
  pagination: StoriesPagination;
}

// ── Helpers ───────────────────────────────────────────────────

function buildQueryString(params: StoryListParams): string {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.page)     query.set("page",  String(params.page));
  if (params.limit)    query.set("limit", String(params.limit));
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  // 🔧 FIX: also check the token key used by your auth system ("oped_access_token")
  return (
    localStorage.getItem("oped_access_token") ??      // <-- added
    localStorage.getItem("reader_access_token") ??
    localStorage.getItem("accessToken") ??
    localStorage.getItem("token") ??
    null
  );
}

// ── Core fetch ────────────────────────────────────────────────

export async function fetchLedeStories(
  params: StoryListParams = {}
): Promise<StoriesResponse> {
  const token = getAccessToken();
  const qs    = buildQueryString(params);
  const url   = `${BASE_URL}${READER_STORIES.GET_ALL}${qs}`;

  const headers: Record<string, string> = {
    "Content-Type":               "application/json",
  
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers,
      // ❌ NO credentials:"include" — causes CORS preflight failure with ngrok
    });
  } catch (networkErr: any) {
    throw new Error(
      `Network error — ngrok tunnel may be down or CORS is blocking the request. ` +
      `(${networkErr?.message ?? "Unknown network error"})`
    );
  }

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body?.message ?? message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  const data: StoriesResponse = await response.json();

  // 🔧 FIX: some backends return { stories: [], ... } instead of { data: [] }
  //        gracefully adapt if needed
  if (!data.success) {
    // If the API returns success:false but still has data in another field
    if ((data as any).stories) {
      return {
        success: true,
        data: (data as any).stories,
        pagination: (data as any).pagination || { total: 0, page: 1, limit: 10, totalPages: 0 }
      };
    }
    throw new Error("Server returned success: false");
  }

  return data;
}

/** Fetch all stories (no category filter) */
export const fetchAllLedeStories = (page = 1, limit = 10) =>
  fetchLedeStories({ page, limit });

/** Fetch stories filtered by a category */
export const fetchLedeStoriesByCategory = (
  category: string,
  page  = 1,
  limit = 10
) => fetchLedeStories({ category, page, limit });