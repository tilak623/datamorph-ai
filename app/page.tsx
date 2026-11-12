'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Github,
  BarChart3,
  MessageSquare,
  GitBranch,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  Download,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] mesh-glow pointer-events-none" />
      <div className="absolute top-[800px] left-1/4 w-96 h-96 accent-glow pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs font-mono text-emerald-400 mb-8 border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Pudding & NYT Editorial Style • Automated</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1] editorial-title"
        >
          Turn your raw data into an{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent italic">
            interactive editorial
          </span>{' '}
          experience.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light"
        >
          Upload your CSV, XLSX, or JSON dataset. DataMorph automatically calculates deep statistical distributions,
          generates a publication-grade scrollytelling website, equips it with a grounded AI chatbot, and pushes the
          entire standalone project into your own GitHub repository.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/upload"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 hover:opacity-95 transition-all group"
          >
            <span>Generate Your Website Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-4 rounded-xl glass-panel text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 hover:text-white hover:border-slate-700 transition-all"
          >
            <Github className="w-4 h-4" />
            <span>Connect with GitHub</span>
          </Link>
        </motion.div>

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-14 pt-8 border-t border-slate-800/60 flex flex-wrap items-center justify-center gap-8 text-xs font-mono text-slate-400"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            No Dummy Screens • 100% Real Code
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Zero-Hallucination Query Engine
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Direct 1-Click Push to GitHub
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Standalone Next.js 14 Bundle
          </span>
        </motion.div>
      </section>

      {/* Visual Product Demonstration Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="relative rounded-2xl glass-panel border border-slate-800 p-2 sm:p-4 shadow-2xl">
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 mb-4 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-slate-400">editorial-preview.datamorph.ai</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Scrollytelling Engine
            </span>
          </div>

          {/* Interactive Simulation Preview */}
          <div className="bg-[#090e18] rounded-xl p-8 sm:p-12 border border-slate-800/60 overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                  Grounded Editorial Investigation
                </span>
                <div className="text-6xl sm:text-7xl font-black text-white editorial-title tracking-tight">
                  $14.2M
                </div>
                <h3 className="text-2xl font-bold text-slate-200">
                  Total Enterprise Volume Across 12,000 Verified Transactions
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                  Rather than generic bar charts, each story reveals structural distributions, Pearson correlations,
                  and dynamic category benchmarks that react fluidly as the reader navigates through analytical chapters.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-mono text-slate-300">
                    4 Editorial Chapters
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
                    98% Quality Score
                  </div>
                </div>
              </div>

              {/* Mock Pinned Visualizer */}
              <div className="lg:col-span-6 bg-slate-900/90 rounded-xl p-6 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <span className="text-xs font-mono text-slate-400">Chapter 02 // Pinned Dynamic Visualizer</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">r = +0.84</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Enterprise Tier</span>
                    <span className="text-emerald-400">68% Share</span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[68%]" />
                  </div>

                  <div className="flex justify-between text-xs font-mono text-slate-400 pt-2">
                    <span>Growth Tier</span>
                    <span className="text-sky-400">24% Share</span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 rounded-full w-[24%]" />
                  </div>

                  <div className="flex justify-between text-xs font-mono text-slate-400 pt-2">
                    <span>Starter Tier</span>
                    <span className="text-purple-400">8% Share</span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full w-[8%]" />
                  </div>
                </div>

                {/* Grounded Chat Bubble inside preview */}
                <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800/90 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Dataset Grounded Assistant</span>
                  </div>
                  <p className="text-slate-300">
                    &ldquo;Enterprise accounts accounted for $9.65M with an average transaction value of $804.16.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Workflow Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">End-to-End Pipeline</span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mt-2 editorial-title">How DataMorph Works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mt-3 text-sm font-light">
            From raw spreadsheet to a deployed, owner-controlled GitHub repository in under 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl glass-panel relative group hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-emerald-400 mb-2">01 // INGESTION</div>
            <h3 className="text-xl font-bold text-white mb-2">Drop CSV, Excel or JSON</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Handles parsing, data typing, null value checks, anomaly isolation, and distribution calculations.
            </p>
          </div>

          <div className="p-8 rounded-2xl glass-panel relative group hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-sky-400 mb-2">02 // SCROLLYTELLING SYNTHESIS</div>
            <h3 className="text-xl font-bold text-white mb-2">Editorial Story Generation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesizes data-first typography, pinned scrollytelling scenes, bento metric grids, and custom palettes.
            </p>
          </div>

          <div className="p-8 rounded-2xl glass-panel relative group hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
              <GitBranch className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-purple-400 mb-2">03 // GITHUB PUBLISHING</div>
            <h3 className="text-xl font-bold text-white mb-2">Push to Your Own GitHub</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automates new repo creation, commits the complete independent Next.js source code, and prepares local running instructions.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Footer Section */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 editorial-title">
          Ready to experience your data like never before?
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-10 text-sm font-light">
          Upload any dataset now or test with our curated sample datasets. No credit card required.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 hover:opacity-95 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Upload Dataset & Generate Website</span>
        </Link>
      </section>
    </div>
  );
}
