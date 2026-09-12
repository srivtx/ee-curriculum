'use client';

import * as React from 'react';
import { Waves, Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Types ──────────────────────────────────────────────────────────────────
interface Phasor {
  mag: number; // volts, 1..100
  phase: number; // degrees, 0..360
  color: string;
  label: string;
}

// ── Layout constants ───────────────────────────────────────────────────────
const PLOT_SIZE = 320; // phasor SVG width/height
const ORIGIN = PLOT_SIZE / 2;
const PLOT_RADIUS = PLOT_SIZE / 2 - 28; // leave room for axis labels
// 100 V maps to PLOT_RADIUS pixels
const V_PER_PX = 100 / PLOT_RADIUS;

const WAVE_W = 720;
const WAVE_H = 160;
const WAVE_T_SPAN = 2; // seconds shown on the time axis

// ── Helpers ────────────────────────────────────────────────────────────────
const DEG = Math.PI / 180;

function fmtComplex(re: number, im: number): string {
  const sign = im >= 0 ? '+' : '−';
  return `${re.toFixed(2)} ${sign} j${Math.abs(im).toFixed(2)}`;
}

// ── Component ──────────────────────────────────────────────────────────────
export interface PhasorDiagramProps {
  lessonTitle?: string;
}

const DEFAULT_PHASORS: Phasor[] = [
  { mag: 60, phase: 0,   color: '#7FFF9F', label: 'V₁' },
  { mag: 40, phase: 90,  color: '#FFB347', label: 'V₂' },
  { mag: 30, phase: 220, color: '#A0C3EC', label: 'V₃' },
];

export function PhasorDiagram({ lessonTitle }: PhasorDiagramProps) {
  const headerTitle = lessonTitle ?? 'Interactive Phasor Diagram';

  const [phasors, setPhasors] = React.useState<Phasor[]>(DEFAULT_PHASORS);
  const [rotHz, setRotHz] = React.useState(0.5);
  const [running, setRunning] = React.useState(true);
  const [t, setT] = React.useState(0); // animation time (s)

  // Reset to defaults
  const resetAll = () => {
    setPhasors(DEFAULT_PHASORS);
    setRotHz(0.5);
    setT(0);
  };

  // ── Animation loop ───────────────────────────────────────────────────────
  const rafRef = React.useRef<number | null>(null);
  const lastTsRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (!running) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
      return;
    }
    const tick = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setT((prev) => prev + dt);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [running]);

  // ── Compute the resultant phasor ─────────────────────────────────────────
  // V_k(t) = |V_k| · e^{j(ω·t + φ_k)}; the sum is at the same ω.
  const omega = 2 * Math.PI * rotHz;
  const { sumRe, sumIm, sumMag, sumAngDeg } = React.useMemo(() => {
    let re = 0;
    let im = 0;
    for (const p of phasors) {
      re += p.mag * Math.cos((p.phase + 0) * DEG);
      im += p.mag * Math.sin((p.phase + 0) * DEG);
    }
    return {
      sumRe: re,
      sumIm: im,
      sumMag: Math.hypot(re, im),
      sumAngDeg: (Math.atan2(im, re) / DEG),
    };
  }, [phasors]);

  // ── Phasor SVG render ────────────────────────────────────────────────────
  // Each phasor is drawn at its *current* angle = initialPhase + ω·t.
  // Phasors rotate CCW, so positive ω → angles increase with t.
  const angleNow = (phaseDeg: number) =>
    ((phaseDeg + (omega * t * 180) / Math.PI) % 360 + 360) % 360;

  // Compute screen coords of each phasor tip.
  const tips = phasors.map((p) => {
    const ang = angleNow(p.phase) * DEG;
    return {
      x: ORIGIN + (p.mag / V_PER_PX) * Math.cos(ang),
      y: ORIGIN - (p.mag / V_PER_PX) * Math.sin(ang), // SVG y is flipped
    };
  });

  // Resultant tip (sum at angleNow(sumAngDeg))
  const sumAngNow = angleNow(sumAngDeg);
  const sumTip = {
    x: ORIGIN + (sumMag / V_PER_PX) * Math.cos(sumAngNow * DEG),
    y: ORIGIN - (sumMag / V_PER_PX) * Math.sin(sumAngNow * DEG),
  };

  // ── Waveform SVG ─────────────────────────────────────────────────────────
  // Show V_k(t) = |V_k|·cos(ω·t + φ_k) over t ∈ [0, WAVE_T_SPAN].
  // But since the phasors rotate at ω, the *waveform* phase also advances with
  // the live `t`. To show a meaningful scrolling waveform, we plot the signal
  // as a function of τ (the x-axis variable) where the actual time is t+τ.
  // That way the waveform appears to scroll leftward (CCW phasors → wave
  // moves left → standard).
  const waveformPts = React.useMemo(() => {
    const out: { color: string; label: string; pts: string }[] = [];
    const N = 240;
    const yMid = WAVE_H / 2;
    const yScale = (WAVE_H / 2 - 10) / 100; // 100 V → top
    for (const p of phasors) {
      const pts: string[] = [];
      for (let i = 0; i <= N; i++) {
        const tau = (i / N) * WAVE_T_SPAN;
        const v = p.mag * Math.cos(omega * (t + tau) + p.phase * DEG);
        const x = (i / N) * WAVE_W;
        const y = yMid - v * yScale;
        pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
      }
      out.push({ color: p.color, label: p.label, pts: pts.join(' ') });
    }
    // Sum
    const sumPts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const tau = (i / N) * WAVE_T_SPAN;
      let v = 0;
      for (const p of phasors) {
        v += p.mag * Math.cos(omega * (t + tau) + p.phase * DEG);
      }
      const x = (i / N) * WAVE_W;
      const y = yMid - v * yScale;
      sumPts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    out.push({
      color: '#FF6B6B',
      label: 'V_sum',
      pts: sumPts.join(' '),
    });
    return out;
  }, [phasors, omega, t]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas-card">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Waves className="h-4 w-4 text-accent" aria-hidden />
        <span className="eyebrow text-[11px] text-accent">{headerTitle}</span>
        <span className="ml-auto ee-mono text-[10px] text-body-mid">
          ω = 2π·{rotHz.toFixed(2)} Hz · t = {t.toFixed(2)} s
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-[340px_1fr]">
        {/* Phasor SVG */}
        <div className="flex flex-col items-center">
          <svg
            viewBox={`0 0 ${PLOT_SIZE} ${PLOT_SIZE}`}
            className="h-auto w-full max-w-[340px]"
            role="img"
            aria-label="Phasor diagram"
          >
            {/* Concentric grid circles */}
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <circle
                key={f}
                cx={ORIGIN}
                cy={ORIGIN}
                r={PLOT_RADIUS * f}
                fill="none"
                stroke="var(--hairline)"
                strokeWidth={1}
                strokeDasharray={f === 1 ? 'none' : '2 3'}
              />
            ))}
            {/* Axes */}
            <line
              x1={ORIGIN - PLOT_RADIUS}
              y1={ORIGIN}
              x2={ORIGIN + PLOT_RADIUS}
              y2={ORIGIN}
              stroke="var(--body-mid)"
              strokeWidth={1}
              opacity={0.4}
            />
            <line
              x1={ORIGIN}
              y1={ORIGIN - PLOT_RADIUS}
              x2={ORIGIN}
              y2={ORIGIN + PLOT_RADIUS}
              stroke="var(--body-mid)"
              strokeWidth={1}
              opacity={0.4}
            />
            {/* Axis labels */}
            <text
              x={ORIGIN + PLOT_RADIUS + 4}
              y={ORIGIN + 3}
              fill="var(--body-mid)"
              fontSize={9}
              fontFamily="var(--font-mono)"
            >
              0°
            </text>
            <text
              x={ORIGIN - 4}
              y={ORIGIN - PLOT_RADIUS - 4}
              fill="var(--body-mid)"
              fontSize={9}
              fontFamily="var(--font-mono)"
              textAnchor="end"
            >
              90°
            </text>
            <text
              x={ORIGIN - PLOT_RADIUS - 4}
              y={ORIGIN + 3}
              fill="var(--body-mid)"
              fontSize={9}
              fontFamily="var(--font-mono)"
              textAnchor="end"
            >
              180°
            </text>
            <text
              x={ORIGIN + 4}
              y={ORIGIN + PLOT_RADIUS + 10}
              fill="var(--body-mid)"
              fontSize={9}
              fontFamily="var(--font-mono)"
            >
              270°
            </text>
            {/* 100 V scale tick */}
            <text
              x={ORIGIN + PLOT_RADIUS - 4}
              y={ORIGIN - 4}
              fill="var(--body-mid)"
              fontSize={8}
              fontFamily="var(--font-mono)"
              textAnchor="end"
            >
              100 V
            </text>

            {/* Phasor arrows */}
            {phasors.map((p, i) => (
              <PhasorArrow
                key={i}
                x2={tips[i].x}
                y2={tips[i].y}
                color={p.color}
                label={p.label}
              />
            ))}
            {/* Sum arrow (dashed) */}
            <PhasorArrow
              x2={sumTip.x}
              y2={sumTip.y}
              color="#FF6B6B"
              label="Σ"
              dashed
              thick
            />
            {/* Origin dot */}
            <circle
              cx={ORIGIN}
              cy={ORIGIN}
              r={2.5}
              fill="var(--ink)"
            />
          </svg>

          {/* Animation controls */}
          <div className="mt-2 w-full rounded-sm border border-hairline bg-canvas-soft p-2">
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={running ? 'outline' : 'default'}
                onClick={() => setRunning((r) => !r)}
                className="h-7 gap-1 text-[11px]"
              >
                {running ? (
                  <>
                    <Pause className="h-3 w-3" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" /> Play
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetAll}
                className="h-7 gap-1 text-[11px]"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
            </div>
            <label className="mt-2 block">
              <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
                <span>Rotation speed</span>
                <span className="ee-mono text-accent">
                  {rotHz.toFixed(2)} Hz
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={5}
                step={0.05}
                value={rotHz}
                onChange={(e) => setRotHz(parseFloat(e.target.value))}
                className="w-full accent-[color:var(--accent)]"
                aria-label="Rotation speed"
              />
            </label>
          </div>
        </div>

        {/* Right: waveforms + controls + readouts */}
        <div className="flex flex-col gap-3">
          {/* Waveform SVG */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-2">
            <div className="mb-1 flex items-center justify-between">
              <div className="eyebrow text-[10px] text-body-mid">
                Time domain · v(t) = Re{`{Ve^(jωt)}`}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[9px]">
                {phasors.map((p) => (
                  <span
                    key={p.label}
                    className="ee-mono"
                    style={{ color: p.color }}
                  >
                    ━ {p.label}
                  </span>
                ))}
                <span className="ee-mono" style={{ color: '#FF6B6B' }}>
                  ━ Σ (sum)
                </span>
              </div>
            </div>
            <svg
              viewBox={`0 0 ${WAVE_W} ${WAVE_H}`}
              className="h-auto w-full"
              role="img"
              aria-label="Time-domain waveforms"
              preserveAspectRatio="none"
            >
              {/* Zero line */}
              <line
                x1={0}
                y1={WAVE_H / 2}
                x2={WAVE_W}
                y2={WAVE_H / 2}
                stroke="var(--body-mid)"
                strokeWidth={0.5}
                opacity={0.4}
              />
              {/* ±100 V gridlines */}
              {[-100, 100].map((v) => {
                const y = WAVE_H / 2 - v * ((WAVE_H / 2 - 10) / 100);
                return (
                  <g key={v}>
                    <line
                      x1={0}
                      y1={y}
                      x2={WAVE_W}
                      y2={y}
                      stroke="var(--hairline)"
                      strokeWidth={0.5}
                      strokeDasharray="2 3"
                    />
                    <text
                      x={4}
                      y={y - 2}
                      fill="var(--body-mid)"
                      fontSize={8}
                      fontFamily="var(--font-mono)"
                    >
                      {v} V
                    </text>
                  </g>
                );
              })}
              {/* Waveforms */}
              {waveformPts.map((w, i) => (
                <path
                  key={i}
                  d={w.pts}
                  fill="none"
                  stroke={w.color}
                  strokeWidth={i === waveformPts.length - 1 ? 2 : 1.4}
                  opacity={i === waveformPts.length - 1 ? 1 : 0.85}
                />
              ))}
            </svg>
            <div className="mt-1 flex justify-between text-[9px] text-body-mid ee-mono">
              <span>0 s</span>
              <span>{WAVE_T_SPAN / 2} s</span>
              <span>{WAVE_T_SPAN} s</span>
            </div>
          </div>

          {/* Per-phasor controls */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {phasors.map((p, i) => (
              <div
                key={i}
                className="rounded-sm border border-hairline bg-canvas-soft p-2"
              >
                <div className="mb-1 flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                    aria-hidden
                  />
                  <span className="text-[11px] font-medium text-ink">
                    {p.label}
                  </span>
                  <span className="ml-auto ee-mono text-[10px] text-body-mid">
                    {angleNow(p.phase).toFixed(0)}°
                  </span>
                </div>
                <label className="block">
                  <div className="mb-0.5 flex items-baseline justify-between text-[9px] text-body-mid">
                    <span>|V|</span>
                    <span className="ee-mono text-ink">
                      {p.mag.toFixed(1)} V
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    step={0.5}
                    value={p.mag}
                    onChange={(e) =>
                      setPhasors((prev) =>
                        prev.map((q, j) =>
                          j === i ? { ...q, mag: parseFloat(e.target.value) } : q
                        )
                      )
                    }
                    className="w-full accent-[color:var(--accent)]"
                    aria-label={`${p.label} magnitude`}
                  />
                </label>
                <label className="mt-1 block">
                  <div className="mb-0.5 flex items-baseline justify-between text-[9px] text-body-mid">
                    <span>φ</span>
                    <span className="ee-mono text-ink">
                      {p.phase.toFixed(0)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={p.phase}
                    onChange={(e) =>
                      setPhasors((prev) =>
                        prev.map((q, j) =>
                          j === i
                            ? { ...q, phase: parseFloat(e.target.value) }
                            : q
                        )
                      )
                    }
                    className="w-full accent-[color:var(--accent)]"
                    aria-label={`${p.label} phase`}
                  />
                </label>
              </div>
            ))}
          </div>

          {/* Readouts */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Resultant V_sum
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] sm:grid-cols-4">
              <Readout label="|V_sum|" value={`${sumMag.toFixed(2)} V`} accent />
              <Readout
                label="∠V_sum"
                value={`${((sumAngDeg + 360) % 360).toFixed(1)}°`}
              />
              <Readout
                label="Real"
                value={`${sumRe.toFixed(2)} V`}
              />
              <Readout
                label="Imag"
                value={`${sumIm.toFixed(2)} V`}
              />
            </div>
            <div className="mt-2 border-t border-hairline pt-2 text-[11px]">
              <span className="text-body-mid">Rectangular: </span>
              <span className="ee-mono text-accent">
                {fmtComplex(sumRe, sumIm)} V
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-hairline bg-canvas-soft px-3 py-2 text-[10px] text-body-mid">
        Phasors rotate counterclockwise at ω = 2π·f rad/s. The time-domain
        waveforms below are the real parts of each rotating phasor —
        v_k(t) = |V_k|·cos(ωt + φ_k). The red dashed arrow (and red waveform)
        is the vector sum V₁ + V₂ + V₃.
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-body-mid">{label}</span>
      <span className={'ee-mono ' + (accent ? 'text-accent' : 'text-ink')}>
        {value}
      </span>
    </div>
  );
}

/** A phasor arrow from origin to (x2, y2), with a label near the tip. */
function PhasorArrow({
  x2,
  y2,
  color,
  label,
  dashed,
  thick,
}: {
  x2: number;
  y2: number;
  color: string;
  label: string;
  dashed?: boolean;
  thick?: boolean;
}) {
  // Arrowhead: 8 px long, 28° spread, at the tip pointing along the vector.
  const dx = x2 - ORIGIN;
  const dy = y2 - ORIGIN;
  const len = Math.hypot(dx, dy);
  if (len < 1) return null;
  const ux = dx / len;
  const uy = dy / len;
  // Perpendicular
  const px = -uy;
  const py = ux;
  const ahLen = thick ? 10 : 7;
  const ahW = ahLen * 0.45;
  const tipBack = { x: x2 - ux * ahLen, y: y2 - uy * ahLen };
  const ah1 = { x: tipBack.x + px * ahW, y: tipBack.y + py * ahW };
  const ah2 = { x: tipBack.x - px * ahW, y: tipBack.y - py * ahW };

  // Label position: just past the tip
  const lblX = x2 + ux * 6;
  const lblY = y2 + uy * 6;

  return (
    <g>
      <line
        x1={ORIGIN}
        y1={ORIGIN}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={thick ? 2.5 : 1.8}
        strokeDasharray={dashed ? '5 3' : undefined}
        strokeLinecap="round"
      />
      <polygon
        points={`${x2},${y2} ${ah1.x},${ah1.y} ${ah2.x},${ah2.y}`}
        fill={color}
      />
      <text
        x={lblX}
        y={lblY}
        fill={color}
        fontSize={thick ? 12 : 11}
        fontFamily="var(--font-mono)"
        textAnchor="middle"
        dominantBaseline="middle"
        fontWeight={thick ? 700 : 500}
      >
        {label}
      </text>
    </g>
  );
}

export default PhasorDiagram;
