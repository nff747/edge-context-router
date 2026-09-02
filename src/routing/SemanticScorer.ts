import { pipeline, env, cos_sim } from '@xenova/transformers';
import { TaskComplexity, RouteDecision } from '../types';

export class SemanticScorer {
  private extractor: any = null;
  private isWarmingUp = false;
  private initialized = false;

  private complexAnchors = [
    'synthesize and analyze complex data',
    'architect and design a new system',
    'debug and refactor the codebase',
    'evaluate and compare multiple options',
    'step by step complex reasoning and planning'
  ];

  private simpleAnchors = [
    'summarize the text',
    'extract the main points',
    'format this string',
    'answer a simple trivia question',
    'translate this sentence',
    'fix spelling and grammar'
  ];

  private complexEmbeddings: any[] = [];
  private simpleEmbeddings: any[] = [];

  constructor() {
    // Non-blocking background warmup
    this.warmup();
  }

  /**
   * Asynchronously warms up the quantized neural embedding model in the background
   * without blocking application startup or cold-start queries.
   */
  public async warmup(): Promise<void> {
    if (this.initialized || this.isWarmingUp) return;
    this.isWarmingUp = true;

    try {
      this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });

      for (const anchor of this.complexAnchors) {
        const embed = await this.extractor(anchor, { pooling: 'mean', normalize: true });
        this.complexEmbeddings.push(embed.tolist()[0]);
      }

      for (const anchor of this.simpleAnchors) {
        const embed = await this.extractor(anchor, { pooling: 'mean', normalize: true });
        this.simpleEmbeddings.push(embed.tolist()[0]);
      }

      this.initialized = true;
      console.log('[SemanticScorer] Tier-1 Neural Transformer warmed up and active.');
    } catch (e) {
      console.warn('[SemanticScorer] Neural model warming deferred; operating in Tier-0 Speculative Mode.');
    } finally {
      this.isWarmingUp = false;
    }
  }

  /**
   * Dual-Tier Routing Engine:
   * - Tier 0: <0.1ms Zero-Latency Speculative Lexical Scorer (Active during model cold-start)
   * - Tier 1: High-Precision Neural Cosine Similarity (Active once MiniLM weights are loaded)
   */
  public async evaluate(prompt: string): Promise<RouteDecision> {
    if (this.initialized && this.extractor) {
      return this.evaluateNeural(prompt);
    } else {
      return this.evaluateSpeculative(prompt);
    }
  }

  /**
   * Tier 0: Instant sub-millisecond speculative router
   */
  private evaluateSpeculative(prompt: string): RouteDecision {
    const lower = prompt.toLowerCase();
    let complexScore = 0;

    const complexTriggers = ['synthesize', 'compare', 'contrast', 'architect', 'why', 'evaluate', 'debug', 'refactor', 'plan', 'strategy'];
    const simpleTriggers = ['summarize', 'extract', 'format', 'what is', 'who is', 'translate', 'fix'];

    for (const t of complexTriggers) if (lower.includes(t)) complexScore += 2;
    for (const t of simpleTriggers) if (lower.includes(t)) complexScore -= 1;
    if (prompt.split(' ').length > 80) complexScore += 1;

    const isComplex = complexScore >= 2;
    return {
      complexity: isComplex ? TaskComplexity.COMPLEX : TaskComplexity.SIMPLE,
      confidence: 0.88,
      reasoning: `[Tier-0 Speculative Engine (<0.1ms TTFB)]: Intent classified as ${isComplex ? 'COMPLEX' : 'SIMPLE'} based on lexical density.`,
      targetProvider: isComplex ? 'CLOUD' : 'LOCAL'
    };
  }

  /**
   * Tier 1: High-Precision Quantized Neural Cosine Engine
   */
  private async evaluateNeural(prompt: string): Promise<RouteDecision> {
    const promptEmbed = await this.extractor(prompt, { pooling: 'mean', normalize: true });
    const promptTensor = promptEmbed.tolist()[0];

    let maxComplexScore = -1;
    for (const anchor of this.complexEmbeddings) {
      const score = cos_sim(promptTensor, anchor);
      if (score > maxComplexScore) maxComplexScore = score;
    }

    let maxSimpleScore = -1;
    for (const anchor of this.simpleEmbeddings) {
      const score = cos_sim(promptTensor, anchor);
      if (score > maxSimpleScore) maxSimpleScore = score;
    }

    let complexScore = maxComplexScore;
    let simpleScore = maxSimpleScore;
    if (prompt.split(' ').length > 100) complexScore += 0.1;

    const isComplex = complexScore > simpleScore;
    return {
      complexity: isComplex ? TaskComplexity.COMPLEX : TaskComplexity.SIMPLE,
      confidence: Math.round((isComplex ? complexScore : simpleScore) * 100) / 100,
      reasoning: `[Tier-1 Neural Transformer]: Cosine similarity matched ${isComplex ? 'complex' : 'simple'} intent (${complexScore.toFixed(2)} vs ${simpleScore.toFixed(2)}).`,
      targetProvider: isComplex ? 'CLOUD' : 'LOCAL'
    };
  }
}
