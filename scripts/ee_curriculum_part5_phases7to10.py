"""
EE Curriculum Content — Phases 7-10 (Power Electronics/Machines, EM/RF/Comms, VLSI, Power Systems/Capstones)
+ Appendices.
"""

from ee_curriculum_part1_setup import *

# ════════════════════════════════════════════════════════════════════════════
# PHASE 7 — POWER ELECTRONICS & MACHINES
# ════════════════════════════════════════════════════════════════════════════
def build_phase7():
    s = []
    s.append(heading('Phase 7 — Power Electronics & Machines', 0))
    s.append(p('<b>Duration:</b> 7 weeks · <b>Modules:</b> 10 · <b>Goal:</b> master power '
               'converters (buck/boost/inverter), electric machines (DC/induction/BLDC), '
               'and motor drives — and build a working FOC BLDC driver.', 'kicker'))

    s.append(p(
        "Power electronics is where the rubber meets the road for energy. Every modern "
        "energy system — from a 5 W USB charger to a 1 MW grid-scale inverter — is "
        "built from the same set of switching converter topologies. Electric machines "
        "convert between electrical and mechanical energy; motors consume 50% of the "
        "world’s electricity, so even small efficiency improvements matter at scale. "
        "This phase is heavy on LTspice simulation and bench work — the voltages and "
        "currents here will kill components (and occasionally burn fingers) if you "
        "get it wrong."))

    # ── Module 7.1 ──
    s.append(heading('Module 7.1 — Power Semiconductor Devices', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(make_table([
        ['Device','Symbol','On-state','Off-state','Speed','Typical use'],
        ['Diode','—','V_F ~ 0.7 V (Si), 0.3 V (Schottky)','Blocks V_RRM','Fast','Rectifiers, freewheel'],
        ['MOSFET','—','R_DS(on) mΩ','Blocks V_DS','Very fast (< 100 ns)','DC-DC up to ~200 V'],
        ['IGBT','—','V_CE(sat) ~ 1.5 V','Blocks V_CES','Medium (μs)','Motor drives 600 V – 6.5 kV'],
        ['SCR (thyristor)','—','V_T ~ 1.5 V','Blocks V_RRM until forward triggered','Slow (ms)','Phase control, HVDC'],
        ['GaN FET','—','R_DS(on) mΩ, no Q_rr','Blocks V_DS','Ultra fast (< 10 ns)','High-freq DC-DC'],
        ['SiC FET','—','R_DS(on) mΩ','Blocks V_DS to 1700 V+','Very fast','EVs, grid inverters'],
    ], col_widths=[22*mm, 14*mm, 32*mm, 28*mm, 22*mm, 50*mm]))

    s.append(heading('Why GaN and SiC are eating silicon', 2))
    s.append(p(
        "Wide-bandgap semiconductors (GaN, SiC) have higher breakdown field, higher "
        "thermal conductivity, and faster switching than silicon. This means smaller "
        "devices, smaller passives (because you can switch at MHz instead of kHz), "
        "and higher efficiency. Modern USB-C chargers switch at 100+ kHz in 5 cm³ "
        "because of GaN. EV inverters use SiC at 800 V to handle fast charging. The "
        "trade-off is cost — GaN and SiC are still 2–5× silicon per amp — but the "
        "system-level savings (smaller magnetics, smaller heatsinks) often win."))

    s.append(heading('Switching loss and gate drive', 2))
    s.append(p(
        "Every switching event dissipates energy: P_sw = ½·V·I·(t_r + t_f)·f_sw. At "
        "100 kHz and 50 V/10 A, even 50 ns transitions dissipate 1.25 W per switch — "
        "added to conduction loss I²·R_DS(on). Gate drivers provide the high peak "
        "current (1–8 A) needed to charge and discharge the gate capacitance quickly. "
        "Bootstrap gate drivers use a capacitor to float the high-side driver above "
        "the switch node — elegant but limits duty cycle and frequency."))

    s.append(checkpoint_box([
        "Why are Schottky diodes preferred for low-voltage rectification?",
        "When do you choose IGBT over MOSFET? When SiC over silicon?",
        "Compute the switching loss for 50 V, 10 A, 100 kHz, 50 ns transitions.",
        "Why does a high-side N-channel MOSFET need a bootstrap gate driver?",
    ]))

    # ── Module 7.2 ──
    s.append(heading('Module 7.2 — Non-Isolated DC-DC Converters', 1))
    s.append(p('<b>Duration:</b> 8–10 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Three topologies dominate non-isolated DC-DC: <b>buck</b> (step-down), "
        "<b>boost</b> (step-up), <b>buck-boost</b> (inverting, can step up or down). "
        "All three operate on the same principle: a switch chops the input into pulses, "
        "an inductor stores energy during on-time and releases it during off-time, "
        "a capacitor smooths the output. The duty cycle D sets the conversion ratio."))

    s.append(formula_box(
        "Buck: V<sub>o</sub> = D · V<sub>in</sub> &nbsp;&nbsp;|&nbsp;&nbsp; "
        "Boost: V<sub>o</sub> = V<sub>in</sub> / (1 − D) &nbsp;&nbsp;|&nbsp;&nbsp; "
        "Buck-boost: V<sub>o</sub> = −D/(1−D) · V<sub>in</sub>"))

    s.append(heading('Buck converter — the canonical design', 2))
    s.append(p(
        "Switch Q (MOSFET), diode D (or synchronous FET), inductor L, cap C, load R. "
        "Switch closes: inductor current ramps up at di/dt = (V_in − V_o)/L. Switch "
        "opens: inductor current ramps down at di/dt = −V_o/L (current freewheels "
        "through D). At equilibrium, the volt-second balance gives V_o = D·V_in. "
        "Inductor ripple: ΔI_L = (V_in − V_o)·D/(L·f_sw). Output ripple: "
        "ΔV_o = ΔI_L/(8·C·f_sw)."))

    s.append(heading('Continuous vs discontinuous conduction', 2))
    s.append(p(
        "If the inductor current never reaches zero, the converter is in continuous "
        "conduction mode (CCM) — V_o/V_in is independent of load. If the current "
        "reaches zero before the next switching cycle, the converter is in discontinuous "
        "conduction mode (DCM) — V_o/V_in depends on load. DCM has lower switching "
        "loss but higher ripple. Most designs stay in CCM at full load and may drop "
        "into DCM at light load — your controller must handle both."))

    s.append(heading('Synchronous rectification', 2))
    s.append(p(
        "Replace the diode with a second MOSFET. The diode drop (0.5 V Schottky) at "
        "10 A dissipates 5 W; a 10 mΩ FET dissipates 1 W. Worth it for any converter "
        "above a few amps. The trade-off is more complex gate drive (you must prevent "
        "cross-conduction) and a small efficiency penalty at very light load (where "
        "the diode would actually be more efficient because the FET gate charge is wasted)."))

    s.append(project_box('LTspice: 12V-to-5V Buck at 2 A, 200 kHz', [
        ('Goal:', 'design and simulate a buck converter.'),
        ('Specs:', 'V_in = 12 V, V_o = 5 V, I_o = 2 A, f_sw = 200 kHz, ΔV_o < 50 mV.'),
        ('Design:', 'D = 5/12 = 0.417. L = (V_in − V_o)·D/(ΔI_L · f_sw) = (7·0.417)/(0.4·200k) = 36 μH. '
                    'C = ΔI_L/(8·ΔV_o·f_sw) = 0.4/(8·0.05·200k) = 50 μF.'),
        ('Simulate:', 'LTspice with pulse voltage source as gate driver, IRFZ44N MOSFET, '
                      '1N5822 Schottky, ideal L and C, 2.5 Ω load.'),
        ('Measure:', 'verify V_o = 5 V within 1%, ripple < 50 mV. Sweep load from 0.5 A to 3 A; '
                     'verify regulation. Sweep V_in from 10 V to 15 V; verify line regulation.'),
        ('Bench:', 'build with MC34063 or LM2596 module. Compare measurement to simulation.'),
    ]))

    s.append(checkpoint_box([
        "Derive V_o = D·V_in for a buck converter from volt-second balance.",
        "Design a 24 V to 12 V buck at 5 A, 500 kHz, with 1% ripple. Choose L and C.",
        "When does a buck enter DCM? What changes in the conversion ratio?",
        "Why is synchronous rectification more efficient at high current?",
    ]))

    # ── Module 7.3 ──
    s.append(heading('Module 7.3 — Isolated Converters: Flyback, Forward, Bridge', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Galvanic isolation is required for safety in any converter that touches AC "
        "mains or that has a human-touchable output. The transformer provides isolation "
        "and (simultaneously) voltage step-up/down via the turns ratio. The simplest "
        "isolated topology is the <b>flyback</b>, where the transformer is actually used "
        "as a coupled inductor — energy is stored in the core during switch on-time and "
        "released to the output during switch off-time. Flyback is cheap (one switch, "
        "one diode, one cap on the secondary) but limited to ~100 W due to core loss "
        "and high ripple."))

    s.append(heading('Three isolated topologies', 2))
    s.append(make_table([
        ['Topology','Power','Complexity','Use case'],
        ['Flyback','< 100 W','Low','Phone chargers, small appliances, multi-output'],
        ['Forward (1-switch)','< 200 W','Medium','Industrial aux supplies, ATX standby'],
        ['Push-pull / half-bridge','100 W – 500 W','Medium','Telecom DC-DC, ATX main'],
        ['Full-bridge','500 W – 5 kW+','High','Server, EV, industrial'],
        ['Resonant LLC','500 W – 5 kW+','High','Server, EV onboard chargers'],
    ], col_widths=[40*mm, 30*mm, 25*mm, 75*mm]))

    s.append(heading('Transformer design — the hard part', 2))
    s.append(p(
        "Isolated converter design is dominated by transformer design. You must choose "
        "core material (ferrite for &lt; 1 MHz), core size (set by power and frequency), "
        "turns ratio (set by I/O voltage), wire gauge (set by RMS current, with skin "
        "effect at high frequency — use Litz wire above 100 kHz), and winding structure "
        "(affects leakage inductance and inter-winding capacitance). The classic "
        "reference is Colonel Wm. T. McLyman’s <i>Transformer and Inductor Design "
        "Handbook</i>. For first designs, use a magnetics vendor’s online tool (e.g., "
        "Wurth, Coilcraft, Magnetics Inc.)."))

    s.append(project_box('LTspice: 5V/2A Flyback from 170 V DC', [
        ('Goal:', 'simulate a flyback converter.'),
        ('Specs:', 'V_in = 170 V DC (rectified 120 VAC), V_o = 5 V, I_o = 2 A, f_sw = 100 kHz.'),
        ('Design:', 'N_p/N_s = 20 (turns ratio). L_p = 1 mH. D = V_o·N_p / (V_in·N_s + V_o·N_p) ≈ 0.37. '
                    'Peak primary current I_p_pk = 2·I_o·N_s/(N_p·(1−D)) ≈ 0.6 A.'),
        ('Simulate:', 'use a coupled inductor model for the transformer. Verify V_o, '
                      'I_p waveform (triangular), D. Measure the leakage inductance spike '
                      'on the drain — that’s what a snubber must clamp.'),
        ('Snubber:', 'add an RCD snubber across the primary. Tune R and C to keep V_drain '
                     'below 80% of MOSFET rating.'),
    ]))

    s.append(checkpoint_box([
        "Why is the flyback transformer actually a coupled inductor?",
        "What limits flyback to ~100 W?",
        "Why do high-frequency transformers need Litz wire?",
        "What is leakage inductance, and why must you snubber it?",
    ]))

    # ── Module 7.4 ──
    s.append(heading('Module 7.4 — Inverters: Square, PWM, SPWM, SVPWM', 1))
    s.append(p('<b>Duration:</b> 7–9 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(p(
        "An inverter converts DC to AC. The single-phase full-bridge (H-bridge) has "
        "four switches: S1/S4 conduct for positive output, S2/S3 for negative. The "
        "output is a square wave if you just alternate. To get a sine-shaped output, "
        "modulate the duty cycle with a sine — <b>sinusoidal PWM (SPWM)</b>: compare "
        "a sine reference to a triangle carrier; the comparator output drives the "
        "switches. The output is a train of pulses whose average over a carrier period "
        "is a sine."))
    s.append(formula_box(
        "V<sub>o,avg</sub> = m<sub>a</sub> · V<sub>dc</sub> · sin(ω<sub>m</sub>t) &nbsp;&nbsp; "
        "(m<sub>a</sub> = modulation index, m<sub>a</sub> ≤ 1)"))

    s.append(heading('Space Vector PWM (SVPWM) — the three-level trick', 2))
    s.append(p(
        "For three-phase inverters, SVPWM is more efficient than SPWM. It treats the "
        "three-phase output as a single rotating voltage space vector. There are 8 "
        "switching states (6 active + 2 zero); any target vector is synthesized by "
        "time-averaging two adjacent active vectors and a zero vector. SVPWM gives "
        "~15% more output voltage than SPWM for the same DC bus, which is why every "
        "commercial motor drive uses it."))

    s.append(project_box('Python + LTspice: SPWM Inverter', [
        ('Goal:', 'generate SPWM, simulate an H-bridge inverter.'),
        ('Python:', 'generate 5 kHz triangle carrier and 50 Hz sine reference at m_a = 0.8. '
                    'Output two complementary PWM signals (high/low side of each phase leg).'),
        ('LTspice:', 'build H-bridge with 4 MOSFETs, gate drivers, DC bus = 400 V. Drive '
                     'with the PWM signals. Load with 10 Ω + 10 mH.'),
        ('Measure:', 'output voltage before and after LC filter. Spectrum shows 50 Hz '
                     'fundamental + harmonics at 5 kHz and sidebands.'),
        ('Efficiency:', 'compute efficiency at 1 kW output. Should be > 90%.'),
    ]))

    s.append(checkpoint_box([
        "What is SPWM? How does m_a affect the output?",
        "Why is SVPWM more efficient than SPWM for three-phase inverters?",
        "What is dead time, and why is it needed in an H-bridge?",
        "Compute the THD of a square wave inverter output. (Hint: ~45%.)",
    ]))

    # ── Module 7.5 ──
    s.append(heading('Module 7.5 — Rectifiers and Power Factor Correction', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "A simple diode-bridge + capacitor input draws current in short spikes at the "
        "peak of each AC cycle — power factor can be 0.5–0.7 even with a resistive "
        "load. Above 75 W, regulations (ENERGY STAR, IEC 61000-3-2) require active "
        "power factor correction (PFC). A PFC stage is a boost converter that forces "
        "the input current to follow the input voltage shape — making the load look "
        "resistive to the line."))

    s.append(heading('Boost PFC', 2))
    s.append(p(
        "Standard topology: diode bridge → boost converter → DC bus. The boost controller "
        "has two control loops: a fast current loop that makes the inductor current "
        "follow |V_ac|·sin(ωt) scaled by an error signal, and a slow voltage loop that "
        "regulates the DC bus. The result: input current is sinusoidal, in phase with "
        "voltage, PF &gt; 0.99. The PFC controller IC (e.g., NCP1654, UCC28180) "
        "implements both loops in analog."))

    s.append(checkpoint_box([
        "Why do simple rectifier-capacitor inputs have poor power factor?",
        "How does a boost PFC work? What are its two control loops?",
        "Why is PFC mandatory above 75 W by regulation?",
        "Compute the input current of a 100 W PFC’d supply at 230 VAC. (Hint: 0.43 A RMS, sinusoidal.)",
    ]))

    # ── Module 7.6 ──
    s.append(heading('Module 7.6 — DC Machines', 1))
    s.append(p('<b>Duration:</b> 4–6 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "DC motors are the simplest electric machine. The torque is T = K·Φ·I_a (field "
        "flux × armature current), the back-EMF is E = K·Φ·ω. Combining: "
        "T = K²·Φ²·(V − E)/R_a. Speed control: vary V (armature voltage control — "
        "common), vary Φ (field weakening — for high-speed operation), or vary R_a "
        "(rheostatic — wasteful). Modern DC motor drives use PWM on the armature "
        "voltage."))
    s.append(formula_box(
        "T = K·Φ·I<sub>a</sub> &nbsp;&nbsp;|&nbsp;&nbsp; "
        "E = K·Φ·ω &nbsp;&nbsp;|&nbsp;&nbsp; "
        "ω = (V − I<sub>a</sub>·R<sub>a</sub>) / (K·Φ)"))

    s.append(heading('Four DC motor types', 2))
    s.append(make_table([
        ['Type','Field','Torque-speed','Use'],
        ['Permanent magnet','PM','Linear, easy to drive','Toys, fans, EVs (small)'],
        ['Shunt','Independent winding','Flat speed (self-regulating)','Industrial drives'],
        ['Series','Series with armature','High starting torque','Traction (old trains, EVs)'],
        ['Compound','Shunt + series','Compromise','Cranes, hoists'],
    ], col_widths=[30*mm, 40*mm, 45*mm, 55*mm]))

    s.append(checkpoint_box([
        "Why does a DC motor draw high current at startup? How is this limited?",
        "What is back-EMF and why is it important?",
        "Compare PMDC, shunt, series, compound motors.",
        "How does field weakening achieve speeds above the rated speed?",
    ]))

    # ── Module 7.7 ──
    s.append(heading('Module 7.7 — Induction Machines', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(p(
        "The three-phase induction motor is the workhorse of industry. Stator windings "
        "produce a rotating magnetic field at synchronous speed n_s = 120·f/p (rpm), "
        "where p is pole count. The rotor runs slightly below n_s — the <b>slip</b> "
        "s = (n_s − n)/n_s. Without slip, there is no relative motion between rotor "
        "and rotating field, no induced rotor current, no torque."))

    s.append(heading('Equivalent circuit', 2))
    s.append(p(
        "The per-phase equivalent circuit has: stator resistance R_s, stator leakage "
        "L_s, magnetizing inductance L_m, rotor resistance R_r referred to stator, "
        "rotor leakage L_r referred to stator, and a slip-dependent resistor R_r·(1−s)/s "
        "representing the mechanical load. Torque: T = (3/ω_s)·|I_r|²·R_r·(1−s)/s. The "
        "torque-speed curve has a starting torque, a breakdown torque, and a synchronous "
        "speed at no-load."))

    s.append(heading('Starting methods', 2))
    s.append(p(
        "Direct-on-line (DOL) starting draws 6–7× rated current for ~1 s — acceptable "
        "for small motors but stresses the supply. Star-delta starting reduces starting "
        "current to ~2× by starting in wye (lower voltage per phase) then switching to "
        "delta. VFD (variable-frequency drive) starts at low frequency and low voltage, "
        "ramping up — the gentlest method. Auto-transformer and soft-starter are "
        "intermediate options."))

    s.append(checkpoint_box([
        "Define slip. Why can’t an induction motor run at synchronous speed?",
        "Sketch the torque-speed curve of an induction motor. Mark starting, breakdown, and synchronous torques.",
        "Compute the synchronous speed of a 4-pole motor at 50 Hz. At 60 Hz.",
        "Why does a VFD produce less starting stress than DOL?",
    ]))

    # ── Module 7.8 ──
    s.append(heading('Module 7.8 — Synchronous Machines and BLDC/PMSM', 1))
    s.append(p('<b>Duration:</b> 7–9 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(p(
        "Synchronous motors run at exactly n_s = 120·f/p — no slip. The rotor field "
        "comes from permanent magnets (PMSM, BLDC) or from a DC excitation winding "
        "(large synchronous machines). PMSM (sinusoidal back-EMF) and BLDC (trapezoidal "
        "back-EMF) are essentially the same machine with different drive strategies — "
        "PMSM uses three sinusoidal currents, BLDC uses two-phase square-wave currents. "
        "Both are 90+% efficient and power everything from drones to EVs."))

    s.append(heading('BLDC commutation', 2))
    s.append(p(
        "BLDC uses three Hall-effect sensors to detect rotor position in six sectors "
        "(60° each). Each sector corresponds to a specific pair of conducting phases. "
        "The drive switches phases every 60°. This is <b>trapezoidal (six-step) "
        "commutation</b>. Simple, robust, but produces torque ripple at each switching."))

    s.append(heading('PMSM and Field-Oriented Control (FOC)', 2))
    s.append(p(
        "FOC (also called vector control) treats the PMSM like a DC motor via a "
        "mathematical transformation. The three-phase currents are transformed to a "
        "rotating reference frame (Clarke + Park transforms) aligned with the rotor "
        "flux. In this frame, the d-axis current controls flux (set to zero for "
        "maximum torque per amp) and the q-axis current controls torque — exactly "
        "like the field and armature currents of a DC motor. Two PI controllers regulate "
        "i_d and i_q; the outputs are transformed back to three-phase voltages for the "
        "inverter. FOC delivers smooth, ripple-free torque and is the standard for "
        "EVs, drones, and industrial servos."))

    s.append(formula_box(
        "Clarke: i<sub>α</sub>, i<sub>β</sub> = (2/3)·[i<sub>a</sub> − ½i<sub>b</sub> − ½i<sub>c</sub>, "
        "(√3/2)(i<sub>b</sub> − i<sub>c</sub>)] &nbsp;&nbsp;|&nbsp;&nbsp; "
        "Park: i<sub>d</sub>, i<sub>q</sub> = [i<sub>α</sub>·cos θ + i<sub>β</sub>·sin θ, "
        "−i<sub>α</sub>·sin θ + i<sub>β</sub>·cos θ]"))

    s.append(project_box('Python: Simulate FOC of a PMSM', [
        ('Goal:', 'simulate FOC and verify smooth torque.'),
        ('Plant:', 'PMSM with R_s = 0.5 Ω, L_d = L_q = 1 mH, K_t = 0.1 Nm/A, J = 0.001 kg·m².'),
        ('Controller:', 'two PI loops on i_d, i_q. i_d* = 0, i_q* = T*/K_t. Inverse Park, '
                        'inverse Clarke, space-vector modulation. Sample at 10 kHz.'),
        ('Simulate:', 'step T* from 0 to 1 Nm at t = 10 ms. Confirm i_q tracks its reference, '
                      'i_q settles in ~5 ms. Torque is smooth, no ripple.'),
        ('Compare:', 'run the same motor with six-step BLDC commutation. Note the torque '
                     'ripple (~10%). FOC is fundamentally smoother.'),
    ]))

    s.append(checkpoint_box([
        "What is the difference between BLDC and PMSM?",
        "Explain Clarke and Park transforms. What is the reference frame?",
        "Why does FOC give smoother torque than six-step commutation?",
        "What is the role of i_d and i_q in FOC? Why set i_d* = 0?",
    ]))

    # ── Module 7.9 ──
    s.append(heading('Module 7.9 — Motor Drives: V/f and FOC', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(heading('V/f control for induction motors', 2))
    s.append(p(
        "The simplest induction motor drive: maintain V/f constant so the stator flux "
        "stays at rated value. At low frequency, boost the voltage to compensate for "
        "stator resistance. V/f is open-loop (no speed feedback) — fine for fans, "
        "pumps, and conveyors. Speed regulation is poor (~5%) but the drive is cheap "
        "and robust."))

    s.append(heading('FOC for induction and PMSM', 2))
    s.append(p(
        "Closed-loop FOC requires a rotor position sensor (encoder, resolver, or sensorless "
        "estimator). For induction motors, the rotor flux angle must be estimated from "
        "the slip frequency and stator currents. For PMSM, the rotor angle is measured "
        "or estimated via back-EMF or high-frequency injection. FOC delivers 0.1% speed "
        "regulation and 4-quadrant operation (motoring and braking in both directions) — "
        "essential for servos and EVs."))

    s.append(checkpoint_box([
        "Why does V/f control keep the flux constant?",
        "Why is V/f open-loop? What kind of load is it suitable for?",
        "What sensors does closed-loop FOC require?",
        "What is sensorless FOC? What are its limitations?",
    ]))

    # ── Module 7.10 ──
    s.append(heading('Module 7.10 — Phase 7 Capstone: BLDC FOC Driver', 1))
    s.append(p('<b>Duration:</b> 14–20 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(project_box('Phase 7 Capstone: BLDC FOC Motor Controller', [
        ('Goal:', 'build a complete FOC driver for a small PMSM (drone motor).'),
        ('Hardware:', 'STM32G4 Nucleo (with motor-control SDK), 3-phase inverter board '
                      '(B-G431B-ESC1 discovery kit or custom), 2204 drone motor with '
                      'encoder, 12 V 5 A bench supply.'),
        ('Software:', 'STM32 MCSDK (Motor Control SDK) generates the FOC framework. '
                      'Tune PI gains for current loop and speed loop.'),
        ('Implementation:', 'current loop at 16 kHz, speed loop at 1 kHz. ADC samples '
                            'phase currents synchronously with PWM. Hall sensors or encoder '
                            'for position.'),
        ('Tests:', '(1) Open-loop ramp: spin the motor at fixed duty. (2) Tune current '
                   'loop with step response. (3) Tune speed loop. (4) Measure torque vs '
                   'i_q. (5) 4-quadrant: motor and brake. (6) Sensorless start.'),
        ('Document:', 'schematic, code, tuning procedure, measurement plots, video. '
                      'This is the most substantial build so far — budget 3 weekends.'),
    ]))

    s.append(checkpoint_box([
        "Sketch the FOC block diagram: from current sensor to gate driver.",
        "Why is ADC sampling synchronized to PWM center?",
        "How do you tune the current loop? The speed loop?",
        "What happens if i_d* is not zero? (Hint: field weakening.)",
    ]))

    s.append(PageBreak())
    return s

# ════════════════════════════════════════════════════════════════════════════
# PHASE 8 — EM FIELDS, RF & COMMUNICATIONS
# ════════════════════════════════════════════════════════════════════════════
def build_phase8():
    s = []
    s.append(heading('Phase 8 — EM Fields, RF & Communications', 0))
    s.append(p('<b>Duration:</b> 6 weeks · <b>Modules:</b> 9 · <b>Goal:</b> cover Maxwell’s '
               'equations in real engineering problems, transmission lines, antennas, RF '
               'front-ends, and analog + digital modulation.', 'kicker'))

    s.append(p(
        "EM and RF are where the lumped-circuit approximation breaks down. Once the "
        "physical dimensions of your circuit approach the wavelength of the signals "
        "it carries, you can no longer pretend wires are equipotential. A 1 GHz signal "
        "has a 30 cm wavelength — your PCB traces are transmission lines, not wires. "
        "This phase teaches you the tools to handle that: Smith charts, scattering "
        "parameters, antenna theory, and the analog signal chain that drives modern "
        "wireless."))

    # ── Module 8.1 ──
    s.append(heading('Module 8.1 — Vector Calculus for EM', 1))
    s.append(p('<b>Duration:</b> 4–6 h · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(cs_bridge(
        "<b>Vector calculus ↔ 3D gradient operations in graphics.</b> Gradient (∇φ), "
        "divergence (∇·F), and curl (∇×F) are the same operators you use in fluid "
        "simulation, image processing (gradient = Sobel filter), and physics engines. "
        "The gradient of a scalar field gives the direction of steepest ascent. "
        "Divergence measures whether a point is a source (positive) or sink (negative). "
        "Curl measures rotation. Maxwell’s four equations are written in this language; "
        "once you internalize the three operators, Maxwell becomes readable."))

    s.append(heading('Three operators, three theorems', 2))
    s.append(make_table([
        ['Operator','Symbol','Acts on','Returns','Theorem'],
        ['Gradient','∇φ','Scalar field','Vector field','Fundamental theorem (line integral)'],
        ['Divergence','∇·F','Vector field','Scalar field','Divergence (Gauss) theorem'],
        ['Curl','∇×F','Vector field','Vector field','Stokes’ theorem'],
    ], col_widths=[28*mm, 22*mm, 30*mm, 30*mm, 60*mm]))

    s.append(p(
        "Three identities you must know: ∇×(∇φ) = 0 (curl of gradient is zero — "
        "conservative fields), ∇·(∇×F) = 0 (divergence of curl is zero — solenoidal "
        "fields), and ∇×(∇×F) = ∇(∇·F) − ∇²F (curl of curl identity, used to derive "
        "the wave equation from Maxwell)."))

    s.append(checkpoint_box([
        "Compute ∇φ for φ = x²y + 3yz. Compute ∇·F for F = (x², y², z²).",
        "State the divergence theorem and Stokes’ theorem.",
        "Derive the wave equation from Maxwell in free space.",
        "Why is the curl of a gradient always zero?",
    ]))

    # ── Module 8.2 ──
    s.append(heading('Module 8.2 — Electrostatics: Gauss, Boundary Conditions', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Gauss’s law: ∮<b>E</b>·d<b>A</b> = Q_enc/ε₀. For symmetric charge distributions "
        "(point, line, plane, sphere), use a Gaussian surface that matches the symmetry "
        "and the integral becomes trivial. A point charge Q gives E = Q/(4πε₀r²). An "
        "infinite plane of charge gives E = σ/(2ε₀) — independent of distance. A "
        "spherical shell gives zero field inside and E = Q/(4πε₀r²) outside (same as "
        "point charge)."))

    s.append(heading('Capacitance and dielectrics', 2))
    s.append(p(
        "Two conductors at different potentials hold charges ±Q; the ratio C = Q/V is "
        "the capacitance. Parallel plate: C = ε·A/d. Coaxial: C = 2πε/ln(b/a). A "
        "dielectric material between the plates multiplies ε by the relative permittivity "
        "ε_r (4–8 for FR4, 10 for alumina, 80 for water). The energy stored is "
        "W = ½·C·V². The force between plates is F = ½·V²·dC/dx."))

    s.append(heading('Boundary conditions', 2))
    s.append(p(
        "At an interface between two dielectrics: the tangential E is continuous, and "
        "the normal D = εE has a discontinuity equal to the surface charge. At a "
        "conductor surface: tangential E = 0 (no field inside a conductor at "
        "equilibrium), normal E = σ/ε₀. These boundary conditions plus Gauss’s law "
        "let you solve any static problem."))

    s.append(checkpoint_box([
        "Use Gauss’s law to find E for an infinite line charge λ.",
        "Compute the capacitance of 1 m of coax with a=1mm, b=5mm, ε_r=2.25.",
        "State the boundary conditions on E and D at a dielectric interface.",
        "Why does a dielectric increase capacitance?",
    ]))

    # ── Module 8.3 ──
    s.append(heading('Module 8.3 — Magnetostatics: Biot-Savart, Ampère', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Biot-Savart law: <b>B</b> = (μ₀/4π)·∫I·d<b>l</b>×<b>r̂</b>/r². The magnetic field "
        "of a current loop. For an infinite straight wire: B = μ₀·I/(2π·r). For a "
        "solenoid (n turns per meter): B = μ₀·n·I inside. Ampère’s law: ∮<b>B</b>·d<b>l</b> = "
        "μ₀·I_enc — the dual of Gauss’s law, useful for symmetric current distributions."))

    s.append(heading('Inductance and magnetic energy', 2))
    s.append(p(
        "Inductance L = λ/I (flux linkage per amp). Solenoid: L = μ₀·N²·A/l. Coax: "
        "L = (μ₀/2π)·ln(b/a)·l. Energy stored: W = ½·L·I². The force between two "
        "current-carrying loops is F = ½·I²·dL/dx (electromechanical energy conversion "
        "— the basis of every motor and actuator)."))

    s.append(checkpoint_box([
        "Use Biot-Savart to find B at the center of a circular loop of radius R carrying current I.",
        "Compute the inductance of a 10-turn, 5 cm-long, 1 cm-radius solenoid.",
        "State Ampère’s law. Apply it to a coaxial cable.",
        "How does a ferromagnetic core increase inductance?",
    ]))

    # ── Module 8.4 ──
    s.append(heading('Module 8.4 — Maxwell’s Equations and EM Waves', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(p(
        "In free space (no charges, no currents), Maxwell’s equations reduce to the "
        "wave equation: ∇²<b>E</b> = μ₀ε₀·∂²<b>E</b>/∂t², with wave speed "
        "v = 1/√(μ₀ε₀) = 3×10⁸ m/s = c. Light is an EM wave. The wave has E and B "
        "perpendicular to each other and to the direction of propagation — a transverse "
        "wave. The ratio |E|/|B| = c. The Poynting vector <b>S</b> = (1/μ₀)·<b>E</b>×<b>B</b> "
        "gives the power flow per unit area."))

    s.append(heading('Plane waves and polarization', 2))
    s.append(p(
        "A plane wave E(z, t) = E₀·cos(kz − ωt)·x̂ has wavelength λ = 2π/k, frequency "
        "f = ω/(2π), and propagates in +z. The wave impedance of free space "
        "η₀ = √(μ₀/ε₀) ≈ 377 Ω. Polarization: linear (E stays in one direction), "
        "circular (E rotates), elliptical (general). Antennas are sensitive to polarization "
        "— a vertical antenna receives vertically-polarized waves best."))

    s.append(heading('The EM spectrum', 2))
    s.append(make_table([
        ['Band','Frequency','Wavelength','Use'],
        ['DC','0','∞','Power'],
        ['Audio','20 Hz–20 kHz','15,000 km–15 km','Sound (not EM, but same math)'],
        ['RF','3 kHz–300 GHz','100 km–1 mm','Radio, WiFi, 5G, radar'],
        ['Microwave','300 MHz–300 GHz','1 m–1 mm','Oven, radar, satcom'],
        ['Infrared','300 GHz–430 THz','1 mm–700 nm','Heat, IR remote, LiDAR'],
        ['Visible','430–790 THz','700–400 nm','Human vision'],
        ['UV','750 THz–30 PHz','400–10 nm','Sterilization, fluorescence'],
        ['X-ray','30 PHz–30 EHz','10 nm–10 pm','Imaging, crystallography'],
        ['Gamma','> 30 EHz','< 10 pm','Nuclear medicine, astrophysics'],
    ], col_widths=[22*mm, 40*mm, 35*mm, 73*mm]))

    s.append(checkpoint_box([
        "Derive the wave equation from Maxwell in free space. What is v?",
        "What is the Poynting vector? What is its physical meaning?",
        "What is the wave impedance of free space?",
        "Compute the wavelength of a 2.4 GHz WiFi signal in air. In water (ε_r=80)?",
    ]))

    # ── Module 8.5 ──
    s.append(heading('Module 8.5 — Transmission Lines and the Smith Chart', 1))
    s.append(p('<b>Duration:</b> 7–9 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(p(
        "A transmission line is any pair of conductors where the physical length is "
        "comparable to the signal wavelength. Coax, microstrip (PCB trace over ground), "
        "stripline, twisted pair, waveguide. The line has distributed inductance L per "
        "meter and capacitance C per meter, giving characteristic impedance "
        "Z₀ = √(L/C) (typically 50 Ω for RF, 75 Ω for video, 100 Ω for twisted-pair "
        "Ethernet). Signals propagate at v_p = 1/√(LC) ≈ 2c/3 for coax (due to dielectric)."))
    s.append(formula_box(
        "Z<sub>0</sub> = √(L/C) &nbsp;&nbsp;|&nbsp;&nbsp; "
        "v<sub>p</sub> = 1/√(LC) &nbsp;&nbsp;|&nbsp;&nbsp; "
        "Γ = (Z<sub>L</sub> − Z<sub>0</sub>) / (Z<sub>L</sub> + Z<sub>0</sub>)"))

    s.append(heading('Reflections and matching', 2))
    s.append(p(
        "If the load impedance Z_L ≠ Z_0, part of the wave reflects back. The reflection "
        "coefficient Γ = (Z_L − Z_0)/(Z_L + Z_0). For Z_L = Z_0, Γ = 0 — no reflection, "
        "perfect match. For Z_L = 0 (short), Γ = −1 — full reflection with inversion. "
        "For Z_L = ∞ (open), Γ = +1 — full reflection in phase. Standing waves form "
        "when forward and reflected waves interfere; the standing wave ratio "
        "SWR = (1+|Γ|)/(1−|Γ|). SWR = 1 is matched; SWR → ∞ is fully reflected."))

    s.append(heading('The Smith chart — a graphical calculator for RF', 2))
    s.append(p(
        "The Smith chart is a polar plot of Γ overlaid with constant-resistance and "
        "constant-reactance circles. Any impedance Z is a point on the chart. Adding "
        "series L or C moves the point along constant-resistance circles. Adding shunt "
        "L or C moves along constant-conductance circles. Matching is the art of moving "
        "the point to the center (Z = Z_0). Once you internalize the chart, RF design "
        "becomes geometric — you can design matching networks by inspection."))

    s.append(project_box('Python: Interactive Smith Chart', [
        ('Goal:', 'build a Smith chart tool in Python.'),
        ('Tasks:', 'plot the Smith chart (constant-R and constant-X circles). Plot a load '
                   'impedance. Animate adding series L, series C, shunt L, shunt C and '
                   'trace the path on the chart.'),
        ('Use:', 'design a matching network for Z_L = 100 − j50 Ω to Z_0 = 50 Ω at '
                '1 GHz. Use L-match, π-match, and stub matching. Verify each design '
                'with scikit-rf.'),
        ('Bench (optional):', 'build the matching network with surface-mount L and C on '
                              'a PCB. Measure with a VNA (NanoVNA $50). Confirm the match.'),
    ]))

    s.append(checkpoint_box([
        "What is the characteristic impedance of a transmission line?",
        "Compute Γ for Z_L = 25 Ω, Z_0 = 50 Ω. What is the SWR?",
        "What is the velocity factor of a coax with ε_r = 2.25?",
        "Why is 50 Ω the standard RF impedance?",
        "Design an L-network to match 100 + j50 Ω to 50 Ω at 1 GHz.",
    ]))

    # ── Module 8.6 ──
    s.append(heading('Module 8.6 — Antennas: Dipole, Patch, Gain, Pattern', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "An antenna converts a guided wave (in a transmission line) to a free-space "
        "wave (radiated). The half-wave dipole is the reference: length λ/2, fed at "
        "the center, radiates broadside with a doughnut-shaped pattern. Gain ~2.15 dBi. "
        "Input impedance ~73 Ω (close to 75 Ω coax). The patch antenna is a flat "
        "rectangle of metal λ/4 above a ground plane — used in PCBs, GPS, WiFi arrays. "
        "Compact but narrowband (~1% bandwidth)."))

    s.append(heading('Antenna parameters', 2))
    s.append(bullet_list([
        "<b>Gain:</b> dBi = dB relative to isotropic. Dipole = 2.15 dBi. Patch = 6–9 dBi. Horn = 15–25 dBi.",
        "<b>Radiation pattern:</b> polar plot of radiated power. Main lobe, sidelobes, nulls.",
        "<b>Beamwidth:</b> angular width of main lobe at −3 dB. Narrow beam = high gain.",
        "<b>Bandwidth:</b> frequency range over which SWR < 2 (or other criterion).",
        "<b>Polarization:</b> direction of E field. Vertical, horizontal, circular.",
        "<b>Efficiency:</b> radiated power / input power. Losses come from conductor, dielectric, mismatch.",
    ]))

    s.append(heading('The Friis transmission equation', 2))
    s.append(p(
        "Power received at distance R from a transmitter: "
        "P_r = P_t·G_t·G_r·(λ/(4πR))². The (λ/(4πR))² term is the free-space path loss. "
        "At 2.4 GHz over 100 m, that’s −40 dB. With 2 dBi antennas at each end, P_r is "
        "P_t − 36 dB. A WiFi router at 100 mW (20 dBm) delivers −16 dBm at the receiver "
        "— well above the −90 dBm sensitivity of a typical WiFi chip. This is why WiFi "
        "works across a house."))
    s.append(formula_box(
        "P<sub>r</sub> = P<sub>t</sub>·G<sub>t</sub>·G<sub>r</sub>·(λ / (4πR))² &nbsp;&nbsp; "
        "(Friis equation)"))

    s.append(project_box('Bench: 2.4 GHz Dipole + RTL-SDR', [
        ('Goal:', 'build a simple 2.4 GHz receiver and see WiFi signals.'),
        ('Antenna:', 'half-wave dipole from two 31 mm pieces of wire on an SMA connector.'),
        ('Receiver:', 'RTL-SDR ($25) tuned to 2.4 GHz. SDR# or GNU Radio as the spectrum '
                      'analyzer.'),
        ('Observe:', 'turn on a WiFi router nearby. See the spectrum light up at 2.412 GHz '
                     '(channel 1). Walk around — signal strength changes with orientation '
                     'and distance.'),
        ('Map:', 'walk the perimeter of a room with the SDR. Plot signal strength vs position. '
                 'You are doing RF site survey.'),
    ]))

    s.append(checkpoint_box([
        "What is antenna gain in dBi? What is the gain of a half-wave dipole?",
        "Compute the free-space path loss at 2.4 GHz over 10 m.",
        "Why is a patch antenna narrowband? How can you increase its bandwidth?",
        "What is the polarization of a vertical dipole? What happens if the receiver is horizontal?",
    ]))

    # ── Module 8.7 ──
    s.append(heading('Module 8.7 — RF Front-End: LNA, Mixer, Oscillator, PLL', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(p(
        "Every radio receiver (superheterodyne) has the same architecture: antenna → "
        "LNA → mixer → IF filter → demodulator. The <b>LNA</b> (low-noise amplifier) "
        "boosts the weak signal with minimal added noise. The <b>mixer</b> multiplies "
        "the RF signal by a local oscillator (LO) to shift it to a lower intermediate "
        "frequency (IF) where filtering is easier. The <b>PLL</b> (phase-locked loop) "
        "generates the LO with crystal-stable frequency."))
    s.append(formula_box(
        "Noise figure: F = (SNR)<sub>in</sub> / (SNR)<sub>out</sub> &nbsp;&nbsp;|&nbsp;&nbsp; "
        "Noise temp: T<sub>e</sub> = T<sub>0</sub>·(F − 1)"))

    s.append(heading('The Friis cascade — first stage dominates', 2))
    s.append(p(
        "Total noise figure of a cascade: F = F_1 + (F_2 − 1)/G_1 + (F_3 − 1)/(G_1·G_2) + ... "
        "The first stage dominates — its noise is amplified by everything downstream, "
        "while later-stage noise is divided by the preceding gain. This is why receivers "
        "have a low-noise first stage (LNA) close to the antenna."))

    s.append(heading('Mixers — frequency translation', 2))
    s.append(p(
        "An ideal mixer outputs the product of two inputs: v_out = v_RF·v_LO. By "
        "trigonometric identity, this produces signals at f_RF + f_LO and |f_RF − f_LO|. "
        "Filter to keep one and reject the other. Image rejection is a key design "
        "parameter — the image frequency (2·f_LO − f_RF) appears at the same IF as "
        "the desired signal. Solutions: image-reject filter before the mixer, or "
        "I/Q (quadrature) mixing that cancels the image mathematically."))

    s.append(checkpoint_box([
        "Sketch a superheterodyne receiver. What is the IF?",
        "Why does the LNA dominate the noise figure?",
        "What is the image frequency? How do you reject it?",
        "What is a PLL? What does it lock to?",
    ]))

    # ── Module 8.8 ──
    s.append(heading('Module 8.8 — Modulation: AM, FM, PM, ASK, FSK, PSK, QAM', 1))
    s.append(p('<b>Duration:</b> 7–9 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(cs_bridge(
        "<b>Modulation ↔ encoding scheme.</b> Modulation is the encoding of bits onto "
        "a carrier. ASK (amplitude shift keying) is 1-bit-per-symbol NRZ on the "
        "amplitude. FSK is two tones (like a Bell modem). PSK is phase shifts. QAM "
        "combines amplitude and phase — 16-QAM carries 4 bits per symbol, 64-QAM "
        "carries 6, 256-QAM carries 8. The Shannon limit C = B·log₂(1 + SNR) tells "
        "you the maximum bits/s for a given bandwidth and SNR. Modern WiFi (802.11ax) "
        "uses 1024-QAM — 10 bits per symbol — and pushes close to the Shannon limit."))

    s.append(heading('Analog modulation — AM and FM', 2))
    s.append(p(
        "AM: m(t) = (A_c + m·cos ω_m t)·cos ω_c t. The envelope carries the signal. "
        "Bandwidth = 2·f_m. Simple to modulate and demodulate (envelope detector), "
        "but vulnerable to noise. FM: phase of the carrier varies with m(t). Bandwidth "
        "= 2·(β+1)·f_m (Carson’s rule), where β = Δf/f_m. Wider bandwidth, but much "
        "better noise immunity than AM — this is why FM radio sounds better."))

    s.append(heading('Digital modulation — constellation diagrams', 2))
    s.append(p(
        "Digital modulation maps bits to points in the I-Q plane. BPSK: 2 points on "
        "the real axis. QPSK: 4 points on the unit circle. 16-QAM: 16 points in a 4×4 "
        "grid. The constellation diagram tells you everything: minimum distance between "
        "points (sets BER), peak-to-average power ratio (sets amplifier backoff), and "
        "spectral efficiency (bits/s/Hz)."))

    s.append(formula_box(
        "Shannon: C = B · log<sub>2</sub>(1 + SNR) &nbsp;&nbsp;|&nbsp;&nbsp; "
        "Spectral efficiency: η = log<sub>2</sub>(M) [bits/symbol for M-QAM]"))

    s.append(project_box('Python + GNU Radio: BPSK Modulator', [
        ('Goal:', 'transmit and receive a BPSK signal.'),
        ('Tasks:', '(1) Generate a random bit stream. (2) Map to ±1 (BPSK). (3) Upsample '
                   'and pulse-shape with root-raised cosine. (4) Multiply by carrier. '
                   '(5) Add noise. (6) Downconvert, matched filter, sample. (7) Compute '
                   'BER vs SNR.'),
        ('Verify:', 'BER should match the theoretical curve BER = Q(√(2·SNR)).'),
        ('Extension:', 'do the same for QPSK and 16-QAM. Plot the constellation at each '
                       'SNR. Watch the points spread as noise increases.'),
    ]))

    s.append(checkpoint_box([
        "Compute the Shannon limit for a 1 MHz channel at 20 dB SNR.",
        "Sketch the constellation of QPSK, 16-QAM, 64-QAM. How many bits per symbol?",
        "Why does FM have better noise immunity than AM?",
        "What is the relationship between bit rate, symbol rate, and bits per symbol?",
    ]))

    # ── Module 8.9 ──
    s.append(heading('Module 8.9 — Phase 8 Capstone: FM Transmitter + SDR Receiver', 1))
    s.append(p('<b>Duration:</b> 10–14 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(project_box('Phase 8 Capstone: FM Transmitter + SDR Receiver', [
        ('Goal:', 'build an FM transmitter and receive your own signal with an SDR.'),
        ('Transmitter:', 'use an oscillator (e.g., MAX2606 VCO or a discrete Colpitts) '
                         'modulated by audio from your phone. Tune to an unused FM band '
                         '(88–108 MHz). Keep power under 100 μW to stay legal.'),
        ('Receiver:', 'RTL-SDR + GNU Radio. Build an FM demodulator: bandpass filter at '
                      'your transmit frequency → limit → frequency discriminator → '
                      'de-emphasis → audio sink.'),
        ('Tests:', '(1) Transmit a tone. Receive and confirm. (2) Transmit music. Listen. '
                   '(3) Measure SNR. (4) Walk away — measure range.'),
        ('Extension:', 'modulate with digital data (FSK). Send a UART byte stream. '
                       'Demodulate in GNU Radio. Compute BER.'),
        ('Note:', 'transmit power is regulated. In most countries, &lt; 100 μW on FM '
                  'is unlicensed. Above that you need a license. Check your local rules.'),
    ]))

    s.append(checkpoint_box([
        "Sketch the FM transmitter and SDR receiver block diagrams.",
        "How does the SDR demodulate FM? What is the role of the discriminator?",
        "What is the legal limit for unlicensed FM transmission in your country?",
        "How would you extend this to send digital data?",
    ]))

    s.append(PageBreak())
    return s

# ════════════════════════════════════════════════════════════════════════════
# PHASE 9 — VLSI & IC DESIGN
# ════════════════════════════════════════════════════════════════════════════
def build_phase9():
    s = []
    s.append(heading('Phase 9 — VLSI & IC Design', 0))
    s.append(p('<b>Duration:</b> 5 weeks · <b>Modules:</b> 8 · <b>Goal:</b> understand the '
               'CMOS transistor, layout, fabrication flow, and digital IC design — and '
               'prototype a pipelined adder on FPGA plus a custom inverter layout.', 'kicker'))

    s.append(p(
        "VLSI (Very Large Scale Integration) is the engineering of putting a billion "
        "transistors on a chip of silicon. As a CS engineer you have written software "
        "for these chips; this phase teaches you how the chips themselves are "
        "designed. The work splits into <b>front-end</b> (RTL design and verification — "
        "very close to CS) and <b>back-end</b> (synthesis, place-and-route, layout — "
        "more EE-specific). Both are essential to understanding why chips cost what "
        "they cost and why they fail when they fail."))

    # ── Module 9.1 ──
    s.append(heading('Module 9.1 — CMOS Inverter: Static and Dynamic Behavior', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "The CMOS inverter is the simplest logic gate and the foundation of all CMOS "
        "logic. It has one PMOS (pull-up) and one NMOS (pull-down). When input is low, "
        "PMOS conducts, NMOS is off, output is V_DD. When input is high, NMOS conducts, "
        "PMOS is off, output is 0. No DC current flows in either steady state — this is "
        "why CMOS dominates: static power is essentially zero."))

    s.append(heading('Voltage transfer characteristic (VTC)', 2))
    s.append(p(
        "The VTC plots V_out vs V_in. It has five regions: NMOS off, NMOS saturation / "
        "PMOS linear, both saturation, NMOS linear / PMOS saturation, PMOS off. The "
        "switching threshold V_M is where V_out = V_in; for symmetric transistors "
        "(β_N = β_P) it is at V_DD/2. Noise margin NM_H = V_OH − V_IH, NM_L = V_IL − V_OL. "
        "Larger noise margins = more robust logic."))

    s.append(heading('Dynamic behavior — propagation delay and power', 2))
    s.append(p(
        "Propagation delay t_p = (t_pHL + t_pLH)/2 ≈ (C_L·V_DD)/(2·I_on). For a 1 fF load "
        "and 100 μA on-current, t_p ≈ 5 ps. Real gates have C_L ~ 1–10 fF and "
        "t_p ~ 10–100 ps. Dynamic power: P = α·C·V²·f, where α is the activity factor "
        "(fraction of cycles that switch). At 1 GHz, 1 fF, 1 V, α=0.1: P = 0.1 μW per "
        "gate — a billion gates is 100 W. This is why modern CPUs spend so much effort "
        "on clock gating, voltage scaling, and dark silicon."))
    s.append(formula_box(
        "t<sub>p</sub> ≈ C<sub>L</sub>·V<sub>DD</sub> / (2·I<sub>on</sub>) &nbsp;&nbsp;|&nbsp;&nbsp; "
        "P<sub>dyn</sub> = α·C·V²·f &nbsp;&nbsp;|&nbsp;&nbsp; "
        "P<sub>static</sub> = V<sub>DD</sub>·I<sub>leak</sub>"))

    s.append(checkpoint_box([
        "Sketch a CMOS inverter. Which transistor is on for each input state?",
        "Define V_M, V_IL, V_IH, V_OL, V_OH. Compute noise margins.",
        "Compute the dynamic power of a 1 fF gate at 1 GHz, 1 V, α=0.2.",
        "Why does static power matter in modern CMOS? What is leakage?",
    ]))

    # ── Module 9.2 ──
    s.append(heading('Module 9.2 — CMOS Layout and Fabrication Flow', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Layout is the geometric description of every layer on the chip. Layers include "
        "n-well, p-substrate, polysilicon (gate), n+ and p+ diffusion (source/drain), "
        "contacts, metal1, via1, metal2, etc. Design rules (minimum width, spacing, "
        "enclosure) come from the foundry and ensure the chip can be manufactured. "
        "Magic VLSI is the open-source layout editor; commercial tools are Cadence "
        "Virtuoso and Synopsys Custom Compiler."))

    s.append(heading('The CMOS fabrication flow', 2))
    s.append(bullet_list([
        "<b>Substrate:</b> start with a silicon wafer (p-type for n-well process).",
        "<b>Wafer prep:</b> grow oxide, deposit nitride, apply photoresist.",
        "<b>Photolithography:</b> expose through a mask, develop. Pattern is now in resist.",
        "<b>Etch:</b> remove material where resist is open. Strip resist.",
        "<b>Implant:</b> ion implantation to dope the silicon (n+ or p+).",
        "<b>Deposition:</b> grow or deposit new layers (oxide, polysilicon, metal).",
        "<b>Planarization:</b> chemical-mechanical polishing (CMP) flattens the surface.",
        "<b>Metal stack:</b> repeat deposition/litho/etch for each metal layer (modern processes have 12–15 metals).",
        "<b>Passivation:</b> final oxide/nitride layer with openings for bond pads.",
    ]))

    s.append(p(
        "A modern 5 nm process has ~80 mask layers and 600–800 processing steps. The "
        "fab costs $15–20 billion to build. This is why only TSMC, Samsung, and Intel "
        "can build leading-edge chips — and why the geopolitical stakes around Taiwan "
        "(where TSMC is) are so high."))

    s.append(project_box('Magic VLSI: Layout an Inverter', [
        ('Goal:', 'draw the layout of a CMOS inverter and pass DRC.'),
        ('Tool:', 'Magic VLSI with a 0.5 μm SCMOS design rule set (free).'),
        ('Tasks:', 'draw the n-well, p-diffusion for PMOS, n-diffusion for NMOS, polysilicon '
                   'gate crossing both, contacts, metal1 routing. Connect V_DD, GND, '
                   'V_in, V_out.'),
        ('DRC:', 'run design rule check. Iterate until clean.',
                'Common errors: minimum width, spacing, enclosure violations.'),
        ('Extract:', 'extract a SPICE netlist from the layout. Simulate in LTspice or ngspice.',
                     'Verify the VTC matches a schematic-only version — proves the layout '
                     'is electrically correct.'),
    ]))

    s.append(checkpoint_box([
        "List the layers in a typical CMOS process (n-well through metal1).",
        "What is the difference between n+ and p+ diffusion?",
        "Why does the polysilicon gate need to overlap the diffusion?",
        "What is DRC? What is LVS? Why are both needed?",
    ]))

    # ── Module 9.3 ──
    s.append(heading('Module 9.3 — Combinational CMOS Design and Gate Sizing', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "CMOS logic is built from pull-up networks of PMOS and pull-down networks of "
        "NMOS. The networks are duals: series in one ↔ parallel in the other. A NAND "
        "gate has two PMOS in parallel (pull-up) and two NMOS in series (pull-down). "
        "A NOR has PMOS in series and NMOS in parallel. Complex gates (AOI, OAI) extend "
        "this to multi-level functions in one stage."))

    s.append(heading('Gate sizing and logical effort', 2))
    s.append(p(
        "Bigger transistors switch faster (more current) but have more input capacitance "
        "(slowing the previous gate). <b>Logical effort</b> (Sutherland-Sproull) is a "
        "method for sizing gates to minimize delay through a chain. Each gate type has "
        "a logical effort g (1 for inverter, 4/3 for NAND2, 5/3 for NOR2). The total "
        "delay through a chain is d = Σ(g_i·h_i + p_i), where h_i is the electrical "
        "effort (C_load/C_in) and p_i is the parasitic. Optimal sizing equalizes the "
        "stage effort g·h across all stages."))

    s.append(checkpoint_box([
        "Draw the schematic of a 3-input NAND gate. How many transistors?",
        "What is the duality between PMOS pull-up and NMOS pull-down networks?",
        "Define logical effort. What is g for an inverter? A NAND2?",
        "Size a chain of 4 inverters driving a 100 fF load with input capacitance 1 fF.",
    ]))

    # ── Module 9.4 ──
    s.append(heading('Module 9.4 — Sequential CMOS: Latches and Flip-Flops', 1))
    s.append(p('<b>Duration:</b> 4–6 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "A latch is transparent when its clock is high (or low). A flip-flop is "
        "edge-triggered — it samples the input only on the clock edge. The classic "
        "positive-edge D flip-flop is built from two latches in a master-slave "
        "configuration: the master is transparent during the low phase, the slave "
        "during the high phase, so the output changes only on the rising edge."))

    s.append(heading('Setup, hold, and clock-to-Q', 2))
    s.append(p(
        "Setup time t_su: the input must be stable for t_su before the clock edge. "
        "Hold time t_h: must remain stable for t_h after. Clock-to-Q t_cq: delay from "
        "clock edge to output update. The minimum clock period is "
        "T_clk ≥ t_cq + t_pd,logic + t_su — the sum of register delay, combinational "
        "delay, and setup. Hold is checked independently: t_cq + t_cd,logic ≥ t_h."))

    s.append(checkpoint_box([
        "Draw the master-slave D flip-flop. How many latches?",
        "Define t_su, t_h, t_cq. What is the minimum clock period?",
        "What is a scan flip-flop? Why is scan used in testing?",
        "Why is clock skew a problem for hold-time checks?",
    ]))

    # ── Module 9.5 ──
    s.append(heading('Module 9.5 — Static Timing Analysis', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(cs_bridge(
        "<b>STA ↔ longest-path in a DAG.</b> Setup analysis finds the longest path "
        "(critical path) from any launch flop to any capture flop. Hold analysis finds "
        "the shortest path. Both are graph problems on the same DAG (nodes = gates, "
        "edges = wires). STA tools (PrimeTime, Tempus) do these graph traversals with "
        "delay models that account for wire capacitance, input slew, and coupling."))

    s.append(p(
        "STA is exhaustive — it checks every path in the design, not just the ones you "
        "thought to simulate. It is the standard sign-off for digital tape-out. Setup "
        "slack = T_clk − (t_cq + t_pd,logic + t_su) — must be ≥ 0. Hold slack = "
        "(t_cq + t_cd,logic) − t_h − clock_skew — must be ≥ 0. Negative slack = the "
        "design will not work at the target frequency."))

    s.append(heading('Timing corners', 2))
    s.append(p(
        "Process, voltage, and temperature (PVT) vary. Each combination is a ‘corner’. "
        "Standard corners: SS (slow-slow) at 0.9 V, 125°C — worst setup. FF (fast-fast) "
        "at 1.1 V, −40°C — worst hold. STA must sign off at all corners — a chip that "
        "works at one corner can fail at another."))

    s.append(project_box('Vivado: STA on a Pipelined Multiplier', [
        ('Goal:', 'see STA in action on a small design.'),
        ('Tasks:', 'implement a 16×16 pipelined multiplier in Verilog. Synthesize for '
                   'Artix-7. Open the timing report.'),
        ('Find:', 'the critical path. What is the maximum clock frequency? Which '
                  'resources (DSP, LUT, carry chain) does the path use?'),
        ('Fix:', 'if the critical path is too long, add pipeline registers. Re-run STA. '
                'Confirm Fmax improves.'),
        ('Verify:', 'check hold time at all corners (SS, TT, FF). Fix any violations.'),
    ]))

    s.append(checkpoint_box([
        "Define setup and hold slack. What does negative slack mean?",
        "Why must STA check multiple PVT corners?",
        "What is the difference between setup and hold analysis?",
        "How does pipelining improve Fmax?",
    ]))

    # ── Module 9.6 ──
    s.append(heading('Module 9.6 — Low-Power Design', 1))
    s.append(p('<b>Duration:</b> 4–6 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(p(
        "Power dissipation has three components: dynamic (switching), short-circuit "
        "(during the brief overlap of pull-up and pull-down), and leakage (subthreshold "
        "and gate). At advanced nodes (28 nm and below), leakage becomes dominant. "
        "Low-power techniques: <b>clock gating</b> (disable clock to idle blocks — "
        "cuts dynamic power 30–60%), <b>power gating</b> (cut V_DD to idle blocks — "
        "cuts leakage 90%+), <b>voltage scaling</b> (DVFS — run slower at lower V), "
        "<b>substrate biasing</b> (reverse body bias increases V_th, cuts leakage)."))

    s.append(checkpoint_box([
        "Name the three components of CMOS power dissipation.",
        "How does clock gating save power? Power gating?",
        "What is DVFS? What is the trade-off?",
        "Why is leakage a problem at advanced nodes but not at older ones?",
    ]))

    # ── Module 9.7 ──
    s.append(heading('Module 9.7 — ASIC vs FPGA Design Flow', 1))
    s.append(p('<b>Duration:</b> 4–6 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(make_table([
        ['Stage','ASIC','FPGA'],
        ['Design entry','Verilog/VHDL','Verilog/VHDL'],
        ['Functional sim','iverilog/VCS','iverilog/Vivado sim'],
        ['Synthesis','DC Ultra / Genus','Vivado synthesis'],
        ['Place & route','Innovus / ICC2','Vivado implementation'],
        ['Timing sign-off','PrimeTime / Tempus','Vivado STA'],
        ['Physical sign-off','DRC, LVS, ERC, antenna','Bitstream generation'],
        ['Manufacturing','Tape-out to fab (8–24 weeks)','Download bitstream (instant)'],
        ['Unit cost (high vol)','Low','High'],
        ['NRE','$1M–$50M+','Free (tool license)'],
        ['Performance','Best','~50–70% of ASIC'],
        ['Power','Best','2–5× ASIC'],
    ], col_widths=[35*mm, 65*mm, 70*mm]))

    s.append(p(
        "Rule of thumb: prototype on FPGA, ship in ASIC. For volumes below 100k units, "
        "FPGA wins. Above 1M units, ASIC wins. In between is a judgment call based on "
        "performance, power, and time-to-market."))

    s.append(checkpoint_box([
        "List the stages of an ASIC flow. How does it differ from FPGA?",
        "When does ASIC beat FPGA on cost? On performance?",
        "What is NRE? Why does it dominate ASIC economics?",
        "What is tape-out? Why does it take 8–24 weeks?",
    ]))

    # ── Module 9.8 ──
    s.append(heading('Module 9.8 — Phase 9 Capstone: Pipelined Adder + Custom Inverter', 1))
    s.append(p('<b>Duration:</b> 12–16 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(project_box('Phase 9 Capstone: FPGA Pipelined Adder + Magic Inverter', [
        ('Part A — FPGA:', 'implement a 32-bit carry-lookahead adder in Verilog. Pipeline '
                           'to 4 stages. Synthesize to Artix-7. STA: target 200 MHz Fmax. '
                           'Onboard: drive from a slide switch + counter, display result '
                           'on 7-seg. Verify functional + timing.'),
        ('Part B — Magic:', 'layout a 2-input NAND gate in Magic. DRC clean. Extract to '
                            'SPICE. Simulate the VTC and propagation delay. Compare to '
                            'schematic-only simulation. Document layout area (in λ²).'),
        ('Document:', 'schematic, layout, simulation waveforms, STA report, synthesis '
                      'resource usage, photos/video of the FPGA running.'),
    ]))

    s.append(checkpoint_box([
        "What was your Fmax? Which path was critical? How did pipelining help?",
        "What was your NAND layout area? What is the unit (λ²)?",
        "Did the extracted simulation match the schematic simulation? Any discrepancies?",
        "What would you do differently if you were targeting an ASIC tape-out?",
    ]))

    s.append(PageBreak())
    return s

# ════════════════════════════════════════════════════════════════════════════
# PHASE 10 — POWER SYSTEMS, ENERGY & CAPSTONES
# ════════════════════════════════════════════════════════════════════════════
def build_phase10():
    s = []
    s.append(heading('Phase 10 — Power Systems, Energy & Capstones', 0))
    s.append(p('<b>Duration:</b> 8 weeks · <b>Modules:</b> 10 + 6 capstones · <b>Goal:</b> '
               'understand the grid end-to-end and ship one of six capstone projects.', 'kicker'))

    s.append(p(
        "Phase 10 has two halves. The first half (modules 10.1–10.9) covers the bulk "
        "power system: generation, transmission, distribution, protection, stability, "
        "smart grids, storage, renewables, EV charging. The second half is six capstone "
        "projects — pick one or two, budget 4–6 weeks each, and ship a working hardware "
        "demo. By the time you finish, you will have a portfolio that demonstrates "
        "end-to-end EE fluency."))

    # ── Module 10.1 ──
    s.append(heading('Module 10.1 — Power Generation', 1))
    s.append(p('<b>Duration:</b> 4–6 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Generation technologies convert primary energy (chemical, nuclear, solar, "
        "kinetic) to electrical energy. Thermal plants (coal, gas, nuclear) boil water "
        "to drive a steam turbine connected to a synchronous generator. Hydro plants "
        "use falling water. Gas turbines use combustion gases directly. Wind turbines "
        "use aerodynamic lift. Solar PV uses the photovoltaic effect. Each has different "
        "economics, dispatchability, and environmental impact."))

    s.append(make_table([
        ['Source','Capacity factor','Capital $/W','Marginal $/MWh','CO₂'],
        ['Coal','50–60%','$2–3','$20–40','High'],
        ['Gas CCGT','50%','$1','$30–50','Medium'],
        ['Nuclear','90%','$6–9','$10','Zero'],
        ['Hydro','30–50%','$2','$0','Zero'],
        ['Wind (onshore)','35%','$1.5','$0','Zero'],
        ['Solar PV','20%','$1','$0','Zero'],
        ['Battery storage','—','$1.5/Wh','—','Zero'],
    ], col_widths=[30*mm, 30*mm, 30*mm, 35*mm, 25*mm]))

    s.append(checkpoint_box([
        "Define capacity factor. Why is nuclear’s so high?",
        "Why are solar and wind called ‘intermittent’?",
        "What is dispatchability? Which sources are dispatchable?",
        "Compute the LCOE (levelized cost of energy) for a 1 MW solar farm.",
    ]))

    # ── Module 10.2 ──
    s.append(heading('Module 10.2 — Transmission and Distribution', 1))
    s.append(p('<b>Duration:</b> 4–6 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "The grid moves power from generators to loads via a hierarchy of voltage "
        "levels. Transmission (200–1000 kV) moves bulk power long distances with low "
        "loss (I²R loss is minimized at high V). Subtransmission (50–100 kV) feeds "
        "substations. Primary distribution (10–30 kV) feeds neighborhoods. Secondary "
        "distribution (120/240 V or 230/400 V) feeds homes. Each transition is a "
        "transformer substation."))

    s.append(heading('Why high voltage for transmission?', 2))
    s.append(p(
        "Power loss in a line: P_loss = I²·R. For a fixed power P = V·I, current scales "
        "as 1/V. So P_loss scales as 1/V². Doubling the voltage reduces losses by 4×. "
        "This is why long-distance transmission is at 200–1000 kV. The trade-off: "
        "higher voltage requires bigger insulators, larger towers, more clearance, "
        "and expensive transformers at each end."))

    s.append(heading('HVDC — for very long distances', 2))
    s.append(p(
        "Above ~600 km, HVDC (high-voltage DC) beats AC: no skin effect, no reactive "
        "loss, no stability limit. But HVDC requires expensive converter stations at "
        "each end (LCC or VSC). Offshore wind farms and underwater interconnects use "
        "HVDC. The longest HVDC link in operation is in China at 3000+ km, 1.1 MV."))

    s.append(checkpoint_box([
        "Why is bulk power transmitted at high voltage?",
        "Compute the loss reduction when going from 200 kV to 500 kV for the same power.",
        "When does HVDC beat AC? Why?",
        "What are the voltage levels in a typical grid from generator to home?",
    ]))

    # ── Module 10.3 ──
    s.append(heading('Module 10.3 — Power System Protection', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Faults (short circuits) happen. The protection system detects them and "
        "isolates the faulted section before it damages equipment or starts a fire. "
        "Three components: instrument transformers (CT and VT) step down current and "
        "voltage for measurement; protective relays (numerical, microprocessor-based) "
        "decide whether to trip; circuit breakers interrupt the fault current."))

    s.append(heading('Protection principles', 2))
    s.append(bullet_list([
        "<b>Selectivity:</b> only the breaker closest to the fault should trip. Adjacent breakers are backups.",
        "<b>Speed:</b> faults must be cleared in 3–5 cycles (60–100 ms) to limit damage.",
        "<b>Reliability:</b> protection must operate when needed, and not operate when not needed.",
        "<b>Sensitivity:</b> detect faults even at low fault current (high-impedance faults).",
    ]))

    s.append(heading('Common protection schemes', 2))
    s.append(bullet_list([
        "<b>Overcurrent (50/51):</b> trip if current exceeds threshold. Simple, used on radial feeders.",
        "<b>Differential (87):</b> trip if current in ≠ current out. Used on transformers, generators, buses.",
        "<b>Distance (21):</b> trip if apparent impedance (V/I) is below threshold — fault is within a distance. Used on transmission lines.",
        "<b>Under/over-frequency (81):</b> trip on frequency excursions. Used for load shedding.",
    ]))

    s.append(checkpoint_box([
        "What is the difference between a CT and a VT? What do they do?",
        "What is selectivity? Why is it important?",
        "How does differential protection work? Where is it used?",
        "Why must faults be cleared in 3–5 cycles?",
    ]))

    # ── Module 10.4 ──
    s.append(heading('Module 10.4 — Power Quality and Grid Stability', 1))
    s.append(p('<b>Duration:</b> 4–6 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Power quality is the set of deviations from ideal 50/60 Hz, nominal voltage, "
        "pure sine wave. Problems: voltage sags and swells, harmonics, flicker, "
        "transients, frequency deviations. Sources: large motor starts (sags), "
        "nonlinear loads like rectifiers (harmonics), arc furnaces (flicker), "
        "lightning (transients), sudden load/generation imbalance (frequency deviations)."))

    s.append(heading('Grid stability — three timescales', 2))
    s.append(bullet_list([
        "<b>Rotor angle stability (seconds):</b> generators must stay in synchronism after a disturbance. Loss of synchronism = blackout.",
        "<b>Frequency stability (seconds to minutes):</b> load and generation must balance. Imbalance causes frequency drift. Primary control (governor), secondary (AGC), tertiary (dispatch).",
        "<b>Voltage stability (minutes):</b> reactive power balance. Insufficient reactive power → voltage collapse.",
    ]))

    s.append(checkpoint_box([
        "Name three power-quality problems and their sources.",
        "What causes grid frequency to drift? How is it corrected?",
        "What is reactive power and why does voltage stability depend on it?",
        "What is a blackout cascade? How does protection try to prevent it?",
    ]))

    # ── Module 10.5 ──
    s.append(heading('Module 10.5 — Smart Grid, Microgrids, DER Integration', 1))
    s.append(p('<b>Duration:</b> 4–6 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "A smart grid adds bidirectional communication, distributed sensing, and "
        "automated control to the traditional grid. Benefits: faster fault location, "
        "demand response, integration of distributed energy resources (DERs — rooftop "
        "solar, batteries, EVs), and better asset utilization. A microgrid is a "
        "local grid that can connect to the main grid or island itself — used for "
        "hospitals, military bases, and campuses."))

    s.append(heading('DER integration challenges', 2))
    s.append(bullet_list([
        "<b>Variability:</b> solar output drops when a cloud passes. Need fast-ramping backup or storage.",
        "<b>Voltage regulation:</b> distributed PV can raise local voltage above limits.",
        "<b>Protection:</b> bidirectional fault currents break traditional radial protection schemes.",
        "<b>Inverter coordination:</b> thousands of inverters must ride through faults and not all disconnect at once.",
    ]))

    s.append(checkpoint_box([
        "What is a smart grid? Name three benefits.",
        "What is a microgrid? What is islanding?",
        "What are the challenges of integrating high-penetration solar?",
        "What is demand response? Give an example.",
    ]))

    # ── Module 10.6 ──
    s.append(heading('Module 10.6 — Energy Storage and Battery Management', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Storage is the missing piece of the renewable energy puzzle. Lithium-ion "
        "dominates for &lt; 4-hour storage; pumped hydro for daily/weekly; flow "
        "batteries and compressed air for utility-scale long-duration. A BMS (battery "
        "management system) is required for any lithium-ion pack — it monitors cell "
        "voltages, temperature, and current; balances cells; and protects against "
        "over-charge, over-discharge, and over-temperature."))

    s.append(heading('SOC and SOH estimation', 2))
    s.append(p(
        "State of charge (SOC) is the remaining capacity as a percentage. Coulomb "
        "counting (integrating current) is simple but drifts. Model-based methods "
        "(extended Kalman filter on an equivalent-circuit battery model) are accurate "
        "but computationally heavy. State of health (SOH) tracks capacity fade and "
        "internal resistance growth over the battery’s life."))

    s.append(checkpoint_box([
        "Name three storage technologies and their best use case.",
        "What does a BMS do? Why is it mandatory for lithium-ion?",
        "What is SOC? What methods are used to estimate it?",
        "What is SOH? How is it different from SOC?",
    ]))

    # ── Module 10.7 ──
    s.append(heading('Module 10.7 — Solar PV Systems and MPPT', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "A solar cell is a diode illuminated by light. Photons create electron-hole "
        "pairs; the diode’s built-in field separates them, producing current. The "
        "I-V curve has a knee at the maximum power point (MPP). The MPP voltage "
        "depends on irradiance and temperature — it moves continuously as the sun and "
        "weather change. <b>MPPT</b> (maximum power point tracking) is the algorithm "
        "that adjusts the converter duty cycle to keep the panel at its MPP."))

    s.append(cs_bridge(
        "<b>MPPT ↔ hill climbing.</b> The most common MPPT algorithm, perturb & observe "
        "(P&O), is literally hill climbing on the P-V curve. Perturb the voltage, "
        "observe the power: if power increased, keep perturbing in the same direction; "
        "if it decreased, reverse. Other algorithms: incremental conductance (gradient "
        "sign of dP/dV), fractional open-circuit (heuristic), and model-based. All are "
        "optimization at heart — same math you used for gradient descent."))

    s.append(heading('PV system topologies', 2))
    s.append(bullet_list([
        "<b>String inverter:</b> one inverter for a string of 10–20 panels in series. Cheap, single point of failure.",
        "<b>Microinverter:</b> one inverter per panel. More expensive, no single point of failure, panel-level MPPT.",
        "<b>Power optimizer + string inverter:</b> DC-DC per panel for MPPT, central inverter for grid tie.",
        "<b>Off-grid:</b> charge controller + battery + inverter. No grid; for remote sites.",
    ]))

    s.append(project_box('Python: Simulate a PV Panel + MPPT', [
        ('Goal:', 'simulate a 250 W panel and run P&O MPPT.'),
        ('Model:', 'single-diode model with V_oc = 38 V, I_sc = 9 A, V_mpp = 31 V, I_mpp = 8 A.'),
        ('Irradiance profile:', 'simulate a cloudy day with rapid changes.'),
        ('MPPT:', 'P&O with 0.5 V step, 100 ms update. Track the MPP.'),
        ('Compare:', 'compute energy harvested with and without MPPT. The MPP tracker should '
                     'deliver 25–35% more energy than a fixed-voltage operation.'),
    ]))

    s.append(checkpoint_box([
        "Sketch the I-V and P-V curves of a solar cell. Mark V_oc, I_sc, V_mpp, P_max.",
        "Explain perturb & observe MPPT. What are its limitations?",
        "Compare string, microinverter, and optimizer PV topologies.",
        "Why does shading one panel in a string hurt the whole string?",
    ]))

    # ── Module 10.8 ──
    s.append(heading('Module 10.8 — Wind Energy Systems', 1))
    s.append(p('<b>Duration:</b> 3–5 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "A wind turbine extracts kinetic energy from moving air. Power = ½·ρ·A·v³·C_p, "
        "where ρ is air density, A is swept area, v is wind speed, and C_p is the power "
        "coefficient (Betz limit: 0.593). Modern turbines operate at C_p ≈ 0.45. The "
        "v³ dependence means wind power is extremely sensitive to wind speed — a 10% "
        "speed increase gives 33% more power."))

    s.append(heading('Three wind turbine types', 2))
    s.append(bullet_list([
        "<b>Fixed-speed induction:</b> simple, robust, but poor energy capture and no reactive control. Legacy.",
        "<b>Variable-speed DFIG:</b> doubly-fed induction generator with a partial-power converter on the rotor. ~30% of turbines.",
        "<b>Variable-speed PMSG with full converter:</b> permanent-magnet generator with full-rated converter. Best energy capture, full reactive control. ~70% of new turbines.",
    ]))

    s.append(checkpoint_box([
        "Compute the power in a 50 m diameter stream of air at 8 m/s with C_p = 0.45.",
        "What is the Betz limit? Why can’t a turbine extract more?",
        "Why are modern turbines variable-speed?",
        "What is a DFIG? How does it differ from a PMSG?",
    ]))

    # ── Module 10.9 ──
    s.append(heading('Module 10.9 — EV Charging Infrastructure', 1))
    s.append(p('<b>Duration:</b> 3–5 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "EV charging has three levels: Level 1 (120/230 V AC, ~1.4 kW — overnight home "
        "charging), Level 2 (240/400 V AC, 7–22 kW — home and workplace fast charging), "
        "DC fast charging (50–350 kW DC, 80% charge in 20–40 minutes). The onboard "
        "charger handles AC levels (rectifies and charges the battery); DC fast "
        "chargers bypass the onboard charger and feed the battery directly."))

    s.append(heading('Charging standards', 2))
    s.append(bullet_list([
        "<b>SAE J1772:</b> Level 1/2 connector. Common in US/EU for AC charging.",
        "<b>CCS (Combined Charging System):</b> J1772 + two DC pins. Standard for fast charging in EU/US.",
        "<b>CHAdeMO:</b> Japanese DC fast charging standard. Being phased out.",
        "<b>Tesla/NACS:</b> Tesla’s connector, now becoming the US standard (SAE J3400).",
        "<b>MCS (Megawatt Charging System):</b> for trucks and buses, up to 3.75 MW.",
        "<b>GB/T:</b> Chinese standard, AC and DC.",
    ]))

    s.append(heading('Grid impact of fast charging', 2))
    s.append(p(
        "A 350 kW fast charger pulls as much power as a small neighborhood. A station "
        "with 10 of them is 3.5 MW — comparable to a small industrial plant. Local "
        "grid upgrades, on-site battery buffers (to smooth demand peaks), and PV "
        "canopies all play a role. Vehicle-to-grid (V2G) — using EV batteries as grid "
        "storage — is an emerging opportunity."))

    s.append(checkpoint_box([
        "What are the three EV charging levels? What is the typical power and use case?",
        "Compare CCS, NACS, and CHAdeMO.",
        "Compute the time to charge a 75 kWh EV at 7 kW (Level 2). At 350 kW (DCFC).",
        "What is V2G? What is the value to the grid?",
    ]))

    # ── Module 10.10 — The Six Capstones ──
    s.append(heading('Module 10.10 — The Six Capstones', 1))
    s.append(p('<b>Duration:</b> 4–6 weeks each (pick one or two)', 'kicker'))

    s.append(p(
        "Pick one or two of the six capstones below. Budget 4–6 weeks per capstone. "
        "Each integrates material from multiple phases and produces a working hardware "
        "demo. Document the design, build, test, and lessons learned. By the end you "
        "will have a portfolio piece that proves you can ship a real EE project."))

    capstones = [
        ('Capstone 1: FOC Motor Controller', [
            ('Build on Phase 7 Module 10.', 'extend to a full closed-loop motor controller with position, speed, and current loops.'),
            ('Hardware:', 'STM32G4 + 3-phase inverter + 5010 BLDC + AS5048 encoder + 12 V supply.'),
            ('Software:', 'STM32 MCSDK FOC framework. Tune current loop (16 kHz), speed loop (1 kHz), position loop (100 Hz).'),
            ('Features:', '4-quadrant operation, sensorless startup, field weakening, regen braking, CAN bus interface.'),
            ('Tests:', 'step response, disturbance rejection, max speed, max torque, efficiency map.'),
            ('Deliverable:', 'PCB, firmware, tuning log, demo video, design doc.'),
        ]),
        ('Capstone 2: Solar MPPT Inverter', [
            ('Goal:', 'build a 100 W off-grid solar inverter with MPPT.'),
            ('Hardware:', '50 W solar panel, MPPT boost converter (12 V → 24 V), battery, '
                          'DC-AC inverter (modified sine or pure sine), ESP32 for control.'),
            ('MPPT:', 'P&O algorithm in ESP32. Track MPP under varying irradiance.'),
            ('Inverter:', 'SPWM H-bridge with LC filter. 230 V / 50 Hz output.'),
            ('Protection:', 'over-current, over-voltage, under-voltage, over-temperature.'),
            ('Tests:', 'MPPT efficiency vs irradiance, inverter THD, battery charge profile, '
                       'run-time with typical load (LED lamp + phone charger).'),
            ('Deliverable:', 'schematic, PCB, firmware, test report, demo video.'),
        ]),
        ('Capstone 3: Custom PCB Product', [
            ('Goal:', 'take a product from concept to PCB manufacture and assembly.'),
            ('Product:', 'pick a small, useful device — examples: USB-C PD trigger board, '
                          'ESP32 sensor board with battery + solar input, LED driver, '
                          'logic analyzer, signal generator.'),
            ('Flow:', 'spec → schematic (KiCad) → BOM → PCB layout → DRC → order from '
                      'JLCPCB ($10 for 5 boards) → order parts from DigiKey → assemble '
                      '→ test → firmware → enclosure (3D print).'),
            ('Documentation:', 'full design rationale, schematic, layout, BOM with part numbers, '
                               'assembly photos, test results, firmware, enclosure design.'),
            ('Deliverable:', '5 working boards, one in enclosure, ready to use.'),
        ]),
        ('Capstone 4: Robotics Platform', [
            ('Goal:', 'build a differential-drive robot with closed-loop control and SLAM-lite.'),
            ('Hardware:', 'Raspberry Pi 4 (or ESP32-S3) + STM32 motor driver + 2 DC motors with '
                          'encoders + IMU (MPU6050) + RPLIDAR A1 (or webcam for visual odometry).'),
            ('Software:', 'ROS 2. Differential-drive kinematics. PID speed control on STM32. '
                          'IMU + encoder fusion for odometry. occupancy grid mapping (Gmapping '
                          'or Cartographer). Autonomous navigation (Nav2).'),
            ('Tests:', 'closed-loop step response, odometry accuracy over 10 m, mapping of '
                       'a room, autonomous navigation between waypoints.'),
            ('Deliverable:', 'robot, firmware, ROS workspace, maps, navigation demo video.'),
        ]),
        ('Capstone 5: Smart Grid Demo', [
            ('Goal:', 'build a tabletop microgrid with PV + battery + load + IoT telemetry.'),
            ('Components:', 'small PV panel, MPPT charge controller, Li-ion pack with BMS, '
                            'AC load (LED lamp + fan), inverter, ESP32 for telemetry, '
                            'Raspberry Pi running Mosquitto + InfluxDB + Grafana.'),
            ('Features:', 'real-time power flow monitoring, automatic load shedding on low '
                          'battery, grid/island switching, remote control via MQTT.'),
            ('Tests:', 'charge profile from PV, discharge profile under load, autonomy time, '
                       'load shedding behavior, dashboard responsiveness.'),
            ('Deliverable:', 'working microgrid, dashboard screenshots, test report, video.'),
        ]),
        ('Capstone 6: SDR / RF Receiver', [
            ('Goal:', 'build a software-defined radio receiver front-end.'),
            ('Hardware:', 'antenna (dipole or patch for chosen band), LNA (e.g., SPF5189), '
                          'RTL-SDR or AD9361, Raspberry Pi for processing.'),
            ('Software:', 'GNU Radio flowgraph: source → band-pass filter → AGC → '
                          'demodulator (FM/AM/FSK) → audio sink or data sink.'),
            ('Project:', 'receive and decode (a) FM broadcast, (b) ADS-B aircraft transponders '
                         '(1090 MHz), (c) NOAA weather satellite images (137 MHz), '
                         '(d) AIS ship tracking (162 MHz). Pick one or more.'),
            ('Tests:', 'sensitivity measurement, selectivity, dynamic range, decoding '
                       'success rate.'),
            ('Deliverable:', 'working receiver, decoded data (audio, image, or position '
                              'feed), design doc, video.'),
        ]),
    ]
    for title, items in capstones:
        s.append(project_box(title, items))
        s.append(Spacer(1, 4))

    s.append(heading('Closing the Curriculum', 2))
    s.append(p(
        "If you have worked through all ten phases, including at least one capstone, "
        "you have done what a four-year EE degree does — minus the general-education "
        "requirements and the electives, plus a level of practical, project-based "
        "fluency that most graduates lack. You can read a datasheet, design a circuit, "
        "lay out a PCB, program an MCU, debug a control loop, simulate a converter, "
        "and ship a hardware product. The next step is to keep building — pick a "
        "domain that interested you most (motors, RF, power, VLSI, control) and go "
        "deeper. The curriculum is the foundation; the work that follows is the "
        "career."))

    s.append(PageBreak())
    return s

# ════════════════════════════════════════════════════════════════════════════
# APPENDICES
# ════════════════════════════════════════════════════════════════════════════
def build_appendices():
    s = []
    s.append(heading('Appendix A — Toolchain Setup Guide', 0))
    s.append(p('Detailed installation and hello-world instructions for every tool used in '
               'the curriculum. Commands shown for Linux/macOS; Windows users should use '
               'WSL2 where possible.'))

    s.append(heading('A.1 LTspice', 1))
    s.append(p('<b>Install:</b> download from analog.com (free, Windows native; macOS via '
               'Wine or run in a Windows VM). <b>Hello world:</b> draw a 1 kΩ resistor '
               'in series with a 1 μF cap from a 5 V step source. Transient sim 0–10 ms '
               'with 1 μs step. Verify the cap voltage rises with τ = 1 ms.'))

    s.append(heading('A.2 KiCad 8', 1))
    s.append(p('<b>Install:</b> kicad.org downloads for Windows/macOS/Linux. <b>Hello world:</b> '
               'schematic editor → place a resistor and cap → wire them in series → annotate → '
               'run ERC (electrical rules check) → open PCB editor → import netlist → place '
               'footprints → route → run DRC.'))

    s.append(heading('A.3 Arduino IDE', 1))
    s.append(p('<b>Install:</b> arduino.cc. <b>Hello world:</b> File → Examples → 01.Basics → '
               'Blink. Upload to Arduino Uno. LED blinks at 1 Hz.'))

    s.append(heading('A.4 ESP32 (PlatformIO)', 1))
    s.append(p('<b>Install:</b> VS Code + PlatformIO extension. <b>Hello world:</b> new project '
               'with ESP32 DevKitC board. Sketch: WiFi.begin(ssid, password); loop: print '
               'WiFi.localIP(). Open serial monitor at 115200 baud.'))

    s.append(heading('A.5 STM32CubeIDE', 1))
    s.append(p('<b>Install:</b> st.com (free, Eclipse-based). <b>Hello world:</b> new project '
               'with Nucleo-F446RE. In .ioc: enable GPIOA pin 5 as output (LD2). Generate '
               'code. In main loop: HAL_GPIO_TogglePin(GPIOA, GPIO_PIN_5); HAL_Delay(500). '
               'Build, flash, LED blinks at 1 Hz.'))

    s.append(heading('A.6 Python (NumPy/SciPy/matplotlib/control)', 1))
    s.append(p('<b>Install:</b> python.org then <i>pip install numpy scipy matplotlib control '
               'jupyter sounddevice</i>. <b>Hello world:</b> '
               '<i>import numpy as np, matplotlib.pyplot as plt; t = np.linspace(0, 1, 1000); '
               'plt.plot(t, np.sin(2*np.pi*5*t)); plt.show()</i>'))

    s.append(heading('A.7 Octave', 1))
    s.append(p('<b>Install:</b> gnu.org/software/octave. <b>Hello world:</b> '
               '<i>A = [2 1; 1 3]; b = [1; 2]; x = A \\ b; disp(x)</i>'))

    s.append(heading('A.8 Vivado WebPACK', 1))
    s.append(p('<b>Install:</b> amd.com (Xilinx) — Vivado WebPACK is free, supports Artix-7. '
               '<b>Hello world:</b> new project → Verilog counter (Module 4.4) → '
               'synthesize → run implementation → generate bitstream → program the FPGA.'))

    s.append(heading('A.9 Magic VLSI', 1))
    s.append(p('<b>Install:</b> ubuntu: <i>sudo apt install magic</i>. <b>Hello world:</b> '
               'open Magic, draw a single PMOS, run DRC, fix any errors. See Module 9.2.'))

    s.append(heading('A.10 GNU Radio', 1))
    s.append(p('<b>Install:</b> gnuradio.org — prebuilt binaries for Windows/macOS; '
               '<i>apt install gnuradio</i> on Ubuntu. <b>Hello world:</b> GNU Radio '
               'Companion → source (null source) → low-pass filter → QT GUI sink. Run. '
               'See the spectrum display.'))

    s.append(PageBreak())

    # ─── Appendix B ────────────────────────────────────────────────────────
    s.append(heading('Appendix B — Hardware Bill of Materials', 0))
    s.append(p('Two tiers: Starter (~$150) covers Phases 0–3. Full (~$600) adds what you '
               'need for Phases 4–10 and the capstones.'))

    s.append(heading('B.1 Starter Kit (~$150)', 1))
    s.append(make_table([
        ['Item','Qty','Est $','Notes'],
        ['Breadboard (830-point)', '1', '8','Full-size, jumper-wire friendly'],
        ['DMM (digital multimeter)', '1', '25','Any cheap DMM with V/A/Ω/continuity'],
        ['Bench PSU (0–30 V, 0–3 A)', '1', '40','Or repurpose an old ATX PSU'],
        ['Resistor kit (1/4 W, 30 values)', '1', '15','10 Ω to 1 MΩ, 20 each'],
        ['Capacitor kit (ceramic + electrolytic)', '1', '15','10 pF to 1000 μF'],
        ['Inductor kit', '1', '10','1 μH to 1 mH'],
        ['Diode kit (1N4148, 1N4007, 1N5819, Zeners)', '1 set', '8','All common types'],
        ['Transistor kit (2N3904/3906, 2N7000, IRFZ44N)', '1 set', '8','BJT NPN/PNP + MOSFETs'],
        ['Op-amp kit (LM358, TL072, NE5532, LM741)', '5 ea', '6','DIP-8 packages'],
        ['555 timer', '5', '3','NE555 or LM555'],
        ['Regulators (7805, 7812, LM317)', '5 ea', '5','TO-220'],
        ['LEDs (assorted colors)', '20', '3','With 330 Ω resistors'],
        ['Jumper wires (M-M, M-F, F-F)', '1 set', '6','Dupont style'],
        ['Arduino Uno (or clone)', '1', '15','Genuine or clone'],
    ], col_widths=[70*mm, 18*mm, 18*mm, 64*mm]))

    s.append(heading('B.2 Full Kit (~$600)', 1))
    s.append(make_table([
        ['Item','Qty','Est $','Notes'],
        ['Oscilloscope (2-channel, 100 MHz)', '1', '200','Rigol DS1102Z or Siglent SDS804X'],
        ['Logic analyzer (8-channel)', '1', '15','Saleae clone or Sysclk'],
        ['ESP32 devkit', '2', '10','ESP32-DevKitC or NodeMCU-32S'],
        ['STM32 Nucleo-F446RE', '1', '25','Or Nucleo-G431 for motor control'],
        ['B-G431B-ESC1 (motor control kit)', '1', '40','For Phase 7 + Capstone 1'],
        ['BLDC motor (2204 drone) + prop', '1', '15','With AS5048 encoder for FOC'],
        ['L298N motor driver', '1', '5','Or BTS7960 for higher current'],
        ['Small DC motor with encoder', '2', '20','For Phase 6 robotics'],
        ['FPGA board (Nexys A7 or Basys 3)', '1', '150','For Phase 4 + 9'],
        ['RTL-SDR + antenna kit', '1', '40','For Phase 8 + Capstone 6'],
        ['Sensors (BME280, MPU6050, GPS, etc.)', '1 set', '30','I2C and SPI breakouts'],
        ['Li-ion cells + holder', '4', '15','18650 cells with BMS for robotics'],
        ['Bench load (DC electronic load)', '1', '60','For power converter testing'],
        ['Soldering iron + solder + flux', '1 set', '40','Hakko FX-888D or similar'],
    ], col_widths=[70*mm, 18*mm, 18*mm, 64*mm]))

    s.append(p('Sourcing tips: DigiKey and Mouser for US/EU; LCSC for Asia (cheap, fast '
               'shipping, no minimum); AliExpress for generic modules (slower but cheapest); '
               'Amazon for last-minute. For PCB manufacture: JLCPCB (~$10 for 5 boards, '
               '3–7 day turnaround), PCBWay, Elecrow.', 'caption'))

    s.append(PageBreak())

    # ─── Appendix C ────────────────────────────────────────────────────────
    s.append(heading('Appendix C — CS-to-EE Concept Map', 0))
    s.append(p('The full mapping from CS to EE, for reference. Each row is a bridge you '
               'can walk across to learn the EE concept faster.'))

    s.append(make_table([
        ['CS concept','EE concept','Connection'],
        ['FSM','Sequential circuit','Same graph structure, same state-register pattern.'],
        ['Recurrence','LTI difference equation','y[n] = a·y[n−1] + b·u[n] is a first-order IIR filter.'],
        ['Markov chain','Discrete-time LTI system','State transition matrix A; steady-state = eigenvector of eigenvalue 1.'],
        ['Convolution (image filter)','Convolution (LTI system)','y[n] = Σ h[k]·x[n−k]. Identical code.'],
        ['DCT (JPEG)','DFT / FFT','Both are fast orthogonal transforms over sinusoid bases.'],
        ['DAG / topo sort','Signal-flow graph / Mason’s rule','SFG analysis is a topological traversal.'],
        ['Graph Laplacian','Circuit incidence matrix','Same connectivity encoding. MNA uses it.'],
        ['Hash function','Modulation / encoding','Both map data to a signal space robustly.'],
        ['ECC (Hamming, LDPC)','Channel coding','Same linear algebra over GF(2).'],
        ['Pipelined CPU','Pipelined digital design','Register between stages; same trade-off.'],
        ['Critical path (STA)','Longest path in DAG','Setup-time analysis is longest-path computation.'],
        ['MDP','LQR optimal control','Both minimize cost-to-go over a dynamical system.'],
        ['Hill climbing','MPPT (solar)','P&O is hill climbing on the P-V curve.'],
        ['PID controller','Gradient descent (sort of)','Both use error feedback; both are heuristics.'],
        ['PageRank','Markov chain steady-state','Both find the dominant eigenvector.'],
        ['Backprop','Adjoint sensitivity in circuits','Chain rule through a graph = adjoint method.'],
        ['Memory hierarchy','Cache → RAM → disk','Voltage source → cap → inductor analog for energy storage.'],
        ['Coroutine / async','Event-driven interrupt handler','Both run on demand, not by polling.'],
        ['Race condition','Setup/hold violation','Both arise from uncontrolled timing.'],
        ['Load balancer','Three-phase load balancing','Both distribute work to keep utilization even.'],
        ['Backpressure','Current limiting','Both throttle input to protect a downstream system.'],
        ['Compaction (LSM tree)','Memory folding in DSP','Both merge adjacent levels to bound size.'],
    ], col_widths=[40*mm, 50*mm, 80*mm]))

    s.append(PageBreak())

    # ─── Appendix D ────────────────────────────────────────────────────────
    s.append(heading('Appendix D — Math Reference and Formula Sheets', 0))

    s.append(heading('D.1 Trigonometric identities', 1))
    s.append(bullet_list([
        "sin²θ + cos²θ = 1",
        "sin(A ± B) = sin A cos B ± cos A sin B",
        "cos(A ± B) = cos A cos B ∓ sin A sin B",
        "sin 2A = 2 sin A cos A; cos 2A = cos²A − sin²A",
        "e<sup>jθ</sup> = cos θ + j sin θ (Euler)",
        "cos θ = (e<sup>jθ</sup> + e<sup>−jθ</sup>)/2; sin θ = (e<sup>jθ</sup> − e<sup>−jθ</sup>)/(2j)",
    ]))

    s.append(heading('D.2 Derivatives and integrals used in EE', 1))
    s.append(make_table([
        ['f(t)','df/dt','∫f(t) dt'],
        ['t<sup>n</sup>','n·t<sup>n−1</sup>','t<sup>n+1</sup>/(n+1)'],
        ['e<sup>at</sup>','a·e<sup>at</sup>','e<sup>at</sup>/a'],
        ['sin(ωt)','ω·cos(ωt)','−cos(ωt)/ω'],
        ['cos(ωt)','−ω·sin(ωt)','sin(ωt)/ω'],
        ['u(t) (unit step)','δ(t) (impulse)','t·u(t)'],
        ['δ(t)','δ\'(t)','u(t)'],
    ], col_widths=[50*mm, 50*mm, 70*mm]))

    s.append(heading('D.3 Laplace transform pairs', 1))
    s.append(make_table([
        ['f(t)','F(s)'],
        ['δ(t)','1'],
        ['u(t)','1/s'],
        ['t·u(t)','1/s²'],
        ['e<sup>−at</sup>·u(t)','1/(s+a)'],
        ['sin(ωt)·u(t)','ω/(s² + ω²)'],
        ['cos(ωt)·u(t)','s/(s² + ω²)'],
        ['e<sup>−at</sup>·sin(ωt)·u(t)','ω/((s+a)² + ω²)'],
    ], col_widths=[80*mm, 80*mm]))

    s.append(heading('D.4 Z-transform pairs', 1))
    s.append(make_table([
        ['x[n]','X(z)'],
        ['δ[n]','1'],
        ['u[n]','z/(z − 1)  (|z| > 1)'],
        ['a<sup>n</sup>·u[n]','z/(z − a)  (|z| > |a|)'],
        ['n·a<sup>n</sup>·u[n]','a·z/(z − a)²'],
        ['cos(ω₀n)·u[n]','z(z − cos ω₀)/(z² − 2z cos ω₀ + 1)'],
        ['sin(ω₀n)·u[n]','z sin ω₀/(z² − 2z cos ω₀ + 1)'],
    ], col_widths=[80*mm, 80*mm]))

    s.append(heading('D.5 Vector calculus operators', 1))
    s.append(bullet_list([
        "<b>Gradient:</b> ∇φ = (∂φ/∂x, ∂φ/∂y, ∂φ/∂z). Returns vector pointing in direction of steepest ascent.",
        "<b>Divergence:</b> ∇·F = ∂F_x/∂x + ∂F_y/∂y + ∂F_z/∂z. Returns scalar; positive at sources, negative at sinks.",
        "<b>Curl:</b> ∇×F = vector measuring rotation.",
        "<b>Laplacian:</b> ∇²φ = ∇·(∇φ). Appears in Poisson’s and wave equations.",
        "<b>Divergence theorem:</b> ∫∫∫∇·F dV = ∮∮F·dA.",
        "<b>Stokes’ theorem:</b> ∫∫(∇×F)·dA = ∮F·dl.",
    ]))

    s.append(PageBreak())

    # ─── Appendix E ────────────────────────────────────────────────────────
    s.append(heading('Appendix E — 12-Month Pacing Calendar', 0))
    s.append(p('A week-by-week schedule mapping every module to a specific week. Assumes '
               '12 hours/week (about 1.5–2 hours/day). Adjust to your own pace; the order '
               'matters more than the exact timing.'))

    s.append(make_table([
        ['Week','Phase','Module','Topic'],
        ['1','0','0.1','Math bootcamp — calculus, ODEs, linear algebra'],
        ['2','0','0.2','Physics — electrostatics, magnetostatics, Maxwell'],
        ['3','0','0.3','CS-to-EE bridge'],
        ['4','0','0.4','Toolchain setup'],
        ['5–6','1','1.1–1.3','DC fundamentals, KCL/KVL, nodal/mesh'],
        ['7','1','1.4–1.5','Thevenin/Norton, superposition'],
        ['8–9','1','1.6–1.7','Capacitors/inductors, transients, capstone'],
        ['10–11','2','2.1–2.2','Phasors, impedance'],
        ['12','2','2.3','AC power'],
        ['13','2','2.4','Resonance, Bode'],
        ['14','2','2.5–2.6','Three-phase, transformers, capstone'],
        ['15–16','3','3.1–3.2','Diodes, BJTs'],
        ['17','3','3.3','MOSFETs'],
        ['18','3','3.4','Op-amps'],
        ['19','3','3.5','Active filters'],
        ['20','3','3.6','Oscillators, 555'],
        ['21','3','3.7','Linear regulators'],
        ['22','3','3.8','Audio amp capstone'],
        ['23–24','4','4.1–4.3','Boolean, combinational, sequential'],
        ['25','4','4.4','Verilog'],
        ['26','4','4.5','FPGA'],
        ['27','4','4.6–4.7','MCU, peripherals'],
        ['28','4','4.8','UART/SPI/I2C'],
        ['29','4','4.9–4.10','ESP32, capstone'],
        ['30–31','5','5.1–5.3','CT signals, Fourier'],
        ['32','5','5.4','Laplace'],
        ['33','5','5.5','Sampling theorem'],
        ['34','5','5.6','Z-transform'],
        ['35','5','5.7','DFT, FFT'],
        ['36','5','5.8','FIR/IIR filters'],
        ['37','5','5.9–5.10','Adaptive, capstone'],
        ['38–39','6','6.1–6.3','Feedback, stability, time response'],
        ['40','6','6.4','Root locus'],
        ['41','6','6.5','Bode/Nyquist'],
        ['42','6','6.6','PID'],
        ['43','6','6.7','State-space'],
        ['44','6','6.8–6.10','Digital control, kinematics, capstone'],
        ['45–46','7','7.1–7.4','Power devices, DC-DC, isolated, inverters'],
        ['47','7','7.5–7.7','Rectifiers/PFC, DC machines, induction'],
        ['48–49','7','7.8–7.10','BLDC/FOC, drives, capstone'],
        ['50','8','8.1–8.3','Vector calc, electrostatics, magnetostatics'],
        ['51','8','8.4–8.6','Maxwell, transmission lines, antennas'],
        ['52','8','8.7–8.9','RF front-end, modulation, capstone'],
        ['+4 wk','9','9.1–9.8','VLSI + capstone (extend if needed)'],
        ['+8 wk','10','10.1–10.10','Power systems + capstone'],
    ], col_widths=[18*mm, 16*mm, 22*mm, 114*mm]))

    s.append(p('This calendar fits the core curriculum (Phases 0–8) into 52 weeks at '
               '12 h/week. Phases 9 and 10 extend past week 52 — plan for an extra 12 weeks. '
               'If you have more time per week, compress proportionally. If you have less, '
               'extend. The order matters more than the timing — do not skip ahead.', 'caption'))

    return s
