/**
 * Central AI Decision Engine
 * High-performance, versioned, personalized intelligence core powered by Gemini 3.8 Flash.
 *
 * Safety & Ethics Principles:
 * - ZERO appearance scoring (No Beauty Score, Sexy Score, Age Score, or Ranking)
 * - Non-diagnostic medical language: Phrases as observations, recommends clinicians when appropriate
 * - Reassurance -> Action (Stops anxiety loops and checking rituals)
 * - Closet-first prioritization: Recommends using existing wardrobe items before suggesting shopping
 * - Curated choice discipline: Always limits final choices to 2-3 tailored options (20 choices -> 3)
 */

import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import {
  UserContext,
  RecommendationRequest,
  RecommendationResponse,
  RecommendationItem,
  LearnedPreferenceWeights,
} from '../types/intelligence';

export const DECISION_ENGINE_VERSION = 'v2.1';
export const PROMPT_VERSION = 'v2.1';

export class DecisionEngine {
  private ai: GoogleGenAI | null = null;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (key) {
      this.ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'ayna-intelligence-core',
          },
        },
      });
    }
  }

  /**
   * Generates a collision-resistant, context-aware cache key.
   */
  static generateCacheKey(
    userId: string,
    feature: string,
    inputs: Record<string, any>,
    dnaHash: string = ''
  ): string {
    const normalizedInput = JSON.stringify(inputs);
    const inputHash = crypto.createHash('sha256').update(normalizedInput).digest('hex').slice(0, 16);
    return `ayna:${feature}:${userId}:${dnaHash}:${inputHash}:${DECISION_ENGINE_VERSION}:${PROMPT_VERSION}`;
  }

  /**
   * Make It Mine: Reinterprets inspiration references tailored to the user's specific DNA & Closet.
   */
  async makeItMine(params: {
    userContext?: Partial<UserContext>;
    vibe: string;
    description: string;
    imageBase64?: string;
  }): Promise<{
    referenceAnalysis: {
      silhouette: string;
      vibe: string;
      colors: string[];
      makeupFocus: string;
      hairStyle: string;
      keyAccessories: string[];
      whatToPreserve: string;
      whatToAdapt: string;
      whatToAvoid: string;
    };
    yourVersion: {
      title: string;
      coreAdvice: string;
      usingWhatYouOwn: string;
      steps: Array<{ step: number; part: string; action: string; closetMatch?: string }>;
    };
  }> {
    const dna = params.userContext?.beautyDNA;
    const closetSummary = params.userContext?.closet?.map((c) => `${c.name} (${c.color})`).slice(0, 15).join('، ') || 'کمد پایه کپسولی';

    const systemPrompt = `تو موتور تصمیم‌گیری زیبایی و استایل «آینـا» (Ayna) نسخه ${DECISION_ENGINE_VERSION} هستی.
وظیفه تو این است که یک رفرنس تصویری یا توضیح استایل را تحلیل کرده و بدون کپی‌کاری نعل‌به‌نعل، «نسخه شخصی‌سازی شده متناسب با ویژگی‌های خود کاربر» را با اولویت کمد لباس‌های فعلی او بازآفرینی کنی.

قوانین حیاتی سلامت روان و اخلاق:
۱. هرگز به ظاهر، سن، زیبایی یا جذابیت کاربر نمره یا امتیاز نده.
۲. القای نقص یا شرم نکن؛ زیبایی یعنی آراستگی تمیز و راحتی درونی.
۳. اولویت با قطعاتی است که کاربر هم‌اکنون در کمد دارد: [${closetSummary}].
۴. آنچه باید حفظ شود (روح و وایب اصلی)، آنچه باید سازگار شود (با فرم صورت و بدن)، و آنچه باید از آن پرهیز شود را مشخص کن.

پاسخ را منحصراً در قالب یک آبجکت JSON معتبر و بدون هیچ متن اضافی، تگ مارک‌داون یا توضیح قبل و بعد ارسال کن:
{
  "referenceAnalysis": {
    "silhouette": "سیلوئت و ساختار بصری کلی",
    "vibe": "وایب و اتمسفر پیام استایل",
    "colors": ["رنگ ۱", "رنگ ۲", "رنگ ۳"],
    "makeupFocus": "نقطه تمرکز آرایش",
    "hairStyle": "مدل مو و قاب چهره",
    "keyAccessories": ["اکسسوری ۱", "اکسسوری ۲"],
    "whatToPreserve": "جوهر و المانی که باید حفظ شود",
    "whatToAdapt": "بخشی که باید با ویژگی‌های کاربر سازگار شود",
    "whatToAvoid": "المان‌های افراطی یا غیرکاربردی که باید حذف شوند"
  },
  "yourVersion": {
    "title": "عنوان نسخه اختصاصی کاربر",
    "coreAdvice": "توضیح کوتاه و صمیمانه منطق طراحی",
    "usingWhatYouOwn": "چگونه با همین لباس‌های موجود در کمد آن را بسازد",
    "steps": [
      { "step": 1, "part": "پوست و میکاپ", "action": "دستورالعمل دقیق و سریع" },
      { "step": 2, "part": "موها", "action": "حالت‌دهی مو متناسب با فرم صورت" },
      { "step": 3, "part": "لباس و لایه‌بندی", "action": "ترکیب کت، بالاتنه و پایین‌تنه با تکیه بر کمد" },
      { "step": 4, "part": "اکسسوری و عطر", "action": "یک لمس نهایی هوشمند" }
    ]
  }
}`;

    if (this.ai) {
      try {
        const parts: any[] = [];
        if (params.imageBase64) {
          const match = params.imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        }

        const promptText = `اطلاعات ورودی:
وایب مورد نظر: ${params.vibe || 'شیک و راحت'}
توضیح کاربر: ${params.description || 'بازآفرینی متناسب با کمد من'}
ویژگی‌های فرم چهره: ${dna?.faceShape || 'بیضی'}، جنس پوست: ${dna?.skinType || 'متعادل'}، نوع مو: ${dna?.hairTexture || 'موج‌دار'}
کمد موجود کاربر: ${closetSummary}`;

        parts.push({ text: promptText });

        const response = await this.ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: parts,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.25,
          },
        });

        const text = response.text?.trim();
        if (text) {
          return JSON.parse(text);
        }
      } catch (err) {
        console.warn('AI Decision Engine makeItMine fallback engaged:', err);
      }
    }

    // Deterministic High-Quality Persian Fallback
    return {
      referenceAnalysis: {
        silhouette: 'سیلوئت مدرن، تمیز با تعادل میان راحتی و آراستگی بصری',
        vibe: params.vibe || 'Modern Minimalist Elegance',
        colors: ['کرم شنی', 'قهوه‌ای اسپرسو', 'طوسی زغالی'],
        makeupFocus: 'پوست طبیعی و شبنم‌دار با تمرکز روی ابروهای شانه شده و تینت ملایم',
        hairStyle: 'موج‌های لطیف رها بدون سنگینی تافت یا براشینگ مصنوعی',
        keyAccessories: ['کیف دوشی ساده', 'گوشواره حلقه‌ای ظریف طلایی'],
        whatToPreserve: 'خطوط تمیز و هارمونی مینیمال رنگ‌ها',
        whatToAdapt: 'تطبیق بلندی شومیز و زاویه یقه با خطوط طبیعی بالاتنه شما',
        whatToAvoid: 'لوازم آرایشی سنگین و لایه‌های ضخیم کرم‌پودر',
      },
      yourVersion: {
        title: 'نسخه شخصی شما با تکیه بر کمد فعلی',
        coreAdvice: 'به جای خرید لباس جدید، ریتم و هارمونی رنگی این استایل را با آیتم‌های کمد خودت بازآفرینی کردیم.',
        usingWhatYouOwn: 'از شومیز خنثی و کت سبک کمد به همراه شلوار راسته استفاده کن.',
        steps: [
          { step: 1, part: 'پوست و میکاپ', action: 'آبرسانی سبک، کمی ضدآفتاب رنگی، ژل ابروی بی‌رنگ و چند قطره تینت روی گونه و لب.' },
          { step: 2, part: 'موها', action: 'موها را با یک کلیپس مینیمال نیمه‌بالا جمع کن تا گردن کشیده و ساختار یقه دیده شود.' },
          { step: 3, part: 'لباس', action: 'کت یا مانتوی ساده با شلوار راسته تیره؛ جلوی کت را باز بگذار تا خط عمودی باریک بسازد.' },
          { step: 4, part: 'اکسسوری', action: 'یک عطر ملایم و یک جفت گوشواره طلایی براق برای کامل کردن درخشش.' },
        ],
      },
    };
  }

  /**
   * Recommendation Engine: Generates strictly 2 to 3 curated personalized choices.
   */
  async recommend(request: RecommendationRequest, weights?: LearnedPreferenceWeights): Promise<RecommendationResponse> {
    const time = request.availableTimeMinutes || 10;
    const occasion = request.occasion || 'روزمره / کار';
    const dna = request.userContext.beautyDNA;

    const systemPrompt = `تو موتور توصیه‌گر مرکزی «آینـا» هستی.
اصل کلیدی: هرگز کاربر را با ۲۰ گزینه گیج نکن. همیشه و فقط **۲ یا ۳ انتخاب ممتاز و متمایز** متناسب با زمان (${time} دقیقه) و موقعیت (${occasion}) ارائه بده.
هر گزینه باید متصل به قطعات کمد و شلف کاربر باشد و دلیل سازگاری با DNA او را بیان کند.
پاسخ فقط JSON معتبر باشد:
{
  "options": [
    {
      "id": "opt-1",
      "title": "عنوان گزینه ۱",
      "vibe": "وایب حسی",
      "whyItFitsYou": "دلیل علمی و بصری تناسب با فرم چهره و استایل شما",
      "actions": [
        { "step": 1, "part": "skin", "action": "کار اول", "usingYourClosetOrShelf": "مرطوب‌کننده شلف" },
        { "step": 2, "part": "hair", "action": "کار دوم", "usingYourClosetOrShelf": "برس چوبی" },
        { "step": 3, "part": "outfit", "action": "کار سوم", "usingYourClosetOrShelf": "کت کرم و شلوار راسته کمد" }
      ]
    },
    {
      "id": "opt-2",
      "title": "عنوان گزینه ۲",
      "vibe": "وایب حسی جایگزین",
      "whyItFitsYou": "دلیل تمایز",
      "actions": [ ... ]
    }
  ],
  "rationale": "خلاصه منطق سیستم برای فیلتر کردن گزینه‌های اضافی",
  "timeEstimateMinutes": ${time},
  "goodEnoughClosing": "پیام آرامش‌بخش پایان که کاربر با خیال راحت کار را ببندد"
}`;

    if (this.ai) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              text: `فرم صورت: ${dna.faceShape}، زمان در دسترس: ${time} دقیقه، موقعیت: ${occasion}، ترجیح رنگی: ${weights?.neutralColorWeight && weights.neutralColorWeight > 0 ? 'خنثی‌پسند' : 'متعادل'}`
            }
          ],
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const text = response.text?.trim();
        if (text) {
          return JSON.parse(text);
        }
      } catch (err) {
        console.warn('AI recommend fallback engaged:', err);
      }
    }

    return {
      options: [
        {
          id: 'opt-1',
          title: 'استایل شیک و تمیز ۱۰ دقیقه‌ای (Clean Chic)',
          vibe: 'باوقار، شاداب و بی‌دردسر',
          whyItFitsYou: 'طراحی شده بر اساس فرم صورت شما با تاکید بر سبکی و خطوط عمودی کشیده',
          actions: [
            { step: 1, part: 'skin', action: 'شستشوی سبک و مرطوب‌کننده با بافت ژلی + ضدآفتاب بدون رد سفیدی', usingYourClosetOrShelf: 'محصولات شلف' },
            { step: 2, part: 'hair', action: 'شانه کردن ابرو با ژل بی‌رنگ و بستن موها با کلیپس مات در پشت سر', usingYourClosetOrShelf: 'اکسسوری مو' },
            { step: 3, part: 'outfit', action: 'کت کرم کمد با شومیز شیری و شلوار راسته تیره', usingYourClosetOrShelf: 'کمد لباس' },
          ],
        },
        {
          id: 'opt-2',
          title: 'استایل رها و مینیمال راحتی (Soft Comfort)',
          vibe: 'صمیمی، ملایم و آزاد',
          whyItFitsYou: 'کمترین میزان فشار روی بدن با حفظ هماهنگی رنگی چشم‌نواز',
          actions: [
            { step: 1, part: 'skin', action: 'تینت هلویی روی لب و سیب گونه + ماساژ سبک دور چشم', usingYourClosetOrShelf: 'تینت شلف' },
            { step: 2, part: 'hair', action: 'رها کردن حالت طبیعی موج مو با یک قطره روغن آرگان روی ساقه', usingYourClosetOrShelf: 'سرم مو' },
            { step: 3, part: 'outfit', action: 'بافت یا پیراهن آزاد پنبه‌ای با شال نخی شنی', usingYourClosetOrShelf: 'کمد لباس' },
          ],
        },
      ],
      rationale: 'از میان ده‌ها ترکیب ممکن، این ۲ مسیر بر اساس زمان در دسترس و راحتی شما بهینه‌سازی شده‌اند.',
      timeEstimateMinutes: time,
      goodEnoughClosing: 'یکی از این دو را انتخاب کن، اجرا کن و مطمئن باش عالی شده‌ای. دیگر در آینه چک نکن!',
    };
  }

  /**
   * Triage: Resolves beauty panic & time-crunch stress.
   * Enforces Reassurance -> Action.
   */
  async triage(problem: string, context: string, category: string = 'عمومی'): Promise<{
    headline: string;
    priority1: { title: string; action: string };
    priority2: { title: string; action: string };
    priority3: { title: string; action: string };
    whatToIgnore: string;
    reassuranceNote: string;
  }> {
    const systemPrompt = `تو سامانه تریاژ اورژانس زیبایی «آینـا» هستی.
کاربر کلافه، نگران یا تحت فشار زمان است.
وظیفه تو: تبدیل آشفتگی به ۳ اولویت مشخص، بدون سرزنش و بدون ادعای تشخیص بیماری.
اصل حیاتی: اطمینان‌بخشی -> اقدام فوری -> رها کردن وسواس.
پاسخ فقط JSON معتبر باشد:
{
  "headline": "تیتر آرامش‌بخش و دقیق",
  "priority1": { "title": "مهم‌ترین کار همین الان", "action": "دستورالعمل ۱ دقیقه‌ای" },
  "priority2": { "title": "اقدام بعدی", "action": "اقدام ۲ دقیقه‌ای" },
  "priority3": { "title": "تنظیم نهایی", "action": "یک لمس کوچک" },
  "whatToIgnore": "دقیقاً چه چیزی را الان باید بی‌خیال شد و دستکاری نکرد",
  "reassuranceNote": "پیام پایانی برای خروج بدون استرس"
}`;

    if (this.ai) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ text: `مشکل: ${problem}\nموقعیت و زمان: ${context}\nدسته‌بندی: ${category}` }],
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const text = response.text?.trim();
        if (text) return JSON.parse(text);
      } catch (err) {
        console.warn('AI triage fallback engaged:', err);
      }
    }

    return {
      headline: 'وضعیت کاملاً قابل مدیریت است؛ ۳ گام زیر را انجام بده و برو.',
      priority1: {
        title: 'مهار نقطه ماسیدگی یا براق شدن',
        action: 'یک دستمال تمیز را آرام روی نقطه فشار بده تا چربی یا اضافه کرم جذب شود؛ لایه جدید نزن.',
      },
      priority2: {
        title: 'طراوت بخشیدن به گونه و لب',
        action: 'با نوک انگشت یک نقطه تینت یا بالم ملایم روی لب و مرکز گونه بگذار و محو کن.',
      },
      priority3: {
        title: 'مرتب کردن موها با یک حرکت',
        action: 'موها را پشت سر با کلیپس یا کش ببند و دو رشته جلوی گوش را رها کن.',
      },
      whatToIgnore: 'دستکاری خط چشم یا تلاش برای بی‌نقص کردن میکرومتری پوست را همین الان متوقف کن.',
      reassuranceNote: 'دیگران در دیدار با تو کل وجود، لحن و انرژی‌ات را می‌بینند نه جزئیات زیر ذره‌بین آینه. عالی هستی!',
    };
  }
}
