import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  RefreshCw,
  Sparkles,
  CheckCircle,
  Eye,
  Smile,
  Shield,
  Layers,
  Palette,
  Maximize2
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFeatures?: (features: any) => void;
}

interface FaceZone {
  id: string;
  name: string;
  enName: string;
  x: number; // percentage
  y: number; // percentage
  advice: string;
  technique: string;
}

const FACE_ZONES: FaceZone[] = [
  {
    id: 'forehead',
    name: 'پیشانی و خط رویش',
    enName: 'Forehead & Hairline',
    x: 50,
    y: 22,
    advice: 'تعادل طول پیشانی با فرق از بغل یا چتری پروانه‌ای سبک',
    technique: 'استفاده از برانزر مات با حرکت نیم‌دایره در شقیقه‌ها برای ایجاد بعد طبیعی'
  },
  {
    id: 'brows',
    name: 'ابروها و هماهنگی چشم',
    enName: 'Brows & Eyes',
    x: 50,
    y: 35,
    advice: 'دنبال کردن زاویه طبیعی استخوان ابرو؛ پرهیز از تیره کردن یکدست ابتدای ابرو',
    technique: 'لیفت ملایم با ژل بی‌رنگ و هاشور زدن فقط در نقاط خالی با مداد خاکستری/قهوه‌ای'
  },
  {
    id: 'cheeks',
    name: 'گونه‌ها و استخوان گونه',
    enName: 'Cheekbones',
    x: 32,
    y: 50,
    advice: 'بلاش لیفت‌کننده (Lifted Blush) روی برجستگی بالا به سمت شقیقه',
    technique: 'ترکیب بلاش مایع هلویی با یک قطره هایلایتر برای شادابی شبنم‌دار'
  },
  {
    id: 'lips',
    name: 'لب‌ها و تناسب کمان کوپید',
    enName: 'Lips & Cupid\'s Bow',
    x: 50,
    y: 68,
    advice: 'خط لب محو (Blurred Lip) با تینت یا رژ نود گرم برای حجم طبیعی',
    technique: 'خط لب هم‌رنگ بافت لب فقط روی کمان لب، سپس محو کردن لبه‌ها با انگشت'
  },
  {
    id: 'jaw',
    name: 'زاویه فک و چانه',
    enName: 'Jawline & Chin',
    x: 50,
    y: 84,
    advice: 'ایجاد سایه ملایم طبیعی زیر لبه فک برای تفکیک تمیز گردن و صورت',
    technique: 'کانتور ملایم با رنگ خاکستری‌طور زیر خط فک (نه روی صورت) و هماهنگی با یقه لباس'
  }
];

export const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onApplyFeatures }) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<FaceZone>(FACE_ZONES[1]);
  const [undertoneOverlay, setUndertoneOverlay] = useState<'none' | 'gold' | 'silver'>('none');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    faceShape: string;
    undertone: string;
    harmonyTip: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera access unavailable or denied:', err);
      setCameraError('دسترسی به دوربین در این مرورگر مجاز نیست؛ در حال استفاده از آینه شبیه‌ساز');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleScan = () => {
    sounds.playChime('click');
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      sounds.playChime('complete');
      setScanResult({
        faceShape: 'بیضی با تناسب هماهنگ گونه‌ها',
        undertone: 'خنثی متمایل به گرم (Neutral Warm)',
        harmonyTip: 'فرم چهره شما با شال‌های رها و خط چشم گوشه‌ای کشیده بیشترین تعادل بصری را ایجاد می‌کند.'
      });
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full sm:h-[680px] bg-stone-900 border border-stone-800 rounded-none sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-3.5 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400/20 to-rose-400/20 border border-amber-500/40 text-amber-300 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                <span>اسکنر و آینه زیبایی شناختی</span>
                <span className="text-[10px] text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-700/50">Face Map</span>
              </h3>
              <p className="text-[10px] text-stone-400">شناخت ویژگی‌ها و تناسبات بدون عیب‌جویی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Frame */}
        <div className="relative flex-1 bg-stone-950 flex items-center justify-center overflow-hidden">
          {cameraActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            /* Fallback Aesthetic Model */
            <div className="relative w-full h-full">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                alt="Face Mirror Simulation"
                className="w-full h-full object-cover filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40" />
            </div>
          )}

          {/* Undertone Swatch Overlay */}
          {undertoneOverlay === 'gold' && (
            <div className="absolute inset-0 border-[16px] border-amber-400/40 pointer-events-none mix-blend-overlay animate-pulse" />
          )}
          {undertoneOverlay === 'silver' && (
            <div className="absolute inset-0 border-[16px] border-slate-300/40 pointer-events-none mix-blend-overlay animate-pulse" />
          )}

          {/* Face Geometry AR Oval Overlay */}
          <div className="absolute inset-x-8 top-12 bottom-20 border border-amber-300/30 rounded-[120px] pointer-events-none flex items-center justify-center">
            {/* Horizontal guide */}
            <div className="w-full h-[1px] bg-amber-300/15" />
            {/* Vertical guide */}
            <div className="h-full w-[1px] bg-amber-300/15 absolute" />

            {/* Scanning beam animation */}
            {isScanning && (
              <div className="absolute inset-x-4 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-bounce" />
            )}
          </div>

          {/* Interactive Zone Pins */}
          {FACE_ZONES.map((zone) => {
            const isSelected = selectedZone.id === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => {
                  setSelectedZone(zone);
                  sounds.playChime('click');
                }}
                style={{ top: `${zone.y}%`, left: `${zone.x}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 p-1 rounded-full transition-all duration-300 ${
                  isSelected
                    ? 'scale-125 ring-4 ring-rose-400/50 bg-rose-500 text-stone-950'
                    : 'bg-stone-900/80 text-amber-200 border border-amber-400/60 hover:scale-110'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-current" />
              </button>
            );
          })}

          {/* Quick Undertone Tester Switcher */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 bg-stone-950/70 backdrop-blur-md p-1.5 rounded-xl border border-stone-800">
            <span className="text-[9px] text-stone-400 text-center font-medium">آندرتون:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setUndertoneOverlay(undertoneOverlay === 'gold' ? 'none' : 'gold')}
                className={`px-2 py-1 text-[10px] rounded-lg border transition-all ${
                  undertoneOverlay === 'gold'
                    ? 'bg-amber-500/80 text-stone-950 font-bold border-amber-300'
                    : 'bg-stone-900 text-amber-300 border-amber-500/30'
                }`}
              >
                طلایی ✨
              </button>
              <button
                onClick={() => setUndertoneOverlay(undertoneOverlay === 'silver' ? 'none' : 'silver')}
                className={`px-2 py-1 text-[10px] rounded-lg border transition-all ${
                  undertoneOverlay === 'silver'
                    ? 'bg-slate-300 text-stone-950 font-bold border-white'
                    : 'bg-stone-900 text-slate-300 border-slate-500/30'
                }`}
              >
                نقره‌ای ❄️
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Drawer: Selected Zone Advice & Scan Button */}
        <div className="p-3.5 bg-stone-900/95 border-t border-stone-800 space-y-2.5 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <h4 className="text-xs font-bold text-stone-100">{selectedZone.name}</h4>
              <span className="text-[10px] text-stone-500 font-latin">({selectedZone.enName})</span>
            </div>
            <span className="text-[10px] text-amber-300">برای مشاهده هر ناحیه پین‌ها را لمس کن</span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-xs text-stone-300 space-y-1">
            <p className="text-[11px] leading-relaxed text-stone-200">
              <span className="font-semibold text-rose-300">💡 توصیه استایل: </span>
              {selectedZone.advice}
            </p>
            <p className="text-[10px] leading-relaxed text-stone-400">
              <span className="font-semibold text-amber-300">تکنیک اجرایی: </span>
              {selectedZone.technique}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex gap-2">
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {isScanning ? (
                <span>در حال تحلیل هندسه و تناسب چهره...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>اسکن فرم و تعادل چهره</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium"
            >
              بستن
            </button>
          </div>

          {scanResult && (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 space-y-1 animate-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between font-bold">
                <span>نتیجه هماهنگی: {scanResult.faceShape}</span>
                <span className="text-[10px] text-emerald-300 font-latin">{scanResult.undertone}</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">{scanResult.harmonyTip}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
