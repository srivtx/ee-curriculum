'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
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
import { formatWeeks, hexToRgba, isLightHex } from './helpers';
import { ModuleAccordion } from './ModuleAccordion';
import { cn } from '@/lib/utils';

export function PhaseCard({
  phase,
  onOpenLesson,
}: {
  phase: Phase;
  onOpenLesson: (lesson: Lesson) => void;
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

  const accent = phase.color;
  const lightAccent = isLightHex(accent);

  return (
    <AccordionItem
      value={phase.id}
      className="group overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Header (always visible) */}
      <AccordionTrigger
        className={cn(
          'ee-accordion-trigger relative w-full px-0 py-0 text-left hover:no-underline',
          '[&[data-state=open]>div>div>button>svg.chevron]:rotate-180'
        )}
      >
        <div className="w-full">
          {/* Color accent strip */}
          <div
            aria-hidden
            className="h-1.5 w-full"
            style={{ backgroundColor: accent }}
          />
          <div
            className="relative px-4 py-4 sm:px-5"
            style={{
              backgroundImage: `linear-gradient(to right, ${hexToRgba(
                accent,
                0.08
              )} 0%, transparent 60%)`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="ee-mono inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: accent }}
                    aria-label={`Phase ${phase.index}`}
                  >
                    P{phase.index}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    <Clock className="h-2.5 w-2.5" />
                    {formatWeeks(phase.duration_weeks)}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-semibold leading-tight text-foreground sm:text-lg">
                  {phase.title}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground sm:text-sm">
                  {phase.subtitle}
                </p>
              </div>
              <ChevronDown
                className="chevron mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
                aria-hidden
              />
            </div>

            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground sm:text-[13px] sm:leading-relaxed">
              {phase.description}
            </p>

            {/* Stat row */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground">
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
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: accent }}
                  aria-hidden
                />
                <span className="ee-mono tabular-nums">
                  {doneLessons}/{lessonCount} done
                </span>
              </span>
            </div>

            {/* Phase progress bar */}
            <div
              className="mt-2 h-1 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: hexToRgba(accent, 0.15) }}
              role="progressbar"
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Phase ${phase.index} progress`}
            >
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: accent,
                }}
              />
            </div>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-3 pb-4 pt-1 sm:px-4">
        <div className="mb-3 rounded-md border border-ee-amber/20 bg-ee-amber/5 px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ee-amber">
            Phase Goal
          </span>
          <p className="mt-0.5 text-xs text-foreground/80">{phase.goal}</p>
        </div>
        <Accordion type="multiple" className="flex flex-col gap-2">
          {phase.modules.map((m) => (
            <ModuleAccordion
              key={m.id}
              module={m}
              phaseColor={accent}
              onOpenLesson={onOpenLesson}
            />
          ))}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}
