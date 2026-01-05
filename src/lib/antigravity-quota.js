import {
  ANTIGRAVITY_USER_AGENT,
  ANTIGRAVITY_API_CLIENT,
  CODE_ASSIST_ENDPOINTS,
} from "./constants.js";
import { getValidAccessToken } from "./antigravity-auth.js";
import { getAntigravityTokens } from "./storage.js";

const CODE_ASSIST_HEADERS = {
  "User-Agent": ANTIGRAVITY_USER_AGENT,
  "X-Goog-Api-Client": ANTIGRAVITY_API_CLIENT,
  "Client-Metadata": JSON.stringify({
    ideType: "IDE_UNSPECIFIED",
    platform: "PLATFORM_UNSPECIFIED",
    pluginType: "GEMINI",
  }),
};

export async function fetchAntigravityQuota() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return { error: "Not authenticated", needsAuth: true };
  }

  const tokens = getAntigravityTokens();
  const projectId = tokens?.projectId || "";

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    ...CODE_ASSIST_HEADERS,
  };

  // Try each endpoint
  for (const endpoint of CODE_ASSIST_ENDPOINTS) {
    try {
      const response = await fetch(`${endpoint}/v1internal:fetchAvailableModels`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          project: projectId,
        }),
      });

      if (!response.ok) {
        console.error(`fetchAvailableModels failed at ${endpoint}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      return parseQuotaResponse(data, tokens);
    } catch (e) {
      console.error(`Error fetching quota from ${endpoint}:`, e.message);
    }
  }

  return { error: "Failed to fetch quota from all endpoints" };
}

function parseQuotaResponse(data, tokens) {
  const models = [];

  if (data.models) {
    for (const [modelId, modelData] of Object.entries(data.models)) {
      const quotaInfo = modelData.quotaInfo || {};
      const remainingFraction = quotaInfo.remainingFraction ?? 1;
      const resetTime = quotaInfo.resetTime ? new Date(quotaInfo.resetTime) : null;

      models.push({
        modelId,
        displayName: formatModelName(modelId),
        remainingPercentage: Math.round(remainingFraction * 100),
        isExhausted: remainingFraction <= 0,
        resetTime: resetTime?.toISOString(),
        timeUntilReset: resetTime ? formatTimeUntil(resetTime) : null,
      });
    }
  }

  // Sort by remaining percentage (lowest first)
  models.sort((a, b) => a.remainingPercentage - b.remainingPercentage);

  return {
    email: tokens?.email,
    tier: tokens?.tier || "free",
    projectId: tokens?.projectId,
    models,
    fetchedAt: new Date().toISOString(),
  };
}

function formatModelName(modelId) {
  return modelId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatTimeUntil(date) {
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff <= 0) return "Now";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
