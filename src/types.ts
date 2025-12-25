// Cloudflare Worker environment bindings
export interface Env {
  CHAT_KV: KVNamespace;
  TELEGRAM_BOT_TOKEN: string;
}

// Supported LLM models
export type LLMModel = 
  // Claude series
  | 'claude-sonnet' 
  | 'claude-haiku'
  | 'claude-opus'
  // GPT-5 series
  | 'gpt-5.2'
  | 'gpt-5-mini'
  // Gemini 3 series
  | 'gemini-3-flash'
  | 'gemini-3-pro'

// User configuration stored in KV
export interface UserConfig {
  anthropicKey?: string;
  openaiKey?: string;
  geminiKey?: string;
  model: LLMModel;
}

// Chat message format (compatible with both Anthropic and OpenAI)
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Conversation history stored in KV
export interface ConversationHistory {
  messages: ChatMessage[];
  updatedAt: number;
}

// Telegram Update types (subset we care about)
export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  first_name?: string;
  last_name?: string;
  username?: string;
}

// LLM Provider interface
export interface LLMProvider {
  chat(messages: ChatMessage[], model: string): Promise<string>;
}

