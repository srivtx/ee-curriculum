'use client';

import * as React from 'react';
import { Activity, ZoomIn, ZoomOut, RotateCcw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Constants ──────────────────────────────────────────────────────────────
const N_CHANNELS = 8;
const N_SAMPLES = 64; // samples per channel — the "window" we render

// ── Pattern types ──────────────────────────────────────────────────────────
type PatternType =
  | 'clock'
  | 'counter'
  | 'uart'
  | 'spi'
  | 'i2c'
  | 'manual'
  | 'idle';

interface PatternOption {
  type: PatternType;
  label: string;
  description: string;
}

const PATTERN_OPTIONS: PatternOption[] = [
  { type: 'clock', label: 'Clock', description: '50% duty-cycle square wave' },
  { type: 'counter', label: 'Counter', description: '4-bit binary counter (D0-D3)' },
  { type: 'uart', label: 'UART', description: 'Start + 8 data + stop at baud rate' },
  { type: 'spi', label: 'SPI', description: 'SCLK + MOSI + MISO + CS, 8-bit' },
  { type: 'i2c', label: 'I2C', description: 'SDA + SCL, addressed transaction' },
  { type: 'manual', label: 'Manual', description: 'Click to toggle bits' },
  { type: 'idle', label: 'Idle (low)', description: 'Constant 0' },
];

// ── Sample generation ──────────────────────────────────────────────────────
//
// We model each channel as an array of N_SAMPLES bits (0/1). Different
// pattern types fill in different channels. The user can also override
// individual bits by clicking (Manual mode).
function generateClock(period: number, phase: number = 0): number[] {
  // period in samples (must be ≥ 2 for a clock). 50% duty cycle.
  const out: number[] = new Array(N_SAMPLES).fill(0);
  for (let i = 0; i < N_SAMPLES; i++) {
    const t = (i + phase) % period;
    out[i] = t < period / 2 ? 1 : 0;
  }
  return out;
}

function generateCounter(nBits: number): number[][] {
  // nBits-bit counter, value increments every cycle period. The counter
  // LSB toggles every sample, MSB every 2^(nBits-1) samples. This is the
  // classic ripple-counter view.
  const channels: number[][] = Array.from({ length: nBits }, () =>
    new Array(N_SAMPLES).fill(0)
  );
  let val = 0;
  // We use a "cycle period" of 4 samples per LSB so the counter visually
  // increments on screen.
  const cyclePeriod = 4;
  for (let i = 0; i < N_SAMPLES; i++) {
    const cval = Math.floor(i / cyclePeriod) % Math.pow(2, nBits);
    for (let b = 0; b < nBits; b++) {
      channels[b][i] = (cval >> b) & 1;
    }
  }
  return channels;
}

function generateUart(baudPeriod: number, dataByte: number): number[][] {
  // UART frame on D0: idle high → start bit (low) → 8 data bits LSB first →
  // stop bit (high) → idle. We place this on channel 0.
  // Other channels stay idle (high) to mimic floating RX lines.
  const out: number[][] = Array.from({ length: N_CHANNELS }, () =>
    new Array(N_SAMPLES).fill(1) // UART idles high
  );
  // Frame: 1 start + 8 data + 1 stop = 10 bits, each `baudPeriod` samples.
  const frame: number[] = [0]; // start bit
  for (let b = 0; b < 8; b++) frame.push((dataByte >> b) & 1); // LSB first
  frame.push(1); // stop bit
  // Place frame starting at sample 4.
  const start = 4;
  for (let i = 0; i < frame.length; i++) {
    const s0 = start + i * baudPeriod;
    const s1 = Math.min(N_SAMPLES, s0 + baudPeriod);
    for (let s = s0; s < s1; s++) {
      if (s < 0 || s >= N_SAMPLES) continue;
      out[0][s] = frame[i];
    }
  }
  // Show TX on D0; show the data byte's MSB/LSB labels in the readout.
  // Other channels: keep idle high.
  return out;
}

function generateSpi(sclkPeriod: number, dataByte: number): number[][] {
  // SPI: D0 = SCLK (gated), D1 = CS (low during transaction), D2 = MOSI,
  // D3 = MISO. 8-bit transaction.
  const out: number[][] = Array.from({ length: N_CHANNELS }, () =>
    new Array(N_SAMPLES).fill(0)
  );
  // CS high (idle), SCLK low (idle), MOSI/MISO don't care.
  for (let i = 0; i < N_SAMPLES; i++) {
    out[1][i] = 1; // CS idle high
  }
  // Transaction: 8 bits × sclkPeriod samples per bit.
  const start = 4;
  const total = 8 * sclkPeriod;
  for (let i = 0; i < N_SAMPLES; i++) {
    if (i < start || i >= start + total) continue;
    // CS low during the transaction.
    out[1][i] = 0;
    // SCLK: toggles within each bit. Mode 0: clock idle low, sample on
    // rising edge. So SCLK goes high in the second half of each bit period.
    const bitIdx = Math.floor((i - start) / sclkPeriod);
    const withinBit = (i - start) % sclkPeriod;
    out[0][i] = withinBit >= sclkPeriod / 2 ? 1 : 0;
    // MOSI: dataByte MSB first. MISO: dummy response (0xA5).
    out[2][i] = (dataByte >> (7 - bitIdx)) & 1;
    out[3][i] = (0xa5 >> (7 - bitIdx)) & 1;
  }
  // Other channels: idle low.
  return out;
}

function generateI2c(sclPeriod: number, dataByte: number): number[][] {
  // I2C: D0 = SDA, D1 = SCL. Both idle high. Transaction:
  //   START (SDA falls while SCL high) → 7-bit addr + R/W bit → ACK →
  //   8 data bits → ACK → STOP (SDA rises while SCL high).
  const out: number[][] = Array.from({ length: N_CHANNELS }, () =>
    new Array(N_SAMPLES).fill(1) // I2C idles high
  );
  // We'll synthesize a simple START + addr + ACK + data + ACK + STOP frame.
  // Build a list of (scl_state, sda_state) events.
  type Event = { sda: number; scl: number };
  const events: Event[] = [];
  // START: SCL high, SDA falls.
  events.push({ sda: 1, scl: 1 });
  events.push({ sda: 0, scl: 1 }); // START
  // Address byte (0x50 << 1 | 0 = 0xA0) MSB first, with SCL toggling.
  const addr = 0x50 << 1; // write
  for (let b = 7; b >= 0; b--) {
    const bit = (addr >> b) & 1;
    events.push({ sda: bit, scl: 0 });
    events.push({ sda: bit, scl: 1 });
    events.push({ sda: bit, scl: 0 });
  }
  // ACK from slave (SDA low).
  events.push({ sda: 0, scl: 0 });
  events.push({ sda: 0, scl: 1 });
  events.push({ sda: 0, scl: 0 });
  // Data byte MSB first.
  for (let b = 7; b >= 0; b--) {
    const bit = (dataByte >> b) & 1;
    events.push({ sda: bit, scl: 0 });
    events.push({ sda: bit, scl: 1 });
    events.push({ sda: bit, scl: 0 });
  }
  // ACK.
  events.push({ sda: 0, scl: 0 });
  events.push({ sda: 0, scl: 1 });
  events.push({ sda: 0, scl: 0 });
  // STOP: SCL high, SDA rises.
  events.push({ sda: 0, scl: 1 });
  events.push({ sda: 1, scl: 1 }); // STOP
  // Place events: each event takes `sclPeriod / 3` samples (so SCL high/low
  // phases are visible).
  const evtLen = Math.max(1, Math.floor(sclPeriod / 3));
  let t = 4;
  for (const e of events) {
    for (let k = 0; k < evtLen && t < N_SAMPLES; k++, t++) {
      out[0][t] = e.sda;
      out[1][t] = e.scl;
    }
  }
  // Other channels: idle low.
  for (let ch = 2; ch < N_CHANNELS; ch++) {
    for (let i = 0; i < N_SAMPLES; i++) out[ch][i] = 0;
  }
  return out;
}

function generateIdle(): number[][] {
  return Array.from({ length: N_CHANNELS }, () =>
    new Array(N_SAMPLES).fill(0)
  );
}

function generateManual(prev: number[][]): number[][] {
  // Manual mode keeps existing values; we don't overwrite.
  return prev.map((ch) => ch.slice());
}

// ── Trigger detection ──────────────────────────────────────────────────────
//
// Find the first sample index where the trigger channel has the requested
// edge (rising = 0→1, falling = 1→0). Returns -1 if no edge found.
function findTrigger(
  channel: number[],
  edge: 'rising' | 'falling'
): number {
  for (let i = 1; i < channel.length; i++) {
    if (edge === 'rising' && channel[i - 1] === 0 && channel[i] === 1) return i;
    if (edge === 'falling' && channel[i - 1] === 1 && channel[i] === 0) return i;
  }
  return -1;
}

// ── Hex value per cycle (for display under the waveforms) ──────────────────
//
// Given 8 channels and a clock period (in samples), compute the hex byte
// value at each clock cycle.
function hexPerCycle(channels: number[][], clockPeriod: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < N_SAMPLES; i += clockPeriod) {
    let v = 0;
    for (let b = 0; b < N_CHANNELS; b++) {
      // Sample at the middle of the cycle.
      const mid = i + Math.floor(clockPeriod / 2);
      if (mid >= N_SAMPLES) break;
      if (channels[b][mid] === 1) v |= 1 << b;
    }
    out.push(v);
  }
  return out;
}

// ── Component ──────────────────────────────────────────────────────────────
export interface LogicAnalyzerProps {
  lessonTitle?: string;
}

export function LogicAnalyzer({ lessonTitle }: LogicAnalyzerProps) {
  const headerTitle = lessonTitle ?? 'Interactive Logic Analyzer';

  // Per-channel pattern type. Each pattern type can occupy multiple channels
  // (e.g. counter uses D0-D3, SPI uses D0-D3, I2C uses D0-D1). When a pattern
  // is selected for a channel, it generates its multi-channel footprint and
  // we display it; other channels show idle.
  const [activePattern, setActivePattern] = React.useState<PatternType>('spi');
  const [clockPeriod, setClockPeriod] = React.useState(8); // samples per cycle
  const [baudRate, setBaudRate] = React.useState(4); // samples per UART bit
  const [timebase, setTimebase] = React.useState(8); // samples per division
  const [dataByte, setDataByte] = React.useState(0xa5);
  const [triggerChannel, setTriggerChannel] = React.useState(0);
  const [triggerEdge, setTriggerEdge] = React.useState<'rising' | 'falling'>(
    'falling'
  );
  const [triggerEnabled, setTriggerEnabled] = React.useState(true);
  const [manualData, setManualData] = React.useState<number[][]>(() =>
    Array.from({ length: N_CHANNELS }, () =>
      new Array(N_SAMPLES).fill(0)
    )
  );

  // Generate the channel data based on the active pattern.
  const generatedChannels = React.useMemo<number[][]>(() => {
    switch (activePattern) {
      case 'clock': {
        const clock = generateClock(clockPeriod);
        const out = Array.from({ length: N_CHANNELS }, (_, i) =>
          i === 0 ? clock.slice() : new Array(N_SAMPLES).fill(0)
        );
        return out;
      }
      case 'counter': {
        const counter = generateCounter(4); // D0-D3 = 4-bit counter
        const out = Array.from({ length: N_CHANNELS }, (_, i) =>
          i < 4 ? counter[i].slice() : new Array(N_SAMPLES).fill(0)
        );
        return out;
      }
      case 'uart':
        return generateUart(baudRate, dataByte);
      case 'spi':
        return generateSpi(clockPeriod, dataByte);
      case 'i2c':
        return generateI2c(clockPeriod, dataByte);
      case 'manual':
        return generateManual(manualData);
      case 'idle':
      default:
        return generateIdle();
    }
  }, [activePattern, clockPeriod, baudRate, dataByte, manualData]);

  // Trigger: if enabled and a trigger edge is found, re-window the data so
  // the trigger sits at a fixed position (e.g. sample 8).
  const triggerIdx = React.useMemo(() => {
    if (!triggerEnabled) return -1;
    return findTrigger(generatedChannels[triggerChannel] ?? [], triggerEdge);
  }, [generatedChannels, triggerChannel, triggerEdge, triggerEnabled]);

  const TRIGGER_POS = 8;
  const displayChannels = React.useMemo<number[][]>(() => {
    if (!triggerEnabled || triggerIdx < 0 || triggerIdx === TRIGGER_POS) {
      return generatedChannels;
    }
    const offset = triggerIdx - TRIGGER_POS;
    // Shift each channel by `offset` samples, padding with the edge value.
    return generatedChannels.map((ch) => {
      const out = new Array(N_SAMPLES).fill(0);
      for (let i = 0; i < N_SAMPLES; i++) {
        const src = i + offset;
        if (src < 0) out[i] = ch[0];
        else if (src >= N_SAMPLES) out[i] = ch[N_SAMPLES - 1];
        else out[i] = ch[src];
      }
      return out;
    });
  }, [generatedChannels, triggerEnabled, triggerIdx]);

  // Hex values per cycle (for the cycle ruler).
  const hexVals = React.useMemo(
    () => hexPerCycle(displayChannels, clockPeriod),
    [displayChannels, clockPeriod]
  );

  // Toggle a sample in Manual mode.
  const toggleSample = (ch: number, s: number) => {
    if (activePattern !== 'manual') return;
    setManualData((prev) => {
      const next = prev.map((c) => c.slice());
      next[ch][s] = next[ch][s] ? 0 : 1;
      return next;
    });
  };

  const resetAll = () => {
    setActivePattern('spi');
    setClockPeriod(8);
    setBaudRate(4);
    setTimebase(8);
    setDataByte(0xa5);
    setTriggerChannel(0);
    setTriggerEdge('falling');
    setTriggerEnabled(true);
    setManualData(
      Array.from({ length: N_CHANNELS }, () => new Array(N_SAMPLES).fill(0))
    );
  };

  // ── SVG layout ───────────────────────────────────────────────────────────
  const LABEL_W = 80; // left label column width
  const ROW_H = 38; // height per channel
  const TOP_PAD = 24; // space for hex ruler
  const BOTTOM_PAD = 32; // space for time axis
  const sampleW = 8; // pixels per sample (zoomable)
  const svgW = LABEL_W + N_SAMPLES * sampleW + 8;
  const svgH = TOP_PAD + N_CHANNELS * ROW_H + BOTTOM_PAD;

  // Timebase markers: every `timebase` samples = 1 division.
  const divisions = Math.ceil(N_SAMPLES / timebase);
  const divW = timebase * sampleW;

  // Y position for channel ch.
  const yForChannel = (ch: number) => TOP_PAD + ch * ROW_H + ROW_H / 2;

  // Y positions for the high/low rails within a channel row.
  const yHigh = (ch: number) => yForChannel(ch) - 11;
  const yLow = (ch: number) => yForChannel(ch) + 11;

  // Convert a sample index to SVG x.
  const xForSample = (s: number) => LABEL_W + s * sampleW;

  // Channel labels depend on the active pattern.
  const channelLabels = React.useMemo<string[]>(() => {
    if (activePattern === 'spi') return ['SCLK', 'CS', 'MOSI', 'MISO', 'D4', 'D5', 'D6', 'D7'];
    if (activePattern === 'i2c') return ['SDA', 'SCL', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
    if (activePattern === 'uart') return ['TX/RX', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
    if (activePattern === 'counter') return ['Q0', 'Q1', 'Q2', 'Q3', 'D4', 'D5', 'D6', 'D7'];
    if (activePattern === 'clock') return ['CLK', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
    return ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
  }, [activePattern]);

  // ── Build waveform path for each channel ─────────────────────────────────
  // We draw the waveform as a polyline that goes high/low based on each
  // sample, with vertical transitions at sample boundaries.
  const buildPath = (ch: number): string => {
    const data = displayChannels[ch];
    if (!data || data.length === 0) return '';
    const pts: string[] = [];
    for (let i = 0; i < N_SAMPLES; i++) {
      const x = xForSample(i);
      const y = data[i] === 1 ? yHigh(ch) : yLow(ch);
      if (i === 0) {
        pts.push(`M ${x} ${y}`);
      } else {
        const prevY = data[i - 1] === 1 ? yHigh(ch) : yLow(ch);
        if (prevY !== y) {
          // Vertical transition at the sample boundary.
          pts.push(`L ${x} ${prevY}`);
        }
        pts.push(`L ${x} ${y}`);
      }
    }
    // Extend to the right edge.
    pts.push(`L ${xForSample(N_SAMPLES)} ${data[N_SAMPLES - 1] === 1 ? yHigh(ch) : yLow(ch)}`);
    return pts.join(' ');
  };

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas-card">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Activity className="h-4 w-4 text-accent" aria-hidden />
        <span className="eyebrow text-[11px] text-accent">{headerTitle}</span>
        <span className="ml-auto ee-mono text-[10px] text-body-mid">
          {N_CHANNELS} channels · {N_SAMPLES} samples · sample rate ={' '}
          {(1000 / timebase).toFixed(1)} kS/s
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-[1fr_280px]">
        {/* Waveform SVG */}
        <div className="overflow-x-auto ee-scroll">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="h-auto"
            style={{ minWidth: svgW, width: svgW }}
            role="img"
            aria-label="Logic analyzer waveform display"
          >
            {/* Background grid: timebase divisions (vertical). */}
            {Array.from({ length: divisions + 1 }).map((_, d) => {
              const x = LABEL_W + d * divW;
              return (
                <line
                  key={`vgrid-${d}`}
                  x1={x}
                  y1={TOP_PAD}
                  x2={x}
                  y2={TOP_PAD + N_CHANNELS * ROW_H}
                  stroke="var(--hairline)"
                  strokeWidth={1}
                  strokeDasharray="2 4"
                />
              );
            })}

            {/* Horizontal row separators. */}
            {Array.from({ length: N_CHANNELS + 1 }).map((_, ch) => {
              const y = TOP_PAD + ch * ROW_H;
              return (
                <line
                  key={`hgrid-${ch}`}
                  x1={LABEL_W}
                  y1={y}
                  x2={LABEL_W + N_SAMPLES * sampleW}
                  y2={y}
                  stroke="var(--hairline)"
                  strokeWidth={1}
                  opacity={0.5}
                />
              );
            })}

            {/* Hex value ruler at the top. */}
            {hexVals.map((v, i) => {
              const x = LABEL_W + i * clockPeriod * sampleW + (clockPeriod * sampleW) / 2;
              if (x > LABEL_W + N_SAMPLES * sampleW) return null;
              return (
                <text
                  key={`hex-${i}`}
                  x={x}
                  y={TOP_PAD - 8}
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                  fill="var(--accent)"
                  textAnchor="middle"
                >
                  0x{v.toString(16).padStart(2, '0').toUpperCase()}
                </text>
              );
            })}

            {/* Trigger marker (vertical line at TRIGGER_POS). */}
            {triggerEnabled && triggerIdx >= 0 && (
              <g>
                <line
                  x1={xForSample(TRIGGER_POS)}
                  y1={TOP_PAD}
                  x2={xForSample(TRIGGER_POS)}
                  y2={TOP_PAD + N_CHANNELS * ROW_H}
                  stroke="var(--error)"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                />
                <text
                  x={xForSample(TRIGGER_POS) + 4}
                  y={TOP_PAD - 8}
                  fontSize={9}
                  fontFamily="var(--font-mono)"
                  fill="var(--error)"
                >
                  T
                </text>
              </g>
            )}

            {/* Channel waveforms. */}
            {Array.from({ length: N_CHANNELS }).map((_, ch) => {
              const label = channelLabels[ch];
              const isTriggerCh = triggerEnabled && ch === triggerChannel;
              return (
                <g key={`ch-${ch}`}>
                  {/* Channel label (left). */}
                  <text
                    x={LABEL_W - 6}
                    y={yForChannel(ch) + 4}
                    fontSize={11}
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                    fill={isTriggerCh ? 'var(--error)' : 'var(--body-mid)'}
                    textAnchor="end"
                  >
                    {label}
                  </text>
                  {/* Channel index (D0-D7). */}
                  <text
                    x={4}
                    y={yForChannel(ch) + 4}
                    fontSize={9}
                    fontFamily="var(--font-mono)"
                    fill="var(--body-mid)"
                  >
                    D{ch}
                  </text>
                  {/* High/low rail labels (very subtle). */}
                  <text
                    x={LABEL_W + N_SAMPLES * sampleW + 4}
                    y={yHigh(ch) + 3}
                    fontSize={8}
                    fontFamily="var(--font-mono)"
                    fill="var(--body-mid)"
                    opacity={0.5}
                  >
                    1
                  </text>
                  <text
                    x={LABEL_W + N_SAMPLES * sampleW + 4}
                    y={yLow(ch) + 3}
                    fontSize={8}
                    fontFamily="var(--font-mono)"
                    fill="var(--body-mid)"
                    opacity={0.5}
                  >
                    0
                  </text>
                  {/* Waveform path. */}
                  <path
                    d={buildPath(ch)}
                    fill="none"
                    stroke={
                      isTriggerCh
                        ? 'var(--error)'
                        : 'var(--accent)'
                    }
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {/* Clickable overlay (only in Manual mode). */}
                  {activePattern === 'manual' &&
                    Array.from({ length: N_SAMPLES }).map((_, s) => (
                      <rect
                        key={`click-${ch}-${s}`}
                        x={xForSample(s)}
                        y={TOP_PAD + ch * ROW_H}
                        width={sampleW}
                        height={ROW_H}
                        fill="transparent"
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleSample(ch, s)}
                      >
                        <title>
                          {label} sample {s}: {displayChannels[ch][s]}
                        </title>
                      </rect>
                    ))}
                </g>
              );
            })}

            {/* Time axis (bottom). */}
            {Array.from({ length: divisions + 1 }).map((_, d) => {
              const x = LABEL_W + d * divW;
              const tUs = ((d * timebase) / (1000 / timebase)) * 0.001; // bogus — keep simple: samples
              return (
                <text
                  key={`taxis-${d}`}
                  x={x}
                  y={TOP_PAD + N_CHANNELS * ROW_H + 14}
                  fontSize={9}
                  fontFamily="var(--font-mono)"
                  fill="var(--body-mid)"
                  textAnchor="middle"
                >
                  {d * timebase}
                </text>
              );
            })}
            <text
              x={LABEL_W + N_SAMPLES * sampleW + 4}
              y={TOP_PAD + N_CHANNELS * ROW_H + 14}
              fontSize={9}
              fontFamily="var(--font-mono)"
              fill="var(--body-mid)"
            >
              samples
            </text>
          </svg>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3">
          {/* Pattern selector */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Pattern preset
            </div>
            <div className="grid grid-cols-2 gap-1">
              {PATTERN_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => {
                    setActivePattern(opt.type);
                    if (opt.type === 'manual') {
                      setManualData((prev) => prev.map((c) => c.slice()));
                    }
                  }}
                  className={`rounded-sm border px-2 py-1.5 text-[10px] transition-colors ${
                    activePattern === opt.type
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-hairline text-body-mid hover:bg-canvas-soft'
                  }`}
                  aria-pressed={activePattern === opt.type}
                  title={opt.description}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-body-mid">
              {PATTERN_OPTIONS.find((o) => o.type === activePattern)?.description}
            </p>
          </div>

          {/* Timebase (zoom) */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Timebase (samples/division)
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTimebase((t) => Math.max(2, Math.floor(t / 2)))}
                className="h-7 w-7 p-0"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
              <span className="ee-mono flex-1 text-center text-[12px] text-accent">
                {timebase}/div
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTimebase((t) => Math.min(32, t * 2))}
                className="h-7 w-7 p-0"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
            </div>
            <div className="mt-2 text-[10px] text-body-mid">
              Effective sample rate:{' '}
              <span className="ee-mono text-ink">
                {(1000 / timebase).toFixed(1)} kS/s
              </span>
            </div>
          </div>

          {/* Clock / baud / data byte */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Signal parameters
            </div>
            <label className="block">
              <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
                <span>Clock period (samples)</span>
                <span className="ee-mono text-ink">{clockPeriod}</span>
              </div>
              <input
                type="range"
                min={2}
                max={16}
                step={1}
                value={clockPeriod}
                onChange={(e) => setClockPeriod(parseInt(e.target.value, 10))}
                className="w-full accent-[color:var(--accent)]"
                aria-label="Clock period"
              />
            </label>
            {(activePattern === 'uart') && (
              <label className="mt-2 block">
                <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
                  <span>Baud period (samples/bit)</span>
                  <span className="ee-mono text-ink">{baudRate}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={8}
                  step={1}
                  value={baudRate}
                  onChange={(e) => setBaudRate(parseInt(e.target.value, 10))}
                  className="w-full accent-[color:var(--accent)]"
                  aria-label="Baud period"
                />
              </label>
            )}
            {(activePattern === 'uart' ||
              activePattern === 'spi' ||
              activePattern === 'i2c') && (
              <label className="mt-2 block">
                <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
                  <span>Data byte (hex)</span>
                  <span className="ee-mono text-accent">
                    0x{dataByte.toString(16).padStart(2, '0').toUpperCase()}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={255}
                  step={1}
                  value={dataByte}
                  onChange={(e) => setDataByte(parseInt(e.target.value, 10))}
                  className="w-full accent-[color:var(--accent)]"
                  aria-label="Data byte"
                />
                <div className="mt-0.5 flex justify-between text-[9px] text-body-mid">
                  <span>0x00</span>
                  <span>0xFF</span>
                </div>
              </label>
            )}
          </div>

          {/* Trigger controls */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 flex items-center justify-between text-[10px] text-body-mid">
              <span>Trigger</span>
              <button
                onClick={() => setTriggerEnabled((v) => !v)}
                className={`ee-mono text-[10px] ${
                  triggerEnabled ? 'text-accent' : 'text-body-mid'
                }`}
                aria-pressed={triggerEnabled}
              >
                {triggerEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <label className="block">
              <span className="mb-1 block text-[10px] text-body-mid">
                Channel
              </span>
              <select
                value={triggerChannel}
                onChange={(e) => setTriggerChannel(parseInt(e.target.value, 10))}
                disabled={!triggerEnabled}
                className="w-full rounded-sm border border-hairline bg-canvas px-2 py-1 font-mono text-[11px] text-ink disabled:opacity-50"
                aria-label="Trigger channel"
              >
                {channelLabels.map((lbl, ch) => (
                  <option key={ch} value={ch}>
                    D{ch} ({lbl})
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-1">
              <button
                onClick={() => setTriggerEdge('rising')}
                disabled={!triggerEnabled}
                className={`rounded-sm border px-2 py-1 text-[10px] disabled:opacity-50 ${
                  triggerEdge === 'rising'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-hairline text-body-mid'
                }`}
                aria-pressed={triggerEdge === 'rising'}
              >
                ↑ Rising
              </button>
              <button
                onClick={() => setTriggerEdge('falling')}
                disabled={!triggerEnabled}
                className={`rounded-sm border px-2 py-1 text-[10px] disabled:opacity-50 ${
                  triggerEdge === 'falling'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-hairline text-body-mid'
                }`}
                aria-pressed={triggerEdge === 'falling'}
              >
                ↓ Falling
              </button>
            </div>
            <div className="mt-2 text-[10px] text-body-mid">
              {triggerEnabled
                ? triggerIdx >= 0
                  ? `Triggered at sample ${triggerIdx} → aligned to display sample ${TRIGGER_POS}`
                  : `No ${triggerEdge} edge found on D${triggerChannel}`
                : 'Trigger disabled — showing raw capture'
              }
            </div>
          </div>

          {/* Reset */}
          <Button
            size="sm"
            variant="ghost"
            onClick={resetAll}
            className="h-7 w-full gap-1 text-[10px]"
          >
            <RotateCcw className="h-3 w-3" /> Reset to defaults
          </Button>
        </div>
      </div>

      {/* Hint footer */}
      <div className="flex items-start gap-2 border-t border-hairline bg-canvas-soft px-3 py-2 text-[10px] text-body-mid">
        <Zap className="mt-0.5 h-3 w-3 shrink-0 text-accent" aria-hidden />
        <p>
          Pick a protocol preset to see its canonical waveform footprint
          across the 8 channels. Adjust the clock period, baud rate, or data
          byte to see how the bits spread across time. Set a trigger (channel
          + edge) and the display re-aligns so the trigger event sits at the
          red T marker. In <span className="text-accent">Manual</span> mode,
          click any cell of the waveform to toggle that bit.
        </p>
      </div>
    </div>
  );
}

export default LogicAnalyzer;
