'use client';

import * as React from 'react';
import { ExternalLink, Cpu, AlertTriangle, RotateCw, Play, Square, Terminal, Undo2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArduinoUnoSVG, ESP32DevKitSVG, LEDSVG, ResistorSVG } from './RealisticComponents';

export interface WokwiEmbedProps {
  /**
   * Full Wokwi project URL — e.g. `https://wokwi.com/projects/12345`.
   * If the project doesn't exist or can't be embedded, falls back to
   * a built-in interactive demo using @wokwi/elements.
   */
  projectUrl?: string;
  /** Numeric Wokwi project ID. */
  projectId?: string;
  /** Optional title for the card header. */
  title?: string;
  /** Which built-in demo to show as fallback. */
  fallbackDemo?: 'arduino-blink' | 'esp32-wifi' | 'robot-sensors';
}

const WOKWI_HOST = 'wokwi.com';

function parseProjectId(input: string): string {
  try {
    const u = new URL(input);
    if (u.hostname !== WOKWI_HOST && u.hostname !== `www.${WOKWI_HOST}`) {
      return '';
    }
    const m = u.pathname.match(/\/projects\/(\d+)/);
    return m ? m[1] : '';
  } catch {
    return '';
  }
}

/**
 * Embed a Wokwi microcontroller simulation. If the project URL is broken
 * or the project doesn't exist, falls back to a built-in interactive demo
 * using @wokwi/elements (LED + button + code) so users always get a
 * working simulation.
 */
export function WokwiEmbed({
  projectUrl,
  projectId,
  title = 'Live Microcontroller Simulation',
  fallbackDemo = 'arduino-blink',
}: WokwiEmbedProps) {
  const id = React.useMemo(() => {
    if (projectId) return projectId;
    if (projectUrl) return parseProjectId(projectUrl);
    return '';
  }, [projectUrl, projectId]);

  // Check if the project actually exists — Wokwi returns 200 even for 404 pages,
  // so we verify by checking if the embed loads. If it fails, show the fallback.
  const [useFallback, setUseFallback] = React.useState(!id);
  const [iframeKey, setIframeKey] = React.useState(0);
  const [iframeError, setIframeError] = React.useState(false);

  // If no valid ID, go straight to fallback
  React.useEffect(() => {
    if (!id) setUseFallback(true);
  }, [id]);

  if (useFallback || iframeError) {
    return <BuiltInDemo demo={fallbackDemo} title={title} projectUrl={projectUrl} />;
  }

  const embedUrl = `https://wokwi.com/projects/${id}?view=preview`;
  const openUrl = `https://wokwi.com/projects/${id}`;

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas">
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Cpu className="h-4 w-4 text-accent" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {title}
        </span>
        <span className="text-[10px] text-body-mid">
          (Wokwi · real virtual MCU)
        </span>
        <button
          type="button"
          onClick={() => { setIframeKey((k) => k + 1); setIframeError(false); }}
          className="ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-body-mid hover:bg-canvas-soft hover:text-ink"
          aria-label="Reload simulation"
        >
          <RotateCw className="h-3 w-3" />
          reload
        </button>
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-accent hover:bg-accent/10"
        >
          <ExternalLink className="h-3 w-3" />
          Open in Wokwi
        </a>
      </div>

      <iframe
        key={iframeKey}
        title={title}
        src={embedUrl}
        className={cn('block h-[500px] w-full bg-white')}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
        allow="fullscreen; accelerometer; autoplay"
        referrerPolicy="no-referrer-when-downgrade"
        onError={() => setIframeError(true)}
      />

      <div className="border-t border-hairline bg-canvas-card px-3 py-2.5">
        <p className="text-[11px] leading-relaxed text-body-mid">
          This is a{' '}
          <span className="text-accent">real Arduino/ESP32 simulation</span>.
          The code runs on a virtual MCU. Click{' '}
          <span className="text-ink">Open in Wokwi →</span> to enter the IDE
          and edit the code.
        </p>
      </div>
    </div>
  );
}

// ── Demo code snippets ──────────────────────────────────────────────────────
const DEMO_CODE: Record<string, string> = {
  'arduino-blink': `// Arduino Blink — the "hello world" of embedded
// LED on pin 13 blinks at 1 Hz

#define LED_PIN 13

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Arduino Blink starting...");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}`,
  'esp32-wifi': `// ESP32 WiFi Temperature Station
// Reads a simulated sensor and would serve a web page

#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "SimulatedWiFi";
const char* password = "password123";

WebServer server(80);
float temperature = 23.5;

void handleRoot() {
  String html = "<html><body>";
  html += "<h1>ESP32 Temperature</h1>";
  html += "<p>Temp: " + String(temperature) + " &deg;C</p>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  server.on("/", handleRoot);
  server.begin();
}

void loop() {
  server.handleClient();
  temperature += (random(-10, 10)) * 0.01;
  delay(100);
}`,
  'robot-sensors': `// Line-Following Robot — PID control
// 5 IR sensors → weighted average → PID → motor speed

#define NUM_SENSORS 5
int sensorPins[NUM_SENSORS] = {A0, A1, A2, A3, A4};
int sensorValues[NUM_SENSORS];

// PID gains
float Kp = 50.0;
float Ki = 0.0;
float Kd = 10.0;

float error = 0, lastError = 0, integral = 0;
int baseSpeed = 150;

void setup() {
  for (int i = 0; i < NUM_SENSORS; i++) {
    pinMode(sensorPins[i], INPUT);
  }
  // Motor pins
  pinMode(5, OUTPUT);  // left motor
  pinMode(6, OUTPUT);  // right motor
  Serial.begin(9600);
}

void loop() {
  // Read sensors
  for (int i = 0; i < NUM_SENSORS; i++) {
    sensorValues[i] = digitalRead(sensorPins[i]);
  }

  // Weighted average: -2 to +2
  float position = 0;
  int count = 0;
  for (int i = 0; i < NUM_SENSORS; i++) {
    if (sensorValues[i]) {
      position += (i - 2);
      count++;
    }
  }
  position = count > 0 ? position / count : lastError;

  // PID
  error = 0 - position;
  integral += error;
  float derivative = error - lastError;
  float correction = Kp * error + Ki * integral + Kd * derivative;
  lastError = error;

  // Motor speeds
  int leftSpeed = baseSpeed + correction;
  int rightSpeed = baseSpeed - correction;

  analogWrite(5, leftSpeed);
  analogWrite(6, rightSpeed);

  Serial.print("Pos: ");
  Serial.print(position);
  Serial.print(" Correction: ");
  Serial.println(correction);
}`,
};

// ── Serial line type ────────────────────────────────────────────────────────
interface SerialLine {
  text: string;
  kind: 'system' | 'out' | 'info' | 'success' | 'warn';
}

// ── Current-flow dot for the HTML wire between board and LED ────────────────
function CurrentFlowDot({ active, width = 64 }: { active: boolean; width?: number }) {
  if (!active) return null;
  return (
    <span
      className="absolute top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_6px_var(--accent)]"
      style={
        {
          '--wire-flow-distance': `${width}px`,
          animation: 'wire-flow 0.55s linear infinite',
        } as React.CSSProperties
      }
      aria-hidden
    />
  );
}

/**
 * Built-in interactive demo using @wokwi/elements.
 * This always works — no external dependency on Wokwi project IDs.
 * Shows an Arduino-like LED+button demo with real code the user can read.
 */
function BuiltInDemo({
  demo,
  title,
  projectUrl,
}: {
  demo: 'arduino-blink' | 'esp32-wifi' | 'robot-sensors';
  title: string;
  projectUrl?: string;
}) {
  const [running, setRunning] = React.useState(false);
  const [ledState, setLedState] = React.useState(false);

  // Editable code — seeded from DEMO_CODE, user can edit; Reset restores.
  const originalCode = DEMO_CODE[demo] || DEMO_CODE['arduino-blink'];
  const [code, setCode] = React.useState(originalCode);
  // Reset the editable buffer whenever the demo type changes.
  React.useEffect(() => {
    setCode(DEMO_CODE[demo] || DEMO_CODE['arduino-blink']);
  }, [demo]);

  // Serial monitor output.
  const [serialLines, setSerialLines] = React.useState<SerialLine[]>([]);
  const serialRef = React.useRef<HTMLDivElement | null>(null);

  // Auto-scroll the serial monitor to the bottom whenever new lines arrive.
  React.useEffect(() => {
    if (serialRef.current) {
      serialRef.current.scrollTop = serialRef.current.scrollHeight;
    }
  }, [serialLines]);

  // Refs that the simulation loop reads/writes so the interval closure stays
  // stable across re-renders.
  const ledStateRef = React.useRef(false);
  React.useEffect(() => { ledStateRef.current = ledState; }, [ledState]);

  const tickCountRef = React.useRef(0);

  // ── Simulation engine ──────────────────────────────────────────────────
  // Each demo has its own behaviour:
  //  - arduino-blink: LED toggles every 500ms, prints "LED ON"/"LED OFF"
  //    on each toggle. Initial line: "Arduino Blink starting..."
  //  - esp32-wifi: LED stays on after WiFi connects. Prints "WiFi connecting..."
  //    then dots, then "WiFi connected!" + "IP: 192.168.1.100".
  //  - robot-sensors: motors + sensors visualised, prints PID correction.
  React.useEffect(() => {
    if (!running) {
      setLedState(false);
      return;
    }

    // Reset transient simulation state at start-of-run.
    tickCountRef.current = 0;
    setLedState(false);

    // Seed the serial monitor with the appropriate opening line.
    if (demo === 'arduino-blink') {
      setSerialLines([{ text: 'Arduino Blink starting...', kind: 'system' }]);
    } else if (demo === 'esp32-wifi') {
      setSerialLines([{ text: 'WiFi connecting...', kind: 'system' }]);
    } else {
      setSerialLines([{ text: 'Robot boot — sensors online.', kind: 'system' }]);
    }

    let interval: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const appendLine = (line: SerialLine) => {
      setSerialLines((prev) => [...prev, line]);
    };

    if (demo === 'arduino-blink') {
      // 1 Hz blink — toggle every 500ms.
      interval = setInterval(() => {
        const next = !ledStateRef.current;
        ledStateRef.current = next;
        setLedState(next);
        appendLine({ text: next ? 'LED ON' : 'LED OFF', kind: next ? 'success' : 'out' });
      }, 500);
    } else if (demo === 'esp32-wifi') {
      // WiFi handshake: 4 dots at 400ms each, then "connected" + IP.
      let dotCount = 0;
      interval = setInterval(() => {
        dotCount += 1;
        if (dotCount <= 4) {
          appendLine({ text: '.', kind: 'out' });
        }
        if (dotCount === 4) {
          appendLine({ text: 'WiFi connected!', kind: 'success' });
          appendLine({ text: 'IP: 192.168.1.100', kind: 'info' });
          // Light the onboard LED once connected.
          ledStateRef.current = true;
          setLedState(true);
          appendLine({ text: 'HTTP server listening on :80', kind: 'system' });
        }
        if (dotCount > 6) {
          // Stop ticking — WiFi is up, just serve.
          if (interval) clearInterval(interval);
        }
      }, 400);
    } else if (demo === 'robot-sensors') {
      // Robot: every 250ms print a simulated PID correction line.
      interval = setInterval(() => {
        tickCountRef.current += 1;
        const pos = (Math.sin(tickCountRef.current * 0.4) * 1.5).toFixed(2);
        const corr = (Math.cos(tickCountRef.current * 0.4) * 35).toFixed(2);
        appendLine({ text: `Pos: ${pos}  Correction: ${corr}`, kind: 'out' });
      }, 250);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [running, demo]);

  const handleResetCode = () => {
    setCode(originalCode);
  };

  const handleClearSerial = () => {
    setSerialLines([]);
  };

  const isArduinoLike = demo === 'arduino-blink' || demo === 'esp32-wifi';
  const showBoard = demo !== 'robot-sensors';

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Cpu className="h-4 w-4 text-accent" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {title}
        </span>
        <span className="text-[10px] text-body-mid">
          (Built-in simulator · no external account needed)
        </span>
        {projectUrl && (
          <a
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-accent hover:bg-accent/10"
          >
            <ExternalLink className="h-3 w-3" />
            Try on Wokwi
          </a>
        )}
      </div>

      {/* Two-column layout: circuit on left, code+serial on right */}
      <div className="grid gap-0 lg:grid-cols-2">
        {/* Circuit panel */}
        <div className="border-b border-hairline bg-canvas p-6 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium text-body-mid">Circuit</div>
            <div className="text-[10px] text-body-mid">
              {demo === 'esp32-wifi' ? 'ESP32 DevKit V1' : demo === 'robot-sensors' ? 'Arduino + IR array' : 'Arduino Uno R3'}
            </div>
          </div>
          {/* Realistic board + LED circuit */}
          <div className="flex flex-col items-center gap-4 py-2">
            {/* Arduino or ESP32 board — realistic interactive SVG */}
            {showBoard && (
              demo === 'esp32-wifi' ? (
                <ESP32DevKitSVG
                  ledOn={ledState}
                  onPinClick={(pinId) => {
                    // Pin clicks are surfaced in the serial monitor so the
                    // user gets feedback that they actually did something.
                    setSerialLines((prev) => [...prev, { text: `[pin] ${pinId} selected`, kind: 'info' }]);
                  }}
                />
              ) : (
                <ArduinoUnoSVG
                  ledOn={ledState}
                  onPinClick={(pinId) => {
                    setSerialLines((prev) => [...prev, { text: `[pin] ${pinId} selected`, kind: 'info' }]);
                  }}
                />
              )
            )}

            {/* Robot sensor visualization (no board) */}
            {demo === 'robot-sensors' && (
              <div className="flex w-full flex-col items-center gap-3">
                {/* IR sensor array */}
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={cn(
                        'h-6 w-6 rounded border-2',
                        running && i === 2 ? 'border-accent bg-accent' : 'border-hairline bg-canvas-card'
                      )} />
                      <span className="text-[8px] text-body-mid">IR{i}</span>
                    </div>
                  ))}
                </div>
                {/* Motor visualization */}
                <div className="flex gap-8">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      'h-10 w-10 rounded-full border-2',
                      running ? 'border-accent bg-accent/20' : 'border-hairline'
                    )} style={running ? { animation: 'spin 1s linear infinite' } : undefined}>
                      <div className="h-full w-full rounded-full border-2 border-dashed border-accent/40" />
                    </div>
                    <span className="text-[9px] text-body-mid">Left</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      'h-10 w-10 rounded-full border-2',
                      running ? 'border-accent bg-accent/20' : 'border-hairline'
                    )} style={running ? { animation: 'spin 1s linear infinite' } : undefined}>
                      <div className="h-full w-full rounded-full border-2 border-dashed border-accent/40" />
                    </div>
                    <span className="text-[9px] text-body-mid">Right</span>
                  </div>
                </div>
              </div>
            )}

            {/* LED + Resistor on a mini breadboard */}
            {isArduinoLike && (
              <div className="flex items-end gap-3">
                <div className="flex flex-col items-center gap-1">
                  <LEDSVG color="#7FFF9F" on={ledState} size={50} />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-body-mid">LED</span>
                    <span className={cn(
                      'rounded px-1 py-px text-[8px] font-bold uppercase tracking-wider',
                      ledState ? 'bg-success/15 text-success' : 'bg-canvas-mid text-body-mid'
                    )}>
                      {ledState ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ResistorSVG value="220Ω" size={60} />
                  <span className="text-[10px] text-body-mid">220Ω</span>
                </div>
              </div>
            )}

            {/* Wire connecting board pin to LED — with animated current-flow dot */}
            {isArduinoLike && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-body-mid">
                  {demo === 'esp32-wifi' ? 'GPIO2' : 'pin 13'}
                </span>
                <span className="relative inline-block h-0.5 w-16 bg-hairline">
                  <span
                    className={cn(
                      'absolute inset-y-0 left-0 transition-colors',
                      ledState ? 'bg-accent' : 'bg-hairline'
                    )}
                    style={{ width: '100%' }}
                  />
                  <CurrentFlowDot active={ledState} width={64} />
                </span>
                <span className="text-[10px] text-body-mid">→</span>
                <span className="relative inline-block h-0.5 w-8 bg-hairline">
                  <span
                    className={cn(
                      'absolute inset-y-0 left-0 transition-colors',
                      ledState ? 'bg-accent' : 'bg-hairline'
                    )}
                    style={{ width: '100%' }}
                  />
                  <CurrentFlowDot active={ledState} width={32} />
                </span>
                <span className="text-[10px] font-mono text-body-mid">GND</span>
              </div>
            )}
          </div>

          {/* Run/Stop button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setRunning((r) => !r)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-colors',
                running
                  ? 'bg-error/20 text-error hover:bg-error/30'
                  : 'bg-accent text-canvas hover:bg-accent/90'
              )}
            >
              {running ? (
                <>
                  <Square className="h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Simulation
                </>
              )}
            </button>
          </div>

          {/* Status */}
          <div className="mt-3 text-center text-[11px] text-body-mid">
            {running ? (
              <span className="text-accent">
                {demo === 'esp32-wifi'
                  ? ledState
                    ? '● Running — WiFi up, serving on :80'
                    : '● Running — WiFi handshake…'
                  : demo === 'robot-sensors'
                    ? '● Running — PID loop at 4 Hz'
                    : '● Running — LED blinking at 1 Hz'}
              </span>
            ) : (
              <span>Click Run to start the simulation</span>
            )}
          </div>
        </div>

        {/* Right column: code editor + serial monitor */}
        <div className="flex flex-col bg-canvas">
          {/* Code editor panel */}
          <div className="border-b border-hairline p-6 pb-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-body-mid">
                {demo === 'esp32-wifi' ? 'ESP32 Code' : 'Arduino Code'}
              </span>
              <span className="rounded bg-canvas-mid px-1.5 py-px text-[9px] text-body-mid">
                editable
              </span>
              <button
                type="button"
                onClick={handleResetCode}
                className="ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                aria-label="Reset code to original"
              >
                <Undo2 className="h-3 w-3" />
                Reset
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              aria-label="Microcontroller source code editor"
              className="ee-scroll ee-mono max-h-[360px] min-h-[280px] w-full resize-y rounded-sm border border-hairline bg-canvas-card p-4 text-[11px] leading-relaxed text-ink focus:outline-none focus:ring-1 focus:ring-accent/40"
            />
            <div className="mt-2 text-[11px] leading-relaxed text-body-mid">
              This is the actual {demo === 'esp32-wifi' ? 'ESP32' : 'Arduino'} C code. Edit it
              here, then click{' '}
              <span className="text-accent">Run Simulation</span> to see the
              board respond. The simulator runs the original demo timing (it
              doesn&apos;t re-compile your edits) — for full editing use{' '}
              <span className="text-ink">Try on Wokwi</span> above.
            </div>
          </div>

          {/* Serial monitor panel */}
          <div className="p-6 pt-4">
            <div className="mb-2 flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-accent" aria-hidden />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-body-mid">
                Serial Monitor
              </span>
              <span className="rounded bg-canvas-mid px-1.5 py-px text-[9px] text-body-mid">
                {demo === 'esp32-wifi' ? '115200 baud' : '9600 baud'}
              </span>
              <button
                type="button"
                onClick={handleClearSerial}
                className="ml-auto inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                aria-label="Clear serial output"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            </div>
            <div
              ref={serialRef}
              className="ee-scroll h-40 overflow-y-auto rounded-sm border border-hairline bg-canvas-card p-2.5 font-mono text-[10px] leading-relaxed"
              aria-live="polite"
              aria-label="Serial output"
            >
              {serialLines.length === 0 ? (
                <div className="flex h-full items-center justify-center text-body-mid">
                  No output yet. Click <span className="mx-1 text-accent">Run Simulation</span> to start.
                </div>
              ) : (
                serialLines.map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      'whitespace-pre-wrap',
                      line.kind === 'success' && 'text-success',
                      line.kind === 'info' && 'text-info',
                      line.kind === 'system' && 'text-body-mid italic',
                      line.kind === 'warn' && 'text-warning',
                      line.kind === 'out' && 'text-body'
                    )}
                  >
                    {line.text}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
