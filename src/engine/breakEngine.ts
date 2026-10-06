import { BreakEvent, BreakQuality, HumanPresenceState } from '../types';

export class BreakEngine {
  private awayStartTime: number | null = null;
  private minBreakSec = 25; // 25 seconds minimum to qualify as meaningful break
  private onBreakCompletedCallback?: (breakEvent: BreakEvent) => void;

  constructor(minBreakSec = 25) {
    this.minBreakSec = minBreakSec;
  }

  public setBreakCompletedCallback(cb: (breakEvent: BreakEvent) => void): void {
    this.onBreakCompletedCallback = cb;
  }

  public processPresence(presence: HumanPresenceState): {
    isUserAway: boolean;
    currentAwayDurationSec: number;
    completedBreak: BreakEvent | null;
  } {
    const now = Date.now();
    let completedBreak: BreakEvent | null = null;

    if (presence === 'AWAY') {
      if (!this.awayStartTime) {
        this.awayStartTime = now;
      }
      const awayDuration = Math.floor((now - this.awayStartTime) / 1000);
      return {
        isUserAway: awayDuration >= 5, // flagged away after 5s without person
        currentAwayDurationSec: awayDuration,
        completedBreak: null
      };
    } else {
      // User is DETECTED or uncertain
      if (this.awayStartTime) {
        const awayDurationSec = Math.floor((now - this.awayStartTime) / 1000);
        
        // Check if meaningful break
        if (awayDurationSec >= this.minBreakSec) {
          let quality: BreakQuality = 'MICRO';
          if (awayDurationSec >= 600) {
            quality = 'EXTENDED';
          } else if (awayDurationSec >= 120) {
            quality = 'SHORT';
          }

          completedBreak = {
            id: 'break_' + now,
            startTime: this.awayStartTime,
            endTime: now,
            durationSec: awayDurationSec,
            quality,
            type: 'NATURAL_AWAY'
          };

          if (this.onBreakCompletedCallback) {
            this.onBreakCompletedCallback(completedBreak);
          }
        }

        this.awayStartTime = null;
      }

      return {
        isUserAway: false,
        currentAwayDurationSec: 0,
        completedBreak
      };
    }
  }

  public reset(): void {
    this.awayStartTime = null;
  }
}
