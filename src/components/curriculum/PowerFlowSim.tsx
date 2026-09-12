'use client';

// ─────────────────────────────────────────────────────────────────────────────
// PowerFlowSim — simple 5-bus power-flow simulator for power systems.
//
// Phase 10 tool. SVG canvas showing a small 5-bus power system:
//   Bus 1: slack (reference, V=1.00 pu)
//   Bus 2: generator (PV bus — P and |V| set by AVR)
//   Bus 3, 4, 5: load buses (PQ — P specified, |V| computed)
//
// The user adjusts per-bus generation/load (sliders in MW) and sees line
// flows (arrows with magnitude), bus voltages (color-coded green/amber/red),
// and line losses (I²R). When a line is overloaded (>100% capacity) it
// turns red. Clicking a line trips it; the system re-solves and either
// redistributes the power or collapses if a load bus gets islanded.
//
// Solver: DC power flow (B-matrix method) for line MW flows, plus a simple
// Gauss-Seidel AC update for bus voltages. Total generation, total load,
// total losses, and system frequency (50/60 Hz) are shown.
//
// All rendering is pure SVG.
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import {
  Zap,
  Activity,
  RotateCcw,
  TriangleAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Types ───────────────────────────────────────────────────────────────────
type BusType = 'slack' | 'gen' | 'load';

interface Bus {
  id: number;
  name: string;
  type: BusType;
  x: number;
  y: number;
  /** Generation setpoint (MW). Slack's generation is computed (balance). */
  pGen: number;
  /** Load (MW). */
  pLoad: number;
  /** Computed voltage (pu). 1.00 = nominal. */
  v: number;
  /** Computed phase angle (rad). Slack = 0. */
  theta: number;
  /** Setpoint voltage for gen/slack buses (pu). */
  vSetpoint: number;
  /** True if the bus is electrically islanded (no path to a generator). */
  islanded: boolean;
}

interface Line {
  id: number;
  from: number;
  to: number;
  /** Resistance (per-unit). */
  r: number;
  /** Reactance (per-unit). */
  x: number;
  /** Capacity (MW). */
  capMw: number;
  /** True if tripped. */
  tripped: boolean;
  /** Computed flow (MW, positive = from→to). */
  flow: number;
  /** Computed loss (MW). */
  loss: number;
}

// ── Canvas ──────────────────────────────────────────────────────────────────
const CANVAS_W = 720;
const CANVAS_H = 460;

// ── Initial system ──────────────────────────────────────────────────────────
// Topology:
//   Bus1 (slack) ─── Bus2 (gen)
//        │              │
//        │              │
//   Bus3 (load) ── Bus4 (load) ── Bus5 (load)
//        └──────────────┘              │
//                                       │
//   (Bus3-Bus5 also exists for redundancy)
//
// Coordinates are in canvas pixels.
const INITIAL_BUSES: Bus[] = [
  { id: 0, name: 'Slack',   type: 'slack', x: 120, y: 110, pGen: 0,  pLoad: 0,   v: 1.0, theta: 0, vSetpoint: 1.00, islanded: false },
  { id: 1, name: 'Gen',     type: 'gen',   x: 600, y: 110, pGen: 100, pLoad: 0, v: 1.0, theta: 0, vSetpoint: 1.03, islanded: false },
  { id: 2, name: 'Load A',  type: 'load',  x: 120, y: 340, pGen: 0,  pLoad: 50,  v: 1.0, theta: 0, vSetpoint: 1.00, islanded: false },
  { id: 3, name: 'Load B',  type: 'load',  x: 360, y: 340, pGen: 0,  pLoad: 60,  v: 1.0, theta: 0, vSetpoint: 1.00, islanded: false },
  { id: 4, name: 'Load C',  type: 'load',  x: 600, y: 340, pGen: 0,  pLoad: 40,  v: 1.0, theta: 0, vSetpoint: 1.00, islanded: false },
];

// Line data: from, to, R (pu), X (pu), capacity (MW)
const INITIAL_LINES: Line[] = [
  { id: 0, from: 0, to: 1, r: 0.002, x: 0.02, capMw: 120, tripped: false, flow: 0, loss: 0 },
  { id: 1, from: 0, to: 2, r: 0.005, x: 0.05, capMw: 80,  tripped: false, flow: 0, loss: 0 },
  { id: 2, from: 1, to: 4, r: 0.005, x: 0.05, capMw: 80,  tripped: false, flow: 0, loss: 0 },
  { id: 3, from: 1, to: 3, r: 0.004, x: 0.04, capMw: 80,  tripped: false, flow: 0, loss: 0 },
  { id: 4, from: 2, to: 3, r: 0.003, x: 0.03, capMw: 60,  tripped: false, flow: 0, loss: 0 },
  { id: 5, from: 3, to: 4, r: 0.003, x: 0.03, capMw: 60,  tripped: false, flow: 0, loss: 0 },
  { id: 6, from: 2, to: 4, r: 0.006, x: 0.06, capMw: 50,  tripped: false, flow: 0, loss: 0 },
];

// ── Power-flow solver ───────────────────────────────────────────────────────
//
// 1. Detect islands via BFS from each generator/slack bus. Any load bus
//    not reachable from a generation bus is "islanded" — set V=0, no flow.
// 2. Build the B-matrix (susceptance) for non-islanded buses (excluding
//    slack), invert it, solve θ = B⁻¹ · P for the phase angles.
// 3. Compute line flows P_ij = (θ_i − θ_j) / X_ij.
// 4. Compute losses per line: P_loss = P_ij² · R_ij (per-unit with V≈1).
// 5. Update voltages via a simple Gauss-Seidel sweep (5 iterations of
//    V_i = (1/Y_ii)·(I_i − Σ_{j≠i} Y_ij·V_j), with PV buses fixed).

function complexInverse(re: number, im: number): { re: number; im: number } {
  const d = re * re + im * im;
  return { re: re / d, im: -im / d };
}

function solve(
  buses: Bus[],
  lines: Line[],
  baseMva: number
): { buses: Bus[]; lines: Line[]; slackGen: number; totalLoss: number; collapsed: boolean } {
  // Deep copy so we don't mutate input.
  const bs = buses.map((b) => ({ ...b }));
  const ls = lines.map((l) => ({ ...l }));

  // 1. Detect islands — BFS from each non-islanded gen/slack bus.
  const adj: number[][] = bs.map(() => []);
  for (const l of ls) {
    if (l.tripped) continue;
    adj[l.from].push(l.to);
    adj[l.to].push(l.from);
  }
  const reachable = new Set<number>();
  const queue: number[] = [];
  for (const b of bs) {
    if (b.type === 'slack' || b.type === 'gen') {
      queue.push(b.id);
      reachable.add(b.id);
    }
  }
  while (queue.length > 0) {
    const u = queue.shift()!;
    for (const v of adj[u]) {
      if (!reachable.has(v)) {
        reachable.add(v);
        queue.push(v);
      }
    }
  }
  for (const b of bs) {
    b.islanded = !reachable.has(b.id);
  }

  // 2. Build B-matrix (excluding slack bus 0).
  const n = bs.length;
  const slackId = bs.findIndex((b) => b.type === 'slack');
  const nonSlackIdx = bs.filter((b) => b.id !== slackId).map((b) => b.id);

  // B[i][j] = sum of 1/X over all lines between i and j (off-diagonal)
  // B[i][i] = -sum_{j≠i} B[i][j] (diagonal)
  const size = nonSlackIdx.length;
  const B: number[][] = Array.from({ length: size }, () =>
    Array(size).fill(0)
  );
  const idToPos = new Map<number, number>();
  nonSlackIdx.forEach((id, i) => idToPos.set(id, i));

  for (const l of ls) {
    if (l.tripped) continue;
    if (l.x === 0) continue;
    const b = 1 / l.x;
    const iPos = idToPos.get(l.from);
    const jPos = idToPos.get(l.to);
    if (iPos !== undefined && jPos !== undefined) {
      // Both endpoints are non-slack — contributes to off-diagonal and
      // both diagonals.
      B[iPos][jPos] -= b;
      B[jPos][iPos] -= b;
    } else if (iPos !== undefined || jPos !== undefined) {
      // One endpoint is the slack bus — contributes only to the
      // non-slack bus's diagonal (slack's θ is fixed at 0, so it acts
      // as a "ground" with a shunt susceptance to the non-slack bus).
      const pos = iPos !== undefined ? iPos : jPos!;
      B[pos][pos] += b;
    }
  }
  for (let i = 0; i < size; i++) {
    let sum = 0;
    for (let j = 0; j < size; j++) {
      if (i !== j) sum += B[i][j];
    }
    // Diagonal: shunt from slack (already added) + sum of off-diagonals.
    // B[i][i] should be -(sum of off-diagonals) which is +sum of
    // susceptances. Plus the slack-shunt already in B[i][i].
    B[i][i] = B[i][i] - sum;
  }

  // P vector (per-unit): P_inj = (P_gen − P_load) / baseMva
  // Islanded buses contribute 0 (they're disconnected from the network).
  const P: number[] = new Array(size).fill(0);
  for (const b of bs) {
    if (b.id === slackId) continue;
    const pos = idToPos.get(b.id);
    if (pos === undefined) continue;
    if (b.islanded) {
      P[pos] = 0;
    } else {
      P[pos] = (b.pGen - b.pLoad) / baseMva;
    }
  }

  // Solve B·θ = P via Gaussian elimination (small matrix).
  const theta = gaussSolve(B, P);
  for (const b of bs) {
    if (b.id === slackId) {
      b.theta = 0;
    } else {
      const pos = idToPos.get(b.id);
      b.theta = pos !== undefined ? theta[pos] : 0;
    }
    if (b.islanded) b.theta = 0;
  }

  // 3. Line flows.
  for (const l of ls) {
    if (l.tripped) {
      l.flow = 0;
      l.loss = 0;
      continue;
    }
    const fromBus = bs.find((b) => b.id === l.from)!;
    const toBus = bs.find((b) => b.id === l.to)!;
    if (fromBus.islanded || toBus.islanded) {
      l.flow = 0;
      l.loss = 0;
      continue;
    }
    // P_ij = (θ_i − θ_j) / X_ij  (in per-unit), convert to MW.
    const flowPu = (fromBus.theta - toBus.theta) / l.x;
    l.flow = flowPu * baseMva;
    // Loss: P_loss ≈ P_flow² · R (per-unit, V≈1) — convert to MW.
    l.loss = (flowPu * flowPu * l.r) * baseMva;
  }

  // 4. Voltages.
  // Slack: V = vSetpoint. Gen: V = vSetpoint. Load: Gauss-Seidel update.
  for (const b of bs) {
    if (b.islanded) {
      b.v = 0;
    } else if (b.type === 'slack' || b.type === 'gen') {
      b.v = b.vSetpoint;
    }
  }
  // For load buses, do a simple Gauss-Seidel iteration.
  // Build Y_bus (admittance) for non-islanded buses.
  const Y: { re: number; im: number }[][] = Array.from({ length: n }, () =>
    Array(n).fill(0).map(() => ({ re: 0, im: 0 }))
  );
  for (const l of ls) {
    if (l.tripped) continue;
    if (bs[l.from].islanded || bs[l.to].islanded) continue;
    const y = complexInverse(l.r, l.x);
    Y[l.from][l.from].re += y.re; Y[l.from][l.from].im += y.im;
    Y[l.to][l.to].re += y.re;     Y[l.to][l.to].im += y.im;
    Y[l.from][l.to].re -= y.re;   Y[l.from][l.to].im -= y.im;
    Y[l.to][l.from].re -= y.re;   Y[l.to][l.from].im -= y.im;
  }
  // 5 iterations of Gauss-Seidel on load buses.
  for (let iter = 0; iter < 8; iter++) {
    for (const b of bs) {
      if (b.type !== 'load' || b.islanded) continue;
      const i = b.id;
      // V_i_new = (1/Y_ii) · ((P_i − jQ_i)/V_i* − Σ_{j≠i} Y_ij·V_j)
      // For simplicity, assume Q ≈ 0 (resistive load only).
      const p = (b.pGen - b.pLoad) / baseMva; // per-unit P injection
      // I_i = (P_i − jQ_i) / V_i*  → with Q=0: I_i = P_i / V_i (real)
      const vConj = b.v; // V_i* (V is real in our simplified model)
      const iReal = p / Math.max(0.01, vConj);
      const iImag = 0;
      // Σ_{j≠i} Y_ij · V_j (V_j is real in this simplified model)
      let sumRe = 0, sumIm = 0;
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        sumRe += Y[i][j].re * bs[j].v - Y[i][j].im * 0;
        sumIm += Y[i][j].im * bs[j].v + Y[i][j].re * 0;
      }
      // V_i_new = (1/Y_ii) · (I_i − Σ Y_ij·V_j)
      const numRe = iReal - sumRe;
      const numIm = iImag - sumIm;
      const yInv = complexInverse(Y[i][i].re, Y[i][i].im);
      const newVRe = numRe * yInv.re - numIm * yInv.im;
      const newVIm = numRe * yInv.im + numIm * yInv.re;
      // Take magnitude (we drop the imaginary part for the simplified model).
      b.v = Math.hypot(newVRe, newVIm);
      // Clamp to a sane range.
      b.v = Math.max(0.7, Math.min(1.1, b.v));
    }
  }

  // Slack generation = total load + total losses − other generation.
  const totalLoad = bs.reduce((s, b) => s + (b.islanded ? 0 : b.pLoad), 0);
  const otherGen = bs.reduce(
    (s, b) => s + (b.type !== 'slack' && !b.islanded ? b.pGen : 0),
    0
  );
  const totalLoss = ls.reduce((s, l) => s + l.loss, 0);
  const slackGen = totalLoad + totalLoss - otherGen;
  const collapsed = bs.some((b) => b.islanded && b.pLoad > 0);

  return { buses: bs, lines: ls, slackGen, totalLoss, collapsed };
}

/** Solve a small linear system Ax = b via Gaussian elimination with partial
 *  pivoting. Returns x. */
function gaussSolve(A_in: number[][], b_in: number[]): number[] {
  const n = b_in.length;
  // Augmented matrix [A | b].
  const A = A_in.map((row, i) => [...row, b_in[i]]);
  for (let col = 0; col < n; col++) {
    // Pivot.
    let maxRow = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(A[r][col]) > Math.abs(A[maxRow][col])) maxRow = r;
    }
    [A[col], A[maxRow]] = [A[maxRow], A[col]];
    // Eliminate below.
    for (let r = col + 1; r < n; r++) {
      const factor = A[r][col] / A[col][col];
      for (let c = col; c <= n; c++) {
        A[r][c] -= factor * A[col][c];
      }
    }
  }
  // Back-substitute.
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = A[i][n];
    for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j];
    x[i] = s / A[i][i];
  }
  return x;
}

// ── Component ───────────────────────────────────────────────────────────────
interface Props {
  lessonTitle?: string;
}

const BASE_MVA = 100;

export function PowerFlowSim({ lessonTitle }: Props) {
  const headerTitle = lessonTitle ?? 'Power Flow Simulator (5-bus)';

  const [buses, setBuses] = React.useState<Bus[]>(INITIAL_BUSES);
  const [lines, setLines] = React.useState<Line[]>(INITIAL_LINES);
  const [freq, setFreq] = React.useState<50 | 60>(50);
  const [selectedLineId, setSelectedLineId] = React.useState<number | null>(null);

  // Reset on first mount (so re-renders of the parent don't reset state).
  React.useEffect(() => {
    setBuses(INITIAL_BUSES.map((b) => ({ ...b })));
    setLines(INITIAL_LINES.map((l) => ({ ...l })));
  }, []);

  // Solve the power flow whenever inputs change.
  const solution = React.useMemo(
    () => solve(buses, lines, BASE_MVA),
    [buses, lines]
  );

  // Apply the solution to the displayed buses/lines.
  const solBuses = solution.buses;
  const solLines = solution.lines;

  // Aggregates.
  const totalGen = solBuses.reduce(
    (s, b) => s + (b.islanded ? 0 : b.type === 'slack' ? solution.slackGen : b.pGen),
    0
  );
  const totalLoad = solBuses.reduce((s, b) => s + (b.islanded ? 0 : b.pLoad), 0);
  const totalLoss = solution.totalLoss;

  // Frequency drift: simple heuristic — if gen > load, freq rises; if load > gen, freq falls.
  // (Real grid: Δf = ΔP / D where D is the system damping. We use a simple model.)
  const imbalance = totalGen - totalLoad;
  const freqHz = freq + Math.max(-2, Math.min(2, imbalance * 0.01));

  // ── Setters for sliders ───────────────────────────────────────────────────
  const setBusGen = (id: number, value: number) => {
    setBuses((prev) => prev.map((b) => (b.id === id ? { ...b, pGen: value } : b)));
  };
  const setBusLoad = (id: number, value: number) => {
    setBuses((prev) => prev.map((b) => (b.id === id ? { ...b, pLoad: value } : b)));
  };
  const setBusVsetpoint = (id: number, value: number) => {
    setBuses((prev) => prev.map((b) => (b.id === id ? { ...b, vSetpoint: value } : b)));
  };

  // ── Trip a line ───────────────────────────────────────────────────────────
  const toggleTrip = (lineId: number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, tripped: !l.tripped } : l))
    );
  };

  const resetAll = () => {
    setBuses(INITIAL_BUSES.map((b) => ({ ...b })));
    setLines(INITIAL_LINES.map((l) => ({ ...l })));
    setSelectedLineId(null);
  };

  // ── Voltage color ─────────────────────────────────────────────────────────
  const vColor = (v: number, islanded: boolean): string => {
    if (islanded) return 'var(--error)';
    if (v >= 0.97) return 'var(--accent)';
    if (v >= 0.93) return 'var(--warning)';
    return 'var(--error)';
  };
  const vLabel = (v: number, islanded: boolean): string => {
    if (islanded) return 'DARK';
    if (v >= 0.97) return 'OK';
    if (v >= 0.93) return 'LOW';
    return 'CRIT';
  };

  // ── Line color (overload) ─────────────────────────────────────────────────
  const lineColor = (l: Line): string => {
    if (l.tripped) return 'var(--error)';
    const loading = Math.abs(l.flow) / l.capMw;
    if (loading > 1.0) return 'var(--error)';
    if (loading > 0.8) return 'var(--warning)';
    return 'var(--accent)';
  };
  const lineLoading = (l: Line): number => (l.tripped ? 0 : Math.abs(l.flow) / l.capMw);

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas-card">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Zap className="h-4 w-4 text-accent" aria-hidden />
        <span className="eyebrow text-[11px] text-accent">{headerTitle}</span>
        <span className="ml-auto ee-mono text-[10px] text-body-mid">
          {solBuses.length} buses · {solLines.length} lines · base {BASE_MVA} MVA ·{' '}
          {freq} Hz nominal
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-[1fr_280px]">
        {/* Left: SVG one-line diagram */}
        <div className="flex flex-col gap-3">
          <div className="eyebrow text-[10px] text-body-mid">
            One-line diagram (click a line to trip / restore)
          </div>
          <svg
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            className="w-full"
            style={{ background: 'var(--canvas-soft)' }}
            role="img"
            aria-label="5-bus power system one-line diagram"
          >
            <defs>
              <marker
                id="flow-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L7,3 z" fill="var(--accent)" />
              </marker>
              <marker
                id="flow-arrow-warn"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L7,3 z" fill="var(--warning)" />
              </marker>
              <marker
                id="flow-arrow-err"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L7,3 z" fill="var(--error)" />
              </marker>
            </defs>

            {/* Lines (drawn first so buses are on top) */}
            {solLines.map((l) => {
              const from = solBuses.find((b) => b.id === l.from)!;
              const to = solBuses.find((b) => b.id === l.to)!;
              const color = lineColor(l);
              const arrowId = l.tripped
                ? ''
                : color === 'var(--error)'
                ? 'flow-arrow-err'
                : color === 'var(--warning)'
                ? 'flow-arrow-warn'
                : 'flow-arrow';
              // Compute midpoint and offset for the flow arrow / label.
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const d = Math.hypot(dx, dy) || 1;
              // Direction of flow: if flow is positive (from→to), arrow points along;
              // if negative, swap.
              const sign = l.flow >= 0 ? 1 : -1;
              // Arrow position: 65% of the way from source to target.
              const arrowX = from.x + sign * 0.65 * (to.x - from.x) * sign;
              const arrowY = from.y + sign * 0.65 * (to.y - from.y) * sign;
              const ax1 = from.x + 0.4 * dx;
              const ay1 = from.y + 0.4 * dy;
              const ax2 = from.x + 0.6 * dx;
              const ay2 = from.y + 0.6 * dy;
              // For negative flow, reverse the arrow direction.
              const arrowStart = l.flow >= 0 ? { x: ax1, y: ay1 } : { x: ax2, y: ay2 };
              const arrowEnd = l.flow >= 0 ? { x: ax2, y: ay2 } : { x: ax1, y: ay1 };
              const loading = lineLoading(l);
              const isSelected = selectedLineId === l.id;
              void arrowX;
              void arrowY;
              void midX;
              void midY;
              void sign;
              return (
                <g
                  key={l.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLineId(l.id);
                    toggleTrip(l.id);
                  }}
                >
                  {/* Invisible wide hit area */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="transparent"
                    strokeWidth={14}
                  />
                  {/* Actual line */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={l.tripped ? 'var(--error)' : color}
                    strokeWidth={l.tripped ? 1 : isSelected ? 3.5 : 2.5}
                    strokeOpacity={l.tripped ? 0.4 : 1}
                    strokeDasharray={l.tripped ? '6 6' : 'none'}
                  />
                  {/* Flow arrow (only if not tripped and flow is meaningful) */}
                  {!l.tripped && Math.abs(l.flow) > 0.5 && (
                    <line
                      x1={arrowStart.x}
                      y1={arrowStart.y}
                      x2={arrowEnd.x}
                      y2={arrowEnd.y}
                      stroke={color}
                      strokeWidth={3}
                      markerEnd={`url(#${arrowId})`}
                    />
                  )}
                  {/* Flow label */}
                  <g>
                    <rect
                      x={(from.x + to.x) / 2 - 30}
                      y={(from.y + to.y) / 2 - 10}
                      width={60}
                      height={20}
                      rx={3}
                      fill="var(--canvas-soft)"
                      stroke="var(--hairline)"
                      strokeWidth={0.5}
                    />
                    <text
                      x={(from.x + to.x) / 2}
                      y={(from.y + to.y) / 2 + 4}
                      textAnchor="middle"
                      fontSize={10}
                      fill={l.tripped ? 'var(--error)' : loading > 1 ? 'var(--error)' : 'var(--ink)'}
                      fontFamily="var(--font-mono)"
                    >
                      {l.tripped
                        ? 'TRIPPED'
                        : `${Math.abs(l.flow).toFixed(1)} MW`}
                    </text>
                  </g>
                  {/* Loading percentage (small, below) */}
                  {!l.tripped && (
                    <text
                      x={(from.x + to.x) / 2}
                      y={(from.y + to.y) / 2 + 22}
                      textAnchor="middle"
                      fontSize={8}
                      fill={loading > 1 ? 'var(--error)' : loading > 0.8 ? 'var(--warning)' : 'var(--body-mid)'}
                      fontFamily="var(--font-mono)"
                    >
                      {(loading * 100).toFixed(0)}% · loss {l.loss.toFixed(2)} MW
                    </text>
                  )}
                </g>
              );
            })}

            {/* Buses */}
            {solBuses.map((b) => {
              const vcol = vColor(b.v, b.islanded);
              const vlbl = vLabel(b.v, b.islanded);
              return (
                <g key={b.id} transform={`translate(${b.x}, ${b.y})`}>
                  {/* Bus circle */}
                  <circle
                    r={26}
                    fill={b.islanded ? 'var(--canvas-mid)' : 'var(--canvas-card)'}
                    stroke={vcol}
                    strokeWidth={2.5}
                  />
                  {/* Type icon (inside circle): gen=lightning, load=down-arrow, slack=star */}
                  {b.type === 'slack' && (
                    <text textAnchor="middle" dy={4} fontSize={14} fill={vcol} fontFamily="var(--font-mono)">
                      ⊕
                    </text>
                  )}
                  {b.type === 'gen' && (
                    <text textAnchor="middle" dy={4} fontSize={13} fill={vcol} fontFamily="var(--font-mono)">
                      ⚡
                    </text>
                  )}
                  {b.type === 'load' && (
                    <text textAnchor="middle" dy={5} fontSize={13} fill={vcol} fontFamily="var(--font-mono)">
                      ▼
                    </text>
                  )}
                  {/* Bus name above */}
                  <text textAnchor="middle" y={-32} fontSize={11} fill="var(--ink)" fontFamily="var(--font-mono)">
                    {b.name}
                  </text>
                  {/* Voltage + label below */}
                  <text textAnchor="middle" y={42} fontSize={10} fill={vcol} fontFamily="var(--font-mono)">
                    {b.islanded ? 'ISLANDED' : `${b.v.toFixed(3)} pu`}
                  </text>
                  <text textAnchor="middle" y={54} fontSize={9} fill={vcol} fontFamily="var(--font-mono)">
                    {vlbl}
                  </text>
                  {/* Gen/load values */}
                  <text textAnchor="middle" y={68} fontSize={9} fill="var(--body-mid)" fontFamily="var(--font-mono)">
                    {b.type === 'slack'
                      ? `P=${solution.slackGen.toFixed(1)} MW`
                      : b.type === 'gen'
                      ? `P=${b.pGen.toFixed(0)} MW`
                      : `L=${b.pLoad.toFixed(0)} MW`}
                  </text>
                </g>
              );
            })}

            {/* Legend */}
            <g transform={`translate(10, ${CANVAS_H - 50})`}>
              <text fontSize={9} fill="var(--body-mid)" fontFamily="var(--font-mono)">
                Voltage:
              </text>
              <circle cx={56} cy={-3} r={4} fill="var(--accent)" />
              <text x={64} y={0} fontSize={9} fill="var(--body-mid)" fontFamily="var(--font-mono)">OK (≥0.97)</text>
              <circle cx={130} cy={-3} r={4} fill="var(--warning)" />
              <text x={138} y={0} fontSize={9} fill="var(--body-mid)" fontFamily="var(--font-mono)">LOW (0.93–0.97)</text>
              <circle cx={234} cy={-3} r={4} fill="var(--error)" />
              <text x={242} y={0} fontSize={9} fill="var(--body-mid)" fontFamily="var(--font-mono)">CRITICAL (&lt;0.93)</text>
              <text x={0} y={18} fontSize={9} fill="var(--body-mid)" fontFamily="var(--font-mono)">
                Lines: green=normal · amber=≥80% loaded · red=overloaded or tripped. Click a line to trip it.
              </text>
            </g>
          </svg>

          {/* System summary */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Total gen" value={`${totalGen.toFixed(1)} MW`} good={totalGen > totalLoad} />
            <Stat label="Total load" value={`${totalLoad.toFixed(1)} MW`} />
            <Stat
              label="Total loss"
              value={`${totalLoss.toFixed(2)} MW`}
              warn={totalLoss > 5}
            />
            <Stat
              label="Frequency"
              value={`${freqHz.toFixed(2)} Hz`}
              warn={Math.abs(freqHz - freq) > 0.3}
            />
          </div>

          {/* Collapse banner */}
          {solution.collapsed && (
            <div className="flex items-start gap-2 rounded-sm border border-error/40 bg-error/10 px-3 py-2 text-[11px] text-error">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>
                System partially collapsed: at least one load bus is islanded
                (no path to a generator). Restore tripped lines (click them
                again) or increase generation on the remaining connected
                generators.
              </p>
            </div>
          )}
        </div>

        {/* Right: controls */}
        <div className="flex flex-col gap-3">
          {/* System controls */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              System
            </div>
            <label className="mb-2 block">
              <div className="mb-1 text-[10px] text-body-mid">Nominal frequency</div>
              <div className="flex gap-1.5">
                {([50, 60] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFreq(f)}
                    className={
                      'flex-1 rounded-sm border px-2 py-1 text-[11px] ' +
                      (freq === f
                        ? 'border-accent/50 bg-accent/10 text-accent'
                        : 'border-hairline text-body-mid hover:bg-canvas-mid')
                    }
                  >
                    {f} Hz
                  </button>
                ))}
              </div>
            </label>
            <Button
              size="sm"
              variant="outline"
              onClick={resetAll}
              className="h-8 w-full gap-1.5 text-[11px]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset system
            </Button>
          </div>

          {/* Per-bus generation controls */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Generation (MW)
            </div>
            {solBuses
              .filter((b) => b.type === 'gen')
              .map((b) => (
                <BusSlider
                  key={b.id}
                  label={b.name}
                  value={b.pGen}
                  min={0}
                  max={200}
                  step={5}
                  unit="MW"
                  onChange={(v) => setBusGen(b.id, v)}
                />
              ))}
            {/* Slack gen is computed */}
            <div className="mt-2 rounded-sm border border-hairline bg-canvas-card px-2 py-1.5 text-[11px]">
              <div className="flex items-baseline justify-between">
                <span className="text-body-mid">Slack (computed)</span>
                <span className="ee-mono text-accent">
                  {solution.slackGen.toFixed(1)} MW
                </span>
              </div>
              <p className="mt-0.5 text-[9px] text-body-mid">
                Picks up the balance: P_slack = total_load + losses − other_gen.
              </p>
            </div>
          </div>

          {/* Per-bus load controls */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Loads (MW)
            </div>
            {solBuses
              .filter((b) => b.type === 'load')
              .map((b) => (
                <BusSlider
                  key={b.id}
                  label={b.name}
                  value={b.pLoad}
                  min={0}
                  max={150}
                  step={5}
                  unit="MW"
                  onChange={(v) => setBusLoad(b.id, v)}
                />
              ))}
          </div>

          {/* Gen bus voltage setpoint */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              AVR voltage setpoints (pu)
            </div>
            {solBuses
              .filter((b) => b.type === 'gen' || b.type === 'slack')
              .map((b) => (
                <BusSlider
                  key={b.id}
                  label={b.name}
                  value={b.vSetpoint}
                  min={0.95}
                  max={1.08}
                  step={0.005}
                  unit="pu"
                  precision={3}
                  onChange={(v) => setBusVsetpoint(b.id, v)}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Hint footer */}
      <div className="flex items-start gap-2 border-t border-hairline bg-canvas-soft px-3 py-2 text-[10px] text-body-mid">
        <Activity className="mt-0.5 h-3 w-3 shrink-0 text-accent" aria-hidden />
        <p>
          Trip the line between{' '}
          <span className="text-accent">Gen</span> and{' '}
          <span className="text-accent">Load B</span> (the middle right-hand
          line) — power redistributes through Load A and Load C. Then push
          the Load B slider up to 100 MW and watch the line{' '}
          <span className="text-accent">Load A → Load B</span> turn amber
          (over 80%) and finally red (overload). The bus voltages on the
          remote loads drop as you push more power through the same lines —
          that&apos;s the I²R loss you see in the readouts.
        </p>
      </div>
    </div>
  );
}

// ── Helper components ───────────────────────────────────────────────────────
function BusSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  precision = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  precision?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="mb-2 block">
      <div className="mb-1 flex items-baseline justify-between text-[10px] text-body-mid">
        <span>{label}</span>
        <span className="ee-mono text-ink">
          {value.toFixed(precision)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[color:var(--accent)]"
        aria-label={label}
      />
    </label>
  );
}

function Stat({
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
    <div className="rounded-sm border border-hairline bg-canvas-soft px-3 py-2">
      <div className="eyebrow text-[9px] text-body-mid">{label}</div>
      <div
        className={
          'ee-mono mt-1 text-sm ' +
          (warn ? 'text-error' : good ? 'text-accent' : 'text-ink')
        }
      >
        {value}
      </div>
    </div>
  );
}
