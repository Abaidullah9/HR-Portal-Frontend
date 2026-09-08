'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { fetchCurrentUser } from '@/lib/redux/slices/authSlice';

export function ProtectedWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/signup'];
    const isPublicRoute = publicRoutes.includes(pathname);

    const checkAuth = async () => {
      if (!isAuthenticated) {
        await dispatch(fetchCurrentUser());
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, pathname, router, dispatch]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-950/40 rounded-full mb-4 animate-pulse">
            <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
