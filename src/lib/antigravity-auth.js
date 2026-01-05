import crypto from "crypto";
import {
  ANTIGRAVITY_CLIENT_ID,
  ANTIGRAVITY_CLIENT_SECRET,
  ANTIGRAVITY_REDIRECT_URI,
  ANTIGRAVITY_SCOPES,
  ANTIGRAVITY_USER_AGENT,
  ANTIGRAVITY_API_CLIENT,
  CODE_ASSIST_ENDPOINTS,
} from "./constants.js";
import { getAntigravityTokens, saveAntigravityTokens } from "./storage.js";

// PKCE helpers
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier) {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// Store PKCE verifier temporarily (in-memory for simplicity)
const pendingAuth = new Map();

export function createAuthorizationUrl() {
  const state = crypto.randomBytes(16).toString("hex");
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Store verifier for later exchange
  pendingAuth.set(state, { codeVerifier, createdAt: Date.now() });

  // Clean old entries (older than 10 minutes)
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  for (const [key, value] of pendingAuth.entries()) {
    if (value.createdAt < tenMinutesAgo) {
      pendingAuth.delete(key);
    }
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", ANTIGRAVITY_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", ANTIGRAVITY_REDIRECT_URI);
  url.searchParams.set("scope", ANTIGRAVITY_SCOPES.join(" "));
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  return { url: url.toString(), state };
}

export async function exchangeCodeForTokens(code, state) {
  const pending = pendingAuth.get(state);
  if (!pending) {
    throw new Error("Invalid or expired state parameter");
  }

  const { codeVerifier } = pending;
  pendingAuth.delete(state);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: ANTIGRAVITY_CLIENT_ID,
      client_secret: ANTIGRAVITY_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: ANTIGRAVITY_REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const tokens = await response.json();

  // Get user info
  const userInfoResponse = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    }
  );

  let email = null;
  if (userInfoResponse.ok) {
    const userInfo = await userInfoResponse.json();
    email = userInfo.email;
  }

  // Get project ID and tier
  const accountInfo = await fetchAccountInfo(tokens.access_token);

  const tokenData = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    email,
    projectId: accountInfo.projectId,
    tier: accountInfo.tier,
  };

  saveAntigravityTokens(tokenData);
  return tokenData;
}

async function fetchAccountInfo(accessToken) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "User-Agent": ANTIGRAVITY_USER_AGENT,
    "X-Goog-Api-Client": ANTIGRAVITY_API_CLIENT,
  };

  for (const endpoint of CODE_ASSIST_ENDPOINTS) {
    try {
      const response = await fetch(`${endpoint}/v1internal:loadCodeAssist`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          metadata: {
            ideType: "IDE_UNSPECIFIED",
            platform: "PLATFORM_UNSPECIFIED",
            pluginType: "GEMINI",
          },
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      let projectId = "";
      let tier = "free";

      if (typeof data.cloudaicompanionProject === "string") {
        projectId = data.cloudaicompanionProject;
      } else if (data.cloudaicompanionProject?.id) {
        projectId = data.cloudaicompanionProject.id;
      }

      if (data.paidTier?.id && !data.paidTier.id.includes("free")) {
        tier = "paid";
      }

      if (projectId) {
        return { projectId, tier };
      }
    } catch (e) {
      console.error(`Failed to fetch account info from ${endpoint}:`, e.message);
    }
  }

  return { projectId: "", tier: "free" };
}

export async function refreshAccessToken() {
  const tokens = getAntigravityTokens();
  if (!tokens?.refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: ANTIGRAVITY_CLIENT_ID,
      client_secret: ANTIGRAVITY_CLIENT_SECRET,
      refresh_token: tokens.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  const newTokens = await response.json();

  const tokenData = {
    ...tokens,
    accessToken: newTokens.access_token,
    expiresAt: Date.now() + newTokens.expires_in * 1000,
  };

  saveAntigravityTokens(tokenData);
  return tokenData;
}

export async function getValidAccessToken() {
  let tokens = getAntigravityTokens();
  if (!tokens) {
    return null;
  }

  // Refresh if expires in less than 5 minutes
  const fiveMinutes = 5 * 60 * 1000;
  if (tokens.expiresAt <= Date.now() + fiveMinutes) {
    try {
      tokens = await refreshAccessToken();
    } catch (e) {
      console.error("Failed to refresh token:", e.message);
      return null;
    }
  }

  return tokens.accessToken;
}
