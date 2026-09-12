'use client';

// ─────────────────────────────────────────────────────────────────────────────
// StateMachineEditor — interactive FSM editor + simulator.
//
// Phase 4/6 tool. SVG canvas where the user can:
//   • Add states (circles) by clicking the canvas
//   • Draw transitions (arrows) between states by clicking source then target
//   • Label transitions with an input condition (e.g. "1", "0", "reset")
//   • Set the initial state (Shift+click, or the "Set as initial" button)
//   • Mark states as accepting (double-click, or the "Toggle accept" button)
//   • Simulate: enter an input string (e.g. "10110"), click "Step" to advance
//     one symbol at a time. Current state highlighted green; traversed
//     transitions drawn in accent color.
//   • Export: state transition table.
//   • Presets: traffic light, vending machine, sequence detector "101".
//
// All rendering is pure SVG.
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import {
  Workflow,
  Plus,
  Trash2,
  Play,
  SkipForward,
  RotateCcw,
  Circle as CircleIcon,
  CheckCircle2,
  Star,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Types ───────────────────────────────────────────────────────────────────
interface FsmState {
  id: string;
  name: string;
  x: number;
  y: number;
  isInitial: boolean;
  isAccepting: boolean;
}

interface FsmTransition {
  id: string;
  from: string; // state id
  to: string; // state id
  label: string; // input symbol, e.g. "1" or "reset"
}

interface FsmModel {
  states: FsmState[];
  transitions: FsmTransition[];
}

// ── SVG canvas dimensions ───────────────────────────────────────────────────
const CANVAS_W = 720;
const CANVAS_H = 440;
const STATE_R = 26;

// ── Preset FSMs ─────────────────────────────────────────────────────────────
const PRESETS: Record<string, { label: string; description: string; fsm: FsmModel; example: string }> = {
  empty: {
    label: 'Empty canvas',
    description: 'Start from scratch. Click the canvas to add states.',
    example: '',
    fsm: { states: [], transitions: [] },
  },
  traffic: {
    label: 'Traffic light controller',
    description:
      '3-state FSM (RED, GREEN, YELLOW). A "timer" event cycles through. A "reset" event forces RED.',
    example: 'timer timer timer timer',
    fsm: {
      states: [
        { id: 's_red', name: 'RED', x: 180, y: 220, isInitial: true, isAccepting: false },
        { id: 's_green', name: 'GREEN', x: 380, y: 130, isInitial: false, isAccepting: false },
        { id: 's_yellow', name: 'YELLOW', x: 380, y: 310, isInitial: false, isAccepting: false },
      ],
      transitions: [
        { id: 't1', from: 's_red', to: 's_green', label: 'timer' },
        { id: 't2', from: 's_green', to: 's_yellow', label: 'timer' },
        { id: 't3', from: 's_yellow', to: 's_red', label: 'timer' },
        { id: 't4', from: 's_green', to: 's_red', label: 'reset' },
        { id: 't5', from: 's_yellow', to: 's_red', label: 'reset' },
      ],
    },
  },
  vending: {
    label: 'Vending machine (75¢)',
    description:
      'Accepts nickels (5¢), dimes (10¢), quarters (25¢). Dispenses when ≥75¢. Accepting state = product dispensed.',
    example: 'nickel dime quarter',
    fsm: {
      states: [
        { id: 's0', name: '0¢', x: 130, y: 220, isInitial: true, isAccepting: false },
        { id: 's5', name: '5¢', x: 260, y: 100, isInitial: false, isAccepting: false },
        { id: 's10', name: '10¢', x: 260, y: 220, isInitial: false, isAccepting: false },
        { id: 's25', name: '25¢', x: 260, y: 340, isInitial: false, isAccepting: false },
        { id: 's50', name: '50¢', x: 430, y: 220, isInitial: false, isAccepting: false },
        { id: 's75', name: '≥75¢', x: 590, y: 220, isInitial: false, isAccepting: true },
      ],
      transitions: [
        { id: 'v1', from: 's0', to: 's5', label: 'nickel' },
        { id: 'v2', from: 's0', to: 's10', label: 'dime' },
        { id: 'v3', from: 's0', to: 's25', label: 'quarter' },
        { id: 'v4', from: 's5', to: 's10', label: 'nickel' },
        { id: 'v5', from: 's5', to: 's25', label: 'dime' },
        { id: 'v6', from: 's5', to: 's50', label: 'quarter' },
        { id: 'v7', from: 's10', to: 's25', label: 'nickel' },
        { id: 'v8', from: 's10', to: 's50', label: 'dime' },
        { id: 'v9', from: 's10', to: 's75', label: 'quarter' },
        { id: 'v10', from: 's25', to: 's50', label: 'nickel' },
        { id: 'v11', from: 's25', to: 's50', label: 'dime' },
        { id: 'v12', from: 's25', to: 's75', label: 'quarter' },
        { id: 'v13', from: 's50', to: 's75', label: 'quarter' },
        { id: 'v14', from: 's50', to: 's75', label: 'dime' },
        { id: 'v15', from: 's50', to: 's75', label: 'nickel' },
      ],
    },
  },
  seq101: {
    label: 'Sequence detector (detect "101")',
    description:
      'Mealy-style FSM that detects the input sequence "101". Accepting state = "101" just seen. Overlapping allowed.',
    example: '1 1 0 1 0 1',
    fsm: {
      states: [
        { id: 'q0', name: 'S0 (start)', x: 160, y: 220, isInitial: true, isAccepting: false },
        { id: 'q1', name: 'S1 (saw "1")', x: 360, y: 130, isInitial: false, isAccepting: false },
        { id: 'q2', name: 'S2 (saw "10")', x: 360, y: 310, isInitial: false, isAccepting: false },
        { id: 'q3', name: 'S3 (saw "101")', x: 560, y: 220, isInitial: false, isAccepting: true },
      ],
      transitions: [
        { id: 'd1', from: 'q0', to: 'q0', label: '0' },
        { id: 'd2', from: 'q0', to: 'q1', label: '1' },
        { id: 'd3', from: 'q1', to: 'q2', label: '0' },
        { id: 'd4', from: 'q1', to: 'q1', label: '1' },
        { id: 'd5', from: 'q2', to: 'q0', label: '0' },
        { id: 'd6', from: 'q2', to: 'q3', label: '1' },
        { id: 'd7', from: 'q3', to: 'q2', label: '0' },
        { id: 'd8', from: 'q3', to: 'q1', label: '1' },
      ],
    },
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function genId(): string {
  return Math.random().toString(36).slice(2, 9);
}

/** Compute the (x, y) of the point on a state's circle in the direction of
 *  another point. Used to clip arrow endpoints to the circle boundary. */
function circleEdge(
  from: { x: number; y: number },
  to: { x: number; y: number },
  r: number
): { x: number; y: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const d = Math.hypot(dx, dy) || 1;
  return { x: from.x + (dx / d) * r, y: from.y + (dy / d) * r };
}

/** Compute the angle between two points in degrees. */
function angleDeg(from: { x: number; y: number }, to: { x: number; y: number }): number {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

// ── The component ───────────────────────────────────────────────────────────
interface Props {
  lessonTitle?: string;
  defaultPreset?: keyof typeof PRESETS;
}

export function StateMachineEditor({
  lessonTitle,
  defaultPreset = 'seq101',
}: Props) {
  const headerTitle = lessonTitle ?? 'FSM Editor & Simulator';

  const [preset, setPreset] = React.useState<keyof typeof PRESETS>(defaultPreset);
  const [fsm, setFsm] = React.useState<FsmModel>(PRESETS[defaultPreset].fsm);
  const [selectedStateId, setSelectedStateId] = React.useState<string | null>(null);
  const [pendingFromId, setPendingFromId] = React.useState<string | null>(null);

  // Simulation state.
  const [inputStr, setInputStr] = React.useState(PRESETS[defaultPreset].example);
  const [simIdx, setSimIdx] = React.useState(0);
  const [simStateId, setSimStateId] = React.useState<string | null>(null);
  const [simPath, setSimPath] = React.useState<{ sym: string; from: string; to: string; tId: string }[]>([]);
  const [simError, setSimError] = React.useState<string | null>(null);

  // Reset state when the lesson preset changes.
  React.useEffect(() => {
    setPreset(defaultPreset);
    setFsm(PRESETS[defaultPreset].fsm);
    setInputStr(PRESETS[defaultPreset].example);
    setSimIdx(0);
    setSimStateId(null);
    setSimPath([]);
    setSimError(null);
    setSelectedStateId(null);
    setPendingFromId(null);
  }, [defaultPreset]);

  // ── Canvas interactions ───────────────────────────────────────────────────
  const onCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // Only handle clicks on the empty canvas (not on a state).
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
    const n = fsm.states.length;
    const newState: FsmState = {
      id: genId(),
      name: `S${n}`,
      x,
      y,
      isInitial: fsm.states.length === 0, // first state is initial by default
      isAccepting: false,
    };
    setFsm((prev) => ({ ...prev, states: [...prev.states, newState] }));
    setSelectedStateId(newState.id);
    setPendingFromId(null);
  };

  const onStateClick = (e: React.MouseEvent, stateId: string) => {
    e.stopPropagation();
    if (pendingFromId && pendingFromId !== stateId) {
      // Create a transition from pendingFromId to stateId.
      const newT: FsmTransition = {
        id: genId(),
        from: pendingFromId,
        to: stateId,
        label: '0',
      };
      setFsm((prev) => ({ ...prev, transitions: [...prev.transitions, newT] }));
      setPendingFromId(null);
      setSelectedStateId(stateId);
    } else if (pendingFromId === stateId) {
      // Click the same state twice — cancel pending.
      setPendingFromId(null);
      setSelectedStateId(stateId);
    } else {
      // Just select.
      setSelectedStateId(stateId);
    }
  };

  const onStateDoubleClick = (e: React.MouseEvent, stateId: string) => {
    e.stopPropagation();
    // Toggle accepting.
    setFsm((prev) => ({
      ...prev,
      states: prev.states.map((s) =>
        s.id === stateId ? { ...s, isAccepting: !s.isAccepting } : s
      ),
    }));
  };

  const onStateShiftClick = (e: React.MouseEvent, stateId: string) => {
    e.stopPropagation();
    // Set as initial (exclusive).
    setFsm((prev) => ({
      ...prev,
      states: prev.states.map((s) => ({ ...s, isInitial: s.id === stateId })),
    }));
  };

  // ── State/transition editing ──────────────────────────────────────────────
  const setInitial = (stateId: string) => {
    setFsm((prev) => ({
      ...prev,
      states: prev.states.map((s) => ({ ...s, isInitial: s.id === stateId })),
    }));
  };
  const toggleAccepting = (stateId: string) => {
    setFsm((prev) => ({
      ...prev,
      states: prev.states.map((s) =>
        s.id === stateId ? { ...s, isAccepting: !s.isAccepting } : s
      ),
    }));
  };
  const renameState = (stateId: string, name: string) => {
    setFsm((prev) => ({
      ...prev,
      states: prev.states.map((s) => (s.id === stateId ? { ...s, name } : s)),
    }));
  };
  const deleteState = (stateId: string) => {
    setFsm((prev) => ({
      states: prev.states.filter((s) => s.id !== stateId),
      transitions: prev.transitions.filter(
        (t) => t.from !== stateId && t.to !== stateId
      ),
    }));
    setSelectedStateId(null);
    setPendingFromId(null);
  };
  const setTransitionLabel = (tId: string, label: string) => {
    setFsm((prev) => ({
      ...prev,
      transitions: prev.transitions.map((t) =>
        t.id === tId ? { ...t, label } : t
      ),
    }));
  };
  const deleteTransition = (tId: string) => {
    setFsm((prev) => ({
      ...prev,
      transitions: prev.transitions.filter((t) => t.id !== tId),
    }));
  };

  // ── Load a preset ─────────────────────────────────────────────────────────
  const loadPreset = (key: keyof typeof PRESETS) => {
    setPreset(key);
    // Deep-copy so we don't mutate the preset.
    const p = PRESETS[key];
    setFsm({
      states: p.fsm.states.map((s) => ({ ...s })),
      transitions: p.fsm.transitions.map((t) => ({ ...t })),
    });
    setInputStr(p.example);
    setSimIdx(0);
    setSimStateId(null);
    setSimPath([]);
    setSimError(null);
    setSelectedStateId(null);
    setPendingFromId(null);
  };

  // ── Simulation ────────────────────────────────────────────────────────────
  const tokens = React.useMemo(
    () => inputStr.trim().split(/\s+/).filter(Boolean),
    [inputStr]
  );

  const simReset = () => {
    const init = fsm.states.find((s) => s.isInitial) ?? null;
    setSimStateId(init ? init.id : null);
    setSimIdx(0);
    setSimPath([]);
    setSimError(null);
  };

  const simStep = () => {
    if (simStateId === null) {
      // Auto-initialize on first step.
      const init = fsm.states.find((s) => s.isInitial);
      if (!init) {
        setSimError('No initial state set. Shift+click a state to set it.');
        return;
      }
      setSimStateId(init.id);
    }
    if (simIdx >= tokens.length) {
      setSimError('Reached end of input. Reset to run again.');
      return;
    }
    const sym = tokens[simIdx];
    const fromId = simStateId ?? fsm.states.find((s) => s.isInitial)?.id;
    if (!fromId) {
      setSimError('No current state.');
      return;
    }
    // Find a transition from fromId whose label matches sym.
    // Allow wildcards: "*" matches anything; "?" matches anything.
    const match = fsm.transitions.find(
      (t) =>
        t.from === fromId &&
        (t.label === sym || t.label === '*' || t.label === '?')
    );
    if (!match) {
      setSimError(
        `No transition from "${fsm.states.find((s) => s.id === fromId)?.name}" on input "${sym}". FSM stuck.`
      );
      return;
    }
    setSimStateId(match.to);
    setSimPath((prev) => [
      ...prev,
      { sym, from: fromId, to: match.to, tId: match.id },
    ]);
    setSimIdx((i) => i + 1);
    setSimError(null);
  };

  const simRun = () => {
    // Step through everything.
    let curId = fsm.states.find((s) => s.isInitial)?.id ?? null;
    if (!curId) {
      setSimError('No initial state set.');
      return;
    }
    const newP: typeof simPath = [];
    for (let i = 0; i < tokens.length; i++) {
      const sym = tokens[i];
      const m = fsm.transitions.find(
        (t) =>
          t.from === curId &&
          (t.label === sym || t.label === '*' || t.label === '?')
      );
      if (!m) {
        setSimError(
          `Stuck at symbol ${i + 1} ("${sym}") — no matching transition.`
        );
        setSimStateId(curId);
        setSimPath(newP);
        setSimIdx(i);
        return;
      }
      curId = m.to;
      newP.push({ sym, from: m.from, to: m.to, tId: m.id });
    }
    setSimStateId(curId);
    setSimPath(newP);
    setSimIdx(tokens.length);
    setSimError(null);
  };

  // ── Derived rendering data ────────────────────────────────────────────────
  // Build a lookup of "edges between this pair" so we can offset parallel
  // arrows. Key = `${from}|${to}` or `${to}|${from}` (treat both as a pair).
  const pairCount = React.useMemo(() => {
    const m = new Map<string, number>();
    const idx = new Map<string, number>();
    for (const t of fsm.transitions) {
      const k = [t.from, t.to].sort().join('|');
      const n = (m.get(k) ?? 0) + 1;
      m.set(k, n);
      idx.set(t.id, n - 1); // 0-based index within the pair
    }
    return { m, idx };
  }, [fsm.transitions]);

  const selectedState = fsm.states.find((s) => s.id === selectedStateId) ?? null;
  const simState = fsm.states.find((s) => s.id === simStateId) ?? null;

  // Build the transition table.
  const inputAlphabet = React.useMemo(() => {
    const set = new Set<string>();
    fsm.transitions.forEach((t) => set.add(t.label));
    return Array.from(set).sort();
  }, [fsm.transitions]);

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas-card">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Workflow className="h-4 w-4 text-accent" aria-hidden />
        <span className="eyebrow text-[11px] text-accent">{headerTitle}</span>
        <span className="ml-auto ee-mono text-[10px] text-body-mid">
          {fsm.states.length} states · {fsm.transitions.length} transitions ·
          alphabet: {inputAlphabet.length ? inputAlphabet.join(', ') : '∅'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-[1fr_280px]">
        {/* Left: SVG canvas + simulation bar */}
        <div className="flex flex-col gap-3">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 rounded-sm border border-hairline bg-canvas-soft px-3 py-2 text-[11px]">
            <span className="eyebrow text-[10px] text-body-mid">Preset:</span>
            <select
              value={preset}
              onChange={(e) => loadPreset(e.target.value as keyof typeof PRESETS)}
              className="rounded-sm border border-hairline bg-canvas-card px-2 py-1 text-[11px] text-ink"
              aria-label="Preset FSM"
            >
              {Object.entries(PRESETS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
            <span className="ml-2 text-body-mid">
              {pendingFromId
                ? '⮕ click a target state to create a transition (or click source again to cancel)'
                : selectedState
                ? `Selected: ${selectedState.name} — Shift+click to set initial, double-click to toggle accept`
                : 'Click empty canvas to add state · Click state to select · Shift+click a state to start a transition'}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setFsm({ states: [], transitions: [] });
                setSelectedStateId(null);
                setPendingFromId(null);
                setSimStateId(null);
                setSimPath([]);
                setSimIdx(0);
              }}
              className="ml-auto h-7 gap-1 text-[10px]"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </Button>
          </div>

          {/* The SVG canvas */}
          <svg
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            className="w-full cursor-crosshair"
            style={{ background: 'var(--canvas-soft)' }}
            onClick={onCanvasClick}
            role="img"
            aria-label="FSM canvas — click to add states"
          >
            {/* Subtle grid */}
            <defs>
              <pattern id="fsm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="0" cy="0" r="1" fill="var(--accent)" fillOpacity="0.08" />
              </pattern>
              <marker
                id="arrow-default"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="var(--body-mid)" />
              </marker>
              <marker
                id="arrow-active"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="var(--accent)" />
              </marker>
              <marker
                id="arrow-pending"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="var(--warning)" />
              </marker>
            </defs>
            <rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="url(#fsm-grid)" />

            {/* Transitions */}
            {fsm.transitions.map((t) => {
              const from = fsm.states.find((s) => s.id === t.from);
              const to = fsm.states.find((s) => s.id === t.to);
              if (!from || !to) return null;

              // Is this transition part of the traversed sim path?
              const traversed = simPath.some((p) => p.tId === t.id);
              // Is it pending (from pendingFromId)?
              const isPending = pendingFromId === t.from;

              // Self-loop?
              if (t.from === t.to) {
                // Draw a small loop above the state.
                const cx = from.x;
                const cy = from.y - STATE_R - 18;
                const path = `M ${from.x - 6} ${from.y - STATE_R + 4} C ${cx - 28} ${cy - 8}, ${cx + 28} ${cy - 8}, ${from.x + 6} ${from.y - STATE_R + 4}`;
                return (
                  <g key={t.id}>
                    <path
                      d={path}
                      fill="none"
                      stroke={traversed ? 'var(--accent)' : isPending ? 'var(--warning)' : 'var(--body-mid)'}
                      strokeWidth={traversed ? 2.5 : 1.5}
                      markerEnd={`url(#${traversed ? 'arrow-active' : isPending ? 'arrow-pending' : 'arrow-default'})`}
                    />
                    <text
                      x={cx}
                      y={cy - 14}
                      textAnchor="middle"
                      fontSize={10}
                      fill={traversed ? 'var(--accent)' : 'var(--ink)'}
                      fontFamily="var(--font-mono)"
                    >
                      {t.label}
                    </text>
                  </g>
                );
              }

              // Compute edge endpoints, offset perpendicular if there are
              // multiple transitions between this pair.
              const k = [t.from, t.to].sort().join('|');
              const total = pairCount.m.get(k) ?? 1;
              const myIdx = pairCount.idx.get(t.id) ?? 0;
              const isReverse = t.from > t.to; // XOR-ish
              // Offset perpendicular to the line; flip sign for "reverse"
              // direction transitions so they don't overlap.
              const offSign = isReverse ? -1 : 1;
              const offset =
                total > 1 ? (myIdx - (total - 1) / 2) * 30 * offSign : 0;

              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const d = Math.hypot(dx, dy) || 1;
              const perpX = -dy / d;
              const perpY = dx / d;

              const fromEdge = circleEdge(from, to, STATE_R);
              const toEdge = circleEdge(to, from, STATE_R);
              // Control point at the midpoint plus perpendicular offset.
              const midX = (fromEdge.x + toEdge.x) / 2 + perpX * offset;
              const midY = (fromEdge.y + toEdge.y) / 2 + perpY * offset;

              const path = `M ${fromEdge.x} ${fromEdge.y} Q ${midX} ${midY} ${toEdge.x} ${toEdge.y}`;
              // Label position at the control point.
              const labelX = midX + perpX * 10;
              const labelY = midY + perpY * 10;

              return (
                <g key={t.id}>
                  <path
                    d={path}
                    fill="none"
                    stroke={traversed ? 'var(--accent)' : isPending ? 'var(--warning)' : 'var(--body-mid)'}
                    strokeWidth={traversed ? 2.5 : 1.5}
                    markerEnd={`url(#${traversed ? 'arrow-active' : isPending ? 'arrow-pending' : 'arrow-default'})`}
                  />
                  {/* Label background pill */}
                  <rect
                    x={labelX - 14}
                    y={labelY - 8}
                    width={28}
                    height={16}
                    rx={4}
                    fill="var(--canvas-soft)"
                    stroke="var(--hairline)"
                    strokeWidth={0.5}
                  />
                  <text
                    x={labelX}
                    y={labelY + 4}
                    textAnchor="middle"
                    fontSize={10}
                    fill={traversed ? 'var(--accent)' : 'var(--ink)'}
                    fontFamily="var(--font-mono)"
                  >
                    {t.label}
                  </text>
                </g>
              );
            })}

            {/* States */}
            {fsm.states.map((s) => {
              const isSelected = s.id === selectedStateId;
              const isPending = s.id === pendingFromId;
              const isSim = s.id === simStateId;
              const stroke = isSim
                ? 'var(--accent)'
                : isPending
                ? 'var(--warning)'
                : isSelected
                ? 'var(--accent)'
                : 'var(--ink)';
              const strokeW = isSim ? 3 : isSelected ? 2.5 : 1.5;
              return (
                <g
                  key={s.id}
                  transform={`translate(${s.x}, ${s.y})`}
                  onClick={(e) => {
                    if (e.shiftKey) onStateShiftClick(e, s.id);
                    else onStateClick(e, s.id);
                  }}
                  onDoubleClick={(e) => onStateDoubleClick(e, s.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Initial-state arrow */}
                  {s.isInitial && (
                    <path
                      d={`M -${STATE_R + 18} 0 L -${STATE_R + 4} 0`}
                      stroke="var(--accent)"
                      strokeWidth={2}
                      markerEnd="url(#arrow-active)"
                    />
                  )}
                  {/* Outer (accepting) ring */}
                  {s.isAccepting && (
                    <circle
                      r={STATE_R - 4}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={strokeW}
                    />
                  )}
                  {/* Main circle */}
                  <circle
                    r={STATE_R}
                    fill={
                      isSim
                        ? 'rgba(127,255,159,0.18)'
                        : isSelected
                        ? 'rgba(127,255,159,0.08)'
                        : 'var(--canvas-card)'
                    }
                    stroke={stroke}
                    strokeWidth={strokeW}
                  />
                  {/* State name (truncated) */}
                  <text
                    textAnchor="middle"
                    dy={4}
                    fontSize={11}
                    fill={isSim ? 'var(--accent)' : 'var(--ink)'}
                    fontFamily="var(--font-mono)"
                  >
                    {s.name.length > 8 ? s.name.slice(0, 7) + '…' : s.name}
                  </text>
                </g>
              );
            })}

            {/* Empty-state hint */}
            {fsm.states.length === 0 && (
              <text
                x={CANVAS_W / 2}
                y={CANVAS_H / 2}
                textAnchor="middle"
                fontSize={14}
                fill="var(--body-mid)"
                fontFamily="var(--font-mono)"
              >
                Click anywhere to add a state
              </text>
            )}
          </svg>

          {/* Simulation bar */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Simulator
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
                placeholder="Input symbols separated by spaces, e.g. 1 0 1 1 0"
                className="min-w-[260px] flex-1 rounded-sm border border-hairline bg-canvas-card px-2 py-1.5 text-[12px] text-ink"
                aria-label="Input string"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={simStep}
                className="h-8 gap-1.5 text-[11px]"
              >
                <SkipForward className="h-3.5 w-3.5" />
                Step ({simIdx}/{tokens.length})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={simRun}
                className="h-8 gap-1.5 text-[11px]"
              >
                <Play className="h-3.5 w-3.5" />
                Run
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={simReset}
                className="h-8 gap-1.5 text-[11px]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
            {simState && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                <span className="text-body-mid">Current state:</span>
                <span className="ee-mono rounded-sm border border-accent/40 bg-accent/10 px-2 py-0.5 text-accent">
                  {simState.name}
                </span>
                {simState.isAccepting && (
                  <span className="flex items-center gap-1 text-accent">
                    <CheckCircle2 className="h-3 w-3" />
                    accepting
                  </span>
                )}
                {simIdx === tokens.length && tokens.length > 0 && (
                  <span className="text-accent">
                    ✓ reached end of input
                  </span>
                )}
              </div>
            )}
            {simError && (
              <div className="mt-2 rounded-sm border border-error/40 bg-error/10 px-2 py-1.5 text-[11px] text-error">
                {simError}
              </div>
            )}
            {simPath.length > 0 && (
              <div className="mt-2 text-[10px] text-body-mid">
                <span className="ee-mono">Path:</span>{' '}
                {simPath.map((p, i) => (
                  <span key={i} className="ee-mono text-ink">
                    {fsm.states.find((s) => s.id === p.from)?.name}
                    <span className="text-accent"> —{p.sym}→ </span>
                    {fsm.states.find((s) => s.id === p.to)?.name}
                    {i < simPath.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Transition table */}
          {fsm.states.length > 0 && (
            <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
              <div className="eyebrow mb-2 text-[10px] text-body-mid">
                State transition table
              </div>
              <div className="ee-scroll overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-body-mid">
                      <th className="px-2 py-1 text-left font-normal">State</th>
                      <th className="px-2 py-1 text-center font-normal">Init?</th>
                      <th className="px-2 py-1 text-center font-normal">Accept?</th>
                      {inputAlphabet.map((a) => (
                        <th key={a} className="px-2 py-1 text-center font-normal">
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fsm.states.map((s) => (
                      <tr key={s.id} className="border-t border-hairline">
                        <td className="px-2 py-1 text-ink ee-mono">{s.name}</td>
                        <td className="px-2 py-1 text-center">
                          {s.isInitial ? '✓' : ''}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {s.isAccepting ? '✓' : ''}
                        </td>
                        {inputAlphabet.map((a) => {
                          const t = fsm.transitions.find(
                            (tr) =>
                              tr.from === s.id &&
                              (tr.label === a || tr.label === '*' || tr.label === '?')
                          );
                          const target = t
                            ? fsm.states.find((x) => x.id === t.to)
                            : null;
                          return (
                            <td
                              key={a}
                              className="px-2 py-1 text-center ee-mono text-accent"
                            >
                              {target ? target.name : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: state editor + transition list */}
        <div className="flex flex-col gap-3">
          {/* State editor */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              {selectedState ? `Edit state: ${selectedState.name}` : 'No state selected'}
            </div>
            {selectedState ? (
              <div className="space-y-2">
                <label className="block">
                  <div className="mb-1 text-[10px] text-body-mid">Name</div>
                  <input
                    type="text"
                    value={selectedState.name}
                    onChange={(e) => renameState(selectedState.id, e.target.value)}
                    className="w-full rounded-sm border border-hairline bg-canvas-card px-2 py-1 text-[12px] text-ink"
                  />
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant={selectedState.isInitial ? 'default' : 'outline'}
                    onClick={() => setInitial(selectedState.id)}
                    className="h-7 gap-1 text-[10px]"
                  >
                    <Star className="h-3 w-3" />
                    {selectedState.isInitial ? 'Initial ✓' : 'Set initial'}
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedState.isAccepting ? 'default' : 'outline'}
                    onClick={() => toggleAccepting(selectedState.id)}
                    className="h-7 gap-1 text-[10px]"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {selectedState.isAccepting ? 'Accepting ✓' : 'Toggle accept'}
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingFromId(selectedState.id)}
                  className="h-7 w-full gap-1 text-[10px]"
                >
                  <Plus className="h-3 w-3" />
                  Start transition from here
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteState(selectedState.id)}
                  className="h-7 w-full gap-1 text-[10px] text-error hover:text-error"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete state
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5 text-[10px] text-body-mid">
                <p className="flex items-start gap-1.5">
                  <CircleIcon className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                  <span>Click empty canvas → add state</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <CircleIcon className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                  <span>Click a state → select it</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <CircleIcon className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                  <span>Shift+click state → set as initial</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <CircleIcon className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                  <span>Double-click state → toggle accepting</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <CircleIcon className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                  <span>Use &ldquo;Start transition&rdquo; button then click a target state</span>
                </p>
              </div>
            )}
          </div>

          {/* Transition list */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Transitions ({fsm.transitions.length})
            </div>
            {fsm.transitions.length === 0 ? (
              <p className="text-[10px] text-body-mid">
                No transitions yet. Select a state, click &ldquo;Start transition&rdquo;,
                then click a target state.
              </p>
            ) : (
              <ul className="ee-scroll max-h-[280px] space-y-1 overflow-y-auto">
                {fsm.transitions.map((t) => {
                  const from = fsm.states.find((s) => s.id === t.from);
                  const to = fsm.states.find((s) => s.id === t.to);
                  if (!from || !to) return null;
                  return (
                    <li
                      key={t.id}
                      className="flex items-center gap-1 rounded-sm border border-hairline bg-canvas-card px-2 py-1 text-[10px]"
                    >
                      <span className="ee-mono text-ink">{from.name}</span>
                      <span className="text-body-mid">→</span>
                      <input
                        type="text"
                        value={t.label}
                        onChange={(e) => setTransitionLabel(t.id, e.target.value)}
                        className="w-12 rounded-sm border border-hairline bg-canvas-soft px-1 py-0.5 text-center text-[10px] text-accent"
                        aria-label="Transition label"
                      />
                      <span className="text-body-mid">→</span>
                      <span className="ee-mono text-ink">{to.name}</span>
                      <button
                        onClick={() => deleteTransition(t.id)}
                        className="ml-auto text-body-mid hover:text-error"
                        aria-label="Delete transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Preset description */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              About this preset
            </div>
            <p className="text-[11px] leading-relaxed text-body">
              {PRESETS[preset].description}
            </p>
            {PRESETS[preset].example && (
              <p className="mt-2 text-[10px] text-body-mid">
                Example input string:{' '}
                <span className="ee-mono text-accent">
                  &ldquo;{PRESETS[preset].example}&rdquo;
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hint footer */}
      <div className="flex items-start gap-2 border-t border-hairline bg-canvas-soft px-3 py-2 text-[10px] text-body-mid">
        <Activity className="mt-0.5 h-3 w-3 shrink-0 text-accent" aria-hidden />
        <p>
          Load the{' '}
          <span className="text-accent">Sequence detector (detect &ldquo;101&rdquo;)</span>{' '}
          preset and run the example input &ldquo;1 1 0 1 0 1&rdquo; — the FSM
          should reach the accepting state S3 on the final symbol. Then try
          the vending machine with &ldquo;quarter nickel quarter&rdquo; — it
          dispenses on the second quarter (≥75¢). The transition table at the
          bottom is what you&apos;d hand off to a synthesis tool to turn this
          FSM into flip-flops + logic.
        </p>
      </div>
    </div>
  );
}
