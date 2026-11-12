'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  Database,
  BarChart3,
  Bot,
  Layers,
  FileCode,
  Github,
} from 'lucide-react';
import { ProjectRecord } from '@/types';

interface Stage {
  id: string;
  label: string;
  icon: any;
  detail: string;
}

const STAGES: Stage[] = [
  { id: 'read', label: 'Reading dataset & verifying integrity', icon: Database, detail: 'Parsing schema and row structures' },
  { id: 'columns', label: 'Analysing columns & data types', icon: BarChart3, detail: 'Inferring numeric, categorical & temporal types' },
  { id: 'insights', label: 'Discovering statistical insights & correlations', icon: Sparkles, detail: 'Computing distributions, outliers & Pearson coefficients' },
  { id: 'visuals', label: 'Selecting editorial visualizations & theme', icon: Layers, detail: 'Assigning palette, typography & layout hierarchy' },
  { id: 'scrolly', label: 'Synthesizing scrollytelling narrative chapters', icon: FileCode, detail: 'Authoring data-first hero & pinned scroll scenes' },
  { id: 'chatbot', label: 'Building dataset-grounded query engine', icon: Bot, detail: 'Configuring deterministic aggregations for zero hallucinations' },
  { id: 'github', label: 'Assembling independent project repository', icon: Github, detail: 'Compiling standalone Next.js 14 source code & instructions' },
];

export default function GenerateProgressPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.project) {
          setProject(data.project);
        }
      });
  }, [id]);

  useEffect(() => {
    if (currentStageIndex < STAGES.length) {
      const timer = setTimeout(() => {
        setCurrentStageIndex((prev) => prev + 1);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setCompleted(true);
    }
  }, [currentStageIndex]);

  return (
    <div className="py-16 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Generation Pipeline</span>
        <h1 className="text-3xl font-bold text-white tracking-tight mt-1 editorial-title">
          Synthesizing Your Data Story
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 font-light">
          {project ? project.title : 'Processing uploaded dataset...'}
        </p>
      </div>

      <div className="rounded-2xl glass-panel border border-slate-800 p-8 shadow-2xl space-y-6">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isPending = idx > currentStageIndex;
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-4 p-3.5 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-slate-800/80 border border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                  : isDone
                  ? 'bg-slate-900/40 opacity-90'
                  : 'opacity-40'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-500">
                    {idx + 1}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isCurrent ? 'text-white' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                    {stage.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {isDone ? 'COMPLETE' : isCurrent ? 'RUNNING' : 'QUEUED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-light mt-0.5">{stage.detail}</p>
              </div>
            </div>
          );
        })}

        {completed && (
          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Synthesis Complete • 100% Grounded</span>
            </div>

            <Link
              href={`/preview/${id}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all"
            >
              <span>Launch Live Interactive Story</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
