# Airline Chat Bot 🤖✈️

Chat with Claude, ChatGPT, or Gemini through Telegram - works on airplane WiFi that only allows messaging apps!

_Code written by Opus 4.5._

## Quick Start (For Users)

1. **Message the bot** [on Telegram](https://t.me/AIrlineChatBot) (username: `@AIrlineChatBot`)
2. **Send** `/start` to begin
3. **Get a free API key** (recommended: [Gemini](https://aistudio.google.com/apikey))
4. **Configure it**: `/config gemini YOUR_API_KEY`
5. **Start chatting!**

That's it. Your conversation history is saved automatically.

---

## Why This Exists

Many airlines offer free WiFi for messaging (Telegram, WhatsApp) but charge for general internet. This bot lets you chat with AI through Telegram, bypassing those restrictions.

**Your WiFi only allows Telegram** → You message the bot → **Bot calls AI on your behalf** → You get the response

---

## Commands

| Command | What it does | Example |
|---------|--------------|---------|
| `/start` | Welcome message | `/start` |
| `/help` | Show all commands | `/help` |
| `/config <provider> <key>` | Set your API key | `/config gemini AIzaSy...` |
| `/model <name>` | Switch AI model | `/model claude-sonnet` |
| `/models` | List all models | `/models` |
| `/status` | See your settings | `/status` |
| `/clear` | Clear chat history | `/clear` |

Just type any message (not starting with `/`) to chat with the AI!

---

## Available AI Models

### 🆓 Gemini (Google - Free Tier!)
| Model | Best for |
|-------|----------|
| `gemini-3-flash` | **Quick questions** (default, free!) |
| `gemini-3-pro` | More complex tasks |

**Get your free key:** https://aistudio.google.com/apikey

### 🧠 Claude (Anthropic - Paid)
| Model | Best for |
|-------|----------|
| `claude-sonnet` | **General use** (recommended) |
| `claude-haiku` | Fast responses, coding |
| `claude-opus` | Most capable, complex reasoning |

**Get your key:** https://console.anthropic.com/

### 🤖 GPT (OpenAI - Paid)
| Model | Best for |
|-------|----------|
| `gpt-5.2` | Latest model (expensive) |
| `gpt-5-mini` | Fast and cheap |

**Get your key:** https://platform.openai.com/api-keys

---

## Setup Example

```
You: /start
Bot: Welcome! Get a free Gemini key...

You: /config gemini AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Bot: ✅ gemini API key saved: AIza...XXXX

You: /model gemini-3-flash
Bot: ✅ Model switched to gemini-3-flash

You: explain quantum computing in simple terms
Bot: [AI responds with explanation...]
```

---

## Privacy & Security

- 🔒 **Your API keys are encrypted** and stored securely
- 👤 **Each user is isolated** - only you can access your keys
- 🗑️ **Delete anytime** - Just stop using the bot, no data retention policy
- 📊 **No tracking** - The bot doesn't log your conversations
- 🔑 **You control costs** - You pay your LLM provider directly, set your own spending limits

**Your keys are as secure as the hosting platform** (Cloudflare Workers, industry standard).

---

## Tips

### 💰 Save Money
- Use `gemini-3-flash` (free tier)
- Use `claude-haiku` or `gpt-5-mini` (cheaper than sonnet/opus)
- `/clear` regularly to reduce token usage

### 🎯 Better Responses
- Be specific in your questions
- Use context: "Given what I just asked about X..."
- Try different models for different tasks

### 🚨 Troubleshooting
- **"You need to set an API key"** → Run `/config <provider> <key>`
- **"Invalid API key"** → Check you copied the full key correctly
- **"Rate limited"** → Wait a minute, or switch models
- **No response** → Check `/status` to see your configuration

---

## Cost Examples

With Gemini's free tier: **$0** for normal use

If using paid models (approximate):
- **Light use** (10 messages/day): ~$0.50/month
- **Medium use** (50 messages/day): ~$2-5/month  
- **Heavy use** (200 messages/day): ~$10-20/month

Set spending limits in your LLM provider dashboard!

---

## For Developers / Self-Hosting

Want to host your own instance? See [DEPLOYMENT.md](DEPLOYMENT.md)

**Tech Stack:**
- Cloudflare Workers (serverless)
- Telegram Bot API
- TypeScript

---

## Support

- **Bot not responding?** → Check if the hosting is running
- **Commands not showing?** → The host needs to set them up with BotFather
- **Feature requests?** → Open an issue on GitHub

---

Made for travelers who want AI on airplane WiFi ✈️
