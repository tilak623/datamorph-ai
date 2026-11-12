import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { generateProjectFiles } from '@/lib/codeGenerator';
import { pushProjectToGithub } from '@/lib/githubPublisher';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { repoName, isPrivate, customToken } = body;

    if (!repoName || typeof repoName !== 'string') {
      return NextResponse.json({ error: 'Repository name is required.' }, { status: 400 });
    }

    const session = await getSession();
    const token = customToken || session?.accessToken;

    if (!token) {
      return NextResponse.json(
        {
          error:
            'GitHub authentication token not found. Please sign in with GitHub or provide a GitHub Personal Access Token.',
        },
        { status: 401 }
      );
    }

    const project = db.getProject(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const dataset = db.getDataset(id);
    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found.' }, { status: 404 });
    }

    // Synthesize independent project files
    const files = generateProjectFiles(project, dataset);

    // Push via Octokit
    const result = await pushProjectToGithub(
      token,
      repoName.trim(),
      Boolean(isPrivate),
      project.description || `Interactive Scrollytelling Story: ${project.title}`,
      files
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to push to GitHub' }, { status: 400 });
    }

    // Update project state
    project.githubRepoUrl = result.repoUrl;
    project.githubRepoName = result.repoName;
    project.status = 'published';
    db.saveProject(project);

    return NextResponse.json({
      success: true,
      repoUrl: result.repoUrl,
      repoName: result.repoName,
    });
  } catch (err: any) {
    console.error('GitHub publish route exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error while pushing' }, { status: 500 });
  }
}
