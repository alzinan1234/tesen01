
// ============================================================
//  profileApiClient.ts  –  Profile API functions (TypeScript)
//  GET profile, PATCH edit profile (with image upload),
//  PATCH change password
// ============================================================

import apiClient from "./apiClient";          // your existing axios instance
import { PROFILE_ENDPOINTS, Role } from "./api";

// ── Response / Payload Types ──────────────────────────────────

export interface ReaderProfile {
  _id:           string;
  name:          string;
  email:         string;
  isVerified:    boolean;
  isSubscribed:  boolean;
  profileImage:  string;
  phoneNumber:   string | null;
  bio:           string | null;
  isSocialLogin: boolean;
  createdAt:     string;
  updatedAt:     string;
}

export interface GetProfileResponse {
  success: boolean;
  data:    ReaderProfile;
}

export interface EditProfileResponse {
  success: boolean;
  message: string;
  data:    ReaderProfile;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// Edit profile payload — all fields optional, image is a File
export interface EditProfilePayload {
  name?:         string;
  bio?:          string;
  phoneNumber?:  string;
  profileImage?: File | null; // actual file for upload
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

// ── API Functions ─────────────────────────────────────────────

/**
 * GET /api/v1/{role}/profile/get-profile
 * Requires Bearer token (handled by axios interceptor)
 */
export const getProfile = async (role: Role): Promise<ReaderProfile> => {
  const { data } = await apiClient.get<GetProfileResponse>(
    PROFILE_ENDPOINTS(role).GET_PROFILE
  );
  return data.data;
};

/**
 * PATCH /api/v1/{role}/profile/edit
 * Sends multipart/form-data so the profile image can be uploaded.
 * Only changed fields need to be included.
 */
export const editProfile = async (
  role: Role,
  payload: EditProfilePayload
): Promise<EditProfileResponse> => {
  const form = new FormData();

  if (payload.name        !== undefined) form.append("name",         payload.name);
  if (payload.bio         !== undefined) form.append("bio",          payload.bio);
  if (payload.phoneNumber !== undefined) form.append("phoneNumber",  payload.phoneNumber);
  if (payload.profileImage)             form.append("profileImage",  payload.profileImage);

  const { data } = await apiClient.patch<EditProfileResponse>(
    PROFILE_ENDPOINTS(role).EDIT_PROFILE,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
};

/**
 * PATCH /api/v1/{role}/profile/change-password
 * Body: { oldPassword, newPassword }
 */
export const changePassword = async (
  role: Role,
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> => {
  const { data } = await apiClient.patch<ChangePasswordResponse>(
    PROFILE_ENDPOINTS(role).CHANGE_PASSWORD,
    payload
  );
  return data;
};