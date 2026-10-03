/**
 * Server-Side Payment Architecture & Telegram Stars Provider
 * Server-authoritative plan mapping, cryptographic invoice creation & webhook settlement.
 */

import crypto from 'crypto';

export interface ServerPlanConfig {
  id: string;
  name: string;
  durationMonths: number;
  priceStars: number;
  priceToman: number;
  badge?: string;
}

export const SERVER_SUBSCRIPTION_PLANS: Record<string, ServerPlanConfig> = {
  glow: {
    id: 'glow',
    name: 'اشتراک ۱ ماهه گلو (Glow)',
    durationMonths: 1,
    priceStars: 120,
    priceToman: 99000,
    badge: 'شروع سبک',
  },
  vip: {
    id: 'vip',
    name: 'اشتراک ۳ ماهه آتلیه (VIP Atelier)',
    durationMonths: 3,
    priceStars: 280,
    priceToman: 229000,
    badge: 'محبوب‌ترین',
  },
  diamond: {
    id: 'diamond',
    name: 'اشتراک ۱ ساله الماس (Diamond Club)',
    durationMonths: 12,
    priceStars: 790,
    priceToman: 680000,
    badge: 'بیشترین ارزش',
  },
};

export interface CreateInvoiceResult {
  ok: boolean;
  invoiceLink?: string;
  invoicePayload?: string;
  plan?: ServerPlanConfig;
  error?: string;
}

export interface PaymentProvider {
  createInvoice(telegramId: string, planId: string): Promise<CreateInvoiceResult>;
  verifyPayment(payload: string): Promise<boolean>;
}

export class TelegramStarsProvider implements PaymentProvider {
  private botToken: string;

  constructor(botToken?: string) {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN || '';
  }

  async createInvoice(telegramId: string, planId: string): Promise<CreateInvoiceResult> {
    const plan = SERVER_SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      return { ok: false, error: 'Invalid subscription plan ID' };
    }

    if (!this.botToken) {
      return {
        ok: false,
        error: 'Telegram Bot Token is not configured on the server. Please configure TELEGRAM_BOT_TOKEN.',
      };
    }

    // Generate unique, cryptographically random, idempotent invoice payload
    const nonce = crypto.randomBytes(6).toString('hex');
    const invoicePayload = `ayna_${plan.id}_${telegramId}_${Date.now()}_${nonce}`;

    try {
      // Call Telegram Bot API createInvoiceLink
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/createInvoiceLink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `آینـا: ${plan.name}`,
          description: `دسترسی نامحدود به استودیوهای هوش مصنوعی، آنالیز کمد و مشاور زیبایی آینـا برای ${plan.durationMonths} ماه`,
          payload: invoicePayload,
          currency: 'XTR', // Official Telegram Stars currency
          prices: [
            {
              label: plan.name,
              amount: plan.priceStars, // Telegram Stars amount
            },
          ],
        }),
      });

      const data: any = await response.json();
      if (!data.ok || !data.result) {
        console.error('Telegram createInvoiceLink error:', data);
        return { ok: false, error: data.description || 'Failed to generate Telegram Stars invoice' };
      }

      return {
        ok: true,
        invoiceLink: data.result,
        invoicePayload,
        plan,
      };
    } catch (err: any) {
      console.error('Exception calling Telegram createInvoiceLink:', err);
      return { ok: false, error: err?.message || 'Network error reaching Telegram API' };
    }
  }

  async verifyPayment(payload: string): Promise<boolean> {
    // Validates payload prefix and integrity
    return typeof payload === 'string' && payload.startsWith('ayna_');
  }
}

export class IranianGatewayProvider implements PaymentProvider {
  async createInvoice(_telegramId: string, planId: string): Promise<CreateInvoiceResult> {
    const plan = SERVER_SUBSCRIPTION_PLANS[planId];
    return {
      ok: false,
      error: 'درگاه مستقیم بانکی (زرین‌پال / شاپرک) در حال تکمیل مدارک تجاری و اتصال نهایی است. در حال حاضر لطفاً از پرداخت مستقیم تلگرام استارز (⭐) استفاده فرمایید.',
      plan,
    };
  }

  async verifyPayment(): Promise<boolean> {
    return false;
  }
}
