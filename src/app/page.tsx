'use client';

import * as React from 'react';
import { TscircuitViewer } from '@/components/curriculum/TscircuitViewer';
import { CircuitVerseEmbed } from '@/components/curriculum/CircuitVerseEmbed';
import { LESSON_BY_ID } from '@/lib/curriculumIndex';

export default function Home() {
  const tscircuitLesson = LESSON_BY_ID.get('p9m2l1')?.lesson;
  const cvLesson = LESSON_BY_ID.get('p4m1l1')?.lesson;
  return (
    <div className="min-h-screen bg-canvas p-6 text-ink">
      <h1 className="text-xl mb-4">tscircuit + CircuitVerse Verification</h1>
      <section className="mb-8">
        <h2 className="text-base mb-2">
          tscircuit viewer (p9m2l1 — CMOS inverter)
        </h2>
        <TscircuitViewer code={tscircuitLesson?.tscircuit_code} />
      </section>
      <section>
        <h2 className="text-base mb-2">
          CircuitVerse embed (p4m1l1 — Boolean algebra)
        </h2>
        <CircuitVerseEmbed circuitUrl={cvLesson?.circuitverse_url} />
      </section>
    </div>
  );
}
