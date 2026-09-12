'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, Github, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EEMonogram } from './EEMonogram';

export type ViewKey =
  | 'dashboard'
  | 'curriculum'
  | 'labs'
  | 'playground'
  | 'projects'
  | 'checkpoints';

// Minimal nav — 4 primary tabs. Projects and Checkpoints are accessible
// from within Dashboard and Curriculum respectively (not top-level noise).
const NAV: { key: ViewKey; label: string }[] = [
  { key: 'curriculum', label: 'Curriculum' },
  { key: 'labs', label: 'Labs' },
  { key: 'playground', label: 'Playground' },
  { key: 'dashboard', label: 'Dashboard' },
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
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo — minimal, just the monogram + wordmark */}
        <button
          onClick={() => onView('curriculum')}
          className="flex items-center gap-2"
          aria-label="EE Curriculum home"
        >
          <EEMonogram size={26} />
          <span className="text-sm font-medium text-ink">EE</span>
        </button>

        {/* Nav — minimal text buttons, no pills, no borders */}
        <nav className="flex items-center gap-1" aria-label="Primary">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => onView(n.key)}
              aria-current={view === n.key ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                view === n.key
                  ? 'text-ink'
                  : 'text-body-mid hover:text-ink'
              )}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-md"
          aria-label="Search (Cmd+K)"
          onClick={onOpenSearch}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-md"
          aria-label="Toggle dark mode"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          {mounted ? (
            isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4 opacity-0" />
          )}
        </Button>

        {/* GitHub */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-md"
          aria-label="GitHub"
        >
          <Link
            href="https://github.com/srivtx/ee-curriculum"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
