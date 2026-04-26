// app/providers.tsx
'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId="445122615978-48a40g0rub3anigk51b9fju86trs79dl.apps.googleusercontent.com">
      {children}
    </GoogleOAuthProvider>
  );
}