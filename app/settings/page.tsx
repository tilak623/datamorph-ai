'use client';
import { useEffect, useState } from 'react';
import { Github, Key, Shield, LogOut, CheckCircle2, AlertCircle, Bot, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDisconnect = async () => {
    if (confirm('Disconnect your GitHub session?')) {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    }
  };

  return (
    <div className="py-16 px-6 max-w-3xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Preferences</span>
        <h1 className="text-3xl font-bold text-white tracking-tight mt-1 editorial-title">Account &amp; Integrations</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 font-light">
          Manage your GitHub authentication status and AI provider configuration.
        </p>
      </div>

      {/* GitHub Authentication Status Card */}
      <div className="rounded-2xl glass-panel border border-slate-800 p-8 space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">GitHub Integration</h3>
              <p className="text-xs text-slate-400 font-light">Connected for repository creation and publishing.</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-semibold ${
              user?.hasGithubToken
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}
          >
            {user?.hasGithubToken ? 'Connected' : 'Demo Session'}
          </span>
        </div>

        <div className="text-xs font-mono space-y-2 text-slate-400">
          <div className="flex justify-between">
            <span>Username:</span>
            <span className="text-white">@{user?.username || 'explorer'}</span>
          </div>
          <div className="flex justify-between">
            <span>Authentication Mode:</span>
            <span className="text-white">{user?.isDemo ? 'Local Simulated Explorer' : 'GitHub OAuth 2.0'}</span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Disconnect Session</span>
          </button>

          {!user?.hasGithubToken && (
            <a
              href="/login"
              className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Connect Real GitHub</span>
            </a>
          )}
        </div>
      </div>

      {/* AI Grounding Architecture Card */}
      <div className="rounded-2xl glass-panel border border-slate-800 p-8 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Query Grounding Policy</h3>
            <p className="text-xs text-slate-400 font-light">Zero hallucination, deterministic mathematical aggregation.</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-light">
          DataMorph uses an in-memory aggregation engine for structured datasets. Before any answer is displayed,
          exact numerical results (SUM, AVG, MIN, MAX, COUNT, Pearson r) are computed from verified records.
        </p>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Deterministic Grounding Active</span>
          </div>
          <p className="text-[11px] text-slate-500 font-light">
            No external API keys are required to explore or query datasets. To configure Gemini or OpenAI for extended
            editorial prose, add <code className="text-slate-300">GEMINI_API_KEY</code> or <code className="text-slate-300">OPENAI_API_KEY</code> to your <code className="text-slate-300">.env.local</code> file.
          </p>
        </div>
      </div>
    </div>
  );
}
