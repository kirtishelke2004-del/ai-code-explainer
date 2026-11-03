import { useCallback, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Loader2, Play } from 'lucide-react';
import type { ConsoleEntry, ConsoleLevel, Language } from '@/types/playground';
import { LANGUAGE_LABELS } from '@/types/playground';
import { CODE_EXAMPLES } from '@/lib/examples';
import { buildHtmlDocument, buildJavaScriptDocument } from '@/lib/sandbox';
import { runPython } from '@/lib/python-runtime';
import CodeEditor from '@/components/CodeEditor';
import CopyButton from '@/components/CopyButton';
import OutputPanel, { type OutputTab, type PreviewSession } from '@/components/OutputPanel';

interface PlaygroundPanelProps {
  code: string;
  language: Language;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: Language) => void;
}

export default function PlaygroundPanel({ code, language, onCodeChange, onLanguageChange }: PlaygroundPanelProps) {
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [session, setSession] = useState<PreviewSession | null>(null);
  const [outputTab, setOutputTab] = useState<OutputTab>('console');
  const [isPythonRunning, setIsPythonRunning] = useState(false);
  const [exampleId, setExampleId] = useState('');
  const nextEntryId = useRef(0);

  const appendEntry = useCallback((level: ConsoleLevel, text: string) => {
    nextEntryId.current += 1;
    const id = nextEntryId.current;
    setEntries((previous) => [...previous, { id, level, text }]);
  }, []);

  const handleSandboxMessage = useCallback(
    (message: { level: ConsoleLevel; text: string }) => appendEntry(message.level, message.text),
    [appendEntry],
  );

  const handleRun = async () => {
    if (isPythonRunning) return;
    setEntries([]);

    if (language === 'python') {
      setSession(null);
      setOutputTab('console');
      setIsPythonRunning(true);
      appendEntry('system', 'Running Python...');
      try {
        await runPython(code, appendEntry);
      } catch (error) {
        appendEntry('error', error instanceof Error ? error.message : String(error));
      } finally {
        setIsPythonRunning(false);
      }
      return;
    }

    const kind = language === 'html' ? 'html' : 'javascript';
    const srcDoc = kind === 'html' ? buildHtmlDocument(code) : buildJavaScriptDocument(code);
    setSession((previous) => ({ id: (previous?.id ?? 0) + 1, kind, srcDoc }));
    setOutputTab(kind === 'html' ? 'preview' : 'console');
  };

  const handleExampleSelect = (id: string) => {
    const example = CODE_EXAMPLES.find((item) => item.id === id);
    setExampleId(id);
    if (!example) return;
    onLanguageChange(example.language);
    onCodeChange(example.code);
    setEntries([]);
    setSession(null);
    setOutputTab('console');
  };

  const handleClear = () => setEntries([]);

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <SelectField
            aria-label="Language"
            value={language}
            onChange={(value) => onLanguageChange(value as Language)}
          >
            {(Object.keys(LANGUAGE_LABELS) as Language[]).map((key) => (
              <option key={key} value={key}>
                {LANGUAGE_LABELS[key]}
              </option>
            ))}
          </SelectField>
          <SelectField aria-label="Load an example" value={exampleId} onChange={handleExampleSelect}>
            <option value="">Load an example...</option>
            {CODE_EXAMPLES.map((example) => (
              <option key={example.id} value={example.id}>
                {example.label}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={code} label="Copy code" disabled={!code.trim()} />
          <button
            type="button"
            onClick={handleRun}
            disabled={isPythonRunning}
            title="Run code (Ctrl/Cmd + Enter)"
            className="inline-flex items-center gap-1.5 rounded-md bg-sky-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 shadow-sm shadow-sky-500/20 transition-all hover:bg-sky-400 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            {isPythonRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            )}
            {isPythonRunning ? 'Running' : 'Run Code'}
          </button>
        </div>
      </div>

      <CodeEditor value={code} onChange={onCodeChange} onRun={handleRun} />

      <div className="flex h-72 shrink-0 flex-col">
        <OutputPanel
          tab={outputTab}
          onTabChange={setOutputTab}
          entries={entries}
          session={session}
          onSandboxMessage={handleSandboxMessage}
          onClear={handleClear}
        />
      </div>
    </section>
  );
}

interface SelectFieldProps {
  'aria-label': string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

function SelectField({ value, onChange, children, ...rest }: SelectFieldProps) {
  return (
    <div className="relative">
      <select
        {...rest}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none rounded-md border border-zinc-700 bg-zinc-800 py-1.5 pl-3 pr-8 text-xs font-medium text-zinc-100 transition-colors hover:border-zinc-600 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
    </div>
  );
}
