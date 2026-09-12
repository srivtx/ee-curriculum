'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// ── Arduino Uno SVG ─────────────────────────────────────────────────────────
// Realistic top-view of an Arduino Uno R3 board with:
// - Blue PCB
// - Black ATmega328P DIP-28 chip
// - Silver USB-B connector
// - Black power jack
// - 14 digital pins (top), 6 analog pins (bottom), power pins
// - 16MHz crystal
// - Reset button
// - ON LED + L LED (pin 13)

export function ArduinoUnoSVG({ ledOn = false }: { ledOn?: boolean }) {
  return (
    <svg viewBox="0 0 400 280" className="w-full max-w-md" role="img" aria-label="Arduino Uno R3 board">
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
      
      {/* TX/RX LEDs */}
      <circle cx="100" cy="130" r="3" fill="#333" stroke="#555" strokeWidth="0.5" />
      <text x="100" y="145" textAnchor="middle" fontSize="5" fill="#fff" fontFamily="monospace">TX</text>
      <circle cx="115" cy="130" r="3" fill="#333" stroke="#555" strokeWidth="0.5" />
      <text x="115" y="145" textAnchor="middle" fontSize="5" fill="#fff" fontFamily="monospace">RX</text>
      
      {/* Digital pins (0-13, top row) — black header strip */}
      <rect x="80" y="185" width="240" height="12" fill="#1a1a1a" rx="1" />
      {/* Pin holes */}
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={`d${i}`} cx={88 + i * 17} cy="191" r="2.5" fill="#444" stroke="#222" strokeWidth="0.5" />
      ))}
      {/* Pin labels */}
      {['0','1','2','3','4','5','6','7','8','9','10','11','12','13'].map((label, i) => (
        <text key={`dl${i}`} x={88 + i * 17} y="207" textAnchor="middle" fontSize="5" fill="#fff" fontFamily="monospace">{label}</text>
      ))}
      <text x="50" y="194" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="monospace">DIGITAL</text>
      <text x="345" y="194" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="monospace">~ ~ ~</text>
      
      {/* Power pins (left side) */}
      <rect x="80" y="215" width="120" height="12" fill="#1a1a1a" rx="1" />
      {['VIN','GND','GND','5V','3V3','RST'].map((label, i) => (
        <g key={`p${i}`}>
          <circle cx={88 + i * 20} cy="221" r="2.5" fill="#444" stroke="#222" strokeWidth="0.5" />
          <text x={88 + i * 20} y="237" textAnchor="middle" fontSize="4" fill="#fff" fontFamily="monospace">{label}</text>
        </g>
      ))}
      <text x="50" y="224" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="monospace">POWER</text>
      
      {/* Analog pins (A0-A5, bottom row) */}
      <rect x="220" y="215" width="110" height="12" fill="#1a1a1a" rx="1" />
      {['A0','A1','A2','A3','A4','A5'].map((label, i) => (
        <g key={`a${i}`}>
          <circle cx={228 + i * 18} cy="221" r="2.5" fill="#444" stroke="#222" strokeWidth="0.5" />
          <text x={228 + i * 18} y="237" textAnchor="middle" fontSize="4" fill="#fff" fontFamily="monospace">{label}</text>
        </g>
      ))}
      <text x="345" y="224" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="monospace">ANALOG</text>
      
      {/* Pin 13 wire (highlighted when active) */}
      {ledOn && (
        <line x1="311" y1="191" x2="311" y2="170" stroke="#7FFF9F" strokeWidth="2" opacity="0.6" />
      )}
      <line x1="311" y1="191" x2="311" y2="170" stroke="#666" strokeWidth="1" />
      
      {/* Mounting holes */}
      <circle cx="20" cy="20" r="3" fill="#0a4a70" stroke="#ffffff" strokeWidth="0.5" />
      <circle cx="380" cy="20" r="3" fill="#0a4a70" stroke="#ffffff" strokeWidth="0.5" />
      <circle cx="20" cy="260" r="3" fill="#0a4a70" stroke="#ffffff" strokeWidth="0.5" />
      <circle cx="380" cy="260" r="3" fill="#0a4a70" stroke="#ffffff" strokeWidth="0.5" />
      
      {/* Arduino logo text */}
      <text x="330" y="50" textAnchor="middle" fontSize="8" fill="#ffffff" fontFamily="monospace" opacity="0.5">ARDUINO</text>
      <text x="330" y="60" textAnchor="middle" fontSize="6" fill="#ffffff" fontFamily="monospace" opacity="0.4">.cc</text>
    </svg>
  );
}

// ── ESP32 DevKit SVG ────────────────────────────────────────────────────────
// Realistic top-view of an ESP32 DevKit V1 board with:
// - Black PCB
// - Silver ESP32 module (metal can)
// - Micro-USB connector
// - CP2102 USB-to-UART chip
// 38-pin header (19 each side)
// - Boot/EN buttons
// - 3.3V regulator
// - LED

export function ESP32DevKitSVG({ ledOn = false }: { ledOn?: boolean }) {
  return (
    <svg viewBox="0 0 200 400" className="w-full max-w-[200px]" role="img" aria-label="ESP32 DevKit V1 board">
      {/* PCB — long and narrow */}
      <rect x="15" y="10" width="170" height="380" rx="6" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
      <text x="100" y="28" textAnchor="middle" fontSize="9" fill="#888" fontFamily="monospace" fontWeight="bold">ESP32 DevKit V1</text>
      
      {/* Micro-USB connector (top, silver) */}
      <rect x="75" y="35" width="50" height="20" rx="2" fill="#c0c0c0" stroke="#888" strokeWidth="1" />
      <rect x="80" y="38" width="40" height="14" rx="1" fill="#a0a0a0" />
      <text x="100" y="48" textAnchor="middle" fontSize="6" fill="#555" fontFamily="monospace">USB</text>
      
      {/* CP2102 USB-to-UART chip (small black QFN) */}
      <rect x="70" y="62" width="60" height="25" rx="2" fill="#222" stroke="#444" strokeWidth="0.5" />
      <text x="100" y="76" textAnchor="middle" fontSize="6" fill="#666" fontFamily="monospace">CP2102</text>
      
      {/* 3.3V regulator (SOT-223) */}
      <rect x="65" y="95" width="70" height="18" rx="2" fill="#333" stroke="#555" strokeWidth="0.5" />
      <text x="100" y="107" textAnchor="middle" fontSize="6" fill="#777" fontFamily="monospace">AMS1117-3.3</text>
      
      {/* Boot button (small, blue) */}
      <rect x="55" y="125" width="22" height="18" rx="2" fill="#2266aa" stroke="#114488" strokeWidth="1" />
      <circle cx="66" cy="134" r="5" fill="#3377bb" />
      <text x="66" y="155" textAnchor="middle" fontSize="5" fill="#888" fontFamily="monospace">BOOT</text>
      
      {/* EN button (small, red) */}
      <rect x="125" y="125" width="22" height="18" rx="2" fill="#aa3333" stroke="#882222" strokeWidth="1" />
      <circle cx="136" cy="134" r="5" fill="#bb4444" />
      <text x="136" y="155" textAnchor="middle" fontSize="5" fill="#888" fontFamily="monospace">EN</text>
      
      {/* ESP32 module (silver metal can) */}
      <rect x="50" y="170" width="100" height="50" rx="3" fill="#b0b0b0" stroke="#888" strokeWidth="1" />
      <text x="100" y="195" textAnchor="middle" fontSize="8" fill="#555" fontFamily="monospace" fontWeight="bold">ESP32-WROOM-32</text>
      <text x="100" y="208" textAnchor="middle" fontSize="5" fill="#777" fontFamily="monospace">240MHz Dual-Core</text>
      <text x="100" y="216" textAnchor="middle" fontSize="5" fill="#777" fontFamily="monospace">WiFi + BT</text>
      
      {/* PCB antenna trace (zigzag on the module) */}
      <path d="M 55 175 L 60 175 L 60 180 L 65 180 L 65 175 L 70 175" fill="none" stroke="#999" strokeWidth="0.8" />
      
      {/* Onboard LED */}
      <circle cx="100" cy="240" r="4" fill={ledOn ? '#7FFF9F' : '#333'} stroke={ledOn ? '#22c55e' : '#555'} strokeWidth="1" />
      {ledOn && <circle cx="99" cy="239" r="1.5" fill="#fff" opacity="0.8" />}
      <text x="100" y="255" textAnchor="middle" fontSize="5" fill="#888" fontFamily="monospace">LED</text>
      
      {/* Left pin header (19 pins) */}
      <rect x="25" y="40" width="10" height="320" fill="#1a1a1a" />
      {Array.from({ length: 19 }, (_, i) => (
        <g key={`l${i}`}>
          <circle cx="30" cy={50 + i * 17} r="2.5" fill="#444" stroke="#222" strokeWidth="0.5" />
        </g>
      ))}
      {/* Left pin labels */}
      {['3V3','EN','SVP','SVN','IO34','IO35','IO32','IO33','IO25','IO26','IO27','IO14','IO12','IO13','GND','VIN','IO15','IO2','IO0'].map((label, i) => (
        <text key={`ll${i}`} x="42" y={53 + i * 17} fontSize="4" fill="#aaa" fontFamily="monospace">{label}</text>
      ))}
      
      {/* Right pin header (19 pins) */}
      <rect x="165" y="40" width="10" height="320" fill="#1a1a1a" />
      {Array.from({ length: 19 }, (_, i) => (
        <g key={`r${i}`}>
          <circle cx="170" cy={50 + i * 17} r="2.5" fill="#444" stroke="#222" strokeWidth="0.5" />
        </g>
      ))}
      {/* Right pin labels */}
      {['GND','IO23','IO22','TXD0','RXD0','IO21','IO19','IO18','IO5','IO17','IO16','IO4','IO0','IO2','IO15','SD1','SD0','CLK','CMD'].map((label, i) => (
        <text key={`rl${i}`} x="158" y={53 + i * 17} fontSize="4" fill="#aaa" fontFamily="monospace" textAnchor="end">{label}</text>
      ))}
      
      {/* Mounting holes */}
      <circle cx="25" cy="20" r="3" fill="#000" stroke="#444" strokeWidth="0.5" />
      <circle cx="175" cy="20" r="3" fill="#000" stroke="#444" strokeWidth="0.5" />
      <circle cx="25" cy="375" r="3" fill="#000" stroke="#444" strokeWidth="0.5" />
      <circle cx="175" cy="375" r="3" fill="#000" stroke="#444" strokeWidth="0.5" />
    </svg>
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
