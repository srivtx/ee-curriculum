'use client';

import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

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
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Progress
        value={pct}
        className="h-2 w-24 bg-muted [&>div]:bg-ee-teal"
      />
      {showLabel && (
        <span className="ee-mono text-xs tabular-nums text-muted-foreground">
          {pct}%
        </span>
      )}
    </div>
  );
}
