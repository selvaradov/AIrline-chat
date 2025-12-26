# Deployment Guide

This guide is for **developers who want to host their own instance** of Airline Chat.

Regular users should just message an existing bot - see [README.md](README.md) for user instructions.

---

## Prerequisites

- [x] Cloudflare account (logged in via `wrangler login`)
- [x] KV namespace created (`CHAT_KV` - already configured)
- [ ] Telegram bot token from @BotFather

## Steps

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the prompts to name your bot
4. Copy the API token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Deploy to Cloudflare (First!)

Deploy first to create the worker, then add secrets:

```bash
npm run deploy
```

This will output a URL like: `https://airline-chat.YOUR_SUBDOMAIN.workers.dev`

### 3. Set Secrets

```bash
# Required: Telegram bot token
npx wrangler secret put TELEGRAM_BOT_TOKEN

# Required: Webhook secret (prevents spoofed requests)
# Generate a random string, e.g.: openssl rand -hex 32
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET
```

The webhook secret ensures only Telegram can call your webhook. Without it, anyone could spoof requests.

### 4. Test Your Bot!

**The webhook will auto-register on first request!** Just message your bot and it'll set itself up.

1. Open Telegram
2. Search for your bot by username (you set this with BotFather)
3. Send `/start`
4. Configure an API key: `/config gemini YOUR_KEY`
5. Start chatting!

*Note: The first message might take a couple seconds as the webhook registers. After that, it's instant.*

### 5. Set Up Command Menu (Recommended)

Make commands show autocomplete hints when users type `/`:

**Steps:**
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/setcommands`
3. Select your bot
4. Paste this command list:

```
start - Welcome message and setup instructions
help - Show all available commands
config - Set your API key (e.g., /config gemini YOUR_KEY)
model - Switch LLM model
models - List all available models
status - Show your current configuration
clear - Clear conversation history and start fresh
```

5. BotFather will confirm: "Success! Command list updated."

Now when users type `/` in your bot, they'll see all commands with descriptions! 🎉

**Optional extras with BotFather:**
- `/setdescription` - Short description users see before starting
  ```
  Chat with AI (Claude, GPT, Gemini) on airplane WiFi. 
  Works on free messaging-only connections.
  ```
- `/setabouttext` - About text in bot profile
- `/setuserpic` - Set a profile picture

---

## Auto-Deploy with GitHub Actions (Optional)

Push to main and automatically deploy!

### Automated Setup (Recommended if you trust GitHub CLI)

```bash
# Install GitHub CLI if you don't have it
# macOS: brew install gh
# Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md
# Windows: https://github.com/cli/cli/releases

# Run the setup script
./setup-github-actions.sh

# After setup, remove the GitHub CLI token if desired:
gh auth logout
rm -f ~/.config/gh/hosts.yml
```

This script will:
1. Get your Cloudflare Account ID automatically
2. Open browser for you to create an API token
3. Add both secrets to GitHub automatically

### Manual Setup (Recommended for WSL/Linux)

GitHub CLI stores tokens in plain text on Linux/WSL. Manual setup is more secure:

**1. Get Cloudflare Credentials:**

```bash
# Get Account ID
npx wrangler whoami
# Look for "Account ID: abc123..."

# Get API Token
# Open: https://dash.cloudflare.com/profile/api-tokens
# 1. Create Token → Use template "Edit Cloudflare Workers"
#    (Auto-sets: Workers Scripts:Edit + Workers KV Storage:Edit)
# 2. Select your account under "Account Resources"
# 3. Create and copy the token
```

**2. Add to GitHub (Web UI - Most Secure):**

1. Go to your repo on github.com
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add first secret:
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: Paste your token
   - Click **"Add secret"**
5. Add second secret:
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: Paste your account ID
   - Click **"Add secret"**

**OR via GitHub CLI** (stores token in plain text on Linux/WSL):

```bash
echo "YOUR_TOKEN" | gh secret set CLOUDFLARE_API_TOKEN
echo "YOUR_ACCOUNT_ID" | gh secret set CLOUDFLARE_ACCOUNT_ID

# Clean up afterward:
gh auth logout
rm -f ~/.config/gh/hosts.yml
```

### 3. Push and Deploy!

```bash
git push origin main
```

Check the **Actions** tab to see your deployment!

**What auto-deploys:**
- ✅ Code changes on every push to `main`
- ✅ TypeScript type checks before deploy

**What's still manual (one-time):**
- Bot token: `npx wrangler secret put TELEGRAM_BOT_TOKEN`

---

## Troubleshooting

### Check webhook status

The webhook auto-registers, but you can verify it:

```bash
curl https://airline-chat.YOUR_SUBDOMAIN.workers.dev/webhook-info
```

### Manually re-register webhook

If you need to manually trigger webhook registration:

```bash
curl -X POST https://airline-chat.YOUR_SUBDOMAIN.workers.dev/set-webhook \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

(This endpoint requires your `TELEGRAM_WEBHOOK_SECRET` for authorization)

### View live logs

```bash
npx wrangler tail
```

### Test locally (requires ngrok for webhooks)

```bash
npm run dev
```

## Getting Free API Keys

**Gemini (Recommended for free tier):**
1. Go to https://aistudio.google.com/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key (format: `AIzaSy...`)

**Anthropic (Paid):**
- https://console.anthropic.com/

**OpenAI (Paid):**
- https://platform.openai.com/api-keys

## Next Steps

Share your bot with friends! They can:
1. Message the bot
2. Configure their own API keys with `/config`
3. Start chatting on airplane WiFi

