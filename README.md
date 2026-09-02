<div align="center">

# 🛣️ edge-context-router

**Edge-Native Graph Semantic Router & Context Engine**

[![License: MIT](https://img.shields.io/badge/License-MIT-FF0055.svg?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

*Stop dumping massive, noisy payloads into context windows.*<br>
*Extract Minimum Viable Context (MVC) locally. Route simple tasks to WebGPU. Route complex reasoning to the Cloud.*

[The Problem](#the-problem-context-collapse--api-costs) · [Architecture](#architecture-hybrid-orchestration) · [API Usage](#api-usage)

</div>

---

## The Problem: Context Collapse & API Costs

The AI engineering industry is rapidly moving away from basic wrappers towards **Context Engineering**. Two massive anti-patterns exist today:

1. **The RAG Dump:** Fetching 20 vector DB results and dumping 30,000 tokens of noisy context into an LLM. This spikes cloud API costs, increases latency by seconds, and degrades the model's reasoning capabilities (Context Collapse).
2. **The Local Trap:** Trying to force a compressed, 4-bit quantization local model (like Llama-3 8B on WebGPU) to perform complex multi-step reasoning, resulting in hallucinations and failures.

## The Solution: Hybrid Edge Routing

`edge-context-router` runs entirely in the browser to act as a zero-latency orchestration layer:
1. **Local Graph MVC:** It evaluates the user's prompt against an in-memory Graph structure, utilizing bounded Breadth-First Search to extract only the **Minimum Viable Context (MVC)**.
2. **Semantic Routing:** It analyzes the computational complexity of the user's intent.
3. **Hybrid Execution:**
   * *Simple Task (Summarize, Extract, Format):* Routed to a free, fast, local WebGPU model (e.g., WebLLM).
   * *Complex Task (Architect, Synthesize, Code):* Routed to a premium Cloud API (e.g., GPT-4, Claude 3.5 Sonnet) along with the tightly optimized MVC to save tokens.

---

## Architecture: Hybrid Orchestration

```
┌───────────────────────────────────────────────────────────────┐
│ User Prompt: "Summarize the error rate of Node A"             │
└───────────────────────────────┬───────────────────────────────┘
                                │
┌───────────────────────────────▼───────────────────────────────┐
│ 1. LocalKnowledgeGraph (MVC Extraction)                       │
│    - Finds Node A in memory                                   │
│    - Bounded BFS traversal up to Token Limit (e.g., 500)      │
│    - Returns highly relevant sub-graph                        │
└───────────────────────────────┬───────────────────────────────┘
                                │
┌───────────────────────────────▼───────────────────────────────┐
│ 2. SemanticScorer (Complexity Evaluation)                     │
│    - Keyword/Heuristic/Embedding analysis                     │
│    - Decision: SIMPLE TASK (Score: 0.92)                      │
└───────────────────────────────┬───────────────────────────────┘
                                │
             ┌──────────────────┴──────────────────┐
             ▼                                     ▼
     [Route: LOCAL]                         [Route: CLOUD]
┌─────────────────────────┐           ┌─────────────────────────┐
│ Local WebGPU Provider   │           │ Cloud LLM Provider      │
│ (WebLLM / Llama-3 8B)   │           │ (GPT-4o / Claude 3.5)   │
└─────────────────────────┘           └─────────────────────────┘
```

---

## API Usage

### 1. Installation

```bash
npm install edge-context-router
```

### 2. Initialization & Setup

```typescript
import { EdgeContextRouter, LocalKnowledgeGraph } from 'edge-context-router';

const router = new EdgeContextRouter();

// Register your custom provider implementations
router.registerLocalProvider(new MyWebLLMProvider());
router.registerCloudProvider(new MyOpenAIProvider());

// Populate the local graph (e.g., loaded from a client-side database)
const graph = router.getGraph();
graph.addNode({ id: 'doc_1', type: 'DOCUMENT', content: 'The server error rate is 4.2%.' });
```

### 3. Orchestrating a Request

```typescript
// 1. A simple prompt that can be handled locally for free
const prompt1 = "What is the error rate mentioned in the document?";
// The router will extract the MVC for 'doc_1' and route to LOCAL provider
const answer1 = await router.execute(prompt1, ['doc_1']);

// 2. A complex prompt requiring deep reasoning
const prompt2 = "Architect a resilient microservice strategy to mitigate the errors seen in the document.";
// The router detects 'Architect' & 'strategy', routes MVC to CLOUD provider
const answer2 = await router.execute(prompt2, ['doc_1']);
```

---

## License

[MIT](LICENSE) — iKi / Frozen Flame
