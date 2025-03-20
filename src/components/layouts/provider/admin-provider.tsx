'use client';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export function AdminProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <LoadingOverlay />;
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  // checking user role
  if (session?.user.role !== 'Admin') {
    redirect('/');
  }

  return <>{children}</>;
}
