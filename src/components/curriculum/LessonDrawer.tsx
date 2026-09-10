'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Circle,
  Clock,
  Lightbulb,
  ArrowDown,
} from 'lucide-react';
import type { Lesson, Module } from '@/lib/curriculum';
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
import { cn } from '@/lib/utils';
import {
  getLessonFeatures,
  type FeatureMeta,
} from './lessonFeatures';

export interface LessonDrawerPayload {
  lesson: Lesson;
  module?: Module;
  phaseTitle?: string;
  moduleTitle?: string;
}

export function LessonDrawer({
  payload,
  open,
  onOpenChange,
}: {
  payload: LessonDrawerPayload | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!payload) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" />
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-2xl lg:max-w-3xl bg-canvas p-0"
      >
        <DrawerInner payload={payload} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}

function DrawerInner({
  payload,
  onOpenChange,
}: {
  payload: LessonDrawerPayload;
  onOpenChange: (v: boolean) => void;
}) {
  const { lesson, module, phaseTitle, moduleTitle } = payload;
  const meta = LESSON_TYPE_META[lesson.type];
  const TypeIcon = meta.icon;
  const { isLessonDone, toggleLesson } = useProgress();
  const done = isLessonDone(lesson.id);

  const csBridge = lesson.cs_bridge ?? module?.cs_bridge;
  const features = getLessonFeatures(lesson, module?.cs_bridge);

  // Scroll the scrollable region (not the window) to the anchor.
  const scrollToFeature = (anchor: string) => {
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Briefly pulse the section to confirm the scroll target.
      el.classList.add('feature-flash');
      window.setTimeout(() => {
        el.classList.remove('feature-flash');
      }, 1200);
    }
  };

  return (
    <>
      <div className="ee-scroll flex-1 overflow-y-auto bg-canvas">
        <SheetHeader className="gap-2 border-b border-hairline bg-canvas-soft px-5 pb-4 pt-5">
          {/* breadcrumb */}
          <div className="eyebrow flex items-center gap-1.5 text-[11px] text-body-mid">
            {phaseTitle && (
              <>
                <span className="truncate">{phaseTitle}</span>
                <span aria-hidden>/</span>
              </>
            )}
            {moduleTitle && <span className="truncate">{moduleTitle}</span>}
          </div>

          <SheetTitle className="flex items-start gap-2 text-xl font-normal leading-tight tracking-[-0.3px] sm:text-2xl">
            <TypeIcon className={cn('mt-1 h-5 w-5 shrink-0', meta.color)} aria-hidden />
            <span>{lesson.title}</span>
          </SheetTitle>

          <SheetDescription className="flex flex-wrap items-center gap-2 text-xs">
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
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-5 py-5">
          {/* ── Interactive features jump-list (TOP of the drawer) ───────
              Design System v3 task D-website-redesign Goal 3.3. */}
          <InteractiveFeaturesSection
            features={features}
            onJump={scrollToFeature}
          />

          {/* Summary */}
          <section>
            <h3 className="eyebrow mb-1.5 text-[11px] text-body-mid">Summary</h3>
            <p className="text-sm leading-relaxed text-body">{lesson.summary}</p>
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
              className="scroll-mt-4 overflow-hidden rounded-sm border-l-2 border-accent bg-accent-soft/20"
            >
              <div className="flex items-center gap-2 border-b border-accent/20 px-3 py-2">
                <Lightbulb className="h-4 w-4 text-accent" aria-hidden />
                <span className="eyebrow text-[11px] text-accent">CS Bridge</span>
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
                <span className="text-accent">WebSerial hardware connect</span>{' '}
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

          {/* Circuit note (legacy has_circuit flag) */}
          {lesson.has_circuit && (
            <section className="rounded-sm border border-hairline bg-canvas-card px-3 py-2.5 text-xs text-body">
              <div className="eyebrow flex items-center gap-1.5 text-[11px] text-body-mid">
                Circuit visualization available
              </div>
              <p className="mt-1 text-body-mid">
                This lesson has an accompanying circuit diagram. See the full
                curriculum PDF for the schematic.
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

          <div className="h-2" />
        </div>
      </div>

      {/* Footer: mark complete */}
      <div className="border-t border-hairline bg-canvas-soft px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant={done ? 'outline' : 'default'}
            onClick={() => toggleLesson(lesson.id)}
            className={cn(
              'gap-2 rounded-full',
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
            className="rounded-full text-body-mid"
          >
            Close
          </Button>
        </div>
      </div>
    </>
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
    <section id={id} className="scroll-mt-4 rounded-sm">
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
 * drawer, with icon + label. Each item is clickable and scrolls to the
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
