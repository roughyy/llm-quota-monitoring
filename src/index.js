import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { basicAuth } from "hono/basic-auth";

import { PORT, ADMIN_PASSWORD } from "./lib/constants.js";
import {
  createAuthorizationUrl,
  exchangeCodeForTokens,
} from "./lib/antigravity-auth.js";
import { fetchAntigravityQuota } from "./lib/antigravity-quota.js";
import { fetchGlmQuota } from "./lib/glm-quota.js";
import { fetchOpenaiQuota } from "./lib/openai-quota.js";
import {
  getAntigravityTokens,
  clearAntigravityTokens,
  getGlmSettings,
  saveGlmSettings,
  clearGlmSettings,
  getOpenaiTokens,
  saveOpenaiTokens,
  clearOpenaiTokens,
} from "./lib/storage.js";
import { renderDashboard, renderSettings, renderQuotaCard } from "./views/templates.js";

const app = new Hono();

// Auth Middleware for settings and modifications
const auth = basicAuth({
  username: "admin",
  password: ADMIN_PASSWORD,
});

// Serve static files
app.use("/public/*", serveStatic({ root: "./" }));

// Dashboard
app.get("/", async (c) => {
  const antigravityTokens = getAntigravityTokens();
  const glmSettings = getGlmSettings();
  const openaiTokens = getOpenaiTokens();
  return c.html(renderDashboard(antigravityTokens, glmSettings, openaiTokens));
});

// Settings page
app.get("/settings", auth, (c) => {
  const glmSettings = getGlmSettings();
  const openaiTokens = getOpenaiTokens();
  return c.html(renderSettings(glmSettings, openaiTokens));
});

// ============ Auth Routes ============

// Initiate Google OAuth
app.get("/auth/google", auth, (c) => {
  const { url } = createAuthorizationUrl();
  return c.redirect(url);
});

// Google OAuth callback
app.get("/auth/google/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const error = c.req.query("error");

  if (error) {
    return c.html(`
      <html>
        <head><meta http-equiv="refresh" content="2;url=/"></head>
        <body style="font-family: sans-serif; padding: 2rem;">
          <h2>Authentication Failed</h2>
          <p>Error: ${error}</p>
          <p>Redirecting to dashboard...</p>
        </body>
      </html>
    `);
  }

  if (!code || !state) {
    return c.html(`
      <html>
        <head><meta http-equiv="refresh" content="2;url=/"></head>
        <body style="font-family: sans-serif; padding: 2rem;">
          <h2>Invalid Callback</h2>
          <p>Missing code or state parameter.</p>
          <p>Redirecting to dashboard...</p>
        </body>
      </html>
    `);
  }

  try {
    await exchangeCodeForTokens(code, state);
    return c.html(`
      <html>
        <head><meta http-equiv="refresh" content="1;url=/"></head>
        <body style="font-family: sans-serif; padding: 2rem;">
          <h2>✓ Authentication Successful</h2>
          <p>Redirecting to dashboard...</p>
        </body>
      </html>
    `);
  } catch (e) {
    return c.html(`
      <html>
        <head><meta http-equiv="refresh" content="3;url=/"></head>
        <body style="font-family: sans-serif; padding: 2rem;">
          <h2>Authentication Error</h2>
          <p>${e.message}</p>
          <p>Redirecting to dashboard...</p>
        </body>
      </html>
    `);
  }
});

// Logout Antigravity
app.post("/auth/google/logout", auth, (c) => {
  clearAntigravityTokens();
  return c.redirect("/");
});

// ============ API Routes ============

// Fetch Antigravity quota
app.get("/api/antigravity/quota", async (c) => {
  const quota = await fetchAntigravityQuota();
  return c.json(quota);
});

// Fetch GLM quota
app.get("/api/glm/quota", async (c) => {
  const quota = await fetchGlmQuota();
  return c.json(quota);
});

// Fetch OpenAI quota
app.get("/api/openai/quota", async (c) => {
  const quota = await fetchOpenaiQuota();
  return c.json(quota);
});

// HTMX partial: Antigravity quota card
app.get("/partials/antigravity-quota", async (c) => {
  const quota = await fetchAntigravityQuota();
  return c.html(renderQuotaCard("antigravity", quota));
});

// HTMX partial: GLM quota card
app.get("/partials/glm-quota", async (c) => {
  const quota = await fetchGlmQuota();
  return c.html(renderQuotaCard("glm", quota));
});

// HTMX partial: OpenAI quota card
app.get("/partials/openai-quota", async (c) => {
  const quota = await fetchOpenaiQuota();
  return c.html(renderQuotaCard("openai", quota));
});

// ============ Settings Routes ============

// Save GLM settings
app.post("/settings/glm", auth, async (c) => {
  const body = await c.req.parseBody();
  const apiKey = body.apiKey?.toString().trim();
  const baseUrl = body.baseUrl?.toString().trim();

  if (!apiKey || !baseUrl) {
    return c.html(`
      <div class="text-red-500 text-sm mt-2">
        Both API Key and Base URL are required.
      </div>
    `);
  }

  saveGlmSettings({ apiKey, baseUrl });
  return c.redirect("/");
});

// Clear GLM settings
app.post("/settings/glm/clear", auth, (c) => {
  clearGlmSettings();
  return c.redirect("/settings");
});

// Save OpenAI settings
app.post("/settings/openai", auth, async (c) => {
  const body = await c.req.parseBody();
  const accessToken = body.accessToken?.toString().trim();

  if (!accessToken) {
    return c.html(`
      <div class="text-red-500 text-sm mt-2">
        Access Token is required.
      </div>
    `);
  }

  saveOpenaiTokens({ accessToken, lastChecked: new Date().toISOString() });
  return c.redirect("/");
});

// Clear OpenAI settings
app.post("/settings/openai/clear", auth, (c) => {
  clearOpenaiTokens();
  return c.redirect("/settings");
});

// Start server
console.log(`🚀 AI Quota Monitor running at http://localhost:${PORT}`);
serve({
  fetch: app.fetch,
  port: PORT,
});
