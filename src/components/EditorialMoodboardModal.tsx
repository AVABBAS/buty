import React, { useState } from 'react';
import { X, Download, Share2, Sparkles, Check, Bookmark, Heart } from 'lucide-react';
import { MakeItMineResult } from '../types';

interface EditorialMoodboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MakeItMineResult;
  imageUrl?: string;
}

export const EditorialMoodboardModal: React.FC<EditorialMoodboardModalProps> = ({
  isOpen,
  onClose,
  result,
  imageUrl,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `لوک اختصاصی من در آینـا:\n${result.yourVersion.title}\nوایب: ${result.referenceAnalysis.vibe}\nنکته کلیدی: ${result.yourVersion.coreAdvice}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-stone-900 border border-stone-800 flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header bar */}
        <div className="p-3 bg-stone-950 flex items-center justify-between border-b border-stone-800">
          <span className="text-[11px] font-bold text-stone-300">کارت استایل مجله‌ای (Editorial Board)</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Editorial Canvas Card */}
        <div className="p-4 space-y-3.5 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-stone-100">
          {/* Top Brand Tag */}
          <div className="flex items-center justify-between text-[10px] text-stone-400 tracking-wider">
            <span className="font-latin tracking-widest uppercase text-rose-300">AYNA STUDIO LOOKBOOK</span>
            <span className="font-latin">N° 2026.04</span>
          </div>

          {/* Look Main Image */}
          <div className="relative rounded-2xl overflow-hidden border border-stone-800 aspect-[4/3] bg-stone-950">
            <img
              src={imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80'}
              alt="Editorial Look"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 right-2.5 left-2.5">
              <span className="text-[10px] font-medium text-amber-200 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10">
                {result.referenceAnalysis.vibe}
              </span>
              <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                {result.yourVersion.title}
              </h3>
            </div>
          </div>

          {/* Palette Swatches */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-stone-850 border border-stone-800">
            <span className="text-[10px] text-stone-400">پالت استایل:</span>
            <div className="flex items-center gap-1.5">
              {result.referenceAnalysis.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-1 text-[9px] text-stone-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 border border-white/20" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Step Action Blueprint */}
          <div className="space-y-1.5 text-xs">
            {result.yourVersion.steps.map((s) => (
              <div key={s.step} className="p-2 rounded-lg bg-stone-850/60 border border-stone-800/80 text-[11px]">
                <span className="font-semibold text-rose-300 block">{s.part}:</span>
                <span className="text-stone-300">{s.action}</span>
              </div>
            ))}
          </div>

          {/* Closet Element */}
          <div className="text-[10px] text-stone-400 bg-stone-950 p-2 rounded-lg border border-stone-800">
            <span className="text-teal-300 font-semibold">همخوانی با کمد: </span>
            {result.yourVersion.closetMatching}
          </div>

          {/* Footer quote */}
          <p className="text-center text-[10px] text-stone-400 italic">
            «{result.yourVersion.finalWord}»
          </p>

          {/* Share Action */}
          <div className="pt-1 flex gap-2">
            <button
              onClick={handleShare}
              className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'متن کپی شد!' : 'اشتراک‌گذاری در تلگرام'}</span>
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
    </div>
  );
};
