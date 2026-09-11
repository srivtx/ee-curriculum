'use client';

import * as React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Box, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Procedural 3D component viewer built on React Three Fiber.
 *
 * Renders one of eight EE components (resistor, capacitor, inductor, LED,
 * transistor, diode, IC, breadboard) built entirely from Three.js primitives
 * — no external 3D model files needed. The user can drag to orbit, scroll to
 * zoom, and pinch to pan. A subtle auto-rotation kicks in when the user is
 * not interacting, so the model is always shown from a friendly angle.
 *
 * Performance / bundle:
 *  - `three`, `@react-three/fiber`, and `@react-three/drei` are large
 *    (~600 KB min). This file is loaded via `next/dynamic({ ssr: false })` in
 *    `LessonDrawer.tsx` so it only ships to the browser when a lesson
 *    actually has a 3D model — it never bloats the initial `/` bundle.
 *  - The Canvas runs `frameloop="always"` because OrbitControls' autoRotate
 *    needs continuous frames. CPU/GPU cost is modest (procedural geometry
 *    only — no textures, no animations beyond a slow rotate).
 */

export type ComponentType =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'led'
  | 'transistor'
  | 'diode'
  | 'ic'
  | 'breadboard';

export interface ComponentViewer3DProps {
  component: ComponentType;
  /** Optional explicit height for the canvas (px). Defaults to 360. */
  height?: number;
}

interface ModelInfo {
  name: string;
  description: string;
  /** Initial camera distance — lets big things (breadboard) start further out. */
  cameraDistance: number;
}

const MODEL_INFO: Record<ComponentType, ModelInfo> = {
  resistor: {
    name: 'Resistor (1/4W, 1kΩ ±5%)',
    description:
      'Through-hole axial resistor. Tan ceramic body, two tinned-copper leads, four color bands (brown-black-red-gold) encoding 1×10² Ω = 1 kΩ with ±5% tolerance. Limits current per Ohm’s law V = I·R.',
    cameraDistance: 8,
  },
  capacitor: {
    name: 'Capacitor (electrolytic, 100 µF)',
    description:
      'Polarized aluminum electrolytic capacitor. Cylindrical aluminum can with a blue PVC sleeve marking the negative lead. Stores energy in an electric field; voltage rating (e.g. 25 V) printed on the sleeve. The stripe identifies the cathode (−) terminal.',
    cameraDistance: 8,
  },
  inductor: {
    name: 'Inductor (wirewound, 100 µH)',
    description:
      'Axial wirewound inductor. Ferrite core body wrapped with copper magnet wire. Stores energy in a magnetic field; opposes changes in current via v = L·di/dt. The wire resistance also makes it a small resistor at DC.',
    cameraDistance: 8,
  },
  led: {
    name: 'LED (5 mm, red)',
    description:
      '5 mm through-hole light-emitting diode. Red transparent epoxy dome, flat spot on the cathode side, two leads (anode longer). Forward voltage ~1.8 V; emits light when forward-biased above V_f. Current-limited by a series resistor.',
    cameraDistance: 7,
  },
  transistor: {
    name: 'Transistor (TO-92, NPN BJT — 2N3904)',
    description:
      'NPN BJT in the TO-92 package: black epoxy half-cylinder with three flat leads — emitter, base, collector (E-B-C left-to-right, flat face toward you). Acts as a current-controlled current source; β ≈ 100.',
    cameraDistance: 7,
  },
  diode: {
    name: 'Diode (1N4148 small-signal)',
    description:
      'Small-signal silicon diode in a glass DO-35 package. Cathode is marked with a black band. Forward-biased above ~0.7 V (silicon); blocks reverse voltage up to V_RRM. The 1N4148 is the go-to fast-switching diode.',
    cameraDistance: 7,
  },
  ic: {
    name: 'IC (DIP-8, e.g. NE555 / 741)',
    description:
      '8-pin Dual In-line Package. Black epoxy body, 0.300″ wide, 0.100″ pin pitch. Pin 1 is marked by the notch on the left end (and a dot); pin numbering goes counter-clockwise from there.',
    cameraDistance: 9,
  },
  breadboard: {
    name: 'Breadboard (half-size, 400-tie)',
    description:
      'Solderless breadboard. White ABS block with a 30×10 grid of tie-points on a 0.1″ pitch. Interior metal clips tie columns of 5 together; the two outer rails (red/blue stripes) are the power buses. Push component leads in — no solder.',
    cameraDistance: 14,
  },
};

// ── Materials (module-scope to avoid re-creating on every render) ────────────
const MAT = {
  resistorBody: new THREE.MeshStandardMaterial({ color: '#d9c8a1', roughness: 0.85 }),
  lead: new THREE.MeshStandardMaterial({
    color: '#b8b8b8',
    metalness: 0.9,
    roughness: 0.35,
  }),
  copper: new THREE.MeshStandardMaterial({
    color: '#c87533',
    metalness: 0.85,
    roughness: 0.4,
  }),
  blackPlastic: new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.7 }),
  darkPlastic: new THREE.MeshStandardMaterial({ color: '#0e0e0e', roughness: 0.7 }),
  capBody: new THREE.MeshStandardMaterial({ color: '#1a4a8a', roughness: 0.6 }),
  capStripe: new THREE.MeshStandardMaterial({ color: '#c4c4c4', roughness: 0.5, metalness: 0.3 }),
  ledRed: new THREE.MeshStandardMaterial({
    color: '#ff3344',
    transparent: true,
    opacity: 0.65,
    roughness: 0.15,
    metalness: 0,
  }),
  ledLead: new THREE.MeshStandardMaterial({
    color: '#9a9a9a',
    metalness: 0.9,
    roughness: 0.4,
  }),
  glassBody: new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    transparent: true,
    opacity: 0.85,
    roughness: 0.15,
    metalness: 0.1,
  }),
  cathodeBand: new THREE.MeshStandardMaterial({ color: '#e8e8e8', roughness: 0.6 }),
  breadboard: new THREE.MeshStandardMaterial({ color: '#f2f2ee', roughness: 0.6 }),
  breadboardRail: new THREE.MeshStandardMaterial({ color: '#d33b3b', roughness: 0.7 }),
  breadboardRailBlue: new THREE.MeshStandardMaterial({ color: '#3a5fb0', roughness: 0.7 }),
  hole: new THREE.MeshStandardMaterial({ color: '#202020', roughness: 0.9 }),
  gold: new THREE.MeshStandardMaterial({
    color: '#d4a017',
    metalness: 0.85,
    roughness: 0.35,
  }),
};

// Color bands for a 1kΩ ±5% resistor: brown (1), black (0), red (×100), gold (±5%).
const RESISTOR_BAND_COLORS = ['#8b4513', '#000000', '#ff0000', '#d4a017'];

// Common geometry helpers (module-scope to avoid GC churn).
const CYL = (rTop: number, rBot: number, len: number, seg = 24) =>
  new THREE.CylinderGeometry(rTop, rBot, len, seg);
const BOX = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

// ── Component models ─────────────────────────────────────────────────────────

/** Resistor — tan cylinder body + 2 axial leads + 4 color bands. */
function ResistorModel() {
  return (
    <group>
      {/* Body — cylinder lying along the x-axis */}
      <mesh geometry={CYL(0.6, 0.6, 3)} material={MAT.resistorBody} rotation={[0, 0, Math.PI / 2]} />
      {/* Two leads */}
      <mesh geometry={CYL(0.06, 0.06, 3)} material={MAT.lead} position={[-3, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
      <mesh geometry={CYL(0.06, 0.06, 3)} material={MAT.lead} position={[3, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
      {/* 4 color bands — thin rings near the left end */}
      {RESISTOR_BAND_COLORS.map((c, i) => (
        <mesh
          key={i}
          geometry={CYL(0.64, 0.64, 0.18)}
          material={new THREE.MeshStandardMaterial({ color: c, roughness: 0.75 })}
          position={[-1.1 + i * 0.32, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        />
      ))}
    </group>
  );
}

/** Electrolytic capacitor — blue cylinder can with a silver stripe + 2 leads. */
function CapacitorModel() {
  return (
    <group>
      {/* Body — vertical cylinder */}
      <mesh geometry={CYL(1, 1, 3)} material={MAT.capBody} />
      {/* Top — slightly recessed with a pressure-relief cross cut (just a darker disc) */}
      <mesh geometry={CYL(0.85, 0.85, 0.05)} material={MAT.darkPlastic} position={[0, 1.51, 0]} />
      {/* Silver cathode stripe down one side */}
      <mesh geometry={CYL(1.01, 1.01, 2.4)} material={MAT.capStripe} position={[0.65, 0, 0]} rotation={[0, 0, 0]} />
      {/* Two leads at the bottom */}
      <mesh geometry={CYL(0.06, 0.06, 2)} material={MAT.lead} position={[-0.4, -2.5, 0]} />
      <mesh geometry={CYL(0.06, 0.06, 2)} material={MAT.lead} position={[0.4, -2.5, 0]} />
    </group>
  );
}

/** Inductor — ferrite body wrapped with copper wire turns. */
function InductorModel() {
  // Build the copper winding as several thin torus rings around the body.
  const turns = 8;
  return (
    <group>
      {/* Body */}
      <mesh geometry={CYL(0.6, 0.6, 3)} material={MAT.resistorBody} rotation={[0, 0, Math.PI / 2]} />
      {/* Copper turns */}
      {Array.from({ length: turns }).map((_, i) => (
        <mesh
          key={i}
          geometry={new THREE.TorusGeometry(0.66, 0.08, 8, 24)}
          material={MAT.copper}
          position={[-1.1 + i * (2.2 / (turns - 1)), 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
      ))}
      {/* Leads */}
      <mesh geometry={CYL(0.06, 0.06, 3)} material={MAT.copper} position={[-3, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
      <mesh geometry={CYL(0.06, 0.06, 3)} material={MAT.copper} position={[3, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
    </group>
  );
}

/** LED — red hemisphere dome + flange + 2 leads (anode longer). */
function LedModel() {
  return (
    <group>
      {/* Dome — half-sphere on top */}
      <mesh
        geometry={new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2)}
        material={MAT.ledRed}
      />
      {/* Flange — a flat disc at the equator */}
      <mesh geometry={CYL(1.1, 1.1, 0.15, 32)} material={MAT.ledRed} position={[0, 0, 0]} />
      {/* Flat spot on the cathode side (a tiny box sliced into the dome) */}
      <mesh
        geometry={BOX(0.1, 0.4, 0.4)}
        material={MAT.darkPlastic}
        position={[-1.0, 0.5, 0]}
      />
      {/* Leads — anode (longer) on the right, cathode (shorter) on the left */}
      <mesh geometry={CYL(0.05, 0.05, 2.5)} material={MAT.ledLead} position={[0.4, -1.5, 0]} />
      <mesh geometry={CYL(0.05, 0.05, 2.0)} material={MAT.ledLead} position={[-0.4, -1.25, 0]} />
    </group>
  );
}

/** Transistor (TO-92) — half-cylinder body + 3 flat leads. */
function TransistorModel() {
  return (
    <group>
      {/* Body — half cylinder (front face), oriented vertically with flat back */}
      <mesh
        geometry={new THREE.CylinderGeometry(1, 1, 1.8, 32, 1, false, 0, Math.PI)}
        material={MAT.blackPlastic}
        rotation={[0, 0, 0]}
      />
      {/* Flat back — a thin box to close the half-cylinder */}
      <mesh geometry={BOX(0.05, 1.8, 2)} material={MAT.blackPlastic} position={[0, 0, 0]} />
      {/* Three leads at the bottom — E, B, C left-to-right, flat face toward viewer */}
      {[-0.4, 0, 0.4].map((x, i) => (
        <mesh
          key={i}
          geometry={BOX(0.1, 2, 0.1)}
          material={MAT.lead}
          position={[x, -1.9, 0]}
        />
      ))}
    </group>
  );
}

/** Diode — small glass cylinder + cathode band + 2 leads. */
function DiodeModel() {
  return (
    <group>
      {/* Body — small cylinder along x-axis */}
      <mesh geometry={CYL(0.35, 0.35, 1.6, 24)} material={MAT.glassBody} rotation={[0, 0, Math.PI / 2]} />
      {/* Cathode band — white ring on the right end */}
      <mesh geometry={CYL(0.37, 0.37, 0.18, 24)} material={MAT.cathodeBand} position={[0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
      {/* Two leads */}
      <mesh geometry={CYL(0.05, 0.05, 2.5)} material={MAT.lead} position={[-2, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
      <mesh geometry={CYL(0.05, 0.05, 2.5)} material={MAT.lead} position={[2, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
    </group>
  );
}

/** IC DIP-8 — black rectangular body + 8 leads (4 each side) + notch + dot. */
function IcModel() {
  return (
    <group>
      {/* Body — black box, oriented with pins along x-axis */}
      <mesh geometry={BOX(2.5, 1.0, 4)} material={MAT.blackPlastic} />
      {/* Notch — half-cylinder cut at the top-left end (pin 1 end) */}
      <mesh
        geometry={new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16, 1, false, 0, Math.PI)}
        material={MAT.darkPlastic}
        position={[-1.0, 0.55, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      {/* Dot — pin-1 indicator */}
      <mesh
        geometry={new THREE.SphereGeometry(0.08, 16, 16)}
        material={MAT.cathodeBand}
        position={[-0.85, 0.55, -1.4]}
      />
      {/* 8 leads — 4 on each side */}
      {[-1.5, -0.5, 0.5, 1.5].map((z, i) => (
        <React.Fragment key={`l-${i}`}>
          <mesh geometry={BOX(0.6, 0.08, 0.12)} material={MAT.lead} position={[-1.55, -0.1, z]} />
          <mesh geometry={BOX(0.6, 0.08, 0.12)} material={MAT.lead} position={[1.55, -0.1, z]} />
        </React.Fragment>
      ))}
    </group>
  );
}

/** Breadboard — white block with a grid of tie-point holes + power rails. */
function BreadboardModel() {
  // Grid of holes — 30 columns × 10 rows = 300 tie-points (a half-size board).
  const cols = 30;
  const rows = 10;
  const pitch = 0.3;
  const holes: React.ReactNode[] = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = (c - (cols - 1) / 2) * pitch;
      const z = (r - (rows - 1) / 2) * pitch;
      holes.push(
        <mesh
          key={`h-${c}-${r}`}
          geometry={CYL(0.06, 0.06, 0.05, 12)}
          material={MAT.hole}
          position={[x, 0.21, z]}
        />
      );
    }
  }
  // Power-rail holes (top and bottom strips).
  const railCols = 25;
  for (let c = 0; c < railCols; c++) {
    const x = (c - (railCols - 1) / 2) * pitch;
    holes.push(
      <mesh
        key={`rt-${c}`}
        geometry={CYL(0.06, 0.06, 0.05, 12)}
        material={MAT.hole}
        position={[x, 0.21, -(rows / 2) * pitch - 0.6]}
      />
    );
    holes.push(
      <mesh
        key={`rb-${c}`}
        geometry={CYL(0.06, 0.06, 0.05, 12)}
        material={MAT.hole}
        position={[x, 0.21, (rows / 2) * pitch + 0.6]}
      />
    );
  }
  return (
    <group>
      {/* Main board */}
      <mesh geometry={BOX(cols * pitch + 1, 0.4, rows * pitch + 2.5)} material={MAT.breadboard} position={[0, 0, 0]} />
      {/* Red power rail strip (top) */}
      <mesh
        geometry={BOX(railCols * pitch + 0.5, 0.02, 0.15)}
        material={MAT.breadboardRail}
        position={[0, 0.21, -(rows / 2) * pitch - 0.6]}
      />
      {/* Blue power rail strip (bottom) */}
      <mesh
        geometry={BOX(railCols * pitch + 0.5, 0.02, 0.15)}
        material={MAT.breadboardRailBlue}
        position={[0, 0.21, (rows / 2) * pitch + 0.6]}
      />
      {/* Center channel indent (a thin dark groove) */}
      <mesh
        geometry={BOX(cols * pitch + 0.5, 0.02, 0.3)}
        material={MAT.darkPlastic}
        position={[0, 0.21, 0]}
      />
      {holes}
    </group>
  );
}

function ModelByType({ component }: { component: ComponentType }) {
  switch (component) {
    case 'resistor': return <ResistorModel />;
    case 'capacitor': return <CapacitorModel />;
    case 'inductor': return <InductorModel />;
    case 'led': return <LedModel />;
    case 'transistor': return <TransistorModel />;
    case 'diode': return <DiodeModel />;
    case 'ic': return <IcModel />;
    case 'breadboard': return <BreadboardModel />;
    default: return null;
  }
}

// ── Lighting + scene wrapper ────────────────────────────────────────────────
function Scene({ component }: { component: ComponentType }) {
  const info = MODEL_INFO[component];
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
      <directionalLight position={[-6, 3, -4]} intensity={0.4} color={'#7FFF9F'} />
      {/* Soft environment reflection — adds a hint of realism to metal/plastic. */}
      <Environment preset="city" />

      {/* The model itself, slightly above the ground plane. */}
      <group position={[0, component === 'breadboard' ? 0 : 1.2, 0]}>
        <ModelByType component={component} />
      </group>

      {/* Soft contact shadow under the model */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.55}
        scale={20}
        blur={2.5}
        far={6}
        resolution={512}
        color={'#000000'}
      />

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={3}
        maxDistance={info.cameraDistance * 2.5}
        autoRotate
        autoRotateSpeed={0.6}
        target={[0, 0, 0]}
      />
    </>
  );
}

export function ComponentViewer3D({ component, height = 360 }: ComponentViewer3DProps) {
  const info = MODEL_INFO[component];
  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas">
      {/* Header strip — matches the FalstadEmbed / KiCanvasEmbed visual rhythm. */}
      <div className="flex items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <Box className="h-4 w-4 text-accent" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          3D Model · {info.name}
        </span>
        <span className="text-[10px] text-body-mid">
          (React Three Fiber · drag to rotate)
        </span>
      </div>

      {/* Canvas — dark background matching the v3 design system canvas color. */}
      <div
        className="relative w-full"
        style={{ height: `${height}px`, background: '#0a0a0a' }}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [4, 3, MODEL_INFO[component].cameraDistance], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={['#0a0a0a']} />
          <Scene component={component} />
        </Canvas>

        {/* Interaction hint — bottom-right overlay */}
        <div
          className={cn(
            'pointer-events-none absolute bottom-2 right-2',
            'ee-mono rounded-sm bg-canvas/80 px-2 py-0.5 text-[10px] text-body-mid',
            'border border-hairline backdrop-blur-sm'
          )}
        >
          drag · scroll to zoom
        </div>
      </div>

      {/* Footer — name + description */}
      <div className="border-t border-hairline bg-canvas-card px-3 py-2.5">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
          <p className="text-[11px] leading-relaxed text-body">
            <span className="font-medium text-ink">{info.name}.</span>{' '}
            {info.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ComponentViewer3D;
