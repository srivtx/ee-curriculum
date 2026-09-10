"""
EE Curriculum Content — Phases 4-6 (Digital/Embedded, Signals/DSP, Control/Robotics).
"""

from ee_curriculum_part1_setup import *

# ════════════════════════════════════════════════════════════════════════════
# PHASE 4 — DIGITAL LOGIC & EMBEDDED SYSTEMS
# ════════════════════════════════════════════════════════════════════════════
def build_phase4():
    s = []
    s.append(heading('Phase 4 — Digital Logic & Embedded Systems', 0))
    s.append(p('<b>Duration:</b> 6 weeks · <b>Modules:</b> 10 · <b>Goal:</b> take the digital '
               'abstraction from gates to a working FPGA prototype and a wireless MCU '
               'telemetry demo.', 'kicker'))

    s.append(p(
        "Phase 4 is where your CS background pays the biggest dividends. Boolean algebra, "
        "FSMs, K-maps, register files, and pipelining are all things you already know — "
        "we just rename them and apply them to hardware. The new material is the physical "
        "side: setup and hold constraints, metastability, clock distribution, asynchronous "
        "signals, and the dozen other ways real hardware differs from an idealized HDL "
        "simulation."))

    s.append(volt_says(
        'This is the phase where you stop translating and start recognizing. Boolean '
        'algebra here is the same algebra you use in code. FSMs are the same FSMs from '
        'your compiler course. Pipelines are the same pipelines from your CPU class. The '
        'only new things are setup and hold times. Metastability. Clock domains. The '
        'physical reality that occasionally flips the clean abstraction into chaos.',
        mood='story'))

    # ── Module 4.1 ──
    s.append(heading('Module 4.1 — Boolean Algebra and K-maps', 1))
    s.append(p('<b>Duration:</b> 4–6 h · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(cs_bridge(
        "<b>Boolean algebra ↔ bitwise operations in C.</b> AND, OR, NOT, XOR are the "
        "same operators whether they appear in C code or as physical gates. "
        "De Morgan’s laws (¬(A∧B) = ¬A∨¬B) are universal. A sum-of-products (SOP) "
        "expression is a disjunction of minterms — a Boolean expression in DNF. "
        "K-maps are a visual trick for minimizing SOP expressions; algorithmically "
        "they are a special case of the Quine–McCluskey algorithm, which is itself a "
        "graph-based prime-implicant search."))

    s.append(volt_says(
        'When you write <code>a &amp; b</code> in C, the compiler emits an AND '
        'instruction. The CPU runs it in one cycle. It uses a few hundred transistors. '
        'CMOS NAND plus an inverter. The hardware IS the boolean algebra. The '
        'translation layer is zero.',
        mood='insight'))

    s.append(amp_says(
        'So when I write code, I\'m literally just describing transistor layouts?',
        mood='question'))

    s.append(volt_says(
        'Yes. At the bottom, it\'s all just switches. Code is a high-level view of '
        'switches.',
        mood='tip'))

    # ── Pixel diagram: nand_gate (the universal gate) ──
    s.extend(diagram('nand_gate',
        caption='NAND gate — AND followed by an inverter bubble. Universal: any logic function can be built from NANDs alone.'))
    # ── Pixel diagram: nor_gate ──
    s.extend(diagram('nor_gate',
        caption='NOR gate — OR followed by an inverter bubble. Also universal; the natural CMOS gate (series PMOS, parallel NMOS).'))

    s.append(p(
        "Every Boolean function can be written as a sum of products (OR of ANDs) or a "
        "product of sums (AND of ORs). Both forms can be implemented directly in two-level "
        "logic. K-maps minimize these expressions by grouping adjacent 1-cells (for SOP) "
        "or 0-cells (for POS) into power-of-two rectangles. The minimized expression has "
        "fewer literals, which means fewer gates and less propagation delay."))
    s.append(formula_box(
        "De Morgan: ¬(A∧B) = ¬A ∨ ¬B &nbsp;&nbsp;|&nbsp;&nbsp; ¬(A∨B) = ¬A ∧ ¬B"))

    s.append(heading('K-map mechanics', 2))
    s.append(p(
        "A K-map is a 2D grid where each cell corresponds to a minterm. Adjacent cells "
        "differ in exactly one variable (Gray code ordering). Group adjacent 1-cells in "
        "rectangles of 1, 2, 4, 8, 16. Each group corresponds to one product term with "
        "the variables that don’t change within the group. The minimum cover (fewest "
        "groups, each as large as possible) gives the minimum SOP. K-maps work up to 4 "
        "variables by hand; for 5+ variables use Quine–McCluskey or, in practice, let "
        "the synthesizer (Yosys, ABC) do it."))

    s.append(project_box('Practice: Minimize 10 Boolean Functions', [
        ('Goal:', 'fluency with K-maps.'),
        ('Tasks:', 'minimize 10 functions of 3–4 variables by hand using K-maps.'),
        ('Verify:', 'cross-check each result against Python’s sympy.logic.boolalg.simplify_logic.'),
        ('Pass:', '8 of 10 match the sympy result. (Discrepancies are usually equally minimal '
                  'alternatives — list both.)'),
    ]))

    s.append(checkpoint_box([
        "State De Morgan’s laws. Convert (A∧B)∨(¬A∧C) to NAND-only form.",
        "Minimize F(A,B,C) = Σm(1,3,5,7,9) using a K-map. (Should be C.)",
        "What is a minterm? A maxterm? How are they related?",
        "When does Quine–McCluskey beat K-maps? When does Espresso beat both?",
    ]))

    # ── Module 4.2 ──
    s.append(heading('Module 4.2 — Combinational Logic: Mux, Decoder, Adder', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(p(
        "Three workhorse combinational building blocks. <b>Multiplexer (mux)</b>: 2ⁿ inputs, "
        "n select lines, one output — picks one input based on select. A LUT in an FPGA "
        "is just a mux. <b>Decoder</b>: n inputs, 2ⁿ outputs — asserts one output per "
        "input combination. Used for address decoding, 7-segment display driving. "
        "<b>Adder</b>: ripple-carry (slow, simple), carry-lookahead (fast, more gates), "
        "carry-skip and carry-select (in between). Modern FPGAs and CPUs use prefix adders "
        "(Kogge–Stone, Brent–Kung) for log-time addition."))

    # ── Pixel diagram: mux ──
    s.extend(diagram('mux',
        caption='Multiplexer (mux) — 2ⁿ inputs, n select lines, one output. A FPGA LUT is a mux with a truth table stored in SRAM.'))
    # ── Pixel diagram: decoder ──
    s.extend(diagram('decoder',
        caption='Decoder — n inputs, 2ⁿ outputs (one-hot). The address decoder in every memory and peripheral.'))

    # ── Pixel diagram: AND gate (combinational primitive) ──
    s.extend(diagram('and_gate',
        caption='AND gate — two inputs (left) feed the D-shape, output (right) is high only when both inputs are high.'))

    s.append(heading('Combinational hazards', 2))
    s.append(p(
        "A static-1 hazard occurs when an input change should leave the output at 1 but "
        "momentarily drops it to 0 due to unequal path delays. The fix is to add a "
        "consensus term — an extra product term that covers the hazardous transition. "
        "In practice, hazards rarely matter for synchronous designs (the clock masks "
        "them), but they bite hard in asynchronous logic and clock-domain crossings."))

    s.append(project_box('Bench: 7-Segment Decoder on 74HC', [
        ('Goal:', 'build a BCD-to-7-segment decoder from discrete gates.'),
        ('Circuit:', '74HC08 (AND), 74HC32 (OR), 74HC04 (NOT). 4-bit input from DIP switches, '
                     'output to common-cathode 7-segment via 330Ω resistors.'),
        ('Design:', 'write the truth table, K-map each segment, minimize, draw schematic.'),
        ('Build & verify:', 'all 10 BCD values (0–9) display correctly. The 6 invalid codes '
                            'may show garbage or be blanked — your choice.'),
        ('Extension:', 'replace the gates with a single 74HC47 or 74HC4511 decoder IC. '
                       'Compare chip count, board area, and power.'),
    ]))

    s.append(checkpoint_box([
        "Design a 4:1 mux using only 2:1 muxes.",
        "Compare ripple-carry and carry-lookahead adders. What is the delay of each for n bits?",
        "What is a static-1 hazard? How do you eliminate it?",
        "Why do modern FPGAs use LUTs instead of muxes?",
    ]))

    s.append(pixel_divider())

    # ── Module 4.3 ──
    s.append(heading('Module 4.3 — Sequential Logic: Flip-Flops, Counters, Registers', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(cs_bridge(
        "<b>Flip-flop ↔ register in a CPU.</b> A D flip-flop is a 1-bit register — it "
        "samples the input on the clock edge and holds it until the next edge. A shift "
        "register is a queue of flip-flops; a counter is a register that increments. "
        "A register file is a bank of flip-flops with read/write ports — exactly the "
        "register file in a CPU. The only thing that is new in EE is the timing: "
        "setup, hold, and clock-to-Q constraints."))

    # ── Pixel diagram: D flip-flop ──
    s.extend(diagram('d_flip_flop',
        caption='D flip-flop — D input on left, CLK input middle, Q output right. Edge-triggered.'))

    # ── Pixel diagram: counter_4bit ──
    s.extend(diagram('counter_4bit',
        caption='4-bit synchronous counter — four D flip-flops sharing a clock, with combinational next-state logic.'))
    # ── Pixel diagram: shift_register ──
    s.extend(diagram('shift_register',
        caption='Shift register — chain of D flip-flops passing data on each clock. The hardware behind UART, SPI, I2C.'))

    s.append(heading('Four flip-flop types', 2))
    s.append(make_table([
        ['Type','Behavior','Use'],
        ['D','Q follows D on clock edge','Universal — most logic uses D'],
        ['T','Q toggles when T=1 on clock edge','Counters'],
        ['JK','J=K=1 toggles; J=1,K=0 sets; J=0,K=1 resets; J=K=0 holds','General-purpose (legacy)'],
        ['SR','S=1 sets, R=1 resets, S=R=1 forbidden','Basic latch (rarely used standalone)'],
    ], col_widths=[20*mm, 80*mm, 70*mm]))

    s.append(heading('Setup, hold, and metastability', 2))
    s.append(p(
        "Every flip-flop has two timing constraints: <b>setup time</b> t_su (input must be "
        "stable for at least t_su before the clock edge) and <b>hold time</b> t_h (input "
        "must remain stable for at least t_h after the edge). Violate either and the "
        "flip-flop may go <b>metastable</b> — its output hovers between 0 and 1 for an "
        "unbounded time before resolving. Metastability is unavoidable when crossing "
        "asynchronous clock domains; the standard fix is a two-flop synchronizer, which "
        "reduces the failure probability to (MTBF) of billions of years."))

    s.append(heading('Counters and shift registers', 2))
    s.append(p(
        "A ripple counter (each flop clocks the next) is slow — the count ripples through "
        "n flops. A synchronous counter (all flops share the clock; combinational logic "
        "computes the next count) is fast. A ring counter has one flop set, the rest "
        "clear; the ‘1’ circulates. A Johnson counter feeds back the complemented output "
        "and has 2n states from n flops. Shift registers move data left or right; they "
        "are the basis of serial communication (UART, SPI, I2C)."))

    s.append(project_box('Bench: Traffic-Light Controller FSM on Arduino', [
        ('Goal:', 'implement a 6-state traffic-light controller as a Moore FSM.'),
        ('States:', 'NS_GREEN (8s) → NS_YELLOW (2s) → EW_GREEN (8s) → EW_YELLOW (2s) → '
                    'PED_WALK (10s) → FLASH_RED (5s) → back to NS_GREEN.'),
        ('Implementation:', 'use enum for state, switch-case for next-state logic and '
                            'output logic. Drive 6 LEDs (NS_R, NS_Y, NS_G, EW_R, EW_Y, EW_G).'),
        ('Extension:', 'add a pedestrian button input. Pressing it during NS_GREEN inserts '
                       'PED_WALK after NS_YELLOW. Add a debounce circuit on the button.'),
        ('Tool:', 'Arduino IDE. (We will do the same FSM on an FPGA in Module 4.5.)'),
    ]))

    s.append(checkpoint_box([
        "Define setup time, hold time, clock-to-Q. What is a timing violation?",
        "What is metastability? How does a two-flop synchronizer mitigate it?",
        "Design a 4-bit synchronous up-counter using D flip-flops and combinational logic.",
        "Why is a ripple counter slower than a synchronous counter?",
        "Convert a Moore FSM to a Mealy FSM. When does Mealy use fewer states?",
    ]))

    s.append(pixel_divider())

    # ── Module 4.4 ──
    s.append(heading('Module 4.4 — HDL Intro: Verilog and FSMs', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Hardware Description Languages (HDLs) describe hardware, not programs. The "
        "biggest mental shift from software: every assignment happens concurrently — "
        "the entire circuit runs in parallel, all the time. There is no ‘first this "
        "line, then the next’ — only ‘these signals flow continuously through these "
        "combinational clouds, sampled by these registers on these clock edges’. Two "
        "HDLs dominate: Verilog (C-like syntax, popular in US/India) and VHDL "
        "(Ada-like syntax, popular in Europe and defense). We will use Verilog."))

    s.append(heading('Verilog in one page', 2))
    s.append(p("Verilog has two main abstractions: <b>structural</b> (instantiating "
               "submodules — like netlist) and <b>behavioral</b> (always blocks — like "
               "code, but every line describes hardware). The two essential constructs:"))
    s.append(bullet_list([
        "<b>assign</b> for continuous assignment (combinational logic). Example: <i>assign y = a &amp; b;</i>",
        "<b>always @(posedge clk)</b> for sequential logic. The body describes what happens on each clock edge.",
        "<b>always @(*)</b> for combinational logic in procedural form (preferred over assign for complex logic).",
    ]))
    s.append(p("The non-blocking assignment <b>&lt;=</b> is used inside clocked always blocks; "
               "it samples the RHS at the clock edge and updates the LHS ‘simultaneously’ "
               "with all other non-blocking assignments. The blocking assignment <b>=</b> "
               "is used in combinational always blocks. Mixing them up is the #1 source of "
               "Verilog bugs."))

    s.append(heading('A counter in Verilog', 2))
    s.append(Paragraph(
        "module counter(<br/>"
        "&nbsp;&nbsp;input wire clk, rst,<br/>"
        "&nbsp;&nbsp;output reg [3:0] count<br/>"
        ");<br/>"
        "&nbsp;&nbsp;always @(posedge clk or posedge rst) begin<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;if (rst) count &lt;= 4'b0;<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;else&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;count &lt;= count + 1;<br/>"
        "&nbsp;&nbsp;end<br/>"
        "endmodule", styles['code']))

    s.append(project_box('Simulate the Counter in Icarus Verilog', [
        ('Goal:', 'write a testbench and verify the counter.'),
        ('Tasks:', 'write a testbench that toggles clk every 5 ns, asserts rst for 10 ns at '
                   'start, then runs for 200 ns. Dump waveforms with $dumpfile / $dumpvars.'),
        ('Tool:', 'Icarus Verilog (iverilog) + GTKWave. Both free.'),
        ('Verify:', 'open the .vcd in GTKWave. Confirm count goes 0,1,2,...,15,0,1,...'),
        ('Synthesize:', 'feed the same module to Vivado. Confirm it synthesizes to a 4-bit '
                        'counter with no warnings.'),
    ]))

    s.append(checkpoint_box([
        "What is the difference between = and <= in Verilog?",
        "What does always @(posedge clk) describe? always @(*)?",
        "Write a Verilog module for a 4:1 mux.",
        "What is a testbench? Why do you need one in HDL but not in C?",
        "Why is Verilog not ‘just another programming language’?",
    ]))

    # ── Module 4.5 ──
    s.append(heading('Module 4.5 — FPGA Basics with Vivado and Artix-7', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "An FPGA (Field-Programmable Gate Array) is a sea of configurable logic blocks "
        "(CLBs), each containing a small LUT (typically 6-input) and a flip-flop, "
        "interconnected by a programmable routing network. You describe your circuit in "
        "Verilog; the synthesizer maps it to LUTs and flops; the place-and-route tool "
        "fits them onto the chip; the bitstream is downloaded and the chip becomes your "
        "circuit. The Artix-7 (e.g., Nexys A7 or Basys 3 board, ~$150) is the standard "
        "student FPGA."))

    s.append(heading('The FPGA design flow', 2))
    s.append(bullet_list([
        "<b>Design Entry:</b> write Verilog. Specify IOs in an .xdc constraints file (pin numbers, voltage standards).",
        "<b>Simulation:</b> testbench in iverilog or Vivado simulator. Verify behavior before touching hardware.",
        "<b>Synthesis:</b> Vivado maps RTL to LUTs, flops, DSPs, BRAMs. Produces a netlist.",
        "<b>Implementation:</b> place-and-route. Fits the netlist onto the physical chip.",
        "<b>Bitstream generation:</b> produces a .bit file.",
        "<b>Programming:</b> download the bitstream to the FPGA over JTAG.",
        "<b>On-chip debug:</b> Vivado Logic Analyzer (ILA) captures internal signals for debugging.",
    ]))

    s.append(project_box('FPGA: Implement the Traffic-Light FSM from 4.3', [
        ('Goal:', 'port the Arduino traffic-light FSM to the Artix-7.'),
        ('Tool:', 'Vivado WebPACK + Nexys A7 (or Basys 3).'),
        ('Tasks:', 'same FSM as 4.3. Map the 6 outputs to 6 LEDs on the board. Use the 100 MHz '
                   'on-board clock; divide down to 1 Hz with a counter.'),
        ('Constraints:', 'write a .xdc file mapping each port to the right pin.'),
        ('Verify:', 'the LEDs cycle through the FSM exactly as the Arduino did. Congratulations — '
                    'you have just implemented hardware from scratch.'),
        ('Debug:', 'insert an Integrated Logic Analyzer (ILA) on the state register. Trigger on '
                   'state transition. Capture the state sequence.'),
    ]))

    s.append(checkpoint_box([
        "What is a CLB? A LUT? A slice?",
        "List the steps of the FPGA design flow.",
        "What is in an .xdc file? Why do you need it?",
        "How would you debug an FPGA design that works in simulation but not on hardware?",
        "Compare FPGA and ASIC design flows. When would you choose each?",
    ]))

    # ── Module 4.6 ──
    s.append(heading('Module 4.6 — Microcontrollers: Arduino to STM32', 1))
    s.append(p('<b>Duration:</b> 8–10 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(cs_bridge(
        "<b>MCU ↔ tiny computer with memory-mapped I/O.</b> A microcontroller is a CPU "
        "core + RAM + flash + peripherals (GPIO, ADC, timers, UART, SPI, I2C, PWM, DMA) "
        "on one chip. To a CS engineer, the model is: each peripheral is a set of "
        "memory-mapped registers; you write device drivers by reading and writing those "
        "registers. Arduino abstracts this away behind friendly APIs; STM32 makes you "
        "deal with it directly via the CMSIS layer or via STM32 HAL. Bare-metal STM32 "
        "is closer to embedded Linux driver development than to Arduino."))

    s.append(heading('The Arduino abstraction', 2))
    s.append(p(
        "Arduino wraps the Atmel AVR (or now also ARM) MCU in a friendly C++ API: "
        "<i>pinMode, digitalWrite, digitalRead, analogRead, analogWrite, Serial.begin, "
        "delay</i>. Under the hood these are macros that write to specific AVR registers. "
        "Great for prototyping, but the abstraction hides timing — <i>digitalWrite</i> "
        "takes ~5 μs because of the lookup table that maps Arduino pin numbers to AVR "
        "ports. For sub-microsecond timing, you must bypass the abstraction."))

    s.append(heading('STM32 — the real-world MCU', 2))
    s.append(p(
        "The STM32 family (ST Microelectronics, ARM Cortex-M cores) is the workhorse of "
        "modern embedded systems. Common parts: F103 (cheap, popular in Blue Pill boards), "
        "F446 (168 MHz, FPU, used in Nucleo-F446RE), H7 (480 MHz, top-end). The development "
        "environment is STM32CubeIDE (Eclipse-based, free). Configure peripherals via the "
        ".ioc graphical tool, then write code in C using the HAL (Hardware Abstraction Layer) "
        "or the lower-level LL (Low-Layer) libraries. For real-time work, you often bypass "
        "HAL and write directly to registers."))

    s.append(volt_says(
        'When you drop from Arduino to STM32, you cross the same line as moving from '
        'Python to C. The HAL is friendly but slow. The bare registers are fast but '
        'unforgiving. Real products live in between. HAL for setup. Direct register '
        'access for the hot paths.',
        mood='tip'))

    s.append(amp_says(
        'Like using a high-level API for the easy stuff and dropping to syscalls for '
        'performance?',
        mood='question'))

    s.append(volt_says(
        'Exactly. Same idea. Same tradeoffs.',
        mood='tip'))

    s.append(heading('Clock trees and power management', 2))
    s.append(p(
        "An MCU has an internal clock tree that distributes the system clock to the CPU, "
        "the buses (AHB, APB1, APB2), and the peripherals. Each peripheral has its own "
        "prescaler. Configuring the clock tree is the first step of any STM32 project — "
        "a mistake here means your UART runs at the wrong baud rate. Low-power modes "
        "(Sleep, Stop, Standby) gate the clock to idle peripherals to save power. "
        "Battery-powered devices spend most of their time in Stop mode, waking up on "
        "an interrupt."))

    s.append(project_box('Bench: STM32 GPIO Toggle at 1 Hz and 1 MHz', [
        ('Goal:', 'feel the difference between HAL and direct register access.'),
        ('Tasks:', '(1) Toggle a GPIO at 1 Hz using HAL_GPIO_TogglePin + HAL_Delay. '
                   '(2) Toggle the same GPIO at maximum speed using direct register writes '
                   '(GPIOx->BSRR). Scope the output. Measure toggle frequency.'),
        ('Verify:', 'with HAL you get maybe 100 kHz. With direct writes on STM32F446 you '
                    'can hit 84 MHz (half the system clock). That’s 1000× faster.'),
        ('Lesson:', 'the HAL is convenient but hides performance. For tight loops, drop to '
                    'register level.'),
    ]))

    s.append(checkpoint_box([
        "What is the difference between Arduino and STM32 from a developer’s perspective?",
        "Sketch an MCU clock tree: HSE → PLL → AHB → APB1/APB2 → peripherals.",
        "How do you configure an STM32 GPIO as output push-pull at 50 MHz?",
        "What is DMA? Why is it faster than interrupt-driven I/O?",
        "Name three low-power modes on an STM32. When would you use each?",
    ]))

    # ── Module 4.7 ──
    s.append(heading('Module 4.7 — Interrupts, Timers, ADC, DAC, PWM', 1))
    s.append(p('<b>Duration:</b> 8–10 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "These are the five peripheral categories you will use in every MCU project. "
        "<b>Interrupts</b> let the CPU respond to events without polling. <b>Timers</b> "
        "count clock cycles and generate periodic events or PWM. <b>ADCs</b> sample "
        "analog voltages. <b>DACs</b> generate analog voltages. <b>PWM</b> encodes an "
        "analog value (the duty cycle) in a digital waveform — the basis of every "
        "switch-mode converter and motor driver."))

    s.append(heading('Interrupts and priorities', 2))
    s.append(p(
        "An interrupt vector table maps interrupt sources to handler functions. The CPU "
        "saves its state (PC, registers), jumps to the handler, and restores state on "
        "return. The ARM Cortex-M NVIC (Nested Vectored Interrupt Controller) supports "
        "16 priority levels — higher-priority interrupts can preempt lower ones. The "
        "rule: handlers must be short (microseconds, not milliseconds). Long handlers "
        "block other interrupts and break real-time behavior. For long work, set a flag "
        "in the handler and process it in the main loop."))

    s.append(heading('Timers — the workhorse peripheral', 2))
    s.append(p(
        "A timer is a counter driven by a clock. It can: count up, count down, count "
        "up-down (center-aligned PWM). It generates interrupts on overflow, on compare "
        "match, on capture (an external edge latches the counter into a register — "
        "useful for measuring frequency or pulse width). PWM is just a timer running in "
        "compare mode where the output pin toggles on compare match — the duty cycle is "
        "compare_value / period."))
    s.append(formula_box(
        "f<sub>PWM</sub> = f<sub>timer</sub> / (prescaler · ARR) &nbsp;&nbsp;|&nbsp;&nbsp; "
        "Duty = CCR / ARR &nbsp;&nbsp;|&nbsp;&nbsp; Resolution = log<sub>2</sub>(ARR) bits"))

    s.append(heading('ADCs — sampling the analog world', 2))
    s.append(p(
        "Most MCU ADCs are SAR (Successive Approximation Register) converters: n-bit "
        "resolution requires n clock cycles per sample. STM32 ADCs typically run at "
        "1–5 MSPS with 12-bit resolution. Sampling analog signals correctly requires "
        "an anti-alias filter (low-pass at f_sample/2) — without it, high-frequency "
        "noise folds back into the band of interest. The ADC has a sample-and-hold "
        "capacitor that must charge through the source impedance; if the source is "
        "high-impedance, you need a longer sample time or an op-amp buffer."))

    s.append(volt_says(
        'An ADC without an anti-alias filter is broken by design. Sample rate alone does '
        'not stop aliasing. You have to low-pass the signal before sampling. If you '
        'don\'t, high-frequency noise folds back into your band. It becomes '
        'indistinguishable from signal.',
        mood='warning'))

    s.append(amp_says(
        'Like the wagon-wheel effect in movies? Where wheels look like they\'re '
        'spinning backwards?',
        mood='question'))

    s.append(volt_says(
        'Yes. Same thing. Same math. Aliasing in any sampled system.',
        mood='tip'))

    s.append(project_box('Bench: STM32 PWM Motor Speed Control', [
        ('Goal:', 'control a small DC motor speed with PWM from an STM32.'),
        ('Hardware:', 'STM32 Nucleo, L298N motor driver, 6 V DC motor, 12 V supply.'),
        ('PWM:', '10 kHz, 8-bit resolution (0–255). Timer 1 channel 1.'),
        ('Drive:', 'CCR controls duty (0=stop, 255=full speed).'),
        ('Measure:', 'sweep CCR from 0 to 255 in steps of 16. Measure motor RPM with a '
                     'reflective IR sensor and a scope. Plot RPM vs duty cycle. Note the '
                     'dead zone at low duty (motor needs ~30% duty to overcome friction).'),
        ('Extension:', 'close the loop — add a PI controller (more on this in Phase 6) to '
                       'hold a target RPM.'),
    ]))

    s.append(checkpoint_box([
        "What is the NVIC? How do priorities work in ARM Cortex-M?",
        "Compute the PWM frequency for a 84 MHz timer with prescaler=83 and ARR=999.",
        "What is sample-and-hold? Why does the ADC need it?",
        "What is aliasing? How do you prevent it when sampling an audio signal?",
        "Why should interrupt handlers be short? How do you handle long work safely?",
    ]))

    # ── Module 4.8 ──
    s.append(heading('Module 4.8 — Communication: UART, SPI, I2C, CAN', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(cs_bridge(
        "<b>Serial protocols ↔ network protocols.</b> UART is a point-to-point byte "
        "stream with start/stop framing — like a TCP socket without retries. SPI is a "
        "shared bus with explicit chip-select lines — like a USB hub. I2C is a shared "
        "bus with addressing — like Ethernet with MAC addressing. CAN is a multi-master "
        "bus with priority arbitration and error detection — like a contention-based "
        "LAN. The same design trade-offs (latency vs throughput, complexity vs robustness) "
        "appear in every protocol you already know."))

    # ── Pixel diagram: spi_bus ──
    s.extend(diagram('spi_bus',
        caption='SPI bus — shared SCK/MOSI/MISO plus a dedicated CS per slave. Full-duplex, fast, but pin-hungry.'))
    # ── Pixel diagram: i2c_bus ──
    s.extend(diagram('i2c_bus',
        caption='I2C bus — 2 wires (SDA, SCL), 7-bit addressing, multi-master arbitration. Slow but beautifully pin-frugal.'))

    s.append(make_table([
        ['Protocol','Wires','Topology','Speed','Typical use'],
        ['UART','2 (TX, RX)','Point-to-point','9600–3 Mbaud','Debug serial, GPS, BLE modules'],
        ['SPI','4 (MOSI, MISO, SCK, CS)','Bus, CS per slave','1–50 MHz','SD cards, displays, fast ADCs'],
        ['I2C','2 (SDA, SCL) + gnd','Multi-drop, addressed','100/400 kHz, 1/3.4 MHz','Sensors, EEPROMs, small displays'],
        ['CAN','2 (CANH, CANL) + gnd','Differential bus','up to 1 Mbit/s','Automotive, industrial'],
        ['USB','2 (D+, D−) + power','Tiered star','1.5/12/480/5000 Mbit/s','PC peripherals'],
        ['Ethernet','4 (2 pairs) or 8','Star via switch','10/100/1000/10000 Mbit/s','Networking'],
    ], col_widths=[22*mm, 30*mm, 30*mm, 30*mm, 58*mm]))

    s.append(heading('I2C — addressing and arbitration', 2))
    s.append(p(
        "I2C uses 7-bit (or 10-bit) addresses: every device on the bus has a unique "
        "address. The master generates the clock (SCL) and initiates transactions; "
        "slaves respond. Multiple masters are allowed — collision detection is "
        "arbitration: the master writing a 0 wins over one writing a 1 (wired-AND). "
        "Pull-up resistors on SDA and SCL (typically 4.7 kΩ) set the bus idle state. "
        "I2C is slow but cheap (2 wires), which is why it dominates sensor connectivity."))

    s.append(project_box('Bench: STM32 + BME280 over I2C', [
        ('Goal:', 'read temperature, humidity, and pressure from a BME280 sensor over I2C.'),
        ('Wire:', 'BME280 VCC→3.3V, GND→GND, SDA→PB7, SCL→PB6 (I2C1 on Nucleo-F446RE).'),
        ('Address:', '0x76 or 0x77 depending on the SDO pin.'),
        ('Code:', 'use STM32 HAL I2C: HAL_I2C_Mem_Read to read the calibration registers '
                  'and the data registers. Apply Bosch’s compensation formulas (in the '
                  'datasheet) to convert raw ADC values to physical units.'),
        ('Verify:', 'compare temperature reading to a thermometer, pressure to weather '
                    'report, humidity to a hygrometer. All within ±5%.'),
        ('Extension:', 'log to a PC over UART at 1 Hz for 24 hours. Plot in Python.'),
    ]))

    s.append(checkpoint_box([
        "Compare UART, SPI, I2C: wires, topology, speed, addressing.",
        "Why does I2C need pull-up resistors? What value, and why?",
        "How does I2C arbitration work? Can SPI do the same?",
        "Why is CAN used in cars instead of I2C?",
    ]))

    # ── Module 4.9 ──
    s.append(heading('Module 4.9 — ESP32 and Wireless Connectivity', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "The ESP32 (Espressif, ~$5) is a dual-core Xtensa LX6 MCU at 240 MHz with built-in "
        "WiFi and Bluetooth. It is the de-facto standard for cheap IoT. Programmed via "
        "Arduino IDE (easy) or ESP-IDF (Espressif’s FreeRTOS-based SDK, more powerful) "
        "or PlatformIO. The ESP32 has plenty of peripherals: ADCs, DACs, I2C, SPI, UART, "
        "PWM, capacitive touch, and a ULP (Ultra-Low-Power) coprocessor that runs while "
        "the main cores sleep."))

    s.append(heading('WiFi on ESP32', 2))
    s.append(p(
        "The ESP-IDF WiFi stack is a FreeRTOS task. You configure it as a station "
        "(connect to an AP), an AP (other devices connect to it), or both. Common "
        "patterns: HTTP client (fetch data), HTTP server (serve a web page), MQTT "
        "(publish/subscribe to a broker), WebSocket (full-duplex). For Arduino users, "
        "the WiFi, HTTPClient, and PubSubClient libraries cover 90% of use cases."))

    s.append(heading('Over-the-air updates (OTA)', 2))
    s.append(p(
        "Production IoT devices need remote firmware updates. The ESP32 supports OTA: "
        "download a new firmware image over HTTPS, write it to the unused OTA partition, "
        "verify the signature, swap the boot partition, and reboot. The dual-bank flash "
        "layout makes this safe — if the new image is corrupt, the bootloader falls back "
        "to the previous one. This is the same pattern as Android A/B updates."))

    s.append(project_box('Bench: ESP32 WiFi Telemetry Dashboard', [
        ('Goal:', 'publish BME280 sensor data to a cloud dashboard via MQTT.'),
        ('Hardware:', 'ESP32 devkit + BME280 (I2C).'),
        ('Broker:', 'use a free HiveMQ or Mosquitto instance (or run mosquitto on a Pi).'),
        ('Code:', 'every 30 s: read sensor, publish JSON to topic sensors/esp32-01. '
                  'Connect a web dashboard (e.g., Node-RED or Grafana) that subscribes '
                  'and plots.'),
        ('Power:', 'measure current draw: deep sleep between readings, wake on timer. '
                   'Target: 100 μA average. Compute battery life on 2× AA.'),
        ('Extension:', 'add OTA — push a firmware update over MQTT and verify the device '
                       'updates and reboots.'),
    ]))

    s.append(checkpoint_box([
        "What is ESP-IDF? How does it differ from the Arduino-ESP32 core?",
        "How does ESP32 OTA work? Why is dual-bank flash important?",
        "Compute the battery life of an ESP32 that wakes every 60 s for 200 ms (200 mA active) "
        "and sleeps at 10 μA otherwise, on a 2000 mAh Li-ion cell.",
        "When would you choose ESP32 over STM32? When the reverse?",
    ]))

    # ── Module 4.10 ──
    s.append(heading('Module 4.10 — Phase 4 Capstone: Digital FSM + MCU Driver', 1))
    s.append(p('<b>Duration:</b> 10–14 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(project_box('Phase 4 Capstone: FPGA FSM + STM32 Sensor Driver', [
        ('Goal:', 'build a system where an FPGA FSM drives an STM32 over SPI to read sensors.'),
        ('Architecture:', 'STM32 (master) reads BME280 over I2C, formats the data, sends it '
                          'over SPI to the FPGA. The FPGA FSM receives the data, displays '
                          'temperature on 4 seven-segment displays, and triggers alarms on '
                          'LEDs if temperature/humidity are out of range.'),
        ('STM32 side:', 'HAL SPI master at 1 MHz. Use DMA for the SPI transfer. Pack '
                        'temp/humidity/pressure into a 12-byte packet.'),
        ('FPGA side:', 'Verilog SPI slave (synchronous to FPGA clock, with synchronizer for '
                       'SPI clock). FSM: IDLE → RECEIVING → UPDATE_DISPLAY → CHECK_ALARMS → IDLE.'),
        ('Integration:', 'wire the two boards together. Verify end-to-end: breathe on the '
                         'BME280 → temperature rises → display updates within 100 ms.'),
        ('Document:', 'full block diagram, Verilog source, STM32 source, integration notes, '
                      'photos, video. Save the project — you will reuse parts of it in '
                      'Phase 10 capstones.'),
    ]))

    s.append(checkpoint_box([
        "How would you debug an SPI link that works at 100 kHz but fails at 10 MHz?",
        "Why do you need a synchronizer on the SPI clock inside the FPGA?",
        "How does DMA improve SPI throughput? When does it not help?",
        "What is the difference between a Moore and Mealy FSM in Verilog implementation?",
    ]))

    s.append(pull_quote(
        'A flip-flop is a register. A shift register is a queue. A counter is an '
        'accumulator. A memory is an array. The hardware you are about to design is the '
        'data structures you already know — made of silicon instead of software.',
        'Volt, on digital primitives'))

    s.append(volt_says(
        'Phase 4 is done. You can write Verilog. Target an FPGA. Drive peripherals over '
        'SPI and I2C. Ship firmware on an STM32. Publish telemetry over WiFi. The '
        'capstone put all of it into one system. That integration is what separates a '
        'working engineer from a student. Phase 5 takes you into the frequency domain. '
        'Signals become spectra. Convolution becomes multiplication.',
        mood='story'))

    s.append(PageBreak())
    return s

# ════════════════════════════════════════════════════════════════════════════
# PHASE 5 — SIGNALS, SYSTEMS & DSP
# ════════════════════════════════════════════════════════════════════════════
def build_phase5():
    s = []
    s.append(heading('Phase 5 — Signals, Systems & DSP', 0))
    s.append(p('<b>Duration:</b> 7 weeks · <b>Modules:</b> 10 · <b>Goal:</b> master the '
               'frequency-domain machinery — Fourier, Laplace, Z, DFT, FFT — and build a '
               'real-time audio spectrum analyzer and EQ on the ESP32.', 'kicker'))

    s.append(p(
        "Signals and systems is the math that ties together circuits, control, "
        "communications, and DSP. Once you internalize the Fourier transform, half of "
        "EE becomes a single idea seen from different angles. This phase is the most "
        "math-heavy of the curriculum — but as a CS engineer, you already know the core "
        "algorithm (FFT) and the core data structure (a discrete sequence). The work is "
        "to connect them to the underlying linear algebra and differential equations."))

    s.append(volt_says(
        'Phase 5 has the biggest idea in this book. Every signal is a sum of sine waves. '
        'Once you accept that, half of EE collapses into one fact seen from different '
        'angles. Filters. Modulation. Sampling. Control. All of it is the Fourier '
        'transform wearing different costumes.',
        mood='story'))

    s.append(amp_says(
        'Like how any function can be written as a Taylor series, but with sine waves '
        'instead of polynomials?',
        mood='question'))

    s.append(volt_says(
        'Yes. Same idea. Different basis. Sines instead of powers of x.',
        mood='tip'))

    # ── Module 5.1 ──
    s.append(heading('Module 5.1 — Continuous-Time Signals and Systems', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(p(
        "A continuous-time signal x(t) is a function from ℝ to ℝ (or ℂ). A "
        "continuous-time system maps an input signal to an output signal: y(t) = T{x(t)}. "
        "Three properties define the useful class of systems: <b>linearity</b> "
        "(T{a·x₁ + b·x₂} = a·T{x₁} + b·T{x₂}), <b>time-invariance</b> (if x(t)→y(t), "
        "then x(t−τ)→y(t−τ)), and <b>causality</b> (y(t) depends only on x(τ) for τ ≤ t). "
        "A system with all three is an LTI causal system — the kind we can analyze with "
        "convolution and Fourier transforms."))

    s.append(heading('Impulse response and convolution', 2))
    s.append(p(
        "For an LTI system, the response to a unit impulse δ(t) completely characterizes "
        "the system. Call that response h(t). Then by linearity and time-invariance, the "
        "response to <i>any</i> input x(t) is the convolution: "
        "y(t) = (x * h)(t) = ∫x(τ)·h(t−τ)dτ. This is the central theorem of LTI theory."))
    s.append(formula_box(
        "y(t) = (x ∗ h)(t) = ∫<sub>−∞</sub><sup>+∞</sup> x(τ)·h(t − τ) dτ"))

    # ── Pixel diagram: impulse_response ──
    s.extend(diagram('impulse_response',
        caption='Impulse response h(t) of an LTI system. Convolve it with any input x(t) and you get the output y(t). The system’s complete fingerprint.'))
    # ── Pixel diagram: convolution_demo ──
    s.extend(diagram('convolution_demo',
        caption='Convolution demo — two signals sliding across each other. The overlap area at each shift is one output sample.'))

    s.append(cs_bridge(
        "<b>Convolution ↔ 1D image filter.</b> A 3×3 image convolution kernel and a 1D "
        "FIR filter are the same operation. Image: y[i,j] = ΣΣ h[k,l]·x[i−k, j−l]. "
        "Signal: y[n] = Σ h[k]·x[n−k]. The only difference is dimensionality. A blur "
        "kernel is a 2D moving-average filter; an edge-detection kernel is a 2D "
        "derivative filter; a Gaussian blur is a 2D low-pass. Once you see this, every "
        "image-processing library you have ever used becomes a collection of 2D filters "
        "you already understand."))

    s.append(project_box('Python: Convolution Sandbox', [
        ('Goal:', 'feel what convolution does, numerically.'),
        ('Tasks:', 'build h(t) = [1, 1, 1]/3 (moving average). Convolve with various '
                   'inputs: (a) a step, (b) a sine, (c) white noise. Plot input and output '
                   'side by side.'),
        ('Try different h:', 'a delta [1,0,0,...] — output = input. A difference '
                             'h=[1,−1] — a derivative. A Gaussian — a smoother.'),
        ('Insight:', 'convolution with h is linear filtering; the shape of h determines '
                     'what frequencies pass and what gets rejected.'),
    ]))

    s.append(checkpoint_box([
        "Define linearity, time-invariance, causality. Give an example of a system that violates each.",
        "What is an impulse response? Why does it characterize an LTI system?",
        "Compute the convolution of x = [1, 2, 3] and h = [1, 1]. (Should be [1, 3, 5, 3].)",
        "Why is convolution the natural operation for LTI systems?",
    ]))

    # ── Module 5.2 ──
    s.append(heading('Module 5.2 — LTI Systems: Convolution and Eigenfunctions', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Foundation', 'kicker'))

    s.append(p(
        "The key insight that makes frequency-domain analysis possible: complex "
        "exponentials e<sup>jωt</sup> are eigenfunctions of any LTI system. Feed "
        "e<sup>jωt</sup> into a system with impulse response h(t), and the output is "
        "H(jω)·e<sup>jωt</sup> — the same function, scaled by a complex number H(jω). "
        "That complex number is the <b>frequency response</b> of the system. This is "
        "why sinusoids are special — they pass through LTI systems unchanged in shape, "
        "only scaled and shifted in phase."))
    s.append(formula_box(
        "H(jω) = ∫<sub>−∞</sub><sup>+∞</sup> h(t)·e<sup>−jωt</sup> dt &nbsp;&nbsp; "
        "(Fourier transform of h)"))

    s.append(p(
        "Once you accept that complex exponentials are eigenfunctions, every signal can "
        "be decomposed into a sum of them (Fourier transform), each component scaled by "
        "H(jω) independently, and the output reconstructed by the inverse transform. "
        "Convolution in time = multiplication in frequency. This is the single most "
        "important identity in signal processing: <b>y(t) = (x ∗ h)(t) ↔ Y(jω) = X(jω)·H(jω)</b>."))

    s.append(checkpoint_box([
        "Show that e^(jωt) is an eigenfunction of any LTI system. What is the eigenvalue?",
        "State the convolution theorem. Why is it useful?",
        "Define H(jω). What is its magnitude? Its phase?",
        "How do you find H(jω) for an RC low-pass from its differential equation?",
    ]))

    # ── Module 5.3 ──
    s.append(heading('Module 5.3 — Fourier Series and CTFT', 1))
    s.append(p('<b>Duration:</b> 8–10 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "The Fourier series represents a periodic signal as a sum of harmonically "
        "related sinusoids: x(t) = Σ<sub>k</sub> c_k·e<sup>jkω₀t</sup>, where ω₀ = 2π/T "
        "is the fundamental. The coefficients c_k = (1/T)·∫<sub>0</sub><sup>T</sup> x(t)·e<sup>−jkω₀t</sup>dt. "
        "The Fourier transform generalizes this to aperiodic signals: X(jω) = ∫x(t)·e<sup>−jωt</sup>dt, "
        "x(t) = (1/2π)·∫X(jω)·e<sup>jωt</sup>dω."))

    s.append(heading('Fourier transform pairs you must know', 2))
    s.append(make_table([
        ['Time domain x(t)','Frequency domain X(jω)','What'],
        ['δ(t) (impulse)','1 (flat)','An impulse contains all frequencies equally.'],
        ['1 (constant)','2π·δ(ω)','A DC signal has only ω=0.'],
        ['cos(ω₀t)','π·[δ(ω−ω₀) + δ(ω+ω₀)]','A cosine = two spectral lines.'],
        ['sin(ω₀t)','π/j·[δ(ω−ω₀) − δ(ω+ω₀)]','A sine = two spectral lines, odd.'],
        ['rect(t/τ)','τ·sinc(ωτ/2)','A pulse = sinc spectrum.'],
        ['e<sup>−at</sup>u(t)','1/(a + jω)','Exponential decay = low-pass.'],
        ['e<sup>−a|t|</sup>','2a/(a² + ω²)','Two-sided decay.'],
        ['Σδ(t − nT)','(2π/T)·Σδ(ω − k·2π/T)','Impulse train ↔ impulse train.'],
    ], col_widths=[45*mm, 60*mm, 65*mm]))

    s.append(heading('Properties that make Fourier useful', 2))
    s.append(bullet_list([
        "<b>Linearity:</b> a·x₁ + b·x₂ ↔ a·X₁ + b·X₂.",
        "<b>Time shift:</b> x(t−τ) ↔ e^(−jωτ)·X(jω) — phase shift only, magnitude unchanged.",
        "<b>Frequency shift:</b> e^(jω₀t)·x(t) ↔ X(j(ω−ω₀)) — basis of AM modulation.",
        "<b>Time scaling:</b> x(a·t) ↔ (1/|a|)·X(jω/a) — compress in time, expand in frequency. This is why a short pulse has wide spectrum.",
        "<b>Convolution:</b> x*h ↔ X·H — convolution in time = multiplication in frequency.",
        "<b>Multiplication:</b> x·y ↔ (1/2π)·X*Y — multiplication in time = convolution in frequency. Basis of modulation.",
        "<b>Parseval:</b> ∫|x(t)|²dt = (1/2π)·∫|X(jω)|²dω — energy conserved.",
    ]))

    s.append(project_box('Python: Fourier Series of a Square Wave', [
        ('Goal:', 'see how a square wave is built from sinusoids.'),
        ('Tasks:', 'synthesize a 1 kHz square wave by summing the first N odd harmonics '
                   '(1, 3, 5, 7, ...). Plot for N = 1, 3, 7, 21, 101. Watch the square '
                   'emerge.'),
        ('Insight:', 'a square wave = (4/π)·Σ(1/(2k+1))·sin((2k+1)·ω₀t). Each additional '
                     'harmonic reduces the ripple.'),
        ('Extension:', 'do the same for a triangle, sawtooth, and a half-wave rectified sine. '
                       'Compare the spectra. Notice that smoother time-domain shapes have '
                       'faster spectral rolloff.'),
    ]))

    s.append(checkpoint_box([
        "State the Fourier transform and its inverse.",
        "What is the Fourier transform of a rectangle pulse? Of a delta function?",
        "State the convolution theorem and the multiplication theorem.",
        "Why does a shorter pulse have a wider spectrum?",
        "Compute the Fourier series of a square wave. How fast do the coefficients decay?",
    ]))

    # ── Module 5.4 ──
    s.append(heading('Module 5.4 — Laplace Transform and the s-Domain', 1))
    s.append(p('<b>Duration:</b> 8–10 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "The Laplace transform generalizes the Fourier transform by allowing complex "
        "frequencies s = σ + jω. X(s) = ∫x(t)·e<sup>−st</sup>dt. The Laplace transform "
        "exists for signals that don’t have a Fourier transform (e.g., growing exponentials) "
        "and provides information about stability (poles in the left half s-plane → "
        "stable). The Fourier transform is the Laplace transform evaluated along the "
        "jω axis (σ = 0)."))

    s.append(heading('Why Laplace? Differential equations become algebra', 2))
    s.append(p(
        "Differentiation in time = multiplication by s. Integration in time = division "
        "by s. The Laplace transform converts a linear ODE with constant coefficients "
        "into an algebraic equation in s. Solve the algebra, invert the transform, "
        "done. This is how every circuit is analyzed in the frequency domain — replace "
        "C by 1/(sC), L by sL, R stays R, and the circuit becomes a resistor network "
        "in s. The same idea extends to mechanical systems (mass ↔ inductor, spring ↔ "
        "capacitor, damper ↔ resistor) — that is why the same math models circuits, "
        "vibrations, and control systems."))

    s.append(heading('Poles, zeros, and stability', 2))
    s.append(p(
        "A transfer function H(s) is a ratio of polynomials in s. The roots of the "
        "numerator are <b>zeros</b> (H → 0 at those s values). The roots of the "
        "denominator are <b>poles</b> (H → ∞). Poles in the left half plane (real part "
        "negative) correspond to decaying exponentials in time — stable. Poles on the "
        "jω axis correspond to sustained oscillations. Poles in the right half plane "
        "correspond to growing exponentials — unstable. This is the entire stability "
        "story of linear systems in one picture."))
    s.append(formula_box(
        "H(s) = N(s) / D(s) = K · Π(s − z<sub>i</sub>) / Π(s − p<sub>k</sub>)"))

    s.append(heading('Laplace pairs you must know', 2))
    s.append(make_table([
        ['x(t)','X(s)','ROC'],
        ['δ(t)','1','all s'],
        ['u(t) (unit step)','1/s','Re(s) > 0'],
        ['e^(−at)·u(t)','1/(s+a)','Re(s) > −a'],
        ['t·e^(−at)·u(t)','1/(s+a)²','Re(s) > −a'],
        ['sin(ωt)·u(t)','ω/(s² + ω²)','Re(s) > 0'],
        ['cos(ωt)·u(t)','s/(s² + ω²)','Re(s) > 0'],
        ['e^(−at)·sin(ωt)·u(t)','ω/((s+a)² + ω²)','Re(s) > −a'],
    ], col_widths=[45*mm, 50*mm, 30*mm]))

    s.append(project_box('Python: Solve an RLC Transient with Laplace', [
        ('Goal:', 'verify that the Laplace method gives the same answer as direct ODE solution.'),
        ('Circuit:', 'series RLC, R=10Ω, L=1mH, C=10μF, step input V_s=5V at t=0.'),
        ('Laplace method:', 'write H(s) = (1/LC) / (s² + (R/L)s + 1/(LC)). '
                            'Find poles: s = −5000 ± j·8660 (underdamped). '
                            'Inverse Laplace: v_C(t) = 5·[1 − e^(−5000t)·(cos 8660t + 0.577·sin 8660t)].'),
        ('Verify:', 'compare to scipy.integrate.odeint on the original ODE. The two should '
                    'overlay exactly.'),
        ('LTspice:', 'run transient sim. Overlay the Python curves.'),
    ]))

    s.append(checkpoint_box([
        "Why does the Laplace transform use s = σ + jω instead of just jω?",
        "How do you determine stability from pole locations?",
        "Compute the Laplace transform of e^(−2t)·sin(3t)·u(t).",
        "Find the poles of H(s) = 100/(s² + 10s + 100). Classify the response.",
        "Why is differentiation in time = multiplication by s in Laplace domain?",
    ]))

    # ── Module 5.5 ──
    s.append(heading('Module 5.5 — Sampling Theorem and Discrete-Time Signals', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Sampling converts a continuous signal x(t) into a discrete sequence x[n] = x(n·T), "
        "where T = 1/f_s is the sample period. The <b>Sampling Theorem</b> (Nyquist–Shannon): "
        "a band-limited signal with maximum frequency f_max can be perfectly reconstructed "
        "from samples taken at f_s ≥ 2·f_max. The minimum rate 2·f_max is the <b>Nyquist "
        "rate</b>. Below it, aliasing occurs — high-frequency content folds back into the "
        "baseband and is irrecoverably mixed with the signal."))
    s.append(formula_box(
        "f<sub>s</sub> ≥ 2 · f<sub>max</sub> &nbsp;&nbsp; (Nyquist criterion)"))

    s.append(cs_bridge(
        "<b>Aliasing ↔ texture mapping at wrong mip level.</b> In graphics, sampling a "
        "high-frequency texture without mip-mapping produces moiré patterns — aliasing. "
        "The Nyquist theorem is the DSP version: you must low-pass before you sample, "
        "or high frequencies will alias. The same math underlies anti-aliasing in graphics "
        "(MSAA, SSAA) and anti-aliasing filters in ADCs. An ADC without an anti-alias "
        "filter is broken by construction."))

    s.append(heading('Anti-alias filtering', 2))
    s.append(p(
        "Before sampling, you must low-pass the signal at f_s/2 (the Nyquist frequency). "
        "In practice, the filter is not a brick wall, so you sample at 2.5–10× the highest "
        "frequency of interest and use the extra margin for the filter roll-off. Audio "
        "CDs sample at 44.1 kHz to cover 20 kHz audio with a 2.1 kHz transition band. "
        "Oversampling sigma-delta ADCs sample at 64× or 128× the Nyquist rate and use "
        "digital filtering to decimate — much easier than building a sharp analog filter."))

    s.append(heading('Reconstruction — the DAC and the zero-order hold', 2))
    s.append(p(
        "Reconstruction converts x[n] back to x(t). The ideal interpolator is the sinc "
        "function: x(t) = Σx[n]·sinc((t − nT)/T). Real DACs use a zero-order hold (ZOH) "
        "— each sample is held constant until the next. ZOH introduces a sinc-shaped "
        "frequency response with nulls at multiples of f_s. A reconstruction filter "
        "(analog low-pass at f_s/2) smooths the staircase."))

    s.append(project_box('Python: Aliasing Demo', [
        ('Goal:', 'see aliasing numerically.'),
        ('Tasks:', 'sample a 10 kHz sine at 8 kHz. The samples should look like a 2 kHz '
                   'sine (10 − 8 = 2). Verify by FFT.'),
        ('Now:', 'sample at 25 kHz. No aliasing; the FFT shows a clean 10 kHz peak.'),
        ('Anti-alias:', 'add a 4 kHz low-pass filter before the 8 kHz sampler. The 10 kHz '
                        'sine is filtered out; the samples are near zero. No alias.'),
        ('Insight:', 'the anti-alias filter is non-negotiable. Sample rate alone is not '
                     'enough — you must also filter.'),
    ]))

    s.append(checkpoint_box([
        "State the Nyquist–Shannon sampling theorem.",
        "What is aliasing? How do you prevent it?",
        "A signal has energy up to 50 kHz. What is the minimum sample rate?",
        "Why does a CD use 44.1 kHz sampling for 20 kHz audio?",
        "What is a zero-order hold? What is its frequency response?",
    ]))

    # ── Module 5.6 ──
    s.append(heading('Module 5.6 — Z-Transform and Discrete-Time Systems', 1))
    s.append(p('<b>Duration:</b> 7–9 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "The Z-transform is the discrete-time analog of the Laplace transform: "
        "X(z) = Σ<sub>n</sub> x[n]·z<sup>−n</sup>. The complex variable z is related to "
        "s by z = e<sup>sT</sup>. The jω axis in the s-plane maps to the unit circle in "
        "the z-plane. Left-half s-plane (stable) maps to inside the unit circle. Poles "
        "inside |z|=1 are stable. Poles outside are unstable. Poles on the unit circle "
        "are marginally stable (oscillatory)."))
    s.append(formula_box(
        "z = e<sup>sT</sup> &nbsp;&nbsp;|&nbsp;&nbsp; "
        "X(z) = Σ<sub>n=−∞</sub><sup>+∞</sup> x[n]·z<sup>−n</sup>"))

    # ── Pixel diagram: band-pass filter response (digital filter context) ──
    s.extend(diagram('bandpass',
        caption='Digital band-pass response — poles near the unit circle at angle ±ω₀ produce this shape.'))

    s.append(heading('Difference equations and transfer functions', 2))
    s.append(p(
        "A discrete LTI system is described by a linear constant-coefficient difference "
        "equation: y[n] = −Σ<sub>k=1</sub><sup>N</sup> a_k·y[n−k] + Σ<sub>k=0</sub><sup>M</sup> b_k·x[n−k]. "
        "Taking the Z-transform (zero initial conditions): Y(z)·(1 + Σa_k·z<sup>−k</sup>) = "
        "X(z)·Σb_k·z<sup>−k</sup>. So H(z) = Y(z)/X(z) = (Σb_k·z<sup>−k</sup>)/(1 + Σa_k·z<sup>−k</sup>). "
        "If all a_k = 0: FIR (finite impulse response) — the filter is always stable. "
        "If some a_k ≠ 0: IIR (infinite impulse response) — stability depends on pole "
        "locations."))

    s.append(project_box('Python: Filter a Signal with IIR', [
        ('Goal:', 'design and apply a 1st-order IIR low-pass.'),
        ('Filter:', 'y[n] = (1−α)·y[n−1] + α·x[n], where α = 1 − e^(−2π·f_c/f_s). '
                    'This is a one-pole low-pass at f_c.'),
        ('Apply:', 'filter a signal that is 50 Hz + 1 kHz at f_s = 8 kHz with f_c = 200 Hz. '
                   'The 1 kHz should be attenuated, the 50 Hz should pass.'),
        ('Compare to FIR:', 'design an FIR with the same cutoff (scipy.signal.firwin) and '
                            'apply. Compare the outputs and the computational cost.'),
        ('Insight:', 'IIR is cheaper (fewer coefficients) but has phase nonlinearity. '
                     'FIR is exactly linear phase but needs more taps for the same selectivity.'),
    ]))

    s.append(checkpoint_box([
        "What is the relationship between s-plane and z-plane?",
        "How do you test stability of an IIR filter?",
        "Why are FIR filters always stable? What is the cost?",
        "Convert the analog H(s) = 1/(s+1) to a digital H(z) using the bilinear transform "
        "with f_s = 1000 Hz. Where is the pole?",
    ]))

    # ── Module 5.7 ──
    s.append(heading('Module 5.7 — DTFT, DFT, and FFT', 1))
    s.append(p('<b>Duration:</b> 8–10 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(pull_quote(
        'Every signal is a sum of sinusoids. This is the single most important sentence '
        'in electrical engineering — every other topic in the second half of the '
        'curriculum is a corollary.',
        'Volt, on Fourier'))

    s.append(cs_bridge(
        "<b>FFT ↔ divide-and-conquer sorting.</b> The FFT is the divide-and-conquer "
        "algorithm for the DFT, exactly as mergesort is for sorting. The DFT is O(N²); "
        "the FFT is O(N log N). The radix-2 FFT splits an N-point DFT into two N/2-point "
        "DFTs (even and odd samples), recursively. Cooley and Tukey rediscovered this "
        "in 1965; Gauss knew it in 1805. The same butterfly pattern appears in fast "
        " Walsh-Hadamard transforms, in JPEG’s DCT, and in number-theoretic transforms "
        "for cryptographic multiplication."))

    # ── Pixel diagram: fft_butterfly ──
    s.extend(diagram('fft_butterfly',
        caption='FFT butterfly — the radix-2 Cooley-Tukey diagram. O(N log N) instead of O(N²); the most important algorithm in DSP.'))
    s.append(heading('DFT definition', 2))
    s.append(p(
        "The DFT of an N-point sequence x[n] is X[k] = Σ<sub>n=0</sub><sup>N−1</sup> x[n]·e<sup>−j2πkn/N</sup>, "
        "for k = 0, ..., N−1. The inverse is x[n] = (1/N)·ΣX[k]·e<sup>j2πkn/N</sup>. The "
        "DFT treats x[n] as one period of a periodic signal. Bin k corresponds to "
        "frequency f_k = k·f_s/N. The DFT is sampled in frequency — between bins, "
        "energy leaks into adjacent bins (spectral leakage). Windowing (Hann, Hamming, "
        "Blackman) reduces leakage at the cost of widening the main lobe."))
    s.append(formula_box(
        "X[k] = Σ<sub>n=0</sub><sup>N−1</sup> x[n]·e<sup>−j2πkn/N</sup> &nbsp;&nbsp;|&nbsp;&nbsp; "
        "f<sub>k</sub> = k·f<sub>s</sub>/N"))

    s.append(volt_says(
        'The FFT is the one algorithm most responsible for the digital age. Without it, '
        'MP3 audio would be impossible. JPEG images would be huge. MRI scans would take '
        'minutes instead of seconds. 5G would not exist. Cooley and Tukey rediscovered '
        'it in 1965. Gauss knew it in 1805. It\'s mergesort applied to complex '
        'exponentials.',
        mood='insight'))

    # ── Pixel diagrams: sine + square wave (FFT input/output exemplars) ──
    s.extend(diagram('sine_wave',
        caption='A pure sinusoid in time → a single peak in the FFT. The eigenfunction of every LTI system.'))
    s.extend(diagram('square_wave',
        caption='A square wave decomposes into odd harmonics (Fourier series): f, 3f, 5f, 7f, ... at amplitudes 1, 1/3, 1/5, ...'))

    s.append(heading('FFT — the algorithm', 2))
    s.append(p(
        "The radix-2 Cooley-Tukey FFT requires N to be a power of 2. It splits the DFT "
        "into even and odd samples: X[k] = E[k] + W<sub>N</sub><sup>k</sup>·O[k], where "
        "E is the N/2-point DFT of even samples, O is the N/2-point DFT of odd samples, "
        "and W<sub>N</sub> = e<sup>−j2π/N</sup> is the twiddle factor. Recurse down to "
        "1-point DFTs (trivial). The recursion has log₂(N) levels, each doing O(N) "
        "work — total O(N log N)."))

    s.append(project_box('Python: Real-Time Audio Spectrum Analyzer', [
        ('Goal:', 'build a real-time spectrum analyzer on your laptop.'),
        ('Tasks:', '(1) capture audio from microphone using sounddevice. '
                   '(2) window each 1024-sample block with Hann. '
                   '(3) FFT. (4) plot magnitude in dB vs frequency. '
                   '(5) repeat 30 times per second.'),
        ('Verify:', 'whistle, clap, play a tone — confirm peaks appear at the right '
                    'frequencies. Confirm a square wave has odd harmonics.'),
        ('Extension:', 'add a waterfall display (time on x, frequency on y, magnitude as color).'),
    ]))

    s.append(checkpoint_box([
        "What is the difference between DTFT, DFT, and FFT?",
        "What is spectral leakage? How do you reduce it?",
        "Compute the DFT of x = [1, 1, 0, 0]. (Hint: it is real.)",
        "Why does FFT require N to be a power of 2? What if it isn’t?",
        "How many complex multiplications does an N-point FFT do? Compare to direct DFT.",
    ]))

    # ── Module 5.8 ──
    s.append(heading('Module 5.8 — FIR and IIR Filter Design', 1))
    s.append(p('<b>Duration:</b> 8–10 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(heading('FIR design — the windowed sinc method', 2))
    s.append(p(
        "An ideal low-pass filter has a brick-wall frequency response, which corresponds "
        "to an infinite sinc in time. Truncate the sinc to N taps and window it (Hann, "
        "Hamming, Blackman) to reduce sidelobes. The resulting filter has linear phase "
        "(symmetric impulse response), which is critical for audio and data applications. "
        "Filter length N sets the transition bandwidth: Δf ≈ 4·f_s/N for a Hann window."))

    s.append(heading('IIR design — bilinear transform of analog prototypes', 2))
    s.append(p(
        "Design an analog filter (Butterworth, Chebyshev, elliptic) using classic tables "
        "or scipy.signal.butter. Transform to digital via the bilinear transform: "
        "s → (2/T)·(1 − z<sup>−1</sup>)/(1 + z<sup>−1</sup>). This preserves the magnitude "
        "response but warps the frequency axis — pre-warp the cutoff before designing. "
        "IIR filters are much shorter than FIR for the same selectivity, but they have "
        "nonlinear phase and can be unstable."))

    s.append(heading('Choosing FIR vs IIR', 2))
    s.append(make_table([
        ['Property','FIR','IIR'],
        ['Stability','Always','Depends on poles'],
        ['Phase','Exactly linear (if symmetric)','Generally nonlinear'],
        ['Order for same selectivity','High (100+ taps)','Low (5–10 coefficients)'],
        ['Computational cost','Higher','Lower'],
        ['Design ease','Easy (windowed sinc, Parks-McClellan)','Easy (analog + bilinear)'],
        ['Feedback','No','Yes — can oscillate if quantized'],
        ['Typical use','Audio, data, image','Control, comms, real-time'],
    ], col_widths=[40*mm, 65*mm, 65*mm]))

    s.append(project_box('Python + ESP32: Real-Time Audio EQ', [
        ('Goal:', 'build a 3-band (bass, mid, treble) audio equalizer.'),
        ('Frontend:', 'ESP32 with I2S MEMS mic (INMP441) sampling at 16 kHz. '
                      'Output via I2S DAC (MAX98357A) to a speaker.'),
        ('Filter:', 'three parallel IIR filters (low-pass at 200 Hz, band-pass at '
                    '1 kHz, high-pass at 5 kHz), each with a gain control. Sum the outputs.'),
        ('Implementation:', 'ESP32 with ESP-IDF. Use I2S DMA. Apply the filters sample-by-sample '
                            'in the I2S callback. ~0.5 μs per sample per filter.'),
        ('Verify:', 'feed a sweep from 20 Hz to 8 kHz. Adjust the bass knob — the low-frequency '
                    'output should change. Same for mid and treble.'),
        ('Extension:', 'add a small OLED display showing the FFT spectrum in real time.'),
    ]))

    s.append(checkpoint_box([
        "Design a 64-tap FIR low-pass at 2 kHz with f_s = 16 kHz using a Hann window.",
        "Convert a 2nd-order Butterworth analog low-pass at 1 rad/s to digital at f_s = 1 kHz via bilinear.",
        "Why is linear phase important for audio? Why can we tolerate nonlinear phase in control?",
        "Why do IIR filters risk instability when implemented with fixed-point arithmetic?",
    ]))

    # ── Pixel diagram: fir_filter ──
    s.extend(diagram('fir_filter',
        caption='FIR filter — tapped delay line, weighted sum. Always stable; exactly linear phase if symmetric.'))
    # ── Pixel diagram: iir_filter ──
    s.extend(diagram('iir_filter',
        caption='IIR filter — like FIR but with feedback. Fewer coefficients for same selectivity, but check pole stability.'))

    # ── Module 5.9 ──
    s.append(heading('Module 5.9 — Adaptive Filters (Intro)', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(p(
        "An adaptive filter updates its coefficients in real time to minimize an error "
        "signal. The classic algorithm is LMS (Least Mean Squares): w[n+1] = w[n] + μ·e[n]·x[n], "
        "where w is the coefficient vector, μ is the step size, e[n] = d[n] − w<sup>T</sup>·x[n] "
        "is the error, d is the desired signal, and x is the input. Applications: noise "
        "cancellation (headphones), echo cancellation (speakerphones), channel equalization "
        "(modems), system identification."))
    s.append(formula_box(
        "w[n+1] = w[n] + μ · e[n] · x[n] &nbsp;&nbsp;|&nbsp;&nbsp; "
        "e[n] = d[n] − w<sup>T</sup>·x[n]"))

    s.append(cs_bridge(
        "<b>LMS ↔ stochastic gradient descent.</b> LMS is literally SGD on the mean-square "
        "error cost J = E[|e|²]. The gradient is −2·e[n]·x[n]; the update w += μ·e·x is "
        "SGD with learning rate μ. The same algorithm powers every neural network you "
        "have ever trained. The convergence condition (μ small enough, input whitened) "
        "is the same as for SGD."))

    s.append(project_box('Python: Noise Cancellation Demo', [
        ('Goal:', 'cancel a tonal noise from a signal.'),
        ('Setup:', 'signal = 1 kHz tone + white noise. Reference input = the 1 kHz tone '
                   '(think: a microphone captures ambient noise separately).'),
        ('LMS:', '32-tap FIR filter, μ = 0.01. Filter the reference; subtract from signal. '
                'The 1 kHz tone should cancel; the white noise remains.'),
        ('Verify:', 'plot the spectrum before and after. The 1 kHz peak should drop by '
                    '40+ dB.'),
    ]))

    s.append(checkpoint_box([
        "What is an adaptive filter? Name three applications.",
        "Write the LMS update rule. Why does it work?",
        "What is the convergence condition on μ?",
        "How is LMS related to SGD?",
    ]))

    # ── Module 5.10 ──
    s.append(heading('Module 5.10 — Phase 5 Capstone: Software-Defined Audio', 1))
    s.append(p('<b>Duration:</b> 12–16 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(project_box('Phase 5 Capstone: Real-Time Audio Spectrum Analyzer + EQ', [
        ('Goal:', 'combine FFT analysis with real-time filtering on the ESP32.'),
        ('Architecture:', 'I2S mic → 50% overlap buffer → 256-point Hann window → FFT → '
                          'OLED display magnitude in dB. Simultaneously, 5-band IIR EQ '
                          'filters the audio; output via I2S DAC.'),
        ('UI:', 'rotary encoder adjusts the selected band; button cycles bands. '
                'OLED shows: spectrum bar graph (top half), EQ band gains (bottom half).'),
        ('Performance:', 'FFT every 16 ms (60 Hz display refresh). EQ filters run '
                         'sample-by-sample. CPU load should be under 50% on ESP32 dual-core.'),
        ('Document:', 'schematic, PCB if you make one, source code, measurement plots '
                      '(frequency response of each EQ band), video demo. Save everything.'),
    ]))

    s.append(checkpoint_box([
        "Sketch the signal flow from microphone to speaker.",
        "How do you ensure the FFT does not underrun the I2S output?",
        "What is the latency through the system? How would you reduce it?",
        "Why 50% overlap on the FFT windows?",
    ]))

    s.append(volt_says(
        'Phase 5 is done. You can break any signal into its spectrum. You can design '
        'filters. You can build a real-time audio analyzer. You can ship DSP code on an '
        'ESP32. Phase 6 takes these frequency-domain tools and applies them to the '
        'hardest problem in engineering. Making a physical system behave the way you '
        'want. Despite noise. Despite disturbance. Using feedback.',
        mood='story'))

    s.append(PageBreak())
    return s

# ════════════════════════════════════════════════════════════════════════════
# PHASE 6 — CONTROL SYSTEMS & ROBOTICS
# ════════════════════════════════════════════════════════════════════════════
def build_phase6():
    s = []
    s.append(heading('Phase 6 — Control Systems & Robotics', 0))
    s.append(p('<b>Duration:</b> 6 weeks · <b>Modules:</b> 10 · <b>Goal:</b> master '
               'classical and modern control — root locus, Bode/Nyquist, PID, state-space — '
               'and apply it to a closed-loop motor control and a line-following robot.', 'kicker'))

    s.append(p(
        "Control theory is the engineering of feedback. A plant (the thing being "
        "controlled) has dynamics; a sensor measures the output; a controller computes "
        "the input that drives the output to a target. The math is Laplace transforms "
        "(Phase 5), stability via pole locations, and frequency-response tools (Bode, "
        "Nyquist). Robotics adds kinematics — the geometric relationship between joint "
        "angles and end-effector position. As a CS engineer, you have already seen "
        "feedback in error-correcting codes, in TCP congestion control, and in iterative "
        "optimization; control theory is the same idea applied to physical systems."))

    s.append(volt_says(
        'Feedback is everywhere. TCP congestion control is a feedback loop. Hash table '
        'resizing is a feedback loop. Iterative compilers are feedback loops. Control '
        'theory gives the math a proper name. It lets you prove a loop will be stable. '
        'Not just hope it converges.',
        mood='story'))

    s.append(amp_says(
        'So control theory is the formal version of what I do intuitively in distributed '
        'systems?',
        mood='question'))

    s.append(volt_says(
        'Yes. Same loops. With proofs.',
        mood='tip'))

    # ── Module 6.1 ──
    s.append(heading('Module 6.1 — Feedback, Modeling, Transfer Functions', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "A feedback system has three blocks: plant P(s), sensor H(s), controller C(s). "
        "The closed-loop transfer function is "
        "T(s) = C·P / (1 + C·P·H). The denominator 1 + C·P·H is the <b>characteristic "
        "equation</b>; its roots are the closed-loop poles. Stability requires all closed-"
        "loop poles to be in the left half plane."))

    s.append(formula_box(
        "T(s) = C(s)·P(s) / (1 + C(s)·P(s)·H(s)) &nbsp;&nbsp;|&nbsp;&nbsp; "
        "L(s) = C(s)·P(s)·H(s) (loop gain)"))

    # ── Pixel diagram: feedback_loop ──
    s.extend(diagram('feedback_loop',
        caption='Negative feedback loop — setpoint → error → controller → plant → output. Sensor closes the loop. Stability depends on the loop gain L(s).'))

    s.append(heading('Modeling physical systems', 2))
    s.append(p(
        "Every physical system has a model. Mechanical: mass-damper-spring is "
        "m·ẍ + b·ẋ + k·x = F. Electrical: RLC is L·q̈ + R·q̇ + (1/C)·q = V. Thermal: "
        "C·dθ/dt = (θ_env − θ)/R. Fluid: tank level dynamics. They are all second-order "
        "linear ODEs — the same math. The art of modeling is choosing what to include "
        "and what to ignore. A model that is too simple will not capture the behavior "
        "you care about; a model that is too complex is unusable for design."))

    s.append(checkpoint_box([
        "Sketch a standard negative-feedback block diagram. Label plant, sensor, controller.",
        "Derive T(s) = CP / (1 + CPH). What is the characteristic equation?",
        "Write the ODE for a mass-spring-damper. What is the transfer function X(s)/F(s)?",
        "Why is modeling called an ‘art’?",
    ]))

    # ── Module 6.2 ──
    s.append(heading('Module 6.2 — Stability: Routh-Hurwitz and Pole Locations', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "A linear system is stable if and only if all poles of its transfer function "
        "are in the open left half plane (real part strictly negative). For low-order "
        "systems, you can find the poles directly. For higher-order systems, the "
        "Routh-Hurwitz criterion tells you how many poles are in the right half plane "
        "without solving for them — you build a Routh array from the polynomial "
        "coefficients and count sign changes in the first column."))

    s.append(heading('Routh-Hurwitz procedure', 2))
    s.append(p(
        "For a polynomial a_n·s<sup>n</sup> + a_{n−1}·s<sup>n−1</sup> + ... + a_0, "
        "build the Routh array: first two rows are the coefficients in alternation. "
        "Each subsequent row is computed from the two rows above. The number of sign "
        "changes in the first column equals the number of right-half-plane poles. Zero "
        "sign changes means stable."))

    s.append(project_box('Python: Verify Routh-Hurwitz Numerically', [
        ('Goal:', 'practice Routh-Hurwitz on 5 characteristic equations.'),
        ('Tasks:', 'for each polynomial, build the Routh array by hand and predict the '
                   'number of RHP poles. Then verify with numpy.roots.'),
        ('Examples:', 's³+3s²+3s+1 (stable), s³+s²+s+3 (unstable, 2 RHP), s⁴+2s³+3s²+4s+5 (unstable), etc.'),
        ('Pass:', 'all 5 hand-computed answers match numpy.'),
    ]))

    s.append(checkpoint_box([
        "State the Routh-Hurwitz stability criterion.",
        "Build the Routh array for s³ + 4s² + 5s + 2. How many RHP poles?",
        "Why is a single pole at s=0 considered marginally stable, not stable?",
        "Why is checking pole locations sufficient for linear stability?",
    ]))

    # ── Module 6.3 ──
    s.append(heading('Module 6.3 — Time-Domain Response and Steady-State Error', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "The step response of a second-order system T(s) = ω_n²/(s² + 2ζω_n·s + ω_n²) "
        "has four key metrics: rise time t_r (10% to 90%), peak time t_p = π/ω_d, "
        "percent overshoot %OS = e^(−πζ/√(1−ζ²))·100%, settling time t_s (2% criterion) ≈ "
        "4/(ζω_n). These four numbers describe the transient; they are what you tune "
        "the controller to meet."))

    s.append(formula_box(
        "t<sub>r</sub> ≈ 1.8 / ω<sub>n</sub> &nbsp;&nbsp;|&nbsp;&nbsp; "
        "%OS = e<sup>−πζ/√(1−ζ²)</sup>·100% &nbsp;&nbsp;|&nbsp;&nbsp; "
        "t<sub>s</sub> ≈ 4 / (ζ·ω<sub>n</sub>)"))

    s.append(heading('Steady-state error and system type', 2))
    s.append(p(
        "The steady-state error to a step input is e_ss = 1/(1 + K_p), where K_p is the "
        "position error constant. For a ramp input, e_ss = 1/K_v (velocity error "
        "constant). For a parabola, e_ss = 1/K_a. A system is <b>type N</b> if it has N "
        "poles at the origin (integrators in the loop). Type 0: finite step error, "
        "infinite ramp error. Type 1: zero step error, finite ramp error. Type 2: zero "
        "step and ramp error, finite parabola error. Adding an integrator increases "
        "system type — and reduces stability margin. The trade-off is fundamental."))

    s.append(project_box('Python: Step Response Comparison', [
        ('Goal:', 'visualize how ζ and ω_n affect step response.'),
        ('Tasks:', 'plot step responses for ζ = 0.1, 0.3, 0.5, 0.7, 1.0, 1.5 at ω_n = 1. '
                   'Mark rise time, overshoot, settling time on each.'),
        ('Verify:', 'confirm the formulas t_r ≈ 1.8/ω_n, %OS = e^(−πζ/√(1−ζ²))·100, '
                    't_s ≈ 4/(ζω_n) match the simulations.'),
        ('Extension:', 'design a 2nd-order system to meet spec: t_s < 1 s, %OS < 10%. '
                       'Find ζ and ω_n. (Answer: ζ > 0.6, ω_n > 6.7 rad/s.)'),
    ]))

    s.append(checkpoint_box([
        "Define rise time, peak time, overshoot, settling time.",
        "Compute %OS for ζ = 0.5. Compute t_s for ζω_n = 2.",
        "Define system type. What is the steady-state error of a Type 1 system to a step? To a ramp?",
        "Why does adding an integrator increase system type but reduce stability?",
    ]))

    # ── Module 6.4 ──
    s.append(heading('Module 6.4 — Root Locus Design', 1))
    s.append(p('<b>Duration:</b> 7–9 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Root locus is a graphical method for seeing how the closed-loop poles move as "
        "a single parameter (typically a gain K) varies from 0 to ∞. The locus starts "
        "at the open-loop poles (K=0) and ends at the open-loop zeros (K=∞). The "
        "rules for sketching by hand: real-axis segments to the left of an odd number "
        "of OL poles/zeros; asymptotes at angles (2k+1)π/(n−m) centered at the centroid "
        "(Σp_i − Σz_i)/(n−m); breakaway points where dK/ds = 0."))

    s.append(formula_box(
        "1 + K · G(s)·H(s) = 0 &nbsp;&nbsp;|&nbsp;&nbsp; "
        "asymptote angle = (2k+1)π / (n<sub>p</sub> − n<sub>z</sub>)"))

    # ── Pixel diagram: root_locus ──
    s.extend(diagram('root_locus',
        caption='Root locus — closed-loop poles trace curves in the s-plane as K varies from 0 to ∞. Cross into the right-half-plane and the system goes unstable.'))

    s.append(project_box('Python: Root Locus Plotter', [
        ('Goal:', 'use Python control library to plot root locus.'),
        ('Tasks:', 'use control.root_locus on a few example plants: '
                   '(a) 1/(s(s+1)(s+2)) — third-order, find K for stable operation. '
                   '(b) 1/(s²(s+5)) — what compensation is needed for stability? '
                   '(c) (s+1)/(s(s+2)(s+3)) — with zero, find K for ζ = 0.7.'),
        ('Tool:', 'python-control library (slycot optional).'),
        ('Verify:', 'overlay the unit-step response at the chosen K; confirm transient meets spec.'),
    ]))

    s.append(checkpoint_box([
        "State the rules for sketching a root locus by hand.",
        "Where does the root locus start? Where does it end?",
        "Why do we add zeros (lead compensation)? Poles (lag)?",
        "Sketch the root locus for G(s) = K/(s(s+1)(s+2)). For what K is the system marginally stable?",
    ]))

    # ── Module 6.5 ──
    s.append(heading('Module 6.5 — Frequency Response: Bode, Nyquist, Margins', 1))
    s.append(p('<b>Duration:</b> 7–9 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "Frequency-response methods analyze the open-loop transfer L(jω) instead of the "
        "closed-loop poles. Two complementary plots: <b>Bode</b> (separate magnitude "
        "and phase vs frequency) and <b>Nyquist</b> (polar plot of L(jω)). The "
        "<b>gain margin</b> GM is the factor by which you can multiply L before the "
        "system goes unstable; the <b>phase margin</b> PM is the additional phase lag "
        "you can add at the gain-crossover frequency before instability. PM is the more "
        "useful number — 30–60° is typical for well-designed loops."))

    s.append(formula_box(
        "GM = 1 / |L(jω<sub>pc</sub>)| &nbsp;&nbsp;|&nbsp;&nbsp; "
        "PM = 180° + ∠L(jω<sub>gc</sub>) &nbsp;&nbsp; "
        "(ω<sub>pc</sub>: phase crossover, ω<sub>gc</sub>: gain crossover)"))

    # ── Pixel diagram: nyquist_plot ──
    s.extend(diagram('nyquist_plot',
        caption='Nyquist plot — polar plot of L(jω). Encirclements of −1 tell you how many unstable closed-loop poles you have.'))

    s.append(p(
        "Rules of thumb: PM ≈ 30° → ~20% overshoot, PM ≈ 60° → ~8% overshoot, "
        "PM ≈ 90° → no overshoot. The bandwidth (frequency where |T| drops by 3 dB) "
        "approximates the rise time: t_r ≈ 1.8/ω_bw."))

    s.append(project_box('Python: Bode and Nyquist Plots', [
        ('Goal:', 'compute and plot Bode and Nyquist for an arbitrary L(s).'),
        ('Tasks:', 'for L(s) = K/(s(s+1)(s+5)): plot Bode for K = 1, 5, 20, 50. Find GM '
                   'and PM at each. Verify with the python-control margin() function.'),
        ('Verify:', 'predict closed-loop stability from Nyquist (encirclements of −1). '
                    'Match to Routh-Hurwitz.'),
        ('Design:', 'find K that gives PM = 45°. Confirm by simulating step response.'),
    ]))

    s.append(checkpoint_box([
        "Define gain margin and phase margin. Which is more useful in practice?",
        "What PM gives ~10% overshoot? ~no overshoot?",
        "State the Nyquist stability criterion. How do you count encirclements?",
        "How is bandwidth related to rise time?",
    ]))

    # ── Module 6.6 ──
    s.append(heading('Module 6.6 — PID Design and Tuning', 1))
    s.append(p('<b>Duration:</b> 7–9 h · <b>Difficulty:</b> Intermediate', 'kicker'))

    s.append(p(
        "The PID controller C(s) = K_p·(1 + 1/(T_i·s) + T_d·s) is the workhorse of "
        "industrial control. P (proportional) gives fast response but steady-state "
        "error. I (integral) removes steady-state error but slows response and reduces "
        "stability. D (derivative) damps oscillation but amplifies noise. The art is "
        "tuning the three gains."))

    # ── Pixel diagrams: PID feedback loop + Bode low-pass ──
    s.extend(diagram('pid_loop',
        caption='PID feedback loop — setpoint → error → PID → plant → output. Sensor feeds back to the summing junction.'))
    s.extend(diagram('bode_low_pass',
        caption='Open-loop Bode magnitude — used to read gain margin (GM) and phase margin (PM) for stability.'))

    # ── Pixel diagram: pid_block ──
    s.extend(diagram('pid_block',
        caption='PID controller block — three parallel paths (P, I, D) summed. The most-deployed controller in industrial automation.'))

    s.append(heading('Ziegler-Nichols tuning', 2))
    s.append(p(
        "Two classic methods. <b>Closed-loop</b>: increase K_p until the system "
        "oscillates sustainably (at gain K_u, period T_u). Set K_p = 0.6·K_u, "
        "T_i = 0.5·T_u, T_d = 0.125·T_u (the ‘PID’ ZN setting). <b>Open-loop</b>: "
        "step the input, measure the process reaction curve (delay L and slope R), set "
        "K_p = 1.2/(R·L), T_i = 2·L, T_d = 0.5·L. ZN gives aggressive tuning; detune "
        "by 50% for production. Tyreus-Luyben and Cohen-Coon are refinements."))

    s.append(project_box('Bench: PID Temperature Control with Arduino', [
        ('Goal:', 'control the temperature of a small heater (power resistor) using PID.'),
        ('Hardware:', 'Arduino Uno, 10 Ω 5 W power resistor, DS18B20 temp sensor, MOSFET '
                      'to switch the resistor, 12 V supply.'),
        ('Implementation:', 'read temp every 1 s. Compute PID. Output PWM to MOSFET. '
                            'Use Arduino PID library.'),
        ('Tune:', 'use ZN closed-loop method. Find K_u and T_u. Apply PID settings.'),
        ('Verify:', 'step setpoint from 30°C to 50°C. Measure overshoot, settling time. '
                    'Compare to a simulated PID in Python with the same plant model.'),
        ('Detune:', 'if overshoot > 10%, reduce K_p by 30% and increase T_i by 50%.'),
    ]))

    s.append(checkpoint_box([
        "What does each of P, I, D do? What are the trade-offs?",
        "Apply ZN closed-loop tuning for K_u = 5, T_u = 0.4 s. What are K_p, T_i, T_d?",
        "Why is derivative often filtered? What is the time constant?",
        "What is integral windup? How do you prevent it?",
    ]))

    # ── Module 6.7 ──
    s.append(heading('Module 6.7 — State-Space: Controllability and Observability', 1))
    s.append(p('<b>Duration:</b> 7–9 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(cs_bridge(
        "<b>State-space ↔ linear dynamical system in ML.</b> The state-space model "
        "ẋ = A·x + B·u, y = C·x + D is exactly the form of a linear RNN. The matrices "
        "A, B, C, D are the weights. Controllability (can you reach any state from any "
        "other?) is the reachability of the underlying graph. Observability (can you "
        "infer the state from outputs?) is dual. The LQR controller and the Kalman "
        "filter are dual — LQR is optimal control, Kalman is optimal estimation, and "
        "they share the same Riccati equation."))

    s.append(p(
        "State-space is the modern (post-1960) way to handle MIMO (multi-input "
        "multi-output) systems. Instead of a single transfer function, you have a "
        "vector state x, vector input u, vector output y. The dynamics are first-order "
        "matrix ODEs. Stability: A is stable iff all eigenvalues have negative real "
        "part. Controllability: the controllability matrix [B, AB, A²B, ..., A^(n−1)B] "
        "has full rank. Observability: the observability matrix [C; CA; CA²; ...; CA^(n−1)] "
        "has full rank."))

    s.append(formula_box(
        "ẋ = A·x + B·u &nbsp;&nbsp;|&nbsp;&nbsp; y = C·x + D &nbsp;&nbsp;|&nbsp;&nbsp; "
        "Controllable iff rank([B, AB, ..., A<sup>n−1</sup>B]) = n"))

    # ── Pixel diagram: state_space ──
    s.extend(diagram('state_space',
        caption='State-space block diagram — A matrix is the dynamics, B is the input coupling, C is the output mapping. Eigenvalues of A are the system poles.'))

    s.append(heading('LQR — Linear Quadratic Regulator', 2))
    s.append(p(
        "LQR finds the optimal state-feedback u = −K·x that minimizes the cost "
        "J = ∫(x<sup>T</sup>Q·x + u<sup>T</sup>R·u)dt. The gain K is found by solving "
        "the algebraic Riccati equation. LQR has guaranteed stability margins "
        "(≥ 60° phase margin, ≥ 6 dB gain margin) and is widely used in aerospace, "
        "robotics, and process control. Choose Q to penalize state errors, R to "
        "penalize control effort."))

    s.append(project_box('Python: Inverted Pendulum on a Cart', [
        ('Goal:', 'stabilize an inverted pendulum using LQR.'),
        ('Model:', 'cart with position x and pendulum angle θ. State: [x, ẋ, θ, θ̇]. '
                   'Linearize around θ=0. A and B from standard inverted-pendulum equations.'),
        ('Design:', 'Q = diag([1, 0, 10, 0]), R = 1. Solve DARE with scipy.linalg.solve_discrete_are.'),
        ('Simulate:', 'start with θ=0.1 rad. Confirm LQR stabilizes in < 2 s. Confirm '
                      'cart moves to keep pendulum upright.'),
        ('Visualize:', 'animate the cart-pendulum system with matplotlib.'),
    ]))

    s.append(checkpoint_box([
        "Define controllability and observability. How do you test each?",
        "What is the dual relationship between LQR and Kalman filter?",
        "Set up state-space for a mass-spring-damper. What is A? B? C?",
        "Why does LQR have guaranteed stability margins?",
    ]))

    # ── Module 6.8 ──
    s.append(heading('Module 6.8 — Digital Control: Sampled-Data Systems', 1))
    s.append(p('<b>Duration:</b> 5–7 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(p(
        "Digital control implements the controller in software: sample the output, "
        "compute the control law, output via DAC, repeat every T seconds. The "
        "discrete-time equivalent of the plant is x[k+1] = A_d·x[k] + B_d·u[k], where "
        "A_d = e^(A·T) and B_d = ∫₀<sup>T</sup> e<sup>Aτ</sup>·B dτ. The zero-order hold "
        "(ZOH) on the DAC adds a (1 − e<sup>−sT</sup>)/s factor to the plant."))
    s.append(formula_box(
        "A<sub>d</sub> = e<sup>A·T</sup> &nbsp;&nbsp;|&nbsp;&nbsp; "
        "B<sub>d</sub> = ∫<sub>0</sub><sup>T</sup> e<sup>Aτ</sup>·B dτ"))

    s.append(p(
        "Sample rate matters: too slow and you lose information and stability margin; "
        "too fast and quantization noise dominates. Rule of thumb: sample at 10× the "
        "closed-loop bandwidth. Below 5× you start losing phase margin noticeably."))

    s.append(checkpoint_box([
        "How do you discretize a continuous-time state-space model?",
        "What is a zero-order hold? What does it do to the frequency response?",
        "What sample rate would you choose for a 10 Hz bandwidth control loop?",
        "Why does reducing sample rate reduce phase margin?",
    ]))

    # ── Module 6.9 ──
    s.append(heading('Module 6.9 — Robotics Kinematics', 1))
    s.append(p('<b>Duration:</b> 6–8 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(cs_bridge(
        "<b>Forward kinematics ↔ function composition.</b> Each joint applies a rotation "
        "and translation to the next link. Forward kinematics is composing these "
        "transforms: T_world_to_end = T_0·T_1·T_2·...·T_n. Inverse kinematics is "
        "inverting the composition — generally harder (nonlinear, multiple solutions, "
        "singularities). Denavit-Hartenberg (DH) convention is a standard way to "
        "parameterize joint transforms."))

    s.append(heading('Forward kinematics with DH parameters', 2))
    s.append(p(
        "Assign a frame to each link following DH rules. Each joint contributes a "
        "homogeneous transform T_i = Rot_z(θ_i)·Trans_z(d_i)·Trans_x(a_i)·Rot_x(α_i). "
        "Multiply them: T_0_n = T_1·T_2·...·T_n. The end-effector position and orientation "
        "are in the last column and rotation block of T_0_n."))

    s.append(heading('Inverse kinematics — the hard problem', 2))
    s.append(p(
        "Given a target end-effector pose, find joint angles. Three approaches: "
        "(1) <b>analytic</b> — solve the equations explicitly (only possible for simple "
        "geometries, e.g., 2-link planar arms). (2) <b>Jacobian-based</b> — iterate "
        "Δθ = J<sup>+</sup>·Δx where J is the Jacobian (partial derivatives of end-effector "
        "pose w.r.t. joint angles) and J<sup>+</sup> is its pseudoinverse. (3) <b>Optimization</b> "
        "— minimize ||f(θ) − target||² with gradient descent or Levenberg-Marquardt."))

    s.append(project_box('Python: 2-DOF Planar Arm Inverse Kinematics', [
        ('Goal:', 'compute IK for a 2-link arm and animate it.'),
        ('Setup:', 'arm with link lengths L1 = L2 = 1. End-effector target (x, y).'),
        ('Analytic IK:', 'θ_2 = acos((x² + y² − L1² − L2²)/(2·L1·L2)), '
                         'θ_1 = atan2(y, x) − atan2(L2·sin θ_2, L1 + L2·cos θ_2).'),
        ('Animate:', 'pick a path (circle, figure-8). Sample target points. Solve IK at each. '
                     'Animate the arm following the path.'),
        ('Extension:', 'add a 3rd link (3-DOF). Now analytic IK has multiple solutions — '
                       'elbow up and elbow down. Use Jacobian-based IK.'),
    ]))

    s.append(checkpoint_box([
        "What is forward kinematics? Inverse kinematics?",
        "State the DH convention. What are the four parameters per joint?",
        "Solve analytic IK for a 2-link planar arm reaching (0.5, 0.5) with L1=L2=1.",
        "What is a Jacobian? How do you use it for IK?",
        "What is a kinematic singularity? Give an example.",
    ]))

    # ── Module 6.10 ──
    s.append(heading('Module 6.10 — Phase 6 Capstone: Line-Following Robot', 1))
    s.append(p('<b>Duration:</b> 12–16 h · <b>Difficulty:</b> Advanced', 'kicker'))

    s.append(project_box('Phase 6 Capstone: Closed-Loop Line-Following Robot', [
        ('Goal:', 'build a robot that follows a black line on a white floor at 1 m/s.'),
        ('Mechanical:', 'differential-drive chassis with two DC motors and a caster. '
                        'Wheel diameter 6 cm, wheelbase 15 cm.'),
        ('Sensors:', '5-element IR reflective sensor array (e.g., Pololu QTRX-MD-05A).'),
        ('Compute:', 'ESP32 reads sensors, computes control, drives motors via L298N.'),
        ('Controller:', 'PID on the line position error. K_p, K_i, K_d tuned on the bench. '
                        'Sensor reading → line position estimate (weighted average). '
                        'Error → PID → differential motor command.'),
        ('Kinematics:', 'forward: v_L, v_R → (v, ω). Differential: Δv = K·e. '
                        'Use the differential-drive kinematic equations.'),
        ('Test:', 'start on a straight track. Tune K_p first (proportional only). Add K_d '
                  'when oscillating. Add K_i if there is steady-state offset. Then test on '
                  'curves of decreasing radius.'),
        ('Document:', 'schematic, code, sensor calibration, controller tuning log, video. '
                      'Time on a standard track. Compare to the simulated kinematics.'),
    ]))

    s.append(checkpoint_box([
        "Sketch the block diagram of the line follower. Where is the plant, the sensor, the controller?",
        "How does differential drive work? What is the relationship between v_L, v_R, v, ω?",
        "How do you estimate line position from 5 binary sensor readings?",
        "Tune K_p, K_i, K_d in what order? What symptom does each address?",
    ]))

    s.append(pull_quote(
        'Stability is not a property of the plant. It is a property of the loop. A '
        'well-designed controller stabilizes an unstable plant; a poorly-designed one '
        'destabilizes a stable plant.',
        'Volt, on feedback'))

    s.append(pull_quote(
        'LQR and the Kalman filter are dual. Optimal control and optimal estimation '
        'are the same Riccati equation read forward and backward in time. That symmetry '
        'is one of the most beautiful results in engineering mathematics.',
        'Volt, on duality'))

    s.append(volt_says(
        'Phase 6 is done. You can design a controller in the time domain with root '
        'locus. In the frequency domain with Bode and Nyquist. In the state domain with '
        'LQR. You can tune a PID. Model a physical system. Stabilize an inverted '
        'pendulum. The line-following robot capstone is the first time we ask you to '
        'ship something that moves. Phase 7 takes you into power electronics. Where the '
        'voltages and currents get large enough to burn.',
        mood='story'))

    s.append(PageBreak())
    return s
