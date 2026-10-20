export class RouterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RouterError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class MissingProviderError extends RouterError {
  constructor(providerType: 'LOCAL' | 'CLOUD' | 'BOTH') {
    super(`Missing required LLM provider configuration: ${providerType}`);
    this.name = 'MissingProviderError';
  }
}

export class ContextBudgetExceededError extends RouterError {
  constructor(public readonly requested: number, public readonly limit: number) {
    super(`Context token budget exceeded. Requested: ${requested}, Maximum allowed: ${limit}`);
    this.name = 'ContextBudgetExceededError';
  }
}

export class InferenceExecutionError extends RouterError {
  constructor(public readonly providerName: string, originalError?: Error) {
    super(`Inference failed on provider '${providerName}': ${originalError?.message || 'unknown error'}`);
    this.name = 'InferenceExecutionError';
  }
}
