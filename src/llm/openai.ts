import type { ChatMessage } from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function chatWithOpenAI(
  apiKey: string,
  messages: ChatMessage[],
  model: string
): Promise<string> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    
    if (response.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your key with /config openai <key>');
    }
    if (response.status === 429) {
      throw new Error('Rate limited by OpenAI. Please wait a moment and try again.');
    }
    if (response.status === 400) {
      throw new Error('Invalid request to OpenAI API. Your message may be too long.');
    }
    
    throw new Error(`OpenAI API error (${response.status}): ${error.slice(0, 200)}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  if (!data.choices?.[0]?.message?.content) {
    throw new Error('No response from ChatGPT');
  }

  return data.choices[0].message.content;
}

