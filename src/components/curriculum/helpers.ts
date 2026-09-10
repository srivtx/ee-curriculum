// Shared helpers for the EE curriculum website.

import {
  BookOpen,
  Pencil,
  Hammer,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import type { Difficulty, LessonType } from '@/lib/curriculum';

/** Difficulty → tailwind classes (badge + dot). */
export const DIFFICULTY_STYLES: Record<
  Difficulty,
  { badge: string; dot: string; label: string }
> = {
  Foundation: {
    badge:
      'border-ee-green/30 bg-ee-green/10 text-ee-green dark:text-ee-green',
    dot: 'bg-ee-green',
    label: 'Foundation',
  },
  Intermediate: {
    badge:
      'border-ee-cyan/30 bg-ee-cyan/10 text-ee-cyan dark:text-ee-cyan',
    dot: 'bg-ee-cyan',
    label: 'Intermediate',
  },
  Advanced: {
    badge:
      'border-ee-red/30 bg-ee-red/10 text-ee-red dark:text-ee-red',
    dot: 'bg-ee-red',
    label: 'Advanced',
  },
};

export const LESSON_TYPE_META: Record<
  LessonType,
  { icon: LucideIcon; label: string; color: string }
> = {
  reading: { icon: BookOpen, label: 'Reading', color: 'text-ee-cyan' },
  exercise: { icon: Pencil, label: 'Exercise', color: 'text-ee-amber' },
  project: { icon: Hammer, label: 'Project', color: 'text-ee-teal' },
  quiz: { icon: HelpCircle, label: 'Quiz', color: 'text-ee-red' },
};

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (Number.isInteger(hours)) return `${hours} h`;
  return `${hours.toFixed(1)} h`;
}

export function formatWeeks(weeks: number): string {
  return weeks === 1 ? '1 week' : `${weeks} weeks`;
}

/** Convert hex (#rrggbb) to an rgba() string with alpha. */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Determine if a hex color is "light" (for choosing text color). */
export function isLightHex(hex: string): boolean {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // perceived luminance
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return l > 0.6;
}
