import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Scissors,
  Eye,
  Smile,
  Heart,
  CheckCircle,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Palette,
  ChevronRight,
  Flame
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface MakeupHairStudioModalProps {
  isOpen: boolean;
  initialTab?: 'makeup' | 'hair' | 'nails';
  onClose: () => void;
  onSaveFeedback?: (feedback: string) => void;
}

interface TechniqueModule {
  id: string;
  category: 'makeup' | 'hair' | 'nails';
  title: string;
  vibe: string;
  toolsNeeded: string[];
  steps: string[];
  commonMistakes: string;
  colorSuggestion: string;
}

const TECHNIQUES: TechniqueModule[] = [
  // Makeup
  {
    id: 'm1',
    category: 'makeup',
    title: 'میکاپ نچرال نامرئی (No-Makeup Makeup)',
    vibe: 'Everyday Freshness',
    toolsNeeded: ['تینت پوستی یا بی‌بی‌کرم', 'کانسیلر سبک', 'تینت لب و گونه', 'ژل ابروی بی‌رنگ'],
    steps: [
      'آبرسانی عمیق پوست قبل از هر چیزی تا پوست درخشش طبیعی داشته باشد.',
      'کانسیلر فقط روی نقاط قرمز، لک و تیرگی گوشه داخلی چشم (نه کل صورت).',
      'چند ضربه تینت هلویی با سر انگشت روی استخوان گونه و پل بینی برای حس سرخی طبیعی.',
      'شانه کردن ابروها به سمت بالا و تثبیت با ژل بدون رنگ.'
    ],
    commonMistakes: 'استفاده از پودر مات‌کننده سنگین در کل صورت که حس طراوت و جوانی پوست را می‌گیرد.',
    colorSuggestion: 'تناژهای نود گرم، کاراملی، هلویی ملایم و رز گوشتی.'
  },
  {
    id: 'm2',
    category: 'makeup',
    title: 'کانتورینگ لیفت‌کننده چهره (Facial Lift Sculpt)',
    vibe: 'Defined Structure',
    toolsNeeded: ['برنزر کرمی مات', 'براش زاویه‌دار', 'هایلایتر بدون شاین درشت'],
    steps: [
      'کانتور را به جای گودی لپ، کمی بالاتر و روی خط استخوان گونه به سمت شقیقه بکشید.',
      'یک خط باریک زیر لبه فک برای محو کردن غبغب و زاویه‌دار کردن چانه.',
      'بلند کردن دقیق به سمت بالا با اسفنج مرطوب بدون پاک شدن کرم‌پودر.'
    ],
    commonMistakes: 'کشیدن خط تیره کانتور تا نزدیکی دهان که صورت را لاغر و خسته نشان می‌دهد.',
    colorSuggestion: 'رنگ برنزر خنثی یا خاکستری ملایم (Cool-Taupe) بدون زردی یا قرمزی تند.'
  },
  {
    id: 'm3',
    category: 'makeup',
    title: 'خط چشم محو و اسموکی قهوه‌ای (Soft Brown Smudge)',
    vibe: 'Romantic Date',
    toolsNeeded: ['مداد چشم قهوه‌ای شکلاتی ضدآب', 'براش سرصاف کوچک', 'ریمل حجم‌دهنده'],
    steps: [
      'بن مژه‌های پلک بالا را با مداد قهوه‌ای پر کنید.',
      'با یک براش کوچک قبل از خشک شدن مداد، لبه بیرونی را به آرامی محو (Smudge) کنید.',
      'ریمل را متمرکز بر مژه‌های گوشه بیرونی چشم بزنید تا چشم‌ها کشیده‌تر دیده شوند.'
    ],
    commonMistakes: 'کشیدن خط چشم مشکی مایع خیلی تیز و کلفت در روشنایی روز.',
    colorSuggestion: 'قهوه‌ای شکلاتی تیره، برنز و سایه شامپاینی در گوشه اشک چشم.'
  },

  // Hair
  {
    id: 'h1',
    category: 'hair',
    title: 'تکنیک سشوار لایه‌ای مدل کرتین (Curtain Bangs Blowout)',
    vibe: 'Face-Framing Elegance',
    toolsNeeded: ['برس گرد سرامیکی قطور', 'سشوار با نازل متمرکزکننده', 'گیره مو'],
    steps: [
      'چتری‌ها را به سمت جلو و مستقیم روی برس گرد سشوار کنید.',
      'در انتها مو را دور برس بچرخانید و باد خنک بزنید تا پیچ آن تثبیت شود.',
      'چتری را به دو طرف رها کنید تا قاب متقارنی دور چشم‌ها و استخوان گونه ایجاد کند.'
    ],
    commonMistakes: 'سشوار کشیدن به سمت عقب سر که فرم چتری را تخت و نافرم می‌کند.',
    colorSuggestion: 'هایلایت‌های بسیار ملایم (Baby-lights) در لبه‌های چتری برای انعکاس نور.'
  },
  {
    id: 'h2',
    category: 'hair',
    title: 'دم‌اسبی نیمه‌بالا با حجم طبیعی (Sleek Half-Up)',
    vibe: 'Playful Chic',
    toolsNeeded: ['کش موی نازک', 'شانه دم‌باریک', 'اسپری ضد وز یا روغن مو'],
    steps: [
      'نیمه بالای مو از بالای گوش‌ها را جدا کرده و با کش فیکس کنید.',
      'یک تار باریک از زیر دسته مو جدا کرده و دور کش بپیچید تا کش مخفی شود.',
      'تاج مو را کمی با نوک انگشتان آزاد کنید تا حس حجم و رهایی بدهد.'
    ],
    commonMistakes: 'بستن خیلی سفت که پوست سر را بکشد و باعث سردرد یا ریزش کششی شود.',
    colorSuggestion: 'هماهنگ با رنگ طبیعی ساقه مو و گیره‌های فلزی مینیمال.'
  },
  {
    id: 'h3',
    category: 'hair',
    title: 'نجات موی وز و کدر (Frizz Tamer Routine)',
    vibe: 'Hair Rescue',
    toolsNeeded: ['کرم موی مرطوب‌کننده', 'روغن جوجوبا یا آرگان', 'روبالشتی ساتن'],
    steps: [
      'روی موی نم‌دار مقدار کمی کرم مو بزنید تا آب در ساقه حبس شود.',
      'پس از خشک شدن با سشوار غیرمستقیم، ۲ قطره روغن را روی نوک ساقه‌ها ماساژ دهید.',
      'هرگز موهای فر یا موج‌دار را در حالت خشک برس نکشید.'
    ],
    commonMistakes: 'شستشوی روزانه مو با شامپوهای خشن حاوی سولفات بالا.',
    colorSuggestion: 'تغذیه با ماسک موی پروتئینه هفتگی برای درخشش آینه‌ای مو.'
  },

  // Nails
  {
    id: 'n1',
    category: 'nails',
    title: 'ناخن شیشه‌ای شیری مینیمال (Milky Glazed Nails)',
    vibe: 'Clean Girl Nails',
    toolsNeeded: ['سوهان ناخن نرم', 'لاک بیس کات شیری نیمه‌شفاف', 'تاپ کات براق آینه‌ای'],
    steps: [
      'فرم‌دهی ناخن به شکل بادامی نرم (Almond) یا مربعی با گوشه‌های هلالی (Squoval).',
      'یک لایه نازک لاک شیری نیمه‌شفاف (نه سفید گچی).',
      'یک لایه پودر کروم مرواریدی یا تاپ کات ژلی با انعکاس بالا.'
    ],
    commonMistakes: 'زدن لایه‌های ضخیم که باعث حباب افتادن و دیر خشک شدن لاک می‌شود.',
    colorSuggestion: 'شیری مات، کرم پوست‌پیازی، فرنچ بسیار باریک متالیک.'
  }
];

export const MakeupHairStudioModal: React.FC<MakeupHairStudioModalProps> = ({
  isOpen,
  initialTab = 'makeup',
  onClose,
  onSaveFeedback,
}) => {
  const [activeTab, setActiveTab] = useState<'makeup' | 'hair' | 'nails'>(initialTab);
  const [selectedTechId, setSelectedTechId] = useState<string>('m1');
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentModule = TECHNIQUES.find((t) => t.id === selectedTechId) || TECHNIQUES[0];
  const listForTab = TECHNIQUES.filter((t) => t.category === activeTab);

  const handleFeedback = (type: string) => {
    sounds.playChime('complete');
    setFeedbackSent(type);
    if (onSaveFeedback) {
      onSaveFeedback(`تکنیک ${currentModule.title}: ${type}`);
    }
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
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100">استودیوی تخصصی میکاپ، مو و ناخن</h3>
              <p className="text-[10px] text-stone-400">تکنیک‌های گام‌به‌گام با ابزارهای قابل دسترس</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Main Tabs */}
        <div className="p-2.5 bg-stone-950 border-b border-stone-850 grid grid-cols-3 gap-1.5 text-xs">
          {[
            { id: 'makeup', label: 'استودیوی میکاپ', icon: '💄' },
            { id: 'hair', label: 'استودیوی مو', icon: '💇‍♀️' },
            { id: 'nails', label: 'استودیوی ناخن', icon: '💅' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                const first = TECHNIQUES.find((t) => t.category === tab.id);
                if (first) setSelectedTechId(first.id);
                sounds.playChime('click');
              }}
              className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center gap-0.5 ${
                activeTab === tab.id
                  ? 'bg-rose-950/70 border-rose-500 text-rose-200 font-bold'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-[11px] truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Technique Selector Pills */}
        <div className="p-2 bg-stone-950 border-b border-stone-850 flex gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {listForTab.map((tech) => (
            <button
              key={tech.id}
              onClick={() => {
                setSelectedTechId(tech.id);
                setFeedbackSent(null);
                sounds.playChime('click');
              }}
              className={`px-3 py-1.5 rounded-xl border shrink-0 text-xs transition-all ${
                selectedTechId === tech.id
                  ? 'bg-rose-900/40 border-rose-500 text-rose-100 font-bold'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
              }`}
            >
              {tech.title.split(' ')[0]} {tech.title.split(' ')[1] || ''}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {/* Title Card */}
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-100 text-xs">{currentModule.title}</h4>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                {currentModule.vibe}
              </span>
            </div>
            <p className="text-[11px] text-amber-300">
              💡 پیشنهاد رنگی: {currentModule.colorSuggestion}
            </p>
          </div>

          {/* Tools Needed */}
          <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1.5">
            <span className="font-bold text-stone-200 text-[11px] block">ابزارها و وسایل موردنیاز:</span>
            <div className="flex flex-wrap gap-1.5">
              {currentModule.toolsNeeded.map((tool, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-stone-900 border border-stone-800 px-2 py-0.5 rounded-lg text-stone-300"
                >
                  ✓ {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <h5 className="font-bold text-stone-200 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>گام‌های اجرایی دقیق:</span>
            </h5>
            <div className="space-y-1.5">
              {currentModule.steps.map((st, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-300 flex items-start gap-2 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-rose-950 text-rose-300 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{st}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-1">
            <span className="font-bold text-rose-300 text-[11px] flex items-center gap-1">
              <span>⚠️ اشتباه رایج:</span>
            </span>
            <p className="text-[11px] text-stone-300 leading-relaxed pr-3">
              {currentModule.commonMistakes}
            </p>
          </div>

          {/* Dynamic Feedback Engine (فیچر ۶۳) */}
          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-center">
            <span className="text-[11px] text-stone-400 block">
              نظرت درباره این تکنیک چیه؟ (ثبت در حافظه هوشمند DNA):
            </span>
            {feedbackSent ? (
              <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-[11px] font-bold">
                ✓ بازخورد ثبت شد؛ پیشنهادهای آینده بر این اساس تنظیم می‌شوند!
              </div>
            ) : (
              <div className="flex gap-1.5 justify-center flex-wrap">
                {[
                  'دوست داشتم ✨',
                  'زیادی بولد بود',
                  'راحت نبود',
                  'رنگش رو نپسندیدم',
                ].map((fb) => (
                  <button
                    key={fb}
                    onClick={() => handleFeedback(fb)}
                    className="py-1 px-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-[10px] text-stone-300 transition-colors"
                  >
                    {fb}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs"
          >
            متوجه شدم؛ امتحانش می‌کنم
          </button>
        </div>
      </div>
    </div>
  );
};
