import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import compression from 'compression';
import { GoogleGenAI } from '@google/genai';
import { db, isSafeId } from './src/db/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// High-Performance Compression (GZIP/Deflate)
app.use(compression());

// Defensive Security Configurations
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Support reasonable payload limits for compressed base64 images
app.use(express.json({ limit: '10mb' }));

// -------------------------------------------------------------
// Security Headers & Telegram WebApp IFrame Embed Compatibility
// -------------------------------------------------------------
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org tg:;"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
  next();
});

// Input Sanitization Helper
function sanitizeText(input: unknown, maxLen = 2000): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLen);
}

// In-Memory Rate Limiter (Protects against AI API spam / DoS)
const ipRequests = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 120;

// Periodic cleanup of expired rate-limit IP records to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequests.entries()) {
    if (now > record.resetTime) {
      ipRequests.delete(ip);
    }
  }
}, 5 * 60 * 1000);

app.use('/api', (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = ipRequests.get(ip);

  if (!record || now > record.resetTime) {
    ipRequests.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند لحظه صبر کنید.',
    });
  }

  record.count += 1;
  next();
});

// -------------------------------------------------------------
// Server-Side In-Memory LRU Cache (Essential for 50,000+ Users Scale)
// -------------------------------------------------------------
interface CacheItem {
  data: any;
  timestamp: number;
}
const cache = new Map<string, CacheItem>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes TTL
const MAX_CACHE_SIZE = 1000;

function getCached(key: string): any | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  // LRU Refresh: Move hit key to the end of the Map
  cache.delete(key);
  cache.set(key, item);
  return item.data;
}

function setCached(key: string, data: any) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

// -------------------------------------------------------------
// Gemini Initialization & Safe JSON Parser
// -------------------------------------------------------------
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function safeParseJson(rawText: string | undefined, fallback: any): any {
  if (!rawText) return fallback;
  try {
    // 1. Direct parse
    return JSON.parse(rawText);
  } catch {
    // 2. Strip markdown fences ```json ... ```
    try {
      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      return JSON.parse(cleaned);
    } catch {
      // 3. Extract outermost { ... }
      try {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          return JSON.parse(match[0]);
        }
      } catch {
        // Fallback to deterministic generator
      }
    }
  }
  return fallback;
}

// Helper with timeout to prevent hung connections
async function generateWithTimeout(promise: Promise<any>, timeoutMs = 8000): Promise<any> {
  let timer: any;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI generation timed out')), timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// -------------------------------------------------------------
// Fallback Generators (High quality deterministic Persian models)
// -------------------------------------------------------------
function generateFallbackMakeItMine(description: string, vibe: string, context?: any) {
  return {
    referenceAnalysis: {
      silhouette: 'سیلوئت مدرن، تمیز با تعادل میان راحتی و آراستگی بصری',
      vibe: vibe || 'Elegant & Modern Chic',
      colors: ['نود گرم', 'مشکی کربن', 'کرم شنی', 'رز ملایم'],
      makeupFocus: 'پوست طبیعی و درخشان (Skin-first)، ابروهای شانه شده طبیعی، رژ لب نود براق یا تینت محو',
      hairStyle: 'موج‌های لطیف باز یا بسته مرتب بدون حالت خشک و مصنوعی',
      keyAccessories: ['کیف دوشی مینیمال', 'گوشواره حلقه‌ای ظریف یا استیتمنت ملایم', 'شال هماهنگ لایت']
    },
    yourVersion: {
      title: 'نسخه شخصی‌سازی شده شما (Make It Mine)',
      coreAdvice: 'به جای کپی کردن دقیق متریال گران‌قیمت یا مدل خاص، روح و ریتم لوک را با ویژگی‌های خودت بازآفرینی می‌کنیم.',
      steps: [
        {
          step: 1,
          part: 'پوست و آرایش',
          action: 'یک مرطوب‌کننده سبک + ضدآفتاب رنگی یا تینت. خط چشم دودی باریک در گوشه خارجی و بلاش هلویی ملایم روی برجستگی گونه.'
        },
        {
          step: 2,
          part: 'موها',
          action: 'فرق از وسط یا بغل دلخواه؛ با چند قطره سرم ضد وز یا باز گذاشتن با بافت طبیعی خودت.'
        },
        {
          step: 3,
          part: 'استایل با چیزهایی که داری',
          action: 'کت یا مانتوی اورسایز رنگ خنثی با شلوار راسته تیره و کفش لوفر یا کتانی تمیز. شال یا روسری را سبک آزاد دور گردن بینداز.'
        }
      ],
      closetMatching: 'کافیست یک بالاتنه مونوکروم و اکسسوری متالیک ظریف از کمد خودت انتخاب کنی.',
      finalWord: 'این لوک امضای خودته؛ زیبا و آماده!'
    }
  };
}

function generateFallbackTriage(problem: string, context: string) {
  return {
    headline: 'آرام باش؛ این اولویت‌بندی دقیق برای وضعیت فعلی توئه:',
    priority1: {
      title: 'الان مهم‌ترین (همین ۲ دقیقه)',
      action: 'روی یک کار ملموس تمرکز کن: اگر موها به‌هم ریخته است، یک دم‌اسبی شیک یا کلیپس مینیمال؛ اگر پوست خسته است، یک آب‌رسان و مرطوب‌کننده.'
    },
    priority2: {
      title: 'کار بعدی (اگر ۵ دقیقه وقت داری)',
      action: 'یک رژ لب شاداب یا تینت روی لب و گونه + مرتب کردن فرم ابرو با ژل بی‌رنگ.'
    },
    priority3: {
      title: 'اگر وقت ماند',
      action: 'یک اکسسوری کوچک (گوشواره یا ساعت) بردار و عطر همیشگی‌ات را بزن.'
    },
    reassuranceNote: 'بقیه جزئیات اصلاً دیده نمیشن. با همین‌ها کاملاً آماده و مسلط هستی. حالا آینه رو ببند!'
  };
}

function generateFallbackSecondOpinion(optionA: string, optionB: string, context: string) {
  return {
    optionA_analysis: {
      name: optionA || 'گزینه اول',
      vibe: 'رسمی‌تر، ساختاریافته و باوقار',
      impression: 'حس تسلط و تمرکز بالا را منتقل می‌کند؛ مناسب فضاهای کاری، قرارهای جدی یا محیط‌هایی که رسمیت مهم است.'
    },
    optionB_analysis: {
      name: optionB || 'گزینه دوم',
      vibe: 'صمیمی‌تر، لطیف، آزاد و پرانرژی',
      impression: 'حس سبکی، راحتی و صمیمیت بدون زحمت را القا می‌کند؛ مناسب دورهمی، قرارهای دوستانه یا محیط غیررسمی.'
    },
    verdict: `اگر برای ${context || 'این موقعیت'} حس اعتمادبه‌نفس و راحتی طبیعی می‌خواهی، انتخابی را بردار که موقع راه‌رفتن یا صحبت‌کردن به تنظیم مداوم نیاز ندارد.`
  };
}

// -------------------------------------------------------------
// Scalable AI API Endpoints with Caching & Resilience
// -------------------------------------------------------------

// 1. Make It Mine
app.post('/api/ai/make-it-mine', async (req: Request, res: Response) => {
  try {
    const prompt = sanitizeText(req.body.prompt, 1500);
    const vibe = sanitizeText(req.body.vibe, 100);
    const userDna = req.body.userDna;
    const photoBase64 = typeof req.body.photoBase64 === 'string' && req.body.photoBase64.startsWith('data:image') ? req.body.photoBase64 : undefined;
    const cacheKey = `mim:${prompt}:${vibe}:${photoBase64 ? 'photo' : 'no'}`;

    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    if (!ai) {
      const fb = generateFallbackMakeItMine(prompt || 'استایل شیک', vibe, userDna);
      setCached(cacheKey, fb);
      return res.json(fb);
    }

    const systemInstruction = `تو مغز متفکر مینیاپ زیبایی «آینـا» هستی. اصل راهنما: «هر چیزی که خوشت میاد، نسخه مناسب خودت رو بساز.» و «با چیزهایی که داری شروع کن».
پاسخ در فرمت JSON بدون هیچ مارک‌داون یا توضیح اضافه:
{
  "referenceAnalysis": {
    "silhouette": "توصیف سیلوئت و استراکچر",
    "vibe": "وایب کلی",
    "colors": ["رنگ ۱", "رنگ ۲", "رنگ ۳"],
    "makeupFocus": "تمرکز آرایش",
    "hairStyle": "فرم مو",
    "keyAccessories": ["اکسسوری ۱", "اکسسوری ۲"]
  },
  "yourVersion": {
    "title": "عنوان نسخه شخصی تو",
    "coreAdvice": "توضیح کوتاه چطور این سبک به تو میاد",
    "steps": [
      { "step": 1, "part": "پوست و آرایش", "action": "کار مشخص" },
      { "step": 2, "part": "موها", "action": "کار مشخص" },
      { "step": 3, "part": "استایل با داشته‌های کمد", "action": "کار مشخص" }
    ],
    "closetMatching": "پیشنهاد ترکیب با لباس‌های کمد",
    "finalWord": "یک جمله دلگرم‌کننده و تمام‌کننده"
  }
}`;

    const parts: any[] = [];
    if (photoBase64) {
      const mimeMatch = photoBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const cleanBase64 = photoBase64.replace(/^data:[a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64
        }
      });
    }

    const userContent = `کاربر این رفرنس را ارائه داده است: "${prompt || 'استایل خاص'}".
وایب مورد نظر: "${vibe || 'متعادل'}".
مشخصات و ترجیحات کاربر: ${JSON.stringify(userDna || {})}.
لطفاً این تصویر/رفرنس را آنالیز کن و نسخه اختصاصی خود او را تولید کن.`;

    parts.push({ text: userContent });

    const response = await generateWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: parts.length === 1 ? parts[0].text : parts,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        }
      })
    );

    const parsed = safeParseJson(response.text, generateFallbackMakeItMine(prompt, vibe, userDna));
    setCached(cacheKey, parsed);
    return res.json(parsed);
  } catch (error) {
    console.error('Make It Mine error:', error);
    return res.json(generateFallbackMakeItMine(req.body.prompt, req.body.vibe, req.body.userDna));
  }
});

// 2. AI Triage & SOS Solver
app.post('/api/ai/triage', async (req: Request, res: Response) => {
  try {
    const problem = sanitizeText(req.body.problem, 1500);
    const context = sanitizeText(req.body.context, 500);
    const category = sanitizeText(req.body.category, 100);
    const cacheKey = `trg:${category}:${problem}`;

    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    if (!ai) {
      const fb = generateFallbackTriage(problem, context);
      setCached(cacheKey, fb);
      return res.json(fb);
    }

    const promptText = `کاربر در وضعیت آشفتگی یا مشکل زیبایی است:
دسته‌بندی: ${category || 'عمومی'}
مشکل مطرح شده: "${problem}"
موقعیت / زمان: "${context || 'فوری'}"

تو دستیار هوشمند «آینـا» هستی. اصل:
1. الان مهم‌ترین
2. بعدی
3. اگر وقت ماند
پاسخ در فرمت JSON معتبر:
{
  "headline": "جمله آرامش‌بخش و متمرکز",
  "priority1": { "title": "الان مهم‌ترین", "action": "اقدام اول در ۲ دقیقه" },
  "priority2": { "title": "کار بعدی", "action": "اقدام دوم در ۳ دقیقه" },
  "priority3": { "title": "اگر وقت ماند", "action": "اقدام تکمیلی اختیاری" },
  "reassuranceNote": "پیام پایانی برای بستن آینه و متوقف کردن چک کردن مکرر"
}`;

    const response = await generateWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
        }
      })
    );

    const parsed = safeParseJson(response.text, generateFallbackTriage(problem, context));
    setCached(cacheKey, parsed);
    return res.json(parsed);
  } catch (error) {
    console.error('Triage error:', error);
    return res.json(generateFallbackTriage(req.body.problem, req.body.context));
  }
});

// 3. Second Opinion
app.post('/api/ai/second-opinion', async (req: Request, res: Response) => {
  try {
    const optionA = sanitizeText(req.body.optionA, 500);
    const optionB = sanitizeText(req.body.optionB, 500);
    const context = sanitizeText(req.body.context, 500);
    const cacheKey = `so:${optionA}:${optionB}:${context}`;

    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    if (!ai) {
      const fb = generateFallbackSecondOpinion(optionA, optionB, context);
      setCached(cacheKey, fb);
      return res.json(fb);
    }

    const promptText = `کاربر بین دو انتخاب مردد است:
گزینه ۱: "${optionA}"
گزینه ۲: "${optionB}"
موقعیت: "${context || 'مهمانی یا کار'}"

قانون: هرگز نگو کدام زیباتر است؛ تفاوت‌های توصیفی، حس منتقل شده و پیام بصری هر دو را به فارسی بگو.
فرمت JSON:
{
  "optionA_analysis": {
    "name": "نام گزینه اول",
    "vibe": "وایب و حس اصلی",
    "impression": "توصیف بصری و تأثیر روی دیگران"
  },
  "optionB_analysis": {
    "name": "نام گزینه دوم",
    "vibe": "وایب و حس اصلی",
    "impression": "توصیف بصری و تأثیر روی دیگران"
  },
  "verdict": "توصیه بر اساس راحتی و هدف کاربر"
}`;

    const response = await generateWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
        }
      })
    );

    const parsed = safeParseJson(response.text, generateFallbackSecondOpinion(optionA, optionB, context));
    setCached(cacheKey, parsed);
    return res.json(parsed);
  } catch (error) {
    console.error('Second Opinion error:', error);
    return res.json(generateFallbackSecondOpinion(req.body.optionA, req.body.optionB, req.body.context));
  }
});

// 4. Today Plan & Glow Up Generator
app.post('/api/ai/today-plan', async (req: Request, res: Response) => {
  try {
    const energy = sanitizeText(req.body.energy, 50);
    const mood = sanitizeText(req.body.mood, 50);
    const timeNum = Math.min(Math.max(parseInt(req.body.timeMinutes) || 10, 1), 120);
    const occasion = sanitizeText(req.body.occasion, 100);
    const userDna = req.body.userDna;
    const cacheKey = `tp:${energy}:${mood}:${timeNum}:${occasion}`;

    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    if (!ai) {
      const fallback = {
        title: `برنامه درخشش ${timeNum} دقیقه‌ای امروز`,
        vibeSummary: `تنظیم شده برای انرژی ${energy || 'متوسط'}، حس ${mood || 'عادی'} و موقعیت ${occasion || 'روزمره'}`,
        actions: [
          { time: '۲ دقیقه', title: 'احیای پوست', desc: 'اسپری آب یا مرطوب‌کننده ملایم + ضدآفتاب' },
          { time: `${Math.max(2, Math.floor(timeNum / 2))} دقیقه`, title: 'استایل مو و چهره', desc: 'شانه کردن ابرو، یک تینت خوش‌رنگ روی لب و جمع کردن شیک موها' },
          { time: '۲ دقیقه', title: 'تنظیم لباس و شال', desc: 'هماهنگ کردن شال یا گوشواره با رنگ کفش/کیف' }
        ],
        goodEnoughMessage: 'همین سه مرحله کافیه؛ لازم نیست دوباره خودت رو توی آینه چک کنی. عالی شدی!'
      };
      setCached(cacheKey, fallback);
      return res.json(fallback);
    }

    const promptText = `برای مینیاپ آینا یک برنامه آماده‌سازی سریع و واقع‌گرایانه بساز:
انرژی: ${energy}
مود: ${mood}
زمان موجود: ${timeNum} دقیقه
موقعیت: ${occasion}
دی‌ان‌ای استایل کاربر: ${JSON.stringify(userDna || {})}

اصل: Minimum Effort + Visible Result + Personalization.
فرمت JSON:
{
  "title": "عنوان جذاب برنامه",
  "vibeSummary": "خلاصه حس برنامه",
  "actions": [
    { "time": "مدت دقیقه", "title": "عنوان کار", "desc": "توضیح کوتاه و دقیق اقدام" }
  ],
  "goodEnoughMessage": "جمله پایانی: بقیه رو بیخیال شو، آماده‌ای!"
}`;

    const response = await generateWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
        }
      })
    );

    const parsed = safeParseJson(response.text, {
      title: 'برنامه درخشش سریع امروز',
      vibeSummary: 'ساده، مؤثر و متمرکز',
      actions: [
        { time: '۲ دقیقه', title: 'طراوت چهره', desc: 'مرطوب‌کننده و ماساژ سبک ۳۰ ثانیه‌ای گونه‌ها' },
        { time: '۵ دقیقه', title: 'میکاپ ملایم', desc: 'ژل ابرو، ریمل ملایم و رژ نود' },
        { time: '۳ دقیقه', title: 'اکسسوری کلیدی', desc: 'انتخاب یک گوشواره یا ساعت شاخص' }
      ],
      goodEnoughMessage: 'آماده‌ای! از روزت لذت ببر.'
    });

    setCached(cacheKey, parsed);
    return res.json(parsed);
  } catch (error) {
    console.error('Today Plan error:', error);
    return res.json({
      title: 'برنامه درخشش سریع امروز',
      vibeSummary: 'ساده، مؤثر و متمرکز',
      actions: [
        { time: '۲ دقیقه', title: 'طراوت چهره', desc: 'مرطوب‌کننده و ماساژ سبک ۳۰ ثانیه‌ای گونه‌ها' },
        { time: '۵ دقیقه', title: 'میکاپ ملایم', desc: 'ژل ابرو، ریمل ملایم و رژ نود' },
        { time: '۳ دقیقه', title: 'اکسسوری کلیدی', desc: 'انتخاب یک گوشواره یا ساعت شاخص' }
      ],
      goodEnoughMessage: 'آماده‌ای! از روزت لذت ببر.'
    });
  }
});

// 5. Coach Chat (Empathetic Beauty Companion)
app.post('/api/ai/coach', async (req: Request, res: Response) => {
  try {
    const message = sanitizeText(req.body.message, 1500);
    const history = req.body.history;

    if (!message) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (!ai) {
      return res.json({
        reply: `پیامت رو خوندم: «${message}». یادت باشه زیبایی یک مسابقه یا آزمون نیست؛ قراره ابزاری باشه که حس بهتری با خودت داشته باشی. چه کاری هست که بتونیم با چیزهایی که همین الان داری و در کمترین زمان انجام بدیم؟`
      });
    }

    const systemInstruction = `تو هوش مصنوعی مشاور و رفیق زیبایی «آینـا» هستی.
ویژگی‌های کلیدی لحن تو:
- صمیمی، حامی، بدون قضاوت و آرامش‌بخش
- هرگز اجازه نده کاربر وارد چرخه اطمینان‌طلبی بیمارگونه (Reassurance seeking) یا چک کردن مداوم آینه شود
- هرگز امتیاز زیبایی نده
- بدن یا ظاهر را نقص‌دار نخوان
- تمرکز روی «با چیزهایی که داری چه کار کنیم» و «کِی دیگه کافیه»
- کوتاه، گزیده و عملیاتی به زبان فارسی پاسخ بده`;

    const contents = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        contents.push({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] });
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await generateWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        }
      }),
      7000
    );

    return res.json({ reply: response.text });
  } catch (error) {
    console.error('Coach Chat error:', error);
    return res.json({
      reply: 'من اینجام تا کمکت کنم. به جای وسواس روی جزئیات، بیا روی ۱ حرکت موثر که امروز بهت حس شادابی میده تمرکز کنیم.'
    });
  }
});

// -------------------------------------------------------------
// Telegram Bot API Integration (Webhook, Polling & Menu Button)
// -------------------------------------------------------------
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.APP_URL || 'https://ais-dev-untga77ourphtssjqqugh5-181611757650.europe-west2.run.app';
let botUsername: string | null = null;

// Config status for in-app launcher
app.get('/api/telegram/config', (req: Request, res: Response) => {
  res.json({
    appUrl,
    botTokenConfigured: !!telegramBotToken,
    botUsername,
  });
});

// -------------------------------------------------------------
// Railway / Cloud Health Check
// -------------------------------------------------------------
app.get(['/api/health', '/health'], async (_req: Request, res: Response) => {
  const dbStatus = await db.getStatus();
  return res.status(200).json({
    status: 'ok',
    environment: isProd ? 'production' : 'development',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      type: dbStatus.type,
      connected: dbStatus.connected,
      totalUsers: dbStatus.totalUsers,
    },
    platform: 'Railway + Neon Ready'
  });
});

// -------------------------------------------------------------
// Database Persistence Endpoints (User Sync, Closet & Looks)
// -------------------------------------------------------------
app.post('/api/user/sync', async (req: Request, res: Response) => {
  try {
    const { telegramId, firstName, username, dna, closet, shelf, savedLooks } = req.body;
    if (!isSafeId(telegramId)) {
      return res.status(400).json({ error: 'Valid telegramId is required' });
    }
    const success = await db.syncUserData({
      telegramId: String(telegramId),
      firstName: firstName ? sanitizeText(firstName, 100) : undefined,
      username: username ? sanitizeText(username, 100) : undefined,
      dna,
      closet: Array.isArray(closet) ? closet.slice(0, 500) : undefined,
      shelf: Array.isArray(shelf) ? shelf.slice(0, 500) : undefined,
      savedLooks: Array.isArray(savedLooks) ? savedLooks.slice(0, 500) : undefined,
    });
    return res.json({ ok: success });
  } catch (err) {
    console.error('Error in /api/user/sync:', err);
    return res.status(500).json({ error: 'Sync failed' });
  }
});

app.get('/api/user/profile/:telegramId', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.params;
    if (!isSafeId(telegramId)) {
      return res.status(400).json({ error: 'Invalid telegramId format' });
    }
    const userData = await db.getUserData(String(telegramId));
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(userData);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/api/user/wipe', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.body;
    if (!isSafeId(telegramId)) return res.status(400).json({ error: 'Valid telegramId is required' });
    const success = await db.deleteUserData(String(telegramId));
    return res.json({ ok: success });
  } catch (err) {
    return res.status(500).json({ error: 'Wipe failed' });
  }
});

app.get('/api/system/status', async (req: Request, res: Response) => {
  try {
    const dbStatus = await db.getStatus();
    return res.json({
      ok: true,
      database: dbStatus,
      telegramBot: {
        configured: !!telegramBotToken,
        username: botUsername,
        appUrl,
      },
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Failed to get status' });
  }
});

// -------------------------------------------------------------
// Admin Dashboard Backend Endpoints (Exclusively for 291775184 / @Av_abbas)
// -------------------------------------------------------------
const ADMIN_NUMERICAL_ID = '291775184';
const ADMIN_USERNAME = 'av_abbas';
let isMaintenanceMode = false;
let customWelcomeMessage = 'سلام عزیز! 🌸\nبه مینی‌اپ «آینـا» خوش آمدی.\n\n✨ «هر چیزی که خوشت میاد، نسخه مناسب خودت رو بساز.»';

function checkAdminAuth(req: Request): boolean {
  const adminId = String(req.headers['x-admin-id'] || req.query.adminId || '');
  const adminUser = String(req.headers['x-admin-username'] || req.query.adminUser || '').toLowerCase().replace('@', '');
  return adminId === ADMIN_NUMERICAL_ID || adminUser === ADMIN_USERNAME;
}

// 1. Admin System Overview
app.get('/api/admin/overview', async (req: Request, res: Response) => {
  if (!checkAdminAuth(req)) {
    return res.status(403).json({ error: 'Access denied: Admin credentials required' });
  }
  try {
    const dbStatus = await db.getStatus();
    const mem = process.memoryUsage();
    return res.json({
      ok: true,
      admin: {
        id: ADMIN_NUMERICAL_ID,
        username: '@Av_abbas',
      },
      stats: {
        totalUsers: dbStatus.totalUsers,
        totalLooks: dbStatus.totalLooks,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryRssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
        memoryHeapMb: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10,
        cacheSize: cache.size,
        maxCacheSize: MAX_CACHE_SIZE,
        activeRateLimitIps: ipRequests.size,
        databaseType: dbStatus.isNeon ? 'Neon (Serverless PG)' : dbStatus.type === 'postgresql' ? 'PostgreSQL' : 'Embedded JSON',
        isNeon: dbStatus.isNeon,
        databaseConnected: dbStatus.connected,
        isMaintenanceMode,
        telegramBotConfigured: !!telegramBotToken,
        telegramBotUsername: botUsername,
        appUrl,
        nodeVersion: process.version,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve admin overview' });
  }
});

// 2. Admin Users Directory
app.get('/api/admin/users', async (req: Request, res: Response) => {
  if (!checkAdminAuth(req)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  try {
    const users = await db.getAllUsers(100);
    return res.json({ ok: true, users });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 3. Admin User Dossier
app.get('/api/admin/user/:telegramId', async (req: Request, res: Response) => {
  if (!checkAdminAuth(req)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  try {
    const { telegramId } = req.params;
    const userData = await db.getUserData(String(telegramId));
    if (!userData) return res.status(404).json({ error: 'User not found' });
    return res.json({ ok: true, userData });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user dossier' });
  }
});

// 4. Admin Clear Cache
app.post('/api/admin/clear-cache', (req: Request, res: Response) => {
  if (!checkAdminAuth(req)) return res.status(403).json({ error: 'Access denied' });
  const count = cache.size;
  cache.clear();
  return res.json({ ok: true, message: `حافظه موقت با موفقیت پاک شد (${count} آیتم)` });
});

// 5. Admin Clear Rate Limiter
app.post('/api/admin/clear-ratelimit', (req: Request, res: Response) => {
  if (!checkAdminAuth(req)) return res.status(403).json({ error: 'Access denied' });
  const count = ipRequests.size;
  ipRequests.clear();
  return res.json({ ok: true, message: `محدودیت‌های آی‌پی بازنشانی شدند (${count} آی‌پی آزاد شد)` });
});

// 6. Admin Toggle Maintenance Mode
app.post('/api/admin/toggle-maintenance', (req: Request, res: Response) => {
  if (!checkAdminAuth(req)) return res.status(403).json({ error: 'Access denied' });
  isMaintenanceMode = !isMaintenanceMode;
  return res.json({ ok: true, isMaintenanceMode });
});

// 7. Admin Export Database Snapshot
app.get('/api/admin/export', async (req: Request, res: Response) => {
  if (!checkAdminAuth(req)) return res.status(403).json({ error: 'Access denied' });
  try {
    const snapshot = await db.getDatabaseSnapshot();
    res.setHeader('Content-Disposition', 'attachment; filename="ayna_backup.json"');
    return res.json(snapshot);
  } catch (err) {
    return res.status(500).json({ error: 'Export failed' });
  }
});

// 8. Admin Test Telegram Bot Ping
app.post('/api/admin/test-bot-ping', async (req: Request, res: Response) => {
  if (!checkAdminAuth(req)) return res.status(403).json({ error: 'Access denied' });
  if (!telegramBotToken) {
    return res.json({ ok: false, message: 'توکن ربات تلگرام روی سرور تنظیم نشده است.' });
  }
  try {
    const resMe = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getMe`);
    const data = await resMe.json();
    return res.json({ ok: data?.ok, result: data?.result });
  } catch (err: any) {
    return res.json({ ok: false, error: err?.message });
  }
});

// 9. Admin Subscriptions List
app.get('/api/admin/subscriptions', async (req: Request, res: Response) => {
  if (!checkAdminAuth(req)) return res.status(403).json({ error: 'Access denied' });
  try {
    const subscriptions = await db.getAllSubscriptions();
    return res.json({ ok: true, subscriptions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// 10. Admin Grant Subscription to User
app.post('/api/admin/subscription/grant', async (req: Request, res: Response) => {
  if (!checkAdminAuth(req)) return res.status(403).json({ error: 'Access denied' });
  const { targetTelegramId, tier, durationMonths, planName } = req.body;
  if (!targetTelegramId) return res.status(400).json({ error: 'Target Telegram ID required' });

  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + (Number(durationMonths) || 1));

  const sub = {
    tier: tier || 'vip',
    isActive: true,
    expiresAt: expiry.toISOString(),
    startedAt: new Date().toISOString(),
    planName: planName || 'اشتراک اهدایی مدیریت',
    paymentMethod: 'admin_gift',
  };

  await db.setSubscription(String(targetTelegramId), sub);
  return res.json({ ok: true, message: `اشتراک ${tier} با موفقیت به کاربر ${targetTelegramId} اهدا شد`, subscription: sub });
});

// -------------------------------------------------------------
// User-Facing Subscription API Endpoints
// -------------------------------------------------------------
app.get('/api/user/subscription/:telegramId', async (req: Request, res: Response) => {
  const { telegramId } = req.params;
  if (!telegramId) return res.status(400).json({ error: 'Telegram ID required' });
  const sub = await db.getSubscription(String(telegramId));
  return res.json({ ok: true, subscription: sub });
});

app.post('/api/user/subscription', async (req: Request, res: Response) => {
  const { telegramId, subscription } = req.body;
  if (!telegramId || !subscription) return res.status(400).json({ error: 'Invalid payload' });
  await db.setSubscription(String(telegramId), subscription);
  return res.json({ ok: true, subscription });
});

// Webhook endpoint for Telegram
app.post('/api/telegram/webhook', async (req: Request, res: Response) => {
  try {
    if (process.env.TELEGRAM_WEBHOOK_SECRET) {
      const secretHeader = req.headers['x-telegram-bot-api-secret-token'];
      if (secretHeader !== process.env.TELEGRAM_WEBHOOK_SECRET) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    const update = req.body;
    if (update && typeof update === 'object' && update.message) {
      await handleTelegramMessage(update.message);
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('Telegram webhook error:', err);
    return res.json({ ok: false });
  }
});

async function handleTelegramMessage(message: any) {
  if (!telegramBotToken || !message?.chat?.id) return;
  const chatId = message.chat.id;
  const text = message.text || '';
  const firstName = message.from?.first_name || 'دوست من';

  if (text.startsWith('/start')) {
    const welcomeText = `سلام ${firstName} عزیز! 🌸\nبه مینی‌اپ **«آینـا»** خوش آمدی.\n\n✨ «هر چیزی که خوشت میاد، نسخه مناسب خودت رو بساز.»\n\nبرای ورود و تجربه کامل مینی‌اپ، دکمه زیر را لمس کنید:`;

    // 1. Send welcoming message with WebApp inline button
    await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: welcomeText,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '✨ ورود به مینی‌اپ آینـا',
                web_app: { url: appUrl }
              }
            ]
          ]
        }
      })
    }).catch((e) => console.warn('Failed to send Telegram welcome message:', e));

    // 2. Set chat menu button for this chat
    await fetch(`https://api.telegram.org/bot${telegramBotToken}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        menu_button: {
          type: 'web_app',
          text: '💄 باز کردن آینـا',
          web_app: { url: appUrl }
        }
      })
    }).catch(() => {});
  }
}

// Optional Polling Runner for environments without webhook
async function initTelegramBot() {
  if (!telegramBotToken) {
    console.log('TELEGRAM_BOT_TOKEN not provided; bot auto-responder inactive. WebApp works with any bot.');
    return;
  }

  try {
    const meRes = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getMe`);
    const meData = await meRes.json();
    if (meData?.ok) {
      botUsername = meData.result.username;
      console.log(`Telegram Bot @${botUsername} connected successfully!`);

      // Set default menu button globally
      await fetch(`https://api.telegram.org/bot${telegramBotToken}/setChatMenuButton`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_button: {
            type: 'web_app',
            text: '💄 باز کردن آینـا',
            web_app: { url: appUrl }
          }
        })
      });

      // Simple long-polling loop
      let offset = 0;
      const poll = async () => {
        try {
          const updatesRes = await fetch(
            `https://api.telegram.org/bot${telegramBotToken}/getUpdates?offset=${offset}&timeout=25`
          );
          const updatesData = await updatesRes.json();
          if (updatesData?.ok && Array.isArray(updatesData.result)) {
            for (const update of updatesData.result) {
              offset = update.update_id + 1;
              if (update.message) {
                await handleTelegramMessage(update.message);
              }
            }
          }
        } catch {
          // Retry gracefully
        }
        setTimeout(poll, 1500);
      };
      poll();
    }
  } catch (err) {
    console.warn('Failed to initialize Telegram Bot:', err);
  }
}

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  await db.init();

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist'), { maxAge: '1h' }));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server listening on 0.0.0.0:${PORT} in ${isProd ? 'production' : 'development'} mode (Railway & Neon Optimized)`);
    initTelegramBot();
  });

  // Graceful shutdown for Railway container lifecycle
  const handleShutdown = (signal: string) => {
    console.log(`Received ${signal}. Gracefully closing HTTP server...`);
    server.close(() => {
      console.log('HTTP server closed. Exiting process.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer();
