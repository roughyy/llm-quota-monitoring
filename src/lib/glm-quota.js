import { getGlmSettings } from "./storage.js";
import { GLM_BASE_URLS } from "./constants.js";

export async function fetchGlmQuota() {
  const settings = getGlmSettings();
  if (!settings?.apiKey || !settings?.baseUrl) {
    return { error: "GLM not configured", needsConfig: true };
  }

  const { apiKey, baseUrl } = settings;

  // Determine base domain
  let baseDomain;
  try {
    const parsed = new URL(baseUrl);
    baseDomain = `${parsed.protocol}//${parsed.host}`;
  } catch (e) {
    return { error: "Invalid base URL" };
  }

  // Time window: last 24 hours
  const now = new Date();
  const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const endDate = now;

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const startTime = formatDateTime(startDate);
  const endTime = formatDateTime(endDate);
  const queryParams = `?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;

  const headers = {
    Authorization: apiKey,
    "Accept-Language": "en-US,en",
    "Content-Type": "application/json",
  };

  const results = {
    platform: baseUrl.includes("api.z.ai") ? "Z.AI" : "ZHIPU",
    modelUsage: null,
    toolUsage: null,
    quotaLimit: null,
    fetchedAt: new Date().toISOString(),
  };

  // Fetch model usage
  try {
    const modelResponse = await fetch(
      `${baseDomain}/api/monitor/usage/model-usage${queryParams}`,
      { headers }
    );
    if (modelResponse.ok) {
      const data = await modelResponse.json();
      results.modelUsage = data.data || data;
    }
  } catch (e) {
    console.error("Failed to fetch GLM model usage:", e.message);
  }

  // Fetch tool usage
  try {
    const toolResponse = await fetch(
      `${baseDomain}/api/monitor/usage/tool-usage${queryParams}`,
      { headers }
    );
    if (toolResponse.ok) {
      const data = await toolResponse.json();
      results.toolUsage = data.data || data;
    }
  } catch (e) {
    console.error("Failed to fetch GLM tool usage:", e.message);
  }

  // Fetch quota limits
  try {
    const quotaResponse = await fetch(
      `${baseDomain}/api/monitor/usage/quota/limit`,
      { headers }
    );
    if (quotaResponse.ok) {
      const data = await quotaResponse.json();
      results.quotaLimit = parseQuotaLimit(data.data || data);
    }
  } catch (e) {
    console.error("Failed to fetch GLM quota limits:", e.message);
  }

  if (!results.modelUsage && !results.toolUsage && !results.quotaLimit) {
    return { error: "Failed to fetch any GLM data" };
  }

  return results;
}

function parseQuotaLimit(data) {
  if (!data?.limits) return data;

  return {
    ...data,
    limits: data.limits.map((item) => {
      if (item.type === "TOKENS_LIMIT") {
        return {
          type: "Token Usage (5 Hour Window)",
          percentage: item.percentage,
          isWarning: item.percentage >= 80,
          isCritical: item.percentage >= 95,
        };
      }
      if (item.type === "TIME_LIMIT") {
        return {
          type: "MCP Usage (Monthly)",
          percentage: item.percentage,
          currentUsage: item.currentValue,
          total: item.usage,
          usageDetails: item.usageDetails,
          isWarning: item.percentage >= 80,
          isCritical: item.percentage >= 95,
        };
      }
      return item;
    }),
  };
}
