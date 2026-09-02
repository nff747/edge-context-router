import { describe, it, expect, beforeAll } from 'vitest';
import { SemanticScorer } from './SemanticScorer';
import { TaskComplexity } from '../types';

describe('SemanticScorer', () => {
  let scorer: SemanticScorer;

  beforeAll(() => {
    scorer = new SemanticScorer();
  });

  it('should route a simple summary task to LOCAL', async () => {
    const prompt = 'Please summarize the following text into three bullet points: ...';
    const decision = await scorer.evaluate(prompt);
    
    expect(decision.complexity).toBe(TaskComplexity.SIMPLE);
    expect(decision.targetProvider).toBe('LOCAL');
    expect(decision.confidence).toBeGreaterThan(0.2); // Just to check it sets some confidence
  }, 10000); // Allow time for model download if needed

  it('should route a complex architecture task to CLOUD', async () => {
    const prompt = 'Can you architect a new microservices system for a real-time multiplayer game? We need to evaluate and compare different load balancing strategies and debug our existing monolith.';
    const decision = await scorer.evaluate(prompt);
    
    expect(decision.complexity).toBe(TaskComplexity.COMPLEX);
    expect(decision.targetProvider).toBe('CLOUD');
    expect(decision.confidence).toBeGreaterThan(0.2);
  }, 10000);
});
