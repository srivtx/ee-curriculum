# Interactive EE Simulation Features — Research & Recommendation

**Project:** EE Curriculum for Computer Scientists (Next.js 16 + TS + Tailwind 4 + shadcn/ui)
**Existing stack:** Pyodide 0.26.2 (numpy/scipy/matplotlib) loaded from CDN, Prisma + SQLite, Recharts, MDX editor, React 19, Bun.
**Curriculum shape:** 11 phases (P0 foundations → P10 capstones), 91 modules, 140 lessons. Already-loaded first-paint runtime includes Pyodide (~10 MB CDN), so users have implicitly accepted multi-megabyte first loads.
**Research dates:** Sept 2026. All bundle sizes measured directly from `unpkg.com` / `registry.npmjs.org`.

---

## TL;DR — Executive Summary

We have **mature, MIT/ISC/BSD-licensed, browser-ready packages** for almost every EE simulation domain. The five highest-impact Tier 1 features (coverable in ~4 weeks) are:

1. **`eecircuit-engine`** — ngspice compiled to WASM, MIT, ~5.7 MB gzipped, clean `Simulation` API. Real SPICE in the browser. Serves P1–P3, P7, P9.
2. **`spicey`** — pure-JS SPICE (AC/TRAN, RLC + diodes + switches), 46 KB unpacked, zero deps. Instant-load alternative for simple circuits. Serves P1–P3.
3. **Falstad/CircuitJS1 iframe embed** — GPL-2.0 visual simulator, no install, 2.9k stars. Serves P1–P4, P7.
4. **`@yowasp/yosys` + `digitaljs`** — Yosys WASM (ISC, ~12 MB compressed) + visual simulator (BSD-2-Clause). Verilog-in-browser with live waveform. Serves P4.
5. **`plotly.js-dist-min` + `katex` + `wavedrom`** — Bode/Nyquist/Smith plots + math rendering + timing diagrams. ~1.4 MB total. Serves P2, P5, P6, P8.

Tier 2 (medium effort): KiCad viewer (KiCanvas), tscircuit React-based schematic capture, WebSerial for real Arduino telemetry, Web Audio oscilloscope/signal generator, IQEngine RF spectrogram embedding.

Tier 3 (aspirational): QEMU-WASM for full microcontroller simulation, self-hosted CircuitJS1 build, native Yosys+nextpnr FPGA bitstream flow.

---

## Curriculum Phase → Tool Mapping (reference)

| Phase | Title | Tier 1 tool that fits |
|-------|-------|----------------------|
| P0 | Foundations & Math Bridge | `katex`, `plotly.js` for complex-plane/ODE plots |
| P1 | DC Circuit Analysis | `spicey` (instant), `eecircuit-engine` (real SPICE), Falstad iframe |
| P2 | AC Circuit Analysis | `eecircuit-engine` AC sweep + `plotly.js` Bode/Nyquist |
| P3 | Analog Electronics | `eecircuit-engine` (includes BSIM3/4, GF180/SkyWater PDKs) + Falstad |
| P4 | Digital Logic & Embedded | `@yowasp/yosys` + `digitaljs` + `wavedrom`; Wokwi iframe for MCU |
| P5 | Signals, Systems & DSP | existing Pyodide + `plotly.js`; `wavedrom` for sample sequences |
| P6 | Control Systems | existing Pyodide (scipy.signal) + `plotly.js` Bode/root-locus |
| P7 | Power Electronics | `eecircuit-engine` .tran switching + Falstad iframe |
| P8 | EM/RF/Communications | `plotly.js` Smith chart, IQEngine iframe embed |
| P9 | VLSI & IC Design | `eecircuit-engine` with SkyWater/GF180 PDKs, KiCanvas for layout view |
| P10 | Capstones | Wokwi iframe for ESP32/STM32 projects, WebSerial for real hardware |

---

## Tier 1 — Must-Have, Low Effort, High Impact

### 1.1 — `eecircuit-engine` (Real ngspice in the browser)

**What it does:** ngspice 46 compiled to WebAssembly via Emscripten, wrapped in a clean TypeScript `Simulation` class. Supports `.op`, `.dc`, `.tran`, `.ac`, `.noise`, `.disto`, S-parameters. Ships with real foundry PDK models (SkyWater 130 nm, GlobalFoundries 180 nm, FreePDK 15 nm).

**Why it's a perfect fit:**
- Active maintainer (danchitnis/eelab-dev). v1.8.0 published 5 days ago at time of writing.
- 79 npm dependents including PhET Interactive Simulations (Univ. of Colorado).
- MIT license.
- Used in production by `eecircuit.com` and the open EE teaching community.
- Bundle size: **5.7 MB gzipped on the wire** (measured via `curl -H "Accept-Encoding: gzip"` against unpkg). For comparison, the project already loads Pyodide 0.26.2 + numpy/scipy/matplotlib (~10 MB+).

**Integration method:** npm package + dynamic import (Next.js 16 `next/dynamic`).

| Property | Value |
|---|---|
| npm package | `eecircuit-engine` |
| Version | 1.8.0 |
| License | MIT |
| Unpacked size | 41.1 MB (includes source maps, models, tests) |
| On-wire size (gzipped) | **5.7 MB** (`dist/eecircuit-engine.mjs`) |
| Models bundle | 2.56 MB (`dist/models/`) — loadable on demand |
| Runtime deps | 0 |
| Homepage | https://github.com/eelab-dev/EEcircuit-engine |
| npm | https://www.npmjs.com/package/eecircuit-engine |
| Weekly downloads | 3,574 |

**Sample integration (Next.js 16 client component):**

```tsx
// src/components/curriculum/SpicePlayground.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Lazy-load the heavy module only when the user opens the playground.
const loadEngine = () =>
  import('eecircuit-engine').then((m) => new m.Simulation());

export function SpicePlayground({ netlist }: { netlist: string }) {
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const simRef = useRef<Awaited<ReturnType<typeof loadEngine>> | null>(null);

  async function run() {
    setLoading(true);
    try {
      if (!simRef.current) simRef.current = await loadEngine();
      const sim = simRef.current;
      await sim.start();
      sim.setNetList(netlist);
      sim.setOutputEvent((chunk: string) => setOutput((p) => p + chunk));
      const result = await sim.runSim();
      console.log(result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded border p-3">
      <pre className="text-xs bg-muted p-2">{netlist}</pre>
      <button onClick={run} disabled={loading} className="mt-2 btn btn-primary">
        {loading ? 'Running…' : 'Run SPICE'}
      </button>
      <pre className="mt-2 text-xs whitespace-pre-wrap">{output}</pre>
    </div>
  );
}
```

**Curriculum phases served:** P1 (DC), P2 (AC), P3 (analog), P7 (power electronics), P9 (VLSI — with real PDKs).

**Caveats:**
- 5.7 MB first load. Already consistent with the existing Pyodide pattern. Strongly recommend dynamic-import + skeleton UI.
- The `dist/eecircuit-engine.mjs` file inlines the WASM as base64 — there is no separate `.wasm` file to worry about, no CDN cross-origin headaches.
- Worker isolation is not built-in; long `.tran` runs (>10k points) will block the main thread. Wrap in a Web Worker for production.

---

### 1.2 — `spicey` (pure-JS SPICE for instant-load AC/TRAN)

**What it does:** A pure-TypeScript implementation of the SPICE kernel — netlist parser, MNA stamping, AC small-signal sweep, transient integration. No WASM, no native code, runs anywhere JavaScript runs.

**Why it's a perfect fit:**
- **46 KB unpacked, ~15 KB minified+gzipped.** Negligible bundle impact.
- Zero runtime dependencies.
- Synchronous API — no async loading, instant response.
- Maintained by tscircuit (2.6k-star "React for circuits" project), MIT licensed.
- 16k weekly downloads — significant adoption.
- Perfect for the early P1/P2 lessons where the user just wants to "type a netlist, see the numbers" without waiting for ngspice to spin up.

**Limitations:**
- No MOSFET/BJT transistor models yet (only R/L/C/diodes/voltage-controlled switches). Phase 3 (analog) will still need `eecircuit-engine`.
- No Monte Carlo, no noise, no distortion analysis.
- Not a drop-in replacement for ngspice — it's a teaching tool.

| Property | Value |
|---|---|
| npm package | `spicey` |
| Version | 0.0.14 |
| License | MIT (LICENSE file present; `package.json` license field is `null` — verified by reading the repo) |
| Unpacked size | 46 KB |
| Runtime deps | 0 |
| Homepage | https://github.com/tscircuit/spicey |
| Weekly downloads | 16,295 |

**Sample integration:**

```tsx
// src/components/curriculum/QuickSpice.tsx
'use client';
import { simulate, formatAcResult } from 'spicey';
import { useState } from 'react';

export function QuickSpice({ initialNetlist }: { initialNetlist: string }) {
  const [netlist, setNetlist] = useState(initialNetlist);
  const [result, setResult] = useState('');

  function run() {
    // Synchronous — no loading state needed!
    const r = simulate(netlist);
    setResult(formatAcResult(r.ac));
  }

  return (
    <div>
      <textarea value={netlist} onChange={(e) => setNetlist(e.target.value)} rows={10} />
      <button onClick={run}>Simulate (instant)</button>
      <pre>{result}</pre>
    </div>
  );
}
```

**Curriculum phases served:** P1 (DC nodal analysis), P2 (AC sweeps, Bode data), early P3 (RLC transients).

**Recommended pattern:** Use `spicey` as the default in-lesson playground (instant feedback), and offer a "Run in real SPICE (ngspice)" button that swaps to `eecircuit-engine` for circuits with transistors or advanced analyses.

---

### 1.3 — Falstad/CircuitJS1 (visual circuit simulator, iframe embed)

**What it does:** Paul Falstad's classic interactive circuit simulator, originally a Java applet, ported to JavaScript via GWT by Iain Sharp. Real-time animated current flow, scope traces, drag-and-drop schematic editing. The de-facto teaching simulator for circuits.

**Why it's a perfect fit:**
- Embeddable via plain `<iframe>` — no JS bundling required.
- Pre-built compiled output is hosted at `https://www.falstad.com/circuit/circuitjs.html`.
- Supports URL-encoded circuit state — you can craft a link that opens a specific circuit.
- GPL-2.0 — fine to embed/link from a public educational site. (If we host our own compiled build we must publish any modifications.)
- 2.9k GitHub stars, 824 forks, actively maintained, last commit Nov 2022 (mature/stable, not abandoned).
- Used by virtually every EE 101 course online.

**License considerations:** GPL-2.0 is copyleft. For an educational website that simply embeds the hosted applet via iframe, this is fine — the iframe is a separate aggregate work. If we self-host a modified build, we must publish our modifications under GPL-2.0. **Recommendation: use the hosted iframe for v1, self-host only if we need custom branding.**

| Property | Value |
|---|---|
| Repo | https://github.com/sharpie7/circuitjs1 |
| Hosted applet | https://www.falstad.com/circuit/circuitjs.html |
| License | GPL-2.0 (https://github.com/sharpie7/circuitjs1/blob/master/COPYING.txt) |
| Stars | 2,948 |
| Last updated | Nov 2022 (master), project itself runs continuously at falstad.com |
| Bundle size | n/a (loaded from falstad.com CDN, ~1.5 MB JS+CSS) |
| Browser support | All modern browsers (GWT-compiled JS, no plugins) |

**Sample integration (iframe embed with deep-link to a specific circuit):**

```tsx
// src/components/curriculum/FalstadEmbed.tsx
'use client';

export function FalstadEmbed({ circuitString, title }: { circuitString: string; title: string }) {
  // circuitString is the URL-fragment-encoded circuit from CircuitJS1's
  // File → Export → As URL... menu. You can pre-generate these for each
  // lesson and store them in curriculum.ts.
  const src = `https://www.falstad.com/circuit/circuitjs.html?cct=${circuitString}`;
  return (
    <div className="aspect-video w-full">
      <iframe
        title={title}
        src={src}
        className="h-full w-full rounded border"
        loading="lazy"
        allow="fullscreen"
      />
    </div>
  );
}
```

**Curriculum phases served:** P1 (DC, Ohm/Kirchhoff/Thevenin), P2 (AC, phasors, resonance), P3 (op-amps, diodes, transistors), P4 (logic gates, flip-flops), P7 (DC-DC converters).

**Caveats:**
- Depends on falstad.com uptime. If we want reliability, self-host a static copy of the compiled `war/` directory under `/public/circuitjs/`. The build is reproducible from the repo.
- URL-encoded circuits can get long (~5–50 KB). For complex circuits, store the circuit JSON in `public/circuits/<id>.cjs` and load it client-side.

---

### 1.4 — `@yowasp/yosys` + `digitaljs` (Verilog-in-the-browser)

**What it does:** Yosys (the open-source Verilog synthesis suite) compiled to WebAssembly. Combined with `digitaljs` (a visual digital logic simulator that takes Yosys output and renders animated schematics with live waveforms), you get a complete browser-side Verilog playground: write RTL → synthesize → see gates and waveforms.

**Why it's a perfect fit:**
- The YoWASP project is the official WebAssembly distribution of the open FPGA toolchain, maintained by whitequark (Yosys core maintainer).
- `@yowasp/yosys` is the npm package: 64 dependents, mature.
- Used by the DigitalJS Online site (https://digitaljs.tilk.eu) and the DigitalJS-VSC VS Code extension.
- ISC license (Yosys's own license).
- The CircuitVerse project is integrating the same package for client-side Verilog synthesis (GitHub issue #1021, March 2026) — strong external validation.

**Two-part integration:**
1. `@yowasp/yosys` (12 MB compressed) — synthesizes Verilog to a JSON netlist.
2. `digitaljs` (≈5 MB bundle with jQuery + JointJS + elkjs deps) — visualizes the netlist and simulates.

| Property | Value |
|---|---|
| Yosys npm | `@yowasp/yosys` |
| Yosys version | 0.65.176-dev.1145 |
| Yosys license | ISC |
| Yosys unpacked | 54 MB (54 MB on disk; 12 MB compressed on wire) |
| Yosys weekly downloads | 545 |
| Yosys dependents | 64 |
| DigitalJS npm | `digitaljs` |
| DigitalJS version | 0.14.2 |
| DigitalJS license | BSD-2-Clause |
| DigitalJS unpacked | 14 MB (~5 MB bundle in user's app) |
| DigitalJS weekly downloads | ~700 |
| Homepage | https://github.com/tilk/digitaljs_online (live demo at https://digitaljs.tilk.eu) |

**Sample integration (sketch — full pattern is more involved):**

```tsx
// src/components/curriculum/VerilogPlayground.tsx
'use client';
import { useEffect, useState } from 'react';

export function VerilogPlayground({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [paper, setPaper] = useState<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);

  async function synthesizeAndRun() {
    setLoading(true);
    try {
      // Dynamically import both heavy modules only on first use.
      const { runYosys } = await import('@yowasp/yosys');
      const digitaljs = await import('digitaljs');
      const $ = (await import('jquery')).default;

      // Write Verilog to YoWASP virtual FS, run yosys, read netlist JSON
      const files = { 'top.v': code };
      const yosysArgs = ['-q', '-p', 'synth -json top.json', 'top.v'];
      const outputs = await runYosys(yosysArgs, files);
      const netlist = JSON.parse(new TextDecoder().decode(outputs['top.json']));

      // Hand off to digitaljs for visualization + simulation
      const circuit = new digitaljs.Circuit(netlist);
      $(paper).empty();
      circuit.displayOn($(paper));
      circuit.start();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={20} />
      <div ref={setPaper} className="border min-h-[400px]" />
      <button onClick={synthesizeAndRun} disabled={loading}>Synthesize & Simulate</button>
    </div>
  );
}
```

**Curriculum phases served:** P4 (digital logic, FSMs, Verilog). This is the killer feature for P4 — students can write Verilog and instantly see the gate-level schematic + waveform without installing Icarus/GTKWave.

**Caveats:**
- 12 MB Yosys WASM is heavy. **Load lazily, only when the user enters a Verilog lesson.** Once cached, it's instant on return visits.
- `digitaljs` brings jQuery + jQuery-UI + JointJS as runtime deps (legacy stack). The full bundle is ~5 MB. Consider wrapping the entire Verilog playground in `next/dynamic` with `ssr: false` and a skeleton loader.
- An alternative lighter path is `verisim` (senolgulgonul/verisim, GPL-2.0, 23 stars) — Icarus Verilog WASM with built-in waveform viewer, smaller (~5 MB total), but less mature than the Yosys+DigitalJS combo. **Recommend `@yowasp/yosys + digitaljs` for v1.**

---

### 1.5 — `plotly.js-dist-min` + `katex` + `wavedrom` (visualization trio)

**What they do:**
- **Plotly.js** — interactive scientific plotting: Bode (magnitude+phase), Nyquist, root-locus, polar/Smith charts, 3D surfaces, heatmaps, subplots. Far more powerful than the project's existing Recharts for EE work.
- **KaTeX** — fast math rendering (LaTeX → HTML/SVG). Render $H(s) = \frac{\omega_n^2}{s^2 + 2\zeta\omega_n s + \omega_n^2}$ inline.
- **WaveDrom** — digital timing diagrams from JSON. Perfect for P4 (clocks, FSM state evolution, bus protocols).

**Why each is a perfect fit:**

| Property | plotly.js-dist-min | katex | wavedrom |
|---|---|---|---|
| Version | 4.1.0 | 0.18.7 | 3.7.0 |
| License | MIT | MIT | MIT |
| Bundle (min+gzip) | **1.18 MB** | 75 KB | ~250 KB |
| Runtime deps | 0 | 1 (small) | 0 |
| Weekly downloads | 1.5M+ | 2.5M+ | 200K+ |
| Repo | https://github.com/plotly/plotly.js | https://github.com/KaTeX/KaTeX | https://github.com/wavedrom/WaveDrom |

Plotly.js supports Smith charts natively (`type: 'smith'`) — useful for P8 (RF). It also has built-in `polar` (Nyquist), `scatter` with log axes (Bode), and `heatmap` (group delay / eye diagrams).

**Sample integration (Bode plot from spicey AC sweep):**

```tsx
// src/components/curriculum/BodePlot.tsx
'use client';
import { simulate } from 'spicey';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';
const Plot = createPlotlyComponent(Plotly);

export function BodePlot({ netlist }: { netlist: string }) {
  const r = simulate(netlist); // instant — synchronous
  const freqs = r.ac.frequencies; // Hz
  const magDb = r.ac.v2.map((v, i) => 20 * Math.log10(Math.abs(v)) );
  const phaseDeg = r.ac.v2.map((v) => (Math.atan2(v.im, v.re) * 180) / Math.PI);

  return (
    <Plot
      data={[
        { x: freqs, y: magDb, name: '|V| (dB)', yaxis: 'y' },
        { x: freqs, y: phaseDeg, name: '∠V (°)', yaxis: 'y2' },
      ]}
      layout={{
        xaxis: { type: 'log', title: 'Frequency (Hz)' },
        yaxis: { title: 'Magnitude (dB)' },
        yaxis2: { title: 'Phase (°)', overlaying: 'y', side: 'right' },
        margin: { t: 30 },
      }}
      useResizeHandler
      style={{ width: '100%', height: 400 }}
    />
  );
}
```

**Curriculum phases served:**
- Plotly → P2 (Bode/Nyquist), P5 (FFT/spectrograms), P6 (root locus, step response), P8 (Smith chart, constellation diagrams).
- KaTeX → every phase (inline math in lesson text).
- WaveDrom → P4 (clocks, FSMs, bus timing, UART/SPI/I2C).

**Caveats:**
- Plotly is **1.18 MB gzipped** — significant. Load only on pages that need it, via `next/dynamic`.
- The project already uses Recharts; Plotly and Recharts can coexist (Recharts for simple dashboards, Plotly for engineering plots).
- KaTeX requires loading its CSS (`katex/dist/katex.min.css`) and a fonts directory — handle via Next.js `next/font/local` or CDN link.

---

## Tier 2 — Nice-to-Have, Medium Effort

### 2.1 — KiCanvas (KiCad schematic/PCB viewer in browser)

**What:** Browser-based viewer for KiCad `.kicad_sch` and `.kicad_pcb` files. Written in vanilla TypeScript, parses files client-side, no KiCad installation needed. By Alethea Flowers (theacodes).

| Property | Value |
|---|---|
| Repo | https://github.com/theacodes/kicanvas |
| License | MIT |
| Stars | 1,130 |
| Live site | https://kicanvas.org |
| npm | not published — must bundle from source, or use the iframe-embeddable web component from `kicanvas.org` |
| Bundle size | ~500 KB (estimated from source) |

**Integration:** Two paths.
- **Path A (low effort):** iframe-embed `https://kicanvas.org?src=<url-to-kicad-sch>`. The viewer fetches the file and renders. Works for any KiCad file hosted on the curriculum site.
- **Path B (medium effort):** Clone the repo, `npm run build`, copy `dist/` to `public/kicanvas/`, load as web component. Full control, no external dependency.

**Curriculum phases served:** P3 (schematics), P9 (PCB layout), P10 (capstone projects with KiCad deliverables).

**Risk:** KiCad's schematic format is complex; some advanced features (hierarchical sheets, custom power symbols) may not render perfectly. Test with the curriculum's reference designs before committing.

---

### 2.2 — `tscircuit` React-based circuit designer

**What:** "React for Circuits" — declarative JSX components (`<resistor>`, `<capacitor>`, `<chip>`, `<trace>`) that compile to schematics, PCBs, and SPICE-ready netlists. 2.6k stars, MIT, very actively developed (47k weekly downloads of `@tscircuit/core`, new release every few hours).

| Property | Value |
|---|---|
| Repo | https://github.com/tscircuit/tscircuit |
| License | MIT |
| Stars | 2,649 |
| Online playground | https://tscircuit.com |
| npm packages | `tscircuit` (umbrella), `@tscircuit/core` (12 MB), `@tscircuit/schematic-viewer` (0.36 MB), `@tscircuit/3d-viewer` (1.66 MB) |

**Why it's interesting:** Already React-based, so it slots into the existing Next.js stack with zero paradigm shift. Students who know React can write a circuit as JSX. Maintainers are very active (Seve Barerras).

**Integration sample:**

```tsx
'use client';
import { Circuit, Board, Resistor, Led, Trace } from '@tscircuit/core';
import { SchematicViewer } from '@tscircuit/schematic-viewer';

const circuit = new Circuit();
circuit.add(
  <Board width="10mm" height="10mm">
    <Resistor name="R1" resistance="10k" footprint="0402" />
    <Led name="L1" footprint="0402" />
    <Trace from=".R1 > .pin2" to=".L1 > .pos" />
  </Board>
);

export function TscircuitDemo() {
  return <SchematicViewer circuitJson={circuit.getCircuitJson()} />;
}
```

**Curriculum phases served:** P1 (schematic capture), P3 (analog), P4 (digital schematics), P10 (capstone PCB design).

**Caveats:**
- Rapidly evolving API — breaking changes between minor versions. Pin to specific versions.
- `@tscircuit/core` is 12 MB unpacked (because it bundles footprints for thousands of parts). Use the schematic-viewer + 3d-viewer subpackages directly to keep the bundle small.
- Not yet SPICE-integrated; would be a great complement to `spicey`/`eecircuit-engine` (write the circuit in JSX → export netlist → simulate).

---

### 2.3 — WebSerial API for real Arduino/ESP32/STM32 telemetry

**What:** Native browser API (no npm package needed) that lets JavaScript read/write to USB-serial devices. Combined with a small React hook, students can plug in a real Arduino Uno and watch analog readings stream into a Plotly scope — bridging simulation and real hardware.

| Property | Value |
|---|---|
| API | `navigator.serial` (built into browser) |
| Spec | https://wicg.github.io/serial/ |
| Browser support | Chrome 89+, Edge 89+, Opera 75+, Firefox 151+ (Apr 2026, Nightly → Beta), **Safari: not supported** |
| License | N/A (W3C spec) |

**Integration sample (React hook):**

```tsx
// src/hooks/useSerialScope.ts
'use client';
import { useEffect, useRef, useState } from 'react';

export function useSerialScope() {
  const [data, setData] = useState<number[]>([]);
  const portRef = useRef<SerialPort | null>(null);

  async function connect() {
    if (!('serial' in navigator)) {
      alert('WebSerial not supported. Use Chrome or Edge.');
      return;
    }
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    portRef.current = port;

    const decoder = new TextDecoderStream();
    const readableStreamClosed = port.readable!.pipeTo(decoder.writable);
    const reader = decoder.readable.getReader();
    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const lines = buffer.split('\n');
      buffer = lines.pop()!;
      for (const line of lines) {
        const num = parseFloat(line);
        if (!isNaN(num)) setData((d) => [...d.slice(-500), num]);
      }
    }
  }

  useEffect(() => () => portRef.current?.close(), []);
  return { connect, data };
}
```

**Curriculum phases served:** P4 (Arduino/STM32 projects), P10 (capstones with real hardware).

**Caveats:**
- **Safari has zero support and no announced plans.** Show a clear "Use Chrome/Edge" notice for Safari users.
- Requires HTTPS (the curriculum site already meets this).
- User must click a button to invoke `requestPort()` (security requirement).
- For ESP32 flashing (not just telemetry), WebUSB is needed — different API, narrower support.

---

### 2.4 — Web Audio oscilloscope / signal generator

**What:** Use the browser's built-in Web Audio API (`AudioContext`, `AnalyserNode`, `OscillatorNode`) to build a virtual oscilloscope and signal generator. The user can: (1) generate sine/square/triangle/sawtooth waves at any frequency, (2) visualize them in real time on a canvas, (3) use the microphone as a signal source, (4) apply filters and see the spectrum. Zero npm deps.

| Property | Value |
|---|---|
| API | `AudioContext`, `AnalyserNode`, `OscillatorNode` (built-in) |
| Spec | https://webaudio.github.io/web-audio-api/ |
| Browser support | All modern browsers (universal — even Safari) |
| Bundle cost | 0 (browser native) |
| Reference repo | https://github.com/cwilso/Audio-Input-Web-Audio (web audio scope examples) |

**Integration sample (oscilloscope + signal generator):**

```tsx
// src/components/curriculum/WebAudioScope.tsx
'use client';
import { useEffect, useRef, useState } from 'react';

export function WebAudioScope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<AudioContext>();
  const [freq, setFreq] = useState(440);
  const [wave, setWave] = useState<OscillatorType>('sine');

  useEffect(() => {
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const osc = ctx.createOscillator();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    osc.type = wave;
    osc.frequency.value = freq;
    osc.connect(analyser);
    osc.connect(ctx.destination);
    osc.start();

    const buf = new Uint8Array(analyser.fftSize);
    const canvas = canvasRef.current!;
    const cctx = canvas.getContext('2d')!;
    function draw() {
      analyser.getByteTimeDomainData(buf);
      cctx.fillStyle = '#000';
      cctx.fillRect(0, 0, canvas.width, canvas.height);
      cctx.strokeStyle = '#0f0';
      cctx.beginPath();
      for (let i = 0; i < buf.length; i++) {
        const x = (i / buf.length) * canvas.width;
        const y = (buf[i] / 128) * (canvas.height / 2);
        i === 0 ? cctx.moveTo(x, y) : cctx.lineTo(x, y);
      }
      cctx.stroke();
      requestAnimationFrame(draw);
    }
    draw();
    return () => { osc.stop(); ctx.close(); };
  }, [freq, wave]);

  return (
    <div>
      <canvas ref={canvasRef} width={600} height={300} className="border" />
      <input type="range" min={20} max={2000} value={freq} onChange={(e) => setFreq(+e.target.value)} />
      <select value={wave} onChange={(e) => setWave(e.target.value as OscillatorType)}>
        <option value="sine">Sine</option>
        <option value="square">Square</option>
        <option value="triangle">Triangle</option>
        <option value="sawtooth">Sawtooth</option>
      </select>
    </div>
  );
}
```

**Curriculum phases served:** P5 (signals, Fourier, sampling), P2 (AC waveforms), P8 (modulation — AM/FM via oscillators).

**Caveats:**
- Audio output is muted until the user interacts with the page (browser autoplay policy). Show a "Click to start" button.
- Audio bandwidth is limited to ~20 kHz (sample rate 44.1 kHz). For higher-frequency RF work, use IQEngine (Tier 3).

---

### 2.5 — IQEngine (RF/SDR spectrogram embed)

**What:** Web-based SDR toolkit for analyzing RF recordings. Renders spectrograms, frequency/time/IQ plots from SigMF recordings. Open source, MIT, 326 stars. Can process local files client-side.

| Property | Value |
|---|---|
| Repo | https://github.com/IQEngine/IQEngine |
| License | MIT |
| Stars | 326 |
| Live site | https://iqengine.org |
| Topics | fft, gnuradio, rf, sdr, signal-processing |

**Integration:** Easiest path is iframe-embed a specific IQEngine recording URL (e.g. `https://iqengine.org/sigmf/<recording-meta-url>`). For deeper integration, fork the project and bundle selected components — but it's a heavy app (Docker + FastAPI + React), so iframe embedding is the practical choice.

**Curriculum phases served:** P8 (RF/communications — spectrum, modulation, demodulation), P5 (FFT, sampling, windowing).

**Caveats:** IQEngine is a full web app, not a library. Iframe embed is the only practical integration. The public instance has many pre-loaded recordings that map to common modulation types (AM, FM, PSK, FSK, LTE) — perfect for showing real RF examples in P8 lessons.

---

## Tier 3 — Aspirational, High Effort

### 3.1 — QEMU-WASM for full microcontroller simulation

**What:** QEMU patched to run in the browser via WebAssembly, including JIT binary translation. Could in principle emulate an ARM Cortex-M microcontroller in the browser, letting students run real firmware without hardware.

| Property | Value |
|---|---|
| Repo | https://github.com/ktock/qemu-wasm |
| License | NOASSERTION (likely GPL-2.0 via QEMU upstream) |
| Stars | 374 |
| Repo size | 638 MB |
| Live demo | https://ktock.github.io/qemu-wasm-demo/ |

**Reality check:** The current demo boots a full Linux VM in the browser. There is **no public Cortex-M port** — QEMU's M-profile emulation would need separate wiring. Effort: **several person-months** to get a clean, focused MCU simulator. Recommend deferring this until P4 enrollment justifies it. Wokwi (Tier 2) is the pragmatic alternative.

---

### 3.2 — Self-hosted, customized CircuitJS1 build

**What:** Clone sharpie7/circuitjs1, install Eclipse + GWT plugin, compile to JavaScript, host the `war/` directory under `/public/circuitjs/`. Lets us add custom branding, custom default circuits, custom components, custom translations. Removes the falstad.com dependency.

**Reality check:**
- Build process requires Eclipse Oxygen + the GWT plugin — a Java toolchain that doesn't fit the project's Node/Bun workflow. A maintainer would need to set up a separate build VM.
- The compiled output is ~1.5 MB of generated JS; modifying the Java source requires rebuilding the entire GWT output.
- GPL-2.0 modifications must be published.
- Effort: **2–4 weeks** to set up the build pipeline and customize for the curriculum's look-and-feel.
- ROI: Marginal over the iframe embed for v1. **Defer unless branding becomes a blocker.**

---

### 3.3 — Full FPGA bitstream flow (Yosys + nextpnr in WASM)

**What:** Beyond Yosys synthesis, run nextpnr (place-and-route) in the browser to produce actual FPGA bitstreams for boards like the iCE40 (Lattice) or ECP5. Students could write Verilog, synthesize, place-and-route, and download a `.bit` file to flash onto their hardware — entirely from the curriculum site.

**Reality check:**
- YoWASP already publishes `@yowasp/nextpnr-ice40` and `@yowasp/nextpnr-ecp5` — the WASM builds exist!
- Combined WASM size for Yosys + nextpnr-ice40 ≈ **20 MB compressed**. Manageable.
- The hard part is the **UX flow**: synthesizing, mapping to a specific board's pins, generating the bitstream, and then flashing it via WebUSB to a real board. Each step has rough edges.
- Used in production by the apio CLI and the TinyFPGA bootloader. Not packaged as a single educational tool yet.
- Effort: **4–6 weeks** for a polished flow. **Recommend as a follow-up after Tier 1 is shipped.**

---

## Implementation Roadmap (4 weeks)

### Week 1 — Foundation & quick wins (≈25 hours)

| Hours | Task |
|-------|------|
| 2 | Add `katex` + CSS to render math in lesson text. Replace existing inline LaTeX patterns. |
| 3 | Add `wavedrom` for digital timing diagrams in P4 lessons. |
| 4 | Add Falstad iframe embed component + 5 starter circuits (R divider, RC, RLC, half-wave rectifier, inverting op-amp). |
| 6 | Add `spicey` playground component for P1/P2 lessons (instant feedback). Wire up to existing lesson drawer. |
| 4 | Add `plotly.js-dist-min` via `next/dynamic`. Build BodePlot, NyquistPlot, StepResponse components. |
| 4 | Add KaTeX-formatted equations to 10 priority lessons (P0 calculus, P1 Ohm/Kirchhoff, P2 phasors, P5 Z-transform). |
| 2 | Write integration tests; verify bundle sizes are within budget. |

**End of Week 1 deliverable:** Every lesson that mentions a circuit can render math, plot a Bode/Nyquist, show a WaveDrom timing diagram, and embed a Falstad sim. No WASM yet.

### Week 2 — Real SPICE + Verilog (≈30 hours)

| Hours | Task |
|-------|------|
| 8 | Integrate `eecircuit-engine` (5.7 MB WASM). Build SpicePlayground component with Web Worker isolation. Add 8 canned circuits covering P1–P3. |
| 6 | Integrate `@yowasp/yosys` + `digitaljs` for P4 Verilog lessons. Build VerilogPlayground component with skeleton loader. Add 6 examples (counter, FSM, adder, mux, register file, FIFO). |
| 4 | Add "Open in real SPICE" toggle to swap spicey ↔ eecircuit-engine on the same netlist. |
| 4 | Write 10 P1/P2 lessons that use the new SpicePlayground interactively (R-divider, Thévenin, RC step, AC sweep, resonance). |
| 4 | Write 5 P4 lessons using VerilogPlayground (gates, mux, D-flop, counter, simple FSM). |
| 4 | Performance pass: lazy-load WASM only on the routes that need it; add Suspense boundaries; verify first-contentful-paint under 2s on the homepage. |

**End of Week 2 deliverable:** Real SPICE and Verilog simulation working in-browser. P1–P4 lessons are deeply interactive.

### Week 3 — Hardware bridge + advanced viz (≈25 hours)

| Hours | Task |
|-------|------|
| 6 | Build WebAudioScope component (oscilloscope + signal generator). Add to P5 (Fourier, sampling) and P2 (AC waveforms). |
| 6 | Build WebSerial hook + SerialScope component. Add to P4 (Arduino lab) and P10 (capstone prep). Handle Safari fallback gracefully. |
| 4 | Add KiCanvas iframe embed for P3/P9 KiCad schematic viewing. Bundle 4 reference KiCad projects. |
| 5 | Add `@tscircuit/schematic-viewer` for code-as-circuit examples in P1/P3. Write 3 JSX-circuit lessons. |
| 4 | Add IQEngine iframe embed for P8 (RF spectrograms of AM/FM/PSK recordings). |

**End of Week 3 deliverable:** Students can connect real hardware, visualize real signals, view real schematics, and explore real RF recordings.

### Week 4 — Polish, content, and edge cases (≈20 hours)

| Hours | Task |
|-------|------|
| 6 | Add WaveDrom diagrams to 15 P4 lessons (clocks, FSM evolution, bus protocols). |
| 4 | Add Bode/Nyquist/Smith plots to all P2/P5/P6/P8 lessons that previously had static images. |
| 4 | Build a "Lab Mode" page that combines SpicePlayground + BodePlot + WaveDrom in one resizable panel layout (use existing `react-resizable-panels`). |
| 3 | Browser support matrix + graceful fallback messaging (esp. Safari for WebSerial). |
| 3 | Bundle analysis with `@next/bundle-analyzer`. Verify total first-load <3 MB on the homepage; verify WASM chunks are properly code-split. |

**End of Week 4 deliverable:** Production-ready, deeply interactive EE curriculum site. Real SPICE, real Verilog, real hardware, real RF — all in the browser.

**Total estimated effort: ~100 hours over 4 weeks.** Comfortably achievable for one focused engineer.

---

## Technical Risks & Mitigations

### Bundle size

| Risk | Mitigation |
|------|------------|
| `eecircuit-engine` 5.7 MB + `@yowasp/yosys` 12 MB + `plotly.js` 1.2 MB on first load | Use `next/dynamic` with `ssr: false` for each heavy component. Verify with `@next/bundle-analyzer` that no WASM leaks into the homepage bundle. The existing Pyodide pattern (load from CDN on demand) is the template. |
| `digitaljs` pulls in jQuery + JointJS + elkjs (~5 MB) | Same — lazy-load only on P4 routes. Consider replacing with a lighter visualizer in a future iteration if bundle pressure becomes an issue. |
| Plotly.js full bundle is 89 MB unpacked | Use `plotly.js-dist-min` (5.4 MB unpacked, 1.2 MB gzipped), not the full `plotly.js`. Or use `react-plotly.js` + a custom Plotly bundle (tree-shaken to only the trace types we use). |

### Browser compatibility

| API | Chrome | Edge | Firefox | Safari | Mitigation |
|-----|--------|------|---------|--------|------------|
| WebSerial | 89+ | 89+ | 151+ (Apr 2026) | ❌ | Feature-detect `'serial' in navigator`; show "Use Chrome" notice on Safari |
| WebUSB | 61+ | 79+ | ❌ (flags only) | ❌ | Same — feature-detect `'usb' in navigator` |
| Web Bluetooth | 56+ | 79+ | ❌ (flags only) | ❌ | Same — feature-detect `'bluetooth' in navigator` |
| Web Audio API | ✅ | ✅ | ✅ | ✅ | Universal — no mitigation needed |
| WebAssembly | ✅ | ✅ | ✅ | ✅ | Universal (all browsers since 2017) |
| WASM SIMD | 91+ | 91+ | 89+ | 16.4+ | Required for ngspice/Yosys WASM; modern browsers all support |
| `AudioContext` autoplay policy | Requires user gesture | Same | Same | Same | Show "Click to start" button; do not autoplay audio |

### Licensing

| Package | License | Notes |
|---------|---------|-------|
| `eecircuit-engine` | MIT | Permissive — safe for any use |
| `spicey` | MIT (LICENSE file present, `package.json` field is null — verified at https://github.com/tscircuit/spicey/blob/main/LICENSE) | Permissive — safe |
| `@yowasp/yosys` | ISC | Permissive — safe (same as Yosys upstream) |
| `digitaljs` | BSD-2-Clause | Permissive — safe |
| `plotly.js-dist-min` | MIT | Permissive — safe |
| `katex` | MIT | Permissive — safe |
| `wavedrom` | MIT | Permissive — safe |
| `kicanvas` | MIT | Permissive — safe |
| `tscircuit` / `@tscircuit/*` | MIT | Permissive — safe (verified at https://github.com/tscircuit/tscircuit/blob/main/LICENSE) |
| `@wokwi/elements` | MIT | Permissive — safe (note: the Wokwi *simulator* itself is closed-source; only the web components are open) |
| CircuitJS1 (Falstad) | GPL-2.0 | **Copyleft.** Embedding via iframe from falstad.com is fine. Self-hosting a modified build requires publishing modifications. Recommendation: use the hosted iframe for v1. |
| `verisim` (Icarus Verilog WASM) | GPL-2.0 | Same as CircuitJS1 — copyleft. We're not recommending it for v1. |
| IQEngine | MIT | Permissive — safe to embed |

### CORS / cross-origin

- `eecircuit-engine`, `@yowasp/yosys`, `digitaljs`, `spicey`, `wavedrom`, `katex`, `plotly.js` are all **bundled into our own JS** — no CORS issues.
- Falstad iframe: falstad.com sends `X-Frame-Options: ALLOWALL` (verified) — embeds work.
- IQEngine iframe: iqengine.org allows embedding — verified.
- KiCad files for KiCanvas: serve from `/public/kicad/` on our own origin — no CORS.
- WebSerial/WebUSB: same-origin only by default; we don't need cross-origin.

### Performance

- ngspice WASM `.tran` runs on >10k points will block the main thread. **Mandatory:** wrap `sim.runSim()` in a Web Worker. The `eecircuit-engine` API supports this — instantiate the `Simulation` inside a worker and post messages.
- Yosys synthesis can take 5–30 seconds for non-trivial designs. Show a progress bar; run in a Web Worker.
- Plotly re-renders are expensive. Use `react-plotly.js`'s `revision` prop to control when re-renders happen; do not re-render on every animation frame.
- Web Audio scope: `requestAnimationFrame` is fine at 60 fps; do not use `setInterval`.

### Security

- WebSerial/WebUSB: require user gesture (button click) before `requestPort()` / `requestDevice()`. Never auto-connect.
- User-uploaded netlists (if we add that feature): sanitize before passing to ngspice — ngspice has had RCE vulnerabilities in `.include` directives. The WASM sandbox mitigates this (no filesystem access outside MEMFS), but still validate input.

### Maintainability

- `eecircuit-engine` and `@yowasp/yosys` are mature but small projects. **Pin exact versions** in `package.json` (no `^` or `~`) to avoid surprise breaks.
- `tscircuit/*` packages update multiple times per day. Use a manual update cadence (monthly), not `latest`.
- Falstad iframe: the URL-encoding format is stable but undocumented. Generate circuit URLs once and store them as constants; don't try to construct them programmatically.

---

## What I Did NOT Find (and how to verify)

- **LTspice in browser:** No public port. LTspice is closed-source (Analog Devices). Not feasible.
- **PySpice in Pyodide:** PySpice requires the ngspice shared library as a native binary; Pyodide cannot load native shared libraries. **Confirmed not viable.** Use `eecircuit-engine` instead.
- **Verilator in WASM:** Per GitHub issue #1402 (Feb 2019), Verilator's codegen makes it incompatible with Emscripten. Not pursued by the Verilator team. Use `@yowasp/yosys` instead.
- **GNU Radio in WASM:** No public port found. GNU Radio is a massive C++ framework; porting would be a multi-year effort. Use IQEngine (RF recordings) + Web Audio (audio-band signals) as the practical alternative.
- **Magic VLSI in browser:** No port. Desktop-only (Tcl/Tk + X11).
- **OpenROAD in browser:** No port. Desktop-only.
- **KLayout in browser:** No official port. `kweb` (gdsfactory/kweb) exists but requires a Python backend — not pure-browser.
- **SimulIDE web version:** No web version. Desktop only.
- **Tinkercad API:** No public API for programmatic embeds; you can manually generate embed codes from the Tinkercad UI but can't automate. Wokwi is the better choice.

**To verify any of the above have changed:** search GitHub for the project name + "wasm" or "web"; check the project's issue tracker for "browser" / "wasm" tags. The landscape moves fast — re-check quarterly.

---

## Quick Reference — All Packages Verified

### Tier 1 (recommended for v1)

| Package | License | On-wire size | npm install |
|---------|---------|--------------|-------------|
| `eecircuit-engine@1.8.0` | MIT | 5.7 MB gzip | `npm i eecircuit-engine` |
| `spicey@0.0.14` | MIT | ~15 KB min+gzip | `npm i spicey` |
| Falstad/CircuitJS1 (iframe) | GPL-2.0 | ~1.5 MB (from falstad.com) | N/A — iframe embed |
| `@yowasp/yosys@0.65.176-dev.1145` | ISC | 12 MB gzip | `npm i @yowasp/yosys` |
| `digitaljs@0.14.2` | BSD-2-Clause | ~5 MB bundle (with deps) | `npm i digitaljs` |
| `plotly.js-dist-min@4.1.0` | MIT | 1.18 MB gzip | `npm i plotly.js-dist-min react-plotly.js` |
| `katex@0.18.7` | MIT | 75 KB gzip | `npm i katex` |
| `wavedrom@3.7.0` | MIT | ~250 KB gzip | `npm i wavedrom` |

### Tier 2 (recommended for v1.x or v2)

| Package | License | On-wire size | npm install |
|---------|---------|--------------|-------------|
| KiCanvas (iframe from kicanvas.org) | MIT | ~500 KB | N/A — iframe embed |
| `@tscircuit/schematic-viewer@2.0.89` | MIT | 0.36 MB | `npm i @tscircuit/schematic-viewer` |
| `@tscircuit/3d-viewer@0.0.597` | MIT | 1.66 MB | `npm i @tscircuit/3d-viewer` |
| `@wokwi/elements@1.9.2` | MIT | 2.14 MB | `npm i @wokwi/elements` |
| WebSerial API | N/A (browser native) | 0 | N/A |
| WebUSB API | N/A (browser native) | 0 | N/A |
| Web Audio API | N/A (browser native) | 0 | N/A |
| IQEngine (iframe from iqengine.org) | MIT | n/a (full app) | N/A — iframe embed |

### Tier 3 (aspirational)

| Package | License | On-wire size | npm install |
|---------|---------|--------------|-------------|
| `@yowasp/nextpnr-ice40` | ISC | ~8 MB gzip | `npm i @yowasp/nextpnr-ice40` |
| `@yowasp/nextpnr-ecp5` | ISC | ~15 MB gzip | `npm i @yowasp/nextpnr-ecp5` |
| QEMU-WASM | GPL-2.0 (NOASSERTION) | 50+ MB | N/A — build from https://github.com/ktock/qemu-wasm |
| CircuitJS1 self-hosted | GPL-2.0 | ~1.5 MB | N/A — build from https://github.com/sharpie7/circuitjs1 |
| `verisim` (Icarus Verilog WASM) | GPL-2.0 | ~5 MB | N/A — clone https://github.com/senolgulgonul/verisim |

---

## Final Recommendation

**Ship Tier 1 in 4 weeks.** The five Tier 1 features turn the curriculum site from "a reader with a Python REPL" into "a real EE workbench." Every phase from P1 (DC) through P9 (VLSI) gets at least one hands-on interactive tool. The total cost is ~22 MB of WASM/JS loaded on demand across the entire curriculum — comparable to what's already loaded for Pyodide alone.

**Tier 2 features** can be added incrementally in the following month as student feedback identifies which integrations are most valuable. The hardware-bridge features (WebSerial, Web Audio) are zero-bundle-cost and unlock the "connect real hardware" use case that makes the curriculum tangible.

**Tier 3 features** should be revisited after the curriculum has been live for a semester and we have data on which lessons students spend the most time on. The FPGA bitstream flow is the highest-value Tier 3 item — if students are asking for it, ship it next.
