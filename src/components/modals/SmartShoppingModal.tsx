import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Calculator,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Scale,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface SmartShoppingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartShoppingModal: React.FC<SmartShoppingModalProps> = ({ isOpen, onClose }) => {
  const [itemName, setItemName] = useState<string>('');
  const [hasSimilar, setHasSimilar] = useState<boolean | null>(null);
  const [matchesThreeOutfits, setMatchesThreeOutfits] = useState<boolean | null>(null);
  const [motivation, setMotivation] = useState<'need' | 'impulse' | 'discount'>('impulse');
  const [verdict, setVerdict] = useState<{
    status: 'buy' | 'dont_buy' | 'wait';
    title: string;
    advice: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCalculate = () => {
    sounds.playChime('complete');
    if (hasSimilar === true) {
      setVerdict({
        status: 'dont_buy',
        title: '⛔ دست نگه دار؛ نخر!',
        advice: 'تو آیتم مشابهی داری که هنوز از حداکثر ظرفیتش استفاده نکرده‌ای. خرید این آیتم فقط احساس رضایت لحظه‌ای دارد و بعد در کمد خاک می‌خورد.',
      });
    } else if (matchesThreeOutfits === false) {
      setVerdict({
        status: 'wait',
        title: '⚠️ احتیاط؛ ریسک گوشه‌نشینی در کمد!',
        advice: 'اگر این آیتم حداقل با ۳ لباس موجودت ست نشود، مجبور می‌شوی برای پوشیدنش لباس‌های جدید دیگری هم بخری! حداقل ۴۸ ساعت فکر کن.',
      });
    } else if (motivation === 'need' && matchesThreeOutfits === true && hasSimilar === false) {
      setVerdict({
        status: 'buy',
        title: '✨ بخر؛ یک ارتقای هوشمندانه برای استایل تو!',
        advice: 'این خرید جای خالی یک قطعه پرکاربرد را پر می‌کند، با کمدت همخوانی دارد و یک سرمایه‌گذاری مثبت در آراستگی توست.',
      });
    } else {
      setVerdict({
        status: 'wait',
        title: '⏳ قانون ۴۸ ساعت انتظار',
        advice: 'این خرید ناشی از دوپامین تخفیف یا هیجان آنی است. بگذار ۴۸ ساعت در سبد خرید بماند؛ اگر بعد از دو روز هنوز اولویتت بود، اقدام کن.',
      });
    }
  };

  const handleReset = () => {
    setItemName('');
    setHasSimilar(null);
    setMatchesThreeOutfits(null);
    setVerdict(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                <span>سنجش هوشمند خرید (Buy or Don't Buy)</span>
              </h3>
              <p className="text-[10px] text-stone-400">فیلتر ۴ مرحله‌ای برای جلوگیری از خریدهای هیجانی کمد و شلف</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {!verdict ? (
            <div className="space-y-3.5">
              {/* Question 1: Item Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-300 block">
                  ۱. نام آیتمی که قصد خریدش را داری:
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: پالت رژگونه نود یا کت تک کرم"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:border-amber-500 outline-none"
                />
              </div>

              {/* Question 2: Has similar */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-300 block">
                  ۲. آیا آیتمی با رنگ، عملکرد یا وایب مشابه در کمد یا شلفت داری؟
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setHasSimilar(true)}
                    className={`py-2 rounded-xl border text-center transition-all ${
                      hasSimilar === true
                        ? 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    بله، تقریباً شبیه دارم
                  </button>
                  <button
                    onClick={() => setHasSimilar(false)}
                    className={`py-2 rounded-xl border text-center transition-all ${
                      hasSimilar === false
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    خیر، کاملاً جدیده
                  </button>
                </div>
              </div>

              {/* Question 3: Matches 3 outfits */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-300 block">
                  ۳. آیا می‌توانی فوراً ۳ ست مختلف با لباس‌های فعلی کمدت با آن بسازی؟
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMatchesThreeOutfits(true)}
                    className={`py-2 rounded-xl border text-center transition-all ${
                      matchesThreeOutfits === true
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    بله، با ۳ ست ست میشه
                  </button>
                  <button
                    onClick={() => setMatchesThreeOutfits(false)}
                    className={`py-2 rounded-xl border text-center transition-all ${
                      matchesThreeOutfits === false
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 font-bold'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    خیر، ست کردنش سخته
                  </button>
                </div>
              </div>

              {/* Question 4: Motivation */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-300 block">
                  ۴. محرک اصلی این تصمیم خرید چیه؟
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'need', label: 'یک نیاز مشخص' },
                    { id: 'impulse', label: 'هوس یا تنوع' },
                    { id: 'discount', label: 'تخفیف یا حراج' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMotivation(m.id as any)}
                      className={`py-1.5 text-[11px] rounded-xl border text-center transition-all ${
                        motivation === m.id
                          ? 'bg-amber-950/60 border-amber-500 text-amber-200 font-bold'
                          : 'bg-stone-950 border-stone-800 text-stone-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <button
                disabled={hasSimilar === null || matchesThreeOutfits === null}
                onClick={handleCalculate}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                بررسی و صدور رای هوشمند آینـا
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div
                className={`p-4 rounded-2xl border space-y-2 text-center ${
                  verdict.status === 'buy'
                    ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                    : verdict.status === 'dont_buy'
                    ? 'bg-rose-950/40 border-rose-600/60 text-rose-200'
                    : 'bg-amber-950/40 border-amber-600/60 text-amber-200'
                }`}
              >
                <h4 className="text-sm font-bold text-white">{verdict.title}</h4>
                <p className="text-xs leading-relaxed opacity-90">{verdict.advice}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                <span className="font-bold text-stone-200 text-xs">قانون طلایی کمد پایدار:</span>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  «هر بار که از یک خرید غیرضروری پرهیز می‌کنی، فضا و بودجه را برای چیزهایی آزاد می‌گذاری که واقعاً عاشقشان هستی و بارها استفاده خواهی کرد.»
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs"
              >
                سنجش یک آیتم دیگر
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-xs"
          >
            بستن ماشین حساب خرید
          </button>
        </div>
      </div>
    </div>
  );
};
