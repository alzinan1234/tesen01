// ============================================================
//  apiClient.ts  –  Axios instance + token management
//                   + ALL auth API functions (TypeScript)
// ============================================================

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { BASE_URL, AUTH_ENDPOINTS, Role } from "./api";

// ── Types ─────────────────────────────────────────────────────

export interface UserProfile {
  id:           string;
  name:         string;
  email:        string;
  profileImage: string;
  isSubscribed: boolean;
  bio?:         string;
}

export interface AuthResponse {
  success:       boolean;
  message:       string;
  access_token:  string;
  refresh_token: string;
  data?:         UserProfile;
}

export interface SignUpResponse {
  success: boolean;
  message: string;
  data: {
    id:    string;
    email: string;
  };
}

export interface BasicResponse {
  success: boolean;
  message: string;
}

export interface RefreshResponse {
  access_token:   string;
  refresh_token?: string;
}

// ── Payload types ─────────────────────────────────────────────

export interface SignUpPayload {
  name:     string;
  email:    string;
  password: string;
  role:     Role;
}

export interface VerifyOtpPayload {
  email: string;
  otp:   string;
  role:  Role;
}

export interface ResendOtpPayload {
  email: string;
  role:  Role;
}

export interface LoginPayload {
  email:    string;
  password: string;
  role:     Role;
}

export interface SocialLoginPayload {
  name:  string;
  email: string;
  photo: string;
  role:  Role;
}

export interface ForgotPasswordPayload {
  email: string;
  role:  Role;
}

export interface ResetPasswordPayload {
  email:       string;
  otp:         string;
  newPassword: string;
  role:        Role;
}

// ── Token Manager ─────────────────────────────────────────────

const TOKEN_KEY   = "oped_access_token";
const REFRESH_KEY = "oped_refresh_token";
const ROLE_KEY    = "oped_role";
const USER_KEY    = "oped_user";

export const tokenManager = {
  getAccess: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,

  getRefresh: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null,

  getRole: (): Role | null =>
    typeof window !== "undefined"
      ? (localStorage.getItem(ROLE_KEY) as Role | null)
      : null,

  getUser: (): UserProfile | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  },

  setTokens: (
    access:  string,
    refresh: string,
    role?:   Role,
    user?:   UserProfile | null
  ): void => {
    localStorage.setItem(TOKEN_KEY,   access);
    localStorage.setItem(REFRESH_KEY, refresh);
    if (role) localStorage.setItem(ROLE_KEY, role);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAll: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isLoggedIn: (): boolean =>
    typeof window !== "undefined" && !!localStorage.getItem(TOKEN_KEY),
};

// ── Axios Instance ────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type":               "application/json",
   
  },
  timeout: 15000,
});

// ── Request interceptor – attach Bearer token ─────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = tokenManager.getAccess();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor – auto token refresh on 401 ─────────

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject:  (err: unknown) => void;
}> = [];

const processQueue = (
  error: unknown,
  token: string | null = null
): void => {
  refreshQueue.forEach((p) =>
    error ? p.reject(error) : p.resolve(token!)
  );
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          if (original.headers)
            original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        const role         = tokenManager.getRole() ?? "reader";
        const refreshToken = tokenManager.getRefresh();

        // ── FIX: don't attempt refresh if no refresh token ──
        if (!refreshToken) {
          tokenManager.clearAll();
          if (typeof window !== "undefined") window.location.href = "/";
          return Promise.reject(error);
        }

        const endpoint = AUTH_ENDPOINTS(role).REFRESH;

        const { data } = await axios.post<RefreshResponse>(
          `${BASE_URL}${endpoint}`,
          { refresh_token: refreshToken },
          
        );

        const newAccess   = data.access_token;
        const newRefresh  = data.refresh_token ?? refreshToken;

        tokenManager.setTokens(newAccess, newRefresh, role);
        processQueue(null, newAccess);

        if (original.headers)
          original.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenManager.clearAll();
        if (typeof window !== "undefined") window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── AUTH API FUNCTIONS ────────────────────────────────────────

/**
 * Sign up (reader or writer)
 * POST /api/v1/{role}/auth/signup
 * Body: { name, email, password }
 */
export const signUp = async (
  payload: SignUpPayload
): Promise<SignUpResponse> => {
  const { name, email, password, role } = payload;
  const { data } = await apiClient.post<SignUpResponse>(
    AUTH_ENDPOINTS(role).SIGNUP,
    { name, email, password }
  );
  return data;
};

/**
 * Verify OTP after signup
 * POST /api/v1/{role}/auth/verify-otp
 * Body: { email, otp }
 */
export const verifyOtp = async (
  payload: VerifyOtpPayload
): Promise<AuthResponse> => {
  const { email, otp, role } = payload;
  const { data } = await apiClient.post<AuthResponse>(
    AUTH_ENDPOINTS(role).VERIFY_OTP,
    { email, otp }
  );
  if (data.access_token) {
    tokenManager.setTokens(
      data.access_token,
      data.refresh_token,
      role,
      data.data ?? null
    );
  }
  return data;
};

/**
 * Resend OTP
 * POST /api/v1/{role}/auth/resend-otp
 * Body: { email }
 */
export const resendOtp = async (
  payload: ResendOtpPayload
): Promise<BasicResponse> => {
  const { email, role } = payload;
  const { data } = await apiClient.post<BasicResponse>(
    AUTH_ENDPOINTS(role).RESEND_OTP,
    { email }
  );
  return data;
};

/**
 * Login
 * POST /api/v1/{role}/auth/login
 * Body: { email, password }
 */
export const login = async (
  payload: LoginPayload
): Promise<AuthResponse> => {
  const { email, password, role } = payload;
  const { data } = await apiClient.post<AuthResponse>(
    AUTH_ENDPOINTS(role).LOGIN,
    { email, password }
  );
  if (data.access_token) {
    tokenManager.setTokens(
      data.access_token,
      data.refresh_token,
      role,
      data.data ?? null
    );
  }
  return data;
};

/**
 * Social login (Google / Apple)
 * POST /api/v1/{role}/auth/social-login
 * Body: { name, email, photo }
 */
export const socialLogin = async (
  payload: SocialLoginPayload
): Promise<AuthResponse> => {
  const { name, email, photo, role } = payload;
  const { data } = await apiClient.post<AuthResponse>(
    AUTH_ENDPOINTS(role).SOCIAL_LOGIN,
    { name, email, photo }
  );
  if (data.access_token) {
    tokenManager.setTokens(
      data.access_token,
      data.refresh_token,
      role,
      data.data ?? null
    );
  }
  return data;
};

/**
 * Forgot password – sends OTP to email
 * POST /api/v1/{role}/auth/forgot-password
 * Body: { email }
 */
export const forgotPassword = async (
  payload: ForgotPasswordPayload
): Promise<BasicResponse> => {
  const { email, role } = payload;
  const { data } = await apiClient.post<BasicResponse>(
    AUTH_ENDPOINTS(role).FORGOT,
    { email }
  );
  return data;
};

/**
 * Reset password
 * POST /api/v1/{role}/auth/reset-password
 * Body: { email, otp, newPassword }
 */
export const resetPassword = async (
  payload: ResetPasswordPayload
): Promise<BasicResponse> => {
  const { email, otp, newPassword, role } = payload;
  const { data } = await apiClient.post<BasicResponse>(
    AUTH_ENDPOINTS(role).RESET,
    { email, otp, newPassword }
  );
  return data;
};

/**
 * Logout – clears local tokens and calls API
 */
export const logout = async (): Promise<void> => {
  const role = tokenManager.getRole() ?? "reader";
  try {
    await apiClient.post(AUTH_ENDPOINTS(role).LOGOUT);
  } finally {
    tokenManager.clearAll();
  }
};

export default apiClient;