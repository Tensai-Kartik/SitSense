import React from 'react';
import { 
  LayoutDashboard, 
  Video, 
  Sparkles, 
  Dumbbell, 
  BarChart3, 
  History as HistoryIcon, 
  Settings as SettingsIcon, 
  Activity
} from 'lucide-react';
import { PostureState } from '../../types';

export type TabId = 
  | 'dashboard' 
  | 'monitor' 
  | 'recommendations' 
  | 'exercises' 
  | 'analytics' 
  | 'history' 
  | 'settings';

interface Props {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isMonitoringActive?: boolean;
  postureState?: PostureState;
  onOpenCalibration?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  isMonitoringActive
}) => {
  const navItems: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'monitor', label: 'Live Monitor', icon: <Video className="w-5 h-5" />, badge: isMonitoringActive ? 'LIVE' : undefined },
    { id: 'recommendations', label: 'Recommendations', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'exercises', label: 'Exercises', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'analytics', label: 'Session Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'history', label: 'History Logs', icon: <HistoryIcon className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <aside
      aria-label="Application primary sidebar navigation"
      className="w-64 shrink-0 bg-slate-900/95 border-r border-slate-800/80 hidden md:flex flex-col h-screen sticky top-0 select-none overflow-hidden"
    >
      {/* Brand Header & Navigation */}
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-slate-950 font-extrabold shadow-lg glow-teal">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>SitSense</span>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Posture & Wellness Intelligence
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav aria-label="Main Navigation" className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-teal-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
