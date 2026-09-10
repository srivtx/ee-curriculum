# Electrical Engineering, for Computer Scientists

> A rigorous 12-month, project-based master curriculum that takes a working computer scientist from Ohm's law to field-oriented motor control, FPGA prototyping, and grid-tied solar inverters — without skipping the math, the physics, or the bench time.

**Authored by [svx](https://github.com/srivtx) (Sribatsha dash)** · MIT Licensed · v3.0 (2026)

---

![License: MIT](https://img.shields.io/badge/License-MIT-7FFF9F.svg?style=flat-square)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black.svg?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?style=flat-square&logo=typescript)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4-38bdf8.svg?style=flat-square&logo=tailwindcss)
![Pyodide](https://img.shields.io/badge/Pyodide-0.26-3776AB.svg?style=flat-square&logo=python)
![ngspice WASM](https://img.shields.io/badge/ngspice-WASM-7FFF9F.svg?style=flat-square)
![Yosys WASM](https://img.shields.io/badge/Yosys-WASM-7FFF9F.svg?style=flat-square)
![Plotly](https://img.shields.io/badge/Plotly.js-interactive-3f4f75.svg?style=flat-square)
![WebSerial](https://img.shields.io/badge/WebSerial-real%20hardware-507aa4.svg?style=flat-square)
![Web Audio](https://img.shields.io/badge/Web%20Audio-scope%20%26%20FFT-529067.svg?style=flat-square)
![PDF](https://img.shields.io/badge/PDF-97%20pages-c23a3a.svg?style=flat-square)
![Phases](https://img.shields.io/badge/Phases-11-7FFF9F.svg?style=flat-square)
![Modules](https://img.shields.io/badge/Modules-91-507aa4.svg?style=flat-square)
![Lessons](https://img.shields.io/badge/Lessons-140-529067.svg?style=flat-square)
![Projects](https://img.shields.io/badge/Projects-52-8c7443.svg?style=flat-square)
![Capstones](https://img.shields.io/badge/Capstones-6-a25b54.svg?style=flat-square)
![Design](https://img.shields.io/badge/Design-x.ai%20inspired%20%2B%20voxel-0a0a0a.svg?style=flat-square)

---

## What is this?

A complete self-study pathway from computer-science fluency to electrical-engineering fluency. Two deliverables ship together:

1. **A 97-page PDF curriculum** — study material covering 11 phases, ~91 modules, ~140 lessons, ~52 hands-on projects, and 6 capstones. Rigorous math, heavy CS↔EE concept bridges, hardware-plus-simulation projects, checkpoints at the end of every module, and five appendices (toolchain setup, bill of materials, CS↔EE concept map, math reference, 12-month pacing calendar).

2. **An interactive learning website** (Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui) — browse all 11 phases and 91 modules, run real Python code in-browser (Pyodide) for ~14 DSP/control/RF lessons, simulate circuits with two SPICE engines (`spicey` for instant-load simple sims, `eecircuit-engine` with full ngspice WASM for transistor-level work), synthesize Verilog HDL in-browser via Yosys WASM + visualize the gate-level circuit with digitaljs, build circuits visually with embedded Falstad, visualize digital timing with WaveDrom, explore transfer functions with interactive Bode plots (Plotly), render formulas with KaTeX, view real SDR spectrograms via IQEngine, view KiCad schematics via KiCanvas, generate signals and see live scope + FFT via Web Audio API, and even connect to real Arduino/ESP32/STM32 hardware over WebSerial. Track progress on 52 hands-on projects, drill 146 checkpoint flashcards, and log hours per phase. All progress persists to localStorage.

The curriculum is calibrated for ~12 months at 12 hours/week (≈ 800 hours total) and covers the full practical core of an EE B.Sc. — DC/AC circuits, analog electronics, digital logic + embedded, signals + DSP, control + robotics, power electronics + machines, EM fields + RF + comms, VLSI, and power systems + renewables.

## Why this exists

Every CS engineer hits electrical engineering eventually — when you build hardware, when you debug signal-integrity issues, when you design a motor controller, when you scale a power system, when you read a datasheet and need to understand what "PSRR" or "jitter" or "FOC" actually means. Most CS-to-EE bridges are either too shallow (YouTube tutorials) or too academic (4-year degree). This curriculum is the middle path: rigorous enough that you actually understand the math, practical enough that you can ship hardware by the end.

The secret weapon is the **CS↔EE concept bridge**. Almost every EE concept has a precise CS analog you already know:

| CS concept | EE concept |
|---|---|
| FSM | Sequential circuit |
| Recurrence | LTI difference equation |
| Convolution (image filter) | Convolution (LTI system) |
| FFT | DCT (JPEG) |
| Markov chain | Discrete-time LTI system |
| PageRank | Steady-state of a Markov chain |
| Hill climbing | MPPT (solar) |
| LQR (optimal control) | MDP |
| Backpropagation | Adjoint sensitivity in circuits |
| Pipelined CPU | Pipelined digital design |
| Critical-path analysis (STA) | Longest path in DAG |

Once you see the mapping, you learn EE 3–5× faster than a freshman would. Every module opens with a yellow **CS BRIDGE** callout that names the mapping.

## Curriculum at a glance

| Phase | Topic | Weeks | Hours | Capstone |
|---|---|---|---|---|
| 0 | Foundations & Math Bridge | 4 | 48 | — |
| 1 | DC Circuit Analysis | 5 | 60 | — |
| 2 | AC Circuit Analysis | 5 | 60 | — |
| 3 | Analog Electronics | 6 | 72 | Audio Power Amp |
| 4 | Digital Logic & Embedded | 6 | 72 | FPGA FSM + STM32 SPI |
| 5 | Signals, Systems & DSP | 7 | 84 | Real-Time Audio EQ |
| 6 | Control Systems & Robotics | 6 | 72 | Line-Following Robot |
| 7 | Power Electronics & Machines | 7 | 84 | FOC BLDC Driver |
| 8 | EM Fields, RF & Communications | 6 | 72 | FM Transmitter + SDR |
| 9 | VLSI & IC Design | 5 | 60 | Pipelined Adder + NAND layout |
| 10 | Power Systems, Energy & Capstones | 8 | 120 | Pick 1–2 of 6 capstones |
| **Total** | | **65** | **~804** | |

Six Phase-10 capstones to pick from: (1) FOC Motor Controller, (2) Solar MPPT Inverter, (3) Custom PCB Product, (4) Robotics Platform with SLAM, (5) Smart Grid Demo, (6) SDR/RF Receiver.

## Repository layout

```
ee-curriculum/
├── src/                                # Next.js 16 app
│   ├── app/                            # App Router (layout, page, globals)
│   ├── components/
│   │   ├── ui/                         # shadcn/ui (50+ components, preinstalled)
│   │   └── curriculum/                 # Curriculum-specific components
│   │       ├── Header.tsx              # Sticky nav (Dashboard/Curriculum/Projects/Checkpoints)
│   │       ├── Footer.tsx              # Brand + PDF download + GitHub
│   │       ├── DashboardView.tsx       # KPIs + per-phase hours + progress
│   │       ├── CurriculumView.tsx      # 11 phase cards → modules → lessons
│   │       ├── PhaseCard.tsx
│   │       ├── ModuleAccordion.tsx
│   │       ├── LessonDrawer.tsx        # Right-side Sheet with lesson detail
│   │       ├── PythonPlayground.tsx    # Pyodide-loaded interactive runner
│   │       ├── playground-snippets.ts  # 14 pre-built Python demos
│   │       ├── ProjectsView.tsx        # 52 projects, filterable
│   │       ├── ProjectCard.tsx
│   │       ├── CheckpointsView.tsx     # 146 self-test flashcards
│   │       └── ...
│   ├── hooks/useProgress.tsx           # localStorage-backed progress
│   └── lib/curriculum.ts               # Source of truth: 11 phases × 91 modules × 140 lessons
│
├── scripts/                            # PDF generation (Python + ReportLab + Playwright)
│   ├── ee_curriculum_part1_setup.py    # Fonts, palette, styles, cover HTML
│   ├── ee_curriculum_part2_phase0.py   # Front matter + Phase 0
│   ├── ee_curriculum_part3_phases1to3.py
│   ├── ee_curriculum_part4_phases4to6.py
│   ├── ee_curriculum_part5_phases7to10.py
│   └── ee_curriculum_build.py          # Master build script
│
├── public/download/                    # Pre-built PDF for in-browser download
│   └── EE_Curriculum_for_Computer_Scientists.pdf
│
├── download/                           # Same PDF (canonical output location)
│   └── EE_Curriculum_for_Computer_Scientists.pdf
│
├── research/
│   └── EE_INTERACTIVE_FEATURES_RECOMMENDATION.md   # Roadmap for future features
│
├── DEPLOY.md                           # How to deploy to Vercel/Netlify/Cloudflare Pages
├── LICENSE                             # MIT
├── package.json
└── README.md                           # This file
```

## Quick start (local dev)

### Prerequisites

- Node.js 20+ and [bun](https://bun.sh) (or npm/pnpm/yarn — bun is fastest)
- Python 3.11+ (only if you want to regenerate the PDF)
- ~600 MB free disk space (Pyodide loads lazily on first playground open)

### Install & run

```bash
# 1. Install dependencies
bun install

# 2. Start the dev server
bun run dev

# 3. Open http://localhost:3000
```

The site loads instantly. Click any lesson marked with a **playground** badge (e.g., Phase 5 Module 3 — Fourier Series) to open the in-browser Python runner. First playground load downloads Pyodide (~10 MB, ~20–30 s); subsequent runs in the same session are instant.

### Regenerate the PDF (optional)

The PDF ships pre-built at `download/EE_Curriculum_for_Computer_Scientists.pdf`. To regenerate after editing curriculum content:

```bash
# Python deps (one-time)
pip install reportlab pypdf pypdfium2

# Playwright for cover rendering (one-time)
npx playwright install chromium

# Rebuild
python3 scripts/ee_curriculum_build.py
```

Output: `download/EE_Curriculum_for_Computer_Scientists.pdf` (~97 pages, ~680 KB). Copy to `public/download/` for in-browser serving:

```bash
cp download/EE_Curriculum_for_Computer_Scientists.pdf public/download/
```

## How to use the curriculum

### If you're a learner

1. **Start with Phase 0.** It patches the math (calculus, ODEs, linear algebra, complex analysis) and installs the entire toolchain (LTspice, KiCad, Arduino, ESP32, STM32, Python, Vivado, Magic, GNU Radio). Don't skip it.
2. **Read the PDF alongside the website.** The PDF has the deep content; the website has the interactive demos and progress tracking.
3. **Do every checkpoint before advancing.** They're open-ended self-test questions — if you can't answer them cold, you don't yet own the material.
4. **Pick a Phase-10 capstone early.** It shapes which phases you go deepest on.
5. **Budget 12 hours/week.** At that pace, you finish in 12 months. At 10 h/week, plan for 15–16 months.

### If you're a contributor

- The curriculum data is the single source of truth at `src/lib/curriculum.ts`. The website reads from it; the PDF generation scripts read from `scripts/ee_curriculum_part*.py` (currently a parallel source — eventual goal is to share one source via codegen).
- To add a lesson: add a `Lesson` object to the right `Module` in `src/lib/curriculum.ts`. The website picks it up automatically. To reflect in the PDF, mirror the content in the corresponding `scripts/ee_curriculum_part*.py` file.
- To add an interactive playground: add `has_playground: true` to the lesson, then add a starter snippet to `src/components/curriculum/playground-snippets.ts` keyed by lesson ID.
- To add a new phase: append a `Phase` object to `CURRICULUM` in `src/lib/curriculum.ts`. Update `CURRICULUM_STATS` (auto-computed).

See `research/EE_INTERACTIVE_FEATURES_RECOMMENDATION.md` for the planned roadmap of additional interactive features (in-browser SPICE via `eecircuit-engine`, Verilog via `@yowasp/yosys`, Falstad circuit sims, WebSerial for real-hardware integration, etc.).

## Deploy

This is a standard Next.js 16 app — deploys to any Node-capable host. See **[DEPLOY.md](./DEPLOY.md)** for step-by-step instructions for Vercel, Netlify, Cloudflare Pages, and self-hosted Docker.

The fastest path: push to GitHub → import to Vercel → done. No environment variables required (all progress is browser-local; no backend).

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York style) |
| Design system | v3 — x.ai/grok inspired, dark mode default, `#0a0a0a` canvas, `#7FFF9F` phosphor grass accent |
| Fonts | Inter (body), JetBrains Mono (labels/code), Source Serif 4 italic (accent), Press Start 2P (pixel phase numbers) |
| Icons | lucide-react |
| State | React Context + localStorage (no backend) |
| Theme | next-themes (dark mode default) |
| In-browser Python | Pyodide v0.26.2 (loaded from jsDelivr CDN, lazy) |
| Math rendering | KaTeX + react-katex |
| Interactive plots | Plotly.js (Bode plots, SPICE waveforms, lazy-loaded) |
| Lightweight SPICE | `spicey` (pure-JS, instant-load, simple circuits) |
| Heavy SPICE | `eecircuit-engine` (ngspice 46 WASM, 5.7 MB, transistor models) |
| Verilog HDL | `@yowasp/yosys` (Yosys WASM, ~12 MB) + `digitaljs` (gate-level visualization) |
| Circuit sim (visual) | Falstad/CircuitJS1 iframe |
| Schematic viewer | KiCanvas iframe (KiCad `.kicad_sch` files) |
| Timing diagrams | WaveDrom |
| SDR spectrograms | IQEngine iframe (SigMF recordings) |
| Signal generation + scope | Web Audio API (browser-native, zero bundle) |
| Real hardware | WebSerial API (Chrome/Edge) |
| PDF generation | ReportLab + Playwright (cover HTML → PDF) + pypdf (merge) |
| Package manager | bun (preferred) — npm/pnpm/yarn also work |

## Roadmap

This is a living project. v3.0 shipped a complete redesign (x.ai/grok-inspired design system + voxel motif cover) plus 11 interactive features and 43 expanded lessons. Future work:

**Done (v3.0)**
- [x] **v3 design system** — x.ai/grok-inspired: Inter + JetBrains Mono + Source Serif 4 + Press Start 2P fonts, `#0a0a0a` canvas, `#7FFF9F` phosphor grass accent, dark mode default, voxel-grid texture
- [x] **Voxel motif PDF cover** — half-wave rectifier schematic as 16×8 pixel blocks, "by svx · Sribatsha dash" subtle attribution
- [x] **"by svx" branding** — subtle colophon-style attribution everywhere, GitHub handle stays `srivtx`
- [x] **Interactive features integrated into curriculum** — feature badges on lesson rows, filter chips in curriculum view, jump-list in lesson drawer, stats card in dashboard
- [x] **43 lessons expanded** — Phases 6, 7, 8, 9, 10 summaries and takeaways deepened with concrete examples and numbers
- [x] KaTeX math rendering, interactive Bode plots, Falstad embed, WaveDrom, spicey SPICE, heavy SPICE (ngspice WASM), Verilog (Yosys WASM), KiCanvas, Web Audio scope, IQEngine SDR, WebSerial

**Tier 2 — nice-to-have (v3.1 target)**
- [ ] `@tscircuit/schematic-viewer` for JSX-based circuit snippets
- [ ] Web Bluetooth for BLE devices (in addition to WebSerial)
- [ ] Self-hosted CircuitJS1 build (currently iframed from falstad.com)
- [ ] Web Worker isolation for long-running SPICE sims (currently main-thread)
- [ ] Expand Phases 0-5 lesson content to match the depth of Phases 6-10

**Tier 3 — aspirational**
- [ ] QEMU-WASM for full MCU simulation in browser
- [ ] Full FPGA bitstream flow with `@yowasp/nextpnr`
- [ ] Server-side progress sync (currently localStorage only)
- [ ] Multi-user classrooms with shared progress

See the research doc for verified bundle sizes, licenses, integration snippets, and a 4-week implementation plan.

## Contributing

Contributions are welcome. The curriculum is opinionated but not dogmatic — if you find an error, a clearer explanation, a missing concept, or a better project, please open an issue or PR.

Areas where help is especially welcome:
- **Proof-reading** the PDF for technical errors
- **Translating** the curriculum to other languages (Hindi, Mandarin, Spanish, French)
- **Building** the Tier 1 interactive features above
- **Adding** more hands-on projects (especially for under-represented subfields like biomedical EE, audio electronics, EV powertrains)
- **Recording** video walkthroughs of capstone builds

## License

MIT — see [LICENSE](./LICENSE). The curriculum content, code, and PDF are all open. Use them, fork them, teach with them, ship with them. Attribution to **srivtx** is appreciated but not required.

## Acknowledgments

- The **Pyodide** team for making Python-in-browser possible
- The **ReportLab** and **Playwright** projects for PDF generation
- The **shadcn/ui** team for the component system
- The **Next.js** team for the framework
- Every EE textbook author whose work I stood on — Sedra/Smith, Horowitz/Hill, Oppenheim/Willsky, Nilsson/Riedel, Mohan/Undeland/Robbins, Razavi, Baker, Grainger/Stevenson

## Connect

- **Author:** [svx](https://github.com/srivtx) (Sribatsha dash)
- **Repository:** [github.com/srivtx/ee-curriculum](https://github.com/srivtx/ee-curriculum)
- **Issues:** [github.com/srivtx/ee-curriculum/issues](https://github.com/srivtx/ee-curriculum/issues)
- **Design system:** [`research/DESIGN_SYSTEM_v3.md`](./research/DESIGN_SYSTEM_v3.md) — full spec with hex codes, font tokens, component specs

---

*If this curriculum helped you, star the repo. It helps other CS engineers find it.*
