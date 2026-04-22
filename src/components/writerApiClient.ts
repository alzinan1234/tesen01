// writerApiClient.ts – for writer actions (create story, podcast, live news)

import { BASE_URL, WRITER_CREATE } from "./api";

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

// Helper for multipart/form-data requests (file uploads)
async function apiFormRequest<T>(
  url: string,
  formData: FormData
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers,
    body: formData,
  });

  // Check content-type
  const ct = response.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    throw new Error(`Unexpected server response (status ${response.status})`);
  }

  const data = await response.json();
  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `Request failed: ${response.status}`);
  }
  return data as T;
}

// Create Story (multipart/form-data)
export interface CreateStoryPayload {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];          // will be stringified
  isPremium: boolean;
  coverImage: File;        // actual file
}

export const createStory = async (payload: CreateStoryPayload) => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("summary", payload.summary);
  formData.append("content", payload.content);
  formData.append("category", payload.category);
  formData.append("tags", JSON.stringify(payload.tags));
  formData.append("isPremium", String(payload.isPremium));
  formData.append("coverImage", payload.coverImage);

  return apiFormRequest<any>(WRITER_CREATE.STORY, formData);
};

// Create Podcast (multipart/form-data)
export interface CreatePodcastPayload {
  title: string;
  summary: string;
  aboutEpisode: string;
  category: string;
  tags: string[];
  isPremium: boolean;
  audioDuration: number;   // in minutes
  audioFile: File;
  coverImage: File;
}

export const createPodcast = async (payload: CreatePodcastPayload) => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("summary", payload.summary);
  formData.append("aboutEpisode", payload.aboutEpisode);
  formData.append("category", payload.category);
  formData.append("tags", JSON.stringify(payload.tags));
  formData.append("isPremium", String(payload.isPremium));
  formData.append("audioDuration", String(payload.audioDuration));
  formData.append("audioFile", payload.audioFile);
  formData.append("coverImage", payload.coverImage);

  return apiFormRequest<any>(WRITER_CREATE.PODCAST, formData);
};

// Create Live News (JSON body, no file)
export interface CreateLiveNewsPayload {
  content: string;
}

export const createLiveNews = async (payload: CreateLiveNewsPayload) => {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${WRITER_CREATE.LIVE_NEWS}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Failed to post live news");
  }
  return data;
};