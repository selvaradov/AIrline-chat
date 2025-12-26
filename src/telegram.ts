import type { TelegramUpdate, TelegramMessage } from './types';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';
const MAX_MESSAGE_LENGTH = 4096;

export class TelegramClient {
  private token: string;
  private apiBase: string;

  constructor(token: string) {
    this.token = token;
    this.apiBase = `${TELEGRAM_API_BASE}${token}`;
  }

  // Send a text message, automatically splitting if too long
  async sendMessage(chatId: number, text: string): Promise<void> {
    const chunks = this.splitMessage(text);
    
    for (const chunk of chunks) {
      await this.sendSingleMessage(chatId, chunk);
    }
  }

  private async sendSingleMessage(chatId: number, text: string): Promise<void> {
    // Try with Markdown parsing first
    const markdownBody = {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
    };

    const response = await fetch(`${this.apiBase}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(markdownBody),
    });

    if (response.ok) {
      return;
    }

    // Markdown parsing failed - fallback to plain text
    console.log('Markdown parsing failed, retrying as plain text');
    const plainBody = {
      chat_id: chatId,
      text: text,
    };

    const plainResponse = await fetch(`${this.apiBase}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plainBody),
    });

    if (!plainResponse.ok) {
      const error = await plainResponse.text();
      console.error('Telegram sendMessage failed:', error);
      throw new Error(`Telegram API error: ${error}`);
    }
  }

  // Send a "typing" indicator
  async sendTypingAction(chatId: number): Promise<void> {
    await fetch(`${this.apiBase}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        action: 'typing',
      }),
    });
    // Ignore errors for typing indicator
  }

  // Split long messages at natural break points
  private splitMessage(text: string): string[] {
    if (text.length <= MAX_MESSAGE_LENGTH) {
      return [text];
    }

    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      if (remaining.length <= MAX_MESSAGE_LENGTH) {
        chunks.push(remaining);
        break;
      }

      // Find a good break point (newline, period, or space)
      let breakPoint = MAX_MESSAGE_LENGTH;
      
      // Try to break at a double newline (paragraph)
      const doubleNewline = remaining.lastIndexOf('\n\n', MAX_MESSAGE_LENGTH);
      if (doubleNewline > MAX_MESSAGE_LENGTH / 2) {
        breakPoint = doubleNewline + 2;
      } else {
        // Try single newline
        const singleNewline = remaining.lastIndexOf('\n', MAX_MESSAGE_LENGTH);
        if (singleNewline > MAX_MESSAGE_LENGTH / 2) {
          breakPoint = singleNewline + 1;
        } else {
          // Try space
          const space = remaining.lastIndexOf(' ', MAX_MESSAGE_LENGTH);
          if (space > MAX_MESSAGE_LENGTH / 2) {
            breakPoint = space + 1;
          }
        }
      }

      chunks.push(remaining.slice(0, breakPoint));
      remaining = remaining.slice(breakPoint);
    }

    return chunks;
  }

  // Set webhook URL for this bot
  async setWebhook(url: string, secretToken?: string): Promise<{ ok: boolean; error?: string }> {
    const body: Record<string, string> = { url };
    if (secretToken) {
      body.secret_token = secretToken;
    }

    const response = await fetch(`${this.apiBase}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await response.json() as { ok: boolean; description?: string };
    if (!result.ok) {
      console.error('Failed to set webhook:', result.description);
      return { ok: false, error: result.description };
    }
    return { ok: true };
  }

  // Delete webhook (for switching to polling mode)
  async deleteWebhook(): Promise<boolean> {
    const response = await fetch(`${this.apiBase}/deleteWebhook`, {
      method: 'POST',
    });

    const result = await response.json() as { ok: boolean };
    return result.ok;
  }

  // Get webhook info
  async getWebhookInfo(): Promise<unknown> {
    const response = await fetch(`${this.apiBase}/getWebhookInfo`);
    return response.json();
  }
}

// Parse incoming webhook update
export function parseUpdate(body: unknown): TelegramUpdate | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const update = body as TelegramUpdate;
  
  if (typeof update.update_id !== 'number') {
    return null;
  }

  return update;
}

// Extract text message from update
export function extractMessage(update: TelegramUpdate): TelegramMessage | null {
  if (!update.message?.text) {
    return null;
  }
  return update.message;
}

