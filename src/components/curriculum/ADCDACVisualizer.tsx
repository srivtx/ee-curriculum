'use client';

import * as React from 'react';
import { Binary, AlertTriangle, Activity, AudioWaveform } from 'lucide-react';

// ── Layout constants ───────────────────────────────────────────────────────
const SVG_W = 720;
const SVG_H = 240;
const T_SPAN = 1; // seconds shown

// ── Bit-depth options ──────────────────────────────────────────────────────
const BIT_OPTIONS = [3, 4, 8, 12, 16] as const;
type BitDepth = (typeof BIT_OPTIONS)[number];

// ── Helpers ────────────────────────────────────────────────────────────────
const A_AMP = 1; // signal amplitude (V), full-scale ±1 V

function quantize(value: number, bits: BitDepth): number {
  // Map value (in [-A, +A]) to one of 2^bits levels, then back.
  const levels = Math.pow(2, bits);
  const step = (2 * A_AMP) / levels;
  const normalized = (value + A_AMP) / step; // 0..levels
  const qIdx = Math.max(0, Math.min(levels - 1, Math.round(normalized - 0.5)));
  // Mid-tread quantizer: code qIdx → level (-A + (qIdx + 0.5) * step)
  return -A_AMP + (qIdx + 0.5) * step;
}

function quantStep(bits: BitDepth): number {
  return (2 * A_AMP) / Math.pow(2, bits);
}

function snrDb(bits: BitDepth): number {
  // Ideal N-bit quantization SNR = 6.02 N + 1.76 dB
  return 6.02 * bits + 1.76;
}

/** Compute the aliased frequency (Hz) for a signal of f_sig sampled at f_s. */
function aliasedFreq(fSig: number, fS: number): number {
  if (fS <= 0) return 0;
  if (fSig <= fS / 2) return fSig; // no aliasing
  // Find the k that minimizes |f_sig - k*f_s|
  const k = Math.max(1, Math.round(fSig / fS));
  return Math.abs(fSig - k * fS);
}

// ── Component ──────────────────────────────────────────────────────────────
export interface ADCDACVisualizerProps {
  lessonTitle?: string;
}

export function ADCDACVisualizer({ lessonTitle }: ADCDACVisualizerProps) {
  const headerTitle = lessonTitle ?? 'ADC / DAC Sampling Visualizer';

  // Controls
  const [sigFreq, setSigFreq] = React.useState(3); // Hz, 1..20
  const [sampleRate, setSampleRate] = React.useState(50); // S/s, 10..200
  const [bits, setBits] = React.useState<BitDepth>(4);

  // Derived
  const nyquist = sampleRate / 2;
  const isAliasing = sigFreq > nyquist;
  const fAlias = aliasedFreq(sigFreq, sampleRate);
  const qStep = quantStep(bits);
  const snr = snrDb(bits);

  // Y mapping (signal ±1 V → SVG y)
  const padY = 12;
  const yMid = SVG_H / 2;
  const yScale = (SVG_H / 2 - padY) / A_AMP;
  const yForV = (v: number) => yMid - v * yScale;

  // X mapping (t in [0, T_SPAN] → SVG x)
  const padX = 4;
  const xForT = (t: number) => padX + (t / T_SPAN) * (SVG_W - 2 * padX);

  // ── Continuous analog signal (sine) ──────────────────────────────────────
  const analogPath = React.useMemo(() => {
    const N = 400;
    const pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * T_SPAN;
      const v = A_AMP * Math.sin(2 * Math.PI * sigFreq * t);
      pts.push(`${i === 0 ? 'M' : 'L'} ${xForT(t).toFixed(1)} ${yForV(v).toFixed(1)}`);
    }
    return pts.join(' ');
  }, [sigFreq]);

  // ── Sample points ────────────────────────────────────────────────────────
  const samples = React.useMemo(() => {
    const list: { t: number; v: number; q: number }[] = [];
    const N = Math.round(sampleRate * T_SPAN);
    for (let i = 0; i <= N; i++) {
      const t = i / sampleRate;
      if (t > T_SPAN) break;
      const v = A_AMP * Math.sin(2 * Math.PI * sigFreq * t);
      list.push({ t, v, q: quantize(v, bits) });
    }
    return list;
  }, [sigFreq, sampleRate, bits]);

  // ── DAC staircase reconstruction ─────────────────────────────────────────
  // Zero-order hold: each sample's quantized value held until the next sample.
  const dacPath = React.useMemo(() => {
    if (samples.length === 0) return '';
    const pts: string[] = [];
    samples.forEach((s, i) => {
      const x = xForT(s.t);
      const y = yForV(s.q);
      if (i === 0) {
        pts.push(`M ${x.toFixed(1)} ${y.toFixed(1)}`);
      } else {
        // Horizontal step from previous x to this x at previous y
        const prevY = yForV(samples[i - 1].q);
        pts.push(`L ${x.toFixed(1)} ${prevY.toFixed(1)}`);
        pts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
      }
    });
    // Extend to the right edge
    const lastY = yForV(samples[samples.length - 1].q);
    pts.push(`L ${SVG_W - padX} ${lastY.toFixed(1)}`);
    return pts.join(' ');
  }, [samples]);

  // ── Aliased reconstruction (the apparent signal after sampling) ───────────
  // When aliasing occurs, draw the apparent sine at fAlias in red so the user
  // sees what the reconstructed signal "looks like" to the digital system.
  const aliasedPath = React.useMemo(() => {
    if (!isAliasing) return '';
    const N = 400;
    const pts: string[] = [];
    // Pick a starting phase that matches the analog signal at t=0.
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * T_SPAN;
      // The aliased signal has frequency fAlias and matches the original at
      // each sample instant. Approximate by sampling phase = 2π·f_sig·t mod 2π,
      // then re-mapping onto fAlias.
      const phaseSig = (2 * Math.PI * sigFreq * t) % (2 * Math.PI);
      // Aliased phase = ±2π·f_alias·t; pick the sign such that it tracks
      // the sample points.
      const phaseAlias =
        (2 * Math.PI * fAlias * t) % (2 * Math.PI);
      // Use the sign that minimizes distance from phaseSig at sample instants.
      const sign = sigFreq > sampleRate / 2 && sigFreq < sampleRate ? -1 : 1;
      const v = A_AMP * Math.sin(sign * phaseAlias);
      // Align phase to match the original at t=0
      const vAligned = isAliasing
        ? A_AMP * Math.sin(sign * phaseAlias + phaseSig - sign * phaseAlias)
        : v;
      pts.push(`${i === 0 ? 'M' : 'L'} ${xForT(t).toFixed(1)} ${yForV(vAligned).toFixed(1)}`);
    }
    return pts.join(' ');
  }, [isAliasing, fAlias, sigFreq, sampleRate]);

  // ── Quantization-level gridlines (only when bit-depth is small enough to
  //    render without overcrowding) ────────────────────────────────────────
  const qLevels = React.useMemo(() => {
    const levels = Math.pow(2, bits);
    if (levels > 32) return []; // too many to render
    const step = (2 * A_AMP) / levels;
    const out: number[] = [];
    for (let i = 0; i < levels; i++) {
      out.push(-A_AMP + (i + 0.5) * step);
    }
    return out;
  }, [bits]);

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas-card">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Binary className="h-4 w-4 text-accent" aria-hidden />
        <span className="eyebrow text-[11px] text-accent">{headerTitle}</span>
        <span className="ml-auto ee-mono text-[10px] text-body-mid">
          {sampleRate} S/s · {bits}-bit
        </span>
      </div>

      {/* Aliasing banner */}
      {isAliasing && (
        <div className="flex items-center gap-2 border-b border-error/40 bg-error/10 px-3 py-2 text-[11px] text-error">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          <span>
            <span className="font-medium">Aliasing!</span> Signal frequency{' '}
            <span className="ee-mono">{sigFreq.toFixed(2)} Hz</span> exceeds the
            Nyquist frequency <span className="ee-mono">{nyquist.toFixed(2)} Hz</span>.
            The DAC reconstruction will appear as{' '}
            <span className="ee-mono">{fAlias.toFixed(2)} Hz</span> (red trace).
            Add an anti-alias filter before the ADC.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-[1fr_240px]">
        {/* Plot */}
        <div className="rounded-sm border border-hairline bg-canvas-soft p-2">
          <div className="mb-1 flex items-center justify-between">
            <div className="eyebrow text-[10px] text-body-mid">
              Analog signal · samples · DAC reconstruction
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[9px]">
              <span className="ee-mono" style={{ color: '#7FFF9F' }}>
                ━ analog
              </span>
              <span className="ee-mono" style={{ color: '#FFB347' }}>
                ━ DAC (ZOH)
              </span>
              <span className="ee-mono" style={{ color: '#A0C3EC' }}>
                • samples
              </span>
              {isAliasing && (
                <span className="ee-mono" style={{ color: '#FF6B6B' }}>
                  ━ aliased
                </span>
              )}
            </div>
          </div>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="h-auto w-full"
            role="img"
            aria-label="ADC/DAC sampling visualization"
            preserveAspectRatio="none"
          >
            {/* Zero line */}
            <line
              x1={0}
              y1={yMid}
              x2={SVG_W}
              y2={yMid}
              stroke="var(--body-mid)"
              strokeWidth={0.5}
              opacity={0.4}
            />
            {/* ±A gridlines */}
            {[-A_AMP, A_AMP].map((v) => (
              <g key={v}>
                <line
                  x1={0}
                  y1={yForV(v)}
                  x2={SVG_W}
                  y2={yForV(v)}
                  stroke="var(--hairline)"
                  strokeWidth={0.5}
                  strokeDasharray="2 3"
                />
                <text
                  x={4}
                  y={yForV(v) - 3}
                  fill="var(--body-mid)"
                  fontSize={9}
                  fontFamily="var(--font-mono)"
                >
                  {v > 0 ? '+' : ''}
                  {v.toFixed(1)} V
                </text>
              </g>
            ))}

            {/* Quantization level gridlines */}
            {qLevels.map((v, i) => (
              <line
                key={i}
                x1={0}
                y1={yForV(v)}
                x2={SVG_W}
                y2={yForV(v)}
                stroke="var(--hairline)"
                strokeWidth={0.4}
                opacity={0.5}
              />
            ))}

            {/* Continuous analog signal */}
            <path
              d={analogPath}
              fill="none"
              stroke="#7FFF9F"
              strokeWidth={1.8}
            />

            {/* Aliased reconstruction (red) */}
            {isAliasing && aliasedPath && (
              <path
                d={aliasedPath}
                fill="none"
                stroke="#FF6B6B"
                strokeWidth={1.4}
                strokeDasharray="4 3"
              />
            )}

            {/* DAC staircase reconstruction */}
            <path
              d={dacPath}
              fill="none"
              stroke="#FFB347"
              strokeWidth={1.6}
            />

            {/* Sample points + vertical stems to quantized level */}
            {samples.map((s, i) => (
              <g key={i}>
                {/* Stem from analog value to quantized value */}
                <line
                  x1={xForT(s.t)}
                  y1={yForV(s.v)}
                  x2={xForT(s.t)}
                  y2={yForV(s.q)}
                  stroke="var(--body-mid)"
                  strokeWidth={0.6}
                  opacity={0.5}
                />
                {/* Sample point at the analog value (blue dot) */}
                <circle
                  cx={xForT(s.t)}
                  cy={yForV(s.v)}
                  r={2.5}
                  fill="#A0C3EC"
                />
                {/* Quantized sample point (orange square) */}
                <rect
                  x={xForT(s.t) - 2}
                  y={yForV(s.q) - 2}
                  width={4}
                  height={4}
                  fill="#FFB347"
                />
              </g>
            ))}
          </svg>
          <div className="mt-1 flex justify-between text-[9px] text-body-mid ee-mono">
            <span>0 s</span>
            <span>{T_SPAN / 2} s</span>
            <span>{T_SPAN} s</span>
          </div>
        </div>

        {/* Right column: controls + readouts */}
        <div className="flex flex-col gap-3">
          {/* Controls */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Signal & sampling
            </div>
            <label className="block">
              <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
                <span>Signal frequency</span>
                <span className="ee-mono text-accent">{sigFreq.toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={0.1}
                value={sigFreq}
                onChange={(e) => setSigFreq(parseFloat(e.target.value))}
                className="w-full accent-[color:var(--accent)]"
                aria-label="Signal frequency"
              />
            </label>
            <label className="mt-2 block">
              <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
                <span>Sample rate f_s</span>
                <span className="ee-mono text-accent">
                  {sampleRate} S/s
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={200}
                step={1}
                value={sampleRate}
                onChange={(e) => setSampleRate(parseInt(e.target.value, 10))}
                className="w-full accent-[color:var(--accent)]"
                aria-label="Sample rate"
              />
            </label>
            <div className="mt-2">
              <div className="mb-1 text-[10px] text-body-mid">ADC resolution</div>
              <div
                className="grid grid-cols-5 gap-1"
                role="radiogroup"
                aria-label="Bit depth"
              >
                {BIT_OPTIONS.map((b) => {
                  const active = bits === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setBits(b)}
                      className={
                        'rounded border px-1 py-1.5 text-[10px] font-medium transition ' +
                        (active
                          ? 'border-accent bg-accent text-canvas'
                          : 'border-hairline bg-canvas text-body-mid hover:bg-canvas-mid hover:text-ink')
                      }
                    >
                      {b}-bit
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Readouts */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Sampling metrics
            </div>
            <dl className="space-y-1 text-[11px]">
              <ReadoutRow
                icon={<Activity className="h-3 w-3" />}
                label="Sample rate"
                value={`${sampleRate} S/s`}
              />
              <ReadoutRow
                label="Nyquist f_s/2"
                value={`${nyquist.toFixed(1)} Hz`}
                warn={isAliasing}
              />
              <ReadoutRow
                label="Signal freq"
                value={`${sigFreq.toFixed(2)} Hz`}
                warn={isAliasing}
              />
              <ReadoutRow
                icon={<AudioWaveform className="h-3 w-3" />}
                label="Quant step Δ"
                value={`${qStep < 1e-3 ? (qStep * 1e6).toFixed(2) + ' µV' : qStep < 1 ? (qStep * 1e3).toFixed(2) + ' mV' : qStep.toFixed(4) + ' V'}`}
              />
              <ReadoutRow
                label="Levels"
                value={`${Math.pow(2, bits).toLocaleString()}`}
              />
              <ReadoutRow
                label="Ideal SNR"
                value={`${snr.toFixed(2)} dB`}
                hint="6.02·N + 1.76 dB"
              />
              <ReadoutRow
                label="Period T_s"
                value={`${((1 / sampleRate) * 1000).toFixed(2)} ms`}
              />
              <ReadoutRow
                label="Samples / period"
                value={`${(sampleRate / sigFreq).toFixed(2)}`}
                warn={sampleRate / sigFreq < 2}
              />
              {isAliasing && (
                <ReadoutRow
                  icon={<AlertTriangle className="h-3 w-3" />}
                  label="Aliased at"
                  value={`${fAlias.toFixed(2)} Hz`}
                  warn
                />
              )}
            </dl>
          </div>

          {/* Visual indicator */}
          <div
            className={
              'rounded-sm border p-3 text-[11px] ' +
              (isAliasing
                ? 'border-error/40 bg-error/10 text-error'
                : 'border-accent/30 bg-accent/5 text-accent')
            }
          >
            <div className="eyebrow mb-1 text-[10px]">
              {isAliasing ? 'Aliasing' : 'Nyquist OK'}
            </div>
            <p className="leading-relaxed">
              {isAliasing
                ? `f_s < 2·f_sig → samples no longer capture the signal uniquely. The reconstruction aliases to ${fAlias.toFixed(2)} Hz.`
                : `f_s ≥ 2·f_sig → the signal can be reconstructed exactly (Shannon-Nyquist).`}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-hairline bg-canvas-soft px-3 py-2 text-[10px] text-body-mid">
        <span className="text-accent">Green:</span> continuous analog input.
        <span className="ml-2 text-accent">Blue dots:</span> sample points (the
        ADC reads the analog value at each tick).
        <span className="ml-2 text-accent">Orange squares & staircase:</span>{' '}
        quantized values held between samples (zero-order-hold DAC output).
        {isAliasing && (
          <>
            <span className="ml-2 text-error">Red dashed:</span> the apparent
            aliased signal the digital system actually sees.
          </>
        )}
      </div>
    </div>
  );
}

function ReadoutRow({
  icon,
  label,
  value,
  hint,
  warn,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  warn?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between">
        <dt className="flex items-center gap-1 text-body-mid">
          {icon}
          {label}
        </dt>
        <dd
          className={
            'ee-mono ' + (warn ? 'text-error' : 'text-ink')
          }
        >
          {value}
        </dd>
      </div>
      {hint && <div className="ee-mono text-[9px] text-body-mid">{hint}</div>}
    </div>
  );
}

export default ADCDACVisualizer;
