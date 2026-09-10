'use client';

import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * Voxel-block progress bar — Design System v3 §4.5.
 *
 * 32 blocks total (one per ~3% progress), 8px tall, 6px wide each, 2px gap,
 * phosphor-green fill. Reads as a Minecraft XP bar + a tasteful loading
 * indicator. Replaces the continuous bar from v2.
 */
export function ProgressIndicator({
  value,
  className,
  showLabel = false,
}: {
  value: number;
  className?: string;
  showLabel?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const TOTAL_BLOCKS = 32;
  const filled = Math.round((pct / 100) * TOTAL_BLOCKS);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center gap-[2px]"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall curriculum progress"
          >
            {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => (
              <div
                key={i}
                aria-hidden
                className={cn(
                  'h-2 w-1.5',
                  i < filled
                    ? 'bg-accent'
                    : 'bg-canvas-mid'
                )}
              />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">{pct}% complete</TooltipContent>
      </Tooltip>
      {showLabel && (
        <span className="ee-mono text-xs tabular-nums text-body-mid">
          {pct}%
        </span>
      )}
    </div>
  );
}
