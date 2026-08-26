'use client';

import React, { useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  text?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleAuthButton({
  onSuccess,
  onError,
  text = 'Continue with Google',
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    if (!googleClientId || typeof window === 'undefined') return;

    // Load Google Identity Services Script dynamically
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
          });
        }
      };
      document.body.appendChild(script);
    }
  }, [googleClientId]);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;

    setIsLoading(true);
    try {
      const res = await authService.googleLogin(response.credential);
      if (res.success) {
        if (onSuccess) onSuccess();
        else router.push('/account');
      } else {
        const errorMsg = res.message || 'Google Sign-In failed.';
        if (onError) onError(errorMsg);
      }
    } catch (err: any) {
      if (onError) onError(err?.message || 'Google authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      // Trigger Google One Tap or prompt
      window.google.accounts.id.prompt();
    } else {
      // Fallback to standard Laravel Google OAuth redirect route
      const redirectUrl = `${apiBaseUrl}/auth/google/redirect`;
      window.location.href = redirectUrl;
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={isLoading}
      className="w-full py-3 px-4 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 hover:bg-neutral-50 transition-colors shadow-xs flex items-center justify-center space-x-3 active:scale-[0.99]"
    >
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{isLoading ? 'Connecting Google...' : text}</span>
    </button>
  );
}
