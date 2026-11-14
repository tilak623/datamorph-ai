import { DatasetAnalysis, ModelRecommendation } from '../types';

function toNumber(value: any): number | undefined {
  if (typeof value === 'number' && !isNaN(value)) return value;

  if (typeof value === 'string') {
    const trimmed = value.trim().replace(/[$,%\s]/g, '');
    if (trimmed === '') return undefined;
    const parsed = Number(trimmed);
    if (!isNaN(parsed)) return parsed;
  }

  return undefined;
}

function calculatePearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;

  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = xs[i] - meanX;
    const diffY = ys[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  const denominator = Math.sqrt(denomX * denomY);
  if (denominator === 0) return 0;

  return Number((numerator / denominator).toFixed(3));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getBestNumericPredictors(
  rows: Record<string, any>[],
  targetColumn: string,
  numericColumns: string[]
): { name: string; coefficient: number }[] {
  const scored = numericColumns
    .filter((columnName) => columnName !== targetColumn)
    .map((columnName) => {
      const pairs: [number, number][] = [];

      for (const row of rows) {
        const x = toNumber(row[columnName]);
        const y = toNumber(row[targetColumn]);
        if (x !== undefined && y !== undefined) {
          pairs.push([x, y]);
        }
      }

      if (pairs.length < 5) return null;
      const xs = pairs.map(([x]) => x);
      const ys = pairs.map(([, y]) => y);
      const coefficient = calculatePearson(xs, ys);
      return { name: columnName, coefficient: Math.abs(coefficient) };
    })
    .filter((item): item is { name: string; coefficient: number } => item !== null)
    .sort((a, b) => b.coefficient - a.coefficient);

  return scored.slice(0, 3);
}

export function generateModelRecommendations(
  rows: Record<string, any>[],
  analysis: DatasetAnalysis
): ModelRecommendation[] {
  const recommendations: ModelRecommendation[] = [];
  const numericColumns = analysis.columns.filter((column) => column.type === 'numeric').map((column) => column.name);
  const categoricalColumns = analysis.columns
    .filter((column) => column.type === 'categorical' || column.type === 'boolean')
    .map((column) => column.name);
  const temporalColumns = analysis.columns.filter((column) => column.type === 'temporal').map((column) => column.name);

  if (numericColumns.length >= 2) {
    for (const targetColumn of numericColumns.slice(0, 2)) {
      const predictors = getBestNumericPredictors(rows, targetColumn, numericColumns);
      if (predictors.length === 0) continue;

      const averageStrength = predictors.reduce((total, item) => total + item.coefficient, 0) / predictors.length;
      const score = clamp(Math.round(45 + averageStrength * 55), 0, 100);

      recommendations.push({
        id: `model-linear-${targetColumn}`,
        name: `${targetColumn} forecast model`,
        type: 'linear_regression',
        targetColumn,
        featureColumns: predictors.map((item) => item.name),
        qualityScore: score,
        summary: `Linear regression predicts ${targetColumn} using the strongest numeric drivers in the dataset.`,
        notes: [
          `Average feature correlation strength: ${averageStrength.toFixed(2)}`,
          'Useful when you want a fast interpretable estimate for a continuous outcome.',
        ],
      });
    }
  }

  for (const targetColumn of categoricalColumns.slice(0, 2)) {
    const candidateFeatures = numericColumns.filter((columnName) => columnName !== targetColumn).slice(0, 3);
    if (candidateFeatures.length === 0) continue;

    const counts = new Map<string, number>();
    for (const row of rows) {
      const value = String(row[targetColumn] ?? '').trim();
      if (!value) continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }

    const dominantShare = counts.size > 0 ? Math.max(...counts.values()) / rows.length : 0;
    const score = clamp(Math.round(40 + dominantShare * 60), 0, 100);

    recommendations.push({
      id: `model-classification-${targetColumn}`,
      name: `${targetColumn} classifier`,
      type: 'classification',
      targetColumn,
      featureColumns: candidateFeatures,
      qualityScore: score,
      summary: `Classification estimates the most likely ${targetColumn} bucket from the strongest numeric signals.`,
      notes: [
        `Dominant class share: ${(dominantShare * 100).toFixed(1)}%`,
        'This is ideal for segmenting records into discrete groups or outcomes.',
      ],
    });
  }

  for (const targetColumn of numericColumns.slice(0, 2)) {
    const timeColumn = temporalColumns.find((columnName) => columnName !== targetColumn);
    if (!timeColumn || rows.length < 6) continue;

    const sorted = rows
      .map((row) => {
        const time = new Date(String(row[timeColumn])).getTime();
        const value = toNumber(row[targetColumn]);
        if (Number.isNaN(time) || value === undefined) return null;
        return { time, value };
      })
      .filter((item): item is { time: number; value: number } => item !== null)
      .sort((a, b) => a.time - b.time);

    if (sorted.length < 6) continue;

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const delta = last.value - first.value;
    const slopeStrength = Math.abs(delta) / Math.max(1, Math.abs(first.value));
    const score = clamp(Math.round(30 + slopeStrength * 70), 0, 100);

    recommendations.push({
      id: `model-time-${targetColumn}`,
      name: `${targetColumn} trend model`,
      type: 'time_series',
      targetColumn,
      featureColumns: [timeColumn],
      qualityScore: score,
      summary: `Time-series modeling tracks how ${targetColumn} changes over ${timeColumn}.`,
      notes: [
        `Observed directional change: ${delta >= 0 ? 'upward' : 'downward'} over the time span.`,
        'Useful for forecasting, momentum checks, and seasonal pattern detection.',
      ],
    });
  }

  return recommendations.slice(0, 4);
}
