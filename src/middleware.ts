import NextAuth from 'next-auth';
import { ADMIN_ROUTE, AUTH_ROUTES, PUBLIC_ROUTES, REDIRECT, MEMBER_ROUTE } from '@/lib/routes';
import authConfig from '../auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);
  const isAuthRoute = AUTH_ROUTES.includes(nextUrl.pathname);
  const isAdminRoute = ADMIN_ROUTE.includes(nextUrl.pathname);
  const isMemberRoute = MEMBER_ROUTE.includes(nextUrl.pathname);
  const userRole = req.auth?.user?.role;

  // If user is authenticated and trying to access auth routes (like login/signup)
  // Redirect them to the main page
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL(REDIRECT, nextUrl));
  }

  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && (isAdminRoute || isMemberRoute)) {
    return NextResponse.redirect(new URL(AUTH_ROUTES[0], nextUrl));
  }

  // If user is authenticated but doesn't have admin role and tries to access admin routes
  if (isAuthenticated && isAdminRoute && userRole !== 'Admin') {
    return NextResponse.redirect(new URL(REDIRECT, nextUrl));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};