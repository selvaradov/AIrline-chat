import type { UserConfig, ConversationHistory, ChatMessage } from './types';

const CONFIG_PREFIX = 'config:';
const HISTORY_PREFIX = 'history:';
const MAX_HISTORY_MESSAGES = 20;

// Default configuration for new users
const DEFAULT_CONFIG: UserConfig = {
  model: 'gemini-3-flash', // Free tier default
};

export async function getUserConfig(kv: KVNamespace, userId: number): Promise<UserConfig> {
  const key = `${CONFIG_PREFIX}${userId}`;
  const data = await kv.get(key, 'json');
  if (!data) {
    return { ...DEFAULT_CONFIG };
  }
  return data as UserConfig;
}

export async function saveUserConfig(kv: KVNamespace, userId: number, config: UserConfig): Promise<void> {
  const key = `${CONFIG_PREFIX}${userId}`;
  await kv.put(key, JSON.stringify(config));
}

export async function updateUserConfig(
  kv: KVNamespace, 
  userId: number, 
  updates: Partial<UserConfig>
): Promise<UserConfig> {
  const current = await getUserConfig(kv, userId);
  const updated = { ...current, ...updates };
  await saveUserConfig(kv, userId, updated);
  return updated;
}

export async function getConversationHistory(
  kv: KVNamespace, 
  userId: number
): Promise<ConversationHistory> {
  const key = `${HISTORY_PREFIX}${userId}`;
  const data = await kv.get(key, 'json');
  if (!data) {
    return { messages: [], updatedAt: Date.now() };
  }
  return data as ConversationHistory;
}

export async function addToConversationHistory(
  kv: KVNamespace,
  userId: number,
  userMessage: string,
  assistantMessage: string
): Promise<void> {
  const history = await getConversationHistory(kv, userId);
  
  // Add new messages
  history.messages.push(
    { role: 'user', content: userMessage },
    { role: 'assistant', content: assistantMessage }
  );
  
  // Trim to max size (keep most recent)
  if (history.messages.length > MAX_HISTORY_MESSAGES) {
    history.messages = history.messages.slice(-MAX_HISTORY_MESSAGES);
  }
  
  history.updatedAt = Date.now();
  
  const key = `${HISTORY_PREFIX}${userId}`;
  await kv.put(key, JSON.stringify(history));
}

export async function clearConversationHistory(kv: KVNamespace, userId: number): Promise<void> {
  const key = `${HISTORY_PREFIX}${userId}`;
  await kv.delete(key);
}

// Helper to get messages for LLM call (includes history)
export async function getMessagesForLLM(
  kv: KVNamespace,
  userId: number,
  newMessage: string
): Promise<ChatMessage[]> {
  const history = await getConversationHistory(kv, userId);
  return [
    ...history.messages,
    { role: 'user' as const, content: newMessage }
  ];
}

// Helper to mask API keys for display
export function maskApiKey(key: string): string {
  if (key.length <= 8) return '****';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

