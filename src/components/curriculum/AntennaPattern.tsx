'use client';

// ─────────────────────────────────────────────────────────────────────────────
// AntennaPattern — interactive antenna radiation-pattern viewer.
//
// Phase 8 (RF) tool. Shows normalized radiation patterns (polar plot, dB
// scale) for five canonical antennas: isotropic, half-wave dipole,
// quarter-wave monopole, 3-element Yagi, and patch. The user picks an
// antenna type from the dropdown; multiple patterns can be overlaid for
// comparison (toggle on/off via the per-antenna buttons). A side-view SVG
// of the physical antenna renders next to the polar plot. Live readouts:
// peak gain (dBi), beamwidth (°), front-to-back ratio (dB).
//
// All antenna patterns are computed analytically in normalized form; gain
// is then added on top so the radial axis is in dBi.
//
// Rendering: Plotly.js polar scatter (lazy-loaded). The side-view SVG is
// pure SVG.
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import dynamic from 'next/dynamic';
import {
  Radio,
  Eye,
  EyeOff,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Plotly is ~1.2 MB; lazy-load only when this component mounts. ──────────
const Plot = dynamic(() => import('./PlotlyPlot'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[460px] items-center justify-center rounded-sm border border-accent/30 bg-canvas-card text-xs text-body-mid">
      Loading radiation pattern…
    </div>
  ),
});

// ── Types ───────────────────────────────────────────────────────────────────
type AntennaType =
  | 'isotropic'
  | 'dipole'
  | 'monopole'
  | 'yagi3'
  | 'patch';

interface AntennaPattern {
  id: AntennaType;
  label: string;
  shortLabel: string;
  /** Peak gain above isotropic (dBi). */
  gainDbi: number;
  /** Function: θ (deg, 0..360) → normalized power pattern (linear, 0..1).
   *  θ is measured from the +z axis (broadside) for the array antennas,
   *  but for the polar plot we want azimuth (θ in the horizontal plane).
   *  For each antenna we use a meaningful azimuthal pattern instead. */
  patternFn: (thetaDeg: number) => number;
  /** SVG element for the side view. */
  sideView: React.ReactNode;
  /** Description text. */
  description: string;
}

// ── Antenna pattern math ────────────────────────────────────────────────────
// We compute the azimuthal (horizontal-plane) power pattern for each
// antenna type, normalized to peak = 1. θ is the azimuth angle in degrees,
// measured from boresight (the direction of maximum radiation). To convert
// to dBi, we add the antenna's peak gain (in dB) to 10·log10(pattern).

function isotropicPat(thetaDeg: number): number {
  void thetaDeg;
  return 1;
}

// Half-wave dipole: in the H-plane (perpendicular to the dipole axis), the
// pattern is omnidirectional (constant). In the E-plane (containing the
// dipole axis), it's a figure-8: |cos(π/2 cos θ) / sin θ|².
// For an azimuthal polar plot, we'll show the E-plane pattern (figure-8),
// which is the most recognizable dipole footprint.
function dipolePat(thetaDeg: number): number {
  const t = (thetaDeg * Math.PI) / 180;
  const num = Math.cos((Math.PI / 2) * Math.cos(t));
  const den = Math.sin(t);
  if (Math.abs(den) < 1e-6) return 0;
  const v = num / den;
  return v * v;
}

// Quarter-wave monopole over a ground plane: same as dipole but only the
// upper hemisphere (no radiation below ground). We treat θ ∈ [0, 180] as
// above ground and θ ∈ (180, 360) as below ground → 0.
function monopolePat(thetaDeg: number): number {
  if (thetaDeg > 180) return 0;
  return dipolePat(thetaDeg);
}

// 3-element Yagi: driven element + reflector + director. We model this as
// an array factor of 3 isotropic sources with appropriate phase/magnitude,
// multiplied by the dipole element pattern.
//
// Reflector at d=−λ/4, magnitude 0.6, phase +90°
// Driven at d=0,    magnitude 1.0, phase   0°
// Director at d=+λ/4, magnitude 0.9, phase −90°
//
// Array factor AF(θ) = Σ a_n · e^{j(kd_n cos θ + β_n)}
// We then compute |AF(θ)|² and multiply by the dipole element pattern.
function yagi3Pat(thetaDeg: number): number {
  const t = (thetaDeg * Math.PI) / 180;
  // k·d for each element with d = ±λ/4 → kd = ±π/2.
  // Phase term: a_n · exp(j (k d_n cos θ + β_n))
  // Real/imag parts accumulated.
  // Reflector: a=0.6, β=+90°, kd=−π/2
  let re = 0.6 * Math.cos(-Math.PI / 2 * Math.cos(t) + Math.PI / 2);
  let im = 0.6 * Math.sin(-Math.PI / 2 * Math.cos(t) + Math.PI / 2);
  // Driven: a=1.0, β=0, kd=0
  re += 1.0 * Math.cos(0);
  im += 1.0 * Math.sin(0);
  // Director: a=0.9, β=−90°, kd=+π/2
  re += 0.9 * Math.cos(Math.PI / 2 * Math.cos(t) - Math.PI / 2);
  im += 0.9 * Math.sin(Math.PI / 2 * Math.cos(t) - Math.PI / 2);
  const afMag2 = re * re + im * im;
  // Multiply by element pattern (use cos² for the half-wave element in
  // the H-plane — actually for H-plane we'd have omnidirectional; but
  // Yagi directionality comes from the array factor, so we just use 1).
  return afMag2;
}

// Patch antenna: broadside pattern, approximately cos²(θ) for θ ∈ [−90, 90]
// and very low outside. We map θ ∈ [0, 360] to the broadside pattern.
function patchPat(thetaDeg: number): number {
  // Map thetaDeg so that 0 = boresight (front) and 180 = back of antenna.
  // cos²(θ) gives a broadside lobe.
  const t = (thetaDeg * Math.PI) / 180;
  // Front lobe (cos²), small back lobe (0.1·sin²)
  const front = Math.cos(t) * Math.cos(t);
  const back = 0.05 * Math.sin(t) * Math.sin(t);
  return front + back;
}

// ── Side-view SVGs (each is a simple side-view of the physical antenna) ─────
function IsotropicSideView() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" role="img" aria-label="Isotropic radiator">
      {/* Point source at center, with concentric "wave fronts" */}
      <circle cx={100} cy={60} r={4} fill="var(--accent)" />
      {[18, 30, 42].map((r, i) => (
        <circle
          key={r}
          cx={100}
          cy={60}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1}
          strokeOpacity={0.4 - i * 0.1}
          strokeDasharray="2 3"
        />
      ))}
      <text x={100} y={108} textAnchor="middle" fontSize={9} fill="var(--body-mid)" fontFamily="var(--font-mono)">
        point source (theoretical)
      </text>
    </svg>
  );
}

function DipoleSideView() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" role="img" aria-label="Half-wave dipole">
      {/* Vertical dipole, two rods with a feed gap */}
      <line x1={100} y1={20} x2={100} y2={54} stroke="var(--accent)" strokeWidth={3} />
      <line x1={100} y1={66} x2={100} y2={100} stroke="var(--accent)" strokeWidth={3} />
      {/* Feed gap */}
      <circle cx={100} cy={60} r={2.5} fill="var(--warning)" />
      <text x={110} y={62} fontSize={8} fill="var(--warning)" fontFamily="var(--font-mono)">feed</text>
      {/* Length label */}
      <line x1={88} y1={20} x2={88} y2={100} stroke="var(--body-mid)" strokeWidth={0.5} strokeDasharray="2 2" />
      <text x={75} y={62} textAnchor="end" fontSize={8} fill="var(--body-mid)" fontFamily="var(--font-mono)">λ/2</text>
    </svg>
  );
}

function MonopoleSideView() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" role="img" aria-label="Quarter-wave monopole">
      {/* Vertical monopole on a ground plane */}
      <line x1={100} y1={20} x2={100} y2={70} stroke="var(--accent)" strokeWidth={3} />
      <circle cx={100} cy={75} r={2.5} fill="var(--warning)" />
      {/* Ground plane */}
      <line x1={50} y1={78} x2={150} y2={78} stroke="var(--body-mid)" strokeWidth={2} />
      {/* Ground hatching */}
      {Array.from({ length: 11 }).map((_, i) => (
        <line
          key={i}
          x1={52 + i * 10}
          y1={78}
          x2={48 + i * 10}
          y2={86}
          stroke="var(--body-mid)"
          strokeWidth={0.7}
        />
      ))}
      <text x={110} y={50} fontSize={8} fill="var(--warning)" fontFamily="var(--font-mono)">feed</text>
      <text x={75} y={50} textAnchor="end" fontSize={8} fill="var(--body-mid)" fontFamily="var(--font-mono)">λ/4</text>
    </svg>
  );
}

function Yagi3SideView() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" role="img" aria-label="3-element Yagi">
      {/* Boom */}
      <line x1={50} y1={60} x2={150} y2={60} stroke="var(--body-mid)" strokeWidth={2} />
      {/* Reflector (longest, on left) */}
      <line x1={60} y1={25} x2={60} y2={95} stroke="var(--accent)" strokeWidth={3} />
      {/* Driven element (middle, with feed gap) */}
      <line x1={90} y1={30} x2={90} y2={56} stroke="var(--accent)" strokeWidth={3} />
      <line x1={90} y1={64} x2={90} y2={90} stroke="var(--accent)" strokeWidth={3} />
      <circle cx={90} cy={60} r={2} fill="var(--warning)" />
      {/* Director (shortest, on right) */}
      <line x1={130} y1={35} x2={130} y2={85} stroke="var(--accent)" strokeWidth={3} />
      {/* Labels */}
      <text x={60} y={108} textAnchor="middle" fontSize={8} fill="var(--body-mid)" fontFamily="var(--font-mono)">refl</text>
      <text x={90} y={108} textAnchor="middle" fontSize={8} fill="var(--body-mid)" fontFamily="var(--font-mono)">driv</text>
      <text x={130} y={108} textAnchor="middle" fontSize={8} fill="var(--body-mid)" fontFamily="var(--font-mono)">dir</text>
      {/* Direction arrow */}
      <path d="M 145 60 l 0 -4 l 8 4 l -8 4 z" fill="var(--accent)" opacity={0.7} />
    </svg>
  );
}

function PatchSideView() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" role="img" aria-label="Patch antenna">
      {/* Ground plane (bottom) */}
      <line x1={40} y1={90} x2={160} y2={90} stroke="var(--body-mid)" strokeWidth={2} />
      {/* Substrate (between planes) */}
      <rect x={50} y={70} width={100} height={20} fill="var(--accent-soft)" fillOpacity={0.5} stroke="var(--accent-soft)" />
      {/* Patch (top) */}
      <line x1={60} y1={70} x2={140} y2={70} stroke="var(--accent)" strokeWidth={3} />
      {/* Feed probe */}
      <line x1={100} y1={70} x2={100} y2={90} stroke="var(--warning)" strokeWidth={1.5} />
      <circle cx={100} cy={90} r={2} fill="var(--warning)" />
      {/* Direction arrow (broadside = up) */}
      <path d="M 100 50 l -4 0 l 4 -8 l 4 8 z" fill="var(--accent)" opacity={0.7} />
      <text x={100} y={108} textAnchor="middle" fontSize={8} fill="var(--body-mid)" fontFamily="var(--font-mono)">substrate + patch</text>
    </svg>
  );
}

// ── Antenna definitions ─────────────────────────────────────────────────────
const ANTENNAS: AntennaPattern[] = [
  {
    id: 'isotropic',
    label: 'Isotropic radiator',
    shortLabel: 'ISO',
    gainDbi: 0,
    patternFn: isotropicPat,
    sideView: <IsotropicSideView />,
    description:
      'Theoretical point source that radiates equally in all directions. ' +
      '0 dBi by definition. Cannot be built — used only as a reference.',
  },
  {
    id: 'dipole',
    label: 'Half-wave dipole',
    shortLabel: 'DIPOLE',
    gainDbi: 2.15,
    patternFn: dipolePat,
    sideView: <DipoleSideView />,
    description:
      'Two λ/4 rods fed at the center. Omnidirectional in the H-plane, ' +
      'figure-8 in the E-plane. 2.15 dBi gain, ~73Ω feed impedance. The ' +
      'reference antenna for dBi measurements.',
  },
  {
    id: 'monopole',
    label: 'Quarter-wave monopole',
    shortLabel: 'MONO',
    gainDbi: 5.15,
    patternFn: monopolePat,
    sideView: <MonopoleSideView />,
    description:
      'λ/4 vertical over a ground plane. Pattern is the dipole pattern ' +
      'mirrored into the upper hemisphere only (no radiation below ' +
      'ground). 5.15 dBi — twice the dipole because the ground plane ' +
      'reflects the lower half upward.',
  },
  {
    id: 'yagi3',
    label: 'Yagi 3-element',
    shortLabel: 'YAGI',
    gainDbi: 9.5,
    patternFn: yagi3Pat,
    sideView: <Yagi3SideView />,
    description:
      'Driven element + reflector + director on a boom. Directional ' +
      'with one main lobe, a small back lobe, and minor sidelobes. ' +
      '9–10 dBi is typical for a 3-element Yagi. TV and ham-radio workhorse.',
  },
  {
    id: 'patch',
    label: 'Patch antenna',
    shortLabel: 'PATCH',
    gainDbi: 7.0,
    patternFn: patchPat,
    sideView: <PatchSideView />,
    description:
      'Flat metal patch over a ground plane, separated by a dielectric ' +
      'substrate. Radiates broadside (perpendicular to the patch). 6–9 dBi, ' +
      'PCB-friendly, narrowband (~1% fractional BW). Used in WiFi / GPS.',
  },
];

// ── Compute pattern vectors for a given antenna ─────────────────────────────
function computePattern(ant: AntennaPattern): { r: number[]; theta: number[] } {
  const N = 361;
  const r: number[] = [];
  const theta: number[] = [];
  for (let i = 0; i < N; i++) {
    const thetaDeg = i; // 0..360
    theta.push(thetaDeg);
    // Convert to dBi, then clamp at -40 dB so the inner ring isn't empty.
    const norm = ant.patternFn(thetaDeg);
    const dBi = ant.gainDbi + 10 * Math.log10(Math.max(1e-6, norm));
    r.push(Math.max(-40, dBi));
  }
  return { r, theta };
}

// ── Compute summary statistics for a given antenna ──────────────────────────
function computeStats(ant: AntennaPattern): {
  beamwidth: number;
  frontToBack: number;
} {
  // Find the peak by scanning 0..359 (the peak may not be at θ=0 for
  // antennas like the dipole, which peaks at θ=90° in the E-plane).
  let peakTheta = 0;
  let peakVal = 0;
  for (let i = 0; i < 360; i++) {
    const v = ant.patternFn(i);
    if (v > peakVal) {
      peakVal = v;
      peakTheta = i;
    }
  }
  // Beamwidth: full angle where pattern drops to half power (−3 dB).
  // Walk outward from peak in both directions, find where it crosses
  // 0.5 · peakVal. Handle wrap-around.
  let halfPlus = 180;
  for (let i = 1; i <= 180; i++) {
    const t = (peakTheta + i) % 360;
    if (ant.patternFn(t) < 0.5 * peakVal) {
      halfPlus = i;
      break;
    }
  }
  let halfMinus = 180;
  for (let i = 1; i <= 180; i++) {
    const t = (peakTheta - i + 360) % 360;
    if (ant.patternFn(t) < 0.5 * peakVal) {
      halfMinus = i;
      break;
    }
  }
  const beamwidth = halfPlus + halfMinus;
  // Front-to-back: ratio of peak (front) to pattern at θ = peakTheta + 180
  // (the back lobe).
  const backTheta = (peakTheta + 180) % 360;
  const patBack = ant.patternFn(backTheta);
  const fbr = peakVal / Math.max(1e-9, patBack);
  const frontToBack = 10 * Math.log10(fbr);
  return { beamwidth, frontToBack };
}

// ── Color per antenna (for the overlay traces) ──────────────────────────────
const ANTENNA_COLORS: Record<AntennaType, string> = {
  isotropic: '#7FFF9F',
  dipole: '#FFC857',
  monopole: '#FF6B6B',
  yagi3: '#5BC0EB',
  patch: '#C792EA',
};

// ── Props ───────────────────────────────────────────────────────────────────
interface Props {
  lessonTitle?: string;
}

export function AntennaPattern({ lessonTitle }: Props) {
  const headerTitle = lessonTitle ?? 'Antenna Radiation Pattern Viewer';

  // Set of antennas currently shown (overlay). Starts with just the dipole.
  const [visible, setVisible] = React.useState<Set<AntennaType>>(
    new Set(['dipole'])
  );

  const toggle = (id: AntennaType) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // The "primary" antenna is the first visible one (used for the readouts).
  const primaryId: AntennaType = Array.from(visible)[0] ?? 'dipole';
  const primary = ANTENNAS.find((a) => a.id === primaryId)!;
  const stats = React.useMemo(() => computeStats(primary), [primary]);

  // Build Plotly traces (one per visible antenna).
  const data = React.useMemo(() => {
    const traces: any[] = [];
    for (const ant of ANTENNAS) {
      if (!visible.has(ant.id)) continue;
      const { r, theta } = computePattern(ant);
      traces.push({
        type: 'scatterpolar',
        mode: 'lines',
        r,
        theta,
        name: `${ant.shortLabel} (${ant.gainDbi.toFixed(1)} dBi)`,
        line: {
          color: ANTENNA_COLORS[ant.id],
          width: ant.id === primaryId ? 2.5 : 1.5,
        },
        hovertemplate:
          `θ=%{theta}°<br>r=%{r:.1f} dBi<br>${ant.label}<extra></extra>`,
      });
    }
    return traces;
  }, [visible, primaryId]);

  const layout = React.useMemo(
    () => ({
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: '#9aa0a6', size: 10, family: 'JetBrains Mono' },
      showlegend: true,
      legend: {
        orientation: 'h' as const,
        y: -0.15,
        x: 0.5,
        xanchor: 'center' as const,
        font: { size: 9 },
      },
      margin: { t: 20, r: 30, b: 30, l: 30 },
      polar: {
        bgcolor: 'transparent',
        radialaxis: {
          range: [-40, 12],
          tick0: -40,
          dtick: 10,
          tickfont: { size: 8, color: '#6a7079' },
          gridcolor: 'rgba(127,255,159,0.12)',
          linecolor: 'rgba(127,255,159,0.18)',
          angle: 90,
          // The "0 dB" line is what students care about — emphasize it.
          // (Plotly doesn't easily highlight a single tick; we rely on
          // the range itself to convey the dB scale.)
        },
        angularaxis: {
          tickfont: { size: 8, color: '#6a7079' },
          gridcolor: 'rgba(127,255,159,0.12)',
          linecolor: 'rgba(127,255,159,0.18)',
          rotation: 90,
          direction: 'clockwise' as const,
          tick0: 0,
          dtick: 30,
        },
      },
    }),
    []
  );

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas-card">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Radio className="h-4 w-4 text-accent" aria-hidden />
        <span className="eyebrow text-[11px] text-accent">{headerTitle}</span>
        <span className="ml-auto ee-mono text-[10px] text-body-mid">
          {visible.size} pattern{visible.size === 1 ? '' : 's'} overlaid ·
          primary: {primary.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-[1fr_280px]">
        {/* Left: polar plot + side view */}
        <div className="flex flex-col gap-3">
          <Plot
            data={data}
            layout={layout}
            config={{ displayModeBar: false, responsive: true }}
            style={{ height: 440 }}
          />
          <p className="text-[10px] text-body-mid">
            Radial axis in <span className="text-accent">dBi</span> (dB above
            isotropic). 0° = boresight (max-radiation direction). Outer ring =
            +12 dBi, inner ring = −40 dBi (clamped). Toggle antennas on the
            right to overlay their patterns for direct comparison.
          </p>

          {/* Side view of the primary antenna */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-1 text-[10px] text-body-mid">
              Side view — {primary.label}
            </div>
            <div className="h-[120px]">{primary.sideView}</div>
            <p className="mt-2 text-[11px] leading-relaxed text-body">
              {primary.description}
            </p>
          </div>
        </div>

        {/* Right: antenna picker + readouts */}
        <div className="flex flex-col gap-3">
          {/* Antenna selector */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Antennas (toggle to overlay)
            </div>
            <ul className="space-y-1.5">
              {ANTENNAS.map((ant) => {
                const isVisible = visible.has(ant.id);
                const isPrimary = ant.id === primaryId;
                return (
                  <li key={ant.id}>
                    <button
                      onClick={() => toggle(ant.id)}
                      className={
                        'flex w-full items-center gap-2 rounded-sm border px-2 py-1.5 text-left text-[11px] transition-colors ' +
                        (isVisible
                          ? isPrimary
                            ? 'border-accent/50 bg-accent/10 text-accent'
                            : 'border-accent/30 bg-accent/5 text-ink'
                          : 'border-hairline text-body-mid hover:bg-canvas-mid')
                      }
                      aria-pressed={isVisible}
                    >
                      <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: ANTENNA_COLORS[ant.id] }}
                        aria-hidden
                      />
                      <span className="flex-1 truncate">{ant.label}</span>
                      {isVisible ? (
                        <Eye className="h-3 w-3 shrink-0" aria-hidden />
                      ) : (
                        <EyeOff className="h-3 w-3 shrink-0" aria-hidden />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-[10px] text-body-mid">
              The first visible antenna is the &ldquo;primary&rdquo; (used for
              the readouts and side view). Click an antenna twice to hide it.
            </p>
          </div>

          {/* Readouts for the primary antenna */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Readouts — {primary.shortLabel}
            </div>
            <dl className="space-y-1.5 text-[11px]">
              <ReadoutRow
                label="Peak gain"
                value={`${primary.gainDbi.toFixed(2)} dBi`}
                good={primary.gainDbi >= 6}
              />
              <ReadoutRow
                label="Beamwidth (−3 dB)"
                value={`${stats.beamwidth.toFixed(1)}°`}
              />
              <ReadoutRow
                label="Front/back ratio"
                value={
                  isFinite(stats.frontToBack)
                    ? `${stats.frontToBack.toFixed(1)} dB`
                    : '∞ dB'
                }
                good={stats.frontToBack > 15}
              />
              <ReadoutRow
                label="Directivity class"
                value={
                  primary.gainDbi < 1
                    ? 'Reference'
                    : primary.gainDbi < 4
                    ? 'Omnidirectional'
                    : primary.gainDbi < 8
                    ? 'Mildly directional'
                    : 'Directional'
                }
              />
            </dl>
            {/* Comparison table */}
            <div className="mt-3 border-t border-hairline pt-2">
              <div className="eyebrow mb-1.5 text-[10px] text-body-mid">
                Quick comparison
              </div>
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-body-mid">
                    <th className="text-left font-normal">Antenna</th>
                    <th className="text-right font-normal">dBi</th>
                    <th className="text-right font-normal">BW°</th>
                  </tr>
                </thead>
                <tbody>
                  {ANTENNAS.map((ant) => {
                    const s = computeStats(ant);
                    return (
                      <tr
                        key={ant.id}
                        className={
                          ant.id === primaryId
                            ? 'text-accent'
                            : 'text-body'
                        }
                      >
                        <td className="py-0.5">{ant.shortLabel}</td>
                        <td className="text-right ee-mono">
                          {ant.gainDbi.toFixed(1)}
                        </td>
                        <td className="text-right ee-mono">
                          {s.beamwidth.toFixed(0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Hint footer */}
      <div className="flex items-start gap-2 border-t border-hairline bg-canvas-soft px-3 py-2 text-[10px] text-body-mid">
        <Activity className="mt-0.5 h-3 w-3 shrink-0 text-accent" aria-hidden />
        <p>
          Overlay the <span className="text-accent">dipole</span> and the{' '}
          <span className="text-accent">Yagi</span> — you&apos;ll see the Yagi
          trades the dipole&apos;s omnidirectional donut for a focused main
          lobe (and a small back lobe). The Yagi&apos;s 9.5 dBi vs the
          dipole&apos;s 2.15 dBi is the array-factor payoff. The patch is
          broadside — peak gain perpendicular to the board, useful when you
          want a flat antenna on a wall or PCB.
        </p>
      </div>
    </div>
  );
}

// ── Helper components ───────────────────────────────────────────────────────
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
