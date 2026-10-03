export type TabType = 'home' | 'make-it-mine' | 'dna' | 'closet' | 'sos' | 'wisdom' | 'admin';

export type SubscriptionTier = 'free' | 'glow' | 'vip' | 'diamond';

export interface UserSubscription {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt?: string; // ISO date string
  startedAt?: string;
  planName?: string;
  paymentMethod?: 'stars' | 'card' | 'admin_gift' | 'promo';
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  latinName: string;
  durationMonths: number;
  priceToman: number;
  priceStars: number;
  originalPriceToman?: number;
  badge?: string;
  features: string[];
  popular?: boolean;
}

export type EnergyLevel = 'low' | 'medium' | 'high';
export type MoodType = 'calm' | 'good' | 'neutral' | 'low' | 'stressed' | 'tired' | 'creative' | 'energetic';
export type TimeOption = 3 | 10 | 20 | 45;

export interface StyleDna {
  minimalVsMaximal: number; // 0 to 100
  colorfulVsNeutral: number;
  boldVsSubtle: number;
  feminineVsStructured: number;
  comfortVsFashion: number;
  primaryArchetype: string;
  secondaryArchetype: string;
  preferredPalette: string;
}

export interface BeautyDna {
  faceShape: 'oval' | 'round' | 'heart' | 'square' | 'long' | 'diamond';
  skinType: 'balanced' | 'dry' | 'oily' | 'combination' | 'sensitive';
  hairTexture: 'straight' | 'wavy' | 'curly' | 'coily';
  hairLength: 'short' | 'medium' | 'long';
  undertone: 'warm' | 'cool' | 'neutral';
  dailyRoutineTime: number; // in minutes
  primaryGoal: string;
  styleDna: StyleDna;
}

export interface ClosetItem {
  id: string;
  category: 'outerwear' | 'top' | 'bottom' | 'shoes' | 'bag' | 'scarf' | 'accessory';
  name: string;
  color: string;
  vibe: 'casual' | 'elegant' | 'minimal' | 'bold' | 'versatile';
  imageUrl?: string;
}

export interface BeautyProductItem {
  id: string;
  category: 'skincare' | 'makeup' | 'hair' | 'body' | 'fragrance';
  name: string;
  purpose: string;
  isEssential: boolean;
}

export interface SavedLook {
  id: string;
  title: string;
  date: string;
  vibe: string;
  imageUrl?: string;
  steps: string[];
  pieces: string[];
  occasion: string;
}

export interface TriageResult {
  headline: string;
  priority1: { title: string; action: string };
  priority2: { title: string; action: string };
  priority3: { title: string; action: string };
  reassuranceNote: string;
}

export interface MakeItMineResult {
  referenceAnalysis: {
    silhouette: string;
    vibe: string;
    colors: string[];
    makeupFocus: string;
    hairStyle: string;
    keyAccessories: string[];
  };
  yourVersion: {
    title: string;
    coreAdvice: string;
    steps: Array<{ step: number; part: string; action: string }>;
    closetMatching: string;
    finalWord: string;
  };
}

export interface SecondOpinionResult {
  optionA_analysis: {
    name: string;
    vibe: string;
    impression: string;
  };
  optionB_analysis: {
    name: string;
    vibe: string;
    impression: string;
  };
  verdict: string;
}

export interface TodayPlanResult {
  title: string;
  vibeSummary: string;
  actions: Array<{ time: string; title: string; desc: string; done?: boolean }>;
  goodEnoughMessage: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

