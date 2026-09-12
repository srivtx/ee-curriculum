'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Activity, Crosshair, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Plotly is ~1.2 MB; lazy-load only when this component mounts. ──────────
const Plot = dynamic(() => import('./PlotlyPlot'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center rounded-sm border border-accent/30 bg-canvas-card text-xs text-body-mid">
      Loading root locus…
    </div>
  ),
});

// ── Complex helpers ────────────────────────────────────────────────────────
interface Cx {
  re: number;
  im: number;
}

function cAdd(a: Cx, b: Cx): Cx {
  return { re: a.re + b.re, im: a.im + b.im };
}
function cMul(a: Cx, b: Cx): Cx {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}
function cNeg(a: Cx): Cx {
  return { re: -a.re, im: -a.im };
}
function cAbs(a: Cx): number {
  return Math.hypot(a.re, a.im);
}
function cArg(a: Cx): number {
  return Math.atan2(a.im, a.re);
}

// ── Polynomial root finder (Durand-Kerner) ─────────────────────────────────
//
// Given polynomial coefficients in DESCENDING order (highest power first),
// returns the array of complex roots. Durand-Kerner is iterative, simple,
// and converges for any polynomial with simple or moderate-multiplicity
// roots — good enough for an educational root-locus plot.
function polyRoots(coeffs: number[]): Cx[] {
  // Strip leading zeros (high-order).
  let a = coeffs.slice();
  while (a.length > 1 && Math.abs(a[0]) < 1e-12) a.shift();
  const n = a.length - 1;
  if (n <= 0) return [];

  // Normalize: divide by leading coeff → monic polynomial.
  const lead = a[0];
  a = a.map((c) => c / lead);

  // Initial guesses: distributed on a circle around the centroid estimate.
  // Use the Abel upper bound for radius.
  const radius =
    1 + Math.max(...a.slice(1).map((c) => Math.abs(c)));
  const roots: Cx[] = [];
  // Use a non-symmetric offset so we don't accidentally hit a real root.
  const phase0 = 0.4;
  for (let i = 0; i < n; i++) {
    const ang = phase0 + (2 * Math.PI * i) / n;
    roots.push({
      re: radius * Math.cos(ang),
      im: radius * Math.sin(ang),
    });
  }

  // Iterative refinement.
  const MAX_ITER = 200;
  const TOL = 1e-10;
  for (let iter = 0; iter < MAX_ITER; iter++) {
    let maxDelta = 0;
    for (let i = 0; i < n; i++) {
      // Evaluate polynomial at roots[i] using Horner.
      let v: Cx = { re: 0, im: 0 };
      for (let k = 0; k <= n; k++) {
        v = cAdd(cMul(v, roots[i]), { re: a[k], im: 0 });
      }
      // Product of (roots[i] - roots[j]) for j != i.
      let prod: Cx = { re: 1, im: 0 };
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        prod = cMul(prod, cAdd(roots[i], cNeg(roots[j])));
      }
      if (cAbs(prod) < 1e-18) continue;
      const delta = cDiv(v, prod);
      roots[i] = cAdd(roots[i], cNeg(delta));
      if (cAbs(delta) > maxDelta) maxDelta = cAbs(delta);
    }
    if (maxDelta < TOL) break;
  }
  return roots;
}

function cDiv(a: Cx, b: Cx): Cx {
  const d = b.re * b.re + b.im * b.im;
  return {
    re: (a.re * b.re + a.im * b.im) / d,
    im: (a.im * b.re - a.re * b.im) / d,
  };
}

// ── Polynomial helpers ─────────────────────────────────────────────────────
//
// Coeffs are stored DESCENDING (highest power first):
//   p(s) = a[0]*s^n + a[1]*s^(n-1) + ... + a[n]
function polyAdd(a: number[], b: number[]): number[] {
  // Pad shorter with leading zeros, then add element-wise.
  const na = a.length;
  const nb = b.length;
  const n = Math.max(na, nb);
  const out: number[] = new Array(n).fill(0);
  for (let i = 0; i < na; i++) out[n - na + i] += a[i];
  for (let i = 0; i < nb; i++) out[n - nb + i] += b[i];
  return out;
}

// Multiply p(s) by a constant k (element-wise scaling).
function polyScale(p: number[], k: number): number[] {
  return p.map((c) => c * k);
}

// Parse a comma-separated coefficient string into a number[].
// Trims whitespace, drops empty entries, returns [] if invalid.
function parseCoeffs(s: string): number[] | null {
  const parts = s
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  if (parts.length === 0) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isFinite(n))) return null;
  return nums;
}

// Format polynomial coefficients for display: e.g. [1, 0.4, 1] → "s² + 0.4s + 1"
function polyLabel(coeffs: number[]): string {
  const n = coeffs.length - 1;
  const parts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const c = coeffs[i];
    const power = n - i;
    if (Math.abs(c) < 1e-12) continue;
    const sign = c >= 0 ? (i === 0 ? '' : ' + ') : ' − ';
    const mag = Math.abs(c);
    const magStr = mag === 1 && power > 0 ? '' : `${+mag.toFixed(4)}`;
    let term = '';
    if (power === 0) term = magStr;
    else if (power === 1) term = `${magStr}s`;
    else term = `${magStr}s^${power}`;
    parts.push(`${sign}${term}`);
  }
  return parts.length === 0 ? '0' : parts.join('');
}

// ── Stability analysis ─────────────────────────────────────────────────────
type Stability = 'Stable' | 'Marginally Stable' | 'Unstable';

function classifyStability(roots: Cx[]): Stability {
  let rhp = 0;
  let jw = 0;
  for (const r of roots) {
    if (Math.abs(r.re) < 1e-4 && Math.abs(r.im) > 1e-4) jw++;
    else if (r.re > 1e-6) rhp++;
  }
  if (rhp > 0) return 'Unstable';
  if (jw > 0) return 'Marginally Stable';
  return 'Stable';
}

/**
 * Pick the dominant (slowest-settling) complex pair from the closed-loop
 * pole set: among complex-conjugate pairs in the LHP, find the pair with the
 * smallest |Re| (closest to the jω axis → dominates the transient).
 * Returns { zeta, omegaN } or null if no complex pair is found.
 */
function dominantDamping(
  roots: Cx[]
): { zeta: number; omegaN: number; re: number; im: number } | null {
  let best: { zeta: number; omegaN: number; re: number; im: number } | null =
    null;
  for (const r of roots) {
    if (Math.abs(r.im) < 1e-6) continue; // real pole, skip
    if (r.re >= 0) continue; // skip RHP / jω (unstable / marginal)
    const omegaN = Math.hypot(r.re, r.im);
    const zeta = -r.re / omegaN;
    if (!best || Math.abs(r.re) < Math.abs(best.re)) {
      best = { zeta, omegaN, re: r.re, im: Math.abs(r.im) };
    }
  }
  return best;
}

// ── Compute root locus for a sampled K range ───────────────────────────────
//
// The closed-loop characteristic polynomial is:
//   1 + K·G(s) = 0  ⟺  den(s) + K·num(s) = 0
// We sample K log-spaced from K_min to K_max, and for each K compute the
// roots of (den + K·num). The roots at K=0 are the open-loop poles (roots of
// den); as K → ∞ the roots approach the open-loop zeros (roots of num).
function computeLocus(
  num: number[],
  den: number[],
  kSamples: number[]
): Cx[][] {
  return kSamples.map((k) => polyRoots(polyAdd(den, polyScale(num, k))));
}

// ── Component ──────────────────────────────────────────────────────────────
export interface RootLocusPlotProps {
  lessonTitle?: string;
  /** Optional default numerator coefficients (descending). */
  defaultNum?: string;
  /** Optional default denominator coefficients (descending). */
  defaultDen?: string;
}

export function RootLocusPlot({
  lessonTitle,
  defaultNum = '1',
  defaultDen = '1, 6, 11, 6',
}: RootLocusPlotProps) {
  const headerTitle = lessonTitle ?? 'Interactive Root Locus Plot';

  const [numStr, setNumStr] = React.useState(defaultNum);
  const [denStr, setDenStr] = React.useState(defaultDen);
  // User has clicked Apply; until then we don't recompute.
  const [appliedNum, setAppliedNum] = React.useState(defaultNum);
  const [appliedDen, setAppliedDen] = React.useState(defaultDen);
  // K slider state (log scale, 0.001 to 1000).
  const [kLog, setKLog] = React.useState(0); // 10^0 = 1

  // Parse applied coefficient strings.
  const num = React.useMemo(
    () => parseCoeffs(appliedNum) ?? [1],
    [appliedNum]
  );
  const den = React.useMemo(
    () => parseCoeffs(appliedDen) ?? [1, 1],
    [appliedDen]
  );

  // Open-loop poles (K=0): roots of den. Open-loop zeros (K=∞): roots of num.
  const olPoles = React.useMemo(() => polyRoots(den), [den]);
  const olZeros = React.useMemo(() => {
    if (num.length <= 1) return []; // constant numerator → no finite zeros
    return polyRoots(num);
  }, [num]);

  // K sample points (log-spaced from 1e-3 to 1e3, ~80 points).
  const kSamples = React.useMemo(() => {
    const N = 80;
    const out: number[] = [];
    const lo = -3;
    const hi = 3;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      out.push(Math.pow(10, lo + (hi - lo) * t));
    }
    return out;
  }, []);

  // Locus: array of root-sets for each K.
  const locus = React.useMemo(
    () => computeLocus(num, den, kSamples),
    [num, den, kSamples]
  );

  // Current K value.
  const kNow = Math.pow(10, kLog);

  // Current closed-loop poles at K = kNow.
  const currentPoles = React.useMemo(
    () => polyRoots(polyAdd(den, polyScale(num, kNow))),
    [num, den, kNow]
  );

  // Stability classification.
  const stability = React.useMemo(
    () => classifyStability(currentPoles),
    [currentPoles]
  );

  // Dominant damping ratio / natural frequency.
  const dom = React.useMemo(
    () => dominantDamping(currentPoles),
    [currentPoles]
  );

  // Plot bounds: compute from all locus points + open-loop poles/zeros.
  const bounds = React.useMemo(() => {
    let maxR = 1;
    for (const set of locus) {
      for (const r of set) {
        maxR = Math.max(maxR, Math.abs(r.re), Math.abs(r.im));
      }
    }
    for (const p of olPoles) {
      maxR = Math.max(maxR, Math.abs(p.re), Math.abs(p.im));
    }
    for (const z of olZeros) {
      maxR = Math.max(maxR, Math.abs(z.re), Math.abs(z.im));
    }
    // Add 25% padding.
    const pad = maxR * 0.25;
    return { lo: -maxR - pad, hi: maxR + pad };
  }, [locus, olPoles, olZeros]);

  // ── Build Plotly traces ──────────────────────────────────────────────────
  // Group locus roots by branch: for each K, we have n roots (n = deg(den)).
  // To draw continuous branches we sort roots at each K by nearest-neighbor
  // to the previous K's roots. This is the classic "root locus branch
  // matching" trick.
  const branches = React.useMemo(() => {
    const n = den.length - 1; // degree of characteristic polynomial
    if (n === 0 || locus.length === 0) return [];
    const branchPts: Cx[][] = Array.from({ length: n }, () => []);
    // Sort roots at each K by matching to the previous K's roots.
    let prev: Cx[] = locus[0].slice();
    for (let i = 0; i < locus.length; i++) {
      const set = locus[i].slice();
      // Greedy nearest-neighbor matching between prev and set.
      const used = new Array(set.length).fill(false);
      const order: number[] = [];
      for (let j = 0; j < prev.length; j++) {
        let bestIdx = -1;
        let bestDist = Infinity;
        for (let k = 0; k < set.length; k++) {
          if (used[k]) continue;
          const d =
            (prev[j].re - set[k].re) ** 2 + (prev[j].im - set[k].im) ** 2;
          if (d < bestDist) {
            bestDist = d;
            bestIdx = k;
          }
        }
        if (bestIdx >= 0) {
          used[bestIdx] = true;
          order.push(bestIdx);
        } else {
          // Fallback: pick first unused.
          const idx = used.findIndex((u) => !u);
          if (idx >= 0) {
            used[idx] = true;
            order.push(idx);
          }
        }
      }
      for (let j = 0; j < n; j++) {
        branchPts[j].push(set[order[j]]);
      }
      prev = order.map((k) => set[k]);
    }
    return branchPts;
  }, [locus, den]);

  const data = React.useMemo(() => {
    const traces: any[] = [];

    // 1. Real and imaginary axes.
    traces.push({
      x: [bounds.lo, bounds.hi],
      y: [0, 0],
      type: 'scatter',
      mode: 'lines',
      line: { color: 'rgba(127,255,159,0.25)', width: 1 },
      hoverinfo: 'skip',
      showlegend: false,
    });
    traces.push({
      x: [0, 0],
      y: [bounds.lo, bounds.hi],
      type: 'scatter',
      mode: 'lines',
      line: { color: 'rgba(127,255,159,0.25)', width: 1 },
      hoverinfo: 'skip',
      showlegend: false,
    });

    // 2. Unit circle (for discrete-time / z-plane stability reference).
    const ux: number[] = [];
    const uy: number[] = [];
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * 2 * Math.PI;
      ux.push(Math.cos(t));
      uy.push(Math.sin(t));
    }
    traces.push({
      x: ux,
      y: uy,
      type: 'scatter',
      mode: 'lines',
      line: { color: 'rgba(160,195,236,0.25)', width: 1, dash: 'dot' },
      hoverinfo: 'skip',
      showlegend: false,
    });

    // 3. Locus branches — color each branch with a slightly different
    //    phosphor shade so overlapping branches are distinguishable.
    const branchColors = [
      'rgba(127,255,159,0.95)',
      'rgba(180,255,170,0.85)',
      'rgba(120,220,140,0.85)',
      'rgba(95,200,120,0.85)',
      'rgba(75,180,100,0.85)',
      'rgba(60,160,90,0.85)',
      'rgba(50,140,80,0.85)',
      'rgba(40,120,70,0.85)',
    ];
    branches.forEach((branch, i) => {
      traces.push({
        x: branch.map((p) => p.re),
        y: branch.map((p) => p.im),
        type: 'scatter',
        mode: 'lines',
        line: {
          color: branchColors[i % branchColors.length],
          width: 1.6,
        },
        hovertemplate: `K = %{text}<br>s = %{x:.3f} + %{y:.3f}j<extra></extra>`,
        text: kSamples.map((k) => k.toExponential(2)),
        name: `Branch ${i + 1}`,
        showlegend: false,
      });
    });

    // 4. Open-loop poles — × markers.
    if (olPoles.length > 0) {
      traces.push({
        x: olPoles.map((p) => p.re),
        y: olPoles.map((p) => p.im),
        type: 'scatter',
        mode: 'markers',
        marker: {
          size: 14,
          color: 'transparent',
          line: { color: '#FF6B6B', width: 2 },
          symbol: 'x',
        },
        name: 'OL poles',
        hovertemplate: 'OL pole: %{x:.3f} + %{y:.3f}j<extra></extra>',
      });
    }

    // 5. Open-loop zeros — ○ markers.
    if (olZeros.length > 0) {
      traces.push({
        x: olZeros.map((p) => p.re),
        y: olZeros.map((p) => p.im),
        type: 'scatter',
        mode: 'markers',
        marker: {
          size: 13,
          color: 'transparent',
          line: { color: '#A0C3EC', width: 2 },
          symbol: 'circle',
        },
        name: 'OL zeros',
        hovertemplate: 'OL zero: %{x:.3f} + %{y:.3f}j<extra></extra>',
      });
    }

    // 6. Current closed-loop poles at K=kNow — bright dots.
    traces.push({
      x: currentPoles.map((p) => p.re),
      y: currentPoles.map((p) => p.im),
      type: 'scatter',
      mode: 'markers',
      marker: {
        size: 12,
        color: '#7FFF9F',
        line: { color: '#0a0a0a', width: 1.5 },
      },
      name: `K = ${kNow.toExponential(2)}`,
      hovertemplate: `K=${kNow.toExponential(2)}: s = %{x:.3f} + %{y:.3f}j<extra></extra>`,
    });

    return traces;
  }, [bounds, branches, olPoles, olZeros, currentPoles, kNow, kSamples]);

  const layout = React.useMemo(
    () => ({
      margin: { t: 20, r: 20, b: 36, l: 40 },
      xaxis: {
        title: { text: 'Re{s}', font: { size: 10, color: '#9aa0a8' } },
        range: [bounds.lo, bounds.hi],
        scaleanchor: 'y',
        scaleratio: 1,
        gridcolor: 'rgba(120,120,120,0.10)',
        zeroline: false,
        linecolor: 'rgba(120,120,120,0.2)',
        tickfont: { size: 9, color: '#9aa0a8' },
      },
      yaxis: {
        title: { text: 'Im{s}', font: { size: 10, color: '#9aa0a8' } },
        range: [bounds.lo, bounds.hi],
        gridcolor: 'rgba(120,120,120,0.10)',
        zeroline: false,
        linecolor: 'rgba(120,120,120,0.2)',
        tickfont: { size: 9, color: '#9aa0a8' },
      },
      showlegend: false,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { size: 10, color: '#9aa0a8' },
      annotations: [
        {
          x: 0,
          y: bounds.hi * 0.95,
          xref: 'x',
          yref: 'y',
          text: '← LHP (stable) | RHP (unstable) →',
          showarrow: false,
          font: { size: 9, color: '#6a7079' },
        },
      ],
    }),
    [bounds]
  );

  // ── Apply coefficient edits ───────────────────────────────────────────────
  const applyCoeffs = () => {
    const n = parseCoeffs(numStr);
    const d = parseCoeffs(denStr);
    if (!n || !d) return;
    setAppliedNum(numStr);
    setAppliedDen(denStr);
  };

  const resetAll = () => {
    setNumStr(defaultNum);
    setDenStr(defaultDen);
    setAppliedNum(defaultNum);
    setAppliedDen(defaultDen);
    setKLog(0);
  };

  // ── Stability color ───────────────────────────────────────────────────────
  const stabilityColor =
    stability === 'Stable'
      ? 'text-accent'
      : stability === 'Marginally Stable'
      ? 'text-warning'
      : 'text-error';

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas-card">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Activity className="h-4 w-4 text-accent" aria-hidden />
        <span className="eyebrow text-[11px] text-accent">{headerTitle}</span>
        <span className="ml-auto ee-mono text-[10px] text-body-mid">
          G(s) = K·num(s) / den(s)
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-[1fr_300px]">
        {/* Chart */}
        <div>
          <Plot
            data={data}
            layout={layout}
            config={{ displayModeBar: false, responsive: true }}
            style={{ height: 480 }}
          />
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-body-mid">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 text-[#FF6B6B]"
                aria-hidden
              >
                ✕
              </span>
              Open-loop poles (K = 0)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full border-2 border-[#A0C3EC]"
                aria-hidden
              />
              Open-loop zeros (K → ∞)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full bg-[#7FFF9F]"
                aria-hidden
              />
              Closed-loop poles at current K
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full border border-dashed border-[#A0C3EC]"
                aria-hidden
              />
              Unit circle
            </span>
          </div>
        </div>

        {/* Controls + readouts */}
        <div className="flex flex-col gap-3">
          {/* Transfer function entry */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Open-loop G(s) = K · num(s) / den(s)
            </div>
            <label className="block">
              <span className="mb-1 block text-[10px] text-body-mid">
                Numerator (descending: b_n, …, b_0)
              </span>
              <input
                type="text"
                value={numStr}
                onChange={(e) => setNumStr(e.target.value)}
                onBlur={applyCoeffs}
                placeholder="e.g. 1"
                className="w-full rounded-sm border border-hairline bg-canvas px-2 py-1.5 font-mono text-[11px] text-ink focus:border-accent focus:outline-none"
                aria-label="Numerator coefficients"
              />
            </label>
            <label className="mt-2 block">
              <span className="mb-1 block text-[10px] text-body-mid">
                Denominator (descending: a_n, …, a_0)
              </span>
              <input
                type="text"
                value={denStr}
                onChange={(e) => setDenStr(e.target.value)}
                onBlur={applyCoeffs}
                placeholder="e.g. 1, 6, 11, 6"
                className="w-full rounded-sm border border-hairline bg-canvas px-2 py-1.5 font-mono text-[11px] text-ink focus:border-accent focus:outline-none"
                aria-label="Denominator coefficients"
              />
            </label>
            <div className="mt-2 flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={applyCoeffs}
                className="h-7 flex-1 gap-1 text-[10px]"
              >
                <Crosshair className="h-3 w-3" /> Apply
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetAll}
                className="h-7 flex-1 gap-1 text-[10px]"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
            </div>
            <div className="mt-2 rounded-sm border border-hairline bg-canvas px-2 py-1.5">
              <div className="text-[9px] uppercase tracking-wider text-body-mid">
                num(s)
              </div>
              <div className="ee-mono text-[11px] text-accent">
                {polyLabel(num)}
              </div>
              <div className="mt-1 text-[9px] uppercase tracking-wider text-body-mid">
                den(s)
              </div>
              <div className="ee-mono text-[11px] text-accent">
                {polyLabel(den)}
              </div>
            </div>
          </div>

          {/* K slider */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Gain K (log scale)
            </div>
            <div className="mb-1 flex items-baseline justify-between text-[10px]">
              <span className="text-body-mid">K</span>
              <span className="ee-mono text-accent">
                {kNow.toExponential(2)}
              </span>
            </div>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.01}
              value={kLog}
              onChange={(e) => setKLog(parseFloat(e.target.value))}
              className="w-full accent-[color:var(--accent)]"
              aria-label="Gain K (log scale)"
            />
            <div className="mt-0.5 flex justify-between text-[9px] text-body-mid">
              <span>10^-3</span>
              <span>10^0</span>
              <span>10^3</span>
            </div>
          </div>

          {/* Stability + damping readouts */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Stability &amp; transient
            </div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[11px] text-body-mid">Status</span>
              <span
                className={`ee-mono text-[12px] font-semibold ${stabilityColor}`}
              >
                {stability}
              </span>
            </div>
            <ReadoutRow
              label="OL poles"
              value={olPoles.length > 0 ? `${olPoles.length}` : '0'}
            />
            <ReadoutRow
              label="OL zeros"
              value={`${olZeros.length}`}
            />
            <ReadoutRow
              label="Locus branches"
              value={`${den.length - 1}`}
            />
            <ReadoutRow
              label="Asymptotes"
              value={`${Math.max(0, den.length - 1 - olZeros.length)}`}
            />
            {dom && (
              <>
                <div className="my-2 border-t border-hairline" />
                <div className="text-[9px] uppercase tracking-wider text-body-mid">
                  Dominant pair
                </div>
                <ReadoutRow
                  label="ζ (damping)"
                  value={dom.zeta.toFixed(3)}
                  good={dom.zeta > 0.4 && dom.zeta < 0.9}
                />
                <ReadoutRow
                  label="ωₙ (rad/s)"
                  value={dom.omegaN.toFixed(3)}
                />
                <ReadoutRow
                  label="σ = −ζωₙ"
                  value={dom.re.toFixed(3)}
                />
                <ReadoutRow
                  label="ωd = ωₙ√(1−ζ²)"
                  value={dom.im.toFixed(3)}
                />
                {dom.zeta > 0 && dom.zeta < 1 && (
                  <ReadoutRow
                    label="%OS (approx)"
                    value={`${(
                      100 *
                      Math.exp(
                        (-dom.zeta * Math.PI) /
                          Math.sqrt(1 - dom.zeta * dom.zeta)
                      )
                    ).toFixed(1)}%`}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Current closed-loop poles list */}
      <div className="border-t border-hairline p-3">
        <div className="eyebrow mb-2 text-[10px] text-body-mid">
          Closed-loop poles at K = {kNow.toExponential(2)}
        </div>
        {currentPoles.length === 0 ? (
          <p className="text-[11px] text-body-mid">
            No poles — check coefficient entry.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {currentPoles.map((p, i) => (
              <div
                key={i}
                className="rounded-sm border border-hairline bg-canvas-soft px-2 py-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="ee-mono text-[10px] text-body-mid">
                    s_{i + 1}
                  </span>
                  <span
                    className={`text-[10px] ${
                      p.re > 1e-6
                        ? 'text-error'
                        : Math.abs(p.re) < 1e-4 && Math.abs(p.im) > 1e-4
                        ? 'text-warning'
                        : 'text-accent'
                    }`}
                  >
                    {p.re > 1e-6
                      ? 'RHP'
                      : Math.abs(p.re) < 1e-4 && Math.abs(p.im) > 1e-4
                      ? 'jω'
                      : 'LHP'}
                  </span>
                </div>
                <div className="ee-mono text-[11px] text-ink">
                  {p.re.toFixed(3)} {p.im >= 0 ? '+' : '−'} j
                  {Math.abs(p.im).toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hint footer */}
      <div className="flex items-start gap-2 border-t border-hairline bg-canvas-soft px-3 py-2 text-[10px] text-body-mid">
        <Activity className="mt-0.5 h-3 w-3 shrink-0 text-accent" aria-hidden />
        <p>
          Closed-loop characteristic polynomial:{' '}
          <span className="ee-mono text-accent">den(s) + K·num(s) = 0</span>.
          At K = 0 the closed-loop poles coincide with the open-loop poles
          (red ✕); as K → ∞ they migrate toward the open-loop zeros (blue ○),
          with the leftover branches heading to infinity along asymptotes.
          Drag the K slider to watch the poles move and the stability status
          update.
        </p>
      </div>
    </div>
  );
}

function ReadoutRow({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between text-[11px]">
      <dt className="text-body-mid">{label}</dt>
      <dd
        className={
          'ee-mono ' + (good ? 'text-accent' : 'text-ink')
        }
      >
        {value}
      </dd>
    </div>
  );
}

export default RootLocusPlot;
