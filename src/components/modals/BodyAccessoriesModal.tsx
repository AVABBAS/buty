import React, { useState } from 'react';
import {
  X,
  Shirt,
  Sparkles,
  ShoppingBag,
  Heart,
  Droplets,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface BodyAccessoriesModalProps {
  isOpen: boolean;
  initialTab?: 'body' | 'accessories' | 'fragrance';
  onClose: () => void;
  onOpenMixer?: () => void;
}

export const BodyAccessoriesModal: React.FC<BodyAccessoriesModalProps> = ({
  isOpen,
  initialTab = 'body',
  onClose,
  onOpenMixer,
}) => {
  const [activeTab, setActiveTab] = useState<'body' | 'accessories' | 'fragrance'>(initialTab);
  const [selectedBodyForm, setSelectedBodyForm] = useState<string>('balanced');
  const [selectedFragranceVibe, setSelectedFragranceVibe] = useState<string>('fresh');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <Shirt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100">استایل فرم بدن، اکسسوری و عطر</h3>
              <p className="text-[10px] text-stone-400">بدون نمره‌دهی به بدن؛ تمرکز بر برش، خطوط و هارمونی</p>
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
            { id: 'body', label: 'فرم خطوط و برش', icon: '👗' },
            { id: 'accessories', label: 'اکسسوری و شال', icon: '🧣' },
            { id: 'fragrance', label: 'لابراتوار عطر', icon: '✨' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                sounds.playChime('click');
              }}
              className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center gap-0.5 ${
                activeTab === tab.id
                  ? 'bg-amber-950/70 border-amber-500 text-amber-200 font-bold'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-[11px] truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {/* TAB 1: BODY STYLING */}
          {activeTab === 'body' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-bold text-amber-300 text-xs">فلسفه آینـا: «لباس باید اندازه بدن تو باشد، نه برعکس!»</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  سیستم ما هیچ نمره‌دهی به وزن یا سایز ندارد. هدف فقط تنظیم خطوط بصری، یقه، طول آستین و فاق شلوار برای تعادل چشم‌نواز است.
                </p>
              </div>

              {/* Guidelines Grid */}
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-stone-100 text-xs">۱. فرم یقه (Necklines):</span>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    یقه‌های هفت (V-Neck) و یقه‌های خشتی باز، خط گردن را کشیده‌تر و بالاتنه را سبک‌تر نشان می‌دهند. یقه‌های اسکی و ایستاده برای گردن‌های کشیده و روزهای زمستانی مونوکروم فوق‌العاده‌اند.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-stone-100 text-xs">۲. برش شلوار (Pants & Rise):</span>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    شلوارهای فاق بلند راسته (Straight-leg High Rise) پاهای شما را بدون فشار کشیده‌تر نشان می‌دهند و در حرکت روزمره بی‌نهایت راحت هستند.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-stone-100 text-xs">۳. تکنیک لایه‌بندی باز (Open Layering):</span>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    باز گذاشتن دکمه‌های کت یا مانتو و ایجاد یک خط عمودی متضاد با شومیز زیرین، خط دید را باریک‌تر و استایل را پویا می‌کند.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACCESSORIES & SCARF STYLER */}
          {activeTab === 'accessories' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-bold text-teal-300 text-xs">قانون «۱ لباس، ۳ شخصیت متفاوت»:</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  با تعویض تنها شال، کفش و گوشواره، یک مانتوی ساده مشکی می‌تواند برای محیط کاری، کافه یا مهمانی بازتعریف شود!
                </p>
              </div>

              {/* 3 Variations */}
              <div className="space-y-2 text-[11px]">
                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-rose-300 text-xs block">نسخه ۱: روزمره شاداب (Casual Cafe)</span>
                  <p className="text-stone-300">کت تک مشکی + کتانی سفید ارگونومیک + کیف هلالی پارچه‌ای + شال نخی کرم/سبز پسته.</p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-amber-300 text-xs block">نسخه ۲: وقار کاری (Smart Business)</span>
                  <p className="text-stone-300">کت تک مشکی + لوفر چرم براق + کیف توت با ساختار هندسی + شال موهر طوسی زغالی + ساعت فلزی مینیمال.</p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                  <span className="font-bold text-purple-300 text-xs block">نسخه ۳: شبانه پرزرق‌وبرق (Chic Dinner)</span>
                  <p className="text-stone-300">کت تک مشکی + نیم‌بوت پاشنه کوتاه + کیف کلاچ مشکی زنجیردار + گوشواره حلقه‌ای درشت طلایی + رژ قرمز تمشکی.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FRAGRANCE LAB */}
          {activeTab === 'fragrance' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-bold text-rose-300 text-xs">امضای نامرئی استایل تو: عطر و رایحه</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  رایحه‌ها ناخودآگاه‌ترین عنصر جذابیت شخصی هستند؛ عطر امروزت باید با انرژی و هوای بیرون هماهنگ باشد.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  { vibe: 'Fresh & Crisp', note: 'ترنج، چای سبز، شکوفه پرتقال', occ: 'صبح‌ها و روزمرگی پرانرژی' },
                  { vibe: 'Warm & Cozy', note: 'وانیل، چوب صندل، کهربا', occ: 'پاییز، زمستان، دورهمی شبانه' },
                  { vibe: 'Soft Floral', note: 'یاس، رز صدتومانی، مشک پنبه', occ: 'قرارهای رمانتیک و ملایم' },
                  { vibe: 'Dark Mystic', note: 'عود ملایم، پاتچولی، دانه تونکا', occ: 'جلسات مهم و استایل‌های ادیتوریال' }
                ].map((f, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
                    <span className="font-bold text-stone-100 block">{f.vibe}</span>
                    <p className="text-[10px] text-amber-300">{f.note}</p>
                    <span className="text-[9px] text-stone-400 block pt-1">{f.occ}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center gap-2">
          {onOpenMixer && (
            <button
              onClick={() => {
                onOpenMixer();
                onClose();
              }}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-xs shadow-md transition-colors text-center"
            >
              امتحان در استودیو ست کردن مانکن
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
