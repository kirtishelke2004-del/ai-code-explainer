import type { ConsoleLevel } from '@/types/playground';

export const SANDBOX_MESSAGE_SOURCE = 'codelens-sandbox';

export interface SandboxMessage {
  source: typeof SANDBOX_MESSAGE_SOURCE;
  level: ConsoleLevel;
  text: string;
}

const CONSOLE_BRIDGE = `<script>
(function () {
  var SOURCE = '${SANDBOX_MESSAGE_SOURCE}';
  function format(value) {
    if (typeof value === 'string') return value;
    if (value instanceof Error) return value.stack || String(value);
    try {
      var json = JSON.stringify(value, null, 2);
      return json === undefined ? String(value) : json;
    } catch (e) {
      return String(value);
    }
  }
  function send(level, args) {
    var text = Array.prototype.map.call(args, format).join(' ');
    parent.postMessage({ source: SOURCE, level: level, text: text }, '*');
  }
  ['log', 'info', 'warn', 'error'].forEach(function (level) {
    console[level] = function () { send(level, arguments); };
  });
  window.addEventListener('error', function (event) {
    send('error', [event.error || event.message]);
  });
  window.addEventListener('unhandledrejection', function (event) {
    send('error', [event.reason]);
  });
})();
</script>`;

const HTML_DOCUMENT_TEMPLATE = (body: string) => `<!doctype html>
<html>
<head><meta charset="utf-8" /></head>
<body>
${body}
</body>
</html>`;

function escapeForInlineScript(code: string) {
  return code.replace(/<\/script/gi, '<\\/script');
}

export function buildJavaScriptDocument(code: string) {
  return `${CONSOLE_BRIDGE}${HTML_DOCUMENT_TEMPLATE(`<script>\n${escapeForInlineScript(code)}\n</script>`)}`;
}

export function buildHtmlDocument(markup: string) {
  return `${CONSOLE_BRIDGE}${markup}`;
}

export function isSandboxMessage(data: unknown): data is SandboxMessage {
  if (typeof data !== 'object' || data === null) return false;
  const candidate = data as Partial<SandboxMessage>;
  return candidate.source === SANDBOX_MESSAGE_SOURCE && typeof candidate.text === 'string' && typeof candidate.level === 'string';
}
