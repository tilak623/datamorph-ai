import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'DataMorph AI | Dataset to Interactive Scrollytelling Generator',
  description:
    'Transform user-uploaded datasets into editorial, interactive scrollytelling websites with grounded AI chatbots and 1-click GitHub publishing.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
        <Navbar />
        <main className="flex-1">{children}</main>
        
        {/* Global Platform Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/60 py-8 px-6 text-center text-xs font-mono text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">DataMorph AI</span>
              <span>//</span>
              <span>Editorial Scrollytelling Generator</span>
            </div>
            <div className="flex items-center gap-6">
              <span>Next.js 14 • Framer Motion • Recharts • Octokit</span>
              <span>•</span>
              <span className="text-emerald-400">Production Ready</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
