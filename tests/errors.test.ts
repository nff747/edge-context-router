import { describe, it, expect } from 'vitest';
import {
  RouterError,
  MissingProviderError,
  ContextBudgetExceededError,
  InferenceExecutionError
} from '../src/errors';

describe('Router Errors', () => {
  it('instantiates RouterError with correct prototype and name', () => {
    const err = new RouterError('Generic failure');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(RouterError);
    expect(err.name).toBe('RouterError');
    expect(err.message).toBe('Generic failure');
  });

  it('instantiates MissingProviderError with provider info', () => {
    const err = new MissingProviderError('LOCAL');
    expect(err).toBeInstanceOf(RouterError);
    expect(err.name).toBe('MissingProviderError');
    expect(err.message).toContain('LOCAL');
  });

  it('instantiates ContextBudgetExceededError with budget metadata', () => {
    const err = new ContextBudgetExceededError(2500, 1000);
    expect(err.name).toBe('ContextBudgetExceededError');
    expect(err.requested).toBe(2500);
    expect(err.limit).toBe(1000);
    expect(err.message).toContain('2500');
  });

  it('instantiates InferenceExecutionError with provider name and cause', () => {
    const cause = new Error('Network timeout');
    const err = new InferenceExecutionError('CloudLLM', cause);
    expect(err.providerName).toBe('CloudLLM');
    expect(err.message).toContain('CloudLLM');
    expect(err.message).toContain('Network timeout');
  });
});
