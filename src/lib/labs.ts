// Labs — progressive project-based tutorials that use the interactive tools
// Each lab is a standalone project that teaches by building.
// Labs reference curriculum phases (prerequisites) and use interactive features.

export type LabDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type LabTool = 'breadboard' | 'wokwi' | 'spice' | 'verilog' | '3d-model' | 'bode' | 'scope' | 'falstad' | 'tscircuit' | 'circuitverse' | 'hardware' | 'smith' | 'phasor' | 'pwm' | 'adc_dac' | 'root_locus' | 'nyquist' | 'kmap' | 'logic_analyzer' | 'transline' | 'antenna' | 'fsm' | 'powerflow';
export type LabStatus = 'not-started' | 'in-progress' | 'completed';

export interface LabStep {
  id: string;
  title: string;
  instruction: string;        // what to do
  expected: string;           // what you should see
  tip?: string;               // common mistake to avoid
  tool?: LabTool;             // which interactive tool to use
  toolConfig?: {              // tool-specific configuration
    breadboardCircuit?: string;  // pre-built circuit to load
    wokwiProject?: string;       // Wokwi project URL
    spiceNetlist?: string;       // SPICE netlist to load
    verilogCode?: string;        // Verilog to load
    modelComponent?: string;     // 3D model to show
  };
}

export interface Lab {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: LabDifficulty;
  estimated_hours: number;
  tools: LabTool[];           // which interactive tools this lab uses
  prerequisites: string[];    // curriculum phase IDs (e.g., 'p1', 'p3')
  relatedLessons: string[];   // lesson IDs that teach the concepts
  steps: LabStep[];
  whatYoullBuild: string;     // the end result
  whatNotToDo: string[];      // common mistakes / warnings
  progressKey: string;        // localStorage key for tracking
}

export const LABS: Lab[] = [
  // ════════════════════════════════════════════════════════════════════
  // LAB 1 — First LED Circuit (Beginner)
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'lab-01-led-circuit',
    title: 'Light Your First LED',
    subtitle: 'Battery, resistor, LED — the simplest complete circuit',
    description: 'Build the "hello world" of electronics. Place a battery, add a current-limiting resistor, connect an LED, and wire it all together on the virtual breadboard. When the LED glows green, you have built your first working circuit.',
    difficulty: 'Beginner',
    estimated_hours: 1,
    tools: ['breadboard', '3d-model'],
    prerequisites: ['p1'],
    relatedLessons: ['p1m1l1', 'p1m2l1'],
    whatYoullBuild: 'A complete LED circuit on the virtual breadboard that lights up when wired correctly.',
    whatNotToDo: [
      'Do not connect the LED directly to the battery without a resistor — it will burn out instantly.',
      'Do not connect the LED backwards — the long lead (anode) goes to +, the short lead (cathode) goes to -.',
      'Do not use a resistor below 220 ohms with a 9V battery — too much current will flow.',
    ],
    progressKey: 'lab-01',
    steps: [
      {
        id: 'lab-01-s1',
        title: 'Understand the components',
        instruction: 'Look at the 3D models below. Rotate each one to see its shape. A resistor limits current. An LED lights up when current flows through it in the right direction. A battery provides power.',
        expected: 'You can identify each component by shape.',
        tip: 'The resistor has color bands that tell you its value. The LED has a long lead (+) and a short lead (-).',
        tool: '3d-model',
        toolConfig: { modelComponent: 'resistor' },
      },
      {
        id: 'lab-01-s2',
        title: 'Place the battery',
        instruction: 'Open the virtual breadboard. Click "Battery" in the palette, then click a hole on the red (+) power rail at the top.',
        expected: 'The battery appears on the breadboard with its + terminal on the power rail.',
        tip: 'The power rail (red dots) connects all holes in the same row. This is how real breadboards work.',
        tool: 'breadboard',
      },
      {
        id: 'lab-01-s3',
        title: 'Place the resistor',
        instruction: 'Click "Resistor" in the palette. Click a hole in the main grid (row a-e). The resistor bridges two holes in the same row.',
        expected: 'The resistor appears, bridging two holes.',
        tip: 'The resistor goes between the power rail and the LED to limit current.',
        tool: 'breadboard',
      },
      {
        id: 'lab-01-s4',
        title: 'Place the LED',
        instruction: 'Click "LED" in the palette. Click a hole in row e (bottom of the top grid). The LED has two leads — one goes to the resistor, one goes to ground.',
        expected: 'The LED appears with its two leads in adjacent holes.',
        tip: 'LED polarity matters. The long lead (anode) connects to the resistor (+ side). The short lead (cathode) connects to ground (- side).',
        tool: 'breadboard',
      },
      {
        id: 'lab-01-s5',
        title: 'Wire it together',
        instruction: 'Click "Wire" in the palette. Click the + power rail hole, then click the hole where the resistor\'s first lead is. Draw another wire from the resistor\'s second lead to the LED anode. Draw a third wire from the LED cathode to the - ground rail.',
        expected: 'Three wires connect: battery+ → resistor → LED → battery-.',
        tip: 'A circuit must form a complete loop. If there is a gap, current cannot flow.',
        tool: 'breadboard',
      },
      {
        id: 'lab-01-s6',
        title: 'Watch it light up',
        instruction: 'Check the status indicator at the bottom. If it says "Circuit complete!" the LED should be glowing green. If not, check your wiring.',
        expected: 'LED glows green. Status shows "Circuit complete!"',
        tip: 'If the LED does not light: check polarity (long lead to +), check for gaps in the loop, check that the resistor is in the path.',
        tool: 'breadboard',
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // LAB 2 — Arduino Blink (Wokwi simulation)
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'lab-02-arduino-blink',
    title: 'Arduino Blink — Your First Program',
    subtitle: 'Write code that makes an LED blink on a real Arduino simulation',
    description: 'Use the Wokwi Arduino simulator to write your first microcontroller program. You will write C code that blinks an LED, upload it to a virtual Arduino, and watch it run in real-time. This is the "hello world" of embedded systems.',
    difficulty: 'Beginner',
    estimated_hours: 1.5,
    tools: ['wokwi', 'hardware'],
    prerequisites: ['p4'],
    relatedLessons: ['p4m6l1', 'p4m6l2'],
    whatYoullBuild: 'A working Arduino program that blinks an LED at 1Hz, running in a real microcontroller simulator.',
    whatNotToDo: [
      'Do not forget to set the pin as OUTPUT before calling digitalWrite — nothing will happen.',
      'Do not use delay(0) — the LED will appear constantly on or off, not blinking.',
      'Do not connect the LED without a resistor on real hardware — it will burn out.',
    ],
    progressKey: 'lab-02',
    steps: [
      {
        id: 'lab-02-s1',
        title: 'Open the Wokwi simulator',
        instruction: 'The embedded Wokwi simulator below shows a real Arduino Uno with an LED on pin 13. Click "Start Simulation" to see the default blink code run.',
        expected: 'The LED on pin 13 blinks once per second.',
        tip: 'Wokwi runs real Arduino firmware. This is not a toy — it is the same code that runs on real hardware.',
        tool: 'wokwi',
        toolConfig: { fallbackDemo: 'arduino-blink' },
      },
      {
        id: 'lab-02-s2',
        title: 'Read the code',
        instruction: 'Look at the code in the Wokwi editor. setup() runs once when the Arduino powers on. loop() runs forever. pinMode(13, OUTPUT) configures pin 13. digitalWrite(13, HIGH) turns the LED on. delay(1000) waits 1 second.',
        expected: 'You understand what each line does.',
        tip: 'In C, statements end with semicolons. Comments start with //.',
      },
      {
        id: 'lab-02-s3',
        title: 'Change the blink speed',
        instruction: 'Change delay(1000) to delay(100). Click "Start Simulation" again. The LED should blink 10 times faster.',
        expected: 'LED blinks 10 times per second.',
        tip: 'delay() takes milliseconds. delay(100) = 0.1 seconds. delay(2000) = 2 seconds.',
        tool: 'wokwi',
      },
      {
        id: 'lab-02-s4',
        title: 'Make it a heartbeat',
        instruction: 'Change the loop to: digitalWrite(13, HIGH); delay(100); digitalWrite(13, LOW); delay(100); digitalWrite(13, HIGH); delay(100); digitalWrite(13, LOW); delay(700); This creates a double-blink heartbeat pattern.',
        expected: 'LED blinks twice quickly, pauses, repeats — like a heartbeat.',
        tip: 'You can copy-paste code in the Wokwi editor.',
        tool: 'wokwi',
      },
      {
        id: 'lab-02-s5',
        title: 'Add a second LED',
        instruction: 'In the Wokwi diagram editor (click the diagram tab), add a second LED on pin 12 with a 220 ohm resistor. Modify the code to alternate: pin 13 on while pin 12 off, then swap.',
        expected: 'Two LEDs alternate — like a railroad crossing signal.',
        tip: 'Open the Wokwi project in a new tab for the full editor with diagram editing.',
        tool: 'wokwi',
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // LAB 3 — RC Low-Pass Filter (SPICE simulation)
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'lab-03-rc-filter',
    title: 'Build an RC Low-Pass Filter',
    subtitle: 'Simulate a filter that removes high frequencies — see it in the Bode plot',
    description: 'Design a low-pass filter that passes audio frequencies but blocks radio frequencies. You will calculate the cutoff frequency, build the circuit in SPICE, and see the frequency response in an interactive Bode plot.',
    difficulty: 'Intermediate',
    estimated_hours: 2,
    tools: ['spice', 'bode', 'falstad'],
    prerequisites: ['p2'],
    relatedLessons: ['p2m2l1', 'p2m4l1', 'p2m4l2'],
    whatYoullBuild: 'A working RC low-pass filter with a known cutoff frequency, verified by SPICE simulation and Bode plot.',
    whatNotToDo: [
      'Do not use an electrolytic capacitor for high-frequency filtering — they have high ESR and parasitic inductance.',
      'Do not forget that the cutoff frequency is where the signal drops by 3dB (half power), not where it disappears.',
      'Do not expect a perfect brick-wall filter — real RC filters roll off gradually at 20dB/decade.',
    ],
    progressKey: 'lab-03',
    steps: [
      {
        id: 'lab-03-s1',
        title: 'Calculate the cutoff frequency',
        instruction: 'The cutoff frequency of an RC filter is f_c = 1 / (2πRC). Choose R = 1kΩ and C = 1μF. Calculate f_c. (Answer: 159 Hz.)',
        expected: 'You calculated f_c = 159 Hz.',
        tip: 'This means frequencies below 159 Hz pass through. Frequencies above 159 Hz are attenuated.',
      },
      {
        id: 'lab-03-s2',
        title: 'Simulate in SPICE',
        instruction: 'Use the SPICE playground below. The netlist is pre-filled with a 1V AC source, 1kΩ resistor, and 1μF capacitor. Run an AC analysis from 1 Hz to 10 kHz.',
        expected: 'The output voltage is flat at low frequencies, then drops as frequency increases above 159 Hz.',
        tip: 'In SPICE, .ac dec 10 1 10k means: decade sweep, 10 points per decade, from 1 Hz to 10 kHz.',
        tool: 'spice',
        toolConfig: {
          spiceNetlist: `* RC Low-Pass Filter
V1 in 0 AC 1
R1 in out 1k
C1 out 0 1u
.ac dec 10 1 10k
.print ac v(out)
.end`,
        },
      },
      {
        id: 'lab-03-s3',
        title: 'Visualize the Bode plot',
        instruction: 'Use the interactive Bode plot below. Set ω_n = 1000 rad/s (159 Hz × 2π) and ζ = 0.5. See how the magnitude drops by 3dB at the cutoff frequency.',
        expected: 'The Bode plot shows a flat passband, then -20dB/decade rolloff above 159 Hz.',
        tip: 'The -3dB point is at the cutoff frequency. Above that, the signal drops by 20dB for every 10x increase in frequency.',
        tool: 'bode',
      },
      {
        id: 'lab-03-s4',
        title: 'Try it in Falstad',
        instruction: 'Open the Falstad circuit below. It shows an RC filter with a function generator and scope. Change the frequency and watch the output amplitude change.',
        expected: 'At low frequencies, output ≈ input. At high frequencies, output is much smaller.',
        tip: 'The Falstad simulator lets you drag the frequency slider and see the response in real-time.',
        tool: 'falstad',
      },
      {
        id: 'lab-03-s5',
        title: 'Change the cutoff',
        instruction: 'Redesign for a cutoff of 1 kHz. You need f_c = 1000 = 1/(2πRC). With R = 1kΩ, C = 1/(2π × 1000 × 1000) = 159 nF. Re-run the SPICE simulation with C = 159n.',
        expected: 'The new cutoff is at 1 kHz.',
        tip: 'Smaller capacitor = higher cutoff frequency. Larger capacitor = lower cutoff frequency.',
        tool: 'spice',
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // LAB 4 — ESP32 WiFi Temperature Station (Wokwi)
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'lab-04-esp32-temp-station',
    title: 'ESP32 WiFi Temperature Station',
    subtitle: 'Read a sensor, connect to WiFi, serve a web page with live data',
    description: 'Build a real IoT project. An ESP32 reads a temperature sensor and serves a web page showing the live temperature. You will write the firmware, simulate it in Wokwi, and see the web interface update in real-time.',
    difficulty: 'Intermediate',
    estimated_hours: 3,
    tools: ['wokwi', 'hardware'],
    prerequisites: ['p4'],
    relatedLessons: ['p4m9l1', 'p4m9l2'],
    whatYoullBuild: 'A simulated ESP32 that reads temperature and serves a web page, all running in the browser.',
    whatNotToDo: [
      'Do not hard-code WiFi credentials in production code — use secrets.h or environment variables.',
      'Do not block the main loop with delay() while serving web requests — the server becomes unresponsive.',
      'Do not forget to call WiFi.begin() in setup() — the ESP32 will not connect automatically.',
    ],
    progressKey: 'lab-04',
    steps: [
      {
        id: 'lab-04-s1',
        title: 'Open the ESP32 Wokwi project',
        instruction: 'The embedded Wokwi simulator shows an ESP32 with a DHT22 temperature sensor. Click "Start Simulation" to boot the ESP32.',
        expected: 'The ESP32 connects to the simulated WiFi and starts the web server.',
        tip: 'Wokwi simulates the ESP32 WiFi stack. The serial monitor shows connection status.',
        tool: 'wokwi',
        toolConfig: { fallbackDemo: 'esp32-wifi' },
      },
      {
        id: 'lab-04-s2',
        title: 'Read the sensor',
        instruction: 'In the code, find the DHT22 read code. The sensor returns temperature and humidity. The ESP32 reads it every 2 seconds and prints to serial.',
        expected: 'Serial monitor shows temperature readings like "Temperature: 23.5°C".',
        tip: 'The DHT22 is a digital sensor — it uses a single-wire protocol, not analog.',
        tool: 'wokwi',
      },
      {
        id: 'lab-04-s3',
        title: 'Serve the web page',
        instruction: 'The ESP32 starts an HTTP server on port 80. When a browser connects, it returns an HTML page with the current temperature. Find the server.on() handler in the code.',
        expected: 'You can see the HTML generation code in the loop or a handler function.',
        tip: 'The HTML is generated as a string. In production, use a template engine or serve static files from SPIFFS.',
        tool: 'wokwi',
      },
      {
        id: 'lab-04-s4',
        title: 'Modify the web page',
        instruction: 'Change the HTML to add a CSS style that makes the temperature display large and green. Add a meta refresh tag so the page auto-updates every 5 seconds.',
        expected: 'The web page shows a large green temperature that updates automatically.',
        tip: 'Add <meta http-equiv="refresh" content="5"> inside the <head> tag.',
        tool: 'wokwi',
      },
      {
        id: 'lab-04-s5',
        title: 'Add humidity',
        instruction: 'Modify the code to also read humidity from the DHT22 and display it alongside temperature on the web page.',
        expected: 'Web page shows both temperature and humidity.',
        tip: 'The DHT22 read function returns both values in one call.',
        tool: 'wokwi',
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // LAB 5 — Build a Robot (Line Follower)
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'lab-05-line-follower-robot',
    title: 'Build a Line-Following Robot',
    subtitle: 'Arduino + IR sensors + motors = a robot that follows a line',
    description: 'Build a complete differential-drive robot in Wokwi that follows a black line on a white floor. You will wire IR sensors, write a PID control loop, and watch the robot navigate a track. This lab ties together embedded programming, control systems, and robotics.',
    difficulty: 'Advanced',
    estimated_hours: 4,
    tools: ['wokwi', 'hardware', '3d-model'],
    prerequisites: ['p4', 'p6'],
    relatedLessons: ['p4m7l1', 'p6m6l1', 'p6m10l1'],
    whatYoullBuild: 'A simulated robot that follows a line using PID control, running entirely in the browser.',
    whatNotToDo: [
      'Do not run motors without a driver — the Arduino pins cannot supply enough current (40mA max, motors need 200mA+).',
      'Do not set PID gains too high — the robot will oscillate wildly and lose the line.',
      'Do not forget to handle the "all sensors off" case — the robot should stop or spin to find the line.',
    ],
    progressKey: 'lab-05',
    steps: [
      {
        id: 'lab-05-s1',
        title: 'Understand the robot',
        instruction: 'Look at the 3D model of the robot chassis. It has 2 drive wheels (differential drive) and a caster wheel. 5 IR sensors hang below the front to detect the line.',
        expected: 'You understand the physical layout.',
        tip: 'Differential drive means the robot turns by running the wheels at different speeds.',
        tool: '3d-model',
      },
      {
        id: 'lab-05-s2',
        title: 'Open the Wokwi robot simulation',
        instruction: 'The Wokwi simulator below shows the robot on a test track. Click "Start Simulation" to see it run with the default code.',
        expected: 'The robot follows the line, turning left and right to stay on track.',
        tool: 'wokwi',
        toolConfig: { fallbackDemo: 'robot-sensors' },
      },
      {
        id: 'lab-05-s3',
        title: 'Read the sensor code',
        instruction: 'In the code, find where the 5 IR sensors are read. Each sensor returns 0 (white) or 1 (black). The code computes a weighted average to estimate the line position.',
        expected: 'You understand how 5 binary sensors give a position estimate.',
        tip: 'The weighted average gives a continuous position from -2 (far left) to +2 (far right). 0 means centered.',
        tool: 'wokwi',
      },
      {
        id: 'lab-05-s4',
        title: 'Understand the PID controller',
        instruction: 'Find the PID section. The error is (line_position - 0). K_p, K_i, K_d are the gains. The controller computes a correction that adjusts the motor speeds: leftMotor = baseSpeed + correction, rightMotor = baseSpeed - correction.',
        expected: 'You understand how PID translates sensor error into motor commands.',
        tip: 'K_p makes the robot turn toward the line. K_d damps oscillation. K_i removes steady-state error. Start with K_i = 0.',
        tool: 'wokwi',
      },
      {
        id: 'lab-05-s5',
        title: 'Tune the PID gains',
        instruction: 'Change K_p from the default to 50 and run. Then try 100, 200. Notice how high K_p causes oscillation. Add K_d = 10 to damp it. Find values that track smoothly.',
        expected: 'With good tuning, the robot follows the line smoothly without oscillation.',
        tip: 'Tuning order: increase K_p until it oscillates, then add K_d to damp, then add small K_i if there is steady-state offset.',
        tool: 'wokwi',
      },
      {
        id: 'lab-05-s6',
        title: 'Handle edge cases',
        instruction: 'Add code: if all sensors read 0 (line lost), stop the motors. If all sensors read 1 (intersection), go straight. Test on a track with a sharp turn.',
        expected: 'Robot handles lost-line and intersection cases gracefully.',
        tip: 'A real robot must handle these cases or it will drive off the track.',
        tool: 'wokwi',
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // LAB 6 — Digital Logic Design (Verilog + CircuitVerse)
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'lab-06-verilog-counter',
    title: 'Design a 4-Bit Counter in Verilog',
    subtitle: 'Write HDL, synthesize to gates, see the circuit and waveforms',
    description: 'Design a 4-bit synchronous counter in Verilog. Synthesize it to a gate-level circuit using Yosys WASM. See the resulting gates visualized with digitaljs. This is how real digital ICs are designed.',
    difficulty: 'Intermediate',
    estimated_hours: 2.5,
    tools: ['verilog', 'circuitverse'],
    prerequisites: ['p4'],
    relatedLessons: ['p4m3l1', 'p4m4l1'],
    whatYoullBuild: 'A synthesized 4-bit counter with visible gate-level circuit and waveform simulation.',
    whatNotToDo: [
      'Do not mix blocking (=) and non-blocking (<=) assignments in the same always block — it causes race conditions.',
      'Do not forget to reset the counter — without reset, the simulation starts in an undefined state.',
      'Do not use delays (#10) in synthesizable code — they are for simulation only and are ignored by synthesis.',
    ],
    progressKey: 'lab-06',
    steps: [
      {
        id: 'lab-06-s1',
        title: 'Open the Verilog playground',
        instruction: 'The Verilog playground below has a 4-bit counter pre-loaded. Click "Synthesize" to run Yosys and see the gate-level circuit.',
        expected: 'The circuit tab shows flip-flops and logic gates. The waveform tab shows the count sequence.',
        tool: 'verilog',
        toolConfig: {
          verilogCode: `module counter(input wire clk, rst, output reg [3:0] count);
  always @(posedge clk or posedge rst) begin
    if (rst) count <= 4'b0;
    else     count <= count + 1;
  end
endmodule`,
        },
      },
      {
        id: 'lab-06-s2',
        title: 'Understand the code',
        instruction: 'Read the Verilog. clk is the clock. rst is reset (async, active high). count is a 4-bit register. On every rising clock edge, if rst is high, count resets to 0. Otherwise, it increments.',
        expected: 'You understand every line.',
        tip: '<= is non-blocking assignment — it samples the RHS at the clock edge. Use it in always @(posedge clk) blocks.',
      },
      {
        id: 'lab-06-s3',
        title: 'Synthesize and view gates',
        instruction: 'Click "Synthesize". The Circuit tab shows the gate-level netlist. You should see 4 D flip-flops (one per bit) and some XOR/AND gates for the increment logic.',
        expected: 'Gate-level circuit with 4 flip-flops visible.',
        tip: 'Yosys converts your RTL into gates. This is what gets put on an FPGA or ASIC.',
        tool: 'verilog',
      },
      {
        id: 'lab-06-s4',
        title: 'Modify to count down',
        instruction: 'Change count <= count + 1 to count <= count - 1. Re-synthesize. The circuit should look similar (the increment logic changes to decrement logic).',
        expected: 'Counter counts down: 15, 14, 13, ..., 1, 0, 15, ...',
        tip: 'In Verilog, - 1 on an unsigned 4-bit value wraps from 0 to 15.',
        tool: 'verilog',
      },
      {
        id: 'lab-06-s5',
        title: 'Add an enable signal',
        instruction: 'Add an input wire called "enable". Only count when enable is high. Modify: if (rst) count <= 0; else if (enable) count <= count + 1;',
        expected: 'Counter only increments when enable is 1.',
        tip: 'This is how you gate a counter — useful for frequency dividers and event counters.',
        tool: 'verilog',
      },
      {
        id: 'lab-06-s6',
        title: 'Try CircuitVerse',
        instruction: 'Open the CircuitVerse embed below. Build the same counter using logic gates manually. Connect 4 D flip-flops, add XOR gates for the increment, wire the clock.',
        expected: 'A working 4-bit counter built from individual gates.',
        tip: 'CircuitVerse lets you drag gates and wires. It is slower than Verilog but teaches you what the hardware actually looks like.',
        tool: 'circuitverse',
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // LAB 7 — Audio Spectrum Analyzer (Python + Web Audio)
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'lab-07-audio-spectrum',
    title: 'Build an Audio Spectrum Analyzer',
    subtitle: 'Generate signals, run FFT, see the spectrum live',
    description: 'Use the Web Audio oscilloscope to generate signals (sine, square, sawtooth) and see their frequency spectrum in real-time. Then use the Python playground to compute an FFT from scratch. Understand how the FFT reveals the frequency content of any signal.',
    difficulty: 'Intermediate',
    estimated_hours: 2,
    tools: ['scope', 'bode'],
    prerequisites: ['p5'],
    relatedLessons: ['p5m7l1', 'p5m7l2'],
    whatYoullBuild: 'A live spectrum analyzer that shows the frequency content of generated signals, plus a Python FFT implementation.',
    whatNotToDo: [
      'Do not expect a perfect single-frequency spike for a square wave — it has odd harmonics at 3x, 5x, 7x the fundamental.',
      'Do not forget to window the signal before FFT — without a window, spectral leakage distorts the results.',
      'Do not confuse the sample rate with the signal frequency — the sample rate must be at least 2x the highest signal frequency (Nyquist).',
    ],
    progressKey: 'lab-07',
    steps: [
      {
        id: 'lab-07-s1',
        title: 'Open the Web Audio scope',
        instruction: 'The Web Audio oscilloscope below lets you generate signals and see both the waveform (time domain) and the spectrum (frequency domain). Click "Start" to begin.',
        expected: 'You see a moving waveform and a spectrum plot.',
        tool: 'scope',
      },
      {
        id: 'lab-07-s2',
        title: 'Generate a sine wave',
        instruction: 'Select "Sine" waveform. Set frequency to 440 Hz (musical note A). Look at the spectrum — you should see a single peak at 440 Hz.',
        expected: 'One peak at 440 Hz in the spectrum.',
        tip: 'A pure sine wave has exactly one frequency component. This is the simplest signal.',
        tool: 'scope',
      },
      {
        id: 'lab-07-s3',
        title: 'Try a square wave',
        instruction: 'Switch to "Square" waveform. Keep the frequency at 440 Hz. Look at the spectrum now — you should see peaks at 440 Hz, 1320 Hz (3x), 2200 Hz (5x), 3080 Hz (7x), etc.',
        expected: 'Multiple peaks at odd harmonics (1x, 3x, 5x, 7x, ...).',
        tip: 'A square wave is made of a sine at the fundamental plus sines at every odd harmonic. This is the Fourier series.',
        tool: 'scope',
      },
      {
        id: 'lab-07-s4',
        title: 'Try a sawtooth wave',
        instruction: 'Switch to "Sawtooth". The spectrum should show peaks at EVERY harmonic (1x, 2x, 3x, 4x, ...), not just odd ones.',
        expected: 'Peaks at every multiple of the fundamental.',
        tip: 'Sawtooth has both odd and even harmonics. It sounds brighter and buzzier than a square wave.',
        tool: 'scope',
      },
      {
        id: 'lab-07-s5',
        title: 'Sweep the frequency',
        instruction: 'Drag the frequency slider from 100 Hz to 2000 Hz. Watch the peak move in the spectrum. The peak should always be at the frequency you set.',
        expected: 'Peak moves smoothly as you change the frequency.',
        tip: 'The spectrum x-axis is frequency. The y-axis is amplitude (in dB).',
        tool: 'scope',
      },
    ],
  },
];

// ════════════════════════════════════════════════════════════════════════
// PLAYGROUND — standalone access to each interactive tool
// ════════════════════════════════════════════════════════════════════════
export interface PlaygroundTool {
  id: string;
  name: string;
  description: string;
  icon: string;           // lucide icon name
  tool: LabTool;
  difficulty: LabDifficulty;
  whatYouCanDo: string[];
  tutorialSteps: string[];
}

export const PLAYGROUND_TOOLS: PlaygroundTool[] = [
  {
    id: 'pg-breadboard',
    name: 'Virtual Breadboard',
    description: 'Drag components onto a breadboard, wire them, and see your circuit work. Place LEDs, resistors, batteries, and buttons. Connect them with wires. When the circuit is complete, the LED lights up.',
    icon: 'CircuitBoard',
    tool: 'breadboard',
    difficulty: 'Beginner',
    whatYouCanDo: [
      'Place LEDs, resistors, batteries, pushbuttons on a virtual breadboard',
      'Wire components together by clicking holes',
      'See the LED light up when the circuit is complete',
      'Test different circuit topologies safely (no real components to burn)',
    ],
    tutorialSteps: [
      'Click a component in the left palette (LED, Resistor, Battery, etc.)',
      'Click a hole on the breadboard to place it',
      'Select "Wire" and click two holes to connect them',
      'Place a battery, connect + to a resistor, resistor to an LED, LED back to battery -',
      'The LED glows green when the circuit is complete!',
    ],
  },
  {
    id: 'pg-spice',
    name: 'SPICE Simulator',
    description: 'Run real SPICE simulations in your browser. Write a netlist, run .op (DC operating point), .tran (transient), or .ac (frequency) analysis. See node voltages and waveforms. Two engines: spicey (lightweight, instant) and ngspice WASM (full semiconductor models).',
    icon: 'Activity',
    tool: 'spice',
    difficulty: 'Intermediate',
    whatYouCanDo: [
      'Simulate DC, AC, and transient analysis',
      'Use real semiconductor models (1N4148 diode, 2N3904 BJT, 2N7000 MOSFET)',
      'See waveforms plotted with Plotly',
      'Test circuit designs before building them',
    ],
    tutorialSteps: [
      'Write a SPICE netlist in the text area (or use the starter)',
      'Choose analysis type: .op, .tran, .ac, or .dc',
      'Click "Run Simulation"',
      'View results: table for .op, waveform plot for .tran/.ac',
      'Modify the netlist and re-run to see how changes affect the circuit',
    ],
  },
  {
    id: 'pg-verilog',
    name: 'Verilog HDL Playground',
    description: 'Write Verilog, synthesize it to gates with Yosys (compiled to WebAssembly), and see the resulting circuit visualized. This is how real digital ICs are designed — from RTL to gates.',
    icon: 'Cpu',
    tool: 'verilog',
    difficulty: 'Intermediate',
    whatYouCanDo: [
      'Write Verilog RTL (registers, logic, state machines)',
      'Synthesize to a gate-level netlist using Yosys WASM',
      'View the synthesized circuit as an interactive SVG',
      'See waveforms from the built-in simulator',
    ],
    tutorialSteps: [
      'Write Verilog in the code editor (or use the starter counter)',
      'Click "Synthesize" — Yosys runs in your browser (~12 MB WASM, first load only)',
      'View the "Circuit" tab to see the gate-level schematic',
      'View the "Waveforms" tab to see simulation results',
      'Modify the code and re-synthesize',
    ],
  },
  {
    id: 'pg-3d-models',
    name: '3D Component Gallery',
    description: 'View 3D models of electronic components. Rotate and zoom to see every angle. Components are built procedurally from primitives — no external 3D files needed. See resistors, capacitors, LEDs, transistors, ICs, and a breadboard.',
    icon: 'Box',
    tool: '3d-model',
    difficulty: 'Beginner',
    whatYouCanDo: [
      'View 8 component types in 3D: resistor, capacitor, inductor, LED, transistor, diode, IC, breadboard',
      'Drag to rotate, scroll to zoom',
      'See component details (color bands, pin layouts, package shapes)',
      'Learn to identify components by sight',
    ],
    tutorialSteps: [
      'Select a component from the dropdown',
      'Drag with the mouse to rotate the 3D model',
      'Scroll to zoom in/out',
      'Observe the component from all angles',
    ],
  },
  {
    id: 'pg-bode',
    name: 'Interactive Bode Plot',
    description: 'Explore transfer functions interactively. Adjust the natural frequency and damping ratio with sliders. See how the Bode plot (magnitude and phase) changes in real-time. Choose low-pass, high-pass, or band-pass.',
    icon: 'LineChart',
    tool: 'bode',
    difficulty: 'Intermediate',
    whatYouCanDo: [
      'Adjust ω_n (natural frequency) and ζ (damping ratio) with sliders',
      'Choose filter type: low-pass, high-pass, band-pass',
      'See magnitude (dB) and phase (degrees) update in real-time',
      'Understand how pole locations affect frequency response',
    ],
    tutorialSteps: [
      'Use the ω_n slider to change the natural frequency',
      'Use the ζ slider to change the damping ratio',
      'Switch between low-pass, high-pass, and band-pass',
      'Watch the Bode plot update in real-time',
      'Notice how low ζ gives a peak (resonance) and high ζ gives a smooth rolloff',
    ],
  },
  {
    id: 'pg-wokwi',
    name: 'Wokwi Microcontroller Simulator',
    description: 'Run real Arduino, ESP32, and STM32 firmware in the browser. Write C code, upload to a virtual microcontroller, and see it execute. LEDs blink, sensors read, motors spin — all simulated. This is not a toy — it is the same code that runs on real hardware.',
    icon: 'Cpu',
    tool: 'wokwi',
    difficulty: 'Beginner',
    whatYouCanDo: [
      'Run real Arduino/ESP32/STM32 firmware in the browser',
      'Edit code and see results in real-time',
      'Use 60+ virtual components (LED, LCD, NeoPixel, servo, sensors)',
      'Test embedded code before flashing to real hardware',
    ],
    tutorialSteps: [
      'Click "Start Simulation" in the Wokwi iframe',
      'Watch the default blink program run',
      'Edit the code in the Wokwi editor',
      'Click "Start Simulation" again to run your modified code',
      'Click "Open in Wokwi" for the full editor with component library',
    ],
  },
  {
    id: 'pg-scope',
    name: 'Web Audio Oscilloscope',
    description: 'Generate audio signals and see them on a live oscilloscope and spectrum analyzer. Choose sine, square, sawtooth, or triangle waves. Sweep from 20 Hz to 20 kHz. See both the time-domain waveform and the frequency-domain FFT.',
    icon: 'AudioLines',
    tool: 'scope',
    difficulty: 'Beginner',
    whatYouCanDo: [
      'Generate sine, square, sawtooth, triangle waves',
      'Sweep frequency from 20 Hz to 20 kHz',
      'See the live waveform on an oscilloscope',
      'See the live FFT spectrum',
      'Use your microphone as the input signal',
    ],
    tutorialSteps: [
      'Click "Start" to begin audio generation',
      'Select a waveform type (sine, square, etc.)',
      'Drag the frequency slider to change pitch',
      'Watch the scope (time domain) and spectrum (frequency domain) update',
      'Try a square wave and see the harmonics in the spectrum',
    ],
  },
  {
    id: 'pg-falstad',
    name: 'Falstad Circuit Simulator',
    description: 'Build and simulate circuits visually with the Falstad/CircuitJS1 simulator. Drag components, wire them, and see voltages and currents in real-time. The classic interactive circuit simulator, embedded directly.',
    icon: 'CircuitBoard',
    tool: 'falstad',
    difficulty: 'Beginner',
    whatYouCanDo: [
      'Build circuits by dragging components onto a canvas',
      'See live voltage and current readings',
      'Use the built-in oscilloscope to view waveforms',
      'Try pre-built example circuits',
    ],
    tutorialSteps: [
      'The Falstad simulator loads in an iframe below',
      'Click "Open in Falstad" for the full editor',
      'Drag components from the menu onto the canvas',
      'Wire them by clicking terminals',
      'Watch the simulation run in real-time',
    ],
  },
  {
    id: 'pg-smith',
    name: 'Smith Chart',
    description: 'Interactive Smith chart for RF impedance matching. Set a load impedance Z_L, add series/shunt L or C elements, and watch the reflection coefficient walk along constant-R and constant-G circles into the center (50Ω match). Live Γ, SWR, and return loss readouts.',
    icon: 'Crosshair',
    tool: 'smith',
    difficulty: 'Advanced',
    whatYouCanDo: [
      'Enter load impedance Z_L (R + jX) with sliders',
      'Add series L/C (moves along constant-R circle) or shunt L/C (constant-G circle)',
      'See the matching path drawn on the Smith chart in real-time',
      'Sweep the frequency (100 MHz – 10 GHz) to watch the match drift',
      'Read live Γ, SWR, return loss, and a schematic of the matching network',
    ],
    tutorialSteps: [
      'Set Z_L with the R and X sliders (e.g. R=100Ω, X=−50Ω)',
      'Click "Add series L" — the point moves up along a constant-R circle',
      'Click "Add series C" — the point moves down (capacitive reactance)',
      'Try "Add shunt L" / "Add shunt C" to move along constant-G circles',
      'Sweep the frequency slider — element reactances scale with f, so the match drifts',
      'Aim for Z_in near the green star at center (Γ=0, SWR=1:1)',
    ],
  },
  {
    id: 'pg-phasor',
    name: 'Phasor Diagram',
    description: 'Visualize AC circuit analysis with three rotating phasors and their vector sum. Each phasor has adjustable magnitude and phase; the resultant is shown live in polar and rectangular form. Animated rotation + time-domain waveforms below.',
    icon: 'MoveUpRight',
    tool: 'phasor',
    difficulty: 'Beginner',
    whatYouCanDo: [
      'Set magnitude (1–100 V) and phase (0–360°) for three phasors V₁, V₂, V₃',
      'Animate rotation counterclockwise at 0.1–5 Hz',
      'See the vector sum (resultant) phasor in red, with |V_sum|, ∠V_sum, and rectangular form',
      'Watch the time-domain waveforms v_k(t) = |V_k|cos(ωt+φ) scroll below',
      'Pause / play / reset the animation',
    ],
    tutorialSteps: [
      'Adjust the magnitude sliders for V₁, V₂, V₃',
      'Adjust the phase sliders (0° = right, 90° = up, 180° = left)',
      'Use the rotation-speed slider to spin the phasors (counterclockwise)',
      'Read |V_sum|, ∠V_sum, and the complex rectangular value',
      'Notice that phasors at the same frequency add as vectors, not as amplitudes',
    ],
  },
  {
    id: 'pg-pwm',
    name: 'PWM Visualizer',
    description: 'See pulse-width modulation in action for power electronics. Adjust duty cycle, frequency, and amplitude; watch the PWM waveform, average voltage (dashed), RMS value, inductor current triangle wave, and an LED load whose brightness tracks the duty cycle.',
    icon: 'Gauge',
    tool: 'pwm',
    difficulty: 'Beginner',
    whatYouCanDo: [
      'Sweep duty cycle 0–100% and watch V_avg = D·V_amp change',
      'Sweep frequency 100 Hz – 100 kHz (log scale)',
      'Sweep amplitude 0–24 V',
      'See the inductor current ripple (triangle wave) update with ΔI = (V_amp − V_avg)·D·T/L',
      'Watch an LED glow brighter at high duty, dim at low duty',
    ],
    tutorialSteps: [
      'Set duty cycle to 50% — V_avg should be half of V_amp',
      'Sweep duty from 10% to 90% — the LED brightness tracks',
      'Drop duty below 10% — the LED goes dim',
      'Sweep frequency — the inductor ripple shrinks at higher f (smaller T)',
      'Notice V_rms = V_amp·√D, not V_avg — important for power dissipation',
    ],
  },
  {
    id: 'pg-adc-dac',
    name: 'ADC / DAC Sampling',
    description: 'Sampling, quantization, and aliasing — the heart of mixed-signal. Watch a continuous sine get sampled at adjustable rate, quantized to 3/4/8/12/16-bit levels, and reconstructed via zero-order hold. Aliasing highlighted in red when f_s < 2·f_sig.',
    icon: 'Binary',
    tool: 'adc_dac',
    difficulty: 'Intermediate',
    whatYouCanDo: [
      'Set signal frequency (1–20 Hz) and sample rate (10–200 S/s)',
      'Pick ADC resolution: 3, 4, 8, 12, or 16 bits',
      'See samples (blue dots), quantized codes (orange squares), and DAC staircase',
      'Watch aliasing kick in (red) when f_s < 2·f_sig',
      'Read live Nyquist, quantization step, ideal SNR (6.02N + 1.76 dB)',
    ],
    tutorialSteps: [
      'Set signal to 5 Hz and sample rate to 50 S/s — clean sampling',
      'Drop sample rate to 8 S/s — aliasing appears (red dashed line)',
      'Try 3-bit vs 16-bit — note the quantization step and SNR change dramatically',
      'Notice the DAC staircase (orange) tracks the samples, not the analog signal',
      'The Nyquist frequency (f_s/2) is the hard limit — beyond it, information is lost',
    ],
  },
  {
    id: 'pg-root-locus',
    name: 'Root Locus Plot',
    description: 'Interactive root locus for control-systems design. Enter the open-loop transfer function G(s) = K·num(s)/den(s) by specifying numerator and denominator polynomial coefficients. Watch the closed-loop poles migrate from the open-loop poles (K=0, red ✕) toward the open-loop zeros (K→∞, blue ○) as you drag the K slider. Live stability status, damping ratio ζ, natural frequency ωₙ, and %OS for the dominant pair.',
    icon: 'Radio',
    tool: 'root_locus',
    difficulty: 'Advanced',
    whatYouCanDo: [
      'Enter open-loop numerator and denominator polynomial coefficients',
      'Drag the K slider (10⁻³ to 10³, log scale) to walk the closed-loop poles along the locus',
      'See open-loop poles (red ✕), open-loop zeros (blue ○), and current closed-loop poles (green dots)',
      'Read live stability status (Stable / Marginally Stable / Unstable)',
      'Get damping ratio ζ, natural frequency ωₙ, and %OS for the dominant complex pair',
      'See the real & imaginary axes and the unit circle (for z-plane / discrete-time reference)',
    ],
    tutorialSteps: [
      'Default: G(s) = K / (s³ + 6s² + 11s + 6) — three real poles at −1, −2, −3',
      'Drag K from 0.001 → 1000 — watch the closed-loop poles walk along the real axis, then split into complex pairs',
      'Note: the locus always starts at the open-loop poles (K=0) and ends at the open-loop zeros (K=∞)',
      'Try a system with a zero: numerator = "1, 2" (s + 2), denominator = "1, 4, 3" (s²+4s+3)',
      'Increase K until a pole crosses into the RHP — the stability status flips to "Unstable"',
      'For a stable system, the dominant pair (smallest |Re|) gives ζ and ωₙ that predict the transient',
    ],
  },
  {
    id: 'pg-nyquist',
    name: 'Nyquist Plot',
    description: 'Interactive Nyquist plot for control-stability analysis. Enter the open-loop transfer function L(s) = num(s)/den(s); the plot shows L(jω) for ω from −∞ to +∞ as a polar curve. The critical −1 point is marked. The encirclement count N is computed automatically; enter P (or let the tool compute it from the denominator) and the closed-loop stability follows from Z = P − N. Live gain margin and phase margin readouts.',
    icon: 'Crosshair',
    tool: 'nyquist',
    difficulty: 'Advanced',
    whatYouCanDo: [
      'Enter open-loop numerator and denominator polynomial coefficients',
      'See the full Nyquist contour (positive-ω solid, negative-ω dashed mirror)',
      'Watch the −1 critical point (red ✕) and the traversal direction arrows',
      'Read the encirclement count N (clockwise) automatically',
      'Override P (open-loop RHP poles) or let the tool compute it from den(s)',
      'Get the closed-loop RHP pole count Z = P − N and stability status',
      'See gain margin (dB), phase margin (°), and the crossover frequencies',
    ],
    tutorialSteps: [
      'Default: L(s) = 1 / (s² + 0.4s + 1) — underdamped second-order loop, PM ≈ 23°',
      'Look at the green solid curve (positive ω) — does it encircle −1? The dashed mirror is the negative-ω half',
      'The encirclement count N appears in the readout panel; for stable open-loop (P=0), N must be 0 for closed-loop stability',
      'Increase the s coefficient (denominator) to add damping — watch the curve shrink away from −1 and PM rise',
      'Try an unstable open-loop: denominator "1, -1, -2" (roots at +2 and −1) — P = 1, so the loop is stable only if N = 1',
      'Click "Apply" after editing coefficients to recompute the plot',
    ],
  },
  {
    id: 'pg-kmap',
    name: 'Karnaugh Map Solver',
    description: 'Interactive Karnaugh-map solver for Boolean logic minimization. Pick 2, 3, or 4 variables; click cells (or truth-table rows) to toggle 0/1; the prime implicants are detected automatically and drawn as colored group rectangles (with wrap-around). The minimized SOP expression and the canonical sum-of-minterms are shown side-by-side for comparison. Clear / set-all-1 / random-fill controls.',
    icon: 'Grid3x3',
    tool: 'kmap',
    difficulty: 'Beginner',
    whatYouCanDo: [
      'Pick 2, 3, or 4 variables (2×2, 4×2, or 4×4 K-map with Gray-code ordering)',
      'Click any K-map cell (or truth-table row) to toggle its output 0↔1',
      'See prime implicants automatically detected and drawn as colored group rectangles',
      'Group rectangles wrap around the K-map edges (the K-map is a torus)',
      'Read the minimized SOP expression (sum of prime implicants) live',
      'Compare with the canonical sum-of-minterms expression',
      'Clear all / set all to 1 / random fill',
    ],
    tutorialSteps: [
      'Default 4-var example: F(A,B,C,D) = Σm(0,1,2,5,8,9,10) — a classic minimization problem',
      'Look at the colored group rectangles — each one is a prime implicant (a maximal power-of-2 group of 1s)',
      'Click a cell that is currently 0 to flip it to 1 — watch the groups reorganize and the SOP expression update',
      'Notice wrap-around: groups that cross the right edge continue on the left (and top ↔ bottom)',
      'Compare the minimized SOP (fewer literals) with the canonical Σm(...) form — that is the gate-count savings',
      'Try "Random fill" then watch how the solver finds the largest possible groups',
    ],
  },
  {
    id: 'pg-logic-analyzer',
    name: 'Logic Analyzer',
    description: '8-channel logic analyzer for digital-signal protocols. Pick a preset (clock, 4-bit counter, UART, SPI, I2C, or manual) and see the canonical waveform footprint across channels D0–D7. Adjust clock period, baud rate, and data byte. Set a trigger (channel + edge) and the display re-aligns so the trigger event sits at the red T marker. Hex values shown per clock cycle at the top.',
    icon: 'Workflow',
    tool: 'logic_analyzer',
    difficulty: 'Intermediate',
    whatYouCanDo: [
      'Pick a protocol preset: Clock, Counter, UART, SPI, I2C, Manual, or Idle',
      'See the canonical waveform footprint across 8 channels (D0–D7) with named labels (SCLK, CS, MOSI, MISO, SDA, SCL, TX, etc.)',
      'Adjust clock period (2–16 samples), baud period (2–8 samples), and data byte (0x00–0xFF)',
      'Set a trigger: pick a channel + edge (rising/falling) and the display re-aligns so the trigger sits at the red T marker',
      'Read hex values per clock cycle at the top of the display',
      'In Manual mode, click any cell of the waveform to toggle that bit',
      'Zoom in/out with the timebase control (samples per division)',
    ],
    tutorialSteps: [
      'Default preset: SPI — see SCLK (D0), CS (D1), MOSI (D2), MISO (D3) for an 8-bit transaction',
      'Watch CS go low at the start of the transaction and high at the end (idle)',
      'Try the UART preset — see the start bit (low), 8 data bits (LSB first), and stop bit (high)',
      'Try I2C — see the START condition (SDA falls while SCL high), address, data, and STOP',
      'Set a trigger on CS (D1) falling edge — the display re-aligns so the transaction starts at the red T marker',
      'Switch to Manual mode and click waveform cells to draw your own pattern',
      'Use the timebase buttons (Zoom In / Zoom Out) to spread out or compress the view',
    ],
  },
  {
    id: 'pg-transline',
    name: 'Transmission Line Simulator',
    description: 'Watch a wave travel down a transmission line, reflect off a mismatched load, and form a standing-wave pattern. Adjust Z_s, Z_0, Z_L, frequency, and line length (1–10 wavelengths). See Γ, SWR, return loss, V_max/V_min, and |Z_in| live. Try short / open / matched loads to see total reflection vs. the flat-envelope matched case.',
    icon: 'Radio',
    tool: 'transline',
    difficulty: 'Advanced',
    whatYouCanDo: [
      'Set source impedance Z_s, line impedance Z_0, and load impedance Z_L with sliders',
      'Sweep frequency (100 MHz – 30 GHz) and line length (1–10 wavelengths) live',
      'Watch the incident (green), reflected (amber), and total (white) voltage waves animate along the line',
      'See the standing-wave envelope |V(z)| with V_max and V_min markers below the animation',
      'Read Γ magnitude and phase, SWR, return loss, and |Z_in| at the source',
      'Try Short / Open / Matched presets to see the canonical reflection cases',
    ],
    tutorialSteps: [
      'Default: Z_0=50Ω, Z_L=100Ω, 1 GHz, 4λ long — see the standing wave with periodic V_max/V_min',
      'Click "Match Z_L=Z_0" — the envelope flattens to 1.0 and SWR drops to 1:1',
      'Click "Short" (Z_L=0) — |Γ|=1, SWR→∞, envelope touches zero every λ/4',
      'Click "Open" (Z_L=∞) — same |Γ|=1 but the V_max and V_min positions swap (180° phase shift)',
      'Sweep the frequency slider — wavelength changes, so the number of standing-wave peaks in the line changes',
      'Sweep the line length slider — the input impedance |Z_in| changes as you add or remove quarter-wavelengths',
    ],
  },
  {
    id: 'pg-antenna',
    name: 'Antenna Radiation Patterns',
    description: 'Polar radiation-pattern viewer for 5 canonical antennas: isotropic, half-wave dipole, quarter-wave monopole, 3-element Yagi, and patch. Toggle patterns on/off to overlay them for direct comparison. Read peak gain (dBi), beamwidth (°), and front-to-back ratio (dB). Side-view SVG shows the physical antenna layout.',
    icon: 'Radio',
    tool: 'antenna',
    difficulty: 'Intermediate',
    whatYouCanDo: [
      'Toggle isotropic / dipole / monopole / Yagi / patch patterns on and off',
      'Overlay multiple patterns on one polar plot (dB scale, dBi radial axis) for direct comparison',
      'Read peak gain (dBi), beamwidth (°), and front-to-back ratio (dB) for the primary antenna',
      'See a side-view SVG of each antenna (point source, dipole rods, monopole on ground plane, Yagi boom + elements, patch + substrate)',
      'Compare the omnidirectional dipole donut vs the directional Yagi main lobe + back lobe',
      'Quick-comparison table of all 5 antennas (gain + beamwidth)',
    ],
    tutorialSteps: [
      'Default: dipole pattern visible — the figure-8 in the E-plane',
      'Toggle "Yagi" on to overlay — see the focused main lobe and small back lobe (9.5 dBi vs 2.15 dBi)',
      'Toggle "Patch" on — see the broadside lobe perpendicular to the patch',
      'Toggle "Monopole" — same as dipole but only the upper hemisphere (ground plane reflection)',
      'Click an antenna twice to hide it; the first visible one is the "primary" (readouts + side view)',
      'Notice that more gain always means more directionality — gain comes from focusing the beam',
    ],
  },
  {
    id: 'pg-fsm',
    name: 'FSM Editor & Simulator',
    description: 'Interactive finite-state-machine editor. Add states by clicking the canvas, draw transitions by clicking source then target, label transitions with input symbols. Shift+click to set the initial state, double-click to toggle accepting. Simulate by entering an input string and stepping through. Presets: traffic light, vending machine (75¢), and a 101-sequence detector. Live transition-table export.',
    icon: 'Workflow',
    tool: 'fsm',
    difficulty: 'Intermediate',
    whatYouCanDo: [
      'Add states by clicking the empty SVG canvas',
      'Draw transitions between states by clicking source then target',
      'Label each transition with an input symbol ("1", "0", "reset", "timer", etc.)',
      'Set the initial state (Shift+click or "Set initial" button) and mark accepting states (double-click)',
      'Enter an input string and click "Step" to advance one symbol at a time, or "Run" to execute the whole string',
      'Load presets: traffic light controller, vending machine, sequence detector for "101"',
      'See the state transition table auto-generated below the canvas',
    ],
    tutorialSteps: [
      'Pick the "Sequence detector (101)" preset — see 4 states with the S3 accepting state double-ringed',
      'Click "Run" with the default input "1 1 0 1 0 1" — the FSM should reach S3 on the final symbol',
      'Click "Step" instead to walk one symbol at a time and watch the current state turn green',
      'Try modifying the input string and Run again to see different paths',
      'Click empty canvas to add a new state, then "Start transition from here" and click a target state',
      'Edit transition labels inline (in the right-hand list) to change what input triggers each transition',
      'The transition table at the bottom is what you would hand off to a synthesis tool to generate the gate-level circuit',
    ],
  },
  {
    id: 'pg-powerflow',
    name: 'Power Flow Simulator (5-bus)',
    description: 'Interactive 5-bus power-system simulator: slack + generator + 3 load buses connected by 7 transmission lines. Adjust generation and load with sliders; see line MW flows (arrows), bus voltages (color-coded green/amber/red), and line losses (I²R). Click any line to trip it and watch power redistribute — or watch a load bus go dark when islanded. DC power-flow solver + Gauss-Seidel voltage update.',
    icon: 'Zap',
    tool: 'powerflow',
    difficulty: 'Advanced',
    whatYouCanDo: [
      'Adjust generation at the generator bus (0–200 MW) and load at each of the 3 load buses (0–150 MW)',
      'Adjust AVR voltage setpoints on slack and gen buses (0.95–1.08 pu)',
      'See live line flows as arrows with MW magnitude labels',
      'See bus voltages color-coded: green ≥0.97, amber 0.93–0.97, red <0.93',
      'See line loading (capacity %) and per-line I²R losses',
      'Click any line to trip it — power redistributes or a load bus gets islanded (DARK)',
      'Read total generation, total load, total losses, and system frequency (50/60 Hz) with imbalance drift',
    ],
    tutorialSteps: [
      'Default: 5 buses, 7 lines, Gen=100 MW, loads 50+60+40 MW — system balanced, slack picks up the rest',
      'Click the line between Gen and Load B (the rightmost middle line) — power reroutes through Load A and Load C',
      'Push Load B slider up to 100 MW — watch the Load A → Load B line turn amber (≥80%) then red (overloaded)',
      'Notice bus voltages on the remote loads drop as you push more power through the same lines (I²R losses)',
      'Trip enough lines and a load bus goes "ISLANDED" — voltage drops to 0, no power flows',
      'Toggle 50 Hz vs 60 Hz nominal frequency; watch the live frequency drift with the gen–load imbalance',
      'Click "Reset system" to restore all lines and defaults',
    ],
  },
];
