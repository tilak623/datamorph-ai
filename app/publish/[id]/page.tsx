'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Github,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Lock,
  Globe,
  Terminal,
  Loader2,
} from 'lucide-react';
import { ProjectRecord } from '@/types';

export default function PublishPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [user, setUser] = useState<any>(null);
  const [repoName, setRepoName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [customToken, setCustomToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedData, setPublishedData] = useState<{ repoUrl: string; repoName: string } | null>(null);
  const [copiedClone, setCopiedClone] = useState(false);

  useEffect(() => {
    // Fetch project
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.project) {
          setProject(data.project);
          const defaultRepo = `data-story-${data.project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
          setRepoName(defaultRepo);
          if (data.project.githubRepoUrl) {
            setPublishedData({
              repoUrl: data.project.githubRepoUrl,
              repoName: data.project.githubRepoName || defaultRepo,
            });
          }
        }
      });

    // Fetch user
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      });
  }, [id]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${id}/push-github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: repoName.trim(),
          isPrivate,
          customToken: customToken.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to push repository to GitHub.');
      }

      setPublishedData({
        repoUrl: data.repoUrl,
        repoName: data.repoName,
      });

      // Trigger Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during publishing.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyClone = () => {
    if (publishedData?.repoUrl) {
      navigator.clipboard.writeText(`git clone ${publishedData.repoUrl}.git`);
      setCopiedClone(true);
      setTimeout(() => setCopiedClone(false), 2000);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs font-mono text-slate-400">
        Loading publishing configuration...
      </div>
    );
  }

  return (
    <div className="py-16 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">
          GitHub Direct Deployment
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-1 editorial-title">
          Push to Your GitHub
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 font-light max-w-lg mx-auto">
          Create a fresh repository in your GitHub account and push the complete, standalone Next.js 14 source code.
        </p>
      </div>

      {publishedData ? (
        /* Success State */
        <div className="rounded-2xl glass-panel border border-emerald-500/40 p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold text-white">Successfully Published to GitHub!</h2>
              <p className="text-xs text-slate-400 mt-0.5">Your independent repository is live.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 truncate">
              <Github className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="truncate">{publishedData.repoName}</span>
            </div>
            <a
              href={publishedData.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-500/30 transition-colors"
            >
              <span>Open on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Local Run Instructions */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-slate-400 uppercase block">RUN LOCALLY IN 3 COMMANDS</span>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-emerald-400 space-y-2 relative">
              <button
                onClick={handleCopyClone}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                title="Copy Clone Command"
              >
                {copiedClone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <div className="text-slate-300">git clone {publishedData.repoUrl}.git</div>
              <div className="text-slate-300">cd {repoName}</div>
              <div className="text-slate-300">npm install &amp;&amp; npm run dev</div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Link
              href={`/preview/${id}`}
              className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
            >
              ← Back to Live Preview
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
            >
              Go to Workspace Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Configuration Form */
        <form onSubmit={handlePublish} className="rounded-2xl glass-panel border border-slate-800 p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2">REPOSITORY NAME</label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="e.g. data-story-saas-cloud"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2">VISIBILITY</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  !isPrivate
                    ? 'bg-slate-800 border-purple-500/50 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <Globe className="w-4 h-4 text-sky-400 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Public</div>
                  <div className="text-[11px] text-slate-400 font-light mt-0.5">Anyone can see and clone this story</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  isPrivate
                    ? 'bg-slate-800 border-purple-500/50 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <Lock className="w-4 h-4 text-amber-400 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Private</div>
                  <div className="text-[11px] text-slate-400 font-light mt-0.5">Only you choose who can view</div>
                </div>
              </button>
            </div>
          </div>

          {/* GitHub Token / Connection Check */}
          {!user?.hasGithubToken && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
              <div className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                <Github className="w-4 h-4" />
                <span>GitHub Authorization Required</span>
              </div>
              <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                You are currently in local explorer mode. You can connect your GitHub account via OAuth, or paste a{' '}
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo"
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-300 underline font-mono"
                >
                  GitHub Personal Access Token (repo scope)
                </a>{' '}
                below:
              </p>
              <input
                type="password"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (GitHub PAT)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !repoName.trim()}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20 hover:opacity-95 transition-all disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center gap-2 font-mono text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating GitHub Repository & Committing Project...</span>
              </span>
            ) : (
              <>
                <Github className="w-4 h-4" />
                <span>Push Full Project to GitHub</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
