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
import { Badge } from '@/components/ui/badge';
import { useSerial } from '@/hooks/useSerial';
import { cn } from '@/lib/utils';

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

/**
 * Floating-action button + slide-in serial monitor. Wraps the WebSerial hook
 * and surfaces a clean connect / send / receive UI. On unsupported browsers
 * the button still appears but the panel shows a "use Chrome/Edge" notice.
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-5 right-5 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full',
          'border border-ee-teal/40 bg-background/95 text-ee-teal shadow-lg backdrop-blur',
          'transition-transform hover:scale-105 hover:bg-ee-teal/10',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ee-teal',
          serial.isConnected && 'border-ee-green bg-ee-green/10 text-ee-green',
        )}
        aria-label="Connect to hardware via WebSerial"
        title="Connect to hardware (Arduino, ESP32, STM32, …) via WebSerial"
      >
        <Usb className="h-5 w-5" aria-hidden />
        {serial.isConnected && (
          <span
            className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-ee-green ring-2 ring-background"
            aria-hidden
          />
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full gap-0 sm:max-w-md p-0">
          <SheetHeader className="border-b border-border/60 bg-gradient-to-br from-ee-teal/5 to-transparent px-5 pb-4 pt-5">
            <SheetTitle className="flex items-center gap-2 text-base font-semibold">
              <Cable className="h-4 w-4 text-ee-teal" aria-hidden />
              Hardware Serial Monitor
              {serial.isConnected ? (
                <Badge
                  variant="outline"
                  className="ml-2 border-ee-green/40 bg-ee-green/10 px-1.5 py-0 text-[10px] text-ee-green"
                >
                  Connected
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="ml-2 border-muted-foreground/30 px-1.5 py-0 text-[10px] text-muted-foreground"
                >
                  Disconnected
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription className="text-xs">
              Stream bytes from a USB-serial device (Arduino, ESP32, STM32, …) directly in the browser via WebSerial.
            </SheetDescription>
          </SheetHeader>

          <div className="ee-scroll flex-1 overflow-y-auto px-5 py-4">
            {/* Unsupported notice */}
            {!serial.isSupported && (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-ee-amber/40 bg-ee-amber/10 px-3 py-2.5 text-xs text-ee-amber">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <div>
                  <p className="font-semibold">WebSerial not supported in this browser.</p>
                  <p className="mt-0.5 text-foreground/70">
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
                <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Baud
                </label>
                <select
                  value={baudRate}
                  onChange={(e) => setBaudRate(parseInt(e.target.value, 10))}
                  disabled={serial.isConnected}
                  className="ee-mono rounded border border-border/60 bg-background px-2 py-1 text-xs"
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
                    className="h-7 gap-1 px-2 text-xs"
                  >
                    <X className="h-3 w-3" />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleConnect}
                    disabled={!serial.isSupported || serial.isConnecting}
                    className="h-7 gap-1 bg-ee-teal px-3 text-xs font-semibold text-white hover:bg-ee-teal-dark"
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
                <p className="rounded border border-ee-red/40 bg-ee-red/8 px-2 py-1 text-[11px] text-ee-red">
                  {serial.error}
                </p>
              )}
              {serial.portInfo && (
                <p className="text-[10px] text-muted-foreground">
                  Vendor 0x{(serial.portInfo.usbVendorId ?? 0).toString(16).padStart(4, '0')},
                  Product 0x{(serial.portInfo.usbProductId ?? 0).toString(16).padStart(4, '0')}
                </p>
              )}
            </section>

            {/* Output */}
            <section className="mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Received ({serial.bytes} bytes)
                </span>
                <button
                  type="button"
                  onClick={() => serial.clear()}
                  className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
              </div>
              <div
                ref={outputRef}
                className="ee-scroll h-64 overflow-y-auto rounded-md border border-border/60 bg-zinc-950 p-2"
              >
                {serial.lines.length === 0 ? (
                  <p className="px-1 py-2 text-[11px] text-zinc-500">
                    No data yet. Connect a device and (e.g.) print numbers from Arduino with{' '}
                    <code className="ee-mono text-zinc-300">Serial.println(analogRead(A0));</code>
                  </p>
                ) : (
                  serial.lines.map((line, i) => (
                    <div
                      key={i}
                      className="ee-mono whitespace-pre-wrap px-1 py-0.5 text-[11px] leading-relaxed text-zinc-100"
                    >
                      {line}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Send */}
            <section>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
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
                  className="ee-mono flex-1 rounded border border-border/60 bg-background px-2 py-1 text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={!serial.isConnected || !input}
                  className="h-8 gap-1 bg-ee-teal px-3 text-xs text-white hover:bg-ee-teal-dark"
                >
                  <Send className="h-3 w-3" />
                  Send
                </Button>
              </div>
            </section>

            <div className="mt-4 rounded-md border border-border/40 bg-muted/20 p-2.5 text-[11px] text-muted-foreground">
              <p className="font-medium text-foreground/80">Tip</p>
              <p className="mt-1">
                Many Arduino sketches print <code className="ee-mono">analogRead()</code> values
                over USB-serial. Connect here, then watch the live stream — perfect for plotting
                sensor data without installing the Arduino IDE. Full integration with curriculum
                lessons is coming soon.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
