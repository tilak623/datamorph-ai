import { DesignTheme } from '../types/index';

export const THEMES: Record<string, DesignTheme> = {
  'pudding-dark': {
    id: 'pudding-dark',
    name: 'Editorial Obsidian',
    primary: '#10b981', // Emerald
    accent: '#f43f5e',  // Crimson Rose
    surface: '#0f172a', // Deep Slate
    text: '#f8fafc',
    headingFont: 'Playfair Display, serif',
    bodyFont: 'Inter, sans-serif',
    tone: 'editorial-dark',
  },
  'cyber-slate': {
    id: 'cyber-slate',
    name: 'Quantum Cyber',
    primary: '#38bdf8', // Electric Cyan
    accent: '#a855f7',  // Neon Violet
    surface: '#090d16', // Obsidian Space
    text: '#e2e8f0',
    headingFont: 'Space Grotesk, sans-serif',
    bodyFont: 'JetBrains Mono, monospace',
    tone: 'cyber-neon',
  },
  'warm-parchment': {
    id: 'warm-parchment',
    name: 'Terra Investigation',
    primary: '#f59e0b', // Amber Ochre
    accent: '#ef4444',  // Terracotta Red
    surface: '#1c1917', // Warm Charcoal
    text: '#fafaf9',
    headingFont: 'Georgia, serif',
    bodyFont: 'Inter, sans-serif',
    tone: 'warm-paper',
  },
  'atlantic-navy': {
    id: 'atlantic-navy',
    name: 'Atlantic Chronicle',
    primary: '#60a5fa', // Ice Blue
    accent: '#34d399',  // Seafoam
    surface: '#0a1120', // Midnight Navy
    text: '#f1f5f9',
    headingFont: 'Syne, sans-serif',
    bodyFont: 'system-ui, sans-serif',
    tone: 'journalism-slate',
  },
};

export function selectThemeForDataset(columnNames: string[]): DesignTheme {
  const joined = columnNames.join(' ').toLowerCase();

  if (joined.match(/tech|ai|code|crypto|latency|server|model|gpu|cpu|api/)) {
    return THEMES['cyber-slate'];
  }
  if (joined.match(/health|life|nature|bio|food|carbon|climate|country|culture|book/)) {
    return THEMES['warm-parchment'];
  }
  if (joined.match(/finance|stock|trade|revenue|profit|sales|market|gdp|invest/)) {
    return THEMES['atlantic-navy'];
  }
  return THEMES['pudding-dark'];
}
