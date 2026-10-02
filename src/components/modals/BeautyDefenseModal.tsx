import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Eye,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Brain,
  CheckCircle2
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface BeautyDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BeautyDefenseModal: React.FC<BeautyDefenseModalProps> = ({ isOpen, onClose }) => {
  const [selectedTopic, setSelectedTopic] = useState<'filters' | 'claims' | 'fomo'>('filters');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                <span>سپر دفاعی زیبایی (Beauty Defense)</span>
              </h3>
              <p className="text-[10px] text-stone-400">شناسایی فیلترها، فریب‌های تبلیغاتی و مهار حسادت ترندها</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Topic Selector */}
        <div className="p-2.5 bg-stone-950 border-b border-stone-850 grid grid-cols-3 gap-1.5 text-xs">
          {[
            { id: 'filters', label: 'رادار فیلترها', icon: '📸' },
            { id: 'claims', label: 'ادعاهای بازاریابی', icon: '🧪' },
            { id: 'fomo', label: 'مهار هوس ترندها', icon: '🛡️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedTopic(tab.id as any);
                sounds.playChime('click');
              }}
              className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                selectedTopic === tab.id
                  ? 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-[11px] truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {selectedTopic === 'filters' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-bold text-purple-300 text-xs">پوست واقعی بافت دارد، نه بلور!</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  آنچه در ویدیوهای بیوتی بلاگرها «پوست شیشه‌ای بدون منفذ» به نظر می‌رسد، حاصل نور رینگ‌لایت قوی و فیلتر محوکننده (Smooth Skin) دوربین است.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-stone-200 text-xs">چگونه فیلتر را در ویدیو تشخیص دهیم؟</span>
                  <ul className="space-y-1.5 text-[11px] text-stone-400 list-disc list-inside">
                    <li>وقتی دست جلوی صورت می‌آید، ناگهان پوست دست بافت دارد اما صورت بدون منفذ است.</li>
                    <li>حرکت ناگهانی سر باعث پرش گوشه چشم، لب یا لرزش در امتداد فک می‌شود.</li>
                    <li>مژه‌ها در نمای نزدیک وضوح جداگانه ندارند و به صورت توده‌ای نرم دیده می‌شوند.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selectedTopic === 'claims' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-bold text-amber-300 text-xs">دروغ‌های رایج دنیای بازاریابی زیبایی:</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  برندها برای فروش بیشتر از القای «نقص خودساخته» استفاده می‌کنند تا برایش راه‌حل بفروشند.
                </p>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-rose-300">ادعا: «کرم معجزه‌آسای بستن دائمی منافذ پوست»</span>
                  <p className="text-stone-300">
                    واقعیت علمی: منافذ پوست ماهیچه ندارند که باز و بسته شوند. منافذ بخش طبیعی تنفس و خروج سبوم هستند؛ تنها می‌توان با نیاسینامید یا لایه‌برداری BHA آن‌ها را تمیز و کمتر نمایان کرد.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-rose-300">ادعا: «از بین بردن کامل سلولیت یا خطوط لبخند با کرم»</span>
                  <p className="text-stone-300">
                    واقعیت علمی: سلولیت ساختار ژنتیکی چربی زیر بافت پیوندی در زنان است و بیش از ۹۰٪ زنان دارند. هیچ کرم موضعی قادر به تغییر ساختار زیرپوستی نیست.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedTopic === 'fomo' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-bold text-teal-300 text-xs">قانون آینـا: «هر ترندی قرار نیست استایل تو باشد»</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  ترندهای شبکه‌های اجتماعی هر ماه تغییر می‌کنند تا چرخه مصرف ادامه یابد؛ اما استایل شخصی و شناخت خود ماندگار است.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-2">
                <h5 className="font-bold text-stone-200 text-xs">چک‌لیست خنثی کردن وسوسه خرید:</h5>
                <div className="space-y-1.5 text-[11px] text-stone-300">
                  <div className="flex items-start gap-1.5">
                    <span className="text-purple-400 font-bold">۱.</span>
                    <span>آیا از دیدن این آیتم لذت می‌بری یا می‌ترسی از بقیه عقب بمانی (FOMO)؟</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-purple-400 font-bold">۲.</span>
                    <span>آیا با ۳ تا از لباس‌ها یا لوازم موجودت ست می‌شود؟</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-purple-400 font-bold">۳.</span>
                    <span>اگر این ترند در اینستاگرام ویرال نبود، آیا باز هم به آن علاقه داشتی؟</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs"
          >
            قدرتمند در برابر تبلیغات؛ متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};
