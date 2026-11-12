'use client';
import { Award, Zap, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { Insight, CorrelationPair } from '@/types';

export default function PreviewBento({
  insights,
  correlations,
  qualityScore,
  qualityIssues,
}: {
  insights: Insight[];
  correlations: CorrelationPair[];
  qualityScore: number;
  qualityIssues: string[];
}) {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
      <div className="mb-12">
        <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
          Asymmetric Pattern Recognition
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1 editorial-title">
          Bento Analytical Intelligence
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quality Score Card */}
        <div className="p-8 rounded-2xl glass-panel border border-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-slate-400 uppercase">DATA INTEGRITY CERTIFICATE</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="my-4">
            <div className="text-6xl font-black text-white font-mono tracking-tight">{qualityScore}%</div>
            <span className="text-xs font-mono text-emerald-400 mt-1 block">Certified Statistical Confidence</span>
          </div>

          <div className="text-xs text-slate-400 space-y-1.5 font-light">
            {qualityIssues.length > 0 ? (
              qualityIssues.slice(0, 2).map((issue, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-amber-400">
                  <span className="text-[10px]">•</span>
                  <span>{issue}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero anomalous outliers or missing values detected</span>
              </div>
            )}
          </div>
        </div>

        {/* Insight 1 */}
        {insights[0] && (
          <div className="p-8 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-slate-400 uppercase">
                  {insights[0].type.replace('_', ' ')}
                </span>
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{insights[0].title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">{insights[0].description}</p>
            </div>
            {insights[0].highlightValue && (
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <span className="text-xs font-mono text-slate-500 block">KEY EVIDENCE</span>
                <span className="text-lg font-mono font-bold text-amber-400">
                  {insights[0].highlightValue}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Insight 2 / Correlation Card */}
        {correlations.length > 0 ? (
          <div className="p-8 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-slate-400 uppercase">PEARSON CORRELATION MATRIX</span>
                <TrendingUp className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {correlations[0].colA} & {correlations[0].colB}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Systematic alignment detected. Variations in {correlations[0].colA} exhibit an active correlation
                signature of {correlations[0].coefficient}.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <span className="text-xs font-mono text-slate-500 block">COEFFICIENT</span>
              <span className="text-lg font-mono font-bold text-sky-400">r = {correlations[0].coefficient}</span>
            </div>
          </div>
        ) : insights[1] ? (
          <div className="p-8 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-slate-400 uppercase">
                  {insights[1].type.replace('_', ' ')}
                </span>
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{insights[1].title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">{insights[1].description}</p>
            </div>
            {insights[1].highlightValue && (
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <span className="text-xs font-mono text-slate-500 block">KEY EVIDENCE</span>
                <span className="text-lg font-mono font-bold text-purple-400">
                  {insights[1].highlightValue}
                </span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
