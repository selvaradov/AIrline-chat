import type { LLMModel } from './types';

// Single source of truth for all model metadata
export interface ModelMetadata {
  id: string;              // API identifier
  name: LLMModel;          // User-facing name
  provider: 'anthropic' | 'openai' | 'gemini';
  description: string;     // Short description
  category: string;        // Display category
  recommended?: boolean;   // Highlight as recommended
}

export const MODELS: ModelMetadata[] = [
  // Claude
  {
    name: 'claude-sonnet',
    id: 'claude-sonnet-4-5-20250929',
    provider: 'anthropic',
    category: 'Claude 4.5 (Anthropic)',
    description: 'Most capable, recommended',
    recommended: true,
  },
  {
    name: 'claude-haiku',
    id: 'claude-haiku-4-5-20251001',
    provider: 'anthropic',
    category: 'Claude 4.5 (Anthropic)',
    description: 'Faster, cheaper',
  },
  {
    name: 'claude-opus',
    id: 'claude-opus-4-5-20251101',
    provider: 'anthropic',
    category: 'Claude 4.5 (Anthropic)',
    description: 'Maximum intelligence',
  },
  
  // GPT-5
  {
    name: 'gpt-5.2',
    id: 'gpt-5.2-2025-12-11',
    provider: 'openai',
    category: 'GPT-5 (OpenAI)',
    description: 'Latest release',
  },
  {
    name: 'gpt-5-mini',
    id: 'gpt-5-mini-2025-08-07',
    provider: 'openai',
    category: 'GPT-5 (OpenAI)',
    description: 'Faster, cheaper',
  },
  
  // Gemini
  {
    name: 'gemini-3-flash',
    id: 'gemini-3-flash-preview',
    provider: 'gemini',
    category: 'Gemini 3 (Google)',
    description: 'Fast & free tier!',
    recommended: true,
  },
  {
    name: 'gemini-3-pro',
    id: 'gemini-3-pro-preview',
    provider: 'gemini',
    category: 'Gemini 3 (Google)',
    description: 'More capable',
  },
];

// Derived helpers

export function getModelById(name: LLMModel): ModelMetadata | undefined {
  return MODELS.find(m => m.name === name);
}

export function getModelId(name: LLMModel): string {
  const model = getModelById(name);
  if (!model) {
    throw new Error(`Unknown model: ${name}`);
  }
  return model.id;
}

export function getProviderForModel(name: LLMModel): 'anthropic' | 'openai' | 'gemini' {
  const model = getModelById(name);
  if (!model) {
    throw new Error(`Unknown model: ${name}`);
  }
  return model.provider;
}

export function getAllModelNames(): LLMModel[] {
  return MODELS.map(m => m.name);
}

export function isValidModel(name: string): name is LLMModel {
  return MODELS.some(m => m.name === name);
}

export function getModelsByProvider(provider: 'anthropic' | 'openai' | 'gemini'): ModelMetadata[] {
  return MODELS.filter(m => m.provider === provider);
}

export function getModelInfo(): string {
  // Group models by category
  const categories = new Map<string, ModelMetadata[]>();
  
  for (const model of MODELS) {
    if (!categories.has(model.category)) {
      categories.set(model.category, []);
    }
    categories.get(model.category)!.push(model);
  }
  
  // Build help text
  let result = 'Available models:\n\n';
  
  for (const [category, models] of categories) {
    // Add provider info for API keys
    const provider = models[0].provider;
    const providerText = provider === 'anthropic' ? 'Anthropic' : 
                        provider === 'openai' ? 'OpenAI' : 'Gemini';
    
    result += `*${category}:*\n`;
    
    for (const model of models) {
      const rec = model.recommended ? ' (recommended)' : '';
      result += `• \`${model.name}\` - ${model.description}${rec}\n`;
    }
    result += '\n';
  }
  
  result += 'Use `/model <name>` to switch models.';
  
  return result;
}

