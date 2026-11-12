import {
  ColumnMeta,
  ColumnStats,
  CorrelationPair,
  DataType,
  DatasetAnalysis,
  HeroMetricConfig,
  Insight,
  ScrollyChapter,
  VisualizationConfig,
} from '../types/index';
import { selectThemeForDataset } from './designThemes';

// Classify column data type based on sample values
function classifyColumn(values: any[]): DataType {
  let numericCount = 0;
  let dateCount = 0;
  let boolCount = 0;
  let validCount = 0;

  for (const v of values) {
    if (v === null || v === undefined || v === '') continue;
    validCount++;

    if (typeof v === 'boolean' || v === 'true' || v === 'false' || v === 'TRUE' || v === 'FALSE') {
      boolCount++;
      continue;
    }

    if (typeof v === 'number' && !isNaN(v)) {
      numericCount++;
      continue;
    }

    if (typeof v === 'string') {
      const trimmed = v.trim();
      // Check numeric
      if (!isNaN(Number(trimmed)) && trimmed !== '') {
        numericCount++;
        continue;
      }
      // Check date format (e.g., YYYY-MM-DD, MM/DD/YYYY, ISO)
      if (trimmed.length >= 6 && !isNaN(Date.parse(trimmed)) && !/^\d+$/.test(trimmed)) {
        dateCount++;
        continue;
      }
    }
  }

  if (validCount === 0) return 'text';
  if (boolCount / validCount > 0.8) return 'boolean';
  if (numericCount / validCount > 0.75) return 'numeric';
  if (dateCount / validCount > 0.75) return 'temporal';

  // Check cardinality for categorical vs text
  const uniqueSet = new Set(values.map((v) => String(v).trim().toLowerCase()));
  if (uniqueSet.size <= Math.min(25, validCount * 0.35)) {
    return 'categorical';
  }

  return 'text';
}

function calculateNumericStats(numbers: number[]): ColumnStats {
  if (numbers.length === 0) return {};
  const sorted = [...numbers].sort((a, b) => a - b);
  const n = sorted.length;
  const min = sorted[0];
  const max = sorted[n - 1];

  const sum = sorted.reduce((acc, curr) => acc + curr, 0);
  const mean = sum / n;

  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outlierCount = sorted.filter((v) => v < lowerBound || v > upperBound).length;

  const variance = sorted.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  return {
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    q1: Math.round(q1 * 100) / 100,
    q3: Math.round(q3 * 100) / 100,
    outlierCount,
  };
}

function calculatePearsonCorrelation(xs: number[], ys: number[]): number {
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
  return Math.round((numerator / denominator) * 100) / 100;
}

export function analyzeDataset(rows: Record<string, any>[]): DatasetAnalysis {
  const rowCount = rows.length;
  if (rowCount === 0) {
    throw new Error('Dataset is empty');
  }

  const columnNames = Object.keys(rows[0]);
  const columns: ColumnMeta[] = [];

  for (const name of columnNames) {
    const rawValues = rows.map((r) => r[name]);
    const validValues = rawValues.filter((v) => v !== null && v !== undefined && v !== '');
    const missingCount = rowCount - validValues.length;
    const missingPercentage = Math.round((missingCount / rowCount) * 100);

    const type = classifyColumn(rawValues);
    const uniqueSet = new Set(validValues.map((v) => String(v)));
    const sampleValues = validValues.slice(0, 5);

    let stats: ColumnStats | undefined;
    let distribution: { label: string; count: number; percentage: number }[] | undefined;

    if (type === 'numeric') {
      const numbers = validValues
        .map((v) => (typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.-]+/g, ''))))
        .filter((n) => !isNaN(n));
      stats = calculateNumericStats(numbers);
    } else if (type === 'categorical' || type === 'boolean') {
      const counts: Record<string, number> = {};
      for (const val of validValues) {
        const key = String(val).trim();
        counts[key] = (counts[key] || 0) + 1;
      }
      distribution = Object.entries(counts)
        .map(([label, count]) => ({
          label,
          count,
          percentage: Math.round((count / validValues.length) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }

    columns.push({
      name,
      type,
      missingCount,
      missingPercentage,
      uniqueCount: uniqueSet.size,
      sampleValues,
      stats,
      distribution,
    });
  }

  // Calculate correlations between numeric columns
  const numericCols = columns.filter((c) => c.type === 'numeric' && c.stats);
  const correlations: CorrelationPair[] = [];

  for (let i = 0; i < numericCols.length; i++) {
    for (let j = i + 1; j < numericCols.length; j++) {
      const colA = numericCols[i].name;
      const colB = numericCols[j].name;

      const pairs: [number, number][] = [];
      for (const r of rows) {
        const valA = Number(r[colA]);
        const valB = Number(r[colB]);
        if (!isNaN(valA) && !isNaN(valB)) {
          pairs.push([valA, valB]);
        }
      }

      if (pairs.length > 5) {
        const xs = pairs.map((p) => p[0]);
        const ys = pairs.map((p) => p[1]);
        const r = calculatePearsonCorrelation(xs, ys);
        if (Math.abs(r) >= 0.25) {
          correlations.push({ colA, colB, coefficient: r });
        }
      }
    }
  }

  // Calculate Quality Score
  const qualityIssues: string[] = [];
  let penalty = 0;

  for (const c of columns) {
    if (c.missingPercentage > 15) {
      penalty += Math.min(20, c.missingPercentage * 0.4);
      qualityIssues.push(`Column '${c.name}' has ${c.missingPercentage}% missing values`);
    }
  }

  const dataQualityScore = Math.max(20, Math.min(100, Math.round(100 - penalty)));

  // Generate Insights
  const insights: Insight[] = [];

  // Top numeric highs
  if (numericCols.length > 0) {
    const primaryNumeric = numericCols[0];
    if (primaryNumeric.stats?.max !== undefined) {
      insights.push({
        id: 'insight-max',
        type: 'record_high',
        title: `Peak ${primaryNumeric.name}`,
        description: `Highest recorded ${primaryNumeric.name} observed is ${primaryNumeric.stats.max.toLocaleString()} with a baseline average of ${primaryNumeric.stats.mean?.toLocaleString()}.`,
        highlightValue: primaryNumeric.stats.max,
        significance: 'high',
      });
    }
  }

  // Correlation insights
  if (correlations.length > 0) {
    const topCorr = [...correlations].sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient))[0];
    const relationType = topCorr.coefficient > 0 ? 'strong positive link' : 'inverse relationship';
    insights.push({
      id: 'insight-corr',
      type: 'strong_correlation',
      title: `${topCorr.colA} & ${topCorr.colB}`,
      description: `Reveals a ${relationType} (Pearson r = ${topCorr.coefficient}), demonstrating how changes in ${topCorr.colA} directly track ${topCorr.colB}.`,
      highlightValue: `r = ${topCorr.coefficient}`,
      significance: 'high',
    });
  }

  // Dominant category insight
  const catCols = columns.filter((c) => (c.type === 'categorical' || c.type === 'boolean') && c.distribution?.length);
  if (catCols.length > 0) {
    const topCat = catCols[0];
    const leader = topCat.distribution![0];
    insights.push({
      id: 'insight-cat',
      type: 'dominant_category',
      title: `Dominance in ${topCat.name}`,
      description: `'${leader.label}' leads with ${leader.percentage}% of all records (${leader.count.toLocaleString()} occurrences).`,
      highlightValue: `${leader.percentage}%`,
      significance: 'medium',
    });
  }

  // Generate Data-First Hero Metric
  let heroMetric: HeroMetricConfig;
  const mainNumeric = numericCols[0];
  const primaryCat = catCols[0];

  if (mainNumeric && mainNumeric.stats?.mean !== undefined) {
    const sum = (mainNumeric.stats.mean * rowCount);
    const formattedSum = sum >= 1_000_000 ? `${(sum / 1_000_000).toFixed(1)}M` : sum >= 1_000 ? `${(sum / 1_000).toFixed(1)}K` : Math.round(sum).toLocaleString();
    heroMetric = {
      giantNumber: formattedSum,
      unitOrPrefix: sum >= 1000 ? '' : '',
      metricLabel: `Total Aggregated ${mainNumeric.name}`,
      subHeadline: `Across ${rowCount.toLocaleString()} verified records`,
      editorialHook: `From peak fluctuations to underlying structural distributions, discover the defining narrative inside this dataset.`,
    };
  } else {
    heroMetric = {
      giantNumber: `${rowCount.toLocaleString()}`,
      metricLabel: 'Verified Observations',
      subHeadline: `Across ${columnNames.length} measured dimensions`,
      editorialHook: `A comprehensive visual inquiry into the key distributions and emergent categories.`,
    };
  }

  // Generate Scrollytelling Chapters
  const scrollyChapters: ScrollyChapter[] = [];
  const primaryY = mainNumeric ? mainNumeric.name : columnNames[1] || columnNames[0];
  const primaryX = primaryCat ? primaryCat.name : columnNames[0];

  scrollyChapters.push({
    step: 1,
    chapterTitle: 'The Macro Picture',
    narrativeText: `The dataset encompasses ${rowCount.toLocaleString()} observations. Our primary measure, ${primaryY}, demonstrates an average level of ${mainNumeric?.stats?.mean ?? 'consistent volume'} across the sample spectrum.`,
    keyStat: `${rowCount.toLocaleString()} Records`,
    focusColumn: primaryY,
    chartType: 'bar',
    viewMode: 'all',
  });

  scrollyChapters.push({
    step: 2,
    chapterTitle: 'Concentration of Impact',
    narrativeText: primaryCat?.distribution
      ? `When segmented by ${primaryCat.name}, a disproportionate share concentrates within '${primaryCat.distribution[0].label}', establishing the dominant benchmark.`
      : `Looking closely at top records, significant density forms around the core median values.`,
    keyStat: primaryCat?.distribution ? `${primaryCat.distribution[0].percentage}% Share` : 'Median Benchmark',
    focusColumn: primaryX,
    chartType: 'bar',
    viewMode: 'top5',
  });

  if (correlations.length > 0) {
    const c = correlations[0];
    scrollyChapters.push({
      step: 3,
      chapterTitle: 'The Underlying Dynamics',
      narrativeText: `Cross-analyzing ${c.colA} against ${c.colB} exposes a coefficient of ${c.coefficient}. This statistical signature confirms systematic co-movement between both dimensions.`,
      keyStat: `r = ${c.coefficient}`,
      focusColumn: c.colB,
      chartType: 'line',
      viewMode: 'trend',
    });
  } else {
    scrollyChapters.push({
      step: 3,
      chapterTitle: 'Distribution Spread',
      narrativeText: `Observations exhibit a variance spread with ${mainNumeric?.stats?.outlierCount ?? 0} notable outlier occurrences deviating from standard bounds.`,
      keyStat: `StdDev: ${mainNumeric?.stats?.stdDev ?? 'Standard'}`,
      focusColumn: primaryY,
      chartType: 'area',
      viewMode: 'all',
    });
  }

  scrollyChapters.push({
    step: 4,
    chapterTitle: 'Strategic Takeaways',
    narrativeText: `By isolating the structural distribution, decision-makers can calibrate projections against verified historical evidence rather than intuition.`,
    keyStat: '100% Grounded',
    focusColumn: primaryY,
    chartType: 'bar',
    viewMode: 'filtered',
  });

  // Recommended Visualizations
  const recommendedVisualizations: VisualizationConfig[] = [];
  if (primaryCat && mainNumeric) {
    recommendedVisualizations.push({
      id: 'viz-cat-bar',
      title: `${mainNumeric.name} by ${primaryCat.name}`,
      subtitle: `Distribution across prominent categorical segments`,
      chartType: 'bar',
      xAxisKey: primaryCat.name,
      yAxisKey: mainNumeric.name,
      description: `Compares performance and volume metrics across categorical partitions.`,
    });
  }

  if (numericCols.length >= 2) {
    recommendedVisualizations.push({
      id: 'viz-scatter',
      title: `${numericCols[0].name} vs ${numericCols[1].name}`,
      subtitle: `Bivariate correlation and cluster mapping`,
      chartType: 'scatter',
      xAxisKey: numericCols[0].name,
      yAxisKey: numericCols[1].name,
      description: `Reveals clustering patterns and correlation trajectories.`,
    });
  }

  const temporalCol = columns.find((c) => c.type === 'temporal');
  if (temporalCol && mainNumeric) {
    recommendedVisualizations.push({
      id: 'viz-trend',
      title: `${mainNumeric.name} Trend over Time`,
      subtitle: `Timeline trajectory by ${temporalCol.name}`,
      chartType: 'line',
      xAxisKey: temporalCol.name,
      yAxisKey: mainNumeric.name,
      description: `Visualizes longitudinal trends and temporal inflection points.`,
    });
  }

  const designTheme = selectThemeForDataset(columnNames);

  return {
    rowCount,
    columnCount: columnNames.length,
    columns,
    correlations,
    dataQualityScore,
    qualityIssues,
    insights,
    heroMetric,
    scrollyChapters,
    recommendedVisualizations,
    designTheme,
  };
}
