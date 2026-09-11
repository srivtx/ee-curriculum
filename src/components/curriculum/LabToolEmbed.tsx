'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import {
  Cpu,
  CircuitBoard,
  Activity,
  Box,
  LineChart,
  AudioLines,
  ExternalLink,
  Wrench,
  Cog,
} from 'lucide-react';
import type { LabTool, LabStep } from '@/lib/labs';
import { WokwiEmbed } from './WokwiEmbed';
import { HeavySpicePlayground } from './HeavySpicePlayground';
import { VerilogPlayground } from './VerilogPlayground';
import { BodePlot } from './BodePlot';
import { WebAudioScope } from './WebAudioScope';
import { FalstadEmbed } from './FalstadEmbed';
import { CircuitVerseEmbed } from './CircuitVerseEmbed';
import type { ComponentType } from './ComponentViewer3D';
import { cn } from '@/lib/utils';

// ── Heavy / client-only tools — lazy-loaded so they never bloat the initial
//    bundle. The two below carry three.js (ComponentViewer3D) or a sizable
//    SVG + solver (VirtualBreadboard). TscircuitViewer pulls an iframe +
//    tab state. Everything else is light enough to import directly.
const VirtualBreadboard = dynamic(
  () => import('./VirtualBreadboard').then((m) => m.VirtualBreadboard),
  {
    ssr: false,
    loading: () => <ToolLoading label="Loading virtual breadboard…" />,
  }
);

const ComponentViewer3D = dynamic(
  () => import('./ComponentViewer3D').then((m) => m.ComponentViewer3D),
  {
    ssr: false,
    loading: () => <ToolLoading label="Loading 3D model…" />,
  }
);

const TscircuitViewer = dynamic(
  () => import('./TscircuitViewer').then((m) => m.TscircuitViewer),
  {
    ssr: false,
    loading: () => <ToolLoading label="Loading tscircuit viewer…" />,
  }
);

// ── Tool metadata (label + icon), used for the header strip on each embed. ──
export const TOOL_META: Record<
  LabTool,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  breadboard: { label: 'Virtual Breadboard', icon: CircuitBoard },
  wokwi: { label: 'Wokwi Simulation', icon: Cpu },
  spice: { label: 'SPICE Simulator', icon: Activity },
  verilog: { label: 'Verilog HDL', icon: Cpu },
  '3d-model': { label: '3D Model', icon: Box },
  bode: { label: 'Bode Plot', icon: LineChart },
  scope: { label: 'Oscilloscope', icon: AudioLines },
  falstad: { label: 'Falstad Simulator', icon: CircuitBoard },
  circuitverse: { label: 'CircuitVerse', icon: Cpu },
  tscircuit: { label: 'tscircuit', icon: CircuitBoard },
  hardware: { label: 'Real Hardware', icon: Wrench },
};

// ── Default Falstad URL — the empty editor (loads the applet; the user picks
//    an example circuit from the menu). Validated as on falstad.com by the
//    embed component. Used when a lab step references the falstad tool but
//    doesn't supply a specific circuit URL.
const FALSTAD_DEFAULT = 'https://www.falstad.com/circuit/circuitjs.html';

// ── Valid ComponentViewer3D model ids. Used to safely coerce the string from
//    lab data into the union type expected by the 3D viewer.
const VALID_3D_MODELS: ReadonlySet<ComponentType> = new Set([
  'resistor',
  'capacitor',
  'inductor',
  'led',
  'transistor',
  'diode',
  'ic',
  'breadboard',
]);

function coerceModel(id: string | undefined): ComponentType {
  if (id && VALID_3D_MODELS.has(id as ComponentType)) {
    return id as ComponentType;
  }
  return 'resistor';
}

function ToolLoading({ label }: { label: string }) {
  return (
    <div className="flex h-[360px] items-center justify-center rounded-sm border border-accent/30 bg-canvas-card text-xs text-body-mid">
      <span className="ee-mono">{label}</span>
    </div>
  );
}

/**
 * Friendly fallback for tools that can't be embedded inline (real-hardware
 * steps, or a simulator that needs the user to click through to an external
 * editor). Renders an info card with an outbound link instead of an iframe.
 */
function ToolFallbackCard({
  icon: Icon,
  title,
  body,
  href,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="rounded-sm border border-hairline bg-canvas-card p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent" aria-hidden />
        <span className="eyebrow text-[11px] text-accent">{title}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-body">{body}</p>
      {href && cta && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs text-accent hover:bg-accent/20"
        >
          <ExternalLink className="h-3 w-3" />
          {cta}
        </a>
      )}
    </div>
  );
}

export interface LabToolEmbedProps {
  tool: LabTool;
  config?: LabStep['toolConfig'];
  /** Optional title for the embed header (e.g. the lab or step title). */
  title?: string;
  /** Extra className on the wrapper. */
  className?: string;
}

/**
 * Render the interactive tool that a lab step (or a playground entry) points
 * at. Centralises the tool → component mapping so LabsView and PlaygroundView
 * stay declarative: pass a `tool` and an optional `config`, get the right
 * embed. Heavy tools (three.js, breadboard solver, tscircuit iframe) load
 * lazily via `next/dynamic({ ssr: false })`.
 */
export function LabToolEmbed({
  tool,
  config,
  title,
  className,
}: LabToolEmbedProps) {
  const headerTitle = title ?? TOOL_META[tool].label;

  let content: React.ReactNode;
  switch (tool) {
    case 'breadboard':
      content = <VirtualBreadboard />;
      break;
    case 'wokwi':
      content = (
        <WokwiEmbed
          projectUrl={config?.wokwiProject}
          title={headerTitle}
        />
      );
      break;
    case 'spice':
      content = (
        <HeavySpicePlayground
          starterNetlist={config?.spiceNetlist}
          lessonTitle={headerTitle}
        />
      );
      break;
    case 'verilog':
      content = (
        <VerilogPlayground
          starterCode={config?.verilogCode}
          lessonTitle={headerTitle}
        />
      );
      break;
    case '3d-model':
      content = (
        <ComponentViewer3D
          component={coerceModel(config?.modelComponent)}
          height={420}
        />
      );
      break;
    case 'bode':
      content = <BodePlot label={headerTitle} />;
      break;
    case 'scope':
      content = <WebAudioScope lessonTitle={headerTitle} />;
      break;
    case 'falstad':
      content = (
        <FalstadEmbed
          circuitUrl={FALSTAD_DEFAULT}
          title={headerTitle}
          caption="Falstad runs the full CircuitJS1 simulator. Use the Circuits menu to load an example, or build your own."
        />
      );
      break;
    case 'circuitverse':
      content = <CircuitVerseEmbed title={headerTitle} />;
      break;
    case 'tscircuit':
      content = <TscircuitViewer />;
      break;
    case 'hardware':
      content = (
        <ToolFallbackCard
          icon={Wrench}
          title="Real Hardware Step"
          body="This step asks you to wire up real components on a physical breadboard. The simulator can't replace the smell of burning LED — follow the step instructions with actual parts. (No hardware? Re-read the step and simulate the equivalent in the tool from the previous step.)"
          href="https://wokwi.com"
          cta="Simulate instead in Wokwi"
        />
      );
      break;
    default:
      content = (
        <ToolFallbackCard
          icon={Cog}
          title="Tool unavailable"
          body={`No embeddable tool is configured for "${tool}".`}
        />
      );
  }

  return (
    <div className={cn('lab-tool-embed', className)}>{content}</div>
  );
}
