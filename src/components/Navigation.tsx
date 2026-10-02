import React from 'react';
import { Home, Wand2, Fingerprint, Shirt, AlertCircle, BookOpen } from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const tabs: Array<{ id: TabType; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'home', label: 'امروز', icon: Home },
    { id: 'make-it-mine', label: 'نسخه من', icon: Wand2 },
    { id: 'dna', label: 'DNA استایل', icon: Fingerprint },
    { id: 'closet', label: 'کمد من', icon: Shirt },
    { id: 'sos', label: 'حل بحران', icon: AlertCircle },
    { id: 'wisdom', label: 'مدرسه', icon: BookOpen },
  ];

  const handleTabClick = (tabId: TabType) => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    onSelectTab(tabId);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-md border-t border-stone-800/80 px-2 pt-1.5 max-w-md mx-auto select-none"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))',
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
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-rose-300 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className={`p-1 rounded-lg transition-transform ${isActive ? 'scale-110 bg-rose-950/40 text-rose-300' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'text-rose-300' : 'text-stone-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
