'use client';
import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ScrollyChapter, DesignTheme } from '@/types';
import { Layers, ArrowRight, BarChart2 } from 'lucide-react';

export default function PreviewScrollytelling({
  chapters,
  dataset,
  theme,
}: {
  chapters: ScrollyChapter[];
  dataset: Record<string, any>[];
  theme: DesignTheme;
}) {
  const [activeStep, setActiveStep] = useState(0);

  const currentChapter = chapters[activeStep] || chapters[0];

  // Dynamically build data representation for current step
  const sampleData = dataset.slice(0, 8).map((row, i) => {
    const rawVal = Object.values(row).find((v) => typeof v === 'number');
    const labelKey = Object.keys(row)[0];
    return {
      name: String(row[labelKey] || `Item ${i + 1}`).slice(0, 14),
      value: typeof rawVal === 'number' ? rawVal : Math.floor(Math.random() * 80 + 20),
      secondary: typeof rawVal === 'number' ? Math.round(rawVal * 0.65) : 30,
    };
  });

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-14 text-center">
        <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
          Interactive Narrative Architecture
        </span>
        <h2 className="text-3xl sm:text-5xl font-bold text-white mt-2 editorial-title">
          The Scrollytelling Investigation
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-lg mx-auto font-light">
          Scroll or select chapters below to observe how the pinned visualization transforms perspective.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Pinned Sticky Chart Section */}
        <div className="lg:col-span-7 lg:sticky lg:top-28 rounded-2xl glass-panel border border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-slate-500">
                SCROLL SCENE 0{activeStep + 1} OF 0{chapters.length}
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">{currentChapter.chapterTitle}</h3>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-mono font-semibold"
              style={{
                backgroundColor: `${theme.primary}20`,
                borderColor: `${theme.primary}40`,
                color: theme.primary,
                borderWidth: '1px',
              }}
            >
              {currentChapter.keyStat}
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {currentChapter.chartType === 'line' ? (
                <LineChart data={sampleData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={theme.primary}
                    strokeWidth={3}
                    dot={{ fill: theme.primary, r: 4 }}
                  />
                </LineChart>
              ) : currentChapter.chartType === 'area' ? (
                <AreaChart data={sampleData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="value" stroke={theme.accent} fill={`${theme.accent}30`} />
                </AreaChart>
              ) : (
                <BarChart data={sampleData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill={theme.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Primary Focus: {currentChapter.focusColumn}</span>
            <span className="capitalize">Type: {currentChapter.chartType} Chart</span>
          </div>
        </div>

        {/* Narrative Scroll Cards */}
        <div className="lg:col-span-5 space-y-6">
          {chapters.map((ch, idx) => (
            <div
              key={idx}
              onClick={() => setActiveStep(idx)}
              onMouseEnter={() => setActiveStep(idx)}
              className={`p-7 rounded-2xl border transition-all duration-300 cursor-pointer ${
                activeStep === idx
                  ? 'bg-slate-900/90 border-emerald-500/50 shadow-xl shadow-emerald-500/5 scale-[1.01]'
                  : 'glass-panel opacity-60 hover:opacity-100 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-emerald-400">CHAPTER 0{idx + 1}</span>
                <span className="text-xs font-mono text-slate-400">{ch.keyStat}</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-2 tracking-tight">{ch.chapterTitle}</h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">{ch.narrativeText}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
