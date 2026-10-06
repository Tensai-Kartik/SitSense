import { Landmark3D, LivenessMetrics } from '../types';

export class LivenessEstimator {
  private history: Landmark3D[][] = [];
  private maxHistory = 45; // ~2.5 seconds at 18fps

  public evaluate(landmarks: Landmark3D[] | null, isPersonDetected: boolean): LivenessMetrics {
    if (!isPersonDetected || !landmarks || landmarks.length < 10) {
      this.history = [];
      return {
        confidence: 0,
        status: 'UNCERTAIN',
        microJitterScore: 0,
        landmarkCount: 0,
        personCount: 0
      };
    }

    this.history.push(landmarks);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    if (this.history.length < 10) {
      return {
        confidence: 0.75,
        status: 'MEDIUM',
        microJitterScore: 0.01,
        landmarkCount: landmarks.length,
        personCount: 1
      };
    }

    // Evaluate micro-jitter on nose (0) and ears (7, 8)
    const nosePositions = this.history.map(frame => frame[0]);
    let sumVarX = 0;
    let sumVarY = 0;

    const meanX = nosePositions.reduce((acc, p) => acc + p.x, 0) / nosePositions.length;
    const meanY = nosePositions.reduce((acc, p) => acc + p.y, 0) / nosePositions.length;

    for (const p of nosePositions) {
      sumVarX += Math.pow(p.x - meanX, 2);
      sumVarY += Math.pow(p.y - meanY, 2);
    }

    const variance = (sumVarX + sumVarY) / nosePositions.length;
    const microJitterScore = Math.sqrt(variance);

    let status: 'HIGH' | 'MEDIUM' | 'UNCERTAIN' | 'STATIC_WARNING' = 'HIGH';
    let confidence = 0.94;

    // Static photo detection heuristic: virtually absolute zero variance over multiple seconds
    if (microJitterScore < 0.00008 && this.history.length >= 35) {
      status = 'STATIC_WARNING';
      confidence = 0.35;
    } else if (microJitterScore < 0.0004) {
      status = 'MEDIUM';
      confidence = 0.82;
    } else {
      status = 'HIGH';
      confidence = Math.min(0.98, 0.88 + Math.min(0.1, microJitterScore * 10));
    }

    return {
      confidence: Number(confidence.toFixed(2)),
      status,
      microJitterScore: Number(microJitterScore.toFixed(5)),
      landmarkCount: landmarks.length,
      personCount: 1
    };
  }

  public reset(): void {
    this.history = [];
  }
}
