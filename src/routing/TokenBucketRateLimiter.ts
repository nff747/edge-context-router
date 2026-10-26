export interface RateLimitStatus {
  allowed: boolean;
  tokensRemaining: number;
  resetTimeMs: number;
}

export class TokenBucketRateLimiter {
  private capacity: number;
  private refillRatePerSec: number;
  private tokens: number;
  private lastRefillTimestamp: number;

  constructor(capacity: number = 1000, refillRatePerSec: number = 100) {
    this.capacity = capacity;
    this.refillRatePerSec = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefillTimestamp = typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  private getTimeMs(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  private refill(): void {
    const now = this.getTimeMs();
    const elapsedSec = (now - this.lastRefillTimestamp) / 1000;
    if (elapsedSec > 0) {
      const addedTokens = elapsedSec * this.refillRatePerSec;
      this.tokens = Math.min(this.capacity, this.tokens + addedTokens);
      this.lastRefillTimestamp = now;
    }
  }

  /**
   * Attempts to consume N tokens from the bucket for prompt dispatch.
   */
  consume(tokenCount: number): RateLimitStatus {
    this.refill();

    if (this.tokens >= tokenCount) {
      this.tokens -= tokenCount;
      return {
        allowed: true,
        tokensRemaining: Math.floor(this.tokens),
        resetTimeMs: 0,
      };
    }

    const deficit = tokenCount - this.tokens;
    const waitTimeMs = Math.ceil((deficit / this.refillRatePerSec) * 1000);

    return {
      allowed: false,
      tokensRemaining: Math.floor(this.tokens),
      resetTimeMs: waitTimeMs,
    };
  }

  getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}
