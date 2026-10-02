import React, { useState } from 'react';
import {
  X,
  Moon,
  Sun,
  Sparkles,
  Heart,
  Droplets,
  Flower2,
  Calendar,
  CheckCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface CycleBeautyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PhaseInfo {
  id: string;
  name: string;
  days: string;
  energyLevel: 'پایین' | 'متوسط' | 'بالا' | 'در حال نوسان';
  skinCondition: string;
  hairCondition: string;
  recommendedRoutine: string[];
  outfitAdvice: string;
  quote: string;
}

const PHASES: PhaseInfo[] = [
  {
    id: 'menstrual',
    name: 'فاز قاعدگی (پریود)',
    days: 'روز ۱ تا ۵',
    energyLevel: 'پایین',
    skinCondition: 'پوست حساس‌تر، سد دفاعی نازک‌تر و متمایل به خشکی یا التهاب.',
    hairCondition: 'کف سر ممکن است حساس یا چرب‌تر شود؛ از کش‌های خیلی محکم خودداری کن.',
    recommendedRoutine: [
      'آبرسان غنی و بالم لب ترمیم‌کننده',
      'صرف‌نظر کردن از لایه‌برداری و اسکراب قوی',
      'روتین ۳ دقیقه‌ای: ضدآفتاب بدون رنگ + ماساژ سبک دور چشم'
    ],
    outfitAdvice: 'لباس‌های آزاد، شلوارهای کمر کشی و پارچه‌های پنبه‌ای تنفس‌پذیر برای کاهش حس انقباض و نفخ.',
    quote: '«امروز بدنت مشغول ساختن و بازسازی است؛ اولویت فقط راحتی و آرامش است.»'
  },
  {
    id: 'follicular',
    name: 'فاز فولیکولار (تجدید قوا)',
    days: 'روز ۶ تا ۱۲',
    energyLevel: 'بالا',
    skinCondition: 'افزایش استروژن، کلاژن‌سازی بالا، شفافیت طبیعی و بافت یکنواخت.',
    hairCondition: 'موها شاداب، خوش‌حالت و با درخشش طبیعی هستند.',
    recommendedRoutine: [
      'زمان عالی برای امتحان سرم ویتامین C یا رتینول',
      'امتحان رنگ‌های شاداب‌تر در رژگونه و رژلب',
      'روتین ۱۰ دقیقه‌ای کامل'
    ],
    outfitAdvice: 'استایل‌های جسورانه، فیت‌تر و ترکیب رنگ‌های تازه که با حس انرژی درونی‌ات هماهنگ باشد.',
    quote: '«انرژی درونی‌ات در بالاترین سطح است؛ روزهای فوق‌العاده برای امتحان ایده‌های جدید استایل!»'
  },
  {
    id: 'ovulation',
    name: 'فاز تخمک‌گذاری (اوج درخشش)',
    days: 'روز ۱۳ تا ۱۶',
    energyLevel: 'بالا',
    skinCondition: 'بیشترین میزان گیرایی و جذابیت طبیعی چهره؛ پوست در اوج صافی و درخشش.',
    hairCondition: 'موها پرپشت و به راحتی با هر حالتی شکل می‌گیرند.',
    recommendedRoutine: [
      'هایلایتر ملایم روی گونه‌ها برای انعکاس نور',
      'خط چشم گربه‌ای یا آرایش لب متمرکز',
      'بهترین روزها برای عکاسی و ثبت لوک‌های جدید'
    ],
    outfitAdvice: 'لباس‌های شیک‌تر، کت‌های با ساختار زیبا و عطرهای گرم و زنانه.',
    quote: '«طبیعت زیست‌شناسی‌ات در اوج شکوفایی است؛ با کمترین تلاش بیشترین تأثیر را می‌گذاری.»'
  },
  {
    id: 'luteal',
    name: 'فاز لوتئال / پیش از قاعدگی (PMS)',
    days: 'روز ۱۷ تا ۲۸',
    energyLevel: 'در حال نوسان',
    skinCondition: 'افزایش پروژسترون، ترشح بیشتر چربی، جوش‌های هورمونی فک و چانه و پف صبحگاهی.',
    hairCondition: 'موها ممکن است زودتر کدر یا چرب شوند؛ استفاده از شامپوی ملایم.',
    recommendedRoutine: [
      'شستشو با شوینده حاوی سالیسیلیک اسید برای منافذ',
      'کمپرس سرد یا قاشق سرد زیر چشم برای کاهش پف',
      'کانسیلر نقطه‌ای به جای فاندیشن سنگین'
    ],
    outfitAdvice: 'لباس‌های نرم با پارچه‌های بدون اصطکاک و کفش‌های سبک و کاملاً ارگونومیک.',
    quote: '«اگر جوش هورمونی زدی، با خودت مهربان باش؛ این نشانه بیماری یا کم‌کاری نیست، یک چرخه طبیعی است.»'
  }
];

export const CycleBeautyModal: React.FC<CycleBeautyModalProps> = ({ isOpen, onClose }) => {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('menstrual');

  if (!isOpen) return null;

  const currentPhase = PHASES.find((p) => p.id === selectedPhaseId) || PHASES[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                <span>تطبیق استایل با چرخه ماهانه (Cycle Beauty)</span>
              </h3>
              <p className="text-[10px] text-stone-400">تنظیم روتین پوست، مو و لباس متناسب با بیولوژی طبیعی تو</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phase Selector Tabs */}
        <div className="p-2.5 bg-stone-950 border-b border-stone-850 grid grid-cols-4 gap-1.5 text-xs">
          {PHASES.map((phase) => (
            <button
              key={phase.id}
              onClick={() => {
                setSelectedPhaseId(phase.id);
                sounds.playChime('click');
              }}
              className={`py-2 px-1 rounded-xl border text-center transition-all ${
                selectedPhaseId === phase.id
                  ? 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
              }`}
            >
              <span className="block text-[11px] truncate">{phase.name.split(' ')[1] || phase.name}</span>
              <span className="text-[9px] text-stone-500 block mt-0.5">{phase.days}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {/* Header Card */}
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-stone-100 text-xs flex items-center gap-1.5">
                <span>{currentPhase.name}</span>
                <span className="text-[10px] text-stone-400">({currentPhase.days})</span>
              </h4>
              <span className="text-[10px] text-rose-300 mt-0.5 block">
                سطح انرژی بیولوژیک: {currentPhase.energyLevel}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-300 flex items-center justify-center text-sm">
              🌸
            </div>
          </div>

          {/* Skin & Hair conditions */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
              <span className="font-bold text-stone-200 text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>وضعیت پوست:</span>
              </span>
              <p className="text-[10px] text-stone-300 leading-relaxed">
                {currentPhase.skinCondition}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
              <span className="font-bold text-stone-200 text-[11px] flex items-center gap-1">
                <Droplets className="w-3 h-3 text-blue-400" />
                <span>وضعیت موها:</span>
              </span>
              <p className="text-[10px] text-stone-300 leading-relaxed">
                {currentPhase.hairCondition}
              </p>
            </div>
          </div>

          {/* Recommended Action Routine */}
          <div className="p-3.5 rounded-2xl bg-stone-850/80 border border-stone-800 space-y-2">
            <span className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>روتین متناسب با این فاز:</span>
            </span>
            <div className="space-y-1.5">
              {currentPhase.recommendedRoutine.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] text-stone-300 bg-stone-900/60 p-2 rounded-xl">
                  <span className="w-4 h-4 rounded-full bg-rose-950 text-rose-300 flex items-center justify-center text-[10px] shrink-0 font-bold">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Outfit & Comfort Advice */}
          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
            <span className="font-bold text-teal-300 text-[11px] flex items-center gap-1">
              <Flower2 className="w-3.5 h-3.5" />
              <span>پیشنهاد پوشش و استایل:</span>
            </span>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              {currentPhase.outfitAdvice}
            </p>
          </div>

          {/* Quote Card */}
          <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-center">
            <p className="text-[11px] text-rose-200/90 italic leading-relaxed">
              {currentPhase.quote}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs"
          >
            متشکرم؛ روتین امروزم رو تنظیم کردم
          </button>
        </div>
      </div>
    </div>
  );
};
