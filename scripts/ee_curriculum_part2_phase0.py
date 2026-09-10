"""
EE Curriculum Content — Front Matter (How to Use) + Phase 0 (Foundations & Math Bridge).
"""

from ee_curriculum_part1_setup import *

def build_front_matter():
    s = []
    s.append(heading('How to Use This Curriculum', 0))
    s.append(p(
        "This curriculum is a complete, rigorous, project-based pathway from a working "
        "knowledge of computer science to a working knowledge of electrical engineering. "
        "It is not a survey. It is not a list of topics to look up later. It is a "
        "12-month plan that mixes mathematics, simulation, and bench work in roughly "
        "equal measure, so that by the time you finish Phase 10 you can specify, design, "
        "build, debug, and document a real electrical system — a motor controller, a "
        "solar inverter, a custom PCB product, a robotics platform, a smart-grid demo, "
        "or a software-defined radio front-end."))
    s.append(p(
        "The structure is hierarchical and consistent. <b>Phases</b> are the ten top-level "
        "blocks; each phase runs four to eight weeks. A phase contains several <b>modules</b>; "
        "each module is sized for roughly four to ten hours of focused study. Every module "
        "breaks down into <b>lessons</b> (the conceptual reading), one or more "
        "<b>hands-on projects</b> (simulation and/or hardware), and a <b>checkpoint</b> "
        "(self-test questions you must be able to answer cold before moving on). "
        "Six <b>capstone projects</b> in Phase 10 integrate everything you have learned "
        "into shipping-grade hardware."))

    s.append(heading('The CS-Bridge Pattern', 1))
    s.append(p(
        "You are a computer scientist. That is not a handicap — it is leverage. Almost every "
        "EE concept has a precise analog in computer science, and once you see the mapping, "
        "you can learn EE three to five times faster than a freshman would. Throughout this "
        "curriculum, every module opens with a small yellow <b>CS BRIDGE</b> callout that "
        "names the CS concept you already know and the EE concept it maps to. Use these "
        "bridges as your primary scaffolding — when an equation looks alien, ask first "
        "what data structure or algorithm it corresponds to in code."))

    s.append(cs_bridge(
        "<b>FSM ↔ sequential circuit.</b> A finite-state machine in a compiler course and "
        "a Mealy/Moore machine built from flip-flops are the same mathematical object. "
        "Once you accept this, sequential circuit design becomes 'compile your state graph "
        "into gates and a register'. The same is true for FFT ↔ DCT (both are fast "
        "orthogonal transforms using butterfly factorization), for state-space ↔ linear "
        "dynamical systems (both are first-order matrix recurrences), for recursion ↔ RLC "
        "transients (both are solutions to a linear recurrence relation), and for "
        "pipelining ↔ CPU pipeline (both are registered data-flow graphs optimizing "
        "throughput at the cost of latency)."))

    s.append(heading('The Project Model — Hardware + Simulation', 1))
    s.append(p(
        "Every module has at least one hands-on project, and the projects are deliberately "
        "split between simulation and hardware. Simulation lets you test ideas fast and "
        "without burning parts; hardware teaches you what simulation hides — parasitics, "
        "noise, grounding, probe loading, real-component tolerance, and the thousand small "
        "ways a bench can lie to you. A module that is simulation-only is a partial module. "
        "A module that is hardware-only is missing the math. Plan to spend roughly one-third "
        "of your weekly EE time at the bench."))

    s.append(heading('The Toolchain', 1))
    s.append(p(
        "The curriculum standardizes on free or low-cost tools so nothing blocks you. "
        "<b>LTspice</b> is the SPICE simulator of record — free, fast, and the industry "
        "default for analog. <b>KiCad</b> is the open-source PCB design suite; we use it "
        "for schematic capture and PCB layout from Phase 3 onward. <b>Arduino IDE</b> "
        "introduces embedded work in Phase 4; <b>ESP32</b> adds wireless; <b>STM32</b> "
        "(via STM32CubeIDE or PlatformIO) is the real-world MCU you will use for motor "
        "control and capstones. <b>Python</b> with <i>NumPy</i>, <i>SciPy</i>, "
        "<i>matplotlib</i>, and <i>control</i> handles signal processing, control "
        "system design, and data analysis — leveraging what you already know. "
        "<b>Octave</b> (the free MATLAB clone) is used where the EE literature expects "
        "MATLAB syntax. <b>Vivado WebPACK</b> and a cheap Artix-7 board cover FPGA work. "
        "<b>Magic VLSI</b> introduces IC layout. Full installation instructions are in "
        "Appendix A."))

    s.append(heading('Pacing the 12 Months', 1))
    s.append(p(
        "The curriculum is calibrated for roughly 12 months at 10–15 hours per week. If you "
        "can sustain 15 hours per week, you will finish in 12. At 10 hours per week, plan "
        "for 15–16 months. The pacing is also flexible: phases can be interleaved if you "
        "prefer to work on theory and bench in parallel. The 12-month calendar in "
        "Appendix E maps every module to a specific week, with review weeks and exam-style "
        "self-tests built in. Treat the calendar as a soft target, not a hard deadline — "
        "the only hard rule is that you must complete every checkpoint before advancing."))

    s.append(make_table([
        ['Phase','Topic','Weeks','Hours/Week','Cum.'],
        ['0','Foundations & Math Bridge','4','12','48'],
        ['1','DC Circuit Analysis','5','12','108'],
        ['2','AC Circuit Analysis','5','12','168'],
        ['3','Analog Electronics','6','12','240'],
        ['4','Digital Logic & Embedded','6','12','312'],
        ['5','Signals, Systems & DSP','7','12','396'],
        ['6','Control Systems & Robotics','6','12','468'],
        ['7','Power Electronics & Machines','7','12','552'],
        ['8','EM Fields, RF & Communications','6','12','624'],
        ['9','VLSI & IC Design','5','12','684'],
        ['10','Power Systems, Energy & Capstones','8','15','804'],
        ['—','Total','65','—','~804 h'],
    ], col_widths=[18*mm, 70*mm, 18*mm, 24*mm, 22*mm]))
    s.append(Spacer(1, 6))
    s.append(p("That is roughly 800 hours of focused work. A four-year EE B.Sc. contains "
               "about 1,500 hours of in-major study; you are covering the practical core "
               "in a little over half the time, because you are skipping the general-education "
               "requirements and because your CS background does real work for you.",
               'caption'))

    s.append(heading('Prerequisites Checklist', 1))
    s.append(p("Before you start Phase 0, you should be comfortable with the following. "
               "If any item is shaky, the Phase 0 math bootcamp will patch it, but expect "
               "to spend extra hours there."))
    s.append(bullet_list([
        "<b>Programming:</b> Python or C/C++ at an intermediate level. You should be able to write a 200-line program with no help.",
        "<b>Discrete math:</b> sets, functions, relations, induction, basic graph theory, modular arithmetic.",
        "<b>Linear algebra:</b> vectors, matrices, matrix multiplication, inverses, determinants, eigenvalues (conceptually).",
        "<b>Single-variable calculus:</b> derivatives and integrals of polynomials, exponentials, and trig functions; the chain rule; u-substitution.",
        "<b>Basic physics:</b> what charge, current, voltage, and a magnetic field <i>are</i> conceptually. We will formalize this in Phase 0.",
        "<b>Comfort at a terminal:</b> installing packages, editing config files, running scripts.",
    ]))

    s.append(heading('A Note on the Bench', 1))
    s.append(p(
        "Hardware work costs money. The starter bill of materials in Appendix B comes to "
        "about $150 — breadboard, DMM, resistors/caps/inductors, OpAmps, transistors, 555, "
        "regulators, Arduino Uno, ESP32 devkit, jumper wires, and a small bench supply. "
        "The full kit (~$600) adds an STM32 Nucleo, a BLDC motor with driver, an oscilloscope "
        "(or a DSO138 kit), an FPGA board, and a bench load. You can complete Phases 0–3 "
        "with the starter kit alone. From Phase 4 onward you will want to extend. Do not "
        "buy everything at once — buy what the current phase needs, and only after you "
        "have understood why you need it."))

    s.append(heading('Symbols and Conventions', 1))
    s.append(p("Throughout this curriculum, the following conventions are used. They are "
               "standard EE conventions, but stating them once prevents confusion later."))
    s.append(bullet_list([
        "<b>Units:</b> SI throughout. V (volt), A (ampere), Ω (ohm), F (farad), H (henry), W (watt), J (joule), Hz (hertz), Wb (weber), T (tesla).",
        "<b>Lowercase v(t), i(t):</b> time-varying voltage and current. <b>Uppercase V, I:</b> DC or RMS values.",
        "<b>Boldface v, i, V, I:</b> phasor or vector quantities.",
        "<b>j</b> is the imaginary unit (not <b>i</b>, which is reserved for current).",
        "<b>Reference directions:</b> passive sign convention — current enters the positive voltage terminal of a device.",
        "<b>Ground symbol:</b> circuit common, not necessarily earth ground.",
        "<b>Arrow ↑/↓</b> in figures indicates assumed positive direction of current.",
        "<b>f' = df/dt, f\" = d²f/dt²</b> — dot notation is used for time derivatives when the variable name is short.",
    ]))

    s.append(PageBreak())
    return s

# ════════════════════════════════════════════════════════════════════════════
# PHASE 0 — FOUNDATIONS & MATH BRIDGE
# ════════════════════════════════════════════════════════════════════════════
def build_phase0():
    s = []
    s.append(heading('Phase 0 — Foundations & Math Bridge', 0))
    s.append(p('<b>Duration:</b> 4 weeks · <b>Modules:</b> 4 · <b>Goal:</b> patch the math, '
               'patch the physics, install the tools, and build the CS↔EE bridge you will '
               'walk across for the next 11 months.', 'kicker'))

    s.append(p(
        "Phase 0 is not optional. Even if you remember your calculus, you almost certainly "
        "do not remember it in the form an EE textbook uses it: differential equations as "
        "the native language of circuits, complex exponentials as the native language of "
        "AC analysis, and linear algebra as the native language of signals and systems. "
        "This phase rebuilds that fluency in four weeks. It also installs the entire "
        "toolchain and verifies each tool with a 'hello-world' exercise, so that when "
        "Phase 1 starts you are not still fighting installers."))

    # ─── Module 0.1 ─────────────────────────────────────────────────────────
    s.append(heading('Module 0.1 — Math Bootcamp for EE', 1))
    s.append(p('<b>Duration:</b> 8–10 hours · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(cs_bridge(
        "<b>Linear dynamical systems ↔ linear recurrences.</b> The ODE "
        "<i>y\" + 3y' + 2y = u(t)</i> and the recurrence "
        "<i>y[n] = a·y[n−1] + b·u[n]</i> are the same object in different domains "
        "(continuous vs. discrete time). Eigenvalues of the system matrix are the "
        "poles of the transfer function; stability means poles in the left half "
        "plane (continuous) or inside the unit circle (discrete). You already "
        "know this from Markov chains and PageRank — the math is identical."))

    s.append(heading('Calculus refresher', 2))
    s.append(p(
        "EE lives and dies by the derivative and the integral. The derivative is the "
        "instantaneous rate of change of a quantity; in circuits it appears as "
        "<i>i = C·dv/dt</i> (capacitor current is proportional to the rate of change "
        "of voltage) and <i>v = L·di/dt</i> (inductor voltage is proportional to the "
        "rate of change of current). The integral is the accumulation of a quantity "
        "over time; the capacitor voltage is <i>v(t) = (1/C)·∫i(τ)dτ</i> and the "
        "inductor current is <i>i(t) = (1/L)·∫v(τ)dτ</i>. These four equations are "
        "the entire reason calculus matters in EE — memorize them now and refer back "
        "to them constantly."))
    s.append(formula_box(
        "i<sub>C</sub>(t) = C · dv<sub>C</sub>/dt &nbsp;&nbsp;&nbsp; "
        "v<sub>L</sub>(t) = L · di<sub>L</sub>/dt"))
    s.append(formula_box(
        "v<sub>C</sub>(t) = (1/C) · ∫ i<sub>C</sub>(τ) dτ &nbsp;&nbsp;&nbsp; "
        "i<sub>L</sub>(t) = (1/L) · ∫ v<sub>L</sub>(τ) dτ"))
    s.append(p(
        "Worked example: a 1 μF capacitor has a constant 2 mA flowing into it. The "
        "voltage rises at <i>dv/dt = i/C = (2 mA)/(1 μF) = 2000 V/s</i>. After 5 ms, "
        "the voltage has risen by 10 V. This linear ramp is the integral of a constant. "
        "If instead the current is a 1 kHz sine of 1 mA amplitude, the voltage is a "
        "1 kHz cosine of amplitude <i>I/(ωC) = 1mA/(2π·1000·1μF) ≈ 0.159 V</i> — "
        "i.e., 90° out of phase and scaled by 1/(ωC). The same arithmetic returns in "
        "every AC circuit you will ever analyze."))

    s.append(heading('Differential equations', 2))
    s.append(p(
        "An RLC circuit is a second-order linear ODE with constant coefficients. The "
        "general form is <i>y\" + a·y' + b·y = f(t)</i>, and the solution is the sum of "
        "a homogeneous solution (decaying sinusoid in the underdamped case, sum of two "
        "decaying exponentials in the overdamped case) and a particular solution driven "
        "by <i>f(t)</i>. You will derive this from scratch in Phase 1, but the key "
        "fluency you need now is: given a characteristic equation <i>s² + a·s + b = 0</i>, "
        "find the roots, classify the response (overdamped/critically damped/underdamped), "
        "and write down the homogeneous solution. Practice this with five examples before "
        "moving on."))
    s.append(formula_box(
        "s² + 2ζω<sub>n</sub>·s + ω<sub>n</sub>² = 0 &nbsp;&nbsp;&nbsp; "
        "s = −ζω<sub>n</sub> ± ω<sub>n</sub>·√(ζ² − 1)"))
    s.append(p(
        "The two parameters <i>ζ</i> (damping ratio) and <i>ω<sub>n</sub></i> (natural "
        "frequency) are the entire personality of a second-order system. ζ &gt; 1 means "
        "overdamped (two real poles, no overshoot). ζ = 1 means critically damped (fastest "
        "response with no overshoot). 0 &lt; ζ &lt; 1 means underdamped (decaying oscillation, "
        "some overshoot). ζ = 0 means pure oscillation. Negative ζ means unstable — the "
        "response grows without bound. You will see these four cases physically in Phase 1 "
        "when you ring an LC tank and in Phase 6 when you tune a control loop."))

    s.append(heading('Linear algebra — the four subspaces view', 2))
    s.append(p(
        "EE uses linear algebra more aggressively than most CS coursework does. The four "
        "fundamental subspaces (column space, row space, null space, left null space) "
        "appear when you solve circuit equations via modified nodal analysis: the "
        "incidence matrix of the circuit graph has a non-trivial null space exactly when "
        "the circuit contains voltage sources, and the way you resolve that null space is "
        "what gives you the modified-nodal-analysis (MNA) algorithm SPICE uses internally."))
    s.append(p(
        "Eigenvalues and eigenvectors are the natural modes of a linear system. For a "
        "circuit, the natural modes are the decaying exponentials that appear when you "
        "remove the input; for a power grid, they are the electromechanical oscillations "
        "between generators; for a filter, they are the pole frequencies. Eigendecomposition "
        "of the system matrix <i>A</i> in <i>ẋ = A·x + B·u</i> is the standard way to "
        "understand stability and transient response — you will use it heavily in Phase 6."))
    s.append(make_table([
        ['Linear algebra concept','Where it appears in EE','Phase'],
        ['Vector space, basis','Phasor representation of sinusoids','2'],
        ['Matrix multiplication','MNA system assembly in SPICE','1'],
        ['Eigenvalues / eigenvectors','Natural modes of RLC, system poles','1, 6'],
        ['Matrix inverse','Solving for node voltages','1'],
        ['Singular Value Decomposition','MIMO control, signal subspace','6, 5'],
        ['QR factorization','Stable least-squares for system ID','6'],
        ['Condition number','Numerical conditioning of stiff circuits','5'],
    ], col_widths=[55*mm, 85*mm, 20*mm]))

    s.append(heading('Complex analysis — the engineer’s cut', 2))
    s.append(p(
        "You do not need full complex analysis. You need four operations fluently: "
        "(1) Euler’s identity <i>e<sup>jθ</sup> = cos θ + j·sin θ</i> — the bridge between "
        "trig and exponentials; (2) the polar form <i>z = |z|·e<sup>jφ</sup></i> — the "
        "natural representation for AC magnitudes and phases; (3) complex arithmetic — "
        "addition in Cartesian, multiplication and division in polar; (4) the complex "
        "derivative in the Laplace domain — differentiation becomes multiplication by "
        "<i>s</i>, integration becomes division by <i>s</i>. Master these four and you "
        "can read any EE textbook."))
    s.append(formula_box(
        "e<sup>jθ</sup> = cos θ + j·sin θ &nbsp;&nbsp;|&nbsp;&nbsp; "
        "z = a + jb = |z|·e<sup>jφ</sup>, &nbsp; |z| = √(a² + b²), &nbsp; φ = atan2(b, a)"))
    s.append(p(
        "Why complex numbers? Because AC steady-state analysis with trig identities is "
        "painful, and with complex exponentials is mechanical. A sinusoidal voltage "
        "<i>v(t) = V<sub>m</sub>·cos(ωt + φ)</i> becomes the phasor <b>V</b> = V<sub>m</sub>·e<sup>jφ</sup>. "
        "Ohm’s law generalizes from <i>V = I·R</i> to <b>V = I·Z</b>, where the impedance "
        "<b>Z</b> absorbs the magnitude scaling and the phase shift in one complex number. "
        "A circuit that takes a page of trig to solve becomes a single complex linear "
        "algebra problem. This is the single biggest payoff of Phase 0 math: it makes "
        "Phase 2 ten times easier than it would otherwise be."))

    s.append(heading('Probability — just enough', 2))
    s.append(p(
        "Probability matters for DSP (noise, estimation, adaptive filters), communications "
        "(bit error rates, channel capacity), and reliability (mean time to failure). For "
        "now you need: random variables, PDF and CDF, expectation and variance, the Gaussian "
        "distribution, the central limit theorem, and basic Bayes’ rule. We will deepen this "
        "in Phases 5 and 8. If you have not seen these concepts, spend 90 minutes with "
        "the first three chapters of any undergraduate probability text — that is sufficient "
        "for now."))

    s.append(project_box('Math Bootcamp Self-Test', [
        ('Goal:', 'verify you can do the math the rest of the curriculum assumes.'),
        ('Tasks:', 'solve all five problems without external help, in under 90 minutes.'),
        ('1.', 'Solve y\" + 4y\' + 4y = 0 with y(0)=1, y\'(0)=0. Classify the response and sketch it.'),
        ('2.', 'Find eigenvalues and eigenvectors of A = [[0,1],[-2,-3]]. What is the natural mode?'),
        ('3.', 'Convert v(t) = 5·cos(100t − 30°) to a phasor. Compute v(t) + 3·sin(100t).'),
        ('4.', 'Compute the Laplace transform of e^(−2t)·u(t). What is the s-domain pole?'),
        ('5.', 'A 10 μF cap has i(t) = 5·sin(1000t) mA. Find v(t) assuming v(0)=0.'),
        ('Pass criterion:', '4 of 5 correct. Anything below — repeat the relevant Phase 0 lesson.'),
    ]))

    s.append(checkpoint_box([
        "What does dv/dt physically represent for a capacitor? What does ∫i dt represent?",
        "Classify the response of a 2nd-order system given ζ and ω_n. What is the boundary between underdamped and overdamped?",
        "Why is the polar form of a complex number more convenient than Cartesian for AC multiplication?",
        "What is the physical meaning of an eigenvalue of the system matrix A in ẋ = A·x + B·u?",
        "Convert the recurrence y[n] = 0.5·y[n−1] + u[n] to the Z-domain. Where is the pole? Is the system stable?",
    ]))

    s.append(PageBreak())

    # ─── Module 0.2 ─────────────────────────────────────────────────────────
    s.append(heading('Module 0.2 — Physics for EE: Fields, Charges, and Magnets', 1))
    s.append(p('<b>Duration:</b> 6–8 hours · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(cs_bridge(
        "<b>Field ↔ distributed hash.</b> A scalar field φ(x,y,z) is a function from "
        "3D space to a number — exactly like a 3D array indexed by coordinates. A "
        "vector field <b>E</b>(x,y,z) is a function from 3D space to a vector. Maxwell’s "
        "equations are simply differential operators (grad, div, curl) applied to "
        "these fields. The 'gradient' ∇φ is the field-theoretic analog of a derivative: "
        "it points in the direction of fastest increase. The 'divergence' ∇·<b>F</b> is "
        "a 3D generalization of 'is this a source or sink?'. The 'curl' ∇×<b>F</b> "
        "measures rotation."))

    s.append(heading('Electrostatics — the source of voltage', 2))
    s.append(p(
        "Voltage is fundamentally about electric field. A charge <i>Q</i> in free space "
        "produces an electric field <b>E</b> that points radially outward (for positive Q) "
        "and falls off as 1/r². The field is the gradient of a scalar potential: "
        "<b>E</b> = −∇φ, where φ is the voltage. This is why voltage is a scalar — it is "
        "the line integral of the field along a path: <i>V<sub>AB</sub> = −∫<sub>A</sub><sup>B</sup> "
        "<b>E</b>·d<b>l</b></i>. Two points at different potentials have an electric field "
        "between them. Moving a charge through that field requires (or releases) energy: "
        "<i>W = Q·V</i>. That is where the familiar <i>W = QV</i>, <i>V = IR</i>, and "
        "<i>P = VI</i> come from — energy per charge, charge per time, energy per time."))
    s.append(formula_box(
        "<b>F</b> = Q·<b>E</b> &nbsp;&nbsp;|&nbsp;&nbsp; <b>E</b> = −∇φ &nbsp;&nbsp;|&nbsp;&nbsp; "
        "V<sub>AB</sub> = −∫<sub>A</sub><sup>B</sup><b>E</b>·d<b>l</b> &nbsp;&nbsp;|&nbsp;&nbsp; "
        "W = Q·V &nbsp;&nbsp;|&nbsp;&nbsp; P = V·I"))

    s.append(heading('Magnetostatics — the source of inductance', 2))
    s.append(p(
        "A current <i>I</i> flowing through a wire produces a magnetic field <b>B</b> "
        "circling the wire (right-hand rule). A coil of wire concentrates this field and "
        "creates a flux linkage λ = N·Φ that is proportional to the current: λ = L·I, "
        "where L is the inductance. The voltage across the inductor is the rate of change "
        "of flux linkage: <i>v = dλ/dt = L·di/dt</i>. This is the same equation you saw "
        "in Module 0.1, but now you know <i>why</i> — it is Faraday’s law of induction, "
        "one of Maxwell’s four equations."))
    s.append(p(
        "Two coils that share flux are magnetically coupled. The coupling is described by "
        "a mutual inductance M, and is the basis of every transformer. The ratio of turns "
        "sets the voltage ratio (V₂/V₁ = N₂/N₁); the load on the secondary reflects to "
        "the primary scaled by (N₁/N₂)². This is why power-grid transformers can step "
        "voltage up for transmission and back down for distribution with negligible loss "
        "— an ideal transformer is a lossless impedance converter."))

    s.append(heading('Maxwell’s equations — the whole picture', 2))
    s.append(p(
        "Maxwell’s equations are the four PDEs that govern all of classical electromagnetism. "
        "They are the source code of EE. Memorize them in differential form — they are "
        "not optional."))
    s.append(make_table([
        ['Name','Differential form','What it says'],
        ['Gauss’s law (E)','∇·E = ρ/ε₀','Charge creates electric field.'],
        ['Gauss’s law (B)','∇·B = 0','No magnetic monopoles.'],
        ['Faraday’s law','∇×E = −∂B/∂t','Changing magnetic field creates electric field (induction).'],
        ['Ampère-Maxwell','∇×B = μ₀·J + μ₀·ε₀·∂E/∂t','Current and changing E field create magnetic field.'],
    ], col_widths=[40*mm, 60*mm, 70*mm]))
    s.append(p(
        "From these four equations you can derive: Ohm’s law (in a conductor, J = σ·E), "
        "the wave equation (set J=0 and ρ=0 in free space — you get ∇²E = μ₀ε₀·∂²E/∂t², "
        "which is the wave equation with speed 1/√(μ₀ε₀) = c), Kirchhoff’s current law "
        "(∫∇·J dV = 0 → charge conservation at a node), and Kirchhoff’s voltage law "
        "(∮E·dl = −d/dt ∫B·dA = 0 in the absence of changing flux → sum of voltages "
        "around a loop is zero). Every circuit law you will ever use is a special case of "
        "Maxwell. The reason circuit analysis works at all is that for most circuits the "
        "physical dimensions are tiny compared to the wavelength, so the ∂B/∂t and ∂E/∂t "
        "terms are negligible — this is the lumped-circuit approximation."))

    s.append(project_box('Maxwell to Circuits', [
        ('Goal:', 'see how KCL, KVL, and Ohm’s law fall out of Maxwell.'),
        ('Tasks:', '(a) Derive KCL from ∇·J + ∂ρ/∂t = 0 (charge conservation). '
                   '(b) Derive KVL from ∮E·dl = −dΦ/dt in the limit Φ→0. '
                   '(c) Derive Ohm’s law J = σE from a Drude-model argument.'),
        ('Tool:', 'paper and pencil — no simulation needed yet.'),
        ('Pass criterion:', 'write out the three derivations cleanly, in your own words, '
                            'without consulting the text.'),
    ]))

    s.append(checkpoint_box([
        "What physical quantity does the line integral of E between two points give you?",
        "Why does a transformer only work with AC, not DC?",
        "State each of Maxwell’s four equations in words.",
        "Why is the lumped-circuit approximation valid for a 60 Hz circuit on a 10 cm board?",
        "What is the physical meaning of L·di/dt? Where does the L come from?",
    ]))

    s.append(PageBreak())

    # ─── Module 0.3 ─────────────────────────────────────────────────────────
    s.append(heading('Module 0.3 — The CS-to-EE Bridge', 1))
    s.append(p('<b>Duration:</b> 4–6 hours · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(p(
        "This module is a single, dense reference: the side-by-side mapping of CS concepts "
        "to EE concepts. Refer back to this table throughout the curriculum. Every module’s "
        "CS BRIDGE callout is a pointer back to one of these mappings."))

    s.append(make_table([
        ['CS concept','EE concept','Why they are the same'],
        ['FSM (Mealy/Moore)','Sequential logic circuit','Both are graphs with states and a register holding the current state; transitions are combinational logic.'],
        ['Recurrence relation','LTI difference equation','y[n] = a·y[n−1] + b·u[n] is a first-order IIR filter; y[n] = (y[n−1] + y[n])/2 is a moving-average filter.'],
        ['Markov chain','Discrete-time LTI system','State transition matrix A, state x[n+1] = A·x[n]. Stationary distribution = eigenvector of eigenvalue 1.'],
        ['Convolution (image filtering)','Convolution (LTI system)','Both are y[n] = Σ h[k]·x[n−k]. A 1D image filter and an FIR filter are identical code.'],
        ['DCT (JPEG)','DFT / FFT','Both are fast orthogonal transforms over a basis of sinusoids; FFT factorization is divide-and-conquer.'],
        ['DAG / topological sort','Signal-flow graph / SFG analysis','Both are directed graphs; Mason’s gain rule is a topological traversal of the SFG.'],
        ['Graph Laplacian','Circuit incidence matrix','Both encode connectivity; circuit MNA uses the same graph-theoretic structure.'],
        ['Hash function','Modulation / encoding','Both map data to a different signal space robustly; PSK/QAM are "hashing" bits to complex symbols.'],
        ['Error-correcting code','Channel coding','Hamming, Reed-Solomon, LDPC, Turbo — all are linear algebra over GF(2) or extensions.'],
        ['Pipelined CPU','Pipelined digital design','Same idea: register between combinational stages to increase throughput at latency cost.'],
        ['Critical path analysis (STA)','Longest path in DAG','Setup-time analysis = longest combinational path between registers.'],
        ['Markov decision process','Optimal control (LQR)','Both maximize expected reward / minimize cost-to-go over a dynamical system.'],
        ['Hill climbing','MPPT (solar)','Perturb & observe MPPT is hill climbing on the P-V curve.'],
        ['PID controller','Gradient descent (sort of)','PID is a heuristic controller; gradient descent is a heuristic optimizer. Both use error feedback.'],
        ['PageRank','Steady-state of a Markov chain','Both find the dominant eigenvector of a transition matrix.'],
        ['Backpropagation','Sensitivity analysis in circuits','Chain rule through a computational graph = adjoint method through a circuit.'],
    ], col_widths=[40*mm, 45*mm, 85*mm]))

    s.append(heading('Using the Bridge Well', 2))
    s.append(p(
        "The bridge is a learning aid, not a substitute. Every analogy has a point where "
        "it breaks: a CS FSM is discrete and synchronous by assumption, while a physical "
        "sequential circuit has setup/hold constraints, metastability, and clock skew. "
        "When the analogy starts to creak, drop it and learn the EE concept on its own "
        "terms. The bridge exists to get you to first fluency fast; depth comes from "
        "engaging the specifics."))

    s.append(project_box('Build Your Own Bridge', [
        ('Goal:', 'practice mapping a CS concept to its EE twin.'),
        ('Tasks:', "pick three CS concepts you use weekly (e.g., red-black trees, "
                   "memoization, async/await) and write one paragraph each mapping them "
                   "to an EE analog. There is no 'correct' answer — the exercise is to "
                   "think structurally."),
        ('Tool:', 'paper and pencil.'),
        ('Pass criterion:', "your three paragraphs are concrete enough that another CS "
                            "engineer could follow the analogy."),
    ]))

    s.append(checkpoint_box([
        "Name three CS concepts that map onto the same EE concept. Justify each.",
        "Where does the FSM ↔ sequential-circuit analogy break? Name two physical phenomena the CS abstraction hides.",
        "Why is a convolutional image filter literally the same code as a 1D FIR filter?",
        "How does PageRank connect to the natural modes of a circuit?",
    ]))

    s.append(PageBreak())

    # ─── Module 0.4 ─────────────────────────────────────────────────────────
    s.append(heading('Module 0.4 — Toolchain Setup & Hello-Worlds', 1))
    s.append(p('<b>Duration:</b> 6–8 hours · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(p(
        "You will install and verify every tool now, so that no later phase is held up by "
        "an installer. Each tool gets a 10-minute hello-world. Detailed installation "
        "instructions for every operating system are in Appendix A; this module assumes "
        "you can follow them and focuses on the verification step."))

    s.append(make_table([
        ['Tool','Purpose','Hello-world'],
        ['LTspice','SPICE simulation of analog circuits','Transient sim of an RC low-pass driven by a 1 kHz square wave. Verify the time constant matches RC.'],
        ['KiCad 8','Schematic capture and PCB layout','Draw the same RC low-pass as a schematic; run ERC; export the netlist.'],
        ['Arduino IDE','Introductory embedded (Phase 4)','Blink an LED at 1 Hz on an Arduino Uno. Modify the blink pattern to Morse code for your initials.'],
        ['ESP32 (PlatformIO)','Wireless embedded (Phase 4)','Connect ESP32 to WiFi; print its IP to serial; serve a "Hello" web page on port 80.'],
        ['STM32CubeIDE','Real-MCU embedded (Phase 4, 7, capstones)','Toggle a GPIO at 1 Hz on a Nucleo F446; read the toggle with a logic analyzer or scope.'],
        ['Python + NumPy/SciPy/matplotlib','DSP, control, signal processing, plots','Plot a 1 kHz sine and its FFT; verify the peak is at 1 kHz.'],
        ['Octave (or MATLAB)','Classic EE computations','Solve the linear system A·x = b for A = [[2,1],[1,3]], b = [1, 2]; verify A·x = b.'],
        ['Vivado WebPACK','FPGA design (Phase 4, 9)','Implement a 4-bit counter in Verilog; synthesize; verify the RTL schematic looks right.'],
        ['Magic VLSI','IC layout (Phase 9)','Lay out a single NMOS transistor; run DRC; verify zero errors.'],
        ['GNU Radio','SDR / comms (Phase 8)','Build a flowgraph: source → low-pass → sink. Plot the spectrum.'],
    ], col_widths=[32*mm, 50*mm, 88*mm]))

    s.append(heading('Hardware verification', 2))
    s.append(p(
        "If you have the starter kit (Appendix B), do the bench-side hello-worlds too: "
        "(1) measure the resistance of a 1 kΩ resistor with your DMM — confirm it is "
        "within tolerance; (2) build a voltage divider with two 1 kΩ resistors across "
        "5 V — confirm the midpoint is 2.5 V ±0.05 V; (3) drive an LED with 5 V through "
        "a 330 Ω resistor — confirm the LED current is about 10 mA and the LED voltage "
        "drop is about 2 V; (4) charge a 100 μF capacitor through a 10 kΩ resistor from "
        "5 V — confirm the time constant is 1 s by measuring how long it takes to reach "
        "63% of 5 V. These four exercises verify your DMM, breadboard, supply, and your "
        "understanding of the most basic circuit laws."))

    s.append(project_box('Toolchain Sign-Off', [
        ('Goal:', 'every tool installed and verified before Phase 1 begins.'),
        ('Tasks:', 'complete all 10 hello-worlds in the table above + 4 bench exercises. '
                   'Take a screenshot or photo of each successful result and save in a '
                   'tools/ subfolder. This is your toolchain passport.'),
        ('Pass criterion:', 'all 14 checks pass. Any failure → debug before proceeding. '
                            'Do not start Phase 1 with a broken toolchain — you will pay '
                            'compound interest on that debt later.'),
    ]))

    s.append(checkpoint_box([
        "Did every hello-world run successfully? If not, what was the fix?",
        "What is the time constant of an RC circuit and how did you measure it on the bench?",
        "Why is the LED voltage drop about 2 V regardless of supply voltage?",
        "In your FFT hello-world, what is the relationship between the sine frequency, the sample rate, and the FFT bin where the peak appears?",
    ]))

    s.append(PageBreak())
    return s
