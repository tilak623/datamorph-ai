import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`;

  // If GitHub OAuth credentials are not configured, redirect to login page with clear message
  if (!clientId || !process.env.GITHUB_CLIENT_SECRET) {
    const url = new URL('/login', req.url);
    url.searchParams.set('error', 'github_not_configured');
    return NextResponse.redirect(url);
  }

  const state = crypto.randomBytes(16).toString('hex');
  const scope = 'read:user user:email repo';

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}&state=${state}`;

  const response = NextResponse.redirect(githubAuthUrl);
  response.cookies.set('github_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  return response;
}
