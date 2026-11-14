import fs from 'fs';
import path from 'path';
import { analyzeDataset } from '../lib/analyzer';
import { DatasetQueryEngine } from '../lib/queryEngine';
import { generateProjectFiles } from '../lib/codeGenerator';
import { createProjectZip } from '../lib/zipExporter';
import { db } from '../lib/db';

async function runVerification() {
  console.log('🧪 ==========================================');
  console.log('🧪 STARTING DATAMORPH AI END-TO-END TEST SUITE');
  console.log('🧪 ==========================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // TEST 1: Load and parse sample JSON dataset
  console.log('▶ [1/6] Testing JSON Dataset Ingestion & Deep Analysis');
  const saasJsonPath = path.join(process.cwd(), 'data', 'samples', 'saas_metrics.json');
  const saasRows = JSON.parse(fs.readFileSync(saasJsonPath, 'utf-8'));
  assert(saasRows.length === 12, 'Loaded 12 rows from saas_metrics.json');

  const saasAnalysis = analyzeDataset(saasRows);
  assert(saasAnalysis.rowCount === 12, 'Analysis row count is 12');
  assert(saasAnalysis.columnCount >= 6, `Detected ${saasAnalysis.columnCount} columns`);
  assert(saasAnalysis.dataQualityScore >= 90, `Data Quality Score is high: ${saasAnalysis.dataQualityScore}%`);
  assert(saasAnalysis.heroMetric.giantNumber.length > 0, `Hero Metric synthesized: ${saasAnalysis.heroMetric.giantNumber}`);
  assert(saasAnalysis.scrollyChapters.length >= 4, `Generated ${saasAnalysis.scrollyChapters.length} Scrollytelling narrative chapters`);
  assert(saasAnalysis.correlations.length > 0, `Detected ${saasAnalysis.correlations.length} Pearson correlation pairs`);
  assert(saasAnalysis.modelRecommendations.length > 0, `Generated ${saasAnalysis.modelRecommendations.length} ML model recommendations`);
  assert(saasAnalysis.modelRecommendations.some((model) => model.type === 'linear_regression'), 'At least one linear regression model was recommended');

  // TEST 2: Grounded Dataset Query Engine
  console.log('\n▶ [2/6] Testing Grounded Query Engine (Zero-Hallucination)');
  const engine = new DatasetQueryEngine(saasRows, saasAnalysis.columns);

  const q1 = engine.answerQuestion('What is the highest revenue_usd?');
  console.log('    [DEBUG Q1 RESULT]:', q1.formattedResult);
  assert(q1.computedValue !== undefined, `Calculated highest value: ${q1.computedValue}`);
  const isMaxDetected = q1.formattedResult.toLowerCase().includes('maximum') || q1.formattedResult.toLowerCase().includes('highest');
  assert(Boolean(isMaxDetected), 'Accurately identified maximum record');

  const q2 = engine.answerQuestion('What is the average latency_ms?');
  assert(q2.operation === 'AVG', 'Recognized average intent');
  assert(typeof q2.computedValue === 'number' && q2.computedValue > 0, `Computed exact average: ${q2.computedValue}`);

  const q3 = engine.answerQuestion('How many records are there?');
  assert(q3.computedValue === 12, 'Answered row count accurately (12 records)');

  const q4 = engine.answerQuestion('Compare tiers');
  assert(q4.intent === 'comparison', 'Recognized categorical comparison intent');
  assert(q4.tableData && q4.tableData.length > 0, 'Generated grouped comparison table data');

  // TEST 3: Database Persistence
  console.log('\n▶ [3/6] Testing Local Database Storage Layer');
  const testProj = {
    id: 'test_project_e2e_1',
    userId: 'demo-user-id',
    title: 'E2E Test Project',
    datasetName: 'saas_metrics.json',
    fileType: 'json' as const,
    rowCount: saasRows.length,
    columnCount: saasAnalysis.columnCount,
    analysis: saasAnalysis,
    status: 'analyzed' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.saveProject(testProj);
  db.saveDataset(testProj.id, saasRows);

  const retrieved = db.getProject(testProj.id);
  assert(retrieved !== null && retrieved.title === 'E2E Test Project', 'Successfully saved and retrieved project from database');

  const retrievedDataset = db.getDataset(testProj.id);
  assert(retrievedDataset !== null && retrievedDataset.length === 12, 'Successfully stored and retrieved raw dataset file');

  // TEST 4: Standalone Code Generator
  console.log('\n▶ [4/6] Testing Standalone Next.js 14 Code Synthesizer');
  const files = generateProjectFiles(retrieved!, retrievedDataset!);
  assert(files.length >= 18, `Generated ${files.length} standalone source files`);

  const hasPackageJson = files.find((f) => f.path === 'package.json');
  assert(hasPackageJson !== undefined && hasPackageJson.content.includes('"next"'), 'Generated standalone package.json');

  const hasPage = files.find((f) => f.path === 'app/page.tsx');
  assert(hasPage !== undefined && hasPage.content.includes('Scrollytelling'), 'Generated standalone editorial scrollytelling page.tsx');

  const hasChatRoute = files.find((f) => f.path === 'app/api/chat/route.ts');
  assert(hasChatRoute !== undefined && hasChatRoute.content.includes('queryDataset'), 'Generated standalone query/chat API route');

  // TEST 5: Standalone ZIP Archive Export
  console.log('\n▶ [5/6] Testing In-Memory ZIP Archive Creation');
  const zipBuffer = await createProjectZip(files);
  assert(Buffer.isBuffer(zipBuffer), 'Generated binary ZIP buffer');
  const isZip = zipBuffer[0] === 0x50 && zipBuffer[1] === 0x4b && zipBuffer[2] === 0x03 && zipBuffer[3] === 0x04;
  assert(isZip, 'ZIP file header matches standard ZIP archive signature (PK)');
  assert(zipBuffer.length > 5000, `ZIP file size is valid (${zipBuffer.length} bytes)`);

  // TEST 6: Cleanup test data
  console.log('\n▶ [6/6] Cleaning up test artifacts');
  db.deleteProject(testProj.id, testProj.userId);
  const deletedCheck = db.getProject(testProj.id);
  assert(deletedCheck === null, 'Project deletion verified');

  console.log('\n==========================================');
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log('==========================================\n');
}

runVerification().catch((err) => {
  console.error('Test Suite encountered error:', err);
  process.exit(1);
});
