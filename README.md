# Antigravity Quota Monitoring

A web dashboard to monitor your AI service quotas for:
- **Google Antigravity** (Gemini, Claude models via Google)
- **GLM Coding Plan** (Zhipu AI / Z.AI)

## Features

- 🔐 Google OAuth authentication for Antigravity
- 📊 Real-time quota monitoring with progress bars
- 🔄 Auto-refresh every 60 seconds
- ⚡ HTMX-powered dynamic updates
- 🎨 Modern dark theme UI with Tailwind CSS

## Setup

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or run in development mode with auto-reload
npm run dev
```

The server runs at http://localhost:3000

## Configuration

### Google Antigravity

1. Click "Login with Google" on the dashboard
2. Authorize with your Google account
3. Quota data will be fetched automatically

### GLM Coding Plan

1. Go to Settings
2. Enter your GLM API Key (`ANTHROPIC_AUTH_TOKEN`)
3. Select your platform (Z.AI or ZHIPU)
4. Save settings

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Dashboard |
| `GET /settings` | Settings page |
| `GET /api/antigravity/quota` | Get Antigravity quota (JSON) |
| `GET /api/glm/quota` | Get GLM quota (JSON) |
| `GET /auth/google` | Start Google OAuth flow |

## Data Storage

Tokens and settings are stored in `.data/` directory:
- `tokens.json` - OAuth tokens for Antigravity
- `settings.json` - GLM API configuration

**Note:** Add `.data/` to your `.gitignore` to avoid committing sensitive data.

## Tech Stack

- [Hono](https://hono.dev/) - Lightweight web framework
- [HTMX](https://htmx.org/) - Dynamic HTML updates
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- Node.js - Runtime
