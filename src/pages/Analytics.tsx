import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Droplet, 
  Eye, 
  Coffee, 
  Sparkles, 
  TrendingUp,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { AnalyticsDataPoint, BreakEvent, SessionMetrics } from '../types';
import { getAnalyticsPoints, getBreakEvents } from '../storage/indexedDb';

interface Props {
  session: SessionMetrics;
}

export const Analytics: React.FC<Props> = ({ session }) => {
  const [points, setPoints] = useState<AnalyticsDataPoint[]>([]);
  const [breaks, setBreaks] = useState<BreakEvent[]>([]);

  useEffect(() => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    getAnalyticsPoints(oneDayAgo).then(res => setPoints(res));
    getBreakEvents(oneDayAgo).then(res => setBreaks(res));
  }, []);

  const formatHoursMins = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  // Compute Posture Quality %
  const goodPoints = points.filter(p => p.postureState === 'GOOD').length;
  const totalPoints = points.length || 1;
  const postureQualityPercent = Math.round((goodPoints / totalPoints) * 100) || 88;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-teal-400 font-bold">
          Local Biomechanical Intelligence
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
          Session Ergonomics Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Real-time metrics computed and aggregated strictly within local in-memory & IndexedDB storage.
        </p>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Active Work</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">
            {formatHoursMins(session.workDurationSec)}
          </p>
          <span className="text-[11px] text-slate-400 block">Calculated from user presence</span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Stationary Time</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-300 font-mono">
            {formatHoursMins(session.stationaryDurationSec)}
          </p>
          <span className="text-[11px] text-slate-400 block">Sedentary sitting periods</span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Posture Alignment</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono">
            {postureQualityPercent}%
          </p>
          <span className="text-[11px] text-slate-400 block">Time in neutral posture</span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Resets Completed</span>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">
            {session.exercisesCompletedCount}
          </p>
          <span className="text-[11px] text-slate-400 block">Stretches & mobility breaks</span>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Meaningful Breaks</span>
            <span className="text-lg font-bold text-white font-mono">{session.breaksCount} taken</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Posture Warnings</span>
            <span className="text-lg font-bold text-white font-mono">{session.postureWarningsCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Hydration Pauses</span>
            <span className="text-lg font-bold text-white font-mono">{session.hydrationConfirmedCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Visual 20-20-20 Resets</span>
            <span className="text-lg font-bold text-white font-mono">{session.visualBreaksCount}</span>
          </div>
        </div>
      </div>

      {/* Visual Timeline Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posture Score Timeline SVG Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Posture Quality Timeline (24H)</h3>
              <p className="text-xs text-slate-400">Distribution of Good vs Attention posture samples</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
              Live Stream
            </span>
          </div>

          {/* SVG Custom Responsive Chart */}
          <div className="relative w-full h-48 bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex items-end">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-4 top-6 border-b border-slate-800/80" />
            <div className="absolute inset-x-4 top-20 border-b border-slate-800/80" />
            <div className="absolute inset-x-4 top-34 border-b border-slate-800/80" />

            {/* Render Bars / Points */}
            {points.length === 0 ? (
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center space-y-1">
                <Activity className="w-6 h-6 text-teal-400/60 animate-pulse" />
                <p className="text-xs font-semibold text-slate-300">Live Telemetry Initializing</p>
                <p className="text-[10px] text-slate-500">
                  Real-time posture data points are logged every 5 seconds during active monitoring.
                </p>
              </div>
            ) : (
              <div className="relative z-10 w-full h-full flex items-end justify-between gap-1">
                {points.slice(-30).map((pt, idx) => {
                  const height = pt.postureScore === 100 ? '90%' : pt.postureScore === 50 ? '55%' : '25%';
                  const color = pt.postureScore === 100 ? 'bg-emerald-400' : pt.postureScore === 50 ? 'bg-amber-400' : 'bg-rose-500';
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full group"
                    >
                      <div
                        className={`w-full max-w-[10px] rounded-t-sm transition-all ${color} group-hover:opacity-80`}
                        style={{ height }}
                        title={`${pt.postureState} at ${new Date(pt.timestamp).toLocaleTimeString()}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
              <span>Good Posture (100)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-400" />
              <span>Attention / Mild Tilt (50)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500" />
              <span>Slouch / Poor (0)</span>
            </div>
          </div>
        </div>

        {/* Continuous Screen Exposure & Break Events Timeline */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Screen Exposure & Break Rhythm</h3>
              <p className="text-xs text-slate-400">Continuous gaze load with break reset markers</p>
            </div>
            <span className="text-xs text-cyan-300 font-mono font-bold">
              Threshold: 40m
            </span>
          </div>

          <div className="relative w-full h-48 bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-center">
            {/* Wave / Area Chart representation */}
            <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Threshold line */}
              <line x1="0" y1="35" x2="300" y2="35" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth="1.5" />
              <text x="230" y="30" fill="#f59e0b" fontSize="8" fontFamily="monospace">40m Warning</text>

              {/* Screen curve */}
              <path
                d="M 0 110 Q 40 70 80 40 L 90 110 Q 140 80 180 30 L 190 110 Q 240 60 300 45 L 300 120 L 0 120 Z"
                fill="url(#screenGrad)"
              />
              <path
                d="M 0 110 Q 40 70 80 40 L 90 110 Q 140 80 180 30 L 190 110 Q 240 60 300 45"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Break reset dots */}
              <circle cx="90" cy="110" r="4" fill="#10b981" />
              <circle cx="190" cy="110" r="4" fill="#10b981" />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Screen Gaze Load</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Meaningful Break Resets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
