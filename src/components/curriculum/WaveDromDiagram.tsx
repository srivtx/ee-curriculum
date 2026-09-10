'use client';

import * as React from 'react';
import { AlertTriangle, Activity } from 'lucide-react';

/**
 * Parse a WaveJSON string into an object.
 *
 * WaveDrom sources typically use JSON5 (unquoted keys, trailing commas, etc.).
 * We use a `new Function` wrapper as a lenient JSON5-ish evaluator — this is
 * exactly what wavedrom's own `eva()` does internally, and we control the
 * source strings (they come from curriculum.ts, not user input).
 */
function parseWaveJson(src: string): unknown {
  try {
    const fn = new Function(`return (${src});`);
    return fn();
  } catch (err) {
    throw new Error(
      `Invalid WaveJSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export interface WaveDromDiagramProps {
  /** WaveJSON source. JSON5-style unquoted keys are allowed. */
  wavejson: string;
  /** Optional title for the header strip. */
  title?: string;
}

export function WaveDromDiagram({ wavejson, title = 'Timing diagram' }: WaveDromDiagramProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const source = parseWaveJson(wavejson);
        // wavedrom's main entry is CommonJS — dynamically import on the client.
        const wavedrom = await import('wavedrom');
        const renderAny =
          (wavedrom as any).renderAny ?? (wavedrom as any).default?.renderAny;
        const waveSkin =
          (wavedrom as any).waveSkin ?? (wavedrom as any).default?.waveSkin;
        const stringify =
          (wavedrom as any).onml?.stringify ??
          (wavedrom as any).default?.onml?.stringify;
        if (!renderAny || !waveSkin || !stringify) {
          throw new Error('wavedrom module shape not recognized');
        }
        const onmlTree = renderAny(0, source, waveSkin);
        const svgMarkup = stringify(onmlTree);
        if (cancelled) return;
        if (containerRef.current) {
          containerRef.current.innerHTML = svgMarkup;
        }
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [wavejson]);

  return (
    <div className="overflow-hidden rounded-lg border border-ee-teal/30 bg-background">
      <div className="flex items-center gap-2 border-b border-border/60 bg-ee-teal/5 px-3 py-2">
        <Activity className="h-4 w-4 text-ee-teal" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-ee-teal-dark dark:text-ee-teal">
          {title}
        </span>
        <span className="text-[10px] text-muted-foreground">
          (WaveDrom · SVG)
        </span>
      </div>
      <div className="overflow-x-auto ee-scroll px-3 py-3">
        {error ? (
          <div className="flex items-start gap-2 rounded border border-ee-red/40 bg-ee-red/8 px-3 py-2 text-xs text-ee-red">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <div>
              <div className="font-semibold">WaveDrom render error</div>
              <pre className="ee-mono mt-1 whitespace-pre-wrap text-[11px]">
                {error}
              </pre>
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="wave-drom-host [&>svg]:max-w-full [&>svg]:h-auto"
            role="img"
            aria-label={title}
          />
        )}
      </div>
    </div>
  );
}
