'use client';

import * as React from 'react';
import { ExternalLink, Cpu, AlertTriangle, RotateCw, PencilLine } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CircuitVerseEmbedProps {
  /**
   * CircuitVerse URL for embedding. Two forms are accepted:
   *
   *  1. A full embed URL on circuitverse.org ending in `/simulator/embed`
   *     (the only CV route that serves without `X-Frame-Options: SAMEORIGIN`
   *     — verified via curl against the production site). Used verbatim as
   *     the iframe src.
   *
   *  2. The bare homepage `https://circuitverse.org` — the iframe would be
   *     blocked by X-Frame-Options, so instead we show a friendly "Create
   *     your own circuit" CTA card that links out to the homepage.
   *
   *  3. Any other circuitverse.org project URL (e.g. `/users/.../projects/<slug>`
   *     without `/simulator/embed`) is rewritten to append `/simulator/embed`.
   *
   *  4. Anything else (non-circuitverse.org URL, malformed) shows an error.
   */
  circuitUrl?: string;
  /** Optional title for the card header (defaults to "Digital Circuit Simulator"). */
  title?: string;
}

const CV_HOST = 'circuitverse.org';

/**
 * Normalize the user-supplied URL into a final iframe src.
 *
 * Returns an object with:
 *  - `src`: the final URL to put in the iframe (or null if it shouldn't be
 *    iframed — e.g. the homepage, which has X-Frame-Options: SAMEORIGIN).
 *  - `kind`: 'embed' | 'homepage' | 'invalid'
 */
function resolveSrc(input?: string): {
  src: string | null;
  kind: 'embed' | 'homepage' | 'invalid';
} {
  if (!input) {
    return { src: null, kind: 'homepage' };
  }
  let u: URL;
  try {
    u = new URL(input);
  } catch {
    return { src: null, kind: 'invalid' };
  }
  if (u.hostname !== CV_HOST && u.hostname !== `www.${CV_HOST}`) {
    return { src: null, kind: 'invalid' };
  }

  // Already an embed URL — pass through.
  if (u.pathname.endsWith('/simulator/embed')) {
    return { src: u.toString(), kind: 'embed' };
  }

  // Homepage — would be blocked by X-Frame-Options: SAMEORIGIN.
  if (u.pathname === '/' || u.pathname === '') {
    return { src: null, kind: 'homepage' };
  }

  // Any other CV project page → rewrite to the embed route. Strips any
  // trailing slash so `/users/3/projects/1727/` becomes
  // `/users/3/projects/1727/simulator/embed`.
  const path = u.pathname.replace(/\/+$/, '');
  u.pathname = `${path}/simulator/embed`;
  return { src: u.toString(), kind: 'embed' };
}

/**
 * Embed CircuitVerse — an open-source digital circuit simulator (Logisim
 * successor). Students build and simulate logic circuits in the browser:
 * AND/OR/NOT gates, muxes, decoders, flip-flops, counters, state machines.
 *
 * CircuitVerse's `/simulator/embed` route is the only one that serves
 * without `X-Frame-Options: SAMEORIGIN`, so this component routes any
 * plain project URL through that endpoint. The homepage is not embeddable
 * (Rails sets SAMEORIGIN globally) — for the homepage fallback we render
 * a CTA card instead of a broken iframe.
 *
 * See: https://circuitverse.org (MIT, Rails + JS simulator).
 */
export function CircuitVerseEmbed({
  circuitUrl,
  title = 'Digital Circuit Simulator',
}: CircuitVerseEmbedProps) {
  const { src, kind } = React.useMemo(
    () => resolveSrc(circuitUrl),
    [circuitUrl]
  );

  const [iframeKey, setIframeKey] = React.useState(0);

  if (kind === 'invalid') {
    return (
      <div className="rounded-sm border border-error/40 bg-error/8 px-3 py-2.5 text-xs text-error">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          <span className="font-semibold uppercase tracking-wide">
            Invalid CircuitVerse URL
          </span>
        </div>
        <p className="mt-1 text-foreground/70">
          Expected a URL on{' '}
          <code className="ee-mono">circuitverse.org</code>.
        </p>
      </div>
    );
  }

  // Homepage fallback — the iframe would be blocked by X-Frame-Options.
  if (kind === 'homepage' || !src) {
    return (
      <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas">
        <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
          <Cpu className="h-4 w-4 text-accent" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            {title}
          </span>
          <span className="text-[10px] text-body-mid">
            (CircuitVerse · digital logic simulator)
          </span>
          <a
            href="https://circuitverse.org"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-accent hover:bg-accent/10"
          >
            <ExternalLink className="h-3 w-3" />
            Open CircuitVerse
          </a>
        </div>
        <div className="px-3 py-5 text-center">
          <PencilLine
            className="mx-auto mb-2 h-6 w-6 text-accent"
            aria-hidden
          />
          <p className="text-sm text-ink">Create your own circuit</p>
          <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-body-mid">
            CircuitVerse is a free, in-browser digital logic simulator —
            AND/OR/NOT gates, muxes, decoders, flip-flops, counters, state
            machines. Click below to launch the editor and build something.
          </p>
          <a
            href="https://circuitverse.org"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-canvas hover:bg-accent/90"
          >
            <ExternalLink className="h-3 w-3" />
            Launch CircuitVerse
          </a>
        </div>
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
          (CircuitVerse · live digital sim)
        </span>
        <button
          type="button"
          onClick={() => setIframeKey((k) => k + 1)}
          className="ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-body-mid hover:bg-canvas-soft hover:text-ink"
          aria-label="Reload simulator"
          title="Reload simulator"
        >
          <RotateCw className="h-3 w-3" />
          reload
        </button>
        <a
          href={src.replace(/\/simulator\/embed$/, '')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-accent hover:bg-accent/10"
        >
          <ExternalLink className="h-3 w-3" />
          Open in CircuitVerse
        </a>
      </div>

      <iframe
        key={iframeKey}
        title={title}
        src={src}
        className={cn('block h-[500px] w-full bg-white')}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        allow="fullscreen"
        referrerPolicy="no-referrer-when-downgrade"
      />

      <div className="border-t border-hairline bg-canvas-card px-3 py-2.5">
        <p className="text-[11px] leading-relaxed text-body-mid">
          This is a{' '}
          <span className="text-accent">live digital logic simulation</span>.
          Toggle the inputs, watch the gates propagate, and trace signals
          through the schematic. Click{' '}
          <span className="text-ink">Open in CircuitVerse →</span> to fork
          and edit the circuit.
        </p>
      </div>
    </div>
  );
}
