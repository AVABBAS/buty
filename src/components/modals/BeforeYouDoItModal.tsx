import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Scissors,
  Sparkles,
  ShoppingBag,
  Eye,
  CheckCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface BeforeYouDoItModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DecisionCategory {
  id: string;
  title: string;
  icon: string;
  riskLevel: 'بالا' | 'متوسط' | 'پایین';
  regretFactors: string[];
  maintenanceReality: string;
  lowRiskAlternative: string;
  cooldownHours: number;
}

const CATEGORIES: DecisionCategory[] = [
  {
    id: 'big-chop',
    title: 'کوتاهی شدید مو (پیکسی یا باب خیلی کوتاه)',
    icon: '✂️',
    riskLevel: 'بالا',
    regretFactors: [
      'حالت دادن روزانه موهای کوتاه معمولاً سخت‌تر از بستن ساده موهای بلند است.',
      'اگر موهای موج‌دار یا فر داری، قد مو بعد از خشک شدن خیلی کوتاه‌تر به نظر می‌رسد.',
      'تغییر بعد از یک شکست عاطفی یا خستگی روحی معمولاً منجر به پشیمانی بعد از دو هفته می‌شود.'
    ],
    maintenanceReality: 'نیاز به براشینگ روزانه، سشوار و کوتاه کردن هر ۴ هفته یک‌بار.',
    lowRiskAlternative: 'ابتدا موهایت را تا روی شانه (Lob) با لایه‌های نرم کوتاه کن، یا با گیره و شینیون کوتاهی مصنوعی بساز.',
    cooldownHours: 48,
  },
  {
    id: 'bleach-blonde',
    title: 'دکلره شدید و بلوند پلاتینه',
    icon: '✨',
    riskLevel: 'بالا',
    regretFactors: [
      'خشکی، سوختگی یا از بین رفتن الگوی طبیعی فر و موج مو.',
      'ریشه زدن موها بعد از تنها ۲۰ روز و هزینه مداوم رنگساژ.',
      'ناهماهنگی احتمالی با ته‌رنگ (Undertone) پوست صورت بدون آرایش روزانه.'
    ],
    maintenanceReality: 'روغن‌تراپی هفتگی، شامپو بنفش ضد زردی، سرم‌های ترمیم پیوند و آسیب دائمی به بافت مو.',
    lowRiskAlternative: 'تکنیک بالیاژ ملایم یا هایلایت شنی که ریشه مو دست‌نخورده بماند و نگهداری آسان داشته باشد.',
    cooldownHours: 72,
  },
  {
    id: 'microblading',
    title: 'میکروبلیدینگ یا تاتوی دائم ابرو',
    icon: '🖋️',
    riskLevel: 'متوسط',
    regretFactors: [
      'تغییر رنگ پیگمنت‌ها به سمت تناژ خاکستری یا قرمز با گذشت زمان.',
      'تغییر دائمی فرم طبیعی ابرو که با ترندهای آینده هماهنگ نیست.',
      'درد و احتمال ماندن اسکار روی بافت پوست نازک ابرو.'
    ],
    maintenanceReality: 'ترمیم‌های دردناک هر ۱ سال یک‌بار و عدم امکان تغییر آزادانه مدل آرایش ابرو.',
    lowRiskAlternative: 'صابون ابرو، ژل فیکساتور لیفت و مداد با نوک بسیار نازک برای کشیدن خطوط مویی موقت.',
    cooldownHours: 48,
  },
  {
    id: 'expensive-buy',
    title: 'خرید یک محصول آرایشی یا پوستی گران‌قیمت',
    icon: '🛍️',
    riskLevel: 'متوسط',
    regretFactors: [
      'آیا دقیقاً مشابه این محصول در کمد یا شلف آرایشت وجود ندارد؟',
      'آیا به خاطر حس کمبود لحظه‌ای یا تبلیغ اینفلوئنسرها ترغیب به خرید شدی؟',
      'بسیاری از محصولات گران فرمولاسیون مشابهی با گزینه‌های اقتصادی باکیفیت دارند.'
    ],
    maintenanceReality: 'خوابیدن سرمایه و تاریخ مصرف محصول که ظرف ۶ تا ۱۲ ماه منقضی می‌شود.',
    lowRiskAlternative: 'قانون ۴۸ ساعت انتظار در سبد خرید، یا تست تستر/سایز مینی قبل از خرید سایز کامل.',
    cooldownHours: 48,
  },
  {
    id: 'heavy-lashes',
    title: 'اکستنشن مژه سنگین و پرحجم',
    icon: '👁️',
    riskLevel: 'متوسط',
    regretFactors: [
      'احتمال ریزش مژه‌های طبیعی به دلیل وزن چسب و تارهای اکستنشن.',
      'محدودیت در شستشوی چشم‌ها و خوابیدن روی صورت.',
      'ظاهر مصنوعی و غیرطبیعی در روشنایی روز بدون میکاپ کامل.'
    ],
    maintenanceReality: 'ترمیم هر ۳ هفته یک‌بار، منع استفاده از پاک‌کننده‌های روغنی و احتمال سوزش چشم.',
    lowRiskAlternative: 'لیفت و لمینت مژه طبیعی یا استفاده از مژه‌های دانه‌ای موقت برای مهمانی‌ها.',
    cooldownHours: 24,
  }
];

export const BeforeYouDoItModal: React.FC<BeforeYouDoItModalProps> = ({ isOpen, onClose }) => {
  const [selectedId, setSelectedId] = useState<string>('big-chop');
  const [cooldownStarted, setCooldownStarted] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentCategory = CATEGORIES.find((c) => c.id === selectedId) || CATEGORIES[0];

  const handleStartCooldown = () => {
    sounds.playChime('step');
    setCooldownStarted(true);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                <span>قبل از اینکه انجامش بدی (Before You Do It)</span>
              </h3>
              <p className="text-[10px] text-stone-400">سنجش ریسک، نگهداری و پشیمانی قبل از تصمیمات پرهزینه</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="p-2.5 bg-stone-950 border-b border-stone-850 flex gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedId(cat.id);
                setCooldownStarted(false);
                sounds.playChime('click');
              }}
              className={`px-3 py-1.5 rounded-xl border shrink-0 flex items-center gap-1.5 text-xs transition-all ${
                selectedId === cat.id
                  ? 'bg-amber-950/50 border-amber-500 text-amber-200 font-bold'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="truncate max-w-[120px]">{cat.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Title & Risk Badge */}
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-stone-100 text-xs">{currentCategory.title}</h4>
              <span className="text-[10px] text-stone-400">بررسی همه‌جانبه پیش از اقدام</span>
            </div>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                currentCategory.riskLevel === 'بالا'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800'
              }`}
            >
              ریسک پشیمانی: {currentCategory.riskLevel}
            </span>
          </div>

          {/* Regret Factors */}
          <div className="space-y-2">
            <h5 className="font-bold text-stone-200 text-xs flex items-center gap-1">
              <span>⚠️ مواردی که معمولاً بعد از ۲ هفته پشیمان می‌کنند:</span>
            </h5>
            <div className="space-y-1.5">
              {currentCategory.regretFactors.map((fact, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-stone-850 border border-stone-800 text-[11px] text-stone-300 leading-relaxed flex gap-2"
                >
                  <span className="text-rose-400 shrink-0 font-bold">•</span>
                  <span>{fact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Maintenance Reality */}
          <div className="p-3 rounded-2xl bg-stone-850/80 border border-stone-800 space-y-1.5">
            <span className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>واقعیت نگهداری و زحمت روزانه:</span>
            </span>
            <p className="text-[11px] text-stone-300 leading-relaxed pr-4">
              {currentCategory.maintenanceReality}
            </p>
          </div>

          {/* Low Risk Alternative */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-800/40 space-y-1.5">
            <span className="font-bold text-emerald-300 text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>جایگزین هوشمندانه و کم‌ریسک (توصیه آینـا):</span>
            </span>
            <p className="text-[11px] text-stone-200 leading-relaxed pr-4 font-medium">
              {currentCategory.lowRiskAlternative}
            </p>
          </div>

          {/* Cooldown Section */}
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-stone-300 font-bold">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>قانون وقفه هوشمند ({currentCategory.cooldownHours} ساعته)</span>
            </div>
            <p className="text-[10px] text-stone-400 leading-relaxed">
              «به خودت {currentCategory.cooldownHours} ساعت فرصت بده. اگر بعد از گذشت این زمان هنوز با همان هیجان خواهانش بودی، یعنی تصمیمت هوسی نیست.»
            </p>
            {cooldownStarted ? (
              <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-700/60 text-blue-300 text-[11px] font-bold">
                ✓ مهلت وقفه ثبت شد؛ تا ۴۸ ساعت آینده این تصمیم را بازبینی نکن!
              </div>
            ) : (
              <button
                onClick={handleStartCooldown}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                شروع مهلت {currentCategory.cooldownHours} ساعته فکر کردن
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs"
          >
            متوجه شدم؛ با احتیاط تصمیم می‌گیرم
          </button>
        </div>
      </div>
    </div>
  );
};
