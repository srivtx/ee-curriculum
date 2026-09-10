'use client';

import * as React from 'react';
import { ExternalLink, Layers, AlertTriangle } from 'lucide-react';

export interface KiCanvasEmbedProps {
  /**
   * URL to a `.kicad_sch` (or `.kicad_pcb`) file — typically a GitHub raw URL.
   *
   * Two forms are accepted:
   *  - A bare schematic file URL (e.g. a raw.githubusercontent.com URL).
   *    Wrapped into https://kicanvas.org/?src=<url-encoded>.
   *  - A full KiCanvas URL (e.g. https://kicanvas.org/?src=...).
   *    Used verbatim as the iframe src.
   *
   * When undefined, a generic KiCanvas demo schematic is shown.
   */
  url?: string;
  /** Optional title for the header strip. */
  title?: string;
}

const KICANVAS_HOST = 'kicanvas.org';

/**
 * Default demo schematic — a small, publicly-hosted KiCad schematic that
 * KiCanvas can fetch and render. Used when no `url` is provided.
 *
 * (Public KiCad schematics from the KiCanvas / Guava project repos work well
 *  here — they're MIT-licensed and reliably hosted on GitHub raw.)
 */
const DEFAULT_KICAD_URL =
  'https://raw.githubusercontent.com/wntrblm/Guava/main/bom/test.kicad_sch';

/**
 * Build the final iframe src from a user-supplied URL.
 *
 * - Full KiCanvas URLs (already on kicanvas.org) pass through verbatim.
 * - Anything else is treated as a raw schematic file URL and wrapped in
 *   https://kicanvas.org/?src=<url-encoded>.
 * - When undefined, falls back to the default demo schematic.
 */
function buildSrc(url?: string): string {
  const target = url ?? DEFAULT_KICAD_URL;
  try {
    const u = new URL(target);
    if (u.hostname === KICANVAS_HOST || u.hostname === `www.${KICANVAS_HOST}`) {
      return target;
    }
  } catch {
    /* fall through — treat as a bare schematic URL */
  }
  return `https://kicanvas.org/?src=${encodeURIComponent(target)}`;
}

/**
 * Embed the hosted KiCanvas viewer via iframe. KiCanvas parses .kicad_sch and
 * .kicad_pcb files client-side; we let kicanvas.org fetch and render the file.
 *
 * Note: KiCanvas is also available as a web component (bundled from source)
 * for offline/self-hosted use — see Tier 2 of the research doc.
 */
export function KiCanvasEmbed({
  url,
  title = 'KiCad schematic',
}: KiCanvasEmbedProps) {
  const src = React.useMemo(() => buildSrc(url), [url]);
  const isAllowed = React.useMemo(() => {
    try {
      const u = new URL(src);
      return u.hostname === KICANVAS_HOST || u.hostname === `www.${KICANVAS_HOST}`;
    } catch {
      return false;
    }
  }, [src]);

  if (!isAllowed) {
    return (
      <div className="rounded-sm border border-warning/40 bg-warning/8 px-3 py-2.5 text-xs text-warning">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          <span className="font-semibold uppercase tracking-wide">
            Invalid KiCanvas URL
          </span>
        </div>
        <p className="mt-1 text-foreground/70">
          Expected a URL on <code className="ee-mono">kicanvas.org</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-background">
      <div className="flex items-center gap-2 border-b border-border/60 bg-accent/5 px-3 py-2">
        <Layers className="h-4 w-4 text-accent" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {title}
        </span>
        <span className="text-[10px] text-muted-foreground">
          (KiCanvas · KiCad in browser)
        </span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-accent hover:bg-accent/10"
        >
          <ExternalLink className="h-3 w-3" />
          Open in KiCanvas
        </a>
      </div>
      <iframe
        title={title}
        src={src}
        className="block h-[500px] w-full bg-white"
        loading="lazy"
        allow="fullscreen"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {!url && (
        <p className="border-t border-border/40 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
          Showing a generic KiCanvas demo schematic. Set a specific{' '}
          <code className="ee-mono">.kicad_sch</code> URL on this lesson to
          embed a project-specific schematic.
        </p>
      )}
    </div>
  );
}
