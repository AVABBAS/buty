import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Shuffle,
  Bookmark,
  Check,
  Shirt,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ClosetItem } from '../types';
import { sounds } from '../utils/soundEffects';

interface OutfitMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLook: (look: any) => void;
}

interface GarmentOption {
  id: string;
  name: string;
  category: 'outerwear' | 'top' | 'bottom' | 'shoes' | 'bag' | 'scarf';
  color: string;
  vibe: string;
  image: string;
}

const WARDROBE_PRESETS: GarmentOption[] = [
  // Outerwear
  {
    id: 'out1',
    name: 'کت کتی اورسایز کرم شنی',
    category: 'outerwear',
    color: '#E7E5E4',
    vibe: 'minimal',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'out2',
    name: 'ترنچ‌کت کلاسیک مشکی زغالی',
    category: 'outerwear',
    color: '#1C1917',
    vibe: 'elegant',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'out3',
    name: 'مانتو کتان زیتونی روزمره',
    category: 'outerwear',
    color: '#3F4F44',
    vibe: 'casual',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80'
  },

  // Tops
  {
    id: 'top1',
    name: 'شومیز ساتن براق شیری',
    category: 'top',
    color: '#FAF8F5',
    vibe: 'elegant',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'top2',
    name: 'تیشرت کتان نود خنثی',
    category: 'top',
    color: '#D7CCC8',
    vibe: 'casual',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80'
  },

  // Bottoms
  {
    id: 'bot1',
    name: 'شلوار پارچه‌ای راسته دودی',
    category: 'bottom',
    color: '#334155',
    vibe: 'elegant',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'bot2',
    name: 'شلوار واید لینن کرم استخوانی',
    category: 'bottom',
    color: '#EFEBE9',
    vibe: 'casual',
    image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=400&auto=format&fit=crop&q=80'
  },

  // Shoes
  {
    id: 'sho1',
    name: 'لوفر چرم مشکی دست‌دوز',
    category: 'shoes',
    color: '#000000',
    vibe: 'classic',
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'sho2',
    name: 'کتانی سفید مینیمال',
    category: 'shoes',
    color: '#FFFFFF',
    vibe: 'casual',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop&q=80'
  },

  // Scarf
  {
    id: 'scf1',
    name: 'شال لایت نخی شنی',
    category: 'scarf',
    color: '#E0D6C8',
    vibe: 'neutral',
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'scf2',
    name: 'مینی‌اسکارف ابریشمی بورگاندی',
    category: 'scarf',
    color: '#880E4F',
    vibe: 'statement',
    image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&auto=format&fit=crop&q=80'
  }
];

export const OutfitMixerModal: React.FC<OutfitMixerModalProps> = ({
  isOpen,
  onClose,
  onSaveLook,
}) => {
  const [selectedOuter, setSelectedOuter] = useState<number>(0);
  const [selectedTop, setSelectedTop] = useState<number>(0);
  const [selectedBottom, setSelectedBottom] = useState<number>(0);
  const [selectedShoes, setSelectedShoes] = useState<number>(0);
  const [selectedScarf, setSelectedScarf] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const outers = WARDROBE_PRESETS.filter((p) => p.category === 'outerwear');
  const tops = WARDROBE_PRESETS.filter((p) => p.category === 'top');
  const bottoms = WARDROBE_PRESETS.filter((p) => p.category === 'bottom');
  const shoes = WARDROBE_PRESETS.filter((p) => p.category === 'shoes');
  const scarves = WARDROBE_PRESETS.filter((p) => p.category === 'scarf');

  const curOuter = outers[selectedOuter % outers.length];
  const curTop = tops[selectedTop % tops.length];
  const curBot = bottoms[selectedBottom % bottoms.length];
  const curSho = shoes[selectedShoes % shoes.length];
  const curScf = scarves[selectedScarf % scarves.length];

  if (!isOpen) return null;

  const handleShuffle = () => {
    sounds.playChime('click');
    setSelectedOuter(Math.floor(Math.random() * outers.length));
    setSelectedTop(Math.floor(Math.random() * tops.length));
    setSelectedBottom(Math.floor(Math.random() * bottoms.length));
    setSelectedShoes(Math.floor(Math.random() * shoes.length));
    setSelectedScarf(Math.floor(Math.random() * scarves.length));
    setIsSaved(false);
  };

  const handleSave = () => {
    sounds.playChime('complete');
    onSaveLook({
      id: Date.now().toString(),
      title: `${curOuter.name} + ${curBot.name}`,
      date: new Date().toLocaleDateString('fa-IR'),
      vibe: 'ترکیب کمد من',
      pieces: [curOuter.name, curTop.name, curBot.name, curSho.name, curScf.name],
      steps: ['هماهنگی شال و کفش', 'تنظیم خط اتوی شلوار با بلندی کت'],
      occasion: 'استایل میکس کمد',
    });
    setIsSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full sm:h-[700px] bg-stone-900 border border-stone-800 rounded-none sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-950 text-teal-300 flex items-center justify-center border border-teal-800/60">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100">استودیو ترکیب لباس و کمد (Outfit Canvas)</h3>
              <p className="text-[10px] text-stone-400">ست کردن زنده لباس‌ها و سنجش هارمونی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas Area: Layered Outfit Mannequin view */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
          {/* Harmony Badge */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-stone-850/80 border border-stone-800 text-xs">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-bold text-stone-200">هارمونی رنگ و بافت:</span>
              <span className="text-emerald-400 font-bold font-latin">۹۶٪ عالی</span>
            </div>
            <button
              onClick={handleShuffle}
              className="text-[11px] text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40 flex items-center gap-1 hover:bg-rose-900/60"
            >
              <Shuffle className="w-3 h-3" />
              <span>ترکیب تصادفی</span>
            </button>
          </div>

          {/* Interactive Layer Strips */}
          <div className="space-y-2">
            {/* 1. Scarf */}
            <div className="p-2.5 rounded-xl bg-stone-850 border border-stone-800 flex items-center justify-between">
              <span className="text-[10px] text-stone-400 w-16">شال/روسری</span>
              <div className="flex-1 px-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-200 truncate">{curScf.name}</span>
                <span className="w-3 h-3 rounded-full shrink-0 border border-white/20 mr-2" style={{ backgroundColor: curScf.color }} />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedScarf((prev) => (prev + 1) % scarves.length)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. Outerwear */}
            <div className="p-2.5 rounded-xl bg-stone-850 border border-stone-800 flex items-center justify-between">
              <span className="text-[10px] text-stone-400 w-16">کت / مانتو</span>
              <div className="flex-1 px-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-200 truncate">{curOuter.name}</span>
                <span className="w-3 h-3 rounded-full shrink-0 border border-white/20 mr-2" style={{ backgroundColor: curOuter.color }} />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedOuter((prev) => (prev + 1) % outers.length)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. Top */}
            <div className="p-2.5 rounded-xl bg-stone-850 border border-stone-800 flex items-center justify-between">
              <span className="text-[10px] text-stone-400 w-16">شومیز/تاپ</span>
              <div className="flex-1 px-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-200 truncate">{curTop.name}</span>
                <span className="w-3 h-3 rounded-full shrink-0 border border-white/20 mr-2" style={{ backgroundColor: curTop.color }} />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedTop((prev) => (prev + 1) % tops.length)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4. Bottom */}
            <div className="p-2.5 rounded-xl bg-stone-850 border border-stone-800 flex items-center justify-between">
              <span className="text-[10px] text-stone-400 w-16">شلوار/دامن</span>
              <div className="flex-1 px-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-200 truncate">{curBot.name}</span>
                <span className="w-3 h-3 rounded-full shrink-0 border border-white/20 mr-2" style={{ backgroundColor: curBot.color }} />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedBottom((prev) => (prev + 1) % bottoms.length)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 5. Shoes */}
            <div className="p-2.5 rounded-xl bg-stone-850 border border-stone-800 flex items-center justify-between">
              <span className="text-[10px] text-stone-400 w-16">کفش</span>
              <div className="flex-1 px-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-200 truncate">{curSho.name}</span>
                <span className="w-3 h-3 rounded-full shrink-0 border border-white/20 mr-2" style={{ backgroundColor: curSho.color }} />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedShoes((prev) => (prev + 1) % shoes.length)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Vibe Diagnosis */}
          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1 text-xs">
            <span className="font-semibold text-rose-300 block">وایب این ترکیب: Urban Chic & Clean</span>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              این ترکیب تعادل ایده‌آلی بین وقار و راحتی روزمره دارد؛ رنگ کرم کت با سفیدی شومیز همخوانی کامل دارد و تیرگی شلوار راسته سیلوئت شما را منظم و کشیده نشان می‌دهد.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <button
            onClick={handleSave}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'در لوک‌ها ذخیره شد' : 'ذخیره این ترکیب در لوک‌ها'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
