import NextAuth from 'next-auth';
import 'next-auth/jwt';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './src/lib/prisma';
import authConfig from './auth.config';

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  ...authConfig,
});

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: User;
  }
}
