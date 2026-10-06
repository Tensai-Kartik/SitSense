import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Clock, 
  Eye, 
  Sparkles, 
  Video, 
  Play, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Droplet, 
  UserCheck, 
  UserX, 
  Flame, 
  ArrowRight,
  HelpCircle,
  Coffee,
  RotateCcw,
  Volume2,
  Camera,
  Layers
} from 'lucide-react';
import { ExerciseItem, LiveCVMetrics, PostureState, Recommendation, SessionMetrics } from '../types';
import { EXERCISE_LIBRARY } from '../data/exercises';
import { HydrationWidget } from '../components/notifications/HydrationWidget';

interface Props {
  metrics: LiveCVMetrics;
  session: SessionMetrics;
  recommendation: Recommendation | null;
  onStartExercise: (exercise: ExerciseItem) => void;
  onSnoozeRecommendation: (mins?: number) => void;
  onDismissRecommendation: (id: string) => void;
  onOpenCalibration: () => void;
  onNavigateToMonitor: () => void;
  onNavigateToExercises: () => void;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  isDemoMode: boolean;
  onLogHydration: () => void;
}

export const Dashboard: React.FC<Props> = ({
  metrics,
  session,
  recommendation,
  onStartExercise,
  onSnoozeRecommendation,
  onDismissRecommendation,
  onOpenCalibration,
  onNavigateToMonitor,
  onNavigateToExercises,
  isCameraActive,
  onToggleCamera,
  isDemoMode,
  onLogHydration
}) => {
  // Format seconds to HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentExercise = recommendation 
    ? EXERCISE_LIBRARY.find(e => e.id === recommendation.exerciseId) 
    : null;

  const stationaryMins = Math.floor(metrics.movement.stationaryDurationSec / 60);
  const screenMins = Math.floor(session.continuousScreenSec / 60);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-teal-400 font-bold">
            SitSense AI Workstation Intelligence
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            {getGreeting()}, <span className="text-slate-400 font-normal">Ergonomics Active</span>
          </h2>
        </div>

        {/* Action badges */}
        <div className="flex items-center gap-3">
          {isDemoMode && (
            <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Mode Active</span>
            </span>
          )}

          <button
            onClick={onToggleCamera}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md ${
              isCameraActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 glow-teal hover:scale-105'
            }`}
          >
            <Video className={`w-4 h-4 ${isCameraActive ? 'text-emerald-400' : 'fill-slate-950'}`} />
            <span>{isCameraActive ? 'Camera Live' : 'Start Camera Stream'}</span>
          </button>
        </div>
      </div>

      {/* Camera Off Quick Prompt Banner if camera is not active and not in demo mode */}
      {!isCameraActive && !isDemoMode && (
        <div className="rounded-3xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 border-2 border-teal-500/30 p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Camera is on Standby</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Enable camera permission to start real-time posture tracking, movement scoring, and break detection. Processed 100% locally.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onToggleCamera}
              className="py-2.5 px-5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md glow-teal transition-all"
            >
              Start Camera
            </button>
            <button
              onClick={onNavigateToMonitor}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
            >
              Open Live Monitor
            </button>
          </div>
        </div>
      )}

      {/* Hero Work Session Intelligence Card */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 md:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Session Clock */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isCameraActive || isDemoMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                ACTIVE WORKSTATION SESSION
              </span>
            </div>

            <div className="font-mono text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter">
              {formatTime(session.workDurationSec)}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300 flex items-center gap-1.5">
                {metrics.presence === 'DETECTED' ? (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <UserX className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>
                  {metrics.presence === 'DETECTED'
                    ? 'User In Frame'
                    : metrics.presence === 'MULTIPLE'
                    ? 'Multiple People Detected'
                    : 'User Away / Standby'}
                </span>
              </span>

              <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Zero-Upload Local AI</span>
              </span>
            </div>
          </div>

          {/* Right Live Real-Time Signals Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Posture */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Posture State</span>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    metrics.postureState === 'GOOD'
                      ? 'bg-emerald-400'
                      : metrics.postureState === 'ATTENTION'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                />
                <span className="font-bold text-white text-base">{metrics.postureState}</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Head: {metrics.posture.forwardHeadAngle}° | Slouch: {Math.round(metrics.posture.slouchScore * 100)}%
              </p>
            </div>

            {/* Movement */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Movement</span>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    metrics.movement.state === 'ACTIVE'
                      ? 'bg-emerald-400'
                      : metrics.movement.state === 'LOW'
                      ? 'bg-amber-400'
                      : 'bg-orange-500'
                  }`}
                />
                <span className="font-bold text-white text-base">{metrics.movement.state}</span>
              </div>
              <p className="text-[10px] text-slate-400">Activity Score: {metrics.movement.score}</p>
            </div>

            {/* Stationary */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Stationary Sitting</span>
              <div className="flex items-center gap-2 pt-1">
                <span className={`font-mono text-xl font-bold ${stationaryMins >= 30 ? 'text-amber-400' : 'text-white'}`}>
                  {stationaryMins} min
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Threshold: 30 min</p>
            </div>

            {/* Screen Exposure */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Screen Exposure</span>
              <div className="flex items-center gap-2 pt-1">
                <span className={`font-mono text-xl font-bold ${screenMins >= 40 ? 'text-cyan-400' : 'text-white'}`}>
                  {screenMins} min
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Continuous gaze load</p>
            </div>

            {/* Breaks Status */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Break Status</span>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`font-bold text-sm ${
                    stationaryMins >= 30 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {stationaryMins >= 30 ? 'INTERVENTION DUE' : 'OPTIMAL'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{session.breaksCount} breaks taken today</p>
            </div>

            {/* Liveness / FPS */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Inference</span>
              <div className="flex items-center gap-2 pt-1">
                <span className="font-mono text-lg font-bold text-teal-400">
                  {metrics.inferenceFps} FPS
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Confidence: {Math.round(metrics.liveness.confidence * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Hydration Tracker Widget */}
      <HydrationWidget
        hydrationCount={session.hydrationConfirmedCount}
        onLogHydration={onLogHydration}
        targetGlasses={8}
        nextReminderMin={45}
      />

      {/* Prominent Contextual Recommendation Section */}
      {recommendation && currentExercise ? (
        <div className="relative rounded-3xl bg-slate-900/90 border-2 border-teal-500/50 p-6 md:p-8 shadow-2xl overflow-hidden animate-slide-up glow-teal">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-extrabold text-xs uppercase tracking-wider border border-teal-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>INTELLIGENT INTERVENTION RECOMMENDED</span>
                </span>
                <span className="text-xs font-mono text-slate-400 font-semibold">
                  Match Score: {Math.round(recommendation.score * 100)}%
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {recommendation.title}
                </h3>
                <p className="text-sm text-teal-200/90 font-medium mt-1">
                  Target: {recommendation.targetArea} • Duration: {recommendation.durationSec} seconds
                </p>
              </div>

              {/* Explainability Block */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <HelpCircle className="w-4 h-4 text-teal-400" />
                  <span>Why is this recommended right now?</span>
                </div>
                <div className="space-y-1 pl-6">
                  {recommendation.detailedWhy.map((reason, idx) => (
                    <p key={idx} className="text-xs text-slate-400 leading-relaxed list-disc">
                      • {reason}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 justify-center">
              <button
                onClick={() => onStartExercise(currentExercise)}
                className="flex items-center justify-center gap-2.5 py-4 px-8 rounded-2xl bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl transition-all hover:scale-105 glow-teal"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start {recommendation.durationSec}s Reset</span>
              </button>

              <button
                onClick={() => onSnoozeRecommendation(10)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all text-center"
              >
                Snooze 10m
              </button>

              <button
                onClick={() => onDismissRecommendation(recommendation.exerciseId)}
                className="text-xs text-slate-400 hover:text-slate-300 py-1 text-center transition-colors"
              >
                Dismiss Recommendation
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Optimal State Card when no critical recommendation is pending */
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Ergonomic Posture Optimal</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Your posture angles are within healthy tolerances and stationary limits are balanced.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToExercises}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all shrink-0"
          >
            <span>Browse Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Breaks Completed</span>
            <Coffee className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{session.breaksCount}</p>
          <span className="text-[10px] text-slate-400 block">Away periods logged</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Posture Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{session.postureWarningsCount}</p>
          <span className="text-[10px] text-slate-400 block">Sustained deviations</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Resets Finished</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{session.exercisesCompletedCount}</p>
          <span className="text-[10px] text-slate-400 block">Micro-stretches & mobility</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Hydration Logged</span>
            <Droplet className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{session.hydrationConfirmedCount}</p>
          <span className="text-[10px] text-slate-400 block">Glasses logged</span>
        </div>
      </div>

      {/* Quick Exercise Carousel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Targeted Posture Resets</h3>
            <p className="text-xs text-slate-400">Quick 30–60 second routines for your workstation</p>
          </div>
          <button
            onClick={onNavigateToExercises}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            <span>View All ({EXERCISE_LIBRARY.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXERCISE_LIBRARY.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                    {item.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-teal-300 font-mono font-bold">
                    {item.durationSec}s
                  </span>
                </div>
                <h4 className="font-bold text-white text-base group-hover:text-teal-300 transition-colors">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
              </div>

              <button
                onClick={() => onStartExercise(item)}
                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Exercise</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
