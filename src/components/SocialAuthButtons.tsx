// components/SocialAuthButtons.tsx
'use client';
import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { Role } from './api';
import { socialLogin } from './apiClient';


interface SocialAuthButtonsProps {
  role: Role;
  onSuccess: () => void;   // e.g. redirect after success
  onError: (msg: string) => void;
}

export function SocialAuthButtons({ role, onSuccess, onError }: SocialAuthButtonsProps) {
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);

  // ─── Google Login ─────────────────────────────────────────────
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading('google');
      try {
        // 1. Fetch user info from Google People API
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        // userInfo = { name, email, picture, sub, ... }

        // 2. Send to your backend social-login endpoint
        const result = await socialLogin({
          name: userInfo.name,
          email: userInfo.email,
          photo: userInfo.picture,
          role: role,
        });

        if (result.success) {
          onSuccess();
        } else {
          onError(result.message || 'Google login failed');
        }
      } catch (err) {
        onError('Google login failed. Please try again.');
      } finally {
        setLoading(null);
      }
    },
    onError: () => {
      onError('Google login cancelled or failed');
      setLoading(null);
    },
  });

  // ─── Apple Login Placeholder (see Part 2) ─────────────────────
  const handleApple = async () => {
    // Will be implemented in Part 2
    onError('Apple Sign-In requires setup – see guide below.');
  };

  return (
    <div className="flex justify-center gap-4 mb-8">
      <button
        type="button"
        onClick={() => googleLogin()}
        disabled={loading !== null}
        className="w-11 h-11 flex items-center justify-center rounded-full bg-black hover:bg-gray-800 transition-all disabled:opacity-50"
      >
        {loading === 'google' ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
        )}
      </button>

      <button
        type="button"
        onClick={handleApple}
        disabled={loading !== null}
        className="w-11 h-11 flex items-center justify-center rounded-full bg-black hover:bg-gray-800 transition-all disabled:opacity-50"
      >
        {loading === 'apple' ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
            className="w-5 h-5 brightness-0 invert"
            alt="Apple"
          />
        )}
      </button>
    </div>
  );
}