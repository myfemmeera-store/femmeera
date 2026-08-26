'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { User as UserIcon, Lock, Mail, Phone, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.register(form);
      if (res.success) {
        router.push('/account');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <span className="bg-black text-white font-black text-lg px-3 py-1 rounded-lg tracking-widest uppercase inline-block">
          Femmeera
        </span>
        <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Create Account</h1>
        <p className="text-xs text-neutral-500">Join Femmeera for exclusive discounts & seamless order tracking</p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200/80 rounded-3xl p-6 space-y-4 shadow-xs text-xs">
        <div className="space-y-1">
          <label className="font-bold text-neutral-700">Full Name</label>
          <div className="relative">
            <UserIcon className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              name="name"
              placeholder="Ananya Sharma"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-neutral-700">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="email"
              name="email"
              placeholder="ananya@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-neutral-700">Phone Number (Optional)</label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              name="phone"
              placeholder="9876543210"
              value={form.phone}
              onChange={handleChange}
              className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-neutral-700">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-neutral-700">Confirm Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="password"
              name="password_confirmation"
              placeholder="Re-enter password"
              value={form.password_confirmation}
              onChange={handleChange}
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
          <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
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

        <GoogleAuthButton text="Sign Up with Google" onError={(msg) => setError(msg)} />

        <div className="text-center pt-3 border-t border-neutral-100 text-xs text-neutral-500">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-black underline">
            Sign In Here
          </Link>
        </div>
      </form>
    </div>
  );
}
