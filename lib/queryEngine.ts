import { ColumnMeta } from '../types/index';

export interface QueryResult {
  question: string;
  intent: 'aggregation' | 'comparison' | 'distribution' | 'ranking' | 'correlation' | 'general';
  targetColumn?: string;
  groupColumn?: string;
  operation?: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' | 'MEDIAN';
  computedValue?: number | string;
  formattedResult: string;
  tableData?: Record<string, any>[];
  groundedFacts: string[];
}

export class DatasetQueryEngine {
  private rows: Record<string, any>[];
  private columns: ColumnMeta[];

  constructor(rows: Record<string, any>[], columns: ColumnMeta[]) {
    this.rows = rows;
    this.columns = columns;
  }

  private findMatchingColumn(text: string): ColumnMeta | undefined {
    const cleanText = text.toLowerCase();
    // 1. Exact match
    const exact = this.columns.find((c) => c.name.toLowerCase() === cleanText);
    if (exact) return exact;

    // 2. Word boundary or substring match
    return this.columns.find((c) => cleanText.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(cleanText));
  }

  public answerQuestion(question: string): QueryResult {
    const qLower = question.toLowerCase();
    const numericCols = this.columns.filter((c) => c.type === 'numeric');
    const catCols = this.columns.filter((c) => c.type === 'categorical' || c.type === 'text');

    // Detect matched columns
    const matchedCol = this.columns.find((c) => qLower.includes(c.name.toLowerCase())) || numericCols[0];
    const groupCol = catCols.find((c) => qLower.includes(c.name.toLowerCase()) && c.name !== matchedCol?.name);

    // 1. Peak / Maximum
    if (qLower.includes('highest') || qLower.includes('maximum') || qLower.includes('max') || qLower.includes('peak') || qLower.includes('top')) {
      if (groupCol && matchedCol && matchedCol.type === 'numeric') {
        const grouped = this.groupByAndAggregate(groupCol.name, matchedCol.name, 'SUM');
        const sorted = grouped.sort((a, b) => b.value - a.value);
        const winner = sorted[0];
        return {
          question,
          intent: 'ranking',
          targetColumn: matchedCol.name,
          groupColumn: groupCol.name,
          operation: 'MAX',
          computedValue: winner?.value,
          formattedResult: `Based on verified records, **${winner?.category || 'N/A'}** has the highest total ${matchedCol.name} at **${Number(winner?.value).toLocaleString()}**.`,
          tableData: sorted.slice(0, 5),
          groundedFacts: [
            `Total categories analyzed: ${sorted.length}`,
            `Leader: ${winner?.category} (${winner?.value?.toLocaleString()})`,
            `Second place: ${sorted[1]?.category || 'N/A'} (${sorted[1]?.value?.toLocaleString() || 'N/A'})`,
          ],
        };
      }

      if (matchedCol && matchedCol.stats?.max !== undefined) {
        return {
          question,
          intent: 'aggregation',
          targetColumn: matchedCol.name,
          operation: 'MAX',
          computedValue: matchedCol.stats.max,
          formattedResult: `The maximum recorded value for **${matchedCol.name}** is **${matchedCol.stats.max.toLocaleString()}**.`,
          groundedFacts: [
            `Column: ${matchedCol.name}`,
            `Max: ${matchedCol.stats.max}`,
            `Mean baseline: ${matchedCol.stats.mean}`,
            `Min: ${matchedCol.stats.min}`,
          ],
        };
      }
    }

    // 2. Minimum / Lowest
    if (qLower.includes('lowest') || qLower.includes('minimum') || qLower.includes('min') || qLower.includes('bottom')) {
      if (matchedCol && matchedCol.stats?.min !== undefined) {
        return {
          question,
          intent: 'aggregation',
          targetColumn: matchedCol.name,
          operation: 'MIN',
          computedValue: matchedCol.stats.min,
          formattedResult: `The lowest recorded value for **${matchedCol.name}** is **${matchedCol.stats.min.toLocaleString()}**.`,
          groundedFacts: [
            `Column: ${matchedCol.name}`,
            `Min: ${matchedCol.stats.min}`,
            `Mean: ${matchedCol.stats.mean}`,
          ],
        };
      }
    }

    // 3. Average / Mean
    if (qLower.includes('average') || qLower.includes('mean') || qLower.includes('avg')) {
      if (matchedCol && matchedCol.stats?.mean !== undefined) {
        return {
          question,
          intent: 'aggregation',
          targetColumn: matchedCol.name,
          operation: 'AVG',
          computedValue: matchedCol.stats.mean,
          formattedResult: `The overall average (mean) for **${matchedCol.name}** across all ${this.rows.length.toLocaleString()} records is **${matchedCol.stats.mean.toLocaleString()}** (median: ${matchedCol.stats.median?.toLocaleString()}).`,
          groundedFacts: [
            `Sample size: ${this.rows.length} rows`,
            `Mean: ${matchedCol.stats.mean}`,
            `Median: ${matchedCol.stats.median}`,
            `Standard Deviation: ${matchedCol.stats.stdDev}`,
          ],
        };
      }
    }

    // 4. Total / Sum
    if (qLower.includes('total') || qLower.includes('sum') || qLower.includes('overall volume')) {
      if (matchedCol && matchedCol.type === 'numeric' && matchedCol.stats?.mean !== undefined) {
        const sum = matchedCol.stats.mean * (this.rows.length - matchedCol.missingCount);
        return {
          question,
          intent: 'aggregation',
          targetColumn: matchedCol.name,
          operation: 'SUM',
          computedValue: Math.round(sum),
          formattedResult: `The cumulative total for **${matchedCol.name}** across all valid records is **${Math.round(sum).toLocaleString()}**.`,
          groundedFacts: [
            `Total Sum: ${Math.round(sum)}`,
            `Active non-null rows: ${this.rows.length - matchedCol.missingCount}`,
            `Average per row: ${matchedCol.stats.mean}`,
          ],
        };
      }
    }

    // 5. Count / Records / Size
    if (qLower.includes('how many') || qLower.includes('count') || qLower.includes('rows') || qLower.includes('size')) {
      return {
        question,
        intent: 'aggregation',
        operation: 'COUNT',
        computedValue: this.rows.length,
        formattedResult: `The dataset contains **${this.rows.length.toLocaleString()}** verified rows and **${this.columns.length}** columns (${numericCols.length} numerical, ${catCols.length} categorical/text).`,
        groundedFacts: [
          `Total rows: ${this.rows.length}`,
          `Total columns: ${this.columns.length}`,
          `Columns: ${this.columns.map((c) => c.name).join(', ')}`,
        ],
      };
    }

    // 6. Comparison
    if (qLower.includes('compare') || qLower.includes('versus') || qLower.includes('vs') || qLower.includes('difference')) {
      const colToGroup = groupCol || catCols[0];
      const colToMeasure = matchedCol?.type === 'numeric' ? matchedCol : numericCols[0];

      if (colToGroup && colToMeasure) {
        const grouped = this.groupByAndAggregate(colToGroup.name, colToMeasure.name, 'AVG').slice(0, 5);
        return {
          question,
          intent: 'comparison',
          targetColumn: colToMeasure.name,
          groupColumn: colToGroup.name,
          formattedResult: `Comparison of average **${colToMeasure.name}** across **${colToGroup.name}** categories.`,
          tableData: grouped,
          groundedFacts: grouped.map((g) => `${g.category}: avg ${g.value.toLocaleString()}`),
        };
      }
    }

    // Default overview / general grounding
    const primaryCol = numericCols[0] || this.columns[0];
    return {
      question,
      intent: 'general',
      formattedResult: `Analyzing the dataset (${this.rows.length.toLocaleString()} records across columns: ${this.columns.map((c) => c.name).join(', ')}). The primary measure **${primaryCol.name}** demonstrates ${primaryCol.stats?.mean ? `an average of ${primaryCol.stats.mean.toLocaleString()}` : 'active tracking'}.`,
      groundedFacts: [
        `Record count: ${this.rows.length}`,
        `Columns: ${this.columns.map((c) => c.name).slice(0, 6).join(', ')}`,
        `Quality score: ${Math.round(100 - (primaryCol.missingPercentage || 0))}%`,
      ],
    };
  }

  private groupByAndAggregate(groupCol: string, valCol: string, op: 'SUM' | 'AVG'): { category: string; value: number; count: number }[] {
    const map: Record<string, { sum: number; count: number }> = {};

    for (const r of this.rows) {
      const cat = String(r[groupCol] || 'Unknown').trim();
      const val = Number(r[valCol]);
      if (!isNaN(val)) {
        if (!map[cat]) map[cat] = { sum: 0, count: 0 };
        map[cat].sum += val;
        map[cat].count += 1;
      }
    }

    return Object.entries(map).map(([category, { sum, count }]) => ({
      category,
      count,
      value: op === 'SUM' ? Math.round(sum * 100) / 100 : Math.round((sum / count) * 100) / 100,
    }));
  }
}
