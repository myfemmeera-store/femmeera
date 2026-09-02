'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userRaw = searchParams.get('user');
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    // Step 2: Backend returned generated token and user object
    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        authService.handleOAuthCallback(token, user);
        router.push('/account');
      } catch (err) {
        router.push('/login?error=Invalid+session+response');
      }
      return;
    }

    // Step 1: Google redirected back with authorization code -> forward to backend for code exchange
    if (code) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.femmeera.com/api/v1';
      const redirectUrl = `${apiBaseUrl}/auth/google/callback?${searchParams.toString()}`;
      window.location.href = redirectUrl;
      return;
    }

    router.push('/login');
  }, [router, searchParams]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 bg-[#FDFBF7]">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-neutral-600">Completing Google Sign-In...</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
