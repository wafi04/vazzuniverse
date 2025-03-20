import { AdminProvider } from '@/components/layouts/provider/admin-provider';
import { SessionProvider } from 'next-auth/react';
import React, { ReactNode } from 'react';
import { auth } from '../../../../auth';
import { findUserById } from '@/app/(auth)/_components/api';
import { User } from '@/types/schema/user';
import { NavbarAdmin } from '@/components/layouts/navbar-admin';

export default async function Page({ children }: { children: ReactNode }) {
  const session = await auth();
  const user = await findUserById(session?.user.id as string);
  return (
    <SessionProvider>
      <AdminProvider>
        <NavbarAdmin user={user as User}>{children}</NavbarAdmin>
      </AdminProvider>
    </SessionProvider>
  );
}
