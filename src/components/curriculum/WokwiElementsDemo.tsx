'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { RotateCcw, MousePointerClick } from 'lucide-react';
import type { PushbuttonElement } from '@wokwi/elements';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Interactive LED + pushbutton demo built on `@wokwi/elements` — the same Lit
 * web components that power the Wokwi simulator. The components are real SVG
 * representations of a breadboard LED and a tactile pushbutton, with the same
 * visual behavior as in Wokwi.
 *
 * Implementation notes:
 *  - `@wokwi/elements` registers its custom elements as a side effect of
 *    importing the package. We do that import inside a `useEffect` so it only
 *    runs in the browser (Lit + `customElements.define` are not available
 *    during SSR).
 *  - The pushbutton dispatches non-standard `button-press` / `button-release`
 *    events (see node_modules/@wokwi/elements/dist/esm/pushbutton-element.js).
 *    React 19 only auto-binds `onClick`-style props to lowercase DOM events,
 *    so we attach listeners via `addEventListener` on a ref.
 *  - The LED's `value` property is a boolean (Lit will coerce a number too,
 *    but the type def is `boolean`). We pass booleans directly.
 *  - We expose three independent momentary buttons (R/G/B) plus one "toggle"
 *    button that latches state — so the demo shows both event semantics in a
 *    single glance.
 */

type Led = {
  key: 'red' | 'green' | 'blue' | 'toggle';
  color: string;
  lightColor?: string;
  label: string;
  mode: 'momentary' | 'toggle';
};

const LEDS: Led[] = [
  { key: 'red', color: 'red', label: 'Red', mode: 'momentary' },
  { key: 'green', color: 'green', label: 'Green', mode: 'momentary' },
  { key: 'blue', color: 'blue', label: 'Blue', mode: 'momentary' },
  { key: 'toggle', color: '#7FFF9F', lightColor: '#7FFF9F', label: 'Latch', mode: 'toggle' },
];

function WokwiElementsDemoInner() {
  const [lit, setLit] = React.useState<Record<Led['key'], boolean>>({
    red: false,
    green: false,
    blue: false,
    toggle: false,
  });

  // Refs to the four <wokwi-pushbutton> custom elements.
  const buttonRefs = React.useRef<Record<Led['key'], PushbuttonElement | null>>({
    red: null,
    green: null,
    blue: null,
    toggle: null,
  });

  const [ready, setReady] = React.useState(false);

  // Side-effect import of @wokwi/elements — registers the custom elements
  // (Lit calls customElements.define) only in the browser.
  React.useEffect(() => {
    let mounted = true;
    import('@wokwi/elements')
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch((err) => {
        console.error('Failed to load @wokwi/elements:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Wire button-press / button-release listeners for each button.
  // Momentary buttons: press → lit, release → unlit.
  // Toggle button: press → flip state, release → no-op.
  React.useEffect(() => {
    if (!ready) return;
    const cleanups: Array<() => void> = [];
    (Object.keys(buttonRefs.current) as Led['key'][]).forEach((key) => {
      const el = buttonRefs.current[key];
      if (!el) return;
      const led = LEDS.find((l) => l.key === key)!;
      const onPress = () => {
        setLit((prev) =>
          led.mode === 'toggle' ? { ...prev, [key]: !prev[key] } : { ...prev, [key]: true }
        );
      };
      const onRelease = () => {
        if (led.mode === 'momentary') {
          setLit((prev) => ({ ...prev, [key]: false }));
        }
      };
      el.addEventListener('button-press', onPress as EventListener);
      el.addEventListener('button-release', onRelease as EventListener);
      cleanups.push(() => {
        el.removeEventListener('button-press', onPress as EventListener);
        el.removeEventListener('button-release', onRelease as EventListener);
      });
    });
    return () => cleanups.forEach((c) => c());
  }, [ready]);

  const reset = () => setLit({ red: false, green: false, blue: false, toggle: false });

  const litCount = Object.values(lit).filter(Boolean).length;

  return (
    <div className="overflow-hidden rounded-sm border border-accent/30 bg-canvas">
      {/* Header strip — matches the FalstadEmbed / KiCanvasEmbed visual rhythm. */}
      <div className="flex items-center gap-2 border-b border-hairline bg-accent/5 px-3 py-2">
        <MousePointerClick className="h-4 w-4 text-accent" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          Interactive · Wokwi components
        </span>
        <span className="text-[10px] text-body-mid">
          (real Lit web elements)
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="ml-auto h-7 gap-1 rounded-full px-2 text-[10px] text-body-mid hover:text-ink"
          aria-label="Reset all LEDs"
        >
          <RotateCcw className="h-3 w-3" />
          reset
        </Button>
      </div>

      {/* Interactive surface — four (button, LED) pairs in a 2×2 grid on
          desktop, single column on mobile. The pushbuttons and LEDs are the
          real Wokwi Lit web components; we just give them a stage. */}
      <div className="bg-canvas-card p-4 sm:p-6">
        <p className="mb-4 text-[11px] leading-relaxed text-body-mid">
          Press the tactile button on each tile to light its LED. The first
          three are <span className="text-ink">momentary</span> (lit only while
          pressed); the fourth is a{' '}
          <span className="text-accent">latching toggle</span>.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LEDS.map((led) => (
            <div
              key={led.key}
              className={cn(
                'flex flex-col items-center justify-between gap-3 rounded-sm border border-hairline bg-canvas px-3 py-4 transition-colors',
                lit[led.key] && 'border-accent/40'
              )}
              aria-label={`${led.label} LED tile`}
            >
              <div className="flex h-12 items-center justify-center">
                {ready ? (
                  <wokwi-led
                    color={led.color}
                    lightColor={led.lightColor}
                    value={lit[led.key]}
                  />
                ) : (
                  <span className="ee-mono text-[11px] text-body-mid">…</span>
                )}
              </div>

              <div className="flex h-12 items-center justify-center">
                {ready ? (
                  <wokwi-pushbutton
                    color={led.color === '#7FFF9F' ? 'red' : led.color}
                    ref={(el: PushbuttonElement | null) => {
                      buttonRefs.current[led.key] = el;
                    }}
                  />
                ) : (
                  <span className="ee-mono text-[11px] text-body-mid">…</span>
                )}
              </div>

              <div className="flex w-full items-center justify-between gap-2 text-[10px] text-body-mid">
                <span className="ee-mono uppercase tracking-wider">
                  {led.label}
                </span>
                <span
                  className={cn(
                    'ee-mono uppercase tracking-wider',
                    lit[led.key] ? 'text-accent' : 'text-body-mid'
                  )}
                  aria-live="polite"
                >
                  {lit[led.key] ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-hairline pt-3 text-[11px] text-body-mid">
          <span>
            {litCount} of {LEDS.length} LEDs lit
          </span>
          <span className="ee-mono">
            button-press · button-release · value=&#123;bool&#125;
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * SSR-safe wrapper. `@wokwi/elements` calls `customElements.define` on import,
 * which is unavailable during SSR — so we defer the entire component to the
 * client via `next/dynamic`. The placeholder matches the post-load card
 * footprint so the lesson drawer doesn't jump.
 */
export const WokwiElementsDemo = dynamic(
  () => Promise.resolve(WokwiElementsDemoInner),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-sm border border-accent/30 bg-canvas px-4 py-6 text-center">
        <div className="ee-mono text-[11px] text-body-mid">
          Loading interactive components…
        </div>
      </div>
    ),
  }
);
