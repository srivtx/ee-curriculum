'use client';

import * as React from 'react';
import { Gauge, Lightbulb, Activity, Zap } from 'lucide-react';

// ── Layout constants ───────────────────────────────────────────────────────
const PWM_W = 720;
const PWM_H = 140;
const CUR_W = 720;
const CUR_H = 100;
const T_CYCLES = 4; // show 4 PWM cycles side-by-side

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtFreq(hz: number): string {
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(2)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(2)} kHz`;
  return `${hz.toFixed(1)} Hz`;
}
function fmtPeriod(hz: number): string {
  const T = 1 / hz;
  if (T >= 1) return `${T.toFixed(3)} s`;
  if (T >= 1e-3) return `${(T * 1e3).toFixed(2)} ms`;
  if (T >= 1e-6) return `${(T * 1e6).toFixed(2)} µs`;
  return `${(T * 1e9).toFixed(1)} ns`;
}

// ── Component ──────────────────────────────────────────────────────────────
export interface PWMVisualizerProps {
  lessonTitle?: string;
}

export function PWMVisualizer({ lessonTitle }: PWMVisualizerProps) {
  const headerTitle = lessonTitle ?? 'PWM Visualizer';

  // Sliders
  const [duty, setDuty] = React.useState(50); // %
  const [freqLog, setFreqLog] = React.useState(Math.log10(10000)); // 10 kHz
  const [amp, setAmp] = React.useState(12); // V

  const freq = Math.pow(10, freqLog);
  const period = 1 / freq;

  // Derived values
  const vAvg = (duty / 100) * amp;
  const vRms = amp * Math.sqrt(duty / 100);
  // Inductor current ripple (assume ΔI = (V_amp - V_load) * D * T / L with
  // V_load = V_avg, L = 100 µH, T = period). Just for visualization.
  const L = 100e-6;
  const onTime = (duty / 100) * period;
  const offTime = period - onTime;
  // During on: V_L = V_amp - V_avg; during off: V_L = 0 - V_avg.
  const slopeUp = onTime > 0 ? (amp - vAvg) / L : 0;
  const slopeDn = offTime > 0 ? (0 - vAvg) / L : 0;
  // Peak-to-peak ripple = slopeUp * onTime (positive) + slopeDn * offTime (negative, balanced)
  const iRipple = Math.abs(slopeUp * onTime);
  // Average inductor current — assume load R = 10 Ω, so I_avg = V_avg / R.
  const iAvg = vAvg / 10;

  // LED brightness: duty 0..100% → brightness 0..1, but with a gamma so dim
  // region is more visible. Duty < 10% → "dim" (we'll tint the label).
  const ledBrightness = Math.pow(duty / 100, 0.6);

  // ── Build PWM waveform path ──────────────────────────────────────────────
  // 4 cycles: each cycle is (W / 4) wide. Within a cycle, high for `duty`%
  // then low for the rest.
  const cycleW = PWM_W / T_CYCLES;
  const yHigh = 12;
  const yLow = PWM_H - 12;
  const yScale = (yLow - yHigh) / Math.max(1, 24); // 24 V → full height
  const yForV = (v: number) => yLow - v * yScale;

  const pwmPath = React.useMemo(() => {
    const pts: string[] = [];
    for (let c = 0; c < T_CYCLES; c++) {
      const x0 = c * cycleW;
      const xOn = x0 + (duty / 100) * cycleW;
      const xEnd = x0 + cycleW;
      if (c === 0) {
        // Start at low (or high if duty=100%)
        pts.push(`M ${x0} ${yForV(duty > 0 ? amp : 0)}`);
      }
      if (duty > 0) {
        // Rising edge at x0 (if we were low)
        pts.push(`L ${x0} ${yForV(amp)}`);
        pts.push(`L ${xOn} ${yForV(amp)}`);
      }
      if (duty < 100) {
        pts.push(`L ${xOn} ${yForV(0)}`);
        pts.push(`L ${xEnd} ${yForV(0)}`);
      }
    }
    return pts.join(' ');
  }, [duty, amp, cycleW, yForV]);

  // ── Inductor current (triangle wave) ─────────────────────────────────────
  // Current ramps up during on-time, ramps down during off-time. Centered on
  // iAvg with peak-to-peak = iRipple.
  const curPath = React.useMemo(() => {
    const pts: string[] = [];
    const yMid = CUR_H / 2;
    const iScale = (CUR_H / 2 - 8) / Math.max(0.1, iAvg + iRipple / 2 || 1);
    const yForI = (i: number) => yMid - i * iScale;
    for (let c = 0; c < T_CYCLES; c++) {
      const x0 = c * cycleW;
      const xOn = x0 + (duty / 100) * cycleW;
      const xEnd = x0 + cycleW;
      // Start at the valley (iAvg - iRipple/2)
      const iStart = iAvg - iRipple / 2;
      const iPeak = iAvg + iRipple / 2;
      if (c === 0) {
        pts.push(`M ${x0} ${yForI(iStart)}`);
      } else {
        pts.push(`L ${x0} ${yForI(iStart)}`);
      }
      if (duty > 0) pts.push(`L ${xOn} ${yForI(iPeak)}`);
      pts.push(`L ${xEnd} ${yForI(iStart)}`);
    }
    return { d: pts.join(' '), yMid, iScale };
  }, [duty, cycleW, iAvg, iRipple]);

  // ── Average line y position (in PWM SVG) ─────────────────────────────────
  const yAvg = yForV(vAvg);

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas-card">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Gauge className="h-4 w-4 text-accent" aria-hidden />
        <span className="eyebrow text-[11px] text-accent">{headerTitle}</span>
        <span className="ml-auto ee-mono text-[10px] text-body-mid">
          f = {fmtFreq(freq)} · T = {fmtPeriod(freq)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-[1fr_240px]">
        {/* Left: waveforms */}
        <div className="flex flex-col gap-3">
          {/* PWM voltage waveform */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-2">
            <div className="mb-1 flex items-center justify-between">
              <div className="eyebrow text-[10px] text-body-mid">
                PWM voltage · V(t)
              </div>
              <div className="ee-mono text-[10px] text-body-mid">
                {T_CYCLES} cycles shown
              </div>
            </div>
            <svg
              viewBox={`0 0 ${PWM_W} ${PWM_H}`}
              className="h-auto w-full"
              role="img"
              aria-label="PWM voltage waveform"
              preserveAspectRatio="none"
            >
              {/* 0 V and V_amp gridlines */}
              <line
                x1={0}
                y1={yLow}
                x2={PWM_W}
                y2={yLow}
                stroke="var(--body-mid)"
                strokeWidth={0.5}
                opacity={0.4}
              />
              <line
                x1={0}
                y1={yHigh}
                x2={PWM_W}
                y2={yHigh}
                stroke="var(--hairline)"
                strokeWidth={0.5}
                strokeDasharray="2 3"
              />
              <text
                x={4}
                y={yHigh - 3}
                fill="var(--body-mid)"
                fontSize={9}
                fontFamily="var(--font-mono)"
              >
                {amp.toFixed(1)} V
              </text>
              <text
                x={4}
                y={yLow - 3}
                fill="var(--body-mid)"
                fontSize={9}
                fontFamily="var(--font-mono)"
              >
                0 V
              </text>
              {/* Cycle separators */}
              {Array.from({ length: T_CYCLES - 1 }).map((_, i) => (
                <line
                  key={i}
                  x1={(i + 1) * cycleW}
                  y1={0}
                  x2={(i + 1) * cycleW}
                  y2={PWM_H}
                  stroke="var(--hairline)"
                  strokeWidth={0.5}
                  strokeDasharray="1 3"
                />
              ))}
              {/* Average voltage (dashed accent line) */}
              <line
                x1={0}
                y1={yAvg}
                x2={PWM_W}
                y2={yAvg}
                stroke="#FFB347"
                strokeWidth={1.4}
                strokeDasharray="6 4"
              />
              <text
                x={PWM_W - 4}
                y={yAvg - 4}
                fill="#FFB347"
                fontSize={10}
                fontFamily="var(--font-mono)"
                textAnchor="end"
              >
                V_avg = {vAvg.toFixed(2)} V
              </text>
              {/* PWM waveform */}
              <path
                d={pwmPath}
                fill="none"
                stroke="#7FFF9F"
                strokeWidth={2}
                strokeLinejoin="miter"
                strokeLinecap="square"
              />
              {/* Duty-cycle shading */}
              <rect
                x={0}
                y={yHigh}
                width={(duty / 100) * cycleW}
                height={yLow - yHigh}
                fill="#7FFF9F"
                opacity={0.08}
              />
            </svg>
          </div>

          {/* Inductor current waveform */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-2">
            <div className="mb-1 flex items-center justify-between">
              <div className="eyebrow text-[10px] text-body-mid">
                Inductor current · I_L (L = 100 µH, R_load = 10 Ω)
              </div>
              <div className="ee-mono text-[10px] text-body-mid">
                ΔI = {iRipple.toFixed(3)} A
              </div>
            </div>
            <svg
              viewBox={`0 0 ${CUR_W} ${CUR_H}`}
              className="h-auto w-full"
              role="img"
              aria-label="Inductor current waveform"
              preserveAspectRatio="none"
            >
              {/* I_avg line */}
              <line
                x1={0}
                y1={curPath.yMid - iAvg * curPath.iScale}
                x2={CUR_W}
                y2={curPath.yMid - iAvg * curPath.iScale}
                stroke="#FFB347"
                strokeWidth={1.2}
                strokeDasharray="6 4"
              />
              <text
                x={CUR_W - 4}
                y={curPath.yMid - iAvg * curPath.iScale - 4}
                fill="#FFB347"
                fontSize={10}
                fontFamily="var(--font-mono)"
                textAnchor="end"
              >
                I_avg = {iAvg.toFixed(2)} A
              </text>
              {/* Zero line */}
              <line
                x1={0}
                y1={curPath.yMid}
                x2={CUR_W}
                y2={curPath.yMid}
                stroke="var(--body-mid)"
                strokeWidth={0.5}
                opacity={0.4}
              />
              {/* Cycle separators */}
              {Array.from({ length: T_CYCLES - 1 }).map((_, i) => (
                <line
                  key={i}
                  x1={(i + 1) * cycleW}
                  y1={0}
                  x2={(i + 1) * cycleW}
                  y2={CUR_H}
                  stroke="var(--hairline)"
                  strokeWidth={0.5}
                  strokeDasharray="1 3"
                />
              ))}
              {/* Triangle current path */}
              <path
                d={curPath.d}
                fill="none"
                stroke="#A0C3EC"
                strokeWidth={1.6}
                strokeLinejoin="miter"
              />
            </svg>
          </div>
        </div>

        {/* Right column: controls + LED + readouts */}
        <div className="flex flex-col gap-3">
          {/* Controls */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              PWM controls
            </div>
            <label className="block">
              <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
                <span>Duty cycle</span>
                <span className="ee-mono text-accent">{duty.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={duty}
                onChange={(e) => setDuty(parseFloat(e.target.value))}
                className="w-full accent-[color:var(--accent)]"
                aria-label="Duty cycle"
              />
            </label>
            <label className="mt-2 block">
              <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
                <span>Frequency</span>
                <span className="ee-mono text-accent">
                  {fmtFreq(freq)}
                </span>
              </div>
              <input
                type="range"
                min={Math.log10(100)}
                max={Math.log10(100e3)}
                step={0.01}
                value={freqLog}
                onChange={(e) => setFreqLog(parseFloat(e.target.value))}
                className="w-full accent-[color:var(--accent)]"
                aria-label="PWM frequency (log scale)"
              />
              <div className="mt-0.5 flex justify-between text-[9px] text-body-mid">
                <span>100 Hz</span>
                <span>10 kHz</span>
                <span>100 kHz</span>
              </div>
            </label>
            <label className="mt-2 block">
              <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
                <span>Amplitude</span>
                <span className="ee-mono text-accent">{amp.toFixed(1)} V</span>
              </div>
              <input
                type="range"
                min={0}
                max={24}
                step={0.1}
                value={amp}
                onChange={(e) => setAmp(parseFloat(e.target.value))}
                className="w-full accent-[color:var(--accent)]"
                aria-label="PWM amplitude"
              />
            </label>
          </div>

          {/* LED load visualization */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 flex items-center gap-1.5 text-[10px] text-body-mid">
              <Lightbulb className="h-3 w-3" aria-hidden />
              LED load brightness
            </div>
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 80 100" className="h-24 w-20" role="img" aria-label="LED indicator">
                <defs>
                  <radialGradient id="ledGlow" cx="50%" cy="40%" r="60%">
                    <stop
                      offset="0%"
                      stopColor="#7FFF9F"
                      stopOpacity={Math.max(0.05, ledBrightness)}
                    />
                    <stop
                      offset="80%"
                      stopColor="#7FFF9F"
                      stopOpacity={Math.max(0.02, ledBrightness * 0.3)}
                    />
                    <stop offset="100%" stopColor="#7FFF9F" stopOpacity={0} />
                  </radialGradient>
                </defs>
                {/* Glow halo */}
                <circle cx={40} cy={38} r={32} fill="url(#ledGlow)" />
                {/* Bulb */}
                <path
                  d="M 28 30 Q 28 14 40 14 Q 52 14 52 30 L 52 46 Q 52 54 44 56 L 36 56 Q 28 54 28 46 Z"
                  fill={duty < 1 ? '#1a1c20' : `rgba(127,255,159,${0.15 + ledBrightness * 0.7})`}
                  stroke={duty < 1 ? '#3a3d42' : '#7FFF9F'}
                  strokeWidth={1.5}
                />
                {/* Filament */}
                <path
                  d="M 36 38 Q 40 30 44 38 M 38 46 L 42 46"
                  fill="none"
                  stroke={duty < 1 ? '#3a3d42' : '#7FFF9F'}
                  strokeWidth={1}
                  opacity={duty < 1 ? 0.4 : 0.6 + ledBrightness * 0.4}
                />
                {/* Base */}
                <rect x={34} y={56} width={12} height={4} fill="#3a3d42" />
                <rect x={35} y={60} width={10} height={3} fill="#2a2d31" />
                <rect x={36} y={63} width={8} height={8} fill="#2a2d31" />
                {/* Leads */}
                <line x1={38} y1={71} x2={38} y2={92} stroke="#9aa0a8" strokeWidth={1.5} />
                <line x1={42} y1={71} x2={42} y2={92} stroke="#9aa0a8" strokeWidth={1.5} />
              </svg>
              <div className="flex-1">
                <div className="text-[11px] text-ink">
                  {duty < 10
                    ? 'Dim'
                    : duty < 30
                    ? 'Low'
                    : duty < 60
                    ? 'Medium'
                    : duty < 90
                    ? 'Bright'
                    : 'Maximum'}
                </div>
                <div className="ee-mono text-[10px] text-body-mid">
                  brightness {(ledBrightness * 100).toFixed(0)}%
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-canvas-mid">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${ledBrightness * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Readouts */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Computed values
            </div>
            <dl className="space-y-1 text-[11px]">
              <ReadoutRow
                icon={<Activity className="h-3 w-3" />}
                label="V_avg"
                value={`${vAvg.toFixed(3)} V`}
                hint={`= D × V_amp = ${(duty / 100).toFixed(2)} × ${amp.toFixed(1)}`}
              />
              <ReadoutRow
                icon={<Zap className="h-3 w-3" />}
                label="V_rms"
                value={`${vRms.toFixed(3)} V`}
                hint={`= V_amp × √D = ${amp.toFixed(1)} × √${(duty / 100).toFixed(2)}`}
              />
              <ReadoutRow
                label="Duty"
                value={`${duty.toFixed(1)} %`}
              />
              <ReadoutRow
                label="Frequency"
                value={fmtFreq(freq)}
              />
              <ReadoutRow
                label="Period"
                value={fmtPeriod(freq)}
              />
              <ReadoutRow
                label="ON time"
                value={fmtTime(onTime)}
              />
              <ReadoutRow
                label="OFF time"
                value={fmtTime(offTime)}
              />
              <ReadoutRow
                label="I_avg (L)"
                value={`${iAvg.toFixed(3)} A`}
              />
              <ReadoutRow
                label="ΔI_L (pk-pk)"
                value={`${iRipple.toFixed(3)} A`}
              />
            </dl>
          </div>
        </div>
      </div>

      <div className="border-t border-hairline bg-canvas-soft px-3 py-2 text-[10px] text-body-mid">
        PWM switches the supply between 0 V and V_amp at frequency{' '}
        <span className="ee-mono text-accent">f</span> with on-time fraction{' '}
        <span className="ee-mono text-accent">D</span>. The average voltage
        (orange dashed) is V_avg = D·V_amp — the foundation of every
        switch-mode converter. The inductor current ramps up during on-time
        and ramps down during off-time, tracing a triangle centered on I_avg.
      </div>
    </div>
  );
}

function fmtTime(s: number): string {
  if (s >= 1) return `${s.toFixed(3)} s`;
  if (s >= 1e-3) return `${(s * 1e3).toFixed(3)} ms`;
  if (s >= 1e-6) return `${(s * 1e6).toFixed(2)} µs`;
  return `${(s * 1e9).toFixed(1)} ns`;
}

function ReadoutRow({
  icon,
  label,
  value,
  hint,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between">
        <dt className="flex items-center gap-1 text-body-mid">
          {icon}
          {label}
        </dt>
        <dd className="ee-mono text-ink">{value}</dd>
      </div>
      {hint && (
        <div className="ee-mono text-[9px] text-body-mid">{hint}</div>
      )}
    </div>
  );
}

export default PWMVisualizer;
