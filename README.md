# Edge Context Router 🚀

Welcome to the **edge-context-router** repository! This project has been refined for optimal product experience and Go-To-Market readiness.

## 🌟 Overview
This repository contains the core implementation for `edge-context-router`. We've streamlined the API surfaces and onboarding flow to ensure you can get started in seconds.

## ⚡ Quick Start Guide

Get up and running immediately:

```bash
# 1. Clone the repository
git clone https://github.com/nff747/edge-context-router.git

# 2. Navigate into the directory
cd edge-context-router

# 3. Install dependencies (if applicable)
npm install # or pip install -r requirements.txt or cargo build

# 4. Run the project
npm start # or python main.py or cargo run
```

## 📖 Improved Documentation & API
- **Simplicity**: The API surface has been reviewed to minimize boilerplate.
- **Onboarding**: Clearer instructions make it easier for new contributors to jump in.
- **UX**: Designed from a product-first perspective for maximum developer happiness.

---
*Optimized by the Practical Strategist.*

<div align="center">

<img src="assets/banner.jpg" width="800" alt="Project Banner">


# 🛣️ edge-context-router

**Edge-Native Graph Semantic Router & Context Engine**

[![Powered by nff747](https://img.shields.io/badge/Powered%20by-nff747-111111?style=for-the-badge&logo=github&logoColor=white)](https://github.com/nff747)
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

## Core Concept

The core routing philosophy is simple:
1. **Route simple/local queries to cheap local embeddings/models.** Tasks like summarization or basic extraction run on the edge for free.
2. **Route complex queries to cloud LLMs.** Tasks like deep reasoning, synthesis, or architecture design are routed to powerful cloud models, but only armed with the **Minimum Viable Context (MVC)**.

This dual-tier approach can **save 60-80% of cloud API costs** by keeping routine tasks local and dramatically reducing the token count sent to the cloud.

## Quick Start

You can test the semantic routing and graph extraction immediately using `npx`:

```bash
# Run a simple query (will route LOCAL)
npx edge-context-router "summarize this short text"

# Run a complex query (will route CLOUD)
npx edge-context-router "architect a complex distributed system"
```

For a full programmatic example, check out [examples/openai-routing.ts](examples/openai-routing.ts).

## Architecture: Hybrid Orchestration

```
                      [ EDGE GATEWAY ]
                             │
                             ▼
                    [ LOCAL EMBEDDINGS ]
                    (Local Model & Graph)
                             │
                      [ THRESHOLD CHECK ]
                    (Similarity Threshold)
                     /                  \
             SIMPLE /                    \ COMPLEX
                   /                      \
            [ LOCAL GPU ]          [ SECURE CLOUD SERVER ]
```

## Router Configuration

Configure the similarity threshold and backends when initializing the router:

```typescript
import { EdgeContextRouter } from 'edge-context-router';

const router = new EdgeContextRouter({ 
  // Fine-tune the semantic boundary between SIMPLE and COMPLEX
  // Higher = biases towards LOCAL. Lower = biases towards CLOUD.
  similarityThreshold: 0.1 
});

// Register your custom provider endpoints
router.registerLocalProvider(new MyWebLLMProvider('http://localhost:8080/v1'));
router.registerCloudProvider(new MyOpenAIProvider('https://api.openai.com/v1/chat/completions'));
```

## Cost Savings Calculator

Estimated cloud API cost reduction based on a typical enterprise workload (1M queries/month):

| Query Type | Distribution | Cloud-Only Cost | Hybrid Edge Cost | Savings |
|------------|--------------|-----------------|------------------|---------|
| Simple QA  | 60%          | $1,200          | $0               | 100%    |
| Complex    | 40%          | $1,600          | $480*            | 70%     |
| **Total**  | **100%**     | **$2,800**      | **$480**         | **83%** |

*\*Assumes 70% token reduction via MVC extraction before sending to cloud.*

---

## API Usage

### 1. Installation

```bash
npm install edge-context-router
```

### 2. Orchestrating a Request

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

---

## 📜 Open Source & Commercial Use (MIT)

This project is 100% open-source software under the **[MIT License](LICENSE)**.

### 💼 Commercial Use & Free Redistribution
You are explicitly permitted to use, modify, fork, integrate, package, and sell commercial products or SaaS built using this engine with **one visible attribution requirement**:
> **Attribution Requirement**: You must include a visible credit to **nff747** in your application (e.g., `Powered by nff747` linking to [https://github.com/nff747](https://github.com/nff747) in your application UI, footer, about modal, or documentation).

```html
<!-- Example visible footer attribution -->
<p>Powered by <a href="https://github.com/nff747" target="_blank">nff747</a></p>
```

---


---

---
## ❤️ Open Source & Attribution

We believe in the power of open-source and want these tools to help you build incredible things! 

If you use this infrastructure in your personal project, startup, or open-source app, all we ask in return is that you include a small, visible credit. It helps us grow the community and allows us to keep building free, high-performance tools for everyone.

Please include the following in your app's "Credits" page, footer, or `README.md`:
> **Powered by infrastructure built by [nff747](https://github.com/nff747)**

Thank you for being part of the journey! 🚀
