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
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  isPremium?: boolean;
  onOpenPremium?: () => void;
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
  isAdmin,
  onOpenAdmin,
  isPremium,
  onOpenPremium,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.isMuted());

  const handleToggleSound = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  return (
    <header className="sticky top-0 z-30 bg-stone-950/85 backdrop-blur-xl border-b border-white/[0.08] px-3.5 py-2.5 select-none space-y-2 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-300 via-rose-300 to-rose-400 flex items-center justify-center text-stone-950 font-bold text-sm shadow-md ring-2 ring-white/20">
            آ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-stone-100">آینـا</span>
              <span className="text-[10px] text-amber-200 font-latin tracking-wider uppercase font-semibold">
                AYNA
              </span>
            </div>
            <p className="text-[11px] text-stone-400 leading-none mt-0.5 font-medium">
              {userFirstName ? `سلام ${userFirstName} عزیز` : 'دستیار شخصی زیبایی و استایل'}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* VIP Premium Upgrade / Status Button */}
          <button
            onClick={onOpenPremium}
            className={`flex items-center gap-1 text-[11px] py-1.5 px-2.5 rounded-xl transition-all shadow-xs font-bold active:scale-95 ${
              isPremium
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/60 ring-1 ring-amber-400/30'
                : 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-200 border border-amber-500/40 hover:from-amber-500/30'
            }`}
            title={isPremium ? 'اشتراک فعال شما' : 'خرید اشتراک پریمیوم'}
          >
            <span>{isPremium ? '👑 VIP' : '✨ پریمیوم'}</span>
          </button>

          {/* Admin Crown Trigger if Admin */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-[11px] text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 border border-amber-500/50 py-1.5 px-2.5 rounded-xl transition-all shadow-sm font-bold ring-1 ring-amber-400/40"
              title="ورود به پنل مدیریت"
            >
              <span>👑</span>
              <span>مدیریت</span>
            </button>
          )}

          {/* Virtual Mirror & Scanner Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1 text-[11px] text-amber-200 bg-amber-950/40 hover:bg-amber-900/60 active:scale-95 border border-amber-500/30 py-1.5 px-2.5 rounded-xl transition-all shadow-xs"
            title="آینه و اسکنر چهره"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="font-medium">آینه و اسکن</span>
          </button>

          {/* AI Coach Quick Trigger */}
          <button
            onClick={onOpenCoach}
            className="flex items-center gap-1 text-[11px] text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 active:scale-95 border border-rose-500/30 py-1.5 px-2.5 rounded-xl transition-all shadow-xs font-medium"
            title="گفتگو با مشاور هوشمند"
          >
            <span>رفیق آینا</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
              isMuted
                ? 'bg-stone-900 border-stone-800 text-stone-500 hover:text-stone-300'
                : 'bg-stone-900 border-amber-900/40 text-amber-300 hover:text-amber-200 shadow-xs'
            }`}
            title={isMuted ? 'روشن کردن صدا' : 'بی‌صدا کردن'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Desktop/Mobile Frame Toggle */}
          <button
            onClick={onToggleFrame}
            className="hidden sm:flex items-center justify-center w-7 h-7 rounded-xl bg-stone-900 text-stone-400 hover:text-stone-200 active:scale-90 transition-all border border-stone-800"
            title={isDesktopFrame ? 'نمایش تمام‌صفحه' : 'نمایش شبیه‌ساز تلگرام'}
          >
            {isDesktopFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Access Action Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] no-scrollbar">
        {/* VIP Premium Button */}
        <button
          onClick={onOpenPremium}
          className={`shrink-0 border px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold shadow-xs active:scale-95 ${
            isPremium
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
              : 'bg-gradient-to-r from-amber-500/30 to-rose-500/30 border-amber-500/50 text-amber-200'
          }`}
        >
          <span>{isPremium ? '👑 عضویت ویژه فعال' : '💎 خرید اشتراک پریمیوم'}</span>
        </button>

        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="shrink-0 bg-gradient-to-r from-amber-500/30 to-rose-500/30 hover:from-amber-500/40 hover:to-rose-500/40 border border-amber-500/60 text-amber-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold shadow-xs active:scale-95"
          >
            <span>👑 داشبورد فرماندهی مدیر</span>
          </button>
        )}
        <button
          onClick={onOpenTelegramSetup}
          className="shrink-0 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/40 text-blue-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold shadow-xs active:scale-95"
        >
          <span>🚀 اتصال به تلگرام</span>
        </button>
        <button
          onClick={() => onOpenRoutine(10)}
          className="shrink-0 bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-stone-700 text-stone-300 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
        >
          <span>⏱️ تایمر ۱۰ دقیقه Glow</span>
        </button>
        <button
          onClick={onOpenMixer}
          className="shrink-0 bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-stone-700 text-stone-300 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
        >
          <span>👗 استودیو ست کردن لباس</span>
        </button>
        <button
          onClick={() => onOpenRoutine(3)}
          className="shrink-0 bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-stone-700 text-stone-300 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
        >
          <span>⚡ روتین ۳ دقیقه‌ای فوری</span>
        </button>
      </div>
    </header>
  );
};
