import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  ServerOff, 
  HardDrive, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  FileCheck,
  Cpu
} from 'lucide-react';
import { clearAllLocalDatabase } from '../storage/indexedDb';
import { resetAllStorage } from '../storage/localStorage';

export const PrivacyCenter: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleClearSession = () => {
    window.location.reload();
  };

  const handleClearHistory = async () => {
    await clearAllLocalDatabase();
    setStatusMessage('All IndexedDB session analytics and break logs permanently purged.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleResetSettings = () => {
    resetAllStorage();
    setStatusMessage('All configuration settings reset to default values.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-teal-400 font-bold">
          Zero-Knowledge Architecture
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
          Privacy & Data Security Center
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          SitSense is architected from the ground up as a 100% local, privacy-first computer-vision system.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Privacy Guarantees Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Camera Processing</span>
            <Cpu className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl font-extrabold text-teal-300 font-mono">LOCAL ONLY</p>
          <p className="text-[11px] text-slate-400">Processed in browser WebAssembly & GPU memory.</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Video Frame Storage</span>
            <EyeOff className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl font-extrabold text-emerald-400 font-mono">OFF (0 BYTES)</p>
          <p className="text-[11px] text-slate-400">Camera frames are immediately discarded after vector calculation.</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Network Uploads</span>
            <ServerOff className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl font-extrabold text-emerald-400 font-mono">NONE / 0 KB</p>
          <p className="text-[11px] text-slate-400">Zero backend endpoints, zero external telemetry or cloud sync.</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Cloud Database</span>
            <HardDrive className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl font-extrabold text-white font-mono">NONE</p>
          <p className="text-[11px] text-slate-400">No PostgreSQL, MongoDB, Supabase, or external databases.</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Data Retention Expiry</span>
            <Lock className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl font-extrabold text-teal-300 font-mono">24 HOURS</p>
          <p className="text-[11px] text-slate-400">Local session logs auto-expire and are purged automatically.</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">AI Model Architecture</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl font-extrabold text-white font-mono">CLIENT ML</p>
          <p className="text-[11px] text-slate-400">MediaPipe PoseLandmarker running client-side with zero cloud LLMs.</p>
        </div>
      </div>

      {/* Manual Data Purge Controls */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
        <h3 className="font-bold text-white text-base">Local Data Management & Erasure</h3>
        <p className="text-xs text-slate-400">
          You maintain 100% control over all data stored on your computer. Use the buttons below to instantly wipe data.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={handleClearSession}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 text-left space-y-1 transition-all"
          >
            <span className="font-bold text-white text-xs block">Restart Current Session</span>
            <span className="text-[11px] text-slate-400 block">Resets active work timers and in-memory pose queues.</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-left space-y-1 transition-all"
          >
            <span className="font-bold text-amber-300 text-xs block">Wipe IndexedDB Logs</span>
            <span className="text-[11px] text-slate-400 block">Permanently deletes all break and posture history entries.</span>
          </button>

          <button
            onClick={handleResetSettings}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 text-left space-y-1 transition-all"
          >
            <span className="font-bold text-rose-300 text-xs block">Reset App Settings</span>
            <span className="text-[11px] text-slate-400 block">Restores default reminder intervals and preferences.</span>
          </button>
        </div>
      </div>

      {/* Technical Architecture Explanation */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <FileCheck className="w-5 h-5 text-teal-400" />
          <span>Local-First Computer Vision Security Specification</span>
        </div>
        <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
          <p>
            1. <strong>In-RAM Frame Lifecycle:</strong> Video frames from <code>navigator.mediaDevices.getUserMedia()</code> are drawn to an offscreen buffer, passed to the MediaPipe WebAssembly module for landmark inference, and garbage-collected immediately. No canvas is converted to Blob, JPEG, or Base64.
          </p>
          <p>
            2. <strong>Vector-Only Storage:</strong> Only lightweight scalar numerical values (e.g. head angle: 14°, stationary time: 1800s) are logged to IndexedDB for your personal session analytics.
          </p>
          <p>
            3. <strong>Network Airgap:</strong> No network socket, REST endpoint, WebSocket, or third-party tracking pixel is initialized by the monitoring engine.
          </p>
        </div>
      </div>
    </div>
  );
};
