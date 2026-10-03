/**
 * Personal Beauty & Style Intelligence Core Types
 * Single Source of Truth for Ayna's Recommendation & Learning Engine
 */

import { BeautyDna, ClosetItem, BeautyProductItem, SavedLook, UserSubscription } from './index';

export interface StyleSpectrum {
  minimalVsMaximal: number; // 0 (Pure Minimal) -> 100 (Bold Maximal)
  neutralVsColorful: number; // 0 (Monochrome/Earth) -> 100 (Vibrant/Color-block)
  subtleVsBold: number; // 0 (Low-key / Understated) -> 100 (Statement / Dramatic)
  feminineVsStructured: number; // 0 (Sharp / Architectural) -> 100 (Soft / Draped / Flowy)
  comfortVsFashion: number; // 0 (Pure Comfort/Ease) -> 100 (Editorial / Fashion-forward)
  classicVsTrendy: number; // 0 (Timeless Capsule) -> 100 (Contemporary Trend)
  naturalVsGlamorous: number; // 0 (Barely-there/Clean) -> 100 (Polished/Red Carpet)
}

export type OccasionType = 'everyday' | 'work' | 'date' | 'party' | 'photo' | 'travel';

export interface ContextualStyleArchetype {
  primaryArchetype: string;
  secondaryArchetype: string;
  keyRule: string;
}

export interface ExtendedStyleDNA extends StyleSpectrum {
  primaryArchetype: string;
  secondaryArchetype: string;
  contextualProfiles: Record<OccasionType, ContextualStyleArchetype>;
}

export interface ColorDNA {
  favoriteColors: string[];
  dislikedColors: string[];
  preferredNeutrals: string[];
  accentColors: string[];
  flatteringNearFace: string[];
  occasionPalettePreferences: Record<OccasionType, string[]>;
}

export interface BeautyConcern {
  area: 'skin' | 'hair' | 'makeup' | 'closet' | 'mindset';
  title: string;
  priority: 'urgent' | 'moderate' | 'maintenance';
  notes?: string;
}

export interface CurrentSessionContext {
  mood?: string;
  energy?: 'low' | 'medium' | 'high';
  occasion?: OccasionType | string;
  desiredVibe?: string;
  availableTimeMinutes?: number;
  season?: 'spring' | 'summer' | 'fall' | 'winter';
}

export interface UserPreferences {
  preferredRoutineTimeMinutes: number;
  fragranceFamily?: string;
  avoidHeavyTextures: boolean;
  prefersQuickFixes: boolean;
  bodyComfortFirst: boolean;
}

export interface UserInteractionSummary {
  totalLooksTried: number;
  totalLooksSaved: number;
  lastActiveSession?: string;
  mostFrequentOccasion?: string;
}

export interface UserContext {
  identity: {
    telegramId: string;
    firstName?: string;
    username?: string;
  };
  beautyDNA: BeautyDna;
  styleDNA: ExtendedStyleDNA;
  colorDNA: ColorDNA;
  closet: ClosetItem[];
  shelf: BeautyProductItem[];
  savedLooks: SavedLook[];
  subscription?: UserSubscription;
  preferences: UserPreferences;
  currentContext: CurrentSessionContext;
  concerns: BeautyConcern[];
  history: UserInteractionSummary;
}

export type UserEventType =
  | 'recommendation_shown'
  | 'recommendation_saved'
  | 'recommendation_rejected'
  | 'look_tried'
  | 'look_liked'
  | 'look_disliked'
  | 'look_modified'
  | 'product_used'
  | 'product_rejected'
  | 'style_selected'
  | 'style_skipped'
  | 'studio_opened'
  | 'routine_completed';

export interface UserEvent {
  id?: number;
  telegramId: string;
  eventType: UserEventType;
  feature: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export interface LearnedPreferenceWeights {
  minimalWeight: number; // -1.0 to +1.0
  neutralColorWeight: number;
  boldWeight: number;
  quickRoutineWeight: number;
  comfortWeight: number;
  colorAffinity: Record<string, number>;
  silhouetteAffinity: Record<string, number>;
}

export interface RecommendationRequest {
  userContext: UserContext;
  goal: 'today_glow' | 'make_it_mine' | 'outfit_match' | 'emergency_sos' | 'studio_look';
  availableTimeMinutes?: number;
  occasion?: string;
  inputDescription?: string;
  referenceImageBase64?: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  vibe: string;
  whyItFitsYou: string;
  actions: Array<{
    step: number;
    part: 'skin' | 'hair' | 'outfit' | 'accent';
    action: string;
    usingYourClosetOrShelf?: string;
  }>;
  confidenceScore?: number;
}

export interface RecommendationResponse {
  options: RecommendationItem[]; // Strictly 2 to 3 choices
  rationale: string;
  timeEstimateMinutes: number;
  goodEnoughClosing: string;
}
