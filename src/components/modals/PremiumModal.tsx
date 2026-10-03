import React, { useState } from 'react';
import {
  X,
  Crown,
  CheckCircle,
  Sparkles,
  Star,
  CreditCard,
  Tag,
  ShieldCheck,
  Zap,
  ArrowRight,
  Gift,
  Copy,
  Check
} from 'lucide-react';
import { SUBSCRIPTION_PLANS, VALID_PROMO_CODES } from '../../data/subscriptionPlans';
import { SubscriptionTier, UserSubscription } from '../../types';
import { sounds } from '../../utils/soundEffects';
import { createTelegramStarsPayment, redeemPromoCode } from '../../services/api';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscription?: UserSubscription;
  onActivateSubscription: (sub: UserSubscription) => void;
  telegramUsername?: string;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  currentSubscription,
  onActivateSubscription,
  telegramUsername,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionTier>('vip');
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [promoAppliedMsg, setPromoAppliedMsg] = useState<string | null>(null);
  const [promoErrorMsg, setPromoErrorMsg] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'plans' | 'checkout' | 'success'>('plans');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stars' | 'card' | 'instant'>('stars');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedCard, setCopiedCard] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];

  const rawPriceToman = selectedPlan.priceToman;
  const finalPriceToman = discountPercent > 0 ? Math.round(rawPriceToman * (1 - discountPercent / 100)) : rawPriceToman;
  const rawPriceStars = selectedPlan.priceStars;
  const finalPriceStars = discountPercent > 0 ? Math.round(rawPriceStars * (1 - discountPercent / 100)) : rawPriceStars;

  const handleApplyPromo = async () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    setIsProcessing(true);
    try {
      // Server-authoritative promo validation and redemption
      const result = await redeemPromoCode(code);
      if (result.ok && result.subscription) {
        setPromoAppliedMsg(result.message || 'کد تخفیف با موفقیت اعمال شد! ✨');
        setPromoErrorMsg(null);
        onActivateSubscription(result.subscription);
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      } else {
        setPromoErrorMsg(result.message || 'کد تخفیف واردشده معتبر نیست یا منقضی شده است.');
        setPromoAppliedMsg(null);
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        }
      }
    } catch {
      setPromoErrorMsg('خطا در اعتبارسنجی کد تخفیف');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecutePayment = async () => {
    setIsProcessing(true);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }

    try {
      if (selectedPaymentMethod === 'stars') {
        // Real Server-Authoritative Telegram Stars Payment
        const res = await createTelegramStarsPayment(selectedPlan.id);
        if (res.ok && res.invoiceLink) {
          // If in Telegram WebApp, open official Telegram Stars invoice modal
          if (window.Telegram?.WebApp?.openInvoice) {
            window.Telegram.WebApp.openInvoice(res.invoiceLink, (status: string) => {
              if (status === 'paid') {
                const expiry = new Date();
                expiry.setMonth(expiry.getMonth() + selectedPlan.durationMonths);
                onActivateSubscription({
                  tier: selectedPlan.id,
                  isActive: true,
                  expiresAt: expiry.toISOString(),
                  startedAt: new Date().toISOString(),
                  planName: selectedPlan.name,
                  paymentMethod: 'stars',
                });
                setPaymentStep('success');
              }
            });
          } else {
            // Browser sandbox: open invoice in new tab / redirect
            window.open(res.invoiceLink, '_blank');
          }
        } else {
          setPromoErrorMsg(res.error || 'خطا در ایجاد فاکتور تلگرام استارز. لطفاً توکن بات را بررسی کنید.');
        }
      } else if (selectedPaymentMethod === 'card') {
        // Iranian Gateway / Card flow: Transparent status, no fake simulation
        setPromoErrorMsg('درگاه مستقیم بانکی در حال تکمیل است. لطفاً از گزینه تلگرام استارز (⭐) استفاده فرمایید یا پس از واریز، شماره پیگیری را به پشتیبانی ارسال کنید.');
      }
    } catch (err: any) {
      setPromoErrorMsg(err?.message || 'خطا در ارتباط با درگاه پرداخت');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyCard = () => {
    navigator.clipboard.writeText('۶۰۳۷-۹۹۷۵-۱۲۳۴-۵۶۷۸');
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in-fade">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-stone-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {paymentStep === 'plans' && (
          <div className="space-y-4">
            {/* Header Hero */}
            <div className="text-center pt-2 space-y-1.5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-rose-500 text-stone-950 shadow-lg shadow-amber-500/20 mb-1">
                <Crown className="w-6 h-6 fill-current" />
              </div>
              <h2 className="text-base font-extrabold text-stone-100 flex items-center justify-center gap-1.5">
                <span>ارتقا به آینـا پریمیوم</span>
                <span className="text-[10px] text-amber-300 font-latin font-bold bg-amber-950/80 border border-amber-600/50 px-2 py-0.5 rounded-full">
                  VIP ACCESS
                </span>
              </h2>
              <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
                قفل امکانات نامحدود، اسکن اختصاصی فرم چهره و شبیه‌ساز استایل مانکن را باز کنید.
              </p>
            </div>

            {/* Current status if active */}
            {currentSubscription?.isActive && (
              <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>اشتراک فعال: <strong>{currentSubscription.planName}</strong></span>
                </div>
                <span className="text-[10px] text-emerald-300 font-latin">
                  تا {currentSubscription.expiresAt ? new Date(currentSubscription.expiresAt).toLocaleDateString('fa-IR') : 'نامحدود'}
                </span>
              </div>
            )}

            {/* Plan Selector Cards */}
            <div className="space-y-2.5">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      if (window.Telegram?.WebApp?.HapticFeedback) {
                        window.Telegram.WebApp.HapticFeedback.selectionChanged();
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-gradient-to-r from-stone-900 to-amber-950/40 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-stone-900/80 hover:bg-stone-850 border-white/[0.08]'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-400 to-rose-400 text-stone-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                        {plan.badge}
                      </span>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-amber-400 bg-amber-400' : 'border-stone-600'}`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                          </span>
                          <span className="text-xs font-bold text-stone-100">{plan.name}</span>
                        </div>
                        <span className="text-[10px] text-stone-400 block pr-6 font-latin">
                          {plan.latinName}
                        </span>
                      </div>

                      <div className="text-left space-y-0.5">
                        <div className="flex items-center gap-1 justify-end">
                          {plan.originalPriceToman && (
                            <span className="text-[10px] text-stone-500 line-through">
                              {plan.originalPriceToman.toLocaleString('fa-IR')}
                            </span>
                          )}
                          <span className="text-sm font-extrabold text-amber-300 font-latin">
                            {plan.priceToman.toLocaleString('fa-IR')}
                          </span>
                          <span className="text-[10px] text-stone-400">تومان</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-yellow-400 justify-end font-latin font-medium">
                          <span>⭐ {plan.priceStars} Stars</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Plan Feature Highlights */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-white/[0.08] space-y-2">
              <span className="text-xs font-bold text-stone-200 block mb-1">
                ویژگی‌های طرح {selectedPlan.name}:
              </span>
              <div className="space-y-1.5">
                {selectedPlan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-stone-300">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="کد تخفیف داری؟ (مثلاً AYNA2026)"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400/50 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder:text-stone-500 uppercase font-latin outline-none"
                  />
                  <Tag className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-3" />
                </div>
                <button
                  onClick={handleApplyPromo}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 text-xs font-semibold transition-all"
                >
                  اعمال
                </button>
              </div>

              {promoAppliedMsg && (
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 pr-1 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{promoAppliedMsg}</span>
                </div>
              )}
              {promoErrorMsg && (
                <div className="text-[11px] text-rose-400 pr-1">
                  {promoErrorMsg}
                </div>
              )}
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={() => setPaymentStep('checkout')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-rose-400 hover:from-amber-300 hover:to-rose-300 active:scale-98 text-stone-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>ادامه خرید ({finalPriceToman.toLocaleString('fa-IR')} تومان)</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}

        {paymentStep === 'checkout' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <button
                onClick={() => setPaymentStep('plans')}
                className="text-stone-400 hover:text-stone-200 text-xs flex items-center gap-1"
              >
                <span>بازگشت به پلن‌ها</span>
              </button>
              <span className="text-xs font-bold text-amber-200">انتخاب روش پرداخت</span>
            </div>

            {/* Summary Box */}
            <div className="p-3.5 rounded-2xl bg-stone-950 border border-white/[0.08] space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-stone-300">
                <span>طرح انتخابی:</span>
                <span className="font-bold text-stone-100">{selectedPlan.name}</span>
              </div>
              <div className="flex items-center justify-between text-stone-300">
                <span>مدت اشتراک:</span>
                <span>{selectedPlan.durationMonths} ماهه</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>تخفیف اعمال‌شده:</span>
                  <span>{discountPercent}٪</span>
                </div>
              )}
              <div className="border-t border-stone-800 pt-1.5 flex items-center justify-between font-bold text-sm">
                <span className="text-stone-200">مبلغ نهایی:</span>
                <div className="text-left text-amber-300 font-latin">
                  <span>{finalPriceToman.toLocaleString('fa-IR')} تومان</span>
                  <span className="text-[11px] text-stone-400 block font-normal">یا ⭐ {finalPriceStars} Stars</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-300 block">انتخاب درگاه پرداخت:</label>

              {/* Option 1: Telegram Stars */}
              <div
                onClick={() => setSelectedPaymentMethod('stars')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedPaymentMethod === 'stars'
                    ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center font-bold">
                    ⭐
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-100 block">ستاره‌های تلگرام (Telegram Stars)</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">پرداخت مستقیم و فوری درون‌برنامه‌ای تلگرام</span>
                  </div>
                </div>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPaymentMethod === 'stars' ? 'border-amber-400 bg-amber-400' : 'border-stone-600'}`}>
                  {selectedPaymentMethod === 'stars' && <span className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                </span>
              </div>

              {/* Option 2: Card to Card / Shetab */}
              <div
                onClick={() => setSelectedPaymentMethod('card')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedPaymentMethod === 'card'
                    ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-100 block">انتقال کارت به کارت / شتاب</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">پرداخت ریالی به شماره کارت رسمی پشتیبانی</span>
                  </div>
                </div>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPaymentMethod === 'card' ? 'border-amber-400 bg-amber-400' : 'border-stone-600'}`}>
                  {selectedPaymentMethod === 'card' && <span className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                </span>
              </div>
            </div>

            {/* If Card method selected, show card details */}
            {selectedPaymentMethod === 'card' && (
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">شماره کارت مقصد:</span>
                  <button
                    onClick={handleCopyCard}
                    className="text-[11px] text-amber-300 flex items-center gap-1 font-semibold hover:underline"
                  >
                    {copiedCard ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCard ? 'کپی شد' : 'کپی شماره کارت'}</span>
                  </button>
                </div>
                <div className="font-latin text-sm font-bold text-stone-100 tracking-wider text-center py-1 bg-stone-900 rounded-xl">
                  ۶۰۳۷-۹۹۷۵-۱۲۳۴-۵۶۷۸
                </div>
                <div className="text-[10px] text-stone-400 text-center">
                  به نام تیم پشتیبانی مینی‌اپ آینـا (@Av_abbas)
                </div>
              </div>
            )}

            {/* Execute Payment CTA */}
            <button
              onClick={handleExecutePayment}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 active:scale-98 text-stone-950 font-extrabold text-xs shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>در حال اتصال و تأیید پرداخت...</span>
              ) : selectedPaymentMethod === 'stars' ? (
                <>
                  <Star className="w-4 h-4 fill-current text-stone-950" />
                  <span>پرداخت با ⭐ {finalPriceStars} Stars تلگرام</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>تأیید و فعال‌سازی اشتراک</span>
                </>
              )}
            </button>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center py-6 space-y-4 animate-in-fade">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/20">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-stone-100">
                تبریک! اشتراک شما با موفقیت فعال شد 🎉
              </h3>
              <p className="text-xs text-stone-300 max-w-xs mx-auto leading-relaxed">
                هم‌اکنون به تمامی امکانات اختصاصی، اسکنر نامحدود و استودیوهای VIP مینی‌اپ دسترسی کامل دارید.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs text-stone-300 max-w-xs mx-auto text-right space-y-1">
              <div>طرح فعال: <span className="font-bold text-amber-300">{selectedPlan.name}</span></div>
              <div>مدت اعتبار: <span className="font-bold text-stone-100">{selectedPlan.durationMonths} ماه</span></div>
              <div>نشان در پروفایل: <span className="text-amber-400">👑 VIP Member</span></div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition-all shadow-md"
            >
              شروع تجربه VIP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
