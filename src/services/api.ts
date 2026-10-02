import { MakeItMineResult, TriageResult, SecondOpinionResult, TodayPlanResult, BeautyDna } from '../types';

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 9000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function requestMakeItMine(
  prompt: string,
  vibe: string,
  photoBase64?: string,
  userDna?: Partial<BeautyDna>
): Promise<MakeItMineResult> {
  try {
    const res = await fetchWithTimeout('/api/ai/make-it-mine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, vibe, photoBase64, userDna }),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    console.warn('Falling back to local MakeItMine generator:', err);
    return {
      referenceAnalysis: {
        silhouette: 'سیلوئت مدرن، هماهنگ و متعادل بدون افراط',
        vibe: vibe || 'Clean & Elegant',
        colors: ['کرم شنی', 'مشکی کربن', 'رز ملایم'],
        makeupFocus: 'پوست براق و سالم (Skin-first)، ابروهای شانه شده طبیعی، برق لب یا تینت محو',
        hairStyle: 'موج‌های لطیف باز یا دم‌اسبی مرتب پایین سر',
        keyAccessories: ['کیف دوشی مینیمال چرم', 'گوشواره حلقه‌ای ظریف', 'شال هماهنگ نخی']
      },
      yourVersion: {
        title: 'نسخه شخصی‌سازی شده شما (Make It Mine)',
        coreAdvice: 'به جای بازسازی گران‌قیمت یا پیچیده، با تمرکز بر بافت و ترکیب رنگ‌های کمدت دقیقاً همین حال‌وهوا را بساز.',
        steps: [
          { step: 1, part: 'پوست و آرایش', action: 'مرطوب‌کننده + ضدآفتاب رنگی، ژل ابرو و تینت روی لب و استخوان گونه.' },
          { step: 2, part: 'موها', action: 'فرق از وسط مرتب، با مقدار کمی سرم نرم‌کننده روی ساقه برای جلوگیری از وز.' },
          { step: 3, part: 'استایل با داشته‌های کمد', action: 'کت یا شومیز اورسایز با شلوار راسته تیره و لوفر یا کتانی سفید تمیز.' }
        ],
        closetMatching: 'با همان مانتو یا کت رنگ خنثی و شال کرم که در کمدت داری فوق‌العاده می‌شود.',
        finalWord: 'این لوک نسخه اصیل خودته؛ راحت و شیک!'
      }
    };
  }
}

export async function requestTriage(
  problem: string,
  context: string,
  category: string
): Promise<TriageResult> {
  try {
    const res = await fetchWithTimeout('/api/ai/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem, context, category }),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    console.warn('Falling back to local Triage generator:', err);
    return {
      headline: 'نفس عمیق بکش؛ این اولویت‌بندی ۳ مرحله‌ای نجات‌دهنده‌ست:',
      priority1: {
        title: 'الان مهم‌ترین (همین الان)',
        action: 'فقط یک نقطه را حل کن: اگر مو به هم ریخته است، یک کلیپس تمیز؛ اگر پوست خسته است، یک آبرسان و شستشوی آب ولرم.'
      },
      priority2: {
        title: 'کار بعدی (۳ دقیقه)',
        action: 'یک تینت یا رژ لب شاداب و مرتب کردن فرم ابروها.'
      },
      priority3: {
        title: 'اگر وقت ماند',
        action: 'شال یا گوشواره شاخص را اضافه کن و عطر بزن.'
      },
      reassuranceNote: 'همین سه کار ۹۰٪ تأثیر ظاهری رو ساخت. بقیه جزئیات اصلاً توی دید نیستن. آماده‌ای؛ آینه رو ببند!'
    };
  }
}

export async function requestSecondOpinion(
  optionA: string,
  optionB: string,
  context: string
): Promise<SecondOpinionResult> {
  try {
    const res = await fetchWithTimeout('/api/ai/second-opinion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionA, optionB, context }),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    console.warn('Falling back to local Second Opinion generator:', err);
    return {
      optionA_analysis: {
        name: optionA || 'گزینه اول',
        vibe: 'ساختاریافته، کلاسیک و رسمی‌تر',
        impression: 'حس تسلط و احترام را منتقل می‌کند؛ عالی برای جلسات و محیط‌های دارای کد پوشش.'
      },
      optionB_analysis: {
        name: optionB || 'گزینه دوم',
        vibe: 'راحت، شاداب، صمیمی و مدرن',
        impression: 'حس دسترسی‌پذیری و سبک‌بالی می‌دهد؛ فوق‌العاده برای روزمره، کافه و دورهمی.'
      },
      verdict: 'هر دو انتخاب محترمند. اگر امروز دنبال انرژی بالا و بدون دردسر هستی، آن گزینه‌ای را انتخاب کن که نیازی به چک کردن مدام ندارد.'
    };
  }
}

export async function requestTodayPlan(
  energy: string,
  mood: string,
  timeMinutes: number,
  occasion: string,
  userDna?: any
): Promise<TodayPlanResult> {
  try {
    const res = await fetchWithTimeout('/api/ai/today-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ energy, mood, timeMinutes, occasion, userDna }),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    console.warn('Falling back to local Today Plan generator:', err);
    return {
      title: `برنامه آماده‌سازی ${timeMinutes} دقیقه‌ای امروز`,
      vibeSummary: `تنظیم شده برای انرژی ${energy === 'low' ? 'پایین' : energy === 'high' ? 'بالا' : 'متوسط'} و موقعیت ${occasion}`,
      actions: [
        { time: '۱ دقیقه', title: 'طراوت پایه پوست', desc: 'شستشو یا اسپری گلاب/آب، سپس مرطوب‌کننده و ضدآفتاب' },
        { time: `${Math.max(2, Math.floor(timeMinutes / 2))} دقیقه`, title: 'چهره و مو', desc: 'شانه کردن ابرو، یک بالم یا تینت شاداب روی لب و بستن سریع موها' },
        { time: '۲ دقیقه', title: 'هماهنگی نهایی لباس', desc: 'انتخاب یک جفت گوشواره ساده و شال هم‌رنگ کفش' }
      ],
      goodEnoughMessage: 'بقیه موارد اضافه است. با همین ۳ قدم کاملاً آراسته‌ای، روزت رو شروع کن!'
    };
  }
}

export async function requestCoachChat(
  message: string,
  history: Array<{ role: 'user' | 'model'; text: string }> = []
): Promise<string> {
  try {
    const res = await fetchWithTimeout('/api/ai/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.warn('Falling back to local Coach response:', err);
    return 'من پیشتم! یادت باشه زیبایی یک نمره یا قضاوت دیگران نیست؛ یک حسه. چه کار کوچیکی هست که همین الان در ۳ دقیقه بهت حس سبکی و شادابی میده؟';
  }
}
