'use client';

/**
 * Virtual Breadboard — a 2D SVG breadboard for the EE curriculum.
 *
 * Users pick a component from the left palette (LED, Resistor, Battery,
 * Pushbutton, Wire), click holes on the breadboard to place it, connect
 * components with wires, and — when a complete battery → … → LED → battery
 * loop exists — the LED glows phosphor green and a "Circuit complete!"
 * indicator lights up in the bottom bar.
 *
 * ## Architecture
 *
 *  - Pure SVG (no three.js / canvas). The breadboard, holes, components and
 *    wires are all SVG primitives so they stay crisp at any zoom and remain
 *    inspectable in the dev-tools.
 *  - The palette / status bar / instructions are HTML overlays beside the
 *    SVG, using the v3 design tokens (bg-canvas-card, border-hairline,
 *    text-accent, eyebrow, ee-mono) so the breadboard visually belongs to
 *    the curriculum family.
 *  - Circuit solving is a pure function (`solveCircuit`) that builds a
 *    union-find over breadboard row-nodes, propagates power/ground from the
 *    battery through wires + conducting components (resistor, pressed
 *    button), and lights any LED that sees POWER on one lead and GROUND on
 *    the other. It is a simplified connectivity check, not real SPICE — but
 *    it gives the "it works!" feeling the curriculum asks for.
 *
 * ## Connectivity model (simplified)
 *
 *  - Holes in the same ROW are electrically connected (one node per row).
 *    The top "+" rail is one node, the bottom "−" rail is one node, and
 *    each main-grid row (a–j) is its own node.
 *  - 2-lead components (LED / Resistor / Battery) are placed VERTICALLY so
 *    their two leads land in two different rows (otherwise they'd short).
 *    The pushbutton is a 2×2 block spanning two rows.
 *  - Wires union two row-nodes. A conducting resistor unions its two
 *    lead-row-nodes. A pressed pushbutton unions its two rows. The battery
 *    defines POWER (+ lead row) and GROUND (− lead row) but does NOT union
 *    them. The LED is the load — its leads are never unioned; it lights
 *    when one lead is in the POWER set and the other in the GROUND set.
 *
 * ## Design-system v3 tokens
 *
 *  - Canvas background #0a0a0a, phosphor accent #7FFF9F.
 *  - The breadboard itself is white (real breadboards are white); the
 *    surrounding palette / status / instructions use the dark tokens.
 */

import * as React from 'react';
import { useState } from 'react';
import {
  Lightbulb,
  Zap,
  BatteryFull,
  Spline,
  CircleDot,
  Square,
  RotateCcw,
  Info,
  CheckCircle2,
  AlertTriangle,
  MousePointer2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

type Tool = 'led' | 'resistor' | 'battery' | 'button' | 'wire' | null;
type ComponentType = 'led' | 'resistor' | 'battery' | 'button';

interface PlacedComponent {
  id: string;
  type: ComponentType;
  /** Hole ID of lead 0 (the anchor the user clicked). */
  anchor: string;
  /** Hole IDs this component occupies (computed from anchor + offsets). */
  leads: string[];
  /** Pushbutton only — whether the button is currently pressed. */
  pressed?: boolean;
}

interface Wire {
  id: string;
  from: string; // hole ID
  to: string;   // hole ID
}

interface SolveResult {
  /** Hole IDs sitting at battery-potential (connected to + lead). */
  poweredHoles: Set<string>;
  /** Hole IDs sitting at ground-potential (connected to − lead). */
  groundedHoles: Set<string>;
  /** IDs of LEDs that are currently lit. */
  litLedIds: Set<string>;
  /** True when at least one LED is lit. */
  complete: boolean;
  /** True when POWER and GROUND collapse to the same node (short). */
  shorted: boolean;
  hasBattery: boolean;
}

// ── Breadboard layout ────────────────────────────────────────────────────────

const VB_WIDTH = 800;
const VB_HEIGHT = 400;
const NUM_COLS = 30;
const COL_X0 = 36;        // x of column 0
const COL_DX = 25;        // column pitch
const HOLE_R = 4;         // hole radius

type RowKind = 'rail-plus' | 'main-top' | 'main-bottom' | 'rail-minus';

interface RowDef {
  label: string;
  y: number;
  kind: RowKind;
}

// Top → bottom. Row label is also the node id (holes in the same row share it).
const ROW_DEFS: RowDef[] = [
  { label: '+', y: 34,  kind: 'rail-plus' },
  { label: 'a', y: 64,  kind: 'main-top' },
  { label: 'b', y: 88,  kind: 'main-top' },
  { label: 'c', y: 112, kind: 'main-top' },
  { label: 'd', y: 136, kind: 'main-top' },
  { label: 'e', y: 160, kind: 'main-top' },
  // center channel ~ y 172-208
  { label: 'f', y: 224, kind: 'main-bottom' },
  { label: 'g', y: 248, kind: 'main-bottom' },
  { label: 'h', y: 272, kind: 'main-bottom' },
  { label: 'i', y: 296, kind: 'main-bottom' },
  { label: 'j', y: 320, kind: 'main-bottom' },
  { label: '−', y: 352, kind: 'rail-minus' },
];

const ROW_LABELS = ROW_DEFS.map((r) => r.label);
const ROW_BY_LABEL: Record<string, RowDef> = Object.fromEntries(
  ROW_DEFS.map((r) => [r.label, r]),
);

// ── Hole helpers ─────────────────────────────────────────────────────────────

function holeId(row: string, col: number): string {
  return `${row}:${col}`;
}

function parseHole(id: string): { row: string; col: number } {
  const [row, colStr] = id.split(':');
  return { row, col: Number(colStr) };
}

function holeX(col: number): number {
  return COL_X0 + col * COL_DX;
}

function holeY(row: string): number {
  return ROW_BY_LABEL[row].y;
}

function holePos(id: string): { x: number; y: number } {
  const { row, col } = parseHole(id);
  return { x: holeX(col), y: holeY(row) };
}

function rowOfHole(id: string): string {
  return parseHole(id).row;
}

function isValidHole(id: string): boolean {
  const { row, col } = parseHole(id);
  return row in ROW_BY_LABEL && col >= 0 && col < NUM_COLS;
}

/** Hole → list of every hole in the same row (the row-node members). */
function holesInRow(row: string): string[] {
  const out: string[] = [];
  for (let c = 0; c < NUM_COLS; c++) out.push(holeId(row, c));
  return out;
}

// ── Component lead geometry ──────────────────────────────────────────────────

/**
 * Compute the lead hole-IDs for a component of `type` anchored at `anchorId`.
 *  - 2-lead parts (led / resistor / battery) span two adjacent rows, same
 *    column (vertical) so the two leads land in different row-nodes.
 *  - The pushbutton is a 2×2 block: (r,c),(r,c+1),(r+1,c),(r+1,c+1).
 * Returns null when the leads would fall outside the board.
 */
function computeLeads(
  type: ComponentType,
  anchorId: string,
): string[] | null {
  const { row, col } = parseHole(anchorId);
  const rowIdx = ROW_LABELS.indexOf(row);
  if (rowIdx < 0) return null;

  if (type === 'button') {
    if (rowIdx >= ROW_LABELS.length - 1) return null;
    if (col < 0 || col > NUM_COLS - 2) return null;
    const nextRow = ROW_LABELS[rowIdx + 1];
    return [
      holeId(row, col),
      holeId(row, col + 1),
      holeId(nextRow, col),
      holeId(nextRow, col + 1),
    ];
  }

  // 2-lead vertical part
  if (rowIdx >= ROW_LABELS.length - 1) return null;
  if (col < 0 || col >= NUM_COLS) return null;
  const nextRow = ROW_LABELS[rowIdx + 1];
  return [holeId(row, col), holeId(nextRow, col)];
}

// ── Circuit solver ───────────────────────────────────────────────────────────

/** Tiny union-find over row labels. */
function makeUnionFind() {
  const parent = new Map<string, string>();
  for (const r of ROW_LABELS) parent.set(r, r);
  function find(x: string): string {
    let cur = x;
    while (parent.get(cur) !== cur) cur = parent.get(cur)!;
    // path compression
    let walk = x;
    while (parent.get(walk) !== cur) {
      const next = parent.get(walk)!;
      parent.set(walk, cur);
      walk = next;
    }
    return cur;
  }
  function union(a: string, b: string): void {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }
  return { find, union };
}

const EMPTY_SOLVE: SolveResult = {
  poweredHoles: new Set(),
  groundedHoles: new Set(),
  litLedIds: new Set(),
  complete: false,
  shorted: false,
  hasBattery: false,
};

/**
 * Pure connectivity solver.
 *
 * POWER = the row-node containing the battery's + lead (lead 0).
 * GROUND = the row-node containing the battery's − lead (lead 1).
 * Wires, conducting resistors and pressed pushbuttons union row-nodes.
 * An LED lights when one of its leads sits in POWER and the other in
 * GROUND (either polarity — forgiving for beginners).
 */
function solveCircuit(
  components: PlacedComponent[],
  wires: Wire[],
): SolveResult {
  const uf = makeUnionFind();

  // Wires union their two endpoint rows.
  for (const w of wires) {
    if (!isValidHole(w.from) || !isValidHole(w.to)) continue;
    uf.union(rowOfHole(w.from), rowOfHole(w.to));
  }

  // Resistors conduct — union their two lead rows.
  // Pushbuttons conduct only while pressed.
  for (const c of components) {
    if (c.type === 'resistor') {
      const rows = c.leads.map(rowOfHole);
      if (rows.length === 2) uf.union(rows[0], rows[1]);
    } else if (c.type === 'button' && c.pressed) {
      const rows = [...new Set(c.leads.map(rowOfHole))];
      for (let i = 1; i < rows.length; i++) uf.union(rows[0], rows[i]);
    }
  }

  const battery = components.find((c) => c.type === 'battery');
  if (!battery || battery.leads.length < 2) return EMPTY_SOLVE;

  const plusRow = rowOfHole(battery.leads[0]);   // lead 0 = +
  const minusRow = rowOfHole(battery.leads[1]);  // lead 1 = −
  const powerRoot = uf.find(plusRow);
  const groundRoot = uf.find(minusRow);
  const shorted = powerRoot === groundRoot;

  const poweredHoles = new Set<string>();
  const groundedHoles = new Set<string>();
  for (const r of ROW_LABELS) {
    const root = uf.find(r);
    if (root === powerRoot) for (const h of holesInRow(r)) poweredHoles.add(h);
    if (root === groundRoot) for (const h of holesInRow(r)) groundedHoles.add(h);
  }

  const litLedIds = new Set<string>();
  if (!shorted) {
    for (const c of components) {
      if (c.type !== 'led') continue;
      const rows = c.leads.map(rowOfHole);
      if (rows.length < 2) continue;
      const r0 = uf.find(rows[0]);
      const r1 = uf.find(rows[1]);
      const l0Power = r0 === powerRoot;
      const l0Ground = r0 === groundRoot;
      const l1Power = r1 === powerRoot;
      const l1Ground = r1 === groundRoot;
      if ((l0Power && l1Ground) || (l0Ground && l1Power)) {
        litLedIds.add(c.id);
      }
    }
  }

  return {
    poweredHoles,
    groundedHoles,
    litLedIds,
    complete: litLedIds.size > 0,
    shorted,
    hasBattery: true,
  };
}

// ── Palette ──────────────────────────────────────────────────────────────────

interface PaletteItem {
  tool: Exclude<Tool, null>;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  swatch: React.ReactNode;
}

const LED_SWATCH = (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <line x1="9" y1="14" x2="9" y2="20" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="15" y1="14" x2="15" y2="20" stroke="#94a3b8" strokeWidth="1.5" />
    <circle cx="12" cy="10" r="5" fill="#7FFF9F" opacity="0.85" />
    <circle cx="12" cy="10" r="5" fill="none" stroke="#475569" strokeWidth="1" />
  </svg>
);
const RESISTOR_SWATCH = (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <line x1="9" y1="20" x2="9" y2="15" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="15" y1="20" x2="15" y2="15" stroke="#94a3b8" strokeWidth="1.5" />
    <rect x="7" y="6" width="10" height="9" rx="2" fill="#d4b483" stroke="#8b5e34" strokeWidth="1" />
  </svg>
);
const BATTERY_SWATCH = (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <line x1="9" y1="20" x2="9" y2="14" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="15" y1="20" x2="15" y2="14" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="6" y1="11" x2="18" y2="11" stroke="#dc2626" strokeWidth="2.5" />
    <line x1="9" y1="7" x2="15" y2="7" stroke="#2563eb" strokeWidth="2.5" />
    <text x="4" y="13" fontSize="7" fill="#dc2626" fontWeight="700">+</text>
    <text x="17" y="9" fontSize="7" fill="#2563eb" fontWeight="700">−</text>
  </svg>
);
const BUTTON_SWATCH = (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <circle cx="6" cy="18" r="1.4" fill="#64748b" />
    <circle cx="18" cy="18" r="1.4" fill="#64748b" />
    <circle cx="6" cy="6" r="1.4" fill="#64748b" />
    <circle cx="18" cy="6" r="1.4" fill="#64748b" />
    <rect x="5" y="5" width="14" height="14" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1" />
    <circle cx="12" cy="12" r="3.5" fill="#7FFF9F" />
  </svg>
);
const WIRE_SWATCH = (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <circle cx="5" cy="19" r="2" fill="#94a3b8" />
    <circle cx="19" cy="5" r="2" fill="#94a3b8" />
    <path d="M 5 19 Q 4 8 19 5" fill="none" stroke="#7FFF9F" strokeWidth="2" />
  </svg>
);

const PALETTE: PaletteItem[] = [
  { tool: 'led',      label: 'LED',      hint: '2 leads · glows when powered', icon: Lightbulb,     swatch: LED_SWATCH },
  { tool: 'resistor', label: 'Resistor', hint: '2 leads · conducts current',   icon: Zap,           swatch: RESISTOR_SWATCH },
  { tool: 'battery',  label: 'Battery',  hint: '+ and − leads · the source',   icon: BatteryFull,   swatch: BATTERY_SWATCH },
  { tool: 'button',   label: 'Pushbutton', hint: '4 leads · press to connect', icon: CircleDot,     swatch: BUTTON_SWATCH },
  { tool: 'wire',     label: 'Wire',     hint: 'click 2 holes to connect',     icon: Spline,        swatch: WIRE_SWATCH },
];

// ── Component renderers (SVG) ────────────────────────────────────────────────

/** A 2-lead component body drawn vertically between its two lead holes. */
function ComponentBody({
  comp,
  lit,
}: {
  comp: PlacedComponent;
  lit: boolean;
}) {
  const leads = comp.leads.map(holePos);
  if (leads.length < 2) return null;
  const top = leads[0];
  const bottom = leads[1];

  if (comp.type === 'led') {
    const midY = (top.y + bottom.y) / 2;
    const r = 11;
    return (
      <g>
        {/* leads */}
        <line x1={top.x} y1={top.y} x2={top.x} y2={midY - r} stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        <line x1={bottom.x} y1={bottom.y} x2={bottom.x} y2={midY + r} stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        {/* + / − lead markers (anode = top +, cathode = bottom −) */}
        <text x={top.x + 8} y={midY - r + 2} fontSize="9" fill="#dc2626" fontWeight="700" className="ee-mono">+</text>
        <text x={bottom.x + 8} y={midY + r + 4} fontSize="9" fill="#2563eb" fontWeight="700" className="ee-mono">−</text>
        {/* bulb */}
        {lit && (
          <circle cx={top.x} cy={midY} r={r + 8} fill="#7FFF9F" opacity="0.28" />
        )}
        <circle cx={top.x} cy={midY} r={r} fill={lit ? '#7FFF9F' : '#cbd5e1'} stroke={lit ? '#22c55e' : '#475569'} strokeWidth="1.5" />
        <circle cx={top.x - 3} cy={midY - 3} r={3} fill={lit ? '#ffffff' : '#94a3b8'} opacity={lit ? 0.9 : 0.5} />
      </g>
    );
  }

  if (comp.type === 'resistor') {
    const midY = (top.y + bottom.y) / 2;
    const h = 22;
    return (
      <g>
        <line x1={top.x} y1={top.y} x2={top.x} y2={midY - h / 2} stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        <line x1={bottom.x} y1={bottom.y} x2={bottom.x} y2={midY + h / 2} stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        <rect x={top.x - 7} y={midY - h / 2} width="14" height={h} rx="3" fill="#d4b483" stroke="#8b5e34" strokeWidth="1.2" />
        {/* color bands */}
        {['#7c2d12', '#92400e', '#b45309', '#d97706'].map((c, i) => (
          <rect key={i} x={top.x - 7} y={midY - h / 2 + 3 + i * 4} width="14" height="2.4" fill={c} />
        ))}
      </g>
    );
  }

  if (comp.type === 'battery') {
    const midY = (top.y + bottom.y) / 2;
    return (
      <g>
        <line x1={top.x} y1={top.y} x2={top.x} y2={midY - 8} stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        <line x1={bottom.x} y1={bottom.y} x2={bottom.x} y2={midY + 8} stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        {/* + terminal (long line) */}
        <line x1={top.x - 12} y1={midY - 8} x2={top.x + 12} y2={midY - 8} stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
        {/* − terminal (short line) */}
        <line x1={top.x - 7} y1={midY + 4} x2={top.x + 7} y2={midY + 4} stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
        <text x={top.x + 14} y={midY - 5} fontSize="9" fill="#dc2626" fontWeight="700" className="ee-mono">+</text>
        <text x={top.x + 9} y={midY + 8} fontSize="9" fill="#2563eb" fontWeight="700" className="ee-mono">−</text>
      </g>
    );
  }

  if (comp.type === 'button') {
    // 2×2 block. leads: (r,c),(r,c+1),(r+1,c),(r+1,c+1)
    const ps = leads; // 4 points
    const xs = ps.map((p) => p.x);
    const ys = ps.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const pressed = !!comp.pressed;
    return (
      <g>
        {/* lead lines from each hole to the cap */}
        {ps.map((p, i) => (
          <line key={i} x1={p.x} y1={p.y} x2={cx} y2={cy} stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
        ))}
        <rect x={cx - 11} y={cy - 8} width="22" height="16" rx="4" fill={pressed ? '#7FFF9F' : '#334155'} stroke={pressed ? '#22c55e' : '#64748b'} strokeWidth="1.2" />
        <circle cx={cx} cy={cy} r="4" fill={pressed ? '#ffffff' : '#475569'} />
      </g>
    );
  }

  return null;
}

/** A wire as a gently curved green line between two holes. */
function WirePath({ from, to }: { from: string; to: string }) {
  const a = holePos(from);
  const b = holePos(to);
  // quadratic curve bowed sideways for visibility
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // perpendicular offset
  const off = 10;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * off;
  const cy = my + (dx / len) * off;
  const d = `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
  return (
    <g>
      <path d={d} fill="none" stroke="#7FFF9F" strokeWidth="3.5" strokeLinecap="round" opacity="0.25" />
      <path d={d} fill="none" stroke="#7FFF9F" strokeWidth="2" strokeLinecap="round" />
      <circle cx={a.x} cy={a.y} r="2.5" fill="#7FFF9F" />
      <circle cx={b.x} cy={b.y} r="2.5" fill="#7FFF9F" />
    </g>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function VirtualBreadboard() {
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>(null);
  const [wirePending, setWirePending] = useState<string | null>(null); // first hole
  const [hoverHole, setHoverHole] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = React.useRef<number | null>(null);

  // derived state — circuit solution
  const solve: SolveResult = React.useMemo(
    () => solveCircuit(components, wires),
    [components, wires],
  );
  const { poweredHoles, groundedHoles, litLedIds, complete, shorted, hasBattery } = solve;

  // occupied hole lookup: holeId → component id (for hit-testing & blocking)
  const occupiedBy = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const c of components) for (const h of c.leads) m.set(h, c.id);
    return m;
  }, [components]);

  // ── actions ────────────────────────────────────────────────────────────────

  function flash(msg: string) {
    setToast(msg);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }

  function handleHoleClick(hid: string) {
    if (!isValidHole(hid)) return;

    // Wire tool: two-click connect
    if (selectedTool === 'wire') {
      if (wirePending === null) {
        setWirePending(hid);
        return;
      }
      if (wirePending === hid) {
        setWirePending(null);
        return;
      }
      // don't duplicate an existing wire
      const exists = wires.some(
        (w) =>
          (w.from === wirePending && w.to === hid) ||
          (w.from === hid && w.to === wirePending),
      );
      if (!exists) {
        setWires((ws) => [...ws, { id: nextId('w'), from: wirePending, to: hid }]);
      }
      setWirePending(null);
      return;
    }

    // Component placement
    if (selectedTool === 'led' || selectedTool === 'resistor' || selectedTool === 'battery' || selectedTool === 'button') {
      const leads = computeLeads(selectedTool, hid);
      if (!leads) {
        flash('Not enough room here — try a hole higher up.');
        return;
      }
      const blocked = leads.find((h) => occupiedBy.has(h));
      if (blocked) {
        flash('Those holes are already occupied.');
        return;
      }
      const comp: PlacedComponent = {
        id: nextId(selectedTool),
        type: selectedTool,
        anchor: hid,
        leads,
      };
      setComponents((cs) => [...cs, comp]);
      return;
    }

    // No tool selected and an empty hole — nothing to do. (Clicks on occupied
    // holes are absorbed by the component hit-area above and never reach here.)
  }

  // Only reachable when no tool is selected (the component <g> ignores
  // pointer events entirely while a tool is active, so clicks pass through to
  // the holes beneath for placement). Buttons toggle on click; other parts are
  // deleted along with any dangling wires.
  function handleComponentClick(e: React.MouseEvent, comp: PlacedComponent) {
    e.stopPropagation();
    if (comp.type === 'button') {
      toggleButton(comp.id);
      return;
    }
    setComponents((cs) => cs.filter((c) => c.id !== comp.id));
    const leadSet = new Set(comp.leads);
    setWires((ws) => ws.filter((w) => !leadSet.has(w.from) && !leadSet.has(w.to)));
    flash('Component removed.');
  }

  function handleWireClick(e: React.MouseEvent, wireId: string) {
    if (selectedTool !== null) return;
    e.stopPropagation();
    setWires((ws) => ws.filter((w) => w.id !== wireId));
    flash('Wire removed.');
  }

  function toggleButton(compId: string) {
    setComponents((cs) =>
      cs.map((c) => (c.id === compId && c.type === 'button' ? { ...c, pressed: !c.pressed } : c)),
    );
  }

  function clearAll() {
    setComponents([]);
    setWires([]);
    setWirePending(null);
    setSelectedTool(null);
    flash('Breadboard cleared.');
  }

  // ── render ─────────────────────────────────────────────────────────────────

  const instructions: string = (() => {
    if (selectedTool === 'wire') {
      return wirePending
        ? 'Click a second hole to complete the wire (click the same hole to cancel).'
        : 'Click the first hole to start a wire.';
    }
    if (selectedTool) {
      return `Click a hole to place the ${selectedTool}. Click it again with no tool selected to remove it.`;
    }
    return 'Pick a component on the left, then click a hole. With no tool picked, click a part to delete it.';
  })();

  return (
    <div className="rounded-sm border border-hairline bg-canvas-card overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* ── Palette ───────────────────────────────────────────────────── */}
        <aside className="flex shrink-0 flex-row gap-2 lg:w-[200px] lg:flex-col border-b border-hairline lg:border-b-0 lg:border-r bg-canvas-soft/40 p-3">
          <div className="eyebrow hidden lg:block text-[10px] text-body-mid mb-2">
            Palette
          </div>
          <div className="flex flex-row gap-2 lg:flex-col">
            {PALETTE.map((item) => {
              const active = selectedTool === item.tool;
              return (
                <button
                  key={item.tool}
                  type="button"
                  onClick={() => {
                    setSelectedTool(active ? null : item.tool);
                    setWirePending(null);
                  }}
                  aria-pressed={active}
                  className={cn(
                    'group flex flex-1 lg:flex-none items-center gap-2.5 rounded-sm border px-2.5 py-2 text-left transition-colors',
                    'border-hairline bg-canvas-card hover:border-accent/50 hover:bg-canvas-mid/40',
                    active && 'border-accent bg-accent/10 ring-1 ring-accent/40',
                  )}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-canvas-mid/60">
                    {item.swatch}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-[12px] font-medium leading-tight', active ? 'text-accent' : 'text-body')}>
                      {item.label}
                    </span>
                    <span className="hidden lg:block text-[10px] leading-tight text-body-mid">
                      {item.hint}
                    </span>
                  </span>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                </button>
              );
            })}
          </div>

          {/* deselect / cursor */}
          <button
            type="button"
            onClick={() => { setSelectedTool(null); setWirePending(null); }}
            aria-pressed={selectedTool === null}
            className={cn(
              'hidden lg:flex items-center gap-2 rounded-sm border border-hairline px-2.5 py-2 text-[12px] mt-1 transition-colors',
              selectedTool === null ? 'border-accent/60 bg-accent/5 text-accent' : 'bg-canvas-card text-body-mid hover:bg-canvas-mid/40',
            )}
          >
            <MousePointer2 className="h-3.5 w-3.5" />
            Select / delete
          </button>
        </aside>

        {/* ── Main area ─────────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative bg-canvas">
            <svg
              viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
              className="block w-full"
              role="img"
              aria-label="Interactive breadboard. Click holes to place the selected component or wire."
              onMouseMove={(e) => {
                const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                const scaleX = VB_WIDTH / rect.width;
                const scaleY = VB_HEIGHT / rect.height;
                setMousePos({
                  x: (e.clientX - rect.left) * scaleX,
                  y: (e.clientY - rect.top) * scaleY,
                });
              }}
              onMouseLeave={() => { setHoverHole(null); setMousePos(null); }}
            >
              {/* breadboard body */}
              <rect x="8" y="8" width={VB_WIDTH - 16} height={VB_HEIGHT - 16} rx="12" fill="#fafaf7" stroke="#e2e2dc" strokeWidth="1" />

              {/* center channel */}
              <rect x="8" y="184" width={VB_WIDTH - 16} height="16" fill="#eceae3" />
              <text x={VB_WIDTH / 2} y="196" textAnchor="middle" fontSize="9" fill="#9ca3af" className="ee-mono" letterSpacing="2">
                SVX BREADBOARD · 2D
              </text>

              {/* powered / grounded row bands (subtle) */}
              {ROW_DEFS.map((r) => {
                const sample = holeId(r.label, 0);
                const isPowered = poweredHoles.has(sample);
                const isGround = groundedHoles.has(sample);
                if (!isPowered && !isGround) return null;
                const fill = isPowered ? '#dc2626' : '#2563eb';
                return (
                  <rect
                    key={`band-${r.label}`}
                    x={COL_X0 - 14}
                    y={r.y - 9}
                    width={NUM_COLS * COL_DX + 8}
                    height="18"
                    fill={fill}
                    opacity="0.10"
                  />
                );
              })}

              {/* row labels (left + right) */}
              {ROW_DEFS.map((r) => (
                <text
                  key={`lbl-${r.label}`}
                  x={COL_X0 - 14}
                  y={r.y + 3}
                  fontSize="9"
                  fill={r.kind === 'rail-plus' ? '#dc2626' : r.kind === 'rail-minus' ? '#2563eb' : '#9ca3af'}
                  className="ee-mono"
                  textAnchor="middle"
                >
                  {r.label}
                </text>
              ))}
              {ROW_DEFS.map((r) => (
                <text
                  key={`lblr-${r.label}`}
                  x={COL_X0 + (NUM_COLS - 1) * COL_DX + 14}
                  y={r.y + 3}
                  fontSize="9"
                  fill={r.kind === 'rail-plus' ? '#dc2626' : r.kind === 'rail-minus' ? '#2563eb' : '#9ca3af'}
                  className="ee-mono"
                  textAnchor="middle"
                >
                  {r.label}
                </text>
              ))}

              {/* column numbers (every 5th) */}
              {Array.from({ length: NUM_COLS }, (_, c) => c).filter((c) => c % 5 === 0).map((c) => (
                <text
                  key={`col-${c}`}
                  x={holeX(c)}
                  y={378}
                  fontSize="8"
                  fill="#9ca3af"
                  className="ee-mono"
                  textAnchor="middle"
                >
                  {c + 1}
                </text>
              ))}

              {/* holes */}
              {ROW_DEFS.flatMap((r) =>
                Array.from({ length: NUM_COLS }, (_, c) => {
                  const id = holeId(r.label, c);
                  const isPowered = poweredHoles.has(id);
                  const isGround = groundedHoles.has(id);
                  const isRailPlus = r.kind === 'rail-plus';
                  const isRailMinus = r.kind === 'rail-minus';
                  const isOccupied = occupiedBy.has(id);
                  const isHover = hoverHole === id;
                  const isPending = wirePending === id;

                  let fill = '#3a3a3a';
                  let stroke = 'none';
                  let r2 = HOLE_R;
                  if (isRailPlus) { fill = '#dc2626'; r2 = 3.5; }
                  else if (isRailMinus) { fill = '#2563eb'; r2 = 3.5; }
                  else if (isPowered) { fill = '#dc2626'; }
                  else if (isGround) { fill = '#2563eb'; }

                  return (
                    <circle
                      key={id}
                      cx={holeX(c)}
                      cy={r.y}
                      r={isHover && selectedTool ? r2 + 1.5 : r2}
                      fill={fill}
                      stroke={isPending ? '#7FFF9F' : stroke}
                      strokeWidth={isPending ? 2 : 0}
                      className="cursor-pointer transition-[r]"
                      onMouseEnter={() => setHoverHole(id)}
                      onMouseLeave={() => setHoverHole(null)}
                      onClick={() => handleHoleClick(id)}
                    >
                      <title>
                        {`hole ${r.label}${c + 1}${isOccupied ? ' (occupied)' : ''}${isPowered ? ' · POWER' : ''}${isGround ? ' · GROUND' : ''}`}
                      </title>
                    </circle>
                  );
                }),
              )}

              {/* wires */}
              {wires.map((w) => (
                <g
                  key={w.id}
                  className={selectedTool === null ? 'cursor-pointer' : ''}
                  onClick={(e) => handleWireClick(e, w.id)}
                >
                  <WirePath from={w.from} to={w.to} />
                </g>
              ))}

              {/* rubber-band wire preview */}
              {selectedTool === 'wire' && wirePending && mousePos && (
                <WirePreview from={wirePending} to={mousePos} />
              )}

              {/* components */}
              {components.map((c) => (
                <g
                  key={c.id}
                  // Ignore pointer events while a tool is active so clicks
                  // pass through to the holes beneath for placement.
                  style={{ pointerEvents: selectedTool === null ? 'auto' : 'none' }}
                  className={selectedTool === null ? 'cursor-pointer' : undefined}
                  onClick={(e) => handleComponentClick(e, c)}
                >
                  <ComponentBody comp={c} lit={litLedIds.has(c.id)} />
                  {/* invisible hit area for easier clicking */}
                  {(() => {
                    const ps = c.leads.map(holePos);
                    const xs = ps.map((p) => p.x);
                    const ys = ps.map((p) => p.y);
                    const pad = 14;
                    return (
                      <rect
                        x={Math.min(...xs) - pad}
                        y={Math.min(...ys) - pad}
                        width={Math.max(...xs) - Math.min(...xs) + pad * 2}
                        height={Math.max(...ys) - Math.min(...ys) + pad * 2}
                        fill="transparent"
                      />
                    );
                  })()}
                </g>
              ))}
            </svg>

            {/* toast */}
            {toast && (
              <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-sm border border-hairline bg-canvas-soft/95 px-3 py-1.5 text-[11px] text-body shadow-sm">
                {toast}
              </div>
            )}
          </div>

          {/* ── Bottom bar ──────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline bg-canvas-soft/40 px-3 py-2.5">
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-sm border border-hairline bg-canvas-card px-2.5 py-1.5 text-[11px] text-body hover:border-error/50 hover:text-error transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-1.5 text-[11px] text-body-mid">
              <Info className="h-3.5 w-3.5 shrink-0 text-body-mid" />
              <span className="truncate">{instructions}</span>
            </div>

            {/* status indicator */}
            <div
              className={cn(
                'inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-[11px] font-medium',
                complete
                  ? 'border-accent bg-accent/15 text-accent'
                  : shorted
                    ? 'border-error/50 bg-error/10 text-error'
                    : 'border-hairline bg-canvas-card text-body-mid',
              )}
              role="status"
              aria-live="polite"
            >
              {complete ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Circuit complete!
                </>
              ) : shorted ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Short circuit
                </>
              ) : !hasBattery ? (
                <>
                  <Square className="h-3 w-3" />
                  Add a battery
                </>
              ) : (
                <>
                  <Square className="h-3 w-3" />
                  Loop not closed
                </>
              )}
            </div>
          </div>

          {/* quick legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-hairline px-3 py-2 text-[10px] text-body-mid">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#dc2626]" /> powered (+)</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#2563eb]" /> grounded (−)</span>
            <span className="inline-flex items-center gap-1.5"><Square className="h-2.5 w-2.5" /> no tool selected → click a part to delete it (buttons toggle)</span>
            <span className="hidden md:inline">tip: place battery + on the red rail and − on the blue rail to power the whole board.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Rubber-band preview line while drawing a wire. */
function WirePreview({ from, to }: { from: string; to: { x: number; y: number } }) {
  const a = holePos(from);
  const d = `M ${a.x} ${a.y} L ${to.x} ${to.y}`;
  return (
    <path
      d={d}
      fill="none"
      stroke="#7FFF9F"
      strokeWidth="1.5"
      strokeDasharray="4 3"
      opacity="0.7"
    />
  );
}
