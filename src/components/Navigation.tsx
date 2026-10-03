import React from 'react';
import { Home, Wand2, Fingerprint, Shirt, AlertCircle, BookOpen, ShieldAlert } from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isAdmin?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab, isAdmin }) => {
  const tabs: Array<{ id: TabType; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'home', label: 'امروز', icon: Home },
    { id: 'make-it-mine', label: 'نسخه من', icon: Wand2 },
    { id: 'dna', label: 'DNA استایل', icon: Fingerprint },
    { id: 'closet', label: 'کمد من', icon: Shirt },
    { id: 'sos', label: 'حل بحران', icon: AlertCircle },
    { id: 'wisdom', label: 'مدرسه', icon: BookOpen },
    ...(isAdmin ? [{ id: 'admin' as TabType, label: 'مدیریت', icon: ShieldAlert }] : []),
  ];

  const handleTabClick = (tabId: TabType) => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    onSelectTab(tabId);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950/90 backdrop-blur-xl border-t border-white/[0.08] px-2 pt-2 max-w-md mx-auto select-none shadow-[0_-10px_35px_rgba(0,0,0,0.9)]"
      style={{
        paddingBottom: 'max(0.65rem, env(safe-area-inset-bottom, 0.65rem))',
        touchAction: 'manipulation',
      }}
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 min-w-[50px] min-h-[44px] rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-rose-200 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-b from-rose-500/25 to-rose-950/50 text-rose-300 ring-1 ring-rose-500/40 shadow-sm'
                    : 'text-stone-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight transition-colors ${isActive ? 'text-rose-200 font-bold' : 'text-stone-400 font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185] mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
