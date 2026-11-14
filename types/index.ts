export type DataType = 'numeric' | 'categorical' | 'temporal' | 'boolean' | 'text';

export interface ColumnStats {
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  q1?: number;
  q3?: number;
  outlierCount?: number;
}

export interface ColumnMeta {
  name: string;
  type: DataType;
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  sampleValues: (string | number | boolean | null)[];
  stats?: ColumnStats;
  distribution?: { label: string; count: number; percentage: number }[];
}

export interface CorrelationPair {
  colA: string;
  colB: string;
  coefficient: number; // Pearson -1 to 1
}

export interface Insight {
  id: string;
  type: 'record_high' | 'record_low' | 'strong_correlation' | 'dominant_category' | 'temporal_growth' | 'anomaly';
  title: string;
  description: string;
  highlightValue?: string | number;
  significance: 'high' | 'medium' | 'contextual';
}

export interface HeroMetricConfig {
  giantNumber: string;
  unitOrPrefix?: string;
  metricLabel: string;
  subHeadline: string;
  editorialHook: string;
}

export interface ScrollyChapter {
  step: number;
  chapterTitle: string;
  narrativeText: string;
  keyStat: string;
  focusColumn: string;
  chartType: 'bar' | 'line' | 'area' | 'pie' | 'scatter';
  viewMode?: 'all' | 'top5' | 'trend' | 'filtered';
}

export interface VisualizationConfig {
  id: string;
  title: string;
  subtitle: string;
  chartType: 'bar' | 'horizontal_bar' | 'line' | 'area' | 'pie' | 'donut' | 'scatter';
  xAxisKey: string;
  yAxisKey: string;
  groupByKey?: string;
  description: string;
}

export interface DesignTheme {
  id: string;
  name: string;
  primary: string; // Hex
  accent: string;  // Hex
  surface: string; // Hex
  text: string;    // Hex
  headingFont: string;
  bodyFont: string;
  tone: 'editorial-dark' | 'journalism-slate' | 'cyber-neon' | 'warm-paper';
}

export type ModelType = 'linear_regression' | 'classification' | 'time_series';

export interface ModelRecommendation {
  id: string;
  name: string;
  type: ModelType;
  targetColumn: string;
  featureColumns: string[];
  qualityScore: number;
  summary: string;
  notes: string[];
}

export interface DatasetAnalysis {
  rowCount: number;
  columnCount: number;
  columns: ColumnMeta[];
  correlations: CorrelationPair[];
  dataQualityScore: number; // 0 to 100
  qualityIssues: string[];
  insights: Insight[];
  heroMetric: HeroMetricConfig;
  scrollyChapters: ScrollyChapter[];
  recommendedVisualizations: VisualizationConfig[];
  designTheme: DesignTheme;
  modelRecommendations: ModelRecommendation[];
}

export interface UserSession {
  id: string;
  githubId?: string;
  username: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  accessToken?: string;
  isDemo?: boolean;
}

export interface ProjectRecord {
  id: string;
  userId: string;
  title: string;
  description?: string;
  datasetName: string;
  fileType: 'csv' | 'xlsx' | 'json';
  rowCount: number;
  columnCount: number;
  analysis: DatasetAnalysis;
  status: 'analyzed' | 'generated' | 'published';
  githubRepoUrl?: string;
  githubRepoName?: string;
  createdAt: string;
  updatedAt: string;
}
