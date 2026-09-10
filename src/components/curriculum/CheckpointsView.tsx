'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ListChecks,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw,
  HelpCircle,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { CURRICULUM, type Phase } from '@/lib/curriculum';
import { useProgress, checkpointKey } from '@/hooks/useProgress';
import { formatWeeks } from './helpers';
import { cn } from '@/lib/utils';

interface CheckpointItem {
  key: string;
  question: string;
  moduleId: string;
  moduleTitle: string;
  phaseId: string;
  phaseIndex: number;
  phaseColor: string;
  phaseTitle: string;
}

const ALL_CHECKPOINTS: CheckpointItem[] = CURRICULUM.flatMap((phase) =>
  phase.modules.flatMap((m) =>
    m.checkpoints.map((q, i) => ({
      key: checkpointKey(m.id, i),
      question: q,
      moduleId: m.id,
      moduleTitle: m.title,
      phaseId: phase.id,
      phaseIndex: phase.index,
      phaseColor: phase.color,
      phaseTitle: phase.title,
    }))
  )
);

export function CheckpointsView() {
  const { state, setCheckpoint, checkpointStatus } = useProgress();
  const [phaseId, setPhaseId] = React.useState<string>('all');
  const [revealed, setRevealed] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    if (phaseId === 'all') return ALL_CHECKPOINTS;
    return ALL_CHECKPOINTS.filter((c) => c.phaseId === phaseId);
  }, [phaseId]);

  const gotItCount = filtered.filter(
    (c) => checkpointStatus(c.key) === 'got_it'
  ).length;
  const needReviewCount = filtered.filter(
    (c) => checkpointStatus(c.key) === 'need_review'
  ).length;
  const answeredCount = gotItCount + needReviewCount;
  const pct = filtered.length > 0 ? (gotItCount / filtered.length) * 100 : 0;

  function toggleReveal(key: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function resetPhase() {
    filtered.forEach((c) => {
      setCheckpoint(c.key, 'clear');
      setRevealed(new Set());
    });
  }

  // Phase-level stats for the selector
  const phaseStats = CURRICULUM.map((p) => {
    const items = ALL_CHECKPOINTS.filter((c) => c.phaseId === p.id);
    const got = items.filter((c) => checkpointStatus(c.key) === 'got_it').length;
    return { phase: p, total: items.length, got };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <section className="mb-6">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-accent" aria-hidden />
          <h1 className="text-xl font-normal tracking-[-0.3px] text-ink sm:text-2xl">
            Checkpoint Flashcards
          </h1>
          <span className="ml-2 inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] text-accent">
            {ALL_CHECKPOINTS.length} questions
          </span>
        </div>
        <p className="mt-1 text-sm text-body-mid">
          Self-test questions for every module. There&apos;s no answer key —
          open the curriculum, work the problem, then rate yourself honestly.
        </p>
      </section>

      {/* Phase selector + summary */}
      <section className="mb-5 flex flex-col gap-3 rounded-sm border border-hairline bg-canvas-card p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-accent" aria-hidden />
          <Select value={phaseId} onValueChange={setPhaseId}>
            <SelectTrigger className="h-9 w-auto min-w-56 gap-1 rounded-sm text-sm">
              <SelectValue placeholder="Pick a phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All phases ({ALL_CHECKPOINTS.length})</SelectItem>
              {phaseStats.map(({ phase, total, got }) => (
                <SelectItem key={phase.id} value={phase.id}>
                  P{phase.index} · {phase.title} ({got}/{total})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-accent">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Got it
            </span>
            <span className="ee-mono text-ink tabular-nums">{gotItCount}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-warning">
              <AlertCircle className="h-3.5 w-3.5" />
              Need review
            </span>
            <span className="ee-mono text-ink tabular-nums">{needReviewCount}</span>
          </div>
          <div className="text-xs text-body-mid">
            answered: <span className="ee-mono">{answeredCount}</span> /{' '}
            <span className="ee-mono">{filtered.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <Progress
              value={pct}
              className="h-2 w-32 bg-canvas-mid [&>div]:bg-accent"
            />
            <span className="ee-mono w-10 text-right text-xs text-accent tabular-nums">
              {Math.round(pct)}%
            </span>
          </div>
          {answeredCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetPhase}
              className="h-8 gap-1 rounded-full text-xs text-body-mid"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </section>

      {/* Per-phase mini progress (when "all" selected) */}
      {phaseId === 'all' && (
        <section className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {phaseStats.map(({ phase, total, got }) => {
            const p = total > 0 ? (got / total) * 100 : 0;
            return (
              <button
                key={phase.id}
                onClick={() => setPhaseId(phase.id)}
                className="group rounded-sm border border-hairline bg-canvas-card p-3 text-left transition-colors hover:border-accent/40 hover:bg-accent/5"
                style={{
                  borderLeft: '2px solid var(--accent)',
                }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-hairline bg-canvas-soft font-pixel text-[10px] text-accent">
                    {phase.index}
                  </span>
                  <span className="ee-mono text-[10px] text-body-mid tabular-nums">
                    {got}/{total}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-ink group-hover:text-accent">
                  {phase.title}
                </p>
                <Progress
                  value={p}
                  className="mt-1.5 h-1 bg-canvas-mid [&>div]:bg-accent"
                />
              </button>
            );
          })}
        </section>
      )}

      {/* Flashcards */}
      <section className="grid gap-3 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((c, i) => {
            const isRevealed = revealed.has(c.key);
            const status = checkpointStatus(c.key);
            return (
              <motion.div
                key={c.key}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.015, 0.25) }}
              >
                <Flashcard
                  item={c}
                  isRevealed={isRevealed}
                  onToggleReveal={() => toggleReveal(c.key)}
                  status={status}
                  onRate={(s) => setCheckpoint(c.key, s)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </section>

      {filtered.length === 0 && (
        <div className="rounded-sm border border-dashed border-hairline p-10 text-center text-sm text-body-mid">
          No checkpoints in this phase yet.
        </div>
      )}
    </div>
  );
}

function Flashcard({
  item,
  isRevealed,
  onToggleReveal,
  status,
  onRate,
}: {
  item: CheckpointItem;
  isRevealed: boolean;
  onToggleReveal: () => void;
  status: 'got_it' | 'need_review' | null;
  onRate: (s: 'got_it' | 'need_review') => void;
}) {
  return (
    <article
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-sm border bg-canvas-card p-4',
        status === 'got_it'
          ? 'border-accent/40'
          : status === 'need_review'
          ? 'border-warning/40'
          : 'border-hairline'
      )}
    >
      {/* phase + module breadcrumb */}
      <div className="mb-2 flex items-center gap-1.5 text-[10px] text-body-mid">
        <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-hairline bg-canvas-soft font-pixel text-[10px] text-accent">
          {item.phaseIndex}
        </span>
        <span className="truncate">{item.moduleTitle}</span>
      </div>

      {/* Question */}
      <div className="flex items-start gap-2">
        <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
        <p className="text-sm leading-relaxed text-ink">{item.question}</p>
      </div>

      {/* Reveal prompt */}
      <div className="mt-3 flex-1">
        {isRevealed ? (
          <div className="rounded-sm border border-hairline bg-canvas px-3 py-2">
            <p className="eyebrow text-[11px] text-body-mid">Self-check</p>
            <p className="mt-1 text-xs text-body-mid">
              Work through it on paper or in code. No answer key — these are
              open-ended self-tests. Then rate yourself below.
            </p>
          </div>
        ) : (
          <button
            onClick={onToggleReveal}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 px-2.5 py-1 text-xs text-accent transition-colors hover:bg-accent/10"
          >
            <Eye className="h-3 w-3" />
            Show prompt
          </button>
        )}
      </div>

      {/* Rating buttons */}
      <div className="mt-3 flex items-center gap-2 border-t border-hairline pt-3">
        <Button
          size="sm"
          variant={status === 'got_it' ? 'default' : 'outline'}
          onClick={() => onRate('got_it')}
          className={cn(
            'h-7 gap-1 rounded-full px-2 text-xs',
            status === 'got_it'
              ? 'bg-accent text-canvas hover:bg-accent/90'
              : 'border-accent/40 text-accent hover:bg-accent/10'
          )}
        >
          <CheckCircle2 className="h-3 w-3" />
          Got it
        </Button>
        <Button
          size="sm"
          variant={status === 'need_review' ? 'default' : 'outline'}
          onClick={() => onRate('need_review')}
          className={cn(
            'h-7 gap-1 rounded-full px-2 text-xs',
            status === 'need_review'
              ? 'bg-warning text-canvas hover:bg-warning/90'
              : 'border-warning/40 text-warning hover:bg-warning/10'
          )}
        >
          <AlertCircle className="h-3 w-3" />
          Need review
        </Button>
        {isRevealed && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleReveal}
            className="ml-auto h-7 gap-1 rounded-full px-2 text-xs text-body-mid"
          >
            <EyeOff className="h-3 w-3" />
            Hide
          </Button>
        )}
      </div>
    </article>
  );
}

/** Phase info reused for dashboard */
export function phaseInfoFor(id: string): Phase | undefined {
  return CURRICULUM.find((p) => p.id === id);
}

export { formatWeeks };
