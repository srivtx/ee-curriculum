'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Layers,
  ListChecks,
  Target,
  Clock,
  Lightbulb,
} from 'lucide-react';
import type { Module, Lesson } from '@/lib/curriculum';
import {
  DIFFICULTY_STYLES,
  LESSON_TYPE_META,
  formatDuration,
  formatHours,
} from './helpers';
import { useProgress } from '@/hooks/useProgress';
import { cn } from '@/lib/utils';
import { FeatureBadges } from './FeatureBadges';
import { getLessonFeatures } from './lessonFeatures';

export function ModuleAccordion({
  module,
  onOpenLesson,
  featureFilter,
}: {
  module: Module;
  /** Per-phase color is retired in v3 — kept in the signature for callers
   *  that still pass it; ignored. */
  phaseColor?: string;
  onOpenLesson: (lesson: Lesson) => void;
  /** Optional set of feature keys; lessons matching any key get a subtle
   *  accent highlight on the row. */
  featureFilter?: Set<string> | null;
}) {
  const { isLessonDone, state } = useProgress();
  const doneLessons = module.lessons.filter((l) => isLessonDone(l.id)).length;
  const doneProjects = module.projects.filter((p) =>
    state.completedProjects.includes(p.id)
  ).length;
  const totalLessons = module.lessons.length;
  const pct = totalLessons > 0 ? (doneLessons / totalLessons) * 100 : 0;

  return (
    <AccordionItem
      value={module.id}
      className="overflow-hidden rounded-sm border border-hairline bg-canvas-card first:rounded-t-sm last:rounded-b-sm"
    >
      <AccordionTrigger
        className={cn(
          'ee-accordion-trigger group relative grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 text-left hover:bg-canvas-soft',
          '[&[data-state=open]]:bg-canvas-soft'
        )}
      >
        <span
          className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-hairline bg-canvas-soft"
          aria-hidden
        >
          <Layers className="h-4 w-4 text-body-mid" />
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-base font-normal text-ink">
              {module.title}
            </h4>
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]',
                DIFFICULTY_STYLES[module.difficulty].badge
              )}
            >
              <span
                className={cn(
                  'inline-block h-1.5 w-1.5 rounded-full',
                  DIFFICULTY_STYLES[module.difficulty].dot
                )}
                aria-hidden
              />
              {DIFFICULTY_STYLES[module.difficulty].label}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-body-mid">
            {module.description}
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-body-mid">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatHours(module.duration_hours)}
            </span>
            <span className="inline-flex items-center gap-1">
              <CircleDot className="h-3 w-3" />
              {module.lessons.length} lessons
            </span>
            {module.projects.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Target className="h-3 w-3" />
                {module.projects.length} projects
              </span>
            )}
            {module.checkpoints.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <ListChecks className="h-3 w-3" />
                {module.checkpoints.length} checkpoints
              </span>
            )}
          </div>
        </div>

        {/* Progress mini */}
        <div className="hidden flex-col items-end gap-1 pr-2 sm:flex">
          <span className="ee-mono text-[10px] tabular-nums text-body-mid">
            {doneLessons}/{totalLessons} lessons
          </span>
          <Progress
            value={pct}
            className="h-1.5 w-24 bg-canvas-mid [&>div]:bg-accent"
          />
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4 pt-1">
        <div className="grid gap-3">
          {/* CS BRIDGE callout (module-level) */}
          {module.cs_bridge && (
            <Callout variant="accent" icon={Lightbulb} title="CS BRIDGE — Module">
              {module.cs_bridge}
            </Callout>
          )}

          {/* Lessons */}
          {module.lessons.length > 0 && (
            <div className="rounded-sm border border-hairline bg-canvas">
              <div className="flex items-center justify-between border-b border-hairline px-3 py-1.5">
                <span className="eyebrow text-[11px] text-body-mid">
                  Lessons
                </span>
                <span className="ee-mono text-[10px] text-body-mid">
                  {doneLessons}/{totalLessons}
                </span>
              </div>
              <ul>
                {module.lessons.map((lesson) => {
                  const meta = LESSON_TYPE_META[lesson.type];
                  const done = isLessonDone(lesson.id);
                  const Icon = meta.icon;
                  const feats = getLessonFeatures(lesson, module.cs_bridge);
                  const matchesFilter =
                    !featureFilter ||
                    featureFilter.size === 0 ||
                    feats.some((f) => featureFilter.has(f.key));
                  return (
                    <li key={lesson.id} className="border-t border-hairline first:border-t-0">
                      <button
                        onClick={() => onOpenLesson(lesson)}
                        className={cn(
                          'group flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors duration-150',
                          matchesFilter
                            ? 'bg-accent-soft/20 hover:bg-canvas-soft'
                            : 'hover:bg-canvas-soft',
                          !matchesFilter && featureFilter && featureFilter.size > 0 && 'opacity-50'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0',
                            meta.color
                          )}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                'truncate text-sm',
                                done
                                  ? 'text-body-mid line-through'
                                  : 'text-ink'
                              )}
                            >
                              {lesson.title}
                            </span>
                          </span>
                          <span className="mt-0.5 flex items-center gap-2 text-[10px] text-body-mid">
                            <span className="eyebrow">{meta.label}</span>
                            <span>·</span>
                            <span>{formatDuration(lesson.duration_min)}</span>
                          </span>
                        </span>
                        {/* Feature badges — compact icon pills with tooltips */}
                        <FeatureBadges
                          features={feats}
                          className="shrink-0"
                        />
                        {done ? (
                          <CheckCircle2
                            className="h-4 w-4 shrink-0 text-accent"
                            aria-label="Completed"
                          />
                        ) : (
                          <ChevronRight
                            className="h-4 w-4 shrink-0 text-body-mid/50 transition-transform group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Projects */}
          {module.projects.length > 0 && (
            <div className="rounded-sm border border-hairline bg-canvas">
              <div className="flex items-center justify-between border-b border-hairline px-3 py-1.5">
                <span className="eyebrow text-[11px] text-body-mid">
                  Projects
                </span>
                <span className="ee-mono text-[10px] text-body-mid">
                  {doneProjects}/{module.projects.length}
                </span>
              </div>
              <ul>
                {module.projects.map((p) => {
                  const done = state.completedProjects.includes(p.id);
                  const ds = DIFFICULTY_STYLES[p.difficulty];
                  return (
                    <li
                      key={p.id}
                      className="flex items-start gap-2 border-t border-hairline px-3 py-2 first:border-t-0"
                    >
                      <Target
                        className={cn(
                          'mt-0.5 h-3.5 w-3.5 shrink-0',
                          done ? 'text-accent' : 'text-body-mid'
                        )}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'text-sm',
                            done
                              ? 'text-body-mid line-through'
                              : 'text-ink'
                          )}
                        >
                          {p.title}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-body-mid">
                          {p.goal}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px]',
                              ds.badge
                            )}
                          >
                            {ds.label}
                          </span>
                          <span className="text-[10px] text-body-mid">
                            {formatHours(p.estimated_hours)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Checkpoints summary */}
          {module.checkpoints.length > 0 && (
            <div className="flex items-center gap-2 rounded-sm border-l-2 border-accent bg-accent-soft/20 px-3 py-2 text-xs">
              <ListChecks className="h-3.5 w-3.5 text-accent" aria-hidden />
              <span className="text-body">
                <span className="font-medium">{module.checkpoints.length}</span>{' '}
                self-test checkpoints — open the Checkpoints tab to drill them.
              </span>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function Callout({
  variant,
  icon: Icon,
  title,
  children,
}: {
  variant: 'accent';
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border-l-2 border-accent bg-accent-soft/20 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-accent" aria-hidden />
        <span className="eyebrow text-[11px] text-accent">{title}</span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-body">
        {children}
      </p>
    </div>
  );
}
