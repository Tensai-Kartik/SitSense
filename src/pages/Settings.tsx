import React, { useEffect, useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Video, 
  Sliders, 
  Volume2, 
  Droplet, 
  Dumbbell, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Compass,
  Sparkles,
  Info
} from 'lucide-react';
import { AppSettings, CalibrationBaseline } from '../types';
import { soundManager } from '../engine/audioEngine';
import { resetAllStorage, clearCalibration } from '../storage/localStorage';
import { clearAllLocalDatabase } from '../storage/indexedDb';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
  calibration: CalibrationBaseline;
  onOpenCalibration: () => void;
}

export const Settings: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  calibration,
  onOpenCalibration
}) => {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setCameras(videoDevices);
      }).catch(() => {});
    }
  }, []);

  const handleTestChime = () => {
    soundManager.playReminderChime();
  };

  const handleTestDroplet = () => {
    soundManager.playHydrationDroplet();
  };

  const handleResetCalibration = () => {
    if (window.confirm('Reset posture baseline calibration back to default heuristics?')) {
      clearCalibration();
      window.location.reload();
    }
  };

  const handleNuclearReset = async () => {
    if (window.confirm('Reset all settings, calibration, and local analytics history? This cannot be undone.')) {
      resetAllStorage();
      await clearAllLocalDatabase();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-teal-400 font-bold">
          System Preferences
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
          Settings & Workstation Config
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize computer-vision sensitivity, reminder pacing, audio alerts, and privacy thresholds.
        </p>
      </div>

      {/* Camera & CV Pipeline Settings */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <Video className="w-5 h-5 text-teal-400" />
          <h3 className="font-bold text-white text-base">Camera & Computer Vision Pipeline</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Camera Device Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold block">Active Webcam Device</label>
            <select
              value={settings.selectedCameraId}
              onChange={(e) => onUpdateSettings({ selectedCameraId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-teal-500 outline-none"
            >
              <option value="">Default Web Camera</option>
              {cameras.map((c, i) => (
                <option key={c.deviceId || i} value={c.deviceId}>
                  {c.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
          </div>

          {/* Inference Throttle FPS */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-slate-400 font-semibold">Inference FPS Throttle</label>
              <span className="font-mono font-bold text-teal-300">{settings.inferenceThrottleFps} FPS</span>
            </div>
            <input
              type="range"
              min="8"
              max="24"
              step="2"
              value={settings.inferenceThrottleFps}
              onChange={(e) => onUpdateSettings({ inferenceThrottleFps: Number(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            <span className="text-[10px] text-slate-400">Controls CPU/GPU utilization for laptop battery efficiency.</span>
          </div>
        </div>
      </div>

      {/* Monitoring & Intervention Thresholds */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-base">Ergonomic Thresholds & Timers</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* Stationary Warning Threshold */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold block">
              Stationary Sitting Alert Threshold
            </label>
            <select
              value={settings.stationaryWarningThresholdMin}
              onChange={(e) => onUpdateSettings({ stationaryWarningThresholdMin: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-amber-400 outline-none"
            >
              <option value={20}>20 Minutes (Strict Mobility)</option>
              <option value={30}>30 Minutes (Recommended Standard)</option>
              <option value={45}>45 Minutes (Extended Focus)</option>
              <option value={60}>60 Minutes (Max Deep Work)</option>
            </select>
          </div>

          {/* Posture Warning Sustained Threshold */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold block">
              Posture Warning Debounce Time
            </label>
            <select
              value={settings.postureWarningThresholdSec}
              onChange={(e) => onUpdateSettings({ postureWarningThresholdSec: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-amber-400 outline-none"
            >
              <option value={10}>10 Seconds (Sensitive)</option>
              <option value={20}>20 Seconds (Balanced Standard)</option>
              <option value={30}>30 Seconds (Ignore Natural Fidgets)</option>
            </select>
          </div>

          {/* Visual Break Interval */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold block">
              Visual 20-20-20 Break Interval
            </label>
            <select
              value={settings.visualBreakIntervalMin}
              onChange={(e) => onUpdateSettings({ visualBreakIntervalMin: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-cyan-400 outline-none"
            >
              <option value={30}>Every 30 Minutes</option>
              <option value={40}>Every 40 Minutes (Standard)</option>
              <option value={50}>Every 50 Minutes</option>
            </select>
          </div>

          {/* Hydration Interval */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold block">
              Hydration Reminder Cadence
            </label>
            <select
              value={settings.hydrationIntervalMin}
              onChange={(e) => onUpdateSettings({ hydrationIntervalMin: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-cyan-400 outline-none"
            >
              <option value={30}>Every 30 Minutes</option>
              <option value={45}>Every 45 Minutes (Optimal)</option>
              <option value={60}>Every 60 Minutes</option>
              <option value={90}>Every 90 Minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audio & Exercise Preferences */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <Volume2 className="w-5 h-5 text-teal-400" />
          <h3 className="font-bold text-white text-base">Sound & Routine Preferences</h3>
        </div>

        <div className="space-y-4 text-xs">
          {/* Sound toggle & test */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div>
              <span className="font-bold text-white block">Synthetic Web Audio Chimes</span>
              <span className="text-slate-400">Gentle sound cues for timers and posture alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTestChime}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold"
              >
                Test Chime
              </button>
              <button
                onClick={handleTestDroplet}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold"
              >
                Test Water Drop
              </button>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-teal-500 ml-2"
              />
            </div>
          </div>

          {/* Seated Only preference */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div>
              <span className="font-bold text-white block">Seated-at-Desk Routines Only</span>
              <span className="text-slate-400">Filter out standing exercises when in tight office or cubicle setups</span>
            </div>
            <input
              type="checkbox"
              checked={settings.seatedOnlyMode}
              onChange={(e) => onUpdateSettings({ seatedOnlyMode: e.target.checked })}
              className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Posture Baseline Calibration Profile */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-white text-base">Posture Baseline Profile</h3>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            calibration.isCalibrated ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'
          }`}>
            {calibration.isCalibrated ? 'Custom Calibrated' : 'Default Preset'}
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Baseline calibration captures your natural upright angle at your specific chair and monitor height.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={onOpenCalibration}
            className="py-2.5 px-5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md glow-teal"
          >
            Recalibrate Now
          </button>
          {calibration.isCalibrated && (
            <button
              onClick={handleResetCalibration}
              className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Reset to Standard Baseline
            </button>
          )}
        </div>
      </div>

      {/* Nuclear Storage Reset */}
      <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-900/40 space-y-3">
        <h4 className="font-bold text-rose-300 text-sm flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Nuclear Local Data Reset</span>
        </h4>
        <p className="text-xs text-rose-200/70">
          Permanently deletes all localStorage preferences, custom calibration baseline vectors, and IndexedDB session records.
        </p>
        <button
          onClick={handleNuclearReset}
          className="py-2.5 px-5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-slate-950 font-bold text-xs border border-rose-500/30 transition-all"
        >
          Erase All Local Data & Restore Factory Defaults
        </button>
      </div>

      {/* Medical Disclaimer Card */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-300">Disclaimer:</strong> This application provides general workplace wellness suggestions based on estimated activity and posture signals. It is not a medical diagnostic or treatment system.
        </p>
      </div>
    </div>
  );
};
