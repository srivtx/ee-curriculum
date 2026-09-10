'use client';

import * as React from 'react';
import {
  Layers,
} from 'lucide-react';
import { CURRICULUM, CURRICULUM_STATS, type Lesson } from '@/lib/curriculum';
import { useProgress } from '@/hooks/useProgress';
import { Accordion } from '@/components/ui/accordion';
import { PhaseCard } from './PhaseCard';
import {
  FEATURE_META,
  type FeatureKey,
} from './lessonFeatures';
import { cn } from '@/lib/utils';

export function CurriculumView({
  onOpenLesson,
}: {
  onOpenLesson: (lesson: Lesson) => void;
}) {
  const { state } = useProgress();
  const overallPct =
    CURRICULUM_STATS.lessons > 0
      ? (state.completedLessons.length / CURRICULUM_STATS.lessons) * 100
      : 0;

  // Feature filter state — Set of feature keys the user has toggled on.
  // Empty set = show all lessons. When non-empty, lessons matching ANY of
  // the toggled-on features get a subtle accent highlight (and non-matching
  // lessons dim).
  const [featureFilter, setFeatureFilter] = React.useState<Set<FeatureKey>>(
    () => new Set()
  );

  const toggleFeature = (k: FeatureKey) => {
    setFeatureFilter((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };
  const clearFeatureFilter = () => setFeatureFilter(new Set());

  const filterActive = featureFilter.size > 0;
  const filterSet = filterActive ? featureFilter : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Hero */}
      <section className="voxel-grid relative overflow-hidden rounded-sm border border-hairline p-5 sm:p-6 md:p-8">
        <div className="relative z-10">
          <div className="eyebrow text-[11px] text-accent sm:text-[14px]">
            {'// CURRICULUM · v3.0'}
          </div>
          <h1 className="mt-3 max-w-3xl text-2xl font-normal tracking-[-0.3px] text-ink sm:text-3xl md:text-5xl md:tracking-[-1.0px]">
            Electrical Engineering,{' '}
            <span className="text-accent">for Computer Scientists</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-body sm:text-base">
            A complete curriculum — from Maxwell&apos;s equations to VLSI and
            power systems — with a CS concept bridge at every step. Browse
            phases, read lessons, run Python demos in your browser, and track
            your progress.
          </p>

          {/* Overall progress strip — voxel-style */}
          <div className="mt-5 flex flex-col gap-2 rounded-sm border border-hairline bg-canvas-card p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="eyebrow text-[11px] text-body-mid">
                Overall progress
              </span>
              <span className="ee-mono text-xs text-body-mid">
                {state.completedLessons.length}/{CURRICULUM_STATS.lessons} lessons ·{' '}
                {state.completedProjects.length}/{CURRICULUM_STATS.projects} projects
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-[2px]">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    aria-hidden
                    className={cn(
                      'h-2 w-1.5',
                      i < Math.round(overallPct / 100 * 32)
                        ? 'bg-accent'
                        : 'bg-canvas-mid'
                    )}
                  />
                ))}
              </div>
              <span className="ee-mono w-10 text-right text-sm tabular-nums text-accent">
                {Math.round(overallPct)}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive features filter chips — horizontally scrollable on mobile
          so all chips stay reachable without pushing the "Clear" / count
          off-screen. */}
      <section className="mt-5 rounded-sm border border-hairline bg-canvas-card p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="eyebrow text-[11px] text-body-mid">
              Filter by feature
            </span>
          </div>
          <div
            className="ee-scroll flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
            style={{ scrollbarWidth: 'none' }}
          >
            {(
              Object.keys(FEATURE_META) as FeatureKey[]
            ).map((k) => {
              const meta = FEATURE_META[k];
              const Icon = meta.icon;
              const active = featureFilter.has(k);
              return (
                <button
                  key={k}
                  onClick={() => toggleFeature(k)}
                  aria-pressed={active}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors duration-150',
                    active
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-hairline text-body-mid hover:text-ink hover:border-body-mid/40'
                  )}
                >
                  <Icon className="h-3 w-3" aria-hidden />
                  {meta.short}
                </button>
              );
            })}
            {filterActive && (
              <button
                onClick={clearFeatureFilter}
                className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs text-body-mid hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>
          <span className="ml-auto shrink-0 text-xs text-body-mid">
            {filterActive
              ? `${featureFilter.size} filter${featureFilter.size === 1 ? '' : 's'} active · matching lessons highlighted`
              : 'Click a chip to highlight lessons with that feature'}
          </span>
        </div>
      </section>

      {/* Phase list */}
      <section className="mt-6 sm:mt-8">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-accent" aria-hidden />
            <h2 className="text-base font-normal tracking-[-0.3px] text-ink sm:text-lg md:text-xl">
              The 11 Phases
            </h2>
          </div>
          <p className="hidden text-xs text-body-mid sm:block">
            Click a phase to expand its modules, lessons, and projects.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="flex flex-col gap-3"
          defaultValue="p0"
        >
          {CURRICULUM.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              onOpenLesson={onOpenLesson}
              featureFilter={filterSet}
            />
          ))}
        </Accordion>
      </section>
    </div>
  );
}
