import React, { useState } from 'react';
import { X, ShieldCheck, Check, Sparkles, HeartHandshake } from 'lucide-react';

interface GoodEnoughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoodEnoughModal: React.FC<GoodEnoughModalProps> = ({ isOpen, onClose }) => {
  const [checks, setChecks] = useState<Record<string, boolean>>({
    hair: true,
    skin: true,
    lips: true,
    outfit: true,
    bag: true,
  });

  if (!isOpen) return null;

  const items = [
    { id: 'hair', label: 'موها مرتبه یا به شکل طبیعی بسته شده' },
    { id: 'skin', label: 'پوست تمیز، مرطوب و محافظت شده است' },
    { id: 'lips', label: 'یک بالم یا رژ ملایم روی لب هست' },
    { id: 'outfit', label: 'لباس راحت و متناسب با شرایط امروزه' },
    { id: 'bag', label: 'کیف و لوازم ضروری برداشته شده' },
  ];

  const toggleCheck = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  const allChecked = Object.values(checks).every(Boolean);

  const handleFinish = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-stone-900 border border-stone-800 p-4 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-950/80 text-emerald-300 flex items-center justify-center border border-emerald-800/60">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100">Good Enough Mode (کافیه!)</h3>
              <p className="text-[10px] text-stone-400">توقف چرخه وسواس و چک کردن مداوم</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-stone-800 text-stone-400 hover:text-stone-200 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed bg-stone-850 p-2.5 rounded-xl border border-stone-800">
          «نگرانی → یک بار بررسی → یک اقدام → عبور و شروع زندگی»
          این چک‌لیست را یک بار علامت بزن و به خودت اعتماد کن.
        </p>

        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                checks[item.id]
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                  : 'bg-stone-850 border-stone-800 text-stone-400'
              }`}
            >
              <span>{item.label}</span>
              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center ${
                  checks[item.id]
                    ? 'bg-emerald-500 text-stone-950 font-bold'
                    : 'border border-stone-600'
                }`}
              >
                {checks[item.id] && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-1 space-y-2">
          <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/50 text-center text-xs text-rose-200">
            {allChecked ? '✨ آماده‌ای! آینه رو ببند و برو بدرخش.' : 'کارهای ضروری رو چک کردی؟'}
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>تصمیم گرفتم؛ دیگه چک نمی‌کنم!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
