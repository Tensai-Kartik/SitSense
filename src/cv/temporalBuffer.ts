export interface TemporalFrame {
  timestamp: number;
  forwardHeadAngle: number;
  headTiltAngle: number;
  shoulderSlopeAngle: number;
  torsoLeanAngle: number;
  slouchScore: number;
  movementDisplacement: number;
  isPersonPresent: boolean;
}

export class TemporalBuffer {
  private buffer: TemporalFrame[] = [];
  private maxFrames: number;
  private maxDurationMs: number;

  constructor(maxFrames = 60, maxDurationMs = 4000) {
    this.maxFrames = maxFrames;
    this.maxDurationMs = maxDurationMs;
  }

  public push(frame: TemporalFrame): void {
    this.buffer.push(frame);
    const now = frame.timestamp;
    
    // Evict old frames by count and duration
    while (
      this.buffer.length > this.maxFrames ||
      (this.buffer.length > 0 && now - this.buffer[0].timestamp > this.maxDurationMs)
    ) {
      this.buffer.shift();
    }
  }

  public getFrames(): TemporalFrame[] {
    return this.buffer;
  }

  public getSmoothedValues(): {
    forwardHeadAngle: number;
    headTiltAngle: number;
    shoulderSlopeAngle: number;
    torsoLeanAngle: number;
    slouchScore: number;
    averageMovement: number;
    movementVariance: number;
  } {
    if (this.buffer.length === 0) {
      return {
        forwardHeadAngle: 0,
        headTiltAngle: 0,
        shoulderSlopeAngle: 0,
        torsoLeanAngle: 0,
        slouchScore: 0,
        averageMovement: 0,
        movementVariance: 0,
      };
    }

    const count = this.buffer.length;
    let sumFwd = 0;
    let sumTilt = 0;
    let sumShoulder = 0;
    let sumTorso = 0;
    let sumSlouch = 0;
    let sumMove = 0;

    for (const f of this.buffer) {
      sumFwd += f.forwardHeadAngle;
      sumTilt += f.headTiltAngle;
      sumShoulder += f.shoulderSlopeAngle;
      sumTorso += f.torsoLeanAngle;
      sumSlouch += f.slouchScore;
      sumMove += f.movementDisplacement;
    }

    const avgMove = sumMove / count;
    let varianceMove = 0;
    for (const f of this.buffer) {
      varianceMove += Math.pow(f.movementDisplacement - avgMove, 2);
    }
    varianceMove /= count;

    return {
      forwardHeadAngle: sumFwd / count,
      headTiltAngle: sumTilt / count,
      shoulderSlopeAngle: sumShoulder / count,
      torsoLeanAngle: sumTorso / count,
      slouchScore: sumSlouch / count,
      averageMovement: avgMove,
      movementVariance: varianceMove,
    };
  }

  public clear(): void {
    this.buffer = [];
  }
}
