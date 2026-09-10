'use client';

import * as React from 'react';
import {
  AlertCircle,
  Cpu,
  FileCode,
  Loader2,
  Play,
  RotateCcw,
  Activity,
  CircuitBoard as CircuitIcon,
  Square,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ── yowasp/yosys types (subset of @yowasp/yosys/lib/api.d.ts) ───────────────
type YosysTree = { [name: string]: YosysTree | string | Uint8Array };
type YosysRun = (
  args?: string[],
  files?: YosysTree,
  options?: {
    stdin?: (() => Uint8Array | null) | null;
    stdout?: ((bytes: Uint8Array | null) => void) | null;
    stderr?: ((bytes: Uint8Array | null) => void) | null;
    decodeASCII?: boolean;
    synchronously?: boolean;
  },
) => Promise<YosysTree>;

// ── Module-scope caches so the 12 MB WASM only loads once per session ──────
let yosysPromise: Promise<YosysRun> | null = null;
let digitaljsPromise: Promise<any> | null = null;
let convPromise: Promise<{
  yosys2digitaljs: (obj: any, opts?: any) => any;
  io_ui: (out: any) => void;
}> | null = null;

function getYosys(): Promise<YosysRun> {
  if (!yosysPromise) {
    yosysPromise = import('@yowasp/yosys').then((m: any) => {
      const run: YosysRun | undefined = m.runYosys ?? m.default?.runYosys;
      if (typeof run !== 'function') {
        throw new Error('@yowasp/yosys did not export runYosys');
      }
      return run;
    });
  }
  return yosysPromise;
}

function getDigitaljs(): Promise<any> {
  if (!digitaljsPromise) {
    // digitaljs's `browser` field points at the ESM source (src/index.mjs)
    // which does `import $ from 'jquery'` then `import 'jquery-ui/ui/
    // widgets/dialog.js'`. jquery's UMD wrapper detects the bundler and
    // refuses to set the global `window.jQuery` (noGlobal=true). jquery-ui
    // widgets are UMD that look up `jQuery` off the global scope (Turbopack
    // doesn't polyfill `define.amd`, so they take the browser-globals
    // branch). dialog.js's AMD dep array — which lists widget.js, mouse.js,
    // draggable.js, resizable.js, button.js, etc. — is NOT picked up by
    // the bundler as a static dep graph (it's just data), so widget.js
    // never loads and dialog.js throws `$.widget is not a function`.
    //
    // Our `./digitaljs-init` module bridges the two worlds: it statically
    // imports `./jquery-global` (which sets `window.jQuery` to the bundled
    // jQuery function as a side effect), then statically imports every
    // jquery-ui dep in topological order, then statically imports
    // `digitaljs`. ESM evaluates static imports in source order, so by the
    // time digitaljs's body evaluates, `$.widget` is defined on the same
    // jQuery function that `import $ from 'jquery'` returns to digitaljs.
    digitaljsPromise = import('./digitaljs-init').then((m: any) => m.default ?? m);
  }
  return digitaljsPromise;
}

function getConv(): Promise<{
  yosys2digitaljs: (obj: any, opts?: any) => any;
  io_ui: (out: any) => void;
}> {
  if (!convPromise) {
    convPromise = import('yosys2digitaljs/core').then((m: any) => ({
      yosys2digitaljs: m.yosys2digitaljs,
      io_ui: m.io_ui,
    }));
  }
  return convPromise;
}

// ── Default starter (when no `verilog_starter` is provided) ─────────────────
const DEFAULT_COUNTER = `// 4-bit synchronous up-counter with async reset.
module counter(
    input  wire        clk,
    input  wire        rst,
    output reg  [3:0]  count
);
    always @(posedge clk or posedge rst) begin
        if (rst)        count <= 4'b0000;
        else            count <= count + 1'b1;
    end
endmodule
`;

export interface VerilogPlaygroundProps {
  /** Initial Verilog source shown in the editor. */
  starterCode?: string;
  /** Optional lesson title — shown in the playground header. */
  lessonTitle?: string;
}

type RunState =
  | 'idle'
  | 'loading-yosys'
  | 'loading-djs'
  | 'synth'
  | 'done'
  | 'error';

interface SynthStats {
  top: string;
  cells: number;
  wires: number;
  inputs: string[];
  outputs: string[];
  cellTypes: { type: string; count: number }[];
}

export function VerilogPlayground({
  starterCode = DEFAULT_COUNTER,
  lessonTitle,
}: VerilogPlaygroundProps) {
  const [code, setCode] = React.useState<string>(starterCode);
  const [state, setState] = React.useState<RunState>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [yosysLog, setYosysLog] = React.useState<string>('');
  const [stats, setStats] = React.useState<SynthStats | null>(null);
  const [elapsedMs, setElapsedMs] = React.useState<number | null>(null);
  const [simRunning, setSimRunning] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'circuit' | 'waveforms'>(
    'circuit',
  );

  // Heavy object refs — kept out of React state to avoid re-renders.
  const circuitRef = React.useRef<any>(null);
  const paperRef = React.useRef<any>(null);
  const monitorRef = React.useRef<any>(null);
  const monitorViewRef = React.useRef<any>(null);
  const circuitContainerRef = React.useRef<HTMLDivElement | null>(null);
  const waveformContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Reset everything when starterCode changes (e.g. user opens a new lesson).
  React.useEffect(() => {
    teardownCircuit();
    setCode(starterCode);
    setState('idle');
    setError(null);
    setYosysLog('');
    setStats(null);
    setElapsedMs(null);
    setSimRunning(false);
  }, [starterCode]);

  // Pre-warm the Yosys WASM download on mount — first lesson pays the ~12 MB
  // cost up front; later lessons are instant because yosysPromise is cached.
  React.useEffect(() => {
    let cancelled = false;
    getYosys()
      .then(() => {
        if (!cancelled && state === 'idle') {
          // Don't change visible state, but the WASM is now ready.
        }
      })
      .catch(() => {
        /* surfaced when user clicks Synthesize */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Cleanup on unmount.
  React.useEffect(
    () => () => {
      teardownCircuit();
    },
    [],
  );

  function teardownCircuit() {
    try {
      monitorViewRef.current?.remove?.();
    } catch {
      /* ignore */
    }
    try {
      circuitRef.current?.shutdown?.();
    } catch {
      /* ignore */
    }
    circuitRef.current = null;
    paperRef.current = null;
    monitorRef.current = null;
    monitorViewRef.current = null;
    if (circuitContainerRef.current) circuitContainerRef.current.innerHTML = '';
    if (waveformContainerRef.current) waveformContainerRef.current.innerHTML = '';
  }

  async function handleSynthesize() {
    teardownCircuit();
    setError(null);
    setYosysLog('');
    setStats(null);
    setElapsedMs(null);
    setSimRunning(false);

    const t0 = performance.now();
    let log = '';
    try {
      setState('loading-yosys');
      const runYosys = await getYosys();

      setState('loading-djs');
      // Kick off both downloads in parallel — digitaljs pulls in jquery +
      // jointjs (~5 MB) and yosys2digitaljs/core is tiny.
      const [digitaljs, conv] = await Promise.all([
        getDigitaljs(),
        getConv(),
      ]);

      setState('synth');
      const topName = guessTopModule(code) ?? 'top';

      const args = [
        '-q',
        '-p',
        `synth -flatten -top ${topName}; write_json output.json`,
        'top.v',
      ];
      const files: YosysTree = { 'top.v': code };
      const outputs = await runYosys(args, files, {
        stdout: (b) => {
          if (b) log += new TextDecoder().decode(b);
        },
        stderr: (b) => {
          if (b) log += new TextDecoder().decode(b);
        },
        decodeASCII: true,
      });
      setYosysLog(log);

      // Parse the Yosys JSON netlist.
      const out = outputs['output.json'];
      let yosysJson: any;
      if (out instanceof Uint8Array) {
        yosysJson = JSON.parse(new TextDecoder().decode(out));
      } else if (typeof out === 'string') {
        yosysJson = JSON.parse(out);
      } else {
        throw new Error(
          'Yosys did not produce output.json — check the Verilog for syntax errors.',
        );
      }

      // Convert Yosys JSON → digitaljs TopModule, then make I/O interactive.
      const digitaljsJson = conv.yosys2digitaljs(yosysJson);
      conv.io_ui(digitaljsJson);

      // Build the Circuit (does NOT touch the DOM yet — displayOn must run
      // AFTER React commits the `state === 'done'` render so the
      // `circuitContainerRef.current` host div actually exists in the DOM
      // when digitaljs/jointjs tries to append its SVG paper to it).
      const circuit = new digitaljs.Circuit(digitaljsJson);
      circuitRef.current = circuit;

      // Set up the live-simulation Monitor + MonitorView for waveforms.
      const monitor = new digitaljs.Monitor(circuit);
      monitorRef.current = monitor;
      const monitorView = new digitaljs.MonitorView({ model: monitor });
      monitorViewRef.current = monitorView;
      // Auto-monitor every top-level named wire (clk, rst, count, sum, …).
      // Internal gates are skipped to keep the waveform viewer readable.
      try {
        const graph = circuit._graph;
        for (const wire of graph.getLinks()) {
          if (wire && wire.get('netname')) {
            monitor.addWire(wire);
          }
        }
      } catch {
        /* best-effort */
      }

      // Live simulation — the auto-Clock toggles every 100 ticks (1 s
      // at the default 10 ms/tick interval).
      try {
        circuit.interval = 10;
        circuit.start();
        setSimRunning(true);
      } catch {
        /* hasWarnings may veto start; non-fatal */
      }

      const elapsed = Math.round(performance.now() - t0);
      setElapsedMs(elapsed);
      setStats(summarize(yosysJson, topName));
      // Flip state to 'done' so React renders the circuit + waveform host
      // divs. The `useEffect` below watches for `state === 'done' &&
      // circuitRef.current` and calls `displayOn`/`appendChild` AFTER the
      // host divs are mounted — closing the race where the host ref was
      // null at the time `displayOn` was previously called.
      setState('done');
      setActiveTab('circuit');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`${msg}\n\n--- yosys output ---\n${log}`);
      setState('error');
    }
  }

  // After React commits the `state === 'done'` render, the circuit host div
  // and the waveform host div exist in the DOM — now we can hand them to
  // digitaljs/jointjs. This effect runs once per synthesis for the Circuit
  // paper (gated on `state === 'done' && circuitRef.current &&
  // !paperRef.current`), and once per tab switch into "waveforms" for the
  // MonitorView (Radix Tabs unmounts inactive tab content, so the waveform
  // host ref is null until the user first visits the Waveforms tab).
  React.useEffect(() => {
    if (state !== 'done') return;

    // Circuit paper — attach exactly once per synthesis.
    if (
      !paperRef.current &&
      circuitRef.current &&
      circuitContainerRef.current
    ) {
      try {
        // displayOn returns a jointjs Paper. We pass a raw DOM element;
        // jointjs accepts that, a selector string, or a jQuery element.
        const paper = circuitRef.current.displayOn(circuitContainerRef.current);
        paperRef.current = paper;
        // Reasonable default zoom so a small circuit fills the panel
        // nicely without scrolling. fitToContent already ran inside
        // _makePaper, but on a fresh container the dimensions can be 0
        // until the next frame.
        requestAnimationFrame(() => {
          try {
            paper.fitToContent({ padding: 30, allowNewOrigin: 'any' });
          } catch {
            /* ignore */
          }
        });
      } catch {
        /* non-fatal — paper may fail to render but state stays 'done' */
      }
    }

    // Waveform monitor — attach when the user first switches to the
    // Waveforms tab (the host div is mounted by Radix only then).
    if (
      activeTab === 'waveforms' &&
      monitorViewRef.current &&
      waveformContainerRef.current &&
      waveformContainerRef.current.childNodes.length === 0
    ) {
      try {
        waveformContainerRef.current.appendChild(monitorViewRef.current.el);
        // Trigger a resize so the waveform canvas picks up its real size.
        window.dispatchEvent(new Event('resize'));
      } catch {
        /* ignore */
      }
    }
  }, [state, activeTab]);

  // Re-run the waveform attach on a microtask if Radix hasn't mounted the
  // host div by the time the [state, activeTab] effect ran. Belt-and-
  // suspenders for the Radix Tabs lazy-mount race.
  React.useEffect(() => {
    if (state !== 'done') return;
    if (activeTab !== 'waveforms') return;
    if (!monitorViewRef.current) return;
    const id = requestAnimationFrame(() => {
      if (
        waveformContainerRef.current &&
        monitorViewRef.current &&
        waveformContainerRef.current.childNodes.length === 0
      ) {
        try {
          waveformContainerRef.current.appendChild(monitorViewRef.current.el);
          window.dispatchEvent(new Event('resize'));
        } catch {
          /* ignore */
        }
      }
    });
    return () => cancelAnimationFrame(id);
  }, [state, activeTab]);

  function handleReset() {
    teardownCircuit();
    setCode(starterCode);
    setState('idle');
    setError(null);
    setYosysLog('');
    setStats(null);
    setElapsedMs(null);
    setSimRunning(false);
  }

  function handleToggleSim() {
    const c = circuitRef.current;
    if (!c) return;
    try {
      if (simRunning) {
        c.stop();
        setSimRunning(false);
      } else {
        c.start();
        setSimRunning(true);
      }
    } catch {
      /* ignore */
    }
  }

  function handleZoomIn() {
    const c = circuitRef.current;
    if (!c || !paperRef.current) return;
    try {
      const current = paperRef.current.scale();
      const sx = (current?.sx ?? 1) * 1.15;
      const sy = (current?.sy ?? 1) * 1.15;
      paperRef.current.scale(sx, sy);
    } catch {
      /* ignore */
    }
  }

  function handleZoomOut() {
    const c = circuitRef.current;
    if (!c || !paperRef.current) return;
    try {
      const current = paperRef.current.scale();
      const sx = Math.max(0.1, (current?.sx ?? 1) / 1.15);
      const sy = Math.max(0.1, (current?.sy ?? 1) / 1.15);
      paperRef.current.scale(sx, sy);
    } catch {
      /* ignore */
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.substring(0, start) + '    ' + code.substring(end);
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  }

  const isBusy =
    state === 'loading-yosys' ||
    state === 'loading-djs' ||
    state === 'synth';

  const statusText = (() => {
    switch (state) {
      case 'idle':
        return 'Ready';
      case 'loading-yosys':
        return 'Loading Yosys WASM (~12 MB, first time only)…';
      case 'loading-djs':
        return 'Loading digitaljs (~5 MB)…';
      case 'synth':
        return 'Synthesizing…';
      case 'done':
        return elapsedMs != null ? `Done in ${elapsedMs} ms` : 'Done';
      case 'error':
        return 'Error — see below';
    }
  })();

  const statusColor = (() => {
    switch (state) {
      case 'done':
        return 'text-ee-green';
      case 'error':
        return 'text-ee-red';
      case 'idle':
        return 'text-muted-foreground';
      default:
        return 'text-ee-amber';
    }
  })();

  return (
    <div className="overflow-hidden rounded-lg border border-ee-red/30 bg-background">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-ee-red/8 px-3 py-2">
        <Cpu className="h-4 w-4 text-ee-red" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-ee-red">
          Verilog HDL Playground
        </span>
        <span className="text-[10px] text-muted-foreground">
          (@yowasp/yosys · digitaljs · real synthesis + live simulation)
        </span>
        {lessonTitle && (
          <span className="ml-auto hidden truncate text-[10px] text-muted-foreground sm:inline">
            {lessonTitle}
          </span>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/40 bg-muted/15 px-3 py-2">
        <Button
          size="sm"
          onClick={handleSynthesize}
          disabled={isBusy}
          className="h-7 gap-1 bg-ee-red px-3 text-xs font-semibold text-white hover:bg-ee-red/90"
        >
          {state === 'loading-yosys' || state === 'loading-djs' ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading…
            </>
          ) : state === 'synth' ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Synthesizing…
            </>
          ) : (
            <>
              <Play className="h-3 w-3" />
              Synthesize
            </>
          )}
        </Button>
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
        {state === 'done' && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleSim}
              className="h-7 gap-1 px-2 text-xs"
            >
              {simRunning ? (
                <>
                  <Square className="h-3 w-3" />
                  Pause sim
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Resume sim
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomIn}
              className="h-7 gap-1 px-2 text-xs"
              title="Zoom in"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomOut}
              className="h-7 gap-1 px-2 text-xs"
              title="Zoom out"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
          </>
        )}
        <span className={`ee-mono ml-auto text-[11px] ${statusColor}`}>
          {statusText}
        </span>
      </div>

      {/* Editor + Output */}
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
        {/* Editor */}
        <div className="relative border-b border-border/40 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-1.5 border-b border-border/40 bg-muted/15 px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <FileCode className="h-3 w-3" aria-hidden />
            counter.v
          </div>
          <div className="flex items-stretch">
            <div
              aria-hidden
              className="ee-mono select-none bg-muted/30 px-2 py-2 text-right text-[11px] leading-[1.55] text-muted-foreground/60"
            >
              {code.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="ee-code-editor flex-1 resize-y bg-background px-3 py-2 text-foreground outline-none"
              style={{ minHeight: '320px' }}
              aria-label="Verilog source editor"
            />
          </div>
        </div>

        {/* Output */}
        <div className="bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
            <span className="ee-mono text-[10px] uppercase tracking-wider text-zinc-400">
              Yosys output
            </span>
            <span className="text-[10px] text-zinc-500">
              {state === 'done' && stats
                ? `${stats.cells} cells · top=${stats.top}`
                : '—'}
            </span>
          </div>
          <div className="ee-scroll max-h-[420px] overflow-y-auto">
            {state === 'idle' && (
              <div className="px-3 py-4 text-[11px] leading-relaxed text-zinc-500">
                Press <span className="text-zinc-300">Synthesize</span> to run
                Yosys on your Verilog. The first click downloads ~12 MB of
                Yosys WASM plus ~5 MB of digitaljs — subsequent runs are fast.
                <br />
                <br />
                After synthesis the <span className="text-zinc-300">Circuit</span>{' '}
                tab shows the gate-level schematic (click input buttons to
                toggle them; the auto-clock ticks every second). The{' '}
                <span className="text-zinc-300">Waveforms</span> tab shows the
                live signal traces.
              </div>
            )}
            {(state === 'loading-yosys' ||
              state === 'loading-djs' ||
              state === 'synth') && (
              <div className="flex items-start gap-2 px-3 py-3 text-[11px] text-zinc-300">
                <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-ee-amber" />
                <pre className="ee-mono whitespace-pre-wrap">{statusText}</pre>
              </div>
            )}
            {state === 'error' && (
              <div className="px-3 py-2 text-[11px] text-red-300">
                <div className="mb-1.5 flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="font-semibold">Synthesis failed</span>
                </div>
                <pre className="ee-mono whitespace-pre-wrap text-red-200">
                  {error}
                </pre>
              </div>
            )}
            {state === 'done' && (
              <>
                {stats && (
                  <div className="border-b border-zinc-800 px-3 py-2.5">
                    <div className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-400">
                      Synthesis summary
                    </div>
                    <div className="mb-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                      <div>
                        <span className="text-zinc-500">Top module:</span>{' '}
                        <span className="ee-mono text-zinc-200">{stats.top}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Total cells:</span>{' '}
                        <span className="ee-mono text-zinc-200">{stats.cells}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Inputs:</span>{' '}
                        <span className="ee-mono text-zinc-200">
                          {stats.inputs.join(', ') || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Outputs:</span>{' '}
                        <span className="ee-mono text-zinc-200">
                          {stats.outputs.join(', ') || '—'}
                        </span>
                      </div>
                    </div>
                    {stats.cellTypes.length > 0 && (
                      <>
                        <div className="mb-1 text-[10px] uppercase tracking-wider text-zinc-400">
                          Cell breakdown
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {stats.cellTypes.map((c) => (
                            <span
                              key={c.type}
                              className="ee-mono rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-300"
                            >
                              {c.type} ×{c.count}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {yosysLog && (
                  <pre className="ee-mono whitespace-pre-wrap px-3 py-2 text-[11px] leading-relaxed text-zinc-200">
                    {yosysLog}
                  </pre>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Visualization panel — Circuit SVG + live Waveforms */}
      {state === 'done' && (
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'circuit' | 'waveforms')}
          className="border-t border-border/40"
        >
          <TabsList className="m-2 grid w-auto grid-cols-2 bg-muted/30">
            <TabsTrigger value="circuit" className="text-xs">
              <CircuitIcon className="mr-1.5 h-3.5 w-3.5" />
              Circuit
            </TabsTrigger>
            <TabsTrigger value="waveforms" className="text-xs">
              <Activity className="mr-1.5 h-3.5 w-3.5" />
              Waveforms
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="circuit"
            className="m-0 mt-0 px-2 pb-2 focus-visible:outline-none"
          >
            <div className="ee-scroll max-h-[480px] overflow-auto rounded-md border border-border/40 bg-zinc-50 p-2 dark:bg-zinc-900/40">
              <div
                ref={circuitContainerRef}
                className="djs-host min-h-[320px] w-full"
                aria-label="Synthesized circuit schematic"
              />
            </div>
            <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
              Click an input button (e.g. <span className="ee-mono">rst</span>)
              to toggle it. The{' '}
              <span className="ee-mono">clk</span> device auto-toggles every
              ~1 s. The schematic is rendered by digitaljs (jointjs + elkjs
              layout) from the Yosys JSON netlist.
            </p>
          </TabsContent>

          <TabsContent
            value="waveforms"
            className="m-0 px-2 pb-2 focus-visible:outline-none"
          >
            <div className="ee-scroll max-h-[480px] overflow-auto rounded-md border border-border/40 bg-zinc-50 p-2 dark:bg-zinc-900/40">
              <div
                ref={waveformContainerRef}
                className="djs-host w-full"
                aria-label="Live signal waveforms"
              />
            </div>
            <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
              Live waveform monitor (digitaljs MonitorView). Each row tracks
              one top-level signal — the auto-clock drives the circuit forward
              and the canvas repaints on every gate update.
            </p>
          </TabsContent>
        </Tabs>
      )}

      {/* Footer note */}
      <div className="border-t border-border/40 bg-muted/15 px-3 py-2 text-[10px] text-muted-foreground">
        <span className="font-medium text-foreground/70">Note:</span> Real
        Yosys synthesis (WASM) + digitaljs live simulation, fully in-browser.
        Sequential circuits need an auto-clock — name your clock port{' '}
        <span className="ee-mono">clk</span> or{' '}
        <span className="ee-mono">clock</span> and digitaljs will toggle it
        automatically.
      </div>

      <span className="sr-only" aria-live="polite">
        {statusText}
      </span>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Try to guess the "main" module name (one that's not a testbench). */
function guessTopModule(src: string): string | null {
  const modules = Array.from(
    src.matchAll(/module\s+(\w+)\s*\(/g),
    (m) => m[1],
  );
  if (modules.length === 0) return null;
  // Prefer a module whose name doesn't start with `tb` and has an `output` port.
  const nonTb = modules.filter((m) => !/^tb/i.test(m));
  return nonTb[0] ?? modules[0];
}

function summarize(yosysJson: any, topName: string): SynthStats | null {
  const modules: Record<string, any> = yosysJson.modules ?? {};
  const top = modules[topName] ?? Object.values(modules)[0];
  if (!top) return null;
  const cells: Record<string, any> = top.cells ?? {};
  const ports: Record<string, any> = top.ports ?? {};
  const wires: Record<string, any> = top.wires ?? {};

  const cellTypeMap = new Map<string, number>();
  for (const c of Object.values(cells)) {
    const t = (c as any).type ?? 'unknown';
    cellTypeMap.set(t, (cellTypeMap.get(t) ?? 0) + 1);
  }
  const cellTypes = Array.from(cellTypeMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const inputs: string[] = [];
  const outputs: string[] = [];
  for (const [name, p] of Object.entries(ports)) {
    const dir = (p as any).direction;
    if (dir === 'input') inputs.push(name);
    else if (dir === 'output') outputs.push(name);
  }

  return {
    top: topName,
    cells: Object.keys(cells).length,
    wires: Object.keys(wires).length,
    inputs,
    outputs,
    cellTypes,
  };
}
