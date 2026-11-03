import { Fragment, type ReactNode } from 'react';
import { parseMarkdown, type MarkdownBlock } from '@/lib/markdown';
import CopyButton from '@/components/CopyButton';

interface MarkdownViewProps {
  markdown: string;
}

const INLINE_PATTERN = /(`[^`]+`|\*\*[^*]+\*\*)/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE_PATTERN).map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={index} className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[0.85em] text-sky-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-semibold text-zinc-50">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function renderBlock(block: MarkdownBlock, index: number): ReactNode {
  switch (block.type) {
    case 'heading': {
      const sizeClass = block.level <= 2 ? 'mt-8 border-b border-zinc-800 pb-2 text-lg' : 'mt-6 text-base';
      return (
        <h3 key={index} className={`${sizeClass} font-semibold leading-[1.2] text-zinc-50 first:mt-0`}>
          {renderInline(block.text)}
        </h3>
      );
    }
    case 'paragraph':
      return (
        <p key={index} className="text-sm leading-[1.5] text-zinc-300">
          {renderInline(block.text)}
        </p>
      );
    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag
          key={index}
          className={`space-y-1.5 pl-5 text-sm leading-[1.5] text-zinc-300 ${block.ordered ? 'list-decimal' : 'list-disc'} marker:text-sky-400`}
        >
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item)}</li>
          ))}
        </ListTag>
      );
    }
    case 'code':
      return (
        <div key={index} className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
            <span className="font-mono text-xs text-zinc-500">{block.language || 'code'}</span>
            <CopyButton text={block.text} label="Copy snippet" />
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-zinc-100">
            <code>{block.text}</code>
          </pre>
        </div>
      );
  }
}

export default function MarkdownView({ markdown }: MarkdownViewProps) {
  return <div className="flex flex-col gap-3">{parseMarkdown(markdown).map(renderBlock)}</div>;
}
