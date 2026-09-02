import { pipeline, env, cos_sim } from '@xenova/transformers';
import { TaskComplexity, RouteDecision } from '../types';

// Use local models or disable them if appropriate in your environment
// env.allowLocalModels = false;

export class SemanticScorer {
  private extractor: any = null;
  
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
  private initialized = false;

  private async initialize() {
    if (this.initialized) return;

    this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });

    // Precompute anchor embeddings
    for (const anchor of this.complexAnchors) {
      const embed = await this.extractor(anchor, { pooling: 'mean', normalize: true });
      this.complexEmbeddings.push(embed.tolist()[0]);
    }

    for (const anchor of this.simpleAnchors) {
      const embed = await this.extractor(anchor, { pooling: 'mean', normalize: true });
      this.simpleEmbeddings.push(embed.tolist()[0]);
    }

    this.initialized = true;
  }

  public async evaluate(prompt: string): Promise<RouteDecision> {
    await this.initialize();

    // Get embedding for prompt
    const promptEmbed = await this.extractor(prompt, { pooling: 'mean', normalize: true });
    const promptTensor = promptEmbed.tolist()[0];

    // Get max similarity for complex
    let maxComplexScore = -1;
    for (const anchorTensor of this.complexEmbeddings) {
      const score = cos_sim(promptTensor, anchorTensor);
      if (score > maxComplexScore) maxComplexScore = score;
    }

    // Get max similarity for simple
    let maxSimpleScore = -1;
    for (const anchorTensor of this.simpleEmbeddings) {
      const score = cos_sim(promptTensor, anchorTensor);
      if (score > maxSimpleScore) maxSimpleScore = score;
    }

    // Length heuristic (long prompts often require more reasoning)
    let complexScore = maxComplexScore;
    let simpleScore = maxSimpleScore;
    
    if (prompt.split(' ').length > 100) {
      complexScore += 0.1;
    }

    if (complexScore > simpleScore) {
      return {
        complexity: TaskComplexity.COMPLEX,
        confidence: Math.round(complexScore * 100) / 100,
        reasoning: `Semantic similarity matched complex intent (score: ${complexScore.toFixed(2)} vs simple: ${simpleScore.toFixed(2)}).`,
        targetProvider: 'CLOUD'
      };
    } else {
      return {
        complexity: TaskComplexity.SIMPLE,
        confidence: Math.round(simpleScore * 100) / 100,
        reasoning: `Semantic similarity matched simple intent (score: ${simpleScore.toFixed(2)} vs complex: ${complexScore.toFixed(2)}).`,
        targetProvider: 'LOCAL'
      };
    }
  }
}
