// ============================================================
//  socialApiClient.ts  –  Comments, Reactions, Library
// ============================================================

import {
  BASE_URL,
  COMMENT_ENDPOINTS,
  REACTION_ENDPOINTS,
  LIBRARY_ENDPOINTS,
  ContentType,
  ReactionType,
  ListType,
} from "./api";

// ── Token helper ───────────────────────────────────────────
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

// ── Generic request helper ─────────────────────────────────
async function apiRequest<T>(
  url: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: unknown
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    Accept: "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options: RequestInit = { method, headers };
  if (body !== undefined) options.body = JSON.stringify(body);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${url}`, options);
  } catch {
    throw new Error("Network error — please check your connection.");
  }

  // Guard against HTML responses (ngrok warning pages, 502s, etc.)
  const ct = response.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    throw new Error(
      `Unexpected server response (status ${response.status}). Please try again.`
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error("Failed to parse server response.");
  }

  if (!response.ok)
    throw new Error(data?.message || `Request failed: ${response.status}`);
  if (data?.success === false)
    throw new Error(data.message || "Request failed");

  return data as T;
}

// ============================================================
//  Types
// ============================================================

export interface CommentAuthor {
  _id: string;
  name: string;
  profileImage: string;
}

export interface Comment {
  _id: string;
  content: string;
  contentType: string;
  contentId: string;
  author: string | CommentAuthor;
  authorRole: string;
  parentComment: string | null;
  likes: string[];
  dislikes: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
  dislikesCount?: number;
  replies?: Comment[];
}

export interface CommentsResponse {
  success: boolean;
  data: Comment[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface ReactionSummary {
  like: number;
  love: number;
  wow: number;
  sad: number;
  angry: number;
  total: number;
}

export interface LibraryContent {
  _id: string;
  title: string;
  summary: string;
  coverImage: string;
  category: string;
  isPremium: boolean;
  author: { _id: string; name: string; profileImage: string };
  readingTime?: number;
  audioDuration?: number;
  createdAt: string;
}

export interface LibraryItem {
  libraryId: string;
  listType: ListType;
  contentType: ContentType;
  savedAt: string;
  content: LibraryContent;
}

export interface LibraryResponse {
  success: boolean;
  data: LibraryItem[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// ============================================================
//  Comment APIs
// ============================================================

/** Add a top-level comment or a reply (pass parentComment for reply). */
export const addComment = async (
  contentType: ContentType,
  contentId: string,
  content: string,
  parentComment?: string
): Promise<{ success: boolean; message: string; data: Comment }> => {
  const body: Record<string, string> = { contentType, contentId, content };
  if (parentComment) body.parentComment = parentComment;
  return apiRequest(COMMENT_ENDPOINTS.ADD, "POST", body);
};

/** Edit your own comment. */
export const editComment = async (
  commentId: string,
  content: string
): Promise<{ success: boolean; message: string; data: Comment }> =>
  apiRequest(COMMENT_ENDPOINTS.EDIT(commentId), "PATCH", { content });

/** Delete your own comment. */
export const deleteComment = async (
  commentId: string
): Promise<{ success: boolean; message: string }> =>
  apiRequest(COMMENT_ENDPOINTS.DELETE(commentId), "DELETE");

/** Toggle like on a comment. Returns updated counts. */
export const likeComment = async (
  commentId: string
): Promise<{ success: boolean; message: string; data: { likesCount: number; dislikesCount: number } }> =>
  apiRequest(COMMENT_ENDPOINTS.LIKE(commentId), "PATCH");

/** Toggle dislike on a comment. Returns updated counts. */
export const dislikeComment = async (
  commentId: string
): Promise<{ success: boolean; message: string; data: { likesCount: number; dislikesCount: number } }> =>
  apiRequest(COMMENT_ENDPOINTS.DISLIKE(commentId), "PATCH");

/** Get paginated comments for any content. Returns top-level + nested replies. */
export const getComments = async (
  contentType: ContentType,
  contentId: string,
  page = 1,
  limit = 10
): Promise<CommentsResponse> =>
  apiRequest(
    `${COMMENT_ENDPOINTS.GET_BY_CONTENT(contentType, contentId)}?page=${page}&limit=${limit}`,
    "GET"
  );

// ============================================================
//  Reaction APIs
// ============================================================

/** Toggle a reaction (same type = remove). */
export const addReaction = async (
  contentType: ContentType,
  contentId: string,
  reactionType: ReactionType
): Promise<{ success: boolean; message: string; data: ReactionSummary }> =>
  apiRequest(REACTION_ENDPOINTS.ADD, "POST", { contentType, contentId, reactionType });

/** Get all reactions + current user's reaction for a content item. */
export const getMyReaction = async (
  contentType: ContentType,
  contentId: string
): Promise<{ success: boolean; data: { summary: ReactionSummary; myReaction?: ReactionType | null } }> =>
  apiRequest(REACTION_ENDPOINTS.GET_MY_REACTION(contentType, contentId), "GET");

// ============================================================
//  Library APIs
// ============================================================

/**
 * Check if content is saved/readLater — NO side effects.
 * GET /api/v1/library/check?contentId=...&listType=saved
 */
export const checkSaved = async (
  contentId: string,
  listType: ListType = "saved"
): Promise<{ success: boolean; data: { isSaved: boolean; listType: ListType } }> =>
  apiRequest(
    `${LIBRARY_ENDPOINTS.CHECK}?contentId=${contentId}&listType=${listType}`,
    "GET"
  );

/**
 * Toggle save / readLater for any content.
 * First call → added (isSaved: true). Second call → removed (isSaved: false).
 */
export const toggleSave = async (
  contentType: ContentType,
  contentId: string,
  listType: ListType = "saved"
): Promise<{ success: boolean; message: string; data: { isSaved: boolean; listType: ListType } }> =>
  apiRequest(LIBRARY_ENDPOINTS.TOGGLE, "POST", { contentType, contentId, listType });

/** Get reader's saved list. */
export const getSavedList = async (
  contentType?: ContentType,
  page = 1,
  limit = 10
): Promise<LibraryResponse> => {
  const p = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (contentType) p.set("contentType", contentType);
  return apiRequest(`${LIBRARY_ENDPOINTS.GET_SAVED}?${p}`, "GET");
};

/** Get reader's read-later list. */
export const getReadLaterList = async (
  contentType?: ContentType,
  page = 1,
  limit = 10
): Promise<LibraryResponse> => {
  const p = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (contentType) p.set("contentType", contentType);
  return apiRequest(`${LIBRARY_ENDPOINTS.GET_READ_LATER}?${p}`, "GET");
};

/** Remove a specific item from library by its libraryId. */
export const removeFromLibrary = async (
  libraryId: string
): Promise<{ success: boolean; message: string }> =>
  apiRequest(LIBRARY_ENDPOINTS.REMOVE(libraryId), "DELETE");

/** Get all library items (saved + readLater) for the current user. */
export const getUserLibrary = async (
  page = 1,
  limit = 10
): Promise<LibraryResponse> =>
  apiRequest(`${LIBRARY_ENDPOINTS.GET_USER_LIBRARY}?page=${page}&limit=${limit}`, "GET");