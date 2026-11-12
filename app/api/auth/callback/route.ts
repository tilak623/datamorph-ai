import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { setSession } from '@/lib/session';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!code || !clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/login?error=invalid_callback', req.url));
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      console.error('GitHub token exchange error:', tokenData);
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', req.url));
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated GitHub user
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'DataMorph-AI-Platform',
      },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/login?error=user_fetch_failed', req.url));
    }

    const ghUser = await userRes.json();

    // 3. Upsert user in db
    const userRecord = db.upsertUser({
      id: `gh_${ghUser.id}`,
      githubId: String(ghUser.id),
      username: ghUser.login,
      name: ghUser.name || ghUser.login,
      email: ghUser.email || undefined,
      avatarUrl: ghUser.avatar_url,
      accessToken: accessToken,
      isDemo: false,
    });

    // 4. Create encrypted session
    await setSession(userRecord);

    const dest = new URL('/dashboard', req.url);
    return NextResponse.redirect(dest);
  } catch (err: any) {
    console.error('OAuth callback exception:', err);
    return NextResponse.redirect(new URL('/login?error=oauth_exception', req.url));
  }
}
