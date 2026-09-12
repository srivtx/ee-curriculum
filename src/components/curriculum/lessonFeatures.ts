// Lesson feature detection — shared by ModuleAccordion badges, the
// CurriculumView filter chips, the LessonDrawer "Interactive features"
// section at the top of the drawer, and the DashboardView stats card.
//
// One source of truth for "which interactive features does this lesson have?"
// so badges, filters, the drawer, and the dashboard all agree.
//
// See: research/DESIGN_SYSTEM_v3.md §8.6 for the badge spec.
// See: task D-website-redesign Goal 3 for the icon mapping.

import type { LucideIcon } from 'lucide-react';
import {
  Terminal,
  Activity,
  Zap,
  Cpu,
  LineChart,
  CircuitBoard,
  Waves,
  Sigma,
  FileCode,
  AudioLines,
  Radio,
  Lightbulb,
  Usb,
  Box,
  Microchip,
  MousePointerClick,
  LayoutGrid,
  Layers,
  Binary,
  Gauge,
  MoveUpRight,
  Crosshair,
  Grid3x3,
  Workflow,
  Waypoints,
} from 'lucide-react';
import type { Lesson } from '@/lib/curriculum';

export type FeatureKey =
  | 'python'
  | 'heavy_spice'
  | 'spice'
  | 'verilog'
  | 'bode'
  | 'falstad'
  | 'wavedrom'
  | 'katex'
  | 'kicanvas'
  | 'webaudio'
  | 'iqengine'
  | 'cs_bridge'
  | 'webserial'
  | 'wokwi'
  | 'wokwi_elements'
  | 'model_3d'
  | 'breadboard'
  | 'tscircuit'
  | 'circuitverse'
  | 'smith'
  | 'phasor'
  | 'pwm'
  | 'adc_dac'
  | 'root_locus'
  | 'nyquist'
  | 'kmap'
  | 'logic_analyzer'
  | 'transline'
  | 'antenna'
  | 'fsm'
  | 'powerflow';

export interface FeatureMeta {
  key: FeatureKey;
  /** Short label, ≤6 chars, mono-caption-friendly. */
  short: string;
  /** Full human label, e.g. "Pyodide Python playground". */
  label: string;
  /** lucide-react icon component. */
  icon: LucideIcon;
  /** "active" = interactive hands-on (accent border).
   *  "passive" = viewer/visualizer (hairline border).
   *  "hardware" = requires real hardware (warning border). */
  tier: 'active' | 'passive' | 'hardware';
  /** Drawer section anchor id (used by the "Interactive features" jump list
   *  at the top of the LessonDrawer). */
  anchor: string;
}

export const FEATURE_META: Record<FeatureKey, FeatureMeta> = {
  python: {
    key: 'python',
    short: 'PY',
    label: 'Pyodide Python playground',
    icon: Terminal,
    tier: 'active',
    anchor: 'section-python',
  },
  heavy_spice: {
    key: 'heavy_spice',
    short: 'HSPICE',
    label: 'Heavy SPICE simulation (ngspice WASM)',
    icon: Activity,
    tier: 'active',
    anchor: 'section-heavy-spice',
  },
  spice: {
    key: 'spice',
    short: 'SPICE',
    label: 'spicey SPICE playground',
    icon: Zap,
    tier: 'active',
    anchor: 'section-spice',
  },
  verilog: {
    key: 'verilog',
    short: 'HDL',
    label: 'Verilog HDL playground (Yosys WASM)',
    icon: Cpu,
    tier: 'active',
    anchor: 'section-verilog',
  },
  bode: {
    key: 'bode',
    short: 'BODE',
    label: 'Interactive Bode plot',
    icon: LineChart,
    tier: 'active',
    anchor: 'section-bode',
  },
  falstad: {
    key: 'falstad',
    short: 'SIM',
    label: 'Falstad circuit simulator',
    icon: CircuitBoard,
    tier: 'active',
    anchor: 'section-falstad',
  },
  wavedrom: {
    key: 'wavedrom',
    short: 'WAVE',
    label: 'WaveDrom timing diagram',
    icon: Waves,
    tier: 'passive',
    anchor: 'section-wavedrom',
  },
  katex: {
    key: 'katex',
    short: 'f(x)',
    label: 'KaTeX formulas',
    icon: Sigma,
    tier: 'passive',
    anchor: 'section-katex',
  },
  kicanvas: {
    key: 'kicanvas',
    short: 'PCB',
    label: 'KiCanvas (KiCad schematic)',
    icon: FileCode,
    tier: 'passive',
    anchor: 'section-kicanvas',
  },
  webaudio: {
    key: 'webaudio',
    short: 'FFT',
    label: 'Web Audio oscilloscope + spectrum',
    icon: AudioLines,
    tier: 'active',
    anchor: 'section-webaudio',
  },
  iqengine: {
    key: 'iqengine',
    short: 'SDR',
    label: 'IQEngine SDR spectrogram',
    icon: Radio,
    tier: 'passive',
    anchor: 'section-iqengine',
  },
  cs_bridge: {
    key: 'cs_bridge',
    short: 'CS↔EE',
    label: 'CS ↔ EE concept bridge',
    icon: Lightbulb,
    tier: 'active',
    anchor: 'section-cs-bridge',
  },
  webserial: {
    key: 'webserial',
    short: 'HW',
    label: 'WebSerial hardware connect',
    icon: Usb,
    tier: 'hardware',
    anchor: 'section-webserial',
  },
  wokwi: {
    key: 'wokwi',
    short: 'MCU',
    label: 'Wokwi live microcontroller sim',
    icon: Microchip,
    tier: 'active',
    anchor: 'section-wokwi',
  },
  wokwi_elements: {
    key: 'wokwi_elements',
    short: 'BTN',
    label: 'Interactive LED + pushbutton',
    icon: MousePointerClick,
    tier: 'active',
    anchor: 'section-wokwi-elements',
  },
  model_3d: {
    key: 'model_3d',
    short: '3D',
    label: '3D component viewer (R3F)',
    icon: Box,
    tier: 'active',
    anchor: 'section-3d-model',
  },
  breadboard: {
    key: 'breadboard',
    short: 'BB',
    label: 'Virtual breadboard (drag · wire · light up)',
    icon: LayoutGrid,
    tier: 'active',
    anchor: 'section-breadboard',
  },
  tscircuit: {
    key: 'tscircuit',
    short: 'TS',
    label: 'tscircuit (schematic + PCB + 3D board)',
    icon: Layers,
    tier: 'active',
    anchor: 'section-tscircuit',
  },
  circuitverse: {
    key: 'circuitverse',
    short: 'CV',
    label: 'CircuitVerse digital logic sim',
    icon: Binary,
    tier: 'active',
    anchor: 'section-circuitverse',
  },
  smith: {
    key: 'smith',
    short: 'SMITH',
    label: 'Smith chart (RF impedance matching)',
    icon: Crosshair,
    tier: 'active',
    anchor: 'section-smith',
  },
  phasor: {
    key: 'phasor',
    short: 'PHASOR',
    label: 'Phasor diagram (AC analysis)',
    icon: MoveUpRight,
    tier: 'active',
    anchor: 'section-phasor',
  },
  pwm: {
    key: 'pwm',
    short: 'PWM',
    label: 'PWM visualizer (power electronics)',
    icon: Gauge,
    tier: 'active',
    anchor: 'section-pwm',
  },
  adc_dac: {
    key: 'adc_dac',
    short: 'ADC',
    label: 'ADC/DAC sampling visualizer',
    icon: Binary,
    tier: 'active',
    anchor: 'section-adc-dac',
  },
  root_locus: {
    key: 'root_locus',
    short: 'RLOCUS',
    label: 'Root locus plot (control systems)',
    icon: Radio,
    tier: 'active',
    anchor: 'section-root-locus',
  },
  nyquist: {
    key: 'nyquist',
    short: 'NYQUIST',
    label: 'Nyquist plot (control stability)',
    icon: Crosshair,
    tier: 'active',
    anchor: 'section-nyquist',
  },
  kmap: {
    key: 'kmap',
    short: 'KMAP',
    label: 'Karnaugh map solver',
    icon: Grid3x3,
    tier: 'active',
    anchor: 'section-kmap',
  },
  logic_analyzer: {
    key: 'logic_analyzer',
    short: 'LA',
    label: 'Logic analyzer (8 channels)',
    icon: Workflow,
    tier: 'active',
    anchor: 'section-logic-analyzer',
  },
  transline: {
    key: 'transline',
    short: 'TXLINE',
    label: 'Transmission line wave + SWR sim',
    icon: Waves,
    tier: 'active',
    anchor: 'section-transline',
  },
  antenna: {
    key: 'antenna',
    short: 'ANT',
    label: 'Antenna radiation pattern viewer',
    icon: Radio,
    tier: 'active',
    anchor: 'section-antenna',
  },
  fsm: {
    key: 'fsm',
    short: 'FSM',
    label: 'FSM editor + simulator',
    icon: Waypoints,
    tier: 'active',
    anchor: 'section-fsm',
  },
  powerflow: {
    key: 'powerflow',
    short: 'PWR',
    label: '5-bus power flow simulator',
    icon: Zap,
    tier: 'active',
    anchor: 'section-powerflow',
  },
};

/** Display order: hands-on first, then passive viewers, hardware last. */
const FEATURE_ORDER: FeatureKey[] = [
  'python',
  'heavy_spice',
  'spice',
  'verilog',
  'bode',
  'falstad',
  'webaudio',
  'wokwi',
  'wokwi_elements',
  'model_3d',
  'breadboard',
  'tscircuit',
  'circuitverse',
  'smith',
  'phasor',
  'pwm',
  'adc_dac',
  'root_locus',
  'nyquist',
  'kmap',
  'logic_analyzer',
  'transline',
  'antenna',
  'fsm',
  'powerflow',
  'cs_bridge',
  'wavedrom',
  'katex',
  'kicanvas',
  'iqengine',
  'webserial',
];

/** Return the list of features present on a given lesson, in display order. */
export function getLessonFeatures(
  lesson: Lesson,
  moduleCsBridge?: string
): FeatureMeta[] {
  const present: FeatureKey[] = [];
  if (lesson.has_playground) present.push('python');
  if (lesson.has_heavy_spice || lesson.heavy_spice_starter)
    present.push('heavy_spice');
  if (lesson.has_spice || lesson.spice_netlist) present.push('spice');
  if (lesson.has_verilog || lesson.verilog || lesson.verilog_starter)
    present.push('verilog');
  if (lesson.bode || lesson.has_bode) present.push('bode');
  if (lesson.falstad_url) present.push('falstad');
  if (lesson.has_scope) present.push('webaudio');
  if (lesson.wavedrom) present.push('wavedrom');
  if (lesson.formulas && lesson.formulas.length > 0) present.push('katex');
  if (lesson.kicanvas_url) present.push('kicanvas');
  // IQEngine uses `!== undefined` so the empty-string (homepage) case still
  // triggers the embed, mirroring the LessonDrawer check.
  if (lesson.iqengine_url !== undefined) present.push('iqengine');
  if (lesson.cs_bridge ?? moduleCsBridge) present.push('cs_bridge');
  if (lesson.wokwi_url) present.push('wokwi');
  if (lesson.has_wokwi_elements) present.push('wokwi_elements');
  if (lesson.has_3d_model) present.push('model_3d');
  if (lesson.has_breadboard) present.push('breadboard');
  if (lesson.has_tscircuit) present.push('tscircuit');
  // CircuitVerse uses `!== undefined` so an empty-string (homepage fallback)
  // still triggers the embed, mirroring the LessonDrawer check.
  if (lesson.circuitverse_url !== undefined) present.push('circuitverse');
  if (lesson.has_smith) present.push('smith');
  if (lesson.has_phasor) present.push('phasor');
  if (lesson.has_pwm) present.push('pwm');
  if (lesson.has_adc_dac) present.push('adc_dac');
  if (lesson.has_root_locus) present.push('root_locus');
  if (lesson.has_nyquist) present.push('nyquist');
  if (lesson.has_kmap) present.push('kmap');
  if (lesson.has_logic_analyzer) present.push('logic_analyzer');
  if (lesson.has_transline) present.push('transline');
  if (lesson.has_antenna) present.push('antenna');
  if (lesson.has_fsm) present.push('fsm');
  if (lesson.has_powerflow) present.push('powerflow');
  // WebSerial is global (floating FAB), not per-lesson. We surface it on
  // lessons where it's particularly relevant (any lesson with a has_circuit
  // flag or any playground) — see lessonSupportsWebSerial below.
  if (lessonSupportsWebSerial(lesson)) present.push('webserial');
  return FEATURE_ORDER.filter((k) => present.includes(k)).map(
    (k) => FEATURE_META[k]
  );
}

/** A lesson is "WebSerial-relevant" if it has interactive circuit content
 *  the student could plausibly want to wire to real hardware. We're being
 *  generous here — the WebSerial FAB is always available globally, this
 *  badge just signals "this lesson pairs well with a hardware bench." */
export function lessonSupportsWebSerial(lesson: Lesson): boolean {
  return Boolean(
    lesson.has_circuit ||
      lesson.falstad_url ||
      lesson.has_heavy_spice ||
      lesson.spice_netlist ||
      lesson.has_verilog ||
      lesson.kicanvas_url ||
      lesson.wokwi_url ||
      lesson.has_wokwi_elements ||
      lesson.has_breadboard ||
      lesson.has_tscircuit ||
      lesson.circuitverse_url !== undefined ||
      lesson.has_smith ||
      lesson.has_phasor ||
      lesson.has_pwm ||
      lesson.has_adc_dac ||
      lesson.has_root_locus ||
      lesson.has_nyquist ||
      lesson.has_kmap ||
      lesson.has_logic_analyzer ||
      lesson.has_transline ||
      lesson.has_antenna ||
      lesson.has_fsm ||
      lesson.has_powerflow
  );
}

/** Aggregate counts across the entire curriculum — used by the Dashboard
 *  "Interactive features" stat card. */
export function getCurriculumFeatureStats(): {
  total: number;
  lessonsWithFeatures: number;
  byType: Record<FeatureKey, number>;
  lessonsByType: Record<FeatureKey, number>;
} {
  // Lazy import to avoid a static-import cycle (curriculum.ts is heavy).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { CURRICULUM } = require('@/lib/curriculum') as {
    CURRICULUM: typeof import('@/lib/curriculum').CURRICULUM;
  };

  const byType = {} as Record<FeatureKey, number>;
  const lessonsByType = {} as Record<FeatureKey, number>;
  (Object.keys(FEATURE_META) as FeatureKey[]).forEach((k) => {
    byType[k] = 0;
    lessonsByType[k] = 0;
  });

  let total = 0;
  let lessonsWithFeatures = 0;
  const seen = new Set<string>(); // de-dup by lesson id

  for (const phase of CURRICULUM) {
    for (const mod of phase.modules) {
      for (const lesson of mod.lessons) {
        const feats = getLessonFeatures(lesson, mod.cs_bridge);
        if (feats.length > 0 && !seen.has(lesson.id)) {
          seen.add(lesson.id);
          lessonsWithFeatures++;
        }
        total += feats.length;
        for (const f of feats) {
          byType[f.key]++;
        }
      }
      // For lessons-by-type, count unique lessons per feature.
      for (const lesson of mod.lessons) {
        const feats = getLessonFeatures(lesson, mod.cs_bridge);
        for (const f of feats) {
          lessonsByType[f.key]++;
        }
      }
    }
  }

  return { total, lessonsWithFeatures, byType, lessonsByType };
}
