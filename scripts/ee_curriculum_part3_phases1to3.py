"""
EE Curriculum Content — Phases 1-3 (DC Circuits, AC Circuits, Analog Electronics).
"""

from ee_curriculum_part1_setup import *

# ════════════════════════════════════════════════════════════════════════════
# PHASE 1 — DC CIRCUIT ANALYSIS
# ════════════════════════════════════════════════════════════════════════════
def build_phase1():
    s = []
    s.append(heading('Phase 1 — DC Circuit Analysis', 0))
    s.append(p('<b>Duration:</b> 5 weeks · <b>Modules:</b> 7 · <b>Goal:</b> master the '
               'analytical machinery of DC circuits — Ohm, Kirchhoff, nodal/mesh analysis, '
               'Thevenin/Norton, superposition, and the transient behavior of energy-storage '
               'elements.', 'kicker'))

    s.append(p(
        "DC circuit analysis is the foundation of all EE. Every later topic — AC, analog "
        "electronics, power, even RF — is a generalization of DC analysis. The mental model "
        "is simple: charges move through conductors in response to electric fields, and the "
        "movement is constrained by the topology of the circuit. The math that emerges from "
        "this picture is graph theory plus linear algebra, which you already know. The work "
        "of this phase is to make that mapping automatic."))

    s.append(volt_says(
        'Welcome to circuits. You already know this stuff. You just don\'t know you '
        'know it. A wire is a variable. A resistor is a throttle. A capacitor is a '
        'buffer. By the end of this phase, circuits will feel as natural as code.',
        mood='story'))

    # ── Module 1.1 ──
    s.append(heading('Module 1.1 — Charge, Current, Voltage, Power, Energy', 1))
    s.append(p('<b>Duration:</b> 4–6 h · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(cs_bridge(
        "<b>Charge ↔ packet, current ↔ packet rate, voltage ↔ pressure.</b> "
        "Charge (coulomb, C) is the count of electrons that have moved past a point. "
        "Current (ampere, A = C/s) is the rate of that flow. Voltage (volt, V = J/C) is "
        "the energy per unit charge — the electrical analog of pressure. Power (watt, "
        "W = J/s = V·A) is the rate of energy delivery. Energy (joule, J = W·s) is the "
        "integral of power over time. These five quantities are the entire vocabulary of "
        "circuit analysis — memorize their definitions and units cold."))

    s.append(p(
        "The passive sign convention is the rule that keeps power accounting consistent. "
        "For any two-terminal device, label one terminal + and the other −. The current "
        "<i>i</i> is defined as entering the + terminal. Then <i>p = v·i</i> is the power "
        "<b>absorbed</b> by the device. If <i>p &gt; 0</i>, the device consumes power "
        "(resistor, charging capacitor, charging inductor). If <i>p &lt; 0</i>, the device "
        "delivers power (battery, discharging cap, op-amp output). Sum the powers over all "
        "elements in a circuit and you must get zero — this is Tellegen’s theorem, the "
        "circuit-level statement of energy conservation."))

    s.append(volt_says(
        'Pick a direction for your current arrow. Any direction. It doesn\'t matter. If '
        'you guess wrong, the answer comes out negative. That\'s fine. Negative just '
        'means the current goes the other way. The math fixes your guess for you.',
        mood='tip'))

    s.append(amp_says(
        'So I can pick directions randomly and the math sorts it out?',
        mood='question'))

    s.append(volt_says(
        'Yes. As long as you\'re consistent. The only sin is not labeling at all.',
        mood='tip'))

    s.append(formula_box(
        "Q = ∫ i dt &nbsp;&nbsp;|&nbsp;&nbsp; V = W/Q &nbsp;&nbsp;|&nbsp;&nbsp; "
        "P = V·I = I²·R = V²/R &nbsp;&nbsp;|&nbsp;&nbsp; W = ∫ P dt"))

    s.append(pull_quote(
        'Voltage is energy per unit charge. Current is charge per unit time. Power is '
        'energy per unit time. Everything else in circuit analysis is bookkeeping on '
        'these three definitions.',
        'Volt, on the five fundamental quantities'))

    s.append(heading('Reference directions and the sign convention', 2))
    s.append(p(
        "Reference directions are arbitrary; the math tells you whether your guess was "
        "right. You label a current arrow in some direction and assign + and − to the "
        "device terminals. Then you solve. If the answer is positive, your arrow was "
        "pointing in the actual direction of positive charge flow. If negative, the "
        "actual flow is opposite. This freedom matters because complex circuits have "
        "dozens of unknown currents, and you cannot guess them all correctly. The "
        "convention is: pick a direction, write the equation, let the math correct you."))

    s.append(heading('Power — sources vs. sinks', 2))
    s.append(p(
        "A voltage source delivering current from its + terminal is supplying power "
        "<i>p = −v·i</i> (with passive sign convention). A resistor always absorbs power "
        "<i>p = i²·R &gt; 0</i> — there is no such thing as negative resistance in a "
        "passive resistor (active circuits can synthesize negative resistance, and we "
        "will meet that idea in Phase 3 with op-amps). A capacitor stores energy "
        "<i>W = ½·C·V²</i> in its electric field; an inductor stores energy "
        "<i>W = ½·L·I²</i> in its magnetic field. These storage terms are the bridge "
        "to the transients you will study in Module 1.6."))

    s.append(project_box('Bench: Measure Power in a 3-Resistor Circuit', [
        ('Goal:', 'verify power conservation by direct measurement.'),
        ('Circuit:', '5V supply → 220Ω → 330Ω → 470Ω to ground (series string).'),
        ('Measure:', 'voltage across and current through each resistor with the DMM.'),
        ('Compute:', 'P = V·I for each resistor; sum. Compare to V_supply · I_total.'),
        ('Pass:', 'the two totals agree within DMM tolerance (≤2% error).'),
    ]))

    s.append(checkpoint_box([
        "Define charge, current, voltage, power, and energy. Give the SI unit of each.",
        "State the passive sign convention. What does p > 0 mean? p < 0?",
        "How much energy is stored in a 100 μF cap charged to 12 V? In a 10 mH inductor carrying 2 A?",
        "Why is the sum of powers in any circuit exactly zero?",
    ]))

    s.append(pixel_divider())

    # ── Module 1.2 ──
    s.append(heading('Module 1.2 — Ohm’s Law and Kirchhoff’s Laws', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(cs_bridge(
        "<b>KCL ↔ conservation at a node in a flow network.</b> Kirchhoff’s current law "
        "(KCL) says the sum of currents into a node is zero. This is literally the same "
        "as flow conservation in a graph: edges have flows, internal nodes have zero net "
        "flow. Kirchhoff’s voltage law (KVL) says the sum of voltages around any closed "
        "loop is zero — this is the discrete analog of ∮E·dl = 0 in a conservative field. "
        "KCL and KVL together are a graph-theoretic system: nodes have potentials "
        "(unknowns), edges have currents (unknowns), and the two Kirchhoff laws plus the "
        "element constitutive laws (V=IR for resistors) close the system."))

    s.append(volt_says(
        'KCL is just flow conservation. Same math as a pipe network. Same math as a '
        'packet-switched router. KVL is the same idea, but for voltage. You already know '
        'this from graph theory. We\'re just applying it to electrons instead of packets.',
        mood='insight'))

    s.append(amp_says(
        'So Kirchhoff is just graph theory?',
        mood='question'))

    s.append(volt_says(
        'Yes. Conservation at the nodes. Conservation around the loops. That\'s it.',
        mood='tip'))

    # ── Pixel diagram: voltage_divider (most-used DC circuit) ──
    s.extend(diagram('voltage_divider',
        caption='Voltage divider — V_in → R1 → midpoint → R2 → ground. V_out = V_in · R2/(R1+R2).'))

    s.append(heading('Ohm’s law — the constitutive relation', 2))
    s.append(p(
        "Ohm’s law <i>V = I·R</i> is the constitutive relation of an ideal resistor. It "
        "is linear, time-invariant, and memoryless — the resistor’s voltage depends only "
        "on the current at this instant. Real resistors deviate: they have temperature "
        "coefficients (typically 50–200 ppm/°C for metal film), parasitic inductance "
        "(a few nH for a ¼W metal film), and parasitic capacitance to ground. For DC and "
        "low-frequency work, all of these are negligible. They will start to matter in "
        "Phase 2 (AC) and Phase 8 (RF)."))
    s.append(formula_box("V = I · R &nbsp;&nbsp;|&nbsp;&nbsp; I = V / R &nbsp;&nbsp;|&nbsp;&nbsp; R = V / I"))

    s.append(volt_says(
        'The number one mistake beginners make: forgetting the ground reference. Without '
        'a ground, node voltages are undefined. The system has infinitely many solutions. '
        'Always pick one node as ground before writing any equation.',
        mood='warning'))

    s.append(amp_says(
        'Like picking the origin in a coordinate system?',
        mood='question'))

    s.append(volt_says(
        'Exactly. Without it, you can\'t say where anything is.',
        mood='tip'))

    s.append(heading('KCL — current conservation', 2))
    s.append(p(
        "At any node, the algebraic sum of currents is zero. A node is any point where "
        "two or more elements connect; in graph-theoretic terms, it is a vertex of the "
        "circuit graph. Pick a reference direction (in or out) for each current at the "
        "node. Sum to zero. If you have <i>n</i> nodes, KCL gives <i>n−1</i> independent "
        "equations (the last is dependent — sum of all node equations is automatically "
        "zero). This is the same rank-deficiency you see in a graph incidence matrix; the "
        "null space is the trivial constant-potential vector, which is why you need a "
        "ground reference."))

    s.append(heading('KVL — voltage conservation', 2))
    s.append(p(
        "Around any closed loop, the algebraic sum of voltages is zero. Walk around the "
        "loop, assign + when you go from − to + across an element, − when you go + to −. "
        "Sum to zero. The number of independent loops is <i>b − n + 1</i>, where <i>b</i> "
        "is the number of branches and <i>n</i> the number of nodes — this is the cycle "
        "rank of the graph, exactly the number of independent cycles in graph theory."))

    s.append(heading('Solving circuits by hand: the systematic method', 2))
    s.append(p(
        "For small circuits (3–5 nodes), you can solve by inspection. For larger circuits, "
        "use a systematic method: assign node voltages (one node is ground, the rest are "
        "unknowns), write KCL at each non-ground node, solve the linear system. This is "
        "<b>nodal analysis</b>. Alternatively, assign mesh currents (one per independent "
        "loop), write KVL around each mesh, solve. This is <b>mesh analysis</b>. Nodal "
        "works for any circuit; mesh works only for planar circuits. SPICE uses a "
        "generalization of nodal analysis called Modified Nodal Analysis (MNA) that also "
        "handles voltage sources cleanly."))
    s.append(p(
        "<b>Worked example (nodal):</b> Circuit with three nodes — ground, V₁, V₂. "
        "V₁ connected to a 5 V source. Between V₁ and V₂: 1 kΩ. Between V₂ and ground: "
        "2 kΩ. KCL at V₂: (V₂−V₁)/1k + V₂/2k = 0 → 2·(V₂−5) + V₂ = 0 → 3·V₂ = 10 → "
        "V₂ = 3.33 V. Current through the 2 kΩ is 1.67 mA. Total power delivered by "
        "source = 5 V · 1.67 mA = 8.33 mW. Power dissipated in the two resistors: "
        "(5−3.33)²/1k + 3.33²/2k = 2.78 + 5.55 = 8.33 mW. Conservation confirmed."))

    s.append(project_box('LTspice + Bench: 4-Node Network', [
        ('Goal:', 'solve a 4-node circuit three ways — by hand, by LTspice, on the bench — '
                  'and reconcile all three answers.'),
        ('Circuit:', 'voltage divider with a load. V₁ = 12 V source; R1 = 1 kΩ series; '
                     'node A feeds R2 = 2 kΩ to ground AND R3 = 4 kΩ to node B; node B has '
                     'R4 = 1 kΩ to ground. Compute V_A and V_B.'),
        ('By hand:', 'nodal analysis. Should take 5 minutes.'),
        ('LTspice:', 'build the same circuit; run .op (operating point); record V_A and V_B.'),
        ('Bench:', 'build it on a breadboard with 5% resistors; measure V_A and V_B with DMM.'),
        ('Reconcile:', 'explain any discrepancy. The 5% resistor tolerance should account for '
                       'most of it. Compute the worst-case range and confirm the bench '
                       'measurement is inside it.'),
    ]))

    s.append(checkpoint_box([
        "State KCL and KVL in your own words. What physical laws are they derived from?",
        "How many independent KCL equations does an n-node circuit have? KVL equations?",
        "Why does nodal analysis need a ground reference?",
        "When is mesh analysis more convenient than nodal? When is it impossible?",
        "Set up and solve a 3-node circuit with two voltage sources by nodal analysis.",
    ]))

    s.append(pixel_divider())

    # ── Module 1.3 ──
    s.append(heading('Module 1.3 — Node Voltage & Mesh Current Methods', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(p(
        "Module 1.2 introduced the systematic methods at a high level. This module "
        "deepens them to handle the cases that trip up beginners: voltage sources between "
        "two non-reference nodes (the supernode), current sources shared between two "
        "meshes (the supermesh), and dependent sources. Master these three cases and you "
        "can solve any linear DC circuit by hand."))

    s.append(heading('Supernodes', 2))
    s.append(p(
        "When a voltage source connects two non-reference nodes, you cannot write a "
        "simple KCL at either node because the current through the source is unknown. "
        "The fix is to merge the two nodes into a supernode and write KCL for the "
        "supernode as a whole, then add the constraint equation <i>V<sub>j</sub> − "
        "V<sub>k</sub> = V<sub>source</sub></i>. The supernode KCL plus the constraint "
        "give you the missing equation. Practice this on a 3-node circuit with a 5 V "
        "source between nodes 2 and 3 — without the supernode trick, you cannot solve it."))

    s.append(heading('Supermeshes', 2))
    s.append(p(
        "The dual case in mesh analysis: a current source on the boundary between two "
        "meshes. The voltage across the current source is unknown, so you cannot write a "
        "clean KVL for either mesh. Merge the two meshes into a supermesh, write KVL "
        "around the outer perimeter (skipping the current source), and add the constraint "
        "<i>I<sub>mesh2</sub> − I<sub>mesh1</sub> = I<sub>source</sub></i>."))

    s.append(heading('Dependent sources', 2))
    s.append(p(
        "Dependent sources model active devices — the output of a transistor depends on "
        "its input current or voltage. To handle them, treat the dependent source like an "
        "independent one in the KCL/KVL equations, then add the constraint equation that "
        "defines the dependency (e.g., <i>V<sub>dep</sub> = 5·I<sub>x</sub></i> where "
        "<i>I<sub>x</sub></i> is a current elsewhere in the circuit). The system stays "
        "linear; the only cost is one extra equation per dependent source."))

    s.append(project_box('Practice Set: 10 Circuits by Hand', [
        ('Goal:', 'fluency with nodal/mesh on any linear circuit.'),
        ('Tasks:', 'solve 10 circuits of increasing difficulty (supernode, supermesh, '
                   'dependent source, mixed sources) by hand. The problem set is in '
                   'appendix/circuits_phase1.pdf — work them in order.'),
        ('Tool:', 'paper and pencil. Calculator allowed. No SPICE.'),
        ('Pass:', '9 of 10 correct (an answer is correct when the power balance closes — '
                  'sum of all element powers is zero to within rounding).'),
    ]))

    s.append(checkpoint_box([
        "What is a supernode and when do you need one?",
        "What is a supermesh and when do you need one?",
        "How do you handle a dependent source in nodal analysis?",
        "Solve a circuit with a CCVS (current-controlled voltage source) using nodal analysis.",
    ]))

    # ── Module 1.4 ──
    s.append(heading('Module 1.4 — Thevenin & Norton Equivalent Circuits', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(cs_bridge(
        "<b>Thevenin ↔ API encapsulation.</b> A Thevenin equivalent is the circuit "
        "analog of an API: from the outside (the load), all that matters is V_th and "
        "R_th; everything inside the black box is hidden. Swap the box for any other box "
        "with the same V_th and R_th and the load cannot tell. This is the most useful "
        "circuit theorem in practice — it is how you reason about output impedance of "
        "op-amps, signal-source loading, sensor interfaces, and power-supply design."))

    s.append(volt_says(
        'Thevenin\'s theorem is just encapsulation. Hide everything behind two numbers. '
        'V_th and R_th. The load can\'t tell what\'s inside. When you think about output '
        'impedance, sensor loading, or supply design, you\'re computing a Thevenin '
        'equivalent. You just don\'t call it that.',
        mood='insight'))

    s.append(amp_says(
        'So it\'s like an interface in code? The rest of the world doesn\'t see the '
        'implementation?',
        mood='question'))

    s.append(volt_says(
        'That\'s exactly what it is. Two-terminal interface. Two numbers.',
        mood='tip'))

    s.append(p(
        "Thevenin’s theorem: any linear two-terminal circuit containing voltage/current "
        "sources and resistors can be replaced by an equivalent circuit consisting of a "
        "single voltage source V_th in series with a single resistor R_th. Norton’s "
        "theorem is the dual: a current source I_N in parallel with R_N. The two are "
        "interchangeable via source transformation: V_th = I_N · R_th, R_N = R_th."))

    s.append(heading('Finding V_th and R_th', 2))
    s.append(p("Two methods, both must be in your toolkit:"))
    s.append(bullet_list([
        "<b>Open-circuit / short-circuit method.</b> V_th = V_oc (open-circuit voltage at the terminals). "
        "I_N = I_sc (short-circuit current). R_th = V_oc / I_sc. Three measurements or computations, done.",
        "<b>Test-source method.</b> Turn off all independent sources (voltage sources → short, current "
        "sources → open; leave dependent sources alone). Apply a test voltage V_test at the terminals, "
        "compute I_test, R_th = V_test / I_test. Works even with dependent sources, which the open/short "
        "method struggles with.",
    ]))

    s.append(heading('Maximum power transfer', 2))
    s.append(p(
        "A classic theorem: if a source has Thevenin resistance R_th, the load that "
        "extracts maximum power from it is R_L = R_th. At that match, the load voltage is "
        "V_th/2, the load current is V_th/(2·R_th), and the load power is "
        "V_th²/(4·R_th). The source dissipates an equal amount — efficiency is 50%. "
        "This is why RF systems are almost always impedance-matched (50 Ω everywhere) "
        "and why power-grid transformers are <i>not</i> impedance-matched (you want "
        "efficiency, not maximum power transfer)."))
    s.append(formula_box("P<sub>L,max</sub> = V<sub>th</sub>² / (4·R<sub>th</sub>)  when  R<sub>L</sub> = R<sub>th</sub>"))

    s.append(project_box('Bench: Thevenize a Real Divider', [
        ('Goal:', 'verify Thevenin equivalence on the bench.'),
        ('Circuit:', '12V → 1kΩ → node A → 1kΩ → ground (a 1:1 divider). V_A open = 6V.'),
        ('Compute:', 'V_th = 6V, R_th = 1kΩ ∥ 1kΩ = 500Ω.'),
        ('Verify load behavior:', 'attach loads of 100Ω, 500Ω, 1kΩ, 10kΩ. Measure V_A under each load. '
                                  'It should match V_th · R_L / (R_th + R_L).'),
        ('Replace:', 'swap the divider for a 6V source in series with a 500Ω resistor. Repeat the load '
                     'sweep. The voltages should match the original within tolerance.'),
        ('Pass:', 'all 4 load measurements agree between the original and the Thevenin equivalent, '
                  'within 2% (resistor tolerance + DMM accuracy).'),
    ]))

    s.append(checkpoint_box([
        "State Thevenin’s and Norton’s theorems.",
        "Two methods for finding R_th. When do you prefer the test-source method?",
        "What is the maximum-power-transfer condition? Why is it not used in power grids?",
        "Thevenize a voltage divider with a load. What is the practical implication for sensor readout?",
    ]))

    s.append(pixel_divider())

    # ── Module 1.5 ──
    s.append(heading('Module 1.5 — Superposition & Source Transformation', 1))
    s.append(p('<b>Duration:</b> 4–6 h · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(p(
        "Two more circuit-reduction techniques that work only on linear circuits. "
        "<b>Superposition</b>: in a circuit with multiple independent sources, the response "
        "(any voltage or current) is the sum of the responses to each source acting alone "
        "(others turned off: voltage sources → shorts, current sources → opens). "
        "<b>Source transformation</b>: a voltage source V in series with R is equivalent to "
        "a current source I = V/R in parallel with R, and vice versa. Both techniques are "
        "tools for simplifying a circuit before solving; they are not strictly necessary, "
        "but they often turn a 20-minute nodal analysis into a 2-minute back-of-envelope."))

    # ── Pixel diagram: superposition (linearity in action) ──
    s.extend(diagram('superposition',
        caption='Superposition — turn off sources one at a time, sum the individual responses. Linearity is the whole game.'))

    s.append(heading('Linearity is the whole game', 2))
    s.append(p(
        "Every theorem in this module — Thevenin, Norton, superposition, source "
        "transformation — depends on the circuit being linear. If the circuit contains "
        "a diode, transistor, or any nonlinear element, these theorems do not apply "
        "directly. The standard workaround is to linearize around an operating point "
        "(small-signal model) — which is exactly what we will do in Phase 3 when we "
        "model transistors as small-signal equivalent circuits."))

    s.append(project_box('LTspice: Superposition on a 2-Source Circuit', [
        ('Goal:', 'verify superposition numerically.'),
        ('Circuit:', 'two 5V sources and three resistors arranged so that V_mid depends on both.'),
        ('Step 1:', 'simulate with both sources on; record V_mid.'),
        ('Step 2:', 'turn off source 2 (set to 0); record V_mid1.'),
        ('Step 3:', 'turn off source 1; record V_mid2.'),
        ('Pass:', 'V_mid1 + V_mid2 = V_mid exactly (within numerical precision).'),
    ]))

    s.append(checkpoint_box([
        "State the superposition principle. What kind of circuits does it apply to?",
        "How do you 'turn off' a voltage source? A current source?",
        "Why does superposition fail for nonlinear circuits?",
        "Demonstrate source transformation on a Thevenin equivalent to get a Norton equivalent.",
    ]))

    # ── Module 1.6 ──
    s.append(heading('Module 1.6 — Capacitors, Inductors & Transient Analysis', 1))
    s.append(p('<b>Duration:</b> 8–10 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(cs_bridge(
        "<b>RC transient ↔ exponential decay recursion.</b> The ODE "
        "<i>RC·dv/dt + v = V<sub>s</sub></i> has solution "
        "<i>v(t) = V<sub>s</sub>·(1 − e<sup>−t/RC</sup>)</i> for a step input. The same "
        "exponential decay structure appears in CS as the temperature schedule of "
        "simulated annealing, the convergence of gradient descent on a quadratic, and "
        "the cooling of a Markov chain to its stationary distribution. The time constant "
        "τ = RC is the half-life (more precisely, the 1/e time) of the decay."))

    s.append(volt_says(
        'A capacitor isn\'t really a component. It\'s a promise. A promise that the '
        'voltage across it won\'t change instantly. An inductor makes the same promise '
        'about current. These two promises are the whole key to transient analysis.',
        mood='insight'))

    # ── Pixel diagram: wheatstone bridge ──
    s.extend(diagram('wheatstone_bridge',
        caption='Wheatstone bridge — four resistors in a diamond. Tiny changes in R cause large changes in V_out (sensor readout).'))
    # ── Pixel diagram: rc_charging curve ──
    s.extend(diagram('rc_charging',
        caption='RC charging curve — V_C(t) = V_s · (1 − e^(−t/τ)). After τ, 63% charged; after 5τ, ~99%.'))
    # ── Pixel diagram: rl_charging curve ──
    s.extend(diagram('rl_charging',
        caption='RL charging curve — I_L(t) = (V_s/R) · (1 − e^(−t/τ)), τ = L/R. Dual of the RC response.'))
    # ── Pixel diagram: rlc_damped response ──
    s.extend(diagram('rlc_damped',
        caption='RLC damped response — underdamped ringing decays exponentially. ζ < 1 means complex poles.'))

    s.append(heading('Capacitors and inductors as energy stores', 2))
    s.append(p(
        "Resistors dissipate energy — they convert it to heat, irreversibly. Capacitors "
        "and inductors store energy — reversibly. A capacitor stores energy in its "
        "electric field: <i>W = ½·C·V²</i>. An inductor stores energy in its magnetic "
        "field: <i>W = ½·L·I²</i>. The constitutive laws are differential: <i>i = C·dv/dt</i> "
        "and <i>v = L·di/dt</i>. Because these involve derivatives, the voltage across a "
        "cap cannot change instantaneously (it would require infinite current), and the "
        "current through an inductor cannot change instantaneously (it would require "
        "infinite voltage). These two continuity conditions are the key to transient "
        "analysis."))
    s.append(formula_box(
        "i<sub>C</sub> = C·dv<sub>C</sub>/dt &nbsp;&nbsp;|&nbsp;&nbsp; "
        "v<sub>L</sub> = L·di<sub>L</sub>/dt &nbsp;&nbsp;|&nbsp;&nbsp; "
        "W<sub>C</sub> = ½·C·V² &nbsp;&nbsp;|&nbsp;&nbsp; W<sub>L</sub> = ½·L·I²"))
    # ── Pixel diagrams: the three passive components ──
    s.extend(diagram('resistor',
        caption='Resistor (American rectangle symbol) — V = IR, dissipates P = I²R as heat.'))
    s.extend(diagram('capacitor',
        caption='Capacitor (parallel-plate symbol) — i = C·dv/dt, stores energy in E-field.'))
    s.extend(diagram('inductor',
        caption='Inductor (coil symbol) — v = L·di/dt, stores energy in B-field.'))

    s.append(heading('First-order transients — the RC and RL step response', 2))
    s.append(p(
        "An RC circuit driven by a step from 0 to V_s has the ODE "
        "<i>RC·dv/dt + v = V<sub>s</sub></i>. The solution is "
        "<i>v(t) = V<sub>s</sub>·(1 − e<sup>−t/τ</sup>)</i> with τ = RC. The current is "
        "<i>i(t) = (V<sub>s</sub>/R)·e<sup>−t/τ</sup></i>. After one time constant the "
        "voltage has reached 63% of its final value; after five time constants it is "
        "within 1%. The RL step response is identical in form: "
        "<i>i(t) = (V<sub>s</sub>/R)·(1 − e<sup>−t/τ</sup>)</i> with τ = L/R."))
    s.append(formula_box(
        "v<sub>C</sub>(t) = V<sub>f</sub> + (V<sub>0</sub> − V<sub>f</sub>)·e<sup>−t/τ</sup> &nbsp;&nbsp; τ = RC"))

    s.append(heading('Second-order transients — the RLC response', 2))
    s.append(p(
        "A series RLC has the ODE <i>L·d²i/dt² + R·di/dt + (1/C)·i = 0</i> after the "
        "source is removed. Characteristic equation: <i>s² + (R/L)·s + 1/(LC) = 0</i>. "
        "Compare to the canonical form <i>s² + 2ζω<sub>n</sub>·s + ω<sub>n</sub>² = 0</i> "
        "and read off <i>ω<sub>n</sub> = 1/√(LC)</i> and <i>ζ = (R/2)·√(C/L)</i>. The "
        "three regimes — overdamped, critically damped, underdamped — appear physically:"))
    s.append(bullet_list([
        "<b>Overdamped (ζ &gt; 1):</b> R is large. Two real, negative poles. The response is a slow exponential decay with no overshoot.",
        "<b>Critically damped (ζ = 1):</b> R is exactly right. Repeated real pole. Fastest possible settling with no overshoot.",
        "<b>Underdamped (ζ &lt; 1):</b> R is small. Complex conjugate poles. The response rings — a decaying sinusoid at frequency ω_d = ω_n·√(1−ζ²).",
    ]))

    s.append(project_box('Bench: Ring an LC Tank', [
        ('Goal:', 'see the three damping regimes physically.'),
        ('Circuit:', '10 mH inductor in series with a 100 nF cap and a variable resistor (1kΩ pot).'),
        ('Drive:', 'charge the cap to 5V, then disconnect the supply and let the tank ring.'),
        ('Measure:', 'scope across the cap. You should see a decaying sinusoid.'),
        ('Sweep R:', 'start with R = 0 (just the inductor’s DCR). Then increase R. Watch the '
                     'ringing get less pronounced, then disappear at critical damping, then '
                     'become a slow exponential rise.'),
        ('Compute:', 'verify ζ = (R/2)·√(C/L) matches the observed behavior. ω_n should be '
                     '1/√(LC) ≈ 10⁴ rad/s = 1.6 kHz.'),
    ]))

    s.append(checkpoint_box([
        "Why can’t the voltage across a capacitor change instantaneously? What about the current through an inductor?",
        "What is the time constant of an RC circuit? An RL circuit?",
        "Write the general second-order ODE and the canonical form. Define ζ and ω_n.",
        "What value of R makes a series RLC critically damped? Compute it for L = 10 mH, C = 100 nF.",
        "Sketch the step response of an underdamped second-order system. Label rise time, overshoot, settling time.",
    ]))

    s.append(pull_quote(
        'The capacitor is not a component — it is a promise that the voltage across it '
        'will not change instantly. The inductor makes the dual promise about current.',
        'Volt, on continuity conditions'))

    s.append(volt_says(
        'Phase 1 is done. You can solve any linear DC circuit. You understand the three '
        'passive components. You can predict what happens when you flip a switch. Phase '
        '2 takes these tools into the AC domain. Every signal is a sine wave. Impedance '
        'replaces resistance. The math is the same. Only the costumes change.',
        mood='story'))

    s.append(PageBreak())
    return s

# ════════════════════════════════════════════════════════════════════════════
# PHASE 2 — AC CIRCUIT ANALYSIS
# ════════════════════════════════════════════════════════════════════════════
def build_phase2():
    s = []
    s.append(heading('Phase 2 — AC Circuit Analysis', 0))
    s.append(p('<b>Duration:</b> 5 weeks · <b>Modules:</b> 6 · <b>Goal:</b> generalize DC '
               'analysis to sinusoidal steady-state via phasors and impedance; master AC '
               'power (real, reactive, apparent, power factor); meet resonance and '
               'three-phase systems.', 'kicker'))

    s.append(p(
        "AC analysis is the technique that makes sinusoidal circuits as easy as DC "
        "circuits. The trick is the phasor transform: a sinusoidal voltage "
        "<i>v(t) = V<sub>m</sub>·cos(ωt + φ)</i> is represented by a single complex "
        "number <b>V</b> = V<sub>m</sub>·e<sup>jφ</sup>. Differentiation becomes "
        "multiplication by jω, integration becomes division by jω, and the entire "
        "machinery of DC analysis (Ohm, Kirchhoff, Thevenin) carries over with R replaced "
        "by complex impedance Z. This single mathematical move turns a hard problem "
        "(solving ODEs with sinusoidal forcing) into a routine linear algebra problem."))

    s.append(volt_says(
        'Phase 2 is the payoff for all the complex-number work in Phase 0. Once you see '
        'that a sine wave is a single complex number, and that differentiation is just '
        'multiplication by jω, every AC circuit becomes a DC circuit with complex '
        'resistors. The whole chapter is one trick. Applied a hundred ways.',
        mood='story'))

    s.append(amp_says(
        'So a capacitor becomes a complex resistor?',
        mood='question'))

    s.append(volt_says(
        'Yes. With a value of 1/(jωC). One number. That\'s the trick.',
        mood='tip'))

    # ── Module 2.1 ──
    s.append(heading('Module 2.1 — Sinusoidal Sources and Phasors', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(cs_bridge(
        "<b>Phasor ↔ hashing a function to a number.</b> A sinusoid has three degrees of "
        "freedom (amplitude, frequency, phase). At a fixed frequency, two remain "
        "(amplitude, phase) — exactly the modulus and argument of a complex number. The "
        "phasor transform is a lossless hash of {amplitude, phase} → ℂ. Addition of "
        "sinusoids at the same frequency is complex addition; differentiation is "
        "multiplication by jω. This is the engineer’s version of representing a 2D "
        "vector as a complex number — you already do this in graphics code."))

    # ── Pixel diagram: ac_phasor ──
    s.extend(diagram('ac_phasor',
        caption='AC phasor — a rotating complex number. At a fixed ω, only amplitude and phase matter; the e^(jωt) factor is common and dropped.'))

    s.append(heading('The phasor transform', 2))
    s.append(p(
        "A sinusoid <i>v(t) = V<sub>m</sub>·cos(ωt + φ)</i> is the real part of "
        "<i>V<sub>m</sub>·e<sup>j(ωt + φ)</sup> = V<sub>m</sub>·e<sup>jφ</sup>·e<sup>jωt</sup></i>. "
        "The factor <i>e<sup>jωt</sup></i> is common to every signal at frequency ω, so "
        "we drop it and keep only <b>V</b> = V<sub>m</sub>·e<sup>jφ</sup> = "
        "V<sub>m</sub>∠φ. To recover the time-domain signal: "
        "<i>v(t) = Re{<b>V</b>·e<sup>jωt</sup>}</i>. The transform is bijective at fixed "
        "frequency; you lose nothing."))
    s.append(formula_box(
        "v(t) = V<sub>m</sub>·cos(ωt + φ) &nbsp;↔&nbsp; <b>V</b> = V<sub>m</sub>∠φ = V<sub>m</sub>·e<sup>jφ</sup>"))

    s.append(heading('Why it works — the eigenfunction property', 2))
    s.append(p(
        "Sinusoids are eigenfunctions of linear time-invariant (LTI) systems. If the "
        "input is a sinusoid at frequency ω, the steady-state output is a sinusoid at "
        "the same frequency, scaled and phase-shifted. The scaling and phase shift are "
        "encoded in a single complex number — the system’s frequency response "
        "<b>H</b>(jω). For a single LTI system, <b>V<sub>out</sub></b> = <b>H</b>(jω)·<b>V<sub>in</sub></b>. "
        "This is the entire foundation of frequency-domain analysis, and it generalizes "
        "to the Fourier transform (Phase 5) and the Laplace transform (Phase 5)."))

    s.append(project_box('LTspice: Phasor Addition', [
        ('Goal:', 'verify that adding two sinusoids in time domain equals adding their phasors.'),
        ('Set up:', 'two AC sources v1 = 5·cos(1000t) V and v2 = 3·cos(1000t + 60°) V, in series.'),
        ('Predict:', 'phasor sum: 5 + 3∠60° = 5 + 1.5 + j·2.598 = 6.5 + j·2.598 = 7.0∠21.8°. '
                     'So v_total(t) = 7.0·cos(1000t + 21.8°).'),
        ('Simulate:', 'run transient sim in LTspice; measure amplitude and phase of the sum.'),
        ('Pass:', 'measured amplitude within 1% of 7.0 V; phase within 1° of 21.8°.'),
    ]))

    s.append(checkpoint_box([
        "What is a phasor? How is it related to the time-domain sinusoid?",
        "Why are sinusoids eigenfunctions of LTI systems?",
        "Convert v(t) = 10·sin(100t + 30°) to a phasor. (Hint: sin = cos shifted by −90°.)",
        "Add 5∠0° and 3∠90° in both rectangular and polar form. Confirm they match.",
    ]))

    # ── Module 2.2 ──
    s.append(heading('Module 2.2 — Impedance and Admittance', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(p(
        "The impedance <b>Z</b> of a two-terminal element is the ratio of phasor voltage "
        "to phasor current: <b>Z</b> = <b>V</b>/<b>I</b>. For a resistor: <b>Z</b><sub>R</sub> = R "
        "(purely real). For an inductor: <b>Z</b><sub>L</sub> = jωL (purely imaginary, "
        "positive — voltage leads current by 90°). For a capacitor: <b>Z</b><sub>C</sub> = "
        "1/(jωC) = −j/(ωC) (purely imaginary, negative — current leads voltage by 90°). "
        "These three elements, in any combination, give any passive impedance."))
    s.append(formula_box(
        "Z<sub>R</sub> = R &nbsp;&nbsp;|&nbsp;&nbsp; "
        "Z<sub>L</sub> = jωL &nbsp;&nbsp;|&nbsp;&nbsp; "
        "Z<sub>C</sub> = 1 / (jωC) = −j / (ωC)"))

    # ── Pixel diagram: impedance_triangle ──
    s.extend(diagram('impedance_triangle',
        caption='Impedance triangle — R (real) horizontal, X (reactive) vertical, Z (magnitude) hypotenuse. |Z| = √(R²+X²).'))

    s.append(p(
        "Admittance <b>Y</b> = 1/<b>Z</b> is the dual. <b>Y</b><sub>R</sub> = 1/R = G "
        "(conductance). <b>Y</b><sub>L</sub> = 1/(jωL) = −j/(ωL). <b>Y</b><sub>C</sub> = "
        "jωC. Admittance is more convenient than impedance when elements are in parallel "
        "(admittances add). The real part of admittance is conductance G; the imaginary "
        "part is susceptance B. The real part of impedance is resistance R; the imaginary "
        "part is reactance X. <b>Z</b> = R + jX, <b>Y</b> = G + jB."))

    s.append(heading('Series and parallel combinations', 2))
    s.append(p(
        "Impedances combine exactly like resistors: series impedances add, parallel "
        "impedances combine by reciprocal-sum. The arithmetic is now complex, but the "
        "structure is identical. Practice: a 1 kΩ resistor in series with a 100 mH "
        "inductor at 1 kHz has impedance <b>Z</b> = 1000 + j·2π·1000·0.1 = 1000 + j628 Ω. "
        "Magnitude 1185 Ω, phase +32°. The voltage across the inductor leads the current "
        "by 90°, and the total voltage leads the current by 32°."))
    s.append(formula_box(
        "Z<sub>series</sub> = Z<sub>1</sub> + Z<sub>2</sub> + ... &nbsp;&nbsp;|&nbsp;&nbsp; "
        "1/Z<sub>parallel</sub> = 1/Z<sub>1</sub> + 1/Z<sub>2</sub> + ..."))

    s.append(project_box('LTspice: RC Impedance Sweep', [
        ('Goal:', 'measure the impedance of an RC parallel combo across frequency.'),
        ('Circuit:', '1 kΩ resistor in parallel with 1 μF cap, driven by a 1 V AC source.'),
        ('Compute:', 'Z(jω) = R ∥ 1/(jωC) = R / (1 + jωRC). At ω = 1/(RC) = 1000 rad/s = 159 Hz, '
                     'Z = R/2 = 500Ω, phase −45°.'),
        ('Simulate:', 'LTspice .ac sim from 10 Hz to 10 kHz. Plot |Z| and ∠Z vs frequency.'),
        ('Pass:', 'the magnitude and phase curves match the predicted formula at the 3 marked '
                  'frequencies (159 Hz, 1.59 kHz, 15.9 Hz).'),
    ]))

    s.append(checkpoint_box([
        "What is the impedance of a 10 mH inductor at 60 Hz? At 1 MHz?",
        "What is the impedance of a 1 μF capacitor at 60 Hz? At 1 MHz?",
        "Combine a 1 kΩ resistor in series with a 0.1 μF cap at 1 kHz. What is |Z|? What is ∠Z?",
        "Why does an inductor’s impedance grow with frequency while a cap’s shrinks?",
    ]))

    # ── Module 2.3 ──
    s.append(heading('Module 2.3 — AC Power: Real, Reactive, Apparent, Power Factor', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(cs_bridge(
        "<b>Power factor ↔ load matching in distributed systems.</b> A load with PF = 1 "
        "is ‘resistive’ — current and voltage are in phase, all delivered energy is "
        "consumed. A load with PF &lt; 1 is ‘reactive’ — some energy sloshes back and "
        "forth every cycle, like a chatty protocol with high acknowledgment overhead. "
        "The grid bills you for the energy you actually use (real power), but the wires "
        "and transformers must be sized for the apparent power. Power-factor correction "
        "is the engineering practice of adding caps or inductors to bring PF close to 1, "
        "reducing the apparent power the grid must deliver."))

    s.append(heading('The three powers', 2))
    s.append(p(
        "For a sinusoidal voltage V = V<sub>m</sub>cos(ωt) across a load drawing current "
        "I = I<sub>m</sub>cos(ωt − φ), the instantaneous power is p(t) = v(t)·i(t). "
        "Averaging over a cycle gives the <b>real power</b> P = V<sub>rms</sub>·I<sub>rms</sub>·cos(φ), "
        "in watts. The <b>reactive power</b> Q = V<sub>rms</sub>·I<sub>rms</sub>·sin(φ), in "
        "VAR (volt-amperes reactive). The <b>apparent power</b> |S| = V<sub>rms</sub>·I<sub>rms</sub>, "
        "in VA. The relationship is S = P + jQ — apparent power is the complex sum of real "
        "and reactive. The <b>power factor</b> PF = P / |S| = cos(φ)."))
    s.append(formula_box(
        "P = V<sub>rms</sub>·I<sub>rms</sub>·cos(φ) [W] &nbsp;&nbsp;|&nbsp;&nbsp; "
        "Q = V<sub>rms</sub>·I<sub>rms</sub>·sin(φ) [VAR] &nbsp;&nbsp;|&nbsp;&nbsp; "
        "|S| = V<sub>rms</sub>·I<sub>rms</sub> [VA] &nbsp;&nbsp;|&nbsp;&nbsp; "
        "PF = cos(φ) = P / |S|"))

    # ── Pixel diagram: power_triangle ──
    s.extend(diagram('power_triangle',
        caption='Power triangle — P (real) horizontal, Q (reactive) vertical, S (apparent) hypotenuse. PF = P/|S| = cos(φ).'))

    s.append(p(
        "RMS (root-mean-square) is the equivalent DC value that would deliver the same "
        "average power to a resistor. For a sinusoid, V<sub>rms</sub> = V<sub>m</sub>/√2. "
        "For a waveform of arbitrary shape, V<sub>rms</sub> = √(1/T·∫v(t)² dt). The "
        "230 V or 120 V at your wall outlet is RMS — the peak is √2 times higher "
        "(325 V or 170 V)."))

    s.append(heading('Power factor correction', 2))
    s.append(p(
        "Industrial loads are typically inductive (motors, transformers) and have PF "
        "around 0.7–0.85 lagging. To correct, add a capacitor in parallel sized so that "
        "Q<sub>cap</sub> = Q<sub>load</sub>. The cap draws leading current that cancels "
        "the lagging inductive current, bringing the net PF to 1. The size of the cap: "
        "C = Q / (ω·V²). For a 5 kW load at 230 V, 50 Hz, PF = 0.8 lagging: "
        "Q = P·tan(φ) = 5000·tan(36.87°) = 3750 VAR. C = 3750 / (2π·50·230²) = 225 μF."))
    s.append(project_box('LTspice: PF Correction', [
        ('Goal:', 'design a PFC cap and verify it brings PF to 1.'),
        ('Load:', 'R = 23Ω in series with L = 50 mH (a model of a motor) at 230 V, 50 Hz.'),
        ('Without PFC:', 'Z_load = 23 + j·15.7Ω. |Z| = 27.9Ω, I = 8.24 A, φ = 34.4°. '
                         'PF = cos(34.4°) = 0.825. P = 230·8.24·0.825 = 1563 W. '
                         'Q = 230·8.24·sin(34.4°) = 1068 VAR.'),
        ('Compute C:', 'C = Q / (ω·V²) = 1068 / (2π·50·230²) = 64.3 μF.'),
        ('Verify in LTspice:', 'add the cap in parallel; re-sim. The source current should drop '
                               'to ~6.8 A (P/230), in phase with the voltage.'),
    ]))

    s.append(checkpoint_box([
        "Define real, reactive, and apparent power. Give the unit of each.",
        "What is power factor? How is it related to the angle between voltage and current?",
        "Compute the RMS value of a square wave that swings between +5V and −5V.",
        "Design a PFC capacitor for a 10 kW load at 400 V, 50 Hz, PF = 0.7 lagging.",
    ]))

    # ── Module 2.4 ──
    s.append(heading('Module 2.4 — Resonance, Bode Plots & Filters', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "A series RLC circuit has impedance <b>Z</b>(jω) = R + jωL + 1/(jωC) = R + j·(ωL − 1/(ωC)). "
        "At <i>ω<sub>0</sub> = 1/√(LC)</i>, the imaginary part vanishes — <b>Z</b> is "
        "purely real and equal to R. This is <b>series resonance</b>: the inductor and "
        "capacitor cancel each other, and the only thing limiting the current is R. The "
        "current is maximum at resonance. The same circuit in parallel gives "
        "<b>parallel resonance</b>: at ω<sub>0</sub>, the impedance is maximum (purely "
        "real, equal to R, or in the ideal case infinite)."))
    s.append(formula_box(
        "ω<sub>0</sub> = 1 / √(LC) &nbsp;&nbsp;|&nbsp;&nbsp; "
        "Q = ω<sub>0</sub>·L / R = 1 / (ω<sub>0</sub>·R·C) &nbsp;&nbsp;|&nbsp;&nbsp; "
        "BW = ω<sub>0</sub> / Q"))

    s.append(volt_says(
        'Resonance is when inductive and capacitive reactance cancel out. At one '
        'frequency. ω₀ = 1/√(LC). The imaginary part of the impedance goes to zero. The '
        'circuit acts like it\'s purely resistive. This is the heart of every radio. '
        'Tune the L and C, and you tune which frequency you hear.',
        mood='insight'))

    s.append(amp_says(
        'Like tuning a guitar string to one note?',
        mood='question'))

    s.append(volt_says(
        'Yes. Same idea. Resonance picks out one frequency and amplifies it.',
        mood='tip'))

    # ── Pixel diagram: series_resonance ──
    s.extend(diagram('series_resonance',
        caption='Series resonance — at ω₀, L and C cancel. Current peaks. Used in tuners and notch filters.'))
    # ── Pixel diagram: parallel_resonance (tank circuit) ──
    s.extend(diagram('parallel_resonance',
        caption='Parallel resonance (tank) — at ω₀, impedance peaks. The basis of every LC oscillator.'))

    s.append(p(
        "The quality factor Q measures how sharp the resonance is. Q = ω<sub>0</sub>/BW "
        "where BW is the −3 dB bandwidth. A high-Q resonator passes a narrow band of "
        "frequencies and rejects the rest — the basis of every radio receiver and every "
        "analog filter. A low-Q resonator passes a wide band. The damping ratio ζ = 1/(2Q)."))

    # ── Pixel diagrams: RLC series resonance + Bode low-pass ──
    s.extend(diagram('rlc',
        caption='Series RLC resonator — R, L, C in a string. At ω₀ = 1/√(LC), XL and XC cancel.'))
    s.extend(diagram('bode_low_pass',
        caption='Bode magnitude of an RC low-pass — flat to f_c, then −20 dB/decade rolloff.'))

    s.append(heading('Bode plots — the frequency-domain picture', 2))
    s.append(p(
        "A Bode plot is the magnitude (in dB) and phase (in degrees) of a transfer "
        "function H(jω) versus log frequency. Straight-line Bode approximations are a "
        "staple of EE: each pole contributes −20 dB/decade rolloff starting at the pole "
        "frequency and −45° phase shift at the pole, growing to −90° a decade above. "
        "Each zero contributes +20 dB/decade and +90°. Second-order poles/zeros have "
        "twice the slope and contribute up to ±180°."))

    s.append(p(
        "Decibels: dB = 20·log<sub>10</sub>(|H|). The factor 20 (not 10) comes from "
        "power being proportional to voltage squared, so 10·log(P) = 10·log(V²) = "
        "20·log(V) when the load is held constant. −3 dB is the half-power point: "
        "10·log(0.5) ≈ −3. −20 dB/decade = −6 dB/octave."))

    s.append(project_box('Python: Bode Plotter for任意 Transfer Function', [
        ('Goal:', 'build a reusable Bode plotter in Python.'),
        ('Tasks:', 'write a function bode(num, den, f_range) that uses scipy.signal.freqs to '
                   'compute H(jω) and plots magnitude (dB) and phase (deg) vs frequency (log).'),
        ('Test:', 'plot H(s) = 1/(s² + s + 1) — second-order low-pass at ω_n=1, ζ=0.5. Verify '
                 'the peak at ω_n and the −40 dB/decade rolloff above.'),
        ('Bench:', 'build the same filter with R=1kΩ, L=1H (use a gyrator or active inductor '
                   'simulator), C=1μF. Sweep frequency from 10 Hz to 10 kHz, measure |H|, '
                   'overlay on the Python plot. They should match.'),
    ]))

    s.append(checkpoint_box([
        "Define series and parallel resonance. Where do they occur?",
        "What is Q? How is it related to damping ratio and bandwidth?",
        "Sketch the Bode magnitude plot of a first-order RC low-pass. Mark the cutoff frequency.",
        "How many dB per decade does a 4th-order low-pass roll off above cutoff?",
        "Convert 0.707 to dB. Why is this number special?",
    ]))

    # ── Module 2.5 ──
    s.append(heading('Module 2.5 — Three-Phase Systems', 1))
    s.append(p('<b>Duration:</b> 4–6 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Three-phase power is the workhorse of electrical generation, transmission, and "
        "industrial distribution. Three sinusoidal voltages at the same frequency and "
        "amplitude, 120° apart: V<sub>a</sub> = V<sub>m</sub>cos(ωt), "
        "V<sub>b</sub> = V<sub>m</sub>cos(ωt − 120°), "
        "V<sub>c</sub> = V<sub>m</sub>cos(ωt + 120°). Their sum is always zero — this "
        "means a three-phase system with balanced loads carries no neutral current, "
        "halving the conductor material needed compared to three single-phase systems."))
    s.append(formula_box(
        "V<sub>L</sub> = √3 · V<sub>ph</sub> &nbsp;&nbsp;(line-line vs phase-neutral) "
        "&nbsp;&nbsp;|&nbsp;&nbsp; P = √3 · V<sub>L</sub> · I<sub>L</sub> · PF"))

    s.append(p(
        "Two standard connections: <b>wye (Y)</b> — three phases plus neutral, common in "
        "distribution (230/400 V in Europe, 120/208 V or 277/480 V in US). "
        "<b>Delta (Δ)</b> — three phases only, no neutral, common in transmission and "
        "industrial motors. A balanced Δ load draws √3 times the line current of an "
        "equivalent Y load at the same line voltage. Three-phase rectifiers produce "
        "smoother DC than single-phase — six pulses per cycle instead of two."))

    # ── Pixel diagram: three-phase phasors (revisited for power context) ──
    s.extend(diagram('three_phase',
        caption='Three-phase phasor diagram — phases A, B, C separated by 120°. V_a + V_b + V_c = 0.'))

    s.append(project_box('Python: Three-Phase Phasor Visualizer', [
        ('Goal:', 'see three-phase phasors rotating.'),
        ('Tasks:', 'animate three phasors (red, yellow, blue) at 50 Hz, 120° apart. '
                   'Show their sum is always zero. Animate a rotating three-phase voltage '
                   'space vector — it traces a circle of radius V_m.'),
        ('Tool:', 'matplotlib FuncAnimation.'),
        ('Extension:', 'add an unbalanced case (V_a reduced by 20%) and show the sum is '
                       'no longer zero — this is why PFC and load balancing matter.'),
    ]))

    s.append(checkpoint_box([
        "Why does a balanced three-phase system need no neutral?",
        "Convert 400 V line-line to phase voltage.",
        "Compute the real power delivered to a balanced Y load with R=10Ω per phase at 400 V line-line.",
        "Why is three-phase transmission more efficient than single-phase?",
    ]))

    s.append(pixel_divider())

    # ── Module 2.6 ──
    s.append(heading('Module 2.6 — Mutual Inductance & Transformers', 1))
    s.append(p('<b>Duration:</b> 4–6 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Two coils sharing magnetic flux have mutual inductance M. The voltage across "
        "coil 1 is v<sub>1</sub> = L<sub>1</sub>·di<sub>1</sub>/dt + M·di<sub>2</sub>/dt, "
        "and similarly for coil 2. The coupling coefficient k = M/√(L<sub>1</sub>·L<sub>2</sub>) "
        "ranges from 0 (no coupling) to 1 (perfect coupling, all flux shared). Real "
        "transformers achieve k = 0.95–0.99 with ferromagnetic cores."))

    s.append(heading('The ideal transformer', 2))
    s.append(p(
        "In the ideal-transformer limit (k = 1, no losses, infinite inductance), the "
        "voltage and current ratios are set by the turns ratio n = N<sub>1</sub>/N<sub>2</sub>: "
        "v<sub>2</sub>/v<sub>1</sub> = N<sub>2</sub>/N<sub>1</sub> = 1/n, "
        "i<sub>2</sub>/i<sub>1</sub> = N<sub>1</sub>/N<sub>2</sub> = n. Power is conserved: "
        "v<sub>1</sub>·i<sub>1</sub> = v<sub>2</sub>·i<sub>2</sub>. The impedance seen at "
        "the primary is the secondary load scaled by n²: Z<sub>1</sub> = n²·Z<sub>2</sub>. "
        "This is the impedance-reflection property that makes transformers so useful — "
        "you can match any load to any source by choosing n correctly."))
    s.append(formula_box(
        "V<sub>2</sub>/V<sub>1</sub> = N<sub>2</sub>/N<sub>1</sub> &nbsp;&nbsp;|&nbsp;&nbsp; "
        "I<sub>2</sub>/I<sub>1</sub> = N<sub>1</sub>/N<sub>2</sub> &nbsp;&nbsp;|&nbsp;&nbsp; "
        "Z<sub>reflected</sub> = (N<sub>1</sub>/N<sub>2</sub>)² · Z<sub>load</sub>"))

    s.append(heading('Real transformers', 2))
    s.append(p(
        "Real transformers have winding resistance, leakage inductance (flux that doesn’t "
        "link both coils), magnetizing inductance (the primary inductance that draws "
        "magnetizing current even with no load), core losses (hysteresis + eddy currents), "
        "and inter-winding capacitance. The equivalent circuit is a T or π network with "
        "these parasitics added to the ideal transformer. For power-grid transformers the "
        "parasitics are small (97–99% efficiency). For signal transformers (audio, RF) "
        "they shape the frequency response."))

    s.append(project_box('LTspice: Step-Down Transformer', [
        ('Goal:', 'simulate a 10:1 step-down transformer and verify power transfer.'),
        ('Model:', 'ideal transformer with n = 10. Primary: 230 V RMS at 50 Hz. '
                   'Secondary: 23 V RMS into a 10 Ω load.'),
        ('Predict:', 'I_primary = (V_secondary / R_load) · (N_2/N_1) = (23/10) · 0.1 = 0.23 A. '
                     'P_load = V²/R = 23²/10 = 52.9 W. P_primary = 230 · 0.23 = 52.9 W.'),
        ('Simulate:', 'verify both powers match.'),
        ('Extension:', 'add leakage inductance of 1 mH on primary and 10 μH on secondary. '
                       'How does the regulation (V_load vs. load current) change?'),
    ]))

    s.append(checkpoint_box([
        "What is mutual inductance? Define the coupling coefficient k.",
        "State the ideal transformer equations for voltage, current, and impedance.",
        "A 230 V:12 V transformer has a 100 Ω load on the secondary. What is the primary impedance?",
        "Why don’t transformers work with DC?",
        "Name three parasitic effects in real transformers and how each manifests in circuit behavior.",
    ]))

    s.append(pull_quote(
        'An ideal transformer is a lossless impedance converter. The turns ratio does '
        'not just scale voltage — it scales impedance by the square, and that is the '
        'reason the entire power grid can move gigawatts across a thousand kilometers.',
        'Volt, on transformers'))

    s.append(volt_says(
        'Phase 2 is done. You can solve any AC circuit with phasors. You understand '
        'impedance. You understand resonance. You know why the grid runs on three phases. '
        'Phase 3 introduces the nonlinear parts. Diodes. Transistors. Op-amps. These are '
        'what make circuits do useful things. Amplify. Switch. Modulate. The linear math '
        'ends here. The small-signal approximation begins.',
        mood='story'))

    s.append(PageBreak())
    return s

# ════════════════════════════════════════════════════════════════════════════
# PHASE 3 — ANALOG ELECTRONICS
# ════════════════════════════════════════════════════════════════════════════
def build_phase3():
    s = []
    s.append(heading('Phase 3 — Analog Electronics', 0))
    s.append(p('<b>Duration:</b> 6 weeks · <b>Modules:</b> 8 · <b>Goal:</b> master the '
               'nonlinear workhorses of analog — diodes, BJTs, MOSFETs, op-amps — and '
               'build a complete audio amplifier by the end of the phase.', 'kicker'))

    s.append(p(
        "Phase 3 is where the rubber meets the road. Every element so far has been linear; "
        "now we meet diodes, transistors, and op-amps — devices whose V-I curves are "
        "nonlinear. The trick that makes them tractable is the <b>small-signal model</b>: "
        "linearize around a DC operating point, treat the nonlinear device as a linear "
        "element for AC analysis, then add the DC and AC solutions. This is the same "
        "linearization you do in optimization (Newton’s method) and in machine learning "
        "(backprop through a nonlinearity)."))

    s.append(volt_says(
        'Nonlinear doesn\'t mean scary. Diodes, transistors, op-amps. They all follow '
        'V-I curves you can look up. The trick is to bias them to a known DC operating '
        'point. Then linearize around it. The AC behavior near that point is just '
        'another linear circuit. Same math as Phase 1. One extra step at the start.',
        mood='story'))

    s.append(amp_says(
        'Like linearizing a function around a point in calculus? Tangent line '
        'approximation?',
        mood='question'))

    s.append(volt_says(
        'Exactly. Same idea. Different domain.',
        mood='tip'))

    # ── Module 3.1 ──
    s.append(heading('Module 3.1 — Diodes: Rectifiers, Clippers, Clampers', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "A diode is a one-way valve for current. The ideal diode conducts with zero "
        "resistance when forward-biased (anode &gt; cathode) and blocks completely when "
        "reverse-biased. The real diode (Shockley equation) has a forward voltage drop "
        "of about 0.7 V (silicon) or 0.3 V (Schottky) and a small reverse leakage. "
        "I = I<sub>S</sub>·(e<sup>V/V<sub>T</sub></sup> − 1) where V<sub>T</sub> = kT/q ≈ 26 mV "
        "at room temperature and I<sub>S</sub> is the saturation current (typically "
        "10<sup>−15</sup>–10<sup>−12</sup> A)."))
    s.append(formula_box("I = I<sub>S</sub>·(e<sup>V/(nV<sub>T</sub>)</sup> − 1) &nbsp;&nbsp;|&nbsp;&nbsp; V<sub>T</sub> = kT/q ≈ 26 mV"))

    # ── Pixel diagrams: diode symbol + half-wave rectifier ──
    s.extend(diagram('diode',
        caption='Diode (anode left, cathode right) — one-way current valve. V_f ≈ 0.7 V (Si).'))
    s.extend(diagram('half_wave',
        caption='Half-wave rectifier — AC source → diode → load → ground. Passes only positive half-cycles.'))

    # ── Pixel diagram: full-wave bridge rectifier ──
    s.extend(diagram('full_wave',
        caption='Full-wave bridge rectifier — four diodes route both half-cycles to the load. Output average = 2·V_m/π. Ripple freq = 2× line.'))

    s.append(heading('Three classic diode circuits', 2))
    s.append(bullet_list([
        "<b>Half-wave rectifier:</b> a single diode in series with the load. Passes only the positive half-cycles. Output average = V_m/π. Ripple frequency = line frequency.",
        "<b>Full-wave bridge rectifier:</b> four diodes arranged so both half-cycles contribute. Output average = 2·V_m/π. Ripple frequency = 2× line frequency. The classic front-end of every linear power supply.",
        "<b>Peak rectifier:</b> a bridge followed by a capacitor. The cap charges to V_m and holds; the diode only conducts briefly at the peak. Output is roughly DC with ripple ΔV = I/(f·C). This is the front-end of every linear and switch-mode supply.",
    ]))

    s.append(p(
        "Two more diode applications to know: <b>clippers</b> (limit a signal’s voltage "
        "swing — used for input protection) and <b>clampers</b> (add a DC offset to a "
        "signal — used to restore DC levels after AC coupling). Zener diodes are "
        "designed to operate in reverse breakdown safely and provide a stable reference "
        "voltage — every linear regulator uses one."))

    s.append(project_box('Bench: Build a 12V Linear Supply Front-End', [
        ('Goal:', 'rectify a 12 VAC wall transformer to DC.'),
        ('Circuit:', '12 VAC secondary → 1N4007 bridge rectifier → 1000 μF filter cap → 12 V Zener clamp.'),
        ('Measure:', 'scope at the cap: see the ripple. Compute ΔV = I_load / (f·C) where f = 100 Hz '
                     '(full wave) and I_load = 50 mA. ΔV ≈ 0.5 V.'),
        ('Verify:', 'the measured ripple matches the formula. Add load, watch ripple grow linearly.'),
        ('Pass:', 'the supply delivers 12 V ±0.6 V at loads up to 100 mA. The scope shows ripple '
                  'matching the formula within 20%.'),
    ]))

    s.append(checkpoint_box([
        "State the Shockley diode equation. What is V_T at room temperature?",
        "Why does a full-wave rectifier have half the ripple of a half-wave at the same load?",
        "Compute the ripple of a 1000 μF cap delivering 100 mA at 100 Hz ripple frequency.",
        "What is a Zener diode and how does it differ from a regular diode in operation?",
    ]))

    # ── Module 3.2 ──
    s.append(heading('Module 3.2 — BJT Biasing and Small-Signal Model', 1))
    s.append(p('<b>Duration:</b> 8–10 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(cs_bridge(
        "<b>BJT ↔ current-controlled current source, MOSFET ↔ voltage-controlled current source.</b> "
        "A BJT’s collector current is proportional to base current (I_C = β·I_B, β ≈ 100). "
        "A MOSFET’s drain current is controlled by gate-source voltage (I_D = ½·k·(V_GS − V_th)² "
        "in saturation). Conceptually, a BJT is a current amplifier; a MOSFET is a "
        "transconductance amplifier. Both have a small-signal model that linearizes them "
        "around a DC operating point — same idea as Newton’s method."))

    # ── Pixel diagram: NPN BJT transistor symbol ──
    s.extend(diagram('transistor_npn',
        caption='NPN BJT — base (left), collector (top), emitter (bottom). I_C = β · I_B.'))

    # ── Pixel diagram: ce_amplifier ──
    s.extend(diagram('ce_amplifier',
        caption='Common-emitter amplifier — BJT with R_C and R_E. Inverts the input; voltage gain A_v = −g_m · R_C.'))

    s.append(heading('BJT regions of operation', 2))
    s.append(make_table([
        ['Region','Condition','Behavior'],
        ['Cut-off','V_BE < 0.6 V','I_C ≈ 0. Off switch.'],
        ['Active','V_BE ≈ 0.7 V, V_CE > V_CE(sat)','I_C = β·I_B. Amplifier region.'],
        ['Saturation','V_BE ≈ 0.7 V, V_CE ≈ 0.2 V','I_C < β·I_B. On switch.'],
        ['Reverse active','V_EB ≈ 0.7 V','Inverted operation. Rarely used.'],
    ], col_widths=[35*mm, 50*mm, 85*mm]))

    s.append(heading('Biasing — setting the operating point', 2))
    s.append(p(
        "A BJT amplifier must be biased to a stable quiescent (Q) point in the active "
        "region. The four-resistor bias network (R1, R2 from V_CC to ground at the base; "
        "R_E at the emitter; R_C at the collector) is the standard. The base voltage is "
        "set by R1/R2 divider; the emitter voltage follows minus 0.7 V; the emitter "
        "current is V_E/R_E; the collector current is approximately equal. The design "
        "rule: make the divider current 10× the base current so the bias is stable "
        "against β variation."))
    s.append(formula_box(
        "V<sub>B</sub> ≈ V<sub>CC</sub>·R<sub>2</sub>/(R<sub>1</sub>+R<sub>2</sub>) &nbsp;&nbsp;|&nbsp;&nbsp; "
        "V<sub>E</sub> = V<sub>B</sub> − 0.7 &nbsp;&nbsp;|&nbsp;&nbsp; "
        "I<sub>E</sub> ≈ I<sub>C</sub> = V<sub>E</sub>/R<sub>E</sub> &nbsp;&nbsp;|&nbsp;&nbsp; "
        "V<sub>C</sub> = V<sub>CC</sub> − I<sub>C</sub>·R<sub>C</sub>"))

    s.append(heading('Small-signal model — the hybrid-π', 2))
    s.append(p(
        "Linearize the BJT around its Q point. The small-signal model has: input "
        "resistance r_π = β/g_m where g_m = I_C/V_T is transconductance (~40 mA/V per "
        "mA of I_C), output resistance r_o = V_A/I_C (Early voltage V_A ~ 100 V), and "
        "a current source g_m·v_be from collector to emitter. With this model you can "
        "compute voltage gain, input impedance, and output impedance of any BJT amp "
        "using the linear-circuit techniques of Phase 1."))
    s.append(formula_box(
        "g<sub>m</sub> = I<sub>C</sub> / V<sub>T</sub> ≈ 40·I<sub>C</sub> [A/V] &nbsp;&nbsp;|&nbsp;&nbsp; "
        "r<sub>π</sub> = β / g<sub>m</sub> &nbsp;&nbsp;|&nbsp;&nbsp; "
        "A<sub>v</sub> = −g<sub>m</sub>·R<sub>C</sub> (common-emitter, unloaded)"))

    s.append(project_box('Bench: Common-Emitter Audio Preamp', [
        ('Goal:', 'build a CE amplifier with gain ≈ 20, verify on bench.'),
        ('Specs:', 'V_CC = 12V, I_C = 1 mA, V_CE = 6V (mid-supply for max swing).'),
        ('Design:', 'R_E = 1 kΩ (sets I_C ≈ 1 mA with V_E ≈ 1V). '
                    'R_C = 5 kΩ (sets V_C ≈ 7V, V_CE ≈ 6V). '
                    'R1 = 50 kΩ, R2 = 10 kΩ (sets V_B ≈ 2V). '
                    'bypass R_E with a 100 μF cap for AC gain.'),
        ('Compute:', 'g_m = 40 mA/V. A_v = −g_m · R_C = −200. But with R_E bypassed only '
                     'partially (use 100 Ω unbypassed for stability), A_v ≈ −R_C / R_E_unbypassed = −50.'),
        ('Build & measure:', 'drive with 10 mV sine at 1 kHz. Measure V_out. Compute gain. '
                             'Compare to prediction. Sweep frequency from 20 Hz to 200 kHz; '
                             'find the −3 dB bandwidth.'),
    ]))

    s.append(checkpoint_box([
        "Name the four regions of BJT operation. Which is used for amplification? For switching?",
        "Design a four-resistor bias network for I_C = 2 mA, V_CC = 12 V, β = 100.",
        "Define g_m, r_π, r_o. How do they depend on I_C?",
        "Compute the voltage gain of a CE amp with g_m = 40 mA/V and R_C = 5 kΩ.",
        "Why do we bypass R_E with a capacitor? What is the trade-off?",
    ]))

    # ── Module 3.3 ──
    s.append(heading('Module 3.3 — MOSFET Biasing and Small-Signal Model', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "The MOSFET has three regions: cut-off (V_GS &lt; V_th, I_D ≈ 0), triode "
        "(V_GS &gt; V_th and V_DS &lt; V_GS − V_th, behaves as a resistor), and "
        "saturation (V_GS &gt; V_th and V_DS &gt; V_GS − V_th, behaves as a current "
        "source). The saturation-region equation is "
        "I_D = ½·k_n·(V_GS − V_th)²·(1 + λ·V_DS), where k_n = μ_n·C_ox·W/L and λ is "
        "the channel-length modulation parameter (analogous to the BJT Early voltage)."))
    s.append(formula_box(
        "I<sub>D</sub> = ½·k<sub>n</sub>·(V<sub>GS</sub> − V<sub>th</sub>)²·(1 + λ·V<sub>DS</sub>) &nbsp;&nbsp; "
        "(saturation)"))

    # ── Pixel diagram: MOSFET symbol ──
    s.extend(diagram('mosfet',
        caption='n-channel MOSFET — gate (left), drain (top), source (bottom). Voltage-controlled current source.'))

    # ── Pixel diagram: cs_amplifier ──
    s.extend(diagram('cs_amplifier',
        caption='Common-source amplifier — MOSFET with R_D. Inverts the input; gain A_v = −g_m · (R_D ∥ r_o). The CMOS analog workhorse.'))

    s.append(heading('Small-signal model', 2))
    s.append(p(
        "Linearize around the Q point: g_m = ∂I_D/∂V_GS = k_n·(V_GS − V_th) = √(2·k_n·I_D). "
        "Output resistance r_o = 1/(λ·I_D). The small-signal model has infinite input "
        "resistance at the gate (no DC current flows), a voltage-controlled current source "
        "g_m·v_gs from drain to source, and r_o in parallel. The CS amplifier voltage gain "
        "is A_v = −g_m·(R_D ∥ r_o)."))
    s.append(formula_box(
        "g<sub>m</sub> = √(2·k<sub>n</sub>·I<sub>D</sub>) &nbsp;&nbsp;|&nbsp;&nbsp; "
        "A<sub>v</sub> = −g<sub>m</sub>·(R<sub>D</sub> ∥ r<sub>o</sub>)"))

    s.append(heading('Why MOSFETs dominate modern electronics', 2))
    s.append(p(
        "The MOSFET’s gate draws no DC current — input impedance is essentially infinite "
        "at DC and low frequencies. This is why MOSFETs (specifically CMOS) dominate "
        "digital electronics: a billion CMOS gates draw nearly zero static current. BJTs "
        "always draw base current, which is fine for analog but catastrophic for "
        "high-density digital. MOSFETs also scale better — smaller geometries work, which "
        "is why Moore’s law has been a MOSFET story for 50 years. You will see the "
        "consequences in Phase 9 (VLSI)."))

    s.append(project_box('LTspice: MOSFET CS Amp', [
        ('Goal:', 'design and simulate a CS MOSFET amplifier.'),
        ('Specs:', 'V_DD = 5V, I_D = 100 μA, V_DS = 2.5V.'),
        ('MOSFET:', 'use 2N7002 model in LTspice.'),
        ('Design:', 'R_D = (5 − 2.5)/100μ = 25 kΩ. Find V_GS for I_D = 100 μA from the '
                    'datasheet curve (typically 1.5 V for 2N7002). Bias the gate via R1/R2 '
                    'divider with high values (1 MΩ each) to preserve input impedance.'),
        ('Simulate:', 'verify DC operating point. Then run AC sim. Compute gain and bandwidth.'),
        ('Bench (optional):', 'build with discrete 2N7002. Note: discrete MOSFETs have huge '
                              'V_th variation; you will need to tune the bias.'),
    ]))

    s.append(checkpoint_box([
        "Name the three regions of MOSFET operation. Which is used for amplification?",
        "Why is MOSFET input impedance nearly infinite at the gate?",
        "Compute g_m for k_n = 1 mA/V², I_D = 100 μA.",
        "Why do digital circuits use MOSFETs (CMOS) rather than BJTs?",
    ]))

    # ── Module 3.4 ──
    s.append(heading('Module 3.4 — Operational Amplifiers: The Analog Swiss Army Knife', 1))
    s.append(p('<b>Duration:</b> 8–10 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(cs_bridge(
        "<b>Op-amp ↔ functional-programming pure function.</b> An ideal op-amp has infinite "
        "gain, infinite input impedance, zero output impedance, infinite bandwidth. Its "
        "output is determined entirely by the feedback network — the op-amp itself is a "
        "pure gain block, like a pure function. The feedback network is the ‘program’; "
        "the op-amp is the ‘runtime’. This is why op-amp circuits are so composable: "
        "swap the feedback network and you get a different function — inverting amp, "
        "integrator, differentiator, summer, subtractor, filter, oscillator."))

    # ── Pixel diagram: op-amp symbol + inverting amplifier ──
    s.extend(diagram('opamp',
        caption='Op-amp triangle — inverting input (−) top, non-inverting input (+) bottom, output right.'))
    s.extend(diagram('opamp_inv',
        caption='Inverting amplifier — R_f feedback, R_in input. V_out = −(R_f/R_in)·V_in.'))

    s.append(volt_says(
        'Op-amps are the analog swiss army knife. The feedback network sets the '
        'behavior. Not the op-amp. Swap the feedback and the same chip becomes an '
        'amplifier. Or an integrator. Or a filter. Or an oscillator. The op-amp is the '
        'runtime. Your feedback network is the program.',
        mood='insight'))

    s.append(amp_says(
        'Like how a CPU just executes instructions, and the program makes it do '
        'different things?',
        mood='question'))

    s.append(volt_says(
        'That\'s a perfect analogy. The op-amp is the CPU. The feedback network is the '
        'code.',
        mood='tip'))

    # ── Pixel diagram: integrator ──
    s.extend(diagram('integrator',
        caption='Op-amp integrator — cap in feedback. V_o = −(1/RC)·∫V_in dt. The analog computer of the 1960s; still everywhere today.'))

    s.append(heading('The two golden rules', 2))
    s.append(p(
        "For an ideal op-amp with negative feedback, two rules suffice to analyze any "
        "circuit: (1) the voltages at the + and − inputs are equal (virtual short); "
        "(2) no current flows into either input (infinite input impedance). These two "
        "rules plus Kirchhoff give you every op-amp circuit."))

    s.append(heading('Five canonical op-amp circuits', 2))
    s.append(make_table([
        ['Circuit','Configuration','Gain / Function'],
        ['Inverting','Input through R1 to −, R_f from − to output, + grounded','A_v = −R_f/R_1'],
        ['Non-inverting','Input to +, − tied to output through R_f and to ground through R_1','A_v = 1 + R_f/R_1'],
        ['Voltage follower','Output tied directly to −, input to +','A_v = 1 (buffer)'],
        ['Summing','Multiple inputs through R_1, R_2, ... to −, R_f feedback','V_o = −R_f·(V_1/R_1 + V_2/R_2 + ...)'],
        ['Difference','V_1 to − through R_1, V_2 to + through R_g; matched feedback','V_o = (R_f/R_1)·(V_2 − V_1)'],
    ], col_widths=[28*mm, 70*mm, 72*mm]))

    s.append(heading('Integrator and differentiator', 2))
    s.append(p(
        "Replace R_f in an inverting amp with a capacitor: you get an integrator, "
        "V_o = −(1/RC)·∫V_in dt. Replace R_1 with a cap: differentiator, "
        "V_o = −RC·dV_in/dt. These are the analog computers of the 1960s — and they are "
        "still the basis of every active filter and every analog control loop. The "
        "differentiator is noise-amplifying and rarely used in pure form; the integrator "
        "is everywhere (PID controllers, active filters, charge amplifiers)."))
    s.append(formula_box(
        "Integrator: V<sub>o</sub> = −(1/RC)·∫V<sub>in</sub> dt &nbsp;&nbsp;|&nbsp;&nbsp; "
        "Differentiator: V<sub>o</sub> = −RC·dV<sub>in</sub>/dt"))

    s.append(heading('Real op-amp non-idealities', 2))
    s.append(p(
        "Real op-amps have finite open-loop gain (10⁵–10⁶), finite input impedance "
        "(MΩ to GΩ), non-zero output impedance (~50 Ω open-loop, much less closed-loop), "
        "finite bandwidth (gain-bandwidth product GBW — typically 1–10 MHz), input offset "
        "voltage (1–10 mV), input bias current (pA for FET-input, μA for bipolar), "
        "slew rate (V/μs), and noise. The two that bite most often are GBW (a 1 MHz "
        "op-amp at gain 100 has bandwidth of only 10 kHz) and slew rate (a 0.5 V/μs "
        "op-amp distorts a 20 V_pp sine above ~4 kHz)."))

    s.append(project_box('Bench: Build an Audio Mixer', [
        ('Goal:', 'sum three audio sources with individual level controls.'),
        ('Circuit:', 'three inverting-amp inputs through 10kΩ pots → summing node → op-amp '
                     'with R_f = 10kΩ → output. Add a follower at the output to drive '
                     'low-impedance headphones or a power amp.'),
        ('Op-amp:', 'TL072 (low-noise JFET input, GBW = 3 MHz, slew rate = 13 V/μs).'),
        ('Verify:', 'feed 1 kHz sine to each input at 100 mV. Output should be sum × gain. '
                    'Add three different frequencies; check the output spectrum has all '
                    'three peaks with the right amplitudes.'),
        ('Extension:', 'add a one-pole low-pass at 20 kHz at the output to suppress '
                       'out-of-band noise.'),
    ]))

    s.append(checkpoint_box([
        "State the two golden rules of ideal op-amp analysis.",
        "Design an inverting amp with gain −10. What are R_1 and R_f?",
        "What is the gain-bandwidth product? Compute the bandwidth of an amp with GBW = 1 MHz at gain 100.",
        "Why is a differentiator rarely used in pure form?",
        "What is slew rate, and how does it limit a 20 V_PP sine at 100 kHz?",
    ]))

    # ── Module 3.5 ──
    s.append(heading('Module 3.5 — Active Filters: Sallen-Key and MFB', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Passive filters (RC, LC) work, but inductors at audio frequencies are bulky, "
        "lossy, and hard to tune. Active filters use op-amps to synthesize the inductor "
        "behavior with capacitors and resistors only. The two most common topologies are "
        "<b>Sallen-Key</b> (non-inverting, low output impedance, easy to cascade) and "
        "<b>Multiple-Feedback (MFB)</b> (inverting, better high-frequency performance, "
        "more component-efficient for high-Q). Both are second-order; cascade them to "
        "build higher-order filters."))

    s.append(heading('Sallen-Key low-pass', 2))
    s.append(p(
        "A Sallen-Key low-pass uses two RC sections followed by an op-amp voltage follower. "
        "The transfer function is "
        "H(s) = ω₀²/(s² + (ω₀/Q)·s + ω₀²) where ω₀ = 1/√(R₁R₂C₁C₂) and "
        "Q = √(R₁R₂C₁C₂)/(R₁C₁ + R₂C₁ + R₁C₂(1−K)) with K = 1 for the unity-gain version. "
        "Choose C₁ = C₂ = C, R₁ = R₂ = R for simplicity: ω₀ = 1/(RC), Q = 1/(2 − K) = 0.5 "
        "for K=1 (Butterworth needs Q = 0.707, achieved by setting K = 1.586)."))
    s.append(formula_box(
        "H(s) = ω<sub>0</sub>² / (s² + (ω<sub>0</sub>/Q)·s + ω<sub>0</sub>²) &nbsp;&nbsp;|&nbsp;&nbsp; "
        "ω<sub>0</sub> = 1/√(R<sub>1</sub>R<sub>2</sub>C<sub>1</sub>C<sub>2</sub>)"))

    # ── Pixel diagram: band-pass filter response ──
    s.extend(diagram('bandpass',
        caption='Band-pass magnitude response — peaks at ω₀, falls off on both sides at ±20 dB/dec.'))

    # ── Pixel diagram: sallen_key filter topology ──
    s.extend(diagram('sallen_key',
        caption='Sallen-Key 2nd-order low-pass — two RC sections + unity-gain buffer. The classic active-filter building block.'))

    s.append(heading('Butterworth, Chebyshev, Bessel — choosing the response', 2))
    s.append(p(
        "Three classic filter responses, each optimizing a different property. "
        "<b>Butterworth</b> is maximally flat in the passband — the smoothest magnitude "
        "response, at the cost of a relatively slow rolloff (−20n dB/decade for n-th order) "
        "and mediocre phase linearity. <b>Chebyshev</b> trades passband ripple for steeper "
        "rolloff — useful when you need to reject a nearby unwanted signal. <b>Bessel</b> "
        "maximizes phase linearity (constant group delay) — best for time-domain pulses "
        "and data transmission, but the slowest rolloff. Choose based on what matters "
        "most in your application: flatness (Butterworth), selectivity (Chebyshev), or "
        "pulse fidelity (Bessel)."))

    s.append(project_box('Bench: 4th-Order Butterworth Low-Pass at 1 kHz', [
        ('Goal:', 'cascade two Sallen-Key 2nd-order sections to build a 4th-order filter.'),
        ('Specs:', 'Butterworth, f_c = 1 kHz, gain = 1 in passband.'),
        ('Design:', 'each stage: Q = 0.541 (stage 1) and Q = 1.306 (stage 2) for 4th-order '
                    'Butterworth. Use C = 10 nF, R = 1/(2π·1000·C) = 15.9 kΩ. Tune the '
                    'gain of each stage to achieve the required Q (gain K = 3 − 1/Q).'),
        ('Build & measure:', 'sweep frequency 100 Hz to 100 kHz. Measure magnitude. '
                             'Verify: flat to 1 kHz, −3 dB at 1 kHz, −80 dB/decade rolloff.'),
        ('Compare to LTspice:', 'simulate the same circuit; overlay the measured response.'),
    ]))

    s.append(checkpoint_box([
        "Why use active filters instead of passive LC filters at audio frequencies?",
        "Design a Sallen-Key low-pass with f_c = 1 kHz using C = 10 nF. What is R?",
        "Compare Butterworth, Chebyshev, Bessel — what does each optimize?",
        "How do you build a 6th-order filter from 2nd-order sections? What Q values does each stage need (Butterworth)?",
    ]))

    # ── Module 3.6 ──
    s.append(heading('Module 3.6 — Oscillators and Timers: Wien Bridge, Phase-Shift, 555', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "An oscillator is an amplifier with positive feedback at a specific frequency. "
        "The Barkhausen criterion: at the oscillation frequency, the loop gain must be "
        "exactly 1 (|Aβ| = 1) and the loop phase must be 0° (or 360°). If |Aβ| &lt; 1 the "
        "oscillation decays; if |Aβ| &gt; 1 it grows until nonlinearity limits it. Real "
        "oscillators start with |Aβ| slightly &gt; 1 (so noise can build up) and rely on "
        "nonlinearity (clipping, AGC) to stabilize at |Aβ| = 1."))

    # ── Pixel diagram: 555 timer block ──
    s.extend(diagram('555_timer',
        caption='555 timer — internal block view: comparators + flip-flop + discharge transistor. The most-sold IC ever.'))

    s.append(heading('Three classic oscillators', 2))
    s.append(bullet_list([
        "<b>Wien bridge:</b> RC bandpass in positive feedback, R_f/R_1 = 2 in negative feedback. "
        "Clean sine output. The classic variable-frequency audio oscillator.",
        "<b>Phase-shift:</b> three RC high-pass sections give 180° phase shift at one frequency; "
        "inverting amp gives the other 180°. Simple, fewer components than Wien.",
        "<b>Colpitts / Hartley:</b> LC oscillators for RF (1 MHz+). Use a tank circuit for the "
        "frequency-selective element. We will meet these in Phase 8.",
    ]))

    s.append(heading('The 555 timer — the most popular IC ever', 2))
    s.append(p(
        "The 555 is an 8-pin oscillator/timer that has been in continuous production since "
        "1972. Two modes: <b>astable</b> (free-running oscillator) and <b>monostable</b> "
        "(one-shot). In astable: frequency f = 1.44/((R_1 + 2·R_2)·C). Duty cycle = "
        "(R_1 + R_2)/(R_1 + 2·R_2). It is the go-to for cheap square-wave clocks, "
        "PWM generators, debouncers, and tone generators."))

    s.append(project_box('Bench: Variable Wien Bridge Sine Source', [
        ('Goal:', 'build a 100 Hz–10 kHz sine source with under 1% THD.'),
        ('Circuit:', 'Wien bridge with dual-gang pot for frequency control, JFET for AGC.'),
        ('Op-amp:', 'TL072 (low distortion, sufficient GBW).'),
        ('Verify:', 'measure THD with a sound-card spectrum analyzer (e.g., REW or RightMark). '
                    'Should be under 1% across the frequency range.'),
        ('Application:', 'use as the input source for the audio amplifier capstone at end of Phase 3.'),
    ]))

    s.append(checkpoint_box([
        "State the Barkhausen criterion. What happens if |Aβ| > 1? < 1?",
        "Design a 555 astable for f = 1 kHz with 50% duty cycle. Pick R_1, R_2, C.",
        "Why does a Wien bridge need an amplitude stabilization mechanism?",
        "Why are LC oscillators preferred over RC at RF frequencies?",
    ]))

    # ── Module 3.7 ──
    s.append(heading('Module 3.7 — Linear Regulators and LDOs', 1))
    s.append(p('<b>Duration:</b> 4–6 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "A linear regulator is a closed-loop amplifier that holds its output voltage "
        "constant despite variations in input voltage and load current. It works by "
        "dissipating the excess voltage as heat — efficiency is V_out / V_in. A 5 V "
        "regulator from 12 V is 42% efficient; the other 58% becomes heat. LDOs (low-"
        "dropout regulators) are a subset that can regulate with V_in as little as 100 mV "
        "above V_out, useful for battery-powered devices."))
    s.append(formula_box(
        "Efficiency = V<sub>out</sub> / V<sub>in</sub> &nbsp;&nbsp;|&nbsp;&nbsp; "
        "P<sub>diss</sub> = (V<sub>in</sub> − V<sub>out</sub>) · I<sub>load</sub>"))

    s.append(p(
        "The classic fixed regulators are LM78xx (positive) and LM79xx (negative); the "
        "LM317 is an adjustable version. Modern LDOs (AMS1117, MCP1700, LT3045) target "
        "low noise and low quiescent current. All share the same internal topology: a "
        "voltage reference (Zener or bandgap), an error amplifier, and a pass transistor "
        "(BJT or MOSFET) in a feedback loop. Spec parameters: dropout voltage, line "
        "regulation, load regulation, quiescent current, PSRR (power supply rejection "
        "ratio), output noise."))

    s.append(project_box('Bench: Adjustable Bench Supply with LM317', [
        ('Goal:', 'build a 1.25–20 V, 1 A bench supply.'),
        ('Circuit:', 'LM317 with R1 = 240Ω, R2 = 5kΩ pot → V_out = 1.25·(1 + R2/R1). '
                     'Add input and output caps (0.33 μF and 0.1 μF) for stability.'),
        ('Verify:', 'sweep R2 from 0 to 5k. V_out should track 1.25 to 27 V linearly. '
                    'Add 1 A load (e.g., 20Ω power resistor at 20V); verify V_out holds within '
                    'load regulation spec (typically 0.1%).'),
        ('Heatsink:', 'at 1 A and 20 V drop, P_diss = 20 W. Heatsink required '
                      '(thermal resistance < 5°C/W).'),
        ('Pass:', 'supply holds V_out within 50 mV across the full load range at all '
                  'output voltages.'),
    ]))

    s.append(checkpoint_box([
        "Compute the efficiency of a 5V LDO dropping 12V to 5V at 500 mA. What is the dissipated power?",
        "Why can’t a linear regulator boost voltage?",
        "What is dropout voltage? Why does it matter for battery-powered devices?",
        "What is PSRR? Why does it matter for analog circuits powered from switching regulators?",
    ]))

    # ── Module 3.8 ──
    s.append(heading('Module 3.8 — Phase 3 Capstone: Audio Amplifier', 1))
    s.append(p('<b>Duration:</b> 8–12 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(project_box('Audio Power Amplifier (Class-AB)', [
        ('Goal:', 'design and build a complete audio power amp: 20 W into 8 Ω, '
                  '20 Hz–20 kHz, THD < 1%.'),
        ('Topology:', 'three-stage: (1) differential input pair (long-tailed pair) for low offset, '
                      '(2) common-emitter voltage-amp stage with Miller compensation, '
                      '(3) class-AB output stage (NPN-PNP Darlington or MOSFET follower) for current drive.'),
        ('Design choices:', 'V_CC = ±25 V rails. Quiescent current 20 mA in output stage '
                            '(class-AB bias). Feedback factor: closed-loop gain = 1 + R_f/R_in = 23 '
                            '(28 dB voltage gain), with input sensitivity 700 mV RMS for full output.'),
        ('Schematic:', 'use KiCad. Typical reference: Douglas Self’s Audio Power Amplifier '
                       'Design Handbook, Chapter 2 (the ‘blameless’ amplifier).'),
        ('Build:', 'solder on perfboard or design a PCB in KiCad and order from JLCPCB (~$10 for 5).'),
        ('Test:', 'drive with the Wien bridge sine source from Module 3.6. Measure THD vs '
                  'frequency and vs output level. Measure bandwidth. Measure output impedance '
                  'by loading with 8 Ω and 4 Ω and computing the change.'),
        ('Document:', 'schematic, PCB layout, BOM, build photos, measurement plots. File in '
                      'a project notebook — you will use this amp as a test load in later phases.'),
    ]))

    s.append(checkpoint_box([
        "Sketch the three-stage topology of a class-AB audio amp. What does each stage do?",
        "Why class-AB and not class-A or class-B? What is the trade-off?",
        "What is Miller compensation and why is it needed?",
        "Compute the efficiency of a class-B amp at full output sine. (Hint: 78.5%.)",
        "How would you protect the output stage against a short circuit?",
    ]))

    s.append(pull_quote(
        'Small-signal linearization is the bridge between the nonlinear physical world '
        'and the linear analytical world. Every transistor model — every backprop '
        'gradient, every Newton step — is the same trick: zoom in until the curve looks '
        'like a line.',
        'Volt, on linearization'))

    s.append(volt_says(
        'Phase 3 is done. You\'ve built real amplifiers from diodes, transistors, and '
        'op-amps. The audio amplifier capstone is the first project big enough to put on '
        'a resume. Phase 4 crosses into the digital domain. The signals are 0s and 1s. '
        'The gates are logic. Your CS background starts doing the heavy lifting. The fun '
        'part is just beginning.',
        mood='story'))

    s.append(PageBreak())
    return s
