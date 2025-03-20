import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/types/schema/auth';
import bcryptjs from 'bcryptjs';
import { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedCredentials = loginSchema.parse(credentials);
        if (validatedCredentials) {
          const { username, password } = validatedCredentials;

          const user = await prisma.users.findUnique({
            where: { username },
          });

          if (!user || !user.password) {
            return null;
          }

          const validPassword = await bcryptjs.compare(password, user.password);

          if (validPassword) {
            return {
              id: user.id.toString(),
              username: user.username,
              role: user.role,
            };
          }
        }

        return null;
      },
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.role) session.user.role = token.role as string;

      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
