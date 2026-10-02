import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  RotateCcw,
  Bell,
  Award
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChallengeItem {
  id: string;
  title: string;
  category: string;
  description: string;
  whyItMatters: string;
  completed: boolean;
}

const INITIAL_CHALLENGES: ChallengeItem[] = [
  {
    id: 'ch1',
    title: 'امتحان یک رژ با تناژ کمی متفاوت',
    category: 'میکاپ سریع',
    description: 'امروز به جای رژ همیشگی، یک تناژ گرم‌تر (مثل کاراملی یا هلویی) را با انگشت روی لب ضربه بزن.',
    whyItMatters: 'کمی تنوع در چهره بدون ریسک و هزینه، خلق‌وخو را تازه می‌کند.',
    completed: false,
  },
  {
    id: 'ch2',
    title: 'تکنیک شال با گره شل و نامتقارن',
    category: 'استایل پوشش',
    description: 'یک طرف شال را بلندتر از طرف دیگر بینداز و بدون سنجاق سفت، اجازه بده رها روی شانه بماند.',
    whyItMatters: 'ایجاد خطوط نامتقارن بصری و کاهش حس خشکی و یکنواختی استایل.',
    completed: false,
  },
  {
    id: 'ch3',
    title: 'نوشیدن ۱ لیوان آب با چند قطره لیمو قبل از قهوه',
    category: 'شادابی طبیعی',
    description: 'آبرسانی اولیه به پوست اول صبح قبل از کافئین برای کاهش کدری و خشکی زیر چشم.',
    whyItMatters: 'زیبایی از گردش خون و رطوبت سلولی شروع می‌شود.',
    completed: false,
  },
  {
    id: 'ch4',
    title: 'پوشیدن یک لباس در کمد که بیش از ۲ ماه خاک خورده',
    category: 'کمد پایدار',
    description: 'یکی از شومیزها یا بافت‌های قدیمی‌ات را با یک شلوار جین جدید ترکیب کن.',
    whyItMatters: 'کشف مجدد ارزش داشته‌هایت بدون نیاز به خرید دوباره.',
    completed: false,
  }
];

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [challenges, setChallenges] = useState<ChallengeItem[]>(INITIAL_CHALLENGES);
  const [activeTab, setActiveTab] = useState<'challenges' | 'notifications'>('challenges');

  if (!isOpen) return null;

  const toggleChallenge = (id: string) => {
    sounds.playChime('click');
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  const completedCount = challenges.filter((c) => c.completed).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100">چالش‌های کوچک روزانه (Daily Challenges)</h3>
              <p className="text-[10px] text-stone-400">کشف ایده‌های نو، بدون استرس و بدون استریک اجباری</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="p-2.5 bg-stone-950 border-b border-stone-850 grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`py-1.5 rounded-xl border text-center transition-all ${
              activeTab === 'challenges'
                ? 'bg-rose-950/70 border-rose-500 text-rose-200 font-bold'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
            }`}
          >
            <span>🎯 چالش‌های امروز ({completedCount}/{challenges.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-1.5 rounded-xl border text-center transition-all ${
              activeTab === 'notifications'
                ? 'bg-rose-950/70 border-rose-500 text-rose-200 font-bold'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
            }`}
          >
            <span>🔔 پیام‌های آگاهی و یادآورها</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {activeTab === 'challenges' && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800">
                <span className="font-bold text-amber-300 text-xs block mb-1">اصل آرامش آینـا:</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  «هیچ رقابتی با دیگران وجود ندارد. حتی اگر هیچ چالشی را امروز انجام ندهی، ارزشمندی و زیبایی تو کم نمی‌شود. این فقط یک دعوت دوستانه به بازیگوشی در استایل است.»
                </p>
              </div>

              {challenges.map((c) => (
                <div
                  key={c.id}
                  onClick={() => toggleChallenge(c.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    c.completed
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                      : 'bg-stone-850 border-stone-800 hover:border-stone-700 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-bold text-xs ${
                        c.completed ? 'line-through text-stone-400 font-normal' : 'text-stone-100'
                      }`}
                    >
                      {c.title}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400">
                      {c.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">{c.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-stone-400 italic">💡 {c.whyItMatters}</span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      {c.completed ? '✓ انجام شد' : '○ لمس برای تیک زدن'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-bold text-teal-300 text-xs">موتور یادآورهای محترمانه (Notification Engine):</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  ما هیچ‌وقت پیام‌های سرزنش‌آمیز مثل «چرا به خودت نمی‌رسی؟» یا «پوستت داره پیر میشه!» نمی‌فرستیم. تمام پیام‌ها کاربردی، ابزاری و آرامش‌بخش هستند.
                </p>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-rose-300 block">نمونه پیام هوشمند صبحگاهی:</span>
                  <p className="text-stone-300">«امروز ۱۰ دقیقه وقت داری؟ یک برنامه سریع شادابی متناسب با هوای امروز برات آماده است.»</p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-amber-300 block">نمونه یادآوری کمد پایدار:</span>
                  <p className="text-stone-300">«کت کرم‌رنگ کمدت رو مدتیه نپوشیدی؛ یک ترکیب تازه با شلوار جین تیره براش پیشنهاد دادیم!»</p>
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
            بستن چالش‌ها
          </button>
        </div>
      </div>
    </div>
  );
};
