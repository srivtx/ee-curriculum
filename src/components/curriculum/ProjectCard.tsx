'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
        'overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md',
        done
          ? 'border-ee-green/40 bg-ee-green/[0.03]'
          : 'border-border/60'
      )}
    >
      <AccordionTrigger
        className="ee-accordion-trigger relative grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 text-left hover:no-underline"
      >
        <span
          aria-hidden
          className="absolute left-0 top-0 h-full w-1"
          style={{ backgroundColor: project.phaseColor }}
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
          className="ml-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ee-teal"
        >
          {done ? (
            <CheckCircle2 className="h-5 w-5 text-ee-green" />
          ) : (
            <span className="block h-5 w-5 rounded-full border-2 border-muted-foreground/30 transition-colors hover:border-ee-teal" />
          )}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="ee-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
            >
              P{project.phaseIndex}
            </span>
            <h4
              className={cn(
                'truncate text-sm font-semibold',
                done
                  ? 'text-muted-foreground line-through'
                  : 'text-foreground'
              )}
            >
              {project.title}
            </h4>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {project.goal}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
            <Badge
              variant="outline"
              className={cn('border px-1.5 py-0 text-[10px]', ds.badge)}
            >
              <span
                className={cn(
                  'mr-1 inline-block h-1.5 w-1.5 rounded-full',
                  ds.dot
                )}
                aria-hidden
              />
              {ds.label}
            </Badge>
            <span className="inline-flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {formatHours(project.estimated_hours)}
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden truncate text-muted-foreground/70 sm:inline">
              {project.phaseTitle} / {project.moduleTitle}
            </span>
          </div>
        </div>

        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground/50"
          aria-hidden
        />
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4 pt-1">
        <div className="space-y-3">
          {/* Goal */}
          <div className="rounded-md border border-ee-teal/20 bg-ee-teal/5 px-3 py-2">
            <div className="flex items-center gap-1.5 text-ee-teal-dark dark:text-ee-teal">
              <Target className="h-3.5 w-3.5" aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                Goal
              </span>
            </div>
            <p className="mt-1 text-xs text-foreground/85">{project.goal}</p>
          </div>

          {/* Tools */}
          {project.tools.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <Wrench className="h-3 w-3" />
                Tools
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.tools.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[11px] text-foreground/80"
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
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <ListChecks className="h-3 w-3" />
                Steps
              </div>
              <ol className="space-y-1.5">
                {project.steps.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-foreground/85"
                  >
                    <span
                      className="mt-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ee-teal/15 px-1 text-[10px] font-bold text-ee-teal-dark dark:text-ee-teal"
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
          <div className="rounded-md border border-ee-amber/30 bg-ee-amber/5 px-3 py-2">
            <div className="flex items-center gap-1.5 text-ee-amber">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                Pass criteria
              </span>
            </div>
            <p className="mt-1 text-xs text-foreground/85">
              {project.pass_criteria}
            </p>
          </div>

          {/* Footer: completion toggle (mobile-friendly) */}
          <label
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-md border border-border/50 px-3 py-2 text-xs transition-colors hover:bg-muted/40',
              done && 'border-ee-green/30 bg-ee-green/5'
            )}
          >
            <Checkbox
              checked={done}
              onCheckedChange={() => toggleProject(project.id)}
              aria-label="Mark project complete"
            />
            <span
              className={cn(
                'font-medium',
                done ? 'text-ee-green' : 'text-foreground/80'
              )}
            >
              {done ? 'Completed' : 'Mark as completed'}
            </span>
            <span className="ml-auto ee-mono text-[10px] text-muted-foreground">
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
