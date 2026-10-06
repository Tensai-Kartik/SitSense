import React from 'react';
import { AlertTriangle, Sparkles, X, Activity, ArrowRight } from 'lucide-react';
import { PostureState } from '../../types';

interface Props {
  isOpen: boolean;
  postureState: PostureState;
  onDismiss: () => void;
  onStartReset?: () => void;
  headAngle: number;
  slouchScore: number;
}

export const PostureAlertToast: React.FC<Props> = ({
  isOpen,
  postureState,
  onDismiss,
  onStartReset,
  headAngle,
  slouchScore
}) => {
  if (!isOpen || postureState === 'GOOD') return null;

  const isPoor = postureState === 'POOR';

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-md w-full animate-slide-up">
      <div className={`p-4 rounded-3xl backdrop-blur-xl border-2 shadow-2xl ${
        isPoor 
          ? 'bg-rose-950/90 border-rose-500/60 text-rose-200 glow-rose' 
          : 'bg-amber-950/90 border-amber-500/60 text-amber-200 glow-amber'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-2xl shrink-0 ${
              isPoor ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${
                isPoor ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {isPoor ? 'Sustained Poor Posture Alert' : 'Posture Deviation Warning'}
              </span>
              <h4 className="text-sm font-bold text-white leading-tight">
                {isPoor ? 'Forward Slouch Detected' : 'Neck / Shoulder Angle Attention'}
              </h4>
              <p className="text-xs text-slate-300">
                {isPoor
                  ? `Your spine is compressed by ~${Math.round(slouchScore * 100)}% with ${headAngle}° forward head pitch. Gently pull your shoulders back and level your chin.`
                  : `Mild ${headAngle}° head tilt observed. Align your gaze with the top third of your display.`}
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {onStartReset && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-end gap-2">
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Got it
            </button>
            <button
              onClick={onStartReset}
              className={`px-3.5 py-1.5 rounded-xl text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md transition-all ${
                isPoor ? 'bg-rose-400 hover:bg-rose-300' : 'bg-amber-400 hover:bg-amber-300'
              }`}
            >
              <span>Quick Reset</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
