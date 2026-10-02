import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Bot,
  Sparkles,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface TelegramLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramLauncherModal: React.FC<TelegramLauncherModalProps> = ({ isOpen, onClose }) => {
  const [appUrl, setAppUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedMenuCmd, setCopiedMenuCmd] = useState<boolean>(false);
  const [copiedAppCmd, setCopiedAppCmd] = useState<boolean>(false);
  const [botStatus, setBotStatus] = useState<{
    configured: boolean;
    username: string | null;
  }>({ configured: false, username: null });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.origin;
      setAppUrl(currentUrl);

      // Fetch bot info from server
      fetch('/api/telegram/config')
        .then((res) => res.json())
        .then((data) => {
          if (data.appUrl) setAppUrl(data.appUrl);
          setBotStatus({
            configured: data.botTokenConfigured,
            username: data.botUsername,
          });
        })
        .catch(() => {
          // Default to current origin
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: 'url' | 'menu' | 'app') => {
    sounds.playChime('click');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'url') {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } else if (type === 'menu') {
        setCopiedMenuCmd(true);
        setTimeout(() => setCopiedMenuCmd(false), 2000);
      } else if (type === 'app') {
        setCopiedAppCmd(true);
        setTimeout(() => setCopiedAppCmd(false), 2000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
              <Send className="w-4 h-4 ml-0.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                <span>راهنمای راه‌اندازی در تلگرام</span>
                <span className="text-[10px] text-blue-300 bg-blue-950/80 px-1.5 py-0.2 rounded font-latin">Telegram Mini App</span>
              </h3>
              <p className="text-[10px] text-stone-400">اتصال مستقیم به ربات شما در کمتر از ۲ دقیقه</p>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Status Badge */}
          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-300" />
              <div>
                <span className="font-bold text-stone-200 block text-xs">وضعیت زیرساخت مینی‌اپ:</span>
                <span className="text-[10px] text-emerald-400 font-medium">
                  {botStatus.configured
                    ? `متصل به ربات @${botStatus.username || 'Bot'}`
                    : 'آماده اتصال به هر ربات تلگرامی'}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800 font-latin">
              TMA Ready
            </span>
          </div>

          {/* HTTPS WebApp URL */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-300 block">
              ۱. آدرس امن وب‌اپلیکیشن (HTTPS URL):
            </label>
            <div className="flex items-center gap-1.5 bg-stone-950 p-2 rounded-xl border border-stone-800">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 bg-transparent text-[11px] text-stone-300 font-latin outline-none select-all truncate"
              />
              <button
                onClick={() => copyToClipboard(appUrl, 'url')}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shrink-0"
              >
                {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUrl ? 'کپی شد' : 'کپی لینک'}</span>
              </button>
            </div>
            <p className="text-[10px] text-stone-400 leading-relaxed">
              این همان آدرس اختصاصی کلود است که تلگرام برای بارگذاری مینی‌اپ استفاده می‌کند.
            </p>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-stone-200 text-xs">۲. مراحل سریع راه‌اندازی با @BotFather:</h4>

            {/* Step 1 */}
            <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-200">
                <span className="w-4 h-4 rounded-full bg-blue-950 text-blue-300 flex items-center justify-center text-[10px]">
                  ۱
                </span>
                <span>ساخت ربات در BotFather:</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed pr-5">
                در تلگرام به آیدی <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-blue-400 underline font-latin">@BotFather</a> بروید و دستور <code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300 font-latin">/newbot</code> را بفرستید. نام و آیدی ربات دلخواهت را ثبت کن.
              </p>
            </div>

            {/* Step 2: Set Menu Button */}
            <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-stone-200">
                  <span className="w-4 h-4 rounded-full bg-blue-950 text-blue-300 flex items-center justify-center text-[10px]">
                    ۲
                  </span>
                  <span>فعال‌سازی دکمه منو (Menu Button):</span>
                </div>
                <button
                  onClick={() => copyToClipboard('/setmenubutton', 'menu')}
                  className="text-[10px] text-blue-300 hover:text-blue-200 underline flex items-center gap-1"
                >
                  {copiedMenuCmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>کپی دستور</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed pr-5">
                دستور <code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300 font-latin">/setmenubutton</code> را به BotFather بفرست، رباتت را انتخاب کن، آدرس کپی‌شده بالا را بفرست و عنوان دکمه را <strong className="text-stone-200">«💄 ورود به آینـا»</strong> بگذار.
              </p>
            </div>

            {/* Step 3: Direct App Link */}
            <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-stone-200">
                  <span className="w-4 h-4 rounded-full bg-blue-950 text-blue-300 flex items-center justify-center text-[10px]">
                    ۳
                  </span>
                  <span>ساخت لینک مستقیم اشتراک‌گذاری (/newapp):</span>
                </div>
                <button
                  onClick={() => copyToClipboard('/newapp', 'app')}
                  className="text-[10px] text-blue-300 hover:text-blue-200 underline flex items-center gap-1"
                >
                  {copiedAppCmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>کپی دستور</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed pr-5">
                برای داشتن لینک مستقیم (مثل <code className="text-amber-300 font-latin">t.me/YourBot/app</code>) جهت قرار دادن در بیو اینستاگرام و کانال‌ها، دستور <code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300 font-latin">/newapp</code> را به BotFather ارسال کن.
              </p>
            </div>
          </div>

          {/* Quick Direct Test */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/40 to-stone-850 border border-blue-900/40 space-y-2">
            <span className="font-bold text-blue-300 flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تست در تلگرام:</span>
            </span>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              کافیست همین آدرس را در چت Saved Messages یا پیام خصوصی در تلگرام بفرستید؛ تلگرام آن را به عنوان یک مینی‌اپ تشخیص داده و با لمس آن فوراً تمام‌صفحه باز می‌شود.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <button
            onClick={() => copyToClipboard(appUrl, 'url')}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>کپی آدرس مینی‌اپ برای BotFather</span>
          </button>
        </div>
      </div>
    </div>
  );
};
