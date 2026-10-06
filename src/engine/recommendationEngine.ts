import { EXERCISE_LIBRARY } from '../data/exercises';
import { getRecentActions } from '../storage/localStorage';
import { AppSettings, ExerciseItem, PostureMetrics, PostureState, Recommendation, SessionMetrics } from '../types';

export interface ScoredCandidate {
  exercise: ExerciseItem;
  score: number;
  reasons: string[];
  detailedWhy: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  isSuggestion?: boolean;
}

export class RecommendationEngine {
  /**
   * Evaluates dynamic real-time recommendation based on active biomechanical telemetry.
   */
  public evaluate(
    postureState: PostureState,
    postureMetrics: PostureMetrics,
    stationaryDurationSec: number,
    continuousScreenSec: number,
    session: SessionMetrics,
    settings: AppSettings,
    snoozeUntilTimestamp: number = 0
  ): {
    primaryRecommendation: Recommendation | null;
    rankedCandidates: ScoredCandidate[];
  } {
    const now = Date.now();
    if (now < snoozeUntilTimestamp) {
      return { primaryRecommendation: null, rankedCandidates: [] };
    }

    const recentActions = getRecentActions();
    const stationaryMin = stationaryDurationSec / 60;
    const screenMin = continuousScreenSec / 60;

    // Has telemetry detected anything actionable?
    const hasPosturalDeviation = 
      postureMetrics.rawForwardHeadDelta > 8 ||
      postureMetrics.headTiltAngle > 5 ||
      postureMetrics.rawShoulderDelta > 3.5 ||
      postureMetrics.slouchScore > 0.30 ||
      postureMetrics.torsoLeanAngle > 6;

    const hasFatigue = stationaryMin >= 20 || screenMin >= 25;

    const scoredList: ScoredCandidate[] = EXERCISE_LIBRARY.map((exercise) => {
      let score = 0.15; // baseline interest
      const reasons: string[] = [];
      const detailedWhy: string[] = [];

      // Filter: Seated only preference
      if (settings.seatedOnlyMode && !exercise.seatedOnly) {
        return { exercise, score: 0, reasons: [], detailedWhy: [], urgency: 'LOW' };
      }

      // 1. Posture Alignment Factors
      if (exercise.category === 'neck') {
        if (postureMetrics.rawForwardHeadDelta > 10) {
          score += 0.45;
          reasons.push('Forward Head Posture Detected');
          detailedWhy.push(`Head angle is tilted ${postureMetrics.forwardHeadAngle}° forward relative to neutral vertical axis.`);
        }
        if (postureMetrics.headTiltAngle > 6) {
          score += 0.35;
          reasons.push('Lateral Neck Imbalance');
          detailedWhy.push(`Lateral head tilt of ${postureMetrics.headTiltAngle}° observed across sustained frames.`);
        }
      }

      if (exercise.category === 'shoulders') {
        if (postureMetrics.rawShoulderDelta > 4) {
          score += 0.45;
          reasons.push('Shoulder Height Imbalance');
          detailedWhy.push(`Left vs Right shoulder elevation delta of ${postureMetrics.shoulderSlopeAngle}° detected.`);
        }
        if (postureMetrics.slouchScore > 0.35) {
          score += 0.35;
          reasons.push('Shoulder Protraction / Hunch');
          detailedWhy.push('Scapular and clavicle landmarks show rounded shoulder curvature.');
        }
      }

      if (exercise.category === 'upper_back') {
        if (postureMetrics.slouchScore > 0.35) {
          score += 0.50;
          reasons.push('Spinal Kyphosis & Slouching');
          detailedWhy.push(`Torso compression score is ${Math.round(postureMetrics.slouchScore * 100)}%, indicating rounded upper back.`);
        }
        if (postureMetrics.torsoLeanAngle > 7) {
          score += 0.35;
          reasons.push('Torso Lateral Lean');
          detailedWhy.push(`Spine inclination is ${postureMetrics.torsoLeanAngle}° from center.`);
        }
      }

      // 2. Stationary Duration Factors
      if (stationaryMin >= settings.stationaryWarningThresholdMin) {
        if (exercise.category === 'mobility' || exercise.category === 'legs') {
          score += 0.55;
          reasons.push(`Stationary for ${Math.round(stationaryMin)} min`);
          detailedWhy.push(`You have remained seated without substantial movement for ${Math.round(stationaryMin)} consecutive minutes (configured limit: ${settings.stationaryWarningThresholdMin}m).`);
        }
      } else if (stationaryMin >= settings.stationaryWarningThresholdMin * 0.7) {
        if (exercise.category === 'mobility' || exercise.category === 'legs') {
          score += 0.25;
          reasons.push(`Prolonged Seated Work (${Math.round(stationaryMin)}m)`);
        }
      }

      // 3. Screen Exposure Factors
      if (screenMin >= settings.visualBreakIntervalMin) {
        if (exercise.category === 'visual') {
          score += 0.60;
          reasons.push(`Continuous Screen Exposure (${Math.round(screenMin)}m)`);
          detailedWhy.push(`Continuous visual display exposure has exceeded ${settings.visualBreakIntervalMin} minutes without a gaze reset.`);
        }
      } else if (screenMin >= 25 && exercise.category === 'visual') {
        score += 0.20;
      }

      // 4. Repetition & Dismissal Penalties
      const recentAction = recentActions.find(a => a.exerciseId === exercise.id);
      if (recentAction) {
        const minutesAgo = (now - recentAction.timestamp) / 60000;
        if (recentAction.action === 'COMPLETED') {
          if (minutesAgo < 15) {
            score -= 0.40; // Don't repeat same exercise too quickly
          }
        } else if (recentAction.action === 'DISMISSED') {
          if (minutesAgo < 10) {
            score -= 0.30; // Respect dismissal cooldown
          }
        }
      }

      // 5. Urgency evaluation
      let urgency: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (score >= 0.75 || postureState === 'POOR' || stationaryMin >= 45 || screenMin >= 60) {
        urgency = 'HIGH';
      } else if (score >= 0.50 || postureState === 'ATTENTION' || stationaryMin >= 30) {
        urgency = 'MEDIUM';
      }

      // In Focus Mode, suppress LOW and MEDIUM urgency
      if (settings.focusMode && urgency !== 'HIGH') {
        score = 0;
      }

      return {
        exercise,
        score: Math.max(0, Math.min(1, Number(score.toFixed(2)))),
        reasons,
        detailedWhy,
        urgency
      };
    });

    // Sort descending by score
    const actionableCandidates = scoredList
      .filter(item => item.score > 0.35 && item.reasons.length > 0)
      .sort((a, b) => b.score - a.score);

    // If no actionable telemetry data (fresh start / optimal posture), return proactive suggestions
    if (!hasPosturalDeviation && !hasFatigue && actionableCandidates.length === 0) {
      const suggestions = this.getFreshStartSuggestions(settings);
      return {
        primaryRecommendation: null,
        rankedCandidates: suggestions
      };
    }

    if (actionableCandidates.length === 0) {
      const suggestions = this.getFreshStartSuggestions(settings);
      return { primaryRecommendation: null, rankedCandidates: suggestions };
    }

    const best = actionableCandidates[0];
    const primaryRecommendation: Recommendation = {
      id: 'rec_' + now,
      exerciseId: best.exercise.id,
      title: best.exercise.name,
      category: best.exercise.category,
      targetArea: best.exercise.targetArea,
      durationSec: best.exercise.durationSec,
      urgency: best.urgency,
      score: best.score,
      reason: best.reasons.join(' • '),
      detailedWhy: best.detailedWhy.length > 0 ? best.detailedWhy : [`Recommended based on current session posture analysis and activity.`],
      conditionsMatched: best.reasons,
      createdAt: now,
      status: 'PENDING'
    };

    return {
      primaryRecommendation,
      rankedCandidates: actionableCandidates
    };
  }

  /**
   * Curated suggestions for fresh start / when no telemetry deviations exist yet.
   */
  public getFreshStartSuggestions(settings: AppSettings): ScoredCandidate[] {
    const suggestedIds = [
      'mobility-reset',
      'chin-tucks',
      'distance-focus-2020',
      'shoulder-blade-squeeze',
      'wrist-extensor-stretch',
      'thoracic-extension'
    ];
    return EXERCISE_LIBRARY
      .filter(e => suggestedIds.includes(e.id))
      .filter(e => !settings.seatedOnlyMode || e.seatedOnly)
      .map(exercise => ({
        exercise,
        score: 0.85,
        reasons: ['Workstation Routine Suggestion', 'Optimal Posture Maintenance'],
        detailedWhy: [
          'Suggested ergonomic warmup routine for fresh sessions before postural fatigue sets in.',
          'Maintains spinal alignment and prevents cervical compression.'
        ],
        urgency: 'LOW' as const,
        isSuggestion: true
      }));
  }
}

export const recommendationEngine = new RecommendationEngine();
