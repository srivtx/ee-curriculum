'use client';

import * as React from 'react';

// ── WebSerial typing ──────────────────────────────────────────────────────
// The TS DOM lib may not yet ship `navigator.serial`. Declare a minimal
// surface so we can use the API without `any`.
interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialPort {
  open(options: { baudRate: number; dataBits?: number; stopBits?: number; parity?: 'none' | 'even' | 'odd' }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  getInfo(): SerialPortInfo;
  addEventListener(type: 'disconnect', listener: () => void): void;
  removeEventListener(type: 'disconnect', listener: () => void): void;
}

interface Serial {
  getPorts(): Promise<SerialPort[]>;
  requestPort(options?: { filters?: { usbVendorId: number; usbProductId: number }[] }): Promise<SerialPort>;
}

interface NavigatorSerial {
  serial?: Serial;
}

function getSerialApi(): Serial | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & NavigatorSerial).serial;
}

export interface UseSerialOptions {
  /** Default baud rate used by `connect()`. */
  baudRate?: number;
  /** Max number of received bytes to keep in state. Older bytes are dropped. */
  bufferLines?: number;
}

export interface SerialConnectionState {
  /** True when a port is open. */
  isConnected: boolean;
  /** True while `connect()` is awaiting user gesture + port open. */
  isConnecting: boolean;
  /** Last error message, if any. */
  error: string | null;
  /** Lines received from the device (split on \n). */
  lines: string[];
  /** Bytes received in the most recent line (for binary protocols). */
  bytes: number;
  /** Information about the active port, if connected. */
  portInfo: SerialPortInfo | null;
}

export interface UseSerialApi extends SerialConnectionState {
  /** True if `navigator.serial` exists in this browser. */
  isSupported: boolean;
  /** Open the browser's port-picker and connect at the configured baud rate. */
  connect: () => Promise<void>;
  /** Close the active port (no-op if not connected). */
  disconnect: () => Promise<void>;
  /** Write a string to the device. Returns bytes written. */
  write: (data: string) => Promise<number>;
  /** Subscribe to incoming lines. Returns an unsubscribe fn. */
  onLine: (cb: (line: string) => void) => () => void;
  /** Discard all received lines from the in-memory buffer. */
  clear: () => void;
}

/**
 * React hook around the WebSerial API. Chrome/Edge/Opera support it
 * natively; Firefox requires a flag; Safari has no support. Callers should
 * check `isSupported` and surface a "Use Chrome/Edge" notice when false.
 *
 * Usage:
 *   const serial = useSerial({ baudRate: 115200 });
 *   if (!serial.isSupported) return <Notice/>;
 *   <button onClick={() => serial.connect()}>Connect</button>
 */
export function useSerial(options: UseSerialOptions = {}): UseSerialApi {
  const { baudRate = 115200, bufferLines = 200 } = options;

  const [isConnected, setIsConnected] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lines, setLines] = React.useState<string[]>([]);
  const [bytes, setBytes] = React.useState(0);
  const [portInfo, setPortInfo] = React.useState<SerialPortInfo | null>(null);

  const portRef = React.useRef<SerialPort | null>(null);
  const readerRef = React.useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const readableClosedRef = React.useRef<Promise<void> | null>(null);
  const lineListenersRef = React.useRef<Set<(line: string) => void>>(new Set());
  const lineBufferRef = React.useRef<string>('');

  const isSupported = typeof navigator !== 'undefined' && !!getSerialApi();

  const pushLine = React.useCallback((line: string) => {
    setLines((prev) => {
      const next = [...prev, line];
      return next.length > bufferLines ? next.slice(next.length - bufferLines) : next;
    });
    setBytes((b) => b + line.length + 1);
    lineListenersRef.current.forEach((cb) => cb(line));
  }, [bufferLines]);

  const connect = React.useCallback(async () => {
    const api = getSerialApi();
    if (!api) {
      setError('WebSerial not supported in this browser. Use Chrome, Edge, or Opera.');
      return;
    }
    if (portRef.current) {
      setError('Already connected.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const port = await api.requestPort();
      await port.open({ baudRate });
      portRef.current = port;
      setPortInfo(port.getInfo());
      setIsConnected(true);

      // Read loop — runs until the port closes or errors out.
      if (port.readable) {
        const reader = port.readable.getReader();
        readerRef.current = reader;
        (async () => {
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              if (value) {
                const text = new TextDecoder().decode(value);
                lineBufferRef.current += text;
                let idx: number;
                while ((idx = lineBufferRef.current.indexOf('\n')) >= 0) {
                  const line = lineBufferRef.current.slice(0, idx).replace(/\r$/, '');
                  lineBufferRef.current = lineBufferRef.current.slice(idx + 1);
                  if (line.length > 0) pushLine(line);
                }
              }
            }
          } catch (err) {
            // Stream errors are common when the user unplugs the device.
            if (err instanceof Error) {
              setError(`Read error: ${err.message}`);
            }
          } finally {
            try { reader.releaseLock(); } catch { /* noop */ }
          }
        })();
      }

      const onDisconnect = () => {
        portRef.current = null;
        setIsConnected(false);
        setPortInfo(null);
      };
      port.addEventListener('disconnect', onDisconnect);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsConnecting(false);
    }
  }, [baudRate, pushLine]);

  const disconnect = React.useCallback(async () => {
    const port = portRef.current;
    if (!port) return;
    try {
      if (readerRef.current) {
        try { await readerRef.current.cancel(); } catch { /* noop */ }
        readerRef.current = null;
      }
      if (readableClosedRef.current) {
        try { await readableClosedRef.current; } catch { /* noop */ }
        readableClosedRef.current = null;
      }
      await port.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      portRef.current = null;
      setIsConnected(false);
      setPortInfo(null);
    }
  }, []);

  const write = React.useCallback(async (data: string) => {
    const port = portRef.current;
    if (!port?.writable) {
      setError('Port not open.');
      return 0;
    }
    const writer = port.writable.getWriter();
    try {
      const bytes = new TextEncoder().encode(data);
      await writer.write(bytes);
      return bytes.length;
    } finally {
      writer.releaseLock();
    }
  }, []);

  const onLine = React.useCallback((cb: (line: string) => void) => {
    lineListenersRef.current.add(cb);
    return () => {
      lineListenersRef.current.delete(cb);
    };
  }, []);

  const clear = React.useCallback(() => {
    setLines([]);
    setBytes(0);
    lineBufferRef.current = '';
  }, []);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      const port = portRef.current;
      if (port) {
        try { void port.close(); } catch { /* noop */ }
        portRef.current = null;
      }
    };
  }, []);

  return {
    isSupported,
    isConnected,
    isConnecting,
    error,
    lines,
    bytes,
    portInfo,
    connect,
    disconnect,
    write,
    onLine,
    clear,
  };
}
