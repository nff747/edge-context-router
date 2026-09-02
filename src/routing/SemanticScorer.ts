/**
 * ═══════════════════════════════════════════════════════════════════
 * Edge Context Router — Semantic Scorer
 * 
 * Evaluates the user's intent to determine computational complexity.
 * Utilizes heuristics and lightweight embeddings (like Transformers.js)
 * to make a zero-latency routing decision.
 * ═══════════════════════════════════════════════════════════════════
 */

import { TaskComplexity, RouteDecision } from '../types';

export class SemanticScorer {
  // Keywords highly correlated with complex reasoning requirements
  private complexTriggers = [
    'synthesize', 'compare', 'contrast', 'architect', 
    'why', 'evaluate', 'debug', 'refactor', 'plan'
  ];

  // Keywords correlated with basic local tasks
  private simpleTriggers = [
    'summarize', 'extract', 'format', 'what is', 
    'who is', 'translate', 'fix spelling'
  ];

  /**
   * Evaluates the prompt and returns a routing decision.
   * In a production environment, this would run a tiny local classifier
   * or compute cosine similarity against a vector store of intent anchors.
   */
  public async evaluate(prompt: string): Promise<RouteDecision> {
    const lowerPrompt = prompt.toLowerCase();
    
    let complexityScore = 0;
    
    // Simple heuristic scoring
    for (const trigger of this.complexTriggers) {
      if (lowerPrompt.includes(trigger)) complexityScore += 2;
    }
    
    for (const trigger of this.simpleTriggers) {
      if (lowerPrompt.includes(trigger)) complexityScore -= 1;
    }
    
    // Length heuristic (long prompts often require more reasoning)
    if (prompt.split(' ').length > 100) {
      complexityScore += 1;
    }

    if (complexityScore >= 2) {
      return {
        complexity: TaskComplexity.COMPLEX,
        confidence: 0.85,
        reasoning: 'Detected analytical/synthesis intent or complex instruction.',
        targetProvider: 'CLOUD'
      };
    } else {
      return {
        complexity: TaskComplexity.SIMPLE,
        confidence: 0.90,
        reasoning: 'Detected basic extraction/summarization intent.',
        targetProvider: 'LOCAL'
      };
    }
  }
}
