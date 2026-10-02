import React, { useState } from 'react';
import { Sparkles, ShieldCheck, HeartHandshake, Smartphone, Monitor, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface TelegramHeaderProps {
  userFirstName?: string;
  isDesktopFrame: boolean;
  onToggleFrame: () => void;
  onOpenCoach: () => void;
  onOpenScanner: () => void;
  onOpenRoutine: (time: number) => void;
  onOpenMixer: () => void;
  onOpenTelegramSetup: () => void;
  savedLooksCount: number;
}

export const TelegramHeader: React.FC<TelegramHeaderProps> = ({
  userFirstName,
  isDesktopFrame,
  onToggleFrame,
  onOpenCoach,
  onOpenScanner,
  onOpenRoutine,
  onOpenMixer,
  onOpenTelegramSetup,
  savedLooksCount,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.isMuted());

  const handleToggleSound = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  return (
    <header className="sticky top-0 z-30 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80 px-3.5 py-2.5 select-none space-y-2">
      <div className="flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-300 via-rose-300 to-rose-400 flex items-center justify-center text-stone-950 font-bold text-sm shadow-md ring-1 ring-white/30">
            آ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-stone-100">آینـا</span>
              <span className="text-[10px] text-amber-300 bg-amber-950/80 border border-amber-700/60 px-1.5 py-0.2 rounded font-latin">AYNA</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-none mt-0.5">
              {userFirstName ? `سلام ${userFirstName} عزیز` : 'دستیار شخصی زیبایی و استایل'}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Virtual Mirror & Scanner Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1 text-[11px] text-amber-200 bg-amber-950/60 hover:bg-amber-900/70 border border-amber-800/60 py-1.5 px-2.5 rounded-xl transition-colors shadow-xs"
            title="آینه و اسکنر چهره"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="font-medium">آینه و اسکن</span>
          </button>

          {/* AI Coach Quick Trigger */}
          <button
            onClick={onOpenCoach}
            className="flex items-center gap-1 text-[11px] text-rose-200 bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/60 py-1.5 px-2 rounded-xl transition-colors shadow-xs"
            title="گفتگو با مشاور هوشمند"
          >
            <span>رفیق آینا</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-colors ${
              isMuted
                ? 'bg-stone-900 border-stone-800 text-stone-500 hover:text-stone-300'
                : 'bg-stone-900 border-stone-800 text-amber-300 hover:text-amber-200'
            }`}
            title={isMuted ? 'روشن کردن صدا' : 'بی‌صدا کردن'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Desktop/Mobile Frame Toggle */}
          <button
            onClick={onToggleFrame}
            className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700 transition-colors border border-stone-700/50"
            title={isDesktopFrame ? 'نمایش تمام‌صفحه' : 'نمایش شبیه‌ساز تلگرام'}
          >
            {isDesktopFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Access Action Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] no-scrollbar">
        <button
          onClick={onOpenTelegramSetup}
          className="shrink-0 bg-blue-950/70 hover:bg-blue-900 border border-blue-700/60 text-blue-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 font-bold shadow-xs"
        >
          <span>🚀 اتصال به تلگرام</span>
        </button>
        <button
          onClick={() => onOpenRoutine(10)}
          className="shrink-0 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-300 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
        >
          <span>⏱️ تایمر ۱۰ دقیقه Glow</span>
        </button>
        <button
          onClick={onOpenMixer}
          className="shrink-0 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-300 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
        >
          <span>👗 استودیو ست کردن لباس</span>
        </button>
        <button
          onClick={() => onOpenRoutine(3)}
          className="shrink-0 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-300 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
        >
          <span>⚡ روتین ۳ دقیقه‌ای فوری</span>
        </button>
      </div>
    </header>
  );
};
