#!/usr/bin/env node
import { EdgeContextRouter } from './index';
import { LLMProvider, MinimumViableContext } from './types';

class CLIProvider implements LLMProvider {
  constructor(public name: string, public type: 'LOCAL' | 'CLOUD', public endpoint?: string) {}
  async execute(prompt: string, context: MinimumViableContext): Promise<string> {
    const endpointStr = this.endpoint ? ` via ${this.endpoint}` : '';
    return `[${this.type}] Executed on ${this.name}${endpointStr} using ${context.tokenCountEstimate} tokens from MVC.`;
  }
}

async function run() {
  console.log('🚀 Edge Context Router CLI');
  console.log('---------------------------------');
  
  const router = new EdgeContextRouter({ similarityThreshold: 0.1 });
  router.registerLocalProvider(new CLIProvider('Local WebGPU Model', 'LOCAL', 'http://localhost:8080'));
  router.registerCloudProvider(new CLIProvider('Cloud LLM', 'CLOUD', 'https://api.openai.com/v1/chat/completions'));

  const query = process.argv.slice(2).join(' ');
  if (!query) {
    console.log('Usage: npx edge-context-router "your query here"');
    console.log('\nExample:');
    console.log('npx edge-context-router "summarize this text"');
    process.exit(1);
  }
  
  console.log(`\nQuery: "${query}"`);
  const result = await router.execute(query, []);
  console.log(`\nResult:\n${result}\n`);
}

run().catch(console.error);
