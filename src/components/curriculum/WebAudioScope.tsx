'use client';

import * as React from 'react';
import {
  Activity,
  AlertCircle,
  AudioLines,
  AudioWaveform,
  Mic,
  MicOff,
  Pause,
  Play,
  Triangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

/**
 * Web Audio oscilloscope + signal generator + live FFT spectrum.
 *
 * No npm deps — pure Web Audio API (AudioContext, OscillatorNode, AnalyserNode,
 * GainNode, MediaStreamSource for the mic). Two <canvas> elements animate at
 * 60 fps via requestAnimationFrame.
 *
 * Audio is muted until the user clicks Start (browser autoplay policy).
 */

type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';

const WAVEFORMS: { value: WaveformType; label: string; icon: React.ReactNode }[] = [
  { value: 'sine', label: 'Sine', icon: <Activity className="h-3 w-3" /> },
  { value: 'square', label: 'Square', icon: <AudioWaveform className="h-3 w-3" /> },
  { value: 'sawtooth', label: 'Saw', icon: <AudioLines className="h-3 w-3" /> },
  { value: 'triangle', label: 'Triangle', icon: <Triangle className="h-3 w-3" /> },
];

// 20 Hz to 20 kHz mapped to a 0..1000 slider via log scale.
const FREQ_MIN = 20;
const FREQ_MAX = 20000;
const FREQ_STEPS = 1000;

function sliderToFreq(v: number): number {
  // log10(v) interpolation
  const t = v / FREQ_STEPS;
  const logMin = Math.log10(FREQ_MIN);
  const logMax = Math.log10(FREQ_MAX);
  return Math.pow(10, logMin + t * (logMax - logMin));
}

function freqToSlider(f: number): number {
  const logMin = Math.log10(FREQ_MIN);
  const logMax = Math.log10(FREQ_MAX);
  const t = (Math.log10(f) - logMin) / (logMax - logMin);
  return Math.round(t * FREQ_STEPS);
}

function formatFreq(f: number): string {
  if (f >= 1000) return `${(f / 1000).toFixed(2)} kHz`;
  return `${f.toFixed(1)} Hz`;
}

export interface WebAudioScopeProps {
  /** Optional title shown in the panel header. */
  title?: string;
  /** Optional lesson title — used as the header when `title` is omitted. */
  lessonTitle?: string;
  /** Initial waveform type. */
  defaultWaveform?: WaveformType;
  /** Initial frequency in Hz. */
  defaultFrequency?: number;
  /** Initial amplitude 0..1. */
  defaultAmplitude?: number;
}

export function WebAudioScope({
  title,
  lessonTitle,
  defaultWaveform = 'sine',
  defaultFrequency = 440,
  defaultAmplitude = 0.3,
}: WebAudioScopeProps) {
  // ── UI state ────────────────────────────────────────────────────────────
  const headerTitle = title ?? lessonTitle ?? 'Web Audio Oscilloscope';
  const [waveform, setWaveform] = React.useState<WaveformType>(defaultWaveform);
  const [freq, setFreq] = React.useState(defaultFrequency);
  const [amp, setAmp] = React.useState(defaultAmplitude);
  const [running, setRunning] = React.useState(false);
  const [micOn, setMicOn] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [supported, setSupported] = React.useState(true);

  // ── Refs to live audio nodes (kept out of React state) ──────────────────
  const ctxRef = React.useRef<AudioContext | null>(null);
  const oscRef = React.useRef<OscillatorNode | null>(null);
  const gainRef = React.useRef<GainNode | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const micStreamRef = React.useRef<MediaStream | null>(null);
  const micSrcRef = React.useRef<MediaStreamAudioSourceNode | null>(null);
  // Live mirror of state for the rAF loop (avoids stale closure).
  // Updated in an effect (not during render) to satisfy react-hooks/refs.
  const runningRef = React.useRef(false);
  React.useEffect(() => {
    runningRef.current = running;
  }, [running]);

  // Canvas refs.
  const scopeCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const spectrumCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);

  // ── Detect support ──────────────────────────────────────────────────────
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) setSupported(false);
  }, []);

  // ── Live-update oscillator freq/type & gain ─────────────────────────────
  React.useEffect(() => {
    if (oscRef.current && !micOn) {
      try {
        oscRef.current.frequency.setValueAtTime(freq, ctxRef.current!.currentTime);
        oscRef.current.type = waveform;
      } catch {
        /* ignore */
      }
    }
  }, [freq, waveform, micOn]);

  React.useEffect(() => {
    if (gainRef.current && ctxRef.current) {
      try {
        gainRef.current.gain.setValueAtTime(
          micOn ? 0 : amp,
          ctxRef.current.currentTime,
        );
      } catch {
        /* ignore */
      }
    }
  }, [amp, micOn]);

  // ── Stop the audio engine (oscillator, mic stream, mic source) ──────────
  // Declared before the cleanup useEffect so the dependency is in scope.
  const stopAll = React.useCallback(() => {
    try {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch { /* ignore */ }
        try { oscRef.current.disconnect(); } catch { /* ignore */ }
        oscRef.current = null;
      }
    } catch { /* ignore */ }
    try {
      if (micSrcRef.current) {
        micSrcRef.current.disconnect();
        micSrcRef.current = null;
      }
    } catch { /* ignore */ }
    try {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
    } catch { /* ignore */ }
  }, []);

  // ── Cleanup on unmount ──────────────────────────────────────────────────
  React.useEffect(() => {
    return () => {
      stopAll();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [stopAll]);

  // ── Start/stop the audio engine ─────────────────────────────────────────
  async function handleStartStop() {
    setError(null);
    if (running) {
      stopAll();
      setRunning(false);
      setMicOn(false);
      return;
    }
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) {
        setSupported(false);
        setError('Web Audio API not supported in this browser.');
        return;
      }
      // (Re)use a single AudioContext for the lifetime of the component.
      if (!ctxRef.current) ctxRef.current = new AC();
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      // Analyser — feeds both the scope and the spectrum canvases.
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      // Gain node so we can actually hear the oscillator.
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(micOn ? 0 : amp, ctx.currentTime);
      gain.connect(analyser);
      analyser.connect(ctx.destination);
      gainRef.current = gain;

      // Oscillator — only when not using the mic.
      if (!micOn) {
        const osc = ctx.createOscillator();
        osc.type = waveform;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(gain);
        osc.start();
        oscRef.current = osc;
      }

      setRunning(true);
      // Kick off the animation loop.
      drawLoop();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to start audio: ${msg}`);
      setRunning(false);
    }
  }

  async function handleToggleMic() {
    setError(null);
    if (micOn) {
      // Turn mic off — re-enable the oscillator.
      stopMicOnly();
      setMicOn(false);
      return;
    }
    try {
      if (!ctxRef.current) {
        // Need an AudioContext for the analyser even before "Start" is pressed.
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (!AC) {
          setSupported(false);
          return;
        }
        ctxRef.current = new AC();
      }
      const ctx = ctxRef.current!;
      if (ctx.state === 'suspended') await ctx.resume();

      // Always recreate the analyser graph so it's consistent.
      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.5;
        analyser.connect(ctx.destination);
        analyserRef.current = analyser;
      }
      // Stop the oscillator (if any) so it doesn't play alongside the mic.
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch { /* ignore */ }
        try { oscRef.current.disconnect(); } catch { /* ignore */ }
        oscRef.current = null;
      }
      // Mute the gain so we don't feed the mic back through the speakers.
      if (gainRef.current) {
        gainRef.current.gain.setValueAtTime(0, ctx.currentTime);
      } else {
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.connect(analyserRef.current);
        gainRef.current = gain;
      }

      // Request mic access.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        video: false,
      });
      micStreamRef.current = stream;
      const micSrc = ctx.createMediaStreamSource(stream);
      micSrc.connect(gainRef.current);
      micSrcRef.current = micSrc;

      setMicOn(true);
      if (!running) {
        setRunning(true);
        drawLoop();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Microphone access failed: ${msg}`);
      setMicOn(false);
    }
  }

  function stopMicOnly() {
    try {
      if (micSrcRef.current) {
        micSrcRef.current.disconnect();
        micSrcRef.current = null;
      }
    } catch { /* ignore */ }
    try {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
    } catch { /* ignore */ }
    // Re-arm the oscillator if still running.
    if (ctxRef.current && analyserRef.current && gainRef.current) {
      try {
        gainRef.current.gain.setValueAtTime(amp, ctxRef.current.currentTime);
        const osc = ctxRef.current.createOscillator();
        osc.type = waveform;
        osc.frequency.setValueAtTime(freq, ctxRef.current.currentTime);
        osc.connect(gainRef.current);
        osc.start();
        oscRef.current = osc;
      } catch { /* ignore */ }
    }
  }

  // ── Animation loop — draws scope + spectrum ─────────────────────────────
  function drawLoop() {
    const analyser = analyserRef.current;
    const scopeCanvas = scopeCanvasRef.current;
    const spectrumCanvas = spectrumCanvasRef.current;
    if (!analyser || !scopeCanvas || !spectrumCanvas) {
      rafRef.current = requestAnimationFrame(drawLoop);
      return;
    }

    // ── Scope: time-domain (last ~100 ms of audio) ────────────────────────
    const scopeCtx = scopeCanvas.getContext('2d');
    if (scopeCtx) {
      const W = scopeCanvas.width;
      const H = scopeCanvas.height;
      // Background
      scopeCtx.fillStyle = '#0b0e14';
      scopeCtx.fillRect(0, 0, W, H);

      // Grid
      scopeCtx.strokeStyle = 'rgba(45, 212, 191, 0.12)';
      scopeCtx.lineWidth = 1;
      scopeCtx.beginPath();
      for (let i = 1; i < 10; i++) {
        const x = (W * i) / 10;
        scopeCtx.moveTo(x, 0);
        scopeCtx.lineTo(x, H);
      }
      for (let i = 1; i < 4; i++) {
        const y = (H * i) / 4;
        scopeCtx.moveTo(0, y);
        scopeCtx.lineTo(W, y);
      }
      scopeCtx.stroke();
      // Center axis
      scopeCtx.strokeStyle = 'rgba(45, 212, 191, 0.28)';
      scopeCtx.beginPath();
      scopeCtx.moveTo(0, H / 2);
      scopeCtx.lineTo(W, H / 2);
      scopeCtx.stroke();

      // Trace — getByteTimeDomainData returns 0..255, 128 = zero.
      const buf = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(buf);
      // Sample rate is typically 44.1 kHz; show the last 100 ms.
      const ctxSampleRate = ctxRef.current?.sampleRate ?? 44100;
      const samplesToShow = Math.min(
        buf.length,
        Math.floor(0.1 * ctxSampleRate),
      );
      const startIdx = buf.length - samplesToShow;
      scopeCtx.strokeStyle = '#2dd4bf'; // accent-ish
      scopeCtx.lineWidth = 1.8;
      scopeCtx.beginPath();
      for (let i = startIdx; i < buf.length; i++) {
        const x = ((i - startIdx) / samplesToShow) * W;
        const v = (buf[i] - 128) / 128; // -1..1
        const y = H / 2 - v * (H / 2) * 0.92;
        if (i === startIdx) scopeCtx.moveTo(x, y);
        else scopeCtx.lineTo(x, y);
      }
      scopeCtx.stroke();

      // Label
      scopeCtx.fillStyle = 'rgba(148, 163, 184, 0.85)';
      scopeCtx.font = '11px ui-monospace, monospace';
      scopeCtx.fillText('Scope · 100 ms window', 8, 14);
      scopeCtx.fillStyle = 'rgba(45, 212, 191, 0.7)';
      const sourceLabel = micOn ? 'source: microphone' : `source: ${waveform} ${formatFreq(freq)}`;
      scopeCtx.fillText(sourceLabel, 8, H - 8);
    }

    // ── Spectrum: frequency-domain (0–10 kHz) ─────────────────────────────
    const sCtx = spectrumCanvas.getContext('2d');
    if (sCtx) {
      const W = spectrumCanvas.width;
      const H = spectrumCanvas.height;
      sCtx.fillStyle = '#0b0e14';
      sCtx.fillRect(0, 0, W, H);

      // Grid
      sCtx.strokeStyle = 'rgba(245, 158, 11, 0.12)';
      sCtx.lineWidth = 1;
      sCtx.beginPath();
      for (let i = 1; i < 10; i++) {
        const x = (W * i) / 10;
        sCtx.moveTo(x, 0);
        sCtx.lineTo(x, H);
      }
      for (let i = 1; i < 4; i++) {
        const y = (H * i) / 4;
        sCtx.moveTo(0, y);
        sCtx.lineTo(W, y);
      }
      sCtx.stroke();

      // Frequency bins — getByteFrequencyData returns 0..255 (dB scaled).
      const freqBins = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freqBins);
      const ctxSampleRate = ctxRef.current?.sampleRate ?? 44100;
      const binHz = ctxSampleRate / 2 / freqBins.length;
      const maxHz = 10000;
      const maxBin = Math.min(freqBins.length, Math.floor(maxHz / binHz));
      const barW = W / maxBin;

      // Bars
      for (let i = 0; i < maxBin; i++) {
        const v = freqBins[i] / 255; // 0..1
        const h = v * H * 0.95;
        // Gradient: amber → red as intensity rises.
        const hue = 36 - v * 20; // 36 (amber) → 16 (red-ish)
        sCtx.fillStyle = `hsl(${hue}, 90%, ${50 + v * 10}%)`;
        sCtx.fillRect(i * barW, H - h, Math.max(1, barW - 1), h);
      }

      // Labels
      sCtx.fillStyle = 'rgba(148, 163, 184, 0.85)';
      sCtx.font = '11px ui-monospace, monospace';
      sCtx.fillText('Spectrum · 0–10 kHz', 8, 14);
      sCtx.fillStyle = 'rgba(245, 158, 11, 0.7)';
      for (let khz = 1; khz <= 10; khz++) {
        const x = (khz / 10) * W;
        sCtx.fillText(`${khz}k`, x - 8, H - 4);
      }
    }

    if (runningRef.current) {
      rafRef.current = requestAnimationFrame(drawLoop);
    } else {
      rafRef.current = null;
    }
  }

  // ── Slider value handlers ───────────────────────────────────────────────
  const freqSliderValue = freqToSlider(freq);

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-accent/8 px-3 py-2">
        <Activity className="h-4 w-4 text-accent" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {headerTitle}
        </span>
        <span className="text-[10px] text-muted-foreground">
          (Web Audio API · 60 fps scope + FFT)
        </span>
        {running && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            LIVE
          </span>
        )}
      </div>

      {!supported && (
        <div className="flex items-start gap-2 border-b border-error/30 bg-error/8 px-3 py-2.5 text-xs text-error">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">Web Audio API not supported</p>
            <p className="mt-0.5 text-foreground/70">
              Use a modern Chromium, Firefox, or Safari build.
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 gap-3 border-b border-border/40 bg-muted/15 px-3 py-3 lg:grid-cols-3">
        {/* Waveform selector */}
        <div>
          <Label className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Waveform
          </Label>
          <RadioGroup
            value={waveform}
            onValueChange={(v) => setWaveform(v as WaveformType)}
            className="grid grid-cols-4 gap-1.5"
            disabled={micOn || !supported}
          >
            {WAVEFORMS.map((w) => (
              <Label
                key={w.value}
                htmlFor={`wave-${w.value}`}
                className={cn(
                  'flex cursor-pointer flex-col items-center gap-1 rounded-sm border px-1 py-1.5 text-[10px] font-medium transition-colors',
                  waveform === w.value
                    ? 'border-accent/60 bg-accent/15 text-accent'
                    : 'border-border/60 bg-background hover:bg-muted/40 text-muted-foreground',
                  (micOn || !supported) && 'cursor-not-allowed opacity-50',
                )}
              >
                <RadioGroupItem
                  id={`wave-${w.value}`}
                  value={w.value}
                  className="sr-only"
                />
                {w.icon}
                <span>{w.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Frequency */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Frequency
            </Label>
            <span className="ee-mono text-[11px] text-accent">
              {formatFreq(freq)}
            </span>
          </div>
          <Slider
            min={0}
            max={FREQ_STEPS}
            step={1}
            value={[freqSliderValue]}
            onValueChange={([v]) => setFreq(sliderToFreq(v))}
            disabled={micOn || !supported}
            aria-label="Frequency (log scale, 20 Hz to 20 kHz)"
          />
          <div className="mt-1 flex justify-between text-[9px] text-muted-foreground/70">
            <span>20 Hz</span>
            <span>200 Hz</span>
            <span>2 kHz</span>
            <span>20 kHz</span>
          </div>
        </div>

        {/* Amplitude */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Amplitude
            </Label>
            <span className="ee-mono text-[11px] text-accent">
              {(amp * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[Math.round(amp * 100)]}
            onValueChange={([v]) => setAmp(v / 100)}
            disabled={micOn || !supported}
            aria-label="Amplitude (0 to 1)"
          />
          <div className="mt-1 flex justify-between text-[9px] text-muted-foreground/70">
            <span>0</span>
            <span>0.5</span>
            <span>1.0</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/40 bg-muted/15 px-3 py-2">
        <Button
          size="sm"
          onClick={handleStartStop}
          disabled={!supported}
          className={cn(
            'h-7 gap-1 px-3 text-xs font-semibold text-white',
            running
              ? 'bg-error hover:bg-error/90'
              : 'bg-accent hover:bg-accent/90',
          )}
        >
          {running ? (
            <>
              <Pause className="h-3 w-3" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-3 w-3" />
              Start
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleToggleMic}
          disabled={!supported}
          className={cn(
            'h-7 gap-1 px-2 text-xs',
            micOn
              ? 'border-error/40 text-error hover:bg-error/10'
              : 'border-warning/40 text-warning hover:bg-warning/10',
          )}
          title={micOn ? 'Turn microphone off' : 'Use microphone as signal source'}
        >
          {micOn ? (
            <>
              <MicOff className="h-3 w-3" />
              Mic on
            </>
          ) : (
            <>
              <Mic className="h-3 w-3" />
              Use mic
            </>
          )}
        </Button>
        {error && (
          <span className="text-[11px] text-error">{error}</span>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground">
          {micOn
            ? 'Mic input — gain muted to avoid feedback'
            : 'Press Start to generate audio + visualize'}
        </span>
      </div>

      {/* Scope canvas */}
      <div className="border-b border-border/40">
        <canvas
          ref={scopeCanvasRef}
          width={1000}
          height={220}
          className="block h-[200px] w-full sm:h-[220px]"
          aria-label="Oscilloscope — last 100 ms of audio samples"
        />
      </div>

      {/* Spectrum canvas */}
      <div>
        <canvas
          ref={spectrumCanvasRef}
          width={1000}
          height={180}
          className="block h-[160px] w-full sm:h-[180px]"
          aria-label="FFT spectrum — 0 to 10 kHz"
        />
      </div>

      {/* Footer note */}
      <div className="border-t border-border/40 bg-muted/15 px-3 py-2 text-[10px] text-muted-foreground">
        <span className="font-medium text-foreground/70">Note:</span>{' '}
        Generated audio is routed to the default output. The scope shows the
        last <span className="ee-mono">100 ms</span> of samples; the spectrum
        shows the FFT magnitude from <span className="ee-mono">0–10 kHz</span>.
        Try a square wave at 440 Hz and watch the odd harmonics light up the
        spectrum at 1320 Hz, 2200 Hz, 3080 Hz…
      </div>

      <span className="sr-only" aria-live="polite">
        {running
          ? micOn
            ? 'Audio running, microphone source'
            : `Audio running, ${waveform} at ${formatFreq(freq)}`
          : 'Audio stopped'}
      </span>
    </div>
  );
}
