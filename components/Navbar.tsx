'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Github, LayoutDashboard, UploadCloud, LogOut, Settings, ExternalLink } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  // Hide navbar in full preview mode if query param clean is set
  if (pathname.startsWith('/preview') && typeof window !== 'undefined' && window.location.search.includes('clean=true')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight text-lg">DataMorph</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AI
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 hidden sm:block">Dataset → Scrollytelling Generator</p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-1 font-mono text-xs">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                pathname === '/' ? 'text-white bg-slate-800/60' : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </Link>
            <Link
              href="/upload"
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                pathname === '/upload' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload Dataset
            </Link>
            <Link
              href="/dashboard"
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                pathname === '/dashboard' ? 'text-white bg-slate-800/60' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              My Projects
            </Link>
            <Link
              href="/settings"
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                pathname === '/settings' ? 'text-white bg-slate-800/60' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </Link>
          </div>

          {/* Right Action / Auth Button */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-200 hidden sm:inline">@{user.username}</span>
                  {user.isDemo && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Demo
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all"
              >
                <Github className="w-4 h-4" />
                <span>Connect GitHub</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
