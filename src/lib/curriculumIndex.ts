// Flat, ordered helpers built from the CURRICULUM tree.
//
// Used by:
//   - SearchPalette  (search index across lessons, modules, phases, projects,
//     checkpoints)
//   - LessonDrawer   ("Next lesson →" button — find the lesson that follows
//     the current one in curriculum order)
//   - DashboardView  ("Continue where you left off" — look up a lesson by id
//     without re-walking the tree on every render)

import {
  CURRICULUM,
  type Lesson,
  type Module,
  type Phase,
} from '@/lib/curriculum';

export interface FlatLesson {
  lesson: Lesson;
  module: Module;
  phase: Phase;
}

/** Ordered list of every lesson in the curriculum (phase → module → lesson). */
export const FLAT_LESSONS: FlatLesson[] = (() => {
  const out: FlatLesson[] = [];
  for (const phase of CURRICULUM) {
    for (const mod of phase.modules) {
      for (const lesson of mod.lessons) {
        out.push({ lesson, module: mod, phase });
      }
    }
  }
  return out;
})();

/** O(1) lesson lookup by id — returns the lesson + its parent module + phase. */
export const LESSON_BY_ID: Map<string, FlatLesson> = (() => {
  const m = new Map<string, FlatLesson>();
  for (const fl of FLAT_LESSONS) m.set(fl.lesson.id, fl);
  return m;
})();

/**
 * Returns the lesson that follows `id` in curriculum order, or `null` if
 * `id` is the last lesson (or not found).
 */
export function getNextLesson(id: string): FlatLesson | null {
  const idx = FLAT_LESSONS.findIndex((fl) => fl.lesson.id === id);
  if (idx === -1 || idx + 1 >= FLAT_LESSONS.length) return null;
  return FLAT_LESSONS[idx + 1];
}

// ── Search index ────────────────────────────────────────────────────────────

export type ResultKind = 'lesson' | 'project' | 'checkpoint' | 'phase';

export interface SearchEntry {
  /** Stable id used as the React key + as the value sent to onSelect. */
  id: string;
  /** What the user sees as the main result line. */
  title: string;
  /** A muted secondary line (e.g. "Phase 0 · Math Bootcamp"). */
  subtitle: string;
  /** All searchable text, lower-cased. We match on this. */
  haystack: string;
  kind: ResultKind;
  /** For lesson results — the Lesson object to open. */
  lesson?: Lesson;
  /** For non-lesson results — which top-level view to switch to. */
  view?: 'curriculum' | 'projects' | 'checkpoints';
}

/**
 * Build the search index once at module load. We index:
 *   - Phase entries  (title, subtitle, description + every module title)
 *   - Lesson entries (title, summary, module title, phase title)
 *   - Project entries (title, goal, module title, phase title)
 *   - Checkpoint entries (question text, module title, phase title)
 *
 * Module titles are part of the searchable text for the phase entry and for
 * every entry inside that module — so typing a module name surfaces lessons,
 * projects, and checkpoints in that module, plus the phase entry itself.
 */
export const SEARCH_INDEX: SearchEntry[] = (() => {
  const idx: SearchEntry[] = [];
  for (const phase of CURRICULUM) {
    const moduleTitles = phase.modules.map((m) => m.title).join(' · ');
    idx.push({
      id: `phase:${phase.id}`,
      title: phase.title,
      subtitle: `Phase ${phase.index} · ${phase.subtitle}`,
      haystack: `${phase.title} ${phase.subtitle} ${phase.description} ${moduleTitles}`.toLowerCase(),
      kind: 'phase',
      view: 'curriculum',
    });

    for (const mod of phase.modules) {
      const ctxPrefix = `${phase.title} ${mod.title}`.toLowerCase();

      for (const lesson of mod.lessons) {
        idx.push({
          id: `lesson:${lesson.id}`,
          title: lesson.title,
          subtitle: `${phase.title} · ${mod.title}`,
          haystack: `${ctxPrefix} ${lesson.title} ${lesson.summary}`.toLowerCase(),
          kind: 'lesson',
          lesson,
        });
      }

      for (const project of mod.projects) {
        idx.push({
          id: `project:${project.id}`,
          title: project.title,
          subtitle: `${phase.title} · ${mod.title}`,
          haystack: `${ctxPrefix} ${project.title} ${project.goal}`.toLowerCase(),
          kind: 'project',
          view: 'projects',
        });
      }

      mod.checkpoints.forEach((q, i) => {
        idx.push({
          id: `checkpoint:${mod.id}#${i}`,
          title: q,
          subtitle: `${phase.title} · ${mod.title} · checkpoint ${i + 1}`,
          haystack: `${ctxPrefix} ${q}`.toLowerCase(),
          kind: 'checkpoint',
          view: 'checkpoints',
        });
      });
    }
  }
  return idx;
})();
