'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileSpreadsheet,
  ExternalLink,
  Download,
  Trash2,
  Github,
  Eye,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
} from 'lucide-react';
import { ProjectRecord } from '@/types';

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this generated project?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800/80">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Workspace</span>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-1 editorial-title">My Generated Projects</h1>
          <p className="text-slate-400 text-xs mt-1 font-light">
            Manage your interactive data stories, launch previews, download source code, or publish to GitHub.
          </p>
        </div>

        <Link
          href="/upload"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Generate New Website</span>
        </Link>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 font-mono text-xs">Loading workspace projects...</div>
      ) : projects.length === 0 ? (
        <div className="p-16 text-center rounded-2xl glass-panel border border-slate-800/80 max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Generated Projects Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            Upload a CSV, Excel, or JSON dataset to generate your first editorial interactive scrollytelling website.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-semibold text-xs hover:bg-emerald-400 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upload Dataset Now</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl glass-panel border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                    {proj.fileType}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono capitalize ${
                      proj.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {proj.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-light">
                  {proj.analysis?.heroMetric?.editorialHook || proj.description}
                </p>

                {/* Metrics */}
                <div className="mt-5 pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-3 text-xs font-mono text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-500 block">OBSERVATIONS</span>
                    <span className="text-slate-200 font-semibold">{proj.rowCount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ATTRIBUTES</span>
                    <span className="text-slate-200 font-semibold">{proj.columnCount} columns</span>
                  </div>
                </div>

                {/* Published GitHub link if available */}
                {proj.githubRepoUrl && (
                  <div className="mt-4 pt-3 border-t border-slate-800/60">
                    <a
                      href={proj.githubRepoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-400 hover:text-purple-300"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{proj.githubRepoName || 'GitHub Repo'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <Link
                  href={`/preview/${proj.id}`}
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </Link>

                <a
                  href={`/api/projects/${proj.id}/export-zip`}
                  download
                  title="Download Standalone ZIP"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>

                <Link
                  href={`/publish/${proj.id}`}
                  title="Push to GitHub"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-purple-900/40 text-purple-400 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleDelete(proj.id)}
                  disabled={deletingId === proj.id}
                  title="Delete Project"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
