import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  SkipForward,
  CheckCircle,
  Camera,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface RoutineStep {
  title: string;
  durationSec: number;
  instruction: string;
  tip: string;
}

interface RoutinePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeMinutes: number;
  onFinishRoutine: () => void;
}

export const RoutinePlayerModal: React.FC<RoutinePlayerModalProps> = ({
  isOpen,
  onClose,
  timeMinutes,
  onFinishRoutine,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isMirrorActive, setIsMirrorActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Generate steps according to chosen minutes
  const steps: RoutineStep[] = [
    {
      title: 'مرحله ۱: آبرسانی و پوست شبنم‌دار (Skin Glow)',
      durationSec: timeMinutes === 3 ? 45 : timeMinutes === 10 ? 120 : 240,
      instruction: 'شستشوی سبک با آب ولرم، یک لایه مرطوب‌کننده و ماساژ گونه‌ها به سمت بالا، سپس ضدآفتاب.',
      tip: 'ضربه آرام با بند انگشت باعث جریان خون و بشاش شدن طبیعی چهره می‌شود.'
    },
    {
      title: 'مرحله ۲: ابرو، چشم و گونه (Natural Lift)',
      durationSec: timeMinutes === 3 ? 75 : timeMinutes === 10 ? 240 : 480,
      instruction: 'شانه کردن ابرو با ژل بی‌رنگ به سمت بالا؛ دو قطره تینت روی گونه و مرکز لب.',
      tip: 'تینت یک‌رنگ روی لب و گونه هارمونی و طراوت فوری ایجاد می‌کند.'
    },
    {
      title: 'مرحله ۳: موها و شال (Effortless Frame)',
      durationSec: timeMinutes === 3 ? 60 : timeMinutes === 10 ? 180 : 360,
      instruction: 'جمع کردن موها با کلیپس مات یا رها کردن موج‌های طبیعی؛ تنظیم شال با فرم یقه.',
      tip: 'گوشواره کوچک فلزی یا ساعت استایل را از روزمره به شیک تغییر می‌دهد.'
    }
  ];

  const currentStep = steps[currentStepIdx] || steps[0];

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIdx(0);
      setSecondsRemaining(steps[0].durationSec);
      setIsRunning(true);
      if (soundEnabled) sounds.playChime('click');
    }
  }, [isOpen, timeMinutes]);

  useEffect(() => {
    let interval: any = null;
    if (isOpen && isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      if (soundEnabled) sounds.playChime('step');
      if (currentStepIdx < steps.length - 1) {
        setCurrentStepIdx((prev) => prev + 1);
        setSecondsRemaining(steps[currentStepIdx + 1].durationSec);
      } else {
        setIsRunning(false);
        if (soundEnabled) sounds.playChime('complete');
      }
    }
    return () => clearInterval(interval);
  }, [isOpen, isRunning, secondsRemaining, currentStepIdx]);

  // Mirror toggle
  const toggleMirror = async () => {
    if (!isMirrorActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsMirrorActive(true);
      } catch (err) {
        console.warn('Camera failed:', err);
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setIsMirrorActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleNextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      if (soundEnabled) sounds.playChime('click');
      setCurrentStepIdx((prev) => prev + 1);
      setSecondsRemaining(steps[currentStepIdx + 1].durationSec);
    } else {
      onFinishRoutine();
      onClose();
    }
  };

  if (!isOpen) return null;

  const totalStepSec = currentStep.durationSec;
  const progressPercent = ((totalStepSec - secondsRemaining) / totalStepSec) * 100;
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full sm:h-[650px] bg-stone-900 border border-stone-800 rounded-none sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-3.5 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-950 text-rose-300 flex items-center justify-center border border-rose-800/60">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100">
                پلیر روتین درخشش {timeMinutes} دقیقه‌ای
              </h3>
              <p className="text-[10px] text-stone-400">
                گام {currentStepIdx + 1} از {steps.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMirror}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                isMirrorActive
                  ? 'bg-rose-900/60 border-rose-500 text-rose-200'
                  : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
              title="آینه همزمان حین روتین"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Canvas / Mirror */}
        <div className="relative flex-1 bg-stone-950 flex flex-col items-center justify-center p-6 overflow-hidden">
          {isMirrorActive && (
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-70 z-0"
            />
          )}

          {/* Circular Countdown Ring */}
          <div className="relative z-10 w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-stone-800"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-rose-400 transition-all duration-1000 ease-linear"
                strokeWidth="6"
                strokeDasharray={276}
                strokeDashoffset={276 - (276 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Time readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold font-latin text-stone-50 tracking-tighter">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-rose-300 font-medium mt-0.5">
                {currentStep.title.split(':')[0]}
              </span>
            </div>
          </div>

          {/* Step Instruction Card */}
          <div className="relative z-10 mt-6 w-full max-w-xs p-3.5 rounded-2xl bg-stone-900/90 backdrop-blur-md border border-stone-800 text-center space-y-1.5 shadow-xl">
            <h4 className="text-xs font-bold text-stone-100">{currentStep.title}</h4>
            <p className="text-[11px] text-stone-300 leading-relaxed">{currentStep.instruction}</p>
            <p className="text-[10px] text-amber-300/90 pt-1 border-t border-stone-800 leading-normal">
              💡 {currentStep.tip}
            </p>
          </div>
        </div>

        {/* Controls Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between z-20">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-11 h-11 rounded-full bg-rose-500 hover:bg-rose-600 text-stone-950 flex items-center justify-center font-bold shadow-lg transition-transform active:scale-95"
          >
            {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNextStep}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>{currentStepIdx < steps.length - 1 ? 'مرحله بعد' : 'پایان و خروج'}</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
