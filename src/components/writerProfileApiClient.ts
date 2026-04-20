// ============================================================
//  writerProfileApiClient.ts  –  Writer Profile API functions
//  GET profile, PATCH edit (multipart), PATCH change password
// ============================================================

import apiClient from "./apiClient";   // your existing axios instance — adjust path
import { PROFILE_ENDPOINTS } from "./api"; // adjust path

// ── Response Types ────────────────────────────────────────────

export interface WriterProfile {
  _id:           string;
  name:          string;
  email:         string;
  isVerified:    boolean;
  profileImage:  string;
  phoneNumber:   string | null;
  bio:           string | null;
  address:       string | null;   // writer-only field
  age:           number | null;   // writer-only field
  isSocialLogin: boolean;
  createdAt:     string;
  updatedAt:     string;
}

export interface GetWriterProfileResponse {
  success: boolean;
  data:    WriterProfile;
}

export interface EditWriterProfileResponse {
  success: boolean;
  message: string;
  data:    WriterProfile;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// ── Payload Types ─────────────────────────────────────────────

export interface EditWriterProfilePayload {
  name?:         string;
  bio?:          string;
  phoneNumber?:  string;
  address?:      string;
  age?:          number;
  profileImage?: File | null;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

// ── API Functions ─────────────────────────────────────────────

/**
 * GET /api/v1/writer/profile/get-profile
 * Bearer token attached automatically by axios interceptor
 */
export const getWriterProfile = async (): Promise<WriterProfile> => {
  const { data } = await apiClient.get<GetWriterProfileResponse>(
    PROFILE_ENDPOINTS("writer").GET_PROFILE
  );
  return data.data;
};

/**
 * PATCH /api/v1/writer/profile/edit
 * multipart/form-data — supports profileImage file upload
 * Writer has extra fields: address, age
 */
export const editWriterProfile = async (
  payload: EditWriterProfilePayload
): Promise<EditWriterProfileResponse> => {
  const form = new FormData();

  if (payload.name         !== undefined) form.append("name",         payload.name);
  if (payload.bio          !== undefined) form.append("bio",          payload.bio);
  if (payload.phoneNumber  !== undefined) form.append("phoneNumber",  payload.phoneNumber);
  if (payload.address      !== undefined) form.append("address",      payload.address);
  if (payload.age          !== undefined) form.append("age",          String(payload.age));
  if (payload.profileImage)              form.append("profileImage",  payload.profileImage);

  const { data } = await apiClient.patch<EditWriterProfileResponse>(
    PROFILE_ENDPOINTS("writer").EDIT_PROFILE,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
};

/**
 * PATCH /api/v1/writer/profile/change-password
 * Body: { oldPassword, newPassword }
 */
export const changeWriterPassword = async (
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> => {
  const { data } = await apiClient.patch<ChangePasswordResponse>(
    PROFILE_ENDPOINTS("writer").CHANGE_PASSWORD,
    payload
  );
  return data;
};