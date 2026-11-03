import type { ReactNode } from 'react';
import { Eye, Trash2, Terminal } from 'lucide-react';
import type { ConsoleEntry, ConsoleLevel } from '@/types/playground';
import CopyButton from '@/components/CopyButton';
import SandboxFrame from '@/components/SandboxFrame';
import type { SandboxMessage } from '@/lib/sandbox';

export type OutputTab = 'console' | 'preview';

export interface PreviewSession {
  id: number;
  kind: 'javascript' | 'html';
  srcDoc: string;
}

interface OutputPanelProps {
  tab: OutputTab;
  onTabChange: (tab: OutputTab) => void;
  entries: ConsoleEntry[];
  session: PreviewSession | null;
  onSandboxMessage: (message: SandboxMessage) => void;
  onClear: () => void;
}

const LEVEL_STYLES: Record<ConsoleLevel, string> = {
  log: 'text-zinc-200',
  info: 'text-sky-300',
  warn: 'text-amber-300',
  error: 'text-rose-400',
  system: 'text-zinc-500 italic',
};

export default function OutputPanel({ tab, onTabChange, entries, session, onSandboxMessage, onClear }: OutputPanelProps) {
  const hasPreview = session?.kind === 'html';
  const transcript = entries.map((entry) => entry.text).join('\n');

  return (
    <div className="flex min-h-0 flex-1 flex-col border-t border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-900/70 px-3 py-2">
        <div className="flex items-center gap-1 rounded-lg bg-zinc-800/70 p-1">
          <TabButton active={tab === 'console'} onClick={() => onTabChange('console')} icon={<Terminal className="h-3.5 w-3.5" />}>
            Terminal
          </TabButton>
          {hasPreview && (
            <TabButton active={tab === 'preview'} onClick={() => onTabChange('preview')} icon={<Eye className="h-3.5 w-3.5" />}>
              Preview
            </TabButton>
          )}
        </div>
        {tab === 'console' && (
          <div className="flex items-center gap-2">
            <CopyButton text={transcript} label="Copy output" disabled={entries.length === 0} />
            <button
              type="button"
              onClick={onClear}
              disabled={entries.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        {tab === 'console' && (
          <div className="absolute inset-0 overflow-auto px-4 py-3 font-mono text-[13px] leading-6" aria-live="polite">
            {entries.length === 0 ? (
              <p className="text-zinc-600">Run your code to see console output here.</p>
            ) : (
              entries.map((entry) => (
                <pre key={entry.id} className={`whitespace-pre-wrap break-words font-mono ${LEVEL_STYLES[entry.level]}`}>
                  {entry.level === 'system' ? entry.text : `› ${entry.text}`}
                </pre>
              ))
            )}
          </div>
        )}
        {session && (
          <div className={tab === 'preview' ? 'absolute inset-0' : 'absolute inset-0 invisible'}>
            <SandboxFrame
              key={session.id}
              srcDoc={session.srcDoc}
              visible={tab === 'preview' && hasPreview}
              onMessage={onSandboxMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}

function TabButton({ active, onClick, icon, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
        active ? 'bg-zinc-700 text-zinc-50 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
