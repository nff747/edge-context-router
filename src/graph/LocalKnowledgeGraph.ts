/**
 * ═══════════════════════════════════════════════════════════════════
 * Edge Context Router — Knowledge Graph
 * 
 * An in-memory graph structure optimized for the browser.
 * Extracts Minimum Viable Context (MVC) using a weighted 
 * Breadth-First Search (BFS) bounded by a token budget.
 * ═══════════════════════════════════════════════════════════════════
 */

import { GraphNode, GraphEdge, MinimumViableContext } from '../types';

export class LocalKnowledgeGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge[]> = new Map();

  public addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    if (!this.edges.has(node.id)) {
      this.edges.set(node.id, []);
    }
  }

  public addEdge(edge: GraphEdge): void {
    const sourceEdges = this.edges.get(edge.source);
    if (sourceEdges) sourceEdges.push(edge);
    
    // Assuming undirected/bidirectional traversal for context retrieval
    const targetEdges = this.edges.get(edge.target);
    if (targetEdges) targetEdges.push({ source: edge.target, target: edge.source, relation: edge.relation, weight: edge.weight });
  }

  /**
   * Extracts the Minimum Viable Context (MVC) starting from seed entities.
   * Traverses outward until the maxTokenBudget is hit.
   */
  public extractMVC(seedIds: string[], maxTokenBudget: number = 1000): MinimumViableContext {
    const mvcNodes = new Map<string, GraphNode>();
    const mvcEdges: GraphEdge[] = [];
    
    let currentTokenEstimate = 0;
    
    // Priority queue based on edge weights would be used here in production.
    // Scaffolded as a simple BFS queue for architectural clarity.
    const queue: { id: string, depth: number }[] = seedIds.map(id => ({ id, depth: 0 }));
    const visited = new Set<string>();

    while (queue.length > 0 && currentTokenEstimate < maxTokenBudget) {
      const { id, depth } = queue.shift()!;
      if (visited.has(id)) continue;
      
      visited.add(id);
      const node = this.nodes.get(id);
      
      if (node) {
        // Very rough heuristic: 1 word ~ 1.3 tokens
        const tokens = Math.ceil((node.content.split(' ').length) * 1.3); 
        
        if (currentTokenEstimate + tokens > maxTokenBudget) {
          break; // Budget exhausted, halt expansion
        }
        
        mvcNodes.set(id, node);
        currentTokenEstimate += tokens;
        
        // Add edges connecting to already extracted nodes
        const adjacent = this.edges.get(id) || [];
        for (const edge of adjacent) {
          if (mvcNodes.has(edge.target)) {
            mvcEdges.push(edge);
          }
          if (!visited.has(edge.target) && depth < 3) { // Max 3 degrees of separation
            queue.push({ id: edge.target, depth: depth + 1 });
          }
        }
      }
    }

    // Flatten into string format for LLM injection
    const rawText = Array.from(mvcNodes.values())
      .map(n => \`[\${n.type}] \${n.id}: \${n.content}\`)
      .join('\\n');

    return {
      nodes: Array.from(mvcNodes.values()),
      edges: mvcEdges,
      rawText,
      tokenCountEstimate: currentTokenEstimate
    };
  }
}
