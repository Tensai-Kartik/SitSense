import React from 'react';
import { Droplet, Plus, Check, Clock, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../engine/audioEngine';

interface Props {
  hydrationCount: number;
  onLogHydration: () => void;
  targetGlasses?: number;
  nextReminderMin?: number;
}

export const HydrationWidget: React.FC<Props> = ({
  hydrationCount,
  onLogHydration,
  targetGlasses = 8,
  nextReminderMin = 35
}) => {
  const currentVolumeMl = hydrationCount * 250;
  const targetVolumeMl = targetGlasses * 250;
  const progressPercent = Math.min(100, Math.round((hydrationCount / targetGlasses) * 100));
  const isGoalReached = hydrationCount >= targetGlasses;

  const handleQuickLog = () => {
    soundManager.playHydrationDroplet();
    onLogHydration();

    if (hydrationCount + 1 >= targetGlasses) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 }
        });
      } catch {
        // no-op
      }
    }
  };

  return (
    <div className="relative rounded-3xl bg-slate-900/85 border border-slate-800 p-5 md:p-6 shadow-xl overflow-hidden group hover:border-cyan-500/40 transition-all">
      {/* Subtle water glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left Side: Details & Progress */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Droplet className="w-4 h-4 fill-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Workstation Hydration Tracker</h3>
                <span className="text-[10px] text-slate-400">Target: {targetGlasses} glasses ({targetVolumeMl} ml)</span>
              </div>
            </div>

            {isGoalReached && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-400" />
                <span>Daily Goal Met!</span>
              </span>
            )}
          </div>

          {/* Progress Bar with Water Wave style */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">{currentVolumeMl} ml / {targetVolumeMl} ml</span>
              <span className="text-cyan-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Glass indicators */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {Array.from({ length: targetGlasses }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-7 rounded-lg border flex items-center justify-center text-[10px] font-mono transition-all ${
                  i < hydrationCount
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
              >
                {i < hydrationCount ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Quick Action Button & Next reminder */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <button
            onClick={handleQuickLog}
            className="flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all hover:scale-105 active:scale-95 glow-cyan"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Log Glass (+250ml)</span>
          </button>

          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Next chime in ~{nextReminderMin}m</span>
          </span>
        </div>
      </div>
    </div>
  );
};
