import type { ChatMessage, UserConfig } from '../types';
import { getProviderForModel, getModelId } from '../models';
import { chatWithClaude } from './anthropic';
import { chatWithOpenAI } from './openai';
import { chatWithGemini } from './gemini';

export interface ChatResult {
  success: boolean;
  response?: string;
  error?: string;
}

export async function chat(
  config: UserConfig,
  messages: ChatMessage[]
): Promise<ChatResult> {
  const provider = getProviderForModel(config.model);
  const modelId = getModelId(config.model);

  try {
    let response: string;

    switch (provider) {
      case 'anthropic': {
        if (!config.anthropicKey) {
          return {
            success: false,
            error: `You need to set an Anthropic API key to use ${config.model}.\n\nUse: /config anthropic <your-api-key>`,
          };
        }
        response = await chatWithClaude(config.anthropicKey, messages, modelId);
        break;
      }

      case 'openai': {
        if (!config.openaiKey) {
          return {
            success: false,
            error: `You need to set an OpenAI API key to use ${config.model}.\n\nUse: /config openai <your-api-key>`,
          };
        }
        response = await chatWithOpenAI(config.openaiKey, messages, modelId);
        break;
      }

      case 'gemini': {
        if (!config.geminiKey) {
          return {
            success: false,
            error: `You need to set a Gemini API key to use ${config.model}.\n\nUse: /config gemini <your-api-key>\n\nGet a free key at: https://aistudio.google.com/apikey`,
          };
        }
        response = await chatWithGemini(config.geminiKey, messages, modelId);
        break;
      }

      default:
        return {
          success: false,
          error: `Unknown provider for model ${config.model}`,
        };
    }

    return { success: true, response };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: message };
  }
}

