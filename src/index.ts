import type { Env, TelegramMessage } from './types';
import { TelegramClient, parseUpdate, extractMessage } from './telegram';
import { isCommand, handleCommand } from './commands';
import { getUserConfig, getMessagesForLLM, addToConversationHistory } from './storage';
import { chat } from './llm';

const WEBHOOK_REGISTERED_KEY = 'webhook_registered';
const WEBHOOK_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Auto-register webhook on first run (or if manually triggered)
    await ensureWebhookRegistered(env, url.origin);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    // Webhook info endpoint (useful for debugging)
    if (url.pathname === '/webhook-info' && request.method === 'GET') {
      const telegram = new TelegramClient(env.TELEGRAM_BOT_TOKEN);
      const info = await telegram.getWebhookInfo();
      return Response.json(info);
    }

    // Set webhook endpoint (call this once after deployment)
    if (url.pathname === '/set-webhook' && request.method === 'POST') {
      const telegram = new TelegramClient(env.TELEGRAM_BOT_TOKEN);
      const webhookUrl = `${url.origin}/`;
      const success = await telegram.setWebhook(webhookUrl);
      return Response.json({ 
        success, 
        webhookUrl,
        message: success ? 'Webhook set successfully!' : 'Failed to set webhook'
      });
    }

    // Main webhook handler (POST to root)
    if (request.method === 'POST') {
      try {
        const body = await request.json();
        await handleWebhook(body, env);
        // Always return 200 to Telegram to prevent retries
        return new Response('OK', { status: 200 });
      } catch (error) {
        console.error('Webhook error:', error);
        // Still return 200 to prevent Telegram from retrying
        return new Response('OK', { status: 200 });
      }
    }

    // Default response for other requests
    return new Response(
      'Airline Chat Bot - Send me a message on Telegram!', 
      { status: 200 }
    );
  },
};

async function handleWebhook(body: unknown, env: Env): Promise<void> {
  const telegram = new TelegramClient(env.TELEGRAM_BOT_TOKEN);
  
  // Parse the Telegram update
  const update = parseUpdate(body);
  if (!update) {
    console.log('Invalid update received');
    return;
  }

  // Extract the message
  const message = extractMessage(update);
  if (!message) {
    console.log('No text message in update');
    return;
  }

  const chatId = message.chat.id;
  const userId = message.from?.id ?? chatId;
  const text = message.text!;

  console.log(`Message from ${userId}: ${text.slice(0, 50)}...`);

  try {
    // Handle commands
    if (isCommand(text)) {
      const result = await handleCommand(text, userId, env);
      await telegram.sendMessage(chatId, result.response, 'Markdown');
      return;
    }

    // Regular message - send to LLM
    await handleChatMessage(telegram, message, userId, env);
  } catch (error) {
    console.error('Error handling message:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    await telegram.sendMessage(chatId, `❌ Error: ${errorMessage}`);
  }
}

async function handleChatMessage(
  telegram: TelegramClient,
  message: TelegramMessage,
  userId: number,
  env: Env
): Promise<void> {
  const chatId = message.chat.id;
  const text = message.text!;

  // Show typing indicator
  await telegram.sendTypingAction(chatId);

  // Get user config
  const config = await getUserConfig(env.CHAT_KV, userId);

  // Get conversation history + new message
  const messages = await getMessagesForLLM(env.CHAT_KV, userId, text);

  // Call LLM
  const result = await chat(config, messages);

  if (!result.success) {
    await telegram.sendMessage(chatId, `❌ ${result.error}`);
    return;
  }

  const response = result.response!;

  // Save to conversation history
  await addToConversationHistory(env.CHAT_KV, userId, text, response);

  // Send response (will auto-split if too long)
  await telegram.sendMessage(chatId, response, 'Markdown');
}

// Auto-register webhook if not already registered or stale
async function ensureWebhookRegistered(env: Env, origin: string): Promise<void> {
  try {
    // Check if webhook was recently registered
    const lastRegistered = await env.CHAT_KV.get(WEBHOOK_REGISTERED_KEY);
    const now = Date.now();
    
    if (lastRegistered) {
      const lastTime = parseInt(lastRegistered, 10);
      if (now - lastTime < WEBHOOK_CHECK_INTERVAL) {
        // Recently registered, skip
        return;
      }
    }

    // Register webhook
    const telegram = new TelegramClient(env.TELEGRAM_BOT_TOKEN);
    const webhookUrl = `${origin}/`;
    const success = await telegram.setWebhook(webhookUrl);
    
    if (success) {
      // Store registration time
      await env.CHAT_KV.put(WEBHOOK_REGISTERED_KEY, now.toString());
      console.log(`Webhook auto-registered to ${webhookUrl}`);
    } else {
      console.error('Failed to auto-register webhook');
    }
  } catch (error) {
    // Don't fail the request if webhook registration fails
    console.error('Error in ensureWebhookRegistered:', error);
  }
}

