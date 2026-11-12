import { NextResponse } from 'next/server';
import { createDemoUser, setSession } from '@/lib/session';

export async function POST() {
  const user = createDemoUser();
  await setSession(user);
  const { accessToken, ...safeUser } = user;
  return NextResponse.json({ success: true, user: safeUser });
}
