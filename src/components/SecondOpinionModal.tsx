import React, { useState } from 'react';
import { X, Scale, Upload, Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { requestSecondOpinion } from '../services/api';
import { SecondOpinionResult } from '../types';
import { compressImage } from '../utils/imageCompressor';

interface SecondOpinionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecondOpinionModal: React.FC<SecondOpinionModalProps> = ({ isOpen, onClose }) => {
  const [photoA, setPhotoA] = useState<string | null>(
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80'
  );
  const [photoB, setPhotoB] = useState<string | null>(
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500&auto=format&fit=crop&q=80'
  );
  const [nameA, setNameA] = useState<string>('کت کتی کرم + شلوار راسته');
  const [nameB, setNameB] = useState<string>('پیراهن ساتن مشکی + اکسسوری تیره');
  const [context, setContext] = useState<string>('دورهمی عصر در کافه');
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SecondOpinionResult | null>({
    optionA_analysis: {
      name: 'کت کتی کرم + شلوار راسته',
      vibe: 'مینیمال، باوقار، تمیز و آرام',
      impression: 'حس اعتمادبه‌نفس متین و بدون تلاش افراطی؛ در نور روز و کافه بسیار آراسته و شیک دیده می‌شود.'
    },
    optionB_analysis: {
      name: 'پیراهن ساتن مشکی + اکسسوری تیره',
      vibe: 'دراماتیک، شبانه، مرموز و جذاب',
      impression: 'تمرکز را روی چهره و برق پارچه می‌برد؛ برای فضاهای کم‌نور عصر یا مراسم رسمی‌تر برجستگی دارد.'
    },
    verdict: 'اگر قرار است پیاده‌روی یا نشستن طولانی داشته باشی، گزینه اول راحتی بالاتری دارد؛ اگر می‌خواهی در عکس‌ها فوکوس قوی داشته باشی، گزینه دوم جذاب‌تر است.'
  });

  if (!isOpen) return null;

  const handleCompare = async () => {
    setIsLoading(true);
    try {
      const res = await requestSecondOpinion(nameA, nameB, context);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUploadA = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 600, 600, 0.75);
        setPhotoA(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUploadB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 600, 600, 0.75);
        setPhotoB(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full sm:h-[700px] bg-stone-900 border border-stone-800 rounded-none sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-950 text-amber-300 flex items-center justify-center border border-amber-800/60">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100">Second Opinion Duel (A vs B)</h3>
              <p className="text-[10px] text-stone-400">مقایسه تصویری دو انتخاب با اسلایدر تطبیقی</p>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Visual Sliding Split Comparator */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-stone-800 select-none bg-stone-950">
            {/* Image A (underneath) */}
            <div className="absolute inset-0">
              <img src={photoA || ''} alt="Option A" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-stone-950/80 px-2 py-0.5 rounded text-[10px] text-rose-300 font-bold">
                گزینه A
              </div>
            </div>

            {/* Image B (clipped on top) */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={photoB || ''}
                alt="Option B"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ width: '100%', height: '100%', maxWidth: 'none' }}
              />
              <div className="absolute top-2 left-2 bg-stone-950/80 px-2 py-0.5 rounded text-[10px] text-amber-300 font-bold">
                گزینه B
              </div>
            </div>

            {/* Slider Divider Bar */}
            <div
              className="absolute inset-y-0 w-1 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-6 h-6 rounded-full bg-white text-stone-950 flex items-center justify-center shadow-lg text-[9px] font-bold">
                ↔
              </div>
            </div>

            {/* Invisible Range Input for dragging */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
            />
          </div>

          <div className="text-[10px] text-center text-stone-400">
            اسلایدر وسط عکس را به چپ و راست بکشید تا دو استایل را تطبیق دهید
          </div>

          {/* Context and inputs */}
          <div className="space-y-2 p-3 rounded-2xl bg-stone-850 border border-stone-800 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-rose-300 block mb-1">نام گزینه A:</label>
                <input
                  type="text"
                  value={nameA}
                  onChange={(e) => setNameA(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg p-1.5 text-[11px] text-stone-200"
                />
                <label className="cursor-pointer text-[10px] text-stone-400 hover:text-stone-200 mt-1 block">
                  📷 آپلود عکس A
                  <input type="file" accept="image/*" onChange={handleFileUploadA} className="hidden" />
                </label>
              </div>

              <div>
                <label className="text-[10px] text-amber-300 block mb-1">نام گزینه B:</label>
                <input
                  type="text"
                  value={nameB}
                  onChange={(e) => setNameB(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg p-1.5 text-[11px] text-stone-200"
                />
                <label className="cursor-pointer text-[10px] text-stone-400 hover:text-stone-200 mt-1 block">
                  📷 آپلود عکس B
                  <input type="file" accept="image/*" onChange={handleFileUploadB} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-stone-300 block mb-1">موقعیت و هدف:</label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg p-1.5 text-[11px] text-stone-200"
              />
            </div>

            <button
              onClick={handleCompare}
              disabled={isLoading}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {isLoading ? <span>در حال تحلیل تفاوت‌های حسی...</span> : <span>تحلیل هوشمند تفاوت‌ها</span>}
            </button>
          </div>

          {/* AI Comparative Diagnostic */}
          {result && (
            <div className="p-3.5 rounded-2xl bg-stone-850 border border-stone-800 space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-stone-900 border border-rose-900/40 space-y-1">
                  <span className="font-bold text-rose-300 block">{result.optionA_analysis.name}</span>
                  <span className="text-[10px] text-stone-400 block font-medium">وایب: {result.optionA_analysis.vibe}</span>
                  <p className="text-[11px] text-stone-300 leading-relaxed">{result.optionA_analysis.impression}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-900 border border-amber-900/40 space-y-1">
                  <span className="font-bold text-amber-300 block">{result.optionB_analysis.name}</span>
                  <span className="text-[10px] text-stone-400 block font-medium">وایب: {result.optionB_analysis.vibe}</span>
                  <p className="text-[11px] text-stone-300 leading-relaxed">{result.optionB_analysis.impression}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-[11px] text-rose-200 leading-relaxed">
                🎯 <span className="font-bold">توصیه بی‌طرفانه: </span>{result.verdict}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
