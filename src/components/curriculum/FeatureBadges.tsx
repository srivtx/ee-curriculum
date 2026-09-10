'use client';

import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { FeatureMeta } from './lessonFeatures';

/**
 * Compact icon badges — Design System v3 §8.6 + task D-website-redesign Goal 3.1.
 *
 * Each badge is a 16px lucide icon wrapped in a small pill (rounded-full,
 * 1px border, tier-based color). Hovering shows the feature's full label
 * via the shadcn Tooltip.
 *
 * Tier colors:
 *  - active (hands-on)   → border-accent/40 text-accent
 *  - passive (viewer)    → border-hairline    text-body-mid
 *  - hardware (requires) → border-warning/40  text-warning
 *
 * Grouped at the right of the lesson row.
 */
export function FeatureBadges({
  features,
  size = 16,
  className,
}: {
  features: FeatureMeta[];
  size?: number;
  className?: string;
}) {
  if (features.length === 0) return null;
  return (
    <div
      className={cn(
        'flex items-center gap-1',
        className
      )}
      role="group"
      aria-label="Interactive features available in this lesson"
    >
      {features.map((f) => {
        const Icon = f.icon;
        const tierCls =
          f.tier === 'active'
            ? 'border-accent/40 text-accent'
            : f.tier === 'hardware'
            ? 'border-warning/40 text-warning'
            : 'border-hairline text-body-mid';
        return (
          <Tooltip key={f.key}>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  'inline-flex h-5 w-5 items-center justify-center rounded-full border',
                  'transition-colors duration-150 hover:bg-canvas-soft',
                  tierCls
                )}
                aria-label={f.label}
              >
                <Icon
                  style={{ width: size, height: size }}
                  aria-hidden
                  className="shrink-0"
                />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">{f.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

/**
 * Labeled pill badges — Design System v3 §8.6.
 *
 * 11px JetBrains Mono uppercase +1.2px tracked, px-2 py-0.5, 1px border, tier-based color.
 * Used in the LessonDrawer header (the pill form of the compact icon badges).
 */
export function FeaturePills({
  features,
  className,
}: {
  features: FeatureMeta[];
  className?: string;
}) {
  if (features.length === 0) return null;
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {features.map((f) => {
        const Icon = f.icon;
        const tierCls =
          f.tier === 'active'
            ? 'border-accent/40 text-accent'
            : f.tier === 'hardware'
            ? 'border-warning/40 text-warning'
            : 'border-hairline text-body-mid';
        return (
          <span
            key={f.key}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
              'eyebrow text-[11px]',
              tierCls
            )}
          >
            <Icon className="h-2.5 w-2.5" aria-hidden />
            {f.short}
          </span>
        );
      })}
    </div>
  );
}
