import React, { useState } from 'react';
import {
  X,
  Camera,
  Sun,
  Maximize2,
  Smile,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Share2
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface PhotoCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoCoachModal: React.FC<PhotoCoachModalProps> = ({ isOpen, onClose }) => {
  const [activeTopic, setActiveTopic] = useState<'lens' | 'light' | 'pose' | 'social'>('lens');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                <span>مربی عکاسی و استایل Photo Coach</span>
              </h3>
              <p className="text-[10px] text-stone-400">بهترین ارائه چهره و استایل بدون فیلترهای مصنوعی</p>
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
        <div className="p-2.5 bg-stone-950 border-b border-stone-850 grid grid-cols-4 gap-1 text-xs">
          {[
            { id: 'lens', label: 'لنز و فاصله', icon: '📐' },
            { id: 'light', label: 'نورپردازی', icon: '☀️' },
            { id: 'pose', label: 'ژست و فک', icon: '👤' },
            { id: 'social', label: 'چک استوری', icon: '✨' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTopic(tab.id as any);
                sounds.playChime('click');
              }}
              className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center gap-0.5 ${
                activeTopic === tab.id
                  ? 'bg-blue-950/60 border-blue-500 text-blue-200 font-bold'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-[10px] truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {activeTopic === 'lens' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-bold text-blue-300 text-xs">«چرا توی سلفی نزدیک زشت می‌افتم؟»</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  لنز دوربین جلوی موبایل لنز واید (۲۴ میلی‌متری) است. هر چیزی که به لنز نزدیک‌تر باشد را به شکل حبابی تا ۳۰٪ بزرگتر نشان می‌دهد (بینی و پیشانی)!
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-2">
                <h5 className="font-bold text-stone-200 text-xs">راهکار علمی برای عکس طبیعی:</h5>
                <ul className="space-y-1.5 text-[11px] text-stone-300 list-disc list-inside">
                  <li>گوشی را به اندازه طول کامل دست از صورتت دور نگه دار.</li>
                  <li>از زوم ۲ برابری (2x) به همراه فاصله بیشتر استفاده کن تا اعوجاج لنز به صفر برسد.</li>
                  <li>هرگز دوربین را پایین‌تر از سطح چانه نگیر؛ در سطح چشم یا کمی بالاتر بهترین زاویه است.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTopic === 'light' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-bold text-amber-300 text-xs">نور، معمار تصویر توست!</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  گران‌ترین آرایش‌ها هم زیر نور سقفی زرد خراب می‌شوند، در حالی که ساده‌ترین ظاهر زیر نور طبیعی روز می‌درخشد.
                </p>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-emerald-400">✓ بهترین نور:</span>
                  <p className="text-stone-300">
                    رو به پنجره (با پرده توری برای پخش نور ملایم) با زاویه ۴۵ درجه نسبت به صورت.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-rose-400">✗ بدترین نور:</span>
                  <p className="text-stone-300">
                    لامپ‌های سقفی اتاق که سایه‌های خشن زیر چشم و زیر بینی ایجاد می‌کنند و صورت را خسته نشان می‌دهند.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'pose' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-bold text-teal-300 text-xs">تکنیک زاویه فک و گردن:</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  تفاوت عکس‌های حرفه‌ای با آماتور تنها در چند میلی‌متر جابجایی زاویه چانه است.
                </p>
              </div>

              <div className="space-y-2 text-[11px] text-stone-300">
                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-stone-100">۱. چرخش سه‌چهارم (45 Degree Angle):</span>
                  <p className="text-stone-400">
                    نگاه کاملاً مستقیم به دوربین شبیه به عکس پرسنلی و تخت است. سر را حدود ۲۰ تا ۳۰ درجه بچرخانید تا عمق استخوان گونه نمایان شود.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-stone-100">۲. کشیدن ملایم چانه به جلو:</span>
                  <p className="text-stone-400">
                    گوش‌ها را کمی به سمت جلو بدهید تا پوست زیر چانه کشیده شده و غبغب احتمالی کاملاً محو شود.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'social' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-bold text-purple-300 text-xs">چک‌لیست سلامت روان قبل از انتشار عکس:</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  هدف از به اشتراک گذاشتن لحظات، ثبت حس خوب است؛ نه جستجوی ارزش خود در واکنش دیگران.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-2 text-[11px]">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>آیا در این عکس شبیه خود واقعی‌ام هستم؟ (بدون فتوشاپ شدید اعضای صورت)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>اگر هیچ‌کس این پست را لایک نکند، آیا باز هم خودم از دیدنش حس خوبی می‌گیرم؟</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>آیا لباس و ظاهر من منعکس‌کننده شخصیت و حس من در آن روز است؟</span>
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
            آماده ثبت بهترین عکس‌ها؛ متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};
