import React, { useState } from 'react';
import {
  AlertCircle,
  Sparkles,
  Scale,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Scissors,
  Eye,
  AlertTriangle,
  ArrowRight,
  Flame,
  Check,
  Maximize2
} from 'lucide-react';
import { TriageResult, SecondOpinionResult } from '../../types';
import { requestTriage, requestSecondOpinion } from '../../services/api';
import { sounds } from '../../utils/soundEffects';

interface SosTabProps {
  onOpenGoodEnough: () => void;
  onOpenSecondOpinion: () => void;
  onOpenRoutine?: (time: number) => void;
  onOpenBeforeYouDoIt?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const SosTab: React.FC<SosTabProps> = ({
  onOpenGoodEnough,
  onOpenSecondOpinion,
  onOpenRoutine,
  onOpenBeforeYouDoIt,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'triage' | 'sos-categories' | 'second-opinion' | 'before-you-do-it'>('triage');

  // Triage state
  const [triageProblem, setTriageProblem] = useState<string>('مو و پوستم به‌هم ریخته، ۱۵ دقیقه دیگه باید برم بیرون و کلافه‌ام.');
  const [triageContext, setTriageContext] = useState<string>('فوری / قبل از خروج');
  const [isTriageLoading, setIsTriageLoading] = useState<boolean>(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  // Before You Do It state
  const [decisionQuery, setDecisionQuery] = useState<string>('کوتاهی زیاد مو یا چتری');
  const [beforeDoResult, setBeforeDoResult] = useState<string | null>(null);

  // Quick SOS Category click
  const handleQuickSosClick = (problemText: string, category: string) => {
    sounds.playChime('click');
    setTriageProblem(problemText);
    setActiveSubTab('triage');
    handleTriageSubmit(problemText, category);
  };

  const handleTriageSubmit = async (customProb?: string, customCat?: string) => {
    sounds.playChime('click');
    setIsTriageLoading(true);
    try {
      const res = await requestTriage(customProb || triageProblem, triageContext, customCat || 'عمومی');
      setTriageResult(res);
      sounds.playChime('complete');
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTriageLoading(false);
    }
  };

  const handleCheckBeforeDo = (decision: string) => {
    sounds.playChime('click');
    setDecisionQuery(decision);
    if (decision.includes('کوتاهی') || decision.includes('چتری')) {
      setBeforeDoResult(
        '۱. فرم رویش طبیعی مو: آیا موهایت فر یا وز است؟ چتری روی موی مواج نیاز به سشوار روزانه دارد.\n۲. زمان نگهداری: آیا حاضری هر صبح ۵ دقیقه برای استایل چتری وقت بگذاری؟\n۳. آزمون سنجاق: موها را از جلو بالا بزن یا با کلیپس تا کن تا حس آن را برای ۲ روز بدون قیچی زدن تجربه کنی.'
      );
    } else if (decision.includes('رنگ') || decision.includes('دکلره')) {
      setBeforeDoResult(
        '۱. هزینه و مراقبت مداوم: دکلره نیاز به شارژ ریشه هر ۶ هفته و ماسک‌های مغذی دارد.\n۲. سلامت بافت مو: اگر مو سابقه خشکی یا سوختگی دارد، اولویت بازسازی با اولاپلکس یا سرم‌های پروتئینه است.\n۳. جایگزین کم‌ریسک: بالیاژ لایت روی ساقه بدون دستکاری ریشه.'
      );
    } else {
      setBeforeDoResult(
        'قانون طلایی ۷۲ ساعت: اگر تصمیمت خرید یک آیتم گران‌قیمت یا پروسیجر زیبایی است، ۷۲ ساعت صبر کن. اگر باز هم با همان ضرورت حسش کردی، آنگاه با اطلاعات و مشورت اقدام کن.'
      );
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-red-950/50 via-stone-900 to-stone-950 border border-red-900/40 p-4 space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-950 text-red-300 flex items-center justify-center border border-red-800/60 shadow-xs">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-stone-100">حل بحران و تریـاژ (Beauty SOS)</h1>
              <p className="text-[10px] text-stone-400">وقتی کلافه‌ای، وقت کمه یا بین دو چیز مرددی</p>
            </div>
          </div>
          <button
            onClick={onOpenGoodEnough}
            className="text-[10px] bg-rose-950/80 text-rose-200 border border-rose-800/60 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>کافیه!</span>
          </button>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed bg-stone-950/70 p-3 rounded-2xl border border-stone-800">
          «همه چی قاطی شده؟» هوش مصنوعی اولویت‌بندی می‌کنه: الان مهم‌ترین چیه، بعدی چیه، و چی رو باید بی‌خیال شی تا بدون استرس بری سر کار یا قرارت.
        </p>
      </div>

      {/* Sub tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-900 rounded-2xl border border-stone-800">
        {[
          { id: 'triage', label: 'تریـاژ فوری' },
          { id: 'sos-categories', label: 'بحران‌های متداول' },
          { id: 'second-opinion', label: 'دوئل استایل (A vs B)' },
          { id: 'before-you-do-it', label: 'قبل از اینکه بکنی' },
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => {
              setActiveSubTab(st.id as any);
              sounds.playChime('click');
            }}
            className={`flex-1 py-1.5 text-[11px] font-medium rounded-xl transition-all ${
              activeSubTab === st.id
                ? 'bg-rose-950/80 text-rose-200 border border-rose-800/60 shadow-xs font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* 1. AI Triage */}
      {activeSubTab === 'triage' && (
        <div className="rounded-3xl bg-stone-900 border border-stone-800 p-4 space-y-3.5 shadow-md">
          <div className="border-b border-stone-800/80 pb-2">
            <h3 className="text-xs font-bold text-stone-200">الگوریتم تریـاژ زیبایی:</h3>
            <p className="text-[10px] text-stone-400 mt-0.5">تبدیل آشفتگی به ۳ اولویت مشخص، بدون سرزنش</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-stone-300 font-medium block">مشکل یا شرایط الانت چیه؟</label>
            <textarea
              rows={2}
              value={triageProblem}
              onChange={(e) => setTriageProblem(e.target.value)}
              placeholder="مثلاً: صورتم برق افتاده، خط چشمم کج شده و مانتوم چروکه، ۱۰ دقیقه هم وقت دارم..."
              className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-3 text-xs text-stone-200 focus:outline-none focus:border-rose-500 leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-stone-300 font-medium block">موقعیت و زمان باقی‌مانده:</label>
            <input
              type="text"
              value={triageContext}
              onChange={(e) => setTriageContext(e.target.value)}
              placeholder="مثلاً: قرار دوستانه، فقط ۱۰ دقیقه وقت"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            onClick={() => handleTriageSubmit()}
            disabled={isTriageLoading}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {isTriageLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                در حال نجات وضعیت...
              </span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>تریـاژ کن و اولویت بده</span>
              </>
            )}
          </button>

          {/* Triage Output */}
          {triageResult && (
            <div className="p-3.5 rounded-2xl bg-stone-950 border border-red-900/30 space-y-3 pt-3">
              <div className="text-xs font-bold text-rose-300">
                ✨ {triageResult.headline}
              </div>

              <div className="space-y-2">
                {/* P1 */}
                <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-900/40 text-xs">
                  <span className="font-bold text-red-300 block mb-0.5">
                    ۱. {triageResult.priority1.title}
                  </span>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    {triageResult.priority1.action}
                  </p>
                </div>

                {/* P2 */}
                <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs">
                  <span className="font-bold text-amber-300 block mb-0.5">
                    ۲. {triageResult.priority2.title}
                  </span>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    {triageResult.priority2.action}
                  </p>
                </div>

                {/* P3 */}
                <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs">
                  <span className="font-bold text-stone-300 block mb-0.5">
                    ۳. {triageResult.priority3.title}
                  </span>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    {triageResult.priority3.action}
                  </p>
                </div>
              </div>

              {/* Reassurance Note */}
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-[11px] text-emerald-200">
                🔒 {triageResult.reassuranceNote}
              </div>

              {/* Action Jump Buttons */}
              <div className="pt-1 flex gap-2">
                {onOpenRoutine && (
                  <button
                    onClick={() => onOpenRoutine(3)}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-md transition-colors"
                  >
                    <span>⏱️ شروع روتین ۳ دقیقه‌ای نجات</span>
                  </button>
                )}
                <button
                  onClick={onOpenGoodEnough}
                  className="py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 text-[11px] font-medium transition-colors"
                >
                  کافیه!
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Common SOS Categories */}
      {activeSubTab === 'sos-categories' && (
        <div className="space-y-2.5">
          <div className="text-[11px] text-stone-400 px-1">
            روی هر بحران ضربه بزن تا راهکار کم‌ریسک و فوری دریافت کنی:
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {[
              {
                icon: '🧴',
                cat: 'پوست',
                title: 'جوش ناگهانی و قرمزی پوست',
                prob: 'یک جوش قرمز ناگهانی زدم، نباید بهش دست بزنم؛ چطور محوش کنم؟',
                quickTip: 'یک تکه یخ را درون دستمال تمیز ۱ دقیقه روی جوش بگذار تا التهاب بخوابد، سپس یک نقطه کانسیلر با گوش پاک‌کن بزن و فیکس کن.'
              },
              {
                icon: '💇‍♀️',
                cat: 'مو',
                title: 'وز شدن و پف مو در هوای مرطوب',
                prob: 'موهام وز شده و فرم نمی‌گیره، وقت سشوار کشیدن هم ندارم.',
                quickTip: 'یک یا دو قطره سرم مو یا حتی مقدار خیلی کم لوسیون دست را کف دست گرم کن و فقط روی ساقه و موخوره بکش. بستن دم‌اسبی پایین سر عالی جواب می‌دهد.'
              },
              {
                icon: '💄',
                cat: 'میکاپ',
                title: 'ماسیدن کرم‌پودر یا خط افتادن زیر چشم',
                prob: 'کرم‌پودر زیر چشم یا دور بینی پوسته و ماسیده شده است.',
                quickTip: 'هرگز لایه جدید کرم‌پودر نزن! با نوک انگشت یا اسفنج کمی مرطوب‌کننده روی نقطه ماسیده ضربه بزن تا محصول در هم حل شود، سپس اضافه آن را با دستمال نرم بگیر.'
              },
              {
                icon: '👗',
                cat: 'استایل بدن',
                title: 'معذب بودن با لباس (Body Styling بدون تغییر وزن)',
                prob: 'احساس می‌کنم لباسم چاقم نشون می‌ده یا با بدنم راحت نیستم.',
                quickTip: 'لازم نیست اول بدنت رو تغییر بدی تا خوش‌استایل باشی! جلوی مانتو را باز بگذار و با یک شلوار راسته خط عمودی بساز. شال را روی شانه رها کن تا سیلوئت کشیده و رها شود.'
              },
              {
                icon: '🪞',
                cat: 'روانشناسی',
                title: 'وسواس چک کردن مداوم آینه و ترس از نگاه دیگران',
                prob: 'مدام حس می‌کنم امروز زشتم یا بقیه متوجه یک ایراد در صورتم می‌شن.',
                quickTip: 'دیگران به اندازه ۵٪ توجهی که تو به خودت داری، متوجه جزئیات چهره‌ات نیستند. یک چک نهایی بکن، آینه را ببند و توجهت را به کاری که باید انجام دهی معطوف کن.'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="p-3.5 rounded-3xl bg-stone-900 border border-stone-800 space-y-2 hover:border-stone-700 transition-colors shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-bold text-stone-200">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 bg-stone-950 px-2.5 py-0.5 rounded-full border border-stone-800">
                    {item.cat}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed bg-stone-950 p-2.5 rounded-2xl border border-stone-800">
                  💡 <span className="font-medium text-amber-300">اقدام فوری: </span>{item.quickTip}
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleQuickSosClick(item.prob, item.cat)}
                    className="text-[11px] text-rose-300 hover:text-rose-200 flex items-center gap-1 font-medium"
                  >
                    <span>تریـاژ اختصاصی با این شرایط</span>
                    <ArrowRight className="w-3 h-3 rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Second Opinion Duel trigger */}
      {activeSubTab === 'second-opinion' && (
        <div className="rounded-3xl bg-stone-900 border border-stone-800 p-4 space-y-3.5 shadow-md text-center">
          <div className="w-12 h-12 rounded-full bg-amber-950 text-amber-300 flex items-center justify-center mx-auto border border-amber-800/60 shadow-sm">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-xs font-bold text-stone-100">اسلایدر تطبیقی دوئل استایل (A vs B)</h3>
          <p className="text-[11px] text-stone-300 leading-relaxed max-w-xs mx-auto">
            دو تا عکس استایل رو آپلود کن یا اسمش رو بنویس؛ با اسلایدر وسط تصویر هر دو رو همزمان مقایسه کن و تفاوت‌های حسی، رسمیت و پیام بصری‌شون رو بررسی کن.
          </p>
          <button
            onClick={onOpenSecondOpinion}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Maximize2 className="w-4 h-4" />
            <span>باز کردن دوئل تصویری استایل</span>
          </button>
        </div>
      )}

      {/* 4. Before You Do It */}
      {activeSubTab === 'before-you-do-it' && (
        <div className="rounded-3xl bg-stone-900 border border-stone-800 p-4 space-y-3.5 shadow-md">
          <div className="border-b border-stone-800/80 pb-2">
            <h3 className="text-xs font-bold text-stone-200">Before You Do It (قبل از اینکه انجامش بدی)</h3>
            <p className="text-[10px] text-stone-400 mt-0.5">
              بررسی تصمیم‌های پرریسک یا نسبتاً برگشت‌ناپذیر زیبایی، قبل از پشیمانی
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] text-stone-300 font-medium block">تصمیم مد نظرت رو انتخاب کن:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'کوتاهی زیاد مو یا چتری زدن',
                'دکلره سنگین و بلوند پلاتینه',
                'خرید یک پالت آرایشی یا لباس گران‌قیمت',
                'تغییر فرم دائمی ابرو (فیبروز یا تتو)'
              ].map((dec, i) => (
                <button
                  key={i}
                  onClick={() => handleCheckBeforeDo(dec)}
                  className={`p-2.5 text-right rounded-2xl border text-xs transition-all ${
                    decisionQuery === dec
                      ? 'bg-rose-950/70 border-rose-500 text-rose-200 font-bold shadow-xs'
                      : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  {dec}
                </button>
              ))}
            </div>
          </div>

          {beforeDoResult && (
            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-700 space-y-2 text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>چک‌لیست قبل از اقدام:</span>
              </span>
              <p className="text-stone-300 text-[11px] leading-relaxed whitespace-pre-line bg-stone-900 p-3 rounded-xl border border-stone-800">
                {beforeDoResult}
              </p>
            </div>
          )}

          {onOpenBeforeYouDoIt && (
            <button
              onClick={onOpenBeforeYouDoIt}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <span>باز کردن شبیه‌ساز کامل سنجش پشیمانی (Before You Do It)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
