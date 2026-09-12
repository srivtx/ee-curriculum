'use client';

import * as React from 'react';
import {
  CURRICULUM_STATS,
  type Lesson,
} from '@/lib/curriculum';
import {
  LESSON_BY_ID,
  getNextLesson,
} from '@/lib/curriculumIndex';
import { useProgress } from '@/hooks/useProgress';
import { Header, type ViewKey } from '@/components/curriculum/Header';
import { Footer } from '@/components/curriculum/Footer';
import { CurriculumView } from '@/components/curriculum/CurriculumView';
import { DashboardView } from '@/components/curriculum/DashboardView';
import { ProjectsView } from '@/components/curriculum/ProjectsView';
import { CheckpointsView } from '@/components/curriculum/CheckpointsView';
import { LabsView } from '@/components/curriculum/LabsView';
import { PlaygroundView } from '@/components/curriculum/PlaygroundView';
import { SerialPanel } from '@/components/curriculum/SerialPanel';
import { SearchPalette } from '@/components/curriculum/SearchPalette';
import { MobileQuiz } from '@/components/curriculum/MobileQuiz';
import {
  LessonDrawer,
  type LessonDrawerPayload,
} from '@/components/curriculum/LessonDrawer';

export default function Home() {
  const [view, setView] = React.useState<ViewKey>('curriculum');
  const [quizOpen, setQuizOpen] = React.useState(false);
  const { state, setLastLesson } = useProgress();

  // Lesson drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerPayload, setDrawerPayload] =
    React.useState<LessonDrawerPayload | null>(null);

  // Search palette state
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Labs view state — id of the currently-open lab, or null for the list.
  const [labsView, setLabsView] = React.useState<string | null>(null);
  // Playground view state — id of the currently-open tool, or null for the list.
  const [playgroundView, setPlaygroundView] = React.useState<string | null>(null);

  const overallPct =
    CURRICULUM_STATS.lessons > 0
      ? (state.completedLessons.length / CURRICULUM_STATS.lessons) * 100
      : 0;

  const handleOpenLesson = React.useCallback(
    (lesson: Lesson) => {
      const ctx = LESSON_BY_ID.get(lesson.id);
      setDrawerPayload({
        lesson,
        module: ctx?.module,
        phaseTitle: ctx?.phase.title,
        moduleTitle: ctx?.module?.title,
      });
      setDrawerOpen(true);
      setLastLesson(lesson.id);
    },
    [setLastLesson]
  );

  // "Next lesson" — called by the LessonDrawer footer. Closes the current
  // drawer, opens the next lesson in curriculum order (if any).
  const handleOpenNextLesson = React.useCallback(
    (currentLessonId: string) => {
      const next = getNextLesson(currentLessonId);
      if (!next) return; // last lesson — drawer handles this state itself
      setDrawerPayload({
        lesson: next.lesson,
        module: next.module,
        phaseTitle: next.phase.title,
        moduleTitle: next.module.title,
      });
      setLastLesson(next.lesson.id);
      // Keep drawerOpen=true; the LessonDrawer resets scroll on lesson-id change.
    },
    [setLastLesson]
  );

  // Switch view + scroll to top. Also closes any open lab/playground overlay
  // so the user lands on the section's list view, not a stale detail page.
  const handleViewChange = React.useCallback((v: ViewKey) => {
    setView(v);
    setLabsView(null);
    setPlaygroundView(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Global keyboard shortcut: ⌘K (macOS) / Ctrl+K (everywhere else) opens
  // the search palette. We attach a single window listener and ignore the
  // event when the target is an editable element the user is mid-edit in
  // (textareas inside playgrounds, etc.) — except that Cmd+K / Ctrl+K is
  // almost never a typing conflict, so we still honor it.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header
        view={view}
        onView={handleViewChange}
        overallPct={overallPct}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <main className="flex-1">
        {view === 'curriculum' && (
          <CurriculumView onOpenLesson={handleOpenLesson} />
        )}
        {view === 'dashboard' && (
          <DashboardView
            onNavigate={handleViewChange}
            onOpenLesson={handleOpenLesson}
          />
        )}
        {view === 'projects' && <ProjectsView />}
        {view === 'checkpoints' && <CheckpointsView />}
        {view === 'labs' && (
          <LabsView
            activeLabId={labsView}
            onOpenLab={(id) => setLabsView(id)}
            onCloseLab={() => setLabsView(null)}
            onNavigateToCurriculum={() => handleViewChange('curriculum')}
          />
        )}
        {view === 'playground' && (
          <PlaygroundView
            activeToolId={playgroundView}
            onOpenTool={(id) => setPlaygroundView(id)}
            onCloseTool={() => setPlaygroundView(null)}
          />
        )}
      </main>

      <Footer />

      <LessonDrawer
        payload={drawerPayload}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onOpenNextLesson={handleOpenNextLesson}
      />

      <SerialPanel />

      <SearchPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onOpenLesson={handleOpenLesson}
        onNavigate={handleViewChange}
      />

      {/* Mobile quiz — floating button on mobile, overlay when open */}
      {quizOpen && (
        <div className="fixed inset-0 z-50 bg-canvas overflow-y-auto md:hidden">
          <div className="sticky top-0 z-10 border-b border-hairline bg-canvas/85 backdrop-blur-md">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-ink">EE Quiz</span>
              <button
                onClick={() => setQuizOpen(false)}
                className="text-sm text-body-mid hover:text-ink"
              >
                Close
              </button>
            </div>
          </div>
          <MobileQuiz />
        </div>
      )}

      {/* Quiz FAB — mobile only */}
      {!quizOpen && (
        <button
          onClick={() => setQuizOpen(true)}
          className="fixed bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-canvas shadow-lg md:hidden"
          aria-label="Open quiz"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </button>
      )}
    </div>
  );
}
