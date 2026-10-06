import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  Info, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ExerciseItem, Recommendation } from '../types';
import { ScoredCandidate } from '../engine/recommendationEngine';
import { EXERCISE_LIBRARY } from '../data/exercises';
import { getRecentActions } from '../storage/localStorage';

interface Props {
  primaryRecommendation: Recommendation | null;
  rankedCandidates: ScoredCandidate[];
  onStartExercise: (exercise: ExerciseItem) => void;
  onSnoozeRecommendation: (mins?: number) => void;
  onDismissRecommendation: (id: string) => void;
}

export const Recommendations: React.FC<Props> = ({
  primaryRecommendation,
  rankedCandidates,
  onStartExercise,
  onSnoozeRecommendation,
  onDismissRecommendation
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const recentActions = getRecentActions();

  const isFreshStartSuggestions = !primaryRecommendation && rankedCandidates.some(c => c.isSuggestion);

  const filteredCandidates = rankedCandidates.filter(c => {
    if (selectedCategory === 'all') return true;
    return c.exercise.category === selectedCategory;
  });

  const activeExercise = primaryRecommendation 
    ? EXERCISE_LIBRARY.find(e => e.id === primaryRecommendation.exerciseId) 
    : null;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-teal-400 font-bold">
          Adaptive Wellness Intelligence
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
          Intelligent Intervention Engine
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Deterministic algorithmic recommendations dynamically tailored to your posture vectors, sitting displacement, screen load, and activity history.
        </p>
      </div>

      {/* Fresh Start Suggestions Notice Banner */}
      {isFreshStartSuggestions && (
        <div className="p-5 rounded-3xl bg-teal-950/30 border border-teal-500/30 text-xs text-teal-200 flex items-start gap-3.5 shadow-lg">
          <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">Proactive Workstation Suggestions (Fresh Start)</h4>
            <p className="text-slate-300 leading-relaxed">
              Your posture is currently balanced and no sustained deviations have accumulated yet. The routines below are proactive recommendations. As you work, recommendations will dynamically adapt to live cervical pitch, shoulder slope, and sitting duration.
            </p>
          </div>
        </div>
      )}

      {/* Primary Highlighted Recommendation (Only when active biomechanical trigger exists) */}
      {primaryRecommendation && activeExercise ? (
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-2 border-teal-500/60 p-6 md:p-8 shadow-2xl space-y-6 glow-teal animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-extrabold text-xs uppercase tracking-wider border border-teal-500/30">
                  TOP RANKED INTERVENTION
                </span>
                <span className="text-xs font-mono text-teal-300 font-bold">
                  Score: {Math.round(primaryRecommendation.score * 100)} / 100
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">{primaryRecommendation.title}</h3>
              <p className="text-xs text-slate-300 font-medium">
                {primaryRecommendation.targetArea} • {primaryRecommendation.durationSec}s Duration
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onStartExercise(activeExercise)}
                className="flex items-center gap-2 py-3 px-6 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-lg glow-teal transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start Routine</span>
              </button>
              <button
                onClick={() => onSnoozeRecommendation(10)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Snooze 10m
              </button>
            </div>
          </div>

          {/* Explainability Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <HelpCircle className="w-4 h-4 text-teal-400" />
              <span>Algorithmic Matching Rationale:</span>
            </div>
            <div className="space-y-1 text-xs text-slate-400 pl-6">
              {primaryRecommendation.detailedWhy.map((r, i) => (
                <p key={i}>• {r}</p>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Candidate Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              {isFreshStartSuggestions ? 'Curated Suggestions Pool' : 'Candidate Interventions Scoring Matrix'}
            </h3>
            <p className="text-xs text-slate-400">
              {isFreshStartSuggestions
                ? 'Curated routines for posture maintenance and mobility'
                : 'Live candidate pool ranked by calculated suitability'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['all', 'neck', 'shoulders', 'upper_back', 'wrists', 'mobility', 'visual'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  selectedCategory === cat
                    ? 'bg-teal-500 text-slate-950'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* List of candidates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCandidates.length === 0 ? (
            <div className="col-span-2 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <p className="text-slate-300 font-semibold text-sm">No Filter Matches</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No routines found for the selected category filter.
              </p>
            </div>
          ) : (
            filteredCandidates.map((c, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                      {c.exercise.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-teal-400">
                        {c.isSuggestion ? 'Suggestion' : `${Math.round(c.score * 100)}% Match`}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-white text-base">{c.exercise.name}</h4>
                  <p className="text-xs text-slate-400">{c.exercise.targetArea}</p>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {c.isSuggestion ? 'Recommended For:' : 'Trigger Conditions:'}
                    </span>
                    <p className="text-slate-300">{c.reasons.join(' • ')}</p>
                  </div>
                </div>

                <button
                  onClick={() => onStartExercise(c.exercise)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Routine ({c.exercise.durationSec}s)</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommendation Algorithm Explainability Technical Info */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Info className="w-4 h-4 text-teal-400" />
          <span>About the SitSense Deterministic Recommendation Engine</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          SitSense does NOT use a non-deterministic black-box LLM. Instead, it computes a mathematical suitability matrix based on:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-teal-300 font-bold block mb-1">1. Posture Deltas</span>
            <span className="text-slate-400">Triggers specific biomechanical counter-stretches for forward head, shoulder tilt, or slouch.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-teal-300 font-bold block mb-1">2. Stationary Limits</span>
            <span className="text-slate-400">Elevates leg pumps and mobility routines when sitting exceeds 30 consecutive minutes.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-teal-300 font-bold block mb-1">3. Screen Load</span>
            <span className="text-slate-400">Recommends 20-20-20 visual resets when continuous display gaze exceeds 40 minutes.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-teal-300 font-bold block mb-1">4. Fatigue Cooldown</span>
            <span className="text-slate-400">Penalizes recently completed or dismissed routines to avoid spam and encourage variety.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
