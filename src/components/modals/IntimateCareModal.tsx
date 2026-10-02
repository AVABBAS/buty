import React, { useState } from 'react';
import {
  X,
  Shield,
  Heart,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  Info
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface IntimateCareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntimateCareModal: React.FC<IntimateCareModalProps> = ({ isOpen, onClose }) => {
  const [activeLayer, setActiveLayer] = useState<'hygiene' | 'normalcy' | 'triage'>('hygiene');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/40">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                <span>مراقبت بهداشتی فردی (Intimate Care)</span>
              </h3>
              <p className="text-[10px] text-stone-400">بهداشت علمی، آگاهی از نرمال بودن بدن و تریاژ سلامت</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Layer Tab Selector */}
        <div className="p-2.5 bg-stone-950 border-b border-stone-850 grid grid-cols-3 gap-1.5 text-xs">
          {[
            { id: 'hygiene', label: '۱. بهداشت علمی', icon: '🧼' },
            { id: 'normalcy', label: '۲. تنوع طبیعی بدن', icon: '🌸' },
            { id: 'triage', label: '۳. علائم هشدار', icon: '🩺' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveLayer(tab.id as any);
                sounds.playChime('click');
              }}
              className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                activeLayer === tab.id
                  ? 'bg-teal-950/60 border-teal-500 text-teal-200 font-bold'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-[11px] truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Layer 1: Hygiene */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {activeLayer === 'hygiene' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-bold text-teal-300 text-xs">اصل طلایی: «واژن یک عضو خودپاک‌کننده است»</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  ناحیه داخلی هرگز نیازی به شوینده، دوش واژینال یا صابون‌های معطر ندارد. شستشوی بخش خارجی فقط با آب ولرم یا ژل‌های شستشوی ملایم غیرصابونی بدون عطر (Soap-Free) کافی است.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-2">
                <h5 className="font-bold text-stone-200 text-xs">نکات ضروری بهداشت روزانه:</h5>
                <ul className="space-y-1.5 text-[11px] text-stone-300">
                  <li className="flex items-start gap-1.5">
                    <span className="text-teal-400 font-bold">•</span>
                    <span>لباس زیر حتماً ۱۰۰٪ نخی (پنبه‌ای) و غیرتنگ باشد تا از تجمع رطوبت و رشد قارچ جلوگیری شود.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-teal-400 font-bold">•</span>
                    <span>تعویض روزانه لباس زیر و شستشو بعد از ورزش یا فعالیت بدنی شدید.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-teal-400 font-bold">•</span>
                    <span>خشک کردن آرام و ضربه‌ای با دستمال تمیز به جهت جلو به عقب (هرگز جهت برعکس نباشد).</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-teal-950/30 border border-teal-800/40">
                <span className="font-bold text-teal-300 text-[11px] block mb-1">دوران پریود:</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  تعویض پد یا تامپون هر ۳ تا ۴ ساعت یک‌بار، یا تخلیه منظم کاپ قاعدگی طبق دستورالعمل بهداشتی استریل.
                </p>
              </div>
            </div>
          )}

          {/* Layer 2: Normalcy */}
          {activeLayer === 'normalcy' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-bold text-rose-300 text-xs">تنوع طبیعی، نقص نیست!</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  تبلیغات و فیلم‌ها تصوراتی غیرواقعی و فتوشاپ‌شده از بدن زنان ایجاد کرده‌اند. واقعیت بدن با استانداردهای فیلترشده تفاوت دارد.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-stone-200 text-xs">۱. عدم تقارن لابیاها:</span>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    در بیش از ۷۰٪ زنان، اندازه یا رنگ دو طرف کاملاً متقارن نیست. این یک تنوع طبیعی آناتومیک است و هیچ ایرادی ندارد.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-stone-200 text-xs">۲. تیرگی طبیعی پوست (هایپرپیگمنتیشن):</span>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    پوست ناحیه تناسلی به دلیل هورمون‌ها و اصطکاک طبیعی لباس، به طور فیزیولوژیک تیره‌تر از سایر نواحی بدن است و نیازی به کرم‌های خطرناک سفیدکننده ندارد.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-stone-200 text-xs">۳. ترشحات فیزیولوژیک:</span>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    ترشحات شفاف، شیری‌رنگ یا بی‌بو متناسب با روزهای چرخه قاعدگی، عملکرد طبیعی بدن برای تمیز نگه داشتن واژن است.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Layer 3: Medical Triage */}
          {activeLayer === 'triage' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-1">
                <span className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4" />
                  <span>چه زمانی باید حتماً به متخصص زنان مراجعه کرد؟</span>
                </span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  آینـا مشاور سلامت است و هرگز جایگزین تشخیص پزشکی نمی‌شود. در صورت مشاهده علائم زیر، ویزیت پزشک ضروری است:
                </p>
              </div>

              <div className="space-y-1.5 text-[11px]">
                {[
                  'سوزش، خارش شدید مداوم یا قرمزی و تورم غیرعادی',
                  'ترشحات غلیظ پنیری، زرد/سبزرنگ، یا ترشحات با بوی نامطبوع و تند (شبیه ماهی)',
                  'درد در ناحیه لگن یا درد شدید هنگام مقاربت یا ادرار',
                  'خونریزی نامنظم یا لکه‌بینی خارج از دوره پریود',
                  'مشاهده زخم، تاول یا برآمدگی‌های دردناک'
                ].map((symptom, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-stone-850 border border-stone-800 text-rose-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{symptom}</span>
                  </div>
                ))}
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
            متوجه شدم؛ با آگاهی مراقبت می‌کنم
          </button>
        </div>
      </div>
    </div>
  );
};
