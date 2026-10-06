import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Play, Pause, SkipForward, CheckCircle2, X, Sparkles, ShieldCheck } from 'lucide-react';
import { ExerciseItem, PostureState } from '../../types';
import { soundManager } from '../../engine/audioEngine';
import { ExerciseVisualizer } from './ExerciseVisualizer';

interface Props {
  exercise: ExerciseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (exercise: ExerciseItem, durationSec: number) => void;
  currentPostureState?: PostureState;
}

export const ExerciseRunnerModal: React.FC<Props> = ({
  exercise,
  isOpen,
  onClose,
  onComplete,
  currentPostureState = 'GOOD'
}) => {
  // Lock background scrolling completely while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      const preventBackgroundScroll = (e: WheelEvent | TouchEvent) => {
        const target = e.target as HTMLElement | null;
        const scrollable = target?.closest('.modal-scrollable');
        if (!scrollable) {
          e.preventDefault();
        }
      };

      window.addEventListener('wheel', preventBackgroundScroll, { passive: false });
      window.addEventListener('touchmove', preventBackgroundScroll, { passive: false });

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        window.removeEventListener('wheel', preventBackgroundScroll);
        window.removeEventListener('touchmove', preventBackgroundScroll);
      };
    }
  }, [isOpen]);

  const totalTime = exercise?.durationSec || 45;
  const [timeLeft, setTimeLeft] = useState<number>(totalTime);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Reset modal state whenever it is opened or when the exercise changes
  useEffect(() => {
    if (isOpen && exercise) {
      setTimeLeft(exercise.durationSec);
      setIsPaused(false);
      setIsCompleted(false);
      setCurrentStepIndex(0);
    }
  }, [isOpen, exercise?.id]);

  const handleFinish = (elapsedSec?: number) => {
    setIsCompleted(true);
    soundManager.playCompletionChord();

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#2dd4bf', '#f59e0b', '#38bdf8', '#a855f7']
      });
    } catch {
      // Confetti fallback
    }

    const actualDuration = elapsedSec !== undefined ? elapsedSec : (exercise?.durationSec || 45);
    if (exercise) {
      onComplete(exercise, actualDuration);
    }
  };

  // Timer loop
  useEffect(() => {
    if (!isOpen || isPaused || isCompleted || !exercise) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish(exercise.durationSec);
          return 0;
        }

        // Play tick at last 3 seconds
        if (prev <= 4) {
          soundManager.playTimerTick();
        }

        // Progress step index through instructions
        const progressRatio = (totalTime - (prev - 1)) / totalTime;
        const targetStep = Math.min(
          exercise.instructions.length - 1,
          Math.max(0, Math.floor(progressRatio * exercise.instructions.length))
        );
        setCurrentStepIndex(targetStep);

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, isCompleted, totalTime, exercise?.id]);

  if (!isOpen || !exercise) return null;

  const progressPercent = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overscroll-contain animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
              {exercise.category.replace('_', ' ')}
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">{exercise.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 overscroll-contain modal-scrollable">
          {!isCompleted ? (
            <>
              {/* Exercise Animation Visualizer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <ExerciseVisualizer
                  animationType={exercise.animationType}
                  isPaused={isPaused}
                  className="w-full shadow-inner"
                />

                {/* Timer Circle & Action Stats */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  {/* Progress Ring */}
                  <div className="relative flex items-center justify-center">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        stroke="#1e293b"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        stroke="#14b8a6"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 68}
                        strokeDashoffset={2 * Math.PI * 68 * (1 - progressPercent / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-extrabold text-white font-mono tracking-tighter">
                        {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
                        {String(timeLeft % 60).padStart(2, '0')}
                      </span>
                      <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">
                        {isPaused ? 'Paused' : 'Remaining'}
                      </span>
                    </div>
                  </div>

                  {/* Target Area Pill */}
                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-medium">Target Muscle Group</p>
                    <p className="text-sm font-semibold text-teal-300">{exercise.targetArea}</p>
                  </div>

                  {/* Live Posture Tracking Feedback */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-slate-300">Live Posture:</span>
                    <span
                      className={`font-semibold ${
                        currentPostureState === 'GOOD'
                          ? 'text-emerald-400'
                          : currentPostureState === 'ATTENTION'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {currentPostureState}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Instruction Guide
                </h4>
                <div className="space-y-2">
                  {exercise.instructions.map((step, idx) => {
                    const isCurrent = idx === currentStepIndex;
                    const isPast = idx < currentStepIndex;
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                          isCurrent
                            ? 'bg-teal-500/10 border border-teal-500/30 text-teal-100'
                            : isPast
                            ? 'text-slate-400 opacity-60'
                            : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isCurrent
                              ? 'bg-teal-500 text-slate-950'
                              : isPast
                              ? 'bg-slate-700 text-slate-300'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <p className="text-sm leading-relaxed">{step}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Completed Screen */
            <div className="py-8 flex flex-col items-center text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-xl glow-teal">
                <Sparkles className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Reset Completed!</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-md">
                  Great job taking care of your body. Your stationary timer and spinal tension markers have been updated.
                </p>
              </div>

              {/* Benefits list */}
              <div className="w-full bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-left space-y-2">
                <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                  Postural Benefits Earned
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {exercise.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-lg glow-teal transition-all"
              >
                Return to Workspace
              </button>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        {!isCompleted && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-900/80">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all"
            >
              {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-all"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip</span>
              </button>

              <button
                onClick={() => handleFinish(Math.max(1, totalTime - timeLeft))}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish Early</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
