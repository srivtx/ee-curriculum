'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Radio, Crosshair, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Plotly is ~1.2 MB; lazy-load only when this component mounts. ──────────
const Plot = dynamic(() => import('./PlotlyPlot'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center rounded-sm border border-accent/30 bg-canvas-card text-xs text-body-mid">
      Loading Nyquist plot…
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
function cDiv(a: Cx, b: Cx): Cx {
  const d = b.re * b.re + b.im * b.im;
  return {
    re: (a.re * b.re + a.im * b.im) / d,
    im: (a.im * b.re - a.re * b.im) / d,
  };
}
function cAbs(a: Cx): number {
  return Math.hypot(a.re, a.im);
}
function cArg(a: Cx): number {
  return Math.atan2(a.im, a.re);
}

// ── Polynomial root finder (Durand-Kerner) — shared with RootLocusPlot ─────
function polyRoots(coeffs: number[]): Cx[] {
  let a = coeffs.slice();
  while (a.length > 1 && Math.abs(a[0]) < 1e-12) a.shift();
  const n = a.length - 1;
  if (n <= 0) return [];
  const lead = a[0];
  a = a.map((c) => c / lead);
  const radius = 1 + Math.max(...a.slice(1).map((c) => Math.abs(c)));
  const roots: Cx[] = [];
  const phase0 = 0.4;
  for (let i = 0; i < n; i++) {
    const ang = phase0 + (2 * Math.PI * i) / n;
    roots.push({
      re: radius * Math.cos(ang),
      im: radius * Math.sin(ang),
    });
  }
  const MAX_ITER = 200;
  const TOL = 1e-10;
  for (let iter = 0; iter < MAX_ITER; iter++) {
    let maxDelta = 0;
    for (let i = 0; i < n; i++) {
      let v: Cx = { re: 0, im: 0 };
      for (let k = 0; k <= n; k++) {
        v = cAdd(cMul(v, roots[i]), { re: a[k], im: 0 });
      }
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

function cNeg(a: Cx): Cx {
  return { re: -a.re, im: -a.im };
}

// ── Coefficient parsing & formatting ───────────────────────────────────────
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

// ── Evaluate the transfer function L(s) = num(s) / den(s) at a complex s. ──
function evalTF(num: number[], den: number[], s: Cx): Cx {
  // Horner's method on numerator and denominator.
  let n: Cx = { re: 0, im: 0 };
  for (let i = 0; i < num.length; i++) {
    n = cAdd(cMul(n, s), { re: num[i], im: 0 });
  }
  let d: Cx = { re: 0, im: 0 };
  for (let i = 0; i < den.length; i++) {
    d = cAdd(cMul(d, s), { re: den[i], im: 0 });
  }
  if (cAbs(d) < 1e-18) return { re: 1e18, im: 0 };
  return cDiv(n, d);
}

/**
 * Count the net (signed) number of clockwise encirclements of the −1 point
 * by the Nyquist curve.
 *
 * We use the winding-number algorithm: the curve is sampled as a sequence of
 * points {L(jω_k)}; we sum the signed angle changes of the vector from −1
 * to each point. The integer result is N (clockwise encirclements).
 *
 * Note: in the convention used by the Nyquist criterion, "encirclement of
 * −1 counted clockwise as seen along the standard ω: −∞ → +∞ direction"
 * equals N. Then Z = P − N, where P is #RHP poles of L(s) and Z is #RHP
 * closed-loop poles.
 */
function countEncirclements(curve: Cx[]): number {
  if (curve.length < 2) return 0;
  let totalAngle = 0;
  const target: Cx = { re: -1, im: 0 };
  let prevAng = Math.atan2(
    curve[0].im - target.im,
    curve[0].re - target.re
  );
  for (let i = 1; i < curve.length; i++) {
    const ang = Math.atan2(
      curve[i].im - target.im,
      curve[i].re - target.re
    );
    let dAng = ang - prevAng;
    // Unwrap: keep dAng in (−π, π].
    while (dAng > Math.PI) dAng -= 2 * Math.PI;
    while (dAng <= -Math.PI) dAng += 2 * Math.PI;
    totalAngle += dAng;
    prevAng = ang;
  }
  // totalAngle / (2π) = net clockwise encirclements (in our sign convention).
  // (For a standard Nyquist curve traced from ω=−∞ to ω=+∞, a clockwise
  // encirclement of −1 gives totalAngle = +2π.)
  return Math.round(totalAngle / (2 * Math.PI));
}

/**
 * Count RHP poles of L(s) = number of denominator roots with Re > 0.
 */
function countRhpPoles(den: number[]): number {
  if (den.length <= 1) return 0;
  const roots = polyRoots(den);
  return roots.filter((r) => r.re > 1e-6).length;
}

// ── Gain & phase margins ───────────────────────────────────────────────────
//
// Phase margin (PM): at the gain-crossover frequency ω_c where |L(jω)| = 1,
//   PM = 180° + ∠L(jω_c).
// Gain margin (GM): at the phase-crossover frequency ω_180 where ∠L = −180°,
//   GM = 1 / |L(jω_180)| (linear) → 20·log10(GM) in dB.
//
// We search over the sampled positive-ω curve.
interface Margins {
  pm: number | null; // degrees
  pmOmega: number | null;
  gm: number | null; // linear
  gmDb: number | null;
  gmOmega: number | null;
}

function computeMargins(
  omegas: number[],
  L: Cx[]
): Margins {
  const result: Margins = {
    pm: null,
    pmOmega: null,
    gm: null,
    gmDb: null,
    gmOmega: null,
  };
  if (omegas.length < 2) return result;

  // Phase margin: find sign change of |L| − 1.
  for (let i = 1; i < omegas.length; i++) {
    const m0 = cAbs(L[i - 1]);
    const m1 = cAbs(L[i]);
    if ((m0 - 1) * (m1 - 1) < 0) {
      // Linear interpolation in log-magnitude.
      const t = (1 - m0) / (m1 - m0);
      const wCross = omegas[i - 1] * Math.pow(omegas[i] / omegas[i - 1], t);
      // Interpolate phase linearly (close enough for nearby points).
      const a0 = (cArg(L[i - 1]) * 180) / Math.PI;
      let a1 = (cArg(L[i]) * 180) / Math.PI;
      // Unwrap.
      if (a1 - a0 > 180) a1 -= 360;
      if (a1 - a0 < -180) a1 += 360;
      const phaseDeg = a0 + t * (a1 - a0);
      result.pmOmega = wCross;
      result.pm = 180 + phaseDeg;
      break;
    }
  }

  // Gain margin: find sign change of phase + 180°.
  for (let i = 1; i < omegas.length; i++) {
    const a0 = (cArg(L[i - 1]) * 180) / Math.PI;
    let a1 = (cArg(L[i]) * 180) / Math.PI;
    if (a1 - a0 > 180) a1 -= 360;
    if (a1 - a0 < -180) a1 += 360;
    // We're looking for crossings of −180° (i.e. phase = −180°).
    if ((a0 + 180) * (a1 + 180) < 0) {
      const t = (0 - (a0 + 180)) / (a1 + 180 - (a0 + 180));
      const wCross = omegas[i - 1] * Math.pow(omegas[i] / omegas[i - 1], t);
      const m0 = cAbs(L[i - 1]);
      const m1 = cAbs(L[i]);
      const mag = m0 + t * (m1 - m0);
      if (mag > 1e-9) {
        result.gmOmega = wCross;
        result.gm = 1 / mag;
        result.gmDb = 20 * Math.log10(1 / mag);
      }
      break;
    }
  }
  return result;
}

// ── Component ──────────────────────────────────────────────────────────────
export interface NyquistPlotProps {
  lessonTitle?: string;
  defaultNum?: string;
  defaultDen?: string;
}

export function NyquistPlot({
  lessonTitle,
  defaultNum = '1',
  defaultDen = '1, 0.4, 1',
}: NyquistPlotProps) {
  const headerTitle = lessonTitle ?? 'Interactive Nyquist Plot';

  const [numStr, setNumStr] = React.useState(defaultNum);
  const [denStr, setDenStr] = React.useState(defaultDen);
  const [appliedNum, setAppliedNum] = React.useState(defaultNum);
  const [appliedDen, setAppliedDen] = React.useState(defaultDen);
  // Optional override for P (open-loop RHP poles). Default: compute from den.
  const [pOverride, setPOverride] = React.useState<number | ''>('');

  const num = React.useMemo(
    () => parseCoeffs(appliedNum) ?? [1],
    [appliedNum]
  );
  const den = React.useMemo(
    () => parseCoeffs(appliedDen) ?? [1, 1],
    [appliedDen]
  );

  // Frequency samples: ω from ω_min to ω_max (log-spaced), plus negatives.
  const { omegasPos, omegasNeg, omegasAll, curveAll } = React.useMemo(() => {
    const N = 200;
    const lo = Math.log10(0.01);
    const hi = Math.log10(100);
    const pos: number[] = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      pos.push(Math.pow(10, lo + (hi - lo) * t));
    }
    // Negative frequencies (mirror) — Nyquist requires the full contour.
    // ω = 0 maps to L(0) (real, on the curve).
    const neg: number[] = pos.slice().reverse().map((w) => -w);
    const all = [...neg, ...pos];
    const curve = all.map((w) =>
      evalTF(num, den, { re: 0, im: w })
    );
    return {
      omegasPos: pos,
      omegasNeg: neg,
      omegasAll: all,
      curveAll: curve,
    };
  }, [num, den]);

  // Margins (computed on positive-ω curve only).
  const curvePos = React.useMemo(
    () => omegasPos.map((w) => evalTF(num, den, { re: 0, im: w })),
    [num, den, omegasPos]
  );
  const margins = React.useMemo(
    () => computeMargins(omegasPos, curvePos),
    [omegasPos, curvePos]
  );

  // Encirclements & RHP poles.
  const N_enc = React.useMemo(
    () => countEncirclements(curveAll),
    [curveAll]
  );
  const P_computed = React.useMemo(() => countRhpPoles(den), [den]);
  const P = pOverride === '' ? P_computed : pOverride;
  const Z = P - N_enc;
  const stable = Z === 0;

  // ── Build Plotly traces ──────────────────────────────────────────────────
  // Plot bounds.
  const bounds = React.useMemo(() => {
    let maxR = 1;
    for (const c of curveAll) {
      if (!Number.isFinite(c.re) || !Number.isFinite(c.im)) continue;
      maxR = Math.max(maxR, Math.abs(c.re), Math.abs(c.im));
    }
    maxR = Math.min(maxR, 50); // cap to keep plot readable for high-gain TFs
    const pad = maxR * 0.2;
    return { lo: -maxR - pad, hi: maxR + pad };
  }, [curveAll]);

  const data = React.useMemo(() => {
    const traces: any[] = [];

    // 1. Real & imaginary axes.
    traces.push({
      x: [bounds.lo, bounds.hi],
      y: [0, 0],
      type: 'scatter',
      mode: 'lines',
      line: { color: 'rgba(127,255,159,0.20)', width: 1 },
      hoverinfo: 'skip',
      showlegend: false,
    });
    traces.push({
      x: [0, 0],
      y: [bounds.lo, bounds.hi],
      type: 'scatter',
      mode: 'lines',
      line: { color: 'rgba(127,255,159,0.20)', width: 1 },
      hoverinfo: 'skip',
      showlegend: false,
    });

    // 2. Negative-frequency half of the curve (dashed, ω: −∞ → 0).
    //    curveAll[0 .. N-1] is the negative-ω half (in reverse order).
    const negHalf = curveAll.slice(0, omegasNeg.length);
    traces.push({
      x: negHalf.map((c) => c.re),
      y: negHalf.map((c) => c.im),
      type: 'scatter',
      mode: 'lines',
      line: { color: 'rgba(127,255,159,0.45)', width: 1.3, dash: 'dash' },
      hovertemplate: 'ω=%{text} rad/s<br>L = %{x:.3f} + %{y:.3f}j<extra></extra>',
      text: omegasNeg.map((w) => w.toFixed(3)),
      name: 'ω < 0',
      showlegend: false,
    });

    // 3. Positive-frequency half of the curve (solid, ω: 0 → +∞).
    const posHalf = curveAll.slice(omegasNeg.length);
    traces.push({
      x: posHalf.map((c) => c.re),
      y: posHalf.map((c) => c.im),
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#7FFF9F', width: 2 },
      marker: { size: 3, color: '#7FFF9F' },
      hovertemplate: 'ω=%{text} rad/s<br>L = %{x:.3f} + %{y:.3f}j<extra></extra>',
      text: omegasPos.map((w) => w.toFixed(3)),
      name: 'ω > 0',
      showlegend: false,
    });

    // 4. Direction arrows — at a few sample ω values, indicate the direction
    //    of traversal so the encirclement sense is visually obvious.
    const arrowIdx = [
      Math.floor(omegasPos.length * 0.25),
      Math.floor(omegasPos.length * 0.5),
      Math.floor(omegasPos.length * 0.75),
    ];
    arrowIdx.forEach((idx) => {
      const p0 = posHalf[idx];
      const p1 = posHalf[Math.min(posHalf.length - 1, idx + 1)];
      if (!p0 || !p1) return;
      if (!Number.isFinite(p0.re) || !Number.isFinite(p1.re)) return;
      const dx = p1.re - p0.re;
      const dy = p1.im - p0.im;
      const len = Math.hypot(dx, dy);
      if (len < 1e-9) return;
      const ux = dx / len;
      const uy = dy / len;
      traces.push({
        x: [p0.re, p0.re + ux * 0.04 * (bounds.hi - bounds.lo)],
        y: [p0.im, p0.im + uy * 0.04 * (bounds.hi - bounds.lo)],
        type: 'scatter',
        mode: 'lines',
        line: { color: '#FFB347', width: 2 },
        hoverinfo: 'skip',
        showlegend: false,
      });
    });

    // 5. −1 point — red ×.
    traces.push({
      x: [-1],
      y: [0],
      type: 'scatter',
      mode: 'markers',
      marker: {
        size: 16,
        color: 'transparent',
        line: { color: '#FF6B6B', width: 2.5 },
        symbol: 'x',
      },
      name: '−1 point',
      hovertemplate: 'Critical point −1<extra></extra>',
    });

    // 6. Gain-crossover point (where |L| = 1 on the positive-ω curve) — if found.
    if (margins.pm !== null && margins.pmOmega !== null) {
      const Lc = evalTF(num, den, { re: 0, im: margins.pmOmega });
      traces.push({
        x: [Lc.re],
        y: [Lc.im],
        type: 'scatter',
        mode: 'markers',
        marker: { size: 10, color: '#FFB347', line: { color: '#0a0a0a', width: 1 } },
        name: '|L|=1',
        hovertemplate: `ωc=${margins.pmOmega.toFixed(3)}<br>L=%{x:.3f}+%{y:.3f}j<extra>Gain crossover</extra>`,
      });
    }

    // 7. Phase-crossover point (where ∠L = −180°) — if found.
    if (margins.gm !== null && margins.gmOmega !== null) {
      const Lp = evalTF(num, den, { re: 0, im: margins.gmOmega });
      traces.push({
        x: [Lp.re],
        y: [Lp.im],
        type: 'scatter',
        mode: 'markers',
        marker: { size: 10, color: '#A0C3EC', line: { color: '#0a0a0a', width: 1 } },
        name: '∠L=−180°',
        hovertemplate: `ω₁₈₀=${margins.gmOmega.toFixed(3)}<br>L=%{x:.3f}+%{y:.3f}j<extra>Phase crossover</extra>`,
      });
    }

    return traces;
  }, [bounds, curveAll, omegasPos, omegasNeg, margins, num, den]);

  const layout = React.useMemo(
    () => ({
      margin: { t: 20, r: 20, b: 36, l: 40 },
      xaxis: {
        title: { text: 'Re{L(jω)}', font: { size: 10, color: '#9aa0a8' } },
        range: [bounds.lo, bounds.hi],
        scaleanchor: 'y',
        scaleratio: 1,
        gridcolor: 'rgba(120,120,120,0.10)',
        zeroline: false,
        linecolor: 'rgba(120,120,120,0.2)',
        tickfont: { size: 9, color: '#9aa0a8' },
      },
      yaxis: {
        title: { text: 'Im{L(jω)}', font: { size: 10, color: '#9aa0a8' } },
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
    }),
    [bounds]
  );

  const applyCoeffs = () => {
    const n = parseCoeffs(numStr);
    const d = parseCoeffs(denStr);
    if (!n || !d) return;
    setAppliedNum(numStr);
    setAppliedDen(denStr);
    setPOverride('');
  };

  const resetAll = () => {
    setNumStr(defaultNum);
    setDenStr(defaultDen);
    setAppliedNum(defaultNum);
    setAppliedDen(defaultDen);
    setPOverride('');
  };

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas-card">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Radio className="h-4 w-4 text-accent" aria-hidden />
        <span className="eyebrow text-[11px] text-accent">{headerTitle}</span>
        <span className="ml-auto ee-mono text-[10px] text-body-mid">
          L(s) = num(s) / den(s) · ω ∈ [0.01, 100] rad/s
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
                className="inline-block h-2 w-4 bg-[#7FFF9F]"
                aria-hidden
              />
              Positive ω (solid)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-4 border-t-2 border-dashed border-[rgba(127,255,159,0.6)]"
                aria-hidden
              />
              Negative ω (mirror)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[#FF6B6B]" aria-hidden>
                ✕
              </span>
              Critical point −1
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[#FFB347]" aria-hidden>
                →
              </span>
              Traversal direction
            </span>
          </div>
        </div>

        {/* Controls + readouts */}
        <div className="flex flex-col gap-3">
          {/* Transfer function entry */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Loop transfer function L(s) = num(s) / den(s)
            </div>
            <label className="block">
              <span className="mb-1 block text-[10px] text-body-mid">
                Numerator (descending)
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
                Denominator (descending)
              </span>
              <input
                type="text"
                value={denStr}
                onChange={(e) => setDenStr(e.target.value)}
                onBlur={applyCoeffs}
                placeholder="e.g. 1, 0.4, 1"
                className="w-full rounded-sm border border-hairline bg-canvas px-2 py-1.5 font-mono text-[11px] text-ink focus:border-accent focus:outline-none"
                aria-label="Denominator coefficients"
              />
            </label>
            <label className="mt-2 block">
              <span className="mb-1 block text-[10px] text-body-mid">
                P (open-loop RHP poles, optional override)
              </span>
              <input
                type="number"
                min={0}
                step={1}
                value={pOverride}
                onChange={(e) =>
                  setPOverride(
                    e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0)
                  )
                }
                placeholder={`auto: ${P_computed}`}
                className="w-full rounded-sm border border-hairline bg-canvas px-2 py-1.5 font-mono text-[11px] text-ink focus:border-accent focus:outline-none"
                aria-label="Open-loop RHP pole count override"
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

          {/* Encirclements + stability */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Nyquist criterion: Z = P − N
            </div>
            <ReadoutRow label="P (RHP poles of L)" value={`${P}`} />
            <ReadoutRow
              label="N (CW encirclements of −1)"
              value={`${N_enc}`}
            />
            <ReadoutRow
              label="Z (RHP closed-loop poles)"
              value={`${Z}`}
              warn={Z > 0}
              good={Z === 0}
            />
            <div className="my-2 border-t border-hairline" />
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-body-mid">Stability</span>
              <span
                className={`ee-mono text-[12px] font-semibold ${
                  stable ? 'text-accent' : 'text-error'
                }`}
              >
                {stable ? 'Stable (Z = 0)' : `Unstable (Z = ${Z})`}
              </span>
            </div>
          </div>

          {/* Margins */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Margins
            </div>
            {margins.pm !== null ? (
              <>
                <ReadoutRow
                  label="Phase margin"
                  value={`${margins.pm.toFixed(1)}°`}
                  good={margins.pm > 45}
                  warn={margins.pm > 0 && margins.pm <= 45}
                />
                <ReadoutRow
                  label="@ ωc"
                  value={`${(margins.pmOmega ?? 0).toFixed(3)} rad/s`}
                />
              </>
            ) : (
              <div className="text-[10px] text-body-mid">
                No gain crossover (|L| ≠ 1 on plot range).
              </div>
            )}
            {margins.gm !== null ? (
              <>
                <div className="my-2 border-t border-hairline" />
                <ReadoutRow
                  label="Gain margin"
                  value={`${(margins.gmDb ?? 0).toFixed(2)} dB`}
                  good={(margins.gmDb ?? 0) > 6}
                  warn={
                    (margins.gmDb ?? 0) > 0 && (margins.gmDb ?? 0) <= 6
                  }
                />
                <ReadoutRow
                  label="(linear)"
                  value={`${(margins.gm ?? 0).toFixed(3)}`}
                />
                <ReadoutRow
                  label="@ ω₁₈₀"
                  value={`${(margins.gmOmega ?? 0).toFixed(3)} rad/s`}
                />
              </>
            ) : (
              <div className="mt-1 text-[10px] text-body-mid">
                No phase crossover (∠L ≠ −180° on plot range) → gain margin is ∞.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hint footer */}
      <div className="flex items-start gap-2 border-t border-hairline bg-canvas-soft px-3 py-2 text-[10px] text-body-mid">
        <Radio className="mt-0.5 h-3 w-3 shrink-0 text-accent" aria-hidden />
        <p>
          The Nyquist criterion: <span className="ee-mono text-accent">Z = P − N</span>,
          where P is the number of open-loop RHP poles, N is the net clockwise
          encirclements of the −1 point (red ✕), and Z is the number of
          closed-loop RHP poles. The closed loop is stable iff Z = 0. The
          positive-ω half (solid green) is mirrored across the real axis by
          the negative-ω half (dashed).
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
    <div className="flex items-baseline justify-between text-[11px]">
      <dt className="text-body-mid">{label}</dt>
      <dd
        className={
          'ee-mono ' +
          (warn ? 'text-error' : good ? 'text-accent' : 'text-ink')
        }
      >
        {value}
      </dd>
    </div>
  );
}

export default NyquistPlot;
