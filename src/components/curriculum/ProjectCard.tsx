'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Target,
  Clock,
  Wrench,
  ListChecks,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import type { Project } from '@/lib/curriculum';
import { useProgress } from '@/hooks/useProgress';
import { DIFFICULTY_STYLES, formatHours, hexToRgba } from './helpers';
import { cn } from '@/lib/utils';

export interface ProjectWithMeta extends Project {
  phaseId: string;
  phaseTitle: string;
  phaseIndex: number;
  phaseColor: string;
  moduleId: string;
  moduleTitle: string;
}

export function ProjectCard({
  project,
}: {
  project: ProjectWithMeta;
}) {
  const { isProjectDone, toggleProject } = useProgress();
  const done = isProjectDone(project.id);
  const ds = DIFFICULTY_STYLES[project.difficulty];

  return (
    <AccordionItem
      value={project.id}
      className={cn(
        'overflow-hidden rounded-sm border bg-canvas-card transition-colors',
        done
          ? 'border-accent/40 bg-accent-soft/20'
          : 'border-hairline'
      )}
    >
      <AccordionTrigger
        className="ee-accordion-trigger relative grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 text-left hover:no-underline"
      >
        <span
          aria-hidden
          className="absolute left-0 top-0 h-full w-0.5 bg-accent"
        />
        <span
          role="button"
          tabIndex={0}
          aria-label={done ? 'Mark as not done' : 'Mark project complete'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleProject(project.id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              toggleProject(project.id);
            }
          }}
          className="ml-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {done ? (
            <CheckCircle2 className="h-5 w-5 text-accent" />
          ) : (
            <span className="block h-5 w-5 rounded-full border-2 border-body-mid/30 transition-colors hover:border-accent" />
          )}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex h-5 min-w-5 items-center justify-center rounded-sm border border-hairline bg-canvas-soft px-1 font-pixel text-[10px] text-accent">
              {project.phaseIndex}
            </span>
            <h4
              className={cn(
                'truncate text-sm font-normal',
                done
                  ? 'text-body-mid line-through'
                  : 'text-ink'
              )}
            >
              {project.title}
            </h4>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-body-mid">
            {project.goal}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-body-mid">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]',
                ds.badge
              )}
            >
              <span
                className={cn(
                  'inline-block h-1.5 w-1.5 rounded-full',
                  ds.dot
                )}
                aria-hidden
              />
              {ds.label}
            </span>
            <span className="inline-flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {formatHours(project.estimated_hours)}
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden truncate text-body-mid/70 sm:inline">
              {project.phaseTitle} / {project.moduleTitle}
            </span>
          </div>
        </div>

        <ChevronRight
          className="h-4 w-4 shrink-0 text-body-mid/50"
          aria-hidden
        />
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4 pt-1">
        <div className="space-y-3">
          {/* Goal */}
          <div className="rounded-sm border-l-2 border-accent bg-accent-soft/20 px-3 py-2">
            <div className="flex items-center gap-1.5 text-accent">
              <Target className="h-3.5 w-3.5" aria-hidden />
              <span className="eyebrow text-[11px]">Goal</span>
            </div>
            <p className="mt-1 text-xs text-body">{project.goal}</p>
          </div>

          {/* Tools */}
          {project.tools.length > 0 && (
            <div>
              <div className="eyebrow mb-1.5 flex items-center gap-1.5 text-[11px] text-body-mid">
                <Wrench className="h-3 w-3" />
                Tools
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.tools.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-hairline bg-canvas px-2 py-0.5 text-[11px] text-body"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          {project.steps.length > 0 && (
            <div>
              <div className="eyebrow mb-1.5 flex items-center gap-1.5 text-[11px] text-body-mid">
                <ListChecks className="h-3 w-3" />
                Steps
              </div>
              <ol className="space-y-1.5">
                {project.steps.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-body"
                  >
                    <span
                      className="mt-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent/15 px-1 text-[10px] text-accent"
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Pass criteria */}
          <div className="rounded-sm border-l-2 border-warning bg-accent-soft/20 px-3 py-2">
            <div className="flex items-center gap-1.5 text-warning">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              <span className="eyebrow text-[11px]">Pass criteria</span>
            </div>
            <p className="mt-1 text-xs text-body">{project.pass_criteria}</p>
          </div>

          {/* Footer: completion toggle (mobile-friendly) */}
          <label
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 text-xs transition-colors hover:bg-canvas-soft',
              done ? 'border-accent/30 bg-accent/5' : 'border-hairline'
            )}
          >
            <Checkbox
              checked={done}
              onCheckedChange={() => toggleProject(project.id)}
              aria-label="Mark project complete"
            />
            <span
              className={cn(
                done ? 'text-accent' : 'text-body'
              )}
            >
              {done ? 'Completed' : 'Mark as completed'}
            </span>
            <span className="ml-auto ee-mono text-[10px] text-body-mid">
              {formatHours(project.estimated_hours)}
            </span>
          </label>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

/** Phase-color style helper exposed for the parent view if needed. */
export function phaseColorRgba(hex: string, alpha: number) {
  return hexToRgba(hex, alpha);
}
