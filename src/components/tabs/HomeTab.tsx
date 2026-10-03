import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  Battery,
  Smile,
  CheckCircle2,
  ArrowRight,
  Shirt,
  Wand2,
  AlertCircle,
  ShieldCheck,
  Check,
  Compass,
  Play,
  Layers,
  Scale,
  Camera,
  Heart,
  Flame,
  ChevronRight,
  Award
} from 'lucide-react';
import { EnergyLevel, MoodType, TimeOption, TabType, TodayPlanResult } from '../../types';
import { WISDOM_QUOTES } from '../../data/beautyKnowledge';
import { requestTodayPlan } from '../../services/api';
import { sounds } from '../../utils/soundEffects';

interface HomeTabProps {
  onNavigateTab: (tab: TabType, extraState?: any) => void;
  onOpenGoodEnough: () => void;
  onOpenCoach: () => void;
  onOpenScanner: () => void;
  onOpenRoutine: (time: number) => void;
  onOpenMixer: () => void;
  onOpenSecondOpinion: () => void;
  onOpenReadyCheck: () => void;
  onOpenBeforeYouDoIt: () => void;
  onOpenCycleBeauty: () => void;
  onOpenIntimateCare: () => void;
  onOpenBeautyDefense: () => void;
  onOpenSmartShopping: () => void;
  onOpenPhotoCoach: () => void;
  onOpenExpressVibes: (mode: 'surprise' | 'cute' | 'refresh') => void;
  onOpenSearch: () => void;
  onOpenMakeupStudio: () => void;
  onOpenHairStudio: () => void;
  onOpenSkinProblemSolver: () => void;
  onOpenBodyAccessories: () => void;
  onOpenDailyChallenge: () => void;
  onOpenPremium?: () => void;
  isPremium?: boolean;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  onNavigateTab,
  onOpenGoodEnough,
  onOpenCoach,
  onOpenScanner,
  onOpenRoutine,
  onOpenMixer,
  onOpenSecondOpinion,
  onOpenReadyCheck,
  onOpenBeforeYouDoIt,
  onOpenCycleBeauty,
  onOpenIntimateCare,
  onOpenBeautyDefense,
  onOpenSmartShopping,
  onOpenPhotoCoach,
  onOpenExpressVibes,
  onOpenSearch,
  onOpenMakeupStudio,
  onOpenHairStudio,
  onOpenSkinProblemSolver,
  onOpenBodyAccessories,
  onOpenDailyChallenge,
  onOpenPremium,
  isPremium,
}) => {
  // Daily Check States
  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [mood, setMood] = useState<MoodType>('good');
  const [timeMinutes, setTimeMinutes] = useState<TimeOption>(10);
  const [occasion, setOccasion] = useState<string>('روزمره / کار');
  const [isLoadingPlan, setIsLoadingPlan] = useState<boolean>(false);
  const [todayPlan, setTodayPlan] = useState<TodayPlanResult | null>({
    title: 'برنامه درخشش ۱۰ دقیقه‌ای امروز',
    vibeSummary: 'طراحی شده برای حس شاداب، انرژی متعادل و استایل آراسته',
    actions: [
      { time: '۲ دقیقه', title: 'طراوت و آبرسانی پوست', desc: 'شستشوی ملایم صورت با آب خنک، مرطوب‌کننده سبک و ضدآفتاب بدون رد سفیدی', done: false },
      { time: '۵ دقیقه', title: 'میکاپ سبک و شاداب', desc: 'شانه کردن ابروها با ژل بی‌رنگ + چند ضربه تینت هلویی روی سیب گونه و مرکز لب', done: false },
      { time: '۳ دقیقه', title: 'مو و استایل شال', desc: 'جمع کردن مو با کلیپس مینیمال یا رها کردن موج‌های طبیعی + تنظیم شال رنگ کرم/شنی با شومیز', done: false }
    ],
    goodEnoughMessage: 'همین سه مرحله کافیه؛ بیشتر دستکاری نکن. آماده‌ای و عالی شدی!'
  });

  const [wisdomIndex, setWisdomIndex] = useState(0);
  const [challengeDone, setChallengeDone] = useState(false);

  const moodsList: Array<{ id: MoodType; label: string; emoji: string }> = [
    { id: 'calm', label: 'آرام', emoji: '😌' },
    { id: 'good', label: 'خوب', emoji: '🙂' },
    { id: 'tired', label: 'خسته', emoji: '😴' },
    { id: 'stressed', label: 'تحت فشار', emoji: '😣' },
    { id: 'creative', label: 'خلاق', emoji: '🎨' },
    { id: 'low', label: 'بی‌حوصله', emoji: '😔' },
  ];

  const occasionsList = [
    'روزمره / کار',
    'دانشگاه و درس',
    'قرار و دورهمی',
    'مهمانی و جشن',
    'خونه و استراحت',
    'عکاسی و استوری',
    'روزهای پریود و کم‌انرژی'
  ];

  const handleGenerateTodayPlan = async () => {
    sounds.playChime('click');
    setIsLoadingPlan(true);
    try {
      const plan = await requestTodayPlan(energy, mood, timeMinutes, occasion);
      setTodayPlan(plan);
      sounds.playChime('step');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const toggleActionDone = (index: number) => {
    if (!todayPlan) return;
    sounds.playChime('step');
    const newActions = [...todayPlan.actions];
    newActions[index].done = !newActions[index].done;
    setTodayPlan({ ...todayPlan, actions: newActions });
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Luxury Editorial Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border border-white/[0.08] p-5 text-stone-100 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
        <div className="absolute -top-16 -left-16 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-amber-300/90 tracking-widest font-latin uppercase">
              AYNA EDITORIAL BEAUTY
            </span>
            <button
              onClick={onOpenGoodEnough}
              className="text-[11px] bg-rose-950/50 hover:bg-rose-900/80 active:scale-95 text-rose-200 border border-rose-500/30 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-300" />
              <span className="font-semibold">کافیه! (Good Enough)</span>
            </button>
          </div>

          <h1 className="text-xl font-extrabold leading-snug text-stone-50 tracking-tight">
            «هر چیزی که خوشت میاد، نسخه مناسب خودت رو بساز.»
          </h1>
          <p className="text-xs text-stone-300 leading-relaxed max-w-sm">
            ببین چی به تو میاد، با چیزهایی که داری شروع کن و فقط چیزهایی رو انتخاب کن که واقعاً لازم داری.
          </p>

          {/* Interactive Feature Hero Buttons */}
          <div className="pt-2 grid grid-cols-2 gap-2.5">
            <button
              onClick={onOpenScanner}
              className="p-3 rounded-2xl bg-stone-900/90 hover:bg-stone-850 active:scale-98 border border-amber-500/30 text-stone-100 flex items-center gap-2.5 transition-all shadow-sm group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-amber-500/30">
                <Camera className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="text-xs font-bold block text-stone-100">آینه و اسکن چهره</span>
                <span className="text-[10px] text-amber-300/80 block">تحلیل فرم و آندرتون</span>
              </div>
            </button>

            <button
              onClick={() => onOpenRoutine(timeMinutes)}
              className="p-3 rounded-2xl bg-stone-900/90 hover:bg-stone-850 active:scale-98 border border-rose-500/30 text-stone-100 flex items-center gap-2.5 transition-all shadow-sm group"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-rose-500/30">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <div className="text-right">
                <span className="text-xs font-bold block text-stone-100">پلیر زنده روتین</span>
                <span className="text-[10px] text-rose-300/80 block">تایمر صوتی {timeMinutes} دقیقه‌ای</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Unified Search Quick Bar (جستجوی یکپارچه هوشمند) */}
      <div
        onClick={onOpenSearch}
        className="p-3.5 rounded-2xl bg-stone-900/90 hover:bg-stone-850 active:scale-98 border border-white/[0.08] hover:border-rose-500/40 transition-all cursor-pointer flex items-center justify-between shadow-sm group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-stone-950 border border-white/[0.08] text-stone-400 group-hover:text-rose-300 flex items-center justify-center transition-colors">
            <span className="text-sm">🔍</span>
          </div>
          <div>
            <span className="text-xs font-bold text-stone-200 block group-hover:text-rose-200 transition-colors">
              جستجو در تکنیک‌ها، مشکلات، استایل‌ها و مقالات...
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              مثلاً: «چشم افتاده»، «منافذ پوست»، «شال مونوکروم»، «جوش»
            </span>
          </div>
        </div>
        <span className="text-[10px] text-rose-300 font-latin tracking-wider uppercase font-semibold">
          SEARCH
        </span>
      </div>

      {/* VIP Premium Promotional Banner */}
      {!isPremium && onOpenPremium && (
        <div
          onClick={onOpenPremium}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 hover:from-amber-500/25 hover:to-rose-500/25 border border-amber-500/40 transition-all cursor-pointer flex items-center justify-between shadow-xs group active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-400 text-stone-950 flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
                  ارتقا به آینـا پریمیوم (VIP Atelier)
                </span>
                <span className="text-[9px] bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded font-extrabold">
                  ۳۰٪ تخفیف
                </span>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">
                اسکن نامحدود چهره، شبیه‌ساز ست کمد و چت ۲۴ ساعته با هوش مصنوعی
              </p>
            </div>
          </div>
          <span className="text-[10px] text-amber-300 font-latin font-bold bg-amber-950/80 border border-amber-600/50 px-2.5 py-1 rounded-xl shrink-0">
            مشاهده
          </span>
        </div>
      )}

      {/* Specialized Studios Grid (استودیوهای ۵ گانه تخصصی) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-stone-200 flex items-center gap-2">
            <span>استودیوهای تخصصی زیبایی و استایل</span>
            <span className="text-[10px] text-rose-300 font-latin tracking-wider uppercase font-semibold">STUDIOS</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          {/* Studio 1: Makeup AI */}
          <button
            onClick={onOpenMakeupStudio}
            className="p-3.5 rounded-2xl bg-stone-900/90 hover:bg-stone-850 active:scale-98 border border-white/[0.06] hover:border-rose-500/30 text-right transition-all flex flex-col justify-between shadow-sm group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">💄</span>
              <span className="text-[10px] text-rose-300/90 font-latin tracking-wider uppercase font-semibold">Makeup</span>
            </div>
            <div>
              <span className="font-bold text-stone-100 block text-xs group-hover:text-rose-200 transition-colors">استودیوی میکاپ AI</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">چشم، کانتور، لب و تینت</span>
            </div>
          </button>

          {/* Studio 2: Hair Studio */}
          <button
            onClick={onOpenHairStudio}
            className="p-3.5 rounded-2xl bg-stone-900/90 hover:bg-stone-850 active:scale-98 border border-white/[0.06] hover:border-amber-500/30 text-right transition-all flex flex-col justify-between shadow-sm group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">💇‍♀️</span>
              <span className="text-[10px] text-amber-300/90 font-latin tracking-wider uppercase font-semibold">Hair</span>
            </div>
            <div>
              <span className="font-bold text-stone-100 block text-xs group-hover:text-amber-200 transition-colors">استودیوی مو و شینیون</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">چتری، براشینگ و نجات وز</span>
            </div>
          </button>

          {/* Studio 3: Skin Problem Solver */}
          <button
            onClick={onOpenSkinProblemSolver}
            className="p-3.5 rounded-2xl bg-stone-900/90 hover:bg-stone-850 active:scale-98 border border-white/[0.06] hover:border-teal-500/30 text-right transition-all flex flex-col justify-between shadow-sm group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🧴</span>
              <span className="text-[10px] text-teal-300/90 font-latin tracking-wider uppercase font-semibold">Skin</span>
            </div>
            <div>
              <span className="font-bold text-stone-100 block text-xs group-hover:text-teal-200 transition-colors">حل دغدغه‌های پوست</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">پوسته، جوش و ماسیدن کرم</span>
            </div>
          </button>

          {/* Studio 4: Body & Accessories */}
          <button
            onClick={onOpenBodyAccessories}
            className="p-3.5 rounded-2xl bg-stone-900/90 hover:bg-stone-850 active:scale-98 border border-white/[0.06] hover:border-purple-500/30 text-right transition-all flex flex-col justify-between shadow-sm group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">👗</span>
              <span className="text-[10px] text-purple-300/90 font-latin tracking-wider uppercase font-semibold">Style</span>
            </div>
            <div>
              <span className="font-bold text-stone-100 block text-xs group-hover:text-purple-200 transition-colors">فرم بدن، اکسسوری و عطر</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">خطوط یقه و ۳ لوک با ۱ لباس</span>
            </div>
          </button>

          {/* Studio 5: Daily Challenges */}
          <button
            onClick={onOpenDailyChallenge}
            className="p-3.5 rounded-2xl bg-stone-900/90 hover:bg-stone-850 active:scale-98 border border-white/[0.06] hover:border-emerald-500/30 text-right transition-all flex flex-col justify-between shadow-sm col-span-2 sm:col-span-1 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🎯</span>
              <span className="text-[10px] text-emerald-300/90 font-latin tracking-wider uppercase font-semibold">Challenge</span>
            </div>
            <div>
              <span className="font-bold text-stone-100 block text-xs group-hover:text-emerald-200 transition-colors">چالش‌های روزانه و یادآورها</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">کشف تنوع استایل بدون استرس</span>
            </div>
          </button>
        </div>
      </div>

      {/* "امروز چی می‌خوای؟" Problem-First Direct Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
            <span>امروز چی می‌خوای؟</span>
            <span className="text-[10px] text-stone-400 font-normal">کلیک مستقیم</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Option 1: Make It Mine */}
          <button
            onClick={() => onNavigateTab('make-it-mine')}
            className="flex flex-col text-right p-3.5 rounded-2xl bg-stone-900/90 hover:bg-stone-850 active:scale-98 border border-white/[0.06] hover:border-rose-500/30 transition-all group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-rose-500/30">
              <Wand2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-stone-100 group-hover:text-rose-200 transition-colors">📸 این عکس رو برام بساز</span>
            <span className="text-[10px] text-stone-400 mt-0.5 leading-relaxed">تبدیل ترند اینستاگرام به نسخه خودت</span>
          </button>

          {/* Option 2: Outfit Mixer */}
          <button
            onClick={onOpenMixer}
            className="flex flex-col text-right p-3.5 rounded-2xl bg-stone-900/90 hover:bg-stone-850 active:scale-98 border border-white/[0.06] hover:border-teal-500/30 transition-all group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-teal-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-stone-100 group-hover:text-teal-200 transition-colors">👗 استودیو ست کردن لباس</span>
            <span className="text-[10px] text-stone-400 mt-0.5 leading-relaxed">ست زنده مانکن کمد و سنجش هارمونی</span>
          </button>

          {/* Option 3: Second Opinion Duel */}
          <button
            onClick={onOpenSecondOpinion}
            className="flex flex-col text-right p-3.5 rounded-2xl bg-stone-900/90 hover:bg-stone-850 active:scale-98 border border-white/[0.06] hover:border-amber-500/30 transition-all group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-amber-500/30">
              <Scale className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-stone-100 group-hover:text-amber-200 transition-colors">⚖️ دوئل استایل (A vs B)</span>
            <span className="text-[10px] text-stone-400 mt-0.5 leading-relaxed">اسلایدر مقایسه تصویری دو انتخاب</span>
          </button>

          {/* Option 4: Beauty SOS */}
          <button
            onClick={() => onNavigateTab('sos')}
            className="flex flex-col text-right p-3.5 rounded-2xl bg-stone-900/90 hover:bg-stone-850 active:scale-98 border border-white/[0.06] hover:border-rose-500/30 transition-all group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-950/80 text-rose-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-rose-800/40">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-stone-100 group-hover:text-rose-200 transition-colors">🆘 بحران زیبایی / تریـاژ</span>
            <span className="text-[10px] text-stone-400 mt-0.5 leading-relaxed">جوش، وز مو، ماسیدن آرایش، کلافگی</span>
          </button>
        </div>
      </div>

      {/* Specialized Power Tools Grid (فیچرهای تکمیلی تخصصی) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
            <span>جعبه‌ابزار تخصصی و هوشمند آینـا</span>
            <span className="text-[10px] text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded font-latin">POWER TOOLS</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* 1. Ready Check */}
          <button
            onClick={onOpenReadyCheck}
            className="p-3 rounded-2xl bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-emerald-800/60 text-right transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base">✅</span>
              <span className="text-[9px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded font-latin">Checklist</span>
            </div>
            <div>
              <span className="font-bold text-stone-200 block text-xs">چک‌لیست خروج</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">۱۱ گام مطمئن قبل از رفتن</span>
            </div>
          </button>

          {/* 2. Before You Do It */}
          <button
            onClick={onOpenBeforeYouDoIt}
            className="p-3 rounded-2xl bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-amber-800/60 text-right transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base">✂️</span>
              <span className="text-[9px] text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded font-latin">Reality</span>
            </div>
            <div>
              <span className="font-bold text-stone-200 block text-xs">قبل از اینکه انجام بدی</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">سنجش پشیمانی کوتاهی و دکلره</span>
            </div>
          </button>

          {/* 3. Cycle Beauty */}
          <button
            onClick={onOpenCycleBeauty}
            className="p-3 rounded-2xl bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-rose-800/60 text-right transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base">🌙</span>
              <span className="text-[9px] text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded font-latin">Hormone</span>
            </div>
            <div>
              <span className="font-bold text-stone-200 block text-xs">چرخه ماهانه و پوست</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">تطبیق استایل با انرژی بیولوژیک</span>
            </div>
          </button>

          {/* 4. Smart Shopping */}
          <button
            onClick={onOpenSmartShopping}
            className="p-3 rounded-2xl bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-teal-800/60 text-right transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base">🛍️</span>
              <span className="text-[9px] text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded font-latin">Shopping</span>
            </div>
            <div>
              <span className="font-bold text-stone-200 block text-xs">بخرم یا نخرم؟</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">ماشین‌حساب فیلتر خرید هیجانی</span>
            </div>
          </button>

          {/* 5. Photo Coach */}
          <button
            onClick={onOpenPhotoCoach}
            className="p-3 rounded-2xl bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-blue-800/60 text-right transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base">📸</span>
              <span className="text-[9px] text-blue-400 bg-blue-950/80 px-1.5 py-0.5 rounded font-latin">Photo</span>
            </div>
            <div>
              <span className="font-bold text-stone-200 block text-xs">مربی عکاسی و استوری</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">زاویه لنز، نور و ژست طبیعی</span>
            </div>
          </button>

          {/* 6. Intimate Care */}
          <button
            onClick={onOpenIntimateCare}
            className="p-3 rounded-2xl bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-teal-800/60 text-right transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base">🧼</span>
              <span className="text-[9px] text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded font-latin">Care</span>
            </div>
            <div>
              <span className="font-bold text-stone-200 block text-xs">مراقبت بهداشتی فردی</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">بهداشت، تنوع طبیعی و تریاژ</span>
            </div>
          </button>

          {/* 7. Beauty Defense */}
          <button
            onClick={onOpenBeautyDefense}
            className="p-3 rounded-2xl bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-purple-800/60 text-right transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base">🛡️</span>
              <span className="text-[9px] text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded font-latin">Anti-FOMO</span>
            </div>
            <div>
              <span className="font-bold text-stone-200 block text-xs">سپر دفاعی زیبایی</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">تشخیص فیلترها و دروغ تبلیغات</span>
            </div>
          </button>

          {/* 8. Express Vibes: Cute / Surprise / Refresh */}
          <button
            onClick={() => onOpenExpressVibes('cute')}
            className="p-3 rounded-2xl bg-gradient-to-tr from-stone-900 to-rose-950/40 hover:bg-stone-850 border border-stone-800 hover:border-rose-700/60 text-right transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base">🎀</span>
              <span className="text-[9px] text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded font-latin">Cute Mode</span>
            </div>
            <div>
              <span className="font-bold text-stone-200 block text-xs">پکیج صورتی کیوت</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">آرایش، لباس و موی شاداب</span>
            </div>
          </button>
        </div>
      </div>

      {/* Interactive Daily Context ("امروز چطوری؟") */}
      <div className="rounded-3xl bg-stone-900 border border-stone-800 p-4 space-y-3.5 shadow-md">
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
          <div>
            <h3 className="text-xs font-bold text-stone-100">امروز چطوری؟ (Personalized Context)</h3>
            <p className="text-[10px] text-stone-400 mt-0.5">تنظیم اقدامات دقیق بر اساس انرژی و زمان واقعی‌ات</p>
          </div>
          <span className="text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/50">
            Smart Check
          </span>
        </div>

        {/* 1. Energy */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-stone-300 flex items-center gap-1.5 font-medium">
            <Battery className="w-3.5 h-3.5 text-amber-300" />
            <span>سطح انرژی‌ات:</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'low' as EnergyLevel, label: 'کم و خسته 🔋' },
              { id: 'medium' as EnergyLevel, label: 'معمولی 🟡' },
              { id: 'high' as EnergyLevel, label: 'پرانرژی ⚡' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setEnergy(item.id);
                  sounds.playChime('click');
                }}
                className={`py-2 text-[11px] rounded-xl border transition-all ${
                  energy === item.id
                    ? 'bg-rose-950/70 border-rose-500 text-rose-200 font-bold shadow-xs'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Mood */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-stone-300 flex items-center gap-1.5 font-medium">
            <Smile className="w-3.5 h-3.5 text-rose-300" />
            <span>حس و حال الانت:</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {moodsList.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMood(m.id);
                  sounds.playChime('click');
                }}
                className={`py-1.5 px-1 text-[11px] rounded-xl border flex items-center justify-center gap-1 transition-all ${
                  mood === m.id
                    ? 'bg-rose-950/70 border-rose-500 text-rose-200 font-bold shadow-xs'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Time Available */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-stone-300 flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-blue-300" />
            <span>چقدر وقت داری؟</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {([3, 10, 20, 45] as TimeOption[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTimeMinutes(t);
                  sounds.playChime('click');
                }}
                className={`py-1.5 text-[11px] rounded-xl border transition-all ${
                  timeMinutes === t
                    ? 'bg-rose-950/70 border-rose-500 text-rose-200 font-bold shadow-xs'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {t} دقیقه
              </button>
            ))}
          </div>
        </div>

        {/* 4. Occasion */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-stone-300 flex items-center gap-1.5 font-medium">
            <Compass className="w-3.5 h-3.5 text-emerald-300" />
            <span>موقعیت و مقصد:</span>
          </label>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-rose-500"
          >
            {occasionsList.map((occ) => (
              <option key={occ} value={occ}>
                {occ}
              </option>
            ))}
          </select>
        </div>

        {/* Generate Button */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleGenerateTodayPlan}
            disabled={isLoadingPlan}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {isLoadingPlan ? (
              <span className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                در حال طراحی برنامه امروز...
              </span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>بروزرسانی برنامه ({timeMinutes} دقیقه)</span>
              </>
            )}
          </button>

          {/* Launch Live Routine Player */}
          <button
            onClick={() => onOpenRoutine(timeMinutes)}
            className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 shrink-0"
            title="اجرای زنده با تایمر صوتی"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>تایمر زنده</span>
          </button>
        </div>
      </div>

      {/* Generated Today Plan Card */}
      {todayPlan && (
        <div className="rounded-3xl bg-stone-900 border border-rose-900/30 p-4 space-y-3 shadow-md">
          <div className="flex items-start justify-between border-b border-stone-800/80 pb-2.5">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-rose-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
                <span>{todayPlan.title}</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">{todayPlan.vibeSummary}</p>
            </div>
            <span className="text-[10px] text-stone-300 bg-stone-950 px-2.5 py-0.5 rounded-full border border-stone-800 font-latin">
              {timeMinutes}m
            </span>
          </div>

          {/* Action Steps */}
          <div className="space-y-2">
            {todayPlan.actions.map((act, idx) => (
              <div
                key={idx}
                onClick={() => toggleActionDone(idx)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  act.done
                    ? 'bg-rose-950/20 border-rose-800/40 opacity-75'
                    : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                    act.done
                      ? 'bg-rose-500 text-stone-950 font-bold'
                      : 'border border-stone-600 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${act.done ? 'line-through text-stone-400' : 'text-stone-200'}`}>
                      {act.title}
                    </span>
                    <span className="text-[10px] text-stone-400 font-latin">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Good Enough Banner */}
          <div className="p-2.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-300 text-[11px]">✨ {todayPlan.goodEnoughMessage}</span>
            <button
              onClick={onOpenGoodEnough}
              className="text-[11px] text-rose-300 hover:text-rose-200 underline font-medium whitespace-nowrap mr-2"
            >
              بستن آینه
            </button>
          </div>
        </div>
      )}

      {/* "کاش زودتر می‌دونستم" Wisdom Pearl */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-stone-800 p-4 space-y-2 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="text-amber-300 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>کاش زودتر می‌دونستم</span>
          </span>
          <button
            onClick={() => {
              sounds.playChime('click');
              setWisdomIndex((prev) => (prev + 1) % WISDOM_QUOTES.length);
            }}
            className="text-[11px] text-stone-400 hover:text-stone-200 underline"
          >
            نکته بعدی
          </button>
        </div>
        <p className="text-xs text-stone-200 leading-relaxed italic">
          «{WISDOM_QUOTES[wisdomIndex].text}»
        </p>
        <div className="flex items-center justify-between pt-1 text-[10px] text-stone-500">
          <span>موضوع: {WISDOM_QUOTES[wisdomIndex].theme}</span>
          <span>آینـا | هوشمندی زیبایی</span>
        </div>
      </div>
    </div>
  );
};
