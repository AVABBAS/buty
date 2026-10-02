import React, { useState } from 'react';
import {
  BookOpen,
  Shield,
  HelpCircle,
  Moon,
  ShoppingBag,
  Sparkles,
  CheckCircle,
  XCircle,
  Heart,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { DEFENSE_LESSONS, MYTHS_QUIZ } from '../../data/beautyKnowledge';

interface WisdomTabProps {
  onOpenCycleBeauty?: () => void;
  onOpenSmartShopping?: () => void;
  onOpenBeautyDefense?: () => void;
}

export const WisdomTab: React.FC<WisdomTabProps> = ({
  onOpenCycleBeauty,
  onOpenSmartShopping,
  onOpenBeautyDefense,
}) => {
  const [activeSection, setActiveSection] = useState<'defense' | 'myths' | 'period' | 'shop'>('defense');
  const [openLessonId, setOpenLessonId] = useState<string>(DEFENSE_LESSONS[0].id);

  // Quiz state
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});

  const handleAnswer = (mythId: string, answer: boolean) => {
    setAnswers((prev) => ({ ...prev, [mythId]: answer }));
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-850 via-stone-850 to-stone-900 border border-stone-800 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/60 text-indigo-300 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-stone-100">مدرسه و هوشمندی زیبایی (Wisdom & Defense)</h1>
            <p className="text-[11px] text-stone-400">یادگیری دفاع از خود در برابر فشارهای روانی و تجاری زیبایی</p>
          </div>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed bg-stone-900/60 p-2.5 rounded-xl border border-stone-800/80">
          هدف جنگیدن با زیبایی نیست؛ هدف **استقلال تصمیم‌گیری** است تا بدانی کدام نیاز واقعاً برای توست و کدام حاصل القای تبلیغات و مقایسه‌های فیلترشده.
        </p>
      </div>

      {/* Sub tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-850 rounded-xl border border-stone-800">
        {[
          { id: 'defense', label: 'دفاع از خود' },
          { id: 'myths', label: 'درست یا غلط؟' },
          { id: 'period', label: 'مود پریود' },
          { id: 'shop', label: 'خرید نیازمحور' },
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => setActiveSection(st.id as any)}
            className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
              activeSection === st.id
                ? 'bg-rose-950/70 text-rose-200 border border-rose-800/60 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* 1. Beauty Defense */}
      {activeSection === 'defense' && (
        <div className="space-y-3">
          <div className="text-xs text-stone-400 px-1">
            درس‌های استقلال فکری و شناخت ترفندهای روانشناسی صنعت زیبایی:
          </div>

          <div className="space-y-2.5">
            {DEFENSE_LESSONS.map((lesson) => {
              const isOpen = openLessonId === lesson.id;
              return (
                <div
                  key={lesson.id}
                  className="rounded-2xl bg-stone-850 border border-stone-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenLessonId(isOpen ? '' : lesson.id)}
                    className="w-full p-3.5 text-right flex items-center justify-between hover:bg-stone-800/50 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40 inline-block mb-1">
                        {lesson.tag}
                      </span>
                      <h3 className="text-xs font-bold text-stone-100">{lesson.title}</h3>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </button>

                  {isOpen && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-stone-800 text-xs text-stone-300">
                      <p className="text-[11px] text-stone-300 leading-relaxed bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
                        {lesson.summary}
                      </p>
                      <div className="space-y-1.5">
                        <span className="font-semibold text-rose-300 text-[11px] block">چک‌لیست اقدام هوشمندانه:</span>
                        {lesson.actionChecklist.map((chk, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px] text-stone-300">
                            <span className="text-rose-400 text-xs font-bold">•</span>
                            <span className="leading-relaxed">{chk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {onOpenBeautyDefense && (
            <button
              onClick={onOpenBeautyDefense}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <span>🛡️ باز کردن رادار فیلترها و سپر دفاعی (Beauty Defense)</span>
            </button>
          )}
        </div>
      )}

      {/* 2. True or False Quiz */}
      {activeSection === 'myths' && (
        <div className="space-y-3">
          <div className="text-xs text-stone-400 px-1">
            باورهای رایج رو محک بزن؛ ببین علم و واقعیت چی میگن:
          </div>

          <div className="space-y-3">
            {MYTHS_QUIZ.map((myth) => {
              const userAns = answers[myth.id];
              const isAnswered = userAns !== undefined && userAns !== null;
              const isCorrect = userAns === myth.isTrue;

              return (
                <div
                  key={myth.id}
                  className="rounded-2xl bg-stone-850 border border-stone-800 p-4 space-y-3"
                >
                  <p className="text-xs font-bold text-stone-200 leading-relaxed">
                    ❓ {myth.question}
                  </p>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={isAnswered}
                      onClick={() => handleAnswer(myth.id, true)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        isAnswered && myth.isTrue
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          : userAns === true && !myth.isTrue
                          ? 'bg-red-950/60 border-red-500 text-red-300'
                          : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      درست است ✅
                    </button>
                    <button
                      disabled={isAnswered}
                      onClick={() => handleAnswer(myth.id, false)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        isAnswered && !myth.isTrue
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          : userAns === false && myth.isTrue
                          ? 'bg-red-950/60 border-red-500 text-red-300'
                          : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      غلط است ❌
                    </button>
                  </div>

                  {/* Explanation */}
                  {isAnswered && (
                    <div
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        isCorrect
                          ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-200'
                          : 'bg-amber-950/20 border-amber-900/50 text-amber-200'
                      }`}
                    >
                      <span className="font-bold block mb-1">
                        {isCorrect ? 'آفرین! کاملاً درسته:' : 'دقت کن! پاسخ صحیح:'}
                      </span>
                      <p className="text-[11px] text-stone-300 leading-relaxed">{myth.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Period Beauty Mode */}
      {activeSection === 'period' && (
        <div className="rounded-2xl bg-stone-850 border border-stone-800 p-4 space-y-3.5">
          <div className="flex items-center gap-2 border-b border-stone-800 pb-2.5">
            <Moon className="w-4 h-4 text-purple-400" />
            <div>
              <h3 className="text-xs font-bold text-stone-200">Period & Hormone-Aware Mode</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">در روزهای خاص، بدنت حق داره متفاوت باشه</p>
            </div>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
            «امروز قرار نیست رکورد بزنی.» افت استروژن یا افزایش پروژسترون می‌تواند باعث چرب شدن موقت پوست، احساس نفخ یا کم‌حوصلگی شود. زیبایی امروز یعنی **راحتی و مهربانی با بدن**.
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
              <span className="font-bold text-rose-300 block">۱. روتین پوستی ملایم (حداقل دستکاری)</span>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                از لایه‌برداری‌های قوی و اسیدهای تهاجمی خودداری کن؛ یک شوینده ملایم، مرطوب‌کننده با بافت ژلی و کمپرس آب ولرم کافیست.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
              <span className="font-bold text-purple-300 block">۲. استایل راحت و بدون فشار</span>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                شلوارهای کمرکش، لباس‌های پنبه‌ای آزاد با خطوط رها و کفش‌های نرم کژوال. هیچ کمربند یا لباسی نباید روی شکم فشار بیاورد.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
              <span className="font-bold text-amber-300 block">۳. موهای راحت</span>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                یک بافت شل فرانسوی یا کلیپس ابریشمی که به کف سر فشار نیاورد و سردرد ایجاد نکند.
              </p>
            </div>
          </div>

          {onOpenCycleBeauty && (
            <button
              onClick={onOpenCycleBeauty}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <span>🌙 تنظیم پیشرفته بر اساس روزهای چرخه ماهانه (Cycle Beauty)</span>
            </button>
          )}
        </div>
      )}

      {/* 4. Smart Need-Driven Shop */}
      {activeSection === 'shop' && (
        <div className="rounded-2xl bg-stone-850 border border-stone-800 p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-stone-200">فروشگاه نیازمحور (Shop by Need)</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">خرید فقط وقتی که واقعاً نیاز داری، نه از روی هیجان</p>
            </div>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-[11px] text-amber-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>هشدار هوشمند: اول تب «کمد و شلف من» را چک کن تا خرید تکراری انجام ندهی.</span>
          </div>

          {onOpenSmartShopping && (
            <button
              onClick={onOpenSmartShopping}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <span>⚖️ ماشین‌حساب هوشمند: بخرم یا نخرم؟ (Buy or Don't Buy)</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { title: 'نجات پوست خشک', desc: 'سرم هیالورونیک و کرم سد دفاعی', count: '۳ آیتم ضروری' },
              { title: 'میکاپ ۲ دقیقه‌ای', desc: 'تینت چندکاره، ژل ابرو و ضدآفتاب', count: 'پایه روتین' },
              { title: 'محافظت روزانه مو', desc: 'سرم ضدوز آرگان و برس چوبی', count: 'بدون آسیب' },
              { title: 'اکسسوری‌های کپسولی', desc: 'شال نخی تک‌رنگ و مینی‌بگ', count: 'چندکاره' }
            ].map((cat, i) => (
              <div key={i} className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <span className="font-bold text-stone-200 block">{cat.title}</span>
                <p className="text-[10px] text-stone-400">{cat.desc}</p>
                <span className="text-[9px] text-rose-300 font-latin block pt-1">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
