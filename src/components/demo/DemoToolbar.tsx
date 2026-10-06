import React from 'react';
import { Play, Sparkles, Sliders, AlertTriangle, Eye, Activity, UserX, UserCheck, RefreshCw } from 'lucide-react';
import { HumanPresenceState, MovementState, PostureState } from '../../types';

interface DemoControllerProps {
  isDemoActive: boolean;
  onToggleDemo: (active: boolean) => void;
  demoPerson: HumanPresenceState;
  onSetDemoPerson: (p: HumanPresenceState) => void;
  demoPosture: PostureState;
  onSetDemoPosture: (p: PostureState) => void;
  demoMovement: MovementState;
  onSetDemoMovement: (m: MovementState) => void;
  demoStationaryMin: number;
  onSetDemoStationaryMin: (min: number) => void;
  demoScreenMin: number;
  onSetDemoScreenMin: (min: number) => void;
  onApplyPreset: (preset: 'slouch_alert' | 'screen_strain' | 'healthy_flow' | 'user_break') => void;
}

export const DemoToolbar: React.FC<DemoControllerProps> = ({
  isDemoActive,
  onToggleDemo,
  demoPerson,
  onSetDemoPerson,
  demoPosture,
  onSetDemoPosture,
  demoMovement,
  onSetDemoMovement,
  demoStationaryMin,
  onSetDemoStationaryMin,
  demoScreenMin,
  onSetDemoScreenMin,
  onApplyPreset
}) => {
  if (!isDemoActive) {
    return (
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => onToggleDemo(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-lg hover:scale-105 transition-all glow-amber"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Demo Mode</span>
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Interactive demo mode simulation controls"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[460px] z-40 bg-slate-900/95 border-2 border-amber-500/50 rounded-3xl p-4 shadow-2xl backdrop-blur-xl animate-slide-up text-xs space-y-3.5"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold uppercase tracking-wider text-[10px] border border-amber-500/30">
            DEMO MODE ACTIVE
          </span>
          <span className="text-slate-400 font-medium">Interactive Evaluator Panel</span>
        </div>
        <button
          onClick={() => onToggleDemo(false)}
          className="text-slate-400 hover:text-white px-2 py-0.5 rounded-md hover:bg-slate-800 transition-colors"
        >
          Close
        </button>
      </div>

      {/* Quick Scenario Presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 block">Instant Scenarios:</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            onClick={() => onApplyPreset('slouch_alert')}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-amber-500/20 hover:border-amber-500/40 border border-slate-700/60 text-amber-300 font-medium transition-all text-center flex flex-col items-center gap-1"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">Slouch Alert</span>
          </button>
          <button
            onClick={() => onApplyPreset('screen_strain')}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-slate-700/60 text-cyan-300 font-medium transition-all text-center flex flex-col items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate">Eye Fatigue</span>
          </button>
          <button
            onClick={() => onApplyPreset('healthy_flow')}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-slate-700/60 text-emerald-300 font-medium transition-all text-center flex flex-col items-center gap-1"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Healthy Flow</span>
          </button>
          <button
            onClick={() => onApplyPreset('user_break')}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-violet-500/20 hover:border-violet-500/40 border border-slate-700/60 text-violet-300 font-medium transition-all text-center flex flex-col items-center gap-1"
          >
            <UserX className="w-3.5 h-3.5 text-violet-400" />
            <span className="truncate">User Away</span>
          </button>
        </div>
      </div>

      {/* Manual Sliders & Toggles */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
        {/* Person Presence */}
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
            Human Presence
          </label>
          <select
            value={demoPerson}
            onChange={(e) => onSetDemoPerson(e.target.value as HumanPresenceState)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-white font-medium focus:border-amber-500 outline-none"
          >
            <option value="DETECTED">1 Person (Detected)</option>
            <option value="AWAY">Away (Empty Desk)</option>
            <option value="MULTIPLE">Multiple People</option>
            <option value="UNCERTAIN">Uncertain / Low Conf</option>
          </select>
        </div>

        {/* Posture State */}
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
            Simulated Posture
          </label>
          <select
            value={demoPosture}
            onChange={(e) => onSetDemoPosture(e.target.value as PostureState)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-white font-medium focus:border-amber-500 outline-none"
          >
            <option value="GOOD">🟢 Good Posture</option>
            <option value="ATTENTION">🟡 Attention (Forward Head)</option>
            <option value="POOR">🔴 Poor Posture (Severe Slouch)</option>
          </select>
        </div>

        {/* Stationary Duration Slider */}
        <div className="col-span-2 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Stationary Duration:</span>
            <span className="font-mono font-bold text-amber-400">{demoStationaryMin} min</span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={demoStationaryMin}
            onChange={(e) => onSetDemoStationaryMin(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Screen Exposure Slider */}
        <div className="col-span-2 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Continuous Screen Exposure:</span>
            <span className="font-mono font-bold text-cyan-400">{demoScreenMin} min</span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            step="5"
            value={demoScreenMin}
            onChange={(e) => onSetDemoScreenMin(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>
    </aside>
  );
};
