import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  PartyPopper,
  ShieldCheck,
  Check
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface ReadyCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  tip: string;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: 'hair', label: 'موها (Hair)', category: 'ظاهر', tip: 'مرتب، بدون وز اضافه، و آماده حرکت' },
  { id: 'skin', label: 'پوست و ضدآفتاب (Skin)', category: 'مراقبت', tip: 'ضدآفتاب و مرطوب‌کننده نشسته روی پوست' },
  { id: 'brows', label: 'ابروها (Brows)', category: 'صورت', tip: 'شانه شده یا فیکس ملایم' },
  { id: 'lips', label: 'لب‌ها (Lips)', category: 'صورت', tip: 'بالم یا رژ دلخواه برای حس شادابی' },
  { id: 'makeup', label: 'آرایش کلی (Makeup)', category: 'صورت', tip: 'بلند شده، بدون ماسیدگی، طبیعی' },
  { id: 'nails', label: 'ناخن‌ها (Nails)', category: 'دست‌ها', tip: 'تمیز، سوهان‌کشیده یا لاک مرتب' },
  { id: 'outfit', label: 'لباس اصلی (Outfit)', category: 'پوشش', tip: 'راحت، متناسب با هوا و مناسبت' },
  { id: 'shoes', label: 'کفش‌ها (Shoes)', category: 'پوشش', tip: 'راحت برای قدم زدن، تمیز' },
  { id: 'bag', label: 'کیف و ملزومات (Bag)', category: 'وسایل', tip: 'وسایل ضروری، بالم لب، شارژر' },
  { id: 'accessories', label: 'اکسسوری‌ها (Accessories)', category: 'استایل', tip: 'گوشواره، ساعت یا انگشتر متناسب' },
  { id: 'fragrance', label: 'عطر و بو (Fragrance)', category: 'حس خوب', tip: 'یک یا دو پاف از عطر هماهنگ با وایب امروز' },
];

export const ReadyCheckModal: React.FC<ReadyCheckModalProps> = ({ isOpen, onClose, onFinish }) => {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        sounds.playChime('click');
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
      }
      return next;
    });
  };

  const checkAll = () => {
    sounds.playChime('complete');
    setCheckedIds(new Set(DEFAULT_ITEMS.map((i) => i.id)));
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  const resetAll = () => {
    setCheckedIds(new Set());
  };

  const progressPercent = Math.round((checkedIds.size / DEFAULT_ITEMS.length) * 100);
  const isAllDone = checkedIds.size === DEFAULT_ITEMS.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                <span>چک‌لیست خروج Ready Check</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded font-latin">
                  {checkedIds.size} از {DEFAULT_ITEMS.length}
                </span>
              </h3>
              <p className="text-[10px] text-stone-400">یک بازبینی سریع و با خیال راحت برو بیرون</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-950 px-4 py-2 border-b border-stone-850 flex items-center gap-3">
          <div className="flex-1 bg-stone-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-emerald-400 font-latin">{progressPercent}%</span>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {DEFAULT_ITEMS.map((item) => {
            const isChecked = checkedIds.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isChecked
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-100'
                    : 'bg-stone-850/80 border-stone-800 hover:border-stone-700 text-stone-300'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="shrink-0">
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`text-xs font-bold block ${
                        isChecked ? 'line-through text-stone-400 font-normal' : 'text-stone-100'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="text-[10px] text-stone-400 truncate block mt-0.5">{item.tip}</span>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 shrink-0 font-medium">
                  {item.category}
                </span>
              </div>
            );
          })}

          {isAllDone && (
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-950/60 to-teal-950/40 border border-emerald-600/50 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <PartyPopper className="w-7 h-7 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-xs font-bold text-white">همه چیز حاضره و عالی به نظر می‌رسی!</h4>
              <p className="text-[11px] text-emerald-200 leading-relaxed">
                «نیازی نیست دوباره چک کنی؛ زیبایی یعنی اینکه با آرامش و اعتمادبه‌نفس بری تو جمع و از روزت لذت ببری.»
              </p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-2">
          <button
            onClick={resetAll}
            className="py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ریست</span>
          </button>

          {!isAllDone ? (
            <button
              onClick={checkAll}
              className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>تیک زدن همه (آماده‌ام)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (onFinish) onFinish();
                onClose();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>اتمام و بستن آینه</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
