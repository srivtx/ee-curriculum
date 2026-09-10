'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Cpu,
  GraduationCap,
  Layers,
  ListChecks,
  Target,
  Timer,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { CURRICULUM, CURRICULUM_STATS, type Lesson } from '@/lib/curriculum';
import { useProgress } from '@/hooks/useProgress';
import { Accordion } from '@/components/ui/accordion';
import { PhaseCard } from './PhaseCard';

const STAT_TILES: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  accent: string;
}[] = [
  {
    icon: Layers,
    label: 'Phases',
    value: '11',
    hint: 'Foundations → Capstones',
    accent: 'text-ee-teal',
  },
  {
    icon: BookOpen,
    label: 'Modules',
    value: '~80',
    hint: 'Topic-focused units',
    accent: 'text-ee-cyan',
  },
  {
    icon: GraduationCap,
    label: 'Lessons',
    value: '~150',
    hint: 'Reading + exercises',
    accent: 'text-ee-amber',
  },
  {
    icon: Target,
    label: 'Projects',
    value: '~50',
    hint: 'Bench + sim + code',
    accent: 'text-ee-green',
  },
  {
    icon: ListChecks,
    label: 'Checkpoints',
    value: '~90',
    hint: 'Self-test questions',
    accent: 'text-ee-teal-dark',
  },
  {
    icon: Timer,
    label: 'Total Hours',
    value: '~800',
    hint: '~12 months part-time',
    accent: 'text-ee-red',
  },
];

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Hero */}
      <section className="ee-blueprint relative overflow-hidden rounded-2xl border border-border/60 p-6 sm:p-8">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ee-teal/30 bg-ee-teal/10 px-2.5 py-1 text-[11px] font-medium text-ee-teal dark:text-ee-teal">
            <Sparkles className="h-3 w-3" />
            Self-paced · 11 phases · ~12 months
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Electrical Engineering,{' '}
            <span className="bg-gradient-to-r from-ee-teal to-ee-teal-dark bg-clip-text text-transparent dark:from-ee-teal dark:to-ee-cyan">
              for Computer Scientists
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-foreground/70 sm:text-base">
            A complete curriculum — from Maxwell&apos;s equations to VLSI and
            power systems — with a CS concept bridge at every step. Browse
            phases, read lessons, run Python demos in your browser, and track
            your progress.
          </p>

          {/* Stats grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {STAT_TILES.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="rounded-lg border border-border/60 bg-background/80 p-3 backdrop-blur-sm"
                >
                  <Icon className={`h-4 w-4 ${s.accent}`} aria-hidden />
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="ee-mono text-xl font-bold tabular-nums text-foreground">
                      {s.value}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-foreground/80">
                    {s.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {s.hint}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall progress strip */}
          <div className="mt-6 flex flex-col gap-2 rounded-lg border border-ee-teal/20 bg-ee-teal/5 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-ee-teal" aria-hidden />
              <span className="text-sm font-medium text-foreground">
                Your overall progress
              </span>
              <span className="ee-mono text-xs text-muted-foreground">
                {state.completedLessons.length}/{CURRICULUM_STATS.lessons} lessons ·{' '}
                {state.completedProjects.length}/{CURRICULUM_STATS.projects} projects
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="h-2 w-40 overflow-hidden rounded-full bg-muted sm:w-56"
                role="progressbar"
                aria-valuenow={Math.round(overallPct)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-ee-teal to-ee-teal-dark transition-[width] duration-500"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
              <span className="ee-mono w-10 text-right text-sm font-semibold tabular-nums text-ee-teal-dark dark:text-ee-teal">
                {Math.round(overallPct)}%
              </span>
            </div>
          </div>
        </div>

        {/* decorative blueprint text */}
        <div
          className="pointer-events-none absolute -right-6 -top-6 select-none text-[120px] font-bold leading-none text-ee-teal/[0.06] sm:text-[180px]"
          aria-hidden
        >
          EE
        </div>
      </section>

      {/* Phase list */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-ee-teal" aria-hidden />
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              The 11 Phases
            </h2>
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Click a phase to expand its modules, lessons, and projects.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="flex flex-col gap-3"
          defaultValue="p0"
        >
          {CURRICULUM.map((phase, i) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: i * 0.04,
                ease: 'easeOut',
              }}
            >
              <PhaseCard phase={phase} onOpenLesson={onOpenLesson} />
            </motion.div>
          ))}
        </Accordion>

        {/* Bottom CTA */}
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Ready to test yourself?
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Switch to the Checkpoints tab for flashcard-style self-tests on
              every phase.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-ee-teal px-3 py-1.5 text-sm font-medium text-white shadow-sm">
            Open checkpoints
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </section>
    </div>
  );
}
