'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Layers,
  ListChecks,
  Target,
  Terminal,
  CircuitBoard,
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

export function ModuleAccordion({
  module,
  phaseColor,
  onOpenLesson,
}: {
  module: Module;
  phaseColor: string;
  onOpenLesson: (lesson: Lesson) => void;
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
      className="overflow-hidden rounded-lg border border-border/60 bg-card px-0 shadow-sm first:rounded-t-lg last:rounded-b-lg"
    >
      <AccordionTrigger
        className={cn(
          'ee-accordion-trigger group relative grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 text-left hover:bg-muted/40',
          '[&[data-state=open]]:bg-muted/40'
        )}
      >
        {/* phase color accent strip */}
        <span
          aria-hidden
          className="absolute left-0 top-0 h-full w-1"
          style={{ backgroundColor: phaseColor }}
        />
        <span
          className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40"
          aria-hidden
        >
          <Layers className="h-4 w-4 text-muted-foreground" />
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-foreground">
              {module.title}
            </h4>
            <Badge
              variant="outline"
              className={cn(
                'shrink-0 border px-1.5 py-0 text-[10px] font-medium',
                DIFFICULTY_STYLES[module.difficulty].badge
              )}
            >
              <span
                className={cn(
                  'mr-1 inline-block h-1.5 w-1.5 rounded-full',
                  DIFFICULTY_STYLES[module.difficulty].dot
                )}
                aria-hidden
              />
              {DIFFICULTY_STYLES[module.difficulty].label}
            </Badge>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {module.description}
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
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
          <span className="ee-mono text-[10px] tabular-nums text-muted-foreground">
            {doneLessons}/{totalLessons} lessons
          </span>
          <Progress
            value={pct}
            className="h-1.5 w-24 bg-muted [&>div]:bg-ee-teal"
          />
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4 pt-1">
        <div className="grid gap-3">
          {/* CS BRIDGE callout (module-level) */}
          {module.cs_bridge && (
            <Callout variant="amber" icon={Lightbulb} title="CS BRIDGE — Module">
              {module.cs_bridge}
            </Callout>
          )}

          {/* Lessons */}
          {module.lessons.length > 0 && (
            <div className="rounded-md border border-border/50 bg-background/60">
              <div className="flex items-center justify-between border-b border-border/40 px-3 py-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Lessons
                </span>
                <span className="ee-mono text-[10px] text-muted-foreground">
                  {doneLessons}/{totalLessons}
                </span>
              </div>
              <ul className="divide-y divide-border/30">
                {module.lessons.map((lesson) => {
                  const meta = LESSON_TYPE_META[lesson.type];
                  const done = isLessonDone(lesson.id);
                  const Icon = meta.icon;
                  return (
                    <li key={lesson.id}>
                      <button
                        onClick={() => onOpenLesson(lesson)}
                        className="group flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-ee-teal/5"
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
                                'truncate text-sm font-medium',
                                done
                                  ? 'text-muted-foreground line-through'
                                  : 'text-foreground'
                              )}
                            >
                              {lesson.title}
                            </span>
                            {lesson.has_playground && (
                              <span
                                title="Interactive Python playground"
                                className="inline-flex items-center gap-0.5 rounded border border-ee-teal/30 bg-ee-teal/10 px-1 py-px text-[9px] font-medium uppercase text-ee-teal dark:text-ee-teal"
                              >
                                <Terminal className="h-2.5 w-2.5" />
                                Py
                              </span>
                            )}
                            {lesson.has_circuit && (
                              <span
                                title="Circuit visualization available"
                                className="inline-flex items-center gap-0.5 rounded border border-ee-cyan/30 bg-ee-cyan/10 px-1 py-px text-[9px] font-medium uppercase text-ee-cyan dark:text-ee-cyan"
                              >
                                <CircuitBoard className="h-2.5 w-2.5" />
                                CKT
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="uppercase tracking-wider">
                              {meta.label}
                            </span>
                            <span>·</span>
                            <span>{formatDuration(lesson.duration_min)}</span>
                          </span>
                        </span>
                        {done ? (
                          <CheckCircle2
                            className="h-4 w-4 shrink-0 text-ee-green"
                            aria-label="Completed"
                          />
                        ) : (
                          <ChevronRight
                            className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5"
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
            <div className="rounded-md border border-border/50 bg-background/60">
              <div className="flex items-center justify-between border-b border-border/40 px-3 py-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Projects
                </span>
                <span className="ee-mono text-[10px] text-muted-foreground">
                  {doneProjects}/{module.projects.length}
                </span>
              </div>
              <ul className="divide-y divide-border/30">
                {module.projects.map((p) => {
                  const done = state.completedProjects.includes(p.id);
                  const ds = DIFFICULTY_STYLES[p.difficulty];
                  return (
                    <li
                      key={p.id}
                      className="flex items-start gap-2 px-3 py-2"
                    >
                      <Target
                        className={cn(
                          'mt-0.5 h-3.5 w-3.5 shrink-0',
                          done ? 'text-ee-green' : 'text-muted-foreground'
                        )}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            done
                              ? 'text-muted-foreground line-through'
                              : 'text-foreground'
                          )}
                        >
                          {p.title}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {p.goal}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              'border px-1.5 py-0 text-[10px]',
                              ds.badge
                            )}
                          >
                            {ds.label}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
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
            <div className="flex items-center gap-2 rounded-md border border-ee-amber/20 bg-ee-amber/5 px-3 py-2 text-xs">
              <ListChecks className="h-3.5 w-3.5 text-ee-amber" aria-hidden />
              <span className="text-foreground/80">
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
  variant: 'amber' | 'teal' | 'cyan';
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  const styles = {
    amber: 'border-ee-amber/30 bg-ee-amber/8 text-foreground',
    teal: 'border-ee-teal/30 bg-ee-teal/8 text-foreground',
    cyan: 'border-ee-cyan/30 bg-ee-cyan/8 text-foreground',
  }[variant];
  const iconColor = {
    amber: 'text-ee-amber',
    teal: 'text-ee-teal',
    cyan: 'text-ee-cyan',
  }[variant];
  return (
    <div className={cn('rounded-md border px-3 py-2.5', styles)}>
      <div className="flex items-center gap-1.5">
        <Icon className={cn('h-3.5 w-3.5', iconColor)} aria-hidden />
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-[0.16em]',
            iconColor
          )}
        >
          {title}
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">
        {children}
      </p>
    </div>
  );
}
