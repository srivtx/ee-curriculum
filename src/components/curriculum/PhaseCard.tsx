'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ChevronDown,
  Clock,
  CircuitBoard,
  Layers,
  ListChecks,
  Target,
} from 'lucide-react';
import type { Phase, Lesson } from '@/lib/curriculum';
import { useProgress } from '@/hooks/useProgress';
import { formatWeeks } from './helpers';
import { ModuleAccordion } from './ModuleAccordion';
import { cn } from '@/lib/utils';

/**
 * Phase card — Design System v3 §8.4.
 *
 * - bg-canvas-card border border-hairline rounded-sm
 * - Phase number in Press Start 2P 16px text-accent (the only Press Start 2P
 *   use on the site).
 * - Title in Inter (text-display-sm scale, w400, -0.3px tracking)
 * - All per-phase colors retired → phosphor green accent only.
 */
export function PhaseCard({
  phase,
  onOpenLesson,
  featureFilter,
}: {
  phase: Phase;
  onOpenLesson: (lesson: Lesson) => void;
  /** Optional set of feature keys used to highlight matching lessons
   *  (driven by the CurriculumView filter chips). */
  featureFilter?: Set<string> | null;
}) {
  const { state } = useProgress();

  // Aggregate stats
  const moduleCount = phase.modules.length;
  const lessonCount = phase.modules.reduce(
    (s, m) => s + m.lessons.length,
    0
  );
  const projectCount = phase.modules.reduce(
    (s, m) => s + m.projects.length,
    0
  );
  const checkpointCount = phase.modules.reduce(
    (s, m) => s + m.checkpoints.length,
    0
  );

  // Progress across this phase's lessons
  const doneLessons = phase.modules.reduce(
    (s, m) =>
      s + m.lessons.filter((l) => state.completedLessons.includes(l.id)).length,
    0
  );
  const pct = lessonCount > 0 ? (doneLessons / lessonCount) * 100 : 0;

  return (
    <AccordionItem
      value={phase.id}
      className="group overflow-hidden rounded-sm border border-hairline bg-canvas-card"
    >
      {/* Header (always visible) */}
      <AccordionTrigger
        className={cn(
          'ee-accordion-trigger relative w-full px-0 py-0 text-left hover:no-underline',
          '[&[data-state=open]>div>div>button>svg.chevron]:rotate-180'
        )}
      >
        <div className="w-full">
          {/* Thin accent strip */}
          <div className="h-px w-full bg-hairline" aria-hidden />

          <div className="relative px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  {/* Phase number — Press Start 2P, 16px, accent green.
                      The ONLY use of font-pixel on the entire site. */}
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-hairline bg-canvas-soft font-pixel text-[14px] text-accent"
                    aria-label={`Phase ${phase.index}`}
                  >
                    {phase.index}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-canvas-soft px-2 py-0.5 text-[11px] text-body-mid">
                    <Clock className="h-2.5 w-2.5" />
                    {formatWeeks(phase.duration_weeks)}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-normal tracking-[-0.3px] text-ink sm:text-xl">
                  {phase.title}
                </h3>
                <p className="mt-0.5 text-sm text-body-mid">
                  {phase.subtitle}
                </p>
              </div>
              <ChevronDown
                className="chevron mt-1 h-4 w-4 shrink-0 text-body-mid transition-transform duration-200"
                aria-hidden
              />
            </div>

            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-body">
              {phase.description}
            </p>

            {/* Stat row */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-body-mid">
              <span className="inline-flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {moduleCount} modules
              </span>
              <span className="inline-flex items-center gap-1">
                <CircuitBoard className="h-3 w-3" />
                {lessonCount} lessons
              </span>
              {projectCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {projectCount} projects
                </span>
              )}
              {checkpointCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <ListChecks className="h-3 w-3" />
                  {checkpointCount} checkpoints
                </span>
              )}
              <span className="ml-auto inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-1.5 w-1.5 bg-accent"
                  aria-hidden
                />
                <span className="ee-mono tabular-nums">
                  {doneLessons}/{lessonCount} done
                </span>
              </span>
            </div>

            {/* Phase progress bar — voxel-style */}
            <VoxelProgress value={pct} className="mt-2" />
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-3 pb-4 pt-1 sm:px-4">
        <div className="mb-3 rounded-sm border-l-2 border-accent bg-accent-soft/30 px-3 py-2">
          <span className="eyebrow text-[11px] text-accent">Phase Goal</span>
          <p className="mt-0.5 text-sm text-body">{phase.goal}</p>
        </div>
        <Accordion type="multiple" className="flex flex-col gap-2">
          {phase.modules.map((m) => (
            <ModuleAccordion
              key={m.id}
              module={m}
              onOpenLesson={onOpenLesson}
              featureFilter={featureFilter}
            />
          ))}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}

/** Voxel-style progress bar — same as the Header indicator but inline. */
function VoxelProgress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const TOTAL = 32;
  const filled = Math.round((pct / 100) * TOTAL);
  return (
    <div
      className={cn('flex items-center gap-[2px]', className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {Array.from({ length: TOTAL }).map((_, i) => (
        <div
          key={i}
          aria-hidden
          className={cn(
            'h-1.5 flex-1',
            i < filled ? 'bg-accent' : 'bg-hairline'
          )}
        />
      ))}
    </div>
  );
}
