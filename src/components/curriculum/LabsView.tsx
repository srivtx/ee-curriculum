'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Lightbulb,
  Target,
  Layers,
  Wrench,
  X,
  ChevronRight,
  Beaker,
  Sparkles,
} from 'lucide-react';
import {
  LABS,
  type Lab,
  type LabDifficulty,
  type LabStep,
  type LabTool,
} from '@/lib/labs';
import { LabToolEmbed, TOOL_META } from './LabToolEmbed';
import { formatHours } from './helpers';
import { cn } from '@/lib/utils';

// ── Difficulty styles — labs use Beginner / Intermediate / Advanced (the
//    curriculum's DIFFICULTY_STYLES uses Foundation instead of Beginner, so
//    we keep a separate map here rather than overloading the shared one).
const LAB_DIFFICULTY: Record<
  LabDifficulty,
  { badge: string; dot: string; ring: string }
> = {
  Beginner: {
    badge: 'border-accent/40 bg-accent/10 text-accent',
    dot: 'bg-accent',
    ring: 'before:bg-accent',
  },
  Intermediate: {
    badge: 'border-warning/40 bg-warning/10 text-warning',
    dot: 'bg-warning',
    ring: 'before:bg-warning',
  },
  Advanced: {
    badge: 'border-error/40 bg-error/10 text-error',
    dot: 'bg-error',
    ring: 'before:bg-error',
  },
};

type DiffFilter = 'all' | LabDifficulty;

// ── localStorage-backed lab progress ──────────────────────────────────────
// Persists the set of completed labs (by progressKey) so the "Mark as
// complete" state survives reloads. The key is namespaced away from the
// lesson/project progress in useProgress.tsx.
const LAB_STORAGE_KEY = 'ee-labs-progress-v1';

interface LabProgressState {
  completed: string[]; // progressKey values
}

function loadLabProgress(): LabProgressState {
  if (typeof window === 'undefined') return { completed: [] };
  try {
    const raw = window.localStorage.getItem(LAB_STORAGE_KEY);
    if (!raw) return { completed: [] };
    const parsed = JSON.parse(raw) as Partial<LabProgressState>;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
    };
  } catch {
    return { completed: [] };
  }
}

function saveLabProgress(s: LabProgressState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore quota errors */
  }
}

function useLabProgress() {
  const [state, setState] = React.useState<LabProgressState>({ completed: [] });
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setState(loadLabProgress());
    setLoaded(true);
  }, []);

  React.useEffect(() => {
    if (loaded) saveLabProgress(state);
  }, [state, loaded]);

  const isDone = React.useCallback(
    (progressKey: string) => state.completed.includes(progressKey),
    [state.completed]
  );

  const toggle = React.useCallback((progressKey: string) => {
    setState((s) => ({
      completed: s.completed.includes(progressKey)
        ? s.completed.filter((k) => k !== progressKey)
        : [...s.completed, progressKey],
    }));
  }, []);

  const completedCount = state.completed.length;
  return { isDone, toggle, completedCount, loaded };
}

// ── Entry component ───────────────────────────────────────────────────────
export function LabsView({
  activeLabId,
  onOpenLab,
  onCloseLab,
  onNavigateToCurriculum,
}: {
  /** id of the currently-open lab, or null to show the list view. */
  activeLabId: string | null;
  onOpenLab: (id: string) => void;
  onCloseLab: () => void;
  /** Optional callback to jump to the curriculum view (prerequisite chips). */
  onNavigateToCurriculum?: () => void;
}) {
  const progress = useLabProgress();
  const activeLab = activeLabId
    ? LABS.find((l) => l.id === activeLabId) ?? null
    : null;

  if (activeLab) {
    return (
      <LabDetail
        lab={activeLab}
        onClose={onCloseLab}
        onOpenLab={onOpenLab}
        onNavigateToCurriculum={onNavigateToCurriculum}
        progress={progress}
      />
    );
  }

  return (
    <LabsList
      onOpenLab={onOpenLab}
      progress={progress}
    />
  );
}

// ── List view ─────────────────────────────────────────────────────────────
function LabsList({
  onOpenLab,
  progress,
}: {
  onOpenLab: (id: string) => void;
  progress: ReturnType<typeof useLabProgress>;
}) {
  const [diffFilter, setDiffFilter] = React.useState<DiffFilter>('all');

  const filtered = React.useMemo(
    () =>
      diffFilter === 'all'
        ? LABS
        : LABS.filter((l) => l.difficulty === diffFilter),
    [diffFilter]
  );

  const byDiff: Record<LabDifficulty, number> = {
    Beginner: LABS.filter((l) => l.difficulty === 'Beginner').length,
    Intermediate: LABS.filter((l) => l.difficulty === 'Intermediate').length,
    Advanced: LABS.filter((l) => l.difficulty === 'Advanced').length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Hero */}
      <section className="voxel-grid relative overflow-hidden rounded-sm border border-hairline p-5 sm:p-6 md:p-8">
        <div className="relative z-10">
          <div className="eyebrow text-[11px] text-accent sm:text-[14px]">
            {'// LABS · LEARN BY DOING'}
          </div>
          <h1 className="mt-3 max-w-3xl text-2xl font-normal tracking-[-0.3px] text-ink sm:text-3xl md:text-5xl md:tracking-[-1.0px]">
            Build real projects.{' '}
            <span className="text-accent">Learn by doing.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-body sm:text-base">
            Progressive labs that use the interactive tools to build real
            things — LED circuits, Arduino projects, ESP32 IoT, robots,
            Verilog ICs, audio analyzers.
          </p>

          {/* Progress strip */}
          <div className="mt-5 flex flex-col gap-2 rounded-sm border border-hairline bg-canvas-card p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Beaker className="h-3.5 w-3.5 text-accent" aria-hidden />
              <span className="eyebrow text-[11px] text-body-mid">
                Labs completed
              </span>
              <span className="ee-mono text-xs text-body-mid">
                {progress.completedCount} / {LABS.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-[2px]">
                {LABS.map((l) => (
                  <div
                    key={l.id}
                    aria-hidden
                    className={cn(
                      'h-2 w-3',
                      progress.isDone(l.progressKey)
                        ? 'bg-accent'
                        : 'bg-canvas-mid'
                    )}
                  />
                ))}
              </div>
              <span className="ee-mono w-10 text-right text-sm tabular-nums text-accent">
                {Math.round((progress.completedCount / LABS.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Difficulty filter */}
      <section className="mt-5 flex flex-wrap items-center gap-2">
        <span className="eyebrow text-[11px] text-body-mid">Filter</span>
        {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map(
          (d) => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              aria-pressed={diffFilter === d}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs transition-colors',
                diffFilter === d
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink'
              )}
            >
              {d === 'all' ? 'All labs' : d}
              <span className="ml-1.5 text-[10px] text-body-mid">
                {d === 'all' ? LABS.length : byDiff[d]}
              </span>
            </button>
          )
        )}
        <span className="ml-auto text-xs text-body-mid">
          {filtered.length} of {LABS.length}
        </span>
      </section>

      {/* Lab cards grid */}
      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((lab, i) => (
          <LabCard
            key={lab.id}
            lab={lab}
            index={i + 1}
            done={progress.isDone(lab.progressKey)}
            onOpen={() => onOpenLab(lab.id)}
          />
        ))}
      </section>
    </div>
  );
}

function LabCard({
  lab,
  index,
  done,
  onOpen,
}: {
  lab: Lab;
  index: number;
  done: boolean;
  onOpen: () => void;
}) {
  const diff = LAB_DIFFICULTY[lab.difficulty];
  return (
    <button
      onClick={onOpen}
      className={cn(
        'group relative flex h-full flex-col rounded-sm border border-hairline bg-canvas-card p-4 text-left transition-colors',
        'hover:border-accent/40 hover:bg-canvas-soft'
      )}
      aria-label={`Open lab ${index}: ${lab.title}`}
    >
      {/* Top row: number + difficulty badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="ee-mono text-[11px] text-body-mid">
          LAB {String(index).padStart(2, '0')}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]',
            diff.badge
          )}
        >
          <span className={cn('inline-block h-1.5 w-1.5 rounded-full', diff.dot)} aria-hidden />
          {lab.difficulty}
        </span>
      </div>

      {/* Title + subtitle */}
      <h3 className="mt-2 text-base font-medium leading-snug text-ink">
        {lab.title}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-body-mid">
        {lab.subtitle}
      </p>

      {/* Tools + hours */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {lab.tools.map((t) => {
          const M = TOOL_META[t];
          const Icon = M.icon;
          return (
            <span
              key={t}
              title={M.label}
              className="inline-flex h-6 w-6 items-center justify-center rounded-sm border border-hairline bg-canvas text-body-mid"
              aria-label={M.label}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
          );
        })}
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-body-mid">
          <Clock className="h-3 w-3" />
          {formatHours(lab.estimated_hours)}
        </span>
      </div>

      {/* Steps count + CTA */}
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between border-t border-hairline pt-3">
          <span className="text-[11px] text-body-mid">
            {lab.steps.length} step{lab.steps.length === 1 ? '' : 's'}
          </span>
          {done ? (
            <span className="inline-flex items-center gap-1 text-xs text-accent">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-accent group-hover:gap-1.5">
              Start lab
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Detail view (full-page overlay) ───────────────────────────────────────
function LabDetail({
  lab,
  onClose,
  onOpenLab,
  onNavigateToCurriculum,
  progress,
}: {
  lab: Lab;
  onClose: () => void;
  onOpenLab: (id: string) => void;
  onNavigateToCurriculum?: () => void;
  progress: ReturnType<typeof useLabProgress>;
}) {
  const [activeStep, setActiveStep] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const done = progress.isDone(lab.progressKey);

  // Next lab suggestion — the lab that follows this one in the LABS array.
  const nextLab = LABS[LABS.findIndex((l) => l.id === lab.id) + 1] ?? null;

  // ESC closes.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll while the overlay is open.
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Reset scroll + step when the lab changes.
  React.useEffect(() => {
    setActiveStep(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [lab.id]);

  const diff = LAB_DIFFICULTY[lab.difficulty];
  const labIndex = LABS.findIndex((l) => l.id === lab.id) + 1;

  return (
    <div
      className="fixed inset-0 z-50 bg-canvas"
      role="dialog"
      aria-modal="true"
      aria-label={lab.title}
    >
      <div ref={scrollRef} className="ee-scroll absolute inset-0 overflow-y-auto">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 border-b border-hairline bg-canvas/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="shrink-0 gap-1.5 rounded-full px-2 text-body-mid hover:text-ink sm:px-3"
                aria-label="Back to labs"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex min-w-0 items-center gap-2">
                <Beaker className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span className="truncate text-sm text-body-mid sm:text-base sm:text-ink">
                  {lab.title}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant={done ? 'outline' : 'default'}
                size="sm"
                onClick={() => progress.toggle(lab.progressKey)}
                className={cn(
                  'gap-1.5 rounded-full px-2.5 sm:px-3',
                  !done && 'bg-accent text-canvas hover:bg-accent/90'
                )}
                aria-pressed={done}
              >
                {done ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                    <span className="hidden sm:inline">Completed</span>
                    <span className="sm:hidden">Done</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Mark complete</span>
                    <span className="sm:hidden">Done</span>
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full text-body-mid hover:text-ink"
                aria-label="Close lab view"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content column */}
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          {/* Header */}
          <header className="mb-6">
            <div className="eyebrow flex flex-wrap items-center gap-2 text-[11px] text-body-mid">
              <span className="ee-mono text-accent">
                LAB {String(labIndex).padStart(2, '0')}
              </span>
              <span aria-hidden>·</span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
                  diff.badge
                )}
              >
                <span className={cn('inline-block h-1.5 w-1.5 rounded-full', diff.dot)} aria-hidden />
                {lab.difficulty}
              </span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatHours(lab.estimated_hours)}
              </span>
              <span aria-hidden>·</span>
              <span>{lab.steps.length} steps</span>
            </div>

            <h1 className="mt-2 text-xl font-normal leading-tight tracking-[-0.3px] text-ink sm:text-2xl md:text-3xl">
              {lab.title}
            </h1>
            <p className="mt-1 text-sm text-body-mid sm:text-base">
              {lab.subtitle}
            </p>
          </header>

          <div className="space-y-6">
            {/* 1. Overview */}
            <section>
              <h3 className="eyebrow mb-2 flex items-center gap-1.5 text-[11px] text-body-mid">
                <Layers className="h-3 w-3" />
                Overview
              </h3>
              <p className="text-sm leading-relaxed text-body sm:text-[15px]">
                {lab.description}
              </p>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* What you'll build */}
                <div className="rounded-sm border border-hairline bg-canvas-card p-3">
                  <div className="eyebrow flex items-center gap-1.5 text-[11px] text-accent">
                    <Target className="h-3 w-3" />
                    What you&apos;ll build
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-body">
                    {lab.whatYoullBuild}
                  </p>
                </div>

                {/* Tools used */}
                <div className="rounded-sm border border-hairline bg-canvas-card p-3">
                  <div className="eyebrow flex items-center gap-1.5 text-[11px] text-body-mid">
                    <Wrench className="h-3 w-3" />
                    Tools used
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {lab.tools.map((t) => {
                      const M = TOOL_META[t];
                      const Icon = M.icon;
                      return (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 rounded-full border border-hairline px-2 py-0.5 text-[11px] text-body"
                        >
                          <Icon className="h-3 w-3 text-body-mid" />
                          {M.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              {lab.prerequisites.length > 0 && (
                <div className="mt-3 rounded-sm border border-hairline bg-canvas-card p-3">
                  <div className="eyebrow text-[11px] text-body-mid">
                    Prerequisites
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {lab.prerequisites.map((p) => (
                      <button
                        key={p}
                        onClick={() => onNavigateToCurriculum?.()}
                        disabled={!onNavigateToCurriculum}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border border-hairline px-2 py-0.5 text-[11px] transition-colors',
                          onNavigateToCurriculum
                            ? 'text-accent hover:border-accent/40 hover:bg-accent/10'
                            : 'text-body-mid'
                        )}
                      >
                        <ChevronRight className="h-3 w-3" />
                        {p.toUpperCase()}
                        <span className="text-body-mid">curriculum</span>
                      </button>
                    ))}
                    <span className="text-[11px] text-body-mid">
                      · {lab.relatedLessons.length} related lesson
                      {lab.relatedLessons.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* 2. What NOT to do */}
            {lab.whatNotToDo.length > 0 && (
              <section className="overflow-hidden rounded-sm border border-warning/30 bg-warning/5">
                <div className="flex items-center gap-2 border-b border-warning/20 bg-warning/10 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 text-warning" aria-hidden />
                  <span className="eyebrow text-[11px] text-warning">
                    What NOT to do
                  </span>
                </div>
                <ul className="space-y-1.5 px-3 py-3">
                  {lab.whatNotToDo.map((w, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm leading-relaxed text-body"
                    >
                      <span
                        className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-warning"
                        aria-hidden
                      />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 3. Steps */}
            <section>
              <h3 className="eyebrow mb-3 flex items-center gap-1.5 text-[11px] text-body-mid">
                <Sparkles className="h-3 w-3" />
                Steps
              </h3>

              {/* Step tabs */}
              <div className="ee-scroll -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                {lab.steps.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveStep(i);
                      // Scroll the step into view (especially useful on mobile).
                      const el = document.getElementById(`step-${s.id}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    aria-current={activeStep === i ? 'step' : undefined}
                    className={cn(
                      'shrink-0 rounded-full border px-2.5 py-1 text-[11px] transition-colors',
                      activeStep === i
                        ? 'border-accent/40 bg-accent/10 text-accent'
                        : 'border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink'
                    )}
                  >
                    <span className="ee-mono mr-1">{i + 1}</span>
                    <span className="max-w-[12rem] truncate align-middle">
                      {s.title}
                    </span>
                  </button>
                ))}
              </div>

              {/* Step cards */}
              <div className="mt-3 space-y-4">
                {lab.steps.map((s, i) => (
                  <StepCard
                    key={s.id}
                    step={s}
                    index={i + 1}
                    isActive={activeStep === i}
                  />
                ))}
              </div>
            </section>

            {/* 4. Completion */}
            <section className="rounded-sm border border-hairline bg-canvas-card p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="eyebrow text-[11px] text-body-mid">
                    Completion
                  </h3>
                  <p className="mt-1 text-sm text-body">
                    {done
                      ? "You've marked this lab as complete. Nice work."
                      : 'Finished all the steps? Mark this lab complete to track your progress.'}
                  </p>
                </div>
                <Button
                  variant={done ? 'outline' : 'default'}
                  onClick={() => progress.toggle(lab.progressKey)}
                  className={cn(
                    'shrink-0 gap-1.5 rounded-full',
                    !done && 'bg-accent text-canvas hover:bg-accent/90'
                  )}
                  aria-pressed={done}
                >
                  {done ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4" />
                      Mark as complete
                    </>
                  )}
                </Button>
              </div>

              {/* Next lab suggestion */}
              {nextLab && (
                <button
                  onClick={() => onOpenLab(nextLab.id)}
                  className="mt-4 flex w-full items-center gap-3 rounded-sm border border-hairline bg-canvas p-3 text-left transition-colors hover:border-accent/40 hover:bg-canvas-soft"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                    <ArrowRight className="h-4 w-4 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="eyebrow text-[10px] text-body-mid">
                      Next lab
                    </div>
                    <div className="truncate text-sm text-ink">
                      {nextLab.title}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-body-mid" />
                </button>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step card ─────────────────────────────────────────────────────────────
function StepCard({
  step,
  index,
  isActive,
}: {
  step: LabStep;
  index: number;
  isActive: boolean;
}) {
  return (
    <article
      id={`step-${step.id}`}
      className={cn(
        'scroll-mt-20 rounded-sm border bg-canvas-card p-4 transition-colors sm:p-5',
        isActive ? 'border-accent/40' : 'border-hairline'
      )}
    >
      {/* Step header */}
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium',
            isActive
              ? 'bg-accent text-canvas'
              : 'border border-hairline bg-canvas text-body-mid'
          )}
          aria-hidden
        >
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-medium leading-snug text-ink">
            {step.title}
          </h4>
          {step.tool && (
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-body-mid">
              {(() => {
                const meta = TOOL_META[step.tool as LabTool];
                const Icon = meta.icon;
                return (
                  <>
                    <Icon className="h-3 w-3" />
                    <span>{meta.label}</span>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Instruction */}
      <div className="mt-3 space-y-2 pl-10">
        <div>
          <span className="eyebrow text-[10px] text-body-mid">Do</span>
          <p className="mt-0.5 text-sm leading-relaxed text-body">
            {step.instruction}
          </p>
        </div>
        <div>
          <span className="eyebrow text-[10px] text-accent">Expected</span>
          <p className="mt-0.5 text-sm leading-relaxed text-body">
            {step.expected}
          </p>
        </div>
        {step.tip && (
          <div className="flex items-start gap-2 rounded-sm border-l-2 border-accent/60 bg-accent-soft/20 px-2.5 py-1.5">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
            <div>
              <span className="eyebrow text-[10px] text-accent">Tip</span>
              <p className="mt-0.5 text-[13px] leading-relaxed text-body">
                {step.tip}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Embedded interactive tool */}
      {step.tool && (
        <div className="mt-4 pl-10">
          <LabToolEmbed
            tool={step.tool}
            config={step.toolConfig}
            title={step.title}
          />
        </div>
      )}
    </article>
  );
}
