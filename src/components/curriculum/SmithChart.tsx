'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import {
  Radio,
  RotateCcw,
  Plus,
  Minus,
  Trash2,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Plotly is ~1.2 MB; lazy-load only when this component mounts. ──────────
const Plot = dynamic(() => import('./PlotlyPlot'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center rounded-sm border border-accent/30 bg-canvas-card text-xs text-body-mid">
      Loading Smith chart…
    </div>
  ),
});

// ── Types ──────────────────────────────────────────────────────────────────
type ElementType = 'series-L' | 'series-C' | 'shunt-L' | 'shunt-C';

interface MatchElement {
  type: ElementType;
  /** Stored value: Henries for L, Farads for C. */
  value: number;
}

// ── Smith-chart math ───────────────────────────────────────────────────────
//
// Γ = (z − 1) / (z + 1), where z = Z / Z₀ is the normalized impedance.
// Inverse: z = (1 + Γ) / (1 − Γ).
//
// Constant-resistance circles (normalized r):
//   center = (r/(1+r), 0), radius = 1/(1+r)
//
// Constant-reactance arcs (normalized x):
//   center = (1, 1/x), radius = 1/|x|   (clipped to the unit circle)
const Z0 = 50; // characteristic impedance (Ω)

/** Convert a complex impedance (Ω) to a reflection coefficient Γ (complex). */
function zToGamma(re: number, im: number): { re: number; im: number } {
  // Γ = (Z − Z0) / (Z + Z0)
  const numRe = re - Z0;
  const numIm = im;
  const denRe = re + Z0;
  const denIm = im;
  const d = denRe * denRe + denIm * denIm;
  return {
    re: (numRe * denRe + numIm * denIm) / d,
    im: (numIm * denRe - numRe * denIm) / d,
  };
}

/** Convert Γ (complex) back to a normalized impedance z = Z/Z0. */
function gammaToZ(gRe: number, gIm: number): { re: number; im: number } {
  // z = (1 + Γ) / (1 − Γ)
  const numRe = 1 + gRe;
  const numIm = gIm;
  const denRe = 1 - gRe;
  const denIm = -gIm;
  const d = denRe * denRe + denIm * denIm;
  return {
    re: (numRe * denRe + numIm * denIm) / d,
    im: (numIm * denRe - numRe * denIm) / d,
  };
}

/** Generate the (x, y) points of a constant-resistance circle for normalized r. */
function constRCircle(r: number, n = 80): { x: number[]; y: number[] } {
  const cx = r / (1 + r);
  const rad = 1 / (1 + r);
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * 2 * Math.PI;
    xs.push(cx + rad * Math.cos(t));
    ys.push(rad * Math.sin(t));
  }
  return { x: xs, y: ys };
}

/**
 * Generate a constant-reactance arc for normalized x. The arc lies on a circle
 * centered at (1, 1/x) with radius 1/|x|; we sample the full circle and keep
 * only the points that lie inside the unit circle (|Γ| ≤ 1).
 */
function constXArc(x: number, n = 200): { x: number[]; y: number[] } {
  if (Math.abs(x) < 1e-6) {
    // x = 0 is the horizontal axis (already drawn by the r=0 circle's diameter).
    return { x: [], y: [] };
  }
  const cx = 1;
  const cy = 1 / x;
  const rad = 1 / Math.abs(x);
  const xs: number[] = [];
  const ys: number[] = [];
  let prevInside = false;
  let started = false;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * 2 * Math.PI;
    const px = cx + rad * Math.cos(t);
    const py = cy + rad * Math.sin(t);
    const inside = px * px + py * py <= 1.0001;
    if (inside) {
      if (!started && prevInside) {
        // bridge a gap with a NaN to break the line
        xs.push(NaN);
        ys.push(NaN);
      }
      xs.push(px);
      ys.push(py);
      started = true;
    } else {
      started = false;
    }
    prevInside = inside;
  }
  return { x: xs, y: ys };
}

// ── Element value sizing ───────────────────────────────────────────────────
//
// Each click of "Add series L/C" or "Add shunt L/C" adds an element whose
// reactance (or susceptance) at the current frequency equals ±stepSize (Ω or
// S). The element *value* (Henries or Farads) is then fixed; changing the
// frequency later changes the actual reactance, so you can watch the match
// drift as you sweep the LO.
function seriesLValue(freqHz: number, stepOhms: number): number {
  // X_L = 2πf·L  →  L = X / (2πf)
  return stepOhms / (2 * Math.PI * freqHz);
}
function seriesCValue(freqHz: number, stepOhms: number): number {
  // X_C = −1/(2πf·C)  →  C = 1 / (2πf·|X|)
  return 1 / (2 * Math.PI * freqHz * stepOhms);
}
function shuntLValue(freqHz: number, stepSiemens: number): number {
  // B_L = −1/(2πf·L)  →  L = 1 / (2πf·|B|)
  return 1 / (2 * Math.PI * freqHz * stepSiemens);
}
function shuntCValue(freqHz: number, stepSiemens: number): number {
  // B_C = 2πf·C  →  C = B / (2πf)
  return stepSiemens / (2 * Math.PI * freqHz);
}

/** Reactance of an L (Ω) at frequency f. */
function xL(henries: number, freqHz: number): number {
  return 2 * Math.PI * freqHz * henries;
}
/** Reactance of a C (Ω, negative) at frequency f. */
function xC(farads: number, freqHz: number): number {
  return -1 / (2 * Math.PI * freqHz * farads);
}

// ── Build the matching cascade: start at Z_L, walk through each element. ────
function cascadeImpedance(
  zLoadRe: number,
  zLoadIm: number,
  elements: MatchElement[],
  freqHz: number
): { re: number; im: number }[] {
  // We compute Z looking INTO the network from the source side. The elements
  // are added in order from source → load, so we walk them in reverse: start
  // at the load, work back to the source, applying each element as we go.
  // For a *series* element, Z_in = Z_element + Z_next.
  // For a *shunt* element, Y_in = Y_element + Y_next  →  Z_in = 1/Y_in.
  let zRe = zLoadRe;
  let zIm = zLoadIm;
  const traj: { re: number; im: number }[] = [
    { re: zLoadRe, im: zLoadIm },
  ];
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.type === 'series-L') {
      zIm += xL(el.value, freqHz);
    } else if (el.type === 'series-C') {
      zIm += xC(el.value, freqHz);
    } else if (el.type === 'shunt-L') {
      // Y_L = 1/(jωL) = -j/(ωL)  →  B = -1/(ωL)
      const bL = -1 / (2 * Math.PI * freqHz * el.value);
      const yRe = zRe / (zRe * zRe + zIm * zIm);
      const yIm = -zIm / (zRe * zRe + zIm * zIm) + bL;
      const d = yRe * yRe + yIm * yIm;
      zRe = yRe / d;
      zIm = -yIm / d;
    } else if (el.type === 'shunt-C') {
      // Y_C = jωC  →  B = ωC
      const bC = 2 * Math.PI * freqHz * el.value;
      const yRe = zRe / (zRe * zRe + zIm * zIm);
      const yIm = -zIm / (zRe * zRe + zIm * zIm) + bC;
      const d = yRe * yRe + yIm * yIm;
      zRe = yRe / d;
      zIm = -yIm / d;
    }
    traj.push({ re: zRe, im: zIm });
  }
  // traj is in load→source order; reverse so source comes first.
  return traj.reverse();
}

// ── Formatting helpers ─────────────────────────────────────────────────────
function fmtFreq(hz: number): string {
  if (hz >= 1e9) return `${(hz / 1e9).toFixed(2)} GHz`;
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(1)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)} kHz`;
  return `${hz.toFixed(0)} Hz`;
}
function fmtL(h: number): string {
  if (h >= 1e-6) return `${(h * 1e6).toFixed(2)} µH`;
  if (h >= 1e-9) return `${(h * 1e9).toFixed(2)} nH`;
  return `${(h * 1e12).toFixed(2)} pH`;
}
function fmtC(f: number): string {
  if (f >= 1e-6) return `${(f * 1e6).toFixed(2)} µF`;
  if (f >= 1e-9) return `${(f * 1e9).toFixed(2)} nF`;
  return `${(f * 1e12).toFixed(2)} pF`;
}

const ELEMENT_LABELS: Record<ElementType, string> = {
  'series-L': 'Series L',
  'series-C': 'Series C',
  'shunt-L': 'Shunt L',
  'shunt-C': 'Shunt C',
};

// ── Component ──────────────────────────────────────────────────────────────
export interface SmithChartProps {
  /** Optional lesson title shown in the panel header. */
  lessonTitle?: string;
  /** Initial load resistance (Ω). */
  defaultZr?: number;
  /** Initial load reactance (Ω). */
  defaultZi?: number;
  /** Initial frequency (Hz). */
  defaultFreq?: number;
}

export function SmithChart({
  lessonTitle,
  defaultZr = 100,
  defaultZi = -50,
  defaultFreq = 1e9,
}: SmithChartProps) {
  const headerTitle = lessonTitle ?? 'Interactive Smith Chart';

  const [zr, setZr] = React.useState(defaultZr);
  const [zi, setZi] = React.useState(defaultZi);
  // log-frequency slider state (so 100MHz → 10GHz is linear in log space)
  const [freqLog, setFreqLog] = React.useState(
    Math.log10(defaultFreq)
  );
  const [stepSize, setStepSize] = React.useState(25); // Ω (or 1/Ω for shunt)
  const [elements, setElements] = React.useState<MatchElement[]>([]);

  const freqHz = Math.pow(10, freqLog);

  // Reset state when the lesson preset changes.
  React.useEffect(() => {
    setZr(defaultZr);
    setZi(defaultZi);
    setFreqLog(Math.log10(defaultFreq));
    setElements([]);
  }, [defaultZr, defaultZi, defaultFreq]);

  const addElement = (type: ElementType) => {
    const f = Math.pow(10, freqLog);
    let value: number;
    if (type === 'series-L') value = seriesLValue(f, stepSize);
    else if (type === 'series-C') value = seriesCValue(f, stepSize);
    else if (type === 'shunt-L') value = shuntLValue(f, 1 / stepSize);
    else value = shuntCValue(f, 1 / stepSize);
    setElements((prev) => [...prev, { type, value }]);
  };

  const popElement = () => setElements((prev) => prev.slice(0, -1));
  const resetElements = () => setElements([]);

  // ── Trajectory through the cascade ───────────────────────────────────────
  const trajectory = React.useMemo(
    () => cascadeImpedance(zr, zi, elements, freqHz),
    [zr, zi, elements, freqHz]
  );

  // The source-side impedance is trajectory[0] (after reverse).
  const zIn = React.useMemo(() => trajectory[0], [trajectory]);
  const gammaIn = React.useMemo(
    () => zToGamma(zIn.re, zIn.im),
    [zIn]
  );
  const gammaMag = Math.hypot(gammaIn.re, gammaIn.im);
  const gammaAngDeg =
    (Math.atan2(gammaIn.im, gammaIn.re) * 180) / Math.PI;
  const swr = (1 + gammaMag) / Math.max(1e-9, 1 - gammaMag);
  const returnLossDb = gammaMag < 1e-9
    ? Infinity
    : -20 * Math.log10(gammaMag);

  // ── Build the Plotly traces ──────────────────────────────────────────────
  const data = React.useMemo(() => {
    const traces: any[] = [];

    // 1. Constant-resistance circles (normalized r)
    const rVals = [0, 0.2, 0.5, 1, 2, 5];
    rVals.forEach((r) => {
      const c = constRCircle(r);
      traces.push({
        x: c.x,
        y: c.y,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: r === 1 ? 'rgba(127,255,159,0.45)' : 'rgba(127,255,159,0.18)',
          width: r === 1 ? 1.5 : 1,
        },
        hoverinfo: 'skip',
        showlegend: false,
      });
    });

    // 2. Constant-reactance arcs (normalized x) — both + and −
    const xVals = [0.2, 0.5, 1, 2, 5];
    xVals.forEach((x) => {
      [x, -x].forEach((xv) => {
        const a = constXArc(xv);
        if (a.x.length > 0) {
          traces.push({
            x: a.x,
            y: a.y,
            type: 'scatter',
            mode: 'lines',
            line: { color: 'rgba(127,255,159,0.18)', width: 1 },
            hoverinfo: 'skip',
            showlegend: false,
          });
        }
      });
    });

    // 3. Unit-circle boundary (|Γ| = 1)
    const ux: number[] = [];
    const uy: number[] = [];
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * 2 * Math.PI;
      ux.push(Math.cos(t));
      uy.push(Math.sin(t));
    }
    traces.push({
      x: ux,
      y: uy,
      type: 'scatter',
      mode: 'lines',
      line: { color: 'rgba(127,255,159,0.7)', width: 2 },
      hoverinfo: 'skip',
      showlegend: false,
    });

    // 4. Real axis (Γ_im = 0)
    traces.push({
      x: [-1, 1],
      y: [0, 0],
      type: 'scatter',
      mode: 'lines',
      line: { color: 'rgba(127,255,159,0.3)', width: 1 },
      hoverinfo: 'skip',
      showlegend: false,
    });

    // 5. Trajectory line — connect all points source → load.
    const tx = trajectory.map((p) => zToGamma(p.re, p.im).re);
    const ty = trajectory.map((p) => zToGamma(p.re, p.im).im);
    traces.push({
      x: tx,
      y: ty,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#FFB347', width: 2, dash: 'dot' },
      marker: { size: 8, color: '#FFB347' },
      name: 'Match path',
      hovertemplate: 'Γ = (%{x:.3f}, %{y:.3f}j)<extra></extra>',
    });

    // 6. Z_L (load) point — accent
    const gLoad = zToGamma(zr, zi);
    traces.push({
      x: [gLoad.re],
      y: [gLoad.im],
      type: 'scatter',
      mode: 'markers+text',
      marker: { size: 14, color: '#FF6B6B', line: { color: '#fff', width: 1 } },
      text: ['Z_L'],
      textposition: 'top center',
      textfont: { size: 11, color: '#FF6B6B' },
      name: 'Z_L',
      hovertemplate: `Z_L = ${zr.toFixed(1)} + j${zi.toFixed(1)} Ω<extra></extra>`,
    });

    // 7. Z_in (source-side after matching) point — bright accent
    traces.push({
      x: [gammaIn.re],
      y: [gammaIn.im],
      type: 'scatter',
      mode: 'markers+text',
      marker: {
        size: 16,
        color: '#7FFF9F',
        line: { color: '#fff', width: 1.5 },
        symbol: 'star',
      },
      text: ['Z_in'],
      textposition: 'bottom center',
      textfont: { size: 11, color: '#7FFF9F' },
      name: 'Z_in',
      hovertemplate: `Z_in = ${zIn.re.toFixed(2)} + j${zIn.im.toFixed(2)} Ω<extra></extra>`,
    });

    // 8. Center (perfect match) — small crosshair
    traces.push({
      x: [0],
      y: [0],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 8, color: '#A0C3EC', symbol: 'x' },
      hoverinfo: 'skip',
      showlegend: false,
    });

    return traces;
  }, [trajectory, zr, zi, zIn, gammaIn]);

  const layout = React.useMemo(
    () => ({
      margin: { t: 20, r: 20, b: 30, l: 30 },
      xaxis: {
        range: [-1.15, 1.15],
        scaleanchor: 'y',
        scaleratio: 1,
        gridcolor: 'rgba(120,120,120,0.08)',
        zeroline: false,
        showticklabels: false,
        linecolor: 'rgba(120,120,120,0.2)',
      },
      yaxis: {
        range: [-1.15, 1.15],
        gridcolor: 'rgba(120,120,120,0.08)',
        zeroline: false,
        showticklabels: false,
        linecolor: 'rgba(120,120,120,0.2)',
      },
      showlegend: false,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { size: 10, color: '#9aa0a8' },
      annotations: [
        {
          x: 1.05,
          y: 0,
          xref: 'x',
          yref: 'y',
          text: '← Gen (Z₀=50Ω) · Load →',
          showarrow: false,
          font: { size: 9, color: '#6a7079' },
          textangle: 0,
        },
      ],
    }),
    []
  );

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas-card">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Radio className="h-4 w-4 text-accent" aria-hidden />
        <span className="eyebrow text-[11px] text-accent">
          {headerTitle}
        </span>
        <span className="ml-auto ee-mono text-[10px] text-body-mid">
          Z₀ = {Z0}Ω · f = {fmtFreq(freqHz)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-[1fr_280px]">
        {/* Chart */}
        <div>
          <Plot
            data={data}
            layout={layout}
            config={{ displayModeBar: false, responsive: true }}
            style={{ height: 480 }}
          />
          <p className="mt-1 text-[10px] text-body-mid">
            Orange dots: Z_L (red) → Z_in (green star) through the matching
            network. Center crosshair = perfect match (Γ=0, SWR=1:1).
          </p>
        </div>

        {/* Right column: controls + readouts */}
        <div className="flex flex-col gap-3">
          {/* Z_L sliders */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Load impedance Z_L
            </div>
            <label className="block">
              <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
                <span>R (real)</span>
                <span className="ee-mono text-ink">{zr.toFixed(1)} Ω</span>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                step={1}
                value={zr}
                onChange={(e) => setZr(parseFloat(e.target.value))}
                className="w-full accent-[color:var(--accent)]"
                aria-label="Load resistance"
              />
            </label>
            <label className="mt-2 block">
              <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
                <span>X (imag)</span>
                <span className="ee-mono text-ink">
                  {zi >= 0 ? '+' : ''}
                  {zi.toFixed(1)} Ω
                </span>
              </div>
              <input
                type="range"
                min={-200}
                max={200}
                step={1}
                value={zi}
                onChange={(e) => setZi(parseFloat(e.target.value))}
                className="w-full accent-[color:var(--accent)]"
                aria-label="Load reactance"
              />
            </label>
          </div>

          {/* Frequency + step sliders */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Frequency & step
            </div>
            <label className="block">
              <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
                <span>Frequency</span>
                <span className="ee-mono text-accent">
                  {fmtFreq(freqHz)}
                </span>
              </div>
              <input
                type="range"
                min={Math.log10(100e6)}
                max={Math.log10(10e9)}
                step={0.01}
                value={freqLog}
                onChange={(e) => setFreqLog(parseFloat(e.target.value))}
                className="w-full accent-[color:var(--accent)]"
                aria-label="Frequency (log scale)"
              />
              <div className="mt-0.5 flex justify-between text-[9px] text-body-mid">
                <span>100 MHz</span>
                <span>1 GHz</span>
                <span>10 GHz</span>
              </div>
            </label>
            <label className="mt-2 block">
              <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
                <span>Element step |X|</span>
                <span className="ee-mono text-ink">{stepSize} Ω</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={1}
                value={stepSize}
                onChange={(e) => setStepSize(parseFloat(e.target.value))}
                className="w-full accent-[color:var(--accent)]"
                aria-label="Element reactance step"
              />
            </label>
          </div>

          {/* Add-element buttons */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Add matching element
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => addElement('series-L')}
                className="h-8 gap-1 text-[11px]"
              >
                <Plus className="h-3 w-3" /> Series L
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addElement('series-C')}
                className="h-8 gap-1 text-[11px]"
              >
                <Plus className="h-3 w-3" /> Series C
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addElement('shunt-L')}
                className="h-8 gap-1 text-[11px]"
              >
                <Plus className="h-3 w-3" /> Shunt L
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addElement('shunt-C')}
                className="h-8 gap-1 text-[11px]"
              >
                <Plus className="h-3 w-3" /> Shunt C
              </Button>
            </div>
            <div className="mt-2 flex gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                onClick={popElement}
                disabled={elements.length === 0}
                className="h-7 flex-1 gap-1 text-[10px]"
              >
                <Minus className="h-3 w-3" /> Undo
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetElements}
                disabled={elements.length === 0}
                className="h-7 flex-1 gap-1 text-[10px]"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </Button>
            </div>
          </div>

          {/* Readouts */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Reflection & match
            </div>
            <dl className="space-y-1 text-[11px]">
              <ReadoutRow
                label="Z_in"
                value={`${zIn.re.toFixed(2)} ${zIn.im >= 0 ? '+' : '−'} j${Math.abs(zIn.im).toFixed(2)} Ω`}
              />
              <ReadoutRow
                label="|Γ|"
                value={gammaMag.toFixed(4)}
              />
              <ReadoutRow
                label="∠Γ"
                value={`${gammaAngDeg.toFixed(1)}°`}
              />
              <ReadoutRow
                label="SWR"
                value={`${swr.toFixed(3)} : 1`}
                warn={swr > 2}
              />
              <ReadoutRow
                label="Return loss"
                value={
                  returnLossDb === Infinity
                    ? '∞ dB'
                    : `${returnLossDb.toFixed(2)} dB`
                }
                good={returnLossDb > 20}
              />
            </dl>
          </div>
        </div>
      </div>

      {/* Matching network schematic + element list */}
      <div className="grid grid-cols-1 gap-4 border-t border-hairline p-3 lg:grid-cols-2">
        <div>
          <div className="eyebrow mb-2 text-[10px] text-body-mid">
            Matching network (source → load)
          </div>
          <Schematic elements={elements} />
        </div>
        <div>
          <div className="eyebrow mb-2 text-[10px] text-body-mid">
            Elements ({elements.length})
          </div>
          {elements.length === 0 ? (
            <p className="rounded-sm border border-dashed border-hairline px-3 py-2 text-[11px] text-body-mid">
              No matching elements yet. Click{' '}
              <span className="text-accent">Add series/shunt L/C</span> to
              trace a path on the Smith chart.
            </p>
          ) : (
            <ul className="space-y-1">
              {elements.map((el, i) => {
                let reactance = 0;
                if (el.type === 'series-L') reactance = xL(el.value, freqHz);
                else if (el.type === 'series-C') reactance = xC(el.value, freqHz);
                else if (el.type === 'shunt-L')
                  reactance = -2 * Math.PI * freqHz * el.value; // susceptance
                else reactance = 2 * Math.PI * freqHz * el.value;
                const valStr =
                  el.type.endsWith('L') ? fmtL(el.value) : fmtC(el.value);
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-sm border border-hairline bg-canvas-soft px-2 py-1.5 text-[11px]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="ee-mono text-accent">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-ink">
                        {ELEMENT_LABELS[el.type]}
                      </span>
                      <span className="ee-mono text-body-mid">{valStr}</span>
                    </span>
                    <span className="ee-mono text-body-mid">
                      {el.type.startsWith('shunt')
                        ? `B = ${reactance >= 0 ? '+' : ''}${reactance.toFixed(2)} mS`
                        : `X = ${reactance >= 0 ? '+' : ''}${reactance.toFixed(2)} Ω`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Hint footer */}
      <div className="flex items-start gap-2 border-t border-hairline bg-canvas-soft px-3 py-2 text-[10px] text-body-mid">
        <Activity className="mt-0.5 h-3 w-3 shrink-0 text-accent" aria-hidden />
        <p>
          Series L/C moves you along a constant-R circle (X changes); shunt
          L/C moves you along a constant-G circle (B changes). Try{' '}
          <span className="text-accent">Add series L</span> then{' '}
          <span className="text-accent">Add series C</span> to walk Z_L into
          the center. Then sweep the frequency slider to watch the match
          degrade — that&apos;s why RF boards need to be tuned at the operating
          frequency.
        </p>
      </div>
    </div>
  );
}

function ReadoutRow({
  label,
  value,
  warn,
  good,
}: {
  label: string;
  value: string;
  warn?: boolean;
  good?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-body-mid">{label}</dt>
      <dd
        className={
          'ee-mono ' +
          (warn
            ? 'text-error'
            : good
            ? 'text-accent'
            : 'text-ink')
        }
      >
        {value}
      </dd>
    </div>
  );
}

/** Simple SVG schematic: source → series element → shunt element → load. */
function Schematic({ elements }: { elements: MatchElement[] }) {
  // Layout: a horizontal wire from source to load, with series elements inline
  // and shunt elements as vertical branches to ground.
  const W = 520;
  const H = 90;
  const startX = 40;
  const endX = W - 40;
  const wireY = 35;
  const groundY = 75;

  // Space the elements evenly along the wire.
  const slotW = (endX - startX) / Math.max(1, elements.length);
  const positions = elements.map((el, i) => ({
    el,
    x: startX + slotW * (i + 0.5),
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Matching network schematic"
    >
      {/* Ground line */}
      <line
        x1={startX - 10}
        y1={groundY}
        x2={endX + 10}
        y2={groundY}
        stroke="var(--body-mid)"
        strokeWidth={1}
      />
      {/* Ground hatches */}
      {[startX - 6, endX - 4].map((x, i) => (
        <g key={i}>
          <line
            x1={x}
            y1={groundY - 4}
            x2={x + 8}
            y2={groundY + 4}
            stroke="var(--body-mid)"
            strokeWidth={1}
          />
        </g>
      ))}

      {/* Source (left) — circle with sine */}
      <circle
        cx={startX - 15}
        cy={wireY}
        r={12}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.5}
      />
      <path
        d={`M ${startX - 22} ${wireY} q 3.5 -5 7 0 q 3.5 5 7 0`}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.2}
      />
      <text
        x={startX - 15}
        y={wireY - 18}
        fill="var(--body-mid)"
        fontSize={9}
        fontFamily="var(--font-mono)"
        textAnchor="middle"
      >
        Source
      </text>

      {/* Load (right) — resistor box */}
      <rect
        x={endX + 5}
        y={wireY - 7}
        width={18}
        height={14}
        fill="none"
        stroke="var(--error)"
        strokeWidth={1.5}
      />
      <text
        x={endX + 14}
        y={wireY - 14}
        fill="var(--body-mid)"
        fontSize={9}
        fontFamily="var(--font-mono)"
        textAnchor="middle"
      >
        Z_L
      </text>

      {/* Source wire to first element (or to load if no elements) */}
      <line
        x1={startX - 3}
        y1={wireY}
        x2={positions.length > 0 ? positions[0].x : endX + 5}
        y2={wireY}
        stroke="var(--body)"
        strokeWidth={1.2}
      />

      {/* Each element */}
      {positions.map((p, i) => {
        const isSeries = p.el.type.startsWith('series');
        const isL = p.el.type.endsWith('L');
        const next = positions[i + 1];
        const nextX = next ? next.x : endX + 5;

        return (
          <g key={i}>
            {isSeries ? (
              <>
                {/* Series element — small loop for L, two plates for C */}
                {isL ? (
                  <g>
                    <path
                      d={`M ${p.x - 8} ${wireY} q 4 -8 8 0 q 4 8 8 0`}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth={1.5}
                    />
                  </g>
                ) : (
                  <g>
                    <line
                      x1={p.x - 8}
                      y1={wireY}
                      x2={p.x - 2}
                      y2={wireY}
                      stroke="var(--body)"
                      strokeWidth={1.2}
                    />
                    <line
                      x1={p.x - 2}
                      y1={wireY - 6}
                      x2={p.x - 2}
                      y2={wireY + 6}
                      stroke="var(--accent)"
                      strokeWidth={1.5}
                    />
                    <line
                      x1={p.x + 2}
                      y1={wireY - 6}
                      x2={p.x + 2}
                      y2={wireY + 6}
                      stroke="var(--accent)"
                      strokeWidth={1.5}
                    />
                    <line
                      x1={p.x + 2}
                      y1={wireY}
                      x2={p.x + 8}
                      y2={wireY}
                      stroke="var(--body)"
                      strokeWidth={1.2}
                    />
                  </g>
                )}
                {/* Wire from this series element to the next */}
                <line
                  x1={p.x + 8}
                  y1={wireY}
                  x2={nextX}
                  y2={wireY}
                  stroke="var(--body)"
                  strokeWidth={1.2}
                />
              </>
            ) : (
              <>
                {/* Shunt element — vertical branch to ground */}
                <line
                  x1={p.x}
                  y1={wireY}
                  x2={p.x}
                  y2={groundY - 14}
                  stroke="var(--body)"
                  strokeWidth={1.2}
                />
                {isL ? (
                  <path
                    d={`M ${p.x - 4} ${groundY - 14} q 4 -6 8 0 q 4 6 0 0`}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={1.5}
                  />
                ) : (
                  <>
                    <line
                      x1={p.x - 6}
                      y1={groundY - 9}
                      x2={p.x + 6}
                      y2={groundY - 9}
                      stroke="var(--accent)"
                      strokeWidth={1.5}
                    />
                    <line
                      x1={p.x - 6}
                      y1={groundY - 5}
                      x2={p.x + 6}
                      y2={groundY - 5}
                      stroke="var(--accent)"
                      strokeWidth={1.5}
                    />
                  </>
                )}
                <line
                  x1={p.x}
                  y1={groundY - 5}
                  x2={p.x}
                  y2={groundY}
                  stroke="var(--body)"
                  strokeWidth={1.2}
                />
                {/* Continue the wire past this shunt tap */}
                <line
                  x1={p.x}
                  y1={wireY}
                  x2={nextX}
                  y2={wireY}
                  stroke="var(--body)"
                  strokeWidth={1.2}
                />
              </>
            )}
            <text
              x={p.x}
              y={wireY - 12}
              fill="var(--body-mid)"
              fontSize={8}
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {isL ? 'L' : 'C'}
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default SmithChart;
