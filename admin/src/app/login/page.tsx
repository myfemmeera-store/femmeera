'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const token = authService.getStoredToken();
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await authService.login(email, password);

      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.message || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      if (err?.errors && Object.keys(err.errors).length > 0) {
        const firstKey = Object.keys(err.errors)[0];
        const firstError = err.errors[firstKey]?.[0];
        setError(firstError || err.message || 'Validation failed.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200/80 p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Image
            src="/logo.png"
            alt="Femmeera Admin"
            width={200}
            height={65}
            className="h-14 w-auto mx-auto object-contain mb-2"
            priority
          />
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Admin Portal Sign In</h1>
          <p className="text-xs text-neutral-500">Authorized store managers & administrators only</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start space-x-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@femmeera.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In to Dashboard
          </Button>
        </form>

        {/* Quick Demo Credentials Info */}
        <div className="pt-4 border-t border-neutral-100 text-center text-[11px] text-neutral-400">
          <p>Super Admin: <code className="text-neutral-700 bg-neutral-100 px-1 py-0.5 rounded">admin@femmeera.com</code></p>
          <p className="mt-0.5">Password: <code className="text-neutral-700 bg-neutral-100 px-1 py-0.5 rounded">admin123</code></p>
        </div>
      </div>
    </div>
  );
}
