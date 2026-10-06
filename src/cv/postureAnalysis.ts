import { CalibrationBaseline, Landmark3D, PostureMetrics, PostureState } from '../types';

/**
 * MediaPipe Pose Landmark standard indices:
 * 0: Nose
 * 2: Left Eye, 5: Right Eye
 * 7: Left Ear, 8: Right Ear
 * 11: Left Shoulder, 12: Right Shoulder
 * 13: Left Elbow, 14: Right Elbow
 * 15: Left Wrist, 16: Right Wrist
 * 23: Left Hip, 24: Right Hip
 */

export function calculateAngleDegrees(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const rad = Math.atan2(dy, dx);
  return (rad * 180) / Math.PI;
}

export function calculateDistance(p1: Landmark3D, p2: Landmark3D): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function analyzePosture(
  landmarks: Landmark3D[],
  calibration: CalibrationBaseline
): {
  metrics: PostureMetrics;
  state: PostureState;
  detailedIssues: string[];
} {
  const nose = landmarks[0];
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  // Midpoints
  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
  const earMidX = (leftEar.x + rightEar.x) / 2;
  const earMidY = (leftEar.y + rightEar.y) / 2;
  const shoulderWidth = calculateDistance(leftShoulder, rightShoulder) || 0.3;

  // 1. Shoulder slope angle (lateral tilt)
  const rawShoulderAngle = Math.abs(calculateAngleDegrees(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y));
  // deviation from 0 or 180 degrees
  const shoulderSlopeAngle = Math.min(rawShoulderAngle, Math.abs(180 - rawShoulderAngle));

  // 2. Lateral head tilt angle
  const rawHeadTilt = Math.abs(calculateAngleDegrees(leftEar.x, leftEar.y, rightEar.x, rightEar.y));
  const headTiltAngle = Math.min(rawHeadTilt, Math.abs(180 - rawHeadTilt));

  // 3. Forward head angle (ear midpoint relative to shoulder midpoint)
  // Normal upright seated pose has ear nearly vertical above shoulder
  const dx = earMidX - shoulderMidX;
  const dy = shoulderMidY - earMidY; // dy is positive upwards
  const angleFromVertical = Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
  const forwardHeadAngle = angleFromVertical;

  // 4. Torso lateral lean angle
  let torsoLeanAngle = 0;
  if (leftHip && rightHip && (leftHip.visibility ?? 1) > 0.3 && (rightHip.visibility ?? 1) > 0.3) {
    const hipMidX = (leftHip.x + rightHip.x) / 2;
    const hipMidY = (leftHip.y + rightHip.y) / 2;
    const torsoDx = shoulderMidX - hipMidX;
    const torsoDy = hipMidY - shoulderMidY;
    torsoLeanAngle = Math.abs(Math.atan2(torsoDx, torsoDy) * (180 / Math.PI));
  }

  // 5. Slouch index: vertical distance from nose to shoulder plane normalized by shoulder width
  const noseToShoulderDist = (shoulderMidY - nose.y) / shoulderWidth;
  const baselineDist = calibration.isCalibrated ? calibration.baselineNoseToShoulderDist : 0.65;
  // When slouching, head drops closer to shoulders
  const compressionRatio = Math.max(0, (baselineDist - noseToShoulderDist) / baselineDist);
  const slouchScore = Math.min(1, Math.max(0, compressionRatio * 1.6));

  // Apply baseline adjustments if calibrated
  const baselineFwd = calibration.isCalibrated ? calibration.baselineForwardHead : 12;
  const deltaForwardHead = Math.max(0, forwardHeadAngle - baselineFwd);

  const baselineShoulder = calibration.isCalibrated ? calibration.baselineShoulderSlope : 2;
  const deltaShoulder = Math.max(0, shoulderSlopeAngle - baselineShoulder);

  const baselineTorso = calibration.isCalibrated ? calibration.baselineTorsoLean : 2;
  const deltaTorso = Math.max(0, torsoLeanAngle - baselineTorso);

  const detailedIssues: string[] = [];

  // Thresholds
  if (deltaForwardHead > 18) {
    detailedIssues.push('Significant Forward Head Position');
  } else if (deltaForwardHead > 9) {
    detailedIssues.push('Mild Forward Head Angle');
  }

  if (deltaShoulder > 7) {
    detailedIssues.push('Shoulder Imbalance / Uneven Height');
  } else if (deltaShoulder > 4) {
    detailedIssues.push('Mild Shoulder Tilt');
  }

  if (slouchScore > 0.45) {
    detailedIssues.push('Upper Body Slouching / Spinal Kyphosis');
  }

  if (headTiltAngle > 10) {
    detailedIssues.push('Lateral Neck Tilt');
  }

  if (deltaTorso > 12) {
    detailedIssues.push('Lateral Torso Asymmetry');
  }

  // State Classification
  let state: PostureState = 'GOOD';
  if (
    deltaForwardHead > 22 || 
    deltaShoulder > 9 || 
    slouchScore > 0.55 || 
    detailedIssues.length >= 3
  ) {
    state = 'POOR';
  } else if (
    deltaForwardHead > 9 || 
    deltaShoulder > 4 || 
    slouchScore > 0.3 || 
    headTiltAngle > 7 || 
    detailedIssues.length >= 1
  ) {
    state = 'ATTENTION';
  }

  const metrics: PostureMetrics = {
    forwardHeadAngle: Number(forwardHeadAngle.toFixed(1)),
    headTiltAngle: Number(headTiltAngle.toFixed(1)),
    shoulderSlopeAngle: Number(shoulderSlopeAngle.toFixed(1)),
    torsoLeanAngle: Number(torsoLeanAngle.toFixed(1)),
    slouchScore: Number(slouchScore.toFixed(2)),
    rawForwardHeadDelta: Number(deltaForwardHead.toFixed(1)),
    rawShoulderDelta: Number(deltaShoulder.toFixed(1)),
    isCalibrated: calibration.isCalibrated
  };

  return { metrics, state, detailedIssues };
}
