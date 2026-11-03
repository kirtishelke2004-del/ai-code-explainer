import { useMemo, useRef, type KeyboardEvent, type UIEvent } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
}

const INDENT = '  ';

export default function CodeEditor({ value, onChange, onRun }: CodeEditorProps) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineCount = useMemo(() => value.split('\n').length, [value]);

  const syncScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      onRun();
      return;
    }

    if (event.key !== 'Tab' || event.shiftKey) return;
    event.preventDefault();

    const textarea = event.currentTarget;
    const { selectionStart, selectionEnd } = textarea;
    const next = value.slice(0, selectionStart) + INDENT + value.slice(selectionEnd);
    onChange(next);

    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + INDENT.length;
    });
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-zinc-950 font-mono text-[13px] leading-6">
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="select-none overflow-hidden border-r border-zinc-800 bg-zinc-900/60 px-3 py-3 text-right text-zinc-600"
      >
        {Array.from({ length: lineCount }, (_, index) => (
          <div key={index}>{index + 1}</div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        wrap="off"
        aria-label="Code editor"
        className="min-h-0 flex-1 resize-none overflow-auto whitespace-pre bg-transparent px-4 py-3 text-zinc-100 caret-sky-400 outline-none selection:bg-sky-500/30"
      />
    </div>
  );
}
