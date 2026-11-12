'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileCode,
  ArrowRight,
  Database,
} from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls', 'json'].includes(ext || '')) {
      setError('Please upload a valid .csv, .xlsx, or .json file.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25MB limit.');
      return;
    }
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);

      const res = await fetch('/api/projects/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to process dataset.');
      }

      // Redirect to the generation progress page
      router.push(`/generate/${data.project.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.');
      setLoading(false);
    }
  };

  // Quick 1-click sample dataset loader
  const handleLoadSample = async (sampleType: 'saas' | 'climate') => {
    setLoading(true);
    setError(null);
    try {
      let file: File;
      if (sampleType === 'saas') {
        const res = await fetch('/data/samples/saas_metrics.json');
        const blob = await res.blob();
        file = new File([blob], 'saas_cloud_operations.json', { type: 'application/json' });
        setTitle('Global SaaS Operations & Latency Benchmark');
      } else {
        const res = await fetch('/data/samples/climate_carbon.csv');
        const blob = await res.blob();
        file = new File([blob], 'global_carbon_renewables.csv', { type: 'text/csv' });
        setTitle('Carbon Emissions & Renewable Energy Trajectories');
      }
      setSelectedFile(file);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', sampleType === 'saas' ? 'Global SaaS Operations Benchmark' : 'Global Carbon & Energy Trajectories');

      const uploadRes = await fetch('/api/projects/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await uploadRes.json();
      if (!uploadRes.ok || data.error) throw new Error(data.error);

      router.push(`/generate/${data.project.id}`);
    } catch (e: any) {
      setError(e.message || 'Failed to load sample dataset.');
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Dataset Ingestion</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-1 editorial-title">
          Upload Your Dataset
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 font-light max-w-lg mx-auto">
          Drop your structured data. DataMorph will immediately compute distributions, detect patterns, and author an
          editorial scrollytelling data story.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Drag-and-drop Card */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-10 sm:p-14 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-emerald-500 bg-emerald-500/5 scale-[1.01]'
            : 'border-slate-800 glass-panel hover:border-slate-700'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-sky-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
          <UploadCloud className="w-8 h-8" />
        </div>

        {selectedFile ? (
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              File Selected
            </span>
            <div className="text-lg font-bold text-white">{selectedFile.name}</div>
            <div className="text-xs font-mono text-slate-400">
              {(selectedFile.size / 1024).toFixed(1)} KB • Click to swap file
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-base font-bold text-white">Drag & drop your dataset here</div>
            <p className="text-xs text-slate-400">or click to browse from your device</p>
            <div className="pt-4 flex items-center justify-center gap-3 text-[11px] font-mono text-slate-500">
              <span>CSV</span>
              <span>•</span>
              <span>Excel (.xlsx)</span>
              <span>•</span>
              <span>JSON</span>
              <span>•</span>
              <span>Up to 25MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Metadata Configuration */}
      {selectedFile && (
        <div className="mt-6 p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2">PROJECT TITLE</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Global SaaS Performance Benchmark"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:opacity-95 transition-all"
          >
            {loading ? (
              <span className="font-mono text-xs">Analyzing Dataset & Generating Architecture...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Launch Analysis & Scrollytelling Generator</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Instant Sample Datasets */}
      <div className="mt-12 pt-8 border-t border-slate-800/80">
        <div className="flex items-center gap-2 mb-4 text-xs font-mono text-slate-400">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Don&apos;t have a dataset ready? Try our verified samples:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleLoadSample('saas')}
            disabled={loading}
            className="p-5 rounded-xl glass-panel border border-slate-800 hover:border-emerald-500/40 text-left transition-all group flex items-start justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-sky-400 uppercase">JSON • 12 Records</span>
              <h4 className="text-sm font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors">
                SaaS Operations & Latency Benchmark
              </h4>
              <p className="text-xs text-slate-400 mt-1 font-light">
                Active users, revenue volumes, region tiers, latency, and error rates.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
          </button>

          <button
            onClick={() => handleLoadSample('climate')}
            disabled={loading}
            className="p-5 rounded-xl glass-panel border border-slate-800 hover:border-emerald-500/40 text-left transition-all group flex items-start justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase">CSV • 16 Records</span>
              <h4 className="text-sm font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors">
                Carbon Emissions & Energy Transition
              </h4>
              <p className="text-xs text-slate-400 mt-1 font-light">
                Multinational emissions, renewable energy percentages, and GDP growth.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
