import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  const userId = session?.id || 'demo-user-id';

  const projects = db.getProjects(userId);
  return NextResponse.json({ projects });
}
