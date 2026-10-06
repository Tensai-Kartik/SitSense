import React, { useState } from 'react';
import { 
  Dumbbell, 
  Search, 
  Filter, 
  Play, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { EXERCISE_LIBRARY } from '../data/exercises';
import { ExerciseCategory, ExerciseItem } from '../types';
import { ExerciseVisualizer } from '../components/exercises/ExerciseVisualizer';

interface Props {
  onStartExercise: (exercise: ExerciseItem) => void;
}

export const Exercises: React.FC<Props> = ({ onStartExercise }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [seatedOnlyFilter, setSeatedOnlyFilter] = useState<boolean>(false);
  const [previewExercise, setPreviewExercise] = useState<ExerciseItem | null>(null);

  const categories = [
    { id: 'all', label: 'All Routines' },
    { id: 'neck', label: 'Neck & Cervical' },
    { id: 'shoulders', label: 'Shoulders & Scapula' },
    { id: 'upper_back', label: 'Upper Back & Thoracic' },
    { id: 'wrists', label: 'Wrists & Forearms' },
    { id: 'legs', label: 'Legs & Circulation' },
    { id: 'mobility', label: 'Full-Body Mobility' },
    { id: 'visual', label: 'Eye & Visual Breaks' },
  ];

  const filteredExercises = EXERCISE_LIBRARY.filter((item) => {
    // Category match
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    // Difficulty match
    if (selectedDifficulty !== 'all' && item.difficulty !== selectedDifficulty) return false;
    // Seated only
    if (seatedOnlyFilter && !item.seatedOnly) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchTarget = item.targetArea.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchName && !matchTarget && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-teal-400 font-bold">
            Evidence-Based Library
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
            Workplace Ergonomic Exercises ({EXERCISE_LIBRARY.length})
          </h2>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exercise, muscle, or symptom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:border-teal-500 outline-none"
            />
          </div>

          {/* Seated Only Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 ml-auto">
            <input
              type="checkbox"
              checked={seatedOnlyFilter}
              onChange={(e) => setSeatedOnlyFilter(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0"
            />
            <span>Seated-at-Desk Only</span>
          </label>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === c.id
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 p-5 flex flex-col justify-between space-y-4 transition-all group hover:shadow-xl"
          >
            {/* Visualizer Header Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                  {exercise.category.replace('_', ' ')}
                </span>
                <span className="text-xs font-mono font-bold text-teal-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{exercise.durationSec}s</span>
                </span>
              </div>

              {/* Dynamic SVG Animation Visualizer Box */}
              <ExerciseVisualizer
                animationType={exercise.animationType}
                className="w-full h-36"
              />

              <div>
                <h4 className="font-bold text-white text-base group-hover:text-teal-300 transition-colors">
                  {exercise.name}
                </h4>
                <p className="text-xs text-teal-400/90 font-medium mt-0.5">
                  Target: {exercise.targetArea}
                </p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {exercise.description}
                </p>
              </div>

              {/* Quick Key Benefits */}
              <div className="space-y-1 pt-1">
                {exercise.benefits.slice(0, 2).map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Exercise Button */}
            <button
              onClick={() => onStartExercise(exercise)}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Routine ({exercise.durationSec}s)</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
