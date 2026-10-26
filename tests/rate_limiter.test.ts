import { describe, it, expect } from 'vitest';
import { TokenBucketRateLimiter } from '../src/routing/TokenBucketRateLimiter';

describe('TokenBucketRateLimiter', () => {
  it('allows consumption within burst capacity and tracks tokens remaining', () => {
    const limiter = new TokenBucketRateLimiter(500, 50);

    const res1 = limiter.consume(200);
    expect(res1.allowed).toBe(true);
    expect(res1.tokensRemaining).toBe(300);

    const res2 = limiter.consume(250);
    expect(res2.allowed).toBe(true);
    expect(res2.tokensRemaining).toBe(50);
  });

  it('rejects consumption exceeding remaining token capacity and provides reset wait time', () => {
    const limiter = new TokenBucketRateLimiter(100, 10);
    limiter.consume(90);

    // Try to consume 30 when only ~10 remain -> rejected
    const res = limiter.consume(30);
    expect(res.allowed).toBe(false);
    expect(res.resetTimeMs).toBeGreaterThan(0);
  });
});
