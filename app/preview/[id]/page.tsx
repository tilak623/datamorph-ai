'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Download,
  Github,
  LayoutDashboard,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Share2,
  Check,
} from 'lucide-react';
import { ProjectRecord } from '@/types';
import PreviewHero from '@/components/preview/PreviewHero';
import PreviewScrollytelling from '@/components/preview/PreviewScrollytelling';
import PreviewBento from '@/components/preview/PreviewBento';
import PreviewExplorer from '@/components/preview/PreviewExplorer';
import PreviewChatbot from '@/components/preview/PreviewChatbot';

export default function PreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [dataset, setDataset] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.project) {
          setProject(data.project);
          setDataset(data.sample || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs font-mono text-slate-400">
        Loading interactive data story...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Project Not Found</h2>
        <Link href="/dashboard" className="text-xs font-mono text-emerald-400 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { analysis } = project;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col">
      {/* Top Preview Control Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-white font-semibold truncate max-w-[200px] sm:max-w-[320px]">
            {project.title}
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] hidden md:inline">
            Live Preview Mode
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            title="Copy Share Link"
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>

          <a
            href={`/api/projects/${id}/export-zip`}
            download
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export ZIP</span>
          </a>

          <Link
            href={`/publish/${id}`}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Push to GitHub</span>
          </Link>
        </div>
      </header>

      {/* Main Editorial Scrollytelling Story */}
      <main className="flex-1">
        <PreviewHero
          hero={analysis.heroMetric}
          datasetName={project.datasetName}
          rowCount={project.rowCount}
          columnCount={project.columnCount}
        />

        <PreviewScrollytelling
          chapters={analysis.scrollyChapters}
          dataset={dataset}
          theme={analysis.designTheme}
        />

        <PreviewBento
          insights={analysis.insights}
          correlations={analysis.correlations}
          qualityScore={analysis.dataQualityScore}
          qualityIssues={analysis.qualityIssues}
        />

        <PreviewExplorer dataset={dataset} columns={analysis.columns} />

        {/* Bottom Editorial Callout */}
        <section className="py-24 px-6 text-center max-w-3xl mx-auto border-t border-slate-800/80">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
            Ready to Deploy Independently?
          </span>
          <h2 className="text-3xl font-bold text-white mt-2 mb-4 editorial-title">
            Own the Source Code
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-light max-w-xl mx-auto mb-8">
            This generated site is not tied to DataMorph. Push it directly to your own GitHub repository or download
            the complete Next.js 14 project bundle to run locally.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href={`/publish/${id}`}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all"
            >
              <Github className="w-4 h-4" />
              <span>Push to GitHub Repository</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Integrated Grounded AI Chatbot */}
      <PreviewChatbot projectId={id} />
    </div>
  );
}
