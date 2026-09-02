/**
 * ═══════════════════════════════════════════════════════════════════
 * Edge Context Router — Core Orchestrator
 * 
 * Binds the Graph, Scorer, and LLM Providers together.
 * Extacts context -> Evaluates intent -> Routes to the correct model.
 * ═══════════════════════════════════════════════════════════════════
 */

import { LocalKnowledgeGraph } from '../graph/LocalKnowledgeGraph';
import { SemanticScorer } from './SemanticScorer';
import { LLMProvider, MinimumViableContext } from '../types';

export class EdgeContextRouter {
  private graph: LocalKnowledgeGraph;
  private scorer: SemanticScorer;
  
  private localProvider: LLMProvider | null = null;
  private cloudProvider: LLMProvider | null = null;

  constructor() {
    this.graph = new LocalKnowledgeGraph();
    this.scorer = new SemanticScorer();
  }

  public registerLocalProvider(provider: LLMProvider) {
    this.localProvider = provider;
  }

  public registerCloudProvider(provider: LLMProvider) {
    this.cloudProvider = provider;
  }

  public getGraph(): LocalKnowledgeGraph {
    return this.graph;
  }

  /**
   * Main entry point.
   * @param prompt The user's query
   * @param entityIds The seed entities identified in the prompt (e.g., via NER)
   */
  public async execute(prompt: string, entityIds: string[]): Promise<string> {
    if (!this.localProvider || !this.cloudProvider) {
      throw new Error('Both Local and Cloud providers must be registered.');
    }

    // 1. Extract Minimum Viable Context
    console.log('[Router] Extracting Minimum Viable Context...');
    const mvc = this.graph.extractMVC(entityIds, 1500);
    console.log(\`[Router] MVC Extracted: \${mvc.nodes.length} nodes, \${mvc.tokenCountEstimate} tokens.\`);

    // 2. Evaluate Task Complexity
    const decision = await this.scorer.evaluate(prompt);
    console.log(\`[Router] Decision: \${decision.targetProvider} (\${decision.complexity}) - \${decision.reasoning}\`);

    // 3. Route & Execute
    const targetProvider = decision.targetProvider === 'LOCAL' 
      ? this.localProvider 
      : this.cloudProvider;

    return targetProvider.execute(prompt, mvc);
  }
}
