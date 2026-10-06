import React, { useState } from 'react';
import { Terminal, Cpu, Activity, ShieldAlert, Sparkles, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { LiveCVMetrics, PostureState } from '../../types';
import { ScoredCandidate } from '../../engine/recommendationEngine';

interface Props {
  metrics: LiveCVMetrics;
  candidates: ScoredCandidate[];
  showSkeleton: boolean;
  onToggleSkeleton: (val: boolean) => void;
  showBoundingBox: boolean;
  onToggleBoundingBox: (val: boolean) => void;
}

export const DeveloperPanel: React.FC<Props> = ({
  metrics,
  candidates,
  showSkeleton,
  onToggleSkeleton,
  showBoundingBox,
  onToggleBoundingBox
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden text-xs">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/90 hover:bg-slate-850 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-teal-400" />
          <span className="font-bold text-white font-mono uppercase tracking-wider">
            CV Pipeline & Algorithmic Debug Console
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
            {metrics.inferenceFps} FPS
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-5 border-t border-slate-800 space-y-5 bg-slate-950/60 font-mono">
          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-4 pb-3 border-b border-slate-800/80">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
              <input
                type="checkbox"
                checked={showSkeleton}
                onChange={(e) => onToggleSkeleton(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0"
              />
              <span>Render 33-Landmark Skeleton</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
              <input
                type="checkbox"
                checked={showBoundingBox}
                onChange={(e) => onToggleBoundingBox(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0"
              />
              <span>Render Body Bounding Frame</span>
            </label>
          </div>

          {/* Model & Vector Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Presence & Liveness */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase">Liveness Confidence</span>
              <span className="text-base font-bold text-teal-300">
                {Math.round(metrics.liveness.confidence * 100)}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Micro-jitter: {metrics.liveness.microJitterScore}
              </span>
            </div>

            {/* Posture Forward Head */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase">Forward Head Pitch</span>
              <span className={`text-base font-bold ${metrics.posture.rawForwardHeadDelta > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {metrics.posture.forwardHeadAngle}°
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Δ from baseline: +{metrics.posture.rawForwardHeadDelta}°
              </span>
            </div>

            {/* Shoulder Tilt */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase">Shoulder Inclination</span>
              <span className={`text-base font-bold ${metrics.posture.rawShoulderDelta > 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {metrics.posture.shoulderSlopeAngle}°
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Head Roll: {metrics.posture.headTiltAngle}°
              </span>
            </div>

            {/* Slouch Compression */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase">Slouch / Kyphosis</span>
              <span className={`text-base font-bold ${metrics.posture.slouchScore > 0.35 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {Math.round(metrics.posture.slouchScore * 100)}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Torso Lean: {metrics.posture.torsoLeanAngle}°
              </span>
            </div>
          </div>

          {/* Temporal Buffer & Performance Readouts */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-slate-300">
            <div>
              <span className="text-slate-400">Movement Score:</span>{' '}
              <span className="font-bold text-white">{metrics.movement.score}</span> ({metrics.movement.state})
            </div>
            <div>
              <span className="text-slate-400">Stationary Elapsed:</span>{' '}
              <span className="font-bold text-amber-400">{metrics.movement.stationaryDurationSec}s</span>
            </div>
            <div>
              <span className="text-slate-400">Lighting Lux:</span>{' '}
              <span className="font-bold text-white">{metrics.cameraQuality.luminance}</span> ({metrics.cameraQuality.lightingState})
            </div>
            <div>
              <span className="text-slate-400">Calibration Status:</span>{' '}
              <span className={`font-bold ${metrics.posture.isCalibrated ? 'text-teal-400' : 'text-slate-400'}`}>
                {metrics.posture.isCalibrated ? 'CUSTOM BASELINE ACTIVE' : 'DEFAULT HEURISTIC'}
              </span>
            </div>
          </div>

          {/* Real-time Recommendation Score Matrix */}
          <div className="space-y-2">
            <span className="text-slate-400 text-[11px] uppercase font-bold block">
              Recommendation Matrix Candidates & Scoring Breakdown
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {candidates.length === 0 ? (
                <p className="text-slate-400 italic">No candidates exceeding recommendation activation threshold</p>
              ) : (
                candidates.slice(0, 6).map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{c.exercise.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300">
                          {c.exercise.category}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            c.urgency === 'HIGH'
                              ? 'bg-rose-500/20 text-rose-300'
                              : c.urgency === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {c.urgency}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{c.reasons.join(', ')}</p>
                    </div>

                    <div className="text-right font-mono shrink-0 pl-3">
                      <span className="text-teal-400 font-bold text-sm">{(c.score * 100).toFixed(0)}</span>
                      <span className="text-slate-400 text-[10px]"> / 100</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
