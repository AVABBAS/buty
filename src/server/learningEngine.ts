/**
 * Server-Side Feedback & Learning Engine
 * Tracks user interaction events and calculates behavioral preference weights.
 * Non-diagnostic: Models stylistic affinities, NOT psychological traits.
 */

import { UserEvent, UserEventType, LearnedPreferenceWeights } from '../types/intelligence';

export interface UserEventRecord extends UserEvent {
  id?: number;
  createdAt: string;
}

export class LearningEngine {
  /**
   * Computes updated behavioral preference weights based on historical interaction events.
   * Higher weight = stronger user affinity towards that attribute.
   */
  static computeLearnedWeights(events: UserEvent[]): LearnedPreferenceWeights {
    const weights: LearnedPreferenceWeights = {
      minimalWeight: 0,
      neutralColorWeight: 0,
      boldWeight: 0,
      quickRoutineWeight: 0,
      comfortWeight: 0,
      colorAffinity: {},
      silhouetteAffinity: {},
    };

    if (!Array.isArray(events) || events.length === 0) {
      return weights;
    }

    for (const evt of events) {
      const type = evt.eventType;
      const meta = evt.metadata || {};

      // Positive reinforcement multipliers
      const isPositive =
        type === 'recommendation_saved' ||
        type === 'look_liked' ||
        type === 'look_tried' ||
        type === 'style_selected' ||
        type === 'routine_completed';

      // Negative reinforcement multipliers
      const isNegative =
        type === 'recommendation_rejected' ||
        type === 'look_disliked' ||
        type === 'product_rejected' ||
        type === 'style_skipped';

      const delta = isPositive ? 0.2 : isNegative ? -0.2 : 0.05;

      // 1. Minimal vs Maximal
      if (meta.vibe === 'minimal' || meta.style === 'minimal') {
        weights.minimalWeight = clamp(weights.minimalWeight + delta, -1.0, 1.0);
      } else if (meta.vibe === 'bold' || meta.vibe === 'maximal') {
        weights.boldWeight = clamp(weights.boldWeight + delta, -1.0, 1.0);
        weights.minimalWeight = clamp(weights.minimalWeight - delta * 0.5, -1.0, 1.0);
      }

      // 2. Color Palette Preference
      if (meta.palette === 'neutral' || meta.colorVibe === 'neutral') {
        weights.neutralColorWeight = clamp(weights.neutralColorWeight + delta, -1.0, 1.0);
      }

      if (meta.color && typeof meta.color === 'string') {
        const c = meta.color.toLowerCase();
        weights.colorAffinity[c] = clamp((weights.colorAffinity[c] || 0) + delta, -1.0, 1.0);
      }

      // 3. Routine duration preference
      if (meta.durationMinutes && typeof meta.durationMinutes === 'number') {
        if (meta.durationMinutes <= 5) {
          weights.quickRoutineWeight = clamp(weights.quickRoutineWeight + delta, -1.0, 1.0);
        } else if (meta.durationMinutes >= 15) {
          weights.quickRoutineWeight = clamp(weights.quickRoutineWeight - delta * 0.5, -1.0, 1.0);
        }
      }

      // 4. Comfort emphasis
      if (meta.comfortOriented) {
        weights.comfortWeight = clamp(weights.comfortWeight + delta, -1.0, 1.0);
      }
    }

    return weights;
  }
}

function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(num * 100) / 100, min), max);
}
