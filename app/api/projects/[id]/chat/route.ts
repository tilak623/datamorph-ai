import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DatasetQueryEngine } from '@/lib/queryEngine';
import { askDatasetAssistant } from '@/lib/aiService';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { question, history } = await req.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const project = db.getProject(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const dataset = db.getDataset(id);
    if (!dataset || dataset.length === 0) {
      return NextResponse.json({ error: 'Dataset is empty or not found' }, { status: 404 });
    }

    const queryEngine = new DatasetQueryEngine(dataset, project.analysis.columns);
    const queryResult = queryEngine.answerQuestion(question);

    const answer = await askDatasetAssistant(question, queryResult, history || []);

    return NextResponse.json({
      answer,
      queryResult,
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    return NextResponse.json({ error: err.message || 'Chat generation failed' }, { status: 500 });
  }
}
