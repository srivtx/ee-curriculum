'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Circle,
  Clock,
  CircuitBoard,
  Lightbulb,
  Sigma,
  Sparkles,
  Target,
  Waves,
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
import { VerilogPlayground } from './VerilogPlayground';
import { KiCanvasEmbed } from './KiCanvasEmbed';
import { cn } from '@/lib/utils';

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
        className="w-full gap-0 sm:max-w-2xl lg:max-w-3xl p-0"
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

  return (
    <>
      {/* Scrollable content */}
      <div className="ee-scroll flex-1 overflow-y-auto">
        <SheetHeader className="gap-2 border-b border-border/60 bg-gradient-to-br from-ee-teal/5 to-transparent px-5 pb-4 pt-5">
          {/* breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
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

          <div className="flex items-start justify-between gap-3">
            <SheetTitle className="flex items-start gap-2 text-lg font-semibold leading-tight sm:text-xl">
              <TypeIcon
                className={cn('mt-1 h-5 w-5 shrink-0', meta.color)}
                aria-hidden
              />
              <span>{lesson.title}</span>
            </SheetTitle>
          </div>

          <SheetDescription className="flex flex-wrap items-center gap-2 text-xs">
            <Badge
              variant="outline"
              className={cn(
                'border px-1.5 py-0 text-[10px] font-medium uppercase',
                'border-ee-teal/30 bg-ee-teal/10 text-ee-teal dark:text-ee-teal'
              )}
            >
              <TypeIcon className="mr-1 h-2.5 w-2.5" />
              {meta.label}
            </Badge>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDuration(lesson.duration_min)}
            </span>
            {module && (
              <Badge
                variant="outline"
                className={cn(
                  'border px-1.5 py-0 text-[10px]',
                  DIFFICULTY_STYLES[module.difficulty].badge
                )}
              >
                <span
                  className={cn(
                    'mr-1 inline-block h-1.5 w-1.5 rounded-full',
                    DIFFICULTY_STYLES[module.difficulty].dot
                  )}
                  aria-hidden
                />
                {DIFFICULTY_STYLES[module.difficulty].label}
              </Badge>
            )}
            {lesson.has_playground && (
              <Badge
                variant="outline"
                className="border-ee-teal/40 bg-ee-teal/10 px-1.5 py-0 text-[10px] text-ee-teal dark:text-ee-teal"
              >
                <Sparkles className="mr-1 h-2.5 w-2.5" />
                Interactive
              </Badge>
            )}
            {lesson.has_circuit && (
              <Badge
                variant="outline"
                className="border-ee-cyan/40 bg-ee-cyan/10 px-1.5 py-0 text-[10px] text-ee-cyan dark:text-ee-cyan"
              >
                <CircuitBoard className="mr-1 h-2.5 w-2.5" />
                Circuit
              </Badge>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-5 py-5">
          {/* Summary */}
          <section>
            <h3 className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Summary
            </h3>
            <p className="text-sm leading-relaxed text-foreground/90">
              {lesson.summary}
            </p>
          </section>

          {/* Key takeaways */}
          {lesson.key_takeaways.length > 0 && (
            <section>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Key takeaways
              </h3>
              <ul className="space-y-1.5">
                {lesson.key_takeaways.map((kt, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-md border border-border/50 bg-muted/20 px-2.5 py-1.5 text-sm text-foreground/90"
                  >
                    <span
                      className="mt-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ee-teal px-1 text-[10px] font-bold text-white"
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
            <section className="overflow-hidden rounded-lg border border-ee-amber/40 bg-ee-amber/8">
              <div className="flex items-center gap-2 border-b border-ee-amber/30 bg-ee-amber/15 px-3 py-2">
                <Lightbulb
                  className="h-4 w-4 text-ee-amber"
                  aria-hidden
                />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ee-amber">
                  CS Bridge
                </span>
                <span className="text-[10px] text-ee-amber/80">
                  {'· the CS \u2194 EE analogy'}
                </span>
              </div>
              <p className="ee-mono px-3 py-2.5 text-[13px] leading-relaxed text-foreground/85">
                {csBridge}
              </p>
            </section>
          )}

          {/* Key Formulas (KaTeX) */}
          {lesson.formulas && lesson.formulas.length > 0 && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <Sigma className="h-3.5 w-3.5 text-ee-teal" aria-hidden />
                Key Formulas
              </h3>
              <KatexFormulaList items={lesson.formulas} />
            </section>
          )}

          {/* Falstad circuit simulator */}
          {lesson.falstad_url && (
            <section>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Try this circuit
              </h3>
              <FalstadEmbed
                circuitUrl={lesson.falstad_url}
                title={lesson.title}
                caption="Click and drag in the simulator to interact. Use the scopes to see waveforms."
              />
            </section>
          )}

          {/* WaveDrom timing diagram */}
          {lesson.wavedrom && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <Waves className="h-3.5 w-3.5 text-ee-teal" aria-hidden />
                Timing Diagram
              </h3>
              <WaveDromDiagram wavejson={lesson.wavedrom} />
            </section>
          )}

          {/* Bode Plot Playground */}
          {(lesson.bode || lesson.has_bode) && (
            <section>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Interactive Bode Plot
              </h3>
              <BodePlot
                numerator={lesson.bode?.numerator}
                denominator={lesson.bode?.denominator}
                label={lesson.bode?.label}
                note={lesson.bode?.note}
              />
            </section>
          )}

          {/* SPICE Playground */}
          {lesson.spice_netlist && (
            <section>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                SPICE Playground
              </h3>
              <SpicePlayground
                netlist={lesson.spice_netlist}
                title={`SPICE · ${lesson.title}`}
              />
            </section>
          )}

          {/* Verilog Playground */}
          {lesson.verilog && (
            <section>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Verilog Playground
              </h3>
              <VerilogPlayground />
            </section>
          )}

          {/* KiCanvas (KiCad schematic viewer) */}
          {lesson.kicanvas_url && (
            <section>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                KiCad Schematic
              </h3>
              <KiCanvasEmbed src={lesson.kicanvas_url} />
            </section>
          )}

          {/* Circuit note */}
          {lesson.has_circuit && (
            <section className="rounded-md border border-ee-cyan/30 bg-ee-cyan/5 px-3 py-2.5 text-xs text-foreground/80">
              <div className="flex items-center gap-1.5 text-ee-cyan">
                <CircuitBoard className="h-3.5 w-3.5" aria-hidden />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                  Circuit visualization available
                </span>
              </div>
              <p className="mt-1">
                This lesson has an accompanying circuit diagram. See the full
                curriculum PDF for the schematic.
              </p>
            </section>
          )}

          {/* Related projects (if any in the module) */}
          {module && module.projects.length > 0 && (
            <section>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Hands-on project in this module
              </h3>
              <div className="rounded-md border border-border/50 bg-muted/20 p-3">
                <div className="flex items-start gap-2">
                  <Target
                    className="mt-0.5 h-4 w-4 text-ee-teal"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {module.projects[0].title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {module.projects[0].goal}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      See it in the Projects tab →
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Playground */}
          {lesson.has_playground && (
            <section>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Try it in Python
              </h3>
              <PythonPlayground lessonId={lesson.id} />
            </section>
          )}

          {/* Footer spacer */}
          <div className="h-2" />
        </div>
      </div>

      {/* Footer: mark complete */}
      <div className="border-t border-border/60 bg-muted/30 px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant={done ? 'outline' : 'default'}
            onClick={() => toggleLesson(lesson.id)}
            className={cn(
              'gap-2',
              !done &&
                'bg-ee-green text-white hover:bg-ee-green/90'
            )}
          >
            {done ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-ee-green" />
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
            className="text-muted-foreground"
          >
            Close
          </Button>
        </div>
      </div>
    </>
  );
}
