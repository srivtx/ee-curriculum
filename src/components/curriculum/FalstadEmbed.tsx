'use client';

import * as React from 'react';
import { ExternalLink, CircuitBoard, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FalstadEmbedProps {
  /** Full Falstad URL — must include the `?cct=…` query parameter. */
  circuitUrl: string;
  /** Optional title shown in the header strip (defaults to "Circuit simulator"). */
  title?: string;
  /** Optional caption shown below the iframe. */
  caption?: string;
}

/**
 * Embed the hosted Falstad/CircuitJS1 simulator via iframe. Falstad sends
 * `X-Frame-Options: ALLOWALL`, so embedding works without a proxy.
 *
 * The iframe is lazy-loaded to keep the initial bundle cheap. A "Open in
 * Falstad" link is provided for users on browsers that block iframes.
 */
export function FalstadEmbed({
  circuitUrl,
  title = 'Circuit simulator',
  caption,
}: FalstadEmbedProps) {
  // Validate URL — must be on falstad.com to prevent open-redirect abuse.
  const isAllowed = React.useMemo(() => {
    try {
      const u = new URL(circuitUrl);
      return (
        u.hostname === 'www.falstad.com' || u.hostname === 'falstad.com'
      );
    } catch {
      return false;
    }
  }, [circuitUrl]);

  const [iframeKey, setIframeKey] = React.useState(0);

  if (!isAllowed) {
    return (
      <div className="rounded-sm border border-error/40 bg-error/8 px-3 py-2.5 text-xs text-error">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          <span className="font-semibold uppercase tracking-wide">
            Invalid Falstad URL
          </span>
        </div>
        <p className="mt-1 text-foreground/70">
          Expected a URL on <code className="ee-mono">falstad.com</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-background">
      <div className="flex items-center gap-2 border-b border-border/60 bg-accent/5 px-3 py-2">
        <CircuitBoard className="h-4 w-4 text-accent" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {title}
        </span>
        <span className="text-[10px] text-muted-foreground">
          (Falstad CircuitJS1 — interactive)
        </span>
        <button
          type="button"
          onClick={() => setIframeKey((k) => k + 1)}
          className="ml-auto rounded px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Reload simulator"
          title="Reload simulator"
        >
          ↻ reload
        </button>
        <a
          href={circuitUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-accent hover:bg-accent/10"
        >
          <ExternalLink className="h-3 w-3" />
          Open in Falstad
        </a>
      </div>

      <iframe
        key={iframeKey}
        title={title}
        src={circuitUrl}
        className={cn('block h-[500px] w-full bg-white')}
        loading="lazy"
        allow="fullscreen"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {caption && (
        <p className="border-t border-border/40 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  );
}
