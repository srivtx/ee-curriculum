'use client';

import * as React from 'react';
import { ExternalLink, Cpu, AlertTriangle, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WokwiEmbedProps {
  /**
   * Full Wokwi project URL — e.g. `https://wokwi.com/projects/12345`.
   * Either this or `projectId` must be supplied.
   */
  projectUrl?: string;
  /** Numeric Wokwi project ID, e.g. `"328014521436533262"`. */
  projectId?: string;
  /** Optional title for the iframe card header (defaults to "Live Microcontroller Simulation"). */
  title?: string;
}

const WOKWI_HOST = 'wokwi.com';

/**
 * Parse a full Wokwi project URL and pull out the numeric project ID.
 * Accepts:
 *   - https://wokwi.com/projects/328014521436533262
 *   - https://wokwi.com/projects/328014521436533262/view
 *   - https://wokwi.com/projects/328014521436533262?view=preview
 * Returns the empty string if the URL is malformed or not on wokwi.com.
 */
function parseProjectId(input: string): string {
  try {
    const u = new URL(input);
    if (u.hostname !== WOKWI_HOST && u.hostname !== `www.${WOKWI_HOST}`) {
      return '';
    }
    const m = u.pathname.match(/\/projects\/(\d+)/);
    return m ? m[1] : '';
  } catch {
    return '';
  }
}

/**
 * Embed a real Wokwi microcontroller simulation via iframe. Wokwi runs an
 * actual Arduino / ESP32 / STM32 / Pi Pico simulator in the browser — the code
 * executes on a virtual MCU, the wiring is interactive, and changes to the
 * sketch recompile and run instantly.
 *
 * The embed uses `?view=preview` which gives a clean simulator-only view (no
 * editor chrome) — students can still click "Open in Wokwi" to enter the full
 * IDE where they can edit the code and re-wire the circuit.
 *
 * The iframe is sandboxed to `allow-scripts allow-same-origin` so the Wokwi
 * runtime can execute the simulated firmware while still being isolated from
 * the parent page.
 */
export function WokwiEmbed({
  projectUrl,
  projectId,
  title = 'Live Microcontroller Simulation',
}: WokwiEmbedProps) {
  // Resolve the project ID from either the URL or the explicit ID.
  const id = React.useMemo(() => {
    if (projectId) return projectId;
    if (projectUrl) return parseProjectId(projectUrl);
    return '';
  }, [projectUrl, projectId]);

  const embedUrl = React.useMemo(
    () => (id ? `https://wokwi.com/projects/${id}?view=preview` : ''),
    [id]
  );

  const openUrl = React.useMemo(
    () => (id ? `https://wokwi.com/projects/${id}` : ''),
    [id]
  );

  const [iframeKey, setIframeKey] = React.useState(0);

  if (!id) {
    return (
      <div className="rounded-sm border border-error/40 bg-error/8 px-3 py-2.5 text-xs text-error">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          <span className="font-semibold uppercase tracking-wide">
            Invalid Wokwi URL
          </span>
        </div>
        <p className="mt-1 text-foreground/70">
          Expected a URL on{' '}
          <code className="ee-mono">wokwi.com/projects/&lt;id&gt;</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas">
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Cpu className="h-4 w-4 text-accent" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {title}
        </span>
        <span className="text-[10px] text-body-mid">
          (Wokwi · real virtual MCU)
        </span>
        <button
          type="button"
          onClick={() => setIframeKey((k) => k + 1)}
          className="ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-body-mid hover:bg-canvas-soft hover:text-ink"
          aria-label="Reload simulation"
          title="Reload simulation"
        >
          <RotateCw className="h-3 w-3" />
          reload
        </button>
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-accent hover:bg-accent/10"
        >
          <ExternalLink className="h-3 w-3" />
          Open in Wokwi
        </a>
      </div>

      <iframe
        key={iframeKey}
        title={title}
        src={embedUrl}
        className={cn('block h-[500px] w-full bg-white')}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
        allow="fullscreen; accelerometer; autoplay"
        referrerPolicy="no-referrer-when-downgrade"
      />

      <div className="border-t border-hairline bg-canvas-card px-3 py-2.5">
        <p className="text-[11px] leading-relaxed text-body-mid">
          This is a{' '}
          <span className="text-accent">real Arduino/ESP32 simulation</span>.
          The code runs on a virtual MCU — you can edit the sketch and the
          wiring in the full Wokwi editor and watch it execute in real time.
          Click{' '}
          <span className="text-ink">Open in Wokwi →</span> to enter the IDE.
        </p>
      </div>
    </div>
  );
}
