import { useState } from 'react';
import { Code2 } from 'lucide-react';
import type { Language } from '@/types/playground';
import { DEFAULT_EXAMPLE } from '@/lib/examples';
import PlaygroundPanel from '@/components/PlaygroundPanel';
import ExplanationPanel from '@/components/ExplanationPanel';

function App() {
  const [code, setCode] = useState(DEFAULT_EXAMPLE.code);
  const [language, setLanguage] = useState<Language>(DEFAULT_EXAMPLE.language);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 lg:h-screen">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 ring-1 ring-sky-500/40">
            <Code2 className="h-4 w-4 text-sky-400" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-[1.2] text-zinc-50">CodeLens</span>
            <span className="text-[11px] leading-[1.2] text-zinc-500">AI Code Explainer and Live Playground</span>
          </div>
        </div>
        <span className="hidden rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-[11px] font-medium text-zinc-400 sm:inline-flex">
          Powered by Gemini 2.5 Flash
        </span>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-zinc-800 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <div className="flex min-h-[760px] min-w-0 flex-col lg:min-h-0">
          <PlaygroundPanel
            code={code}
            language={language}
            onCodeChange={setCode}
            onLanguageChange={setLanguage}
          />
        </div>
        <div className="flex min-h-[560px] min-w-0 flex-col lg:min-h-0">
          <ExplanationPanel code={code} language={language} />
        </div>
      </main>
    </div>
  );
}

export default App;
