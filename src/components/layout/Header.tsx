import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Target, 
  ShieldCheck, 
  Menu, 
  Compass, 
  Video, 
  Sliders,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { TabId } from './Sidebar';
import { AppSettings, PostureState } from '../../types';

interface Props {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  settings: AppSettings;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
  postureState: PostureState;
  onOpenCalibration: () => void;
  isCameraActive: boolean;
  onToggleCamera: () => void;
}

export const Header: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  settings,
  onUpdateSettings,
  postureState,
  onOpenCalibration,
  isCameraActive,
  onToggleCamera
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: TabId; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'monitor', label: 'Live Monitor' },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'exercises', label: 'Exercises' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'history', label: 'History' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Mobile Title & Menu Toggle */}
      <div className="flex items-center gap-2.5 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="SitSense" className="w-7 h-7 object-contain rounded-lg" />
          <span className="font-extrabold text-white text-base tracking-tight">SitSense</span>
        </div>
      </div>

      {/* Desktop Subtitle / Breadcrumb */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
          <Lock className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-slate-400">Privacy Status:</span>
          <span className="text-teal-300 font-semibold">100% Local Inference</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Camera Toggle Button */}
        <button
          onClick={onToggleCamera}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isCameraActive
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
          }`}
        >
          <Video className="w-4 h-4" />
          <span className="hidden sm:inline">{isCameraActive ? 'Camera ON' : 'Start Camera'}</span>
        </button>

        {/* Focus Mode Toggle */}
        <button
          onClick={() => onUpdateSettings({ focusMode: !settings.focusMode })}
          title={settings.focusMode ? 'Focus Mode Active (Non-critical alerts muted)' : 'Enable Focus Mode'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            settings.focusMode
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Focus</span>
        </button>

        {/* Demo Mode Toggle Button */}
        <button
          onClick={() => onUpdateSettings({ demoMode: !settings.demoMode })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            settings.demoMode
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 glow-amber'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Demo Mode</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title={settings.soundEnabled ? 'Mute Chimes' : 'Unmute Chimes'}
        >
          {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-800 p-4 space-y-2 md:hidden animate-fade-in shadow-2xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              onOpenCalibration();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 text-teal-400 font-semibold text-sm"
          >
            <Compass className="w-4 h-4" />
            <span>Calibrate Posture</span>
          </button>
        </div>
      )}
    </header>
  );
};
