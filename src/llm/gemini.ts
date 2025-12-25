import type { ChatMessage } from '../types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function chatWithGemini(
  apiKey: string,
  messages: ChatMessage[],
  model: string
): Promise<string> {
  // Convert our message format to Gemini's format
  // Gemini uses "contents" with "parts" and different role names
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini API error:', error);
    
    if (response.status === 400 && error.includes('API_KEY')) {
      throw new Error('Invalid Gemini API key. Please check your key with /config gemini <key>');
    }
    if (response.status === 429) {
      throw new Error('Rate limited by Gemini. Please wait a moment and try again.');
    }
    
    throw new Error(`Gemini API error (${response.status}): ${error.slice(0, 200)}`);
  }

  const data = await response.json() as {
    candidates?: Array<{
      content: {
        parts: Array<{ text: string }>;
      };
    }>;
    error?: { message: string };
  };

  if (data.error) {
    throw new Error(`Gemini error: ${data.error.message}`);
  }

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('No response from Gemini');
  }

  return data.candidates[0].content.parts.map(p => p.text).join('');
}

