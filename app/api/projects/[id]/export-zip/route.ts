import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateProjectFiles } from '@/lib/codeGenerator';
import { createProjectZip } from '@/lib/zipExporter';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const project = db.getProject(id);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const dataset = db.getDataset(id);
  if (!dataset) {
    return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
  }

  const files = generateProjectFiles(project, dataset);
  const zipBuffer = await createProjectZip(files);

  const cleanName = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return new NextResponse(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${cleanName}-editorial-story.zip"`,
    },
  });
}
