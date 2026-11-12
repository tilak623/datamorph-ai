import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { analyzeDataset } from '@/lib/analyzer';
import { ProjectRecord } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.id || 'demo-user-id';

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No dataset file provided' }, { status: 400 });
    }

    const fileName = file.name;
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (!['csv', 'xlsx', 'xls', 'json'].includes(extension || '')) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a .csv, .xlsx, or .json file.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let rows: Record<string, any>[] = [];

    if (extension === 'csv') {
      const csvString = buffer.toString('utf-8');
      const parsed = Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });
      rows = parsed.data as Record<string, any>[];
    } else if (extension === 'json') {
      const jsonString = buffer.toString('utf-8');
      const parsed = JSON.parse(jsonString);
      rows = Array.isArray(parsed) ? parsed : [parsed];
    } else if (extension === 'xlsx' || extension === 'xls') {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      rows = XLSX.utils.sheet_to_json(worksheet);
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'The uploaded dataset contains zero valid data rows.' },
        { status: 400 }
      );
    }

    // Clean null/undefined row keys
    rows = rows.filter((r) => r && typeof r === 'object' && Object.keys(r).length > 0);

    // Run Deep Analysis
    const analysis = analyzeDataset(rows);

    const projectId = `proj_${crypto.randomBytes(8).toString('hex')}`;
    const cleanTitle = title.trim() || fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').toUpperCase();

    const project: ProjectRecord = {
      id: projectId,
      userId,
      title: cleanTitle,
      description: `Interactive investigation generated from ${fileName}`,
      datasetName: fileName,
      fileType: extension as 'csv' | 'xlsx' | 'json',
      rowCount: rows.length,
      columnCount: Object.keys(rows[0]).length,
      analysis,
      status: 'analyzed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save metadata and dataset records
    db.saveProject(project);
    db.saveDataset(projectId, rows);

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (err: any) {
    console.error('Dataset processing error:', err);
    return NextResponse.json(
      { error: err.message || 'An error occurred while processing the dataset.' },
      { status: 500 }
    );
  }
}
