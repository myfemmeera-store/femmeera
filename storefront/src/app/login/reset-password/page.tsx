'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/services/authService';
import { Lock, Mail, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tokenParam = searchParams?.get('token') || '';
  const emailParam = searchParams?.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Password confirmation does not match.');
      return;
    }

    if (!tokenParam) {
      setError('Invalid or missing password reset token.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.resetPassword({
        token: tokenParam,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(res.message || 'Failed to update password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error updating password.');
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
        <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Reset Your Password</h1>
        <p className="text-xs text-neutral-500">Enter your new password below to update your account</p>
      </div>

      {isSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-3 shadow-md">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-black text-emerald-900">Password Updated Successfully!</h2>
          <p className="text-xs text-emerald-800">
            Your password has been updated in the database. Redirecting to login page in 3 seconds...
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              <span>Login Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-neutral-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 text-center">
              {error}
            </div>
          )}

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
            <label className="font-bold text-neutral-700">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-neutral-700">Confirm New Password</label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="password"
                placeholder="Re-enter new password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                minLength={6}
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-md flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Updating Password...' : 'Update Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs font-bold">Loading password reset...</div>}>
      <ResetPasswordFormContent />
    </Suspense>
  );
}
