import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const project = db.getProject(id);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const dataset = db.getDataset(id);
  const sample = dataset ? dataset.slice(0, 100) : [];

  return NextResponse.json({
    project,
    sample,
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  const userId = session?.id || 'demo-user-id';
  const { id } = params;

  const success = db.deleteProject(id, userId);
  if (!success) {
    return NextResponse.json({ error: 'Failed to delete project or unauthorized' }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}
