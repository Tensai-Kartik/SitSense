export type PostureState = 'GOOD' | 'ATTENTION' | 'POOR';
export type MovementState = 'ACTIVE' | 'LOW' | 'STATIONARY';
export type HumanPresenceState = 'DETECTED' | 'MULTIPLE' | 'UNCERTAIN' | 'AWAY';
export type BreakStatus = 'NONE' | 'DUE' | 'RECOMMENDED' | 'ACTIVE';
export type BreakQuality = 'MICRO' | 'SHORT' | 'EXTENDED';
export type WorkSessionState = 'ACTIVE' | 'IDLE' | 'AWAY' | 'PAUSED';

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PostureMetrics {
  forwardHeadAngle: number; // degrees deviation from vertical
  headTiltAngle: number; // lateral tilt degrees
  shoulderSlopeAngle: number; // shoulder imbalance degrees
  torsoLeanAngle: number; // spine/torso lateral lean degrees
  slouchScore: number; // 0 to 1
  rawForwardHeadDelta: number;
  rawShoulderDelta: number;
  isCalibrated: boolean;
}

export interface CalibrationBaseline {
  baselineForwardHead: number;
  baselineShoulderSlope: number;
  baselineTorsoLean: number;
  baselineNoseToShoulderDist: number;
  calibratedAt: string | null;
  isCalibrated: boolean;
}

export interface MovementMetrics {
  score: number; // 0 (still) to 1 (high movement)
  state: MovementState;
  stationaryDurationSec: number;
  lastActiveTimestamp: number;
  temporalVariance: number;
}

export interface LivenessMetrics {
  confidence: number; // 0 to 1
  status: 'HIGH' | 'MEDIUM' | 'UNCERTAIN' | 'STATIC_WARNING';
  microJitterScore: number;
  landmarkCount: number;
  personCount: number;
}

export interface CameraQualityMetrics {
  lightingState: 'GOOD' | 'LOW_LIGHT' | 'OVEREXPOSED';
  luminance: number; // 0 to 255
  framingScore: number; // 0 to 1
  isFramingGood: boolean;
  warnings: string[];
}

export interface LiveCVMetrics {
  presence: HumanPresenceState;
  postureState: PostureState;
  posture: PostureMetrics;
  movement: MovementMetrics;
  liveness: LivenessMetrics;
  cameraQuality: CameraQualityMetrics;
  landmarks: Landmark3D[] | null;
  inferenceFps: number;
  cameraFps: number;
  timestamp: number;
}

export interface SessionMetrics {
  sessionId: string;
  startTime: number;
  workDurationSec: number;
  stationaryDurationSec: number;
  continuousScreenSec: number;
  totalScreenSec: number;
  breaksCount: number;
  totalBreakSec: number;
  postureWarningsCount: number;
  exercisesCompletedCount: number;
  hydrationConfirmedCount: number;
  visualBreaksCount: number;
  currentWorkState: WorkSessionState;
}

export type ExerciseCategory = 
  | 'neck' 
  | 'shoulders' 
  | 'upper_back' 
  | 'wrists' 
  | 'legs' 
  | 'mobility' 
  | 'visual';

export type ExerciseDifficulty = 'Easy' | 'Medium';

export interface ExerciseItem {
  id: string;
  name: string;
  category: ExerciseCategory;
  durationSec: number;
  difficulty: ExerciseDifficulty;
  targetArea: string;
  description: string;
  instructions: string[];
  recommendedConditions: string[];
  seatedOnly: boolean;
  benefits: string[];
  animationType: string;
}

export interface Recommendation {
  id: string;
  exerciseId: string;
  title: string;
  category: ExerciseCategory;
  targetArea: string;
  durationSec: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number; // 0 to 1
  reason: string;
  detailedWhy: string[];
  conditionsMatched: string[];
  createdAt: number;
  status: 'PENDING' | 'ACCEPTED' | 'SNOOZED' | 'DISMISSED';
}

export interface BreakEvent {
  id: string;
  startTime: number;
  endTime: number;
  durationSec: number;
  quality: BreakQuality;
  type: 'NATURAL_AWAY' | 'EXERCISE_BREAK' | 'VISUAL_BREAK';
}

export interface AnalyticsDataPoint {
  timestamp: number;
  postureState: PostureState;
  postureScore: number; // 100 for good, 50 for attention, 0 for poor
  movementScore: number;
  isStationary: boolean;
  isUserPresent: boolean;
  screenExposureMin: number;
}

export interface HistoricalSessionRecord {
  id: string;
  date: string; // ISO date string
  durationSec: number;
  postureQualityPercent: number; // % time good
  breaksCount: number;
  exercisesCompleted: number;
  hydrationCount: number;
  stationaryTimeSec: number;
}

export interface AppSettings {
  monitoringEnabled: boolean;
  selectedCameraId: string;
  detectionSensitivity: 'low' | 'normal' | 'high';
  inferenceThrottleFps: number; // e.g. 10 - 20 fps
  
  stationaryWarningThresholdMin: number; // default 30
  postureWarningThresholdSec: number; // default 20 sec sustained
  breakAwayThresholdSec: number; // default 30 sec
  
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  
  hydrationIntervalMin: number; // 30, 45, 60, 90
  hydrationEnabled: boolean;
  
  visualBreakIntervalMin: number; // default 45 min
  
  preferredExerciseDurationSec: number; // 30, 60, 90, 120
  seatedOnlyMode: boolean;
  
  focusMode: boolean;
  demoMode: boolean;
  theme: 'dark' | 'light';
  
  historyRetentionHours: number; // default 24
}
