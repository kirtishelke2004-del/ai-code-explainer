import { useEffect, useRef, useState } from 'react';
import { AlertCircle, RotateCw, Sparkles } from 'lucide-react';
import type { Language } from '@/types/playground';
import { explainCode } from '@/lib/explain-code';
import CopyButton from '@/components/CopyButton';
import MarkdownView from '@/components/MarkdownView';

interface ExplanationPanelProps {
  code: string;
  language: Language;
}

type ExplainStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ExplanationPanel({ code, language }: ExplanationPanelProps) {
  const [status, setStatus] = useState<ExplainStatus>('idle');
  const [explanation, setExplanation] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const hasCode = code.trim().length > 0;

  const handleExplain = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setStatus('loading');
    setErrorMessage('');

    try {
      const result = await explainCode(code, language, controller.signal);
      if (controller.signal.aborted) return;
      setExplanation(result);
      setStatus('success');
    } catch (error) {
      if (controller.signal.aborted) return;
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const isLoading = status === 'loading';

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-zinc-900/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-sky-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-zinc-50">AI Explanation</h2>
        </div>
        <div className="flex items-center gap-2">
          {status === 'success' && <CopyButton text={explanation} label="Copy explanation" />}
          <button
            type="button"
            onClick={handleExplain}
            disabled={!hasCode || isLoading}
            title={hasCode ? undefined : 'Write some code in the playground first'}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-400 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 shadow-sm shadow-emerald-400/20 transition-all hover:bg-emerald-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isLoading ? 'animate-pulse' : ''}`} aria-hidden="true" />
            {status === 'success' ? 'Explain again' : 'Explain Code with AI'}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">
        {status === 'idle' && <EmptyState hasCode={hasCode} />}
        {status === 'loading' && <LoadingState />}
        {status === 'error' && (
          <div role="alert" className="flex items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-rose-200">{errorMessage}</p>
              <button
                type="button"
                onClick={handleExplain}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 transition-colors hover:text-rose-100"
              >
                <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                Try again
              </button>
            </div>
          </div>
        )}
        {status === 'success' && (
          <div className="animate-fade-in">
            <MarkdownView markdown={explanation} />
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyState({ hasCode }: { hasCode: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
        <Sparkles className="h-5 w-5 text-sky-400" aria-hidden="true" />
      </div>
      <p className="max-w-xs text-sm leading-[1.5] text-zinc-400">
        {hasCode
          ? 'Get a plain-language walkthrough of your code, its complexity, possible bugs, and a better approach.'
          : 'Write or load some code in the playground, then ask the AI to explain it.'}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-sm text-zinc-300">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-400" />
        </span>
        Analyzing your code...
      </div>
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="flex flex-col gap-2.5">
          <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-800" style={{ animationDelay: `${item * 120}ms` }} />
          <div className="h-3 w-full animate-pulse rounded bg-zinc-800/70" style={{ animationDelay: `${item * 120 + 60}ms` }} />
          <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-800/70" style={{ animationDelay: `${item * 120 + 120}ms` }} />
        </div>
      ))}
    </div>
  );
}
