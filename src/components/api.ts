// ============================================================
//  api.ts  –  All API endpoint definitions (TypeScript)
// ============================================================

export const BASE_URL = "https://katheleen-unerrant-consolingly.ngrok-free.dev";

export type Role = "reader" | "writer";

// ── Auth Endpoints ─────────────────────────────────────────
export interface AuthEndpoints {
  SIGNUP: string;
  VERIFY_OTP: string;
  RESEND_OTP: string;
  LOGIN: string;
  SOCIAL_LOGIN: string;
  LOGOUT: string;
  REFRESH: string;
  FORGOT: string;
  RESET: string;
}

export const READER_AUTH: AuthEndpoints = {
  SIGNUP: "/api/v1/reader/auth/signup",
  VERIFY_OTP: "/api/v1/reader/auth/verify-otp",
  RESEND_OTP: "/api/v1/reader/auth/resend-otp",
  LOGIN: "/api/v1/reader/auth/login",
  SOCIAL_LOGIN: "/api/v1/reader/auth/social-login",
  LOGOUT: "/api/v1/reader/auth/logout",
  REFRESH: "/api/v1/reader/auth/refresh-token",
  FORGOT: "/api/v1/reader/auth/forgot-password",
  RESET: "/api/v1/reader/auth/reset-password",
};

export const WRITER_AUTH: AuthEndpoints = {
  SIGNUP: "/api/v1/writer/auth/signup",
  VERIFY_OTP: "/api/v1/writer/auth/verify-otp",
  RESEND_OTP: "/api/v1/writer/auth/resend-otp",
  LOGIN: "/api/v1/writer/auth/login",
  SOCIAL_LOGIN: "/api/v1/writer/auth/social-login",
  LOGOUT: "/api/v1/writer/auth/logout",
  REFRESH: "/api/v1/writer/auth/refresh-token",
  FORGOT: "/api/v1/writer/auth/forgot-password",
  RESET: "/api/v1/writer/auth/reset-password",
};

export const AUTH_ENDPOINTS = (role: Role): AuthEndpoints =>
  role === "writer" ? WRITER_AUTH : READER_AUTH;

// ── Profile Endpoints ──────────────────────────────────────
export interface ProfileEndpoints {
  GET_PROFILE: string;
  EDIT_PROFILE: string;
  CHANGE_PASSWORD: string;
}

export const READER_PROFILE: ProfileEndpoints = {
  GET_PROFILE: "/api/v1/reader/profile/get-profile",
  EDIT_PROFILE: "/api/v1/reader/profile/edit",
  CHANGE_PASSWORD: "/api/v1/reader/profile/change-password",
};

export const WRITER_PROFILE: ProfileEndpoints = {
  GET_PROFILE: "/api/v1/writer/profile/get-profile",
  EDIT_PROFILE: "/api/v1/writer/profile/edit",
  CHANGE_PASSWORD: "/api/v1/writer/profile/change-password",
};

export const PROFILE_ENDPOINTS = (role: Role): ProfileEndpoints =>
  role === "writer" ? WRITER_PROFILE : READER_PROFILE;

// ── Story Endpoints ────────────────────────────────────────
export const READER_STORIES = {
  GET_ALL: "/api/v1/story/reader/all",
  GET_DETAIL: (id: string) => `/api/v1/story/reader/detail/${id}`,
} as const;

export const STORY_ENDPOINTS = { READER: READER_STORIES } as const;

// ── Podcast Endpoints ──────────────────────────────────────
export const READER_PODCASTS = {
  GET_ALL: "/api/v1/podcast/reader/all",
  GET_DETAIL: (id: string) => `/api/v1/podcast/reader/detail/${id}`,
} as const;

// ── Comments ────────────────────────────────────────────────
export const COMMENT_ENDPOINTS = {
  ADD: "/api/v1/comment/add",
  EDIT: (commentId: string) => `/api/v1/comment/edit/${commentId}`,
  DELETE: (commentId: string) => `/api/v1/comment/delete/${commentId}`,
  LIKE: (commentId: string) => `/api/v1/comment/like/${commentId}`,
  DISLIKE: (commentId: string) => `/api/v1/comment/dislike/${commentId}`,
  GET_BY_CONTENT: (contentType: string, contentId: string) =>
    `/api/v1/comment/${contentType}/${contentId}`,
};

// ── Reactions ──────────────────────────────────────────────
export const REACTION_ENDPOINTS = {
  ADD: "/api/v1/react/add",
  GET_BY_CONTENT: (contentType: string, contentId: string) =>
    `/api/v1/react/${contentType}/${contentId}`,
  GET_MY_REACTION: (contentType: string, contentId: string) =>
    `/api/v1/react/story/${contentId}`,
};

// ── Library ────────────────────────────────────────────────
// POST   /api/v1/library/toggle         { contentType, contentId, listType }
// GET    /api/v1/library/check?contentId=...&listType=saved  → { isSaved, listType }
// GET    /api/v1/library/saved?contentType=story&page=1&limit=10
// GET    /api/v1/library/read-later?contentType=podcast&page=1&limit=10
// GET    /api/v1/library/user
// DELETE /api/v1/library/remove/:libraryId
export const LIBRARY_ENDPOINTS = {
  TOGGLE: "/api/v1/library/toggle",
  CHECK: "/api/v1/library/check",
  GET_SAVED: "/api/v1/library/saved",
  GET_READ_LATER: "/api/v1/library/read-later",
  GET_USER_LIBRARY: "/api/v1/library/user",
  REMOVE: (libraryId: string) => `/api/v1/library/remove/${libraryId}`,
};

// ── Shared types ───────────────────────────────────────────
export type ContentType = "story" | "podcast";
export type ReactionType = "like" | "love" | "wow" | "sad" | "angry";
export type ListType = "saved" | "readLater";