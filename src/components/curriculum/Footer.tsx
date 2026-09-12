'use client';

import Link from 'next/link';
import { Github } from 'lucide-react';
import { EEMonogram } from './EEMonogram';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-hairline bg-canvas px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left — brand + attribution */}
        <div className="flex items-center gap-2">
          <EEMonogram size={22} />
          <span className="text-sm font-medium text-ink">EE</span>
          <span className="text-sm text-body-mid">·</span>
          <span className="text-sm text-body-mid">by svx</span>
        </div>

        {/* Right — links */}
        <div className="flex items-center gap-4">
          <Link
            href="/download/EE_Curriculum_for_Computer_Scientists.pdf"
            target="_blank"
            rel="noopener"
            className="text-sm text-body-mid transition-colors hover:text-ink"
          >
            PDF
          </Link>
          <a
            href="https://github.com/srivtx/ee-curriculum"
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-mid transition-colors hover:text-ink"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          <span className="text-sm text-mute">© {year}</span>
        </div>
      </div>
    </footer>
  );
}
