export type MarkdownBlock =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'code'; language: string; text: string };

const FENCE_PATTERN = /^\s*```(\w*)\s*$/;
const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;
const BULLET_PATTERN = /^\s*[-*]\s+(.*)$/;
const ORDERED_PATTERN = /^\s*\d+[.)]\s+(.*)$/;

function startsBlock(line: string) {
  return FENCE_PATTERN.test(line) || HEADING_PATTERN.test(line) || BULLET_PATTERN.test(line) || ORDERED_PATTERN.test(line);
}

export function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (line.trim() === '') {
      index += 1;
      continue;
    }

    const fence = line.match(FENCE_PATTERN);
    if (fence) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push({ type: 'code', language: fence[1], text: codeLines.join('\n') });
      continue;
    }

    const heading = line.match(HEADING_PATTERN);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2].trim() });
      index += 1;
      continue;
    }

    const isOrdered = ORDERED_PATTERN.test(line);
    const listPattern = isOrdered ? ORDERED_PATTERN : BULLET_PATTERN;
    if (listPattern.test(line)) {
      const items: string[] = [];
      while (index < lines.length && listPattern.test(lines[index])) {
        items.push(lines[index].match(listPattern)![1].trim());
        index += 1;
      }
      blocks.push({ type: 'list', ordered: isOrdered, items });
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() !== '' && !startsBlock(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
  }

  return blocks;
}
