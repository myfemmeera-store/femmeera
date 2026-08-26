'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/services/authService';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.login(email, password);
      if (res.success) {
        router.push(redirectTarget);
      } else {
        setError(res.message || 'Invalid credentials.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-3">
        <Link href="/" className="inline-block">
          <Image
            src="/logo.png"
            alt="Femmeera"
            width={200}
            height={65}
            className="h-16 w-auto mx-auto object-contain"
            priority
          />
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Welcome Back</h1>
        <p className="text-xs text-neutral-500">Sign in to your customer account to view order history</p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="space-y-1 text-xs">
          <label className="font-bold text-neutral-700">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="email"
              placeholder="customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-neutral-700">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-md flex items-center justify-center space-x-2"
        >
          <span>{isLoading ? 'Signing In...' : 'Sign In To Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="relative py-1 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200"></div>
          </div>
          <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            OR
          </span>
        </div>

        <GoogleAuthButton text="Continue with Google" onError={(msg) => setError(msg)} />

        <div className="text-center pt-3 border-t border-neutral-100 text-xs text-neutral-500">
          New to Femmeera?{' '}
          <Link href="/register" className="font-bold text-black underline">
            Create an Account
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs font-bold">Loading login...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
