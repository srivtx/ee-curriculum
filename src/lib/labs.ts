// Labs — progressive project-based tutorials that use the interactive tools
// Each lab is a standalone project that teaches by building.
// Labs reference curriculum phases (prerequisites) and use interactive features.

export type LabDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type LabTool = 'breadboard' | 'wokwi' | 'spice' | 'verilog' | '3d-model' | 'bode' | 'scope' | 'falstad' | 'tscircuit' | 'circuitverse' | 'hardware';
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
        toolConfig: { wokwiProject: 'https://wokwi.com/projects/328014521436533262' },
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
        toolConfig: { wokwiProject: 'https://wokwi.com/projects/327320285947308499' },
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
        toolConfig: { wokwiProject: 'https://wokwi.com/projects/255116253193679131' },
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
];
