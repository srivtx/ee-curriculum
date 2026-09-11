'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ArrowRight,
  X,
  ChevronRight,
  CircuitBoard,
  Activity,
  Cpu,
  Box,
  LineChart,
  AudioLines,
  Wrench,
  Cog,
  GraduationCap,
  Check,
  type LucideIcon,
} from 'lucide-react';
import {
  PLAYGROUND_TOOLS,
  type PlaygroundTool,
  type LabDifficulty,
} from '@/lib/labs';
import { LabToolEmbed, TOOL_META } from './LabToolEmbed';
import { cn } from '@/lib/utils';

// ── Difficulty styles (mirror LabsView — kept local to avoid coupling). ──
const DIFF_STYLES: Record<
  LabDifficulty,
  { badge: string; dot: string }
> = {
  Beginner: {
    badge: 'border-accent/40 bg-accent/10 text-accent',
    dot: 'bg-accent',
  },
  Intermediate: {
    badge: 'border-warning/40 bg-warning/10 text-warning',
    dot: 'bg-warning',
  },
  Advanced: {
    badge: 'border-error/40 bg-error/10 text-error',
    dot: 'bg-error',
  },
};

// ── Map the lucide icon *name* (string) stored in the playground data back to
//    the component. Falls back to a gear icon for unknown names so the UI
//    never breaks if a new tool is added without updating this map.
const ICONS: Record<string, LucideIcon> = {
  CircuitBoard,
  Activity,
  Cpu,
  Box,
  LineChart,
  AudioLines,
  Wrench,
};

/** Static wrapper so the looked-up icon renders as a stable component
 *  (satisfies react-hooks/static-components — never assign a component to a
 *  PascalCase const during another component's render). */
function ToolIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Cog;
  return <Icon className={className} />;
}

type DiffFilter = 'all' | LabDifficulty;

// ── Entry component ───────────────────────────────────────────────────────
export function PlaygroundView({
  activeToolId,
  onOpenTool,
  onCloseTool,
}: {
  /** id of the currently-open tool, or null to show the list view. */
  activeToolId: string | null;
  onOpenTool: (id: string) => void;
  onCloseTool: () => void;
}) {
  const activeTool = activeToolId
    ? PLAYGROUND_TOOLS.find((t) => t.id === activeToolId) ?? null
    : null;

  if (activeTool) {
    return <ToolDetail tool={activeTool} onClose={onCloseTool} />;
  }

  return <PlaygroundList onOpenTool={onOpenTool} />;
}

// ── List view ─────────────────────────────────────────────────────────────
function PlaygroundList({
  onOpenTool,
}: {
  onOpenTool: (id: string) => void;
}) {
  const [diffFilter, setDiffFilter] = React.useState<DiffFilter>('all');

  const filtered = React.useMemo(
    () =>
      diffFilter === 'all'
        ? PLAYGROUND_TOOLS
        : PLAYGROUND_TOOLS.filter((t) => t.difficulty === diffFilter),
    [diffFilter]
  );

  const byDiff: Record<LabDifficulty, number> = {
    Beginner: PLAYGROUND_TOOLS.filter((t) => t.difficulty === 'Beginner').length,
    Intermediate: PLAYGROUND_TOOLS.filter((t) => t.difficulty === 'Intermediate')
      .length,
    Advanced: PLAYGROUND_TOOLS.filter((t) => t.difficulty === 'Advanced').length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Hero */}
      <section className="voxel-grid relative overflow-hidden rounded-sm border border-hairline p-5 sm:p-6 md:p-8">
        <div className="relative z-10">
          <div className="eyebrow text-[11px] text-accent sm:text-[14px]">
            {'// PLAYGROUND · NO LESSON REQUIRED'}
          </div>
          <h1 className="mt-3 max-w-3xl text-2xl font-normal tracking-[-0.3px] text-ink sm:text-3xl md:text-5xl md:tracking-[-1.0px]">
            Try every tool.{' '}
            <span className="text-accent">No lesson required.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-body sm:text-base">
            Jump straight into any interactive tool. Build circuits, run
            SPICE, write Verilog, generate signals, rotate 3D models.
          </p>
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
              {d === 'all' ? 'All tools' : d}
              <span className="ml-1.5 text-[10px] text-body-mid">
                {d === 'all' ? PLAYGROUND_TOOLS.length : byDiff[d]}
              </span>
            </button>
          )
        )}
        <span className="ml-auto text-xs text-body-mid">
          {filtered.length} of {PLAYGROUND_TOOLS.length}
        </span>
      </section>

      {/* Tool cards grid */}
      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onOpen={() => onOpenTool(tool.id)}
          />
        ))}
      </section>
    </div>
  );
}

function ToolCard({
  tool,
  onOpen,
}: {
  tool: PlaygroundTool;
  onOpen: () => void;
}) {
  const diff = DIFF_STYLES[tool.difficulty];

  return (
    <button
      onClick={onOpen}
      className={cn(
        'group relative flex h-full flex-col rounded-sm border border-hairline bg-canvas-card p-4 text-left transition-colors',
        'hover:border-accent/40 hover:bg-canvas-soft'
      )}
      aria-label={`Open ${tool.name}`}
    >
      {/* Top row: icon + difficulty badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-accent/30 bg-accent/10">
          <ToolIcon name={tool.icon} className="h-[18px] w-[18px] text-accent" />
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]',
            diff.badge
          )}
        >
          <span className={cn('inline-block h-1.5 w-1.5 rounded-full', diff.dot)} aria-hidden />
          {tool.difficulty}
        </span>
      </div>

      {/* Name + description */}
      <h3 className="mt-3 text-base font-medium leading-snug text-ink">
        {tool.name}
      </h3>
      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-body-mid">
        {tool.description}
      </p>

      {/* What you can do */}
      <ul className="mt-3 space-y-1">
        {tool.whatYouCanDo.slice(0, 3).map((c, i) => (
          <li
            key={i}
            className="flex items-start gap-1.5 text-[11px] leading-relaxed text-body"
          >
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-accent" aria-hidden />
            <span className="line-clamp-1">{c}</span>
          </li>
        ))}
        {tool.whatYouCanDo.length > 3 && (
          <li className="text-[10px] text-body-mid">
            +{tool.whatYouCanDo.length - 3} more
          </li>
        )}
      </ul>

      {/* CTA */}
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between border-t border-hairline pt-3">
          <span className="text-[11px] text-body-mid">
            {tool.tutorialSteps.length} tutorial step
            {tool.tutorialSteps.length === 1 ? '' : 's'}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-accent group-hover:gap-1.5">
            Open
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Detail view (full-page overlay) ───────────────────────────────────────
function ToolDetail({
  tool,
  onClose,
}: {
  tool: PlaygroundTool;
  onClose: () => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const diff = DIFF_STYLES[tool.difficulty];

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

  // Reset scroll when the tool changes.
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [tool.id]);

  return (
    <div
      className="fixed inset-0 z-50 bg-canvas"
      role="dialog"
      aria-modal="true"
      aria-label={tool.name}
    >
      <div ref={scrollRef} className="ee-scroll absolute inset-0 overflow-y-auto">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 border-b border-hairline bg-canvas/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="shrink-0 gap-1.5 rounded-full px-2 text-body-mid hover:text-ink sm:px-3"
                aria-label="Back to playground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex min-w-0 items-center gap-2">
                <ToolIcon
                  name={tool.icon}
                  className="h-4 w-4 shrink-0 text-accent"
                />
                <span className="truncate text-sm text-body-mid sm:text-base sm:text-ink">
                  {tool.name}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full text-body-mid hover:text-ink"
              aria-label="Close tool view"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content column — wider than the lab detail so simulators have room */}
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {/* Header */}
          <header className="mb-6">
            <div className="eyebrow flex flex-wrap items-center gap-2 text-[11px] text-body-mid">
              <span className="inline-flex items-center gap-1 text-accent">
                <ToolIcon name={tool.icon} className="h-3 w-3" />
                {TOOL_META[tool.tool].label}
              </span>
              <span aria-hidden>·</span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
                  diff.badge
                )}
              >
                <span className={cn('inline-block h-1.5 w-1.5 rounded-full', diff.dot)} aria-hidden />
                {tool.difficulty}
              </span>
            </div>

            <h1 className="mt-2 text-xl font-normal leading-tight tracking-[-0.3px] text-ink sm:text-2xl md:text-3xl">
              {tool.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body sm:text-[15px]">
              {tool.description}
            </p>
          </header>

          <div className="space-y-6">
            {/* 1. Tutorial */}
            <section>
              <h3 className="eyebrow mb-3 flex items-center gap-1.5 text-[11px] text-body-mid">
                <GraduationCap className="h-3 w-3" />
                Tutorial
              </h3>
              <ol className="space-y-2">
                {tool.tutorialSteps.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-sm border border-hairline bg-canvas-card px-3 py-2.5"
                  >
                    <span
                      className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-medium text-canvas"
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <span className="ee-mono text-[13px] leading-relaxed text-body">
                      {s}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            {/* 2. The tool */}
            <section>
              <h3 className="eyebrow mb-3 flex items-center gap-1.5 text-[11px] text-body-mid">
                <Cpu className="h-3 w-3" />
                The tool
              </h3>
              <LabToolEmbed tool={tool.tool} title={tool.name} />
            </section>

            {/* 3. What you can do */}
            <section>
              <h3 className="eyebrow mb-3 flex items-center gap-1.5 text-[11px] text-body-mid">
                <Check className="h-3 w-3" />
                What you can do
              </h3>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {tool.whatYouCanDo.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-sm border border-hairline bg-canvas-card px-3 py-2.5 text-sm leading-relaxed text-body"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Back-to-list footer */}
            <section className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="gap-1.5 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to all tools
                <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
              </Button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
