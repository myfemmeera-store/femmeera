'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';
import { authService } from '@/services/authService';
import { AdminNavbar } from './AdminNavbar';
import { AdminSidebar } from './AdminSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Drawer } from '../ui/Drawer';
import { ToastProvider } from '../ui/Toast';
import { Loader2 } from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    // If on login page, skip authentication check
    if (pathname === '/login') {
      setIsLoading(false);
      return;
    }

    const token = authService.getStoredToken();

    if (!token) {
      router.push('/login');
      return;
    }

    const cachedUser = authService.getStoredUser();
    if (cachedUser) {
      setUser(cachedUser);
      setIsLoading(false);
    }

    // Verify token with backend
    authService
      .getProfile()
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('femmeera_admin_user', JSON.stringify(res.data.user));
        }
      })
      .catch(() => {
        authService.logout();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [pathname, router]);

  if (pathname === '/login') {
    return <ToastProvider>{children}</ToastProvider>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-black animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Authenticating Femmeera Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900 selection:bg-black selection:text-white">
        {/* Top Navbar */}
        <AdminNavbar user={user} onOpenMobileMenu={() => setIsMobileDrawerOpen(true)} />

        {/* Main Body Shell */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <AdminSidebar user={user} />
          </div>

          {/* Mobile Drawer */}
          <Drawer
            isOpen={isMobileDrawerOpen}
            onClose={() => setIsMobileDrawerOpen(false)}
            title="Admin Menu"
          >
            <AdminSidebar user={user} onNavigate={() => setIsMobileDrawerOpen(false)} />
          </Drawer>

          {/* Main Dynamic View Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
            <div className="max-w-7xl mx-auto space-y-6">{children}</div>
          </main>
        </div>

        {/* Mobile Sticky Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </ToastProvider>
  );
};
