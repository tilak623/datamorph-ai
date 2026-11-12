'use client';
import { useState } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, CheckCircle2 } from 'lucide-react';

interface ChatItem {
  role: 'user' | 'assistant';
  content: string;
  groundedFacts?: string[];
}

export default function PreviewChatbot({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      role: 'assistant',
      content:
        'Welcome! I am your dataset-grounded editorial analyst. Ask me any question regarding totals, averages, comparisons, top categories, or anomalies in this dataset.',
    },
  ]);

  const SUGGESTED_QUESTIONS = [
    'What is the highest recorded value?',
    'What is the overall average across all records?',
    'How many verified records are analyzed?',
    'Compare top categories in the dataset.',
  ];

  const handleSend = async (qToSend?: string) => {
    const q = (qToSend || question).trim();
    if (!q || loading) return;

    setQuestion('');
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to query dataset.');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          groundedFacts: data.queryResult?.groundedFacts,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err.message || 'Could not query dataset engine.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-emerald-500 text-slate-950 shadow-2xl hover:bg-emerald-400 transition-all z-50 flex items-center gap-2.5 font-bold text-xs group"
      >
        <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Ask Dataset AI</span>
      </button>

      {/* Floating Chat Drawer */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[400px] max-w-[94vw] h-[550px] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-tight">Dataset Grounded AI</h3>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Zero Hallucination
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'bg-slate-900 text-slate-200 border border-slate-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {/* Grounded facts badge */}
                  {m.groundedFacts && m.groundedFacts.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
                      <span className="text-emerald-400 uppercase font-semibold block">Grounded Evidence:</span>
                      {m.groundedFacts.map((fact, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-1 text-slate-300">
                          <span>•</span>
                          <span>{fact}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 italic">
                <Bot className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Aggregating verified records...</span>
              </div>
            )}
          </div>

          {/* Suggested Quick Question Chips */}
          <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800/80 overflow-x-auto flex gap-1.5 no-scrollbar">
            {SUGGESTED_QUESTIONS.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSend(sq)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300 hover:text-emerald-400 hover:bg-slate-700 transition-colors shrink-0"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Input form */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this data..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-3.5 py-2 bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 disabled:opacity-40 font-bold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
