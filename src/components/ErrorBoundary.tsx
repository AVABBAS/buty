import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in AYNA mini app:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Clear potentially corrupt session data while preserving DNA
      const dna = localStorage.getItem('ayna_beauty_dna');
      localStorage.clear();
      if (dna) {
        localStorage.setItem('ayna_beauty_dna', dna);
      }
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 font-vazir text-center" dir="rtl">
          <div className="max-w-sm w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-stone-100">یک اختلال موقت رخ داد</h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                نگران نباشید؛ داده‌های استایل شما امن هستند. با دکمه زیر صفحه را بارگذاری مجدد کنید.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>بارگذاری مجدد و بازیابی</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
