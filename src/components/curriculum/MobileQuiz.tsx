'use client';

import * as React from 'react';
import { Check, X, RotateCcw, Brain, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QuizQuestion {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What does Ohm\'s Law state?',
    choices: ['V = I × R', 'V = I + R', 'V = I / R', 'V = I − R'],
    correctIndex: 0,
    explanation: 'Voltage equals current times resistance. This is the most fundamental equation in EE.',
  },
  {
    id: 'q2',
    question: 'What is the time constant of an RC circuit?',
    choices: ['τ = R + C', 'τ = R × C', 'τ = R / C', 'τ = R − C'],
    correctIndex: 1,
    explanation: 'τ = R × C. After one time constant, the capacitor charges to 63% of its final value.',
  },
  {
    id: 'q3',
    question: 'In a capacitor, current leads voltage by how many degrees?',
    choices: ['0°', '45°', '90°', '180°'],
    correctIndex: 2,
    explanation: 'In a capacitor, current leads voltage by 90°. In an inductor, voltage leads current by 90°.',
  },
  {
    id: 'q4',
    question: 'What is the Nyquist sampling theorem?',
    choices: [
      'Sample at least 2× the highest frequency',
      'Sample at least 10× the highest frequency',
      'Sample at the same rate as the signal frequency',
      'Sampling rate does not matter',
    ],
    correctIndex: 0,
    explanation: 'To avoid aliasing, you must sample at least 2× the highest frequency in the signal.',
  },
  {
    id: 'q5',
    question: 'What does a PID controller stand for?',
    choices: [
      'Power-Input-Drive',
      'Proportional-Integral-Derivative',
      'Programmable-Interface-Device',
      'Phase-Index-Direction',
    ],
    correctIndex: 1,
    explanation: 'PID = Proportional, Integral, Derivative. The three terms handle present, past, and future errors.',
  },
  {
    id: 'q6',
    question: 'What is the forward voltage drop of a silicon diode?',
    choices: ['0.3V', '0.7V', '1.2V', '3.3V'],
    correctIndex: 1,
    explanation: 'Silicon diodes drop about 0.7V when forward-biased. Schottky diodes drop about 0.3V.',
  },
  {
    id: 'q7',
    question: 'What is the gain margin of a stable system?',
    choices: ['Negative', 'Zero', 'Positive', 'Infinite'],
    correctIndex: 2,
    explanation: 'A stable system has positive gain margin — you can increase the gain before it goes unstable.',
  },
  {
    id: 'q8',
    question: 'In a BJT, which current controls the collector current?',
    choices: ['Emitter current', 'Base current', 'Collector voltage', 'Gate voltage'],
    correctIndex: 1,
    explanation: 'In a BJT, I_C = β × I_B. A small base current controls a large collector current.',
  },
  {
    id: 'q9',
    question: 'What is the bandwidth of an ideal op-amp?',
    choices: ['1 kHz', '1 MHz', 'Infinite', 'Zero'],
    correctIndex: 2,
    explanation: 'An ideal op-amp has infinite bandwidth, infinite gain, infinite input impedance, and zero output impedance.',
  },
  {
    id: 'q10',
    question: 'What does CMOS stand for?',
    choices: [
      'Complementary Metal-Oxide Semiconductor',
      'Current Mode Operating System',
      'Controlled Motor Output Stage',
      'Common Mode Signal',
    ],
    correctIndex: 0,
    explanation: 'CMOS = Complementary Metal-Oxide Semiconductor. It uses complementary PMOS/NMOS pairs.',
  },
];

export function MobileQuiz() {
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null);
  const [showResult, setShowResult] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [answered, setAnswered] = React.useState<Set<string>>(new Set());
  const [finished, setFinished] = React.useState(false);

  const current = QUIZ_QUESTIONS[currentIdx];
  const isLast = currentIdx === QUIZ_QUESTIONS.length - 1;

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === current.correctIndex && !answered.has(current.id)) {
      setScore((s) => s + 1);
      setAnswered((prev) => new Set(prev).add(current.id));
    }
  };

  const handleNext = () => {
    if (isLast) {
      setFinished(true);
      return;
    }
    setCurrentIdx((i) => i + 1);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered(new Set());
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <Brain className="h-10 w-10 text-accent" />
        </div>
        <h3 className="text-lg font-semibold text-ink">Quiz Complete</h3>
        <p className="text-center text-sm text-body-mid">
          You scored <span className="font-medium text-accent">{score}</span> out of{' '}
          <span className="font-medium text-ink">{QUIZ_QUESTIONS.length}</span> ({pct}%)
        </p>
        {pct >= 80 ? (
          <p className="text-center text-sm text-accent">Excellent! You know your EE fundamentals.</p>
        ) : pct >= 50 ? (
          <p className="text-center text-sm text-body-mid">Good start. Review the lessons and try again.</p>
        ) : (
          <p className="text-center text-sm text-body-mid">Keep learning. The curriculum has everything you need.</p>
        )}
        <Button onClick={handleRestart} variant="outline" className="mt-2 gap-2">
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium text-ink">Quick Quiz</span>
        </div>
        <span className="text-sm text-body-mid">
          {currentIdx + 1} / {QUIZ_QUESTIONS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-canvas-mid">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${((currentIdx) / QUIZ_QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Score */}
      <div className="text-sm text-body-mid">
        Score: <span className="font-medium text-accent">{score}</span>
      </div>

      {/* Question */}
      <div className="rounded-lg border border-hairline bg-canvas-card p-4">
        <p className="text-base font-medium text-ink">{current.question}</p>
      </div>

      {/* Choices */}
      <div className="flex flex-col gap-2">
        {current.choices.map((choice, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = idx === current.correctIndex;
          const showCorrect = showResult && isCorrect;
          const showWrong = showResult && isSelected && !isCorrect;

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={showResult}
              className={cn(
                'flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                !showResult && 'border-hairline hover:border-accent/40 hover:bg-canvas-soft',
                showCorrect && 'border-accent bg-accent/10 text-accent',
                showWrong && 'border-error bg-error/10 text-error',
                showResult && !isSelected && !isCorrect && 'border-hairline opacity-50',
              )}
            >
              <span className={cn(
                'font-medium',
                showCorrect && 'text-accent',
                showWrong && 'text-error',
                !showResult && 'text-ink',
                showResult && !isSelected && !isCorrect && 'text-body-mid',
              )}>
                {choice}
              </span>
              {showCorrect && <Check className="h-4 w-4 text-accent" />}
              {showWrong && <X className="h-4 w-4 text-error" />}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showResult && (
        <div className="rounded-lg border border-hairline bg-canvas-card p-4">
          <p className="text-sm text-body-mid">{current.explanation}</p>
        </div>
      )}

      {/* Next button */}
      {showResult && (
        <Button onClick={handleNext} className="gap-2">
          {isLast ? 'See Results' : 'Next Question'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
