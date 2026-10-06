import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AppSettings, 
  CalibrationBaseline, 
  CameraQualityMetrics, 
  ExerciseItem, 
  HumanPresenceState, 
  Landmark3D, 
  LiveCVMetrics, 
  MovementMetrics, 
  MovementState, 
  PostureMetrics, 
  PostureState, 
  Recommendation, 
  SessionMetrics 
} from '../types';
import { DEFAULT_SETTINGS, DEFAULT_CALIBRATION, loadSettings, saveSettings, loadCalibration, saveCalibration, recordRecentAction } from '../storage/localStorage';
import { logAnalyticsPoint, logBreakEvent, logHistoricalSession, purgeOldRecords } from '../storage/indexedDb';
import { PoseEngine } from '../cv/poseDetector';
import { analyzePosture } from '../cv/postureAnalysis';
import { MovementTracker } from '../cv/movementAnalysis';
import { LivenessEstimator } from '../cv/liveness';
import { LightingQualityChecker } from '../cv/lightingQuality';
import { TemporalBuffer } from '../cv/temporalBuffer';
import { WorkSessionEngine } from '../engine/workSessionEngine';
import { BreakEngine } from '../engine/breakEngine';
import { recommendationEngine, ScoredCandidate } from '../engine/recommendationEngine';
import { soundManager } from '../engine/audioEngine';

export function useMonitoring() {
  // Config & State
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [calibration, setCalibration] = useState<CalibrationBaseline>(loadCalibration);
  
  // Video & Canvas Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Engine Singletons
  const poseEngineRef = useRef<PoseEngine>(new PoseEngine());
  const movementTrackerRef = useRef<MovementTracker>(new MovementTracker());
  const livenessRef = useRef<LivenessEstimator>(new LivenessEstimator());
  const lightingRef = useRef<LightingQualityChecker>(new LightingQualityChecker());
  const temporalBufferRef = useRef<TemporalBuffer>(new TemporalBuffer(45, 3000));
  const workSessionRef = useRef<WorkSessionEngine>(new WorkSessionEngine());
  const breakEngineRef = useRef<BreakEngine>(new BreakEngine(settings.breakAwayThresholdSec));

  // Loop & Tracking refs
  const animFrameIdRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const lastInferenceTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(Date.now());
  const currentFpsRef = useRef<number>(0);
  const snoozeUntilRef = useRef<number>(0);

  // Sustained Posture Alert Tracking
  const poorPostureStartTimeRef = useRef<number | null>(null);
  const lastPostureAlertNotificationRef = useRef<number>(0);
  const [isPostureAlertOpen, setIsPostureAlertOpen] = useState<boolean>(false);

  // Hydration state
  const lastHydrationAlertRef = useRef<number>(Date.now());
  const [isHydrationAlertOpen, setIsHydrationAlertOpen] = useState<boolean>(false);

  // User UI Display States
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isModelReady, setIsModelReady] = useState<boolean>(false);
  const [isCameraInitializing, setIsCameraInitializing] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState<boolean>(true);

  const [liveMetrics, setLiveMetrics] = useState<LiveCVMetrics>({
    presence: 'AWAY',
    postureState: 'GOOD',
    posture: {
      forwardHeadAngle: 0,
      headTiltAngle: 0,
      shoulderSlopeAngle: 0,
      torsoLeanAngle: 0,
      slouchScore: 0,
      rawForwardHeadDelta: 0,
      rawShoulderDelta: 0,
      isCalibrated: false
    },
    movement: {
      score: 0,
      state: 'STATIONARY',
      stationaryDurationSec: 0,
      lastActiveTimestamp: Date.now(),
      temporalVariance: 0
    },
    liveness: {
      confidence: 0,
      status: 'UNCERTAIN',
      microJitterScore: 0,
      landmarkCount: 0,
      personCount: 0
    },
    cameraQuality: {
      lightingState: 'GOOD',
      luminance: 120,
      framingScore: 1,
      isFramingGood: true,
      warnings: []
    },
    landmarks: null,
    inferenceFps: 0,
    cameraFps: 0,
    timestamp: Date.now()
  });

  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics>(() => workSessionRef.current.getMetrics());
  const [primaryRecommendation, setPrimaryRecommendation] = useState<Recommendation | null>(null);
  const [rankedCandidates, setRankedCandidates] = useState<ScoredCandidate[]>(() => recommendationEngine.getFreshStartSuggestions(settings));
  const [multiPersonWarning, setMultiPersonWarning] = useState<boolean>(false);

  // Demo Mode Simulation States
  const [demoPerson, setDemoPerson] = useState<HumanPresenceState>('DETECTED');
  const [demoPosture, setDemoPosture] = useState<PostureState>('ATTENTION');
  const [demoMovement, setDemoMovement] = useState<MovementState>('STATIONARY');
  const [demoStationaryMin, setDemoStationaryMin] = useState<number>(34);
  const [demoScreenMin, setDemoScreenMin] = useState<number>(45);

  // Debug visual toggles
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(true);

  // Active Exercise modal state
  const [activeExercise, setActiveExercise] = useState<ExerciseItem | null>(null);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState<boolean>(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState<boolean>(false);

  // Refs for current values accessible in intervals without triggering effect recreation
  const liveMetricsRef = useRef(liveMetrics);
  liveMetricsRef.current = liveMetrics;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const calibrationRef = useRef(calibration);
  calibrationRef.current = calibration;

  const isCameraActiveRef = useRef(isCameraActive);
  isCameraActiveRef.current = isCameraActive;

  const showSkeletonRef = useRef(showSkeleton);
  showSkeletonRef.current = showSkeleton;

  const showBoundingBoxRef = useRef(showBoundingBox);
  showBoundingBoxRef.current = showBoundingBox;

  // Keep sound mute state synced
  useEffect(() => {
    soundManager.setMuted(!settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Save settings when modified
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Save calibration
  const updateCalibration = useCallback((newBaseline: CalibrationBaseline) => {
    setCalibration(newBaseline);
    saveCalibration(newBaseline);
  }, []);

  // Break callback
  useEffect(() => {
    breakEngineRef.current.setBreakCompletedCallback((breakEvent) => {
      workSessionRef.current.recordBreak(breakEvent.durationSec);
      logBreakEvent(breakEvent);
      if (settingsRef.current.soundEnabled) soundManager.playReminderChime();
    });
  }, []);

  // Initialize MediaPipe Pose Engine
  useEffect(() => {
    let isMounted = true;
    poseEngineRef.current.initialize().then((ready) => {
      if (isMounted) {
        setIsModelReady(ready);
      }
    });

    // Auto purge old DB records on boot
    purgeOldRecords(settings.historyRetentionHours * 60 * 60 * 1000);

    return () => {
      isMounted = false;
    };
  }, [settings.historyRetentionHours]);

  // Start Camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsCameraInitializing(true);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 },
          deviceId: settings.selectedCameraId ? { exact: settings.selectedCameraId } : undefined
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Ensure model is ready
      await poseEngineRef.current.initialize();

      setIsCameraActive(true);
      setIsCameraInitializing(false);
      setIsPermissionModalOpen(false);
      if (settingsRef.current.soundEnabled) {
        soundManager.playReminderChime();
      }
    } catch (err: any) {
      console.error('Camera access error', err);
      const msg = err?.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access in browser site settings.' 
        : err?.message || 'Could not access camera device.';
      setCameraError(msg);
      setIsCameraActive(false);
      setIsCameraInitializing(false);
    }
  }, [settings.selectedCameraId]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Ensure stream stays bound to video ref
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isCameraActive]);

  // 1-Second Continuous Work Session Clock & Hydration Interval
  useEffect(() => {
    let lastLogTime = Date.now();

    const secondTimer = setInterval(() => {
      const currentLive = liveMetricsRef.current;
      const currentSettings = settingsRef.current;
      const isDemo = currentSettings.demoMode;
      const isPresent = isDemo ? currentLive.presence === 'DETECTED' : isCameraActiveRef.current ? currentLive.presence === 'DETECTED' : true;
      const isStationary = currentLive.movement.state === 'STATIONARY' || currentLive.movement.state === 'LOW';

      workSessionRef.current.tick(isPresent, isStationary);
      const updatedMetrics = { ...workSessionRef.current.getMetrics() };
      setSessionMetrics(updatedMetrics);

      // Hydration interval check
      if (currentSettings.hydrationEnabled && isPresent) {
        const intervalMs = currentSettings.hydrationIntervalMin * 60 * 1000;
        if (Date.now() - lastHydrationAlertRef.current >= intervalMs) {
          setIsHydrationAlertOpen(true);
          soundManager.playHydrationDroplet();
          lastHydrationAlertRef.current = Date.now();
        }
      }

      // Log to IndexedDB every 5 seconds
      if (Date.now() - lastLogTime >= 5000) {
        lastLogTime = Date.now();
        logAnalyticsPoint({
          timestamp: Date.now(),
          postureState: currentLive.postureState,
          postureScore: currentLive.postureState === 'GOOD' ? 100 : currentLive.postureState === 'ATTENTION' ? 50 : 0,
          movementScore: currentLive.movement.score,
          isStationary: currentLive.movement.state === 'STATIONARY',
          isUserPresent: isPresent,
          screenExposureMin: Number((updatedMetrics.continuousScreenSec / 60).toFixed(1))
        });
      }
    }, 1000);

    return () => {
      clearInterval(secondTimer);
    };
  }, []);

  // Main Processing & Animation Frame Loop
  useEffect(() => {
    isRunningRef.current = true;

    const processLoop = () => {
      if (!isRunningRef.current) return;

      const now = Date.now();
      frameCountRef.current++;

      // Compute Camera FPS
      if (now - fpsTimerRef.current >= 1000) {
        currentFpsRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        fpsTimerRef.current = now;
      }

      // If DEMO MODE is active, simulate realistic dynamic posture vectors
      if (settings.demoMode) {
        const simStationarySec = demoStationaryMin * 60;
        const simScreenSec = demoScreenMin * 60;

        let simForwardHead = 12;
        let simShoulderSlope = 1.5;
        let simSlouch = 0.15;

        if (demoPosture === 'ATTENTION') {
          simForwardHead = 24;
          simShoulderSlope = 5.5;
          simSlouch = 0.38;
        } else if (demoPosture === 'POOR') {
          simForwardHead = 32;
          simShoulderSlope = 9.2;
          simSlouch = 0.62;
        }

        const postureMetrics: PostureMetrics = {
          forwardHeadAngle: simForwardHead,
          headTiltAngle: demoPosture === 'POOR' ? 8 : 2,
          shoulderSlopeAngle: simShoulderSlope,
          torsoLeanAngle: demoPosture === 'POOR' ? 9 : 1,
          slouchScore: simSlouch,
          rawForwardHeadDelta: Math.max(0, simForwardHead - calibration.baselineForwardHead),
          rawShoulderDelta: Math.max(0, simShoulderSlope - calibration.baselineShoulderSlope),
          isCalibrated: calibration.isCalibrated
        };

        const movementMetrics: MovementMetrics = {
          score: demoMovement === 'ACTIVE' ? 0.25 : demoMovement === 'LOW' ? 0.05 : 0.01,
          state: demoMovement,
          stationaryDurationSec: simStationarySec,
          lastActiveTimestamp: now - simStationarySec * 1000,
          temporalVariance: 0.002
        };

        const livenessMetrics = {
          confidence: demoPerson === 'DETECTED' ? 0.95 : 0,
          status: (demoPerson === 'DETECTED' ? 'HIGH' : 'UNCERTAIN') as any,
          microJitterScore: 0.008,
          landmarkCount: demoPerson === 'DETECTED' ? 33 : 0,
          personCount: demoPerson === 'DETECTED' ? 1 : demoPerson === 'MULTIPLE' ? 2 : 0
        };

        const cameraQualityMetrics: CameraQualityMetrics = {
          lightingState: 'GOOD',
          luminance: 135,
          framingScore: 1,
          isFramingGood: true,
          warnings: []
        };

        // Generate simulated landmarks for demo mode animation
        const demoLandmarks = demoPerson === 'DETECTED' ? generateSimulatedLandmarks(demoPosture, now) : null;

        const liveCV: LiveCVMetrics = {
          presence: demoPerson,
          postureState: demoPosture,
          posture: postureMetrics,
          movement: movementMetrics,
          liveness: livenessMetrics,
          cameraQuality: cameraQualityMetrics,
          landmarks: demoLandmarks,
          inferenceFps: 24,
          cameraFps: 30,
          timestamp: now
        };

        setLiveMetrics(liveCV);
        setMultiPersonWarning(demoPerson === 'MULTIPLE');

        // Draw demo skeleton on canvas if present
        if (canvasRef.current && videoRef.current) {
          drawSkeletonOverlay(
            canvasRef.current,
            videoRef.current,
            demoLandmarks,
            showSkeletonRef.current,
            showBoundingBoxRef.current,
            demoPosture
          );
        }

        // Evaluate recommendations in demo mode
        const evalResult = recommendationEngine.evaluate(
          demoPosture,
          postureMetrics,
          simStationarySec,
          simScreenSec,
          workSessionRef.current.getMetrics(),
          settings,
          snoozeUntilRef.current
        );

        setPrimaryRecommendation(evalResult.primaryRecommendation);
        setRankedCandidates(evalResult.rankedCandidates);

        animFrameIdRef.current = requestAnimationFrame(processLoop);
        return;
      }

      // LIVE CAMERA PROCESSING
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const targetInterval = 1000 / (settings.inferenceThrottleFps || 15);
      const timeSinceLastInference = now - lastInferenceTimeRef.current;

      if (video && video.readyState >= 2 && timeSinceLastInference >= targetInterval) {
        lastInferenceTimeRef.current = now;

        // Run Pose Inference
        const detection = poseEngineRef.current.detect(video);
        const hasPerson = detection.landmarks !== null && detection.landmarks.length > 0;
        const isMulti = detection.personCount > 1;
        setMultiPersonWarning(isMulti);

        let presenceState: HumanPresenceState = 'AWAY';
        if (isMulti) {
          presenceState = 'MULTIPLE';
        } else if (hasPerson) {
          presenceState = 'DETECTED';
        }

        // Break detection
        const breakState = breakEngineRef.current.processPresence(presenceState);

        // Liveness
        const livenessMetrics = livenessRef.current.evaluate(detection.landmarks, hasPerson);

        // Movement
        const movementMetrics = movementTrackerRef.current.process(detection.landmarks, hasPerson);

        // Lighting & Framing
        const cameraQuality = lightingRef.current.check(video, detection.landmarks);

        // Posture
        let postureMetrics: PostureMetrics;
        let postureState: PostureState = 'GOOD';

        if (hasPerson && detection.landmarks && !isMulti) {
          const analysis = analyzePosture(detection.landmarks, calibrationRef.current);
          postureMetrics = analysis.metrics;

          // Push to temporal buffer for smoothing
          temporalBufferRef.current.push({
            timestamp: now,
            forwardHeadAngle: postureMetrics.forwardHeadAngle,
            headTiltAngle: postureMetrics.headTiltAngle,
            shoulderSlopeAngle: postureMetrics.shoulderSlopeAngle,
            torsoLeanAngle: postureMetrics.torsoLeanAngle,
            slouchScore: postureMetrics.slouchScore,
            movementDisplacement: movementMetrics.score,
            isPersonPresent: true
          });

          postureState = analysis.state;

          // Check for sustained poor posture
          if (postureState === 'POOR') {
            if (!poorPostureStartTimeRef.current) {
              poorPostureStartTimeRef.current = now;
            } else if (now - poorPostureStartTimeRef.current >= settings.postureWarningThresholdSec * 1000) {
              workSessionRef.current.recordPostureWarning();
              if (now - lastPostureAlertNotificationRef.current >= 45000 && !settings.focusMode) {
                setIsPostureAlertOpen(true);
                if (settings.soundEnabled) soundManager.playReminderChime();
                lastPostureAlertNotificationRef.current = now;
              }
            }
          } else {
            poorPostureStartTimeRef.current = null;
          }
        } else {
          poorPostureStartTimeRef.current = null;
          postureMetrics = {
            forwardHeadAngle: 0,
            headTiltAngle: 0,
            shoulderSlopeAngle: 0,
            torsoLeanAngle: 0,
            slouchScore: 0,
            rawForwardHeadDelta: 0,
            rawShoulderDelta: 0,
            isCalibrated: calibrationRef.current.isCalibrated
          };
        }

        // Draw Skeleton overlay on Canvas
        if (canvas && video) {
          drawSkeletonOverlay(
            canvas,
            video,
            detection.landmarks,
            showSkeletonRef.current,
            showBoundingBoxRef.current,
            postureState
          );
        }

        // Inference FPS
        const inferenceFps = detection.inferenceTimeMs > 0 ? Math.round(1000 / detection.inferenceTimeMs) : 0;

        setLiveMetrics({
          presence: presenceState,
          postureState,
          posture: postureMetrics,
          movement: movementMetrics,
          liveness: livenessMetrics,
          cameraQuality,
          landmarks: detection.landmarks,
          inferenceFps: Math.min(settings.inferenceThrottleFps, inferenceFps),
          cameraFps: currentFpsRef.current,
          timestamp: now
        });

        // Evaluate Recommendations
        if (!isMulti && presenceState === 'DETECTED') {
          const evalResult = recommendationEngine.evaluate(
            postureState,
            postureMetrics,
            movementMetrics.stationaryDurationSec,
            workSessionRef.current.getMetrics().continuousScreenSec,
            workSessionRef.current.getMetrics(),
            settings,
            snoozeUntilRef.current
          );

          setPrimaryRecommendation(evalResult.primaryRecommendation);
          setRankedCandidates(evalResult.rankedCandidates);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(processLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(processLoop);

    return () => {
      isRunningRef.current = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [
    settings.demoMode,
    settings.inferenceThrottleFps,
    settings.postureWarningThresholdSec,
    settings.focusMode,
    settings.soundEnabled,
    demoPerson,
    demoPosture,
    demoMovement,
    demoStationaryMin,
    demoScreenMin,
    showSkeleton,
    showBoundingBox
  ]);

  // Handle Preset Scenarios in Demo Mode
  const applyDemoPreset = useCallback((preset: 'slouch_alert' | 'screen_strain' | 'healthy_flow' | 'user_break') => {
    switch (preset) {
      case 'slouch_alert':
        setDemoPerson('DETECTED');
        setDemoPosture('POOR');
        setDemoMovement('STATIONARY');
        setDemoStationaryMin(38);
        setDemoScreenMin(45);
        soundManager.playReminderChime();
        break;
      case 'screen_strain':
        setDemoPerson('DETECTED');
        setDemoPosture('ATTENTION');
        setDemoMovement('LOW');
        setDemoStationaryMin(20);
        setDemoScreenMin(55);
        soundManager.playReminderChime();
        break;
      case 'healthy_flow':
        setDemoPerson('DETECTED');
        setDemoPosture('GOOD');
        setDemoMovement('ACTIVE');
        setDemoStationaryMin(10);
        setDemoScreenMin(15);
        break;
      case 'user_break':
        setDemoPerson('AWAY');
        setDemoPosture('GOOD');
        setDemoMovement('STATIONARY');
        setDemoStationaryMin(0);
        setDemoScreenMin(0);
        break;
    }
  }, []);

  // Snooze recommendation
  const snoozeRecommendation = useCallback((durationMin: number = 10) => {
    snoozeUntilRef.current = Date.now() + durationMin * 60 * 1000;
    setPrimaryRecommendation(null);
  }, []);

  // Dismiss recommendation
  const dismissRecommendation = useCallback((exerciseId: string) => {
    recordRecentAction(exerciseId, 'DISMISSED');
    setPrimaryRecommendation(null);
  }, []);

  // Start Exercise Flow
  const startExercise = useCallback((exercise: ExerciseItem) => {
    setActiveExercise(exercise);
    setIsExerciseModalOpen(true);
  }, []);

  // Complete Exercise
  const completeExercise = useCallback((exercise: ExerciseItem, durationSec: number) => {
    recordRecentAction(exercise.id, 'COMPLETED');
    workSessionRef.current.recordExerciseCompletion(durationSec);
    movementTrackerRef.current.resetStationaryTimer();
    setSessionMetrics({ ...workSessionRef.current.getMetrics() });
    setPrimaryRecommendation(null);
  }, []);

  // Confirm Hydration
  const confirmHydration = useCallback(() => {
    workSessionRef.current.recordHydration();
    setSessionMetrics({ ...workSessionRef.current.getMetrics() });
    setIsHydrationAlertOpen(false);
    lastHydrationAlertRef.current = Date.now();
    soundManager.playHydrationDroplet();
  }, []);

  const snoozeHydration = useCallback((min: number = 15) => {
    setIsHydrationAlertOpen(false);
    lastHydrationAlertRef.current = Date.now() - (settings.hydrationIntervalMin - min) * 60 * 1000;
  }, [settings.hydrationIntervalMin]);

  const logQuickHydration = useCallback(() => {
    workSessionRef.current.recordHydration();
    setSessionMetrics({ ...workSessionRef.current.getMetrics() });
    lastHydrationAlertRef.current = Date.now();
  }, []);

  return {
    settings,
    updateSettings,
    calibration,
    updateCalibration,
    videoRef,
    canvasRef,
    isCameraActive,
    startCamera,
    stopCamera,
    isModelReady,
    isCameraInitializing,
    cameraError,
    isPermissionModalOpen,
    setIsPermissionModalOpen,
    isPostureAlertOpen,
    setIsPostureAlertOpen,
    liveMetrics,
    sessionMetrics,
    primaryRecommendation,
    rankedCandidates,
    multiPersonWarning,
    showSkeleton,
    setShowSkeleton,
    showBoundingBox,
    setShowBoundingBox,
    demoPerson,
    setDemoPerson,
    demoPosture,
    setDemoPosture,
    demoMovement,
    setDemoMovement,
    demoStationaryMin,
    setDemoStationaryMin,
    demoScreenMin,
    setDemoScreenMin,
    applyDemoPreset,
    snoozeRecommendation,
    dismissRecommendation,
    activeExercise,
    isExerciseModalOpen,
    setIsExerciseModalOpen,
    startExercise,
    completeExercise,
    isCalibrationOpen,
    setIsCalibrationOpen,
    isHydrationAlertOpen,
    confirmHydration,
    snoozeHydration,
    logQuickHydration
  };
}

/**
 * Generate realistic simulated landmarks for Demo Mode
 */
function generateSimulatedLandmarks(posture: PostureState, timeMs: number): Landmark3D[] {
  const breath = Math.sin(timeMs / 1200) * 0.006;
  const slouchOffset = posture === 'POOR' ? 0.08 : posture === 'ATTENTION' ? 0.04 : 0.0;
  const headDrop = posture === 'POOR' ? 0.06 : posture === 'ATTENTION' ? 0.03 : 0.0;
  const shoulderSlant = posture === 'POOR' ? 0.035 : posture === 'ATTENTION' ? 0.018 : 0.0;

  // Head coordinates (normalized 0 to 1)
  const nose = { x: 0.5, y: 0.22 + headDrop + breath, z: 0, visibility: 1.0 };
  const leftEye = { x: 0.47, y: 0.19 + headDrop + breath, z: 0, visibility: 1.0 };
  const leftEyeOuter = { x: 0.45, y: 0.19 + headDrop + breath, z: 0, visibility: 1.0 };
  const leftEar = { x: 0.42, y: 0.21 + headDrop + breath, z: 0, visibility: 1.0 };
  const rightEye = { x: 0.53, y: 0.19 + headDrop + breath, z: 0, visibility: 1.0 };
  const rightEyeOuter = { x: 0.55, y: 0.19 + headDrop + breath, z: 0, visibility: 1.0 };
  const rightEar = { x: 0.58, y: 0.21 + headDrop + breath, z: 0, visibility: 1.0 };
  const mouthL = { x: 0.48, y: 0.26 + headDrop + breath, z: 0, visibility: 1.0 };
  const mouthR = { x: 0.52, y: 0.26 + headDrop + breath, z: 0, visibility: 1.0 };

  // Shoulders (11, 12)
  const leftSh = { x: 0.35, y: 0.38 + slouchOffset - shoulderSlant + breath, z: 0, visibility: 1.0 };
  const rightSh = { x: 0.65, y: 0.38 + slouchOffset + shoulderSlant + breath, z: 0, visibility: 1.0 };

  // Elbows (13, 14)
  const leftElbow = { x: 0.28, y: 0.58 + slouchOffset + breath, z: 0, visibility: 1.0 };
  const rightElbow = { x: 0.72, y: 0.58 + slouchOffset + breath, z: 0, visibility: 1.0 };

  // Wrists (15, 16)
  const leftWrist = { x: 0.36, y: 0.76 + breath, z: 0, visibility: 1.0 };
  const rightWrist = { x: 0.64, y: 0.76 + breath, z: 0, visibility: 1.0 };

  // Hands (17..22)
  const leftPinky = { x: 0.34, y: 0.80 + breath, z: 0, visibility: 1.0 };
  const rightPinky = { x: 0.66, y: 0.80 + breath, z: 0, visibility: 1.0 };
  const leftIndex = { x: 0.38, y: 0.81 + breath, z: 0, visibility: 1.0 };
  const rightIndex = { x: 0.62, y: 0.81 + breath, z: 0, visibility: 1.0 };
  const leftThumb = { x: 0.39, y: 0.77 + breath, z: 0, visibility: 1.0 };
  const rightThumb = { x: 0.61, y: 0.77 + breath, z: 0, visibility: 1.0 };

  // Hips (23, 24)
  const leftHip = { x: 0.38, y: 0.88 + breath, z: 0, visibility: 1.0 };
  const rightHip = { x: 0.62, y: 0.88 + breath, z: 0, visibility: 1.0 };

  const landmarks: Landmark3D[] = new Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0, visibility: 1.0 }));
  landmarks[0] = nose;
  landmarks[1] = leftEye;
  landmarks[2] = leftEyeOuter;
  landmarks[3] = leftEyeOuter;
  landmarks[4] = rightEye;
  landmarks[5] = rightEyeOuter;
  landmarks[6] = rightEyeOuter;
  landmarks[7] = leftEar;
  landmarks[8] = rightEar;
  landmarks[9] = mouthL;
  landmarks[10] = mouthR;
  landmarks[11] = leftSh;
  landmarks[12] = rightSh;
  landmarks[13] = leftElbow;
  landmarks[14] = rightElbow;
  landmarks[15] = leftWrist;
  landmarks[16] = rightWrist;
  landmarks[17] = leftPinky;
  landmarks[18] = rightPinky;
  landmarks[19] = leftIndex;
  landmarks[20] = rightIndex;
  landmarks[21] = leftThumb;
  landmarks[22] = rightThumb;
  landmarks[23] = leftHip;
  landmarks[24] = rightHip;

  return landmarks;
}

/**
 * Canvas Landmark Drawing Routine with high-contrast dual-pass glowing neon skeleton lines & joint nodes
 */
function drawSkeletonOverlay(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  landmarks: Landmark3D[] | null,
  showSkeleton: boolean,
  showBoundingBox: boolean,
  postureState: PostureState
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.clearRect(0, 0, w, h);

  if (!landmarks || landmarks.length === 0) return;

  // Color by Posture State
  const strokeColor =
    postureState === 'GOOD' ? '#10b981' : postureState === 'ATTENTION' ? '#f59e0b' : '#f43f5e';
  const glowColor =
    postureState === 'GOOD'
      ? 'rgba(16, 185, 129, 0.45)'
      : postureState === 'ATTENTION'
      ? 'rgba(245, 158, 11, 0.45)'
      : 'rgba(244, 63, 94, 0.45)';

  const isValidPoint = (p: Landmark3D | undefined | null): boolean => {
    return (
      !!p &&
      typeof p.x === 'number' &&
      typeof p.y === 'number' &&
      !isNaN(p.x) &&
      !isNaN(p.y) &&
      p.x >= -0.3 &&
      p.x <= 1.3 &&
      p.y >= -0.3 &&
      p.y <= 1.3
    );
  };

  // Draw Bounding Box around upper body
  if (showBoundingBox) {
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    let validCount = 0;
    landmarks.forEach(lm => {
      if (isValidPoint(lm)) {
        if (lm.x < minX) minX = lm.x;
        if (lm.y < minY) minY = lm.y;
        if (lm.x > maxX) maxX = lm.x;
        if (lm.y > maxY) maxY = lm.y;
        validCount++;
      }
    });

    if (validCount > 0) {
      const pad = 0.05;
      const boxX = Math.max(0, (minX - pad) * w);
      const boxY = Math.max(0, (minY - pad) * h);
      const boxW = Math.min(w - boxX, (maxX - minX + pad * 2) * w);
      const boxH = Math.min(h - boxY, (maxY - minY + pad * 2) * h);

      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.setLineDash([]);

      // Corner brackets / Label
      ctx.fillStyle = strokeColor;
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`POSTURE: ${postureState}`, boxX + 8, boxY + 18);
      ctx.restore();
    }
  }

  // Draw Skeleton connections & nodes
  if (showSkeleton) {
    const connections: [number, number][] = [
      // Shoulders & Collar
      [11, 12], // Left shoulder to right shoulder
      [0, 11],  // Nose to left shoulder
      [0, 12],  // Nose to right shoulder
      [7, 11],  // Left ear to left shoulder
      [8, 12],  // Right ear to right shoulder

      // Left Arm & Forearm & Hand
      [11, 13], // Left shoulder to left elbow
      [13, 15], // Left elbow to left wrist
      [15, 17], // Left wrist to left pinky
      [15, 19], // Left wrist to left index
      [15, 21], // Left wrist to left thumb
      [17, 19], // Left pinky to index knuckle
      [19, 21], // Left index to thumb

      // Right Arm & Forearm & Hand
      [12, 14], // Right shoulder to right elbow
      [14, 16], // Right elbow to right wrist
      [16, 18], // Right wrist to right pinky
      [16, 20], // Right wrist to right index
      [16, 22], // Right wrist to right thumb
      [18, 20], // Right pinky to index knuckle
      [20, 22], // Right index to thumb

      // Torso & Hips
      [11, 23], // Left shoulder to left hip
      [12, 24], // Right shoulder to right hip
      [23, 24], // Left hip to right hip

      // Head & Facial features
      [0, 1], [1, 2], [2, 3], [3, 7], // Left eye path to ear
      [0, 4], [4, 5], [5, 6], [6, 8], // Right eye path to ear
      [1, 4],  // Eye bridge
      [9, 10], // Mouth
    ];

    // PASS 1: Broad Neon Halo Glow
    ctx.save();
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 7.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (isValidPoint(p1) && isValidPoint(p2)) {
        ctx.beginPath();
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.stroke();
      }
    });

    // Central spinal line halo
    const lSh = landmarks[11];
    const rSh = landmarks[12];
    const lHip = landmarks[23];
    const rHip = landmarks[24];
    if (isValidPoint(lSh) && isValidPoint(rSh)) {
      const midShX = (lSh.x + rSh.x) / 2;
      const midShY = (lSh.y + rSh.y) / 2;
      if (isValidPoint(lHip) && isValidPoint(rHip)) {
        const midHipX = (lHip.x + rHip.x) / 2;
        const midHipY = (lHip.y + rHip.y) / 2;
        ctx.beginPath();
        ctx.moveTo(midShX * w, midShY * h);
        ctx.lineTo(midHipX * w, midHipY * h);
        ctx.stroke();
      }
    }
    ctx.restore();

    // PASS 2: Crisp Vibrant Core Neon Stroke
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 8;

    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (isValidPoint(p1) && isValidPoint(p2)) {
        ctx.beginPath();
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.stroke();
      }
    });

    // Central spinal line crisp core
    if (isValidPoint(lSh) && isValidPoint(rSh) && isValidPoint(lHip) && isValidPoint(rHip)) {
      const midShX = (lSh.x + rSh.x) / 2;
      const midShY = (lSh.y + rSh.y) / 2;
      const midHipX = (lHip.x + rHip.x) / 2;
      const midHipY = (lHip.y + rHip.y) / 2;
      ctx.beginPath();
      ctx.moveTo(midShX * w, midShY * h);
      ctx.lineTo(midHipX * w, midHipY * h);
      ctx.stroke();
    }
    ctx.restore();

    // Landmark Joint Nodes
    landmarks.forEach((lm, idx) => {
      if (isValidPoint(lm)) {
        const isKey = [0, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].includes(idx);
        const radius = isKey ? 5.5 : 3.5;

        // Outer glow halo circle
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, radius + 3, 0, 2 * Math.PI);
        ctx.fillStyle = glowColor;
        ctx.fill();

        // Inner solid node
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, radius, 0, 2 * Math.PI);
        ctx.fillStyle = isKey ? '#ffffff' : strokeColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }
}
