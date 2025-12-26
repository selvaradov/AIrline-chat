# Airline Chat Bot 🤖✈️

A Telegram bot that lets you chat with Claude, ChatGPT, or Gemini on messaging-only free aeroplane WiFi, just by bringing your own API key.

I know of at least [two](https://www.preethamrn.com/posts/chatgpt-over-whatsapp) [other](https://medium.com/@suhyeon-tokamak/building-a-free-llm-chatbot-for-airplane-wifi-using-telegram-and-google-gemini-247cc0292df3) earlier projects doing the same thing (though I came up with the idea independently). The main advantage of this version is that there's no end-user setup required besides creating an API key, whereas in other implementations users need to create a new instance of the server. 

As described more below, _technically_ I could read user API keys submitted to the database, but I won't, and you can of course use the LLM provider consoles to set spending limits & revoke API keys. 


_All code and remainder of README written by Opus 4.5._



## Quick Start (For Users)

1. **Message the bot** [on Telegram](https://t.me/AIrlineChatBot) (username: `@AIrlineChatBot`)
2. **Send** `/start` to begin
3. **Get a free API key** (recommended: [Gemini](https://aistudio.google.com/apikey))
4. **Configure it**: `/config gemini YOUR_API_KEY`
5. **Start chatting!**

That's it. Your conversation history is saved automatically.

<img height="1500" alt="App logo by Nano Banana Pro" src="https://github.com/user-attachments/assets/5edbcaa6-cb6c-491b-a9fc-ca449bd2dd84" />

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

- 🔒 **Keys encrypted at rest** - Cloudflare KV uses AES-256 encryption
- 👤 **User isolation** - Other users can't access your keys 
- 📊 **No logging** - The bot doesn't log conversations or keys
- 🔑 **You control costs** - Pay your LLM provider directly, set your own spending limits
- 🗑️ **Rotate anytime** - Change your API key at your provider's dashboard

**Honest note:** The bot operator has access to Cloudflare KV and could technically view stored keys. This is true of all hosted services. The code doesn't expose keys, but you're trusting the operator. For maximum safety, set spending limits at your LLM provider.

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
