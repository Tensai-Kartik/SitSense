import React, { useEffect, useState } from 'react';
import { 
  History as HistoryIcon, 
  Calendar, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Clock, 
  Coffee, 
  Activity, 
  CheckCircle2, 
  FileText
} from 'lucide-react';
import { BreakEvent, HistoricalSessionRecord } from '../types';
import { getBreakEvents, getHistoricalSessions, clearAllLocalDatabase } from '../storage/indexedDb';

export const History: React.FC = () => {
  const [breaks, setBreaks] = useState<BreakEvent[]>([]);
  const [sessions, setSessions] = useState<HistoricalSessionRecord[]>([]);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    getBreakEvents(oneDayAgo).then(res => setBreaks(res.reverse()));
    getHistoricalSessions().then(res => setSessions(res.reverse()));
  };

  const handleExportJSON = () => {
    const exportData = {
      app: 'SitSense',
      exportedAt: new Date().toISOString(),
      privacy: '100% Local Export',
      breaks,
      sessions
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sitsense_session_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice('Session logs downloaded as JSON successfully.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleClearLogs = async () => {
    if (window.confirm('Clear all local session logs and history from IndexedDB?')) {
      await clearAllLocalDatabase();
      setBreaks([]);
      setSessions([]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-teal-400 font-bold">
            Audit & Historical Timeline
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            Local Session History Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Temporary local session records. Retained for 24 hours then automatically deleted.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all glow-teal"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700 text-xs font-semibold text-slate-300 transition-all"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Purge Logs</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Auto Expiration Guarantee */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            <strong className="text-white">Auto-Expiry Policy:</strong> All local posture and break logs older than 24 hours are permanently purged on browser launch.
          </span>
        </div>
        <span className="text-slate-400 shrink-0 font-mono text-[11px]">Storage: IndexedDB</span>
      </div>

      {/* Break Events History Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Coffee className="w-5 h-5 text-cyan-400" />
          <span>Recorded Break Events</span>
        </h3>

        {breaks.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-slate-300 font-semibold text-sm">No Breaks Recorded Yet Today</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Breaks are automatically detected whenever you step away from your workstation for &gt; 30 seconds.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {breaks.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm block">
                      {b.quality === 'MICRO' ? 'Micro Rest Break' : b.quality === 'SHORT' ? 'Short Walk Break' : 'Extended Away Break'}
                    </span>
                    <span className="text-slate-400">
                      {new Date(b.startTime).toLocaleTimeString()} – {new Date(b.endTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-teal-400 font-bold text-sm block">
                    {Math.floor(b.durationSec / 60)}m {b.durationSec % 60}s
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">{b.quality}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
