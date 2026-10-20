import { describe, it, expect } from 'vitest';
import { LocalKnowledgeGraph } from '../src/graph/LocalKnowledgeGraph';

describe('LocalKnowledgeGraph', () => {
  it('adds and retrieves nodes', () => {
    const graph = new LocalKnowledgeGraph();
    graph.addNode({ id: 'doc1', type: 'document', content: 'Architecture overview for edge router' });
    graph.addNode({ id: 'user1', type: 'actor', content: 'Lead Systems Architect' });

    expect(graph.getNodeCount()).toBe(2);
    expect(graph.hasNode('doc1')).toBe(true);
    expect(graph.hasNode('unknown')).toBe(false);
    expect(graph.getNode('doc1')?.content).toContain('Architecture overview');
  });

  it('adds bidirectional edges between nodes', () => {
    const graph = new LocalKnowledgeGraph();
    graph.addNode({ id: 'n1', type: 'concept', content: 'WebGPU' });
    graph.addNode({ id: 'n2', type: 'concept', content: 'WGSL' });

    graph.addEdge({ source: 'n1', target: 'n2', relation: 'uses', weight: 1.0 });

    const n1Edges = graph.getEdges('n1');
    const n2Edges = graph.getEdges('n2');

    expect(n1Edges.length).toBe(1);
    expect(n1Edges[0].target).toBe('n2');
    expect(n2Edges.length).toBe(1);
    expect(n2Edges[0].target).toBe('n1');
  });

  it('clears all nodes and edges', () => {
    const graph = new LocalKnowledgeGraph();
    graph.addNode({ id: 'n1', type: 'concept', content: 'Alpha' });
    graph.clear();
    expect(graph.getNodeCount()).toBe(0);
    expect(graph.getEdgeCount()).toBe(0);
  });

  it('extracts MVC bounded by token budget', () => {
    const graph = new LocalKnowledgeGraph();
    graph.addNode({ id: 'doc1', type: 'doc', content: 'one two three four five' }); // ~7 tokens
    graph.addNode({ id: 'doc2', type: 'doc', content: 'six seven eight nine ten' });
    graph.addEdge({ source: 'doc1', target: 'doc2', relation: 'next', weight: 1.0 });

    const mvc = graph.extractMVC(['doc1'], 10); // budget only allows doc1
    expect(mvc.nodes.length).toBe(1);
    expect(mvc.nodes[0].id).toBe('doc1');
    expect(mvc.rawText).toContain('one two three');
  });

  it('terminates cleanly on cyclic graphs without infinite loops', () => {
    const graph = new LocalKnowledgeGraph();
    graph.addNode({ id: 'a', type: 'node', content: 'Node A' });
    graph.addNode({ id: 'b', type: 'node', content: 'Node B' });
    graph.addNode({ id: 'c', type: 'node', content: 'Node C' });

    graph.addEdge({ source: 'a', target: 'b', relation: 'links', weight: 1.0 });
    graph.addEdge({ source: 'b', target: 'c', relation: 'links', weight: 1.0 });
    graph.addEdge({ source: 'c', target: 'a', relation: 'cycles', weight: 1.0 });

    const mvc = graph.extractMVC(['a'], 500, 2);
    expect(mvc.nodes.length).toBe(3);
  });
});
