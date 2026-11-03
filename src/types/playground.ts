export type Language = 'javascript' | 'python' | 'html';

export const LANGUAGE_LABELS: Record<Language, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  html: 'HTML/CSS',
};

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'system';

export interface ConsoleEntry {
  id: number;
  level: ConsoleLevel;
  text: string;
}
