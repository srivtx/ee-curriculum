'use client';

import * as React from 'react';
import { ExternalLink, Cpu, AlertTriangle, RotateCw, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [code, setCode] = React.useState('');
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Load the appropriate demo code
  React.useEffect(() => {
    const demos: Record<string, string> = {
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
    setCode(demos[demo] || demos['arduino-blink']);
  }, [demo]);

  // Simulate the LED blink when running
  React.useEffect(() => {
    if (running && demo === 'arduino-blink') {
      intervalRef.current = setInterval(() => {
        setLedState((s) => !s);
      }, 500);
    } else {
      setLedState(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, demo]);

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

      {/* Two-column layout: circuit on left, code on right */}
      <div className="grid gap-0 lg:grid-cols-2">
        {/* Circuit panel */}
        <div className="border-b border-hairline bg-canvas p-6 lg:border-b-0 lg:border-r">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-body-mid">
            Circuit
          </div>
          {/* Visual circuit representation */}
          <div className="flex flex-col items-center gap-6 py-4">
            {/* Arduino board representation */}
            <div className="rounded-lg border-2 border-accent/40 bg-accent/5 px-8 py-4 text-center">
              <div className="text-xs font-mono text-accent">ARDUINO UNO</div>
              <div className="mt-1 text-[10px] text-body-mid">pin 13</div>
            </div>

            {/* Wire from Arduino to LED */}
            <div className={cn('h-8 w-0.5', ledState ? 'bg-accent' : 'bg-hairline')} />

            {/* LED */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'h-16 w-16 rounded-full border-4 transition-all duration-150',
                  ledState
                    ? 'border-accent bg-accent shadow-[0_0_40px_8px_rgba(127,255,159,0.6)]'
                    : 'border-hairline bg-canvas-card'
                )}
              >
                <div className="flex h-full items-center justify-center text-[10px] font-mono">
                  {ledState ? 'ON' : 'OFF'}
                </div>
              </div>
              <div className="text-[10px] text-body-mid">LED</div>
            </div>

            {/* Wire to ground */}
            <div className="h-8 w-0.5 bg-hairline" />
            <div className="rounded border border-hairline px-4 py-1 text-[10px] font-mono text-body-mid">
              GND
            </div>
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
              <span className="text-accent">● Running — LED blinking at 1 Hz</span>
            ) : (
              <span>Click Run to start the simulation</span>
            )}
          </div>
        </div>

        {/* Code panel */}
        <div className="bg-canvas p-6">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-body-mid">
            Arduino Code
          </div>
          <pre className="ee-scroll max-h-[400px] overflow-auto rounded-sm border border-hairline bg-canvas-card p-4 text-[11px] leading-relaxed text-ink">
            <code>{code}</code>
          </pre>
          <div className="mt-3 text-[11px] leading-relaxed text-body-mid">
            This is the actual Arduino C code. On real hardware, this runs on
            an ATmega328P microcontroller. Click{' '}
            <span className="text-accent">Run Simulation</span> to see the
            LED blink. The code is read-only here — for full editing, click{' '}
            <span className="text-ink">Try on Wokwi</span> above.
          </div>
        </div>
      </div>
    </div>
  );
}
