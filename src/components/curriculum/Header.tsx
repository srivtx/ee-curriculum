'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, Github, FileDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ProgressIndicator } from './ProgressIndicator';
import { EEMonogram } from './EEMonogram';

export type ViewKey = 'dashboard' | 'curriculum' | 'projects' | 'checkpoints';

const NAV: { key: ViewKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'curriculum', label: 'Curriculum' },
  { key: 'projects', label: 'Projects' },
  { key: 'checkpoints', label: 'Checkpoints' },
];

export function Header({
  view,
  onView,
  overallPct,
  onOpenSearch,
}: {
  view: ViewKey;
  onView: (v: ViewKey) => void;
  overallPct: number;
  onOpenSearch: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = theme === 'dark';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-hairline/60',
        'bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/70'
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:h-16 sm:gap-3 sm:px-6">
        {/* Logo + brand */}
        <button
          onClick={() => onView('curriculum')}
          className="group flex items-center gap-2 pr-1 sm:gap-2.5 sm:pr-2"
          aria-label="EE Curriculum home"
        >
          <EEMonogram size={28} />
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="text-sm font-medium tracking-[-0.01em] text-ink">
              EE Curriculum
            </span>
            <span className="eyebrow text-[10px] text-body-mid">
              for Computer Scientists
            </span>
          </span>
        </button>

        {/* Nav tabs — pill buttons (desktop only; mobile uses the row below) */}
        <nav
          className="ml-1 hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => onView(n.key)}
              aria-current={view === n.key ? 'page' : undefined}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm transition-colors duration-150',
                view === n.key
                  ? 'bg-accent/10 text-accent border border-accent/30'
                  : 'text-body-mid hover:bg-canvas-soft hover:text-ink'
              )}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Overall progress indicator (lg+) */}
        <div className="hidden items-center gap-2 lg:flex">
          <span className="eyebrow text-[11px] text-body-mid">Progress</span>
          <ProgressIndicator value={overallPct} showLabel />
        </div>

        {/* PDF download — desktop only */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex rounded-full"
        >
          <Link
            href="/download/EE_Curriculum_for_Computer_Scientists.pdf"
            target="_blank"
            rel="noopener"
            aria-label="Download curriculum PDF"
          >
            <FileDown className="mr-1.5 h-4 w-4" />
            PDF
          </Link>
        </Button>

        {/* GitHub — always visible (icon-only) */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="GitHub"
        >
          <Link
            href="https://github.com/srivtx/ee-curriculum"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Source on GitHub"
          >
            <Github className="h-4 w-4" />
          </Link>
        </Button>

        {/* Search trigger — visible on all breakpoints. Clicking opens the
            Cmd+K palette; on desktop we also show the ⌘K hint pill. */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Search (Cmd+K)"
          onClick={onOpenSearch}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Theme toggle — always visible */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Toggle dark mode"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          {mounted ? (
            isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )
          ) : (
            <Sun className="h-4 w-4 opacity-0" />
          )}
        </Button>
      </div>

      {/* Mobile nav row — horizontally scrollable pill buttons.
          The progress indicator lives OUTSIDE the scroll container so it
          doesn't get pushed off-screen by `ml-auto` semantics inside an
          overflow-x-auto parent. */}
      <div className="flex items-center gap-3 border-t border-hairline/40 px-3 py-2 md:hidden">
        <nav
          className="ee-scroll flex flex-1 items-center gap-1 overflow-x-auto"
          aria-label="Primary mobile"
          style={{ scrollbarWidth: 'none' }}
        >
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => onView(n.key)}
              aria-current={view === n.key ? 'page' : undefined}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors duration-150',
                view === n.key
                  ? 'bg-accent/10 text-accent border border-accent/30'
                  : 'text-body-mid hover:bg-canvas-soft'
              )}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="eyebrow text-[10px] text-body-mid">%</span>
          <span className="ee-mono text-sm tabular-nums text-accent">
            {Math.round(overallPct)}
          </span>
        </div>
      </div>
    </header>
  );
}
