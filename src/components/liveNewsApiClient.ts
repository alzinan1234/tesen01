// liveNewsApiClient.ts
import { BASE_URL, READER_LIVE_NEWS } from "./api";
import { tokenManager } from "./apiClient";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Author {
  _id: string;
  name: string;
  profileImage: string;
}

export interface LiveNewsItem {
  _id: string;
  content: string;
  author: Author;
  type: string;
  postedAt: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface GetLiveNewsResponse {
  success: boolean;
  data: LiveNewsItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetLiveNewsParams {
  page: number;
  limit: number;
}

// ─── Helper Functions ─────────────────────────────────────────────────────

const getAuthHeaders = (): HeadersInit => {
  const token = tokenManager.getAccess(); // ✅ correct method from apiClient.ts
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// ─── API Calls ────────────────────────────────────────────────────────────

/**
 * Get all Live News for readers
 */
export async function getLiveNews(
  params: GetLiveNewsParams
): Promise<GetLiveNewsResponse> {
  const { page, limit } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const url = `${BASE_URL}${READER_LIVE_NEWS.GET_LIVE_NEWS}?${queryParams}`; // ✅ correct export from api.ts

  console.log("Fetching live news from:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data: GetLiveNewsResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch live news");
    }

    return data;
  } catch (error) {
    console.error("Get live news error:", error);
    throw error;
  }
}