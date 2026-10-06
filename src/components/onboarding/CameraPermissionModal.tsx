import React from 'react';
import { 
  Camera, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Activity, 
  Droplet, 
  Eye, 
  Lock, 
  Video, 
  AlertTriangle,
  ArrowRight,
  Play
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onAllowCamera: () => void;
  onStartDemo: () => void;
  onDismiss: () => void;
  isInitializing: boolean;
  cameraError: string | null;
}

export const CameraPermissionModal: React.FC<Props> = ({
  isOpen,
  onAllowCamera,
  onStartDemo,
  onDismiss,
  isInitializing,
  cameraError
}) => {
  // Prevent background scrolling while modal is open
  React.useEffect(() => {
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

  if (!isOpen) return null;

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="camera-permission-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-teal-500/40 p-6 md:p-8 shadow-2xl overflow-hidden animate-slide-up glow-teal">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Icon & Title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-slate-950 font-extrabold shadow-lg glow-teal shrink-0">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 font-bold px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                  Welcome to SitSense
                </span>
              </div>
              <h2 id="camera-permission-title" className="text-xl md:text-2xl font-black text-white tracking-tight mt-0.5">
                Enable Camera for Posture & Movement AI
              </h2>
            </div>
          </div>

          {/* Value Prop Description */}
          <p className="text-xs text-slate-300 leading-relaxed">
            SitSense uses intelligent on-device computer vision to actively observe your workstation ergonomics, protect your spine from slouching, and prompt timely hydration and movement resets.
          </p>

          {/* Privacy & Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">100% Local & Private</span>
                <span className="text-[11px] text-slate-400">Video frames processed in RAM only. Zero uploads to servers.</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
              <Activity className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">Real-Time Posture AI</span>
                <span className="text-[11px] text-slate-400">Detects head pitch, slouch, and shoulder alignment.</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
              <Droplet className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">Hydration Tracking</span>
                <span className="text-[11px] text-slate-400">Gentle water reminders & daily hydration log.</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
              <Eye className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">Screen Strain Defense</span>
                <span className="text-[11px] text-slate-400">20-20-20 visual resets and break detection.</span>
              </div>
            </div>
          </div>

          {/* Camera Error Notice if any */}
          {cameraError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold block">Camera Access Notice</span>
                <span className="text-rose-300/90 text-[11px]">{cameraError}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={onAllowCamera}
              disabled={isInitializing}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-400 via-teal-500 to-teal-400 hover:from-teal-300 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] disabled:opacity-50 glow-teal"
            >
              {isInitializing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting Camera & AI Model...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 fill-slate-950" />
                  <span>Allow Camera & Start SitSense</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={onStartDemo}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-500/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Try Demo Mode (No Camera)</span>
              </button>

              <button
                onClick={onDismiss}
                className="py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
