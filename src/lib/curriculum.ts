// EE Curriculum Data — mirrors the PDF curriculum.
// 10 phases × ~6 modules × ~5 lessons = ~300 lessons.
// Used by the website to render the curriculum browser, lesson viewer,
// project tracker, and progress dashboard.

export type Difficulty = 'Foundation' | 'Intermediate' | 'Advanced';
export type LessonType = 'reading' | 'exercise' | 'project' | 'quiz';

export interface LessonFormula {
  label?: string;
  latex: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration_min: number;
  summary: string;
  key_takeaways: string[];
  cs_bridge?: string;
  has_playground?: boolean;  // Python (Pyodide) interactive demo available
  has_circuit?: boolean;     // Circuit visualization available
  // ── Tier 1 interactive features (v2.1+) ──────────────────────────────
  formulas?: LessonFormula[];      // KaTeX-rendered key equations
  falstad_url?: string;            // Falstad/CircuitJS1 embed URL (full, with ?cct=…)
  has_bode?: boolean;              // Show the interactive Bode plot playground
  has_spice?: boolean;              // Show the SPICE playground (even without a preset netlist)
  wavedrom?: string;               // WaveJSON source (JSON5-style; signal: [...])
  bode?: {                         // Interactive Bode plot playground
    numerator: number[];           // s-polynomial coeffs, descending: [b_n, ..., b_0]
    denominator: number[];         // a_n, ..., a_0
    /** Friendly preset label shown above the plot */
    label?: string;
    /** Optional human-readable description of what to look at */
    note?: string;
  };
  spice_netlist?: string;          // Pre-filled SPICE netlist for SpicePlayground
  has_heavy_spice?: boolean;       // Show the Heavy SPICE (ngspice WASM) playground
  heavy_spice_starter?: string;    // Pre-filled netlist for HeavySpicePlayground (needs real semiconductor models)
  verilog?: boolean;               // Show the Verilog (Yosys) playground (legacy flag)
  has_verilog?: boolean;            // Show the Verilog HDL playground (Yosys WASM + digitaljs)
  verilog_starter?: string;         // Pre-filled Verilog source for VerilogPlayground
  kicanvas_url?: string;           // KiCanvas iframe src for KiCad schematics
  has_scope?: boolean;              // Show the Web Audio oscilloscope + FFT spectrum
  iqengine_url?: string;           // Optional SigMF recording URL for IQEngine embed (empty string = homepage)
  // ── Tier 1 interactive features (v2.2 — 3D + Wokwi) ───────────────────
  wokwi_url?: string;              // Wokwi project URL for live Arduino/ESP32 simulation embed
  has_wokwi_elements?: boolean;    // Show the interactive Wokwi LED + pushbutton demo
  has_3d_model?: boolean;          // Show the procedural 3D component viewer (React Three Fiber)
  model_component?:                // Which 3D model to render (resistor, capacitor, …)
    | 'resistor'
    | 'capacitor'
    | 'inductor'
    | 'led'
    | 'transistor'
    | 'diode'
    | 'ic'
    | 'breadboard';
  // ── Tier 1 interactive feature (v2.3 — virtual breadboard) ────────────
  has_breadboard?: boolean;        // Show the 3D virtual breadboard (drag, place, wire, light up)
  // ── Tier 1 interactive features (v2.4 — tscircuit + CircuitVerse) ─────
  has_tscircuit?: boolean;         // Show the tscircuit viewer (schematic + PCB + 3D board tabs)
  tscircuit_code?: string;         // Pre-filled tscircuit React source for TscircuitViewer
  circuitverse_url?: string;       // CircuitVerse embed URL for digital logic simulation
}

export interface Project {
  id: string;
  title: string;
  goal: string;
  tools: string[];
  steps: string[];
  pass_criteria: string;
  difficulty: Difficulty;
  estimated_hours: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  difficulty: Difficulty;
  lessons: Lesson[];
  projects: Project[];
  checkpoints: string[];
  cs_bridge?: string;
}

export interface Phase {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  description: string;
  duration_weeks: number;
  color: string;       // accent color for this phase
  goal: string;
  modules: Module[];
}

export const CURRICULUM: Phase[] = [
  // ════════════════════════════════════════════════════════════════════
  // PHASE 0 — FOUNDATIONS & MATH BRIDGE
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'p0',
    index: 0,
    title: 'Foundations & Math Bridge',
    subtitle: 'Patch the math, install the tools',
    description: 'Rebuild fluency in calculus, ODEs, linear algebra, and complex analysis in the form an EE textbook uses. Install the entire toolchain (LTspice, KiCad, Arduino, ESP32, STM32, Python, Vivado) and verify each with a hello-world. Build the CS↔EE concept bridge you will walk across for the next 11 months.',
    duration_weeks: 4,
    color: '#5a6166',
    goal: 'Be ready to start Phase 1 with a working toolchain and the math fluency EE requires.',
    modules: [
      {
        id: 'p0m1',
        title: 'Math Bootcamp for EE',
        description: 'Calculus, ODEs, linear algebra, complex analysis, probability — the math EE textbooks assume you know cold.',
        duration_hours: 8,
        difficulty: 'Foundation',
        cs_bridge: 'Linear dynamical systems ↔ linear recurrences. The ODE y"+3y\'+2y=u(t) and the recurrence y[n]=a·y[n−1]+b·u[n] are the same object in different domains. Eigenvalues of the system matrix are the poles of the transfer function; stability means poles in the left half plane (continuous) or inside the unit circle (discrete).',
        lessons: [
          { id: 'p0m1l1', title: 'Calculus refresher: derivatives, integrals, chain rule', type: 'reading', duration_min: 60, summary: 'Re-derive the capacitor and inductor constitutive laws (i=C·dv/dt, v=L·di/dt) from first principles. Practice u-substitution and integration by parts on EE-relevant integrals.', key_takeaways: ['i=C·dv/dt and v=L·di/dt are the entire reason calculus matters in EE', 'Capacitor voltage is the integral of current: v(t)=(1/C)·∫i(τ)dτ', 'Inductor current is the integral of voltage: i(t)=(1/L)·∫v(τ)dτ'] },
          { id: 'p0m1l2', title: 'Differential equations: 1st and 2nd order linear ODEs', type: 'reading', duration_min: 90, summary: 'An RLC circuit is a 2nd-order linear ODE. The characteristic equation s²+2ζω_n·s+ω_n²=0 has roots that classify the response (overdamped, critically damped, underdamped). Practice deriving and solving.', key_takeaways: ['s²+2ζω_n·s+ω_n²=0 is the canonical form', 'ζ>1 overdamped, ζ=1 critically damped, 0<ζ<1 underdamped, ζ=0 pure oscillation', 'Negative ζ means unstable — response grows without bound'], formulas: [{ label: 'Characteristic equation', latex: 's^2 + 2\\zeta\\omega_n s + \\omega_n^2 = 0' }, { label: 'Roots', latex: 's_{1,2} = -\\zeta\\omega_n \\pm \\omega_n\\sqrt{\\zeta^2-1}' }, { label: 'Damping ratio (series RLC)', latex: '\\zeta = \\dfrac{R}{2}\\sqrt{\\dfrac{C}{L}}' }], bode: { numerator: [1], denominator: [1, 1, 1], label: '2nd-order low-pass: ωₙ=1 rad/s, ζ=0.5', note: 'Vary ζ below 1 to see the resonant peak grow; above 1 to see two real poles.' } },
          { id: 'p0m1l3', title: 'Linear algebra: eigenvalues, eigenvectors, subspaces', type: 'reading', duration_min: 90, summary: 'The four fundamental subspaces. Eigenvalues as natural modes. Matrix exponential e^(At) for state-space. Condition number for numerical stability.', key_takeaways: ['Eigenvalues of the system matrix A are the natural modes', 'Modified Nodal Analysis (SPICE) is a graph-theoretic linear system', 'Condition number matters for stiff circuits'] },
          { id: 'p0m1l4', title: 'Complex analysis: Euler, phasors, Laplace intuition', type: 'reading', duration_min: 75, summary: 'Euler’s identity e^(jθ)=cos θ+j·sin θ is the bridge between trig and exponentials. Polar form z=|z|·e^(jφ) is the natural representation for AC. Differentiation → multiplication by s; integration → division by s.', key_takeaways: ['e^(jθ)=cos θ+j·sin θ — the most important identity in EE', 'Polar form is for multiplication/division; Cartesian is for addition', 'Sinusoids are eigenfunctions of LTI systems — frequency response is a single complex number'], has_playground: true },
          { id: 'p0m1l5', title: 'Probability: just enough for DSP and comms', type: 'reading', duration_min: 60, summary: 'Random variables, PDF/CDF, expectation, variance, Gaussian, central limit theorem, basic Bayes. We will deepen this in Phases 5 and 8.', key_takeaways: ['Gaussian distribution underpins noise modeling in DSP and comms', 'Central limit theorem justifies Gaussian approximation for noise', 'Bayes’ rule is the foundation of estimation theory'] },
        ],
        projects: [
          { id: 'p0m1pr1', title: 'Math Bootcamp Self-Test', goal: 'Verify you can do the math the rest of the curriculum assumes.', tools: ['paper', 'pencil', 'calculator'], steps: ['Solve y"+4y\'+4y=0 with y(0)=1, y\'(0)=0. Classify and sketch.', 'Find eigenvalues of A=[[0,1],[-2,-3]]. What is the natural mode?', 'Convert v(t)=5·cos(100t−30°) to a phasor; compute v(t)+3·sin(100t).', 'Compute the Laplace transform of e^(−2t)·u(t). Pole?', 'A 10 μF cap has i(t)=5·sin(1000t) mA. Find v(t) assuming v(0)=0.'], pass_criteria: '4 of 5 correct. Below — repeat the relevant lesson.', difficulty: 'Foundation', estimated_hours: 1.5 },
        ],
        checkpoints: [
          'What does dv/dt physically represent for a capacitor?',
          'Classify a 2nd-order system given ζ and ω_n.',
          'Why is polar form more convenient than Cartesian for AC multiplication?',
          'Convert y[n]=0.5·y[n−1]+u[n] to the Z-domain. Stable?',
        ],
      },
      {
        id: 'p0m2',
        title: 'Physics for EE: Fields, Charges, Magnets',
        description: 'Electrostatics, magnetostatics, Maxwell’s equations — the source code of EE.',
        duration_hours: 7,
        difficulty: 'Foundation',
        cs_bridge: 'Field ↔ distributed hash. A scalar field φ(x,y,z) is a function from 3D space to a number — exactly like a 3D array indexed by coordinates. A vector field E(x,y,z) is a function from 3D space to a vector. Maxwell’s equations are differential operators (grad, div, curl) applied to these fields.',
        lessons: [
          { id: 'p0m2l1', title: 'Electrostatics: charge, field, potential', type: 'reading', duration_min: 75, summary: 'Voltage is the line integral of the electric field. E=−∇φ. F=QE. W=QV. P=VI. These five equations are the entire vocabulary of circuit analysis.', key_takeaways: ['E=−∇φ (field is the gradient of potential)', 'V_AB = −∫A→B E·dl', 'P=VI is energy per unit time'] },
          { id: 'p0m2l2', title: 'Magnetostatics: Biot-Savart, Ampère, inductance', type: 'reading', duration_min: 75, summary: 'Current produces magnetic field. Coils concentrate flux. Faraday’s law gives v=dλ/dt=L·di/dt — the inductor constitutive law.', key_takeaways: ['A current-carrying wire produces a circling B field', 'Flux linkage λ=N·Φ=L·I defines inductance', 'Faraday’s law: v=dλ/dt=L·di/dt'] },
          { id: 'p0m2l3', title: 'Maxwell’s equations: the source code of EE', type: 'reading', duration_min: 90, summary: 'Four PDEs that govern all classical electromagnetism. From them derive Ohm, KCL, KVL, the wave equation, and the lumped-circuit approximation.', key_takeaways: ['Gauss E: ∇·E=ρ/ε₀ (charge creates field)', 'Gauss B: ∇·B=0 (no monopoles)', 'Faraday: ∇×E=−∂B/∂t (induction)', 'Ampère-Maxwell: ∇×B=μ₀J+μ₀ε₀∂E/∂t'] },
        ],
        projects: [
          { id: 'p0m2pr1', title: 'Maxwell to Circuits Derivation', goal: 'See how KCL, KVL, and Ohm’s law fall out of Maxwell.', tools: ['paper', 'pencil'], steps: ['Derive KCL from ∇·J+∂ρ/∂t=0', 'Derive KVL from ∮E·dl=−dΦ/dt in the limit Φ→0', 'Derive Ohm’s law J=σE from a Drude-model argument'], pass_criteria: 'Write out the three derivations cleanly, in your own words.', difficulty: 'Foundation', estimated_hours: 2 },
        ],
        checkpoints: [
          'What does the line integral of E between two points give you?',
          'Why does a transformer only work with AC?',
          'State each of Maxwell’s four equations in words.',
          'Why is the lumped-circuit approximation valid at 60 Hz on a 10 cm board?',
        ],
      },
      {
        id: 'p0m3',
        title: 'The CS-to-EE Bridge',
        description: 'A dense, side-by-side mapping of CS concepts to EE concepts. Refer back throughout the curriculum.',
        duration_hours: 5,
        difficulty: 'Foundation',
        cs_bridge: 'FSM ↔ sequential circuit. FFT ↔ DCT. State-space ↔ linear dynamical system. Recursion ↔ RLC transient. Pipelining ↔ CPU pipeline. This is the master mapping — every module\'s CS BRIDGE callout points back to one of these.',
        lessons: [
          { id: 'p0m3l1', title: 'The master CS↔EE concept map', type: 'reading', duration_min: 90, summary: '16 mappings: FSM↔sequential, recurrence↔difference equation, Markov chain↔LTI, convolution↔filter, DCT↔FFT, DAG↔signal-flow graph, hash↔modulation, ECC↔channel coding, pipelined CPU↔pipelined design, STA↔longest path, MDP↔LQR, hill climbing↔MPPT, PID↔gradient descent, PageRank↔Markov steady-state, backprop↔adjoint sensitivity.', key_takeaways: ['Every EE concept has a CS twin you already know', 'Use the bridge to learn fast; drop it when the analogy creaks', 'The bridge is a learning aid, not a substitute'] },
          { id: 'p0m3l2', title: 'Where the bridge breaks', type: 'reading', duration_min: 60, summary: 'Every analogy has limits. A CS FSM is discrete and synchronous; a physical sequential circuit has setup/hold, metastability, clock skew. Know when to drop the analogy.', key_takeaways: ['CS abstractions hide timing — physical circuits enforce it', 'Metastability is unavoidable in clock-domain crossings', 'Use two-flop synchronizers to mitigate metastability'] },
        ],
        projects: [
          { id: 'p0m3pr1', title: 'Build Your Own Bridge', goal: 'Practice mapping CS concepts to EE twins.', tools: ['paper', 'pencil'], steps: ['Pick 3 CS concepts you use weekly (e.g., red-black trees, memoization, async/await)', 'Write one paragraph each mapping them to an EE analog', 'Show your paragraphs to another CS engineer — can they follow?'], pass_criteria: 'Your three paragraphs are concrete enough that another CS engineer could follow the analogy.', difficulty: 'Foundation', estimated_hours: 1.5 },
        ],
        checkpoints: [
          'Name three CS concepts that map onto the same EE concept.',
          'Where does the FSM↔sequential-circuit analogy break?',
          'Why is a convolutional image filter literally the same code as a 1D FIR filter?',
          'How does PageRank connect to natural modes of a circuit?',
        ],
      },
      {
        id: 'p0m4',
        title: 'Toolchain Setup & Hello-Worlds',
        description: 'Install every tool now, so no later phase is held up by an installer. 10 software tools + 4 bench exercises.',
        duration_hours: 7,
        difficulty: 'Foundation',
        lessons: [
          { id: 'p0m4l1', title: 'LTspice + KiCad: SPICE sim + PCB design', type: 'exercise', duration_min: 60, summary: 'Install LTspice and KiCad. Hello-worlds: RC low-pass transient sim; same RC as schematic + ERC + netlist export.', key_takeaways: ['LTspice is the analog SPICE simulator of record', 'KiCad handles schematic → PCB → manufacturing files'], kicanvas_url: 'https://raw.githubusercontent.com/wntrblm/Guava/main/bom/test.kicad_sch', has_3d_model: true, model_component: 'breadboard', has_breadboard: true },
          { id: 'p0m4l2', title: 'Arduino + ESP32 + STM32: three MCU families', type: 'exercise', duration_min: 90, summary: 'Arduino Uno (intro), ESP32 devkit (wireless), STM32 Nucleo (real MCU). Hello-worlds: blink, WiFi hello, GPIO toggle.', key_takeaways: ['Arduino abstracts away register-level details', 'ESP32 adds WiFi/BLE and FreeRTOS', 'STM32 is closer to bare-metal embedded Linux'] },
          { id: 'p0m4l3', title: 'Python (NumPy/SciPy) + Octave: math tools', type: 'exercise', duration_min: 60, summary: 'Python with NumPy/SciPy/matplotlib/control. Octave as MATLAB clone. Hello-worlds: sine + FFT plot; solve linear system.', key_takeaways: ['Python leverages your CS skills for DSP/control/analysis', 'Octave gives MATLAB compatibility for EE literature'] },
          { id: 'p0m4l4', title: 'Vivado + Magic + GNU Radio: FPGA, VLSI, SDR', type: 'exercise', duration_min: 90, summary: 'Vivado WebPACK (FPGA), Magic VLSI (IC layout), GNU Radio (SDR). Hello-worlds: 4-bit counter synth; NMOS layout+DRC; source→LP→sink flowgraph.', key_takeaways: ['Vivado WebPACK is free for Artix-7', 'Magic is the open-source VLSI layout editor', 'GNU Radio is the SDR visual programming environment'] },
        ],
        projects: [
          { id: 'p0m4pr1', title: 'Toolchain Sign-Off', goal: 'Every tool installed and verified before Phase 1 begins.', tools: ['all 10 software tools', 'starter hardware kit'], steps: ['Complete all 10 software hello-worlds in the table', 'Complete 4 bench exercises: DMM measure, voltage divider, LED+resistor, RC time constant', 'Take a screenshot or photo of each success — save in a tools/ folder'], pass_criteria: 'All 14 checks pass. Any failure → debug before proceeding.', difficulty: 'Foundation', estimated_hours: 3 },
        ],
        checkpoints: [
          'Did every hello-world run successfully? If not, what was the fix?',
          'What is the time constant of an RC circuit and how did you measure it?',
          'Why is the LED voltage drop about 2 V regardless of supply?',
          'In your FFT hello-world, what is the relationship between sine frequency, sample rate, and FFT bin?',
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // PHASE 1 — DC CIRCUIT ANALYSIS
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'p1',
    index: 1,
    title: 'DC Circuit Analysis',
    subtitle: 'Ohm, Kirchhoff, Thevenin, transients',
    description: 'The foundation of all EE. Master the analytical machinery of DC circuits — Ohm’s law, Kirchhoff’s laws, nodal/mesh analysis, Thevenin/Norton, superposition, and the transient behavior of capacitors and inductors.',
    duration_weeks: 5,
    color: '#1f6c92',
    goal: 'Solve any linear DC circuit by hand and by SPICE, and understand the transient response of energy-storage elements.',
    modules: [
      {
        id: 'p1m1', title: 'Charge, Current, Voltage, Power, Energy', description: 'The five quantities of circuit analysis and their units. Passive sign convention. Tellegen’s theorem (energy conservation).',
        duration_hours: 5, difficulty: 'Foundation',
        cs_bridge: 'Charge ↔ packet, current ↔ packet rate, voltage ↔ pressure, power ↔ rate of energy delivery, energy ↔ total work. Same vocabulary as network engineering — just different units.',
        lessons: [
          { id: 'p1m1l1', title: 'The five quantities and their units', type: 'reading', duration_min: 45, summary: 'Q (C), I (A=C/s), V (V=J/C), P (W=J/s=VA), W (J=Ws). The entire vocabulary of circuit analysis.', key_takeaways: ['Memorize units cold: C, A, V, W, J', 'Power is the rate of energy delivery', 'Energy is the integral of power over time'], formulas: [{ label: 'Ohm\u2019s law', latex: 'V = I\\,R' }, { label: 'Power (three forms)', latex: 'P = V\\,I = I^{2}R = \\dfrac{V^{2}}{R}' }] , has_3d_model: true, model_component: 'resistor', has_breadboard: true },
          { id: 'p1m1l2', title: 'Passive sign convention and reference directions', type: 'reading', duration_min: 60, summary: 'For any device, label + and − terminals. Current enters +. Then p=v·i is power absorbed. Negative p means the device delivers power. Reference directions are arbitrary; the math corrects you.', key_takeaways: ['Reference directions are guesses; the math corrects you', 'p>0 means absorbing, p<0 means delivering', 'Sum of p over all elements = 0 (Tellegen)'] },
          { id: 'p1m1l3', title: 'Energy storage in caps and inductors', type: 'reading', duration_min: 45, summary: 'W_C=½CV², W_L=½LI². These storage terms are the bridge to transient analysis in Module 1.6.', key_takeaways: ['Capacitor stores energy in electric field', 'Inductor stores energy in magnetic field', 'Both storage terms are quadratic in the state variable'] },
        ],
        projects: [
          { id: 'p1m1pr1', title: 'Bench: Measure Power in a 3-Resistor Circuit', goal: 'Verify power conservation by direct measurement.', tools: ['DMM', 'breadboard', 'resistors', '5V supply'], steps: ['Build: 5V→220Ω→330Ω→470Ω→GND series string', 'Measure V and I for each resistor', 'Compute P=VI for each; sum', 'Compute V_supply·I_total', 'Compare the two totals'], pass_criteria: 'The two totals agree within DMM tolerance (≤2% error).', difficulty: 'Foundation', estimated_hours: 1 },
        ],
        checkpoints: [
          'Define charge, current, voltage, power, energy. Give SI units.',
          'State the passive sign convention. What does p>0 mean?',
          'How much energy is stored in a 100 μF cap at 12 V? In a 10 mH inductor at 2 A?',
          'Why is the sum of powers in any circuit exactly zero?',
        ],
      },
      {
        id: 'p1m2', title: 'Ohm’s Law and Kirchhoff’s Laws', description: 'V=IR. KCL: sum of currents into a node is zero. KVL: sum of voltages around a loop is zero. These three plus constitutive laws close the system.',
        duration_hours: 7, difficulty: 'Foundation',
        cs_bridge: 'KCL ↔ flow conservation at a node in a flow network. KVL ↔ conservative field around a closed loop. The circuit is a graph; nodes have potentials, edges have currents, Kirchhoff plus element laws close the system.',
        lessons: [
          { id: 'p1m2l1', title: 'Ohm’s law: the constitutive relation of a resistor', type: 'reading', duration_min: 45, summary: 'V=IR. Linear, time-invariant, memoryless. Real resistors have tempco (~100 ppm/°C), parasitic L (~nH), parasitic C to ground. Negligible at DC; matters at RF.', key_takeaways: ['V=IR is the constitutive law, not a derived theorem', 'Linear, time-invariant, memoryless', 'Real resistors deviate at high frequency'], formulas: [{ label: 'Ohm’s law', latex: 'V = IR' }, { label: 'Power dissipated', latex: 'P = VI = I^2 R = \\dfrac{V^2}{R}' }, { label: 'Conductance', latex: 'G = \\dfrac{1}{R}' }], falstad_url: 'https://www.falstad.com/circuit/circuitjs.html?cct=$+1+0.000005+10+50+5+43%0Av+80+64+80+192+0+0+40+5+0+0+0.5%0Ar+80+64+240+64+0+100%0Aw+240+64+240+192+0%0Aw+80+192+240+192+0%0Ao+0+64+0+35+20+0.05+0+-1' },
          { id: 'p1m2l2', title: 'KCL: current conservation at a node', type: 'reading', duration_min: 60, summary: 'Algebraic sum of currents at a node is zero. n nodes give n−1 independent equations (the last is dependent — sum of all is zero). The missing equation is the ground reference.', key_takeaways: ['n nodes → n−1 independent KCL equations', 'The constant-potential null vector is why you need a ground', 'KCL derives from charge conservation (continuity equation)'] },
          { id: 'p1m2l3', title: 'KVL: voltage conservation around a loop', type: 'reading', duration_min: 60, summary: 'Sum of voltages around any closed loop is zero. The number of independent loops is b−n+1 (cycle rank of the graph).', key_takeaways: ['KVL derives from Faraday’s law in the no-changing-flux limit', 'Independent loops = b − n + 1 (cycle rank)', 'KVL is the discrete analog of ∮E·dl=0'] },
          { id: 'p1m2l4', title: 'Solving circuits systematically: nodal and mesh analysis', type: 'reading', duration_min: 90, summary: 'Nodal: assign node voltages (one is ground), write KCL at each non-ground node, solve linear system. Mesh: assign mesh currents (one per independent loop), write KVL, solve. SPICE uses Modified Nodal Analysis (MNA).', key_takeaways: ['Nodal works for any circuit; mesh only for planar', 'MNA handles voltage sources cleanly via supernodes', 'Practice 10 circuits by hand to build fluency'], has_playground: true, formulas: [{ label: 'KCL at node k', latex: '\\sum_{i} I_i = 0' }, { label: 'Nodal system', latex: 'G \\, \\mathbf{V} = \\mathbf{I}_{\\text{src}}' }], spice_netlist: `* 4-node circuit (nodal analysis)
V1 n1 0 12
R1 n1 nA 1k
R2 nA 0 2k
R3 nA nB 4k
R4 nB 0 1k
.op
.end`, falstad_url: 'https://www.falstad.com/circuit/circuitjs.html?cct=$+1+0.000005+10.20027730826997+50+5+50%0Av+320+96+320+176+0+0+40+5+0+0+0.5%0Ar+320+176+416+176+0+1000%0Ar+416+176+416+256+0+2000%0Ag+416+256+416+288+0%0Ag+320+176+320+208+0%0A', has_breadboard: true },
        ],
        projects: [
          { id: 'p1m2pr1', title: 'LTspice + Bench: 4-Node Network', goal: 'Solve a 4-node circuit three ways — by hand, by LTspice, on the bench — and reconcile all three answers.', tools: ['LTspice', 'breadboard', 'DMM', 'resistors'], steps: ['By hand: nodal analysis of the 4-node circuit (5 min)', 'LTspice: build the same circuit, run .op, record node voltages', 'Bench: build with 5% resistors, measure with DMM', 'Reconcile: explain any discrepancy (5% tolerance should account for most)'], pass_criteria: 'All three answers agree within worst-case tolerance bounds.', difficulty: 'Foundation', estimated_hours: 2 },
        ],
        checkpoints: [
          'State KCL and KVL in your own words. What physical laws are they derived from?',
          'How many independent KCL equations does an n-node circuit have?',
          'Why does nodal analysis need a ground reference?',
          'When is mesh analysis more convenient than nodal?',
        ],
      },
      {
        id: 'p1m3', title: 'Node Voltage & Mesh Current Methods', description: 'Supernodes, supermeshes, dependent sources. Master these three cases and you can solve any linear DC circuit.',
        duration_hours: 7, difficulty: 'Foundation',
        lessons: [
          { id: 'p1m3l1', title: 'Supernodes: voltage source between two non-reference nodes', type: 'reading', duration_min: 60, summary: 'When a voltage source connects two non-reference nodes, the current through it is unknown. Merge into a supernode, write KCL for the supernode, add the constraint Vj−Vk=Vsource.', key_takeaways: ['Supernode = merge two nodes around a voltage source', 'KCL for supernode + constraint equation closes the system', 'Practice on 3-node circuit with 5V source between nodes 2 and 3'] },
          { id: 'p1m3l2', title: 'Supermeshes: current source between two meshes', type: 'reading', duration_min: 60, summary: 'The dual: a current source on the boundary between two meshes has unknown voltage. Merge into a supermesh, write KVL around the perimeter, add constraint Imesh2−Imesh1=Isource.', key_takeaways: ['Supermesh = merge two meshes around a current source', 'KVL around supermesh perimeter + constraint equation'] },
          { id: 'p1m3l3', title: 'Dependent sources: modeling active devices', type: 'reading', duration_min: 60, summary: 'Dependent sources model transistors. Treat as independent in KCL/KVL, then add the dependency constraint (e.g., Vdep=5·Ix). System stays linear; one extra equation per dependent source.', key_takeaways: ['Dependent sources model transistor behavior', 'Add the dependency as an extra equation', 'System stays linear — just larger'] },
        ],
        projects: [
          { id: 'p1m3pr1', title: 'Practice Set: 10 Circuits by Hand', goal: 'Fluency with nodal/mesh on any linear circuit.', tools: ['paper', 'pencil', 'calculator'], steps: ['Solve 10 circuits of increasing difficulty (supernode, supermesh, dependent source, mixed sources)', 'Check each by closing the power balance (sum of element powers = 0)'], pass_criteria: '9 of 10 correct (power balance closes to within rounding).', difficulty: 'Foundation', estimated_hours: 4 },
        ],
        checkpoints: [
          'What is a supernode and when do you need one?',
          'What is a supermesh and when do you need one?',
          'How do you handle a dependent source in nodal analysis?',
          'Solve a circuit with a CCVS using nodal analysis.',
        ],
      },
      {
        id: 'p1m4', title: 'Thevenin & Norton Equivalent Circuits', description: 'Any linear two-terminal circuit can be reduced to V_th in series with R_th (or I_N in parallel with R_N). Maximum power transfer.',
        duration_hours: 6, difficulty: 'Foundation',
        cs_bridge: 'Thevenin ↔ API encapsulation. From outside the load, all that matters is V_th and R_th. Swap the box for any other box with the same V_th and R_th and the load cannot tell. The most useful circuit theorem in practice.',
        lessons: [
          { id: 'p1m4l1', title: 'Thevenin’s and Norton’s theorems', type: 'reading', duration_min: 60, summary: 'Any linear two-terminal network of sources and resistors is equivalent to V_th in series with R_th. Norton is the dual: I_N in parallel with R_N. V_th=I_N·R_th.', key_takeaways: ['Thevenin: V_th series R_th', 'Norton: I_N parallel R_N', 'Source transformation converts between them'] },
          { id: 'p1m4l2', title: 'Two methods for finding V_th and R_th', type: 'reading', duration_min: 60, summary: 'Open/short method: V_th=V_oc, I_N=I_sc, R_th=V_oc/I_sc. Test-source method: kill independent sources, apply V_test, R_th=V_test/I_test. Test-source works with dependent sources.', key_takeaways: ['Open-circuit / short-circuit method: 3 measurements', 'Test-source method: works with dependent sources', 'Both methods give the same R_th'] },
          { id: 'p1m4l3', title: 'Maximum power transfer', type: 'reading', duration_min: 45, summary: 'Load that extracts max power: R_L=R_th. At that match, V_load=V_th/2, P_load=V_th²/(4·R_th). Efficiency is 50%. Used in RF (50Ω); NOT used in power grids (you want efficiency, not max power).', key_takeaways: ['R_L=R_th for max power transfer', 'Efficiency at max power transfer = 50%', 'RF systems impedance-match; power grids do not'] },
        ],
        projects: [
          { id: 'p1m4pr1', title: 'Bench: Thevenize a Real Divider', goal: 'Verify Thevenin equivalence on the bench.', tools: ['breadboard', 'DMM', 'resistors', '12V supply'], steps: ['Build 12V→1kΩ→A→1kΩ→GND divider. V_A open=6V.', 'Compute V_th=6V, R_th=1kΩ∥1kΩ=500Ω', 'Attach loads 100Ω, 500Ω, 1kΩ, 10kΩ. Measure V_A each.', 'Verify V_A = V_th·R_L/(R_th+R_L)', 'Swap divider for 6V source + 500Ω series. Repeat load sweep — should match.'], pass_criteria: 'All 4 load measurements agree between original and Thevenin equivalent within 2%.', difficulty: 'Foundation', estimated_hours: 1.5 },
        ],
        checkpoints: [
          'State Thevenin’s and Norton’s theorems.',
          'Two methods for finding R_th. When prefer test-source?',
          'What is the maximum-power-transfer condition? Why not used in power grids?',
          'Thevenize a voltage divider with a load. Practical implication for sensor readout?',
        ],
      },
      {
        id: 'p1m5', title: 'Superposition & Source Transformation', description: 'Two more circuit-reduction techniques that work only on linear circuits. Linearity is the whole game.',
        duration_hours: 5, difficulty: 'Foundation',
        lessons: [
          { id: 'p1m5l1', title: 'Superposition: sum of responses to each source alone', type: 'reading', duration_min: 60, summary: 'In a circuit with multiple independent sources, the response is the sum of responses to each source acting alone (others killed: V→short, I→open). Works only for linear circuits.', key_takeaways: ['Linear circuits: superposition applies', 'Turn off voltage source = short; current source = open', 'Does NOT work for nonlinear circuits'] },
          { id: 'p1m5l2', title: 'Source transformation: V+R ↔ I∥R', type: 'reading', duration_min: 45, summary: 'Voltage source V in series with R = current source V/R in parallel with R. Useful for simplifying circuits before solving.', key_takeaways: ['Source transformation is a circuit reduction tool', 'Equivalent at the terminals, not inside', 'Combine with Thevenin/Norton for powerful simplification'] },
          { id: 'p1m5l3', title: 'Linearity is the whole game', type: 'reading', duration_min: 45, summary: 'Every theorem in this module depends on linearity. Nonlinear elements (diodes, transistors) break superposition. The fix: linearize around an operating point (small-signal model) — Phase 3.', key_takeaways: ['All circuit theorems assume linearity', 'Small-signal model linearizes nonlinear devices around an operating point', 'Same idea as Newton’s method in optimization'] },
        ],
        projects: [
          { id: 'p1m5pr1', title: 'LTspice: Superposition on a 2-Source Circuit', goal: 'Verify superposition numerically.', tools: ['LTspice'], steps: ['Build circuit with two 5V sources and three resistors', 'Sim with both on: record V_mid', 'Sim with source 2 off (set to 0): record V_mid1', 'Sim with source 1 off: record V_mid2', 'Verify V_mid1 + V_mid2 = V_mid exactly'], pass_criteria: 'Sum matches exactly (within numerical precision).', difficulty: 'Foundation', estimated_hours: 1 },
        ],
        checkpoints: [
          'State superposition. What kind of circuits does it apply to?',
          'How do you "turn off" a voltage source? A current source?',
          'Why does superposition fail for nonlinear circuits?',
          'Demonstrate source transformation on a Thevenin equivalent.',
        ],
      },
      {
        id: 'p1m6', title: 'Capacitors, Inductors & Transient Analysis', description: 'Energy storage elements. First-order RC/RL transients (τ=RC or L/R). Second-order RLC transients (ζ, ω_n, under/over/critical damping).',
        duration_hours: 9, difficulty: 'Intermediate',
        cs_bridge: 'RC transient ↔ exponential decay recursion. The ODE RC·dv/dt+v=V_s has solution v(t)=V_s·(1−e^(−t/RC)). The same exponential decay appears in simulated annealing cooling schedules, Markov chain convergence, and gradient descent on a quadratic. τ=RC is the 1/e time.',
        lessons: [
          { id: 'p1m6l1', title: 'Capacitors and inductors as energy stores', type: 'reading', duration_min: 60, summary: 'W_C=½CV², W_L=½LI². Constitutive laws are differential: i=C·dv/dt, v=L·di/dt. Voltage across cap cannot change instantaneously; current through inductor cannot change instantaneously.', key_takeaways: ['i=C·dv/dt, v=L·di/dt (differential constitutive laws)', 'V_C continuity: cap voltage cannot jump', 'I_L continuity: inductor current cannot jump'] , has_3d_model: true, model_component: 'capacitor'},
          { id: 'p1m6l2', title: 'First-order transients: RC and RL step response', type: 'reading', duration_min: 75, summary: 'RC step: v(t)=V_s·(1−e^(−t/τ)), τ=RC. RL step: i(t)=(V_s/R)·(1−e^(−t/τ)), τ=L/R. After 1τ: 63%. After 5τ: within 1%.', key_takeaways: ['τ=RC for RC, τ=L/R for RL', '63% after one τ, 99% after five τ', 'General form: v(t)=V_f+(V_0−V_f)·e^(−t/τ)'], has_playground: true, formulas: [{ label: 'RC step response', latex: 'v(t) = V_f + (V_0 - V_f)\\,e^{-t/\\tau}' }, { label: 'Time constant', latex: '\\tau = RC' }, { label: '63% / 99% rule', latex: 'v(\\tau) \\approx 0.63\\,V_f, \\quad v(5\\tau) \\approx 0.99\\,V_f' }], spice_netlist: `* RC step response (tau = RC = 1 ms)
V1 in 0 PWL(0 0 1n 5)
R1 in out 1k
C1 out 0 1u
.tran 100u 5m
.print tran v(out)
.end` },
          { id: 'p1m6l3', title: 'Second-order transients: RLC and the three regimes', type: 'reading', duration_min: 90, summary: 'Series RLC: s²+(R/L)·s+1/(LC)=0. ω_n=1/√(LC), ζ=(R/2)·√(C/L). ζ>1 overdamped, ζ=1 critically damped, 0<ζ<1 underdamped (rings).', key_takeaways: ['ω_n=1/√(LC), ζ=(R/2)·√(C/L)', 'Underdamped systems ring at ω_d=ω_n·√(1−ζ²)', 'Critically damped = fastest settling with no overshoot'], has_playground: true, formulas: [{ label: 'Natural frequency', latex: '\\omega_n = \\dfrac{1}{\\sqrt{LC}}' }, { label: 'Damping ratio', latex: '\\zeta = \\dfrac{R}{2}\\sqrt{\\dfrac{C}{L}}' }, { label: 'Damped frequency', latex: '\\omega_d = \\omega_n\\sqrt{1-\\zeta^2}' }], bode: { numerator: [1], denominator: [1, 0.4, 1], label: 'Series RLC Vout across C: ωₙ=1, ζ=0.2 (underdamped)', note: 'The resonant peak near ω=1 rad/s is the same physics as the time-domain ringing.' }, spice_netlist: `* Series RLC transient (underdamped: zeta = 0.158)\
V1 in 0 PWL(0 0 1u 5)\
R1 in out 10\
L1 out mid 1m\
C1 mid 0 1u\
.tran 5u 5m\
.print tran v(in) v(out)\
.end` },
        ],
        projects: [
          { id: 'p1m6pr1', title: 'Bench: Ring an LC Tank', goal: 'See the three damping regimes physically.', tools: ['breadboard', '10mH inductor', '100nF cap', '1kΩ pot', 'scope'], steps: ['Build: 10mH series 100nF series 1kΩ pot', 'Charge cap to 5V, disconnect supply, let tank ring', 'Scope across cap — should see decaying sinusoid', 'Sweep R: start at 0, increase, watch ringing diminish, disappear at critical damping, become slow exponential', 'Compute ζ=(R/2)·√(C/L) and compare to observed behavior'], pass_criteria: 'ω_n=1/√(LC)≈10⁴ rad/s=1.6 kHz matches observed ring frequency.', difficulty: 'Intermediate', estimated_hours: 2.5 },
        ],
        checkpoints: [
          'Why can’t V_C change instantaneously? What about I_L?',
          'What is the time constant of an RC? An RL?',
          'Write the canonical 2nd-order ODE. Define ζ and ω_n.',
          'What R makes a series RLC critically damped for L=10mH, C=100nF?',
          'Sketch underdamped step response. Label rise time, overshoot, settling time.',
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // PHASE 2 — AC CIRCUIT ANALYSIS
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'p2',
    index: 2,
    title: 'AC Circuit Analysis',
    subtitle: 'Phasors, impedance, AC power, resonance',
    description: 'Generalize DC analysis to sinusoidal steady-state via phasors and impedance. Master AC power (real, reactive, apparent, power factor). Meet resonance and three-phase systems.',
    duration_weeks: 5,
    color: '#507aa4',
    goal: 'Solve any AC circuit as easily as a DC one, and design power-factor correction.',
    modules: [
      {
        id: 'p2m1', title: 'Sinusoidal Sources and Phasors', description: 'The phasor transform: a sinusoid at fixed frequency is fully described by amplitude and phase — a single complex number.',
        duration_hours: 6, difficulty: 'Foundation',
        cs_bridge: 'Phasor ↔ hashing a function to a number. A sinusoid has 3 DOF (amplitude, frequency, phase). At fixed frequency, 2 remain (amplitude, phase) — exactly the modulus and argument of a complex number. Lossless hash.',
        lessons: [
          { id: 'p2m1l1', title: 'The phasor transform', type: 'reading', duration_min: 60, summary: 'v(t)=V_m·cos(ωt+φ) ↔ V=V_m·e^(jφ)=V_m∠φ. Drop the e^(jωt) factor common to all signals at ω. Recover: v(t)=Re{V·e^(jωt)}.', key_takeaways: ['Phasor = amplitude + phase as one complex number', 'Frequency is implicit (assume all signals at same ω)', 'Recover time domain: v(t)=Re{V·e^(jωt)}'], formulas: [{ label: 'Time domain', latex: 'v(t) = V_m \\cos(\\omega t + \\phi)' }, { label: 'Phasor (polar)', latex: 'V = V_m\\,e^{j\\phi} = V_m\\angle\\phi' }, { label: 'Recovery', latex: 'v(t) = \\operatorname{Re}\\{V\\,e^{j\\omega t}\\}' }, { label: 'Euler', latex: 'e^{j\\theta} = \\cos\\theta + j\\sin\\theta' }] },
          { id: 'p2m1l2', title: 'Why it works: eigenfunction property', type: 'reading', duration_min: 60, summary: 'Sinusoids are eigenfunctions of LTI systems. Input e^(jωt) → output H(jω)·e^(jωt). The complex scaling H(jω) is the frequency response.', key_takeaways: ['LTI systems preserve sinusoid frequency', 'Output = input scaled by H(jω)', 'Foundation of all frequency-domain analysis'] },
        ],
        projects: [
          { id: 'p2m1pr1', title: 'LTspice: Phasor Addition', goal: 'Verify that adding sinusoids in time = adding phasors.', tools: ['LTspice'], steps: ['Two AC sources in series: v1=5cos(1000t), v2=3cos(1000t+60°)', 'Predict: 5+3∠60° = 7.0∠21.8°', 'Simulate transient, measure amplitude and phase', 'Compare to prediction'], pass_criteria: 'Amplitude within 1% of 7.0V; phase within 1° of 21.8°.', difficulty: 'Foundation', estimated_hours: 1 },
        ],
        checkpoints: [
          'What is a phasor?',
          'Why are sinusoids eigenfunctions of LTI systems?',
          'Convert v(t)=10·sin(100t+30°) to a phasor.',
          'Add 5∠0° and 3∠90° in rectangular and polar form.',
        ],
      },
      {
        id: 'p2m2', title: 'Impedance and Admittance', description: 'Z_R=R, Z_L=jωL, Z_C=1/(jωC). Ohm’s law generalizes to V=I·Z. Series adds Z; parallel adds Y=1/Z.',
        duration_hours: 6, difficulty: 'Foundation',
        lessons: [
          { id: 'p2m2l1', title: 'The three impedances', type: 'reading', duration_min: 60, summary: 'Z_R=R (real), Z_L=jωL (imaginary positive — V leads I by 90°), Z_C=1/(jωC) (imaginary negative — I leads V by 90°).', key_takeaways: ['Resistor: V and I in phase', 'Inductor: V leads I by 90°', 'Capacitor: I leads V by 90°'], formulas: [{ label: 'Resistor', latex: 'Z_R = R' }, { label: 'Inductor', latex: 'Z_L = j\\omega L' }, { label: 'Capacitor', latex: 'Z_C = \\dfrac{1}{j\\omega C} = -\\dfrac{j}{\\omega C}' }], spice_netlist: `* AC sweep of RC low-pass\
* At f_c = 1/(2*pi*R*C) = 159 Hz, |Vout/Vin| = 1/sqrt(2) = -3.01 dB\
V1 in 0 DC 0 AC 1\
R1 in out 1k\
C1 out 0 1u\
.ac dec 50 1 1meg\
.print ac v(out)\
.end` },
          { id: 'p2m2l2', title: 'Series and parallel combinations', type: 'reading', duration_min: 60, summary: 'Series Z adds. Parallel 1/Z adds. Same rules as resistors, just complex arithmetic. Admittance Y=1/Z is more convenient for parallel.', key_takeaways: ['Z_series = Z_1+Z_2+... (complex addition)', '1/Z_parallel = 1/Z_1+1/Z_2+... (complex addition)', 'Z=R+jX (resistance + reactance); Y=G+jB'] },
        ],
        projects: [
          { id: 'p2m2pr1', title: 'LTspice: RC Impedance Sweep', goal: 'Measure impedance of RC parallel across frequency.', tools: ['LTspice'], steps: ['1kΩ ∥ 1μF, 1V AC source', 'Compute Z(jω)=R∥1/(jωC); at ω=1/(RC)=1000 rad/s, Z=R/2=500Ω, −45°', 'Run .ac from 10 Hz to 10 kHz, plot |Z| and ∠Z', 'Verify curves match predicted formula'], pass_criteria: 'Magnitude and phase match predicted formula at 3 marked frequencies.', difficulty: 'Foundation', estimated_hours: 1.5 },
        ],
        checkpoints: [
          'What is Z for a 10 mH inductor at 60 Hz? At 1 MHz?',
          'What is Z for a 1 μF cap at 60 Hz? At 1 MHz?',
          'Combine 1kΩ in series with 0.1μF at 1 kHz. |Z|? ∠Z?',
          'Why does Z_L grow with frequency but Z_C shrink?',
        ],
      },
      {
        id: 'p2m3', title: 'AC Power: Real, Reactive, Apparent, PF', description: 'P=V·I·cos φ (W), Q=V·I·sin φ (VAR), |S|=V·I (VA), PF=cos φ=P/|S|. Power factor correction.',
        duration_hours: 7, difficulty: 'Intermediate',
        cs_bridge: 'Power factor ↔ load matching in distributed systems. PF=1 is resistive (no overhead). PF<1 is reactive (energy sloshes back and forth every cycle, like chatty protocol with high ACK overhead). PFC is adding caps/inductors to bring PF close to 1.',
        lessons: [
          { id: 'p2m3l1', title: 'The three powers and RMS', type: 'reading', duration_min: 75, summary: 'P=V_rms·I_rms·cos φ (real, W). Q=V_rms·I_rms·sin φ (reactive, VAR). |S|=V_rms·I_rms (apparent, VA). S=P+jQ. PF=cos φ. V_rms=V_m/√2 for sine.', key_takeaways: ['Real power P is what you pay for', 'Reactive power Q sloshes back and forth — wires must carry it', 'Apparent power |S| sets wire and transformer sizing', 'PF = P/|S| = cos φ'], formulas: [{ label: 'Real power', latex: 'P = V_{\\text{rms}}\\,I_{\\text{rms}}\\cos\\phi' }, { label: 'Reactive power', latex: 'Q = V_{\\text{rms}}\\,I_{\\text{rms}}\\sin\\phi' }, { label: 'Complex power', latex: 'S = P + jQ, \\quad |S| = V_{\\text{rms}}\\,I_{\\text{rms}}' }, { label: 'Power factor', latex: 'PF = \\cos\\phi = \\dfrac{P}{|S|}' }, { label: 'RMS of sine', latex: 'V_{\\text{rms}} = \\dfrac{V_m}{\\sqrt{2}}' }] },
          { id: 'p2m3l2', title: 'Power factor correction', type: 'reading', duration_min: 60, summary: 'Industrial loads are typically inductive (PF 0.7–0.85 lagging). Add parallel capacitor to cancel Q_load. C=Q/(ω·V²). Brings PF to 1, reduces apparent power the grid must deliver.', key_takeaways: ['PFC cap: C=Q_load/(ω·V²)', 'Cap draws leading current, cancels lagging inductive current', 'Grid bills for P; wires sized for |S|'] },
        ],
        projects: [
          { id: 'p2m3pr1', title: 'LTspice: PF Correction', goal: 'Design PFC cap and verify it brings PF to 1.', tools: ['LTspice'], steps: ['Load: R=23Ω series L=50mH at 230V, 50Hz', 'Compute: Z=23+j·15.7Ω, |Z|=27.9Ω, I=8.24A, φ=34.4°, PF=0.825, P=1563W, Q=1068VAR', 'C = Q/(ω·V²) = 64.3 μF', 'Add cap in parallel, re-sim. Source current should drop to ~6.8A, in phase with voltage.'], pass_criteria: 'Source current in phase with voltage, magnitude matches P/V.', difficulty: 'Intermediate', estimated_hours: 2 },
        ],
        checkpoints: [
          'Define real, reactive, apparent power. Units?',
          'What is PF? How related to V-I angle?',
          'Compute V_rms of a square wave swinging ±5V.',
          'Design PFC cap for 10kW load at 400V, 50Hz, PF=0.7 lagging.',
        ],
      },
      {
        id: 'p2m4', title: 'Resonance, Bode Plots & Filters', description: 'Series and parallel resonance at ω_0=1/√(LC). Q=ω_0·L/R=1/(ω_0·R·C). BW=ω_0/Q. Bode plots in dB and degrees vs log frequency.',
        duration_hours: 7, difficulty: 'Intermediate',
        lessons: [
          { id: 'p2m4l1', title: 'Series and parallel resonance', type: 'reading', duration_min: 60, summary: 'At ω_0=1/√(LC), L and C cancel. Series: Z=R (minimum, max current). Parallel: Z=R (maximum, min current). Q=ω_0/BW measures sharpness.', key_takeaways: ['ω_0=1/√(LC) is the resonant frequency', 'Series resonance: Z minimum, current maximum', 'Parallel resonance: Z maximum, current minimum', 'Q=ω_0/BW; high Q = sharp resonance'], formulas: [{ label: 'Resonant frequency', latex: '\\omega_0 = \\dfrac{1}{\\sqrt{LC}}' }, { label: 'Quality factor (series)', latex: 'Q = \\dfrac{\\omega_0 L}{R} = \\dfrac{1}{\\omega_0 R C}' }, { label: 'Bandwidth', latex: 'BW = \\dfrac{\\omega_0}{Q}' }], falstad_url: 'https://www.falstad.com/circuit/circuitjs.html?cct=$+1+0.000005+10.20027730826997+50+5+50%0Av+272+112+272+240+0+0+1+5+0+0+0.5%0Ar+272+112+384+112+0+100%0Al+384+112+384+240+0+0.01+0%0Ac+384+240+384+112+0+0.000001+0%0Ag+272+240+272+272+0%0Ag+384+240+384+272+0%0A', bode: { numerator: [0.2, 0], denominator: [1, 0.2, 1], label: 'Series RLC band-pass: ωₙ=1, Q=5', note: 'Sharp peak at ω=1 rad/s. Increase 2ζω_n (the s coefficient) to lower Q and widen the peak.' }, spice_netlist: `* Series RLC AC sweep: resonance near f0 = 1/(2*pi*sqrt(L*C)) = 1592 Hz\
V1 in 0 DC 0 AC 1\
R1 in l1 10\
L1 l1 l2 1m\
C1 l2 0 1u\
.ac dec 50 10 100k\
.print ac v(l2)\
.end` },
          { id: 'p2m4l2', title: 'Bode plots: magnitude in dB, phase in degrees', type: 'reading', duration_min: 75, summary: 'dB=20·log|H|. Each pole: −20dB/decade, −45° at pole, −90° a decade above. Each zero: +20dB/decade, +90°. Second-order: twice the slope.', key_takeaways: ['dB=20·log|H| (voltage); 10·log|H|² (power)', 'Pole: −20dB/decade, phase −90° asymptote', 'Zero: +20dB/decade, phase +90° asymptote', '−3dB = half power point'], has_playground: true, formulas: [{ label: 'Magnitude (dB)', latex: '|H|_{\\text{dB}} = 20\\log_{10}|H(j\\omega)|' }, { label: 'Phase (deg)', latex: '\\angle H = \\arg H(j\\omega)' }, { label: '−3 dB point', latex: '|H(j\\omega_c)| = \\dfrac{1}{\\sqrt{2}} \\implies -3.01\\,\\text{dB}' }], has_bode: true, bode: { numerator: [1], denominator: [1, 1, 1], label: '2nd-order low-pass: ωₙ=1 rad/s, ζ=0.5', note: 'Slope above ωₙ is −40 dB/decade (twice the −20 dB/dec of a single pole). Drag ζ to see the resonant peak emerge.' }, spice_netlist: `* RC low-pass Bode: f_c = 1/(2*pi*R*C) = 159 Hz\
V1 in 0 DC 0 AC 1\
R1 in out 1k\
C1 out 0 1u\
.ac dec 50 1 100k\
.print ac v(out)\
.end` },
        ],
        projects: [
          { id: 'p2m4pr1', title: 'Python: Bode Plotter for Arbitrary TF', goal: 'Build a reusable Bode plotter in Python.', tools: ['Python', 'scipy.signal', 'matplotlib'], steps: ['Write bode(num, den, f_range) using scipy.signal.freqs', 'Plot magnitude (dB) and phase (deg) vs log frequency', 'Test: H(s)=1/(s²+s+1) — 2nd-order low-pass at ω_n=1, ζ=0.5', 'Verify peak at ω_n and −40dB/decade rolloff above', 'Bench (optional): build same filter, sweep, overlay on Python plot'], pass_criteria: 'Bode plot matches scipy.signal.bode reference.', difficulty: 'Intermediate', estimated_hours: 2.5 },
        ],
        checkpoints: [
          'Define series and parallel resonance. Where do they occur?',
          'What is Q? How related to damping ratio and bandwidth?',
          'Sketch Bode magnitude of 1st-order RC low-pass. Mark cutoff.',
          'How many dB per decade does a 4th-order low-pass roll off?',
          'Convert 0.707 to dB. Why is this number special?',
        ],
      },
      {
        id: 'p2m5', title: 'Three-Phase Systems', description: 'V_a, V_b, V_c at same frequency, 120° apart. Sum is always zero. V_L=√3·V_ph. P=√3·V_L·I_L·PF.',
        duration_hours: 5, difficulty: 'Intermediate',
        lessons: [
          { id: 'p2m5l1', title: 'Why three-phase?', type: 'reading', duration_min: 60, summary: 'Three sinusoids 120° apart. Sum is always zero — no neutral current for balanced loads. Halves conductor material vs three single-phase. Standard for generation, transmission, industrial.', key_takeaways: ['Balanced three-phase: no neutral current', 'V_L=√3·V_ph (line-to-line vs phase-to-neutral)', 'P=√3·V_L·I_L·PF (total three-phase power)'] },
          { id: 'p2m5l2', title: 'Wye and delta connections', type: 'reading', duration_min: 60, summary: 'Wye (Y): 3 phases + neutral, common in distribution (230/400V EU, 120/208V US). Delta (Δ): 3 phases only, common in transmission and industrial motors. Δ load draws √3× line current of Y at same V_L.', key_takeaways: ['Wye: phase voltage = V_L/√3, neutral available', 'Delta: phase voltage = V_L, no neutral', 'Same load in Δ draws 3× the power of Y at same V_L'] },
        ],
        projects: [
          { id: 'p2m5pr1', title: 'Python: Three-Phase Phasor Visualizer', goal: 'See three-phase phasors rotating.', tools: ['Python', 'matplotlib', 'FuncAnimation'], steps: ['Animate three phasors (red, yellow, blue) at 50Hz, 120° apart', 'Show their sum is always zero', 'Animate the rotating space vector — traces a circle of radius V_m', 'Add unbalanced case (V_a reduced 20%) — sum no longer zero'], pass_criteria: 'Animation runs smoothly; sum phasor stays at origin for balanced case.', difficulty: 'Intermediate', estimated_hours: 1.5 },
        ],
        checkpoints: [
          'Why does a balanced three-phase system need no neutral?',
          'Convert 400V line-line to phase voltage.',
          'Compute real power to balanced Y load with R=10Ω/phase at 400V line-line.',
          'Why is three-phase transmission more efficient than single-phase?',
        ],
      },
      {
        id: 'p2m6', title: 'Mutual Inductance & Transformers', description: 'Two coils sharing flux have mutual inductance M. k=M/√(L1·L2). Ideal transformer: V2/V1=N2/N1, I2/I1=N1/N2, Z_reflected=(N1/N2)²·Z_load.',
        duration_hours: 5, difficulty: 'Intermediate',
        lessons: [
          { id: 'p2m6l1', title: 'Mutual inductance and coupling coefficient', type: 'reading', duration_min: 60, summary: 'v1=L1·di1/dt+M·di2/dt. k=M/√(L1·L2) from 0 (no coupling) to 1 (perfect). Real transformers achieve k=0.95–0.99 with ferromagnetic cores.', key_takeaways: ['Mutual inductance M couples two coils', 'k=0 (uncoupled) to 1 (perfect coupling)', 'Real transformers: k=0.95–0.99'] },
          { id: 'p2m6l2', title: 'The ideal transformer', type: 'reading', duration_min: 60, summary: 'V2/V1=N2/N1, I2/I1=N1/N2, power conserved. Z_reflected=(N1/N2)²·Z_load. Impedance matching by turns ratio.', key_takeaways: ['Voltage ratio = turns ratio', 'Current ratio = inverse turns ratio', 'Impedance reflects as (N1/N2)² — match any load to any source'] },
          { id: 'p2m6l3', title: 'Real transformers: parasitics and equivalent circuit', type: 'reading', duration_min: 60, summary: 'Winding resistance, leakage inductance, magnetizing inductance, core losses (hysteresis + eddy), inter-winding capacitance. Power transformers: 97–99% efficient.', key_takeaways: ['Leakage inductance = flux that doesn’t link both coils', 'Magnetizing inductance draws current even at no load', 'Core losses = hysteresis + eddy currents'] },
        ],
        projects: [
          { id: 'p2m6pr1', title: 'LTspice: Step-Down Transformer', goal: 'Simulate 10:1 step-down and verify power transfer.', tools: ['LTspice'], steps: ['Ideal transformer n=10. Primary: 230V RMS 50Hz. Secondary: 23V RMS into 10Ω.', 'Predict: I_primary=0.23A. P_load=P_primary=52.9W.', 'Simulate, verify both powers match', 'Extension: add 1mH primary leakage, 10μH secondary leakage. How does regulation change?'], pass_criteria: 'P_primary=P_secondary within 1%.', difficulty: 'Intermediate', estimated_hours: 1.5 },
        ],
        checkpoints: [
          'What is mutual inductance? Define k.',
          'State ideal transformer equations for V, I, Z.',
          '230V:12V transformer with 100Ω secondary load. Primary impedance?',
          'Why don’t transformers work with DC?',
          'Name three parasitic effects in real transformers.',
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // PHASE 3 — ANALOG ELECTRONICS (condensed for data file — full content in PDF)
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'p3',
    index: 3,
    title: 'Analog Electronics',
    subtitle: 'Diodes, BJTs, MOSFETs, op-amps, audio amp',
    description: 'Master the nonlinear workhorses of analog — diodes, BJTs, MOSFETs, op-amps — via the small-signal model. Build a complete audio amplifier by the end of the phase.',
    duration_weeks: 6,
    color: '#7a6b3f',
    goal: 'Design and build a working audio power amplifier.',
    modules: [
      { id: 'p3m1', title: 'Diodes: Rectifiers, Clippers, Clampers', description: 'Shockley equation I=I_S·(e^(V/V_T)−1). Half-wave, full-wave bridge, peak rectifier. Zener voltage reference.',
        duration_hours: 6, difficulty: 'Intermediate',
        lessons: [
          { id: 'p3m1l1', title: 'The diode I-V curve and Shockley equation', type: 'reading', duration_min: 60, summary: 'I=I_S·(e^(V/(nV_T))−1), V_T=kT/q≈26mV at room temp. Forward drop ~0.7V (Si), 0.3V (Schottky). Reverse leakage I_S typically 10⁻¹⁵ to 10⁻¹² A.', key_takeaways: ['Shockley equation is exponential in V', 'V_T=26mV at room temperature', 'Real forward drop ~0.7V (Si) due to exponential steepness'] , has_3d_model: true, model_component: 'diode', has_breadboard: true },
          { id: 'p3m1l2', title: 'Three rectifier topologies', type: 'reading', duration_min: 75, summary: 'Half-wave: 1 diode, V_avg=V_m/π, ripple freq=line freq. Full-wave bridge: 4 diodes, V_avg=2V_m/π, ripple freq=2×line. Peak (cap-input): cap charges to V_m, ripple ΔV=I/(f·C).', key_takeaways: ['Full-wave has half the ripple of half-wave at same load', 'Peak rectifier is the front-end of every linear and SMPS', 'Ripple ΔV=I_load/(f·C)'], formulas: [{ label: 'Half-wave average', latex: 'V_{\\text{avg}} = \\dfrac{V_m}{\\pi}' }, { label: 'Full-wave average', latex: 'V_{\\text{avg}} = \\dfrac{2V_m}{\\pi}' }, { label: 'Peak rectifier ripple', latex: '\\Delta V = \\dfrac{I_{\\text{load}}}{f\\,C}' }], falstad_url: 'https://www.falstad.com/circuit/circuitjs.html?cct=$+1+0.000005+10.20027730826997+50+5+50%0Av+80+96+80+240+0+0+1+60+0+0+0.5%0Ad+80+96+176+96+0%0Ad+176+96+272+96+0%0Ad+80+240+176+240+0%0Ad+176+240+272+240+0%0Aw+176+96+176+240+0%0Aw+272+96+272+240+0%0Ac+272+96+368+96+0+0.0001+0%0Ar+368+96+368+240+0+1000%0Aw+272+240+368+240+0%0Ag+368+240+368+272+0%0A', spice_netlist: `* Half-wave rectifier (PWL approximation of 60Hz sine, 3 cycles)
* Note: spicey does not support SINE() sources, so we approximate
* v(t) = 5*sin(2*pi*60*t) with 12 points per 16.667ms cycle.
V1 in 0 PWL(0 0 1.389m 2.5 2.778m 4.33 4.167m 5 5.556m 4.33 6.944m 2.5 8.333m 0 9.722m -2.5 11.111m -4.33 12.5m -5 13.889m -4.33 15.278m -2.5 16.667m 0 18.056m 2.5 19.444m 4.33 20.833m 5 22.222m 4.33 23.611m 2.5 25m 0 26.389m -2.5 27.778m -4.33 29.167m -5 30.556m -4.33 31.944m -2.5 33.333m 0 34.722m 2.5 36.111m 4.33 37.5m 5 38.889m 4.33 40.278m 2.5 41.667m 0 43.056m -2.5 44.444m -4.33 45.833m -5 47.222m -4.33 48.611m -2.5 50m 0)
D1 in out 1N4148
C1 out 0 100u
R1 out 0 1k
.model 1N4148 D
.tran 100u 50m
.print tran v(in) v(out)
.end`, has_heavy_spice: true, heavy_spice_starter: `* Half-wave rectifier with 1N4148
V1 in 0 SINE(0 10 60)
D1 in out 1N4148
C1 out 0 100u
R1 out 0 1k
.model 1N4148 D(Is=2.52n N=1.752 Cjo=4p M=0.4 Bv=100 Ibv=100u)
.tran 100u 50m
.print tran v(in) v(out) i(V1)
.end`, has_breadboard: true },
          { id: 'p3m1l3', title: 'Clippers, clampers, and Zener references', type: 'reading', duration_min: 45, summary: 'Clippers limit voltage swing (input protection). Clampers add DC offset (DC restore after AC coupling). Zener diodes operate in reverse breakdown safely — stable voltage reference.', key_takeaways: ['Zener reverse breakdown is well-controlled', 'Every linear regulator uses a Zener or bandgap reference', 'Schottky for low-drop rectification, Si for general purpose'] },
        ],
        projects: [
          { id: 'p3m1pr1', title: 'Bench: 12V Linear Supply Front-End', goal: 'Rectify 12VAC wall transformer to DC.', tools: ['12VAC transformer', '1N4007 bridge', '1000μF cap', '12V Zener', 'scope'], steps: ['Build: 12VAC → 1N4007 bridge → 1000μF cap → 12V Zener clamp', 'Scope at cap: see ripple', 'Compute ΔV=I_load/(f·C) for I=50mA, f=100Hz: ΔV≈0.5V', 'Verify measured ripple matches formula', 'Add load, watch ripple grow linearly'], pass_criteria: 'Supply delivers 12V±0.6V at loads to 100mA. Ripple matches formula within 20%.', difficulty: 'Intermediate', estimated_hours: 2 },
        ],
        checkpoints: [
          'State Shockley equation. V_T at room temp?',
          'Why does full-wave have half the ripple of half-wave?',
          'Compute ripple of 1000μF cap delivering 100mA at 100Hz.',
          'What is a Zener and how does it differ from a regular diode?',
        ],
      },
      { id: 'p3m2', title: 'BJT Biasing and Small-Signal Model', description: 'Cut-off, active, saturation. Four-resistor bias. Hybrid-π model: g_m=I_C/V_T, r_π=β/g_m, A_v=−g_m·R_C.',
        duration_hours: 9, difficulty: 'Intermediate',
        cs_bridge: 'BJT ↔ current-controlled current source (I_C=β·I_B). MOSFET ↔ voltage-controlled current source (I_D=f(V_GS)). Both have small-signal models that linearize them around a DC operating point — same idea as Newton’s method in optimization.',
        lessons: [
          { id: 'p3m2l1', title: 'BJT regions: cut-off, active, saturation', type: 'reading', duration_min: 60, summary: 'Cut-off: V_BE<0.6V, I_C≈0 (off switch). Active: V_BE≈0.7V, V_CE>V_CE(sat), I_C=β·I_B (amplifier). Saturation: V_CE≈0.2V, I_C<β·I_B (on switch).', key_takeaways: ['Active region for amplification', 'Saturation for switching (on)', 'Cut-off for switching (off)'] , has_3d_model: true, model_component: 'transistor'},
          { id: 'p3m2l2', title: 'Four-resistor bias network', type: 'reading', duration_min: 75, summary: 'R1/R2 divider sets V_B. V_E=V_B−0.7. I_E≈I_C=V_E/R_E. V_C=V_CC−I_C·R_C. Rule: divider current 10× base current for β stability.', key_takeaways: ['Bias to a stable Q point in active region', 'Emitter resistor provides negative feedback (stabilizes I_C against β variation)', 'Bypass R_E with cap for AC gain without losing DC stability'], has_heavy_spice: true, heavy_spice_starter: `* Common-emitter amplifier
V1 VCC 0 12
R1 VCC b 50k
R2 b 0 10k
RC VCC c 5k
RE e 0 1k
CE e 0 100u
Q1 c b e 0 2N3904
.model 2N3904 NPN(Is=6.734f Xti=3 Eg=1.11 Vaf=74.03 Bf=416.4 Ne=1.259 Ise=6.734f Ikf=66.78m Xtb=1.5 Br=0.7371 Nc=2 Isc=0 Ikr=0 Rc=1 Cjc=3.638p Mjc=0.3085 Vjc=0.75 Fc=0.5 Cje=4.493p Mje=0.2593 Vje=0.75 Tr=239.5n Tf=301.2p Itf=0.4 Vtf=4 Xtf=2)
.op
.print dc v(b) v(c) v(e) i(RC) i(RE)
.end` },
          { id: 'p3m2l3', title: 'Hybrid-π small-signal model', type: 'reading', duration_min: 75, summary: 'g_m=I_C/V_T≈40·I_C [A/V]. r_π=β/g_m. r_o=V_A/I_C. Voltage-controlled current source g_m·v_be from C to E. A_v=−g_m·R_C for common-emitter.', key_takeaways: ['g_m=I_C/V_T (transconductance)', 'r_π=β/g_m (input resistance)', 'A_v=−g_m·R_C (CE voltage gain)'] },
        ],
        projects: [
          { id: 'p3m2pr1', title: 'Bench: Common-Emitter Audio Preamp', goal: 'Build CE amp with gain≈20, verify on bench.', tools: ['breadboard', '2N3904', 'resistors', 'caps', 'scope', 'signal gen'], steps: ['Specs: V_CC=12V, I_C=1mA, V_CE=6V', 'Design: R_E=1kΩ, R_C=5kΩ, R1=50kΩ, R2=10kΩ, bypass R_E with 100μF + 100Ω unbypassed for stability', 'Compute A_v≈−R_C/R_E_unbypassed=−50', 'Build, drive with 10mV sine at 1kHz, measure gain', 'Sweep 20Hz–200kHz, find −3dB bandwidth'], pass_criteria: 'Measured gain matches prediction within 20%. Bandwidth > 50 kHz.', difficulty: 'Intermediate', estimated_hours: 3 },
        ],
        checkpoints: [
          'Name 4 BJT regions. Which for amplification? For switching?',
          'Design 4-resistor bias for I_C=2mA, V_CC=12V, β=100.',
          'Define g_m, r_π, r_o. How depend on I_C?',
          'Compute A_v of CE amp with g_m=40mA/V and R_C=5kΩ.',
          'Why bypass R_E with a cap? Trade-off?',
        ],
      },
      { id: 'p3m3', title: 'MOSFET Biasing and Small-Signal Model', description: 'Cut-off, triode, saturation. I_D=½·k_n·(V_GS−V_th)²·(1+λ·V_DS). g_m=√(2·k_n·I_D). Infinite gate impedance.',
        duration_hours: 7, difficulty: 'Intermediate',
        lessons: [
          { id: 'p3m3l1', title: 'MOSFET regions and I-V equation', type: 'reading', duration_min: 60, summary: 'Cut-off: V_GS<V_th. Triode: V_DS<V_GS−V_th (resistor). Saturation: V_DS>V_GS−V_th (current source). I_D=½·k_n·(V_GS−V_th)²·(1+λ·V_DS).', key_takeaways: ['Saturation region for amplification', 'Triode region for switching (low R_DS(on))', 'k_n=μ_n·C_ox·W/L sets the device strength'], has_heavy_spice: true, heavy_spice_starter: `* MOSFET output characteristic
VDS d 0 5
VGS g 0 2
M1 d g 0 0 2N7000
.model 2N7000 NMOS(Vto=2.0 Kp=0.1 Lambda=0.02)
.dc VDS 0 5 0.1 VGS 1 5 1
.print dc i(VDS)
.end` },
          { id: 'p3m3l2', title: 'Why MOSFETs dominate modern electronics', type: 'reading', duration_min: 60, summary: 'Gate draws no DC current — input impedance is infinite at DC. This is why CMOS dominates digital: a billion gates draw near-zero static current. BJTs always draw base current.', key_takeaways: ['MOSFET gate = infinite DC input impedance', 'CMOS = complementary MOS, near-zero static power', 'This is why Moore’s law has been a MOSFET story'] },
        ],
        projects: [
          { id: 'p3m3pr1', title: 'LTspice: MOSFET CS Amp', goal: 'Design and simulate CS MOSFET amplifier.', tools: ['LTspice', '2N7002 model'], steps: ['Specs: V_DD=5V, I_D=100μA, V_DS=2.5V', 'Design: R_D=25kΩ, find V_GS for I_D=100μA from datasheet (~1.5V for 2N7002)', 'Bias gate via 1MΩ/1MΩ divider to preserve input impedance', 'Simulate DC operating point, then AC sim for gain and bandwidth'], pass_criteria: 'DC operating point matches design; AC gain matches small-signal prediction.', difficulty: 'Intermediate', estimated_hours: 2 },
        ],
        checkpoints: [
          'Name 3 MOSFET regions. Which for amplification?',
          'Why is MOSFET gate impedance nearly infinite?',
          'Compute g_m for k_n=1mA/V², I_D=100μA.',
          'Why do digital circuits use CMOS rather than BJTs?',
        ],
      },
      { id: 'p3m4', title: 'Operational Amplifiers: The Analog Swiss Army Knife', description: 'Two golden rules: virtual short, no input current. Inverting, non-inverting, follower, summing, difference. Integrator, differentiator. Real non-idealities (GBW, slew rate, offset).',
        duration_hours: 9, difficulty: 'Intermediate',
        cs_bridge: 'Op-amp ↔ functional-programming pure function. Ideal op-amp: infinite gain, infinite Z_in, zero Z_out, infinite BW. Output determined entirely by feedback network — op-amp is pure gain block, feedback network is the "program". Composable like pure functions.',
        lessons: [
          { id: 'p3m4l1', title: 'Two golden rules and five canonical circuits', type: 'reading', duration_min: 90, summary: 'Rule 1: V_+=V_- (virtual short). Rule 2: no current into inputs. Five circuits: inverting (A_v=−R_f/R_1), non-inverting (A_v=1+R_f/R_1), follower (A_v=1), summing (V_o=−R_f·ΣV_i/R_i), difference (V_o=(R_f/R_1)·(V_2−V_1)).', key_takeaways: ['Virtual short and no input current — analyze any op-amp circuit', 'Inverting and non-inverting are the two building blocks', 'Follower = buffer, high-Z to low-Z transformation'], formulas: [{ label: 'Golden rule 1', latex: 'V_+ = V_-' }, { label: 'Golden rule 2', latex: 'I_+ = I_- = 0' }, { label: 'Inverting amp', latex: 'A_v = -\\dfrac{R_f}{R_1}' }, { label: 'Non-inverting amp', latex: 'A_v = 1 + \\dfrac{R_f}{R_1}' }, { label: 'Follower (buffer)', latex: 'A_v = 1' }], falstad_url: 'https://www.falstad.com/circuit/circuitjs.html?cct=$+1+0.000005+10.20027730826997+50+5+50%0Aa+240+144+336+144+0+15+-15+1000000+0.00005+0%0Ar+144+128+240+128+0+1000%0Ar+240+128+336+128+0+10000%0Ag+240+160+240+192+0%0Aw+336+144+384+144+0%0Aw+144+128+144+144+0%0Av+144+144+144+208+0+0+1+1+0+0+0.5%0Ag+144+208+144+240+0%0A', has_heavy_spice: true, heavy_spice_starter: `* Inverting amplifier with uA741
V1 in 0 SINE(0 0.1 1000)
R1 in neg 1k
Rf neg out 10k
X1 neg 0 out vcc vee uA741
VCC vcc 0 15
VEE vee 0 -15
.subckt uA741 inp inn out vp vm
* simplified 741 model
Rin inp inn 2meg
E1 int 0 inp inn 200000
Rout int out 75
.ends
.tran 10u 5m
.print tran v(in) v(out)
.end` , has_3d_model: true, model_component: 'ic'},
          { id: 'p3m4l2', title: 'Integrator and differentiator', type: 'reading', duration_min: 60, summary: 'Replace R_f with C: integrator, V_o=−(1/RC)·∫V_in dt. Replace R_1 with C: differentiator, V_o=−RC·dV_in/dt. Integrator is everywhere (PID, active filters, charge amps). Differentiator is noise-amplifying, rarely used pure.', key_takeaways: ['Integrator = analog computer integration', 'Differentiator amplifies noise — usually filtered', 'Both are the basis of active filters'] },
          { id: 'p3m4l3', title: 'Real op-amp non-idealities', type: 'reading', duration_min: 60, summary: 'Finite open-loop gain (10⁵–10⁶). GBW (1–10 MHz typical). Slew rate (V/μs). Input offset voltage (1–10 mV). Input bias current. Noise. The two that bite most: GBW and slew rate.', key_takeaways: ['GBW=f_t / A_cl (closed-loop bandwidth)', 'Slew rate limits large-signal bandwidth: f_max=SR/(2π·V_peak)', 'Always check GBW and slew rate for your application'] },
        ],
        projects: [
          { id: 'p3m4pr1', title: 'Bench: Audio Mixer', goal: 'Sum three audio sources with individual level controls.', tools: ['TL072 op-amp', '10kΩ pots', 'resistors', 'caps', 'breadboard', 'audio source'], steps: ['Three inverting-amp inputs through 10kΩ pots → summing node → op-amp with R_f=10kΩ → output', 'Add follower at output to drive low-impedance headphones', 'Feed 1kHz sine to each input at 100mV. Output should be sum × gain', 'Add three different frequencies; check output spectrum has all three peaks'], pass_criteria: 'Output spectrum shows all three input frequencies at correct amplitudes.', difficulty: 'Intermediate', estimated_hours: 3 },
        ],
        checkpoints: [
          'State the two golden rules of ideal op-amp analysis.',
          'Design inverting amp with gain −10. R_1 and R_f?',
          'What is GBW? Bandwidth of 1MHz op-amp at gain 100?',
          'Why is differentiator rarely used pure?',
          'What is slew rate, and how does it limit a 20V_PP sine at 100kHz?',
        ],
      },
      { id: 'p3m5', title: 'Active Filters: Sallen-Key and MFB', description: 'Sallen-Key (non-inverting, easy to cascade). Multiple-Feedback (inverting, better high-freq). Butterworth/Chebyshev/Bessel responses.',
        duration_hours: 7, difficulty: 'Intermediate',
        lessons: [
          { id: 'p3m5l1', title: 'Sallen-Key low-pass: ω_0 and Q', type: 'reading', duration_min: 75, summary: 'Two RC sections + op-amp follower. H(s)=ω_0²/(s²+(ω_0/Q)s+ω_0²). ω_0=1/√(R_1R_2C_1C_2). Q=√(R_1R_2C_1C_2)/(R_1C_1+R_2C_1+R_1C_2(1−K)). For unity gain: Q=1/(2−K).', key_takeaways: ['Sallen-Key is the standard 2nd-order active filter', 'Choose C_1=C_2, R_1=R_2 for simplicity', 'Butterworth needs Q=0.707 → K=1.586'] },
          { id: 'p3m5l2', title: 'Butterworth vs Chebyshev vs Bessel', type: 'reading', duration_min: 60, summary: 'Butterworth: maximally flat passband, mediocre rolloff. Chebyshev: passband ripple for steeper rolloff. Bessel: maximally flat group delay (best for pulses), slowest rolloff.', key_takeaways: ['Butterworth = flattest passband', 'Chebyshev = steepest rolloff (with ripple)', 'Bessel = best pulse fidelity (linear phase)'] },
        ],
        projects: [
          { id: 'p3m5pr1', title: 'Bench: 4th-Order Butterworth Low-Pass at 1kHz', goal: 'Cascade two Sallen-Key 2nd-order sections.', tools: ['TL072', 'caps', 'resistors', 'breadboard', 'signal gen', 'scope'], steps: ['Each stage: Q=0.541 (stage 1), Q=1.306 (stage 2) for 4th-order Butterworth', 'Use C=10nF, R=1/(2π·1000·C)=15.9kΩ', 'Tune gain of each stage to achieve required Q (K=3−1/Q)', 'Sweep 100Hz to 100kHz, measure magnitude', 'Verify: flat to 1kHz, −3dB at 1kHz, −80dB/decade rolloff'], pass_criteria: 'Response matches Butterworth design within 1dB to 1kHz, −80dB/decade rolloff above.', difficulty: 'Intermediate', estimated_hours: 3.5 },
        ],
        checkpoints: [
          'Why use active filters instead of passive LC at audio?',
          'Design Sallen-Key low-pass with f_c=1kHz, C=10nF. R?',
          'Compare Butterworth, Chebyshev, Bessel — what does each optimize?',
          'How build 6th-order filter from 2nd-order sections? Q values for Butterworth?',
        ],
      },
      { id: 'p3m6', title: 'Oscillators and Timers: Wien Bridge, Phase-Shift, 555', description: 'Barkhausen: |Aβ|=1 and ∠Aβ=0°. Wien bridge sine. Phase-shift. 555 timer astable/monostable.',
        duration_hours: 6, difficulty: 'Intermediate',
        lessons: [
          { id: 'p3m6l1', title: 'Barkhausen criterion and three oscillators', type: 'reading', duration_min: 60, summary: '|Aβ|=1 and ∠Aβ=0° (or 360°). Wien bridge: RC bandpass + neg feedback R_f/R_1=2. Phase-shift: three RC HP sections give 180°, inverting amp gives the rest. Colpitts/Hartley: LC tank for RF.', key_takeaways: ['Barkhausen: loop gain magnitude 1, phase 0°', 'Start with |Aβ|>1 so noise can build up; nonlinearity limits', 'Wien bridge for clean audio sine; LC for RF'] },
          { id: 'p3m6l2', title: 'The 555 timer', type: 'reading', duration_min: 60, summary: '8-pin oscillator/timer IC since 1972. Astable: f=1.44/((R_1+2R_2)·C), duty=(R_1+R_2)/(R_1+2R_2). Monostable: T=1.1·R·C. The go-to for cheap clocks, PWM, debouncers, tone gens.', key_takeaways: ['555 is the most popular IC ever', 'Astable: f=1.44/((R_1+2R_2)·C)', 'Monostable: T=1.1·R·C'] , has_wokwi_elements: true, has_3d_model: true, model_component: 'ic'},
        ],
        projects: [
          { id: 'p3m6pr1', title: 'Bench: Variable Wien Bridge Sine Source', goal: 'Build 100Hz–10kHz sine source with <1% THD.', tools: ['TL072', 'dual-gang pot', 'JFET for AGC', 'caps', 'resistors'], steps: ['Wien bridge with dual-gang pot for freq control', 'JFET for AGC (amplitude stabilization)', 'Verify THD with sound-card spectrum analyzer (REW or RightMark)', 'Should be <1% across 100Hz–10kHz'], pass_criteria: 'THD < 1% from 100 Hz to 10 kHz.', difficulty: 'Intermediate', estimated_hours: 3 },
        ],
        checkpoints: [
          'State Barkhausen criterion. What if |Aβ|>1? <1?',
          'Design 555 astable for f=1kHz, 50% duty. R_1, R_2, C?',
          'Why does Wien bridge need amplitude stabilization?',
          'Why LC oscillators preferred over RC at RF?',
        ],
      },
      { id: 'p3m7', title: 'Linear Regulators and LDOs', description: 'Closed-loop amplifier holds V_out constant. Efficiency=V_out/V_in. LDOs drop only ~100mV. LM78xx, LM317, modern LDOs.',
        duration_hours: 5, difficulty: 'Intermediate',
        lessons: [
          { id: 'p3m7l1', title: 'Linear regulator topology and efficiency', type: 'reading', duration_min: 60, summary: 'Voltage reference (Zener or bandgap) + error amp + pass transistor (BJT or MOSFET). Efficiency=V_out/V_in. P_diss=(V_in−V_out)·I_load. LDOs allow dropout as low as 100mV.', key_takeaways: ['Efficiency = V_out/V_in (linear)', 'P_diss = (V_in−V_out)·I_load (wasted as heat)', 'LDO = low dropout, useful for battery devices'] },
          { id: 'p3m7l2', title: 'Spec parameters and real parts', type: 'reading', duration_min: 45, summary: 'LM78xx/LM79xx (fixed), LM317 (adjustable). AMS1117, MCP1700, LT3045 (modern LDOs). Specs: dropout, line/load regulation, quiescent current, PSRR, output noise.', key_takeaways: ['PSRR matters when powered from switching regulators', 'Quiescent current matters for battery devices', 'Low-noise LDOs for analog front-ends'] },
        ],
        projects: [
          { id: 'p3m7pr1', title: 'Bench: Adjustable Bench Supply with LM317', goal: 'Build 1.25–20V, 1A bench supply.', tools: ['LM317', '240Ω resistor', '5kΩ pot', '0.33μF and 0.1μF caps', 'heatsink'], steps: ['V_out=1.25·(1+R2/R1), R1=240Ω, R2=5kΩ pot → 1.25 to 27V', 'Add input/output caps for stability', 'Sweep R2, verify V_out tracks linearly', 'Add 1A load (20Ω power resistor at 20V), verify V_out holds within load regulation', 'Heatsink: 20W dissipation requires <5°C/W thermal resistance'], pass_criteria: 'V_out holds within 50mV across full load range at all output voltages.', difficulty: 'Intermediate', estimated_hours: 2.5 },
        ],
        checkpoints: [
          'Compute efficiency of 5V LDO dropping 12V to 5V at 500mA. P_diss?',
          'Why can’t a linear regulator boost voltage?',
          'What is dropout voltage? Why does it matter for battery devices?',
          'What is PSRR? Why matter for analog powered from switching regulators?',
        ],
      },
      { id: 'p3m8', title: 'Phase 3 Capstone: Audio Power Amplifier', description: 'Three-stage class-AB: diff pair input, CE voltage-amp with Miller comp, class-AB output. 20W into 8Ω, 20Hz–20kHz, THD<1%.',
        duration_hours: 12, difficulty: 'Intermediate',
        lessons: [
          { id: 'p3m8l1', title: 'Class-AB audio amplifier: topology walkthrough', type: 'reading', duration_min: 45, summary: 'Three-stage class-AB topology: (1) differential input pair for low offset and high CMRR, (2) common-emitter voltage-amp with Miller compensation capacitor for dominant pole, (3) class-AB output stage (Darlington or MOSFET follower) with bias network for quiescent current. Feedback closes the loop and sets the closed-loop gain. The KiCad schematic below shows a representative example of this topology — pan and zoom in the KiCanvas viewer.', key_takeaways: ['Three-stage topology: diff pair → VA → class-AB output', 'Miller comp capacitor creates the dominant pole for stability', 'Class-AB bias network sets quiescent current to avoid crossover distortion', 'Closed-loop gain = 1 + R_f/R_in'], kicanvas_url: 'https://raw.githubusercontent.com/wntrblm/Guava/main/bom/test.kicad_sch', has_tscircuit: true, tscircuit_code: `// Class-AB audio amplifier — three-stage topology.
// (1) Diff pair input → (2) common-emitter VA with Miller comp →
// (3) class-AB output stage. This tscircuit starter shows the small-signal
// equivalent: input coupling cap → Rin → Rf (sets gain = 1 + Rf/Rin) →
// 8Ω load. Switch to the PCB and 3D Board tabs to lay it out.
import { Circuit, Resistor, Capacitor, PowerSource, Ground } from "@tscircuit/react-fiber"

export default function AudioAmp() {
  return (
    <Circuit>
      <PowerSource voltage={25} name="VCC" />
      <Capacitor capacitance="1uF" footprint="0805" name="Cin" />
      <Resistor resistance="1k" footprint="0805" name="Rin" />
      <Resistor resistance="22k" footprint="0805" name="Rf" />
      <Capacitor capacitance="47pF" footprint="0805" name="Cmiller" />
      <Resistor resistance="8" footprint="0805" name="Rload" />
      <Ground />
    </Circuit>
  )
}
` },
        ],
        projects: [
          { id: 'p3m8pr1', title: 'Audio Power Amplifier (Class-AB)', goal: 'Design and build complete audio power amp: 20W into 8Ω, 20Hz–20kHz, THD<1%.', tools: ['KiCad', 'BJTs (NPN/PNP power)', 'op-amp', 'resistors', 'caps', 'heatsink', 'PCB (JLCPCB)'], steps: ['Three-stage: (1) differential input pair for low offset, (2) common-emitter voltage-amp with Miller comp, (3) class-AB output stage (Darlington or MOSFET follower)', 'V_CC=±25V rails, quiescent 20mA in output stage', 'Feedback: closed-loop gain=1+R_f/R_in=23 (28dB), input sensitivity 700mV RMS for full output', 'Schematic in KiCad, order PCB from JLCPCB (~$10 for 5)', 'Solder, test: drive with Wien bridge sine, measure THD vs freq and level, bandwidth, output impedance'], pass_criteria: '20W into 8Ω, bandwidth 20Hz–20kHz (±1dB), THD<1% at 1W.', difficulty: 'Intermediate', estimated_hours: 12 },
        ],
        checkpoints: [
          'Sketch three-stage topology of class-AB audio amp. What does each stage do?',
          'Why class-AB and not class-A or class-B?',
          'What is Miller compensation and why needed?',
          'Compute efficiency of class-B amp at full output sine. (Hint: 78.5%.)',
          'How would you protect the output stage against short circuit?',
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // PHASES 4-10 — Condensed summaries (full content in PDF)
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'p4', index: 4, title: 'Digital Logic & Embedded', subtitle: 'Boolean, FSMs, Verilog, FPGA, MCU',
    description: 'Take the digital abstraction from gates to a working FPGA prototype and a wireless MCU telemetry demo. CS background pays the biggest dividends here — FSMs, K-maps, register files, pipelining are all things you already know; we just rename them for hardware.',
    duration_weeks: 6, color: '#529067',
    goal: 'Implement an FSM on an FPGA and a sensor driver on an STM32, integrated end-to-end.',
    modules: [
      { id: 'p4m1', title: 'Boolean Algebra and K-maps', description: 'AND/OR/NOT, De Morgan, SOP/POS, K-map minimization (special case of Quine-McCluskey).',
        duration_hours: 5, difficulty: 'Foundation',
        cs_bridge: 'Boolean algebra ↔ bitwise ops in C. AND, OR, NOT, XOR are the same operators. De Morgan is universal. K-maps are a visual trick for minimizing SOP — algorithmic special case of Quine-McCluskey.',
        lessons: [
          { id: 'p4m1l1', title: 'Boolean algebra and De Morgan', type: 'reading', duration_min: 60, summary: 'AND, OR, NOT, XOR. De Morgan: ¬(A∧B)=¬A∨¬B. SOP = OR of ANDs (DNF). POS = AND of ORs (CNF). Both implementable in two-level logic.', key_takeaways: ['De Morgan laws are universal', 'SOP/POS are two-level implementations', 'Minimization reduces gate count and delay'], circuitverse_url: 'https://circuitverse.org/users/186476/projects/gates-dwg-f8f9e302-8dfc-4554-a24d-2a0340ee6b9f/simulator/embed' },
          { id: 'p4m1l2', title: 'K-map minimization', type: 'reading', duration_min: 60, summary: '2D grid of minterms with Gray code ordering. Adjacent cells differ in one variable. Group 1s in power-of-2 rectangles. Fewer groups, larger groups = fewer literals.', key_takeaways: ['K-maps work to 4 variables by hand', '5+ variables: use Quine-McCluskey or Espresso', 'Modern synthesizers (Yosys, ABC) do this automatically'] },
        ],
        projects: [
          { id: 'p4m1pr1', title: 'Practice: Minimize 10 Boolean Functions', goal: 'Fluency with K-maps.', tools: ['paper', 'pencil', 'Python sympy'], steps: ['Minimize 10 functions of 3–4 variables by hand', 'Cross-check with sympy.logic.boolalg.simplify_logic'], pass_criteria: '8 of 10 match sympy. Discrepancies are usually equally minimal alternatives.', difficulty: 'Foundation', estimated_hours: 1.5 },
        ],
        checkpoints: [
          'State De Morgan’s laws. Convert (A∧B)∨(¬A∧C) to NAND-only.',
          'Minimize F(A,B,C)=Σm(1,3,5,7) using K-map. (Should be C.)',
          'When does Quine-McCluskey beat K-maps? When does Espresso beat both?',
        ],
      },
      { id: 'p4m2', title: 'Combinational Logic: Mux, Decoder, Adder', description: 'Mux (2ⁿ inputs, n select). Decoder (n inputs, 2ⁿ outputs). Ripple-carry, carry-lookahead, prefix adders (Kogge-Stone).',
        duration_hours: 6, difficulty: 'Foundation',
        lessons: [
          { id: 'p4m2l1', title: 'Mux, decoder, adder topologies', type: 'reading', duration_min: 75, summary: 'Mux: 2ⁿ inputs, n select, 1 output — LUT in FPGA is just a mux. Decoder: n inputs, 2ⁿ outputs — address decoding, 7-seg. Adder: ripple (slow), CLA (fast), Kogge-Stone (log time).', key_takeaways: ['A LUT is a mux — universal logic element in FPGAs', 'Carry-lookahead: log(n) delay vs ripple’s O(n)', 'Prefix adders (Kogge-Stone) for high-performance CPUs'], has_verilog: true, verilog_starter: `// 4-to-1 multiplexer — the universal logic element.
// A 6-input FPGA LUT is the same idea, just wider.
// Hit Synthesize: Yosys flattens this to a single $bmux cell; the
// Circuit tab shows the select bits switching the output between
// in[0..3]. Toggle sel[1:0] in the schematic to verify the truth table.
module mux4(
    input  wire [1:0] sel,
    input  wire [3:0] in,
    output wire       out
);
    assign out = in[sel];
endmodule
` , has_3d_model: true, model_component: 'ic', circuitverse_url: 'https://circuitverse.org/users/28699/projects/the-japanese-plexer/simulator/embed'},
          { id: 'p4m2l2', title: 'Combinational hazards', type: 'reading', duration_min: 45, summary: 'Static-1 hazard: output should stay 1 but momentarily drops to 0 due to unequal path delays. Fix: add consensus term (extra product term covering the hazardous transition).', key_takeaways: ['Hazards rarely matter in synchronous designs (clock masks them)', 'Hazards bite hard in asynchronous logic and clock-domain crossings', 'Fix with consensus term or synchronous design'] },
        ],
        projects: [
          { id: 'p4m2pr1', title: 'Bench: 7-Segment Decoder on 74HC', goal: 'Build BCD-to-7-seg decoder from discrete gates.', tools: ['74HC08 (AND)', '74HC32 (OR)', '74HC04 (NOT)', '7-seg display', 'DIP switches', 'resistors'], steps: ['Truth table, K-map each segment, minimize, draw schematic', 'Build with 74HC chips, 4-bit input from DIP switches, output to 7-seg via 330Ω', 'Verify all 10 BCD values display correctly', 'Extension: replace with 74HC47 single chip — compare chip count, board area, power'], pass_criteria: 'All 10 BCD values (0–9) display correctly.', difficulty: 'Foundation', estimated_hours: 2.5 },
        ],
        checkpoints: [
          'Design 4:1 mux using only 2:1 muxes.',
          'Compare ripple-carry and carry-lookahead. Delay for n bits?',
          'What is static-1 hazard? How eliminate?',
          'Why do modern FPGAs use LUTs instead of muxes?',
        ],
      },
      { id: 'p4m3', title: 'Sequential Logic: Flip-Flops, Counters, Registers', description: 'D, T, JK, SR flops. Setup/hold/metastability. Ripple vs synchronous counters. Shift registers.',
        duration_hours: 7, difficulty: 'Intermediate',
        cs_bridge: 'Flip-flop ↔ register in a CPU. D flop is 1-bit register. Shift register is a queue of flops. Counter is a register that increments. Register file is a flop bank — exactly the register file in a CPU. Only new: setup/hold/metastability.',
        lessons: [
          { id: 'p4m3l1', title: 'Four flip-flop types and their use', type: 'reading', duration_min: 60, summary: 'D (universal — most logic uses D), T (counters), JK (general-purpose legacy), SR (basic latch, rarely used standalone). D flop samples input on clock edge and holds until next.', key_takeaways: ['D flop is the universal sequential element', 'JK is the legacy general-purpose flop', 'SR forbidden when S=R=1'], wavedrom: `{ signal: [\n  { name: 'clk', wave: 'p.........' },\n  { name: 'D',   wave: '0.1.0.1.0.' },\n  { name: 'Q',   wave: '0..1.0.1.0', node: '.......a' }\n],\n  head: { text: 'D flip-flop: Q takes D on the rising edge of clk' },\n  foot: { text: 'Setup and hold must be respected around the rising edge.' } }` , has_wokwi_elements: true, has_breadboard: true, circuitverse_url: 'https://circuitverse.org/users/186428/projects/counter-68d9a0ea-190b-4b3b-9d99-170d423ae304/simulator/embed' },
          { id: 'p4m3l2', title: 'Setup, hold, metastability', type: 'reading', duration_min: 75, summary: 't_su: input stable for t_su before edge. t_h: stable for t_h after. Violate → metastable (output hovers between 0 and 1 for unbounded time). Two-flop synchronizer reduces failure probability to MTBF of billions of years.', key_takeaways: ['Setup/hold violations cause metastability', 'Metastability is unavoidable in clock-domain crossings', 'Two-flop synchronizer: MTBF of billions of years'], has_verilog: true, verilog_starter: `// D flip-flop — the simplest sequential element.
// This is the exact flop whose setup/hold window we are studying.
// Hit Synthesize, then click the d button in the circuit view and
// watch q capture d on every rising clk edge.
module dff(
    input  wire clk,
    input  wire d,
    output reg  q
);
    always @(posedge clk) q <= d;
endmodule
` },
          { id: 'p4m3l3', title: 'Counters and shift registers', type: 'reading', duration_min: 60, summary: 'Ripple counter: slow (count ripples through n flops). Synchronous: fast (all share clock, combinational computes next count). Ring counter: 1 circulates. Johnson: 2n states from n flops. Shift register: basis of serial comms.', key_takeaways: ['Synchronous counters are faster than ripple', 'Johnson counter: 2n states from n flops', 'Shift registers = UART, SPI, I2C basis'], wavedrom: `{ signal: [\n  { name: 'clk',  wave: 'p...........' },\n  { name: 'Q[0]', wave: '010101010101.' },\n  { name: 'Q[1]', wave: '001100110011.' },\n  { name: 'Q[2]', wave: '000011110000.' },\n  { name: 'Q[3]', wave: '000000001111.' }\n],\n  head: { text: '4-bit synchronous up-counter (Q[3:0] = 0,1,2,...,15,0,...)' } }` },
        ],
        projects: [
          { id: 'p4m3pr1', title: 'Bench: Traffic-Light FSM on Arduino', goal: 'Implement 6-state traffic-light controller as Moore FSM.', tools: ['Arduino Uno', '6 LEDs', 'resistors', 'button'], steps: ['States: NS_GREEN(8s)→NS_YELLOW(2s)→EW_GREEN(8s)→EW_YELLOW(2s)→PED_WALK(10s)→FLASH_RED(5s)→NS_GREEN', 'enum for state, switch-case for next-state and output logic. Drive 6 LEDs.', 'Extension: add pedestrian button. Debounce. Insert PED_WALK after NS_YELLOW when pressed.'], pass_criteria: 'FSM cycles correctly through all 6 states with correct timing.', difficulty: 'Intermediate', estimated_hours: 2.5 },
        ],
        checkpoints: [
          'Define setup time, hold time, clock-to-Q. What is a timing violation?',
          'What is metastability? How does two-flop synchronizer mitigate?',
          'Design 4-bit synchronous up-counter using D flops.',
          'Why is ripple counter slower than synchronous?',
          'Convert Moore FSM to Mealy. When does Mealy use fewer states?',
        ],
      },
      { id: 'p4m4', title: 'HDL Intro: Verilog and FSMs', description: 'Concurrent assignments, always blocks, blocking vs non-blocking. Testbenches. Icarus Verilog + GTKWave.',
        duration_hours: 7, difficulty: 'Intermediate',
        lessons: [
          { id: 'p4m4l1', title: 'Verilog in one page: assign and always', type: 'reading', duration_min: 75, summary: 'assign for continuous (combinational). always @(posedge clk) for sequential. always @(*) for combinational procedural. Non-blocking <= in clocked blocks; blocking = in combinational. Mixing them up is #1 Verilog bug source.', key_takeaways: ['HDL describes hardware, not programs — everything runs concurrently', '<= for sequential (non-blocking, samples at edge)', '= for combinational (blocking)', 'Testbench needed — HDL has no "run" button'], has_verilog: true, verilog_starter: `// 4-bit synchronous up-counter with async reset.
// Classic Phase 4 Module 4 example — try toggling rst and watching count.
module counter(
    input  wire        clk,
    input  wire        rst,
    output reg  [3:0]  count
);
    always @(posedge clk or posedge rst) begin
        if (rst)        count <= 4'b0000;
        else            count <= count + 1'b1;
    end
endmodule
`, wavedrom: `{ signal: [
  { name: 'SCLK',  wave: '0..10101010.' },
  { name: 'CS',    wave: '1.0........1' },
  { name: 'MOSI',  wave: 'x..0101100x', data: ['D7','D6','D5','D4','D3','D2','D1','D0'] },
  { name: 'MISO',  wave: 'x..0101100x', data: ['Q7','Q6','Q5','Q4','Q3','Q2','Q1','Q0'] }
],
  head: { text: 'SPI transaction: 8 bits, MSB first, sampled on rising edge of SCLK' } }` },
          { id: 'p4m4l2', title: 'Testbenches and simulation', type: 'exercise', duration_min: 75, summary: 'Testbench: toggle clk every 5 ns, assert rst, run for 200 ns, $dumpfile/$dumpvars for waveforms. View .vcd in GTKWave.', key_takeaways: ['Testbench is a separate Verilog module', '$dumpvars saves all signals to .vcd', 'GTKWave is the open-source waveform viewer'], has_verilog: true, verilog_starter: `// 4-bit counter (the DUT — synthesized and visualized by digitaljs).
module counter(
    input  wire        clk,
    input  wire        rst,
    output reg  [3:0]  count
);
    always @(posedge clk or posedge rst) begin
        if (rst)        count <= 4'b0000;
        else            count <= count + 1'b1;
    end
endmodule

// Testbench (documentation only — Yosys synthesizes the DUT above).
// In a real flow you would run this with iverilog + GTKWave:
//   iverilog -o sim counter_tb.v counter.v && vvp sim && gtkwave dump.vcd
module counter_tb;
    reg        clk = 0;
    reg        rst = 1;
    wire [3:0] count;
    counter dut(.clk(clk), .rst(rst), .count(count));
    initial begin
        clk = 0; rst = 1;
        #10  rst = 0;
        #200 $finish;
    end
    always #5 clk = ~clk;
endmodule
` },
        ],
        projects: [
          { id: 'p4m4pr1', title: 'Simulate Counter in Icarus Verilog', goal: 'Write testbench and verify 4-bit counter.', tools: ['Icarus Verilog (iverilog)', 'GTKWave'], steps: ['Write testbench: toggle clk every 5 ns, assert rst 10 ns at start, run 200 ns', 'Dump waveforms with $dumpfile/$dumpvars', 'Open .vcd in GTKWave. Confirm count goes 0,1,...,15,0,1,...', 'Feed same module to Vivado, confirm synthesizes with no warnings'], pass_criteria: 'Count sequence is 0,1,2,...,15,0,1,...; synthesizes cleanly.', difficulty: 'Intermediate', estimated_hours: 2 },
        ],
        checkpoints: [
          'What is difference between = and <= in Verilog?',
          'What does always @(posedge clk) describe? always @(*)?',
          'Write Verilog module for 4:1 mux.',
          'What is a testbench? Why need one in HDL but not in C?',
          'Why is Verilog not "just another programming language"?',
        ],
      },
      { id: 'p4m5', title: 'FPGA Basics with Vivado and Artix-7', description: 'CLBs, LUTs, slices. Design flow: design entry → sim → synth → impl → bitstream → program → debug with ILA.',
        duration_hours: 7, difficulty: 'Intermediate',
        lessons: [
          { id: 'p4m5l1', title: 'FPGA architecture: CLBs, LUTs, routing', type: 'reading', duration_min: 60, summary: 'Sea of configurable logic blocks (CLBs), each with a 6-input LUT and a flop, interconnected by programmable routing. Synthesizer maps RTL to LUTs; P&R fits them; bitstream downloaded.', key_takeaways: ['CLB = LUT + flop + fast carry logic', '6-input LUT is the universal logic element', 'DSPs and BRAMs are dedicated blocks for arithmetic and memory'], has_verilog: true, verilog_starter: `// Pipelined 16-bit adder — two-stage pipeline for FPGA timing closure.
// sum_p1 holds the combinational a+b (Stage 1 flop).
// sum     holds sum_p1 (Stage 2 flop).
// Synthesize this and notice how the Yosys netlist has two DFF banks
// separated by an adder — exactly the CLB/LUT pipeline the lesson describes.
module pipe_add(
    input  wire        clk,
    input  wire        rst,
    input  wire [15:0] a,
    input  wire [15:0] b,
    output reg  [16:0] sum
);
    reg [16:0] sum_p1;
    always @(posedge clk or posedge rst) begin
        if (rst) begin
            sum_p1 <= 17'd0;
            sum    <= 17'd0;
        end else begin
            sum_p1 <= a + b;
            sum    <= sum_p1;
        end
    end
endmodule
` },
          { id: 'p4m5l2', title: 'The FPGA design flow', type: 'reading', duration_min: 75, summary: 'Design Entry (Verilog + .xdc constraints) → Simulation (testbench) → Synthesis (RTL → LUTs) → Implementation (P&R) → Bitstream → Program → On-chip debug with ILA.', key_takeaways: ['.xdc maps ports to physical pins and voltage standards', 'ILA (Integrated Logic Analyzer) captures internal signals for debug', 'Always simulate before touching hardware'] },
        ],
        projects: [
          { id: 'p4m5pr1', title: 'FPGA: Implement Traffic-Light FSM from 4.3', goal: 'Port Arduino traffic-light FSM to Artix-7.', tools: ['Vivado WebPACK', 'Nexys A7 or Basys 3 board'], steps: ['Same FSM as 4.3. Map 6 outputs to 6 LEDs on board', 'Use 100 MHz on-board clock, divide down to 1 Hz with counter', 'Write .xdc file mapping each port to right pin', 'Verify LEDs cycle through FSM exactly as Arduino did', 'Insert ILA on state register, trigger on state transition, capture sequence'], pass_criteria: 'FSM cycles correctly on hardware; ILA captures state transitions.', difficulty: 'Intermediate', estimated_hours: 4 },
        ],
        checkpoints: [
          'What is a CLB? A LUT? A slice?',
          'List steps of FPGA design flow.',
          'What is in .xdc file? Why need it?',
          'How debug FPGA design that works in sim but not on hardware?',
          'Compare FPGA and ASIC design flows. When choose each?',
        ],
      },
      { id: 'p4m6', title: 'Microcontrollers: Arduino to STM32', description: 'MCU = CPU + RAM + flash + peripherals. Arduino abstracts; STM32 makes you deal with registers via HAL or LL. Clock trees, low-power modes.',
        duration_hours: 9, difficulty: 'Intermediate',
        cs_bridge: 'MCU ↔ tiny computer with memory-mapped I/O. Each peripheral is a set of memory-mapped registers; you write device drivers by reading and writing those registers. Arduino abstracts this; STM32 makes you deal with it directly — closer to embedded Linux driver development.',
        lessons: [
          { id: 'p4m6l1', title: 'Arduino abstraction and its limits', type: 'reading', duration_min: 60, summary: 'pinMode, digitalWrite, analogRead, etc. wrap AVR register writes. digitalWrite takes ~5 μs because of pin-number lookup. For sub-μs timing, bypass the abstraction.', key_takeaways: ['Arduino is great for prototyping', 'Abstraction hides timing — digitalWrite is slow (~5 μs)', 'For tight timing, write registers directly'] , wokwi_url: 'https://wokwi.com/projects/328014521436533262', has_wokwi_elements: true},
          { id: 'p4m6l2', title: 'STM32 — the real-world MCU', type: 'reading', duration_min: 75, summary: 'ARM Cortex-M cores. F103 (cheap, Blue Pill), F446 (168 MHz, FPU, Nucleo), H7 (480 MHz). STM32CubeIDE for config + code. HAL for portability, LL for performance, bare-metal for max.', key_takeaways: ['STM32 is the workhorse of modern embedded', 'CubeMX graphical config generates initialization code', 'HAL is portable but slow; LL is fast but vendor-specific'] },
          { id: 'p4m6l3', title: 'Clock trees and low-power modes', type: 'reading', duration_min: 60, summary: 'HSE/HSI → PLL → AHB → APB1/APB2 → peripherals. Each peripheral has prescaler. Low-power: Sleep, Stop, Standby gate clock to idle peripherals. Battery devices spend most time in Stop.', key_takeaways: ['Clock tree config is first step of any STM32 project', 'Mistakes here → wrong UART baud, broken SPI timing', 'Stop mode: ~10 μA, wake on interrupt in μs'] },
        ],
        projects: [
          { id: 'p4m6pr1', title: 'Bench: STM32 GPIO Toggle at 1 Hz and 1 MHz', goal: 'Feel difference between HAL and direct register access.', tools: ['STM32 Nucleo-F446RE', 'scope'], steps: ['Toggle GPIO at 1 Hz using HAL_GPIO_TogglePin + HAL_Delay', 'Toggle same GPIO at max speed using direct register writes (GPIOx->BSRR)', 'Scope output, measure toggle frequency'], pass_criteria: 'With HAL: ~100 kHz. With direct writes on F446: ~84 MHz. 1000× faster.', difficulty: 'Intermediate', estimated_hours: 2 },
        ],
        checkpoints: [
          'What is difference between Arduino and STM32 from dev perspective?',
          'Sketch MCU clock tree: HSE → PLL → AHB → APB1/APB2 → peripherals.',
          'How configure STM32 GPIO as output push-pull at 50 MHz?',
          'What is DMA? Why faster than interrupt-driven I/O?',
          'Name 3 low-power modes on STM32. When use each?',
        ],
      },
      { id: 'p4m7', title: 'Interrupts, Timers, ADC, DAC, PWM', description: 'NVIC with 16 priority levels. Timers: up/down/up-down, compare, capture, PWM. ADC: SAR, 1-5 MSPS. PWM: duty=CCR/ARR.',
        duration_hours: 9, difficulty: 'Intermediate',
        lessons: [
          { id: 'p4m7l1', title: 'Interrupts and NVIC', type: 'reading', duration_min: 60, summary: 'Vector table maps sources to handlers. CPU saves state, jumps, restores. ARM Cortex-M NVIC: 16 priority levels, higher preempts lower. Rule: handlers short (μs, not ms). Long work → flag + process in main loop.', key_takeaways: ['Handlers must be short — microseconds, not milliseconds', 'NVIC supports nested preemption', 'Long work: set flag in handler, process in main loop'] , wokwi_url: 'https://wokwi.com/projects/255116253193679131'},
          { id: 'p4m7l2', title: 'Timers and PWM', type: 'reading', duration_min: 75, summary: 'Timer = counter + clock. Count up/down/up-down. Interrupts on overflow/compare/capture. PWM: f=f_timer/(prescaler·ARR), duty=CCR/ARR, resolution=log₂(ARR) bits.', key_takeaways: ['PWM frequency = f_timer / (prescaler · ARR)', 'Duty cycle = CCR / ARR', 'Resolution = log₂(ARR) bits'] },
          { id: 'p4m7l3', title: 'ADCs and sampling', type: 'reading', duration_min: 60, summary: 'SAR ADC: n-bit needs n clock cycles. STM32 ADCs: 1-5 MSPS, 12-bit. Anti-alias filter required (low-pass at f_s/2). Sample-and-hold cap charges through source impedance — high-Z source needs buffer or longer sample time.', key_takeaways: ['Anti-alias filter is non-negotiable', 'Sample-and-hold needs low source impedance', 'Oversampling + decimation relaxes analog filter requirements'] },
        ],
        projects: [
          { id: 'p4m7pr1', title: 'Bench: STM32 PWM Motor Speed Control', goal: 'Control DC motor speed with PWM from STM32.', tools: ['STM32 Nucleo', 'L298N motor driver', '6V DC motor', '12V supply', 'IR reflective sensor'], steps: ['PWM: 10 kHz, 8-bit (0-255). Timer 1 channel 1', 'CCR controls duty (0=stop, 255=full)', 'Sweep CCR 0 to 255 in steps of 16, measure RPM with IR sensor', 'Plot RPM vs duty cycle. Note dead zone at low duty (~30% to overcome friction)'], pass_criteria: 'RPM vs duty curve plotted, dead zone identified.', difficulty: 'Intermediate', estimated_hours: 3 },
        ],
        checkpoints: [
          'What is NVIC? How do priorities work in ARM Cortex-M?',
          'Compute PWM frequency for 84 MHz timer with prescaler=83, ARR=999.',
          'What is sample-and-hold? Why does ADC need it?',
          'What is aliasing? How prevent when sampling audio?',
          'Why should interrupt handlers be short?',
        ],
      },
      { id: 'p4m8', title: 'Communication: UART, SPI, I2C, CAN', description: 'UART (point-to-point, 9600-3Mbaud). SPI (bus with CS, 1-50 MHz). I2C (addressed, 100kHz-3.4MHz). CAN (automotive, differential, 1 Mbit/s).',
        duration_hours: 7, difficulty: 'Intermediate',
        cs_bridge: 'Serial protocols ↔ network protocols. UART = TCP socket without retries. SPI = USB hub with explicit CS. I2C = Ethernet with MAC addressing. CAN = contention-based LAN. Same trade-offs (latency vs throughput, complexity vs robustness) appear in every protocol.',
        lessons: [
          { id: 'p4m8l1', title: 'Four protocols compared', type: 'reading', duration_min: 75, summary: 'UART: 2 wires (TX/RX), point-to-point, 9600-3Mbaud, debug serial. SPI: 4 wires (MOSI/MISO/SCK/CS), bus with CS per slave, 1-50 MHz, fast ADCs. I2C: 2 wires (SDA/SCL), multi-drop addressed, 100kHz-3.4MHz, sensors. CAN: 2 wires (H/L), differential, 1 Mbit/s, automotive.', key_takeaways: ['UART = point-to-point, simplest', 'SPI = fast, but CS per slave', 'I2C = addressed, only 2 wires', 'CAN = robust, differential, multi-master'], wavedrom: `{ signal: [\n  { name: 'SCK',  wave: '0..n......0.' },\n  { name: 'CS',   wave: '1.0.........1' },\n  { name: 'MOSI', wave: 'x.2345678x.', data: ['8','7','6','5','4','3','2','1'] },\n  { name: 'MISO', wave: 'x.abcdefghx.', data: ['a','b','c','d','e','f','g','h'] }\n],\n  head: { text: 'SPI: 8-bit full-duplex transaction (CS low enables slave)' },\n  foot: { text: 'Master clocks SCK; MOSI carries master→slave, MISO slave→master.' } }` },
          { id: 'p4m8l2', title: 'I2C addressing and arbitration', type: 'reading', duration_min: 60, summary: '7-bit (or 10-bit) addresses, every device unique. Master generates SCL. Multi-master: collision detection by wired-AND (0 wins over 1). Pull-ups (4.7kΩ) set idle state.', key_takeaways: ['I2C needs pull-up resistors (~4.7kΩ)', 'Wired-AND arbitration: 0 wins over 1', 'I2C is slow but cheap (2 wires) — dominates sensor connectivity'] },
        ],
        projects: [
          { id: 'p4m8pr1', title: 'Bench: STM32 + BME280 over I2C', goal: 'Read temperature, humidity, pressure from BME280 over I2C.', tools: ['STM32 Nucleo', 'BME280 breakout', 'wires'], steps: ['Wire: BME280 VCC→3.3V, GND→GND, SDA→PB7, SCL→PB6 (I2C1)', 'Address: 0x76 or 0x77 depending on SDO pin', 'Use HAL I2C: HAL_I2C_Mem_Read to read calibration and data registers', 'Apply Bosch compensation formulas from datasheet'], pass_criteria: 'Temp within ±1°C of thermometer, pressure within ±5% of weather report.', difficulty: 'Intermediate', estimated_hours: 3 },
        ],
        checkpoints: [
          'Compare UART, SPI, I2C: wires, topology, speed, addressing.',
          'Why does I2C need pull-up resistors? What value, why?',
          'How does I2C arbitration work? Can SPI do same?',
          'Why is CAN used in cars instead of I2C?',
        ],
      },
      { id: 'p4m9', title: 'ESP32 and Wireless Connectivity', description: 'Dual-core Xtensa 240MHz with WiFi + BT. ESP-IDF (FreeRTOS-based) or Arduino-ESP32. OTA updates. Deep sleep.',
        duration_hours: 7, difficulty: 'Intermediate',
        lessons: [
          { id: 'p4m9l1', title: 'ESP32 architecture and WiFi stack', type: 'reading', duration_min: 60, summary: 'Dual-core Xtensa LX6 @ 240MHz, WiFi + BT, lots of peripherals, ULP coprocessor. WiFi stack is a FreeRTOS task. Patterns: HTTP client/server, MQTT, WebSocket.', key_takeaways: ['ESP32 is the de-facto standard for cheap IoT', 'WiFi stack runs as FreeRTOS task', 'ESP-IDF is more powerful than Arduino-ESP32'] , wokwi_url: 'https://wokwi.com/projects/327320285947308499'},
          { id: 'p4m9l2', title: 'OTA updates and power management', type: 'reading', duration_min: 60, summary: 'OTA: download new firmware over HTTPS to unused partition, verify, swap boot partition, reboot. Dual-bank flash makes it safe. Deep sleep: 10 μA, wake on timer or GPIO.', key_takeaways: ['OTA uses dual-bank flash for safe updates', 'Deep sleep is essential for battery devices', 'Compute battery life: I_avg = (I_active·t_active + I_sleep·t_sleep) / T'] },
        ],
        projects: [
          { id: 'p4m9pr1', title: 'Bench: ESP32 WiFi Telemetry Dashboard', goal: 'Publish BME280 sensor data to cloud dashboard via MQTT.', tools: ['ESP32 devkit', 'BME280', 'WiFi', 'MQTT broker (HiveMQ/Mosquitto)', 'Node-RED or Grafana'], steps: ['Every 30s: read sensor, publish JSON to sensors/esp32-01', 'Connect web dashboard that subscribes and plots', 'Measure current: deep sleep between readings, wake on timer. Target: 100μA average', 'Compute battery life on 2× AA', 'Extension: add OTA — push firmware over MQTT and verify device updates'], pass_criteria: 'Dashboard plots data in real time; battery life > 1 month on 2× AA.', difficulty: 'Intermediate', estimated_hours: 4 },
        ],
        checkpoints: [
          'What is ESP-IDF? How differs from Arduino-ESP32 core?',
          'How does ESP32 OTA work? Why is dual-bank flash important?',
          'Compute battery life: wake every 60s for 200ms (200mA), sleep at 10μA, on 2000mAh Li-ion.',
          'When choose ESP32 over STM32? When reverse?',
        ],
      },
      { id: 'p4m10', title: 'Phase 4 Capstone: Digital FSM + MCU Driver', description: 'STM32 reads BME280 over I2C, sends over SPI to FPGA. FPGA FSM displays temp on 7-seg, triggers alarms.',
        duration_hours: 14, difficulty: 'Intermediate',
        lessons: [],
        projects: [
          { id: 'p4m10pr1', title: 'Phase 4 Capstone: FPGA FSM + STM32 Sensor Driver', goal: 'Build a system where FPGA FSM drives STM32 over SPI to read sensors.', tools: ['STM32 Nucleo', 'BME280', 'Artix-7 FPGA board', '7-seg display', 'LEDs'], steps: ['STM32 (master) reads BME280 over I2C, formats data, sends over SPI to FPGA', 'FPGA FSM: IDLE → RECEIVING → UPDATE_DISPLAY → CHECK_ALARMS → IDLE', 'Verilog SPI slave with synchronizer for SPI clock', 'Wire boards together. Verify: breathe on BME280 → temp rises → display updates within 100 ms'], pass_criteria: 'End-to-end: breathing on sensor updates display within 100 ms.', difficulty: 'Intermediate', estimated_hours: 14 },
        ],
        checkpoints: [
          'How would you debug SPI link that works at 100 kHz but fails at 10 MHz?',
          'Why need synchronizer on SPI clock inside FPGA?',
          'How does DMA improve SPI throughput? When does it not help?',
          'What is difference between Moore and Mealy FSM in Verilog implementation?',
        ],
      },
    ],
  },

  // Phase 5-10 — condensed (the full content lives in the PDF; the website shows summaries)
  {
    id: 'p5', index: 5, title: 'Signals, Systems & DSP', subtitle: 'Fourier, Laplace, Z, FFT, FIR/IIR',
    description: 'Master the frequency-domain machinery — Fourier, Laplace, Z, DFT, FFT — and build a real-time audio spectrum analyzer and EQ on the ESP32. The most math-heavy phase; as a CS engineer, you already know the FFT algorithm and the discrete-sequence data structure.',
    duration_weeks: 7, color: '#c23a94',
    goal: 'Build a real-time audio spectrum analyzer + 5-band EQ on ESP32.',
    modules: [
      { id: 'p5m1', title: 'Continuous-Time Signals and Systems', description: 'Linearity, time-invariance, causality. LTI systems. Convolution. Impulse response.',
        duration_hours: 6, difficulty: 'Foundation',
        cs_bridge: 'Convolution ↔ 1D image filter. A 3×3 image convolution kernel and a 1D FIR filter are the same operation. Image: y[i,j]=ΣΣ h[k,l]·x[i−k,j−l]. Signal: y[n]=Σ h[k]·x[n−k]. A blur kernel is a 2D moving-average filter.',
        lessons: [
          { id: 'p5m1l1', title: 'LTI systems: linearity, time-invariance, causality', type: 'reading', duration_min: 60, summary: 'Linear: T{a·x₁+b·x₂}=a·T{x₁}+b·T{x₂}. Time-invariant: x(t−τ)→y(t−τ). Causal: y(t) depends only on x(τ) for τ≤t.', key_takeaways: ['LTI systems are the analyzable class', 'Convolution and Fourier require LTI', 'Causality matters for real-time systems'] },
          { id: 'p5m1l2', title: 'Impulse response and convolution', type: 'reading', duration_min: 75, summary: 'Response to δ(t) characterizes LTI system. y(t)=(x∗h)(t)=∫x(τ)·h(t−τ)dτ. Central theorem of LTI theory.', key_takeaways: ['h(t) = response to δ(t)', 'y(t) = (x ∗ h)(t) = ∫x(τ)·h(t−τ)dτ', 'Convolution is the natural operation for LTI systems'], has_playground: true },
        ],
        projects: [], checkpoints: [],
      },
      { id: 'p5m2', title: 'LTI Systems: Convolution and Eigenfunctions', description: 'Complex exponentials are eigenfunctions of LTI systems. H(jω) is the eigenvalue — frequency response.',
        duration_hours: 6, difficulty: 'Foundation',
        lessons: [
          { id: 'p5m2l1', title: 'Eigenfunctions and frequency response', type: 'reading', duration_min: 75, summary: 'e^(jωt) into LTI system → H(jω)·e^(jωt). Same function, scaled by complex H(jω). This is why sinusoids are special — they pass through LTI systems unchanged in shape.', key_takeaways: ['e^(jωt) is eigenfunction of any LTI system', 'H(jω) is the eigenvalue = frequency response', 'Foundation of all frequency-domain analysis'] },
        ],
        projects: [], checkpoints: [],
      },
      { id: 'p5m3', title: 'Fourier Series and CTFT', description: 'Periodic → Fourier series (harmonic sinusoids). Aperiodic → Fourier transform. Properties: time/freq shift, scaling, convolution, multiplication, Parseval.',
        duration_hours: 9, difficulty: 'Intermediate',
        lessons: [
          { id: 'p5m3l1', title: 'Fourier transform pairs and properties', type: 'reading', duration_min: 90, summary: 'X(jω)=∫x(t)·e^(−jωt)dt. Key pairs: δ↔1, rect↔sinc, e^(−at)u(t)↔1/(a+jω). Convolution theorem: x∗h↔X·H.', key_takeaways: ['Impulse ↔ flat spectrum (all frequencies equal)', 'Rectangle pulse ↔ sinc (shorter pulse = wider spectrum)', 'Convolution in time = multiplication in frequency'] },
          { id: 'p5m3l2', title: 'Properties: shift, scale, Parseval', type: 'reading', duration_min: 60, summary: 'Time shift: x(t−τ)↔e^(−jωτ)·X(jω). Time scale: x(at)↔(1/|a|)·X(jω/a). Parseval: ∫|x|²dt=(1/2π)·∫|X|²dω — energy conserved.', key_takeaways: ['Time shift = phase shift only', 'Time compression = frequency expansion', 'Parseval: energy conserved between domains'], has_playground: true },
        ],
        projects: [
          { id: 'p5m3pr1', title: 'Python: Fourier Series of a Square Wave', goal: 'See how a square wave is built from sinusoids.', tools: ['Python', 'numpy', 'matplotlib'], steps: ['Synthesize 1 kHz square wave by summing first N odd harmonics (1,3,5,7,...)', 'Plot for N=1,3,7,21,101. Watch square emerge.', 'Square wave = (4/π)·Σ(1/(2k+1))·sin((2k+1)·ω₀t)'], pass_criteria: 'Square wave emerges clearly at N=101.', difficulty: 'Intermediate', estimated_hours: 1.5 },
        ],
        checkpoints: [],
      },
      { id: 'p5m4', title: 'Laplace Transform and the s-Domain', description: 'Generalizes Fourier with complex s=σ+jω. Differentiation → multiplication by s. Poles in LHP = stable.',
        duration_hours: 9, difficulty: 'Intermediate',
        lessons: [
          { id: 'p5m4l1', title: 'Laplace transform and pole/zero analysis', type: 'reading', duration_min: 90, summary: 'X(s)=∫x(t)·e^(−st)dt. Poles of H(s)=N(s)/D(s) are roots of D. LHP poles = stable. jω axis = sustained oscillation. RHP = unstable.', key_takeaways: ['Laplace handles signals Fourier cannot (growing exponentials)', 'Pole locations determine stability', 'Fourier is Laplace evaluated on jω axis'], has_playground: true, formulas: [{ label: 'Transfer function (rational form)', latex: 'H(s) = \\dfrac{N(s)}{D(s)} = K\\,\\dfrac{\\prod_{i}(s - z_i)}{\\prod_{k}(s - p_k)}' }, { label: 'Stability criterion', latex: '\\Re(p_k) < 0 \\;\\;\\forall k \\;\\Longleftrightarrow\\; \\text{stable}' }] },
        ],
        projects: [
          { id: 'p5m4pr1', title: 'Python: Solve RLC Transient with Laplace', goal: 'Verify Laplace method matches direct ODE solution.', tools: ['Python', 'scipy.signal', 'numpy'], steps: ['Circuit: series RLC, R=10Ω, L=1mH, C=10μF, step input', 'H(s)=(1/LC)/(s²+(R/L)s+1/(LC))', 'Find poles: s=−5000±j·8660 (underdamped)', 'Inverse Laplace: v_C(t)=5·[1−e^(−5000t)·(cos 8660t + 0.577·sin 8660t)]', 'Compare to scipy.integrate.odeint and LTspice transient'], pass_criteria: 'All three methods overlay exactly.', difficulty: 'Intermediate', estimated_hours: 2 },
        ],
        checkpoints: [],
      },
      { id: 'p5m5', title: 'Sampling Theorem and Discrete-Time Signals', description: 'Nyquist-Shannon: f_s≥2·f_max. Aliasing. Anti-alias filter. ZOH reconstruction.',
        duration_hours: 7, difficulty: 'Intermediate',
        cs_bridge: 'Aliasing ↔ texture mapping at wrong mip level. In graphics, sampling a high-frequency texture without mip-mapping produces moiré patterns — aliasing. The Nyquist theorem is the DSP version: low-pass before sample, or high frequencies alias. Same math underlies MSAA in graphics.',
        lessons: [
          { id: 'p5m5l1', title: 'Nyquist-Shannon sampling theorem', type: 'reading', duration_min: 75, summary: 'Band-limited signal with max freq f_max can be perfectly reconstructed from samples at f_s≥2·f_max. Below: aliasing (high freq folds back into baseband, irrecoverable).', key_takeaways: ['Nyquist rate = 2 × f_max', 'Aliasing is irreversible — must prevent with anti-alias filter', 'CD audio: 44.1 kHz for 20 kHz audio, 2.1 kHz transition band'] },
        ],
        projects: [
          { id: 'p5m5pr1', title: 'Python: Aliasing Demo', goal: 'See aliasing numerically.', tools: ['Python', 'numpy', 'matplotlib'], steps: ['Sample 10 kHz sine at 8 kHz. Samples look like 2 kHz sine (10−8=2). Verify by FFT.', 'Now sample at 25 kHz. No aliasing; FFT shows clean 10 kHz peak.', 'Add 4 kHz low-pass before 8 kHz sampler. 10 kHz filtered out; samples near zero. No alias.'], pass_criteria: 'Aliased spectrum shows 2 kHz peak; clean spectrum shows 10 kHz peak.', difficulty: 'Intermediate', estimated_hours: 1.5 },
        ],
        checkpoints: [],
      },
      { id: 'p5m6', title: 'Z-Transform and Discrete-Time Systems', description: 'X(z)=Σx[n]·z^(−n). z=e^(sT). LHP s-plane ↔ inside unit circle z-plane. Difference equations and H(z).',
        duration_hours: 8, difficulty: 'Intermediate',
        lessons: [
          { id: 'p5m6l1', title: 'Z-transform and stability', type: 'reading', duration_min: 90, summary: 'z=e^(sT). jω axis ↔ unit circle. LHP ↔ inside |z|=1. Difference equation y[n]=−Σa_k·y[n−k]+Σb_k·x[n−k] → H(z)=(Σb_k·z^(−k))/(1+Σa_k·z^(−k)). FIR if all a_k=0; IIR otherwise.', key_takeaways: ['z = e^(sT) maps s-plane to z-plane', 'Stable iff all poles inside |z|=1', 'FIR: all zeros, no feedback, always stable. IIR: has feedback, can be unstable'], has_playground: true },
        ],
        projects: [], checkpoints: [],
      },
      { id: 'p5m7', title: 'DTFT, DFT, and FFT', description: 'DFT: X[k]=Σx[n]·e^(−j2πkn/N). FFT: O(N log N) via Cooley-Tukey divide-and-conquer. Windows reduce spectral leakage.',
        duration_hours: 9, difficulty: 'Intermediate',
        cs_bridge: 'FFT ↔ divide-and-conquer sorting. FFT is to DFT as mergesort is to sorting. Radix-2 splits N-point DFT into two N/2-point DFTs (even/odd), recurses. Cooley-Tukey 1965 (Gauss knew it in 1805). Same butterfly pattern in JPEG\'s DCT.',
        lessons: [
          { id: 'p5m7l1', title: 'DFT and spectral leakage', type: 'reading', duration_min: 75, summary: 'X[k]=Σx[n]·e^(−j2πkn/N). Bin k ↔ freq f_k=k·f_s/N. Treats x[n] as one period of periodic signal. Energy leaks between bins (spectral leakage). Window (Hann, Hamming, Blackman) reduces leakage at cost of wider main lobe.', key_takeaways: ['Bin k ↔ frequency k·f_s/N', 'Spectral leakage: energy spreads to adjacent bins', 'Windowing reduces leakage but widens main lobe'], has_playground: true },
          { id: 'p5m7l2', title: 'FFT algorithm: Cooley-Tukey radix-2', type: 'reading', duration_min: 75, summary: 'Split N-point DFT into even/odd N/2-point DFTs. X[k]=E[k]+W_N^k·O[k]. Recurse to 1-point. log₂(N) levels, O(N) work each. Total O(N log N) vs DFT O(N²).', key_takeaways: ['FFT requires N power of 2', 'O(N log N) vs O(N²) for direct DFT', 'Twiddle factors W_N=e^(−j2π/N) precomputed'], has_scope: true },
        ],
        projects: [
          { id: 'p5m7pr1', title: 'Python: Real-Time Audio Spectrum Analyzer', goal: 'Build real-time spectrum analyzer on laptop.', tools: ['Python', 'sounddevice', 'numpy.fft', 'matplotlib'], steps: ['Capture audio from mic using sounddevice', 'Window each 1024-sample block with Hann', 'FFT, plot magnitude in dB vs frequency, 30 fps', 'Whistle, clap, play tone — confirm peaks at right frequencies', 'Extension: waterfall display (time x freq x magnitude)'], pass_criteria: 'Real-time display shows peaks at correct frequencies.', difficulty: 'Intermediate', estimated_hours: 3 },
        ],
        checkpoints: [],
      },
      { id: 'p5m8', title: 'FIR and IIR Filter Design', description: 'FIR: windowed sinc, linear phase, always stable. IIR: bilinear transform of analog Butterworth/Chebyshev/elliptic, fewer coefficients, nonlinear phase.',
        duration_hours: 9, difficulty: 'Advanced',
        lessons: [
          { id: 'p5m8l1', title: 'FIR design: windowed sinc', type: 'reading', duration_min: 75, summary: 'Ideal LP has brick-wall freq response ↔ infinite sinc in time. Truncate to N taps, window (Hann/Hamming/Blackman) to reduce sidelobes. Linear phase (symmetric impulse). N sets transition bandwidth: Δf≈4·f_s/N for Hann.', key_takeaways: ['FIR has exactly linear phase (if symmetric)', 'Longer FIR = sharper transition', 'Window choice trades sidelobe level for main lobe width'] },
          { id: 'p5m8l2', title: 'IIR design: bilinear transform of analog prototypes', type: 'reading', duration_min: 75, summary: 'Design analog (Butterworth/Chebyshev/elliptic) via tables or scipy.signal. Transform: s→(2/T)·(1−z⁻¹)/(1+z⁻¹). Pre-warp cutoff. IIR much shorter than FIR but nonlinear phase, can be unstable.', key_takeaways: ['IIR is shorter than FIR for same selectivity', 'IIR has nonlinear phase — bad for audio', 'Bilinear transform preserves magnitude but warps frequency axis'], has_playground: true },
        ],
        projects: [
          { id: 'p5m8pr1', title: 'Python + ESP32: Real-Time Audio EQ', goal: 'Build 3-band (bass/mid/treble) audio equalizer.', tools: ['ESP32', 'INMP441 I2S mic', 'MAX98357A I2S DAC', 'speaker', 'OLED'], steps: ['Frontend: ESP32 with I2S MEMS mic at 16 kHz, output via I2S DAC to speaker', 'Three parallel IIR filters (LP at 200Hz, BP at 1kHz, HP at 5kHz), each with gain control. Sum outputs.', 'ESP32 with ESP-IDF, I2S DMA, filters sample-by-sample in callback (~0.5 μs/sample/filter)', 'Feed sweep 20 Hz–8 kHz. Adjust bass knob — low-freq output changes. Same for mid/treble.', 'Extension: OLED showing real-time FFT spectrum'], pass_criteria: 'Each EQ band adjusts its frequency range; spectrum shows correct response.', difficulty: 'Advanced', estimated_hours: 8 },
        ],
        checkpoints: [],
      },
      { id: 'p5m9', title: 'Adaptive Filters (Intro)', description: 'LMS: w[n+1]=w[n]+μ·e[n]·x[n]. Applications: noise cancellation, echo cancellation, channel equalization, system ID.',
        duration_hours: 6, difficulty: 'Advanced',
        cs_bridge: 'LMS ↔ stochastic gradient descent. LMS is literally SGD on mean-square error cost J=E[|e|²]. Gradient is −2·e[n]·x[n]; update w+=μ·e·x is SGD with learning rate μ. Same algorithm powers every neural network. Convergence condition same as SGD.',
        lessons: [
          { id: 'p5m9l1', title: 'LMS algorithm and applications', type: 'reading', duration_min: 75, summary: 'w[n+1]=w[n]+μ·e[n]·x[n]. e[n]=d[n]−w^T·x[n]. Applications: noise cancellation (headphones), echo cancellation (speakerphones), channel equalization (modems), system identification.', key_takeaways: ['LMS = SGD on MSE cost', 'μ too large → unstable; too small → slow convergence', 'Input must be persistently exciting for convergence'], has_playground: true },
        ],
        projects: [
          { id: 'p5m9pr1', title: 'Python: Noise Cancellation Demo', goal: 'Cancel a tonal noise from a signal.', tools: ['Python', 'numpy', 'matplotlib'], steps: ['signal = 1 kHz tone + white noise. Reference input = 1 kHz tone.', 'LMS: 32-tap FIR, μ=0.01. Filter reference, subtract from signal.', '1 kHz tone should cancel; white noise remains.', 'Plot spectrum before/after. 1 kHz peak should drop 40+ dB.'], pass_criteria: '1 kHz tone attenuated by 40+ dB; white noise unchanged.', difficulty: 'Advanced', estimated_hours: 2 },
        ],
        checkpoints: [],
      },
      { id: 'p5m10', title: 'Phase 5 Capstone: Software-Defined Audio', description: 'Combine FFT analysis with real-time filtering on ESP32. I2S mic → 256-pt Hann FFT → OLED display. Simultaneous 5-band IIR EQ → I2S DAC.',
        duration_hours: 16, difficulty: 'Advanced',
        lessons: [],
        projects: [
          { id: 'p5m10pr1', title: 'Phase 5 Capstone: Real-Time Audio Spectrum Analyzer + EQ', goal: 'Combine FFT analysis with real-time filtering on ESP32.', tools: ['ESP32', 'I2S mic', 'I2S DAC', 'OLED', 'rotary encoder'], steps: ['Architecture: I2S mic → 50% overlap buffer → 256-pt Hann → FFT → OLED magnitude (dB). Simultaneously 5-band IIR EQ filters audio; output via I2S DAC.', 'UI: rotary encoder adjusts selected band, button cycles bands. OLED: spectrum bar graph (top), EQ band gains (bottom).', 'Performance: FFT every 16 ms (60 Hz display), EQ sample-by-sample. CPU < 50% on ESP32 dual-core.'], pass_criteria: 'Spectrum analyzer updates at 60 Hz; EQ adjusts each band correctly; CPU < 50%.', difficulty: 'Advanced', estimated_hours: 16 },
        ],
        checkpoints: [],
      },
    ],
  },

  // Phase 6-10 — summary only (full content in PDF)
  {
    id: 'p6', index: 6, title: 'Control Systems & Robotics', subtitle: 'PID, root locus, Bode, state-space, kinematics',
    description: 'Master classical and modern control — root locus, Bode/Nyquist, PID, state-space — and apply it to closed-loop motor control and a line-following robot. Feedback is the engineering of error correction; you have already seen it in TCP congestion control and iterative optimization.',
    duration_weeks: 6, color: '#8c7443',
    goal: 'Build a closed-loop line-following robot with PID control.',
    modules: [
      { id: 'p6m1', title: 'Feedback, Modeling, Transfer Functions', description: 'Plant P(s), sensor H(s), controller C(s). T(s)=CP/(1+CPH). Characteristic equation 1+L(s)=0.',
        duration_hours: 6, difficulty: 'Intermediate',
        lessons: [{ id: 'p6m1l1', title: 'Feedback loop analysis', type: 'reading', duration_min: 75, summary: 'The closed-loop transfer function T(s)=C(s)P(s)/(1+C(s)P(s)H(s)) collapses the entire feedback architecture — controller, plant, and sensor — into one expression. The denominator 1+L(s)=0, where L=C·P·H is the loop gain, is the characteristic equation: its roots are the closed-loop poles and they alone decide stability. If any root has a positive real part the system is unstable, no matter how good the rest looks. This same algebra describes every feedback system — op-amps, motor speed loops, PLLs, biological homeostasis, the cruise control in your car — which is why one math toolkit serves all of EE. The next lessons (Routh-Hurwitz, root locus, Bode) are all tools for analyzing 1+L=0 without explicitly solving for its roots.', key_takeaways: ['Closed-loop TF: T = C·P/(1+C·P·H); loop gain L = C·P·H', 'Characteristic equation 1+L=0 — its roots are the closed-loop poles', 'Stability requires every closed-loop pole to lie in the left-half plane', 'Same algebra governs electrical, mechanical, thermal, fluid, and biological feedback'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p6m2', title: 'Stability: Routh-Hurwitz', description: 'Number of RHP poles from Routh array first-column sign changes. No need to solve for poles.',
        duration_hours: 6, difficulty: 'Intermediate',
        lessons: [{ id: 'p6m2l1', title: 'Routh-Hurwitz criterion', type: 'reading', duration_min: 75, summary: 'The Routh-Hurwitz criterion tells you how many poles of a polynomial lie in the right-half plane without solving for the poles explicitly. You build the Routh array from the polynomial coefficients: the first two rows are the coefficients taken in alternation, and each subsequent row is computed from the two rows directly above it. The number of sign changes in the first column equals the number of RHP poles. Zero sign changes means every pole is in the left-half plane and the closed-loop system is stable. This is essential for checking stability of high-order systems where finding roots analytically is impossible — a 5th-order characteristic equation has no closed-form root formula at all. It also gives you the range of a parameter (like a controller gain K) for which the system stays stable, which is exactly the kind of design question you face in practice.', key_takeaways: ['Routh array first-column sign changes = number of right-half-plane poles', 'Zero sign changes means all poles in LHP → system is stable', 'Works for any order polynomial without finding the roots', 'Solve for the gain range that keeps column 1 sign-definite to find stable K'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p6m3', title: 'Time-Domain Response and Steady-State Error', description: 't_r, t_p, %OS, t_s. System type (number of integrators). Step/ramp/parabola error constants.',
        duration_hours: 6, difficulty: 'Intermediate',
        lessons: [{ id: 'p6m3l1', title: 'Step response metrics and steady-state error', type: 'reading', duration_min: 75, summary: 'The second-order step response is fully characterized by two numbers: the natural frequency ω_n and the damping ratio ζ. Rise time t_r≈1.8/ω_n sets speed, percent overshoot %OS=e^(−πζ/√(1−ζ²))·100 sets ringing, and settling time t_s≈4/(ζω_n) (2% band) sets how long transients last. ζ≈0.7 gives about 5% overshoot — the usual design target because it balances speed against ringing. Steady-state error depends on system type N, the number of pure integrators in the loop: Type 0 has finite step error, Type 1 tracks a step with zero error but a ramp with finite error, Type 2 tracks both step and ramp with zero error but a parabola with finite error. Adding an integrator reduces error but also reduces stability margins — the central trade-off of control design.', key_takeaways: ['ζ and ω_n together fix the entire second-order transient shape', 'ζ≈0.7 is the usual design target: ~5% overshoot, fast settling', 'System type = number of integrators; higher type → lower steady-state error', 'Adding integrators reduces error but eats phase margin — the central accuracy/stability trade-off'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p6m4', title: 'Root Locus Design', description: 'How closed-loop poles move as K varies from 0 to ∞. Starts at OL poles, ends at OL zeros. Asymptotes, breakaway points.',
        duration_hours: 8, difficulty: 'Intermediate',
        lessons: [{ id: 'p6m4l1', title: 'Root locus rules and design', type: 'reading', duration_min: 90, summary: 'The root locus is the set of paths the closed-loop poles trace in the s-plane as the gain K varies from 0 to ∞. It starts at the open-loop poles (K=0) and ends at the open-loop zeros (K=∞); the difference (n−m) between pole and zero counts tells you how many branches head to infinity along asymptotes at angles (2k+1)π/(n−m) through the centroid (Σp−Σz)/(n−m). Real-axis segments belong to the locus if the count of real poles/zeros to their right is odd. Once you can sketch a locus in 30 seconds you can answer "what does raising K do to my transient?" without ever solving the characteristic equation. For design, a lead compensator adds a zero (pulls locus left → faster, more damping) while a lag compensator adds a pole near the origin (raises low-frequency loop gain → smaller steady-state error without disturbing the transient much).', key_takeaways: ['Root locus shows closed-loop pole migration vs gain K — from OL poles (K=0) to OL zeros (K=∞)', 'n−m branches run to infinity along asymptotes through the centroid', 'Lead compensation adds a zero → faster, better damped transient', 'Lag compensation adds a pole near the origin → reduces steady-state error'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p6m5', title: 'Frequency Response: Bode, Nyquist, Margins', description: 'Bode (separate mag/phase vs freq). Nyquist (polar). Gain margin, phase margin. PM 30-60° typical.',
        duration_hours: 8, difficulty: 'Intermediate',
        lessons: [{ id: 'p6m5l1', title: 'Bode, Nyquist, gain and phase margin', type: 'reading', duration_min: 90, summary: 'Gain margin (GM) is how much you can multiply the loop gain by before the system hits instability; phase margin (PM) is how much additional phase lag you can tolerate at the gain-crossover frequency (where |L|=1) before the same thing happens. PM is the more useful number in practice because real systems have phase uncertainty from unmodeled delays and parasitics, whereas gain usually tracks the design closely. As a rule of thumb, PM≈30° gives ~20% overshoot, PM≈60° gives ~8% overshoot, and PM≈90° gives none — so 45-60° is the typical design target. Bandwidth and rise time are linked by BW≈1.8/t_r, so picking a bandwidth is the same as picking a response speed. The Nyquist plot is the polar version of the Bode plot and is the only tool that rigorously handles open-loop unstable systems and RHP zeros via the encirclement count.', key_takeaways: ['PM is more useful than GM in practice — real systems have phase uncertainty', 'PM 45-60° is the typical design target: ~5-15% overshoot, well damped', 'Bandwidth ≈ 1.8 / rise time — picking one fixes the other', 'Nyquist (polar) is the rigorous general tool; Bode (separate mag/phase) is the everyday one'], has_playground: true, has_bode: true, formulas: [{ label: 'Phase margin', latex: 'PM = 180^\\circ + \\angle L(j\\omega_c), \\quad |L(j\\omega_c)|=1' }, { label: 'Gain margin', latex: 'GM = \\dfrac{1}{|L(j\\omega_{180})|}, \\quad \\angle L(j\\omega_{180})=-180^\\circ' }, { label: 'Bandwidth vs rise time', latex: 'BW \\approx \\dfrac{1.8}{t_r}' }, { label: 'PM ↔ overshoot (approx)', latex: 'PM = 90^\\circ - \\tan^{-1}\\!\\!\\left(\\dfrac{\\zeta}{\\sqrt{1-2\\zeta^2+\\sqrt{1+4\\zeta^4}}}\\right)' }], bode: { numerator: [1], denominator: [1, 0.4, 1], label: 'Open-loop L(s): ωₙ=1, ζ=0.2 — PM ≈ 23° (oscillatory)', note: 'This loop has poor phase margin. Increase the s coefficient (damping) until the resonant peak disappears and PM > 45°.' } }],
        projects: [], checkpoints: [],
      },
      { id: 'p6m6', title: 'PID Design and Tuning', description: 'P (fast, steady-state error), I (removes SS error, slows), D (damps, noise amplifier). Ziegler-Nichols tuning.',
        duration_hours: 8, difficulty: 'Intermediate',
        lessons: [{ id: 'p6m6l1', title: 'PID and Ziegler-Nichols tuning', type: 'reading', duration_min: 90, summary: 'The PID controller C(s)=K_p·(1+1/(T_i·s)+T_d·s) combines three actions: proportional (fast response but leaves steady-state error), integral (kills steady-state error but adds phase lag and overshoot), and derivative (adds damping but amplifies measurement noise, so it is almost always filtered). Ziegler-Nichols closed-loop tuning finds the ultimate gain K_u at which the loop just sustains oscillation and the oscillation period T_u, then sets K_p=0.6K_u, T_i=0.5T_u, T_d=0.125T_u. ZN is intentionally aggressive — it gives a quarter-amplitude decay response that is fine for a first cut but usually too twitchy for production, so the standard advice is to detune by roughly 50%. In practice most loops end up PI-only (derivative is rare except in slow temperature or motion loops), and you tune by starting with K_p alone, then adding integral until steady-state error disappears, then adding just enough derivative to take the ring out.', key_takeaways: ['P: fast but leaves steady-state error; I: removes SS error but adds lag; D: damps but amplifies noise', 'Ziegler-Nichols is intentionally aggressive — detune ~50% for production', 'Most production loops are PI-only; derivative shows up mainly in motion and temperature control', 'Practical tune order: P first, then I to remove SS error, then D to take the ring out'], formulas: [{ label: 'PID controller (parallel form)', latex: 'C(s) = K_p \\left( 1 + \\dfrac{1}{T_i\\,s} + T_d\\,s \\right)' }, { label: 'Ziegler\u2013Nichols closed-loop tuning', latex: 'K_p = 0.6\\,K_u, \\quad T_i = 0.5\\,T_u, \\quad T_d = 0.125\\,T_u' }] }],
        projects: [], checkpoints: [],
      },
      { id: 'p6m7', title: 'State-Space: Controllability and Observability', description: 'ẋ=Ax+Bu, y=Cx+D. Stable iff A eigenvalues in LHP. Controllable iff [B,AB,...,A^(n−1)B] full rank. LQR optimal control.',
        duration_hours: 8, difficulty: 'Advanced',
        cs_bridge: 'State-space ↔ linear dynamical system in ML. ẋ=Ax+Bu, y=Cx+D is exactly a linear RNN. A, B, C, D are weights. Controllability = graph reachability. LQR (optimal control) and Kalman filter (optimal estimation) are dual — share the same Riccati equation.',
        lessons: [{ id: 'p6m7l1', title: 'State-space, controllability, LQR', type: 'reading', duration_min: 90, summary: 'The state-space form ẋ=Ax+Bu, y=Cx+D describes a system by its internal state vector x rather than by a single transfer function, and it handles MIMO (multi-input, multi-output), nonzero initial conditions, and unstable or non-minimum-phase plants with equal ease. Stability is decided purely by the eigenvalues of A — all real parts must be negative. Controllability asks "can I drive the state anywhere in finite time?" and is checked by the rank test rank([B,AB,A²B,…,A^(n−1)B])=n; observability (the dual) does the same for "can I reconstruct the state from the output?". Linear Quadratic Regulator (LQR) picks the state-feedback u=−Kx that minimizes J=∫(x^TQx+u^TRu)dt, and the optimal K comes from solving the discrete (or continuous) algebraic Riccati equation. LQR is remarkable because it comes with a guaranteed ≥60° phase margin and ≥6 dB gain margin on every input channel — margins you simply cannot get from ad-hoc pole placement.', key_takeaways: ['State-space describes the system by its internal state x — handles MIMO and unstable plants uniformly', 'Stability: every eigenvalue of A must have a negative real part', 'Controllability rank test on [B, AB, A²B, …] — observability is the dual', 'LQR gives the optimal state-feedback gain with guaranteed ≥60° PM and ≥6 dB GM'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p6m8', title: 'Digital Control: Sampled-Data Systems', description: 'Discretize continuous: A_d=e^(AT), B_d=∫₀ᵀ e^(Aτ)B dτ. ZOH on DAC. Sample at 10× closed-loop bandwidth.',
        duration_hours: 6, difficulty: 'Advanced',
        lessons: [{ id: 'p6m8l1', title: 'Discretization and ZOH', type: 'reading', duration_min: 60, summary: 'When a controller runs on a microcontroller it sees the plant only at sample instants, so the continuous-time ẋ=Ax+Bu becomes x[k+1]=A_d·x[k]+B_d·u[k] with A_d=e^(AT) (matrix exponential) and B_d=∫₀ᵀ e^(Aτ)B dτ. The DAC between samples is almost always a zero-order hold (ZOH), which freezes u at its last value; in the Laplace domain this multiplies the plant by (1−e^(−sT))/s, adding a sinc-shaped magnitude droop and roughly −ωT/2 of phase lag at frequency ω. That extra phase lag is the price of sampling — at 10× the closed-loop bandwidth it is small (a few degrees), but at 5× it eats enough margin to make a previously stable loop ring, and at 2× you are courting instability. As a working rule sample at least 10× faster than the closed-loop bandwidth; if you cannot afford that, design the controller directly in the z-domain instead of discretizing an analog design.', key_takeaways: ['A_d = e^(AT) — the matrix exponential gives the exact discrete-time state matrix', 'ZOH adds a sinc response that droops magnitude and adds ≈ −ωT/2 phase lag', 'Sample at ≥10× closed-loop bandwidth; below 5× phase margin drops noticeably', 'If sample rate is constrained, design directly in z-domain rather than discretizing'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p6m9', title: 'Robotics Kinematics', description: 'Forward: compose homogeneous transforms T_0_n=T_1·T_2·...·T_n. Inverse: analytic (simple), Jacobian pseudoinverse (general), optimization.',
        duration_hours: 7, difficulty: 'Advanced',
        cs_bridge: 'Forward kinematics ↔ function composition. Each joint applies a rotation+translation. Forward = compose transforms. Inverse = invert composition (harder: nonlinear, multiple solutions, singularities). DH convention parameterizes joint transforms.',
        lessons: [{ id: 'p6m9l1', title: 'DH convention, forward and inverse kinematics', type: 'reading', duration_min: 90, summary: 'The Denavit-Hartenberg (DH) convention reduces the 6-DOF transform of each robot joint to just four parameters — two rotations (θ_i, α_i) and two translations (d_i, a_i) — by aligning the z-axis of each frame with the joint motion axis. Forward kinematics is then pure matrix multiplication: T_0_n = T_1·T_2·…·T_n gives the pose of the end effector from the joint variables. Inverse kinematics — going from a desired end-effector pose back to joint angles — is much harder because the map is nonlinear, often many-to-one, and singularities (where the Jacobian loses rank) make some poses unreachable or only reachable with infinite joint rates. For simple geometries (e.g. a 2-link planar arm) you can solve inverse kinematics analytically; for general 6-DOF arms you use the Jacobian pseudoinverse J^+·Δx iteratively, or a global optimization when there are obstacles or multiple solutions to pick among. The same math drives animated characters, surgical robots, and CNC machines.', key_takeaways: ['DH convention: 4 parameters per joint (θ, d, a, α) — forward kinematics is matrix multiplication', 'Inverse kinematics is nonlinear and often many-to-one — singularities make some poses unreachable', 'Analytic IK for simple arms; Jacobian-pseudoinverse iteration for general arms', 'Same math drives robot arms, animated characters, surgical robots, and CNC machines'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p6m10', title: 'Phase 6 Capstone: Line-Following Robot', description: 'Differential-drive robot with 5-IR sensor array, PID on line position, ESP32 + L298N. Tune K_p, K_i, K_d on bench; test on curving track.',
        duration_hours: 16, difficulty: 'Advanced',
        lessons: [
          { id: 'p6m10l1', title: 'Capstone overview: closed-loop line-following robot', type: 'project', duration_min: 90, summary: 'Architecture of the line-following robot: 5-IR reflective sensor array → weighted-average line-position estimate → PID controller → differential-drive motors via L298N. ESP32 runs the control loop at 100 Hz. Tune K_p first (robot follows but oscillates), add K_d (kills oscillation), add K_i if steady-state offset remains.', key_takeaways: ['Sense → estimate → control → actuate — the canonical feedback loop', 'Weighted-average of 5 IR sensors gives a continuous line-position estimate from discrete readings', 'PID on line error: K_p for speed, K_d for damping, K_i for steady-state accuracy', 'Differential drive: Δv = K·e, so v_L and v_R differ by the control output'], wokwi_url: 'https://wokwi.com/projects/255116253193679131' },
        ],
        projects: [
          { id: 'p6m10pr1', title: 'Phase 6 Capstone: Closed-Loop Line-Following Robot', goal: 'Build robot that follows black line at 1 m/s.', tools: ['differential-drive chassis', '2 DC motors with encoder', 'caster', 'ESP32', 'L298N', 'Pololu QTRX-MD-05A 5-IR array'], steps: ['Mechanical: 6cm wheels, 15cm wheelbase', 'Sensors: 5-IR reflective array, weighted average for line position estimate', 'Controller: PID on line position error. K_p first, add K_d when oscillating, add K_i if SS offset', 'Kinematics: differential drive. Δv=K·e. v_L, v_R → (v, ω)', 'Test: straight track first, then curves of decreasing radius'], pass_criteria: 'Robot follows 1 m/s on standard track without losing line.', difficulty: 'Advanced', estimated_hours: 16 },
        ],
        checkpoints: [],
      },
    ],
  },

  {
    id: 'p7', index: 7, title: 'Power Electronics & Machines', subtitle: 'DC-DC, inverters, BLDC, FOC motor control',
    description: 'Master power converters (buck/boost/inverter), electric machines (DC/induction/BLDC), and motor drives. Build a working FOC BLDC driver. Heavy on LTspice and bench — voltages and currents here will kill components if you get it wrong.',
    duration_weeks: 7, color: '#a25b54',
    goal: 'Build a complete FOC BLDC motor controller on STM32.',
    modules: [
      { id: 'p7m1', title: 'Power Semiconductor Devices', description: 'Diode, MOSFET, IGBT, SCR, GaN, SiC. Switching loss, gate drive, bootstrap.',
        duration_hours: 6, difficulty: 'Intermediate',
        lessons: [{ id: 'p7m1l1', title: 'Power device landscape', type: 'reading', duration_min: 75, summary: 'Power semiconductor choice is dominated by the voltage and frequency the application needs. Silicon MOSFETs own the sub-200V space (low-voltage DC-DC, point-of-load converters) because their resistive conduction loss is low and they switch fast. IGBTs own the 600V-6.5kV motor-drive space because their conductivity modulation gives them low forward drop at high voltage — but they have tails in turn-off that cap switching frequency around 20-40 kHz. Silicon carbide (SiC) MOSFETs cover the EV traction inverter and grid-tied converter space at 650V-1700V with much faster switching and lower loss than IGBT. Gallium nitride (GaN) HEMTs own high-frequency (MHz) DC-DC and USB-C PD adapters because they have no reverse-recovery charge and can switch at frequencies silicon cannot reach. Every switch pays switching loss P_sw=½·V·I·(t_r+t_f)·f_sw each cycle, so faster transitions mean less loss — which is why gate drivers exist to slam 1-8 A peak into the gate capacitance to charge and discharge it in nanoseconds rather than microseconds.', key_takeaways: ['Si MOSFET <200V, IGBT 600V-6.5kV (motors), SiC 650-1700V (EVs/grid), GaN for MHz DC-DC', 'Switching loss P_sw=½V·I·(t_r+t_f)·f_sw — faster transitions cut loss at any frequency', 'Gate drivers source 1-8 A peak to charge gate capacitance in nanoseconds', 'Wide-bandgap (SiC, GaN) is eating silicon at high voltage and high frequency respectively'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p7m2', title: 'Non-Isolated DC-DC Converters', description: 'Buck V_o=D·V_in. Boost V_o=V_in/(1−D). Buck-boost V_o=−D/(1−D)·V_in. CCM vs DCM. Synchronous rectification.',
        duration_hours: 9, difficulty: 'Intermediate',
        lessons: [
          { id: 'p7m2l1', title: 'Buck, boost, buck-boost topologies', type: 'reading', duration_min: 90, summary: 'The three basic non-isolated DC-DC converters come from arranging an inductor, a switch, and a diode in three different topologies, and each gives a different conversion ratio set by the duty cycle D. Buck (step-down): V_o=D·V_in. Boost (step-up): V_o=V_in/(1−D). Buck-boost (inverting, any ratio): V_o=−D/(1−D)·V_in. The unifying principle is volt-second balance on the inductor: in steady state the average voltage across L must be zero, otherwise its current would ramp without bound — and that single equation gives you all three conversion ratios. The inductor current either stays above zero all cycle (Continuous Conduction Mode, CCM) or drops to zero each cycle (Discontinuous Conduction Mode, DCM); DCM has a different conversion ratio that depends on load, which is why designs usually target CCM. At currents above a few amps the diode’s forward drop (0.5V Schottky, 0.7V silicon) becomes the dominant loss, so it is replaced by a second FET switched on during the off-time — synchronous rectification — which can lift converter efficiency 5-10% at high current.', key_takeaways: ['Buck V_o=D·V_in, boost V_o=V_in/(1−D), buck-boost V_o=−D/(1−D)·V_in — duty cycle sets the ratio', 'Volt-second balance on the inductor (avg V_L = 0 in steady state) is the unifying principle', 'CCM (inductor current never zero) is the usual target — DCM conversion ratio depends on load', 'Synchronous rectification (replace diode with FET) saves 5-10% efficiency at high current'], has_heavy_spice: true, heavy_spice_starter: `* Buck converter, 100kHz, 12V to 5V at 2A
V1 Vin 0 12
Vpulse gate 0 PULSE(0 12 0 10n 10n 4u 10u)
M1 Vin gate sw 0 IRFZ44N
D1 0 sw 1N5822
L1 sw out 36u
C1 out 0 50u
Rload out 0 2.5
.model IRFZ44N NMOS(Vto=4 Kp=10 Rd=10m)
.model 1N5822 D(Is=1u N=1.5 Rs=10m Bv=20)
.tran 100n 200u 0 50n
.print tran v(out) i(L1) v(gate)
.end` },
          { id: 'p7m2l2', title: 'Inductor and capacitor sizing', type: 'reading', duration_min: 60, summary: 'Once you have picked a topology and duty cycle, the inductor and capacitor values fall out of ripple specifications. The inductor sets current ripple: in a buck, L=(V_in−V_o)·D/(ΔI_L·f_sw), so a bigger L means less ripple (and a slower transient response, and a bigger physical part). The output capacitor sets voltage ripple: C=ΔI_L/(8·ΔV_o·f_sw), so more capacitance means less ripple (and a bigger part). Typical design targets are 20-40% peak-to-peak inductor current ripple as a fraction of load current — less than 20% wastes core, more than 40% pushes the converter toward DCM at light load. Higher switching frequency shrinks both L and C proportionally (which is why mobile chargers run at MHz), but it costs you in switching loss and gate-drive power, which scale with f_sw. The whole design is a multi-way trade-off between ripple, transient response, efficiency, size, and cost.', key_takeaways: ['Inductor sets current ripple: L=(V_in−V_o)·D/(ΔI_L·f_sw) for a buck', 'Capacitor sets voltage ripple: C=ΔI_L/(8·ΔV_o·f_sw) — bigger C, smaller ripple', 'Typical target: 20-40% inductor current ripple as a fraction of load', 'Higher f_sw shrinks L and C proportionally but costs switching loss and gate-drive power'] },
        ],
        projects: [
          { id: 'p7m2pr1', title: 'LTspice: 12V-to-5V Buck at 2A, 200 kHz', goal: 'Design and simulate buck converter.', tools: ['LTspice', 'IRFZ44N', '1N5822'], steps: ['Specs: V_in=12V, V_o=5V, I_o=2A, f_sw=200kHz, ΔV_o<50mV', 'Design: D=5/12=0.417, L=36μH, C=50μF', 'Simulate with pulse gate driver, verify V_o=5V ±1%, ripple <50mV', 'Sweep load 0.5-3A (line reg), V_in 10-15V (load reg)'], pass_criteria: 'V_o within 1%, ripple <50mV across all conditions.', difficulty: 'Intermediate', estimated_hours: 3 },
        ],
        checkpoints: [],
      },
      { id: 'p7m3', title: 'Isolated Converters: Flyback, Forward, Bridge', description: 'Flyback (<100W, cheap), Forward (<200W), Push-pull/Half-bridge (100-500W), Full-bridge (500W-5kW+), LLC resonant.',
        duration_hours: 7, difficulty: 'Intermediate',
        lessons: [{ id: 'p7m3l1', title: 'Isolated topologies and transformer design', type: 'reading', duration_min: 90, summary: 'Isolated converters use a transformer to galvanically separate input and output (mandatory for safety in any user-touchable output) and to step voltage up or down by the turns ratio. The flyback stores energy in the transformer core during the on-time and releases it to the secondary during the off-time — the transformer is really a coupled inductor — which makes it the cheapest isolated topology but limits it to roughly 100W because peak core flux and leakage inductance spikes grow with power. The forward converter passes energy directly through the transformer during the on-time and resets the core during the off-time, handling up to about 200W. Push-pull, half-bridge, and full-bridge topologies use multiple switches to drive the transformer bidirectionally, scaling cleanly to 500W (half-bridge), 1-5kW (full-bridge), and beyond. The LLC resonant converter adds a resonant tank to enable zero-voltage switching (ZVS), which dramatically cuts switching loss and is the standard topology for high-efficiency server and EV chargers. In all of these, the transformer design — core material and size, turns ratio, wire gauge (skin and proximity effect at high frequency), and winding structure (interleaving to reduce leakage) — is the dominant engineering effort.', key_takeaways: ['Flyback stores energy in the core (coupled inductor) — cheapest, but limited to ~100W', 'Forward passes energy directly; full-bridge scales to multi-kW; LLC resonant adds ZVS for high efficiency', 'LLC resonant is the standard topology for high-efficiency server and EV chargers', 'Transformer design (core, turns, gauge, winding structure) is the dominant engineering effort'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p7m4', title: 'Inverters: Square, PWM, SPWM, SVPWM', description: 'H-bridge. SPWM: sine ref vs triangle carrier. SVPWM: 15% more output voltage for 3-phase. Dead time.',
        duration_hours: 8, difficulty: 'Advanced',
        lessons: [{ id: 'p7m4l1', title: 'SPWM and SVPWM modulation', type: 'reading', duration_min: 90, summary: 'Sinusoidal PWM (SPWM) makes a synthetic AC voltage from a DC bus by switching the inverter legs on and off with duty cycles that follow a sine wave — you compare a sine reference at the desired output frequency against a high-frequency triangle carrier, and the comparator output drives each switch. The average line-to-neutral output is V_o=m_a·V_dc·sin(ω_m·t), where m_a is the modulation index; linear up to m_a=1, then overmodulation pushes into a quasi-square wave at m_a>1 with harmonic distortion as the cost. Space Vector PWM (SVPWM) treats the three-phase output as a single rotating space vector in the αβ frame and synthesizes it by time-averaging the two adjacent active voltage vectors plus a zero vector. The clever part is that it uses the zero vector symmetrically, which pushes the peak line-to-line voltage up by 15% for the same DC bus — equivalently, you get the same AC output from a 15% lower DC bus, which is why SVPWM is universal in three-phase motor drives and grid-tied inverters. In both schemes, dead time (a few hundred ns where both switches in a leg are off) is mandatory to prevent shoot-through cross-conduction that would short the DC bus.', key_takeaways: ['SPWM: sine reference vs triangle carrier → duty cycle follows sine; linear up to m_a=1', 'SVPWM: synthesize rotating space vector by time-averaging adjacent active + zero vectors', 'SVPWM gives 15% more output voltage for the same DC bus — universal in 3-phase drives', 'Dead time (a few hundred ns) is mandatory to prevent shoot-through cross-conduction'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p7m5', title: 'Rectifiers and Power Factor Correction', description: 'Bridge + cap input has PF 0.5-0.7. Boost PFC forces input current to follow |V_ac|. Mandatory >75W.',
        duration_hours: 6, difficulty: 'Intermediate',
        lessons: [{ id: 'p7m5l1', title: 'Boost PFC', type: 'reading', duration_min: 75, summary: 'A plain bridge rectifier followed by a bulk capacitor draws current only in short spikes near the peak of the line voltage, which gives a power factor of 0.5-0.7 and injects significant harmonic distortion back into the grid. Power Factor Correction (PFC) fixes this by interposing a boost converter between the bridge and the bulk cap, controlled by two nested loops. The fast inner current loop forces the inductor current to track a reference shaped like |V_ac|·sin(ωt) — a rectified sine at line frequency — so the input current looks resistive and sinusoidal. The slow outer voltage loop regulates the DC bus to a setpoint (typically 380-400V, just above the peak of 230V mains) and modulates the amplitude of the current reference to balance input and output power. The result is PF>0.99 and harmonic distortion well under the IEC 61000-3-2 limits. PFC is mandatory for any product drawing more than 75W from the mains in the EU and many other jurisdictions — which is why every laptop charger, desktop PSU, and LED ballast above that threshold has a boost PFC stage.', key_takeaways: ['Plain bridge+cap draws current in spikes → PF 0.5-0.7, high harmonics', 'Boost PFC: fast current loop forces I_L to track |V_ac|·sin(ωt), slow loop regulates DC bus', 'Result: PF>0.99 — input looks essentially resistive to the line', 'Mandatory above 75W mains draw per IEC 61000-3-2 (laptop chargers, desktop PSUs, LED ballasts)'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p7m6', title: 'DC Machines', description: 'T=K·Φ·I_a, E=K·Φ·ω. PMDC, shunt, series, compound. Speed control: armature V, field Φ, R (wasteful).',
        duration_hours: 5, difficulty: 'Intermediate',
        lessons: [{ id: 'p7m6l1', title: 'DC motor types and speed control', type: 'reading', duration_min: 60, summary: 'The DC motor is governed by two equations: torque T=K·Φ·I_a (flux times armature current) and back-EMF E=K·Φ·ω (flux times speed). Combining them gives the speed equation ω=(V−I_a·R_a)/(K·Φ), which immediately tells you the three ways to control speed: change the applied armature voltage V (modern PWM method, smooth and efficient), change the field flux Φ (field weakening — reduces Φ to push speed above base, at the cost of lower torque), or change the armature resistance R_a (wasteful rheostat method, mostly historical). The four classic excitation topologies give different torque-speed curves. PMDC uses permanent magnets for the field — simple, efficient, dominant in small motors. Shunt has a separately-excited field winding independent of the armature — self-regulating speed, used in machine tools. Series has the field winding in series with the armature — huge starting torque (think subway trains, traction, hand drills), but speed runs away under no load. Compound combines shunt and series to get the best of both.', key_takeaways: ['Two governing equations: T=K·Φ·I_a (torque) and E=K·Φ·ω (back-EMF)', 'Speed control via armature voltage V (modern PWM), field flux Φ (field weakening), or R_a (wasteful)', 'PMDC (magnets) for small motors; shunt self-regulates; series for traction; compound is the compromise', 'Series motor has huge starting torque but runs away unloaded — never couple it to a belt without load'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p7m7', title: 'Induction Machines', description: 'n_s=120f/p. Slip s=(n_s−n)/n_s. Equivalent circuit. DOL/Star-delta/VFD starting. Torque-speed curve.',
        duration_hours: 7, difficulty: 'Advanced',
        lessons: [{ id: 'p7m7l1', title: 'Induction motor equivalent circuit', type: 'reading', duration_min: 90, summary: 'The induction motor is the workhorse of industry — rugged, cheap, brushless — and its key trick is the rotating magnetic field produced by three-phase stator currents, which spins at synchronous speed n_s=120f/p (e.g. 1800 RPM at 60Hz, 4 poles). The rotor never quite catches up: the relative motion, called slip s=(n_s−n)/n_s, is what induces rotor currents and therefore torque. At synchronous speed (s=0) there is no relative motion, no induced current, no torque — slip is essential. The per-phase equivalent circuit looks like a transformer with a rotating secondary: stator resistance R_s and leakage L_s, magnetizing inductance L_m, rotor resistance R_r and leakage L_r, and a load-dependent element R_r·(1−s)/s that represents the mechanical power delivered to the shaft. The torque-speed curve has three points that matter: starting torque (locked rotor, s=1), breakdown/pullout torque (the peak, typically 2-3× rated), and synchronous speed (zero torque). Starting methods matter — Direct-On-Line (DOL) draws 6-7× rated current; star-delta soft-start cuts that; a Variable Frequency Drive (VFD) starts at low frequency and voltage, the gentlest method and the only one that lets you control speed continuously.', key_takeaways: ['Stator field rotates at n_s=120f/p; rotor never catches up — slip is essential for torque', 'Per-phase equivalent circuit looks like a transformer with R_r·(1−s)/s as the mechanical load', 'Torque-speed curve: starting torque (s=1), breakdown (peak ~2-3× rated), synchronous (zero)', 'DOL start draws 6-7× rated current; VFD starts at low f and V — gentlest method, only speed control'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p7m8', title: 'Synchronous Machines and BLDC/PMSM', description: 'No slip. PMSM (sinusoidal BEMF) and BLDC (trapezoidal). Clarke+Park transforms. FOC.',
        duration_hours: 8, difficulty: 'Advanced',
        lessons: [{ id: 'p7m8l1', title: 'BLDC vs PMSM, Clarke+Park, FOC', type: 'reading', duration_min: 90, summary: 'Brushless DC (BLDC) and Permanent-Magnet Synchronous Machine (PMSM) are the same hardware — a three-phase stator and a permanent-magnet rotor — distinguished by how you drive them. BLDC uses six-step trapezoidal commutation: Hall sensors tell you which 60° sector the rotor is in, and you energize two of the three phases at a time to produce a roughly trapezoidal back-EMF. PMSM uses sinusoidal currents and Field-Oriented Control (FOC), which is more complex but smoother and more efficient. FOC’s trick is the Clarke+Park transform: Clarke converts the three phase currents to a two-axis αβ frame, and Park rotates that frame to align with the rotor (the dq frame, d for direct, q for quadrature). In the dq frame the motor looks exactly like a DC motor: i_d controls flux (set to zero for maximum torque per amp), i_q controls torque. You close two PI loops on i_d and i_q, inverse Park+Clarke the voltage commands back to three phases, and feed them to SVPWM. The result is a brushless motor that behaves like an ideal DC motor — instant torque response, four-quadrant operation, zero torque ripple.', key_takeaways: ['BLDC = 6-step trapezoidal with Hall sensors; PMSM = sinusoidal FOC on same hardware', 'Clarke (3-phase→αβ) + Park (αβ→dq rotating with rotor) makes the motor look like a DC motor', 'FOC: i_d=0 (flux) and i_q=torque — two PI loops, inverse transforms, SVPWM', 'FOC gives instant torque response, four-quadrant operation, near-zero torque ripple'], has_playground: true }],
        projects: [], checkpoints: [],
      },
      { id: 'p7m9', title: 'Motor Drives: V/f and FOC', description: 'V/f for induction (open-loop, 5% reg). FOC for induction and PMSM (closed-loop, 0.1% reg, 4-quadrant).',
        duration_hours: 6, difficulty: 'Advanced',
        lessons: [{ id: 'p7m9l1', title: 'V/f vs FOC drives', type: 'reading', duration_min: 60, summary: 'V/f (volts-per-hertz) drives run an induction motor open-loop by holding the ratio V/f constant as they vary frequency — this keeps the stator flux roughly constant, which prevents the motor from saturating or losing torque at low speeds. V/f is simple, cheap, needs no position sensor, and gives about 5% speed regulation, which is fine for fans, pumps, and conveyors where the load is gentle and exact speed does not matter. FOC (field-oriented control) closes the loop: it measures rotor position (via encoder or observer), transforms currents into the rotor’s dq frame, and torque-controls the motor like a DC machine. FOC achieves 0.1% speed regulation, four-quadrant operation (motoring and braking in both directions), and full torque at zero speed — essential for servos, EVs, and robotics. The price is a position sensor and much more computational hardware. Sensorless FOC removes the encoder by estimating rotor position from electrical measurements: back-EMF integration works at high speed; high-frequency signal injection exploits magnetic saliency at low and zero speed. Sensorless FOC is now standard in white goods and drone ESCs.', key_takeaways: ['V/f: open-loop, V/f constant, 5% regulation — fine for fans/pumps/conveyors', 'FOC: closed-loop, 0.1% regulation, 4-quadrant, full torque at zero speed — for servos/EVs/robotics', 'FOC needs a position sensor (encoder) or an observer (sensorless)', 'Sensorless FOC: back-EMF at high speed, HF signal injection at low/zero speed'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p7m10', title: 'Phase 7 Capstone: BLDC FOC Driver', description: 'STM32G4 + 3-phase inverter + 2204 drone motor + AS5048 encoder. Current loop 16 kHz, speed 1 kHz. 4-quadrant, sensorless start, field weakening.',
        duration_hours: 20, difficulty: 'Advanced',
        lessons: [],
        projects: [
          { id: 'p7m10pr1', title: 'Phase 7 Capstone: BLDC FOC Motor Controller', goal: 'Build complete FOC driver for small PMSM (drone motor).', tools: ['STM32G4 Nucleo', 'B-G431B-ESC1 discovery kit', '2204 drone motor', 'AS5048 encoder', '12V 5A supply', 'STM32 MCSDK'], steps: ['Hardware: STM32G4 + 3-phase inverter + 2204 BLDC + AS5048 encoder + 12V supply', 'Software: STM32 MCSDK generates FOC framework. Tune PI for current (16kHz) and speed (1kHz) loops', 'ADC samples phase currents synchronously with PWM center', 'Tests: (1) open-loop ramp, (2) tune current loop step response, (3) tune speed loop, (4) measure torque vs i_q, (5) 4-quadrant motor/brake, (6) sensorless start'], pass_criteria: '4-quadrant operation; sensorless start works; torque linear with i_q.', difficulty: 'Advanced', estimated_hours: 20 },
        ],
        checkpoints: [],
      },
    ],
  },

  {
    id: 'p8', index: 8, title: 'EM Fields, RF & Communications', subtitle: 'Maxwell, transmission lines, antennas, modulation',
    description: 'Cover Maxwell’s equations in real engineering problems, transmission lines, antennas, RF front-ends, and analog + digital modulation. Once physical dimensions approach wavelength, lumped-circuit approximation breaks — wires become transmission lines.',
    duration_weeks: 6, color: '#507aa4',
    goal: 'Build FM transmitter + SDR receiver and receive your own signal.',
    modules: [
      { id: 'p8m1', title: 'Vector Calculus for EM', description: 'Gradient ∇φ, divergence ∇·F, curl ∇×F. Divergence theorem, Stokes’ theorem. Three identities.',
        duration_hours: 5, difficulty: 'Foundation',
        cs_bridge: 'Vector calculus ↔ 3D gradient operations in graphics. Gradient (Sobel filter in image processing), divergence (source/sink measure), curl (rotation measure). Maxwell’s four equations are written in this language; once internalized, Maxwell becomes readable.',
        lessons: [{ id: 'p8m1l1', title: 'Three operators, three theorems', type: 'reading', duration_min: 75, summary: 'Three differential operators form the entire vocabulary of electromagnetics. The gradient ∇φ turns a scalar field into a vector field pointing in the direction of steepest ascent — picture a ball rolling uphill. The divergence ∇·F turns a vector field into a scalar field that is positive at sources, negative at sinks, and zero where the field just flows through. The curl ∇×F measures local rotation of a vector field — nonzero curl means the field would spin a tiny paddle wheel. The two integral theorems close the loop between differential and integral pictures: the divergence theorem says the total flux out of a volume equals the integral of divergence inside, and Stokes’ theorem says the circulation around a closed loop equals the flux of curl through any surface bounded by that loop. Maxwell’s four equations are written in this exact language, so once these three operators and two theorems are second nature, Maxwell becomes a sentence rather than a wall of symbols.', key_takeaways: ['Gradient ∇φ (scalar→vector): direction of steepest ascent of a scalar field', 'Divergence ∇·F (vector→scalar): positive at sources, negative at sinks', 'Curl ∇×F (vector→vector): local rotation — would a paddle wheel spin?', 'Divergence theorem and Stokes’ theorem connect volume/surface/line integrals'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p8m2', title: 'Electrostatics: Gauss, Boundary Conditions', description: 'Gauss’s law for symmetric charge distributions. Capacitance. Dielectric boundary conditions.',
        duration_hours: 6, difficulty: 'Intermediate',
        lessons: [{ id: 'p8m2l1', title: 'Gauss’s law and capacitance', type: 'reading', duration_min: 75, summary: 'Gauss’s law ∮E·dA=Q_enc/ε₀ says the total electric flux through a closed surface equals the enclosed charge divided by ε₀. The trick is to pick a Gaussian surface that respects the symmetry of the charge distribution: a sphere for a point charge (E=kQ/r²), a cylinder for a line charge (E=λ/(2πε₀r)), or a pillbox for an infinite plane (E=σ/(2ε₀)). With the right surface the surface integral collapses to a single multiplication. Capacitance C=Q/V follows directly — for a parallel plate it is C=εA/d, for a coaxial cable C=2πε/ln(b/a) per metre. A dielectric material multiplies ε by ε_r, which is why a capacitor with a ceramic dielectric has thousands of times the capacitance of an air-gap version. At material boundaries the tangential E field is continuous and the normal D field jumps by any surface charge — these two boundary conditions are how you stitch fields together across interfaces.', key_takeaways: ['Gauss’s law: pick a symmetric Gaussian surface and the integral becomes trivial', 'Capacitance C=Q/V — parallel plate εA/d, coax 2πε/ln(b/a) per metre', 'Dielectric multiplies ε by ε_r — ceramics give 1000× the air-gap capacitance', 'Boundary conditions: tangential E continuous, normal D jumps by surface charge'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p8m3', title: 'Magnetostatics: Biot-Savart, Ampère', description: 'Biot-Savart for arbitrary current distributions. Ampère for symmetric. Inductance L=λ/I. Magnetic energy W=½LI².',
        duration_hours: 6, difficulty: 'Intermediate',
        lessons: [{ id: 'p8m3l1', title: 'Biot-Savart and Ampère’s law', type: 'reading', duration_min: 75, summary: 'The Biot-Savart law B=(μ₀/4π)·∫I·dl×r̂/r² is the magnetic analogue of Coulomb’s law — it computes B from a current distribution by integrating contributions from every current element. For an infinite straight wire it reduces to B=μ₀I/(2πr), and inside a long solenoid to B=μ₀nI (uniform inside, zero outside). Ampère’s law ∮B·dl=μ₀I_enc is the dual of Gauss’s law for magnetism: pick a symmetric Amperian loop and the line integral becomes trivial. Inductance L=λ/I (flux linkage per amp) is the magnetic dual of capacitance, and the energy stored in a magnetic field is W=½LI² — the dual of ½CV² for capacitors. The force between two current-carrying wires is the physical basis of every electromechanical energy converter: motors, relays, loudspeakers, and railguns all push on this same B×I force.', key_takeaways: ['Biot-Savart computes B for arbitrary current geometry — analog of Coulomb for E', 'Ampère’s law is the symmetric-case dual of Gauss — pick the right Amperian loop', 'Inductance L=λ/I is the magnetic dual of capacitance; energy stored is ½LI²', 'Force between currents is the physical basis of every motor, relay, and loudspeaker'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p8m4', title: 'Maxwell’s Equations and EM Waves', description: 'Free space → wave equation ∇²E=μ₀ε₀·∂²E/∂t², v=1/√(μ₀ε₀)=c. E, B perpendicular to each other and propagation. Poynting vector.',
        duration_hours: 7, difficulty: 'Advanced',
        lessons: [{ id: 'p8m4l1', title: 'Wave equation, plane waves, spectrum', type: 'reading', duration_min: 90, summary: 'Take Maxwell’s equations in free space, take the curl of the curl equation, and out pops the wave equation ∇²E=μ₀ε₀·∂²E/∂t² — meaning electric and magnetic fields propagate as waves at speed v=1/√(μ₀ε₀)≈3×10⁸ m/s. That number is c, the speed of light, and this is the derivation that told Maxwell light is an electromagnetic phenomenon. For a plane wave E(z,t)=E₀cos(kz−ωt), the E and B fields are perpendicular to each other and to the direction of propagation, and their ratio is the wave impedance of free space η₀=√(μ₀/ε₀)≈377Ω — which is why 50Ω RF coax is a compromise between 30Ω power handling and 77Ω attenuation. The Poynting vector S=(1/μ₀)·E×B points in the direction of propagation and gives the power flow per unit area. The entire EM spectrum — DC, audio, RF, microwave, IR, visible, UV, X-ray, gamma — is the same phenomenon at different frequencies, governed by the same four equations.', key_takeaways: ['Maxwell’s equations imply the wave equation — light is an EM wave at v=c', 'E and B are perpendicular to each other and to the propagation direction', 'Wave impedance of free space η₀≈377Ω — the reason 50Ω is the RF compromise', 'Poynting vector S=(1/μ₀)E×B gives power-flow direction and magnitude'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p8m5', title: 'Transmission Lines and the Smith Chart', description: 'Z₀=√(L/C), v_p=1/√(LC). Γ=(Z_L−Z₀)/(Z_L+Z₀). SWR. Smith chart for matching network design.',
        duration_hours: 8, difficulty: 'Advanced',
        lessons: [{ id: 'p8m5l1', title: 'Transmission lines and Smith chart', type: 'reading', duration_min: 90, summary: 'When the physical length of a conductor pair becomes a meaningful fraction of a wavelength, you can no longer treat it as a short circuit — propagation delay matters and signals reflect off impedance discontinuities. That is the transmission-line regime, characterized by a characteristic impedance Z₀=√(L/C) (50Ω for most RF, 75Ω for video, 100Ω for twisted-pair Ethernet) and a propagation velocity v_p=1/√(LC)≈2c/3 in typical coax. A load mismatch reflects a fraction Γ=(Z_L−Z₀)/(Z_L+Z₀) of the incident wave, and the standing-wave ratio SWR=(1+|Γ|)/(1−|Γ|) tells you how badly mismatched the line is (1:1 is perfect, >2:1 is a problem). The Smith chart is the graphical calculator for all of this: it plots Γ in polar form overlaid with constant-resistance and constant-reactance circles, so adding a series L or C moves you along a constant-R circle and adding a shunt element moves you along a constant-G circle. With practice you can design a matching network on the Smith chart in two minutes that would take a page of algebra by hand.', key_takeaways: ['Conductors become transmission lines when length ≳ λ/10 — propagation and reflection matter', 'Z₀=√(L/C): 50Ω for RF, 75Ω for video, 100Ω for Ethernet — different compromises', 'Reflection coefficient Γ=(Z_L−Z₀)/(Z_L+Z₀); SWR=(1+|Γ|)/(1−|Γ|)', 'Smith chart = polar Γ with constant-R/X circles — graphical matching-network design'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p8m6', title: 'Antennas: Dipole, Patch, Gain, Pattern', description: 'Half-wave dipole (2.15 dBi). Patch (6-9 dBi, narrowband). Friis: P_r=P_t·G_t·G_r·(λ/(4πR))².',
        duration_hours: 6, difficulty: 'Intermediate',
        lessons: [{ id: 'p8m6l1', title: 'Antenna parameters and Friis equation', type: 'reading', duration_min: 75, summary: 'An antenna converts a guided wave on a transmission line into a free-space electromagnetic wave (and vice versa on receive). Its key figures of merit are gain (dBi — dB relative to an isotropic radiator), radiation pattern (the polar plot of where the power goes), beamwidth, bandwidth, polarization, and efficiency. The half-wave dipole is the reference antenna: 2.15 dBi gain, ~73Ω feed impedance, and an omnidirectional donut pattern — it is what "gain in dBi" is measured against. A patch antenna trades omnidirectional coverage for 6-9 dBi of directional gain in a flat, PCB-friendly package, but pays for it with ~1% fractional bandwidth (a few MHz at 2.4 GHz). The Friis equation P_r=P_t·G_t·G_r·(λ/(4πR))² tells you how much power makes it across free space — at 2.4 GHz over 100 m the path loss is about 40 dB, which is why WiFi range collapses so fast through walls and why long links need either more power, more antenna gain, or a lower frequency.', key_takeaways: ['Half-wave dipole is the reference antenna: 2.15 dBi, 73Ω, omnidirectional donut', 'Patch antenna gives 6-9 dBi in a flat package but only ~1% fractional bandwidth', 'Friis: P_r=P_t·G_t·G_r·(λ/4πR)² — path loss at 2.4 GHz/100 m ≈ 40 dB', 'Lower frequency buys range (λ bigger → less free-space loss) at the cost of antenna size'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p8m7', title: 'RF Front-End: LNA, Mixer, Oscillator, PLL', description: 'Superheterodyne: antenna → LNA → mixer → IF filter → demod. Friis cascade: first stage dominates noise figure.',
        duration_hours: 7, difficulty: 'Advanced',
        lessons: [{ id: 'p8m7l1', title: 'Superheterodyne receiver and Friis cascade', type: 'reading', duration_min: 90, summary: 'The superheterodyne architecture has dominated radio receiver design for a century because it lets you filter and demodulate at a fixed intermediate frequency (IF) no matter what you are tuned to. The signal chain is: antenna → low-noise amplifier (LNA) → mixer → IF filter → demodulator. The LNA boosts the tiny antenna signal while adding as little noise as possible — its noise figure sets the floor for the entire receiver. The mixer multiplies the RF signal by a local-oscillator (LO) sine wave (generated by a PLL or DDS) to shift the carrier down to the IF, where a fixed high-Q filter can do the channel selection a tunable RF filter never could. The Friis cascade formula F_total=F_1+(F_2−1)/G_1+(F_3−1)/(G_1·G_2)+… tells you why the LNA matters so much: every stage noise is divided by all the gain before it, so the first stage dominates system noise figure. The image frequency — an unwanted signal that also mixes down to the IF — is rejected either by a preselector filter or by quadrature (I/Q) mixing that cancels it.', key_takeaways: ['Superheterodyne: antenna → LNA → mixer → IF filter → demod; filtering happens at fixed IF', 'LNA noise figure sets the system floor — Friis cascade divides each stage by prior gain', 'Mixer × LO shifts RF to IF where a fixed high-Q filter does channel selection', 'Image frequency rejected by preselector filter or quadrature I/Q mixing'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p8m8', title: 'Modulation: AM, FM, PM, ASK, FSK, PSK, QAM', description: 'AM (envelope, BW=2f_m). FM (phase varies, Carson BW). Digital: BPSK, QPSK, 16-QAM, 64-QAM. Shannon limit C=B·log₂(1+SNR).',
        duration_hours: 8, difficulty: 'Advanced',
        cs_bridge: 'Modulation ↔ encoding scheme. ASK is 1-bit NRZ on amplitude. FSK is two tones (Bell modem). PSK is phase shifts. QAM combines amplitude and phase — 16-QAM = 4 bits/symbol, 256-QAM = 8. Shannon limit C=B·log₂(1+SNR) is the same theoretical bound as in information theory.',
        lessons: [{ id: 'p8m8l1', title: 'Analog and digital modulation', type: 'reading', duration_min: 90, summary: 'Modulation is the process of impressing information onto a carrier sine wave by varying its amplitude, frequency, or phase. AM (amplitude modulation) is the simplest — the message multiplies the carrier envelope — but the envelope is vulnerable to noise and nonlinear amplification, which is why AM broadcast sounds noisy and why AM is rare outside of aviation and hobby radio. FM (frequency modulation) trades wider bandwidth (Carson rule: BW=2(β+1)f_m) for much better noise immunity, which is why FM broadcast still sounds clean in a car. Digital modulation discretizes the amplitude/phase space into a constellation: BPSK uses 2 points, QPSK uses 4 points on a circle, 16-QAM uses a 4×4 grid, and modern WiFi (802.11ax) pushes to 1024-QAM (10 bits per symbol). The fundamental ceiling is Shannon’s limit C=B·log₂(1+SNR): no modulation scheme can push more bits per second through a given bandwidth at a given SNR than this, and the entire art of modern communications engineering is designing constellations and coding that creep ever closer to it.', key_takeaways: ['AM is simple but envelope-noise-vulnerable; FM trades bandwidth for noise immunity', 'Digital constellations: BPSK 2 points → QPSK 4 → 16-QAM 16 → 1024-QAM (WiFi 6) 10 bits/symbol', 'Shannon limit C=B·log₂(1+SNR) is the absolute ceiling on bits/sec for a bandwidth and SNR', 'Higher-order QAM needs higher SNR — that is why WiFi drops to lower rates when signal is weak'], has_scope: true }],
        projects: [], checkpoints: [],
      },
      { id: 'p8m9', title: 'Phase 8 Capstone: FM Transmitter + SDR Receiver', description: 'MAX2606 VCO modulated by audio, transmit on unused FM band (under 100 μW legal). RTL-SDR + GNU Radio demodulator. Optional: FSK digital data.',
        duration_hours: 14, difficulty: 'Advanced',
        lessons: [
          { id: 'p8m9l1', title: 'FM transmitter + SDR receiver: IQ recordings walkthrough', type: 'reading', duration_min: 45, summary: 'Before building your own transmitter, study what real RF looks like. IQEngine (embedded below) renders spectrograms and IQ plots from SigMF recordings — the standard open format for sharing SDR captures. Browse the demo recordings (FM broadcast, ADS-B aircraft transponders, LTE cell towers) and identify the modulation type by eye: FM broadcast shows a tall narrow carrier with sidebands spaced by the audio bandwidth; ADS-B is a bursty 1090 MHz OOK pattern; LTE has a wide flat block of resource blocks.', key_takeaways: ['SigMF is the open standard format for sharing SDR captures', 'Spectrogram: time × frequency × power — read it like a waterfall', 'FM broadcast looks like a tall carrier with audio sidebands', 'ADS-B at 1090 MHz is bursty OOK — easy to spot in the spectrogram'], iqengine_url: '' },
        ],
        projects: [
          { id: 'p8m9pr1', title: 'Phase 8 Capstone: FM Transmitter + SDR Receiver', goal: 'Build FM transmitter and receive your own signal with SDR.', tools: ['MAX2606 VCO or discrete Colpitts', 'audio source', 'RTL-SDR', 'GNU Radio'], steps: ['Transmitter: VCO modulated by audio from phone. Tune to unused FM band (88-108 MHz). Keep power <100 μW legal.', 'Receiver: RTL-SDR + GNU Radio. FM demodulator: bandpass → limit → frequency discriminator → de-emphasis → audio sink', 'Tests: (1) transmit tone, receive, confirm. (2) transmit music, listen. (3) measure SNR. (4) walk away, measure range.', 'Extension: FSK digital data. Send UART byte stream. Demodulate. Compute BER.'], pass_criteria: 'Receive own FM signal at >10 m range; SNR > 20 dB.', difficulty: 'Advanced', estimated_hours: 14 },
        ],
        checkpoints: [],
      },
    ],
  },

  {
    id: 'p9', index: 9, title: 'VLSI & IC Design', subtitle: 'CMOS, layout, fabrication, STA, low-power',
    description: 'Understand the CMOS transistor, layout, fabrication flow, and digital IC design. Prototype a pipelined adder on FPGA plus a custom inverter layout in Magic. Front-end (RTL) is close to CS; back-end (synthesis, P&R, layout) is more EE-specific.',
    duration_weeks: 5, color: '#7a6b3f',
    goal: 'Implement pipelined adder on FPGA + custom inverter layout in Magic.',
    modules: [
      { id: 'p9m1', title: 'CMOS Inverter: Static and Dynamic', description: 'VTC, switching threshold, noise margins. t_p≈C_L·V_DD/(2·I_on). P=αCV²f dynamic + V_DD·I_leak static.',
        duration_hours: 7, difficulty: 'Intermediate',
        lessons: [{ id: 'p9m1l1', title: 'VTC and dynamic behavior', type: 'reading', duration_min: 90, summary: 'The CMOS inverter pairs a PMOS pull-up network with an NMOS pull-down network so that in either logic state one transistor is off and the other is on — which means essentially zero DC current flows in steady state. That single property is why CMOS displaced NMOS and bipolar logic and now runs essentially every digital chip on Earth. The voltage transfer characteristic (VTC) has five regions; for a symmetric design (|V_tp|=V_tn, equal mobilities) the switching threshold sits at V_M=V_DD/2, which maximizes both noise margins NM_H=V_OH−V_IH and NM_L=V_IL−V_OL. Dynamic behavior is set by the load capacitance C_L: propagation delay t_p≈C_L·V_DD/(2·I_on), so faster switching means either bigger transistors (more I_on) or lower C_L. Dynamic power is P_dyn=α·C·V²·f (where α is the activity factor), which is why voltage scaling is the most powerful lever — halving V cuts power by 4×. Static power P_static=V_DD·I_leak was negligible at 1μm but dominates at advanced nodes (≤28nm) because subthreshold and gate leakage grow as transistors shrink.', key_takeaways: ['CMOS pairs PMOS pull-up with NMOS pull-down — zero DC current in steady state', 'Symmetric VTC has switching threshold at V_DD/2, maximizing both noise margins', 'Dynamic power P=αCV²f — voltage scaling is the most powerful lever (4× per halving)', 'Leakage dominates at advanced nodes (≤28nm) — static power can no longer be ignored'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p9m2', title: 'CMOS Layout and Fabrication Flow', description: 'Layers: n-well, diffusion, poly, contacts, metal1-15. Design rules (min width/spacing/enclosure). 80 mask layers, 600-800 steps at 5nm.',
        duration_hours: 7, difficulty: 'Intermediate',
        lessons: [{ id: 'p9m2l1', title: 'Layout layers and fabrication flow', type: 'reading', duration_min: 90, summary: 'Layout is the geometric description of every layer of the chip — n-well, p+ and n+ diffusion, polysilicon gates, contacts, and the 8-15 layers of metal that wire everything together. Foundries publish design rules (minimum width, spacing, enclosure) that capture what their lithography can reliably print, and a layout that violates them will fail DRC and never get fabricated. The fabrication flow itself is a sequence of repeating steps: substrate preparation, photolithography (pattern a photoresist with UV through a reticle), etch (remove material where the resist is open), ion implantation (dope the silicon), deposition (lay down new films), and chemical-mechanical polishing (CMP, planarize the surface for the next layer). A modern 5nm process uses roughly 80 mask layers and 600-800 process steps end-to-end, takes 2-3 months in the fab, and requires a facility that costs $15-20 billion to build — which is why only a handful of companies (TSMC, Samsung, Intel) operate at the leading edge.', key_takeaways: ['Layout = geometry of every layer; foundry design rules encode what lithography can print', 'Fab flow is repeating photolithography → etch → implant → deposition → CMP', 'Modern 5nm: ~80 masks, 600-800 steps, $15-20B fab cost — only a few firms can play', 'DRC clean is non-negotiable — a single violation means the fab rejects your GDS'], has_tscircuit: true, tscircuit_code: `// CMOS inverter — the fundamental building block of digital VLSI.
// PMOS pull-up network + NMOS pull-down network, topologically dual.
// (tscircuit's primitive set is analog/PCB-focused — this starter shows
//  the equivalent pull-up/pull-down resistor network, since MOSFET
//  primitives aren't yet in the public DSL. Switch to the PCB and 3D
//  Board tabs to see the layout — that's the focus of this lesson.)
import { Circuit, Resistor, PowerSource, Ground } from "@tscircuit/react-fiber"

export default function CmosInverter() {
  return (
    <Circuit>
      <PowerSource voltage={5} name="VDD" />
      <Resistor resistance="10k" footprint="0805" name="R_pullup" />
      <Resistor resistance="10k" footprint="0805" name="R_pulldown" />
      <Ground />
    </Circuit>
  )
}
` }],
        projects: [], checkpoints: [],
      },
      { id: 'p9m3', title: 'Combinational CMOS Design and Gate Sizing', description: 'Pull-up PMOS network, pull-down NMOS network — duals. NAND/NOR/AOI/OAI. Logical effort for sizing.',
        duration_hours: 6, difficulty: 'Intermediate',
        lessons: [{ id: 'p9m3l1', title: 'CMOS logic and logical effort', type: 'reading', duration_min: 75, summary: 'Any static CMOS gate is built from a PMOS pull-up network and an NMOS pull-down network that are topological duals: wherever the PMOS network has series transistors the NMOS network has parallel, and vice versa. A 2-input NAND, for example, has two PMOS in parallel (pull-up if either input is low) and two NMOS in series (pull-down only if both inputs are high). Logical effort is the framework for sizing these gates optimally: it assigns each gate a complexity factor g (1 for an inverter, 4/3 for NAND2, 5/3 for NOR2 — NOR is worse because PMOS is weaker than NMOS) plus an electrical effort h (fanout load / input capacitance). The optimal sizing of a chain of gates equalizes the stage effort g·h across every stage, which minimizes total delay — a result analogous to impedance matching in analog circuits. Get logical effort right and a chain of inverters driving a huge clock buffer can be sized to push the delay to the theoretical minimum in a few minutes of back-of-envelope math.', key_takeaways: ['PMOS pull-up and NMOS pull-down are topological duals — series↔parallel swap', 'Logical effort g quantifies gate complexity: inv=1, NAND2=4/3, NOR2=5/3 (PMOS is weaker)', 'Optimal sizing equalizes stage effort g·h across the chain — analog of impedance matching', 'NOR is worse than NAND because holes move slower than electrons — prefer NAND in critical paths'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p9m4', title: 'Sequential CMOS: Latches and Flip-Flops', description: 'Latch transparent when clock high/low. Master-slave D flop edge-triggered. t_su, t_h, t_cq. T_clk≥t_cq+t_pd,logic+t_su.',
        duration_hours: 5, difficulty: 'Intermediate',
        lessons: [{ id: 'p9m4l1', title: 'Latches, flip-flops, timing', type: 'reading', duration_min: 75, summary: 'A latch is transparent during one phase of the clock — its output follows its input while the clock is high (or low) and freezes otherwise. A master-slave D flip-flop cascades two latches on opposite clock phases so the whole thing is edge-triggered: the master latches on the rising edge, the slave releases on the falling edge, and the data appears at Q one edge later. Three timing parameters define whether the flop will reliably capture data: setup time t_su (input must be stable before the edge), hold time t_h (must stay stable after), and clock-to-Q delay t_cq (how long after the edge Q takes to update). The minimum clock period is T_clk≥t_cq+t_pd,logic+t_su — the launch flop clock-to-Q plus the longest combinational path plus the capture flop setup. Hold is checked separately: t_cq+t_cd,logic≥t_h must hold even on the fastest path, which is why hold violations are fixed by adding delay rather than slowing the clock. STA tools check every one of these constraints across every register pair and every PVT corner.', key_takeaways: ['D flip-flop = two latches in master-slave; edge-triggered, Q updates one edge after D', 'Setup (t_su), hold (t_h), clock-to-Q (t_cq) define flop timing', 'Min clock period = t_cq + longest combinational path + t_su', 'Hold violations are fixed by adding delay, not by slowing the clock — they are PVT-independent'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p9m5', title: 'Static Timing Analysis', description: 'Setup: longest path (critical path). Hold: shortest path. PVT corners (SS/TT/FF). STA tools: PrimeTime, Tempus.',
        duration_hours: 6, difficulty: 'Advanced',
        cs_bridge: 'STA ↔ longest-path in a DAG. Setup analysis finds longest path (critical path) from launch to capture flop. Hold analysis finds shortest path. Both are graph problems on the same DAG. STA tools do graph traversals with delay models.',
        lessons: [{ id: 'p9m5l1', title: 'STA: setup, hold, corners', type: 'reading', duration_min: 90, summary: 'Static Timing Analysis (STA) is exhaustive where simulation is anecdotal: instead of checking a few clock cycles in a testbench, STA traverses the timing graph of the entire design and verifies every register-to-register path against both setup and hold constraints. Setup slack is T_clk−(t_cq+t_pd,logic+t_su)≥0 — the clock period must be long enough for the worst-case (slowest) combinational path. Hold slack is (t_cq+t_cd,logic)−t_h−clock_skew≥0 — the fastest combinational path must still be slow enough that the data does not race through before the capture flop hold window closes. Because transistor delay depends on process, voltage, and temperature (PVT), every check is repeated at multiple corners: SS (slow-slow) at 0.9V/125°C is worst for setup, FF (fast-fast) at 1.1V/−40°C is worst for hold. A modern chip must sign off clean at every corner, which is why STA tools (PrimeTime, Tempus) are the gate between RTL freeze and tape-out.', key_takeaways: ['STA checks every register-to-register path — exhaustive where simulation is anecdotal', 'Setup slack = clock period − slowest path; must be ≥ 0 at every slow corner', 'Hold slack = fastest path − hold time − clock skew; must be ≥ 0 at every fast corner', 'Sign-off requires clean STA at every PVT corner (SS/TT/FF × voltage × temperature)'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p9m6', title: 'Low-Power Design', description: 'Clock gating (-30 to -60% dynamic). Power gating (-90% leakage). DVFS. Substrate biasing.',
        duration_hours: 5, difficulty: 'Advanced',
        lessons: [{ id: 'p9m6l1', title: 'Clock gating, power gating, DVFS', type: 'reading', duration_min: 75, summary: 'Low-power design rests on four orthogonal techniques that attack different parts of the power equation. Clock gating disables the clock to idle blocks — since dynamic power is P=αCV²f, dropping α to zero for an idle block saves 30-60% of dynamic power and it is by far the easiest big win, usually inserted automatically by synthesis tools. Power gating cuts V_DD entirely to blocks that will be idle for microseconds or longer, dropping their leakage by 90%+ at the cost of state retention and wake-up latency. Dynamic Voltage and Frequency Scaling (DVFS) exploits the V² in dynamic power: run a block at lower voltage and lower frequency when it does not need full speed, accepting that the lower V also slows the gates. Substrate (body) biasing applies a reverse voltage to the transistor body to raise V_th and cut subthreshold leakage — useful when you cannot fully power-gate but still need to reduce standby current. Modern mobile SoCs use all four together, gating clocks by the millisecond, gating power by the second, and DVFS-ing the active cores continuously based on workload.', key_takeaways: ['Clock gating is the easiest big dynamic-power win (30-60%) — usually auto-inserted by synthesis', 'Power gating cuts leakage 90%+ but costs state retention and wake-up latency', 'DVFS exploits the V² in P=αCV²f — lower voltage at lower frequency saves quadratically', 'Mobile SoCs stack all four techniques — clock gating by ms, power gating by s, DVFS continuously'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p9m7', title: 'ASIC vs FPGA Design Flow', description: 'ASIC: full flow, $1M-50M NRE, 8-24 week tape-out. FPGA: instant bitstream, $0 NRE, ~50-70% ASIC performance.',
        duration_hours: 5, difficulty: 'Intermediate',
        lessons: [{ id: 'p9m7l1', title: 'ASIC vs FPGA economics', type: 'reading', duration_min: 60, summary: 'ASIC and FPGA share the front-end flow — design entry, simulation, synthesis, place-and-route, STA — but diverge sharply at the back end. An ASIC adds physical sign-off (DRC, LVS, ERC, antenna checks) and then a tape-out to a foundry, which takes 8-24 weeks and costs $1-50M in NRE (non-recurring engineering) depending on node. An FPGA compiles to a bitstream in minutes: you can fix a bug and have new hardware running over lunch, but the unit cost is high and performance is typically 50-70% of what an ASIC at the same node would deliver. The crossover is volume: below roughly 100k units the FPGA wins on total cost (no NRE to amortize), above 1M units the ASIC wins (low unit cost dominates), and in between it depends on performance, power, and IP sensitivity. Startups and prototyping projects almost always start on FPGA and only move to ASIC when volume and margin justify the NRE — often by taping out a smaller, cheaper node than the FPGA logic would suggest.', key_takeaways: ['ASIC: low unit cost, $1-50M NRE, 8-24 week tape-out; FPGA: high unit cost, $0 NRE, instant bitstream', 'FPGA is ~50-70% of ASIC performance at the same equivalent node', 'Volume crossover: <100k units → FPGA, >1M units → ASIC, in between depends on perf/power/IP', 'Startups prototype on FPGA, move to ASIC only when volume justifies the NRE'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p9m8', title: 'Phase 9 Capstone: Pipelined Adder + Custom Inverter', description: 'Part A: 32-bit carry-lookahead adder in Verilog, pipelined to 4 stages, Artix-7, target 200 MHz. Part B: 2-input NAND in Magic, DRC clean, extract to SPICE.',
        duration_hours: 16, difficulty: 'Advanced',
        lessons: [{ id: 'p9m8l1', title: 'Capstone overview: pipelined adder + custom inverter', type: 'reading', duration_min: 30, summary: 'Part A: 32-bit carry-lookahead adder in Verilog, pipelined to 4 stages, synthesized for Artix-7 at 200 MHz Fmax. Pipeline registers cut the critical path between CLA blocks — STA must be hold-clean at all PVT corners. Part B: 2-input NAND laid out in Magic, DRC clean, extracted to SPICE to compare layout parasitics vs schematic-only delays. The tscircuit viewer below shows the PCB-view workflow you\'ll use to document the board-level integration — for the actual adder logic, use the Verilog HDL Playground above; for the NAND layout, use Magic VLSI locally.', key_takeaways: ['Part A: 32-bit CLA pipelined to 4 stages, Artix-7, target 200 MHz Fmax', 'Part B: 2-input NAND in Magic — DRC clean, extract to SPICE, compare layout vs schematic', 'Pipeline registers cut critical path — STA must be hold-clean at all corners', 'tscircuit renders schematic + PCB + 3D board — use it to document the board integration'], has_tscircuit: true, tscircuit_code: `// Pipelined adder capstone — board-level integration view.
// The actual 32-bit CLA logic lives in Verilog (see the HDL Playground
// above). This tscircuit starter shows the PCB-view workflow: input
// header -> clock oscillator -> 4 green status LEDs (one per pipeline
// stage) -> output header. Switch to PCB / 3D Board tabs to see layout.
import { Circuit, Resistor, Led, PowerSource, Ground } from "@tscircuit/react-fiber"

export default function PipelinedAdderBoard() {
  return (
    <Circuit>
      <PowerSource voltage={5} name="VCC" />
      <Resistor resistance="330" footprint="0805" name="R1" />
      <Resistor resistance="330" footprint="0805" name="R2" />
      <Resistor resistance="330" footprint="0805" name="R3" />
      <Resistor resistance="330" footprint="0805" name="R4" />
      <Led color="green" footprint="0805" name="stage1_led" />
      <Led color="green" footprint="0805" name="stage2_led" />
      <Led color="green" footprint="0805" name="stage3_led" />
      <Led color="green" footprint="0805" name="stage4_led" />
      <Ground />
    </Circuit>
  )
}
` }],
        projects: [
          { id: 'p9m8pr1', title: 'Phase 9 Capstone: FPGA Pipelined Adder + Magic Inverter', goal: 'Part A: pipelined 32-bit CLA adder on FPGA. Part B: NAND gate layout in Magic.', tools: ['Vivado', 'Artix-7 board', 'Magic VLSI', 'ngspice'], steps: ['Part A: implement 32-bit carry-lookahead adder in Verilog, pipeline to 4 stages, synthesize for Artix-7, target 200 MHz Fmax. STA. Onboard: drive from counter, display on 7-seg.', 'Part B: layout 2-input NAND in Magic, DRC clean, extract to SPICE, simulate VTC and propagation delay. Compare to schematic-only. Document layout area in λ².'], pass_criteria: 'Part A: 200 MHz Fmax, hold clean at all corners. Part B: DRC clean, extracted sim matches schematic.', difficulty: 'Advanced', estimated_hours: 16 },
        ],
        checkpoints: [],
      },
    ],
  },

  {
    id: 'p10', index: 10, title: 'Power Systems, Energy & Capstones', subtitle: 'Grid, renewables, EVs, six capstone projects',
    description: 'Two halves. First (modules 10.1-10.9): bulk power system — generation, transmission, distribution, protection, stability, smart grids, storage, renewables, EV charging. Second: six capstone projects — pick one or two, budget 4-6 weeks each, ship a working hardware demo.',
    duration_weeks: 8, color: '#1f6c92',
    goal: 'Ship one of six capstone projects (FOC motor, solar inverter, custom PCB, robotics, smart grid, SDR).',
    modules: [
      { id: 'p10m1', title: 'Power Generation', description: 'Thermal (coal/gas/nuclear), hydro, wind, solar. Capacity factor, LCOE. Renewables are intermittent.',
        duration_hours: 5, difficulty: 'Intermediate',
        lessons: [{ id: 'p10m1l1', title: 'Generation technologies and economics', type: 'reading', duration_min: 60, summary: 'Almost all grid electricity comes from spinning a synchronous generator, and the differences between technologies are mostly about what spins it. Thermal plants (coal, gas, nuclear) boil water to make steam that drives a steam turbine; gas turbines can also use combustion gases directly (Brayton cycle) for fast ramping; hydro uses falling water; wind uses aerodynamic lift on the blades; solar PV is the exception — it has no moving parts and converts photons directly to electrons via the photovoltaic effect. The two economic figures of merit are capacity factor (actual annual output as a fraction of nameplate) and LCOE (levelized cost of energy, in $/MWh, including capital, fuel, and O&M). Nuclear runs at ~90% capacity factor but has high capital cost; solar PV is ~20% (the sun is not always up) and wind ~35% (the wind is not always blowing), but their LCOE is now the cheapest on the grid in most of the world — cheaper than coal in many places. That intermittency is the central problem of the next decade: you cannot run a grid on 50% solar without storage, flexible load, or fast-ramping gas backup.', key_takeaways: ['Most generation spins a synchronous generator — only solar PV has no moving parts', 'Capacity factor = actual output / nameplate; nuclear ~90%, wind ~35%, solar ~20%', 'LCOE (levelized $/MWh): solar and wind are now the cheapest new generation in most markets', 'Intermittency is the central problem — high renewables penetration needs storage or backup'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p10m2', title: 'Transmission and Distribution', description: 'Voltage hierarchy: 200-1000kV transmission, 50-100kV subtransmission, 10-30kV primary, 120/230V secondary. P_loss=I²R scales as 1/V².',
        duration_hours: 5, difficulty: 'Intermediate',
        lessons: [{ id: 'p10m2l1', title: 'Why high voltage for transmission', type: 'reading', duration_min: 60, summary: 'Transmission lines lose power as I²R heating in the conductor, and the only practical lever on I is voltage: for a fixed power P=V·I, raising V lowers I proportionally, so losses fall as 1/V². Doubling the transmission voltage cuts line losses by 4×, which is why the grid steps generation voltage (typically 11-25 kV at the generator terminals) up to 200-1000 kV for long-haul transmission, then back down through subtransmission (50-100 kV), primary distribution (10-30 kV), and finally to the 120/230V secondary at your outlet. Above roughly 600 km, AC transmission loses out to HVDC: DC has no skin effect (uses the full conductor cross-section), no reactive losses, and no stability limit on line length, at the cost of expensive converter stations at each end. China operates the world’s longest HVDC link — 3000 km at ±1.1 MV — moving 12 GW of hydro power from the west to coastal load centers.', key_takeaways: ['P_loss=I²R; raising V lowers I, so losses fall as 1/V² — double V, quarter the loss', 'Voltage hierarchy: 200-1000 kV transmission → 50-100 kV subtransmission → 10-30 kV primary → 120/230 V', 'HVDC beats AC above ~600 km: no skin effect, no reactive loss, no length stability limit', 'China’s ±1.1 MV, 3000 km, 12 GW HVDC link is the world benchmark for long-haul bulk transfer'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p10m3', title: 'Power System Protection', description: 'CT/VT step down for measurement. Relays decide. Breakers interrupt. Overcurrent (50/51), differential (87), distance (81).',
        duration_hours: 6, difficulty: 'Intermediate',
        lessons: [{ id: 'p10m3l1', title: 'Protection principles and schemes', type: 'reading', duration_min: 75, summary: 'Power system protection has one job: detect a fault (short circuit) and isolate just the faulted section, as fast as possible, without disconnecting anything else. The hardware chain is: current transformers (CT) and voltage transformers (VT) step down the line quantities to safe measurement levels; numerical relays run protection algorithms and decide whether to trip; circuit breakers actually interrupt the fault current (which can be tens of kA). Two principles govern every scheme: selectivity (only the breaker closest to the fault should trip — never upstream of it) and speed (3-5 cycles, or 60-100 ms at 50 Hz, to limit equipment damage and preserve grid stability). The four workhorse schemes are overcurrent (50 instantaneous, 51 timed), differential (87 — trip if current in ≠ current out, used for transformers, generators, and buses), distance (21 — measure apparent impedance to find the fault location on a line), and under/over-frequency (81 — detect a generation/load imbalance that is dragging frequency off nominal). Modern numerical relays can run all of these in parallel on a single device.', key_takeaways: ['Hardware chain: CT/VT (step down) → numerical relay (decide) → breaker (interrupt, up to tens of kA)', 'Selectivity: only the closest breaker trips — never upstream of the fault', 'Speed: 3-5 cycles (60-100 ms) to limit damage and preserve stability', 'Workhorse schemes: overcurrent (50/51), differential (87), distance (21), frequency (81)'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p10m4', title: 'Power Quality and Grid Stability', description: 'Sags, swells, harmonics, flicker, transients, freq deviations. Rotor angle / frequency / voltage stability.',
        duration_hours: 5, difficulty: 'Intermediate',
        lessons: [{ id: 'p10m4l1', title: 'Power quality and three stability timescales', type: 'reading', duration_min: 75, summary: 'Power quality covers any deviation of the voltage waveform from the ideal 50/60 Hz pure sine at nominal amplitude: voltage sags and swells (short under/over-voltage), harmonics (integer-multiple distortion from nonlinear loads like rectifiers and variable-frequency drives), flicker (slow amplitude modulation that makes lights visibly dim, classic source is arc furnaces), and transients (sub-cycle spikes, classic cause is lightning). Stability breaks into three timescales that are usually analyzed separately. Rotor-angle stability is the fastest — over seconds, it asks whether the generators stay in synchronism after a disturbance (a fault, a line trip). Frequency stability is intermediate — seconds to minutes — and tracks the balance between generation and load (if load exceeds generation, frequency drops). Voltage stability is the slowest — minutes — and asks whether the system can hold voltage magnitudes under heavy reactive power demand. Each timescale has its own analytical tools, its own protection schemes, and its own failure modes.', key_takeaways: ['Power quality = any deviation from the ideal 50/60 Hz pure sine at nominal amplitude', 'Common PQ issues: sags/swells, harmonics (nonlinear loads), flicker (arc furnaces), transients (lightning)', 'Three stability timescales: rotor-angle (s), frequency (s-min), voltage (min) — analyzed separately', 'Reactive power balance sets voltage stability; real power balance sets frequency stability'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p10m5', title: 'Smart Grid, Microgrids, DER Integration', description: 'Bidirectional comm, distributed sensing. Microgrids can island. DER challenges: variability, voltage regulation, protection, inverter coordination.',
        duration_hours: 5, difficulty: 'Intermediate',
        lessons: [{ id: 'p10m5l1', title: 'Smart grid and DER integration', type: 'reading', duration_min: 75, summary: 'The smart grid is the traditional radial distribution grid augmented with bidirectional communication, distributed sensing, and automated control — essentially adding a control network on top of the power network so the utility can see and react in seconds rather than relying on customer phone calls. A microgrid is a local grid (a campus, a military base, a hospital) with its own generation and storage that can either connect to the main grid or "island" off it when the main grid is disturbed. Distributed energy resources (DERs) — rooftop solar, behind-the-meter batteries, EV chargers — break four assumptions the old grid was built on. Power no longer flows only downhill from substation to customer, so voltage regulation gets harder (rooftop PV can push local voltage above the statutory limit at noon). Protection has to handle bidirectional fault currents. Variability from clouds and wind gusts causes fast swings that legacy controls cannot chase. And inverters (which are the actual interface for almost all DERs) have to coordinate ride-through behavior so a voltage dip does not make every PV system in the neighborhood trip off at once.', key_takeaways: ['Smart grid = traditional grid + bidirectional comm + sensing + automated control', 'Microgrid can island from the main grid and run autonomously on local generation', 'DERs break four legacy assumptions: voltage reg, bidirectional protection, variability, inverter coord', 'Inverter ride-through coordination is essential — a voltage dip must not trip every PV system at once'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p10m6', title: 'Energy Storage and Battery Management', description: 'Li-ion for <4h, pumped hydro for daily/weekly, flow batteries for utility. BMS monitors cells, balances, protects. SOC/SOH.',
        duration_hours: 6, difficulty: 'Intermediate',
        lessons: [{ id: 'p10m6l1', title: 'Storage technologies and BMS', type: 'reading', duration_min: 75, summary: 'Energy storage is the technology that makes a high-renewables grid feasible, and the right chemistry depends on the discharge duration. Li-ion dominates anything under about 4 hours — highest round-trip efficiency (90%+), fastest response, but expensive per kWh of capacity. Pumped hydro is the workhorse for daily and weekly storage (pump water uphill when you have surplus, let it flow back through a turbine when you need it) — it is ~80% of all grid-scale storage on Earth by energy capacity, limited only by geography. Flow batteries and compressed-air energy storage (CAES) target the multi-hour to multi-day gap that Li-ion is too expensive for. Whatever the chemistry, every Li-ion battery needs a Battery Management System (BMS) that monitors every cell’s voltage, temperature, and current; passively or actively balances cells so they do not drift apart in capacity; and protects against over-charge, over-discharge, and over-temperature (a single failed cell can thermal-runaway and take the whole pack with it). State of charge (SOC) is estimated either by coulomb counting (drifts over time) or by an Extended Kalman Filter on a cell model (more accurate, computationally heavier); state of health (SOH) tracks capacity fade and internal resistance growth over the cell’s life.', key_takeaways: ['Li-ion dominates <4h (90%+ efficient); pumped hydro for daily/weekly (80% of grid storage by GWh)', 'Flow batteries and CAES target multi-hour to multi-day where Li-ion is too expensive per kWh', 'BMS is mandatory for Li-ion safety — monitors V/T/I per cell, balances, protects against runaway', 'SOC by coulomb counting (drifts) or EKF on a cell model (accurate); SOH tracks capacity and R fade'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p10m7', title: 'Solar PV Systems and MPPT', description: 'PV cell = illuminated diode. MPP moves with irradiance and temp. P&O MPPT = hill climbing. String vs microinverter.',
        duration_hours: 6, difficulty: 'Intermediate',
        cs_bridge: 'MPPT ↔ hill climbing. P&O (perturb & observe) is literally hill climbing on the P-V curve. Perturb V, observe P: if P increased, keep going; if decreased, reverse. Other algorithms: incremental conductance (gradient sign), fractional Voc (heuristic), model-based. All are optimization at heart.',
        lessons: [{ id: 'p10m7l1', title: 'PV model and MPPT algorithms', type: 'reading', duration_min: 90, summary: 'A photovoltaic cell is electrically an illuminated diode: photons generate electron-hole pairs that the built-in field of the PN junction sweep out as current, and the resulting I-V curve has a sharp knee where the maximum power point (MPP) sits. The MPP voltage moves with irradiance (more sun → more current, slightly higher V) and temperature (hotter panel → lower V, about −0.3%/°C for silicon), so a fixed operating point wastes power most of the time. Maximum Power Point Tracking (MPPT) is the algorithm that continually finds the MPP; the dominant scheme is Perturb & Observe (P&O): nudge the operating voltage, see if power went up or down, keep going the same way if up, reverse if down — literally hill-climbing on the P-V curve. Incremental conductance uses the sign of dP/dV (equivalently dI/dV = −I/V) and converges faster but is more sensitive to noise. The hardware topology is its own decision: a single string inverter (cheap, one point of failure, one MPPT for the whole string — shading on one panel cripples all), microinverters (one per panel, panel-level MPPT, more expensive per watt), or DC optimizers feeding a central inverter (a middle ground).', key_takeaways: ['PV cell = illuminated diode; the I-V curve has a knee at the maximum power point', 'MPP voltage moves with irradiance and temperature (−0.3%/°C for Si) — fixed operating point wastes power', 'P&O MPPT = hill climbing on the P-V curve; incremental conductance converges faster but is noise-sensitive', 'String inverter (cheap, single MPPT) vs microinverter (panel-level MPPT) vs DC optimizer (middle ground)'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p10m8', title: 'Wind Energy Systems', description: 'Power=½ρAv³C_p. Betz limit 0.593. Fixed-speed induction, variable-speed DFIG, variable-speed PMSG with full converter.',
        duration_hours: 4, difficulty: 'Intermediate',
        lessons: [{ id: 'p10m8l1', title: 'Wind turbine types', type: 'reading', duration_min: 60, summary: 'The power in the wind scales as the cube of wind speed: P=½·ρ·A·v³·C_p, where C_p is the power coefficient (the fraction of kinetic energy the rotor can extract). The Betz limit caps C_p at 0.593 — no wind turbine can capture more than 59.3% of the kinetic energy passing through its swept area, because the air has to keep moving to get out of the way. The cubic dependence is brutal: a 10% increase in wind speed gives 33% more power, which is why turbine siting (and height — wind is faster and smoother higher up) matters more than almost any other design choice. Three generator topologies dominate. Fixed-speed induction turbines are the legacy design — cheap and rugged but they cannot track the wind. Doubly-fed induction generators (DFIG) use a partial-rated power converter (about 30% of rated power) on the rotor circuit to allow variable-speed operation, and still make up roughly 30% of the installed fleet. The modern standard is a permanent-magnet synchronous generator (PMSG) with a full-rated power converter, which gives the best energy capture and full grid-code compliance at the cost of more converter hardware — about 70% of new utility-scale turbines are PMSG.', key_takeaways: ['Wind power scales as v³ — 10% more wind speed = 33% more power; siting and height dominate', 'Betz limit: no turbine can capture more than 59.3% of the kinetic energy in its swept area', 'DFIG (partial converter) is ~30% of installed fleet; PMSG + full converter is ~70% of new builds', 'PMSG with full converter gives the best energy capture and full grid-code compliance'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p10m9', title: 'EV Charging Infrastructure', description: 'L1 (1.4 kW), L2 (7-22 kW), DCFC (50-350 kW). Connectors: CCS, NACS, CHAdeMO. Grid impact of fast charging. V2G.',
        duration_hours: 4, difficulty: 'Intermediate',
        lessons: [{ id: 'p10m9l1', title: 'EV charging levels and standards', type: 'reading', duration_min: 60, summary: 'EV charging splits into three power tiers that serve very different use cases. Level 1 plugs into a standard 120V (US) or 230V (EU) outlet and delivers about 1.4 kW — fine for overnight top-ups of a plug-in hybrid but impractically slow for a full BEV recharge. Level 2 uses a 240V (US) or 400V (EU) circuit at 7-22 kW and is the typical home and workplace charger — it will refill a 75 kWh battery overnight. DC Fast Charging (DCFC) bypasses the on-board charger entirely, dumping 50-350 kW of DC straight into the pack, and gets you to 80% in 20-40 minutes; above 80% the charge rate drops sharply to protect the cell, which is why the last 20% takes as long as the first 60%. Connector standards have consolidated: SAE J1772 for L1/L2, CCS for DC fast in most of the world, and NACS (the Tesla connector, now SAE J3400) becoming the US standard across all manufacturers by ~2025. A 350 kW fast charger pulls as much power as a small neighborhood — so fast-charging corridors need serious grid planning. Vehicle-to-Grid (V2G) treats parked EVs as a distributed battery that can soak up solar at noon and feed back at peak evening — a compelling idea, still working through battery-warranty and standards issues.', key_takeaways: ['Three charging tiers: L1 (~1.4 kW overnight), L2 (7-22 kW home/workplace), DCFC (50-350 kW, 20-40 min to 80%)', 'Above 80% SOC the charge rate drops sharply — the last 20% takes as long as the first 60%', 'NACS (Tesla connector, SAE J3400) is becoming the US standard; CCS dominates elsewhere', 'A 350 kW charger = small neighborhood load — fast-charging corridors need serious grid planning'] }],
        projects: [], checkpoints: [],
      },
      { id: 'p10m10', title: 'The Six Capstones', description: 'Pick 1-2 of: (1) FOC motor controller, (2) solar MPPT inverter, (3) custom PCB product, (4) robotics platform, (5) smart grid demo, (6) SDR/RF receiver.',
        duration_hours: 40, difficulty: 'Advanced',
        lessons: [],
        projects: [
          { id: 'p10m10c1', title: 'Capstone 1: FOC Motor Controller', goal: 'Extend Phase 7 capstone to full closed-loop motor controller.', tools: ['STM32G4', '3-phase inverter', '5010 BLDC', 'AS5048 encoder', 'CAN bus'], steps: ['4-quadrant operation, sensorless startup, field weakening, regen braking, CAN interface', 'Step response, disturbance rejection, max speed, max torque, efficiency map'], pass_criteria: 'Closed-loop position/speed/current; 4-quadrant; sensorless start works.', difficulty: 'Advanced', estimated_hours: 30 },
          { id: 'p10m10c2', title: 'Capstone 2: Solar MPPT Inverter', goal: 'Build 100 W off-grid solar inverter with MPPT.', tools: ['50W solar panel', 'MPPT boost converter', 'battery', 'H-bridge inverter', 'ESP32'], steps: ['MPPT boost (12V→24V), battery, SPWM H-bridge with LC filter, 230V/50Hz output', 'P&O MPPT in ESP32, over-current/voltage/temp protection', 'MPPT efficiency vs irradiance, inverter THD, battery charge profile, run-time with LED lamp + phone charger load'], pass_criteria: 'MPPT efficiency > 95%; inverter THD < 5%; runs LED lamp + phone charger for 4+ hours.', difficulty: 'Advanced', estimated_hours: 30 },
          { id: 'p10m10c3', title: 'Capstone 3: Custom PCB Product', goal: 'Take a product from concept to PCB manufacture and assembly.', tools: ['KiCad', 'JLCPCB', 'DigiKey parts', 'soldering iron', '3D printer'], steps: ['Pick small useful device (USB-C PD trigger, ESP32 sensor board, LED driver, signal generator)', 'Spec → schematic (KiCad) → BOM → PCB layout → DRC → order from JLCPCB ($10 for 5)', 'Order parts from DigiKey, assemble, test, firmware, 3D-printed enclosure'], pass_criteria: '5 working boards, one in enclosure, ready to use.', difficulty: 'Advanced', estimated_hours: 30 },
          { id: 'p10m10c4', title: 'Capstone 4: Robotics Platform', goal: 'Build differential-drive robot with closed-loop control and SLAM-lite.', tools: ['Raspberry Pi 4', 'STM32 motor driver', '2 DC motors with encoders', 'MPU6050 IMU', 'RPLIDAR A1'], steps: ['ROS 2, differential-drive kinematics, PID speed control on STM32, IMU+encoder fusion for odometry', 'Occupancy grid mapping (Gmapping or Cartographer), autonomous navigation (Nav2)', 'Closed-loop step response, odometry accuracy over 10m, mapping of a room, autonomous nav between waypoints'], pass_criteria: 'Robot maps room and navigates between waypoints autonomously.', difficulty: 'Advanced', estimated_hours: 40 },
          { id: 'p10m10c5', title: 'Capstone 5: Smart Grid Demo', goal: 'Build tabletop microgrid with PV + battery + load + IoT telemetry.', tools: ['small PV panel', 'MPPT charge controller', 'Li-ion pack with BMS', 'inverter', 'ESP32', 'Raspberry Pi'], steps: ['Components: PV, MPPT, Li-ion+BMS, AC load (LED+fan), inverter, ESP32 telemetry, Pi running Mosquitto+InfluxDB+Grafana', 'Features: real-time power flow monitoring, automatic load shedding on low battery, grid/island switching, remote control via MQTT', 'Tests: charge profile from PV, discharge profile under load, autonomy time, load shedding behavior, dashboard responsiveness'], pass_criteria: 'Dashboard shows real-time power flow; load shedding works; 4+ hour autonomy on PV charge.', difficulty: 'Advanced', estimated_hours: 30 },
          { id: 'p10m10c6', title: 'Capstone 6: SDR / RF Receiver', goal: 'Build software-defined radio receiver front-end.', tools: ['antenna', 'LNA (SPF5189)', 'RTL-SDR or AD9361', 'Raspberry Pi', 'GNU Radio'], steps: ['Hardware: antenna (dipole or patch), LNA, RTL-SDR or AD9361, Pi for processing', 'Software: GNU Radio flowgraph: source → band-pass → AGC → demodulator → sink', 'Project: receive and decode (a) FM broadcast, (b) ADS-B aircraft (1090 MHz), (c) NOAA weather satellite images (137 MHz), (d) AIS ship tracking (162 MHz). Pick one or more.', 'Tests: sensitivity, selectivity, dynamic range, decoding success rate'], pass_criteria: 'Decoded data (audio, image, or position feed) at >10 m range.', difficulty: 'Advanced', estimated_hours: 30 },
        ],
        checkpoints: [],
      },
    ],
  },
];

// ─── Stats (computed once) ─────────────────────────────────────────────
export const CURRICULUM_STATS = (() => {
  let modules = 0, lessons = 0, projects = 0, checkpoints = 0, hours = 0;
  for (const phase of CURRICULUM) {
    for (const mod of phase.modules) {
      modules++;
      hours += mod.duration_hours;
      lessons += mod.lessons.length;
      projects += mod.projects.length;
      checkpoints += mod.checkpoints.length;
    }
  }
  return { phases: CURRICULUM.length, modules, lessons, projects, checkpoints, hours };
})();
