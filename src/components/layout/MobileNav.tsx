import React from 'react';
import { 
  LayoutDashboard, 
  Video, 
  Sparkles, 
  Dumbbell, 
  BarChart3, 
  Settings as SettingsIcon,
  Compass
} from 'lucide-react';
import { TabId } from './Sidebar';

interface Props {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isMonitoringActive: boolean;
  onOpenCalibration: () => void;
}

export const MobileNav: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  isMonitoringActive
}) => {
  const items: { id: TabId; label: string; icon: React.ReactNode; isLive?: boolean }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'monitor', label: 'Monitor', icon: <Video className="w-5 h-5" />, isLive: isMonitoringActive },
    { id: 'recommendations', label: 'Adaptive', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'exercises', label: 'Routines', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'analytics', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around select-none shadow-2xl pb-safe"
    >
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all ${
              isActive
                ? 'text-teal-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.isLive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-slate-950" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            {isActive && (
              <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-teal-400 shadow-sm" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
