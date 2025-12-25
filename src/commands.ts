import type { Env, UserConfig, LLMModel } from './types';
import { 
  getUserConfig, 
  updateUserConfig, 
  clearConversationHistory, 
  maskApiKey,
} from './storage';
import { 
  getModelInfo,
  getAllModelNames,
  isValidModel,
  getProviderForModel,
} from './models';

export interface CommandResult {
  response: string;
  handled: boolean;
}

// Check if text is a command
export function isCommand(text: string): boolean {
  return text.startsWith('/');
}

// Parse and handle commands
export async function handleCommand(
  text: string,
  userId: number,
  env: Env
): Promise<CommandResult> {
  const parts = text.trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case '/start':
      return { response: getStartMessage(), handled: true };

    case '/help':
      return { response: getHelpMessage(), handled: true };

    case '/config':
      return await handleConfigCommand(args, userId, env);

    case '/model':
      return await handleModelCommand(args, userId, env);

    case '/models':
      return { response: getModelInfo(), handled: true };

    case '/clear':
      return await handleClearCommand(userId, env);

    case '/status':
      return await handleStatusCommand(userId, env);

    default:
      return { 
        response: `Unknown command: ${command}\n\nType /help for available commands.`, 
        handled: true 
      };
  }
}

function getStartMessage(): string {
  return `✈️ *Welcome to Airline Chat!*

I'm an LLM chatbot that works on airplane WiFi. Just message me and I'll respond using AI.

*Quick Setup:*
1. Get an API key (Gemini is free!)
2. Configure it: \`/config gemini YOUR_KEY\`
3. Start chatting!

*Get a free Gemini key:*
https://aistudio.google.com/apikey

Type /help for all commands.`;
}

function getHelpMessage(): string {
  return `*Airline Chat Bot* ✈️

Chat with Claude, ChatGPT, or Gemini through Telegram - works on airplane WiFi that only allows messaging apps!

*How it works:*
You message this bot → Bot calls AI on server → Response comes back to you
Your airplane WiFi only needs to allow Telegram, not general internet access.

*Available Commands:*

*Setup:*
• \`/config anthropic <key>\` - Set Anthropic API key
• \`/config openai <key>\` - Set OpenAI API key  
• \`/config gemini <key>\` - Set Gemini API key

*Models:*
• \`/model <name>\` - Switch LLM model
• \`/models\` - List available models

*Chat:*
• \`/clear\` - Clear conversation history
• \`/status\` - Show current configuration

*Free Option:*
Get a Gemini key at https://aistudio.google.com/apikey

*Learn More:*
GitHub: https://github.com/selvaradov/AIrline-chat

Just send any message (not starting with /) to chat with the AI!`;
}

async function handleConfigCommand(
  args: string[],
  userId: number,
  env: Env
): Promise<CommandResult> {
  if (args.length < 2) {
    return {
      response: `Usage: \`/config <provider> <api-key>\`

Providers:
• \`anthropic\` - For Claude models
• \`openai\` - For GPT models
• \`gemini\` - For Gemini models (free tier available!)

Example: \`/config gemini AIzaSy...\``,
      handled: true,
    };
  }

  const provider = args[0].toLowerCase();
  const apiKey = args[1];

  let updates: Partial<UserConfig>;

  switch (provider) {
    case 'anthropic':
      updates = { anthropicKey: apiKey };
      break;
    case 'openai':
      updates = { openaiKey: apiKey };
      break;
    case 'gemini':
      updates = { geminiKey: apiKey };
      break;
    default:
      return {
        response: `Unknown provider: ${provider}\n\nValid providers: anthropic, openai, gemini`,
        handled: true,
      };
  }

  await updateUserConfig(env.CHAT_KV, userId, updates);

  return {
    response: `✅ ${provider} API key saved: \`${maskApiKey(apiKey)}\`\n\nYour key is stored securely and only used to call the ${provider} API.`,
    handled: true,
  };
}

async function handleModelCommand(
  args: string[],
  userId: number,
  env: Env
): Promise<CommandResult> {
  if (args.length < 1) {
    const config = await getUserConfig(env.CHAT_KV, userId);
    return {
      response: `Current model: \`${config.model}\`\n\n${getModelInfo()}`,
      handled: true,
    };
  }

  const requestedModel = args[0].toLowerCase() as LLMModel;

  if (!isValidModel(requestedModel)) {
    return {
      response: `Unknown model: ${requestedModel}\n\n${getModelInfo()}`,
      handled: true,
    };
  }

  const config = await updateUserConfig(env.CHAT_KV, userId, { model: requestedModel });
  const provider = getProviderForModel(requestedModel);

  // Check if they have the required key
  let keyStatus = '';
  if (provider === 'anthropic' && !config.anthropicKey) {
    keyStatus = `\n\n⚠️ You need to set an Anthropic key: \`/config anthropic <key>\``;
  } else if (provider === 'openai' && !config.openaiKey) {
    keyStatus = `\n\n⚠️ You need to set an OpenAI key: \`/config openai <key>\``;
  } else if (provider === 'gemini' && !config.geminiKey) {
    keyStatus = `\n\n⚠️ You need to set a Gemini key: \`/config gemini <key>\`\n\nGet a free key: https://aistudio.google.com/apikey`;
  }

  return {
    response: `✅ Model switched to \`${requestedModel}\`${keyStatus}`,
    handled: true,
  };
}

async function handleClearCommand(
  userId: number,
  env: Env
): Promise<CommandResult> {
  await clearConversationHistory(env.CHAT_KV, userId);
  return {
    response: '🗑️ Conversation history cleared. Starting fresh!',
    handled: true,
  };
}

async function handleStatusCommand(
  userId: number,
  env: Env
): Promise<CommandResult> {
  const config = await getUserConfig(env.CHAT_KV, userId);

  const anthropicStatus = config.anthropicKey 
    ? `✅ \`${maskApiKey(config.anthropicKey)}\`` 
    : '❌ Not set';
  const openaiStatus = config.openaiKey 
    ? `✅ \`${maskApiKey(config.openaiKey)}\`` 
    : '❌ Not set';
  const geminiStatus = config.geminiKey 
    ? `✅ \`${maskApiKey(config.geminiKey)}\`` 
    : '❌ Not set';

  return {
    response: `*Current Configuration:*

*Model:* \`${config.model}\`

*API Keys:*
• Anthropic: ${anthropicStatus}
• OpenAI: ${openaiStatus}
• Gemini: ${geminiStatus}

Use \`/config <provider> <key>\` to set keys.
Use \`/model <name>\` to switch models.`,
    handled: true,
  };
}

