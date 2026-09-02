export interface GraphNode {
  id: string;
  type: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
}

export interface MinimumViableContext {
  nodes: GraphNode[];
  edges: GraphEdge[];
  rawText: string; // The flattened, optimized string to inject into the prompt
  tokenCountEstimate: number;
}

export enum TaskComplexity {
  SIMPLE = 'SIMPLE',       // e.g., extraction, summarization, basic QA
  COMPLEX = 'COMPLEX',     // e.g., multi-step reasoning, synthesis, coding
}

export interface RouteDecision {
  complexity: TaskComplexity;
  confidence: number;
  reasoning: string;
  targetProvider: 'LOCAL' | 'CLOUD';
}

export interface LLMProvider {
  name: string;
  type: 'LOCAL' | 'CLOUD';
  execute(prompt: string, context: MinimumViableContext): Promise<string>;
}
