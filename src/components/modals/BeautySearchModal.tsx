import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  Scissors,
  Shirt,
  AlertCircle,
  CheckCircle2,
  Clock,
  Heart
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface BeautySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (type: string, data?: any) => void;
}

interface SearchItem {
  id: string;
  category: 'problem' | 'technique' | 'look' | 'closet' | 'wisdom';
  title: string;
  subtitle: string;
  tag: string;
  content: string;
  actionLabel: string;
}

const SEARCH_DATABASE: SearchItem[] = [
  {
    id: 'p1',
    category: 'problem',
    title: 'ماسیدن کرم‌پودر دور بینی و خط خنده',
    subtitle: 'حل مشکل زیرسازی پوست خشک یا دهیدراته',
    tag: 'حل مسئله',
    content: 'کرم‌پودر روی پوست دهیدراته پوسته می‌شود. راه‌حل: مرطوب‌کننده با بافت ژلی، پرایمر بر پایه آب و تکنیک ضربه‌ای اسفنج مرطوب.',
    actionLabel: 'مشاهده راهکار کامل',
  },
  {
    id: 'p2',
    category: 'problem',
    title: 'پف زیر چشم صبحگاهی و خستگی چهره',
    subtitle: 'راهکار فوری ۵ دقیقه‌ای برای روزهای کم‌خوابی',
    tag: 'بحران فوری',
    content: 'کمپرس قاشق سرد زیر چشم به مدت ۲ دقیقه، سپس زدن کانسیلر هلویی فقط روی گودی تیره به جای کل زیر چشم.',
    actionLabel: 'شروع روتین رفع پف',
  },
  {
    id: 't1',
    category: 'technique',
    title: 'آرایش چشم برای پلک افتاده (Hooded Eyes)',
    subtitle: 'تکنیک خط چشم باز و سایه بالای خط چین پلک',
    tag: 'تکنیک میکاپ',
    content: 'با چشمان کاملاً باز رو به آینه خط چشم نازک بکشید. بال خط چشم را در ادامه خط پلک پایین امتداد دهید تا زیر پف پلک گم نشود.',
    actionLabel: 'مشاهده گام‌به‌گام',
  },
  {
    id: 't2',
    category: 'technique',
    title: 'تکنیک موی فرانسوی و رها (Effortless French Waves)',
    subtitle: 'حالت دادن مو بدون اتو مو و آسیب حرارتی',
    tag: 'تکنیک مو',
    content: 'موهای نیمه‌نمدار را به دو دسته ببافید و پس از خشک شدن باز کنید. با یک قطره روغن آرگان وز ساقه‌ها را مهار کنید.',
    actionLabel: 'دیدن آموزش مو',
  },
  {
    id: 'l1',
    category: 'look',
    title: 'استایل مونوکروم شیک (Espresso Chic)',
    subtitle: 'ترکیب قهوه‌ای شکلاتی، کرم و اکسسوری طلایی',
    tag: 'پکیج استایل',
    content: 'کت قهوه‌ای گرم، شومیز شیری، شلوار کتان راسته و گوشواره حلقه‌ای براق. القای حس وقار، گرما و اعتمادبه‌نفس.',
    actionLabel: 'انتقال به استودیو ست کردن',
  },
  {
    id: 'w1',
    category: 'wisdom',
    title: 'چرا منافذ پوست هرگز بسته نمی‌شوند؟',
    subtitle: 'افشای یک دروغ بزرگ تبلیغاتی',
    tag: 'حکمت زیبایی',
    content: 'منافذ عضله ندارند. آن‌ها مجرای ترشح چربی طبیعی هستند. با سالیسیلیک اسید فقط تمیز و کمتر نمایان می‌شوند، نه حذف دائمی!',
    actionLabel: 'مطالعه دفاع علمی',
  },
  {
    id: 'c1',
    category: 'closet',
    title: 'قانون ۳ لایه برای شیک‌پوشی در هوای متغیر',
    subtitle: 'لایه پایه، لایه گرمایشی و لایه بیرونی ساختاریافته',
    tag: 'چیدمان لباس',
    content: 'تاپ نرم نخی + بافت ظریف دکمه‌دار + کت بلیزر یا بارانی. تنظیم آسان دما بدون برهم خوردن هارمونی استایل.',
    actionLabel: 'چیدن با کمد من',
  }
];

export const BeautySearchModal: React.FC<BeautySearchModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const [query, setQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<SearchItem | null>(null);

  const filteredResults = useMemo(() => {
    return SEARCH_DATABASE.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const q = query.trim().toLowerCase();
      if (!q) return matchesCat;
      const inTitle = item.title.toLowerCase().includes(q);
      const inSub = item.subtitle.toLowerCase().includes(q);
      const inContent = item.content.toLowerCase().includes(q);
      const inTag = item.tag.toLowerCase().includes(q);
      return matchesCat && (inTitle || inSub || inContent || inTag);
    });
  }, [query, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header with Search Input */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-stone-100">جستجوی یکپارچه زیبایی (Beauty Search)</h3>
                <p className="text-[10px] text-stone-400">جستجو در بین تکنیک‌ها، مشکلات، استایل‌ها و مقالات</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی مشکل، تکنیک، چشم افتاده، منافذ، مو، استایل..."
              className="w-full bg-stone-900 border border-stone-800 rounded-2xl pl-4 pr-10 py-2.5 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-rose-500 shadow-inner"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3 pointer-events-none" />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute left-3 top-3 text-[11px] text-stone-400 hover:text-stone-200"
              >
                پاک کردن
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1 text-[11px]">
            {[
              { id: 'all', label: 'همه' },
              { id: 'problem', label: 'حل مشکلات' },
              { id: 'technique', label: 'تکنیک‌ها' },
              { id: 'look', label: 'استایل و ست' },
              { id: 'wisdom', label: 'حقایق علمی' },
              { id: 'closet', label: 'کمد لباس' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  sounds.playChime('click');
                }}
                className={`px-3 py-1 rounded-xl border shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-rose-950/70 border-rose-500 text-rose-200 font-bold'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-stone-600 mx-auto" />
              <p className="text-stone-400 text-xs font-medium">موردی متناسب با جستجوی شما پیدا نشد.</p>
              <p className="text-stone-500 text-[11px]">می‌توانید کلمه دیگری مثل «مو»، «پوست»، «چشم» یا «شیک» را جستجو کنید.</p>
            </div>
          ) : (
            filteredResults.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveItem(activeItem?.id === item.id ? null : item);
                  sounds.playChime('click');
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeItem?.id === item.id
                    ? 'bg-stone-850 border-rose-600/70 shadow-md'
                    : 'bg-stone-950/80 border-stone-800/80 hover:border-stone-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-bold text-stone-100 text-xs leading-snug">{item.title}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-rose-300 shrink-0 font-medium">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">{item.subtitle}</p>

                {activeItem?.id === item.id && (
                  <div className="mt-3 pt-3 border-t border-stone-800 space-y-2.5 animate-in fade-in duration-150">
                    <p className="text-[11px] text-stone-200 leading-relaxed bg-stone-900 p-2.5 rounded-xl border border-stone-800/60">
                      {item.content}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playChime('complete');
                        onSelectAction(item.category, item);
                        onClose();
                      }}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 text-center">
          <p className="text-[10px] text-stone-500">
            جستجوی متصل به Beauty DNA، کمد لباس‌ها و بانک دانش علمی آینـا
          </p>
        </div>
      </div>
    </div>
  );
};
