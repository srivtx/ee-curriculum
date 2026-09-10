'use client';

import * as React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Render a single LaTeX string via KaTeX.
 *
 * - `displayMode=true` (default) → block-level rendering with bigger glyphs.
 * - `displayMode=false` → inline rendering (good for one-line math in paragraphs).
 *
 * Errors render an inline message instead of throwing — useful when lesson
 * authors paste malformed LaTeX.
 */
export interface KatexRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export function KatexRenderer({
  latex,
  displayMode = true,
  className,
}: KatexRendererProps) {
  const containerRef = React.useRef<HTMLSpanElement | null>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    try {
      katex.render(latex, el, {
        displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
        strict: 'ignore',
        trust: false,
        output: 'html',
      });
    } catch (err) {
      // Should not happen with throwOnError:false, but be safe.
      el.textContent = `[math error] ${latex}`;
      if (err instanceof Error) {
        console.warn('KaTeX render error:', err.message);
      }
    }
  }, [latex, displayMode]);

  return (
    <span
      ref={containerRef}
      className={className}
      aria-label={`Equation: ${latex}`}
    />
  );
}

/**
 * Render a list of (label, latex) pairs in a vertical stack. Used by the
 * "Key Formulas" card in the LessonDrawer.
 */
export interface FormulaItem {
  label?: string;
  latex: string;
}

export function KatexFormulaList({ items }: { items: FormulaItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="rounded-md border border-border/50 bg-muted/30 px-3 py-2"
        >
          {item.label && (
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {item.label}
            </div>
          )}
          <div className="overflow-x-auto ee-scroll">
            <KatexRenderer latex={item.latex} displayMode />
          </div>
        </li>
      ))}
    </ul>
  );
}
