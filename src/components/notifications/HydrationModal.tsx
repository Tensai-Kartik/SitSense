import React from 'react';
import { Droplet, Check, Clock, X, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onSnooze: (minutes: number) => void;
  workMinutes: number;
}

export const HydrationModal: React.FC<Props> = ({
  isOpen,
  onConfirm,
  onSnooze,
  workMinutes
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-6 right-6 z-50 max-w-sm w-full bg-slate-900/95 border-2 border-cyan-500/60 rounded-3xl p-5 shadow-2xl backdrop-blur-xl animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0 glow-cyan">
          <Droplet className="w-6 h-6 fill-cyan-400 animate-pulse" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
            Smart Hydration Alert
          </span>
          <h4 className="text-base font-bold text-white leading-snug">
            Time for a Water Break
          </h4>
          <p className="text-xs text-slate-300">
            You've been working actively for{' '}
            <span className="font-semibold text-cyan-300">{workMinutes} minutes</span>. Drink a glass of water to maintain metabolic and cognitive focus.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-slate-800">
        <button
          onClick={onConfirm}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all"
        >
          <Check className="w-4 h-4" />
          <span>I Drank Water</span>
        </button>

        <button
          onClick={() => onSnooze(15)}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Snooze 15m</span>
        </button>
      </div>
    </div>
  );
};
