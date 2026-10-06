import React, { useState, useEffect } from 'react';
import { X, Check, Target, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { CalibrationBaseline, Landmark3D } from '../../types';
import { calculateAngleDegrees, calculateDistance } from '../../cv/postureAnalysis';
import { soundManager } from '../../engine/audioEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveCalibration: (baseline: CalibrationBaseline) => void;
  currentLandmarks: Landmark3D[] | null;
  isPersonDetected: boolean;
}

export const CalibrationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaveCalibration,
  currentLandmarks,
  isPersonDetected
}) => {
  // Prevent background scrolling while modal is open
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

  const [step, setStep] = useState<'INTRO' | 'COUNTDOWN' | 'CAPTURING' | 'SUCCESS'>('INTRO');
  const [countdown, setCountdown] = useState<number>(3);
  const [samples, setSamples] = useState<Landmark3D[][]>([]);
  const [calculatedBaseline, setCalculatedBaseline] = useState<CalibrationBaseline | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('INTRO');
      setCountdown(3);
      setSamples([]);
      setCalculatedBaseline(null);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || step !== 'COUNTDOWN') return;

    if (countdown > 0) {
      soundManager.playTimerTick();
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setStep('CAPTURING');
      setSamples([]);
    }
  }, [isOpen, step, countdown]);

  const computeBaseline = () => {
    if (samples.length === 0) {
      setStep('INTRO');
      return;
    }

    let sumFwd = 0;
    let sumSlope = 0;
    let sumTorso = 0;
    let sumNoseDist = 0;

    for (const lms of samples) {
      const leftEar = lms[7];
      const rightEar = lms[8];
      const leftSh = lms[11];
      const rightSh = lms[12];
      const nose = lms[0];
      const leftHip = lms[23];
      const rightHip = lms[24];

      const shMidX = (leftSh.x + rightSh.x) / 2;
      const shMidY = (leftSh.y + rightSh.y) / 2;
      const earMidX = (leftEar.x + rightEar.x) / 2;
      const earMidY = (leftEar.y + rightEar.y) / 2;
      const shWidth = calculateDistance(leftSh, rightSh) || 0.3;

      // Forward head
      const fwd = Math.abs(Math.atan2(earMidX - shMidX, shMidY - earMidY) * (180 / Math.PI));
      sumFwd += fwd;

      // Shoulder slope
      const rawSlope = Math.abs(calculateAngleDegrees(leftSh.x, leftSh.y, rightSh.x, rightSh.y));
      const slope = Math.min(rawSlope, Math.abs(180 - rawSlope));
      sumSlope += slope;

      // Torso lean
      if (leftHip && rightHip) {
        const hipMidX = (leftHip.x + rightHip.x) / 2;
        const hipMidY = (leftHip.y + rightHip.y) / 2;
        const torso = Math.abs(Math.atan2(shMidX - hipMidX, hipMidY - shMidY) * (180 / Math.PI));
        sumTorso += torso;
      }

      // Slouch compression baseline
      const noseDist = (shMidY - nose.y) / shWidth;
      sumNoseDist += noseDist;
    }

    const n = samples.length;
    const baseline: CalibrationBaseline = {
      isCalibrated: true,
      calibratedAt: new Date().toISOString(),
      baselineForwardHead: Number((sumFwd / n).toFixed(1)),
      baselineShoulderSlope: Number((sumSlope / n).toFixed(1)),
      baselineTorsoLean: Number((sumTorso / n).toFixed(1)),
      baselineNoseToShoulderDist: Number((sumNoseDist / n).toFixed(3))
    };

    setCalculatedBaseline(baseline);
    setStep('SUCCESS');
    soundManager.playCompletionChord();
  };

  // Sample accumulation during CAPTURING
  useEffect(() => {
    if (!isOpen || step !== 'CAPTURING') return;

    if (currentLandmarks && currentLandmarks.length >= 15) {
      setSamples(prev => [...prev, currentLandmarks]);
    }

    // Capture ~30 frames (around 1.5 seconds)
    if (samples.length >= 30) {
      computeBaseline();
    }
  }, [isOpen, step, currentLandmarks, samples.length]);

  if (!isOpen) return null;

  const handleSaveAndClose = () => {
    if (calculatedBaseline) {
      onSaveCalibration(calculatedBaseline);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Posture Baseline Calibration</h3>
              <p className="text-xs text-slate-400">Personalize AI angle thresholds to your workstation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on Step */}
        <div className="py-6">
          {step === 'INTRO' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                  How to calibrate:
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Sit comfortably upright in your normal desk working posture.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Keep your head, shoulders, and upper chest clearly in camera view.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Look naturally at your monitor while the 3-second sample captures.</span>
                  </div>
                </div>
              </div>

              {/* Camera Presence check */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-xs text-slate-300">Camera Framing Status:</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  isPersonDetected 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {isPersonDetected ? '● Person Detected & Ready' : '○ Align yourself in camera'}
                </span>
              </div>

              <button
                disabled={!isPersonDetected}
                onClick={() => setStep('COUNTDOWN')}
                className="w-full py-3.5 px-6 rounded-2xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold text-sm shadow-lg glow-teal transition-all flex items-center justify-center gap-2"
              >
                <Target className="w-4 h-4" />
                <span>Begin 3-Second Calibration</span>
              </button>
            </div>
          )}

          {step === 'COUNTDOWN' && (
            <div className="py-10 flex flex-col items-center justify-center space-y-4">
              <span className="text-7xl font-extrabold text-teal-400 font-mono animate-pulse">
                {countdown}
              </span>
              <p className="text-sm text-slate-300 font-medium">Sit in your natural comfortable upright position...</p>
            </div>
          )}

          {step === 'CAPTURING' && (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <div className="w-14 h-14 rounded-full border-4 border-teal-500/20 border-t-teal-400 animate-spin" />
              <p className="text-sm font-semibold text-white">Analyzing 3D Postural Vectors ({samples.length}/30)...</p>
              <p className="text-xs text-slate-400">Keep still while baseline is calculated</p>
            </div>
          )}

          {step === 'SUCCESS' && calculatedBaseline && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-200">
                <Sparkles className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-sm">Calibration Complete!</h4>
                  <p className="text-xs text-teal-300/80">
                    Your baseline angles have been personalized. Future posture scores will be relative to this neutral reference.
                  </p>
                </div>
              </div>

              {/* Calculated Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Baseline Head Pitch</span>
                  <span className="text-base font-bold text-white font-mono">{calculatedBaseline.baselineForwardHead}°</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Baseline Shoulder Slope</span>
                  <span className="text-base font-bold text-white font-mono">{calculatedBaseline.baselineShoulderSlope}°</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Baseline Torso Lean</span>
                  <span className="text-base font-bold text-white font-mono">{calculatedBaseline.baselineTorsoLean}°</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Nose-Shoulder Delta</span>
                  <span className="text-base font-bold text-white font-mono">{calculatedBaseline.baselineNoseToShoulderDist}</span>
                </div>
              </div>

              <button
                onClick={handleSaveAndClose}
                className="w-full py-3.5 px-6 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg glow-teal transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Baseline & Apply</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
