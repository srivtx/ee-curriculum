'use client';

import * as React from 'react';
import {
  Grid3x3,
  Trash2,
  Square,
  Dices,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Variable count ─────────────────────────────────────────────────────────
type VarCount = 2 | 3 | 4;

// ── Gray code ──────────────────────────────────────────────────────────────
//
// K-map rows and columns are ordered in Gray code so that adjacent cells
// differ in exactly one variable. We generate the standard n-bit reflected
// Gray code sequence.
function grayCode(n: number): number[] {
  if (n === 0) return [0];
  const prev = grayCode(n - 1);
  const out = [...prev, ...prev.slice().reverse().map((x) => x | (1 << (n - 1)))];
  return out;
}

// ── Minterm bit-count helpers ──────────────────────────────────────────────
//
// For an n-variable K-map, the truth table has 2^n entries. The minterm
// index is the binary combination of variable values. We need:
//   - For 2 vars: 1 row variable (A), 1 col variable (B) → 2x2 grid
//   - For 3 vars: 2 row variables (AB), 1 col variable (C) → 4x2 grid
//   - For 4 vars: 2 row variables (AB), 2 col variables (CD) → 4x4 grid
//
// The cell at (rowIdx, colIdx) corresponds to the minterm whose binary
// representation is rowGrayBits concatenated with colGrayBits (MSB first).

interface KmapLayout {
  rows: number[];
  cols: number[];
  rowVars: number;
  colVars: number;
  cellSize: number;
}

function getLayout(n: VarCount): KmapLayout {
  if (n === 2) {
    return {
      rows: grayCode(1), // [0, 1] — variable A
      cols: grayCode(1), // [0, 1] — variable B
      rowVars: 1,
      colVars: 1,
      cellSize: 96,
    };
  }
  if (n === 3) {
    return {
      rows: grayCode(2), // [0, 1, 3, 2] — variables AB
      cols: grayCode(1), // [0, 1] — variable C
      rowVars: 2,
      colVars: 1,
      cellSize: 80,
    };
  }
  return {
    rows: grayCode(2), // [0, 1, 3, 2] — variables AB
    cols: grayCode(2), // [0, 1, 3, 2] — variables CD
    rowVars: 2,
    colVars: 2,
    cellSize: 72,
  };
}

/** Variable name labels for the truth table. */
function varNames(n: VarCount): string[] {
  const all = ['A', 'B', 'C', 'D'];
  return all.slice(0, n);
}

/**
 * Compute the minterm index for a K-map cell at (rowIdx, colIdx) given the
 * layout (rows and cols Gray-code arrays and the bit-widths).
 */
function mintermAt(
  layout: KmapLayout,
  rowIdx: number,
  colIdx: number
): number {
  const rowBits = layout.rows[rowIdx];
  const colBits = layout.cols[colIdx];
  // MSB first: row vars are the high-order bits.
  return (rowBits << layout.colVars) | colBits;
}

/**
 * Convert a minterm index to its binary string of length n.
 */
function mintermBinary(m: number, n: number): string {
  return m.toString(2).padStart(n, '0');
}

// ── Prime implicant search ─────────────────────────────────────────────────
//
// We look for maximal rectangular groups of 1-cells. The rectangle's
// dimensions must be powers of 2 (1, 2, 4, 8, ...). The rectangle must wrap
// around the K-map edges (both row and column wrapping allowed, since the
// K-map is topologically a torus for adjacency purposes).
//
// Algorithm: for each possible rectangle size, slide it over every possible
// starting position (with wrap-around), check if all cells in the rectangle
// are 1, then mark the group. Sort groups by size (largest first) so the
// prime implicant selection picks the largest groups first.
interface Implicant {
  cells: number[]; // minterm indices covered
  size: number;
  rowStart: number;
  colStart: number;
  rowSize: number;
  colSize: number;
}

function findPrimeImplicants(
  values: number[], // length = 2^n, indexed by minterm
  layout: KmapLayout,
  n: VarCount
): Implicant[] {
  const nRows = layout.rows.length;
  const nCols = layout.cols.length;
  // Possible rectangle sizes — powers of 2.
  const sizes = [1, 2, 4, 8, 16].filter((s) => s <= Math.max(nRows, nCols));
  const groups: Implicant[] = [];

  // For each (rowSize, colSize) where rowSize * colSize is a power of 2
  // AND the total ≤ 2^n.
  const allSizes: [number, number][] = [];
  for (const r of [1, 2, 4]) {
    if (r > nRows) continue;
    for (const c of [1, 2, 4]) {
      if (c > nCols) continue;
      const total = r * c;
      // Total must be a power of 2.
      if ((total & (total - 1)) !== 0) continue;
      if (total > Math.pow(2, n)) continue;
      allSizes.push([r, c]);
    }
  }
  // Sort by total size descending so we find largest groups first.
  allSizes.sort((a, b) => b[0] * b[1] - a[0] * a[1]);

  // Track which 1-cells are already covered by a chosen group.
  const covered = new Set<number>();

  // We use a greedy approach: iterate over sizes (largest first), and for
  // each size, find ALL valid rectangles (with wrap). Keep a group if every
  // cell in it is 1 AND adding it expands coverage. This is not the exact
  // Quine-McCluskey algorithm, but for K-map teaching purposes it gives the
  // right answer for nearly all canonical examples.
  for (const [rSize, cSize] of allSizes) {
    for (let r0 = 0; r0 < nRows; r0++) {
      for (let c0 = 0; c0 < nCols; c0++) {
        // Collect cells in the rectangle starting at (r0, c0), size (rSize, cSize),
        // with wrap-around on both axes.
        const cells: number[] = [];
        let allOne = true;
        for (let dr = 0; dr < rSize; dr++) {
          for (let dc = 0; dc < cSize; dc++) {
            const r = (r0 + dr) % nRows;
            const c = (c0 + dc) % nCols;
            const m = mintermAt(layout, r, c);
            cells.push(m);
            if (values[m] !== 1) {
              allOne = false;
              break;
            }
          }
          if (!allOne) break;
        }
        if (!allOne) continue;
        // All cells in this rectangle are 1. Add it as a candidate group
        // if it covers at least one cell not already covered.
        const newCells = cells.filter((m) => !covered.has(m));
        if (newCells.length === 0) continue;
        // Add to covered.
        cells.forEach((m) => covered.add(m));
        groups.push({
          cells: cells.slice().sort((a, b) => a - b),
          size: rSize * cSize,
          rowStart: r0,
          colStart: c0,
          rowSize: rSize,
          colSize: cSize,
        });
      }
    }
  }
  // Sort: largest groups first.
  groups.sort((a, b) => b.size - a.size);
  return groups;
}

/**
 * For a given implicant (rectangle), compute which variables are "fixed"
 * (same value across all cells of the group) and which are "free" (vary).
 * Returns an array of { var: name, value: 0|1 } for the fixed variables —
 * these become the literals of the product term.
 */
function implicantLiterals(
  imp: Implicant,
  layout: KmapLayout,
  n: VarCount
): { name: string; value: 0 | 1 }[] {
  // For each variable (MSB first), check if all cells in the implicant have
  // the same bit value for that variable.
  const literals: { name: string; value: 0 | 1 }[] = [];
  const names = varNames(n);
  for (let v = 0; v < n; v++) {
    const bitPos = n - 1 - v; // bit position (MSB first)
    let bitVal: 0 | 1 | null = null;
    let allSame = true;
    for (const m of imp.cells) {
      const b = ((m >> bitPos) & 1) as 0 | 1;
      if (bitVal === null) bitVal = b;
      else if (b !== bitVal) {
        allSame = false;
        break;
      }
    }
    if (allSame && bitVal !== null) {
      literals.push({ name: names[v], value: bitVal });
    }
  }
  return literals;
}

function literalString(lits: { name: string; value: 0 | 1 }[]): string {
  if (lits.length === 0) return '1'; // group covers all minterms → F = 1
  return lits
    .map((l) => (l.value === 1 ? l.name : `~${l.name}`))
    .join('·');
}

// ── Group color palette (shades of green) ──────────────────────────────────
const GROUP_COLORS = [
  'rgba(127,255,159,0.45)',
  'rgba(160,255,180,0.45)',
  'rgba(95,220,130,0.45)',
  'rgba(75,200,115,0.45)',
  'rgba(55,180,100,0.45)',
  'rgba(40,160,90,0.45)',
  'rgba(200,255,150,0.45)',
  'rgba(140,230,170,0.45)',
];

// ── Component ──────────────────────────────────────────────────────────────
export interface KarnaughMapProps {
  lessonTitle?: string;
  defaultVars?: VarCount;
}

export function KarnaughMap({
  lessonTitle,
  defaultVars = 4,
}: KarnaughMapProps) {
  const headerTitle = lessonTitle ?? 'Interactive Karnaugh Map';

  const [nVars, setNVars] = React.useState<VarCount>(defaultVars);
  const nMinterms = Math.pow(2, nVars);
  // values: 0 or 1 for each minterm.
  const [values, setValues] = React.useState<number[]>(() => {
    // Default example: F(A,B,C,D) = Σm(0,1,2,5,8,9,10) for 4-var.
    // For 3-var: F = Σm(0,1,5,7). For 2-var: F = Σm(1,3).
    const v = new Array(nMinterms).fill(0);
    if (defaultVars === 4) [0, 1, 2, 5, 8, 9, 10].forEach((m) => (v[m] = 1));
    else if (defaultVars === 3) [0, 1, 5, 7].forEach((m) => (v[m] = 1));
    else if (defaultVars === 2) [1, 3].forEach((m) => (v[m] = 1));
    return v;
  });

  // When nVars changes, reset the truth table.
  React.useEffect(() => {
    setValues((prev) => {
      const newSize = Math.pow(2, nVars);
      if (prev.length === newSize) return prev;
      // Default example per variable count.
      const v = new Array(newSize).fill(0);
      if (nVars === 4) [0, 1, 2, 5, 8, 9, 10].forEach((m) => (v[m] = 1));
      else if (nVars === 3) [0, 1, 5, 7].forEach((m) => (v[m] = 1));
      else if (nVars === 2) [1, 3].forEach((m) => (v[m] = 1));
      return v;
    });
  }, [nVars]);

  const layout = React.useMemo(() => getLayout(nVars), [nVars]);

  const toggleCell = (m: number) => {
    setValues((prev) => {
      const next = prev.slice();
      next[m] = next[m] ? 0 : 1;
      return next;
    });
  };

  const clearAll = () => setValues(new Array(nMinterms).fill(0));
  const setAll = () => setValues(new Array(nMinterms).fill(1));
  const randomFill = () => {
    setValues(
      Array.from({ length: nMinterms }, () => (Math.random() < 0.5 ? 0 : 1))
    );
  };

  // ── Prime implicants ─────────────────────────────────────────────────────
  const implicants = React.useMemo(
    () => findPrimeImplicants(values, layout, nVars),
    [values, layout, nVars]
  );

  // SOP expression (sum of products).
  const sopTerms = React.useMemo(
    () =>
      implicants.map((imp) =>
        literalString(implicantLiterals(imp, layout, nVars))
      ),
    [implicants, layout, nVars]
  );

  // Original (canonical SOP) — sum of minterms where value = 1.
  const mintermsList = React.useMemo(
    () =>
      values
        .map((v, m) => (v === 1 ? m : -1))
        .filter((m) => m >= 0) as number[],
    [values]
  );

  // ── K-map rendering ──────────────────────────────────────────────────────
  const cellSize = layout.cellSize;
  const labelW = 36; // left header column width
  const labelH = 36; // top header row height
  const gridW = layout.cols.length * cellSize;
  const gridH = layout.rows.length * cellSize;
  const svgW = labelW + gridW + 12;
  const svgH = labelH + gridH + 12;

  // Variable labels above the columns (showing the variable name + Gray code bits).
  const colVarNames = varNames(nVars).slice(layout.rowVars);
  const rowVarNames = varNames(nVars).slice(0, layout.rowVars);

  // For a Gray-code index i (in the rows or cols array), show the binary
  // value of the corresponding variable bits.
  function grayToBinaryStr(grayVal: number, nBits: number): string {
    // We want the actual binary value of the row/col variable bits, not the
    // Gray code itself. Since `grayVal` is the Gray-code index (already an
    // integer in Gray-code sequence), we just convert it to binary of nBits.
    return grayVal.toString(2).padStart(nBits, '0');
  }

  // Build a cell-key → group index map (for color overlay).
  const cellGroupMap = React.useMemo(() => {
    const map = new Map<number, number>();
    implicants.forEach((imp, gi) => {
      imp.cells.forEach((m) => {
        // Don't override — a cell can belong to multiple groups; we just
        // pick the first for the color overlay.
        if (!map.has(m)) map.set(m, gi);
      });
    });
    return map;
  }, [implicants]);

  // Find cell coordinates (SVG x, y) for a minterm.
  const cellPos = (m: number): { x: number; y: number; rowIdx: number; colIdx: number } => {
    for (let r = 0; r < layout.rows.length; r++) {
      for (let c = 0; c < layout.cols.length; c++) {
        if (mintermAt(layout, r, c) === m) {
          return {
            x: labelW + c * cellSize,
            y: labelH + r * cellSize,
            rowIdx: r,
            colIdx: c,
          };
        }
      }
    }
    return { x: 0, y: 0, rowIdx: 0, colIdx: 0 };
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas-card">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Grid3x3 className="h-4 w-4 text-accent" aria-hidden />
        <span className="eyebrow text-[11px] text-accent">{headerTitle}</span>
        <span className="ml-auto ee-mono text-[10px] text-body-mid">
          {nVars} variables · {nMinterms} minterms · {layout.rows.length}×
          {layout.cols.length} grid
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3 lg:grid-cols-[auto_1fr]">
        {/* K-map SVG */}
        <div className="flex flex-col items-center">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="h-auto w-full max-w-[520px]"
            role="img"
            aria-label={`${nVars}-variable Karnaugh map`}
          >
            {/* Top-left corner — variable labels */}
            <text
              x={labelW / 2}
              y={labelH / 2 - 2}
              fontSize={10}
              fontFamily="var(--font-mono)"
              fill="var(--body-mid)"
              textAnchor="middle"
            >
              {rowVarNames.join('')}/{colVarNames.join('')}
            </text>
            <line
              x1={0}
              y1={labelH}
              x2={labelW}
              y2={labelH}
              stroke="var(--accent)"
              strokeWidth={1}
              opacity={0.4}
            />
            <line
              x1={labelW}
              y1={0}
              x2={labelW}
              y2={labelH}
              stroke="var(--accent)"
              strokeWidth={1}
              opacity={0.4}
            />

            {/* Column headers (Gray code bits) */}
            {layout.cols.map((grayVal, c) => {
              const bits = grayToBinaryStr(grayVal, layout.colVars);
              return (
                <g key={`col-${c}`}>
                  <text
                    x={labelW + c * cellSize + cellSize / 2}
                    y={labelH - 8}
                    fontSize={10}
                    fontFamily="var(--font-mono)"
                    fill="var(--body-mid)"
                    textAnchor="middle"
                  >
                    {bits}
                  </text>
                  {colVarNames.map((vn, vi) => (
                    <text
                      key={`colvar-${vi}`}
                      x={labelW + (c + 0.5) * cellSize}
                      y={12 + vi * 0}
                      fontSize={0}
                    />
                  ))}
                </g>
              );
            })}

            {/* Row headers (Gray code bits) */}
            {layout.rows.map((grayVal, r) => {
              const bits = grayToBinaryStr(grayVal, layout.rowVars);
              return (
                <text
                  key={`row-${r}`}
                  x={labelW / 2}
                  y={labelH + r * cellSize + cellSize / 2 + 4}
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                  fill="var(--body-mid)"
                  textAnchor="middle"
                >
                  {bits}
                </text>
              );
            })}

            {/* Group overlay rectangles (drawn BEFORE cells so the cell border
                sits on top). Each group rectangle wraps around the grid if
                needed — we draw it as a single rect if it doesn't wrap, or
                as multiple rects (one per visible segment) if it does. */}
            {implicants.map((imp, gi) => {
              const color = GROUP_COLORS[gi % GROUP_COLORS.length];
              const segments: { r0: number; r1: number; c0: number; c1: number }[] = [];
              // Row range (with wrap).
              let r0 = imp.rowStart;
              let r1 = (imp.rowStart + imp.rowSize - 1) % layout.rows.length;
              // If the rectangle wraps around the row axis, split into two
              // segments.
              const rowWraps = r1 < r0;
              // Column range (with wrap).
              let c0 = imp.colStart;
              let c1 = (imp.colStart + imp.colSize - 1) % layout.cols.length;
              const colWraps = c1 < c0;

              const rowRanges: [number, number][] = rowWraps
                ? [
                    [r0, layout.rows.length - 1],
                    [0, r1],
                  ]
                : [[r0, r1]];
              const colRanges: [number, number][] = colWraps
                ? [
                    [c0, layout.cols.length - 1],
                    [0, c1],
                  ]
                : [[c0, c1]];

              rowRanges.forEach(([rr0, rr1]) => {
                colRanges.forEach(([cc0, cc1]) => {
                  segments.push({
                    r0: rr0,
                    r1: rr1,
                    c0: cc0,
                    c1: cc1,
                  });
                });
              });

              return segments.map((seg, si) => {
                const x = labelW + seg.c0 * cellSize - 2;
                const y = labelH + seg.r0 * cellSize - 2;
                const w = (seg.c1 - seg.c0 + 1) * cellSize + 4;
                const h = (seg.r1 - seg.r0 + 1) * cellSize + 4;
                return (
                  <rect
                    key={`grp-${gi}-seg-${si}`}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={color}
                    stroke="var(--accent)"
                    strokeWidth={1.5}
                    rx={4}
                  />
                );
              });
            })}

            {/* Cells (clickable, drawn AFTER group overlays so the cell border
                is visible). */}
            {layout.rows.map((_, r) =>
              layout.cols.map((_, c) => {
                const m = mintermAt(layout, r, c);
                const v = values[m];
                const x = labelW + c * cellSize;
                const y = labelH + r * cellSize;
                return (
                  <g
                    key={`cell-${r}-${c}`}
                    onClick={() => toggleCell(m)}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    aria-label={`Minterm m${m}: ${v === 1 ? '1' : '0'}. Click to toggle.`}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      fill="transparent"
                      stroke="var(--body-mid)"
                      strokeWidth={1}
                      opacity={0.6}
                    />
                    <text
                      x={x + cellSize / 2}
                      y={y + cellSize / 2 + 6}
                      fontSize={cellSize * 0.32}
                      fontFamily="var(--font-mono)"
                      fontWeight="bold"
                      fill={v === 1 ? 'var(--accent)' : 'var(--body-mid)'}
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {v === 1 ? '1' : '0'}
                    </text>
                    {/* Minterm index in the top-right corner */}
                    <text
                      x={x + cellSize - 4}
                      y={y + 11}
                      fontSize={8}
                      fontFamily="var(--font-mono)"
                      fill="var(--body-mid)"
                      textAnchor="end"
                      pointerEvents="none"
                      opacity={0.6}
                    >
                      m{m}
                    </text>
                  </g>
                );
              })
            )}

            {/* Variable name labels around the perimeter */}
            {/* Row variable label (left side) */}
            {rowVarNames.length > 0 && (
              <text
                x={8}
                y={labelH + gridH / 2}
                fontSize={11}
                fontFamily="var(--font-mono)"
                fontWeight="bold"
                fill="var(--accent)"
                textAnchor="middle"
                transform={`rotate(-90 8 ${labelH + gridH / 2})`}
              >
                {rowVarNames.join('')}
              </text>
            )}
            {/* Column variable label (top) */}
            {colVarNames.length > 0 && (
              <text
                x={labelW + gridW / 2}
                y={8}
                fontSize={11}
                fontFamily="var(--font-mono)"
                fontWeight="bold"
                fill="var(--accent)"
                textAnchor="middle"
              >
                {colVarNames.join('')}
              </text>
            )}
          </svg>

          {/* Legend for group colors */}
          {implicants.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-body-mid">
              {implicants.map((imp, gi) => {
                const lits = implicantLiterals(imp, layout, nVars);
                return (
                  <span
                    key={`legend-${gi}`}
                    className="inline-flex items-center gap-1.5"
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{
                        background: GROUP_COLORS[gi % GROUP_COLORS.length],
                        border: '1px solid var(--accent)',
                      }}
                      aria-hidden
                    />
                    <span className="ee-mono">
                      {literalString(lits)}
                    </span>
                    <span className="text-body-mid">
                      (×{imp.size})
                    </span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Controls + expressions */}
        <div className="flex flex-col gap-3">
          {/* Variable count selector */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Number of variables
            </div>
            <div className="flex gap-1.5">
              {([2, 3, 4] as VarCount[]).map((nv) => (
                <Button
                  key={nv}
                  size="sm"
                  variant={nVars === nv ? 'default' : 'outline'}
                  onClick={() => setNVars(nv)}
                  className={`h-8 flex-1 text-[11px] ${
                    nVars === nv ? 'bg-accent text-canvas hover:bg-accent/90' : ''
                  }`}
                  aria-pressed={nVars === nv}
                >
                  {nv} vars
                </Button>
              ))}
            </div>
            <div className="mt-2 flex gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAll}
                className="h-7 flex-1 gap-1 text-[10px]"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={setAll}
                className="h-7 flex-1 gap-1 text-[10px]"
              >
                <Square className="h-3 w-3" /> All 1s
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={randomFill}
                className="h-7 flex-1 gap-1 text-[10px]"
              >
                <Dices className="h-3 w-3" /> Random
              </Button>
            </div>
          </div>

          {/* Minimized SOP expression */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Minimized SOP (sum of prime implicants)
            </div>
            {sopTerms.length === 0 ? (
              <p className="text-[11px] text-body-mid">
                F = 0 (no minterms selected)
              </p>
            ) : sopTerms.length === 1 && sopTerms[0] === '1' ? (
              <p className="ee-mono text-[14px] text-accent">
                F = 1 (tautology)
              </p>
            ) : (
              <div className="ee-mono text-[13px] leading-relaxed text-accent">
                F = {sopTerms.join(' + ')}
              </div>
            )}
            <p className="mt-2 text-[10px] text-body-mid">
              {implicants.length} prime implicant
              {implicants.length === 1 ? '' : 's'} ·{' '}
              {implicants.reduce((s, i) => s + i.size, 0)} minterm
              {implicants.reduce((s, i) => s + i.size, 0) === 1 ? '' : 's'} covered
            </p>
          </div>

          {/* Canonical expression (sum of minterms) */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Canonical sum-of-minterms
            </div>
            {mintermsList.length === 0 ? (
              <p className="text-[11px] text-body-mid">F = 0</p>
            ) : (
              <div className="ee-mono text-[12px] leading-relaxed text-body">
                F = Σm({mintermsList.join(', ')})
              </div>
            )}
            <p className="mt-2 text-[10px] text-body-mid">
              For comparison — the un-minimized form lists every 1-minterm
              individually.
            </p>
          </div>

          {/* Truth table (compact) */}
          <div className="rounded-sm border border-hairline bg-canvas-soft p-3">
            <div className="eyebrow mb-2 text-[10px] text-body-mid">
              Truth table ({nVars} inputs → 1 output)
            </div>
            <div className="max-h-48 overflow-y-auto ee-scroll ee-mono text-[10px]">
              <table className="w-full">
                <thead className="sticky top-0 bg-canvas-soft">
                  <tr className="text-body-mid">
                    {varNames(nVars).map((vn) => (
                      <th
                        key={vn}
                        className="px-1.5 py-1 text-center font-normal"
                      >
                        {vn}
                      </th>
                    ))}
                    <th className="px-1.5 py-1 text-center font-normal">F</th>
                    <th className="px-1.5 py-1 text-center font-normal">m</th>
                  </tr>
                </thead>
                <tbody>
                  {values.map((v, m) => (
                    <tr
                      key={m}
                      className={`cursor-pointer hover:bg-accent/10 ${
                        v === 1 ? 'text-accent' : 'text-body-mid'
                      }`}
                      onClick={() => toggleCell(m)}
                    >
                      {mintermBinary(m, nVars)
                        .split('')
                        .map((bit, bi) => (
                          <td
                            key={bi}
                            className="px-1.5 py-0.5 text-center"
                          >
                            {bit}
                          </td>
                        ))}
                      <td className="px-1.5 py-0.5 text-center font-bold">
                        {v}
                      </td>
                      <td className="px-1.5 py-0.5 text-center text-body-mid">
                        {m}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Hint footer */}
      <div className="flex items-start gap-2 border-t border-hairline bg-canvas-soft px-3 py-2 text-[10px] text-body-mid">
        <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-accent" aria-hidden />
        <p>
          Click any K-map cell to toggle its value (or click a row in the
          truth table). Adjacent cells differ in exactly one variable (Gray
          code). Group 1s into rectangles of 1, 2, 4, 8, or 16 cells — the
          larger the group, the fewer literals in that product term.
          Wrap-around is allowed (the K-map is a torus). The minimized SOP
          expression appears above; compare with the canonical sum-of-minterms
          to see how much was saved.
        </p>
      </div>
    </div>
  );
}

export default KarnaughMap;
