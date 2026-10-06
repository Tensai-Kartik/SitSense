import { Landmark3D, MovementMetrics, MovementState } from '../types';
import { calculateDistance } from './postureAnalysis';

export class MovementTracker {
  private prevLandmarks: Landmark3D[] | null = null;
  private stationaryStartTime: number | null = null;
  private lastActiveTimestamp: number = Date.now();
  private recentScores: number[] = [];
  private maxHistory = 30; // ~2 seconds of frames

  public process(landmarks: Landmark3D[] | null, isPersonDetected: boolean): MovementMetrics {
    const now = Date.now();

    if (!isPersonDetected || !landmarks || landmarks.length < 15) {
      this.prevLandmarks = null;
      return {
        score: 0,
        state: 'STATIONARY',
        stationaryDurationSec: this.stationaryStartTime ? Math.floor((now - this.stationaryStartTime) / 1000) : 0,
        lastActiveTimestamp: this.lastActiveTimestamp,
        temporalVariance: 0
      };
    }

    if (!this.prevLandmarks) {
      this.prevLandmarks = landmarks;
      if (!this.stationaryStartTime) this.stationaryStartTime = now;
      return {
        score: 0,
        state: 'STATIONARY',
        stationaryDurationSec: 0,
        lastActiveTimestamp: this.lastActiveTimestamp,
        temporalVariance: 0
      };
    }

    // Key tracking indices: Nose (0), Left/Right Shoulder (11, 12), Left/Right Elbow (13, 14), Left/Right Wrist (15, 16)
    const trackedIndices = [0, 11, 12, 13, 14, 15, 16];
    const shoulderWidth = calculateDistance(landmarks[11], landmarks[12]) || 0.3;

    let totalDisplacement = 0;
    let count = 0;

    for (const idx of trackedIndices) {
      if (landmarks[idx] && this.prevLandmarks[idx]) {
        const d = calculateDistance(landmarks[idx], this.prevLandmarks[idx]);
        totalDisplacement += d;
        count++;
      }
    }

    const rawScore = count > 0 ? (totalDisplacement / count) / shoulderWidth : 0;
    // Map to 0-1 scale
    const normalizedScore = Math.min(1, Math.max(0, rawScore * 8));

    this.recentScores.push(normalizedScore);
    if (this.recentScores.length > this.maxHistory) {
      this.recentScores.shift();
    }

    // Compute rolling average and variance
    const avgScore = this.recentScores.reduce((a, b) => a + b, 0) / this.recentScores.length;
    const variance = this.recentScores.reduce((acc, val) => acc + Math.pow(val - avgScore, 2), 0) / this.recentScores.length;

    // Movement state classification
    let state: MovementState = 'STATIONARY';
    if (avgScore > 0.12) {
      state = 'ACTIVE';
      this.lastActiveTimestamp = now;
      this.stationaryStartTime = null;
    } else if (avgScore > 0.035) {
      state = 'LOW';
      // Low movement still counts toward stationary duration if uninterrupted
      if (!this.stationaryStartTime) this.stationaryStartTime = now;
    } else {
      state = 'STATIONARY';
      if (!this.stationaryStartTime) this.stationaryStartTime = now;
    }

    const stationaryDurationSec = this.stationaryStartTime ? Math.floor((now - this.stationaryStartTime) / 1000) : 0;

    this.prevLandmarks = landmarks;

    return {
      score: Number(avgScore.toFixed(3)),
      state,
      stationaryDurationSec,
      lastActiveTimestamp: this.lastActiveTimestamp,
      temporalVariance: Number(variance.toFixed(5))
    };
  }

  public resetStationaryTimer(): void {
    this.stationaryStartTime = Date.now();
    this.lastActiveTimestamp = Date.now();
  }

  public setStationaryDuration(seconds: number): void {
    this.stationaryStartTime = Date.now() - seconds * 1000;
  }
}
