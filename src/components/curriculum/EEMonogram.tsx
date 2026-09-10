// Voxel "EE" monogram — 16×16 pixel art, phosphor grass green on #0a0a0a.
// Design System v3 §4.5 — used in Header + Footer.
//
// The CSS variable --accent flips with theme, so in light mode the
// monogram uses the light-mode phosphor (#1f8a3d) and the canvas flips
// to #fafaf7. We render with crispEdges so the pixel art stays crisp
// at every size.

import * as React from 'react';

export function EEMonogram({
  size = 32,
  className,
  ariaLabel = 'EE Curriculum voxel monogram',
}: {
  size?: number;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={['ee-monogram', className].filter(Boolean).join(' ')}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect width="16" height="16" fill="var(--canvas)" />
      {/* Letter E (left), 6×8 from (1,4) */}
      <g fill="var(--accent)">
        <rect x="1" y="4" width="1" height="8" />
        <rect x="2" y="4" width="4" height="1" />
        <rect x="2" y="7" width="4" height="1" />
        <rect x="2" y="11" width="4" height="1" />
      </g>
      {/* Letter E (right), 6×8 from (9,4) */}
      <g fill="var(--accent)">
        <rect x="9" y="4" width="1" height="8" />
        <rect x="10" y="4" width="4" height="1" />
        <rect x="10" y="7" width="4" height="1" />
        <rect x="10" y="11" width="4" height="1" />
      </g>
    </svg>
  );
}
