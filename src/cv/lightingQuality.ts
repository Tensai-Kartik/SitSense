import { CameraQualityMetrics, Landmark3D } from '../types';

export class LightingQualityChecker {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 32;
      this.canvas.height = 32;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }
  }

  public check(video: HTMLVideoElement | null, landmarks: Landmark3D[] | null): CameraQualityMetrics {
    let luminance = 120;
    let lightingState: 'GOOD' | 'LOW_LIGHT' | 'OVEREXPOSED' = 'GOOD';
    const warnings: string[] = [];

    if (video && this.ctx && this.canvas && video.readyState >= 2) {
      try {
        this.ctx.drawImage(video, 0, 0, 32, 32);
        const imgData = this.ctx.getImageData(0, 0, 32, 32);
        const data = imgData.data;
        let sumLuminance = 0;
        const totalPixels = 32 * 32;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // ITU-R BT.601 luminance formula
          sumLuminance += 0.299 * r + 0.587 * g + 0.114 * b;
        }

        luminance = Math.round(sumLuminance / totalPixels);

        if (luminance < 40) {
          lightingState = 'LOW_LIGHT';
          warnings.push('Lighting appears low. Move toward a brighter area for optimal tracking.');
        } else if (luminance > 235) {
          lightingState = 'OVEREXPOSED';
          warnings.push('High glare or overexposure detected on camera.');
        }
      } catch {
        // cross-origin or canvas read fallback
      }
    }

    // Framing checks from landmarks
    let framingScore = 1.0;
    let isFramingGood = true;

    if (landmarks && landmarks.length > 12) {
      const nose = landmarks[0];
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];

      // Check if head is cut off at the top
      if (nose.y < 0.05) {
        framingScore -= 0.3;
        warnings.push('Head is near upper edge. Tilt camera slightly upward.');
      }

      // Check if shoulders are cut off at sides
      if (leftShoulder.x > 0.95 || rightShoulder.x < 0.05) {
        framingScore -= 0.3;
        warnings.push('Shoulders extend past frame edge. Move slightly backward.');
      }

      // Check if user is too far away
      const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
      if (shoulderWidth < 0.12) {
        framingScore -= 0.2;
        warnings.push('You are far from camera. Move closer for accurate posture tracking.');
      }

      isFramingGood = framingScore >= 0.7;
    }

    return {
      lightingState,
      luminance,
      framingScore: Math.max(0, Number(framingScore.toFixed(2))),
      isFramingGood,
      warnings
    };
  }
}
