'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TransmissionLineSim — interactive transmission-line simulator.
//
// Phase 8 (RF) tool. Shows wave propagation, reflection, and the standing-wave
// pattern on a lossless transmission line of adjustable length (1–10
// wavelengths). Source on the left, load on the right. Adjustable source
// impedance Z_s, line impedance Z_0, load impedance Z_L, and frequency. A
// traveling wave is animated from source to load; on reaching the load a
// reflected wave (if Z_L ≠ Z_0) is generated. The voltage-magnitude-vs-
// position graph below shows the standing-wave envelope (white) with V_max
// and V_min markers, plus the live SWR and Γ readouts.
//
// Physics (lossless line):
//   Γ_L = (Z_L − Z_0) / (Z_L + Z_0)              (load reflection coefficient)
//   V(z, t) = V⁺·e^{j(ωt − βz)} + V⁻·e^{j(ωt + βz)}
//   |V(z)| = |V⁺|·|1 + Γ_L·e^{2jβz}|             (standing-wave envelope)
//   SWR = (1 + |Γ|) / (1 − |Γ|)
//   Z_in(d) = Z_0 · (Z_L + jZ_0 tan(βd)) / (Z_0 + jZ_L tan(βd))
//
// All rendering is pure SVG for performance (no Plotly).
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Types ───────────────────────────────────────────────────────────────────
interface Props {
  lessonTitle?: string;
  defaultZs?: number;
  defaultZ0?: number;
  defaultZl?: number;
  defaultFreq?: number; // MHz
  defaultLenWl?: number; // wavelengths
}

// ── Math helpers ─────────────────────────────────────────────────────────────
const c0 = 2.998e8; // speed of light in vacuum (m/s)
const vp = 2e8; // typical coax propagation velocity (~2c/3) (m/s)

/** Reflection coefficient Γ_L = (Z_L − Z_0) / (Z_L + Z_0). Returns complex. */
function gammaL(zlReal: number, z0: number): { re: number; im: number } {
  // Z_L is purely real in this tool (load is a resistor) → Γ is real.
  if (z0 <= 0) return { re: 0, im: 0 };
  const g = (zlReal - z0) / (zlReal + z0);
  return { re: g, im: 0 };
}

/** Standing-wave envelope magnitude along the line.
 *  V_env(d) = |V⁺| · |1 + Γ_L · e^{−2jβd}|, where d is distance from the load.
 *  Position is normalized so d = (1 − x_norm) · L_total, x_norm ∈ [0, 1]
 *  source→load. */
function envMag(
  xNorm: number,
  gamma: { re: number; im: number },
  beta: number,
  totalLen: number
): number {
  const d = (1 - xNorm) * totalLen; // distance from load
  const phase = -2 * beta * d;
  const cosP = Math.cos(phase);
  const sinP = Math.sin(phase);
  // 1 + Γ·e^{j·phase}  = (1 + Γ·cos) + j·Γ·sin
  const re = 1 + gamma.re * cosP - gamma.im * sinP;
  const im = gamma.re * sinP + gamma.im * cosP;
  return Math.hypot(re, im);
}

/** Input impedance at the source looking into the line (lossless, length L). */
function zIn(z0: number, zl: number, beta: number, len: number): number {
  const bl = beta * len;
  const t = Math.tan(bl);
  // Lossless Z_in = Z_0 · (Z_L + jZ_0 tan βL) / (Z_0 + jZ_L tan βL)
  // For real Z_L this is complex; return magnitude for display.
  const numRe = zl;
  const numIm = z0 * t;
  const denRe = z0;
  const denIm = zl * t;
  const d = denRe * denRe + denIm * denIm;
  const re = (numRe * denRe + numIm * denIm) / d;
  const im = (numIm * denRe - numRe * denIm) / d;
  return Math.hypot(re, im);
}

// ── Format helpers ──────────────────────────────────────────────────────────
function fmtFreq(mhz: number): string {
  if (mhz >= 1000) return `${(mhz / 1000).toFixed(2)} GHz`;
  return `${mhz.toFixed(0)} MHz`;
}

function fmtImp(ohms: number): string {
  if (ohms >= 1e3) return `${(ohms / 1e3).toFixed(2)} kΩ`;
  return `${ohms.toFixed(1)} Ω`;
}

function fmtLen(m: number): string {
  if (m >= 1) return `${m.toFixed(2)} m`;
  if (m >= 1e-2) return `${(m * 100).toFixed(1)} cm`;
  return `${(m * 1000).toFixed(1)} mm`;
}

// ── Constants for the SVG layout ────────────────────────────────────────────
const TL_W = 760;
const TL_H = 200;
const TL_PAD_X = 60;
const TL_PAD_Y = 50;
const GRAPH_W = 760;
const GRAPH_H = 220;
const GRAPH_PAD_X = 60;
const GRAPH_PAD_Y = 30;

export function TransmissionLineSim({
  lessonTitle,
  defaultZs = 50,
  defaultZ0 = 50,
  defaultZl = 100,
  defaultFreq = 1000, // 1 GHz
  defaultLenWl = 4,
}: Props) {
  const headerTitle = lessonTitle ?? 'Transmission Line Simulator';

  const [zs, setZs] = React.useState(defaultZs);
  const [z0, setZ0] = React.useState(defaultZ0);
  const [zl, setZl] = React.useState(defaultZl);
  const [freqMhz, setFreqMhz] = React.useState(defaultFreq);
  const [lenWl, setLenWl] = React.useState(defaultLenWl);
  const [playing, setPlaying] = React.useState(true);
  const [phase, setPhase] = React.useState(0); // animation phase [0, 2π)

  // Derived quantities.
  const freqHz = freqMhz * 1e6;
  const wavelength = vp / freqHz; // m
  const totalLen = lenWl * wavelength; // m
  const beta = (2 * Math.PI) / wavelength; // rad/m
  const gamma = gammaL(zl, z0);
  const gammaMag = Math.hypot(gamma.re, gamma.im);
  const gammaAngDeg = (Math.atan2(gamma.im, gamma.re) * 180) / Math.PI;
  const swr = (1 + gammaMag) / Math.max(1e-9, 1 - gammaMag);
  const zinMag = zIn(z0, zl, beta, totalLen);
  const matched = Math.abs(zl - z0) < 0.5;

  // Reset state when the lesson preset changes.
  React.useEffect(() => {
    setZs(defaultZs);
    setZ0(defaultZ0);
    setZl(defaultZl);
    setFreqMhz(defaultFreq);
    setLenWl(defaultLenWl);
  }, [defaultZs, defaultZ0, defaultZl, defaultFreq, defaultLenWl]);

  // Animation loop — drives the time-varying wave on the line.
  React.useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setPhase((p) => (p + dt * 2 * Math.PI * 0.6) % (2 * Math.PI));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // ── Build the SVG paths for the line animation ─────────────────────────────
  // The line runs from x = TL_PAD_X to x = TL_W - TL_PAD_X.
  const lineX0 = TL_PAD_X;
  const lineX1 = TL_W - TL_PAD_X;
  const lineY = TL_H / 2;
  const lineLen = lineX1 - lineX0;

  // We render the wave as a polyline of N samples across the line.
  // The incident wave V⁺(z, t) = cos(ωt − βz), traveling left→right.
  // The reflected wave V⁻(z, t) = |Γ|·cos(ωt + βz + ∠Γ), traveling right→left.
  // The total V(z, t) = V⁺ + V⁻ is what we draw (scaled to fit the canvas).
  // We also draw V⁺ and V⁻ separately (lighter strokes) for educational
  // clarity.
  const N = 200;
  const incidentPts: string[] = [];
  const reflectedPts: string[] = [];
  const totalPts: string[] = [];
  const ampPx = 32; // pixels of vertical amplitude for unit-magnitude wave

  for (let i = 0; i <= N; i++) {
    const xNorm = i / N;
    const x = lineX0 + xNorm * lineLen;
    // Position z in meters, measured from source (left).
    const z = xNorm * totalLen;
    // Incident: V⁺(z, t) = cos(ωt − βz). phase = ωt mod 2π.
    const vInc = Math.cos(phase - beta * z);
    // Reflected: V⁻(z, t) = |Γ|·cos(ωt + βz + ∠Γ). Phase at load (z=L)
    // is ωt + βL + ∠Γ — but ∠Γ is what we set as the phase shift at the
    // reflection point. For real Z_L, ∠Γ = 0 (Γ > 0) or π (Γ < 0).
    const reflPhase = phase + beta * z + gammaAngDeg * (Math.PI / 180);
    const vRef = gammaMag * Math.cos(reflPhase);
    const vTot = vInc + vRef;

    incidentPts.push(`${x.toFixed(2)},${(lineY - vInc * ampPx).toFixed(2)}`);
    reflectedPts.push(`${x.toFixed(2)},${(lineY - vRef * ampPx).toFixed(2)}`);
    totalPts.push(`${x.toFixed(2)},${(lineY - vTot * ampPx).toFixed(2)}`);
  }

  // ── Build the standing-wave envelope graph ────────────────────────────────
  // Plot |V(z)| from source (x=0) to load (x=L). Normalize so the max
  // possible is 1 + |Γ| (which we map to the top of the graph).
  const graphX0 = GRAPH_PAD_X;
  const graphX1 = GRAPH_W - GRAPH_PAD_X;
  const graphY0 = GRAPH_PAD_Y;
  const graphY1 = GRAPH_H - GRAPH_PAD_Y;
  const graphW = graphX1 - graphX0;
  const graphH = graphY1 - graphY0;
  const yMax = 1 + gammaMag + 0.05;

  const envPathPts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const xNorm = i / N;
    const x = graphX0 + xNorm * graphW;
    const mag = envMag(xNorm, gamma, beta, totalLen);
    const y = graphY1 - (mag / yMax) * graphH;
    envPathPts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  // Find V_max and V_min locations (for markers).
  let vMax = 0;
  let vMin = Infinity;
  let vMaxX = 0;
  let vMinX = 0;
  for (let i = 0; i <= N; i++) {
    const xNorm = i / N;
    const mag = envMag(xNorm, gamma, beta, totalLen);
    if (mag > vMax) {
      vMax = mag;
      vMaxX = xNorm;
    }
    if (mag < vMin) {
      vMin = mag;
      vMinX = xNorm;
    }
  }
  const vMaxPx = graphX0 + vMaxX * graphW;
  const vMinPx = graphX0 + vMinX * graphW;
  const vMaxY = graphY1 - (vMax / yMax) * graphH;
  const vMinY = graphY1 - (vMin / yMax) * graphH;

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas-card">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Radio className="h-4 w-4 text-accent" aria-hidden />
        <span className="eyebrow text-[11px] text-accent">{headerTitle}</span>
        <span className="ml-auto ee-mono text-[10px] text-body-mid">
          λ = {fmtLen(wavelength)} · L = {lenWl}λ = {fmtLen(totalLen)} · v_p ≈
          2c/3
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-[1fr_280px]">
        {/* Left: line animation + standing-wave graph */}
        <div className="flex flex-col gap-3">
          {/* ── Top-down line animation ──────────────────────────────────── */}
          <div>
            <div className="eyebrow mb-1 text-[10px] text-body-mid">
              Wave propagation (incident + reflected = total)
            </div>
            <svg
              viewBox={`0 0 ${TL_W} ${TL_H}`}
              className="w-full"
              style={{ background: 'var(--canvas-soft)' }}
              role="img"
              aria-label="Transmission line wave animation"
            >
              {/* Line conductor (the transmission line itself) */}
              <line
                x1={lineX0}
                y1={lineY}
                x2={lineX1}
                y2={lineY}
                stroke="var(--hairline)"
                strokeWidth={2}
              />

              {/* Tick marks every λ/4 for spatial reference */}
              {Array.from({ length: Math.floor(lenWl * 4) + 1 }).map((_, i) => {
                const x = lineX0 + (i / (lenWl * 4)) * lineLen;
                return (
                  <line
                    key={i}
                    x1={x}
                    y1={lineY - 4}
                    x2={x}
                    y2={lineY + 4}
                    stroke="var(--hairline)"
                    strokeWidth={1}
                  />
                );
              })}
              <text
                x={lineX0 + lineLen / 2}
                y={TL_H - 6}
                textAnchor="middle"
                fontSize={9}
                fill="var(--body-mid)"
                fontFamily="var(--font-mono)"
              >
                0 (source) ─────── {lenWl}λ = {fmtLen(totalLen)} (load) ───────→ z
              </text>

              {/* Source symbol on the left */}
              <g>
                <circle
                  cx={lineX0 - 18}
                  cy={lineY}
                  r={14}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={1.5}
                />
                <path
                  d={`M ${lineX0 - 24} ${lineY - 6} L ${lineX0 - 12} ${lineY}`}
                  stroke="var(--accent)"
                  strokeWidth={1.5}
                  fill="none"
                />
                <text
                  x={lineX0 - 18}
                  y={lineY - 22}
                  textAnchor="middle"
                  fontSize={9}
                  fill="var(--accent)"
                  fontFamily="var(--font-mono)"
                >
                  SRC
                </text>
                <text
                  x={lineX0 - 18}
                  y={lineY + 32}
                  textAnchor="middle"
                  fontSize={9}
                  fill="var(--body-mid)"
                  fontFamily="var(--font-mono)"
                >
                  Z_s={fmtImp(zs)}
                </text>
              </g>

              {/* Load symbol on the right (resistor zig-zag) */}
              <g>
                <path
                  d={`M ${lineX1 + 4} ${lineY} l 4 -6 l 6 12 l 6 -12 l 6 12 l 6 -12 l 4 6`}
                  stroke={matched ? 'var(--accent)' : 'var(--warning)'}
                  strokeWidth={1.5}
                  fill="none"
                />
                <line
                  x1={lineX1 + 38}
                  y1={lineY - 8}
                  x2={lineX1 + 38}
                  y2={lineY + 8}
                  stroke={matched ? 'var(--accent)' : 'var(--warning)'}
                  strokeWidth={2}
                />
                <text
                  x={lineX1 + 18}
                  y={lineY - 22}
                  textAnchor="middle"
                  fontSize={9}
                  fill={matched ? 'var(--accent)' : 'var(--warning)'}
                  fontFamily="var(--font-mono)"
                >
                  LOAD
                </text>
                <text
                  x={lineX1 + 18}
                  y={lineY + 32}
                  textAnchor="middle"
                  fontSize={9}
                  fill="var(--body-mid)"
                  fontFamily="var(--font-mono)"
                >
                  Z_L={fmtImp(zl)}
                </text>
              </g>

              {/* Incident wave (green) — traveling left→right */}
              {gammaMag > 0.001 && (
                <polyline
                  points={incidentPts.join(' ')}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={1}
                  strokeOpacity={0.45}
                />
              )}
              {/* Reflected wave (amber) — traveling right→left */}
              {gammaMag > 0.001 && (
                <polyline
                  points={reflectedPts.join(' ')}
                  fill="none"
                  stroke="var(--warning)"
                  strokeWidth={1}
                  strokeOpacity={0.5}
                />
              )}
              {/* Total wave (white) */}
              <polyline
                points={totalPts.join(' ')}
                fill="none"
                stroke="var(--ink)"
                strokeWidth={1.5}
              />
            </svg>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-body-mid">
              <span className="flex items-center gap-1">
                <span
                  className="inline-block h-2 w-3"
                  style={{ background: 'var(--accent)', opacity: 0.6 }}
                />
                incident V⁺
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="inline-block h-2 w-3"
                  style={{ background: 'var(--warning)', opacity: 0.6 }}
                />
                reflected V⁻
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="inline-block h-2 w-3"
                  style={{ background: 'var(--ink)' }}
                />
                total V
              </span>
            </div>
          </div>

          {/* ── Standing-wave envelope graph ─────────────────────────────── */}
          <div>
            <div className="eyebrow mb-1 text-[10px] text-body-mid">
              |V(z)| standing-wave envelope
            </div>
            <svg
              viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`}
              className="w-full"
              style={{ background: 'var(--canvas-soft)' }}
              role="img"
              aria-label="Voltage magnitude vs position"
            >
              {/* Axes */}
              <line
                x1={graphX0}
                y1={graphY0}
                x2={graphX0}
                y2={graphY1}
                stroke="var(--hairline)"
                strokeWidth={1}
              />
              <line
                x1={graphX0}
                y1={graphY1}
                x2={graphX1}
                y2={graphY1}
                stroke="var(--hairline)"
                strokeWidth={1}
              />

              {/* Gridlines (horizontal) */}
              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  x1={graphX0}
                  y1={graphY1 - f * graphH}
                  x2={graphX1}
                  y2={graphY1 - f * graphH}
                  stroke="var(--hairline)"
                  strokeWidth={0.5}
                  strokeOpacity={0.4}
                  strokeDasharray="2 4"
                />
              ))}

              {/* Y-axis labels */}
              <text
                x={graphX0 - 6}
                y={graphY0 + 4}
                textAnchor="end"
                fontSize={9}
                fill="var(--body-mid)"
                fontFamily="var(--font-mono)"
              >
                {yMax.toFixed(2)}
              </text>
              <text
                x={graphX0 - 6}
                y={graphY1 + 3}
                textAnchor="end"
                fontSize={9}
                fill="var(--body-mid)"
                fontFamily="var(--font-mono)"
              >
                0
              </text>

              {/* X-axis labels */}
              <text
                x={graphX0}
                y={graphY1 + 14}
                textAnchor="middle"
                fontSize={9}
                fill="var(--body-mid)"
                fontFamily="var(--font-mono)"
              >
                src
              </text>
              <text
                x={graphX1}
                y={graphY1 + 14}
                textAnchor="middle"
                fontSize={9}
                fill="var(--body-mid)"
                fontFamily="var(--font-mono)"
              >
                load
              </text>

              {/* Envelope (white) */}
              <polyline
                points={envPathPts.join(' ')}
                fill="none"
                stroke="var(--ink)"
                strokeWidth={1.5}
              />

              {/* V_max marker (green) */}
              <line
                x1={vMaxPx}
                y1={graphY1}
                x2={vMaxPx}
                y2={vMaxY}
                stroke="var(--accent)"
                strokeWidth={1}
                strokeDasharray="3 3"
                strokeOpacity={0.6}
              />
              <circle
                cx={vMaxPx}
                cy={vMaxY}
                r={3}
                fill="var(--accent)"
              />
              <text
                x={vMaxPx}
                y={vMaxY - 6}
                textAnchor="middle"
                fontSize={9}
                fill="var(--accent)"
                fontFamily="var(--font-mono)"
              >
                V_max={vMax.toFixed(2)}
              </text>

              {/* V_min marker (amber) */}
              {vMin < vMax - 0.01 && (
                <>
                  <line
                    x1={vMinPx}
                    y1={graphY1}
                    x2={vMinPx}
                    y2={vMinY}
                    stroke="var(--warning)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    strokeOpacity={0.6}
                  />
                  <circle
                    cx={vMinPx}
                    cy={vMinY}
                    r={3}
                    fill="var(--warning)"
                  />
                  <text
                    x={vMinPx}
                    y={vMinY + 14}
                    textAnchor="middle"
                    fontSize={9}
                    fill="var(--warning)"
                    fontFamily="var(--font-mono)"
                  >
                    V_min={vMin.toFixed(2)}
                  </text>
                </>
              )}
            </svg>
            <p className="mt-1 text-[10px] text-body-mid">
              SWR = V_max / V_min ={' '}
              <span className="ee-mono text-accent">{swr.toFixed(3)}:1</span>.
              Distance between successive V_max (or V_min) peaks is λ/2.
            </p>
          </div>
        </div>

        {/* Right: controls + readouts */}
        <div className="flex flex-col gap-3">
          {/* Impedance sliders */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Impedances (Ω)
            </div>
            <ImpSlider label="Z_s (source)" value={zs} onChange={setZs} min={1} max={300} />
            <ImpSlider label="Z_0 (line)" value={z0} onChange={setZ0} min={10} max={150} />
            <ImpSlider label="Z_L (load)" value={zl} onChange={setZl} min={1} max={300} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setZs(50);
                  setZ0(50);
                  setZl(50);
                }}
                className="h-7 gap-1 text-[10px]"
              >
                Match Z_L=Z_0
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setZl(0);
                }}
                className="h-7 gap-1 text-[10px]"
              >
                Short
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setZl(1e6);
                }}
                className="h-7 gap-1 text-[10px]"
              >
                Open
              </Button>
            </div>
          </div>

          {/* Frequency + length sliders */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Frequency & line length
            </div>
            <label className="block">
              <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
                <span>Frequency</span>
                <span className="ee-mono text-accent">
                  {fmtFreq(freqMhz)}
                </span>
              </div>
              <input
                type="range"
                min={Math.log10(100)}
                max={Math.log10(30000)}
                step={0.01}
                value={Math.log10(freqMhz)}
                onChange={(e) => setFreqMhz(Math.pow(10, parseFloat(e.target.value)))}
                className="w-full accent-[color:var(--accent)]"
                aria-label="Frequency (log scale)"
              />
              <div className="mt-0.5 flex justify-between text-[9px] text-body-mid">
                <span>100 MHz</span>
                <span>10 GHz</span>
                <span>30 GHz</span>
              </div>
            </label>
            <label className="mt-2 block">
              <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
                <span>Line length</span>
                <span className="ee-mono text-ink">
                  {lenWl.toFixed(1)} λ
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={lenWl}
                onChange={(e) => setLenWl(parseFloat(e.target.value))}
                className="w-full accent-[color:var(--accent)]"
                aria-label="Line length (wavelengths)"
              />
            </label>
          </div>

          {/* Playback */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Animation
            </div>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPlaying((p) => !p)}
                className="h-8 flex-1 gap-1.5 text-[11px]"
              >
                {playing ? (
                  <>
                    <Pause className="h-3.5 w-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" /> Play
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPhase(0)}
                className="h-8 gap-1.5 text-[11px]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Readouts */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Readouts
            </div>
            <dl className="space-y-1.5 text-[11px]">
              <ReadoutRow
                label="|Γ| (load)"
                value={gammaMag.toFixed(3)}
                good={gammaMag < 0.1}
                warn={gammaMag > 0.5}
              />
              <ReadoutRow
                label="∠Γ"
                value={`${gammaAngDeg.toFixed(1)}°`}
              />
              <ReadoutRow
                label="SWR"
                value={`${swr.toFixed(3)} : 1`}
                good={swr < 1.5}
                warn={swr > 3}
              />
              <ReadoutRow
                label="Return loss"
                value={
                  gammaMag < 1e-6
                    ? '∞ dB'
                    : `${(-20 * Math.log10(gammaMag)).toFixed(2)} dB`
                }
                good={gammaMag < 0.1}
                warn={gammaMag > 0.5}
              />
              <ReadoutRow
                label="V_max"
                value={vMax.toFixed(3)}
              />
              <ReadoutRow
                label="V_min"
                value={vMin.toFixed(3)}
              />
              <ReadoutRow
                label="|Z_in|"
                value={fmtImp(zinMag)}
              />
            </dl>
            <div
              className={
                'mt-2 rounded-sm border px-2 py-1.5 text-[10px] ' +
                (matched
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-warning/40 bg-warning/10 text-warning')
              }
            >
              {matched
                ? '✓ Matched — Z_L = Z_0. No reflection. SWR = 1:1.'
                : `⚠ Mismatched — ${gammaMag > 0.99 ? 'total reflection' : 'partial reflection'}. SWR > 1.`}
            </div>
          </div>
        </div>
      </div>

      {/* Hint footer */}
      <div className="flex items-start gap-2 border-t border-hairline bg-canvas-soft px-3 py-2 text-[10px] text-body-mid">
        <Activity className="mt-0.5 h-3 w-3 shrink-0 text-accent" aria-hidden />
        <p>
          Try <span className="text-accent">Short</span> (Z_L=0) or{' '}
          <span className="text-accent">Open</span> (Z_L=∞) — these give{' '}
          |Γ|=1 (total reflection) and SWR=∞, with the envelope touching zero
          at every λ/4. Then click <span className="text-accent">Match Z_L=Z_0</span>{' '}
          — the envelope flattens to 1.0 across the whole line and the
          reflected wave disappears.
        </p>
      </div>
    </div>
  );
}

// ── Small helper components ──────────────────────────────────────────────────
function ImpSlider({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
        <span>{label}</span>
        <span className="ee-mono text-ink">{value.toFixed(1)} Ω</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[color:var(--accent)]"
        aria-label={label}
      />
    </label>
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
