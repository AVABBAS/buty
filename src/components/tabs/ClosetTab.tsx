import React, { useState } from 'react';
import {
  Shirt,
  Sparkles,
  ShoppingBag,
  Plus,
  Trash2,
  Layers,
  CheckCircle,
  HelpCircle,
  Scissors,
  Check,
  Tag,
  Shuffle
} from 'lucide-react';
import { ClosetItem, BeautyProductItem } from '../../types';
import { DEFAULT_CLOSET, DEFAULT_SHELF } from '../../data/beautyKnowledge';
import { sounds } from '../../utils/soundEffects';

interface ClosetTabProps {
  closetItems: ClosetItem[];
  shelfItems: BeautyProductItem[];
  onAddClosetItem: (item: ClosetItem) => void;
  onRemoveClosetItem: (id: string) => void;
  onOpenMixer: () => void;
}

export const ClosetTab: React.FC<ClosetTabProps> = ({
  closetItems,
  shelfItems,
  onAddClosetItem,
  onRemoveClosetItem,
  onOpenMixer,
}) => {
  const [activeSection, setActiveSection] = useState<'three-looks' | 'completer' | 'closet' | 'shelf'>('three-looks');
  const [selectedGarment, setSelectedGarment] = useState<ClosetItem>(closetItems[0] || DEFAULT_CLOSET[0]);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<any>('top');
  const [newItemVibe, setNewItemVibe] = useState<any>('versatile');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const categoriesMap: Record<string, string> = {
    outerwear: 'مانتو / کت / پالتو',
    top: 'شومیز / بالاتنه',
    bottom: 'شلوار / دامن',
    shoes: 'کفش / کتانی',
    bag: 'کیف',
    scarf: 'شال / روسری',
    accessory: 'اکسسوری',
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const newItem: ClosetItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      category: newItemCategory,
      vibe: newItemVibe,
      color: '#E7E5E4',
    };
    onAddClosetItem(newItem);
    setNewItemName('');
    setShowAddModal(false);
    sounds.playChime('step');
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-stone-800 p-4 space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-950 text-teal-300 flex items-center justify-center border border-teal-800/60 shadow-xs">
              <Shirt className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-stone-100">کمد و شلف من (My Closet & Shelf)</h1>
              <p className="text-[10px] text-stone-400">با همان چیزهایی که داری استایل جدید بساز</p>
            </div>
          </div>
          <button
            onClick={onOpenMixer}
            className="text-xs bg-teal-950/80 hover:bg-teal-900 border border-teal-700/60 text-teal-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>استودیو ست کردن لباس</span>
          </button>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed bg-stone-950/70 p-3 rounded-2xl border border-stone-800/80">
          «لازم نیست هر بار لباس جدید بخری.» بیش از ۷۰٪ لوک‌های شیک از ترکیب هوشمندانه همان اقلام پایه کمد با شال، کفش و اکسسوری به دست می‌آیند.
        </p>
      </div>

      {/* Nav Sub-tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-900 rounded-2xl border border-stone-800">
        {[
          { id: 'three-looks', label: '۱ لباس، ۳ شخصیت' },
          { id: 'completer', label: 'تکمیل استایل' },
          { id: 'closet', label: 'لباس‌های کمد' },
          { id: 'shelf', label: 'شلف زیبایی' },
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => {
              setActiveSection(st.id as any);
              sounds.playChime('click');
            }}
            className={`flex-1 py-1.5 text-[11px] font-medium rounded-xl transition-all ${
              activeSection === st.id
                ? 'bg-rose-950/80 text-rose-200 border border-rose-800/60 shadow-xs font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* 1. "همون لباس، ۳ شخصیت" (3 Looks with 1 Item) */}
      {activeSection === 'three-looks' && (
        <div className="space-y-3.5">
          <div className="rounded-3xl bg-stone-900 border border-stone-800 p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
              <div>
                <h3 className="text-xs font-bold text-stone-200">یک لباس پایه انتخاب کن:</h3>
                <p className="text-[10px] text-stone-400 mt-0.5">ببین چطور با تغییر جزئیات ۳ استایل کاملاً متفاوت می‌سازه</p>
              </div>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {closetItems.slice(0, 7).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedGarment(item);
                    sounds.playChime('click');
                  }}
                  className={`px-3 py-2 text-xs rounded-2xl border whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    selectedGarment?.id === item.id
                      ? 'bg-rose-950/70 border-rose-500 text-rose-200 font-bold shadow-xs'
                      : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3 Personalities Breakdown */}
          <div className="space-y-2.5">
            {/* Personality 1: Elegant / Classic */}
            <div className="rounded-3xl bg-stone-900 border border-stone-800 p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <h4 className="text-xs font-bold text-stone-100">۱. شخصیت شیک و باوقار (Elegant & Classic)</h4>
                </div>
                <span className="text-[10px] text-stone-400">جلسات، شام رسمی، فضای اداری</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed bg-stone-950 p-2.5 rounded-2xl border border-stone-800">
                با «{selectedGarment?.name}» + شلوار پارچه‌ای راسته اتودار + کفش لوفر چرم واکس‌خورده + شال ابریشمی کرم/شنی + کیف دوشی ساختارمند.
              </p>
              <div className="text-[10px] text-stone-400">
                💄 میکاپ هماهنگ: رژ لب نود مات، خط چشم ملایم گوشه چشم، موهای بسته شیک.
              </div>
            </div>

            {/* Personality 2: Casual / Effortless */}
            <div className="rounded-3xl bg-stone-900 border border-stone-800 p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h4 className="text-xs font-bold text-stone-100">۲. شخصیت روزمره و راحت (Casual & Effortless)</h4>
                </div>
                <span className="text-[10px] text-stone-400">کافه، خرید، دانشگاه، روزمره</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed bg-stone-950 p-2.5 rounded-2xl border border-stone-800">
                با «{selectedGarment?.name}» + شلوار واید لینن یا نیم‌بگ + کتانی سفید تمیز + شال نخی آزاد روی شانه + کیف توت یا مینی‌بگ.
              </p>
              <div className="text-[10px] text-stone-400">
                💄 میکاپ هماهنگ: تینت گونه و لب آبدار، ابروی شانه شده طبیعی، موهای آزاد یا کلیپس.
              </div>
            </div>

            {/* Personality 3: Bold / Statement */}
            <div className="rounded-3xl bg-stone-900 border border-stone-800 p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <h4 className="text-xs font-bold text-stone-100">۳. شخصیت جسور و خاص (Bold & Statement)</h4>
                </div>
                <span className="text-[10px] text-stone-400">مهمانی، تولد، روزهایی که می‌خواهی بدرخشی</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed bg-stone-950 p-2.5 rounded-2xl border border-stone-800">
                با «{selectedGarment?.name}» + شال مینی‌اسکارف پترن‌دار یا قرمز بورگاندی + بوت چرم پنجه‌مربعی + گوشواره استیتمنت طلایی.
              </p>
              <div className="text-[10px] text-stone-400">
                💄 میکاپ هماهنگ: رژ لب زرشکی یا قرمز غنی، سایه اسموکی خاکی، ناخن‌های تیره.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. "این لباس را کامل کن" (Outfit Completer) */}
      {activeSection === 'completer' && (
        <div className="rounded-3xl bg-stone-900 border border-stone-800 p-4 space-y-3.5 shadow-md">
          <div className="border-b border-stone-800/80 pb-2">
            <h3 className="text-xs font-bold text-stone-200">فرمول تکمیل استایل (۲ کیف + ۲ کفش + ۲ شال)</h3>
            <p className="text-[10px] text-stone-400 mt-0.5">تبدیل سریع یک لباس پایه به دو موقعیت متفاوت</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs text-stone-300 space-y-3">
            <span className="font-semibold text-rose-300 block">پایه استایل انتخابی: {selectedGarment?.name}</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <span className="font-bold text-stone-200 block">۲ پیشنهاد شال:</span>
                <p className="text-stone-400 leading-relaxed">۱. شال نخی تک‌رنگ کرم/خاکی (برای آرامش بصری)</p>
                <p className="text-stone-400 leading-relaxed">۲. مینی‌اسکارف طرح‌دار ساتن (برای فوکوس چهره)</p>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <span className="font-bold text-stone-200 block">۲ پیشنهاد کفش:</span>
                <p className="text-stone-400 leading-relaxed">۱. کتانی سفید مینیمال (سرعت و جوانی)</p>
                <p className="text-stone-400 leading-relaxed">۲. لوفر یا کالج چرم مشکی (وقار و رسمیت)</p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1 text-[11px]">
              <span className="font-bold text-stone-200 block">۲ پیشنهاد کیف:</span>
              <p className="text-stone-400 leading-relaxed">۱. کیف دوشی باگتی کوچک نود/مشکی</p>
              <p className="text-stone-400 leading-relaxed">۲. کیف توت جادار چرمی برای کارهای روزمره</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Closet Inventory */}
      {activeSection === 'closet' && (
        <div className="rounded-3xl bg-stone-900 border border-stone-800 p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
            <div>
              <h3 className="text-xs font-bold text-stone-200">اقلام موجود در کمد تو ({closetItems.length})</h3>
              <p className="text-[10px] text-stone-400 mt-0.5">برای ساخت اتوماتیک استایل‌های روزمره</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs bg-rose-950/70 hover:bg-rose-900 border border-rose-800/60 text-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن لباس</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {closetItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: item.color }} />
                  <div>
                    <span className="font-semibold text-stone-200 block">{item.name}</span>
                    <span className="text-[10px] text-stone-400">{categoriesMap[item.category] || item.category} · {item.vibe}</span>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveClosetItem(item.id)}
                  className="text-stone-500 hover:text-red-400 p-1 transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Beauty Shelf */}
      {activeSection === 'shelf' && (
        <div className="rounded-3xl bg-stone-900 border border-stone-800 p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
            <div>
              <h3 className="text-xs font-bold text-stone-200">شلف زیبایی من (محصولات موجود)</h3>
              <p className="text-[10px] text-stone-400 mt-0.5">پایه روتین شما؛ قبل از خرید محصول جدید این لیست را بررسی کنید</p>
            </div>
          </div>

          <div className="space-y-2">
            {shelfItems.map((prod) => (
              <div
                key={prod.id}
                className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-200">{prod.name}</span>
                    {prod.isEssential && (
                      <span className="text-[9px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-1.5 py-0.2 rounded-full font-bold">
                        ضروری
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-0.5 block">{prod.purpose}</span>
                </div>
                <span className="text-[10px] text-stone-500 capitalize">{prod.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-stone-900 border border-stone-700 p-4 space-y-3.5 shadow-2xl">
            <h3 className="text-xs font-bold text-stone-100">افزودن لباس به کمد</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-stone-300 block mb-1">نام یا توصیف لباس:</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="مثلاً: مانتوی اورسایز کتان زیتونی"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-stone-300 block mb-1">دسته‌بندی:</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="outerwear">مانتو / کت / پالتو</option>
                  <option value="top">شومیز / تاپ / تیشرت</option>
                  <option value="bottom">شلوار / دامن</option>
                  <option value="shoes">کفش / کتانی</option>
                  <option value="bag">کیف</option>
                  <option value="scarf">شال / روسری</option>
                  <option value="accessory">اکسسوری</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-stone-300 block mb-1">وایب کلی:</label>
                <select
                  value={newItemVibe}
                  onChange={(e) => setNewItemVibe(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="versatile">چندکاره و پایه (Versatile)</option>
                  <option value="casual">کژوال و راحت (Casual)</option>
                  <option value="elegant">کلاسیک و شیک (Elegant)</option>
                  <option value="minimal">مینیمال (Minimal)</option>
                  <option value="bold">چشمگیر و خاص (Bold)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                >
                  افزودن
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
