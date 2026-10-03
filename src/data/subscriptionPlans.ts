import { SubscriptionPlan } from '../types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'glow',
    name: 'اشتراک گلو (Glow)',
    latinName: 'Ayna Glow Studio',
    durationMonths: 1,
    priceToman: 99000,
    priceStars: 120,
    originalPriceToman: 149000,
    badge: 'شروع هوشمند',
    features: [
      'اسکن نامحدود چهره، هندسه و فرم صورت',
      'تولید روزانه نامحدود استایل در Make It Mine',
      'چت ۲۴ ساعته با رفیق هوشمند آینا بدون محدودیت',
      'دسترسی به تمام استودیوهای پنج‌گانه زیبایی',
      'ذخیره تا ۳۰ لوک اختصاصی در کمد ابری'
    ]
  },
  {
    id: 'vip',
    name: 'اشتراک ویژه آتلیه (VIP Atelier)',
    latinName: 'Ayna VIP Atelier',
    durationMonths: 3,
    priceToman: 229000,
    priceStars: 280,
    originalPriceToman: 350000,
    badge: 'محبوب‌ترین فصلی',
    popular: true,
    features: [
      'تمام امکانات پلن Glow بدون محدودیت',
      'شبیه‌ساز زنده تن‌خور مانکن و ست ترکیبی کمد',
      'دوئل استایل نامحدود (A vs B Second Opinion)',
      'تحلیل پیشرفته پالت فصلی و آندرتون پوست',
      'دستیار خرید هوشمند و فیلتر پیشگیری از خرید اضافه',
      'پشتیبانی VIP و اولویت بالا در پردازش هوش مصنوعی'
    ]
  },
  {
    id: 'diamond',
    name: 'اشتراک الماس اوت کوتور (Diamond)',
    latinName: 'Ayna Haute Couture',
    durationMonths: 12,
    priceToman: 680000,
    priceStars: 790,
    originalPriceToman: 1100000,
    badge: 'به‌صرفه‌ترین سالانه',
    features: [
      'دسترسی کامل سالانه به تمامی ابزارها و فیچرهای جدید',
      'گزارش ماهانه تحلیلی ترندهای فشن مطابق DNA شخصی',
      'تنظیم اختصاصی استایل هماهنگ با چرخه هورمونی و مراقبت ویژه',
      'نشان الماس درخشان VIP روی پروفایل تلگرام مینی‌اپ',
      'خط ارتباطی مستقیم و اولویت شماره ۱ در صف سرور'
    ]
  }
];

export const VALID_PROMO_CODES: Record<string, number> = {
  'AYNA2026': 30, // 30% discount
  'ABBASVIP': 50, // 50% discount for special admin gifts
  'BEAUTY': 20,   // 20% discount
  'WELCOME': 15,  // 15% discount
};
