'use client';

import * as React from 'react';
import { CURRICULUM, CURRICULUM_STATS, type Lesson, type Module, type Phase } from '@/lib/curriculum';
import { useProgress } from '@/hooks/useProgress';
import { Header, type ViewKey } from '@/components/curriculum/Header';
import { Footer } from '@/components/curriculum/Footer';
import { CurriculumView } from '@/components/curriculum/CurriculumView';
import { DashboardView } from '@/components/curriculum/DashboardView';
import { ProjectsView } from '@/components/curriculum/ProjectsView';
import { CheckpointsView } from '@/components/curriculum/CheckpointsView';
import {
  LessonDrawer,
  type LessonDrawerPayload,
} from '@/components/curriculum/LessonDrawer';

// Build a lookup so when a lesson is opened we can fetch its parent module & phase.
interface LessonContext {
  module: Module;
  phase: Phase;
}
const LESSON_INDEX: Map<string, LessonContext> = (() => {
  const m = new Map<string, LessonContext>();
  for (const phase of CURRICULUM) {
    for (const mod of phase.modules) {
      for (const lesson of mod.lessons) {
        m.set(lesson.id, { module: mod, phase });
      }
    }
  }
  return m;
})();

export default function Home() {
  const [view, setView] = React.useState<ViewKey>('curriculum');
  const { state } = useProgress();

  // Lesson drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerPayload, setDrawerPayload] =
    React.useState<LessonDrawerPayload | null>(null);

  const overallPct =
    CURRICULUM_STATS.lessons > 0
      ? (state.completedLessons.length / CURRICULUM_STATS.lessons) * 100
      : 0;

  const handleOpenLesson = React.useCallback((lesson: Lesson) => {
    const ctx = LESSON_INDEX.get(lesson.id);
    setDrawerPayload({
      lesson,
      module: ctx?.module,
      phaseTitle: ctx?.phase.title,
      moduleTitle: ctx?.module?.title,
    });
    setDrawerOpen(true);
  }, []);

  // Switch view + scroll to top
  const handleViewChange = React.useCallback((v: ViewKey) => {
    setView(v);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header view={view} onView={handleViewChange} overallPct={overallPct} />

      <main className="flex-1">
        {view === 'curriculum' && (
          <CurriculumView onOpenLesson={handleOpenLesson} />
        )}
        {view === 'dashboard' && <DashboardView onNavigate={handleViewChange} />}
        {view === 'projects' && <ProjectsView />}
        {view === 'checkpoints' && <CheckpointsView />}
      </main>

      <Footer />

      <LessonDrawer
        payload={drawerPayload}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
