"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import DashboardSkeleton from './skeletons/DashboardSkeleton';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const { checking, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!checking && !isAuthenticated) {
      router.replace('/login');
    }
  }, [checking, isAuthenticated, router]);

  if (checking) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated) return null;

  return children;
}
