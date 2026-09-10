'use client';

import * as React from 'react';
import { ExternalLink, Layers, AlertTriangle } from 'lucide-react';

export interface KiCanvasEmbedProps {
  /** KiCanvas URL — typically https://kicanvas.org/?src=<file-url>. */
  src: string;
  /** Optional title for the header strip. */
  title?: string;
}

/**
 * Embed the hosted KiCanvas viewer via iframe. KiCanvas parses .kicad_sch and
 * .kicad_pcb files client-side; we host the file on our own origin and let
 * kicanvas.org fetch and render it.
 *
 * Note: KiCanvas is also available as a web component (bundled from source)
 * for offline/self-hosted use — see Tier 2 of the research doc.
 */
export function KiCanvasEmbed({ src, title = 'KiCad schematic' }: KiCanvasEmbedProps) {
  const isAllowed = React.useMemo(() => {
    try {
      const u = new URL(src);
      return u.hostname === 'kicanvas.org' || u.hostname === 'www.kicanvas.org';
    } catch {
      return false;
    }
  }, [src]);

  if (!isAllowed) {
    return (
      <div className="rounded-md border border-ee-amber/40 bg-ee-amber/8 px-3 py-2.5 text-xs text-ee-amber">
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
    <div className="overflow-hidden rounded-lg border border-ee-cyan/30 bg-background">
      <div className="flex items-center gap-2 border-b border-border/60 bg-ee-cyan/5 px-3 py-2">
        <Layers className="h-4 w-4 text-ee-cyan" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-ee-cyan">
          {title}
        </span>
        <span className="text-[10px] text-muted-foreground">
          (KiCanvas · KiCad in browser)
        </span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-ee-cyan hover:bg-ee-cyan/10"
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
    </div>
  );
}
