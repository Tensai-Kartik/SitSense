import React from 'react';
import { 
  Video, 
  VideoOff, 
  ShieldCheck, 
  Compass, 
  AlertTriangle, 
  Sliders, 
  Layers, 
  Activity, 
  Sun, 
  UserCheck, 
  Users, 
  Sparkles,
  Info
} from 'lucide-react';
import { LiveCVMetrics, PostureState } from '../types';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  cameraError: string | null;
  metrics: LiveCVMetrics;
  multiPersonWarning: boolean;
  onOpenCalibration: () => void;
  showSkeleton: boolean;
  onToggleSkeleton: (val: boolean) => void;
  showBoundingBox: boolean;
  onToggleBoundingBox: (val: boolean) => void;
}

export const LiveMonitor: React.FC<Props> = ({
  videoRef,
  canvasRef,
  isCameraActive,
  onToggleCamera,
  cameraError,
  metrics,
  multiPersonWarning,
  onOpenCalibration,
  showSkeleton,
  onToggleSkeleton,
  showBoundingBox,
  onToggleBoundingBox
}) => {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-teal-400 font-bold">
            Real-Time Computer Vision Console
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            Live Posture & Landmark Monitor
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCalibration}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-teal-300 transition-all shadow-md"
          >
            <Compass className="w-4 h-4 text-teal-400" />
            <span>Calibrate Baseline</span>
          </button>

          <button
            onClick={onToggleCamera}
            className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-xs font-bold shadow-lg transition-all ${
              isCameraActive
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 glow-teal'
            }`}
          >
            {isCameraActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4 fill-slate-950" />}
            <span>{isCameraActive ? 'Stop Stream' : 'Start Camera'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Person Alert Banner */}
      {multiPersonWarning && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-center gap-3 animate-pulse">
          <Users className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Multiple People Detected in Camera Frame</h4>
            <p className="text-xs text-amber-300/80">
              For accurate posture angles and ergonomics scoring, position yourself as the sole person in view.
            </p>
          </div>
        </div>
      )}

      {/* Camera Error Alert */}
      {cameraError && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Camera Stream Notice</h4>
            <p className="text-xs text-rose-300/80">{cameraError}</p>
          </div>
        </div>
      )}

      {/* Main Video / Canvas Feed Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
            {/* Raw Video element (Hidden or behind canvas) */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                isCameraActive ? 'opacity-90' : 'opacity-0'
              }`}
            />

            {/* Skeleton & Bounding Overlay Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none z-10"
            />

            {/* Offline / Placeholder Screen when camera is off */}
            {!isCameraActive && (
              <div className="relative z-20 flex flex-col items-center justify-center text-center p-8 space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 shadow-xl">
                  <Video className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Camera Standby</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Click "Start Camera" to initiate local MediaPipe pose tracking. All video frames are processed in-memory and never uploaded.
                  </p>
                </div>
                <button
                  onClick={onToggleCamera}
                  className="py-3 px-6 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg glow-teal transition-all"
                >
                  Start Live Camera
                </button>
              </div>
            )}

            {/* Live HUD Badges Overlay (Top Bar) */}
            {isCameraActive && (
              <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 text-xs text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="font-mono font-bold">REC LIVE</span>
                  <span className="text-slate-400">|</span>
                  <span className="font-mono text-teal-300">{metrics.inferenceFps} FPS</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 text-xs">
                  <span className="text-slate-400">Liveness:</span>
                  <span className="font-bold text-emerald-400">
                    {Math.round(metrics.liveness.confidence * 100)}% ({metrics.liveness.status})
                  </span>
                </div>
              </div>
            )}

            {/* Local Processing Guarantee Banner at bottom of video */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800/80 text-[11px] text-slate-300 pointer-events-auto">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="font-semibold text-white">LOCAL IN-BROWSER PROCESSING</span>
                <span className="hidden sm:inline text-slate-400">• Frames are analyzed in RAM and never stored</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={showSkeleton}
                    onChange={(e) => onToggleSkeleton(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-teal-400"
                  />
                  <span>Skeleton</span>
                </label>
              </div>
            </div>
          </div>

          {/* Lighting & Camera Diagnostics */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Lighting Environment:</span>
              <span className="font-bold text-white">
                {metrics.cameraQuality.lightingState} ({metrics.cameraQuality.luminance} Lux)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Framing Score:</span>
              <span className="font-bold text-teal-300">
                {Math.round(metrics.cameraQuality.framingScore * 100)}%
              </span>
            </div>

            {metrics.cameraQuality.warnings.length > 0 && (
              <span className="text-amber-400 font-medium w-full text-[11px]">
                ⚠️ {metrics.cameraQuality.warnings[0]}
              </span>
            )}
          </div>
        </div>

        {/* Right Metric Gauges Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Real-Time Posture Vectors</h3>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  metrics.postureState === 'GOOD'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : metrics.postureState === 'ATTENTION'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {metrics.postureState}
              </span>
            </div>

            {/* Forward Head Angle Gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Forward Head Angle</span>
                <span className="font-mono font-bold text-white">
                  {metrics.posture.forwardHeadAngle}°
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    metrics.posture.rawForwardHeadDelta > 15
                      ? 'bg-rose-500'
                      : metrics.posture.rawForwardHeadDelta > 8
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, (metrics.posture.forwardHeadAngle / 45) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400">
                Baseline delta: +{metrics.posture.rawForwardHeadDelta}°
              </span>
            </div>

            {/* Shoulder Slope Gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Shoulder Alignment</span>
                <span className="font-mono font-bold text-white">
                  {metrics.posture.shoulderSlopeAngle}°
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    metrics.posture.rawShoulderDelta > 6
                      ? 'bg-rose-500'
                      : metrics.posture.rawShoulderDelta > 3
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, (metrics.posture.shoulderSlopeAngle / 20) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400">
                Head roll: {metrics.posture.headTiltAngle}°
              </span>
            </div>

            {/* Slouch Index */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Slouch / Kyphosis Compression</span>
                <span className="font-mono font-bold text-white">
                  {Math.round(metrics.posture.slouchScore * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    metrics.posture.slouchScore > 0.45
                      ? 'bg-rose-500'
                      : metrics.posture.slouchScore > 0.25
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, metrics.posture.slouchScore * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400">
                Torso lean: {metrics.posture.torsoLeanAngle}°
              </span>
            </div>

            {/* Movement Metric */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Physical Movement Level</span>
                <span className="font-mono font-bold text-teal-300">
                  {metrics.movement.state} ({metrics.movement.score})
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, metrics.movement.score * 100)}%` }}
                />
              </div>
            </div>

            {/* Calibration Profile Info */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Posture Calibration:</span>
                <span className={`font-bold ${metrics.posture.isCalibrated ? 'text-teal-400' : 'text-slate-400'}`}>
                  {metrics.posture.isCalibrated ? 'Active' : 'Uncalibrated'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {metrics.posture.isCalibrated
                  ? 'Angles evaluated relative to your custom seated baseline.'
                  : 'Using default population ergonomic heuristics.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
