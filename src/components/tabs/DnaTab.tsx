import React, { useState } from 'react';
import {
  Fingerprint,
  Sparkles,
  Sliders,
  Palette,
  User,
  Heart,
  HelpCircle,
  Check,
  Compass
} from 'lucide-react';
import { STYLE_ARCHETYPES, COLOR_PALETTES } from '../../data/beautyKnowledge';
import { BeautyDna, StyleDna } from '../../types';

interface DnaTabProps {
  dna: BeautyDna;
  onUpdateDna: (newDna: BeautyDna) => void;
}

export const DnaTab: React.FC<DnaTabProps> = ({ dna, onUpdateDna }) => {
  const [activeSubTab, setActiveSubTab] = useState<'axes' | 'archetype' | 'palette' | 'features'>('axes');
  const [motivation, setMotivation] = useState<string>('احساس راحتی و آراستگی با هویت خودم');

  const motivations = [
    'احساس راحتی و آراستگی با هویت خودم',
    'جذابیت و حس زنانه در موقعیت‌ها',
    'حضور حرفه‌ای و باوقار در کار و دانشگاه',
    'تنوع و امتحان چیزهای جدید بدون ترس',
    'عکس‌های بهتر و اعتمادبه‌نفس در جمع',
  ];

  const handleSliderChange = (key: keyof StyleDna, value: number) => {
    const updated: BeautyDna = {
      ...dna,
      styleDna: {
        ...dna.styleDna,
        [key]: value,
      },
    };
    onUpdateDna(updated);
  };

  const handleSelectArchetype = (archId: string) => {
    const updated: BeautyDna = {
      ...dna,
      styleDna: {
        ...dna.styleDna,
        primaryArchetype: archId,
      },
    };
    onUpdateDna(updated);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  const handleSelectPalette = (paletteId: string) => {
    const updated: BeautyDna = {
      ...dna,
      styleDna: {
        ...dna.styleDna,
        preferredPalette: paletteId,
      },
    };
    onUpdateDna(updated);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Intro Card */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-850 via-stone-850 to-stone-900 border border-stone-800 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-950/60 text-rose-300 flex items-center justify-center">
            <Fingerprint className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-stone-100">Beauty & Style DNA</h1>
            <p className="text-[11px] text-stone-400">نقشه ترجیحات شخصی تو؛ نه برچسب علمی یا قضاوت</p>
          </div>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed bg-stone-900/60 p-2.5 rounded-xl border border-stone-800/80">
          «این منم؛ و می‌دونم چطور خودم رو نشون بدم.» دی‌ان‌ای استایل به تو نمی‌گه تو چه تیپ انسانی هستی، بلکه کمک می‌کنه سلیقه، فرم چهره و راحتی‌ات رو بهتر بشناسی تا هوشمندانه‌تر انتخاب کنی.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-850 rounded-xl border border-stone-800">
        {[
          { id: 'axes', label: 'محورهای استایل' },
          { id: 'archetype', label: 'آرکیتایپ‌ها' },
          { id: 'palette', label: 'پالت رنگی' },
          { id: 'features', label: 'چهره و مو' },
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => setActiveSubTab(st.id as any)}
            className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
              activeSubTab === st.id
                ? 'bg-rose-950/70 text-rose-200 border border-rose-800/60 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* 1. Preference Axes (Sliders) */}
      {activeSubTab === 'axes' && (
        <div className="rounded-2xl bg-stone-850 border border-stone-800 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h3 className="text-xs font-bold text-stone-200">طیف‌های ترجیحی تو (Preference Map)</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">اسلایدرها رو تنظیم کن تا هوش مصنوعی بهتر بشناستت</p>
            </div>
            <Sliders className="w-4 h-4 text-rose-400" />
          </div>

          <div className="space-y-4">
            {/* Axis 1: Minimal vs Maximal */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-stone-300">
                <span>مینیمال و خلوت (Minimal)</span>
                <span>ماکسیمال و پرکار (Maximal)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={dna.styleDna.minimalVsMaximal}
                onChange={(e) => handleSliderChange('minimalVsMaximal', parseInt(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
              />
              <div className="text-center text-[10px] text-stone-400 font-latin">
                {dna.styleDna.minimalVsMaximal < 40 ? 'گرایش به سادگی و خطوط تمیز' : dna.styleDna.minimalVsMaximal > 60 ? 'گرایش به لایه‌بندی و جزئیات فراوان' : 'تعادل میان سادگی و جزئیات'}
              </div>
            </div>

            {/* Axis 2: Colorful vs Neutral */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-stone-300">
                <span>رنگ‌های خنثی و نود</span>
                <span>رنگ‌های زنده و شاد</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={dna.styleDna.colorfulVsNeutral}
                onChange={(e) => handleSliderChange('colorfulVsNeutral', parseInt(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
              />
              <div className="text-center text-[10px] text-stone-400 font-latin">
                {dna.styleDna.colorfulVsNeutral < 40 ? 'پالت‌های کرم، مشکی، سفید و خاکی' : 'علاقه به تنوع رنگی و هیجان بصری'}
              </div>
            </div>

            {/* Axis 3: Bold vs Subtle */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-stone-300">
                <span>ملایم و نامحسوس (Subtle)</span>
                <span>جسور و چشمگیر (Bold)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={dna.styleDna.boldVsSubtle}
                onChange={(e) => handleSliderChange('boldVsSubtle', parseInt(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
              />
            </div>

            {/* Axis 4: Feminine vs Structured */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-stone-300">
                <span>زنانه و لطیف (Feminine)</span>
                <span>ساختاریافته و کت‌محور (Structured)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={dna.styleDna.feminineVsStructured}
                onChange={(e) => handleSliderChange('feminineVsStructured', parseInt(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
              />
            </div>

            {/* Axis 5: Comfort vs Fashion */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-stone-300">
                <span>اول راحتی کامل (Comfort)</span>
                <span>اولویت با فشن و استایل (Fashion)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={dna.styleDna.comfortVsFashion}
                onChange={(e) => handleSliderChange('comfortVsFashion', parseInt(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Archetypes */}
      {activeSubTab === 'archetype' && (
        <div className="rounded-2xl bg-stone-850 border border-stone-800 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h3 className="text-xs font-bold text-stone-200">آرکیتایپ‌های استایل (سبک‌ها، نه شخصیت)</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">سبکی که بیشترین حس راحتی و خود بودن را بهت میده</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {STYLE_ARCHETYPES.map((arch) => {
              const isSelected = dna.styleDna.primaryArchetype === arch.id;
              return (
                <div
                  key={arch.id}
                  onClick={() => handleSelectArchetype(arch.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-rose-950/50 border-rose-500 shadow-sm'
                      : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{arch.icon}</span>
                    {isSelected && (
                      <span className="text-[10px] text-rose-300 bg-rose-900/60 px-1.5 py-0.2 rounded font-medium">
                        انتخاب شده
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-stone-100">{arch.name}</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">{arch.tagline}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {arch.keywords.slice(0, 3).map((kw, i) => (
                      <span key={i} className="text-[9px] text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Color Palettes */}
      {activeSubTab === 'palette' && (
        <div className="rounded-2xl bg-stone-850 border border-stone-800 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h3 className="text-xs font-bold text-stone-200">پالت‌های رنگی محبوب تو</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">رنگ‌ها ابزار بیان احساس و وایب امروزت هستند</p>
            </div>
            <Palette className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-2.5">
            {COLOR_PALETTES.map((pal) => {
              const isSelected = dna.styleDna.preferredPalette === pal.id;
              return (
                <div
                  key={pal.id}
                  onClick={() => handleSelectPalette(pal.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500 shadow-sm'
                      : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-200">{pal.name}</span>
                    <span className="text-[10px] text-stone-400">{pal.vibe}</span>
                  </div>
                  {/* Swatches */}
                  <div className="flex items-center gap-2 mb-2">
                    {pal.colors.map((c, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-lg border border-white/20 shadow-xs"
                        style={{ backgroundColor: c }}
                        title={pal.names[i]}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    <span className="text-stone-300 font-medium">بهترین برای: </span>
                    {pal.bestFor}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Feature & Body Map (Positive & Functional) */}
      {activeSubTab === 'features' && (
        <div className="rounded-2xl bg-stone-850 border border-stone-800 p-4 space-y-4">
          <div className="border-b border-stone-800 pb-2">
            <h3 className="text-xs font-bold text-stone-200">مشخصات ساختاری و طبیعی</h3>
            <p className="text-[11px] text-stone-400 mt-0.5">برای تناسب اکسسوری، فرم شال و یقه بدون کلمات سرزنش‌گر</p>
          </div>

          {/* Face Shape */}
          <div className="space-y-1.5">
            <label className="text-xs text-stone-300 font-medium block">فرم کلی صورت:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'oval', label: 'بیضی' },
                { id: 'round', label: 'گرد' },
                { id: 'heart', label: 'قلبی' },
                { id: 'square', label: 'مربعی / زاویه‌دار' },
                { id: 'long', label: 'کشیده' },
                { id: 'diamond', label: 'لوزی / گونه‌دار' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => onUpdateDna({ ...dna, faceShape: f.id as any })}
                  className={`py-1.5 text-xs rounded-xl border transition-all ${
                    dna.faceShape === f.id
                      ? 'bg-rose-950/60 border-rose-500 text-rose-200 font-semibold'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Undertone */}
          <div className="space-y-1.5">
            <label className="text-xs text-stone-300 font-medium block">آندرتون پوست (برای انتخاب زیورآلات و رژ):</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'warm', label: 'گرم (طلایی / هلویی)' },
                { id: 'cool', label: 'سرد (نقره‌ای / رزی)' },
                { id: 'neutral', label: 'خنثی (هر دو)' },
              ].map((u) => (
                <button
                  key={u.id}
                  onClick={() => onUpdateDna({ ...dna, undertone: u.id as any })}
                  className={`py-1.5 text-xs rounded-xl border transition-all ${
                    dna.undertone === u.id
                      ? 'bg-rose-950/60 border-rose-500 text-rose-200 font-semibold'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hair Texture */}
          <div className="space-y-1.5">
            <label className="text-xs text-stone-300 font-medium block">بافت طبیعی مو:</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'straight', label: 'لَخت و صاف' },
                { id: 'wavy', label: 'موج‌دار' },
                { id: 'curly', label: 'فر' },
                { id: 'coily', label: 'سیم‌تلفنی' },
              ].map((h) => (
                <button
                  key={h.id}
                  onClick={() => onUpdateDna({ ...dna, hairTexture: h.id as any })}
                  className={`py-1.5 text-xs rounded-xl border transition-all ${
                    dna.hairTexture === h.id
                      ? 'bg-rose-950/60 border-rose-500 text-rose-200 font-semibold'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Motivation Selector */}
      <div className="rounded-2xl bg-stone-850 border border-stone-800 p-4 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-200">
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span>انگیزه اصلی تو از زیبایی چیه؟</span>
        </div>
        <p className="text-[11px] text-stone-400">
          کمک می‌کنه توصیه‌ها بر اساس هدف واقعی‌ات باشند، نه القای نیاز اضافی.
        </p>
        <div className="space-y-1.5">
          {motivations.map((m) => (
            <button
              key={m}
              onClick={() => setMotivation(m)}
              className={`w-full text-right p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                motivation === m
                  ? 'bg-rose-950/40 border-rose-500 text-rose-200 font-medium'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
              }`}
            >
              <span>{m}</span>
              {motivation === m && <Check className="w-3.5 h-3.5 text-rose-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
