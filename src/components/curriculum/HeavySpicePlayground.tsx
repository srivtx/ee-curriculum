'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import {
  Activity,
  AlertCircle,
  Cpu,
  Loader2,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Lazy-load Plotly only when we actually have data to plot.
const Plot = dynamic(() => import('./PlotlyPlot'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center text-xs text-muted-foreground">
      Loading Plotly…
    </div>
  ),
});

// ── eecircuit-engine (ngspice WASM) type wrappers ─────────────────────────────
// The published .d.ts marks setOutputEvent as private, but the runtime method
// is a public arrow function on the Simulation class. We use `any` for the
// engine to avoid TS friction; the contract is stable per the package docs.
type RealValue = number;
type ComplexValue = { real: number; img: number };
type EngineData =
  | {
      name: string;
      type: 'voltage' | 'current' | 'time' | 'frequency' | 'notype';
      values: RealValue[];
    }
  | {
      name: string;
      type: 'voltage' | 'current' | 'time' | 'frequency' | 'notype';
      values: ComplexValue[];
    };
interface EngineResult {
  header: string;
  numVariables: number;
  variableNames: string[];
  numPoints: number;
  dataType: 'real' | 'complex';
  data: EngineData[];
}
interface Simulation {
  start: () => Promise<void>;
  setNetList: (text: string) => void;
  setOutputEvent: (cb: (chunk: string) => void) => void;
  runSim: () => Promise<EngineResult>;
  getInfo: () => string;
  getError: () => string[];
  isInitialized: () => boolean;
}

// ── Module-scope engine cache ────────────────────────────────────────────────
// The first mount downloads + compiles the ~5.7 MB WASM bundle. Subsequent
// mounts (other lessons, page navigations) reuse the cached Simulation.
let enginePromise: Promise<Simulation> | null = null;
let engineLoadStart = 0;

async function getEngine(onProgress?: (chunk: string) => void): Promise<Simulation> {
  if (!enginePromise) {
    engineLoadStart = Date.now();
    enginePromise = (async () => {
      const mod = await import('eecircuit-engine');
      // The package exports `Simulation` as a named export.
      const SimulationCtor =
        (mod as any).Simulation ?? (mod as any).default?.Simulation;
      if (typeof SimulationCtor !== 'function') {
        throw new Error(
          'eecircuit-engine: expected Simulation constructor, got ' +
            typeof SimulationCtor,
        );
      }
      const sim: Simulation = new SimulationCtor();
      await sim.start();
      return sim;
    })();
  }
  const sim = await enginePromise;
  if (onProgress) {
    // setOutputEvent is marked private in the d.ts but is a real public method
    // at runtime. Cast through any to register an output sink.
    (sim as any).setOutputEvent(onProgress);
  }
  return sim;
}

// ── Analysis type detection ───────────────────────────────────────────────────
type AnalysisKind = 'op' | 'dc' | 'tran' | 'ac' | 'unknown';

function detectAnalysis(netlist: string): AnalysisKind {
  const lines = netlist.split(/\r?\n/);
  // Order matters: noise uses .ac too. We detect in priority order.
  if (lines.some((l) => /^\s*\.op\b/i.test(l))) return 'op';
  if (lines.some((l) => /^\s*\.dc\b/i.test(l))) return 'dc';
  if (lines.some((l) => /^\s*\.tran\b/i.test(l))) return 'tran';
  if (lines.some((l) => /^\s*\.ac\b/i.test(l))) return 'ac';
  return 'unknown';
}

// ── Result formatting helpers ─────────────────────────────────────────────────
function fmtNum(v: number, digits = 6): string {
  if (!Number.isFinite(v)) return '—';
  const abs = Math.abs(v);
  if (abs === 0) return '0';
  if (abs >= 1e6 || abs < 1e-3) {
    return v.toExponential(digits - 2);
  }
  return v.toFixed(digits);
}

function fmtUnit(name: string): string {
  // name like "v(in)", "i(v1)", "time", "frequency", "v(v-sweep)"
  const n = name.toLowerCase();
  if (n.startsWith('i(')) return 'A';
  if (n.startsWith('v(')) return 'V';
  if (n === 'time') return 's';
  if (n === 'frequency') return 'Hz';
  return '';
}

// Build a Plotly-friendly series array from a real-valued result.
function realSeriesFor(
  result: EngineResult,
  kind: AnalysisKind,
): { x: number[]; traces: { name: string; y: number[] }[]; xLabel: string; yLabel: string } {
  // The first variable is the sweep / independent axis:
  //   .op  -> only 1 point, first var is some node voltage (we'll handle separately)
  //   .dc  -> v(v-sweep) or i(...) — sweep variable
  //   .tran-> time
  //   .ac  -> frequency (but data is complex, see below)
  if (kind === 'op') {
    // Single-point: don't plot. (Caller should render a table.)
    return { x: [], traces: [], xLabel: '', yLabel: '' };
  }
  const xData = result.data[0] as Extract<EngineData, { values: number[] }>;
  const x = xData ? (xData.values as number[]) : [];
  const traces: { name: string; y: number[] }[] = [];
  for (let i = 1; i < result.data.length; i++) {
    const d = result.data[i];
    traces.push({ name: d.name, y: d.values as number[] });
  }
  const xLabel = xData ? `${xData.name} (${fmtUnit(xData.name)})` : '';
  return { x, traces, xLabel, yLabel: kind === 'tran' ? 'Voltage (V) / Current (A)' : 'Swept value' };
}

// Build magnitude + phase series for .ac (complex data).
function acSeriesFor(
  result: EngineResult,
): {
  freqs: number[];
  traces: { name: string; magDb: number[]; phaseDeg: number[] }[];
} {
  const freqArr = result.data[0]?.values as number[];
  const freqs: number[] = Array.isArray(freqArr) ? freqArr : [];
  const traces: { name: string; magDb: number[]; phaseDeg: number[] }[] = [];
  for (let i = 1; i < result.data.length; i++) {
    const d = result.data[i];
    const vals = d.values as ComplexValue[];
    const magDb = vals.map((c) =>
      20 * Math.log10(Math.max(Math.hypot(c.real, c.img), 1e-12)),
    );
    const phaseDeg = vals.map((c) => (Math.atan2(c.img, c.real) * 180) / Math.PI);
    traces.push({ name: d.name, magDb, phaseDeg });
  }
  return { freqs, traces };
}

// ── Component props ───────────────────────────────────────────────────────────
export interface HeavySpicePlaygroundProps {
  starterNetlist?: string;
  lessonTitle?: string;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'loading'; msg: string }
  | { kind: 'ready' }
  | { kind: 'running' }
  | { kind: 'done'; ms: number }
  | { kind: 'error'; msg: string };

export function HeavySpicePlayground({
  starterNetlist,
  lessonTitle = 'ngspice WASM',
}: HeavySpicePlaygroundProps) {
  const initialNetlist = starterNetlist ?? DEFAULT_STARTER;
  const [code, setCode] = React.useState<string>(initialNetlist);
  const [status, setStatus] = React.useState<Status>({ kind: 'idle' });
  const [log, setLog] = React.useState<string>('');
  const [result, setResult] = React.useState<EngineResult | null>(null);
  const [analysisFilter, setAnalysisFilter] = React.useState<AnalysisKind | 'auto'>('auto');
  const logRef = React.useRef<HTMLPreElement>(null);

  // Reset state when starter changes (e.g., user navigates to a different lesson).
  React.useEffect(() => {
    setCode(initialNetlist);
    setStatus({ kind: 'idle' });
    setLog('');
    setResult(null);
  }, [initialNetlist]);

  // On mount: kick off the WASM download eagerly so that by the time the user
  // clicks "Run Simulation" the engine is ready. Subsequent mounts reuse the
  // cached engine from module scope.
  React.useEffect(() => {
    let cancelled = false;
    setStatus({ kind: 'loading', msg: 'Loading ngspice WASM (~5.7 MB)…' });
    getEngine((chunk) => {
      // ngspice prints a lot of initialization noise; keep only meaningful lines
      // and cap the size so we don't grow unbounded.
      setLog((prev) => {
        const next = (prev + chunk).slice(-8192);
        return next;
      });
    })
      .then(() => {
        if (cancelled) return;
        setStatus({ kind: 'ready' });
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setStatus({ kind: 'error', msg: 'Failed to load ngspice WASM: ' + msg });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the log scrolled to the bottom on update.
  React.useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const detected = React.useMemo<AnalysisKind>(
    () => detectAnalysis(code),
    [code],
  );
  const effectiveKind: AnalysisKind =
    analysisFilter === 'auto' ? detected : analysisFilter;

  const isBusy = status.kind === 'loading' || status.kind === 'running';

  async function handleRun() {
    if (isBusy) return;
    setStatus({ kind: 'running' });
    setLog('');
    setResult(null);
    const t0 = Date.now();
    try {
      const sim = await getEngine((chunk) => {
        setLog((prev) => (prev + chunk).slice(-8192));
      });
      sim.setNetList(code);
      // Yield to the browser so the "Running…" UI paints before the WASM
      // call blocks the main thread for 100ms-2s.
      await new Promise((r) => setTimeout(r, 16));
      const res = await sim.runSim();
      const errs = sim.getError();
      // Filter out the known-spurious spinit warning so the UI stays clean.
      const realErrs = (errs || []).filter(
        (e) =>
          e !== "Warning: can't find the initialization file spinit." &&
          e !== 'Using SPARSE 1.3 as Direct Linear Solver',
      );
      if (realErrs.length > 0) {
        setStatus({ kind: 'error', msg: realErrs.join('\n') });
        return;
      }
      setResult(res);
      setStatus({ kind: 'done', ms: Date.now() - t0 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus({ kind: 'error', msg });
    }
  }

  function handleReset() {
    setCode(initialNetlist);
    setStatus({ kind: 'idle' });
    setLog('');
    setResult(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.substring(0, start) + '  ' + code.substring(end);
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }

  // ── Render: result panel ─────────────────────────────────────────────────
  const statusBadge = renderStatusBadge(status);

  return (
    <div className="overflow-hidden rounded-sm border border-accent/40 bg-background">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-accent/10 px-3 py-2">
        <Cpu className="h-4 w-4 text-accent" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          Heavy SPICE · ngspice WASM
        </span>
        <span className="hidden text-[10px] text-muted-foreground sm:inline">
          real semiconductor models · {lessonTitle}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {/* Analysis-type selector — informational + auto-detect override */}
          <Select
            value={analysisFilter}
            onValueChange={(v) => setAnalysisFilter(v as AnalysisKind | 'auto')}
          >
            <SelectTrigger className="h-7 w-[110px] gap-1 px-2 text-[11px]" aria-label="Analysis type">
              <SelectValue placeholder="Analysis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">
                <span className="text-[11px]">
                  Auto ({detected === 'unknown' ? '—' : '.' + detected})
                </span>
              </SelectItem>
              <SelectItem value="op">
                <span className="text-[11px]">.op</span>
              </SelectItem>
              <SelectItem value="dc">
                <span className="text-[11px]">.dc</span>
              </SelectItem>
              <SelectItem value="tran">
                <span className="text-[11px]">.tran</span>
              </SelectItem>
              <SelectItem value="ac">
                <span className="text-[11px]">.ac</span>
              </SelectItem>
            </SelectContent>
          </Select>
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
            className="h-7 gap-1 bg-accent px-3 text-xs font-semibold text-white hover:bg-accent/90"
          >
            {status.kind === 'running' ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Running…
              </>
            ) : status.kind === 'loading' ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading…
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                Run Simulation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Netlist editor */}
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
          style={{ minHeight: '220px' }}
          aria-label="SPICE netlist editor (ngspice)"
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/20 px-3 py-1.5">
        <div className="flex items-center gap-1.5 text-[11px]">{statusBadge}</div>
        <span className="text-[10px] text-muted-foreground">
          eecircuit-engine v1.8.0 · ngspice 45 · MIT
        </span>
      </div>

      {/* Result panel */}
      <ResultPanel result={result} kind={effectiveKind} status={status} log={log} logRef={logRef} />

      <span className="sr-only" aria-live="polite">
        {status.kind === 'loading' && 'Loading ngspice WASM engine'}
        {status.kind === 'running' && 'Running ngspice simulation'}
        {status.kind === 'done' && `Simulation complete in ${status.ms} milliseconds`}
        {status.kind === 'error' && 'Simulation failed'}
      </span>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function renderStatusBadge(status: Status): React.ReactNode {
  switch (status.kind) {
    case 'idle':
      return (
        <>
          <Activity className="h-3 w-3 text-muted-foreground" aria-hidden />
          <span className="text-muted-foreground">WASM engine ready when you are</span>
        </>
      );
    case 'loading':
      return (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-warning" aria-hidden />
          <span className="text-warning">{status.msg}</span>
        </>
      );
    case 'ready':
      return (
        <>
          <Zap className="h-3 w-3 text-accent" aria-hidden />
          <span className="text-accent">WASM ready</span>
        </>
      );
    case 'running':
      return (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-accent" aria-hidden />
          <span className="text-accent">Simulation running…</span>
        </>
      );
    case 'done':
      return (
        <>
          <Zap className="h-3 w-3 text-accent" aria-hidden />
          <span className="text-accent">Done in {status.ms} ms</span>
        </>
      );
    case 'error':
      return (
        <>
          <AlertCircle className="h-3 w-3 text-error" aria-hidden />
          <span className="text-error">Error</span>
        </>
      );
  }
}

// ── Result panel ──────────────────────────────────────────────────────────────
function ResultPanel({
  result,
  kind,
  status,
  log,
  logRef,
}: {
  result: EngineResult | null;
  kind: AnalysisKind;
  status: Status;
  log: string;
  logRef: React.RefObject<HTMLPreElement | null>;
}) {
  // Error state — always show
  if (status.kind === 'error') {
    return (
      <div className="border-t border-border/60 bg-error/5 px-3 py-2.5">
        <div className="flex items-start gap-2 text-[11px] text-error">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <pre className="ee-mono ee-scroll max-h-48 overflow-auto whitespace-pre-wrap">
            {status.msg}
          </pre>
        </div>
      </div>
    );
  }

  // No result yet
  if (!result) {
    if (!log) {
      return (
        <div className="border-t border-border/60 bg-muted/10 px-3 py-3 text-center text-[11px] text-muted-foreground">
          Press <span className="font-semibold text-foreground">Run Simulation</span> to execute this netlist with ngspice (real semiconductor models, .op/.dc/.tran/.ac).
        </div>
      );
    }
    // Has log output but no result yet (engine initializing or running)
    return (
      <div className="border-t border-border/60 bg-zinc-950 px-3 py-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="ee-mono text-[10px] uppercase tracking-wider text-zinc-400">
            ngspice output
          </span>
          <span className="text-[10px] text-zinc-500">live</span>
        </div>
        <pre
          ref={logRef}
          className="ee-mono ee-scroll max-h-48 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-300"
        >
          {log}
        </pre>
      </div>
    );
  }

  // Have a result — render the right visualization for the analysis kind.
  return (
    <div className="border-t border-border/60">
      {/* ngspice log (collapsible-looking but always shown briefly) */}
      {log && (
        <details className="border-b border-border/60 bg-zinc-950" open={false}>
          <summary className="cursor-pointer px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-400 hover:text-zinc-200">
            ngspice output ({log.length} bytes)
          </summary>
          <pre
            ref={logRef}
            className="ee-mono ee-scroll max-h-40 overflow-auto whitespace-pre-wrap px-3 py-2 text-[11px] leading-relaxed text-zinc-300"
          >
            {log}
          </pre>
        </details>
      )}

      {/* Per-kind output */}
      {kind === 'op' && <OpTable result={result} />}
      {kind === 'ac' && <AcPlot result={result} />}
      {(kind === 'tran' || kind === 'dc') && <RealPlot result={result} kind={kind} />}
      {kind === 'unknown' && (
        <div className="px-3 py-3 text-center text-[11px] text-muted-foreground">
          No recognized analysis directive found. Add <code className="ee-mono">.op</code>,{' '}
          <code className="ee-mono">.dc</code>, <code className="ee-mono">.tran</code>, or{' '}
          <code className="ee-mono">.ac</code>.
        </div>
      )}
    </div>
  );
}

// ── .op table (single point) ─────────────────────────────────────────────────
function OpTable({ result }: { result: EngineResult }) {
  const rows = React.useMemo(() => {
    return result.data
      .map((d) => {
        const v = (d.values as number[])[0];
        return { name: d.name, type: d.type, value: v };
      })
      .filter((r) => r.name.toLowerCase() !== 'time');
  }, [result]);

  return (
    <div className="bg-accent/5">
      <div className="border-b border-accent/20 px-3 py-1.5">
        <span className="ee-mono text-[10px] uppercase tracking-wider text-accent">
          DC Operating Point ({rows.length} variables)
        </span>
      </div>
      <div className="max-h-80 overflow-auto ee-scroll">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableCell className="h-8 w-[40%] py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Variable
              </TableCell>
              <TableCell className="h-8 w-[20%] py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Type
              </TableCell>
              <TableCell className="h-8 py-1.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Value ({rows[0] ? fmtUnit(rows[0].name) : ''})
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow
                key={r.name + i}
                className="border-border/30"
              >
                <TableCell className="ee-mono py-1.5 text-[12px] font-medium text-foreground">
                  {r.name}
                </TableCell>
                <TableCell className="py-1.5 text-[11px] text-muted-foreground">
                  {r.type}
                </TableCell>
                <TableCell className="ee-mono py-1.5 text-right text-[12px] text-foreground">
                  {fmtNum(r.value, 6)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Real-valued plot (.tran / .dc) ────────────────────────────────────────────
function RealPlot({
  result,
  kind,
}: {
  result: EngineResult;
  kind: 'tran' | 'dc';
}) {
  const palette = ['#0d9488', '#d97706', '#7c3aed', '#dc2626', '#2563eb', '#059669'];

  const { data, layout } = React.useMemo(() => {
    const { x, traces, xLabel, yLabel } = realSeriesFor(result, kind);
    const data = traces.map((t, i) => ({
      x,
      y: t.y,
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: t.name,
      line: { color: palette[i % palette.length], width: 1.5 },
    }));
    const layout = {
      margin: { t: 24, r: 60, b: 48, l: 60 },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        font: { size: 10 },
        bgcolor: 'rgba(255,255,255,0.6)',
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { size: 10, color: '#666' },
      xaxis: { title: xLabel, gridcolor: 'rgba(120,120,120,0.2)' },
      yaxis: { title: yLabel, gridcolor: 'rgba(120,120,120,0.2)' },
    };
    return { data, layout };
  }, [result, kind]);

  return (
    <div className="px-2 py-2">
      <div className="mb-1 px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        {kind === 'tran' ? 'Transient waveform' : 'DC sweep'} · {result.numPoints} points
      </div>
      <Plot
        data={data}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        style={{ height: 340 }}
      />
    </div>
  );
}

// ── AC magnitude + phase plot ─────────────────────────────────────────────────
function AcPlot({ result }: { result: EngineResult }) {
  const palette = ['#0d9488', '#d97706', '#7c3aed', '#dc2626', '#2563eb', '#059669'];

  const { data, layout } = React.useMemo(() => {
    const { freqs, traces } = acSeriesFor(result);
    const magSeries = traces.map((t, i) => ({
      x: freqs,
      y: t.magDb,
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: `|${t.name}| (dB)`,
      line: { color: palette[i % palette.length], width: 2 },
    }));
    const phaseSeries = traces.map((t, i) => ({
      x: freqs,
      y: t.phaseDeg,
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: `∠${t.name} (°)`,
      yaxis: 'y2',
      line: {
        color: palette[i % palette.length],
        width: 1.5,
        dash: 'dot' as const,
      },
    }));
    const data = [...magSeries, ...phaseSeries];
    const layout = {
      margin: { t: 24, r: 60, b: 48, l: 60 },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        font: { size: 10 },
        bgcolor: 'rgba(255,255,255,0.6)',
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { size: 10, color: '#666' },
      xaxis: {
        type: 'log' as const,
        title: 'Frequency (Hz)',
        gridcolor: 'rgba(120,120,120,0.2)',
      },
      yaxis: { title: '|V| (dB)', gridcolor: 'rgba(120,120,120,0.2)' },
      yaxis2: {
        title: '∠V (°)',
        overlaying: 'y',
        side: 'right' as const,
        gridcolor: 'rgba(120,120,120,0.05)',
      },
    };
    return { data, layout };
  }, [result]);

  return (
    <div className="px-2 py-2">
      <div className="mb-1 px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        AC magnitude &amp; phase · {result.numPoints} frequencies
      </div>
      <Plot
        data={data}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        style={{ height: 340 }}
      />
    </div>
  );
}

// ── Default starter (used when no lesson-specific starter is provided) ────────
const DEFAULT_STARTER = `* Voltage divider — ngspice WASM playground
V1 in 0 5
R1 in out 1k
R2 out 0 1k
.op
.print dc v(in) v(out) i(V1)
.end
`;
