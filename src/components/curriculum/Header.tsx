'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Cpu, Moon, Sun, Github, FileDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ProgressIndicator } from './ProgressIndicator';

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
}: {
  view: ViewKey;
  onView: (v: ViewKey) => void;
  overallPct: number;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = theme === 'dark';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border/60',
        'bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => onView('curriculum')}
          className="group flex items-center gap-2.5 pr-2"
          aria-label="EE Curriculum home"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ee-teal to-ee-teal-dark text-white shadow-sm">
            <Cpu className="h-5 w-5" aria-hidden />
            <Zap
              className="absolute -right-0.5 -top-0.5 h-3 w-3 text-ee-amber"
              aria-hidden
            />
          </span>
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              EE Curriculum
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              for Computer Scientists
            </span>
          </span>
        </button>

        {/* Nav tabs */}
        <nav
          className="ml-2 hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => onView(n.key)}
              aria-current={view === n.key ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                view === n.key
                  ? 'bg-ee-teal/10 text-ee-teal-dark dark:text-ee-teal'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Overall progress indicator (md+) */}
        <div className="hidden items-center gap-2 lg:flex">
          <span className="text-xs text-muted-foreground">Progress</span>
          <ProgressIndicator value={overallPct} showLabel />
        </div>

        {/* PDF download */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex"
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

        {/* GitHub (decorative) */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="hidden sm:inline-flex"
          aria-label="GitHub"
        >
          <Link href="https://github.com/srivtx/ee-curriculum" target="_blank" rel="noopener noreferrer" aria-label="Source on GitHub">
            <Github className="h-4 w-4" />
          </Link>
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
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

      {/* Mobile nav row */}
      <nav
        className="flex items-center gap-1 overflow-x-auto border-t border-border/40 px-3 py-2 md:hidden ee-scroll"
        aria-label="Primary mobile"
      >
        {NAV.map((n) => (
          <button
            key={n.key}
            onClick={() => onView(n.key)}
            aria-current={view === n.key ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              view === n.key
                ? 'bg-ee-teal/10 text-ee-teal-dark dark:text-ee-teal'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {n.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pl-3">
          <span className="text-xs text-muted-foreground">Progress</span>
          <ProgressIndicator value={overallPct} />
        </div>
      </nav>
    </header>
  );
}
