import { describe, it, expect, vi } from 'vitest';
import { EdgeContextRouter } from '../src/routing/EdgeContextRouter';
import { LLMProvider, MinimumViableContext } from '../src/types';

describe('EdgeContextRouter', () => {
  const createMockProvider = (name: string, type: 'LOCAL' | 'CLOUD', impl?: (prompt: string, ctx: MinimumViableContext) => Promise<string>): LLMProvider => ({
    name,
    type,
    execute: vi.fn(impl || (async (prompt, ctx) => `Response from ${name} for "${prompt}"`))
  });

  it('throws error when providers are missing', async () => {
    const router = new EdgeContextRouter();
    await expect(router.execute('Hello', [])).rejects.toThrow('Both Local and Cloud providers must be registered');
  });

  it('routes simple extraction task to local provider', async () => {
    const router = new EdgeContextRouter({ similarityThreshold: 0.1 });
    const local = createMockProvider('LocalWebGPU', 'LOCAL');
    const cloud = createMockProvider('CloudLLM', 'CLOUD');

    router.registerLocalProvider(local);
    router.registerCloudProvider(cloud);

    const result = await router.execute('summarize this sentence: hello world', []);
    expect(result).toContain('LocalWebGPU');
    expect(local.execute).toHaveBeenCalled();
    expect(cloud.execute).not.toHaveBeenCalled();
  });

  it('routes complex task to cloud provider', async () => {
    const router = new EdgeContextRouter({ similarityThreshold: 0.1 });
    const local = createMockProvider('LocalWebGPU', 'LOCAL');
    const cloud = createMockProvider('CloudLLM', 'CLOUD');

    router.registerLocalProvider(local);
    router.registerCloudProvider(cloud);

    const result = await router.execute('architect and evaluate a high performance lock-free distributed consensus algorithm', []);
    expect(result).toContain('CloudLLM');
    expect(cloud.execute).toHaveBeenCalled();
  });

  it('falls back to cloud provider when local provider throws error', async () => {
    const router = new EdgeContextRouter({ similarityThreshold: 0.1 });
    const local = createMockProvider('LocalWebGPU', 'LOCAL', async () => {
      throw new Error('WebGPU OOM');
    });
    const cloud = createMockProvider('CloudLLM', 'CLOUD');

    router.registerLocalProvider(local);
    router.registerCloudProvider(cloud);

    // Simple prompt normally goes to local, but local fails -> should fallback to cloud
    const result = await router.execute('summarize this quick note', []);
    expect(result).toContain('CloudLLM');
    expect(local.execute).toHaveBeenCalled();
    expect(cloud.execute).toHaveBeenCalled();
  });
});
