'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  GraduationCap,
  Target,
  ListChecks,
  Clock,
  TrendingUp,
  RotateCcw,
  Layers,
  Sparkles,
  Award,
  Flame,
} from 'lucide-react';
import { CURRICULUM, CURRICULUM_STATS } from '@/lib/curriculum';
import { useProgress, checkpointKey } from '@/hooks/useProgress';
import { formatHours, formatWeeks, hexToRgba } from './helpers';
import { cn } from '@/lib/utils';
import type { ViewKey } from './Header';

export function DashboardView({
  onNavigate,
}: {
  onNavigate: (v: ViewKey) => void;
}) {
  const { state, logHours, reset, loaded } = useProgress();

  const lessonsDone = state.completedLessons.length;
  const projectsDone = state.completedProjects.length;
  const checkpointsAnswered =
    state.gotItCheckpoints.length + state.needReviewCheckpoints.length;
  const checkpointsGotIt = state.gotItCheckpoints.length;
  const hoursLogged = Object.values(state.hoursByPhase).reduce(
    (s, h) => s + (h || 0),
    0
  );

  const lessonPct =
    CURRICULUM_STATS.lessons > 0
      ? (lessonsDone / CURRICULUM_STATS.lessons) * 100
      : 0;
  const projectPct =
    CURRICULUM_STATS.projects > 0
      ? (projectsDone / CURRICULUM_STATS.projects) * 100
      : 0;
  const checkpointPct =
    CURRICULUM_STATS.checkpoints > 0
      ? (checkpointsGotIt / CURRICULUM_STATS.checkpoints) * 100
      : 0;
  const hoursPct =
    CURRICULUM_STATS.hours > 0
      ? (hoursLogged / CURRICULUM_STATS.hours) * 100
      : 0;

  // "Streak" — a simple motivational indicator based on activity breadth
  const phasesStarted = CURRICULUM.filter((p) =>
    p.modules.some((m) =>
      m.lessons.some((l) => state.completedLessons.includes(l.id))
    )
  ).length;
  const streakLabel =
    phasesStarted === 0
      ? 'Start your journey'
      : phasesStarted === 1
      ? 'Phase 1 in motion'
      : phasesStarted <= 3
      ? `${phasesStarted} phases active`
      : phasesStarted <= 6
      ? `${phasesStarted} phases — on fire`
      : `${phasesStarted} phases — finishing strong`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Hero header */}
      <section className="ee-blueprint mb-6 rounded-2xl border border-border/60 p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-ee-teal/30 bg-ee-teal/10 px-2.5 py-1 text-[11px] font-medium text-ee-teal dark:text-ee-teal">
              <Sparkles className="h-3 w-3" />
              Your learning dashboard
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Progress at a glance
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-foreground/70">
              All progress saves automatically to your browser. Mark lessons
              complete from the curriculum view, ship projects in the project
              tracker, and self-rate checkpoints to update these numbers.
            </p>
          </div>

          {/* Streak badge */}
          <div className="inline-flex items-center gap-2 self-start rounded-lg border border-ee-amber/30 bg-ee-amber/10 px-3 py-2">
            <Flame className="h-5 w-5 text-ee-amber" aria-hidden />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-ee-amber">
                Streak
              </div>
              <div className="text-sm font-semibold text-foreground">
                {streakLabel}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI tiles */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile
          icon={GraduationCap}
          color="text-ee-teal"
          barColor="[&>div]:bg-ee-teal"
          label="Lessons completed"
          value={`${lessonsDone}`}
          total={`/ ${CURRICULUM_STATS.lessons}`}
          pct={lessonPct}
        />
        <KpiTile
          icon={Target}
          color="text-ee-green"
          barColor="[&>div]:bg-ee-green"
          label="Projects shipped"
          value={`${projectsDone}`}
          total={`/ ${CURRICULUM_STATS.projects}`}
          pct={projectPct}
        />
        <KpiTile
          icon={ListChecks}
          color="text-ee-amber"
          barColor="[&>div]:bg-ee-amber"
          label="Checkpoints: Got it"
          value={`${checkpointsGotIt}`}
          total={`/ ${CURRICULUM_STATS.checkpoints}`}
          pct={checkpointPct}
          extra={`${checkpointsAnswered} answered`}
        />
        <KpiTile
          icon={Clock}
          color="text-ee-cyan"
          barColor="[&>div]:bg-ee-cyan"
          label="Hours logged"
          value={`${hoursLogged.toFixed(1)} h`}
          total={`/ ~${CURRICULUM_STATS.hours} h`}
          pct={hoursPct}
        />
      </section>

      {/* Per-phase progress + hours */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="h-5 w-5 text-ee-teal" aria-hidden />
          <h2 className="text-lg font-semibold text-foreground">
            Phase-by-phase progress
          </h2>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {CURRICULUM.map((phase, i) => {
            const lessons = phase.modules.flatMap((m) => m.lessons);
            const done = lessons.filter((l) =>
              state.completedLessons.includes(l.id)
            ).length;
            const pct = lessons.length > 0 ? (done / lessons.length) * 100 : 0;
            const projects = phase.modules.flatMap((m) => m.projects);
            const projectsDone = projects.filter((p) =>
              state.completedProjects.includes(p.id)
            ).length;
            const checkpoints = phase.modules.flatMap((m) =>
              m.checkpoints.map((_, idx) => checkpointKey(m.id, idx))
            );
            const cpGot = checkpoints.filter((k) =>
              state.gotItCheckpoints.includes(k)
            ).length;

            const hours = state.hoursByPhase[phase.id] ?? 0;
            const targetHours = phase.modules.reduce(
              (s, m) => s + m.duration_hours,
              0
            );

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <Card className="overflow-hidden py-0">
                  <CardHeader
                    className="relative px-4 py-3"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${hexToRgba(
                        phase.color,
                        0.1
                      )} 0%, transparent 70%)`,
                    }}
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-0 h-full w-1"
                      style={{ backgroundColor: phase.color }}
                    />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="ee-mono inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-xs font-bold text-white"
                          style={{ backgroundColor: phase.color }}
                        >
                          P{phase.index}
                        </span>
                        <div>
                          <CardTitle className="text-sm font-semibold leading-tight">
                            {phase.title}
                          </CardTitle>
                          <CardDescription className="text-[11px]">
                            {formatWeeks(phase.duration_weeks)} ·{' '}
                            {phase.modules.length} modules
                          </CardDescription>
                        </div>
                      </div>
                      <span className="ee-mono text-xs font-semibold tabular-nums text-muted-foreground">
                        {Math.round(pct)}%
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 py-3">
                    {/* lesson bar */}
                    <div>
                      <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Lessons</span>
                        <span className="ee-mono tabular-nums">
                          {done}/{lessons.length}
                        </span>
                      </div>
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full"
                        style={{ backgroundColor: hexToRgba(phase.color, 0.15) }}
                      >
                        <div
                          className="h-full rounded-full transition-[width] duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: phase.color,
                          }}
                        />
                      </div>
                    </div>

                    {/* mini stats row */}
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {projectsDone}/{projects.length} projects
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ListChecks className="h-3 w-3" />
                        {cpGot}/{checkpoints.length} got it
                      </span>
                    </div>

                    {/* hours input */}
                    <div className="flex items-center gap-2 border-t border-border/40 pt-2">
                      <label
                        htmlFor={`hours-${phase.id}`}
                        className="text-[11px] font-medium text-muted-foreground"
                      >
                        Hours logged
                      </label>
                      <Input
                        id={`hours-${phase.id}`}
                        type="number"
                        min={0}
                        step={0.5}
                        inputMode="decimal"
                        value={loaded ? hours : 0}
                        onChange={(e) =>
                          logHours(
                            phase.id,
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        className="h-7 w-20 ee-mono text-xs"
                      />
                      <span className="text-[11px] text-muted-foreground">
                        / {formatHours(targetHours)} target
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Bottom row: difficulty mix + reset */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-ee-teal" />
              What&apos;s next
            </CardTitle>
            <CardDescription>
              Pick up where you left off — quick links to each view.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-3">
            <NextLink
              label="Curriculum"
              hint={`${CURRICULUM_STATS.lessons} lessons · ${CURRICULUM_STATS.modules} modules`}
              onClick={() => onNavigate('curriculum')}
              color="text-ee-teal"
            />
            <NextLink
              label="Projects"
              hint={`${CURRICULUM_STATS.projects} hands-on`}
              onClick={() => onNavigate('projects')}
              color="text-ee-green"
            />
            <NextLink
              label="Checkpoints"
              hint={`${CURRICULUM_STATS.checkpoints} self-tests`}
              onClick={() => onNavigate('checkpoints')}
              color="text-ee-amber"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4 text-ee-amber" />
              Reset
            </CardTitle>
            <CardDescription>
              Wipe all saved progress from this browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-ee-red/30 text-ee-red hover:bg-ee-red/5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset all progress
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Reset all progress?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear completed lessons, shipped projects,
                    checkpoint ratings, and logged hours. This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={reset}
                    className="bg-ee-red text-white hover:bg-ee-red/90"
                  >
                    Yes, reset everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function KpiTile({
  icon: Icon,
  color,
  barColor,
  label,
  value,
  total,
  pct,
  extra,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  barColor: string;
  label: string;
  value: string;
  total: string;
  pct: number;
  extra?: string;
}) {
  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Icon className={cn('h-5 w-5', color)} aria-hidden />
          <span className="ee-mono text-[10px] text-muted-foreground tabular-nums">
            {Math.round(pct)}%
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="ee-mono text-2xl font-bold tabular-nums text-foreground">
            {value}
          </span>
          <span className="text-xs text-muted-foreground">{total}</span>
        </div>
        <div className="mt-0.5 text-xs font-medium text-foreground/80">
          {label}
        </div>
        {extra && (
          <div className="text-[10px] text-muted-foreground">{extra}</div>
        )}
        <Progress
          value={pct}
          className={cn('mt-2 h-1.5 bg-muted', barColor)}
        />
      </CardContent>
    </Card>
  );
}

function NextLink({
  label,
  hint,
  onClick,
  color,
}: {
  label: string;
  hint: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start gap-1 rounded-lg border border-border/60 bg-card p-3 text-left transition-colors hover:border-ee-teal/40 hover:bg-ee-teal/5"
    >
      <span className={cn('text-sm font-semibold', color)}>{label}</span>
      <span className="text-[11px] text-muted-foreground">{hint}</span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-ee-teal opacity-0 transition-opacity group-hover:opacity-100">
        Open →
      </span>
    </button>
  );
}
