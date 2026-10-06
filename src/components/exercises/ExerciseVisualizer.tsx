import React, { useEffect, useState } from 'react';

interface Props {
  animationType: string;
  className?: string;
  isPaused?: boolean;
}

export const ExerciseVisualizer: React.FC<Props> = ({ animationType, className = '', isPaused = false }) => {
  const [phase, setPhase] = useState<number>(0);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setPhase((p) => (p + 0.05) % (Math.PI * 2));
    }, 40);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Sine oscillation between -1 and 1
  const sin = Math.sin(phase);
  const cos = Math.cos(phase);
  const pulse = (sin + 1) / 2; // 0 to 1

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 ${className}`}>
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Visualizer Renderer based on exercise */}
      <div className="relative z-10 w-full max-w-[280px] aspect-square flex items-center justify-center">
        {renderAnimation(animationType, sin, cos, pulse, phase)}
      </div>

      {/* Dynamic movement indicator tag */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span>Smooth Controlled Motion</span>
        </span>
        <span className="text-teal-400/80">Tempo: 4s Cycle</span>
      </div>
    </div>
  );
};

function renderAnimation(type: string, sin: number, cos: number, pulse: number, phase: number) {
  switch (type) {
    case 'chin_tucks': {
      // Head shifts back and forth
      const headOffset = -sin * 18;
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Alignment guide line */}
          <line x1="85" y1="20" x2="85" y2="180" stroke="#334155" strokeDasharray="4 4" strokeWidth="1.5" />
          <text x="50" y="30" fill="#64748b" fontSize="9" fontFamily="monospace">Neutral Axis</text>

          {/* Torso & Chair */}
          <path d="M 60 190 L 60 110 Q 60 95 80 95 L 120 95 Q 140 95 140 110 L 140 190" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          <rect x="50" y="100" width="10" height="90" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          
          {/* Spine & Cervical points */}
          <path d={`M 100 120 Q 98 85 ${100 + headOffset * 0.5} 65`} fill="none" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round" />
          
          {/* Head */}
          <g transform={`translate(${headOffset}, 0)`}>
            <circle cx="100" cy="55" r="26" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2.5" />
            {/* Face profile */}
            <path d="M 124 50 Q 132 55 124 60" fill="none" stroke="#2dd4bf" strokeWidth="2" />
            <circle cx="112" cy="50" r="3" fill="#ccfbf1" />
            {/* Chin indicator */}
            <circle cx="120" cy="68" r="3.5" fill="#f59e0b" />
          </g>

          {/* Tension relief aura */}
          <circle cx={100 + headOffset} cy="55" r={30 + pulse * 6} fill="none" stroke="#14b8a6" strokeOpacity={0.3 * (1 - pulse)} strokeWidth="2" />

          {/* Directional arrow */}
          <path d="M 145 55 L 128 55 M 134 49 L 128 55 L 134 61" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    case 'neck_rotation': {
      const angle = sin * 38; // degrees
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Shoulders */}
          <path d="M 30 150 Q 100 130 170 150 L 170 190 L 30 190 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          
          {/* Neck base */}
          <rect x="90" y="100" width="20" height="35" fill="#0f766e" rx="4" />

          {/* Rotation arc guide */}
          <path d="M 50 75 A 55 55 0 0 1 150 75" fill="none" stroke="#14b8a6" strokeDasharray="3 3" strokeWidth="1.5" />

          {/* Rotating Head */}
          <g transform={`rotate(${angle} 100 80)`}>
            <ellipse cx="100" cy="80" rx="28" ry="32" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2.5" />
            <circle cx="90" cy="76" r="3.5" fill="#ccfbf1" />
            <circle cx="110" cy="76" r="3.5" fill="#ccfbf1" />
            <path d="M 98 82 L 100 90 L 102 82" fill="none" stroke="#2dd4bf" strokeWidth="2" />
            <path d="M 94 98 Q 100 102 106 98" fill="none" stroke="#ccfbf1" strokeWidth="1.5" />
          </g>

          {/* Dynamic angle indicator */}
          <text x="100" y="180" textAnchor="middle" fill="#2dd4bf" fontSize="11" fontFamily="monospace">
            {Math.abs(Math.round(angle))}° Rotation
          </text>
        </svg>
      );
    }

    case 'neck_side_stretch': {
      const tilt = sin * 22; // lateral tilt
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Shoulders */}
          <path d="M 25 150 Q 100 135 175 150 L 175 190 L 25 190 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          
          {/* Stretch tension waves on contralateral side */}
          {tilt > 5 && (
            <g stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.8">
              <path d="M 60 130 Q 75 110 85 90" fill="none" strokeDasharray="3 2" />
              <path d="M 50 135 Q 68 115 78 95" fill="none" strokeDasharray="3 2" />
            </g>
          )}

          {/* Tilting Head */}
          <g transform={`rotate(${tilt} 100 135)`}>
            <rect x="91" y="95" width="18" height="30" fill="#0f766e" rx="4" />
            <circle cx="100" cy="75" r="28" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2.5" />
            <circle cx="92" cy="72" r="3" fill="#ccfbf1" />
            <circle cx="108" cy="72" r="3" fill="#ccfbf1" />
            <path d="M 94 88 Q 100 93 106 88" fill="none" stroke="#ccfbf1" strokeWidth="1.5" />
          </g>

          <text x="100" y="180" textAnchor="middle" fill="#14b8a6" fontSize="11" fontFamily="monospace">
            Lateral Neck Decompression
          </text>
        </svg>
      );
    }

    case 'shoulder_rolls': {
      const dy = -sin * 14;
      const dx = cos * 10;
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Head & Neck */}
          <circle cx="100" cy="50" r="22" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" />
          <rect x="93" y="68" width="14" height="20" fill="#0f766e" />

          {/* Circular orbit tracks */}
          <ellipse cx="55" cy="115" rx="12" ry="16" fill="none" stroke="#334155" strokeDasharray="3 3" />
          <ellipse cx="145" cy="115" rx="12" ry="16" fill="none" stroke="#334155" strokeDasharray="3 3" />

          {/* Left Shoulder Joint */}
          <circle cx={55 + dx} cy={115 + dy} r="14" fill="#14b8a6" stroke="#5eead4" strokeWidth="2" />
          {/* Right Shoulder Joint */}
          <circle cx={145 - dx} cy={115 + dy} r="14" fill="#14b8a6" stroke="#5eead4" strokeWidth="2" />

          {/* Body connector */}
          <path d={`M ${55 + dx} ${115 + dy} Q 100 100 ${145 - dx} ${115 + dy} L 140 180 L 60 180 Z`} fill="#1e293b" stroke="#334155" strokeWidth="2" />

          {/* Orbit direction arrow */}
          <path d="M 45 105 A 12 16 0 0 1 65 105" fill="none" stroke="#2dd4bf" strokeWidth="2" markerEnd="url(#arrow)" />

          <text x="100" y="185" textAnchor="middle" fill="#2dd4bf" fontSize="11" fontFamily="monospace">
            Backward Scapular Rolls
          </text>
        </svg>
      );
    }

    case 'shoulder_blade_squeeze': {
      const squeeze = (sin + 1) * 8; // 0 to 16
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Head back view */}
          <circle cx="100" cy="45" r="22" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" />
          
          {/* Spine vertical column */}
          <line x1="100" y1="70" x2="100" y2="175" stroke="#38bdf8" strokeWidth="3" strokeDasharray="4 3" />

          {/* Left Scapula (Shoulder Blade) */}
          <path d={`M ${65 + squeeze} 85 L ${80 + squeeze} 125 L ${55 + squeeze} 135 Z`} fill="#14b8a6" stroke="#5eead4" strokeWidth="2" />
          {/* Right Scapula */}
          <path d={`M ${135 - squeeze} 85 L ${120 - squeeze} 125 L ${145 - squeeze} 135 Z`} fill="#14b8a6" stroke="#5eead4" strokeWidth="2" />

          {/* Retraction Arrows */}
          <path d={`M ${60 + squeeze} 110 L ${85 + squeeze} 110`} stroke="#f59e0b" strokeWidth="2.5" />
          <path d={`M ${140 - squeeze} 110 L ${115 - squeeze} 110`} stroke="#f59e0b" strokeWidth="2.5" />

          <text x="100" y="180" textAnchor="middle" fill="#5eead4" fontSize="11" fontFamily="monospace">
            Rhomboid Retraction
          </text>
        </svg>
      );
    }

    case 'cross_body_shoulder': {
      const armShift = sin * 8;
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="45" r="20" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" />
          <path d="M 50 110 Q 100 95 150 110 L 140 180 L 60 180 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          
          {/* Crossed arm */}
          <path d={`M 140 110 L ${60 + armShift} 115 L ${40 + armShift} 105`} fill="none" stroke="#14b8a6" strokeWidth="8" strokeLinecap="round" />
          {/* Support arm */}
          <path d={`M 65 150 L ${60 + armShift} 115 L ${75 + armShift} 100`} fill="none" stroke="#2dd4bf" strokeWidth="6" strokeLinecap="round" />

          <text x="100" y="185" textAnchor="middle" fill="#2dd4bf" fontSize="11" fontFamily="monospace">
            Posterior Deltoid Stretch
          </text>
        </svg>
      );
    }

    case 'thoracic_extension': {
      const arch = (sin + 1) * 12; // 0 to 24 deg
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Chair */}
          <path d="M 70 190 L 70 100 Q 70 85 85 85" fill="none" stroke="#475569" strokeWidth="4" />
          
          {/* Arching Spine */}
          <g transform={`rotate(${-arch} 85 140)`}>
            {/* Torso */}
            <path d="M 85 140 L 95 85 L 125 90 L 105 145 Z" fill="#0f766e" stroke="#14b8a6" strokeWidth="2" />
            {/* Head & interlaced hands */}
            <circle cx="100" cy="60" r="20" fill="#115e59" stroke="#2dd4bf" strokeWidth="2" />
            <path d="M 90 55 Q 80 40 100 45" fill="none" stroke="#5eead4" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Breath aura */}
          <circle cx="120" cy="85" r={15 + pulse * 10} fill="none" stroke="#38bdf8" strokeOpacity={0.4 * (1 - pulse)} strokeWidth="2" />

          <text x="100" y="185" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace">
            Thoracic Spinal Opening
          </text>
        </svg>
      );
    }

    case 'seated_spinal_twist': {
      const twist = sin * 20;
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <rect x="75" y="130" width="50" height="50" fill="#1e293b" stroke="#334155" strokeWidth="2" rx="4" />
          
          {/* Spiral rotation helix */}
          <path d="M 80 120 Q 100 100 120 120 Q 100 140 80 120" fill="none" stroke="#14b8a6" strokeDasharray="3 3" />

          {/* Rotating Torso & Arms */}
          <g transform={`rotate(${twist} 100 100)`}>
            <ellipse cx="100" cy="100" rx="35" ry="18" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2.5" />
            <circle cx="100" cy="55" r="20" fill="#115e59" stroke="#5eead4" strokeWidth="2" />
          </g>

          <text x="100" y="185" textAnchor="middle" fill="#2dd4bf" fontSize="11" fontFamily="monospace">
            Axial Spinal Rotation
          </text>
        </svg>
      );
    }

    case 'wrist_flexor':
    case 'wrist_extensor': {
      const bend = sin * 25;
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Forearm */}
          <rect x="25" y="90" width="80" height="20" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          
          {/* Hand flexing */}
          <g transform={`rotate(${bend} 105 100)`}>
            <rect x="105" y="92" width="45" height="16" rx="4" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" />
            <rect x="150" y="94" width="20" height="12" rx="3" fill="#14b8a6" />
          </g>

          {/* Carpal decompression glow */}
          <circle cx="105" cy="100" r={8 + pulse * 6} fill="none" stroke="#2dd4bf" strokeOpacity={0.5 * (1 - pulse)} strokeWidth="2" />

          <text x="100" y="165" textAnchor="middle" fill="#2dd4bf" fontSize="11" fontFamily="monospace">
            Carpal Decompression
          </text>
        </svg>
      );
    }

    case 'wrist_circles': {
      const wx = Math.cos(phase * 1.5) * 14;
      const wy = Math.sin(phase * 1.5) * 14;
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Orbital path */}
          <circle cx="100" cy="95" r="14" fill="none" stroke="#334155" strokeDasharray="3 3" />
          
          {/* Hands clasp */}
          <circle cx={100 + wx} cy={95 + wy} r="22" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2.5" />
          <circle cx={100 - wx * 0.5} cy={95 - wy * 0.5} r="16" fill="#115e59" stroke="#5eead4" strokeWidth="2" />

          <text x="100" y="170" textAnchor="middle" fill="#2dd4bf" fontSize="11" fontFamily="monospace">
            Synovial Joint Fluid Circulation
          </text>
        </svg>
      );
    }

    case 'seated_march':
    case 'seated_leg_extension':
    case 'calf_raises': {
      const legLift = (sin + 1) * 14;
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Chair */}
          <path d="M 60 70 L 60 140 L 120 140 L 120 190 M 60 140 L 60 190" fill="none" stroke="#475569" strokeWidth="3" />
          
          {/* Torso */}
          <rect x="50" y="70" width="22" height="70" rx="4" fill="#0f766e" />
          <circle cx="61" cy="50" r="16" fill="#115e59" stroke="#2dd4bf" strokeWidth="2" />

          {/* Stationary Leg */}
          <path d="M 72 135 L 120 135 L 120 185" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

          {/* Active Pumping Leg */}
          <path d={`M 72 135 L 120 ${135 - legLift * 0.5} L ${120 + legLift} ${185 - legLift}`} fill="none" stroke="#14b8a6" strokeWidth="6" strokeLinecap="round" />

          {/* Circulation pulse upward */}
          <path d={`M 130 170 L 130 140`} stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />

          <text x="100" y="185" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace">
            Venous Muscle Pump
          </text>
        </svg>
      );
    }

    case 'seated_upper_back': {
      const spread = (sin + 1) * 10;
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="50" r="20" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" />
          <path d="M 60 110 Q 100 90 140 110 L 130 180 L 70 180 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          
          {/* Clasped forward arms */}
          <path d={`M 70 110 Q ${100 + spread} 70 130 110`} fill="none" stroke="#14b8a6" strokeWidth="8" strokeLinecap="round" />
          
          {/* Upper back stretch aura */}
          <path d="M 80 130 Q 100 115 120 130" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="3 3" />
          <text x="100" y="185" textAnchor="middle" fill="#2dd4bf" fontSize="11" fontFamily="monospace">
            Upper Back & Rhomboid Clasp
          </text>
        </svg>
      );
    }

    case 'ankle_circles': {
      const ax = Math.cos(phase * 2) * 12;
      const ay = Math.sin(phase * 2) * 12;
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Leg bone */}
          <line x1="100" y1="40" x2="100" y2="120" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
          <circle cx="100" cy="120" r="10" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" />
          
          {/* Foot rotating in circular trajectory */}
          <ellipse cx="100" cy="145" rx="14" ry="14" fill="none" stroke="#334155" strokeDasharray="3 3" />
          <ellipse cx={100 + ax} cy={145 + ay} rx="16" ry="8" fill="#14b8a6" stroke="#5eead4" strokeWidth="2" />
          
          <text x="100" y="185" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace">
            Ankle Articulation
          </text>
        </svg>
      );
    }

    case 'overhead_arm_reach': {
      const reachSway = sin * 8;
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Torso */}
          <path d="M 75 140 L 80 90 L 120 90 L 125 140 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          <circle cx="100" cy="80" r="16" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" />
          
          {/* Overhead reaching arms */}
          <path d={`M 80 90 L ${75 + reachSway} 35 M 120 90 L ${125 + reachSway} 35`} stroke="#14b8a6" strokeWidth="6" strokeLinecap="round" />
          <circle cx={100 + reachSway} cy="30" r="8" fill="#38bdf8" />
          
          <text x="100" y="185" textAnchor="middle" fill="#5eead4" fontSize="11" fontFamily="monospace">
            Full-Body Spinal Lengthening
          </text>
        </svg>
      );
    }

    case 'mobility_reset': {
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r={45 + pulse * 12} fill="none" stroke="#14b8a6" strokeOpacity={0.3 * (1 - pulse)} strokeWidth="2" />
          <circle cx="100" cy="100" r="36" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2.5" />
          <path d={`M 70 100 Q 100 ${90 - sin * 18} 130 100`} fill="none" stroke="#ccfbf1" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="65" r="14" fill="#115e59" stroke="#5eead4" strokeWidth="2" />
          <text x="100" y="180" textAnchor="middle" fill="#2dd4bf" fontSize="11" fontFamily="monospace">
            Comprehensive 90s Reset
          </text>
        </svg>
      );
    }

    case 'distance_focus': {
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Horizon grid line */}
          <line x1="20" y1="110" x2="180" y2="110" stroke="#334155" strokeWidth="1.5" />
          
          {/* Distant Mountain / Horizon */}
          <path d="M 30 110 L 70 75 L 110 110 L 150 65 L 180 110 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />

          {/* Distant Focus Star / Light */}
          <circle cx="150" cy="65" r="4" fill="#38bdf8" />
          <circle cx="150" cy="65" r={8 + pulse * 12} fill="none" stroke="#38bdf8" strokeOpacity={0.6 * (1 - pulse)} strokeWidth="1.5" />

          {/* Gaze optic ray from close to far */}
          <path d="M 50 160 L 150 65" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="5 3" strokeOpacity="0.8" />

          {/* Eye icon */}
          <circle cx="50" cy="160" r="10" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" />
          <circle cx="50" cy="160" r="4" fill="#ccfbf1" />

          <text x="100" y="185" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace">
            20-20-20 Distance Relaxation
          </text>
        </svg>
      );
    }

    case 'blink_reset': {
      // Eyelid opening and closing
      const eyelid = (Math.sin(phase * 2) + 1) * 8; // 0 to 16
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Eye Outline */}
          <path d="M 40 100 Q 100 50 160 100 Q 100 150 40 100 Z" fill="#0f172a" stroke="#2dd4bf" strokeWidth="2.5" />
          
          {/* Iris & Pupil */}
          <circle cx="100" cy="100" r="22" fill="#0f766e" stroke="#14b8a6" strokeWidth="2" />
          <circle cx="100" cy="100" r="10" fill="#082f49" />
          <circle cx="95" cy="95" r="3.5" fill="#ccfbf1" />

          {/* Upper Eyelid closing down */}
          <path d={`M 40 100 Q 100 ${60 + eyelid * 2.5} 160 100 Q 100 50 40 100 Z`} fill="#0f172a" />

          {/* Tear film moisture glow */}
          <path d="M 45 102 Q 100 145 155 102" fill="none" stroke="#38bdf8" strokeWidth="2" strokeOpacity={0.7} />

          <text x="100" y="175" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace">
            Corneal Tear Film Refresh
          </text>
        </svg>
      );
    }

    case 'palming_relaxation': {
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Dark soothing void */}
          <circle cx="100" cy="95" r="55" fill="#020617" stroke="#1e293b" strokeWidth="2" />
          
          {/* Gentle infrared warmth waves */}
          <circle cx="75" cy="95" r={16 + pulse * 10} fill="none" stroke="#f59e0b" strokeOpacity={0.4 * (1 - pulse)} strokeWidth="2" />
          <circle cx="125" cy="95" r={16 + pulse * 10} fill="none" stroke="#f59e0b" strokeOpacity={0.4 * (1 - pulse)} strokeWidth="2" />

          {/* Cupped hands */}
          <path d="M 50 135 Q 75 70 85 95 Q 75 130 50 135 Z" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" />
          <path d="M 150 135 Q 125 70 115 95 Q 125 130 150 135 Z" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" />

          <text x="100" y="180" textAnchor="middle" fill="#f59e0b" fontSize="11" fontFamily="monospace">
            Thermal Photoreceptor Rest
          </text>
        </svg>
      );
    }

    default: {
      // Default dynamic ergonomic wave
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r={40 + pulse * 15} fill="none" stroke="#14b8a6" strokeOpacity={0.4 * (1 - pulse)} strokeWidth="2" />
          <circle cx="100" cy="100" r="32" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2.5" />
          <path d={`M 75 100 Q 100 ${100 - sin * 15} 125 100`} fill="none" stroke="#ccfbf1" strokeWidth="3" strokeLinecap="round" />
          <text x="100" y="175" textAnchor="middle" fill="#2dd4bf" fontSize="11" fontFamily="monospace">
            Active Ergonomic Flow
          </text>
        </svg>
      );
    }
  }
}
