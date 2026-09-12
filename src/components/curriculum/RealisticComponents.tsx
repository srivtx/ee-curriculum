'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X, Cpu, Zap, Activity, Radio } from 'lucide-react';

// ── Pin data ────────────────────────────────────────────────────────────────
// Each entry maps a board pin (label as printed on the silk-screen) to its
// SVG hit-area coordinate, a short function summary, and a longer
// human-readable description. The data is exported so parents (e.g.
// WokwiEmbed) can look up pin details without re-declaring them.

export type PinGroup = 'digital' | 'analog' | 'power' | 'comm';

export interface PinInfo {
  /** Stable id — unique per board. Use a suffix (_R, _2) for duplicates. */
  id: string;
  /** Display label as printed on the silk-screen. */
  label: string;
  /** Functional grouping — drives tooltip accent color. */
  group: PinGroup;
  /** Short single-line function summary (tooltip + detail card title). */
  fn: string;
  /** Longer description (detail card body). */
  desc: string;
  /** SVG x-coordinate of the pin's hit area. */
  cx: number;
  /** SVG y-coordinate of the pin's hit area. */
  cy: number;
}

// Arduino Uno R3 — 14 digital (top), 8 power (mid-left), 6 analog (mid-right)
// Power pin order matches the actual R3 silk-screen left-to-right:
// IOREF · RST · 3V3 · 5V · GND · GND · VIN · AREF
export const ARDUINO_PINS: PinInfo[] = [
  // Digital D0–D13 (cx = 88 + i*17, cy = 191)
  { id: 'D0',  label: 'D0 (RX)',   group: 'comm',    fn: 'UART RX',                            desc: 'Hardware serial receive input. Used by Serial over the USB-to-serial bridge — avoid when flashing.', cx: 88,  cy: 191 },
  { id: 'D1',  label: 'D1 (TX)',   group: 'comm',    fn: 'UART TX',                            desc: 'Hardware serial transmit output. Used by Serial over the USB-to-serial bridge — avoid when flashing.', cx: 105, cy: 191 },
  { id: 'D2',  label: 'D2',        group: 'digital', fn: 'Digital I/O · INT0',                 desc: 'General-purpose digital input/output. Hardware external interrupt 0 (INT0).',                          cx: 122, cy: 191 },
  { id: 'D3',  label: 'D3 (PWM)',  group: 'digital', fn: 'Digital I/O · INT1 · PWM',           desc: 'Digital I/O. Hardware external interrupt 1 and 8-bit PWM output (Timer 2).',                            cx: 139, cy: 191 },
  { id: 'D4',  label: 'D4',        group: 'digital', fn: 'Digital I/O',                        desc: 'General-purpose digital input/output.',                                                                  cx: 156, cy: 191 },
  { id: 'D5',  label: 'D5 (PWM)',  group: 'digital', fn: 'Digital I/O · PWM',                  desc: 'Digital I/O. 8-bit PWM output (Timer 0).',                                                               cx: 173, cy: 191 },
  { id: 'D6',  label: 'D6 (PWM)',  group: 'digital', fn: 'Digital I/O · PWM',                  desc: 'Digital I/O. 8-bit PWM output (Timer 0).',                                                               cx: 190, cy: 191 },
  { id: 'D7',  label: 'D7',        group: 'digital', fn: 'Digital I/O',                        desc: 'General-purpose digital input/output.',                                                                  cx: 207, cy: 191 },
  { id: 'D8',  label: 'D8',        group: 'digital', fn: 'Digital I/O',                        desc: 'General-purpose digital input/output.',                                                                  cx: 224, cy: 191 },
  { id: 'D9',  label: 'D9 (PWM)',  group: 'digital', fn: 'Digital I/O · PWM',                  desc: 'Digital I/O. 16-bit PWM output (Timer 1).',                                                              cx: 241, cy: 191 },
  { id: 'D10', label: 'D10 (PWM)', group: 'digital', fn: 'Digital I/O · PWM · SPI SS',         desc: 'Digital I/O. PWM output and SPI Slave Select (SS) for the hardware SPI peripheral.',                     cx: 258, cy: 191 },
  { id: 'D11', label: 'D11 (PWM)', group: 'digital', fn: 'Digital I/O · PWM · SPI MOSI',       desc: 'Digital I/O. PWM output and SPI Master-Out-Slave-In (MOSI).',                                            cx: 275, cy: 191 },
  { id: 'D12', label: 'D12',       group: 'digital', fn: 'Digital I/O · SPI MISO',             desc: 'Digital I/O. SPI Master-In-Slave-Out (MISO).',                                                           cx: 292, cy: 191 },
  { id: 'D13', label: 'D13',       group: 'digital', fn: 'Digital I/O · SPI SCK · onboard LED', desc: 'Digital I/O. SPI clock (SCK) and the onboard "L" LED — the classic blink pin.',                         cx: 309, cy: 191 },

  // Power — 8 pins, 16px spacing (cx = 88 + i*16, cy = 221)
  { id: 'IOREF', label: 'IOREF', group: 'power', fn: 'Voltage reference',     desc: 'Indicates the operating voltage of the board (5V on the Uno). Used by shields to adapt to 3.3V or 5V boards.', cx: 88,  cy: 221 },
  { id: 'RST',   label: 'RST',   group: 'power', fn: 'Reset (active low)',    desc: 'Pull low momentarily to reset the ATmega328P. Tied to the on-board RESET button.',                              cx: 104, cy: 221 },
  { id: '3V3',   label: '3V3',   group: 'power', fn: '3.3V output',           desc: 'Regulated 3.3V supply from the USB-to-serial chip. Max ~50mA — not for heavy loads.',                          cx: 120, cy: 221 },
  { id: '5V',    label: '5V',    group: 'power', fn: '5V output',             desc: 'Regulated 5V supply used to power the MCU and on-board logic. Source: USB or the VIN regulator.',              cx: 136, cy: 221 },
  { id: 'GND1',  label: 'GND',   group: 'power', fn: 'Ground',                desc: '0V reference. Always connect to the circuit ground.',                                                          cx: 152, cy: 221 },
  { id: 'GND2',  label: 'GND',   group: 'power', fn: 'Ground',                desc: 'Second ground pin — same net as the other GND pins.',                                                          cx: 168, cy: 221 },
  { id: 'VIN',   label: 'VIN',   group: 'power', fn: 'Input voltage (7-12V)', desc: 'External input voltage, bypasses the 5V regulator. Use when powering from a wall adapter via the DC jack.',    cx: 184, cy: 221 },
  { id: 'AREF',  label: 'AREF',  group: 'power', fn: 'Analog reference',      desc: 'External reference voltage for the ADC. Select with analogReference(EXTERNAL); never exceed 5V.',              cx: 200, cy: 221 },

  // Analog A0–A5 (cx = 228 + i*18, cy = 221)
  { id: 'A0', label: 'A0',       group: 'analog', fn: 'Analog input 0',          desc: '10-bit ADC input (0–5V maps to 0–1023). Also usable as digital I/O.',                cx: 228, cy: 221 },
  { id: 'A1', label: 'A1',       group: 'analog', fn: 'Analog input 1',          desc: '10-bit ADC input. Also usable as digital I/O.',                                       cx: 246, cy: 221 },
  { id: 'A2', label: 'A2',       group: 'analog', fn: 'Analog input 2',          desc: '10-bit ADC input. Also usable as digital I/O.',                                       cx: 264, cy: 221 },
  { id: 'A3', label: 'A3',       group: 'analog', fn: 'Analog input 3',          desc: '10-bit ADC input. Also usable as digital I/O.',                                       cx: 282, cy: 221 },
  { id: 'A4', label: 'A4 (SDA)', group: 'analog', fn: 'Analog input 4 · I²C SDA', desc: '10-bit ADC input or the I²C data line (Wire). On R3 also broken out separately on the digital side.', cx: 300, cy: 221 },
  { id: 'A5', label: 'A5 (SCL)', group: 'analog', fn: 'Analog input 5 · I²C SCL', desc: '10-bit ADC input or the I²C clock line (Wire). On R3 also broken out separately on the digital side.', cx: 318, cy: 221 },
];

// ESP32 DevKit V1 — 19 pins each side. cy = 50 + i*17 on both sides.
export const ESP32_LEFT_PINS: PinInfo[] = [
  { id: 'L_3V3',  label: '3V3',         group: 'power',   fn: '3.3V regulated output',                       desc: '3.3V from the on-board AMS1117 LDO. Most ESP32 GPIO is NOT 5V-tolerant — power sensors from 3V3.', cx: 30, cy: 50 },
  { id: 'L_EN',   label: 'EN',          group: 'power',   fn: 'Enable (active low reset)',                   desc: 'Chip enable. Pulled high on-board; pull low momentarily to reset the ESP32.',                       cx: 30, cy: 67 },
  { id: 'L_SP',   label: 'SP (GPIO36)', group: 'analog',  fn: 'Sensor VP · ADC1_0 · input only',             desc: 'Input-only pin (no output, no internal pull). ADC1 channel 0. Great for battery monitoring.',       cx: 30, cy: 84 },
  { id: 'L_SN',   label: 'SN (GPIO39)', group: 'analog',  fn: 'Sensor VN · ADC1_3 · input only',             desc: 'Input-only pin (no output, no internal pull). ADC1 channel 3.',                                     cx: 30, cy: 101 },
  { id: 'L_IO34', label: 'GPIO34',      group: 'analog',  fn: 'ADC1_6 · input only',                         desc: 'Input-only pin. ADC1 channel 6. Often used with GPIO35 for differential sensors.',                  cx: 30, cy: 118 },
  { id: 'L_IO35', label: 'GPIO35',      group: 'analog',  fn: 'ADC1_7 · input only',                         desc: 'Input-only pin. ADC1 channel 7.',                                                                   cx: 30, cy: 135 },
  { id: 'L_IO32', label: 'GPIO32',      group: 'digital', fn: 'ADC1_4 · touch pad T9',                       desc: 'General-purpose I/O with ADC1 channel 4 and capacitive touch sensing.',                            cx: 30, cy: 152 },
  { id: 'L_IO33', label: 'GPIO33',      group: 'digital', fn: 'ADC1_5 · touch pad T8',                       desc: 'General-purpose I/O with ADC1 channel 5 and capacitive touch sensing.',                            cx: 30, cy: 169 },
  { id: 'L_IO25', label: 'GPIO25',      group: 'digital', fn: 'DAC1 · ADC2_8',                               desc: 'True 8-bit DAC output channel 1. Also ADC2 channel 8.',                                            cx: 30, cy: 186 },
  { id: 'L_IO26', label: 'GPIO26',      group: 'digital', fn: 'DAC2 · ADC2_9',                               desc: 'True 8-bit DAC output channel 2. Also ADC2 channel 9.',                                            cx: 30, cy: 203 },
  { id: 'L_IO27', label: 'GPIO27',      group: 'digital', fn: 'ADC2_7 · touch pad T7',                       desc: 'General-purpose I/O with ADC2 channel 7 and capacitive touch sensing.',                            cx: 30, cy: 220 },
  { id: 'L_IO14', label: 'GPIO14',      group: 'digital', fn: 'ADC2_6 · touch pad T6 · HS2_CLK',             desc: 'General-purpose I/O. Capacitive touch T6. Default HSPI clock pin.',                                 cx: 30, cy: 237 },
  { id: 'L_IO12', label: 'GPIO12',      group: 'digital', fn: 'ADC2_5 · touch pad T5 · HS2_DATA2',           desc: 'Capacitive touch T5. HSPI MISO. Strapping pin — must be LOW at boot to flash at 1.8V signalling.',   cx: 30, cy: 254 },
  { id: 'L_IO13', label: 'GPIO13',      group: 'digital', fn: 'ADC2_4 · touch pad T4 · HS2_DATA3',           desc: 'Capacitive touch T4. HSPI CS.',                                                                     cx: 30, cy: 271 },
  { id: 'L_GND',  label: 'GND',         group: 'power',   fn: 'Ground',                                      desc: '0V reference.',                                                                                     cx: 30, cy: 288 },
  { id: 'L_VIN',  label: 'VIN',         group: 'power',   fn: '5V input (from USB)',                         desc: '5V from the USB connector, before the 3.3V regulator. Use to power 5V sensors.',                   cx: 30, cy: 305 },
  { id: 'L_IO15', label: 'GPIO15',      group: 'digital', fn: 'ADC2_3 · touch pad T3 · MTDO · JTAG',         desc: 'Capacitive touch T3. JTAG MTDO. Strapping pin — must be HIGH at boot.',                             cx: 30, cy: 322 },
  { id: 'L_IO2',  label: 'GPIO2',       group: 'digital', fn: 'ADC2_2 · touch pad T2 · strapping · onboard LED', desc: 'Capacitive touch T2. Strapping pin — must be floating or LOW at boot. Drives the on-board blue LED.', cx: 30, cy: 339 },
  { id: 'L_IO0',  label: 'GPIO0',       group: 'digital', fn: 'ADC2_1 · touch pad T1 · strapping (BOOT)',    desc: 'Capacitive touch T1. Strapping pin — held LOW at boot to enter download mode. Connected to the BOOT button.', cx: 30, cy: 356 },
];

export const ESP32_RIGHT_PINS: PinInfo[] = [
  { id: 'R_GND',  label: 'GND',         group: 'power',   fn: 'Ground',                  desc: '0V reference.',                                                                              cx: 170, cy: 50 },
  { id: 'R_IO23', label: 'GPIO23',      group: 'digital', fn: 'VSPI MOSI',               desc: 'Master-Out-Slave-In for the VSPI peripheral.',                                              cx: 170, cy: 67 },
  { id: 'R_IO22', label: 'GPIO22',      group: 'digital', fn: 'I²C SCL',                 desc: 'Default I²C clock line (Wire).',                                                            cx: 170, cy: 84 },
  { id: 'R_TXD0', label: 'TXD0 (GPIO1)',group: 'comm',    fn: 'UART0 TX',                desc: 'UART0 transmit — used by Serial for flashing and the boot log. Avoid for general I/O.',    cx: 170, cy: 101 },
  { id: 'R_RXD0', label: 'RXD0 (GPIO3)',group: 'comm',    fn: 'UART0 RX',                desc: 'UART0 receive — used by Serial for flashing. Strapping pin — must be HIGH at boot.',       cx: 170, cy: 118 },
  { id: 'R_IO21', label: 'GPIO21',      group: 'digital', fn: 'I²C SDA',                 desc: 'Default I²C data line (Wire).',                                                             cx: 170, cy: 135 },
  { id: 'R_IO19', label: 'GPIO19',      group: 'digital', fn: 'VSPI MISO',               desc: 'Master-In-Slave-Out for VSPI.',                                                             cx: 170, cy: 152 },
  { id: 'R_IO18', label: 'GPIO18',      group: 'digital', fn: 'VSPI SCK',                desc: 'Clock for the VSPI peripheral.',                                                            cx: 170, cy: 169 },
  { id: 'R_IO5',  label: 'GPIO5',       group: 'digital', fn: 'VSPI SS',                 desc: 'Default Slave-Select for VSPI. Outputs PWM at boot — must be HIGH or floating at boot.',    cx: 170, cy: 186 },
  { id: 'R_IO17', label: 'GPIO17',      group: 'digital', fn: 'UART2 TX',                desc: 'UART2 transmit. Free for general use.',                                                     cx: 170, cy: 203 },
  { id: 'R_IO16', label: 'GPIO16',      group: 'digital', fn: 'UART2 RX',                desc: 'UART2 receive. Free for general use.',                                                      cx: 170, cy: 220 },
  { id: 'R_IO4',  label: 'GPIO4',       group: 'digital', fn: 'ADC2_0 · touch pad T0 · HS2_DATA1', desc: 'Capacitive touch T0. HSPI data1. Safe to use at boot.',                            cx: 170, cy: 237 },
  { id: 'R_IO0',  label: 'GPIO0',       group: 'digital', fn: 'ADC2_1 · touch pad · strapping',    desc: 'Duplicate of left GPIO0.',                                                        cx: 170, cy: 254 },
  { id: 'R_IO2',  label: 'GPIO2',       group: 'digital', fn: 'ADC2_2 · touch pad · onboard LED',  desc: 'Duplicate of left GPIO2.',                                                        cx: 170, cy: 271 },
  { id: 'R_IO15', label: 'GPIO15',      group: 'digital', fn: 'ADC2_3 · touch pad · JTAG',         desc: 'Duplicate of left GPIO15.',                                                       cx: 170, cy: 288 },
  { id: 'R_SD1',  label: 'SD1 (GPIO9)', group: 'digital', fn: 'SD data 1',               desc: 'Connected to the on-board flash — do not use in your project.',                             cx: 170, cy: 305 },
  { id: 'R_SD0',  label: 'SD0 (GPIO8)', group: 'digital', fn: 'SD data 0',               desc: 'Connected to the on-board flash — do not use in your project.',                             cx: 170, cy: 322 },
  { id: 'R_CLK',  label: 'CLK (GPIO6)', group: 'digital', fn: 'SD clock',                desc: 'Connected to the on-board flash — do not use in your project.',                             cx: 170, cy: 339 },
  { id: 'R_CMD',  label: 'CMD (GPIO11)',group: 'digital', fn: 'SD command',              desc: 'Connected to the on-board flash — do not use in your project.',                             cx: 170, cy: 356 },
];

// ── Group → color tokens ────────────────────────────────────────────────────
const GROUP_STYLE: Record<PinGroup, { dot: string; ring: string; label: string; chipBg: string; chipText: string }> = {
  digital: { dot: 'bg-success',  ring: '#7FFF9F', label: 'Digital', chipBg: 'bg-success/10',   chipText: 'text-success' },
  analog:  { dot: 'bg-warning',  ring: '#FFB347', label: 'Analog',  chipBg: 'bg-warning/10',   chipText: 'text-warning' },
  power:   { dot: 'bg-error',    ring: '#FF6B6B', label: 'Power',   chipBg: 'bg-error/10',     chipText: 'text-error'   },
  comm:    { dot: 'bg-info',     ring: '#A0C3EC', label: 'Comm',    chipBg: 'bg-info/10',      chipText: 'text-info'    },
};

// ── Tooltip ─────────────────────────────────────────────────────────────────
function PinTooltip({
  pin,
  x,
  y,
}: {
  pin: PinInfo;
  x: number;
  y: number;
}) {
  const s = GROUP_STYLE[pin.group];
  return (
    <div
      className="pointer-events-none absolute z-30"
      style={{
        left: x,
        top: y - 12,
        transform: 'translate(-50%, -100%)',
      }}
      role="tooltip"
    >
      <div className="flex w-max max-w-[240px] flex-col gap-0.5 rounded-md border border-hairline bg-canvas/95 px-2.5 py-1.5 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden />
          <span className="font-mono text-[11px] font-bold text-ink">{pin.label}</span>
          <span className={cn('rounded px-1 py-px text-[9px] font-semibold uppercase tracking-wider', s.chipBg, s.chipText)}>
            {s.label}
          </span>
        </div>
        <div className="text-[10px] leading-tight text-body">{pin.fn}</div>
        <div className="text-[9px] leading-tight text-body-mid">click for details →</div>
      </div>
    </div>
  );
}

// ── Detail card ─────────────────────────────────────────────────────────────
export function PinDetailCard({
  pin,
  onClose,
  board,
}: {
  pin: PinInfo;
  onClose: () => void;
  board?: 'arduino' | 'esp32';
}) {
  const s = GROUP_STYLE[pin.group];
  const Icon = board === 'esp32' ? Radio : pin.group === 'power' ? Zap : pin.group === 'comm' ? Activity : Cpu;
  return (
    <div className="mt-3 rounded-md border border-hairline bg-canvas-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={cn('flex h-8 w-8 items-center justify-center rounded-full', s.chipBg)}>
            <Icon className={cn('h-4 w-4', s.chipText)} aria-hidden />
          </span>
          <div>
            <div className="font-mono text-sm font-bold text-ink">{pin.label}</div>
            <div className={cn('text-[10px] font-semibold uppercase tracking-wider', s.chipText)}>
              {s.label}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
          aria-label={`Close ${pin.label} pin detail`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-2 text-[11px] font-medium text-ink">{pin.fn}</div>
      <div className="mt-1 text-[11px] leading-relaxed text-body-mid">{pin.desc}</div>
    </div>
  );
}

// ── Shared hook for pin hover + click interaction ───────────────────────────
function usePinInteraction(onPinClick?: (pinId: string) => void) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number } | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const handleEnter = React.useCallback((e: React.MouseEvent, pinId: string) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    setHoveredId(pinId);
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleMove = React.useCallback((e: React.MouseEvent) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleLeave = React.useCallback(() => {
    setHoveredId(null);
    setTooltipPos(null);
  }, []);

  const handleClick = React.useCallback((pinId: string) => {
    setSelectedId(pinId);
    onPinClick?.(pinId);
  }, [onPinClick]);

  return {
    wrapperRef,
    hoveredId,
    tooltipPos,
    selectedId,
    handleEnter,
    handleMove,
    handleLeave,
    handleClick,
    setSelectedId,
  };
}

// ── Invisible hit-area circle for a single pin ──────────────────────────────
function PinHitArea({
  pin,
  isHovered,
  isSelected,
  hitR = 9,
  onEnter,
  onMove,
  onLeave,
  onClick,
}: {
  pin: PinInfo;
  isHovered: boolean;
  isSelected: boolean;
  hitR?: number;
  onEnter: (e: React.MouseEvent, pinId: string) => void;
  onMove: (e: React.MouseEvent) => void;
  onLeave: () => void;
  onClick: (pinId: string) => void;
}) {
  const ringColor = GROUP_STYLE[pin.group].ring;
  return (
    <>
      {(isHovered || isSelected) && (
        <circle
          cx={pin.cx}
          cy={pin.cy}
          r={hitR - 1.5}
          fill="none"
          stroke={ringColor}
          strokeWidth={1.6}
          strokeDasharray={isSelected && !isHovered ? '2 1.5' : undefined}
          style={{ pointerEvents: 'none' }}
        />
      )}
      <circle
        cx={pin.cx}
        cy={pin.cy}
        r={hitR}
        fill="transparent"
        className="cursor-pointer"
        onMouseEnter={(e) => onEnter(e, pin.id)}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={() => onClick(pin.id)}
        role="button"
        tabIndex={0}
        aria-label={`${pin.label}: ${pin.fn}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(pin.id);
          }
        }}
      >
        <title>{pin.label}: {pin.fn}</title>
      </circle>
    </>
  );
}

// ── Arduino Uno SVG ─────────────────────────────────────────────────────────
// Realistic top-view of an Arduino Uno R3 board with:
// - Blue PCB
// - Black ATmega328P DIP-28 chip
// - Silver USB-B connector
// - Black power jack
// - 14 digital pins (top), 8 power pins (mid-left), 6 analog pins (mid-right)
// - 16MHz crystal
// - Reset button
// - ON LED + L LED (pin 13)
//
// Interactive: each pin is hoverable (green ring + floating tooltip) and
// clickable (detail card rendered below the board).

export function ArduinoUnoSVG({
  ledOn = false,
  onPinClick,
}: {
  ledOn?: boolean;
  onPinClick?: (pinId: string) => void;
}) {
  const {
    wrapperRef, hoveredId, tooltipPos, selectedId,
    handleEnter, handleMove, handleLeave, handleClick, setSelectedId,
  } = usePinInteraction(onPinClick);

  const hoveredPin = hoveredId ? ARDUINO_PINS.find(p => p.id === hoveredId) ?? null : null;
  const selectedPin = selectedId ? ARDUINO_PINS.find(p => p.id === selectedId) ?? null : null;

  // Pin 13 trace path — used both for the wire itself and for the animated
  // current-flow dot that runs along it when the LED is on.
  const pin13Trace = 'M 309 191 L 309 130 L 280 130 L 280 105';

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md select-none">
      <svg
        viewBox="0 0 400 280"
        className="w-full"
        role="img"
        aria-label="Arduino Uno R3 board — interactive pins"
      >
        {/* PCB */}
        <rect x="10" y="10" width="380" height="260" rx="8" fill="#0d5c8a" stroke="#0a4a70" strokeWidth="2" />
        {/* Silkscreen text */}
        <text x="200" y="30" textAnchor="middle" fontSize="11" fill="#ffffff" fontFamily="monospace" fontWeight="bold">ARDUINO UNO R3</text>

        {/* USB-B connector (top-left, silver) */}
        <rect x="20" y="40" width="55" height="40" rx="3" fill="#c0c0c0" stroke="#888" strokeWidth="1" />
        <rect x="25" y="45" width="45" height="30" rx="2" fill="#a0a0a0" />
        <text x="47" y="62" textAnchor="middle" fontSize="7" fill="#555" fontFamily="monospace">USB-B</text>

        {/* Power jack (top-left, below USB) */}
        <rect x="30" y="85" width="40" height="25" rx="3" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
        <circle cx="50" cy="97" r="6" fill="#333" />
        <circle cx="50" cy="97" r="3" fill="#555" />
        <text x="50" y="120" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="monospace">PWR</text>

        {/* 16MHz crystal (silver rectangle) */}
        <rect x="90" y="50" width="35" height="14" rx="6" fill="#c0c0c0" stroke="#888" strokeWidth="0.5" />
        <text x="107" y="61" textAnchor="middle" fontSize="6" fill="#555" fontFamily="monospace">16MHz</text>

        {/* Reset button (red) */}
        <rect x="140" y="48" width="20" height="20" rx="3" fill="#cc3333" stroke="#882222" strokeWidth="1" />
        <circle cx="150" cy="58" r="5" fill="#dd4444" />
        <text x="150" y="78" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="monospace">RST</text>

        {/* ATmega328P chip (black DIP-28) */}
        <rect x="170" y="100" width="80" height="70" rx="3" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
        {/* Notch at top of chip */}
        <circle cx="210" cy="106" r="4" fill="#333" />
        {/* Chip label */}
        <text x="210" y="125" textAnchor="middle" fontSize="7" fill="#888" fontFamily="monospace">ATmega328P</text>
        <text x="210" y="135" textAnchor="middle" fontSize="5" fill="#666" fontFamily="monospace">20PU</text>
        <text x="210" y="148" textAnchor="middle" fontSize="5" fill="#666" fontFamily="monospace">1149</text>
        {/* Pin 1 dot */}
        <circle cx="176" cy="110" r="1.5" fill="#555" />

        {/* ON LED (green, always on) */}
        <circle cx="135" cy="100" r="4" fill="#22cc22" stroke="#119911" strokeWidth="1" />
        <circle cx="134" cy="99" r="1.5" fill="#88ff88" />
        <text x="135" y="115" textAnchor="middle" fontSize="5" fill="#fff" fontFamily="monospace">ON</text>

        {/* L LED (pin 13, amber/green — blinks) */}
        <circle cx="280" cy="100" r="4" fill={ledOn ? '#7FFF9F' : '#333333'} stroke={ledOn ? '#22c55e' : '#555'} strokeWidth="1" />
        {ledOn && <circle cx="279" cy="99" r="1.5" fill="#ffffff" opacity="0.8" />}
        <text x="280" y="115" textAnchor="middle" fontSize="5" fill="#fff" fontFamily="monospace">L</text>
        {/* ON / OFF label synced with the blink */}
        {ledOn && (
          <text x="295" y="103" textAnchor="start" fontSize="6" fill="#7FFF9F" fontFamily="monospace" fontWeight="bold">ON</text>
        )}

        {/* TX/RX LEDs */}
        <circle cx="100" cy="130" r="3" fill="#333" stroke="#555" strokeWidth="0.5" />
        <text x="100" y="145" textAnchor="middle" fontSize="5" fill="#fff" fontFamily="monospace">TX</text>
        <circle cx="115" cy="130" r="3" fill="#333" stroke="#555" strokeWidth="0.5" />
        <text x="115" y="145" textAnchor="middle" fontSize="5" fill="#fff" fontFamily="monospace">RX</text>

        {/* Digital pins (0-13, top row) — black header strip */}
        <rect x="80" y="185" width="240" height="12" fill="#1a1a1a" rx="1" />
        {/* Pin holes (decorative) */}
        {ARDUINO_PINS.filter(p => p.group === 'digital').map((pin) => (
          <circle key={`hole-${pin.id}`} cx={pin.cx} cy={pin.cy} r="2.5" fill="#444" stroke="#222" strokeWidth="0.5" style={{ pointerEvents: 'none' }} />
        ))}
        {/* Pin labels */}
        {['0','1','2','3','4','5','6','7','8','9','10','11','12','13'].map((label, i) => (
          <text key={`dl-${i}`} x={88 + i * 17} y="207" textAnchor="middle" fontSize="5" fill="#fff" fontFamily="monospace" style={{ pointerEvents: 'none' }}>{label}</text>
        ))}
        <text x="50" y="194" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="monospace" style={{ pointerEvents: 'none' }}>DIGITAL</text>
        <text x="345" y="194" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="monospace" style={{ pointerEvents: 'none' }}>~ ~ ~</text>

        {/* Power pins (mid-left, 8 pins in real R3 order) */}
        <rect x="80" y="215" width="132" height="12" fill="#1a1a1a" rx="1" />
        {ARDUINO_PINS.filter(p => p.group === 'power').map((pin) => (
          <circle key={`hole-${pin.id}`} cx={pin.cx} cy={pin.cy} r="2.5" fill="#444" stroke="#222" strokeWidth="0.5" style={{ pointerEvents: 'none' }} />
        ))}
        {/* Power pin labels (shortened to fit 16px pitch) */}
        {['IOREF','RST','3V3','5V','GND','GND','VIN','AREF'].map((label, i) => (
          <text key={`pl-${i}`} x={88 + i * 16} y="237" textAnchor="middle" fontSize="4" fill="#fff" fontFamily="monospace" style={{ pointerEvents: 'none' }}>{label}</text>
        ))}
        <text x="50" y="224" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="monospace" style={{ pointerEvents: 'none' }}>POWER</text>

        {/* Analog pins (A0-A5, mid-right) */}
        <rect x="220" y="215" width="110" height="12" fill="#1a1a1a" rx="1" />
        {ARDUINO_PINS.filter(p => p.group === 'analog').map((pin) => (
          <circle key={`hole-${pin.id}`} cx={pin.cx} cy={pin.cy} r="2.5" fill="#444" stroke="#222" strokeWidth="0.5" style={{ pointerEvents: 'none' }} />
        ))}
        {['A0','A1','A2','A3','A4','A5'].map((label, i) => (
          <text key={`al-${i}`} x={228 + i * 18} y="237" textAnchor="middle" fontSize="4" fill="#fff" fontFamily="monospace" style={{ pointerEvents: 'none' }}>{label}</text>
        ))}
        <text x="345" y="224" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="monospace" style={{ pointerEvents: 'none' }}>ANALOG</text>

        {/* Pin 13 wire to L LED — highlighted when active */}
        <path d={pin13Trace} stroke={ledOn ? '#7FFF9F' : '#666'} strokeWidth={ledOn ? 1.5 : 1} fill="none" opacity={ledOn ? 0.85 : 0.5} />

        {/* Animated current-flow dot — runs from pin 13 up to the L LED.
            Uses SMIL <animateMotion> along the same path; renders only while
            the LED is on so it visually tracks the blink cycle. */}
        {ledOn && (
          <circle r="2.2" fill="#7FFF9F" stroke="#ffffff" strokeWidth="0.4">
            <animateMotion dur="0.5s" repeatCount="indefinite" path={pin13Trace} />
          </circle>
        )}

        {/* Pin hit-areas + highlight rings — rendered on top so they capture
            mouse events over the decorative pin holes. */}
        {ARDUINO_PINS.map((pin) => (
          <PinHitArea
            key={pin.id}
            pin={pin}
            isHovered={hoveredId === pin.id}
            isSelected={selectedId === pin.id}
            onEnter={handleEnter}
            onMove={handleMove}
            onLeave={handleLeave}
            onClick={handleClick}
          />
        ))}

        {/* Mounting holes */}
        <circle cx="20" cy="20" r="3" fill="#0a4a70" stroke="#ffffff" strokeWidth="0.5" style={{ pointerEvents: 'none' }} />
        <circle cx="380" cy="20" r="3" fill="#0a4a70" stroke="#ffffff" strokeWidth="0.5" style={{ pointerEvents: 'none' }} />
        <circle cx="20" cy="260" r="3" fill="#0a4a70" stroke="#ffffff" strokeWidth="0.5" style={{ pointerEvents: 'none' }} />
        <circle cx="380" cy="260" r="3" fill="#0a4a70" stroke="#ffffff" strokeWidth="0.5" style={{ pointerEvents: 'none' }} />

        {/* Arduino logo text */}
        <text x="330" y="50" textAnchor="middle" fontSize="8" fill="#ffffff" fontFamily="monospace" opacity="0.5" style={{ pointerEvents: 'none' }}>ARDUINO</text>
        <text x="330" y="60" textAnchor="middle" fontSize="6" fill="#ffffff" fontFamily="monospace" opacity="0.4" style={{ pointerEvents: 'none' }}>.cc</text>
      </svg>

      {/* Hint label */}
      <div className="mt-1 text-center text-[10px] text-body-mid">
        Hover a pin to see its function · click for full details
      </div>

      {/* Floating tooltip — HTML overlay, positioned by mouse coords */}
      {hoveredPin && tooltipPos && (
        <PinTooltip pin={hoveredPin} x={tooltipPos.x} y={tooltipPos.y} />
      )}

      {/* Detail card below the board */}
      {selectedPin && (
        <PinDetailCard pin={selectedPin} onClose={() => setSelectedId(null)} board="arduino" />
      )}
    </div>
  );
}

// ── ESP32 DevKit SVG ────────────────────────────────────────────────────────
// Realistic top-view of an ESP32 DevKit V1 board with:
// - Black PCB
// - Silver ESP32 module (metal can)
// - Micro-USB connector
// - CP2102 USB-to-UART chip
// - 38-pin header (19 each side)
// - Boot/EN buttons
// - 3.3V regulator
// - Onboard LED (GPIO2)

export function ESP32DevKitSVG({
  ledOn = false,
  onPinClick,
}: {
  ledOn?: boolean;
  onPinClick?: (pinId: string) => void;
}) {
  const {
    wrapperRef, hoveredId, tooltipPos, selectedId,
    handleEnter, handleMove, handleLeave, handleClick, setSelectedId,
  } = usePinInteraction(onPinClick);

  const allPins = [...ESP32_LEFT_PINS, ...ESP32_RIGHT_PINS];
  const hoveredPin = hoveredId ? allPins.find(p => p.id === hoveredId) ?? null : null;
  const selectedPin = selectedId ? allPins.find(p => p.id === selectedId) ?? null : null;

  return (
    <div ref={wrapperRef} className="relative mx-auto w-full max-w-[200px] select-none">
      <svg
        viewBox="0 0 200 400"
        className="w-full"
        role="img"
        aria-label="ESP32 DevKit V1 board — interactive pins"
      >
        {/* PCB — long and narrow */}
        <rect x="15" y="10" width="170" height="380" rx="6" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
        <text x="100" y="28" textAnchor="middle" fontSize="9" fill="#888" fontFamily="monospace" fontWeight="bold" style={{ pointerEvents: 'none' }}>ESP32 DevKit V1</text>

        {/* Micro-USB connector (top, silver) */}
        <rect x="75" y="35" width="50" height="20" rx="2" fill="#c0c0c0" stroke="#888" strokeWidth="1" />
        <rect x="80" y="38" width="40" height="14" rx="1" fill="#a0a0a0" />
        <text x="100" y="48" textAnchor="middle" fontSize="6" fill="#555" fontFamily="monospace" style={{ pointerEvents: 'none' }}>USB</text>

        {/* CP2102 USB-to-UART chip (small black QFN) */}
        <rect x="70" y="62" width="60" height="25" rx="2" fill="#222" stroke="#444" strokeWidth="0.5" />
        <text x="100" y="76" textAnchor="middle" fontSize="6" fill="#666" fontFamily="monospace" style={{ pointerEvents: 'none' }}>CP2102</text>

        {/* 3.3V regulator (SOT-223) */}
        <rect x="65" y="95" width="70" height="18" rx="2" fill="#333" stroke="#555" strokeWidth="0.5" />
        <text x="100" y="107" textAnchor="middle" fontSize="6" fill="#777" fontFamily="monospace" style={{ pointerEvents: 'none' }}>AMS1117-3.3</text>

        {/* Boot button (small, blue) */}
        <rect x="55" y="125" width="22" height="18" rx="2" fill="#2266aa" stroke="#114488" strokeWidth="1" />
        <circle cx="66" cy="134" r="5" fill="#3377bb" />
        <text x="66" y="155" textAnchor="middle" fontSize="5" fill="#888" fontFamily="monospace" style={{ pointerEvents: 'none' }}>BOOT</text>

        {/* EN button (small, red) */}
        <rect x="125" y="125" width="22" height="18" rx="2" fill="#aa3333" stroke="#882222" strokeWidth="1" />
        <circle cx="136" cy="134" r="5" fill="#bb4444" />
        <text x="136" y="155" textAnchor="middle" fontSize="5" fill="#888" fontFamily="monospace" style={{ pointerEvents: 'none' }}>EN</text>

        {/* ESP32 module (silver metal can) */}
        <rect x="50" y="170" width="100" height="50" rx="3" fill="#b0b0b0" stroke="#888" strokeWidth="1" />
        <text x="100" y="195" textAnchor="middle" fontSize="8" fill="#555" fontFamily="monospace" fontWeight="bold" style={{ pointerEvents: 'none' }}>ESP32-WROOM-32</text>
        <text x="100" y="208" textAnchor="middle" fontSize="5" fill="#777" fontFamily="monospace" style={{ pointerEvents: 'none' }}>240MHz Dual-Core</text>
        <text x="100" y="216" textAnchor="middle" fontSize="5" fill="#777" fontFamily="monospace" style={{ pointerEvents: 'none' }}>WiFi + BT</text>

        {/* PCB antenna trace (zigzag on the module) */}
        <path d="M 55 175 L 60 175 L 60 180 L 65 180 L 65 175 L 70 175" fill="none" stroke="#999" strokeWidth="0.8" style={{ pointerEvents: 'none' }} />

        {/* Onboard LED */}
        <circle cx="100" cy="240" r="4" fill={ledOn ? '#7FFF9F' : '#333'} stroke={ledOn ? '#22c55e' : '#555'} strokeWidth="1" />
        {ledOn && <circle cx="99" cy="239" r="1.5" fill="#fff" opacity="0.8" />}
        <text x="100" y="255" textAnchor="middle" fontSize="5" fill="#888" fontFamily="monospace" style={{ pointerEvents: 'none' }}>LED</text>
        {/* ON / OFF label synced with the blink */}
        {ledOn && (
          <text x="112" y="243" textAnchor="start" fontSize="6" fill="#7FFF9F" fontFamily="monospace" fontWeight="bold">ON</text>
        )}

        {/* Left pin header strip */}
        <rect x="25" y="40" width="10" height="320" fill="#1a1a1a" />
        {/* Decorative pin holes */}
        {ESP32_LEFT_PINS.map((pin) => (
          <circle key={`hole-${pin.id}`} cx={pin.cx} cy={pin.cy} r="2.5" fill="#444" stroke="#222" strokeWidth="0.5" style={{ pointerEvents: 'none' }} />
        ))}
        {/* Left pin labels — short form to fit the narrow board */}
        {['3V3','EN','SVP','SVN','34','35','32','33','25','26','27','14','12','13','GND','VIN','15','2','0'].map((label, i) => (
          <text key={`ll-${i}`} x="42" y={53 + i * 17} fontSize="4" fill="#aaa" fontFamily="monospace" style={{ pointerEvents: 'none' }}>{label}</text>
        ))}

        {/* Right pin header strip */}
        <rect x="165" y="40" width="10" height="320" fill="#1a1a1a" />
        {ESP32_RIGHT_PINS.map((pin) => (
          <circle key={`hole-${pin.id}`} cx={pin.cx} cy={pin.cy} r="2.5" fill="#444" stroke="#222" strokeWidth="0.5" style={{ pointerEvents: 'none' }} />
        ))}
        {['GND','23','22','TX0','RX0','21','19','18','5','17','16','4','0','2','15','SD1','SD0','CLK','CMD'].map((label, i) => (
          <text key={`rl-${i}`} x="158" y={53 + i * 17} fontSize="4" fill="#aaa" fontFamily="monospace" textAnchor="end" style={{ pointerEvents: 'none' }}>{label}</text>
        ))}

        {/* Pin hit-areas + highlight rings */}
        {ESP32_LEFT_PINS.map((pin) => (
          <PinHitArea
            key={pin.id}
            pin={pin}
            isHovered={hoveredId === pin.id}
            isSelected={selectedId === pin.id}
            hitR={8}
            onEnter={handleEnter}
            onMove={handleMove}
            onLeave={handleLeave}
            onClick={handleClick}
          />
        ))}
        {ESP32_RIGHT_PINS.map((pin) => (
          <PinHitArea
            key={pin.id}
            pin={pin}
            isHovered={hoveredId === pin.id}
            isSelected={selectedId === pin.id}
            hitR={8}
            onEnter={handleEnter}
            onMove={handleMove}
            onLeave={handleLeave}
            onClick={handleClick}
          />
        ))}

        {/* Mounting holes */}
        <circle cx="25" cy="20" r="3" fill="#000" stroke="#444" strokeWidth="0.5" style={{ pointerEvents: 'none' }} />
        <circle cx="175" cy="20" r="3" fill="#000" stroke="#444" strokeWidth="0.5" style={{ pointerEvents: 'none' }} />
        <circle cx="25" cy="375" r="3" fill="#000" stroke="#444" strokeWidth="0.5" style={{ pointerEvents: 'none' }} />
        <circle cx="175" cy="375" r="3" fill="#000" stroke="#444" strokeWidth="0.5" style={{ pointerEvents: 'none' }} />
      </svg>

      {/* Hint label */}
      <div className="mt-1 text-center text-[10px] text-body-mid">
        Hover a pin · click for full details
      </div>

      {/* Floating tooltip */}
      {hoveredPin && tooltipPos && (
        <PinTooltip pin={hoveredPin} x={tooltipPos.x} y={tooltipPos.y} />
      )}

      {/* Detail card below the board */}
      {selectedPin && (
        <PinDetailCard pin={selectedPin} onClose={() => setSelectedId(null)} board="esp32" />
      )}
    </div>
  );
}

// ── Realistic LED SVG ───────────────────────────────────────────────────────
export function LEDSVG({ color = 'red', on = false, size = 60 }: { color?: string; on?: boolean; size?: number }) {
  const ledColor = on ? color : '#444';
  const glowColor = on ? color : 'transparent';
  return (
    <svg viewBox="0 0 60 80" width={size} height={size * 1.33} role="img" aria-label={`LED ${on ? 'on' : 'off'}`}>
      {/* Glow */}
      {on && <circle cx="30" cy="25" r="22" fill={glowColor} opacity="0.3" />}
      {/* Bulb dome */}
      <path d="M 15 35 Q 15 10 30 10 Q 45 10 45 35 Z" fill={ledColor} stroke="#333" strokeWidth="1.5" />
      {/* Bulb highlight */}
      <ellipse cx="24" cy="20" rx="5" ry="4" fill="#fff" opacity={on ? 0.4 : 0.15} />
      {/* Flat side (cathode indicator) */}
      <line x1="15" y1="35" x2="45" y2="35" stroke="#333" strokeWidth="1" />
      {/* Leads */}
      <line x1="22" y1="35" x2="22" y2="70" stroke="#999" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="35" x2="38" y2="70" stroke="#999" strokeWidth="2" strokeLinecap="round" />
      {/* Anode lead (longer) */}
      <line x1="22" y1="70" x2="22" y2="78" stroke="#999" strokeWidth="2" strokeLinecap="round" />
      {/* Labels */}
      <text x="22" y="78" textAnchor="middle" fontSize="7" fill={on ? '#22c55e' : '#666'} fontFamily="monospace">+</text>
      <text x="38" y="78" textAnchor="middle" fontSize="7" fill="#666" fontFamily="monospace">-</text>
    </svg>
  );
}

// ── Realistic Resistor SVG ──────────────────────────────────────────────────
export function ResistorSVG({ value = '1kΩ', size = 80 }: { value?: string; size?: number }) {
  return (
    <svg viewBox="0 0 100 40" width={size} height={size * 0.4} role="img" aria-label={`Resistor ${value}`}>
      {/* Leads */}
      <line x1="5" y1="20" x2="25" y2="20" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="75" y1="20" x2="95" y2="20" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" />
      {/* Body */}
      <rect x="25" y="10" width="50" height="20" rx="4" fill="#d4a96a" stroke="#a07a3a" strokeWidth="1" />
      {/* Color bands (1kΩ = brown-black-red-gold) */}
      <rect x="31" y="10" width="4" height="20" fill="#8B4513" />
      <rect x="39" y="10" width="4" height="20" fill="#1a1a1a" />
      <rect x="47" y="10" width="4" height="20" fill="#dc2626" />
      <rect x="55" y="10" width="4" height="20" fill="#d4a017" />
      {/* Value text */}
      <text x="50" y="36" textAnchor="middle" fontSize="6" fill="#888" fontFamily="monospace">{value}</text>
    </svg>
  );
}

// ── Realistic Breadboard SVG ────────────────────────────────────────────────
export function BreadboardSVG({ size = 200 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 120" width={size} height={size * 0.6} role="img" aria-label="Breadboard">
      {/* Board body */}
      <rect x="5" y="5" width="190" height="110" rx="4" fill="#f5f5f0" stroke="#d0d0c8" strokeWidth="1" />
      {/* Power rails */}
      <line x1="15" y1="18" x2="185" y2="18" stroke="#dc2626" strokeWidth="0.5" />
      <line x1="15" y1="22" x2="185" y2="22" stroke="#2563eb" strokeWidth="0.5" />
      <text x="10" y="22" textAnchor="end" fontSize="6" fill="#dc2626" fontFamily="monospace">+</text>
      <text x="10" y="20" textAnchor="end" fontSize="6" fill="#2563eb" fontFamily="monospace">-</text>
      {/* Top grid holes */}
      {Array.from({ length: 30 }, (_, c) => (
        <g key={`t${c}`}>
          {['a','b','c','d','e'].map((row, ri) => (
            <circle key={row} cx={15 + c * 5.8} cy={30 + ri * 5} r="1.2" fill="#999" />
          ))}
        </g>
      ))}
      {/* Center channel */}
      <rect x="5" y="58" width="190" height="8" fill="#e8e8e0" />
      <text x="100" y="64" textAnchor="middle" fontSize="5" fill="#bbb" fontFamily="monospace">SVX</text>
      {/* Bottom grid holes */}
      {Array.from({ length: 30 }, (_, c) => (
        <g key={`b${c}`}>
          {['f','g','h','i','j'].map((row, ri) => (
            <circle key={row} cx={15 + c * 5.8} cy={70 + ri * 5} r="1.2" fill="#999" />
          ))}
        </g>
      ))}
      {/* Ground rails */}
      <line x1="15" y1="98" x2="185" y2="98" stroke="#dc2626" strokeWidth="0.5" />
      <line x1="15" y1="102" x2="185" y2="102" stroke="#2563eb" strokeWidth="0.5" />
      <text x="10" y="102" textAnchor="end" fontSize="6" fill="#dc2626" fontFamily="monospace">+</text>
      <text x="10" y="100" textAnchor="end" fontSize="6" fill="#2563eb" fontFamily="monospace">-</text>
    </svg>
  );
}


