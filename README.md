# AI Quota Monitor

A professional web dashboard to monitor your AI service quotas across multiple providers.

## Features

- 🔐 **Secure Vault**: Credentials are encrypted with AES-256 before being stored on disk.
- 📊 **Unified Monitoring**:
  - **Google Antigravity**: Gemini/Claude usage via Google Cloud.
  - **OpenAI ChatGPT Plus**: Real-time message limits (GPT-4o, o1, etc.).
  - **GLM Coding Plan**: Zhipu AI / Z.AI usage.
- ⚡ **HTMX-Powered**: Real-time updates without full page refreshes.
- 🎨 **Cyberpunk Aesthetic**: Modern dark theme UI with data masking for security.
- 🛡️ **Admin Protected**: Settings and linking pages are password-protected.

## Setup & Deployment

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=4192
BASE_URL=https://usage.roughyy.com
ADMIN_PASSWORD=your_secure_password

# Optional: Custom Google OAuth Credentials
# ANTIGRAVITY_CLIENT_ID=your_id.apps.googleusercontent.com
# ANTIGRAVITY_CLIENT_SECRET=your_secret
```

### Installation

```bash
# Install dependencies
npm install

# Start the server
npm start
```

## Security for Deployment

1. **HTTPS**: Google OAuth **requires HTTPS** for custom domains like `usage.roughyy.com`. Ensure your server/load balancer handles SSL.
2. **Redirect URI**: In your Google Cloud Console, you must add this exact URL:
   `https://usage.roughyy.com/auth/google/callback`
3. **Admin Password**: Never use the default 'admin' password when hosting on the internet.

## Data Storage

Credentials are stored in the `.data/` directory:
- `tokens.enc` - **Encrypted** vault containing all session tokens and API keys.

**Note:** The `.data/` directory and `.env` file are excluded from git for security.

## Tech Stack

- [Hono](https://hono.dev/) - Web framework
- [HTMX](https://htmx.org/) - Dynamic updates
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Node.js](https://nodejs.org/) - Runtime
