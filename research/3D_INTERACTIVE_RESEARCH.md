# 3D + Breadboard + Wokwi — Research & Implementation Plan

**Project:** EE Curriculum for Computer Scientists — Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui
**Stack already in place:** React 19, Pyodide, `eecircuit-engine` (ngspice WASM), `spicey`, `@yowasp/yosys` + `digitaljs`, Falstad iframe, Web Audio scope, WebSerial, KiCanvas embed, IQEngine embed, Plotly, KaTeX, WaveDrom, MDX editor.
**Research dates:** Sept 2026. Bundle sizes measured from `bundlephobia.com` / `registry.npmjs.org` / direct CDN HEAD.
**User ask:** *"3D models and there we are connecting thing and all that like things with projects."* — real hands-on, drag-and-wire, build-stuff experience on top of the existing math/SPICE/Verilog toolchain.

Raw search/reader JSON for every source cited in this document is saved under `research/cache/`. Run `ls research/cache/` to audit.

---

## TL;DR — Executive Summary

We can give the user the "connect-things, hands-on" experience they asked for **without leaving the existing stack**. The five highest-leverage features, ranked by impact-per-effort:

| # | Feature | What it gives the user | Effort | Status of this doc |
|---|---------|------------------------|--------|--------------------|
| 1 | **Wokwi iframe embed** (`WokwiEmbed.tsx`) | Real Arduino/ESP32/STM32/Pi-Pico simulator in-browser — code + wiring + 60+ parts (LED, servo, LCD, NeoPixel, sensors, motors). Free for personal use. | ~4 h | **Tier 1 — ship first** |
| 2 | **React Three Fiber (R3F) procedural 3D component viewer** | Rotatable, zoomable 3D models of resistor/LED/capacitor/transistor/IC built from primitives (cylinder + leads + color bands). Zero external 3D assets needed. | ~12 h | **Tier 1** |
| 3 | **`@wokwi/elements` live parts catalog** | Lit-based web components for LED, pushbutton, potentiometer, LCD1602, OLED SSD1306, NeoPixel, servo, etc. We wire them to our existing Pyodide/SPICE state to make them actually *do* something. | ~8 h | **Tier 1** |
| 4 | **tscircuit `<RunFrame />`** | Write React code → live schematic + PCB + 3D board preview in a webworker. Already MIT-licensed, React-native, used in production by tscircuit.com. | ~10 h | **Tier 1** |
| 5 | **3D PCB viewer via KiCanvas + R3F** | Drop a `.kicad_pcb` (or exported `.glb`) into a 3D scene. KiCad ships with thousands of 3D STEP models; convert via FreeCAD → glTF. | ~16 h | **Tier 2** |
| 6 | **Custom 3D virtual breadboard** (R3F + breadboard grid + netlist → SPICE) | The full "drag a resistor onto a 3D breadboard, wire leads, see LED light up" experience the user described. OpenBreadboard (ryyansafar/openbreadboard) uses **the exact same stack we have** (React 19 + R3F + drei + Tailwind 4) and is a code reference. | ~40–60 h | **Tier 2 — the real prize** |

Tier 3 (not recommended): self-hosting CircuitJS1 breadboard patches, Tinkercad embeds (no public iframe API, proprietary), 123D Circuits (defunct), Qucs/Wolfram-style analog-digital co-sim from scratch.

The user's literal ask — "3D models where we connect things" — is feature #6, and it's the most expensive. The smart move is to ship #1–#4 first (one week), then build #6 as a focused two-sprint project, drawing the breadboard grid, the 3D component meshes, and the SPICE-wiring rules from OpenBreadboard as a reference.

---

## Curriculum Phase → New Feature Mapping

| Phase | Today | Add this feature | Why it fits |
|-------|-------|------------------|-------------|
| P1 DC | spicey, eecircuit-engine, Falstad | R3F 3D component viewer (#2), simple breadboard (#6 MVP) | "What does a resistor look like?" + "Wire it yourself" |
| P3 Analog | eecircuit-engine + Falstad | R3F 3D transistor/IC viewer (#2) | Recognize TO-92, DIP-8, SOT-23 packages |
| P4 Digital/Embedded | yosys + digitaljs + Wokwi (planned) | **WokwiEmbed (#1)** + CircuitVerse iframe | Real Arduino/ESP32 + truth-table gates |
| P5–P6 Signals/Control | Pyodide + Plotly | (nothing new needed) | Existing toolchain already strong |
| P7 Power | eecircuit-engine .tran | R3F MOSFET/heatsink viewer (#2) | Visual package → thermal intuition |
| P8 RF | IQEngine + Plotly Smith | — | Already covered |
| P9 VLSI | eecircuit-engine + SkyWater/GF PDKs | **tscircuit RunFrame (#4)** + KiCanvas 3D (#5) | "See your layout become a board" |
| P10 Capstones | WebSerial for real hardware | **WokwiEmbed (#1)** + full breadboard (#6) | "Build the project virtually before buying parts" |

---

## Tier 1 — Achievable Now, High Impact

### 1.1 — Wokwi iframe embed (`WokwiEmbed.tsx`)

**What it does:** Embeds the Wokwi online simulator (https://wokwi.com) inside the curriculum page. Wokwi simulates real microcontroller firmware — Arduino Uno/Nano/Mega, ATtiny85, Raspberry Pi Pico (RP2040), ESP32 / ESP32-C3 / C5 / C6 / S2 / H2, STM32 Bluepill, STM Nucleo — and ships **60+ interactive parts**: LED, RGB LED, NeoPixel (strip/ring/matrix/bar-graph), LCD1602/LCD2004, OLED SSD1306, ILI9341, Nokia 5110, MAX7219 matrix, 7-segment (single/TM1637), servo, stepper, DC motor, relay, pushbutton, potentiometer, slide pot, slide switch, DIP switch, DHT22, DS18B20, MQ-x gas, MPU6050 IMU, HC-SR04 ultrasonic, PIR motion, photoresistor (LDR), NTC thermistor, IR remote/receiver, membrane keypad, microSD, logic analyzer, MEMS mic, buzzer, A4988 stepper driver, KY-040 rotary encoder, I²C devices (BMP180, MFRC522, DS1307, HX711).

**Free-tier reality check:** Wokwi is **free for personal & educational use** (confirmed in Espressif's docs and Wokwi's own pricing page). Paid plans exist for commercial use and to remove rate limits on the build/CI API. There is **no per-embed-view fee** — the iframe hits `wokwi.com` directly, just like Falstad.

**Embed mechanism:** Plain iframe. No API key, no JS SDK to load. The pattern is:

```html
<iframe src="https://wokwi.com/projects/{PROJECT_ID}" width="800" height="500" frameborder="0"></iframe>
```

To **pre-configure a circuit + code**, you create the project once on wokwi.com, then share its numeric ID. (The VS Code extension supports loading `diagram.json` + `sketch.ino` from local files, but the hosted iframe model is the simplest path — same as Falstad.) The `diagram.json` file format is fully documented (see `research/cache/wokwi_diagram_format.json`) so we can hand-author circuits in JSON and either upload them once or fork existing community projects.

**iframe allow-flags:** Wokwi sends `X-Frame-Options: ALLOWALL` (same as Falstad) and works in Chrome, Firefox, Safari, mobile Chrome. No proxy needed.

**Bundle cost:** **0 bytes** — it's an iframe. No npm package, no JS shipped to our users. Same model as the existing `FalstadEmbed.tsx`.

**Integration approach (mirror `FalstadEmbed.tsx`):**

```tsx
// src/components/curriculum/WokwiEmbed.tsx
'use client';
import * as React from 'react';
import { ExternalLink, Cpu, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WokwiEmbedProps {
  /** Full Wokwi project URL, e.g. https://wokwi.com/projects/413434549279951873 */
  projectUrl: string;
  title?: string;
  caption?: string;
}

export function WokwiEmbed({ projectUrl, title = 'Microcontroller simulator', caption }: WokwiEmbedProps) {
  const isAllowed = React.useMemo(() => {
    try {
      const u = new URL(projectUrl);
      return u.hostname === 'wokwi.com' || u.hostname === 'www.wokwi.com';
    } catch { return false; }
  }, [projectUrl]);

  if (!isAllowed) {
    return (
      <div className="rounded-sm border border-error/40 bg-error/8 px-3 py-2.5 text-xs text-error">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="font-semibold uppercase tracking-wide">Invalid Wokwi URL</span>
        </div>
        <p className="mt-1 text-foreground/70">Expected a URL on <code className="ee-mono">wokwi.com</code>.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-background">
      <div className="flex items-center gap-2 border-b border-border/60 bg-accent/5 px-3 py-2">
        <Cpu className="h-4 w-4 text-accent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">{title}</span>
        <span className="text-[10px] text-muted-foreground">(Wokwi — real firmware simulation)</span>
        <a href={projectUrl} target="_blank" rel="noopener noreferrer"
           className="ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-accent hover:bg-accent/10">
          <ExternalLink className="h-3 w-3" /> Open in Wokwi
        </a>
      </div>
      <iframe title={title} src={projectUrl} className={cn('block h-[560px] w-full bg-white')}
              loading="lazy" allow="fullscreen" referrerPolicy="no-referrer-when-downgrade" />
      {caption && <p className="border-t border-border/40 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">{caption}</p>}
    </div>
  );
}
```

**Which lessons it serves:** P4 (Arduino blink, button-debounce, LED PWM), P7 (motor driver / MOSFET switching), P10 capstones (IoT weather station, plant monitor, robot car — all classic ESP32 starter projects already on Wokwi's public projects gallery).

**Recommended starter embeds** (create once, reuse everywhere):
1. Arduino Uno + RGB LED fade — P4 lesson "PWM"
2. ESP32 + DHT22 + OLED — P10 capstone "IoT sensor"
3. ATtiny85 + NeoPixel ring — P10 capstone "wearable"
4. Pi Pico + HC-SR04 ultrasonic ranger — P4 lesson "timers"

**Honest caveats:**
- iframe runs on `wokwi.com`'s servers — if their site is down, the embed is down. Same as Falstad today. Acceptable.
- The hosted Wokwi editor is a full IDE (code editor + diagram + serial monitor) — the iframe is large. We set `h-[560px]` and lazy-load.
- No way to **pre-fill** code via URL params on the hosted tier; you have to save the project first. This is fine — we curate ~10 canonical projects and reuse them across lessons.

---

### 1.2 — React Three Fiber (R3F) procedural 3D component viewer

**What it does:** Renders a real, rotatable, zoomable 3D model of a resistor / LED / capacitor / transistor / IC / diode / inductor directly in the page. Two paths:

**Path A — Procedural (recommended for v1):** Build the model from R3F primitives (`<mesh>` + `<cylinderGeometry>`, `<boxGeometry>`, `<sphereGeometry>`) plus a couple of `<meshStandardMaterial>`s. A through-hole resistor = beige cylinder body + two silver wire leads + 4 colored bands (thin tori). A LED = transparent cylinder + dome + 2 leads + flat side. A TO-92 transistor = black plastic half-cylinder + 3 leads. A DIP-8 IC = black plastic rectangle + 8 leads + notch + dot. **No external 3D files needed.** Total per-component code: ~80 lines.

**Path B — Asset-based (recommended for v2):** Drop `.glb` files into `/public/3d/`. R3F loads them with `useGLTF` from `@react-three/drei`. Sources for free, CC0/MIT-licensed component models:
- **Sketchfab CC0 set** — "Set of Electronic Components" by an authorized uploader, CC0 (public domain): https://sketchfab.com/3d-models/cc0-set-of-electronic-components-f4cb777b4ea3490587008e24b61bcf75 — includes axial resistor, breadboard, button, ceramic/cylindrical/foil capacitor, LED, radial resistor. **Already verified CC0.**
- **GrabCAD** — millions of free STEP/IGES models (https://grabcad.com/library/tag/electronics). License is per-uploader (usually CC-BY or unrestricted). Models are STEP/IGES, need conversion to glTF (via FreeCAD or https://products.aspose.app/cad/conversion/step-to-gltf).
- **KiCad 3D library** — ships with ~10,000 component 3D models in WRL/STEP format under KiCad's own license (mostly CC-BY-NC-SA for the visual models — **read each model's license before shipping**). For our curriculum we only need ~20 hero components, so the procedural path is faster and license-clean.

**Bundle sizes (measured from Bundlephobia, Sept 2026):**

| Package | Minified | Gzipped | Notes |
|---|---|---|---|
| `three` (v0.186) | ~658 kB | **~155 kB** | Core. Required. |
| `@react-three/fiber` (v9.7.0) | 159.5 kB | **50.6 kB** | React renderer. v9 supports React 19. |
| `@react-three/drei` (v10.7.8) | 1.5 MB | **488.2 kB** | Helpers. **Tree-shakeable** — only what you import ships. |
| `OrbitControls` (drei export) | — | **~10 kB** | Pan/zoom/rotate. All we need for a viewer. |
| `useGLTF` (drei export) | — | **~22 kB** | Only if we use Path B. |
| `<Environment>` (drei) | — | **~17 kB** | Optional — for nice lighting. Skip on mobile. |

**Realistic per-page cost** (Path A, viewer only): `three` (155 kB gz) + `fiber` (51 kB gz) + `OrbitControls` (10 kB gz) + a `Loader` (1 kB gz) ≈ **~220 kB gzipped** the first time a 3D viewer loads. For comparison, the project already loads Pyodide (~10 MB) and `eecircuit-engine` (5.7 MB gz). 220 kB is noise.

**Dynamic import is mandatory:** Load R3F only when the viewer is scrolled into view / opened, exactly like `HeavySpicePlayground.tsx` already does.

**Mobile performance:** Three.js runs on WebGL2, which is supported on every iOS Safari ≥15 and Android Chrome ≥100. A scene with 5–20 meshes + 1 light runs at 60 fps on a 2020 mid-range phone. Use `dpr={[1, 2]}` (cap pixel ratio), `frameloop="demand"` for static models (no continuous render), and `<AdaptiveDpr>` if needed. The OpenBreadboard repo (see §2.3) already validated R3F + drei on the same React 19 stack.

**Sample integration (Next.js 16 client component):**

```tsx
// src/components/curriculum/ComponentViewer3D.tsx
'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Dynamic import keeps three.js out of the initial bundle.
const Canvas = dynamic(
  () => import('@react-three/fiber').then(m => m.Canvas),
  { ssr: false, loading: () => (
    <div className="flex h-[320px] items-center justify-center text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" /> Loading 3D viewer…
    </div>
  )},
);

// Procedural resistor: cylinder body + 2 leads + 4 color bands.
function Resistor({ bands = ['#8B4513', '#000000', '#FF0000', '#C0C0C0'] }) {
  return (
    <group>
      {/* body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 1.0, 24]} />
        <meshStandardMaterial color="#E8D7B5" />
      </mesh>
      {/* leads */}
      {[-1, 1].map(s => (
        <mesh key={s} position={[s * 0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* color bands */}
      {bands.map((c, i) => (
        <mesh key={i} position={[-0.30 + i * 0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.18, 0.025, 8, 24]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}
    </group>
  );
}

export function ComponentViewer3D({ kind, bands }: { kind: 'resistor' | 'led' | 'capacitor' | 'transistor' | 'ic'; bands?: string[] }) {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-sm border border-accent/30 bg-gradient-to-br from-background to-muted/30">
      <Canvas camera={{ position: [2, 1.5, 3], fov: 45 }} dpr={[1, 2]} frameloop="demand">
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 2]} intensity={1.0} />
        <Suspense fallback={null}>
          {kind === 'resistor' && <Resistor bands={bands} />}
          {/* …led, capacitor, transistor, ic cases… */}
        </Suspense>
        {/* @ts-expect-error drei is dynamically imported alongside */}
        <OrbitControls makeDefault enablePan={false} minDistance={2} maxDistance={8} />
      </Canvas>
    </div>
  );
}
```

**Which lessons it serves:** Every phase — a 3D component viewer next to every "what is X" explainer. P1 (resistor, LED, cap), P3 (transistor, diode, op-amp), P7 (MOSFET, heatsink, inductor), P9 (QFN, BGA, DIP packages).

**Effort:** ~12 h for the 6 most-used procedural components + the `<ComponentViewer3D>` shell + a Storybook-style gallery page. Path B (glTF loading) adds ~4 h once we have models.

---

### 1.3 — `@wokwi/elements` live parts catalog

**What it does:** `@wokwi/elements` (v1.9.2, MIT, weekly downloads ~2,914, maintained by Uri Shaked — Wokwi's founder) is a **Lit-based web-component library** for ~40 electronic parts: LED, RGB LED, pushbutton, slide switch, potentiometer, slide potentiometer, 7-segment display, LCD1602, LCD2004, OLED SSD1306, NeoPixel strip/ring/matrix, MAX7219 matrix, servo, buzzer, keypad, logic-analyzer display, membrane keypad, IR receiver, etc. Each element is a `<wokwi-led>`, `<wokwi-pushbutton>`, etc. custom element with **realistic SVG rendering** and reactive properties (`color`, `value`, `led`).

**Critical caveat (from the official npm README, verbatim):**
> *"Note: these elements only provide the presentation and display of the represented hardware. They do not provide the functional simulation code of the hardware. That is dependent on the application (simulator) that you wish to use them with, and thus up to you to create."*

So `@wokwi/elements` gives us **the gorgeous, pixel-accurate visuals** for parts — but we drive them from our own logic. That's actually perfect for our curriculum: we already have Pyodide + SPICE. We can build lesson-specific mini-simulators where:
- A `<wokwi-pushbutton>` fires a JS event → we update a Pyodide variable → recompute → set `<wokwi-led light={true}>`.
- A `<wokwi-potentiometer>` changes value → we feed it into `eecircuit-engine` as a parameter → re-simulate → drive `<wokwi-oscilloscope>` (we already have a `WebAudioScope`).
- A `<wokwi-lcd1602>` displays text that a Pyodide script computed.

**Web Components in React 19:** React 19 has first-class support for custom elements (no more wrapper hacks). Just `<wokwi-led color="red" light={isOn} />` works.

**Bundle size:** `@wokwi/elements` is ~600 kB minified / ~140 kB gzipped total, but **tree-shakeable per element** — importing just `<wokwi-led>` + `<wokwi-pushbutton>` ships ~30 kB gzipped.

**Integration approach:** Load via dynamic import; for SSR safety, register the custom elements in a `useEffect`.

```tsx
// src/components/curriculum/WokwiLedDemo.tsx
'use client';
import { useEffect, useState } from 'react';

export function WokwiLedDemo() {
  const [on, setOn] = useState(false);
  useEffect(() => { import('@wokwi/elements'); }, []); // registers <wokwi-led>, <wokwi-pushbutton>

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {/* @ts-expect-error custom element not in JSX intrinsics */}
      <wokwi-led color="red" light={on} />
      {/* @ts-expect-error custom element not in JSX intrinsics */}
      <wokwi-pushbutton onChange={(e: CustomEvent) => setOn(e.detail.pressed)} />
      <p className="text-sm text-muted-foreground">LED is {on ? 'ON' : 'OFF'}</p>
    </div>
  );
}
```

**Which lessons it serves:** P1 (LED + button + battery — the canonical "first circuit"), P4 (7-segment, LCD, NeoPixel for embedded output), P10 (LCD dashboards for IoT capstones). Replaces a *lot* of static "here's what an LED looks like" images with interactive widgets.

**Effort:** ~8 h to install, type the custom elements, and ship 3 demo lessons (LED toggle, potentiometer → scope, LCD counter).

---

### 1.4 — tscircuit `<RunFrame />` (live PCB + schematic + 3D board preview)

**What it does:** tscircuit (https://tscircuit.com, MIT-licensed, YC-backed, founded 2024) lets you write **React components that ARE circuits**:

```tsx
import { Resistor, Led, Board } from "@tscircuit/core"

export default function () {
  return (
    <Board width="10mm" height="10mm">
      <Resistor name="R1" resistance="220" footprint="0805" pcbX="-2mm" pcbY="0mm" />
      <Led name="LED1" color="red" footprint="0805" pcbX="2mm" pcbY="0mm" />
      <trace from=".R1 > .pin2" to=".LED1 > .pin1" />
    </Board>
  )
}
```

The `<RunFrame />` React component (https://github.com/tscircuit/runframe) **runs that code inside a webworker** and renders three live tabs: **Schematic**, **PCB**, and **3D board** — all interactive, all in-browser. The 3D board view is itself built on Three.js.

**Why this is a Tier-1 fit:**
- It's a **React component** — drop it into any Next.js client page, no iframe.
- Runs entirely in the browser (webworker). No backend.
- Auto-imports snippets from the tscircuit registry.
- Active project: 154 npm versions, frequent commits, used in production at tscircuit.com.

**Bundle size:** Heavy on first load — RunFrame pulls in `@tscircuit/core`, the schematic renderer, the PCB renderer, and the 3D viewer. Estimate ~800 kB–1.2 MB gzipped total. **Must** be dynamically imported and only mounted on dedicated "PCB design" lessons (P9, P10). Acceptable because we're already loading Pyodide (10 MB) on the same lesson types.

**Integration approach:**

```tsx
// src/components/curriculum/TscircuitPlayground.tsx
'use client';
import dynamic from 'next/dynamic';

const RunFrame = dynamic(
  () => import('@tscircuit/runframe').then(m => m.RunFrame),
  { ssr: false },
);

const SAMPLE_CODE = `
export default () => (
  <board width="20mm" height="20mm">
    <resistor name="R1" resistance="1k" footprint="0603" />
    <led name="D1" color="red" />
    <trace from=".R1 > .pin2" to=".D1 > .anode" />
  </board>
)
`;

export function TscircuitPlayground({ code = SAMPLE_CODE }: { code?: string }) {
  return (
    <div className="h-[600px] w-full overflow-hidden rounded-sm border border-accent/30">
      <RunFrame code={code} />
    </div>
  );
}
```

**Which lessons it serves:** P9 (VLSI / IC design — show your schematic becoming a PCB), P10 (capstone "design your own dev board"). This is the **missing link** between schematic-level thinking (which we have via Falstad + digitaljs) and board-level thinking (which we have via KiCad schematics but only statically via KiCanvas).

**Effort:** ~10 h (install, dynamic-import wiring, type the props, ship 2 starter circuits).

---

## Tier 2 — Achievable With More Effort

### 2.1 — Custom 3D virtual breadboard (the user's actual ask)

**What it does:** A real 3D breadboard where the user drags components (resistor, LED, capacitor, jumper wires) from a palette, drops them into the breadboard tie-point grid, wires them by clicking holes, then hits "Simulate" — at which point we compile the visual circuit into a SPICE netlist, hand it to `eecircuit-engine` (already in our deps), and reflect the simulation back: LED brightness, current arrows, scope traces.

This is the **"connect things"** experience the user described verbatim.

**Why it's Tier 2 and not Tier 1:**
- Real work: breadboard tie-point topology (which holes are tied together by the internal rails), component lead geometry, snap-to-grid, wire routing (orthogonal jumper wires), netlist extraction, and the visual state→sim state bridge.
- **Estimated 40–60 hours** for a robust MVP that handles ~5 component types + jumpers + DC analysis. ~100 h for a version that also does transistors, op-amps, and AC analysis.

**Reference implementation — `ryyansafar/openbreadboard` (https://github.com/ryyansafar/openbreadboard):**
- **Exact same stack as us:** React 19 + TypeScript, Three.js via `@react-three/fiber` + `@react-three/drei`, Tailwind CSS v4. (Their frontend is literally our frontend.)
- **Status: "Early development"** — 4 commits, 1 star, 1 fork, last commit Mar 11 2026.
- Their MVP includes: "interactive dragging, wiring, simulation" (commit msg).
- **Architecture mismatch:** their backend is FastAPI + PySpice + PostgreSQL. **We can't use their backend** — we're a static Next.js deploy. But we don't need to: we already have `eecircuit-engine` (ngspice WASM) running client-side, so we replace their Python backend with our existing SPICE.
- **What we can scavenge:** the breadboard grid geometry, the R3F component-mesh patterns, the wire-routing approach, the drag-and-wire interaction model. Their frontend is MIT-licensed (verify on repo), so reading + adapting the code is fine.

**Recommended architecture for our breadboard MVP:**

```
┌─────────────────────────────────────────────────────────────┐
│  <BreadboardPlayground>  (React 19 client component)        │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │ Parts Palette       │  │ 3D Breadboard (R3F Canvas)   │  │
│  │ - resistor          │  │  ┌─ Breadboard mesh          │  │
│  │ - LED               │  │  │  └─ tie-point holes grid  │  │
│  │ - capacitor         │  │  ├─ Placed components[]      │  │
│  │ - jumper wire       │  │  │  (R3F meshes, drag-able) │  │
│  │ - battery           │  │  ├─ Wires[] (TubeGeometry)   │  │
│  │ - switch            │  │  └─ OrbitControls            │  │
│  └─────────────────────┘  └──────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Simulate button → extractNetlist(components, wires)  │   │
│  │   → eecircuit-engine.runSim() → state                │   │
│  │   → drive LED brightness, current arrows             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**The hard parts (honest list):**
1. **Breadboard topology.** A standard half-size breadboard has 30 row-pairs × 10 columns of tie points + 2 power rails of 25 tie points each. Internally, each row-pair's left-5 holes are tied, and right-5 holes are tied, with the center groove separating them. Hardcode this as an adjacency table. ~30 min.
2. **Snap-to-grid drag.** Use `@react-three/drei`'s `<DragControls>` + a raycaster against the breadboard plane. Snap the dragged component to the nearest tie-point. ~4 h.
3. **Component lead geometry.** Each component declares its leads' positions in breadboard-space (e.g., a resistor has 2 leads 0.4″ apart; a DIP-8 has 8 leads on 0.1″ pitch). ~3 h.
4. **Wire routing.** For jumper wires (point-to-point), render a `TubeGeometry` along a Catmull-Rom curve through 2–3 control points. For component leads, they're already in the right place. ~4 h.
5. **Netlist extraction.** Walk the breadboard adjacency graph: components' lead-holes define net nodes. Emit a SPICE netlist (`R1 n1 n2 220`, `V1 n3 n4 5`, `D1 n2 n3 1N4148`). ~6 h.
6. **Sim→visual bridge.** After `eecircuit-engine` runs `.op`, parse node voltages. For each LED: brightness ∝ current. For each wire: arrow direction = current sign, thickness ∝ |I|. ~6 h.

**Sample code (skeleton — not runnable, shows the shape):**

```tsx
// src/components/curriculum/BreadboardPlayground.tsx (skeleton)
'use client';
import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
const Canvas = dynamic(() => import('@react-three/fiber').then(m => m.Canvas), { ssr: false });

type Part = { id: string; kind: 'resistor' | 'led' | 'capacitor' | 'jumper'; holes: [string, string]; value?: string };
type Wire = { id: string; from: string; to: string };

function extractNetlist(parts: Part[], wires: Wire[]): string {
  // Union-find over breadboard tie-points: parts' lead-holes + wires' endpoints.
  // Emit R/L/C/D/V lines with auto-numbered nets.
  return `V1 1 0 5\nR1 1 2 220\nD1 2 0 1N4148\n.model 1N4148 D\n.op`;
}

export function BreadboardPlayground() {
  const [parts, setParts] = useState<Part[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [ledOn, setLedOn] = useState(false);

  const simulate = useCallback(async () => {
    const netlist = extractNetlist(parts, wires);
    const { Simulation } = await import('eecircuit-engine');
    const sim = new Simulation(); await sim.start();
    sim.setNetList(netlist);
    await sim.runSim();
    // Parse V(node2) — if > 0.7 V, LED is on.
    setLedOn(true);
  }, [parts, wires]);

  return (
    <div className="grid grid-cols-[200px_1fr] gap-4 p-4">
      <PartsPalette onPick={…} />
      <div className="h-[500px]">
        <Canvas camera={{ position: [0, 8, 8], fov: 45 }}>
          <Breadboard3D parts={parts} wires={wires} ledOn={ledOn} />
        </Canvas>
        <button onClick={simulate}>Simulate</button>
      </div>
    </div>
  );
}
```

**Which lessons it serves:** P1 (every "build this circuit" exercise — currently students have to imagine the wiring or go to Falstad's schematic view), P3 (transistor switch), P7 (555 timer astable), P10 (capstone "wire up the project before you buy parts").

**Effort:** ~40 h for the DC MVP (5 component types, LED + ammeter feedback). ~60 h to add transistors, op-amps, AC analysis, scope traces. Worth doing — this is the *one* feature that delivers the user's exact words.

**Mitigations to keep it Tier 2 and not Tier 3:**
- Start with **5 component types** only: resistor, LED, capacitor, battery, jumper. No ICs, no transistors in v1. That bounds the scope.
- Use **OpenBreadboard's frontend as a code reference**, not a dependency — fork the breadboard geometry + drag interaction, throw away their Python backend, plug in our `eecircuit-engine`.
- Ship as a **dedicated `/breadboard` playground route** first, then embed per-lesson. Avoids coupling to lesson render pipeline.

---

### 2.2 — 3D PCB viewer (KiCad `.kicad_pcb` → browser)

**What it does:** Drop a real PCB design into a 3D scene. Student rotates the board, sees components populating both sides, clicks a part to highlight its net.

**Two paths:**

**Path A — KiCanvas (already in our `KiCanvasEmbed.tsx`):** KiCanvas renders the 2D PCB layout from a `.kicad_pcb` file client-side. It does **not** render 3D. So this is the cheap path and we already have it — but no 3D.

**Path B — Export `.glb` from KiCad → load in R3F:** KiCad's 3D viewer can export the populated board as a `.wrl` (VRML) file. FreeCAD or Blender converts `.wrl` → `.glb`. Then R3F's `useGLTF` loads it. Workflow:
1. Open the `.kicad_pcb` in KiCad → File → Export → VRML.
2. Convert: `freecad-cli board.wrl -o board.glb` (or use the Blender Python API).
3. Drop `board.glb` into `/public/3d/`.
4. Render with R3F `<Canvas>` + `useGLTF('/3d/board.glb')` + `<OrbitControls>`.

Path B ships **~20–200 kB per board** (depending on part count) on top of the ~220 kB R3F baseline.

**Path C — `InteractiveHtmlBOM` (https://github.com/openscopeproject/InteractiveHtmlBOM):** A KiCad plugin that generates a static HTML page with the 2D board layout + part highlighting + BOM table. Not 3D, but a very nice "click a part on the BOM, see it light up on the board" UX. Could be embedded in an iframe. ~4 h to wire up.

**Recommended:** Path C now (cheap, immediate value), Path B for a P9 "VLSI lab" hero feature.

**Effort:** Path B = ~16 h (build the conversion pipeline once, ship 3 hero boards). Path C = ~4 h.

---

### 2.3 — CircuitVerse iframe embed (digital logic)

**What it does:** CircuitVerse (https://circuitverse.org, GPL-3.0, ~8k stars, hosted by IIIT-B) is a free open-source **digital logic simulator** with drag-and-drop gates, flip-flops, counters, etc. Every project gets a one-click "Embed" button that produces an iframe HTML snippet. Confirmed working — their docs say "an iframe can be generated for each CircuitVerse simulation for embedding it within web pages and Google Sites."

**How it differs from what we have:** We already have `digitaljs` (for schematics written in Verilog via Yosys-WASM). CircuitVerse is **drag-and-drop**, no code required — perfect for the "build a 4-bit counter by clicking" exercise. It's complementary, not redundant.

**Integration:** Same iframe pattern as `WokwiEmbed.tsx` / `FalstadEmbed.tsx`. ~3 h.

**Which lessons it serves:** P4 (combinational logic, FSMs, ALU design). Specifically the lessons where students need to *build* a circuit by hand, not analyze one.

**Effort:** ~3 h to write the embed component + curate 5 starter projects.

---

## Tier 3 — Not Achievable / Too Complex (honest list)

| Feature | Why it's Tier 3 |
|---------|-----------------|
| **Self-hosted CircuitJS1 with custom breadboard patches** | CircuitJS1 is GPLv2 Java→GWT-compiled JS. Building it requires the GWT toolchain (~1 GB SDK) and ~10 min compile times. Patching it to add a breadboard view = forking a 100k-line Java codebase. Not worth it when Wokwi already does breadboard + MCU better. |
| **Tinkercad Circuits embed** | No public iframe embed API. Tinkercad projects are bound to user accounts (autodesk.com SSO) and can't be shared via stable anonymous URLs. Proprietary. **Hard no.** |
| **123D Circuits** | Defunct since 2018 — Autodesk migrated it to Tinkercad. |
| **Qucs / Qucs-S in the browser** | Qucs is C++/Qt. No WASM port exists. Would require a multi-month Emscripten effort. `eecircuit-engine` already covers the SPICE use case better. |
| **Logism online (not CircuitVerse)** | Logism itself is a Java desktop app. "Logism Evolution" has no web port. CircuitVerse is the spiritual web successor — use that instead. |
| **Full Atmel AVR / ESP32 instruction-level sim in-house** | Wokwi already does this for free. Building our own would require porting simavr or qemu-system-xtensa to WASM — months of work. Tier 3. |
| **3D component modeling with realistic ray-traced lighting** | Three.js path-tracing exists (`three-gpu-pathtracer`) but adds ~2 MB and tanks mobile performance. Skip. |
| **Real-time collaborative breadboard editing (multi-user)** | WebRTC + CRDT layer on top of Tier 2's breadboard. Massive scope. Defer. |

---

## Implementation Plan (recommended order, with hour estimates)

### Sprint 1 — Quick wins (one week, ~24 h total)
| # | Task | Est. | Delivers |
|---|------|------|----------|
| 1 | `WokwiEmbed.tsx` component + 4 curated starter projects (Arduino blink, ESP32+DHT22, ATtiny85+NeoPixel, Pi Pico+HC-SR04) | 4 h | P4, P10 students can write real firmware in the browser |
| 2 | `ComponentViewer3D.tsx` shell + 6 procedural components (resistor, LED, cap, diode, TO-92 transistor, DIP-8 IC) | 12 h | Every "what is X" lesson gets a rotatable 3D model |
| 3 | `WokwiElementsDemo` integration + 3 demo lessons (LED toggle, pot→scope, LCD counter) | 8 h | Interactive part widgets driven by our existing Pyodide/SPICE |

### Sprint 2 — Schematic-to-PCB loop (~13 h)
| # | Task | Est. | Delivers |
|---|------|------|----------|
| 4 | `TscircuitPlayground.tsx` with `<RunFrame />` + 2 starter circuits (LED+resistor, 555 astable) | 10 h | P9 students see code→schematic→PCB→3D board live |
| 5 | `CircuitVerseEmbed.tsx` + 5 curated digital-logic starter projects | 3 h | P4 students build gates by drag-and-drop |

### Sprint 3 — The big one: 3D virtual breadboard (~40 h, two weeks)
| # | Task | Est. | Delivers |
|---|------|------|----------|
| 6 | Breadboard topology + tie-point adjacency + 3D breadboard mesh | 4 h | Visual breadboard renders |
| 7 | Parts palette + drag-and-drop + snap-to-grid (5 component types) | 8 h | User can place parts |
| 8 | Wire drawing + wire editing + delete | 6 h | User can wire parts |
| 9 | Netlist extraction (visual circuit → SPICE) | 6 h | Bridge to existing `eecircuit-engine` |
| 10 | Sim→visual feedback (LED brightness, current arrows) | 8 h | User sees the circuit "work" |
| 11 | 3 starter lessons (LED+resistor, voltage divider, RC time constant) | 8 h | P1 has hands-on labs |

### Sprint 4 — 3D PCB viewer (~16 h, optional / later)
| # | Task | Est. | Delivers |
|---|------|------|----------|
| 12 | KiCad→VRML→glTF conversion pipeline + 3 hero boards | 12 h | P9 VLSI lab has "rotate your board" |
| 13 | InteractiveHtmlBOM iframe embed for BOM-aware board exploration | 4 h | P9/P10 capstone "find this part on the board" |

**Total realistic effort:** ~93 h across ~4 weeks of focused part-time work. Sprint 1 alone (~24 h) gives the user a dramatic visible upgrade.

---

## Honest Assessment — What CAN We Build?

**Yes, we can deliver exactly the "3D models where we connect things" experience the user asked for.** The path is:

1. **Right now (this week):** Ship Wokwi embeds + R3F procedural 3D component viewers + `@wokwi/elements` interactive parts. This instantly adds 3D and "connect things" experiences to ~20 lessons without building any new simulation engine — we reuse Wokwi's hosted simulator and drive Wokwi's visual parts from our existing Pyodide/SPICE.

2. **Next sprint:** Add tscircuit `<RunFrame />` so P9/P10 students can write code and see it become a real 3D PCB. Add CircuitVerse iframe for drag-and-drop digital logic in P4.

3. **The real prize (Sprint 3):** Build the custom 3D breadboard. The hard work is bounded — 5 component types, DC analysis only, ~40 hours — and we have a code reference (OpenBreadboard) using our exact stack. We already have the SPICE engine (`eecircuit-engine`) to drive the simulation. We don't need a Python backend like OpenBreadboard does. This is **the** feature that fulfills the user's literal words: *"3D models and there we are connecting thing and all that like things with projects."*

**What we should NOT attempt:** Self-hosting CircuitJS1 with custom breadboard patches, Tinkercad-style proprietary embeds, building a new analog simulator from scratch, or real-time multi-user editing. These are scope-killers.

**Bundle-size reality check:** All Tier-1 features combined add ~250 kB gzipped (R3F baseline) to the initial bundle if eagerly loaded — but every one of them should be `dynamic()`-imported per-page, so the actual first-paint impact is **0 bytes**. Tier-2 breadboard adds another ~50 kB for the breadboard geometry + interaction code. We're already loading Pyodide (~10 MB) and ngspice WASM (5.7 MB) on relevant lessons — 300 kB of 3D infrastructure is noise.

**Free / open-source compliance:** Every package and service recommended here is either MIT-licensed (`@wokwi/elements`, tscircuit, R3F, drei, three.js), GPLv2 with permitted iframe embedding (CircuitJS1/Falstad, already in use), GPL-3.0 with permitted embedding (CircuitVerse), CC0 (Sketchfab component models), or free-for-educational-use with iframe embedding (Wokwi). No new paid dependencies. No API keys to manage.

---

## Sources (raw JSON in `research/cache/`)

- `r3f_bundle.json`, `r3f_components.json`, `r3f_procedural.json`, `three_size.json`, `three_size2.json`, `drei_size.json` — R3F/drei/three bundle sizes from Bundlephobia + creativedevjobs + pmndrs docs.
- `free_models.json` — Sketchfab CC0 component set + GrabCAD electronics tag + STLfinder.
- `wokwi_embed.json`, `wokwi_embed2.json`, `wokwi_share.json`, `wokwi_docs.json`, `wokwi_diagram_format.json`, `wokwi_pricing.json`, `wokwi_iframe_examples.json`, `wokwi_elements.json`, `wokwi_elements_npm.json`, `wokwi_elements_repo.json` — Wokwi docs, embed pattern, `diagram.json` format, `@wokwi/elements` npm + GitHub.
- `breadboard.json`, `openbreadboard.json`, `openbb2.json`, `openbb3.json`, `openbb_readme.json` — breadboard simulators survey + OpenBreadboard repo deep-dive.
- `tscircuit.json`, `tscircuit_runframe.json`, `tscircuit_runframe_repo.json`, `tscircuit_docs.json`, `runframe2.json`, `runframe_npm.json`, `tscircuit_runframe3.json`, `runframe_readme.json` — tscircuit + RunFrame.
- `circuitverse.json`, `circuitverse_embed.json` — CircuitVerse embed support.
- `falstad_breadboard.json`, `falstad_iframe.json`, `falstad_src.json` — Falstad source/iframe research.
- `tinkercad.json` — Tinkercad embed (negative result).
- `pcb_3d.json`, `kicad_gltf.json`, `pcb_3d_viewer.json` — KiCad 3D → web pipeline + InteractiveHtmlBOM.
