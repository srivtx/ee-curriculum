'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Accordion } from '@/components/ui/accordion';
import {
  Target,
  Filter,
  X,
  CheckCircle2,
  CircleDot,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { CURRICULUM } from '@/lib/curriculum';
import { useProgress } from '@/hooks/useProgress';
import { ProjectCard, type ProjectWithMeta } from './ProjectCard';
import { DIFFICULTY_STYLES, formatHours } from './helpers';
import { cn } from '@/lib/utils';

type DiffFilter = 'all' | 'Foundation' | 'Intermediate' | 'Advanced';
type HoursFilter = 'all' | 'lt2' | '2to5' | 'gt5';
type StatusFilter = 'all' | 'todo' | 'done';

const ALL_PROJECTS: ProjectWithMeta[] = CURRICULUM.flatMap((phase) =>
  phase.modules.flatMap((m) =>
    m.projects.map<ProjectWithMeta>((p) => ({
      ...p,
      phaseId: phase.id,
      phaseTitle: phase.title,
      phaseIndex: phase.index,
      phaseColor: phase.color,
      moduleId: m.id,
      moduleTitle: m.title,
    }))
  )
);

export function ProjectsView() {
  const { state } = useProgress();

  const [phaseFilter, setPhaseFilter] = React.useState<string>('all');
  const [diffFilter, setDiffFilter] = React.useState<DiffFilter>('all');
  const [hoursFilter, setHoursFilter] = React.useState<HoursFilter>('all');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');

  const doneCount = ALL_PROJECTS.filter((p) =>
    state.completedProjects.includes(p.id)
  ).length;
  const totalHours = ALL_PROJECTS.reduce(
    (s, p) => s + p.estimated_hours,
    0
  );
  const doneHours = ALL_PROJECTS.filter((p) =>
    state.completedProjects.includes(p.id)
  ).reduce((s, p) => s + p.estimated_hours, 0);

  const filtered = React.useMemo(() => {
    return ALL_PROJECTS.filter((p) => {
      if (phaseFilter !== 'all' && p.phaseId !== phaseFilter) return false;
      if (diffFilter !== 'all' && p.difficulty !== diffFilter) return false;
      if (hoursFilter === 'lt2' && p.estimated_hours >= 2) return false;
      if (hoursFilter === '2to5' && (p.estimated_hours < 2 || p.estimated_hours > 5))
        return false;
      if (hoursFilter === 'gt5' && p.estimated_hours <= 5) return false;
      const done = state.completedProjects.includes(p.id);
      if (statusFilter === 'todo' && done) return false;
      if (statusFilter === 'done' && !done) return false;
      return true;
    });
  }, [phaseFilter, diffFilter, hoursFilter, statusFilter, state.completedProjects]);

  const hasActiveFilters =
    phaseFilter !== 'all' ||
    diffFilter !== 'all' ||
    hoursFilter !== 'all' ||
    statusFilter !== 'all';

  function clearFilters() {
    setPhaseFilter('all');
    setDiffFilter('all');
    setHoursFilter('all');
    setStatusFilter('all');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header + stats */}
      <section className="mb-6">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-accent" aria-hidden />
          <h1 className="text-xl font-normal tracking-[-0.3px] text-ink sm:text-2xl">
            Project Tracker
          </h1>
          <span className="ml-2 inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] text-accent">
            {ALL_PROJECTS.length} projects
          </span>
        </div>
        <p className="mt-1 text-sm text-body-mid">
          Every bench, simulation, and code project across all 11 phases.
          Mark them off as you ship.
        </p>

        {/* Stat tiles */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            icon={CheckCircle2}
            color="text-accent"
            label="Completed"
            value={`${doneCount} / ${ALL_PROJECTS.length}`}
            sub={`${Math.round((doneCount / ALL_PROJECTS.length) * 100)}%`}
          />
          <StatTile
            icon={CircleDot}
            color="text-accent"
            label="Remaining"
            value={`${ALL_PROJECTS.length - doneCount}`}
            sub="to ship"
          />
          <StatTile
            icon={Clock}
            color="text-accent"
            label="Hours done"
            value={`${doneHours.toFixed(1)} h`}
            sub={`of ${totalHours.toFixed(0)} h`}
          />
          <StatTile
            icon={TrendingUp}
            color="text-accent"
            label="Difficulty mix"
            value={`${ALL_PROJECTS.filter((p) => p.difficulty === 'Foundation').length}F · ${
              ALL_PROJECTS.filter((p) => p.difficulty === 'Intermediate').length
            }I · ${ALL_PROJECTS.filter((p) => p.difficulty === 'Advanced').length}A`}
            sub="F / I / A"
          />
        </div>
      </section>

      {/* Filters */}
      <section className="mb-4 rounded-sm border border-hairline bg-canvas-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-body-mid">
            <Filter className="h-3.5 w-3.5" />
            <span className="eyebrow text-[11px]">Filters</span>
          </div>

          <Select value={phaseFilter} onValueChange={setPhaseFilter}>
            <SelectTrigger className="h-8 w-auto min-w-32 gap-1 rounded-sm text-xs">
              <SelectValue placeholder="Phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All phases</SelectItem>
              {CURRICULUM.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  P{p.index} · {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={diffFilter}
            onValueChange={(v) => setDiffFilter(v as DiffFilter)}
          >
            <SelectTrigger className="h-8 w-auto min-w-36 gap-1 rounded-sm text-xs">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All difficulties</SelectItem>
              {(['Foundation', 'Intermediate', 'Advanced'] as const).map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={hoursFilter}
            onValueChange={(v) => setHoursFilter(v as HoursFilter)}
          >
            <SelectTrigger className="h-8 w-auto min-w-32 gap-1 rounded-sm text-xs">
              <SelectValue placeholder="Hours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any hours</SelectItem>
              <SelectItem value="lt2">&lt; 2 h</SelectItem>
              <SelectItem value="2to5">2 – 5 h</SelectItem>
              <SelectItem value="gt5">&gt; 5 h</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="h-8 w-auto min-w-28 gap-1 rounded-sm text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="todo">To do</SelectItem>
              <SelectItem value="done">Completed</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 gap-1 rounded-full px-2 text-xs text-body-mid"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}

          <span className="ml-auto text-xs text-body-mid">
            {filtered.length} of {ALL_PROJECTS.length}
          </span>
        </div>
      </section>

      {/* Project list */}
      {filtered.length === 0 ? (
        <div className="rounded-sm border border-dashed border-hairline p-10 text-center text-sm text-body-mid">
          No projects match your filters.
        </div>
      ) : (
        <Accordion
          type="multiple"
          className="flex flex-col gap-2"
          defaultValue={filtered.length > 0 ? [filtered[0].id] : []}
        >
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </Accordion>
      )}

      {/* Difficulty legend */}
      <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] text-body-mid">
        <span className="text-ink">Legend:</span>
        {(['Foundation', 'Intermediate', 'Advanced'] as const).map((d) => (
          <span key={d} className="inline-flex items-center gap-1">
            <span
              className={cn(
                'inline-block h-2 w-2 rounded-full',
                DIFFICULTY_STYLES[d].dot
              )}
              aria-hidden
            />
            {d}
            <span className="text-body-mid/60">
              ({ALL_PROJECTS.filter((p) => p.difficulty === d).length})
            </span>
          </span>
        ))}
        <span className="ml-auto inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Total: {formatHours(totalHours)}
        </span>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  color,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-sm border border-hairline bg-canvas-card p-3">
      <Icon className={cn('h-4 w-4', color)} aria-hidden />
      <div className="mt-1.5 ee-mono text-lg text-ink tabular-nums">{value}</div>
      <div className="text-[11px] text-body">{label}</div>
      <div className="text-[10px] text-body-mid">{sub}</div>
    </div>
  );
}
