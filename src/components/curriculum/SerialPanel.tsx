'use client';

import * as React from 'react';
import { Usb, X, Send, Trash2, Loader2, Cable, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useSerial } from '@/hooks/useSerial';
import { cn } from '@/lib/utils';

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

/**
 * Floating-action button + slide-in serial monitor. Wraps the WebSerial hook
 * and surfaces a clean connect / send / receive UI. On unsupported browsers
 * the button still appears but the panel shows a "use Chrome/Edge" notice.
 *
 * Design System v3: FAB is a pill with the "Connect hardware" label below it
 * (task D-website-redesign Goal 3.5 — make WebSerial more discoverable).
 */
export function SerialPanel() {
  const [open, setOpen] = React.useState(false);
  const [baudRate, setBaudRate] = React.useState<number>(115200);
  const [input, setInput] = React.useState('');
  const serial = useSerial({ baudRate });

  const outputRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [serial.lines]);

  const handleConnect = async () => {
    await serial.connect();
  };
  const handleDisconnect = async () => {
    await serial.disconnect();
  };
  const handleSend = async () => {
    if (!input) return;
    await serial.write(input + '\n');
    setInput('');
  };

  return (
    <>
      {/* FAB + label wrapper.
          The label "Connect hardware" sits to the LEFT of the FAB (so the FAB
          stays pinned to the corner) and is hidden on very small screens to
          avoid covering content. */}
      <div className="fixed bottom-5 right-5 z-30 flex items-end gap-2">
        <div
          className={cn(
            'hidden sm:flex flex-col items-end gap-0.5 mb-0.5',
            'pointer-events-none'
          )}
          aria-hidden
        >
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 text-[11px] transition-colors',
              serial.isConnected
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-hairline bg-canvas/90 text-body-mid backdrop-blur'
            )}
          >
            {serial.isConnected ? 'Hardware connected' : 'Connect hardware'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'inline-flex h-12 w-12 items-center justify-center rounded-full',
            'border border-accent/40 bg-canvas/95 text-accent backdrop-blur',
            'transition-colors duration-150 hover:bg-accent/10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            serial.isConnected && 'border-accent bg-accent/10 text-accent'
          )}
          aria-label="Connect to hardware via WebSerial — opens the serial monitor"
          title="Connect to hardware (Arduino, ESP32, STM32, …) via WebSerial"
        >
          <Usb className="h-5 w-5" aria-hidden />
          {serial.isConnected && (
            <span
              className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-accent ring-2 ring-canvas"
              aria-hidden
            />
          )}
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 bg-canvas p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-hairline bg-canvas-soft px-5 pb-4 pt-5">
            <SheetTitle className="flex items-center gap-2 text-base font-normal text-ink">
              <Cable className="h-4 w-4 text-accent" aria-hidden />
              Hardware Serial Monitor
              {serial.isConnected ? (
                <span className="ml-2 inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                  Connected
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center rounded-full border border-hairline px-2 py-0.5 text-[10px] text-body-mid">
                  Disconnected
                </span>
              )}
            </SheetTitle>
            <SheetDescription className="text-xs text-body-mid">
              Stream bytes from a USB-serial device (Arduino, ESP32, STM32, …)
              directly in the browser via WebSerial.
            </SheetDescription>
          </SheetHeader>

          <div className="ee-scroll flex-1 overflow-y-auto px-5 py-4">
            {/* Unsupported notice */}
            {!serial.isSupported && (
              <div className="mb-4 flex items-start gap-2 rounded-sm border-l-2 border-warning bg-accent-soft/20 px-3 py-2.5 text-xs text-warning">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <div>
                  <p>WebSerial not supported in this browser.</p>
                  <p className="mt-0.5 text-body-mid">
                    Use Chrome, Edge, or Opera. Firefox needs a flag enabled;
                    Safari has no support. The API is required to talk to
                    USB-serial hardware from a web page.
                  </p>
                </div>
              </div>
            )}

            {/* Controls */}
            <section className="mb-4 space-y-2">
              <div className="flex items-center gap-2">
                <label className="eyebrow text-[11px] text-body-mid">Baud</label>
                <select
                  value={baudRate}
                  onChange={(e) => setBaudRate(parseInt(e.target.value, 10))}
                  disabled={serial.isConnected}
                  className="ee-mono rounded-sm border border-hairline bg-canvas-mid px-2 py-1 text-xs"
                >
                  {BAUD_RATES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <div className="flex-1" />
                {serial.isConnected ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDisconnect}
                    disabled={serial.isConnecting}
                    className="h-7 gap-1 rounded-full px-2 text-xs"
                  >
                    <X className="h-3 w-3" />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleConnect}
                    disabled={!serial.isSupported || serial.isConnecting}
                    className="h-7 gap-1 rounded-full bg-accent px-3 text-xs text-canvas hover:bg-accent/90"
                  >
                    {serial.isConnecting ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Connecting…
                      </>
                    ) : (
                      <>
                        <Usb className="h-3 w-3" />
                        Connect
                      </>
                    )}
                  </Button>
                )}
              </div>

              {serial.error && (
                <p className="rounded-sm border-l-2 border-error bg-accent-soft/20 px-2 py-1 text-[11px] text-error">
                  {serial.error}
                </p>
              )}
              {serial.portInfo && (
                <p className="text-[10px] text-body-mid">
                  Vendor 0x{(serial.portInfo.usbVendorId ?? 0).toString(16).padStart(4, '0')},
                  Product 0x{(serial.portInfo.usbProductId ?? 0).toString(16).padStart(4, '0')}
                </p>
              )}
            </section>

            {/* Output */}
            <section className="mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="eyebrow text-[11px] text-body-mid">
                  Received ({serial.bytes} bytes)
                </span>
                <button
                  type="button"
                  onClick={() => serial.clear()}
                  className="inline-flex items-center gap-1 text-[10px] text-body-mid hover:text-ink"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
              </div>
              <div
                ref={outputRef}
                className="ee-scroll h-64 overflow-y-auto rounded-sm border border-hairline bg-canvas-mid p-2"
              >
                {serial.lines.length === 0 ? (
                  <p className="px-1 py-2 text-[11px] text-body-mid">
                    No data yet. Connect a device and (e.g.) print numbers from Arduino with{' '}
                    <code className="ee-mono text-ink">Serial.println(analogRead(A0));</code>
                  </p>
                ) : (
                  serial.lines.map((line, i) => (
                    <div
                      key={i}
                      className="ee-mono whitespace-pre-wrap px-1 py-0.5 text-[11px] leading-relaxed text-ink"
                    >
                      {line}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Send */}
            <section>
              <label className="eyebrow mb-1.5 block text-[11px] text-body-mid">
                Send (newline-terminated)
              </label>
              <div className="flex items-stretch gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleSend(); }}
                  placeholder="Type a command…"
                  disabled={!serial.isConnected}
                  className="ee-mono flex-1 rounded-sm border border-hairline bg-canvas-mid px-2 py-1 text-xs text-ink placeholder:text-body-mid"
                />
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={!serial.isConnected || !input}
                  className="h-8 gap-1 rounded-full bg-accent px-3 text-xs text-canvas hover:bg-accent/90"
                >
                  <Send className="h-3 w-3" />
                  Send
                </Button>
              </div>
            </section>

            <div className="mt-4 rounded-sm border border-hairline bg-canvas-card p-2.5 text-[11px] text-body-mid">
              <p className="text-ink">Tip</p>
              <p className="mt-1">
                Many Arduino sketches print <code className="ee-mono text-accent">analogRead()</code> values
                over USB-serial. Connect here, then watch the live stream — perfect for plotting
                sensor data without installing the Arduino IDE.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
