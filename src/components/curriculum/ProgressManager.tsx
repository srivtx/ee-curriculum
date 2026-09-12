'use client';

import * as React from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useProgress, type ProgressState } from '@/hooks/useProgress';
import { cn } from '@/lib/utils';

/**
 * Export / Import progress manager.
 *
 * - **Export**: serializes the current progress state to a JSON file and
 *   triggers a download. Filename: `ee-curriculum-progress-YYYY-MM-DD.json`.
 * - **Import**: opens a file picker, reads the JSON, validates the shape
 *   (version === '1.0' and a `progress` object with the expected array
 *   fields), shows a confirmation dialog ("This will replace your current
 *   progress. Continue?"), and on confirm writes the imported state to
 *   localStorage via the `useProgress().importState` action.
 *
 * The JSON envelope format:
 * ```json
 * {
 *   "version": "1.0",
 *   "exportedAt": "2026-09-10T...",
 *   "progress": {
 *     "completedLessons": ["p0m1l1", ...],
 *     "completedProjects": ["p0m1pr1", ...],
 *     "gotItCheckpoints": ["p0m1#0", ...],
 *     "hoursByPhase": { "p0": 12, ... }
 *   }
 * }
 * ```
 */

const EXPORT_VERSION = '1.0';

interface ExportEnvelope {
  version: string;
  exportedAt: string;
  progress: ProgressState;
}

/** Today's date as YYYY-MM-DD, in the user's local timezone. */
function todayDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Validate that a parsed object is a well-formed export envelope. */
function isValidEnvelope(x: unknown): x is ExportEnvelope {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  if (o.version !== EXPORT_VERSION) return false;
  if (typeof o.exportedAt !== 'string') return false;
  const p = o.progress;
  if (!p || typeof p !== 'object') return false;
  const pr = p as Record<string, unknown>;
  if (!Array.isArray(pr.completedLessons)) return false;
  if (!Array.isArray(pr.completedProjects)) return false;
  if (!Array.isArray(pr.gotItCheckpoints)) return false;
  if (!Array.isArray(pr.needReviewCheckpoints)) return false;
  if (!pr.hoursByPhase || typeof pr.hoursByPhase !== 'object') return false;
  // lastLessonId is optional on import (older exports won't have it).
  if (pr.lastLessonId !== undefined && typeof pr.lastLessonId !== 'string') return false;
  return true;
}

export function ProgressManager() {
  const { state, importState } = useProgress();

  // Confirmation dialog state for imports.
  const [pendingImport, setPendingImport] =
    React.useState<ProgressState | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // ---- Export --------------------------------------------------------------
  const handleExport = React.useCallback(() => {
    const envelope: ExportEnvelope = {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      progress: state,
    };
    const blob = new Blob([JSON.stringify(envelope, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ee-curriculum-progress-${todayDate()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state]);

  // ---- Import (read + validate + confirm) ----------------------------------
  const handleFilePicked = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setImportError(null);
      const file = e.target.files?.[0];
      // Reset the input so picking the same file twice fires change again.
      e.target.value = '';
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result)) as unknown;
          if (!isValidEnvelope(parsed)) {
            setImportError(
              'That file is not a valid EE Curriculum progress export (expected version 1.0).'
            );
            return;
          }
          setPendingImport(parsed.progress);
        } catch {
          setImportError('Could not read that file as JSON.');
        }
      };
      reader.onerror = () => setImportError('Could not read that file.');
      reader.readAsText(file);
    },
    []
  );

  const confirmImport = React.useCallback(() => {
    if (!pendingImport) return;
    importState(pendingImport);
    setPendingImport(null);
  }, [pendingImport, importState]);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={handleFilePicked}
        aria-label="Import progress JSON file"
      />

      <Button
        variant="outline"
        onClick={handleExport}
        className="w-full gap-2 rounded-full border-accent/30 text-accent hover:bg-accent/5"
      >
        <Download className="h-3.5 w-3.5" />
        Export progress
      </Button>

      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'w-full gap-2 rounded-full',
          'border-hairline text-body-mid hover:text-ink'
        )}
      >
        <Upload className="h-3.5 w-3.5" />
        Import progress
      </Button>

      {/* Inline error toast (non-blocking) */}
      {importError && (
        <p
          role="alert"
          className="sm:col-span-2 rounded-sm border border-error/30 bg-error/5 px-2.5 py-1.5 text-[11px] text-error"
        >
          {importError}
        </p>
      )}

      {/* Confirmation dialog — replace current progress? */}
      <AlertDialog
        open={pendingImport !== null}
        onOpenChange={(v) => {
          if (!v) setPendingImport(null);
        }}
      >
        <AlertDialogContent className="rounded-sm border-hairline bg-canvas-card">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Replace your current progress?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will overwrite all saved progress in this browser with the
              data from the imported file. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmImport}
              className="rounded-full bg-accent text-canvas hover:bg-accent/90"
            >
              Yes, replace progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
