'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import type { Lesson } from '@/lib/curriculum';
import {
  SEARCH_INDEX,
  type SearchEntry,
  type ResultKind,
} from '@/lib/curriculumIndex';
import type { ViewKey } from './Header';
import { cn } from '@/lib/utils';

/**
 * Global search palette — opens with ⌘K (macOS) / Ctrl+K (Windows/Linux).
 *
 * Searches across: lesson titles + summaries, module titles, phase titles,
 * project titles, and checkpoint questions. Results are grouped by kind and
 * show a colored badge (Lesson / Project / Checkpoint / Phase).
 *
 * Built on top of the shadcn `Command` (cmdk) primitive, but with
 * `shouldFilter={false}` and our own debounced filter (150 ms) so the
 * filtering logic is fully under our control. Keyboard navigation
 * (↑/↓/Enter/Esc) is provided by cmdk.
 */
export interface SearchPaletteProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onOpenLesson: (lesson: Lesson) => void;
  onNavigate: (v: ViewKey) => void;
}

const KIND_META: Record<
  ResultKind,
  { label: string; className: string }
> = {
  lesson: {
    label: 'Lesson',
    className: 'border-accent/40 text-accent',
  },
  project: {
    label: 'Project',
    className: 'border-warning/40 text-warning',
  },
  checkpoint: {
    label: 'Checkpoint',
    className: 'border-info/40 text-info',
  },
  phase: {
    label: 'Phase',
    className: 'border-hairline text-body-mid',
  },
};

const GROUP_ORDER: ResultKind[] = ['lesson', 'project', 'checkpoint', 'phase'];
const GROUP_LABEL: Record<ResultKind, string> = {
  lesson: 'Lessons',
  project: 'Projects',
  checkpoint: 'Checkpoints',
  phase: 'Phases',
};

const MAX_PER_KIND = 12;

export function SearchPalette({
  open,
  onOpenChange,
  onOpenLesson,
  onNavigate,
}: SearchPaletteProps) {
  // The text the user has actually committed to filtering on (debounced).
  const [committed, setCommitted] = React.useState('');
  // The raw input value — what the user sees in the box, updates instantly.
  const [raw, setRaw] = React.useState('');

  // Reset the input whenever the palette is opened/closed so a stale query
  // from a previous session doesn't linger.
  React.useEffect(() => {
    if (open) {
      setRaw('');
      setCommitted('');
    }
  }, [open]);

  // Debounce the raw input → committed query (150 ms).
  React.useEffect(() => {
    const t = window.setTimeout(() => setCommitted(raw.trim()), 150);
    return () => window.clearTimeout(t);
  }, [raw]);

  // Compute filtered results whenever the committed query changes.
  const results = React.useMemo<SearchEntry[]>(() => {
    if (!committed) return [];
    const terms = committed.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];
    const matches: SearchEntry[] = [];
    for (const entry of SEARCH_INDEX) {
      // Every whitespace-separated term must appear somewhere in the haystack.
      let ok = true;
      for (const t of terms) {
        if (!entry.haystack.includes(t)) {
          ok = false;
          break;
        }
      }
      if (ok) matches.push(entry);
      if (matches.length >= 80) break; // safety cap
    }
    return matches;
  }, [committed]);

  // Bucket results by kind for grouped display.
  const bucketed = React.useMemo(() => {
    const map: Record<ResultKind, SearchEntry[]> = {
      lesson: [],
      project: [],
      checkpoint: [],
      phase: [],
    };
    for (const r of results) {
      if (map[r.kind].length < MAX_PER_KIND) map[r.kind].push(r);
    }
    return map;
  }, [results]);

  const handleSelect = React.useCallback(
    (entry: SearchEntry) => {
      onOpenChange(false);
      if (entry.kind === 'lesson' && entry.lesson) {
        onOpenLesson(entry.lesson);
      } else if (entry.view) {
        onNavigate(entry.view);
      }
    },
    [onOpenChange, onOpenLesson, onNavigate]
  );

  // Total count for the empty-state message.
  const totalShown = GROUP_ORDER.reduce(
    (n, k) => n + bucketed[k].length,
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl overflow-hidden rounded-sm border-hairline bg-canvas-card p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Search the curriculum</DialogTitle>
        <DialogDescription className="sr-only">
          Search lessons, projects, checkpoints, and phases. Use the arrow
          keys to move, Enter to open, Esc to close.
        </DialogDescription>
        <Command shouldFilter={false} className="bg-transparent">
          <CommandInput
            placeholder="Search lessons, projects, checkpoints, phases…"
            value={raw}
            onValueChange={setRaw}
            autoFocus
          />
          <CommandList className="max-h-[60vh]">
            {committed && totalShown === 0 ? (
              <CommandEmpty>
                <span className="text-body-mid">
                  No matches for{' '}
                  <span className="ee-mono text-ink">&ldquo;{committed}&rdquo;</span>
                </span>
              </CommandEmpty>
            ) : null}

            {!committed ? (
              <div className="px-3 py-8 text-center text-xs text-body-mid">
                <Search className="mx-auto mb-2 h-5 w-5 opacity-40" aria-hidden />
                Start typing to search{' '}
                <span className="text-ink">{SEARCH_INDEX.length}</span> entries
                across the curriculum.
              </div>
            ) : null}

            {GROUP_ORDER.map((kind) => {
              const items = bucketed[kind];
              if (items.length === 0) return null;
              return (
                <CommandGroup
                  key={kind}
                  heading={GROUP_LABEL[kind]}
                  className="[&_[cmdk-group-heading]]:text-body-mid [&_[cmdk-group-heading]]:eyebrow"
                >
                  {items.map((entry) => {
                    const meta = KIND_META[entry.kind];
                    return (
                      <CommandItem
                        key={entry.id}
                        value={entry.id}
                        onSelect={() => handleSelect(entry)}
                        className="gap-3 rounded-sm px-2.5 py-2 text-left data-[selected=true]:bg-accent/10"
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            'shrink-0 rounded-full px-1.5 py-0 text-[10px] font-medium',
                            meta.className
                          )}
                        >
                          {meta.label}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm text-ink">
                            {entry.title}
                          </div>
                          <div className="truncate text-[11px] text-body-mid">
                            {entry.subtitle}
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              );
            })}
          </CommandList>
          {/* Footer hint */}
          <div className="flex items-center justify-between gap-2 border-t border-hairline px-3 py-2 text-[10px] text-body-mid">
            <span className="eyebrow">
              <kbd className="ee-mono rounded-sm border border-hairline px-1 py-0.5">
                ↑
              </kbd>{' '}
              <kbd className="ee-mono rounded-sm border border-hairline px-1 py-0.5">
                ↓
              </kbd>{' '}
              to move
            </span>
            <span className="eyebrow">
              <kbd className="ee-mono rounded-sm border border-hairline px-1 py-0.5">
                ↵
              </kbd>{' '}
              to open ·{' '}
              <kbd className="ee-mono rounded-sm border border-hairline px-1 py-0.5">
                esc
              </kbd>{' '}
              to close
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
