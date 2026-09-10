'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Play, RotateCcw, AlertCircle, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Lazy-load Plotly only when this component actually mounts.
const Plot = dynamic(() => import('./PlotlyPlot'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center text-xs text-muted-foreground">
      Loading Plotly…
    </div>
  ),
});

// ── spicey type helpers (the lib ships its own types; we use minimal wrappers) ──
interface SpiceyACResult {
  freqs: number[];
  nodeVoltages: Record<string, { re: number; im: number; abs: () => number; phaseDeg: () => number }[]>;
  elementCurrents?: Record<string, unknown[]>;
}
interface SpiceyTranResult {
  times: number[];
  nodeVoltages: Record<string, number[]>;
  elementCurrents?: Record<string, unknown[]>;
}
interface SpiceyResult {
  circuit: unknown;
  ac: SpiceyACResult | null;
  tran: SpiceyTranResult | null;
}

export interface SpicePlaygroundProps {
  /** Initial netlist text. */
  netlist: string;
  /** Optional title for the header strip. */
  title?: string;
}

type RunState = 'idle' | 'running' | 'done' | 'error';

/**
 * Pre-process a SPICE netlist for spicey, which only supports .ac and .tran
 * analyses. When the user asks for a DC operating point (.op), we transform it
 * into a tiny single-step .tran (1ns → 1ns) so spicey can run it, then we read
 * the final value of every node voltage and present it as the operating point.
 *
 * Returns `{ netlist, opMode }` where `opMode` is true when the transformation
 * was applied. We leave .ac / .tran netlists untouched.
 */
function preprocessNetlist(raw: string): { netlist: string; opMode: boolean } {
  const lines = raw.split(/\r?\n/);
  const hasOp = lines.some((l) => /^\s*\.op\s*$/i.test(l));
  const hasTran = lines.some((l) => /^\s*\.tran\b/i.test(l));
  const hasAc = lines.some((l) => /^\s*\.ac\b/i.test(l));
  if (!hasOp || hasTran || hasAc) {
    return { netlist: raw, opMode: false };
  }
  // Strip the .op line. spicey stops parsing at .end, so we must insert the
  // synthetic .tran directive *before* any .end line (or at the end if there
  // is no .end). A 1ns single-step transient settles immediately for purely
  // resistive circuits, giving the DC operating point.
  const stripped = lines.filter((l) => !/^\s*\.op\s*$/i.test(l));
  const endIdx = stripped.findIndex((l) => /^\s*\.end\b/i.test(l));
  const tranDirective = '.tran 1n 1n';
  if (endIdx >= 0) {
    stripped.splice(endIdx, 0, tranDirective);
  } else {
    stripped.push(tranDirective);
  }
  return { netlist: stripped.join('\n'), opMode: true };
}

/**
 * Format the final value of every node voltage (the operating point) as a
 * readable table. spicey returns all nodes when no .print probes are present;
 * when probes are present, only probed nodes are returned — both are fine here.
 */
function formatOperatingPoint(
  nodeVoltages: Record<string, number[]>,
): string {
  const nodes = Object.keys(nodeVoltages).sort();
  if (nodes.length === 0) return '(no node voltages reported)';
  const rows = nodes.map((node) => {
    const arr = nodeVoltages[node];
    const v = arr.length > 0 ? arr[arr.length - 1] : NaN;
    const s = Number.isFinite(v) ? v.toFixed(6) : '—';
    return `V(${node}) = ${s} V`;
  });
  return rows.join('\n');
}

export function SpicePlayground({ netlist, title = 'SPICE Playground' }: SpicePlaygroundProps) {
  const [code, setCode] = React.useState<string>(netlist);
  const [state, setState] = React.useState<RunState>('idle');
  const [output, setOutput] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [acPlot, setAcPlot] = React.useState<{
    freqs: number[];
    series: { node: string; magDb: number[]; phaseDeg: number[] }[];
  } | null>(null);
  const [tranPlot, setTranPlot] = React.useState<{
    times: number[];
    series: { node: string; values: number[] }[];
  } | null>(null);
  const [opTable, setOpTable] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCode(netlist);
    setState('idle');
    setOutput('');
    setError(null);
    setAcPlot(null);
    setTranPlot(null);
    setOpTable(null);
  }, [netlist]);

  async function handleRun() {
    setState('running');
    setOutput('');
    setError(null);
    setAcPlot(null);
    setTranPlot(null);
    setOpTable(null);
    try {
      // spicey is pure-JS and synchronous, but import dynamically so its
      // ~15 KB stays out of the first paint.
      const spicey = await import('spicey');
      const simulate =
        (spicey as any).simulate ?? (spicey as any).default?.simulate;
      const formatAcResult =
        (spicey as any).formatAcResult ??
        (spicey as any).default?.formatAcResult;
      const formatTranResult =
        (spicey as any).formatTranResult ??
        (spicey as any).default?.formatTranResult;
      if (typeof simulate !== 'function') {
        throw new Error('spicey module did not export simulate()');
      }

      // spicey only supports .ac and .tran. Translate .op into a tiny .tran
      // and present the final values as the operating point.
      const { netlist: runnableNetlist, opMode } = preprocessNetlist(code);
      const result: SpiceyResult = simulate(runnableNetlist);

      const lines: string[] = [];
      if (opMode) {
        lines.push('── DC Operating Point (.op) ──');
        lines.push('(spicey has no native .op — ran a 1ns transient and');
        lines.push(' read the final node voltages as the operating point.)');
        lines.push('');
      }
      if (result.circuit && typeof result.circuit === 'object' && 'skipped' in result.circuit) {
        const skipped = (result.circuit as any).skipped as string[] | undefined;
        if (skipped && skipped.length > 0) {
          lines.push(`Skipped ${skipped.length} unsupported line(s):`);
          for (const s of skipped) lines.push(`  ${s}`);
          lines.push('');
        }
      }

      if (opMode) {
        // Operating-point mode: format the final value of every node.
        if (result.tran) {
          const opText = formatOperatingPoint(result.tran.nodeVoltages);
          lines.push(opText);
          setOpTable(opText);
        } else {
          lines.push('No transient result — operating point unavailable.');
        }
      } else if (result.ac) {
        const ac = result.ac;
        lines.push('── AC Analysis ──');
        if (typeof formatAcResult === 'function') {
          lines.push(formatAcResult(ac));
        }
        const freqs = ac.freqs;
        const series = Object.keys(ac.nodeVoltages).map((node) => {
          const arr = ac.nodeVoltages[node];
          const magDb = arr.map((v) => 20 * Math.log10(Math.max(v.abs(), 1e-12)));
          const phaseDeg = arr.map((v) => v.phaseDeg());
          return { node, magDb, phaseDeg };
        });
        setAcPlot({ freqs, series });
      } else if (result.tran) {
        const tran = result.tran;
        lines.push('── Transient Analysis ──');
        if (typeof formatTranResult === 'function') {
          lines.push(formatTranResult(tran));
        }
        const times = tran.times;
        const series = Object.keys(tran.nodeVoltages).map((node) => ({
          node,
          values: tran.nodeVoltages[node],
        }));
        setTranPlot({ times, series });
      } else {
        lines.push('No analysis directives found. Add .op, .ac, or .tran to run a sim.');
      }
      setOutput(lines.join('\n'));
      setState('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setState('error');
    }
  }

  function handleReset() {
    setCode(netlist);
    setState('idle');
    setOutput('');
    setError(null);
    setAcPlot(null);
    setTranPlot(null);
    setOpTable(null);
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

  const isBusy = state === 'running';

  // Build Plotly data for AC or TRAN
  const plotData = React.useMemo(() => {
    if (acPlot) {
      const palette = ['#0d9488', '#d97706', '#7c3aed', '#dc2626', '#2563eb'];
      const magSeries = acPlot.series.map((s, i) => ({
        x: acPlot.freqs,
        y: s.magDb,
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: `|V(${s.node})| (dB)`,
        line: { color: palette[i % palette.length], width: 2 },
      }));
      const phaseSeries = acPlot.series.map((s, i) => ({
        x: acPlot.freqs,
        y: s.phaseDeg,
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: `∠V(${s.node}) (°)`,
        yaxis: 'y2',
        line: {
          color: palette[i % palette.length],
          width: 1.5,
          dash: 'dot' as const,
        },
      }));
      return { data: [...magSeries, ...phaseSeries], kind: 'ac' as const };
    }
    if (tranPlot) {
      const palette = ['#0d9488', '#d97706', '#7c3aed', '#dc2626', '#2563eb'];
      const data = tranPlot.series.map((s, i) => ({
        x: tranPlot.times,
        y: s.values,
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: `v(${s.node})`,
        line: { color: palette[i % palette.length], width: 1.5 },
      }));
      return { data, kind: 'tran' as const };
    }
    return null;
  }, [acPlot, tranPlot]);

  const plotLayout = React.useMemo(() => {
    if (!plotData) return null;
    const common = {
      margin: { t: 24, r: 60, b: 48, l: 60 },
      showlegend: true,
      legend: { x: 0.02, y: 0.98, font: { size: 10 }, bgcolor: 'rgba(255,255,255,0.6)' },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { size: 10, color: '#666' },
    };
    if (plotData.kind === 'ac') {
      return {
        ...common,
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
    }
    return {
      ...common,
      xaxis: { title: 'Time (s)', gridcolor: 'rgba(120,120,120,0.2)' },
      yaxis: { title: 'Voltage (V)', gridcolor: 'rgba(120,120,120,0.2)' },
    };
  }, [plotData]);

  return (
    <div className="overflow-hidden rounded-sm border border-warning/40 bg-background">
      <div className="flex items-center gap-2 border-b border-border/60 bg-warning/10 px-3 py-2">
        <Zap className="h-4 w-4 text-warning" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-warning">
          {title}
        </span>
        <span className="text-[10px] text-muted-foreground">
          (spicey · pure-JS SPICE · instant)
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
            className="h-7 gap-1 bg-warning px-3 text-xs font-semibold text-white hover:bg-warning/90"
          >
            {isBusy ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Running…
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                Run SPICE
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative">
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
            style={{ minHeight: '200px' }}
            aria-label="SPICE netlist editor"
          />
        </div>
      </div>

      <div className="border-t border-border/60 bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
          <span className="ee-mono text-[10px] uppercase tracking-wider text-zinc-400">
            Output
          </span>
          <span className="text-[10px] text-zinc-500">
            spicey v0.0.14 · R/L/C/D/V/S
          </span>
        </div>
        {output ? (
          <pre
            className="ee-mono ee-scroll max-h-60 overflow-auto whitespace-pre-wrap px-3 py-2 text-[11px] leading-relaxed text-zinc-100"
          >
            {output}
          </pre>
        ) : (
          <div className="px-3 py-3 text-center text-[11px] text-zinc-500">
            Press <span className="text-zinc-300">Run SPICE</span> to simulate.
            spicey supports <code className="ee-mono">.ac</code>,{' '}
            <code className="ee-mono">.tran</code>, and{' '}
            <code className="ee-mono">.op</code> (translated to a 1-step transient)
            with R/L/C/diode/V(PWL/PULSE)/switch.
          </div>
        )}
        {state === 'error' && (
          <div className="flex items-start gap-2 border-t border-zinc-800 bg-red-950/40 px-3 py-2 text-[11px] text-red-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <pre className="ee-mono whitespace-pre-wrap">{error}</pre>
          </div>
        )}
      </div>

      {opTable && (
        <div className="border-t border-border/60 bg-warning/5">
          <div className="border-b border-warning/20 px-3 py-1.5">
            <span className="ee-mono text-[10px] uppercase tracking-wider text-warning">
              DC Operating Point
            </span>
          </div>
          <pre
            className="ee-mono ee-scroll max-h-60 overflow-auto whitespace-pre-wrap px-3 py-2 text-[12px] leading-relaxed text-foreground"
          >
            {opTable}
          </pre>
        </div>
      )}

      {plotData && plotLayout && (
        <div className="border-t border-border/60 px-2 py-2">
          <div className="mb-1 px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            {plotData.kind === 'ac' ? 'AC magnitude & phase' : 'Transient waveform'}
          </div>
          <Plot
            data={plotData.data}
            layout={plotLayout}
            config={{ displayModeBar: false, responsive: true }}
            style={{ height: 320 }}
          />
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        {state === 'running' && 'Running SPICE simulation'}
        {state === 'done' && 'Simulation complete'}
        {state === 'error' && 'Simulation failed'}
      </span>
    </div>
  );
}
