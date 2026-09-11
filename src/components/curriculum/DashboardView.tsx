'use client';

import * as React from 'react';
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
  Usb,
  Cable,
  ArrowRight,
  PlayCircle,
} from 'lucide-react';
import { CURRICULUM, CURRICULUM_STATS, type Lesson } from '@/lib/curriculum';
import { FLAT_LESSONS, LESSON_BY_ID } from '@/lib/curriculumIndex';
import { useProgress, checkpointKey } from '@/hooks/useProgress';
import { formatHours, formatWeeks } from './helpers';
import { cn } from '@/lib/utils';
import type { ViewKey } from './Header';
import { ProgressManager } from './ProgressManager';
import {
  getCurriculumFeatureStats,
  getLessonFeatures,
  FEATURE_META,
  type FeatureKey,
} from './lessonFeatures';

export function DashboardView({
  onNavigate,
  onOpenLesson,
}: {
  onNavigate: (v: ViewKey) => void;
  onOpenLesson: (lesson: Lesson) => void;
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

  // Interactive feature stats (computed once; cheap on first render).
  const featureStats = React.useMemo(
    () => getCurriculumFeatureStats(),
    []
  );

  // WebSerial-relevant lesson count.
  const webSerialLessons = React.useMemo(() => {
    let n = 0;
    for (const phase of CURRICULUM) {
      for (const mod of phase.modules) {
        for (const lesson of mod.lessons) {
          if (getLessonFeatures(lesson, mod.cs_bridge).some((f) => f.key === 'webserial')) {
            n++;
          }
        }
      }
    }
    return n;
  }, []);

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
      <section className="voxel-grid mb-6 rounded-sm border border-hairline p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="eyebrow text-[14px] text-accent">
              {'// DASHBOARD'}
            </div>
            <h1 className="mt-3 text-xl font-normal tracking-[-0.3px] text-ink sm:text-2xl md:text-3xl md:tracking-[-0.6px]">
              Curriculum Progress
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-body">
              All progress saves automatically to your browser. Mark lessons
              complete from the curriculum view, ship projects in the project
              tracker, and self-rate checkpoints to update these numbers.
            </p>
          </div>

          {/* Streak badge */}
          <div className="inline-flex items-center gap-2 self-start rounded-sm border border-hairline bg-canvas-card px-3 py-2">
            <Flame className="h-5 w-5 text-warning" aria-hidden />
            <div>
              <div className="eyebrow text-[10px] text-warning">Streak</div>
              <div className="text-sm text-ink">{streakLabel}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Continue where you left off — prominent card above the KPI tiles.
          Reads `lastLessonId` from the persisted progress; falls back to the
          very first lesson ("Phase 0 → Calculus refresher") when the user
          hasn't opened any lesson yet. */}
      <ContinueCard
        lastLessonId={state.lastLessonId}
        loaded={loaded}
        onOpenLesson={onOpenLesson}
      />

      {/* KPI tiles */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile
          icon={GraduationCap}
          color="text-accent"
          barColor="[&>div]:bg-accent"
          label="Lessons completed"
          value={`${lessonsDone}`}
          total={`/ ${CURRICULUM_STATS.lessons}`}
          pct={lessonPct}
        />
        <KpiTile
          icon={Target}
          color="text-accent"
          barColor="[&>div]:bg-accent"
          label="Projects shipped"
          value={`${projectsDone}`}
          total={`/ ${CURRICULUM_STATS.projects}`}
          pct={projectPct}
        />
        <KpiTile
          icon={ListChecks}
          color="text-accent"
          barColor="[&>div]:bg-accent"
          label="Checkpoints: Got it"
          value={`${checkpointsGotIt}`}
          total={`/ ${CURRICULUM_STATS.checkpoints}`}
          pct={checkpointPct}
          extra={`${checkpointsAnswered} answered`}
        />
        <KpiTile
          icon={Clock}
          color="text-accent"
          barColor="[&>div]:bg-accent"
          label="Hours logged"
          value={`${hoursLogged.toFixed(1)} h`}
          total={`/ ~${CURRICULUM_STATS.hours} h`}
          pct={hoursPct}
        />
      </section>

      {/* Interactive features stat card */}
      <section className="mb-6">
        <InteractiveFeaturesCard stats={featureStats} />
      </section>

      {/* Per-phase progress + hours */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="h-5 w-5 text-accent" aria-hidden />
          <h2 className="text-lg font-normal tracking-[-0.3px] text-ink">
            Phase-by-phase progress
          </h2>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {CURRICULUM.map((phase) => {
            const lessons = phase.modules.flatMap((m) => m.lessons);
            const done = lessons.filter((l) =>
              state.completedLessons.includes(l.id)
            ).length;
            const pct = lessons.length > 0 ? (done / lessons.length) * 100 : 0;
            const projects = phase.modules.flatMap((m) => m.projects);
            const projectsDoneInPhase = projects.filter((p) =>
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
              <div key={phase.id}>
                <Card className="overflow-hidden rounded-sm border border-hairline bg-canvas-card py-0">
                  <CardHeader className="relative px-4 py-3">
                    <span
                      aria-hidden
                      className="absolute left-0 top-0 h-full w-0.5 bg-accent"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-hairline bg-canvas-soft font-pixel text-[12px] text-accent"
                          aria-label={`Phase ${phase.index}`}
                        >
                          {phase.index}
                        </span>
                        <div>
                          <CardTitle className="text-sm font-normal leading-tight text-ink">
                            {phase.title}
                          </CardTitle>
                          <CardDescription className="text-[11px] text-body-mid">
                            {formatWeeks(phase.duration_weeks)} ·{' '}
                            {phase.modules.length} modules
                          </CardDescription>
                        </div>
                      </div>
                      <span className="ee-mono text-xs tabular-nums text-body-mid">
                        {Math.round(pct)}%
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 py-3">
                    {/* lesson bar */}
                    <div>
                      <div className="mb-1 flex items-center justify-between text-[11px] text-body-mid">
                        <span>Lessons</span>
                        <span className="ee-mono tabular-nums">
                          {done}/{lessons.length}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas-mid">
                        <div
                          className="h-full rounded-full transition-[width] duration-500"
                          style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }}
                        />
                      </div>
                    </div>

                    {/* mini stats row */}
                    <div className="flex items-center gap-4 text-[11px] text-body-mid">
                      <span className="inline-flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {projectsDoneInPhase}/{projects.length} projects
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ListChecks className="h-3 w-3" />
                        {cpGot}/{checkpoints.length} got it
                      </span>
                    </div>

                    {/* hours input */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-hairline pt-2">
                      <label
                        htmlFor={`hours-${phase.id}`}
                        className="eyebrow text-[11px] text-body-mid"
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
                        className="ee-mono h-7 w-20 rounded-sm border-hairline bg-canvas-mid text-xs"
                      />
                      <span className="text-[11px] text-body-mid">
                        / {formatHours(targetHours)} target
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hardware (WebSerial) section */}
      <section className="mb-6">
        <HardwareSection webSerialLessons={webSerialLessons} />
      </section>

      {/* Bottom row: what's next + reset */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-sm border border-hairline bg-canvas-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-normal text-ink">
              <TrendingUp className="h-4 w-4 text-accent" />
              What&apos;s next
            </CardTitle>
            <CardDescription className="text-body-mid">
              Pick up where you left off — quick links to each view.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-3">
            <NextLink
              label="Curriculum"
              hint={`${CURRICULUM_STATS.lessons} lessons · ${CURRICULUM_STATS.modules} modules`}
              onClick={() => onNavigate('curriculum')}
            />
            <NextLink
              label="Projects"
              hint={`${CURRICULUM_STATS.projects} hands-on`}
              onClick={() => onNavigate('projects')}
            />
            <NextLink
              label="Checkpoints"
              hint={`${CURRICULUM_STATS.checkpoints} self-tests`}
              onClick={() => onNavigate('checkpoints')}
            />
          </CardContent>
        </Card>

        <Card className="rounded-sm border border-hairline bg-canvas-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-normal text-ink">
              <Award className="h-4 w-4 text-accent" />
              Progress data
            </CardTitle>
            <CardDescription className="text-body-mid">
              Back up your progress to a file, restore it on another browser,
              or wipe it entirely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProgressManager />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-full border-error/30 text-error hover:bg-error/5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset all progress
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-sm border-hairline bg-canvas-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear completed lessons, shipped projects,
                    checkpoint ratings, and logged hours. This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={reset}
                    className="rounded-full bg-error text-white hover:bg-error/90"
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

/**
 * "Continue where you left off" — prominent card at the top of the dashboard.
 *
 * Reads the `lastLessonId` from the persisted progress state and shows the
 * matching lesson (with its module + phase context). If the user has never
 * opened a lesson, we fall back to the very first lesson in the curriculum
 * ("Phase 0 → Calculus refresher") and present it as the recommended
 * starting point.
 *
 * The "Continue" (or "Start") button calls `onOpenLesson`, which opens the
 * LessonDrawer for that lesson.
 */
function ContinueCard({
  lastLessonId,
  loaded,
  onOpenLesson,
}: {
  lastLessonId: string | null;
  loaded: boolean;
  onOpenLesson: (lesson: Lesson) => void;
}) {
  // Look up the last-opened lesson; fall back to the first lesson of the
  // curriculum. `loaded` gates the render so we don't briefly show the
  // fallback before localStorage has hydrated (would cause a flicker from
  // "Start with Phase 0 → Calculus refresher" to "Continue: <real lesson>").
  const entry = React.useMemo(() => {
    if (!loaded) return null;
    if (lastLessonId) {
      const hit = LESSON_BY_ID.get(lastLessonId);
      if (hit) return hit;
    }
    return FLAT_LESSONS[0] ?? null;
  }, [lastLessonId, loaded]);

  if (!entry) {
    // No curriculum loaded — shouldn't happen, but render nothing rather
    // than crash.
    return null;
  }

  const { lesson, module, phase } = entry;
  const hasLast = !!lastLessonId && !!LESSON_BY_ID.get(lastLessonId);

  return (
    <section className="mb-6">
      <Card className="overflow-hidden rounded-sm border border-accent/30 bg-canvas-card">
        <div
          aria-hidden
          className="h-0.5 w-full"
          style={{ backgroundColor: 'var(--accent)' }}
        />
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/30 text-accent"
              aria-hidden
            >
              <PlayCircle className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="eyebrow text-[11px] text-accent">
                {hasLast ? 'Continue where you left off' : 'Start here'}
              </div>
              <h2 className="mt-1 truncate text-base font-normal text-ink sm:text-lg">
                {lesson.title}
              </h2>
              <p className="mt-0.5 truncate text-xs text-body-mid">
                {phase.title} · {module.title}
              </p>
              {hasLast && (
                <p className="mt-1 line-clamp-2 max-w-2xl text-[11px] text-body-mid">
                  {lesson.summary}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={() => onOpenLesson(lesson)}
            className="shrink-0 gap-1.5 rounded-full bg-accent text-canvas hover:bg-accent/90"
          >
            {hasLast ? 'Continue' : 'Start with Phase 0'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

/**
 * Interactive Features stat card — task D-website-redesign Goal 3.4.
 *
 * Shows total interactive features across the curriculum + breakdown by
 * type. ("X interactive features across Y lessons")
 */
function InteractiveFeaturesCard({
  stats,
}: {
  stats: ReturnType<typeof getCurriculumFeatureStats>;
}) {
  return (
    <Card className="rounded-sm border border-hairline bg-canvas-card">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="eyebrow text-[11px] text-accent">
              Interactive features
            </div>
            <CardTitle className="mt-1 text-lg font-normal tracking-[-0.3px] text-ink">
              {stats.total} interactive features across{' '}
              <span className="text-accent">{stats.lessonsWithFeatures}</span>{' '}
              lessons
            </CardTitle>
            <CardDescription className="text-body-mid">
              Every Pyodide Python demo, SPICE sim, Verilog HDL playground,
              Bode plot, Falstad circuit, WaveDrom timing diagram, KaTeX
              formula, KiCanvas schematic, Web Audio scope, and IQEngine SDR
              spectrogram — discoverable per-lesson.
            </CardDescription>
          </div>
          <Sparkles className="hidden h-6 w-6 shrink-0 text-accent sm:block" aria-hidden />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {(Object.keys(FEATURE_META) as FeatureKey[]).map((k) => {
            const meta = FEATURE_META[k];
            const Icon = meta.icon;
            const count = stats.byType[k];
            const lessonCount = stats.lessonsByType[k];
            const tierCls =
              meta.tier === 'active'
                ? 'border-accent/40 text-accent'
                : meta.tier === 'hardware'
                ? 'border-warning/40 text-warning'
                : 'border-hairline text-body-mid';
            return (
              <div
                key={k}
                className={cn(
                  'rounded-sm border bg-canvas px-3 py-2',
                  tierCls
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3 w-3" aria-hidden />
                  <span className="eyebrow text-[11px]">{meta.short}</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="ee-mono text-xl text-ink tabular-nums">
                    {count}
                  </span>
                  <span className="text-[10px] text-body-mid">
                    in {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Hardware (WebSerial) section — task D-website-redesign Goal 3.5.
 *
 * Explains what WebSerial is, which browsers support it, and how many
 * lessons in the curriculum benefit from a hardware bench.
 */
function HardwareSection({
  webSerialLessons,
}: {
  webSerialLessons: number;
}) {
  return (
    <Card className="rounded-sm border border-hairline bg-canvas-card">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="eyebrow text-[11px] text-accent">Hardware</div>
            <CardTitle className="mt-1 text-lg font-normal tracking-[-0.3px] text-ink">
              WebSerial — connect real hardware in the browser
            </CardTitle>
            <CardDescription className="text-body-mid">
              WebSerial is a browser API that lets a web page talk directly
              to USB-serial devices — Arduino, ESP32, STM32 — without
              installing any driver or IDE. Click the floating{' '}
              <span className="inline-flex items-center gap-1 align-middle">
                <Usb className="h-3 w-3 text-accent" />
              </span>{' '}
              button (bottom-right) to open the serial monitor.
            </CardDescription>
          </div>
          <Cable className="hidden h-6 w-6 shrink-0 text-accent sm:block" aria-hidden />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-sm border border-hairline bg-canvas px-3 py-2">
          <div className="eyebrow text-[11px] text-body-mid">Browser support</div>
          <p className="mt-1 text-sm text-ink">
            Chrome, Edge, Opera
          </p>
          <p className="text-[11px] text-body-mid">
            Firefox needs a flag · Safari: no support
          </p>
        </div>
        <div className="rounded-sm border border-hairline bg-canvas px-3 py-2">
          <div className="eyebrow text-[11px] text-body-mid">Typical use</div>
          <p className="mt-1 text-sm text-ink">
            Stream <code className="ee-mono text-accent">analogRead()</code>{' '}
            values, plot sensor data live
          </p>
          <p className="text-[11px] text-body-mid">
            No Arduino IDE install needed
          </p>
        </div>
        <div className="rounded-sm border border-accent/40 bg-accent-soft/20 px-3 py-2">
          <div className="eyebrow text-[11px] text-accent">
            Pairs with {webSerialLessons} lessons
          </div>
          <p className="mt-1 text-sm text-ink">
            Any lesson with a circuit, SPICE, Verilog, or KiCanvas badge
            benefits from a real hardware bench.
          </p>
          <p className="text-[11px] text-body-mid">
            Filter the curriculum to find them.
          </p>
        </div>
      </CardContent>
    </Card>
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
    <Card className="overflow-hidden rounded-sm border border-hairline bg-canvas-card py-0">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Icon className={cn('h-5 w-5', color)} aria-hidden />
          <span className="ee-mono text-[10px] text-body-mid tabular-nums">
            {Math.round(pct)}%
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="ee-mono text-xl text-ink tabular-nums sm:text-2xl">
            {value}
          </span>
          <span className="text-xs text-body-mid">{total}</span>
        </div>
        <div className="mt-0.5 text-xs text-body">{label}</div>
        {extra && (
          <div className="text-[10px] text-body-mid">{extra}</div>
        )}
        <Progress
          value={pct}
          className={cn('mt-2 h-1.5 bg-canvas-mid', barColor)}
        />
      </CardContent>
    </Card>
  );
}

function NextLink({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start gap-1 rounded-sm border border-hairline bg-canvas p-3 text-left transition-colors duration-150 hover:border-accent/40 hover:bg-accent/5"
    >
      <span className="text-sm text-accent">{label}</span>
      <span className="text-[11px] text-body-mid">{hint}</span>
      <span className="mt-1 eyebrow text-[10px] text-accent opacity-0 transition-opacity group-hover:opacity-100">
        Open <ArrowRight className="inline h-2.5 w-2.5" />
      </span>
    </button>
  );
}
