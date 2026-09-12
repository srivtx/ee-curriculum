'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Circle,
  Clock,
  Lightbulb,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  PartyPopper,
  X,
} from 'lucide-react';
import type { Lesson, Module } from '@/lib/curriculum';
import { getNextLesson } from '@/lib/curriculumIndex';
import { useProgress } from '@/hooks/useProgress';
import {
  DIFFICULTY_STYLES,
  LESSON_TYPE_META,
  formatDuration,
} from './helpers';
import { PythonPlayground } from './PythonPlayground';
import { KatexFormulaList } from './KatexRenderer';
import { FalstadEmbed } from './FalstadEmbed';
import { WaveDromDiagram } from './WaveDromDiagram';
import { BodePlot } from './BodePlot';
import { SpicePlayground } from './SpicePlayground';
import { HeavySpicePlayground } from './HeavySpicePlayground';
import { VerilogPlayground } from './VerilogPlayground';
import { KiCanvasEmbed } from './KiCanvasEmbed';
import { WebAudioScope } from './WebAudioScope';
import { IQEngineEmbed } from './IQEngineEmbed';
import { WokwiEmbed } from './WokwiEmbed';
import { WokwiElementsDemo } from './WokwiElementsDemo';
import { CircuitVerseEmbed } from './CircuitVerseEmbed';
import { cn } from '@/lib/utils';
import {
  getLessonFeatures,
  type FeatureMeta,
} from './lessonFeatures';

// Heavy 3D viewer — three.js + @react-three/fiber + @react-three/drei. Loaded
// lazily and only on the client so it never bloats the initial bundle.
const ComponentViewer3D = dynamic(
  () => import('./ComponentViewer3D').then((m) => m.ComponentViewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-sm border border-accent/30 bg-canvas-card text-xs text-body-mid">
        Loading 3D model…
      </div>
    ),
  }
);

// Virtual breadboard — 2D SVG breadboard (palette + holes + wires + LED
// glow). Loaded lazily and only on the client so the component code only
// ships when a lesson with `has_breadboard` is opened.
const VirtualBreadboard = dynamic(
  () => import('./VirtualBreadboard').then((m) => m.VirtualBreadboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] items-center justify-center rounded-sm border border-accent/30 bg-canvas-card text-xs text-body-mid">
        Loading virtual breadboard…
      </div>
    ),
  }
);

// tscircuit viewer — Schematic / PCB / 3D Board tabs + code panel + iframe
// to tscircuit.com/editor. The iframe + tabs add some weight, so loaded
// lazily and only on the client (a lesson with `has_tscircuit` is opened).
const TscircuitViewer = dynamic(
  () => import('./TscircuitViewer').then((m) => m.TscircuitViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] items-center justify-center rounded-sm border border-accent/30 bg-canvas-card text-xs text-body-mid">
        Loading tscircuit viewer…
      </div>
    ),
  }
);

export interface LessonDrawerPayload {
  lesson: Lesson;
  module?: Module;
  phaseTitle?: string;
  moduleTitle?: string;
}

/**
 * Full-page lesson view.
 *
 * Replaces the old shadcn `Sheet` (which was a half-page right drawer) with a
 * 100vw × 100vh overlay. The content sits in a centered `max-w-4xl` column so
 * reading width stays comfortable, but the overlay itself is the entire
 * viewport. Dismissible via the Back button, the X icon, the ESC key, or by
 * navigating back. Background body scroll is locked while the overlay is open.
 *
 * Design System v3: phosphor grass accent, JetBrains Mono eyebrows, voxel
 * progress bar, blurred sticky header.
 */
export function LessonDrawer({
  payload,
  open,
  onOpenChange,
  onOpenNextLesson,
}: {
  payload: LessonDrawerPayload | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Open the lesson that follows the currently-displayed one. */
  onOpenNextLesson: (currentLessonId: string) => void;
}) {
  // ESC key closes the overlay.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  // Lock body scroll while the overlay is open so the background page doesn't
  // move underneath.
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset overlay scroll position whenever a new lesson is opened.
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [open, payload?.lesson.id]);

  if (!open || !payload) return null;

  return (
    <FullPageLesson
      payload={payload}
      onOpenChange={onOpenChange}
      onOpenNextLesson={onOpenNextLesson}
      scrollRef={scrollRef}
    />
  );
}

function FullPageLesson({
  payload,
  onOpenChange,
  onOpenNextLesson,
  scrollRef,
}: {
  payload: LessonDrawerPayload;
  onOpenChange: (v: boolean) => void;
  onOpenNextLesson: (currentLessonId: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { lesson, module, phaseTitle, moduleTitle } = payload;
  const meta = LESSON_TYPE_META[lesson.type];
  const TypeIcon = meta.icon;
  const { isLessonDone, toggleLesson } = useProgress();
  const done = isLessonDone(lesson.id);

  const csBridge = lesson.cs_bridge ?? module?.cs_bridge;
  const features = getLessonFeatures(lesson, module?.cs_bridge);

  // Scroll the overlay to the anchor (the overlay is the scroll container).
  const scrollToFeature = (anchor: string) => {
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('feature-flash');
      window.setTimeout(() => {
        el.classList.remove('feature-flash');
      }, 1200);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-canvas"
      role="dialog"
      aria-modal="true"
      aria-label={lesson.title}
    >
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="ee-scroll absolute inset-0 overflow-y-auto"
      >
        {/* Sticky header — blurred backdrop, full-width */}
        <div className="sticky top-0 z-10 border-b border-hairline bg-canvas/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="shrink-0 gap-1.5 rounded-full px-2 text-body-mid hover:text-ink sm:px-3"
                aria-label="Back to curriculum"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex min-w-0 items-center gap-2">
                <TypeIcon
                  className={cn('h-4 w-4 shrink-0', meta.color)}
                  aria-hidden
                />
                <span className="truncate text-sm text-body-mid sm:text-base sm:text-ink">
                  {lesson.title}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {/* Mark complete toggle */}
              <Button
                variant={done ? 'outline' : 'default'}
                size="sm"
                onClick={() => toggleLesson(lesson.id)}
                className={cn(
                  'gap-1.5 rounded-full px-2.5 sm:px-3',
                  !done && 'bg-accent text-canvas hover:bg-accent/90'
                )}
                aria-pressed={done}
              >
                {done ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                    <span className="hidden sm:inline">Completed</span>
                    <span className="sm:hidden">Done</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Mark complete</span>
                    <span className="sm:hidden">Done</span>
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="rounded-full text-body-mid hover:text-ink"
                aria-label="Close lesson view"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Centered content column */}
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          {/* Lesson header (breadcrumb + title + meta) */}
          <header className="mb-6">
            <div className="eyebrow flex flex-wrap items-center gap-1.5 text-[11px] text-body-mid">
              {phaseTitle && (
                <>
                  <span className="truncate">{phaseTitle}</span>
                  <span aria-hidden>/</span>
                </>
              )}
              {moduleTitle && (
                <span className="truncate">{moduleTitle}</span>
              )}
            </div>

            <h1 className="mt-2 flex items-start gap-2 text-xl font-normal leading-tight tracking-[-0.3px] text-ink sm:text-2xl md:text-3xl">
              <TypeIcon
                className={cn('mt-1 h-5 w-5 shrink-0 sm:h-6 sm:w-6', meta.color)}
                aria-hidden
              />
              <span>{lesson.title}</span>
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border border-hairline px-2 py-0.5',
                  'eyebrow text-[11px] text-body-mid'
                )}
              >
                <TypeIcon className="h-2.5 w-2.5" />
                {meta.label}
              </span>
              <span className="inline-flex items-center gap-1 text-body-mid">
                <Clock className="h-3 w-3" />
                {formatDuration(lesson.duration_min)}
              </span>
              {module && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
                    'eyebrow text-[11px]',
                    DIFFICULTY_STYLES[module.difficulty].badge
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-1.5 w-1.5 rounded-full',
                      DIFFICULTY_STYLES[module.difficulty].dot
                    )}
                    aria-hidden
                  />
                  {DIFFICULTY_STYLES[module.difficulty].label}
                </span>
              )}
            </div>
          </header>

          <div className="space-y-6">
            {/* ── Interactive features jump-list ─────────────────────────── */}
            <InteractiveFeaturesSection
              features={features}
              onJump={scrollToFeature}
            />

            {/* Summary */}
            <section>
              <h3 className="eyebrow mb-1.5 text-[11px] text-body-mid">
                Summary
              </h3>
              <p className="text-sm leading-relaxed text-body sm:text-[15px]">
                {lesson.summary}
              </p>
            </section>

            {/* Key takeaways */}
            {lesson.key_takeaways.length > 0 && (
              <section>
                <h3 className="eyebrow mb-2 text-[11px] text-body-mid">
                  Key takeaways
                </h3>
                <ul className="space-y-1.5">
                  {lesson.key_takeaways.map((kt, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-sm border border-hairline bg-canvas-card px-2.5 py-1.5 text-sm text-body"
                    >
                      <span
                        className="mt-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-canvas"
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      <span className="ee-mono text-[13px] leading-relaxed">
                        {kt}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* CS BRIDGE callout */}
            {csBridge && (
              <section
                id="section-cs-bridge"
                className="scroll-mt-20 overflow-hidden rounded-sm border-l-2 border-accent bg-accent-soft/20"
              >
                <div className="flex items-center gap-2 border-b border-accent/20 px-3 py-2">
                  <Lightbulb className="h-4 w-4 text-accent" aria-hidden />
                  <span className="eyebrow text-[11px] text-accent">
                    CS Bridge
                  </span>
                  <span className="text-[10px] text-body-mid">
                    {'· the CS \u2194 EE analogy'}
                  </span>
                </div>
                <p className="ee-mono px-3 py-2.5 text-[13px] leading-relaxed text-body">
                  {csBridge}
                </p>
              </section>
            )}

            {/* Key Formulas (KaTeX) */}
            {lesson.formulas && lesson.formulas.length > 0 && (
              <Section id="section-katex" eyebrow="Key Formulas">
                <KatexFormulaList items={lesson.formulas} />
              </Section>
            )}

            {/* Falstad circuit simulator */}
            {lesson.falstad_url && (
              <Section id="section-falstad" eyebrow="Try this circuit">
                <FalstadEmbed
                  circuitUrl={lesson.falstad_url}
                  title={lesson.title}
                  caption="Click and drag in the simulator to interact. Use the scopes to see waveforms."
                />
              </Section>
            )}

            {/* WaveDrom timing diagram */}
            {lesson.wavedrom && (
              <Section id="section-wavedrom" eyebrow="Timing Diagram">
                <WaveDromDiagram wavejson={lesson.wavedrom} />
              </Section>
            )}

            {/* Bode Plot Playground */}
            {(lesson.bode || lesson.has_bode) && (
              <Section id="section-bode" eyebrow="Interactive Bode Plot">
                <BodePlot
                  numerator={lesson.bode?.numerator}
                  denominator={lesson.bode?.denominator}
                  label={lesson.bode?.label}
                  note={lesson.bode?.note}
                />
              </Section>
            )}

            {/* Heavy SPICE Playground (ngspice WASM) */}
            {(lesson.has_heavy_spice || lesson.heavy_spice_starter) && (
              <Section
                id="section-heavy-spice"
                eyebrow="Heavy SPICE (ngspice WASM)"
              >
                <HeavySpicePlayground
                  starterNetlist={lesson.heavy_spice_starter}
                  lessonTitle={lesson.title}
                />
              </Section>
            )}

            {/* SPICE Playground (spicey) */}
            {lesson.spice_netlist && (
              <Section id="section-spice" eyebrow="SPICE Playground">
                <SpicePlayground
                  netlist={lesson.spice_netlist}
                  title={`SPICE · ${lesson.title}`}
                />
              </Section>
            )}

            {/* Verilog HDL Playground */}
            {(lesson.has_verilog || lesson.verilog || lesson.verilog_starter) && (
              <Section
                id="section-verilog"
                eyebrow="Verilog HDL Playground (Yosys WASM)"
              >
                <VerilogPlayground
                  starterCode={lesson.verilog_starter}
                  lessonTitle={lesson.title}
                />
              </Section>
            )}

            {/* KiCanvas */}
            {lesson.kicanvas_url && (
              <Section id="section-kicanvas" eyebrow="KiCad Schematic">
                <KiCanvasEmbed url={lesson.kicanvas_url} />
              </Section>
            )}

            {/* Web Audio Oscilloscope */}
            {lesson.has_scope && (
              <Section id="section-webaudio" eyebrow="Web Audio Oscilloscope">
                <WebAudioScope lessonTitle={lesson.title} />
              </Section>
            )}

            {/* IQEngine SDR Spectrogram */}
            {lesson.iqengine_url !== undefined && (
              <Section id="section-iqengine" eyebrow="SDR Spectrogram">
                <IQEngineEmbed recordingUrl={lesson.iqengine_url} />
              </Section>
            )}

            {/* WebSerial section — always shown (the FAB is global) */}
            <Section id="section-webserial" eyebrow="Hardware (WebSerial)">
              <div className="rounded-sm border border-hairline bg-canvas-card p-3 text-xs text-body">
                <p>
                  This lesson pairs with the{' '}
                  <span className="text-accent">
                    WebSerial hardware connect
                  </span>{' '}
                  button (bottom-right floating action button). Click it to
                  stream bytes from a USB-serial device — Arduino, ESP32, or
                  STM32 — straight into the browser.
                </p>
                <p className="mt-2 text-body-mid">
                  Use Chrome, Edge, or Opera. Firefox needs a flag; Safari
                  has no support.
                </p>
              </div>
            </Section>

            {/* 3D Model viewer (React Three Fiber) */}
            {lesson.has_3d_model && lesson.model_component && (
              <Section id="section-3d-model" eyebrow="3D Model">
                <ComponentViewer3D component={lesson.model_component} />
              </Section>
            )}

            {/* Wokwi live microcontroller simulation */}
            {lesson.wokwi_url !== undefined && (
              <Section
                id="section-wokwi"
                eyebrow="Microcontroller Simulation"
              >
                <WokwiEmbed
                  projectUrl={lesson.wokwi_url || undefined}
                  fallbackDemo={lesson.id?.startsWith('p4m9') ? 'esp32-wifi' :
                                lesson.id?.startsWith('p6m10') ? 'robot-sensors' :
                                'arduino-blink'}
                />
              </Section>
            )}

            {/* Interactive Wokwi LED + pushbutton demo */}
            {lesson.has_wokwi_elements && (
              <Section id="section-wokwi-elements" eyebrow="Interactive Demo">
                <WokwiElementsDemo />
              </Section>
            )}

            {/* Virtual Breadboard (2D SVG · place · wire · light up) */}
            {lesson.has_breadboard && (
              <Section
                id="section-breadboard"
                eyebrow="Virtual Breadboard (place · wire · light up)"
              >
                <VirtualBreadboard />
              </Section>
            )}

            {/* tscircuit viewer — schematic + PCB + 3D board tabs */}
            {lesson.has_tscircuit && (
              <Section
                id="section-tscircuit"
                eyebrow="tscircuit (schematic · PCB · 3D board)"
              >
                <TscircuitViewer code={lesson.tscircuit_code} />
              </Section>
            )}

            {/* CircuitVerse — embedded digital logic simulator */}
            {lesson.circuitverse_url !== undefined && (
              <Section
                id="section-circuitverse"
                eyebrow="Digital Circuit Simulator (CircuitVerse)"
              >
                <CircuitVerseEmbed circuitUrl={lesson.circuitverse_url} />
              </Section>
            )}

            {/* Circuit note (legacy has_circuit flag) */}
            {lesson.has_circuit && (
              <section className="rounded-sm border border-hairline bg-canvas-card px-3 py-2.5 text-xs text-body">
                <div className="eyebrow flex items-center gap-1.5 text-[11px] text-body-mid">
                  Circuit visualization available
                </div>
                <p className="mt-1 text-body-mid">
                  This lesson has an accompanying circuit diagram. See the
                  full curriculum PDF for the schematic.
                </p>
              </section>
            )}

            {/* Related projects (if any in the module) */}
            {module && module.projects.length > 0 && (
              <section>
                <h3 className="eyebrow mb-2 text-[11px] text-body-mid">
                  Hands-on project in this module
                </h3>
                <div className="rounded-sm border border-hairline bg-canvas-card p-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-accent/40 text-accent">
                      <ArrowDown className="h-3 w-3" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink">
                        {module.projects[0].title}
                      </p>
                      <p className="mt-0.5 text-xs text-body-mid">
                        {module.projects[0].goal}
                      </p>
                      <p className="mt-1 text-[11px] text-body-mid">
                        See it in the Projects tab →
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Playground (Python/Pyodide) */}
            {lesson.has_playground && (
              <Section id="section-python" eyebrow="Try it in Python">
                <PythonPlayground lessonId={lesson.id} />
              </Section>
            )}

            {/* Bottom action bar (mobile-friendly: same controls as the
                sticky header, repeated at the end of the lesson for
                thumb-reach on small screens). */}
            <div className="mt-4 flex flex-col gap-2 border-t border-hairline pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant={done ? 'outline' : 'default'}
                onClick={() => toggleLesson(lesson.id)}
                className={cn(
                  'w-full gap-2 rounded-full sm:w-auto',
                  !done && 'bg-accent text-canvas hover:bg-accent/90'
                )}
              >
                {done ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Completed
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4" />
                    Mark as complete
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="w-full rounded-full text-body-mid sm:w-auto"
              >
                Close lesson
              </Button>
            </div>

            {/* "Next lesson →" — opens the lesson that follows this one in
                curriculum order (next lesson in the same module, or the
                first lesson of the next module if we're at the end of this
                one). If this is the last lesson in the curriculum, show a
                celebratory end-of-curriculum message instead. */}
            <NextLessonSection
              currentLessonId={lesson.id}
              onOpenNext={() => onOpenNextLesson(lesson.id)}
            />

            <div className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Footer block for the lesson view — either a "Next lesson →" button (the
 * default) or a celebratory "You've reached the end!" card if this is the
 * last lesson in the curriculum.
 */
function NextLessonSection({
  currentLessonId,
  onOpenNext,
}: {
  currentLessonId: string;
  onOpenNext: () => void;
}) {
  const next = React.useMemo(
    () => getNextLesson(currentLessonId),
    [currentLessonId]
  );

  if (!next) {
    return (
      <section className="mt-4 rounded-sm border border-accent/30 bg-accent-soft/20 px-4 py-4 text-center">
        <PartyPopper className="mx-auto mb-1 h-5 w-5 text-accent" aria-hidden />
        <div className="text-sm text-ink">You&apos;ve reached the end! 🎉</div>
        <p className="mt-0.5 text-xs text-body-mid">
          That was the last lesson in the curriculum. Pick another lesson from
          the list, or revisit one you&apos;ve already completed.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-sm border border-hairline bg-canvas-card px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="eyebrow text-[11px] text-body-mid">Next lesson</div>
          <div className="mt-0.5 truncate text-sm text-ink">
            {next.lesson.title}
          </div>
          <div className="truncate text-[11px] text-body-mid">
            {next.phase.title} · {next.module.title}
          </div>
        </div>
        <Button
          variant="default"
          onClick={onOpenNext}
          className="shrink-0 gap-1.5 rounded-full bg-accent text-canvas hover:bg-accent/90"
        >
          Next lesson
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </section>
  );
}

/** Section wrapper with the v3 eyebrow + scroll anchor + flash-on-jump. */
function Section({
  id,
  eyebrow,
  children,
}: {
  id: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 rounded-sm">
      <h3 className="eyebrow mb-2 text-[11px] text-accent">{eyebrow}</h3>
      {children}
    </section>
  );
}

/**
 * Interactive Features jump-list — Design System v3 task D-website-redesign
 * Goal 3.3.
 *
 * Lists every interactive feature present on the lesson at the TOP of the
 * overlay, with icon + label. Each item is clickable and scrolls to the
 * corresponding section (and briefly pulses it). If a lesson has no
 * interactive features, shows "Reading only" muted text.
 */
function InteractiveFeaturesSection({
  features,
  onJump,
}: {
  features: FeatureMeta[];
  onJump: (anchor: string) => void;
}) {
  if (features.length === 0) {
    return (
      <section className="rounded-sm border border-hairline border-dashed bg-canvas-card px-3 py-2.5">
        <div className="eyebrow text-[11px] text-body-mid">
          Interactive features
        </div>
        <p className="mt-1 text-xs text-body-mid">
          Reading only — no interactive elements in this lesson.
        </p>
      </section>
    );
  }
  return (
    <section className="rounded-sm border border-accent/30 bg-accent-soft/20 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="eyebrow text-[11px] text-accent">
          Interactive features · {features.length}
        </div>
        <span className="text-[10px] text-body-mid">click to jump ↓</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {features.map((f) => {
          const Icon = f.icon;
          const tierCls =
            f.tier === 'active'
              ? 'border-accent/40 text-accent hover:bg-accent/10'
              : f.tier === 'hardware'
              ? 'border-warning/40 text-warning hover:bg-warning/10'
              : 'border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink';
          return (
            <button
              key={f.key}
              onClick={() => onJump(f.anchor)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors duration-150',
                tierCls
              )}
              aria-label={`Jump to ${f.label}`}
            >
              <Icon className="h-3 w-3" aria-hidden />
              {f.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
