'use client';

import Link from 'next/link';
import { FileDown, Github } from 'lucide-react';
import { EEMonogram } from './EEMonogram';

/**
 * Footer — Design System v3 §8.9.
 *
 * Subtle "by svx" attribution as the colophon, with "Sribatsha dash"
 * as the smaller subtitle. GitHub URL stays github.com/srivtx (the actual
 * account) — that's the only place the srivtx handle appears in the UI.
 */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-hairline bg-canvas px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand + colophon */}
          <div className="flex items-start gap-3">
            <EEMonogram size={32} ariaLabel="EE Curriculum voxel monogram" />
            <div className="min-w-0">
              <p className="text-sm font-medium tracking-[-0.01em] text-ink">
                EE Curriculum for Computer Scientists
              </p>
              <p className="mt-0.5 max-w-md text-sm text-body-mid">
                An 11-phase, ~12-month self-study path from Maxwell&apos;s
                equations to VLSI and power systems — with a CS concept bridge
                at every step.
              </p>
              {/* Colophon: by svx · Sribatsha dash */}
              <p className="mt-3 eyebrow text-[11px] text-body-mid">
                by svx
                <span className="mx-1.5 text-mute" aria-hidden>·</span>
                <span className="text-mute">Sribatsha dash</span>
              </p>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3">
            <FooterCol heading="Curriculum">
              <FooterLink onClick={() => {
                // FooterLink handles its own click; this is for any
                // future progressive enhancement. noop.
              }}>
                11 phases · ~12 months
              </FooterLink>
              <FooterLink href="/download/EE_Curriculum_for_Computer_Scientists.pdf" external>
                Download PDF
              </FooterLink>
            </FooterCol>
            <FooterCol heading="Resources">
              <FooterLink href="https://github.com/srivtx/ee-curriculum" external>
                Source on GitHub
              </FooterLink>
              <FooterLink href="https://github.com/srivtx/ee-curriculum/issues" external>
                Report an issue
              </FooterLink>
            </FooterCol>
            <FooterCol heading="About">
              <FooterLink href="https://github.com/srivtx" external>
                Author: svx
              </FooterLink>
              <FooterLink href="/LICENSE" target="_blank" rel="noopener">
                MIT Licensed
              </FooterLink>
            </FooterCol>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center">
          <p className="eyebrow text-[11px] text-body-mid">
            © {year} · MIT Licensed · v3.0
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/download/EE_Curriculum_for_Computer_Scientists.pdf"
              target="_blank"
              rel="noopener"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-body-mid transition-colors duration-150 hover:text-ink"
              aria-label="Download curriculum PDF"
            >
              <FileDown className="h-3.5 w-3.5" />
            </Link>
            <a
              href="https://github.com/srivtx/ee-curriculum"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-body-mid transition-colors duration-150 hover:text-ink"
              aria-label="Source on GitHub"
            >
              <Github className="h-3.5 w-3.5" />
            </a>
            <p className="eyebrow ml-2 text-[11px] text-mute">
              by svx · Sribatsha dash · github.com/srivtx
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="eyebrow text-[11px] text-accent">{heading}</span>
      {children}
    </div>
  );
}

function FooterLink({
  href,
  external,
  children,
  onClick,
  target,
  rel,
}: {
  href?: string;
  external?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  target?: string;
  rel?: string;
}) {
  const cls =
    'text-sm text-body-mid transition-colors duration-150 hover:text-ink';
  if (!href) {
    return (
      <button onClick={onClick} className={cls + ' text-left'}>
        {children}
      </button>
    );
  }
  if (external) {
    return (
      <a
        href={href}
        target={target ?? '_blank'}
        rel={rel ?? 'noopener noreferrer'}
        className={cls}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} target={target} rel={rel} className={cls}>
      {children}
    </Link>
  );
}
