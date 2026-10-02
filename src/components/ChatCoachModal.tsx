import React, { useState } from 'react';
import { X, Send, Sparkles, User, Heart } from 'lucide-react';
import { requestCoachChat } from '../services/api';

interface ChatCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatCoachModal: React.FC<ChatCoachModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    {
      role: 'model',
      text: 'سلام! من رفیق و مشاور هوشمند زیبایی تو در «آینـا» هستم. امروز چه حسی داری یا درباره چه چیزی می‌خواهی با هم تصمیم بگیریم؟',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user' as const, text: userText }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const reply = await requestCoachChat(userText, messages);
      setMessages([...newHistory, { role: 'model', text: reply }]);
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } catch (e) {
      console.error(e);
      setMessages([
        ...newHistory,
        {
          role: 'model',
          text: 'من همیشه اینجام. یادت باشه زیبایی یک نمره نیست؛ همین که تمیز، آراسته و با خودت در صلحی کافیه.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md h-[85vh] sm:h-[600px] bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-3.5 bg-stone-850 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                <span>رفیق زیبایی آینـا</span>
                <span className="text-[10px] text-emerald-400">● آنلاین</span>
              </h3>
              <p className="text-[10px] text-stone-400">بدون قضاوت و با هدف آرامش و راهکار سریع</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-stone-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message feed */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'model' && (
                <div className="w-6 h-6 rounded-full bg-rose-950 text-rose-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                  آ
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-2xl leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-rose-600 text-white rounded-br-xs'
                    : 'bg-stone-800/90 text-stone-200 border border-stone-700/60 rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-stone-400 text-xs py-1">
              <div className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span>در حال فکر کردن به بهترین توصیه برای تو...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-stone-850 border-t border-stone-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="هرچیزی تو ذهنته بگو..."
            className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-rose-500 placeholder:text-stone-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white flex items-center justify-center shrink-0 transition-colors"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
