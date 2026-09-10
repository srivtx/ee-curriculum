'use client';

import Link from 'next/link';
import { Cpu, FileDown, Github, Zap } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="flex items-start gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ee-teal to-ee-teal-dark text-white">
              <Cpu className="h-5 w-5" aria-hidden />
              <Zap
                className="absolute -right-0.5 -top-0.5 h-3 w-3 text-ee-amber"
                aria-hidden
              />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                EE Curriculum for Computer Scientists
              </p>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                An 11-phase, ~12-month self-study path from Maxwell&apos;s
                equations to VLSI and power systems — with a CS concept bridge
                at every step.
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2 text-sm">
            <Link
              href="/download/EE_Curriculum_for_Computer_Scientists.pdf"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-ee-teal dark:hover:text-ee-teal"
            >
              <FileDown className="h-4 w-4" />
              Download full PDF curriculum
            </Link>
            <a
              href="https://github.com/srivtx/ee-curriculum"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-ee-teal dark:hover:text-ee-teal"
            >
              <Github className="h-4 w-4" />
              Source on GitHub
            </a>
            <p className="mt-1 text-xs text-muted-foreground">
              Pyodide v0.26.2 powers the in-browser Python playgrounds.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-2 border-t border-border/40 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {year} srivtx. MIT Licensed — open learning materials.</p>
          <p className="inline-flex items-center gap-1.5">
            Authored by
            <a
              href="https://github.com/srivtx"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-ee-teal"
            >
              srivtx
            </a>
            <span aria-hidden>·</span>
            <span className="ee-mono">v2.0.0</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
