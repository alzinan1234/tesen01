// writerPodcastApiClient.ts – for writer podcast actions (list, detail)

import { BASE_URL, WRITER_PODCAST_ENDPOINTS } from "./api";

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

async function apiRequest<T>(url: string): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",  // critical for ngrok
    Accept: "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${url}`, { headers });

  // Guard against HTML responses (ngrok warning pages, 502s)
  const ct = response.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    throw new Error(
      `Unexpected server response (status ${response.status}). Please check your token or network.`
    );
  }

  const data = await response.json();
  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `Request failed: ${response.status}`);
  }
  return data as T;
}

export interface GetWriterPodcastsParams {
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export const getWriterPodcasts = async (params: GetWriterPodcastsParams = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append("status", params.status);
  if (params.category) queryParams.append("category", params.category);
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));
  const url = `${WRITER_PODCAST_ENDPOINTS.GET_ALL}${queryParams.toString() ? `?${queryParams}` : ""}`;
  return apiRequest<any>(url);
};

export const getWriterPodcastDetail = async (podcastId: string) => {
  return apiRequest<any>(WRITER_PODCAST_ENDPOINTS.GET_DETAIL(podcastId));
};