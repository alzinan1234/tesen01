// ============================================================
//  notificationApiClient.ts  –  Notification API functions
// ============================================================

import { BASE_URL, NOTIFICATION_ENDPOINTS } from "./api";
import { tokenManager } from "./apiClient";

// ── Types ─────────────────────────────────────────────────────

export interface NotificationItem {
  _id:          string;
  receiver:     string;
  receiverRole: string;
  type:         string;         // "comment_reply" | "like" | "saved" | "live_news" | etc.
  message:      string;
  contentType:  string;         // "story" | "podcast"
  contentId:    string;
  isRead:       boolean;
  createdAt:    string;
  updatedAt:    string;
}

export interface GetNotificationsResponse {
  success:     boolean;
  data:        NotificationItem[];
  unreadCount: number;
  pagination: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
  };
}

export interface BasicNotificationResponse {
  success: boolean;
  message: string;
}

export interface MarkReadResponse {
  success: boolean;
  data:    NotificationItem;
}

export interface GetNotificationsParams {
  page?:  number;
  limit?: number;
}

// ── Helper ─────────────────────────────────────────────────────

const getAuthHeaders = (): HeadersInit => {
  const token = tokenManager.getAccess();
  const headers: HeadersInit = {
    "Content-Type":               "application/json",
    
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

// ── API Functions ──────────────────────────────────────────────

/**
 * GET /notification?page=1&limit=20
 * Returns paginated notifications + unreadCount
 */
export async function getNotifications(
  params: GetNotificationsParams = {}
): Promise<GetNotificationsResponse> {
  const { page = 1, limit = 20 } = params;
  const query = new URLSearchParams({
    page:  page.toString(),
    limit: limit.toString(),
  });

  const res = await fetch(
    `${BASE_URL}${NOTIFICATION_ENDPOINTS.GET_ALL}?${query}`,
    { method: "GET", headers: getAuthHeaders() }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt.substring(0, 100)}`);
  }

  const data: GetNotificationsResponse = await res.json();
  if (!data.success) throw new Error("Failed to fetch notifications");
  return data;
}

/**
 * PATCH /notification/{id}/read
 * Mark a single notification as read
 */
export async function markNotificationRead(
  notificationId: string
): Promise<MarkReadResponse> {
  const res = await fetch(
    `${BASE_URL}${NOTIFICATION_ENDPOINTS.MARK_READ(notificationId)}`,
    { method: "PATCH", headers: getAuthHeaders() }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt.substring(0, 100)}`);
  }

  const data: MarkReadResponse = await res.json();
  if (!data.success) throw new Error("Failed to mark notification as read");
  return data;
}

/**
 * PATCH /notification/read-all
 * Mark ALL notifications as read
 */
export async function markAllNotificationsRead(): Promise<BasicNotificationResponse> {
  const res = await fetch(
    `${BASE_URL}${NOTIFICATION_ENDPOINTS.MARK_ALL_READ}`,
    { method: "PATCH", headers: getAuthHeaders() }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt.substring(0, 100)}`);
  }

  const data: BasicNotificationResponse = await res.json();
  if (!data.success) throw new Error("Failed to mark all notifications as read");
  return data;
}

/**
 * DELETE /notification/{id}
 * Delete a single notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<BasicNotificationResponse> {
  const res = await fetch(
    `${BASE_URL}${NOTIFICATION_ENDPOINTS.DELETE(notificationId)}`,
    { method: "DELETE", headers: getAuthHeaders() }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt.substring(0, 100)}`);
  }

  const data: BasicNotificationResponse = await res.json();
  if (!data.success) throw new Error("Failed to delete notification");
  return data;
}