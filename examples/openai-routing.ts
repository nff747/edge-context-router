import { EdgeContextRouter, LLMProvider, MinimumViableContext } from '../src';

class OpenAIProvider implements LLMProvider {
  constructor(public name: string, public endpoint: string, private apiKey: string) {}
  readonly type = 'CLOUD';

  async execute(prompt: string, context: MinimumViableContext): Promise<string> {
    console.log(`[OpenAIProvider] Sending to ${this.endpoint}`);
    // Simulated OpenAI call
    return `Mock OpenAI Response for: "${prompt}" using ${context.tokenCountEstimate} tokens of context.`;
  }
}

class WebGPUProvider implements LLMProvider {
  constructor(public name: string, public endpoint: string) {}
  readonly type = 'LOCAL';

  async execute(prompt: string, context: MinimumViableContext): Promise<string> {
    console.log(`[WebGPUProvider] Sending to ${this.endpoint}`);
    // Simulated Local WebGPU call
    return `Mock WebGPU Response for: "${prompt}" using ${context.tokenCountEstimate} tokens of context.`;
  }
}

async function runExample() {
  const router = new EdgeContextRouter({ similarityThreshold: 0.1 });
  
  router.registerLocalProvider(new WebGPUProvider('Local Llama 3 8B', 'http://localhost:8080/v1'));
  router.registerCloudProvider(new OpenAIProvider('GPT-4o', 'https://api.openai.com/v1/chat/completions', 'sk-...'));

  router.getGraph().addNode({ id: '1', type: 'concept', content: 'EdgeContextRouter is a zero-latency AI router.' });

  const query = 'Can you architect a complex distributed system using EdgeContextRouter?';
  console.log(`Query: ${query}`);
  const result = await router.execute(query, ['1']);
  console.log(`Result: ${result}`);
}

runExample().catch(console.error);
