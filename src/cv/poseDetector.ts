import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { Landmark3D } from '../types';

export interface DetectionResult {
  landmarks: Landmark3D[] | null;
  personCount: number;
  rawPosesCount: number;
  inferenceTimeMs: number;
}

export class PoseEngine {
  private landmarker: PoseLandmarker | null = null;
  private isInitializing = false;
  private isReady = false;
  private initError: string | null = null;
  private lastVideoTime = -1;

  public async initialize(): Promise<boolean> {
    if (this.isReady && this.landmarker) return true;
    if (this.isInitializing) return false;

    this.isInitializing = true;
    this.initError = null;

    try {
      // Load wasm assets from CDN for zero-bundling issues
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );

      this.landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 2, // Allow detecting multiple people to trigger alert
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isReady = true;
      this.isInitializing = false;
      return true;
    } catch (err: any) {
      console.warn('GPU Pose initialization failed, trying CPU fallback...', err);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        );
        this.landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 2,
        });
        this.isReady = true;
        this.isInitializing = false;
        return true;
      } catch (fallbackErr: any) {
        console.error('MediaPipe PoseLandmarker could not be initialized', fallbackErr);
        this.initError = fallbackErr?.message || 'Model loading error';
        this.isInitializing = false;
        this.isReady = false;
        return false;
      }
    }
  }

  public detect(video: HTMLVideoElement): DetectionResult {
    const startTime = performance.now();

    if (!this.isReady || !this.landmarker || video.readyState < 2) {
      return {
        landmarks: null,
        personCount: 0,
        rawPosesCount: 0,
        inferenceTimeMs: 0
      };
    }

    try {
      const currentTime = video.currentTime;
      if (currentTime === this.lastVideoTime) {
        return {
          landmarks: null,
          personCount: 0,
          rawPosesCount: 0,
          inferenceTimeMs: 0
        };
      }
      this.lastVideoTime = currentTime;

      const result = this.landmarker.detectForVideo(video, performance.now());
      const inferenceTimeMs = performance.now() - startTime;

      if (!result.landmarks || result.landmarks.length === 0) {
        return {
          landmarks: null,
          personCount: 0,
          rawPosesCount: 0,
          inferenceTimeMs
        };
      }

      const numPeople = result.landmarks.length;
      // Get primary person's landmarks
      const primaryLandmarks: Landmark3D[] = result.landmarks[0].map(lm => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility ?? 1.0
      }));

      return {
        landmarks: primaryLandmarks,
        personCount: numPeople,
        rawPosesCount: numPeople,
        inferenceTimeMs
      };
    } catch (e) {
      console.warn('Frame detection error', e);
      return {
        landmarks: null,
        personCount: 0,
        rawPosesCount: 0,
        inferenceTimeMs: performance.now() - startTime
      };
    }
  }

  public getStatus(): { isReady: boolean; isInitializing: boolean; error: string | null } {
    return {
      isReady: this.isReady,
      isInitializing: this.isInitializing,
      error: this.initError
    };
  }

  public close(): void {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch {
        // cleanup
      }
      this.landmarker = null;
      this.isReady = false;
    }
  }
}
