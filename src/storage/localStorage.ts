import { AppSettings, CalibrationBaseline } from '../types';

const SETTINGS_KEY = 'ergosense_settings_v1';
const CALIBRATION_KEY = 'ergosense_calibration_v1';
const RECENT_ACTIONS_KEY = 'ergosense_recent_actions_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  monitoringEnabled: true,
  selectedCameraId: '',
  detectionSensitivity: 'normal',
  inferenceThrottleFps: 15,
  
  stationaryWarningThresholdMin: 30, // 30 mins
  postureWarningThresholdSec: 20, // sustained 20 seconds
  breakAwayThresholdSec: 30, // 30 seconds away constitutes break
  
  soundEnabled: true,
  browserNotificationsEnabled: false,
  
  hydrationIntervalMin: 45,
  hydrationEnabled: true,
  
  visualBreakIntervalMin: 40,
  
  preferredExerciseDurationSec: 45,
  seatedOnlyMode: true,
  
  focusMode: false,
  demoMode: false,
  theme: 'dark',
  
  historyRetentionHours: 24
};

export const DEFAULT_CALIBRATION: CalibrationBaseline = {
  baselineForwardHead: 15, // deg
  baselineShoulderSlope: 0,
  baselineTorsoLean: 0,
  baselineNoseToShoulderDist: 0.22,
  calibratedAt: null,
  isCalibrated: false
};

export interface RecentActionRecord {
  exerciseId: string;
  action: 'COMPLETED' | 'SNOOZED' | 'DISMISSED';
  timestamp: number;
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function loadCalibration(): CalibrationBaseline {
  try {
    const raw = localStorage.getItem(CALIBRATION_KEY);
    if (!raw) return DEFAULT_CALIBRATION;
    return { ...DEFAULT_CALIBRATION, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CALIBRATION;
  }
}

export function saveCalibration(calibration: CalibrationBaseline): void {
  try {
    localStorage.setItem(CALIBRATION_KEY, JSON.stringify(calibration));
  } catch (e) {
    console.error('Failed to save calibration', e);
  }
}

export function clearCalibration(): void {
  try {
    localStorage.removeItem(CALIBRATION_KEY);
  } catch (e) {
    console.error('Failed to clear calibration', e);
  }
}

export function getRecentActions(): RecentActionRecord[] {
  try {
    const raw = localStorage.getItem(RECENT_ACTIONS_KEY);
    if (!raw) return [];
    const list: RecentActionRecord[] = JSON.parse(raw);
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return list.filter(item => item.timestamp > oneHourAgo);
  } catch {
    return [];
  }
}

export function recordRecentAction(exerciseId: string, action: 'COMPLETED' | 'SNOOZED' | 'DISMISSED'): void {
  try {
    const existing = getRecentActions();
    existing.push({ exerciseId, action, timestamp: Date.now() });
    localStorage.setItem(RECENT_ACTIONS_KEY, JSON.stringify(existing.slice(-50)));
  } catch (e) {
    console.error('Failed to record action', e);
  }
}

export function resetAllStorage(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(CALIBRATION_KEY);
    localStorage.removeItem(RECENT_ACTIONS_KEY);
  } catch (e) {
    console.error('Failed to reset storage', e);
  }
}
