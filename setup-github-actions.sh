#!/bin/bash
# setup-github-actions.sh
# Automates Cloudflare + GitHub Actions setup

set -e  # Exit on error

echo "🚀 Setting up GitHub Actions for Airline Chat"
echo ""

# Check dependencies
command -v wrangler >/dev/null 2>&1 || { echo "❌ wrangler not found. Run: npm install -g wrangler"; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "❌ GitHub CLI not found. Install from: https://cli.github.com/"; exit 1; }

# Check GitHub CLI auth
if ! gh auth status >/dev/null 2>&1; then
    echo "🔐 Logging into GitHub CLI..."
    gh auth login
fi

echo "✅ Prerequisites met"
echo ""

# Get Cloudflare Account ID
echo "📋 Getting Cloudflare Account ID..."
ACCOUNT_ID=$(wrangler whoami 2>/dev/null | grep "Account ID" | awk '{print $NF}')

if [ -z "$ACCOUNT_ID" ]; then
    echo "❌ Could not get Account ID. Make sure you're logged in:"
    echo "   npx wrangler login"
    exit 1
fi

echo "✅ Account ID: $ACCOUNT_ID"
echo ""

# Get API Token (user must create manually for security)
echo "🔑 Creating Cloudflare API Token..."
echo ""
echo "We need to create an API token with the right permissions."
echo "Opening Cloudflare dashboard..."
echo ""

# Open the tokens page in browser
if command -v open >/dev/null 2>&1; then
    open "https://dash.cloudflare.com/profile/api-tokens"
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "https://dash.cloudflare.com/profile/api-tokens"
else
    echo "Please open: https://dash.cloudflare.com/profile/api-tokens"
fi

echo "Create a token with these settings:"
echo ""
echo "  1. Click 'Create Token'"
echo "  2. Click 'Use template' next to 'Edit Cloudflare Workers'"
echo "     (This auto-sets: Workers Scripts:Edit + Workers KV Storage:Edit)"
echo "  3. Under 'Account Resources', select your account"
echo "  4. Click 'Continue to summary' → 'Create Token'"
echo "  5. Copy the token (you only see it once!)"
echo ""
read -p "Paste your API token here: " API_TOKEN

if [ -z "$API_TOKEN" ]; then
    echo "❌ No token provided"
    exit 1
fi

echo ""
echo "✅ Token received"
echo ""

# Add secrets to GitHub
echo "🔐 Adding secrets to GitHub..."
echo ""

# Add Account ID
echo "$ACCOUNT_ID" | gh secret set CLOUDFLARE_ACCOUNT_ID

# Add API Token
echo "$API_TOKEN" | gh secret set CLOUDFLARE_API_TOKEN

echo ""
echo "✅ Secrets added to GitHub!"
echo ""

# Verify
echo "🔍 Verifying secrets..."
gh secret list | grep CLOUDFLARE

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. git add .github/"
echo "  2. git commit -m 'Add GitHub Actions auto-deploy'"
echo "  3. git push origin main"
echo ""
echo "Your bot will auto-deploy on every push to main! 🎉"

