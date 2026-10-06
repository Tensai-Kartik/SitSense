import { SessionMetrics, WorkSessionState } from '../types';

export class WorkSessionEngine {
  private sessionStartTime: number = Date.now();
  private lastActivityTime: number = Date.now();
  private continuousScreenSec: number = 0;
  private totalScreenSec: number = 0;
  private workDurationSec: number = 0;
  private stationaryDurationSec: number = 0;
  private breaksCount: number = 0;
  private totalBreakSec: number = 0;
  private postureWarningsCount: number = 0;
  private exercisesCompletedCount: number = 0;
  private hydrationConfirmedCount: number = 0;
  private visualBreaksCount: number = 0;
  private currentState: WorkSessionState = 'ACTIVE';

  private isTabVisible: boolean = true;
  private isMonitoringPaused: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('mousemove', this.handleUserInteraction, { passive: true });
      window.addEventListener('keydown', this.handleUserInteraction, { passive: true });
    }
  }

  private handleVisibilityChange = () => {
    this.isTabVisible = document.visibilityState === 'visible';
    if (!this.isTabVisible && this.currentState === 'ACTIVE') {
      this.currentState = 'IDLE';
    }
  };

  private handleUserInteraction = () => {
    this.lastActivityTime = Date.now();
  };

  public tick(isUserPresent: boolean, isStationary: boolean): void {
    if (this.isMonitoringPaused) return;

    // Active session duration always increments while monitoring is active
    this.workDurationSec += 1;
    this.totalScreenSec += 1;

    if (isUserPresent) {
      this.currentState = 'ACTIVE';
      this.continuousScreenSec += 1;

      if (isStationary) {
        this.stationaryDurationSec += 1;
      }
    } else {
      this.currentState = 'AWAY';
    }
  }

  public recordPostureWarning(): void {
    this.postureWarningsCount += 1;
  }

  public recordBreak(durationSec: number): void {
    this.breaksCount += 1;
    this.totalBreakSec += durationSec;
    // Reset continuous screen exposure and stationary count after meaningful break
    if (durationSec >= 30) {
      this.continuousScreenSec = 0;
      this.stationaryDurationSec = 0;
    }
  }

  public recordExerciseCompletion(durationSec: number): void {
    this.exercisesCompletedCount += 1;
    this.stationaryDurationSec = 0; // movement reset
    this.continuousScreenSec = Math.max(0, this.continuousScreenSec - durationSec * 2);
  }

  public recordHydration(): void {
    this.hydrationConfirmedCount += 1;
  }

  public recordVisualBreak(): void {
    this.visualBreaksCount += 1;
    this.continuousScreenSec = 0; // reset continuous screen
  }

  public setPaused(paused: boolean): void {
    this.isMonitoringPaused = paused;
    this.currentState = paused ? 'PAUSED' : 'ACTIVE';
  }

  public resetContinuousScreen(): void {
    this.continuousScreenSec = 0;
  }

  public resetStationary(): void {
    this.stationaryDurationSec = 0;
  }

  public getMetrics(): SessionMetrics {
    return {
      sessionId: 'sess_' + this.sessionStartTime,
      startTime: this.sessionStartTime,
      workDurationSec: this.workDurationSec,
      stationaryDurationSec: this.stationaryDurationSec,
      continuousScreenSec: this.continuousScreenSec,
      totalScreenSec: this.totalScreenSec,
      breaksCount: this.breaksCount,
      totalBreakSec: this.totalBreakSec,
      postureWarningsCount: this.postureWarningsCount,
      exercisesCompletedCount: this.exercisesCompletedCount,
      hydrationConfirmedCount: this.hydrationConfirmedCount,
      visualBreaksCount: this.visualBreaksCount,
      currentWorkState: this.currentState
    };
  }

  public setSimulatedMetrics(partial: Partial<SessionMetrics>): void {
    if (partial.workDurationSec !== undefined) this.workDurationSec = partial.workDurationSec;
    if (partial.stationaryDurationSec !== undefined) this.stationaryDurationSec = partial.stationaryDurationSec;
    if (partial.continuousScreenSec !== undefined) this.continuousScreenSec = partial.continuousScreenSec;
    if (partial.breaksCount !== undefined) this.breaksCount = partial.breaksCount;
    if (partial.postureWarningsCount !== undefined) this.postureWarningsCount = partial.postureWarningsCount;
    if (partial.exercisesCompletedCount !== undefined) this.exercisesCompletedCount = partial.exercisesCompletedCount;
    if (partial.hydrationConfirmedCount !== undefined) this.hydrationConfirmedCount = partial.hydrationConfirmedCount;
    if (partial.currentWorkState !== undefined) this.currentState = partial.currentWorkState;
  }

  public resetSession(): void {
    this.sessionStartTime = Date.now();
    this.workDurationSec = 0;
    this.stationaryDurationSec = 0;
    this.continuousScreenSec = 0;
    this.totalScreenSec = 0;
    this.breaksCount = 0;
    this.totalBreakSec = 0;
    this.postureWarningsCount = 0;
    this.exercisesCompletedCount = 0;
    this.hydrationConfirmedCount = 0;
    this.visualBreaksCount = 0;
    this.currentState = 'ACTIVE';
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('mousemove', this.handleUserInteraction);
      window.removeEventListener('keydown', this.handleUserInteraction);
    }
  }
}
