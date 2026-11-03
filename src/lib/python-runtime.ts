import type { ConsoleLevel } from '@/types/playground';

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

interface PyodideInterface {
  setStdout(options: { batched: (text: string) => void }): void;
  setStderr(options: { batched: (text: string) => void }): void;
  runPythonAsync(code: string): Promise<unknown>;
}

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

let runtimePromise: Promise<PyodideInterface> | null = null;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not download the Python runtime. Check your connection and try again.'));
    document.head.appendChild(script);
  });
}

function loadPythonRuntime() {
  if (!runtimePromise) {
    runtimePromise = loadScript(`${PYODIDE_INDEX_URL}pyodide.js`)
      .then(() => {
        if (!window.loadPyodide) throw new Error('The Python runtime failed to initialize.');
        return window.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
      })
      .catch((error: unknown) => {
        runtimePromise = null;
        throw error;
      });
  }
  return runtimePromise;
}

export async function runPython(code: string, onOutput: (level: ConsoleLevel, text: string) => void) {
  const python = await loadPythonRuntime();
  python.setStdout({ batched: (text) => onOutput('log', text) });
  python.setStderr({ batched: (text) => onOutput('error', text) });
  await python.runPythonAsync(code);
}
