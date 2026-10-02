import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Droplets,
  ShieldAlert,
  CheckCircle,
  ArrowRight,
  Stethoscope,
  Smile
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface SkinProblemSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRoutine?: (time: number) => void;
}

interface ProblemCase {
  id: string;
  name: string;
  category: 'پوست' | 'میکاپ' | 'ذهن و اعتمادبه‌نفس';
  rootCauses: string[];
  lowRiskAction: string;
  stepByStepSolution: string[];
  productOptions: string[];
  whenToSeeDoctor?: string;
}

const PROBLEMS: ProblemCase[] = [
  {
    id: 'dry-flaky',
    name: 'پوسته دادن و خشکی شدید دور دهان یا پیشانی',
    category: 'پوست',
    rootCauses: [
      'آسیب دیدن سد دفاعی پوست به دلیل لایه‌برداری بیش‌ازحد یا شوینده قوی.',
      'ننوشیدن آب کافی و رطوبت پایین محیط.',
      'زدن کرم‌پودر مات‌کننده روی پوستی که هنوز رطوبت جذب نکرده است.'
    ],
    lowRiskAction: 'به مدت ۷۲ ساعت تمام اسیدها، رتینول و لایه‌بردارها را متوقف کن؛ فقط آبرسان ملایم و کرم سرامید.',
    stepByStepSolution: [
      'شستشو فقط با آب ولرم (بدون ژل‌های شوینده اسیدی).',
      'زدن هیالورونیک اسید روی پوست هنوز نمدار.',
      'قفل کردن رطوبت با کرم حاوی سرامید، پانتنول یا کره شی‌باتر.',
      'پرهیز از کرم‌پودرهای سنگین و جایگزینی با بالم رنگی یا ضدآفتاب آبرسان.'
    ],
    productOptions: ['کرم بپانتن یا سیکالفات', 'مرطوب‌کننده حاوی سرامید', 'اسپری آب معدنی'],
    whenToSeeDoctor: 'اگر خشکی همراه با خارش غیرقابل تحمل، پوسته‌ریزی نقره‌ای یا لکه‌های ملتهب قرمز پایدار باشد.'
  },
  {
    id: 'acne-spot',
    name: 'جوش‌های هورمونی فک و چانه قبل از پریود',
    category: 'پوست',
    rootCauses: [
      'افزایش پروژسترون و ترشح سبوم غلیظ در فاز لوتئال چرخه ماهانه.',
      'اصطکاک دست با صورت یا استفاده از پدهای آرایشی غیراستریل.',
      'استرس، قند بالا و افت کیفیت خواب.'
    ],
    lowRiskAction: 'هرگز جوش را دستکاری یا تخلیه نکن! فقط از پچ جوش هیدروکلوئیدی یا ژل نقطه ای سالیسیلیک اسید استفاده کن.',
    stepByStepSolution: [
      'شستشو با شوینده حاوی سالیسیلیک اسید ۲٪ به مدت ۶۰ ثانیه.',
      'گذاشتن پچ جوش (Pimple Patch) هنگام خواب برای جذب چربی و جلوگیری از تماس دست.',
      'استفاده از کمپرس سرد برای خواباندن تورم قرمز قبل از خروج.',
      'کانسیلر زدن فقط با ضربه گوش‌پاک‌کن تمیز مستقیماً روی نقطه جوش.'
    ],
    productOptions: ['پچ جوش هیدروکلوئیدی', 'سرم سالیسیلیک اسید یا نیاسینامید', 'ضدآفتاب فلوئیدی فاقد چربی'],
    whenToSeeDoctor: 'جوش‌های کیستیک عمیق، دردناک و چرکی که اسکار فرورفته به جا می‌گذارند.'
  },
  {
    id: 'makeup-pilling',
    name: 'ماسیدن و لوله‌شدن کرم روی صورت (Pilling)',
    category: 'میکاپ',
    rootCauses: [
      'تداخل فرمولاسیون بر پایه سیلیکون با فرمولاسیون بر پایه آب (Water-based vs Silicone-based).',
      'صبر نکردن بین مراحل (زدن کرم‌پودر قبل از جذب کامل ضدآفتاب و مرطوب‌کننده).',
      'مالش محکم به جای ضربه آرام روی پوست.'
    ],
    lowRiskAction: 'بین هر مرحله مراقبت و میکاپ حداقل ۶۰ تا ۹۰ ثانیه زمان بده تا لایه قبلی جذب شود.',
    stepByStepSolution: [
      'پوستت را با اسفنج مرطوب تمیز کن تا لایه‌های گلوله شده برداشته شوند.',
      'یک قطره روغن سبک صورت یا مرطوب‌کننده رقیق را بین انگشتان گرم کن و ضربه بزن.',
      'کرم‌پودر یا کانسیلر را با بیوتی‌بلندر نم‌دار با حرکات آرام فشاری بنشان.'
    ],
    productOptions: ['پرایمر سبک بر پایه آب', 'اسفنج آرایشی هیدروفیلی نرم', 'اسپری فیکساتور آبرسان']
  },
  {
    id: 'bad-skin-day',
    name: 'حس اضطراب «امروز اصلاً چهره‌ام خوب نیست»',
    category: 'ذهن و اعتمادبه‌نفس',
    rootCauses: [
      'خستگی روانی، مقایسه با تصاویر فیلترشده در شبکه‌های اجتماعی.',
      'تله روان‌شناختی وسواس آینه (پیوسته چک کردن نقایص صورت از فاصله ۵ سانتی‌متری).',
      'فراموش کردن اینکه هیچ انسانی هر روز در بالاترین سطح شادابی بیولوژیک نیست.'
    ],
    lowRiskAction: 'قانون فاصله ۵۰ سانتی‌متری: هیچ‌کس در دنیای واقعی صورتت را از فاصله ۱۰ سانتی‌متری نمی‌بیند. آینه زوم را کنار بگذار!',
    stepByStepSolution: [
      'یک لیوان آب خنک بنوش و ۵ نفس عمیق شکمی بکش.',
      'یک کار مشخص و ساده انجام بده: شانه کردن مو + بالم لب خوش‌رنگ.',
      'یک پیراهن با رنگی که حس شادابی می‌دهد انتخاب کن و آینه را برای بقیه روز رها کن.'
    ],
    productOptions: ['بالم لب مرطوب‌کننده با رایحه ملایم', 'عطر انرژی‌بخش مرکباتی'],
    whenToSeeDoctor: 'اگر اضطراب مداوم ظاهر باعث دوری از جامعه یا ناتوانی در خروج از خانه شده باشد.'
  }
];

export const SkinProblemSolverModal: React.FC<SkinProblemSolverModalProps> = ({
  isOpen,
  onClose,
  onOpenRoutine,
}) => {
  const [selectedProbId, setSelectedProbId] = useState<string>('dry-flaky');

  if (!isOpen) return null;

  const currentProblem = PROBLEMS.find((p) => p.id === selectedProbId) || PROBLEMS[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/40">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100">حل ریشه‌ای دغدغه‌های پوست و ظاهر</h3>
              <p className="text-[10px] text-stone-400">ریشه‌یابی علمی، اقدام کم‌ریسک و تریاژ سلامت</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Problem Selector Bar */}
        <div className="p-2.5 bg-stone-950 border-b border-stone-850 flex gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {PROBLEMS.map((prob) => (
            <button
              key={prob.id}
              onClick={() => {
                setSelectedProbId(prob.id);
                sounds.playChime('click');
              }}
              className={`px-3 py-1.5 rounded-xl border shrink-0 text-xs transition-all ${
                selectedProbId === prob.id
                  ? 'bg-teal-950/70 border-teal-500 text-teal-200 font-bold'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
              }`}
            >
              <span className="truncate max-w-[130px]">{prob.name.split(' ')[0]} {prob.name.split(' ')[1] || ''}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {/* Title Header */}
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-stone-100 text-xs">{currentProblem.name}</h4>
              <span className="text-[10px] text-teal-300/90 mt-0.5 block">دسته‌بندی: {currentProblem.category}</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 font-medium">
              عیب‌یابی علمی
            </span>
          </div>

          {/* Root causes */}
          <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1.5">
            <span className="font-bold text-amber-300 text-[11px] block">علل احتمالی زیربنایی:</span>
            <ul className="space-y-1 text-[11px] text-stone-300">
              {currentProblem.rootCauses.map((rc, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{rc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Low Risk Golden Action */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-800/50 space-y-1">
            <span className="font-bold text-emerald-300 text-[11px] block">اقدام طلایی کم‌ریسک:</span>
            <p className="text-[11px] text-stone-200 leading-relaxed font-medium">
              {currentProblem.lowRiskAction}
            </p>
          </div>

          {/* Step by step action */}
          <div className="space-y-2">
            <h5 className="font-bold text-stone-200 text-xs">مراحل گام‌به‌گام نجات:</h5>
            <div className="space-y-1.5">
              {currentProblem.stepByStepSolution.map((sol, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-300 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-teal-950 text-teal-300 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{sol}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Warning if any */}
          {currentProblem.whenToSeeDoctor && (
            <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-[11px] text-rose-300 flex items-start gap-2">
              <Stethoscope className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>مراجعه به متخصص پوست: {currentProblem.whenToSeeDoctor}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center gap-2">
          {onOpenRoutine && (
            <button
              onClick={() => {
                onOpenRoutine(3);
                onClose();
              }}
              className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors text-center"
            >
              شروع روتین ۳ دقیقه‌ای نجات پوست
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
