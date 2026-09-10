'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Activity, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KatexRenderer } from './KatexRenderer';

// ── Lazy-load Plotly only when this component mounts ──────────────────────
// plotly.js-dist-min is ~1.2 MB gzipped. Keep it out of the first paint.
const Plot = dynamic(() => import('./PlotlyPlot'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[560px] items-center justify-center text-xs text-muted-foreground">
      Loading Plotly…
    </div>
  ),
});

// ── Complex helpers (avoid pulling in mathjs for a 50-line file) ──────────
interface Cx {
  re: number;
  im: number;
}
const cxAdd = (a: Cx, b: Cx): Cx => ({ re: a.re + b.re, im: a.im + b.im });
const cxMul = (a: Cx, b: Cx): Cx => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
const cxDiv = (a: Cx, b: Cx): Cx => {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
};
const cxAbs = (a: Cx): number => Math.hypot(a.re, a.im);
const cxPhaseDeg = (a: Cx): number => (Math.atan2(a.im, a.re) * 180) / Math.PI;

/** Evaluate a polynomial (descending coeffs) at a complex point z. */
function polyEval(coeffs: number[], z: Cx): Cx {
  let acc: Cx = { re: 0, im: 0 };
  for (let i = 0; i < coeffs.length; i++) {
    acc = cxMul(acc, z);
    acc = cxAdd(acc, { re: coeffs[i], im: 0 });
  }
  return acc;
}

type FilterType = 'lowpass' | 'highpass' | 'bandpass';

const FILTER_LABELS: Record<FilterType, string> = {
  lowpass: 'Low-pass',
  highpass: 'High-pass',
  bandpass: 'Band-pass',
};

export interface BodePreset {
  /** Optional initial numerator — used only to guess the filter type. */
  numerator?: number[];
  /** Optional initial denominator — when 2nd-order, sets the initial ωₙ and ζ. */
  denominator?: number[];
  /** Friendly preset label shown in the header. */
  label?: string;
  /** Optional human-readable description of what to look at. */
  note?: string;
}

export type BodePlotProps = BodePreset;

const POINTS = 1000; // spec: 1000 log-spaced frequency points

export function BodePlot({ numerator, denominator, label, note }: BodePlotProps) {
  // ── Derive initial (ωₙ, ζ, type) from the supplied 2nd-order TF if any ──
  const initial = React.useMemo(() => {
    const fallback = { wn: 10, zeta: 0.5, type: 'lowpass' as FilterType };
    if (
      !denominator ||
      denominator.length !== 3 ||
      Math.abs(denominator[0]) < 1e-12
    ) {
      return fallback;
    }
    // Standard 2nd-order: D(s) = s² + 2ζωₙ s + ωₙ²
    // Coeffs (descending): [a₂, a₁, a₀] = [1, 2ζωₙ, ωₙ²]
    const a2 = denominator[0];
    const a1 = denominator[1];
    const a0 = denominator[2];
    const wn = Math.sqrt(Math.abs(a0 / a2));
    const zeta = wn > 1e-12 ? a1 / (2 * wn * Math.abs(a2)) : 0.5;

    // Guess filter type from the numerator pattern
    let type: FilterType = 'lowpass';
    if (numerator) {
      const numDeg = numerator.length - 1;
      // Find the lowest-degree nonzero coefficient
      let firstNonzero = -1;
      for (let i = 0; i < numerator.length; i++) {
        if (Math.abs(numerator[i]) > 1e-12) {
          firstNonzero = i;
          break;
        }
      }
      if (numDeg === 2) {
        if (firstNonzero === 0) type = 'highpass';
        else if (firstNonzero === 1) type = 'bandpass';
        else type = 'lowpass';
      } else if (numDeg === 1 && firstNonzero === 0) {
        type = 'bandpass';
      } else {
        type = 'lowpass';
      }
    }
    return {
      wn: Math.max(1, Math.min(1000, wn)),
      zeta: Math.max(0.05, Math.min(2, zeta)),
      type,
    };
  }, [numerator, denominator]);

  const [wn, setWn] = React.useState<number>(initial.wn);
  const [zeta, setZeta] = React.useState<number>(initial.zeta);
  const [type, setType] = React.useState<FilterType>(initial.type);

  // Reset state when the preset changes (e.g. user opens a different lesson)
  React.useEffect(() => {
    setWn(initial.wn);
    setZeta(initial.zeta);
    setType(initial.type);
  }, [initial.wn, initial.zeta, initial.type]);

  // ── Compute the live numerator/denominator from (ωₙ, ζ, type) ───────────
  const tf = React.useMemo(() => {
    const w2 = wn * wn;
    const twoZetaWn = 2 * zeta * wn;
    const den = [1, twoZetaWn, w2];
    let num: number[];
    switch (type) {
      case 'highpass':
        num = [1, 0, 0];
        break;
      case 'bandpass':
        num = [0, twoZetaWn, 0];
        break;
      case 'lowpass':
      default:
        num = [0, 0, w2];
        break;
    }
    return { num, den };
  }, [wn, zeta, type]);

  // ── Compute H(jω) over 1000 log-spaced frequency points ─────────────────
  const { freqs, magDb, phaseDeg } = React.useMemo(() => {
    const fs: number[] = [];
    const mags: number[] = [];
    const phs: number[] = [];
    // Span: two decades below ωₙ to two decades above
    const wMin = Math.max(1e-3, wn / 100);
    const wMax = wn * 100;
    const logMin = Math.log10(wMin);
    const logMax = Math.log10(wMax);
    const step = (logMax - logMin) / (POINTS - 1);
    for (let i = 0; i < POINTS; i++) {
      const w = Math.pow(10, logMin + i * step);
      const s: Cx = { re: 0, im: w };
      const num = polyEval(tf.num, s);
      const den = polyEval(tf.den, s);
      const h = cxDiv(num, den);
      const mag = cxAbs(h);
      fs.push(w);
      mags.push(20 * Math.log10(Math.max(mag, 1e-12)));
      phs.push(cxPhaseDeg(h));
    }
    // Unwrap phase to keep it continuous across ±180° boundaries
    const unwrapped: number[] = [phs[0]];
    for (let i = 1; i < phs.length; i++) {
      const prev = unwrapped[i - 1];
      let cur = phs[i];
      while (cur - prev > 180) cur -= 360;
      while (cur - prev < -180) cur += 360;
      unwrapped.push(cur);
    }
    return { freqs: fs, magDb: mags, phaseDeg: unwrapped };
  }, [tf, wn]);

  // ── Live LaTeX for the current H(s) ─────────────────────────────────────
  const tfLatex = React.useMemo(() => {
    const wnStr = wn.toFixed(2);
    const zetaStr = zeta.toFixed(2);
    const twoZWn = (2 * zeta * wn).toFixed(2);
    const w2 = (wn * wn).toFixed(2);
    const suffix = `\\quad \\omega_n = ${wnStr}\\,\\text{rad/s},\\;\\zeta = ${zetaStr}`;
    switch (type) {
      case 'highpass':
        return `H(s) = \\dfrac{s^{2}}{s^{2} + ${twoZWn}\\,s + ${w2}}${suffix}`;
      case 'bandpass':
        return `H(s) = \\dfrac{${twoZWn}\\,s}{s^{2} + ${twoZWn}\\,s + ${w2}}${suffix}`;
      case 'lowpass':
      default:
        return `H(s) = \\dfrac{${w2}}{s^{2} + ${twoZWn}\\,s + ${w2}}${suffix}`;
    }
  }, [wn, zeta, type]);

  // ── Magnitude / phase y-axis ranges (auto-fit) ──────────────────────────
  const magRange = React.useMemo<[number, number]>(() => {
    const valid = magDb.filter((v) => !Number.isNaN(v));
    if (valid.length === 0) return [-60, 10];
    const lo = Math.min(...valid);
    const hi = Math.max(...valid);
    const pad = Math.max(5, (hi - lo) * 0.1);
    return [Math.floor(lo - pad), Math.ceil(hi + pad)];
  }, [magDb]);

  const phaseRange = React.useMemo<[number, number]>(() => {
    const valid = phaseDeg.filter((v) => !Number.isNaN(v));
    if (valid.length === 0) return [-270, 90];
    const lo = Math.min(...valid);
    const hi = Math.max(...valid);
    const pad = Math.max(10, (hi - lo) * 0.05);
    return [Math.floor(lo - pad), Math.ceil(hi + pad)];
  }, [phaseDeg]);

  // ── Plotly data: two traces (one per subplot) + ωₙ vertical line ────────
  const data = React.useMemo(
    () => [
      {
        x: freqs,
        y: magDb,
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: '|H| (dB)',
        xaxis: 'x1',
        yaxis: 'y1',
        line: { color: '#0d9488', width: 2 },
        hovertemplate: 'ω = %{x:.3g} rad/s<br>|H| = %{y:.2f} dB<extra></extra>',
      },
      {
        x: freqs,
        y: phaseDeg,
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: '∠H (°)',
        xaxis: 'x2',
        yaxis: 'y2',
        line: { color: '#d97706', width: 2 },
        hovertemplate: 'ω = %{x:.3g} rad/s<br>∠H = %{y:.1f}°<extra></extra>',
      },
      // Vertical line at ωₙ on the magnitude plot
      {
        x: [wn, wn],
        y: magRange,
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: 'ωₙ',
        xaxis: 'x1',
        yaxis: 'y1',
        line: { color: '#16a34a', width: 1.5, dash: 'dash' },
        hoverinfo: 'skip' as const,
        showlegend: false,
      },
    ],
    [freqs, magDb, phaseDeg, wn, magRange],
  );

  // ── Plotly layout: two stacked subplots ─────────────────────────────────
  const layout = React.useMemo(
    () => ({
      margin: { t: 30, r: 60, b: 48, l: 60 },
      grid: {
        rows: 2,
        columns: 1,
        pattern: 'independent' as const,
        rowgap: 0.18,
      },
      xaxis: {
        anchor: 'y1',
        domain: [0, 1],
        type: 'log' as const,
        title: { text: 'Frequency (rad/s)', font: { size: 10 } },
        gridcolor: 'rgba(120,120,120,0.2)',
        exponentformat: 'power' as const,
      },
      yaxis: {
        anchor: 'x1',
        title: { text: '|H| (dB)', font: { size: 10 } },
        range: magRange,
        gridcolor: 'rgba(120,120,120,0.2)',
      },
      xaxis2: {
        anchor: 'y2',
        domain: [0, 1],
        type: 'log' as const,
        title: { text: 'Frequency (rad/s)', font: { size: 10 } },
        gridcolor: 'rgba(120,120,120,0.2)',
        exponentformat: 'power' as const,
      },
      yaxis2: {
        anchor: 'x2',
        title: { text: '∠H (°)', font: { size: 10 } },
        range: phaseRange,
        gridcolor: 'rgba(120,120,120,0.2)',
      },
      showlegend: false,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { size: 10, color: '#666' },
    }),
    [magRange, phaseRange],
  );

  return (
    <div className="overflow-hidden rounded-lg border border-ee-teal/30 bg-background">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-ee-teal/5 px-3 py-2">
        <Activity className="h-4 w-4 text-ee-teal" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-ee-teal-dark dark:text-ee-teal">
          Interactive Bode Plot
        </span>
        {label && (
          <span className="text-[11px] text-muted-foreground">· {label}</span>
        )}
      </div>

      {/* Transfer function (LaTeX) at the top */}
      <div className="border-b border-border/40 bg-muted/15 px-3 py-2.5">
        <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          Current transfer function
        </div>
        <div className="overflow-x-auto ee-scroll">
          <KatexRenderer latex={tfLatex} displayMode />
        </div>
      </div>

      {note && (
        <p className="border-b border-border/40 bg-muted/20 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          {note}
        </p>
      )}

      {/* Controls */}
      <div className="border-b border-border/40 bg-muted/15 px-3 py-2.5">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Sliders className="h-3 w-3" aria-hidden />
          Tune transfer function
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* ωₙ slider (log scale) */}
          <label className="block">
            <div className="mb-1 flex items-baseline justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
              <span>ωₙ (natural freq)</span>
              <span className="ee-mono text-foreground/80">{wn.toFixed(2)} rad/s</span>
            </div>
            <input
              type="range"
              min={0}
              max={3}
              step={0.01}
              value={Math.log10(wn)}
              onChange={(e) => setWn(Math.pow(10, parseFloat(e.target.value)))}
              className="w-full accent-[color:var(--ee-teal)]"
              aria-label="Natural frequency (log scale)"
            />
            <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground">
              <span>1</span>
              <span>10</span>
              <span>100</span>
              <span>1000</span>
            </div>
          </label>

          {/* ζ slider */}
          <label className="block">
            <div className="mb-1 flex items-baseline justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
              <span>ζ (damping ratio)</span>
              <span className="ee-mono text-foreground/80">{zeta.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={2.0}
              step={0.01}
              value={zeta}
              onChange={(e) => setZeta(parseFloat(e.target.value))}
              className="w-full accent-[color:var(--ee-teal)]"
              aria-label="Damping ratio"
            />
            <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground">
              <span>0.05</span>
              <span>1.0</span>
              <span>2.0</span>
            </div>
          </label>

          {/* Filter type selector */}
          <div className="block">
            <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              Filter type
            </div>
            <div
              className="grid grid-cols-3 gap-1"
              role="radiogroup"
              aria-label="Filter type"
            >
              {(Object.keys(FILTER_LABELS) as FilterType[]).map((t) => {
                const active = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setType(t)}
                    className={
                      'rounded border px-1.5 py-1.5 text-[10px] font-medium transition ' +
                      (active
                        ? 'border-ee-teal bg-ee-teal text-white'
                        : 'border-border/60 bg-background text-foreground/70 hover:bg-muted')
                    }
                  >
                    {FILTER_LABELS[t]}
                  </button>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-6 w-full px-2 text-[10px]"
              onClick={() => {
                setWn(initial.wn);
                setZeta(initial.zeta);
                setType(initial.type);
              }}
            >
              Reset to lesson preset
            </Button>
          </div>
        </div>
      </div>

      {/* Plot — two stacked subplots, ωₙ marked on magnitude */}
      <div className="px-2 py-2">
        <Plot
          data={data}
          layout={layout}
          config={{ displayModeBar: false, responsive: true }}
          style={{ height: 560 }}
        />
      </div>
    </div>
  );
}
