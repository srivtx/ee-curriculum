'use client';

import * as React from 'react';

/**
 * Progress tracking — persisted to localStorage.
 *
 * Tracks:
 *   - completedLessons:   Set<lessonId>
 *   - completedProjects:  Set<projectId>
 *   - gotItCheckpoints:   Set<`${moduleId}#${checkpointIndex}`>
 *   - hoursByPhase:       Record<phaseId, number>
 *   - needReviewCheckpoints: Set<`${moduleId}#${checkpointIndex}`>
 */

export interface ProgressState {
  completedLessons: string[];
  completedProjects: string[];
  gotItCheckpoints: string[];
  needReviewCheckpoints: string[];
  hoursByPhase: Record<string, number>;
  /** Last lesson the user opened — powers "Continue where you left off". */
  lastLessonId: string | null;
}

const STORAGE_KEY = 'ee-curriculum-progress-v1';

const EMPTY: ProgressState = {
  completedLessons: [],
  completedProjects: [],
  gotItCheckpoints: [],
  needReviewCheckpoints: [],
  hoursByPhase: {},
  lastLessonId: null,
};

// ---- Context ------------------------------------------------------------
interface ProgressContextValue {
  state: ProgressState;
  toggleLesson: (id: string) => void;
  isLessonDone: (id: string) => boolean;
  toggleProject: (id: string) => void;
  isProjectDone: (id: string) => boolean;
  setCheckpoint: (key: string, status: 'got_it' | 'need_review' | 'clear') => void;
  checkpointStatus: (key: string) => 'got_it' | 'need_review' | null;
  logHours: (phaseId: string, hours: number) => void;
  /** Record the lesson the user just opened (powers "Continue where you left off"). */
  setLastLesson: (id: string) => void;
  /** Replace the entire progress state — used by the import flow. */
  importState: (s: ProgressState) => void;
  reset: () => void;
  loaded: boolean;
}

const ProgressContext = React.createContext<ProgressContextValue | null>(null);

function load(): ProgressState {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      completedProjects: Array.isArray(parsed.completedProjects) ? parsed.completedProjects : [],
      gotItCheckpoints: Array.isArray(parsed.gotItCheckpoints) ? parsed.gotItCheckpoints : [],
      needReviewCheckpoints: Array.isArray(parsed.needReviewCheckpoints) ? parsed.needReviewCheckpoints : [],
      hoursByPhase: parsed.hoursByPhase && typeof parsed.hoursByPhase === 'object' ? parsed.hoursByPhase : {},
      lastLessonId: typeof parsed.lastLessonId === 'string' ? parsed.lastLessonId : null,
    };
  } catch {
    return EMPTY;
  }
}

function save(s: ProgressState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore quota errors */
  }
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ProgressState>(EMPTY);
  const [loaded, setLoaded] = React.useState(false);

  // Load on mount (client only) — avoids hydration mismatch.
  React.useEffect(() => {
    setState(load());
    setLoaded(true);
  }, []);

  // Persist on every change once loaded.
  React.useEffect(() => {
    if (loaded) save(state);
  }, [state, loaded]);

  const value = React.useMemo<ProgressContextValue>(() => ({
    state,
    loaded,
    toggleLesson: (id) =>
      setState((s) => ({
        ...s,
        completedLessons: s.completedLessons.includes(id)
          ? s.completedLessons.filter((x) => x !== id)
          : [...s.completedLessons, id],
      })),
    isLessonDone: (id) => state.completedLessons.includes(id),
    toggleProject: (id) =>
      setState((s) => ({
        ...s,
        completedProjects: s.completedProjects.includes(id)
          ? s.completedProjects.filter((x) => x !== id)
          : [...s.completedProjects, id],
      })),
    isProjectDone: (id) => state.completedProjects.includes(id),
    setCheckpoint: (key, status) =>
      setState((s) => {
        const got = s.gotItCheckpoints.filter((k) => k !== key);
        const rev = s.needReviewCheckpoints.filter((k) => k !== key);
        if (status === 'got_it') got.push(key);
        if (status === 'need_review') rev.push(key);
        return { ...s, gotItCheckpoints: got, needReviewCheckpoints: rev };
      }),
    checkpointStatus: (key) => {
      if (state.gotItCheckpoints.includes(key)) return 'got_it';
      if (state.needReviewCheckpoints.includes(key)) return 'need_review';
      return null;
    },
    logHours: (phaseId, hours) =>
      setState((s) => ({
        ...s,
        hoursByPhase: { ...s.hoursByPhase, [phaseId]: Math.max(0, hours) },
      })),
    setLastLesson: (id) =>
      setState((s) => ({ ...s, lastLessonId: id })),
    importState: (next) => setState(() => ({
      completedLessons: Array.isArray(next.completedLessons) ? next.completedLessons : [],
      completedProjects: Array.isArray(next.completedProjects) ? next.completedProjects : [],
      gotItCheckpoints: Array.isArray(next.gotItCheckpoints) ? next.gotItCheckpoints : [],
      needReviewCheckpoints: Array.isArray(next.needReviewCheckpoints) ? next.needReviewCheckpoints : [],
      hoursByPhase: next.hoursByPhase && typeof next.hoursByPhase === 'object' ? next.hoursByPhase : {},
      lastLessonId: typeof next.lastLessonId === 'string' ? next.lastLessonId : null,
    })),
    reset: () => setState(EMPTY),
  }), [state, loaded]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = React.useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within <ProgressProvider>');
  return ctx;
}

/** Helper: stable checkpoint key. */
export function checkpointKey(moduleId: string, index: number): string {
  return `${moduleId}#${index}`;
}
