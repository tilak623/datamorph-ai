'use client';
import { motion } from 'framer-motion';
import { Sparkles, Database, BarChart2 } from 'lucide-react';
import { HeroMetricConfig } from '@/types';

export default function PreviewHero({
  hero,
  datasetName,
  rowCount,
  columnCount,
}: {
  hero: HeroMetricConfig;
  datasetName: string;
  rowCount: number;
  columnCount: number;
}) {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center items-center text-center px-6 py-20 border-b border-slate-800/80 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-emerald-400 mb-8"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Grounded Editorial Story • {datasetName}</span>
      </motion.div>

      {/* The Giant Number / Hero Metric */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="mb-4"
      >
        <span className="text-7xl sm:text-9xl font-black tracking-tight text-white editorial-title">
          {hero.giantNumber}
        </span>
      </motion.div>

      {/* Metric Label */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-2xl sm:text-4xl font-bold text-slate-100 tracking-tight max-w-3xl mb-4"
      >
        {hero.metricLabel}
      </motion.h1>

      {/* Editorial Hook Narrative */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-base sm:text-lg text-slate-400 max-w-2xl font-light leading-relaxed"
      >
        {hero.editorialHook}
      </motion.p>

      {/* Verified metadata badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-500"
      >
        <span className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          {rowCount.toLocaleString()} Verified Records
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
          {columnCount} Measurable Dimensions
        </span>
      </motion.div>
    </section>
  );
}
