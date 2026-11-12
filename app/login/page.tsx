'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, ShieldCheck, Sparkles, ArrowRight, Info, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="glass-panel border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-500 p-0.5 mx-auto mb-4 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Connect with DataMorph</h1>
            <p className="text-slate-400 text-xs mt-2 font-light">
              Sign in to generate editorial data stories and push directly to your GitHub.
            </p>
          </div>

          <div className="space-y-4">
            {/* Primary GitHub OAuth Login */}
            <a
              href="/api/auth/github"
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center justify-center gap-3 shadow-lg transition-all"
            >
              <Github className="w-4 h-4" />
              <span>Continue with GitHub</span>
            </a>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-[10px] font-mono text-slate-500 uppercase">Or Local Dev Mode</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Quick Demo Mode */}
            <button
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="w-full py-3.5 px-4 rounded-xl glass-panel hover:bg-slate-800/80 text-emerald-400 border border-emerald-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{demoLoading ? 'Starting Local Session...' : 'Instant Explorer Mode (Zero Credentials)'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Security & Permissions Callout */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Security & Permission Policy</span>
            </div>
            <ul className="text-[11px] text-slate-500 space-y-1.5 font-light">
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>We never request or store your GitHub password.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Session tokens are encrypted using AES-256 server-side cookies.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Repo scope is used exclusively when you click &ldquo;Push to GitHub&rdquo;.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
