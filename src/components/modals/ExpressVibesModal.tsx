import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Heart,
  RefreshCw,
  Bookmark,
  Check,
  Zap,
  Shirt,
  Scissors,
  Droplet
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { SavedLook } from '../../types';

interface ExpressVibesModalProps {
  isOpen: boolean;
  mode: 'surprise' | 'cute' | 'refresh';
  onClose: () => void;
  onSaveLook: (look: SavedLook) => void;
}

interface VibePackage {
  title: string;
  vibe: string;
  themeColor: string;
  outfit: string;
  hair: string;
  makeup: string;
  nails: string;
  fragrance: string;
  secretTip: string;
}

const PACKAGES: Record<'surprise' | 'cute' | 'refresh', VibePackage> = {
  surprise: {
    title: 'لوک غافلگیرکننده: مونوکروم شکلاتی با کنتراست طلا',
    vibe: 'Modern Minimal Warmth',
    themeColor: 'amber',
    outfit: 'کت یا مانتوی قهوه‌ای اسپرسو + بافت کرم یا پیراهن شیری + نیم‌بوت مشکی براق + گوشواره حلقه‌ای طلایی درشت.',
    hair: 'دم‌اسبی براق (Sleek High Pony) با یک پیچ نرم در انتهای ساقه مو.',
    makeup: 'تینت لب کاراملی براق (Glossy Caramel) با برنزر مات روی شقیقه و خط چشم قهوه‌ای شکلاتی باریک.',
    nails: 'لاک شکلاتی شیری یا نوک ناخن بژ متالیک.',
    fragrance: 'وانیل کهربایی با نت پایانی چوب صندل و قهوه.',
    secretTip: 'یک انتخاب خارج از روتین اما کاملاً هماهنگ با DNA گرم و باوقار.',
  },
  cute: {
    title: 'پکیج کیوت و بازیگوش (Cute & Soft Playful)',
    vibe: 'Soft Cute Aesthetic',
    themeColor: 'rose',
    outfit: 'ژاکت کش‌باف بافتنی صورتی پاستلی یا یاسی + شلوار دنیم روشن بگ + کفش ورزشی سفید + کیف هلالی شاداب.',
    hair: 'نیمه‌بالا (Half-Up) بسته شده با یک پاپیون روبانی کوچک یا کش ساتن فانتزی.',
    makeup: 'رژگونه هلویی-صورتی متمرکز زیر چشم و روی پل بینی (Sun-kissed flush) + برق لب آلبالویی و ریمل تفکیک‌شده.',
    nails: 'لاک شیری با طرح قلب کوچک یا فرنچ رنگین‌کمانی ملایم.',
    fragrance: 'شکوفه گیلاس، توت‌فرنگی وحشی و مشک پنبه‌ای سبک.',
    secretTip: 'حس سرزندگی، شیرینی و سبکی بدون زحمت زیاد.',
  },
  refresh: {
    title: 'تغییر انرژی فوری: مینیمال ادیتوریال نو',
    vibe: 'Refreshed Clean Slate',
    themeColor: 'teal',
    outfit: 'پیراهن سفید اورسایز آهاردار + شلوار راسته مشکی + کمربند چرم سگک‌دار + شال موهر طوسی زغالی.',
    hair: 'فرق وسط تیز با چتری‌های قاب‌کننده صورت (Curtain bangs) حالت‌دار با سشوار ملایم.',
    makeup: 'پوست شیشه‌ای آبرسانی‌شده، ژل ابروی لیفت‌شده صابونی و رژ قرمز مات تمشکی پررنگ به عنوان تک‌نقطه توجه.',
    nails: 'ناخن‌های طبیعی کاملاً کوتاه و مانیکور شفاف بدون رنگ برای حس تمیزی مطلق.',
    fragrance: 'ترنج تازه ایتالیایی، لیمو و چای سبز خنک.',
    secretTip: 'وقتی از قیافه‌ات خسته شدی، این ترکیب ۱۰۰٪ حس تکرار را می‌شکند.',
  },
};

export const ExpressVibesModal: React.FC<ExpressVibesModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSaveLook,
}) => {
  const [saved, setSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const pkg = PACKAGES[mode];

  const handleSave = () => {
    sounds.playChime('complete');
    const newLook: SavedLook = {
      id: `look_${Date.now()}`,
      title: pkg.title,
      date: new Date().toLocaleDateString('fa-IR'),
      vibe: pkg.vibe,
      imageUrl:
        mode === 'cute'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'
          : mode === 'surprise'
          ? 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
      steps: [
        `پوشش: ${pkg.outfit}`,
        `مو: ${pkg.hair}`,
        `آرایش: ${pkg.makeup}`,
      ],
      pieces: [pkg.fragrance, pkg.nails],
      occasion: mode === 'cute' ? 'دورهمی دوستانه' : 'تغییر سبک شخصی',
    };
    onSaveLook(newLook);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                mode === 'cute'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : mode === 'surprise'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-teal-500/20 text-teal-400 border-teal-500/40'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                <span>
                  {mode === 'cute'
                    ? 'پکیج صورتی کیوت (Cute Mode)'
                    : mode === 'surprise'
                    ? 'پیشنهاد شگفتانه (Surprise Me)'
                    : 'نو شدن استایل (Refresh Me)'}
                </span>
              </h3>
              <p className="text-[10px] text-stone-400">{pkg.vibe}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {/* Main Title Banner */}
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
            <span className="font-bold text-stone-100 text-xs">{pkg.title}</span>
            <p className="text-[11px] text-stone-400 leading-relaxed">{pkg.secretTip}</p>
          </div>

          {/* Outfit Section */}
          <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1.5">
            <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
              <Shirt className="w-3.5 h-3.5" />
              <span>پوشش و لباس‌ها:</span>
            </span>
            <p className="text-[11px] text-stone-300 leading-relaxed pr-5">{pkg.outfit}</p>
          </div>

          {/* Hair & Makeup 2-col */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
              <span className="font-bold text-rose-300 text-[11px] flex items-center gap-1">
                <Scissors className="w-3 h-3" />
                <span>مدل مو:</span>
              </span>
              <p className="text-[10px] text-stone-300 leading-relaxed">{pkg.hair}</p>
            </div>
            <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
              <span className="font-bold text-rose-300 text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>میکاپ و رژ:</span>
              </span>
              <p className="text-[10px] text-stone-300 leading-relaxed">{pkg.makeup}</p>
            </div>
          </div>

          {/* Nails & Fragrance */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
              <span className="font-bold text-teal-300 text-[10px] block">ناخن‌ها:</span>
              <p className="text-[10px] text-stone-400">{pkg.nails}</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
              <span className="font-bold text-teal-300 text-[10px] block">رایحه و عطر:</span>
              <p className="text-[10px] text-stone-400">{pkg.fragrance}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{saved ? 'در لوک‌های من ذخیره شد!' : 'ذخیره این پکیج استایل'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-medium"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
