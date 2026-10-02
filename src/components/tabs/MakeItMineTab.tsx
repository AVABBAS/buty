import React, { useState } from 'react';
import {
  Wand2,
  Upload,
  Sparkles,
  Camera,
  CheckCircle,
  Bookmark,
  Share2,
  Image as ImageIcon,
  Palette,
  Scissors,
  Eye,
  Shirt,
  Tag,
  Flame,
  Check,
  Maximize2
} from 'lucide-react';
import { SAMPLE_REFERENCES } from '../../data/beautyKnowledge';
import { MakeItMineResult, SavedLook, TabType } from '../../types';
import { requestMakeItMine } from '../../services/api';
import { sounds } from '../../utils/soundEffects';
import { EditorialMoodboardModal } from '../EditorialMoodboardModal';
import { compressImage } from '../../utils/imageCompressor';

interface MakeItMineTabProps {
  onSaveLook: (look: SavedLook) => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenMixer?: () => void;
  savedLooks: SavedLook[];
}

export const MakeItMineTab: React.FC<MakeItMineTabProps> = ({
  onSaveLook,
  onNavigateTab,
  onOpenMixer,
  savedLooks,
}) => {
  const [selectedReference, setSelectedReference] = useState<any>(SAMPLE_REFERENCES[0]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [selectedVibe, setSelectedVibe] = useState<string>('Minimalist Chic');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<MakeItMineResult | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [activePin, setActivePin] = useState<string | null>('makeup');
  const [showEditorialModal, setShowEditorialModal] = useState<boolean>(false);

  const vibes = [
    'Minimalist Chic',
    'Soft Romantic',
    'Bold & Confident',
    'Natural Earthy',
    'Dark Mysterious',
    'Cute & Playful',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const raw = reader.result as string;
        const compressed = await compressImage(raw, 720, 720, 0.78);
        setUploadedImage(compressed);
        setSelectedReference(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    sounds.playChime('click');
    setIsLoading(true);
    setIsSaved(false);
    try {
      const promptToUse = customPrompt || selectedReference?.description || 'استایل شیک و تمیز متناسب با ویژگی‌های من';
      const imageToUse = uploadedImage || selectedReference?.image;
      const res = await requestMakeItMine(promptToUse, selectedVibe, imageToUse);
      setResult(res);
      sounds.playChime('complete');
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLook = () => {
    if (!result) return;
    sounds.playChime('step');
    const newLook: SavedLook = {
      id: Date.now().toString(),
      title: result.yourVersion.title || 'لوک اختصاصی من',
      date: new Date().toLocaleDateString('fa-IR'),
      vibe: result.referenceAnalysis.vibe,
      imageUrl: uploadedImage || selectedReference?.image,
      steps: result.yourVersion.steps.map((s) => `${s.part}: ${s.action}`),
      pieces: result.referenceAnalysis.keyAccessories,
      occasion: 'شخصی‌سازی شده',
    };
    onSaveLook(newLook);
    setIsSaved(true);
  };

  const currentImage = uploadedImage || selectedReference?.image;

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-stone-800 p-4 space-y-2 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-950 text-rose-300 flex items-center justify-center border border-rose-800/60 shadow-xs">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-stone-100">Make It Mine Studio (نسخه من رو بساز)</h1>
            <p className="text-[10px] text-stone-400">نه کپی کورکورانه، بلکه شخصی‌سازی براساس فرم و کمد تو</p>
          </div>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed bg-stone-950/70 p-3 rounded-2xl border border-stone-800/80">
          «هر چیزی که خوشت میاد، نسخه مناسب خودت رو بساز.» عکس هر اینفلوئنسر یا استایل مورد علاقه‌ات رو بفرست تا هوش مصنوعی عناصرش (سیلوئت، رنگ، میکاپ و مو) را تفکیک کند و نسخه مناسب فرم چهره، پوست و لباس‌های کمد خودت را بسازد.
        </p>
      </div>

      {/* Main Interactive Studio Canvas */}
      <div className="rounded-3xl bg-stone-900 border border-stone-800 p-4 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
          <span className="text-xs font-bold text-stone-200">۱. تصویر رفرنس با پین‌های هوشمند:</span>
          {uploadedImage && (
            <button
              onClick={() => {
                setUploadedImage(null);
                setSelectedReference(SAMPLE_REFERENCES[0]);
              }}
              className="text-[11px] text-rose-400 hover:underline"
            >
              حذف عکس آپلودی
            </button>
          )}
        </div>

        {/* Visual Reference with Interactive Hotspots */}
        <div className="relative rounded-2xl overflow-hidden border border-stone-800 aspect-[4/3] bg-stone-950 shadow-inner group">
          <img
            src={currentImage}
            alt="Reference Look"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-stone-950/30" />

          {/* Interactive Hotspot Pin 1: Makeup */}
          <button
            onClick={() => setActivePin('makeup')}
            style={{ top: '28%', left: '50%' }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-full text-[10px] font-bold transition-all shadow-lg flex items-center gap-1 ${
              activePin === 'makeup'
                ? 'bg-rose-500 text-stone-950 scale-110 ring-2 ring-white/60'
                : 'bg-stone-950/80 text-rose-200 border border-rose-500/50 hover:scale-105'
            }`}
          >
            <span>💄</span>
            <span>میکاپ و چهره</span>
          </button>

          {/* Interactive Hotspot Pin 2: Hair */}
          <button
            onClick={() => setActivePin('hair')}
            style={{ top: '15%', left: '26%' }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-full text-[10px] font-bold transition-all shadow-lg flex items-center gap-1 ${
              activePin === 'hair'
                ? 'bg-amber-400 text-stone-950 scale-110 ring-2 ring-white/60'
                : 'bg-stone-950/80 text-amber-200 border border-amber-400/50 hover:scale-105'
            }`}
          >
            <span>💇‍♀️</span>
            <span>بافت مو</span>
          </button>

          {/* Interactive Hotspot Pin 3: Silhouette & Outerwear */}
          <button
            onClick={() => setActivePin('outfit')}
            style={{ top: '65%', left: '46%' }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-full text-[10px] font-bold transition-all shadow-lg flex items-center gap-1 ${
              activePin === 'outfit'
                ? 'bg-teal-400 text-stone-950 scale-110 ring-2 ring-white/60'
                : 'bg-stone-950/80 text-teal-200 border border-teal-400/50 hover:scale-105'
            }`}
          >
            <span>🧥</span>
            <span>سیلوئت بالاتنه</span>
          </button>

          {/* Hotspot detail popup */}
          <div className="absolute bottom-2.5 right-2.5 left-2.5 bg-stone-900/90 backdrop-blur-md p-2.5 rounded-xl border border-stone-700/70 text-xs text-stone-200">
            {activePin === 'makeup' && (
              <div>
                <span className="text-rose-300 font-bold block mb-0.5">آنالیز چهره و میکاپ رفرنس:</span>
                <p className="text-[11px] text-stone-300">
                  تمرکز بر بافت شبنم‌دار پوست (Skin-first) + خط چشم محو در گوشه خارجی و رژ لب با پیگمنت پودری هلویی.
                </p>
              </div>
            )}
            {activePin === 'hair' && (
              <div>
                <span className="text-amber-300 font-bold block mb-0.5">آنالیز مو و سرپوش:</span>
                <p className="text-[11px] text-stone-300">
                  موهای آزاد با موج‌های ملایم طبیعی یا جمع شده مرتب با کلیپس مات؛ شال لایت بدون حجم اضافی.
                </p>
              </div>
            )}
            {activePin === 'outfit' && (
              <div>
                <span className="text-teal-300 font-bold block mb-0.5">سیلوئت و فرم لباس:</span>
                <p className="text-[11px] text-stone-300">
                  برش‌های راسته و آزاد (اورسایز کنترل‌شده) که خطوط عمودی صاف و تمیز ایجاد می‌کنند.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Button or Preset Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-400">یا عکس خودت رو آپلود کن:</span>
            <label className="cursor-pointer text-[11px] text-rose-300 bg-rose-950/70 border border-rose-800/60 px-2.5 py-1 rounded-lg hover:bg-rose-900 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span>انتخاب عکس از گالری</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Preset gallery */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {SAMPLE_REFERENCES.map((ref) => (
              <button
                key={ref.id}
                onClick={() => {
                  setSelectedReference(ref);
                  setUploadedImage(null);
                  sounds.playChime('click');
                }}
                className={`relative rounded-xl overflow-hidden aspect-square border transition-all ${
                  selectedReference?.id === ref.id && !uploadedImage
                    ? 'border-rose-500 ring-2 ring-rose-500/50 scale-102'
                    : 'border-stone-800 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={ref.image} alt={ref.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                  <span className="text-[9px] text-white font-medium truncate">{ref.vibe.split(' ')[0]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Vibe Selection */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] text-stone-300 font-medium block">
            ۲. وایب و حال‌وهوای دلخواهت:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {vibes.map((v) => (
              <button
                key={v}
                onClick={() => {
                  setSelectedVibe(v);
                  sounds.playChime('click');
                }}
                className={`py-1.5 px-2.5 text-[11px] rounded-xl border transition-all ${
                  selectedVibe === v
                    ? 'bg-rose-950/80 border-rose-500 text-rose-200 font-bold shadow-xs'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              در حال تجزیه و شخصی‌سازی نسخه تو...
            </span>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              <span>نسخه شخصی‌سازی شده من رو بساز</span>
            </>
          )}
        </button>
      </div>

      {/* Result Section */}
      {result && (
        <div className="rounded-3xl bg-stone-900 border border-rose-900/40 p-4 space-y-3.5 shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
            <div>
              <span className="text-[10px] text-rose-300 bg-rose-950 px-2 py-0.5 rounded-full border border-rose-800/40 font-latin">
                Your Custom Adaptation
              </span>
              <h3 className="text-xs font-bold text-stone-100 mt-1">
                {result.yourVersion.title}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowEditorialModal(true)}
                className="text-xs bg-amber-950/60 hover:bg-amber-900 border border-amber-700/60 text-amber-200 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1"
                title="تولید کارت مجله‌ای"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>کارت مجله</span>
              </button>
              <button
                onClick={handleSaveLook}
                className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                  isSaved
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-stone-950 border-stone-700 text-stone-200 hover:border-stone-600'
                }`}
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'ذخیره شد' : 'ذخیره'}</span>
              </button>
            </div>
          </div>

          {/* Reference Breakdown (Deconstruction) */}
          <div className="space-y-2 bg-stone-950 p-3 rounded-2xl border border-stone-800">
            <h4 className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-rose-400" />
              <span>تحلیل عناصر استایل اصلی:</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-400">
              <div>
                <span className="text-stone-300 font-medium">سیلوئت: </span>
                {result.referenceAnalysis.silhouette}
              </div>
              <div>
                <span className="text-stone-300 font-medium">میکاپ: </span>
                {result.referenceAnalysis.makeupFocus}
              </div>
              <div>
                <span className="text-stone-300 font-medium">مو: </span>
                {result.referenceAnalysis.hairStyle}
              </div>
              <div>
                <span className="text-stone-300 font-medium">پالت رنگی: </span>
                {result.referenceAnalysis.colors.join('، ')}
              </div>
            </div>
          </div>

          {/* Core Advice */}
          <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-200 leading-relaxed">
            💡 {result.yourVersion.coreAdvice}
          </div>

          {/* Action Steps */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>گام‌های اجرایی نسخه تو:</span>
            </h4>
            {result.yourVersion.steps.map((st) => (
              <div key={st.step} className="p-2.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs space-y-0.5">
                <div className="flex items-center gap-1.5 font-semibold text-rose-300 text-[11px]">
                  <span className="w-4 h-4 rounded-full bg-rose-950 text-rose-300 flex items-center justify-center text-[10px]">
                    {st.step}
                  </span>
                  <span>{st.part}</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed pr-5">
                  {st.action}
                </p>
              </div>
            ))}
          </div>

          {/* Closet matching */}
          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-stone-200 font-semibold">
              <Shirt className="w-3.5 h-3.5 text-teal-400" />
              <span>ترکیب با کمد تو:</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              {result.yourVersion.closetMatching}
            </p>
            <div className="pt-1 flex gap-2">
              <button
                onClick={() => onNavigateTab('closet')}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-[11px] text-teal-300 font-medium transition-colors text-center"
              >
                مشاهده کمد لباس‌ها
              </button>
              {onOpenMixer && (
                <button
                  onClick={onOpenMixer}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-teal-950/60 hover:bg-teal-900 border border-teal-800/60 text-[11px] text-teal-200 font-bold transition-colors text-center"
                >
                  استودیو ست کردن مانکن
                </button>
              )}
            </div>
          </div>

          {/* Final reassurance */}
          <p className="text-center text-xs text-stone-400 italic">
            «{result.yourVersion.finalWord}»
          </p>
        </div>
      )}

      {/* Editorial Card Modal */}
      {result && (
        <EditorialMoodboardModal
          isOpen={showEditorialModal}
          onClose={() => setShowEditorialModal(false)}
          result={result}
          imageUrl={currentImage}
        />
      )}
    </div>
  );
};
