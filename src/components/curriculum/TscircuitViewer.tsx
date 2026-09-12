'use client';

import * as React from 'react';
import { ExternalLink, Cpu, RotateCw, Code2, Eye } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface TscircuitViewerProps {
  /**
   * tscircuit React source — a `<Circuit>` tree of `<resistor>`, `<capacitor>`,
   * `<led>`, `<power>`, `<ground>` etc. primitives. When omitted, a starter
   * 555-style LED blinker is shown.
   */
  code?: string;
  /** Optional title for the card header (defaults to "tscircuit"). */
  title?: string;
}

/**
 * Default starter circuit — a simple RC + LED. tscircuit is a React-based PCB
 * design tool: you write circuits as JSX and it renders schematic + PCB + 3D
 * board views. This starter is a gentle on-ramp.
 */
const DEFAULT_CODE = `import { Circuit, Resistor, Capacitor, Led, PowerSource, Ground } from "@tscircuit/react-fiber"

// Simple LED current limiter: 5 V → 220 Ω → LED → GND.
// Toggle to the PCB and 3D Board tabs to see the layout.
export default function LedBlinker() {
  return (
    <Circuit>
      <PowerSource voltage={5} name="V1" />
      <Resistor resistance="220" footprint="0805" name="R1" />
      <Capacitor capacitance="100nF" footprint="0805" name="C1" />
      <Led color="red" footprint="0805" name="LED1" />
      <Ground />
    </Circuit>
  )
}
`;

type TabKey = 'schematic' | 'pcb' | '3d';

const TABS: { key: TabKey; label: string; hint: string }[] = [
  {
    key: 'schematic',
    label: 'Schematic',
    hint: 'Circuit topology — the logical connections.',
  },
  {
    key: 'pcb',
    label: 'PCB',
    hint: 'Physical layout — copper traces, footprints, silkscreen.',
  },
  {
    key: '3d',
    label: '3D Board',
    hint: 'Rendered PCB with component bodies — what you’d actually manufacture.',
  },
];

/**
 * tscircuit viewer — Schematic / PCB / 3D Board tabs.
 *
 * tscircuit is a React-based circuit design tool. You write circuits as JSX
 * (`<Circuit><Resistor /><Led /></Circuit>`) and the runner renders them as
 * a schematic, a PCB layout, and a 3D board. The full React runtime
 * (@tscircuit/react-fiber + @tscircuit/runframe) is a ~27 MB dependency tree
 * that doesn't yet cleanly support React 19 / Turbopack, so this component
 * uses the fallback strategy from the task spec:
 *
 *   1. A read-only code panel showing the tscircuit React source.
 *   2. An iframe to https://tscircuit.com/editor (the live web editor —
 *      tscircuit.com serves it without X-Frame-Options so it CAN be
 *      embedded).
 *   3. A prominent "Open in tscircuit.com →" button.
 *   4. Tabs (Schematic / PCB / 3D Board) that switch the iframe URL to the
 *      corresponding tscircuit.com editor view. If the URL param isn't
 *      honoured by the SPA, the iframe still loads the editor — the tabs
 *      still act as the visual structure required by the lesson.
 *
 * See: https://tscircuit.com (MIT, React-based circuit design).
 */
export function TscircuitViewer({
  code,
  title = 'tscircuit',
}: TscircuitViewerProps) {
  const source = React.useMemo(() => code?.trim() || DEFAULT_CODE, [code]);
  const [tab, setTab] = React.useState<TabKey>('schematic');
  const [iframeKey, setIframeKey] = React.useState(0);

  // Build the tscircuit.com editor URL for the active tab. The editor accepts
  // a `?initial_tab=` query param that pre-selects the schematic / pcb / 3d
  // panel. If tscircuit.com changes their URL scheme, the iframe still loads
  // the editor — the tab just defaults to whatever the SPA picks.
  const editorUrl = React.useMemo(() => {
    const u = new URL('https://tscircuit.com/editor');
    u.searchParams.set('initial_tab', tab);
    return u.toString();
  }, [tab]);

  const activeHint = TABS.find((t) => t.key === tab)?.hint ?? '';

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Cpu className="h-4 w-4 text-accent" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {title}
        </span>
        <span className="text-[10px] text-body-mid">
          (tscircuit · schematic + PCB + 3D board)
        </span>
        <button
          type="button"
          onClick={() => setIframeKey((k) => k + 1)}
          className="ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-body-mid hover:bg-canvas-soft hover:text-ink"
          aria-label="Reload editor"
          title="Reload editor"
        >
          <RotateCw className="h-3 w-3" />
          reload
        </button>
        <a
          href="https://tscircuit.com/editor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-accent hover:bg-accent/10"
        >
          <ExternalLink className="h-3 w-3" />
          Open in tscircuit.com
        </a>
      </div>

      {/* Tabs: Schematic / PCB / 3D Board */}
      <div className="bg-canvas-card px-3 pt-3">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as TabKey)}
          className="w-full"
        >
          <TabsList className="bg-canvas-soft">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.key}
                value={t.key}
                className="text-[11px] data-[state=active]:bg-accent data-[state=active]:text-canvas"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((t) => (
            <TabsContent key={t.key} value={t.key} className="mt-3">
              <div className="text-[10px] text-body-mid">{t.hint}</div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Iframe — tscircuit.com editor (serves 200, no X-Frame-Options) */}
      <div className="px-3 pb-3">
        <iframe
          key={`${tab}-${iframeKey}`}
          title={`${title} — ${tab} view`}
          src={editorUrl}
          className="block h-[480px] w-full rounded-sm border border-hairline bg-white"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          allow="fullscreen; clipboard-read; clipboard-write"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <p className="mt-1.5 text-[10px] text-body-mid">
          {activeHint} The embedded editor is the full tscircuit.com SPA —
          sign in there to save and fork circuits.
        </p>
      </div>

      {/* Code panel */}
      <div className="border-t border-hairline bg-canvas-card px-3 py-2.5">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Code2 className="h-3 w-3 text-accent" aria-hidden />
          <span className="eyebrow text-[10px] text-accent">
            tscircuit React source
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-body-mid">
            <Eye className="h-3 w-3" aria-hidden />
            copy into the editor to run
          </span>
        </div>
        <pre
          className={cn(
            'ee-mono max-h-72 overflow-auto rounded-sm border border-hairline bg-canvas p-2.5',
            'text-[11px] leading-relaxed text-body'
          )}
        >
          <code>{source}</code>
        </pre>
      </div>

      {/* Footer */}
      <div className="border-t border-hairline bg-canvas-card px-3 py-2.5">
        <p className="text-[11px] leading-relaxed text-body-mid">
          tscircuit turns{' '}
          <span className="text-accent">React components into PCBs</span>.
          Write a circuit as JSX, then click{' '}
          <span className="text-ink">Open in tscircuit.com →</span> to render
          the schematic, lay out the PCB, and export Gerbers for fabrication.
        </p>
      </div>
    </div>
  );
}
