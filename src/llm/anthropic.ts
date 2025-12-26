import type { ChatMessage } from '../types';
import { SYSTEM_PROMPT } from './system-prompt';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function chatWithClaude(
  apiKey: string,
  messages: ChatMessage[],
  model: string
): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Anthropic API error:', error);
    
    if (response.status === 401) {
      throw new Error('Invalid Anthropic API key. Please check your key with /config anthropic <key>');
    }
    if (response.status === 429) {
      throw new Error('Rate limited by Anthropic. Please wait a moment and try again.');
    }
    if (response.status === 400) {
      throw new Error('Invalid request to Anthropic API. Your message may be too long.');
    }
    
    throw new Error(`Anthropic API error (${response.status}): ${error.slice(0, 200)}`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
  };

  // Extract text from response
  const textBlocks = data.content.filter(block => block.type === 'text');
  if (textBlocks.length === 0) {
    throw new Error('No text response from Claude');
  }

  return textBlocks.map(block => block.text).join('\n');
}

