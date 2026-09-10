'use client';

import * as React from 'react';
import { ExternalLink, Radio, AlertTriangle } from 'lucide-react';

export interface IQEngineEmbedProps {
  /**
   * Optional URL of an IQ recording (SigMF metadata file or a deep-link into
   * IQEngine). When omitted, the IQEngine homepage iframe is shown instead.
   *
   * Two forms are accepted:
   *  - A full IQEngine URL (e.g. https://iqengine.org/signal?sigmf=...).
   *    Used verbatim as the iframe src.
   *  - A bare recording URL (e.g. https://.../recording.sigmf-meta).
   *    Wrapped into https://iqengine.org/signal?sigmf=<encoded>.
   */
  recordingUrl?: string;
  /** Optional title for the header strip. */
  title?: string;
}

const IQENGINE_HOST = 'iqengine.org';

/**
 * Build the final iframe src from a user-supplied recording URL.
 *
 * - Full IQEngine URLs (already on iqengine.org) are passed through.
 * - Anything else is treated as a recording URL and wrapped in
 *   https://iqengine.org/signal?sigmf=<url-encoded>.
 */
function buildSrc(recordingUrl?: string): string {
  if (!recordingUrl) {
    // IQEngine homepage — has a default demo recording and links to others.
    return 'https://iqengine.org/';
  }
  try {
    const u = new URL(recordingUrl);
    if (u.hostname === IQENGINE_HOST || u.hostname === `www.${IQENGINE_HOST}`) {
      return recordingUrl;
    }
  } catch {
    /* fall through — treat as a bare recording URL */
  }
  return `https://iqengine.org/signal?sigmf=${encodeURIComponent(recordingUrl)}`;
}

/**
 * Embed IQEngine — web-based SDR toolkit for analyzing RF recordings.
 *
 * IQEngine is a full web app (not a library); the only practical integration
 * is an iframe. The public instance has many pre-loaded recordings that map
 * to common modulation types (AM, FM, PSK, FSK, LTE).
 *
 * See: https://github.com/IQEngine/IQEngine (MIT, 326 stars).
 */
export function IQEngineEmbed({
  recordingUrl,
  title = 'SDR Spectrogram',
}: IQEngineEmbedProps) {
  const src = React.useMemo(() => buildSrc(recordingUrl), [recordingUrl]);
  const isAllowed = React.useMemo(() => {
    try {
      const u = new URL(src);
      return (
        u.hostname === IQENGINE_HOST || u.hostname === `www.${IQENGINE_HOST}`
      );
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
            Invalid IQEngine URL
          </span>
        </div>
        <p className="mt-1 text-foreground/70">
          Expected a URL on <code className="ee-mono">iqengine.org</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ee-amber/30 bg-background">
      <div className="flex items-center gap-2 border-b border-border/60 bg-ee-amber/8 px-3 py-2">
        <Radio className="h-4 w-4 text-ee-amber" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-ee-amber">
          {title}
        </span>
        <span className="text-[10px] text-muted-foreground">
          (IQEngine · SDR spectrogram + IQ plots)
        </span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-ee-amber hover:bg-ee-amber/10"
        >
          <ExternalLink className="h-3 w-3" />
          Open in IQEngine
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
      {!recordingUrl && (
        <p className="border-t border-border/40 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
          Showing the IQEngine homepage — it ships with several demo
          recordings (FM, GPS, LTE, ADS-B). Click{' '}
          <span className="font-medium text-foreground/80">Open in IQEngine</span>{' '}
          to browse them, or set a specific SigMF recording URL on this lesson.
        </p>
      )}
    </div>
  );
}
