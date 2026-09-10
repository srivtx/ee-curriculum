'use client';

import * as React from 'react';
import { Play, RotateCcw, Loader2, Terminal, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getSnippet } from './playground-snippets';

// Pyodide is loaded from CDN as a global. We declare minimal typing.
declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideAPI>;
    __pyodideLoading?: Promise<PyodideAPI>;
  }
}

interface PyodideAPI {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (
    names: string | string[]
  ) => Promise<unknown>;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
  FS: {
    readFile: (path: string, opts: { encoding: string }) => Uint8Array;
    readdir: (path: string) => string[];
    stat: (path: string) => { size: number };
    unlink: (path: string) => void;
  };
}

const PYODIDE_VERSION = '0.26.2';
const PYODIDE_INDEX = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

const PLOT_PATH = '/tmp/plot.png';

function loadPyodideScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.loadPyodide) return resolve();
    const existing = document.getElementById(
      'pyodide-script'
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Pyodide script'))
      );
      return;
    }
    const s = document.createElement('script');
    s.id = 'pyodide-script';
    s.src = `${PYODIDE_INDEX}pyodide.js`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Pyodide script'));
    document.head.appendChild(s);
  });
}

async function getPyodide(onStdout: (s: string) => void, onStderr: (s: string) => void): Promise<PyodideAPI> {
  await loadPyodideScript();
  if (!window.loadPyodide) {
    throw new Error('Pyodide failed to initialize');
  }
  // Cache the initialization promise so we only do it once per page session.
  if (!window.__pyodideLoading) {
    window.__pyodideLoading = window
      .loadPyodide({ indexURL: PYODIDE_INDEX })
      .then(async (py) => {
        // Pre-load numpy, scipy, matplotlib. These are large (several MB).
        await py.loadPackage(['numpy', 'scipy', 'matplotlib']);
        return py;
      });
  }
  const py = await window.__pyodideLoading;
  py.setStdout({ batched: onStdout });
  py.setStderr({ batched: onStderr });
  return py;
}

type RunState = 'idle' | 'loading' | 'running' | 'done' | 'error';

export function PythonPlayground({ lessonId }: { lessonId: string }) {
  const snippet = React.useMemo(() => getSnippet(lessonId), [lessonId]);
  const [code, setCode] = React.useState(snippet.code);
  const [output, setOutput] = React.useState<string>('');
  const [plotSrc, setPlotSrc] = React.useState<string | null>(null);
  const [state, setState] = React.useState<RunState>('idle');
  const [elapsed, setElapsed] = React.useState<number | null>(null);
  const taRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Reset code when lesson changes
  React.useEffect(() => {
    setCode(snippet.code);
    setOutput('');
    setPlotSrc(null);
    setState('idle');
    setElapsed(null);
  }, [snippet, lessonId]);

  const appendOut = React.useCallback((s: string) => {
    setOutput((prev) => prev + s);
  }, []);

  async function handleRun() {
    setState('loading');
    setOutput('');
    setPlotSrc(null);
    const t0 = performance.now();
    try {
      const py = await getPyodide(appendOut, appendOut);
      setState('running');
      // Clean any previous plot
      try {
        py.FS.unlink(PLOT_PATH);
      } catch {
        /* file doesn't exist */
      }
      await py.runPythonAsync(code);

      // Check for a matplotlib plot
      try {
        const files = py.FS.readdir('/tmp');
        if (files.includes('plot.png')) {
          const bytes = py.FS.readFile(PLOT_PATH, { encoding: 'binary' });
          // Convert to base64
          let binary = '';
          const chunk = 0x8000;
          for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode.apply(
              null,
              Array.from(bytes.subarray(i, i + chunk))
            );
          }
          const b64 = btoa(binary);
          setPlotSrc(`data:image/png;base64,${b64}`);
        }
      } catch {
        /* no plot */
      }

      const t1 = performance.now();
      setElapsed((t1 - t0) / 1000);
      setState('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      appendOut(`\n[Error] ${msg}\n`);
      setState('error');
    }
  }

  function handleReset() {
    setCode(snippet.code);
    setOutput('');
    setPlotSrc(null);
    setState('idle');
    setElapsed(null);
  }

  // Tab key inserts spaces instead of moving focus
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newValue =
        code.substring(0, start) + '    ' + code.substring(end);
      setCode(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  }

  const isBusy = state === 'loading' || state === 'running';

  return (
    <div className="mt-4 overflow-hidden rounded-sm border border-accent/30 bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-accent/5 px-3 py-2">
        <Terminal className="h-4 w-4 text-accent" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-accent dark:text-accent">
          Python Playground
        </span>
        <span className="text-[10px] text-muted-foreground">
          (Pyodide v{PYODIDE_VERSION} · NumPy · SciPy · Matplotlib)
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            disabled={isBusy}
            className="h-7 gap-1 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={isBusy}
            className="h-7 gap-1 bg-accent px-3 text-xs font-semibold text-white hover:bg-accent"
          >
            {state === 'loading' ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading Pyodide…
              </>
            ) : state === 'running' ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Running…
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                Run
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Hint */}
      <p className="border-b border-border/40 bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground/70">Demo:</span>{' '}
        {snippet.hint}
      </p>

      {/* Editor */}
      <div className="relative">
        <div className="flex items-stretch">
          {/* line numbers gutter */}
          <div
            aria-hidden
            className="ee-mono select-none bg-muted/30 px-2 py-2 text-right text-[11px] leading-[1.55] text-muted-foreground/60"
          >
            {code.split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <textarea
            ref={taRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="ee-code-editor flex-1 resize-y bg-background px-3 py-2 text-foreground outline-none"
            style={{ minHeight: '220px' }}
            aria-label="Python code editor"
          />
        </div>
      </div>

      {/* Output */}
      <div className="border-t border-border/60 bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
          <span className="ee-mono text-[10px] uppercase tracking-wider text-zinc-400">
            Output
          </span>
          {elapsed !== null && (
            <span className="ee-mono text-[10px] text-zinc-500">
              {elapsed.toFixed(2)}s
            </span>
          )}
        </div>
        {output ? (
          <pre
            className="ee-mono ee-scroll max-h-72 overflow-auto whitespace-pre-wrap px-3 py-2 text-[12px] leading-relaxed text-zinc-100"
          >
            {output}
          </pre>
        ) : (
          <div className="px-3 py-4 text-center text-[11px] text-zinc-500">
            Press <span className="text-zinc-300">Run</span> to execute the code.
            First run downloads Pyodide (~10 MB) — subsequent runs are instant.
          </div>
        )}

        {state === 'error' && (
          <div className="flex items-start gap-2 border-t border-zinc-800 bg-red-950/40 px-3 py-2 text-[11px] text-red-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Execution failed. Check the error message above for details.
            </span>
          </div>
        )}

        {plotSrc && (
          <div className="border-t border-zinc-800 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-400">
              <ImageIcon className="h-3 w-3" />
              Plot output
            </div>
            {/* Matplotlib plot output */}
            <img
              src={plotSrc}
              alt="Matplotlib plot output"
              className="mx-auto max-w-full rounded border border-zinc-800 bg-white"
            />
          </div>
        )}
      </div>

      {/* Hidden status text for screen readers */}
      <span className="sr-only" aria-live="polite">
        {state === 'loading' && 'Loading Python environment'}
        {state === 'running' && 'Running code'}
        {state === 'done' && 'Execution complete'}
        {state === 'error' && 'Execution failed'}
      </span>
    </div>
  );
}
