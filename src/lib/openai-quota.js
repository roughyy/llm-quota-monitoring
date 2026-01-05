import { getOpenaiTokens, saveOpenaiTokens } from "./storage.js";
import { OPENAI_WHAM_URL } from "./constants.js";

export async function fetchOpenaiQuota() {
  const tokens = getOpenaiTokens();
  if (!tokens?.accessToken) {
    return { error: "OpenAI not configured", needsConfig: true };
  }

  try {
    const response = await fetch(OPENAI_WHAM_URL, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (response.status === 401 || response.status === 403) {
      return { error: "Session expired", expired: true };
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAI quota: ${response.statusText}`);
    }

    const data = await response.json();
    return parseOpenaiUsage(data);
  } catch (e) {
    console.error("Failed to fetch OpenAI quota:", e.message);
    return { error: e.message };
  }
}

function parseOpenaiUsage(data) {
  // OpenAI wham/usage typically returns usage_windows array
  // Example: { usage_windows: [ { model_slug: "gpt-4o", cap: 40, usage: 10, reset_at: "..." }, ... ] }
  
  const windows = data.usage_windows || [];
  
  if (windows.length === 0) {
    return {
      models: [],
      unlimited: true,
      fetchedAt: new Date().toISOString(),
    };
  }
  
  const models = windows.map(win => {
    const cap = win.cap || 0;
    const usage = win.usage || 0;
    
    let remainingPercentage = 100;
    if (cap > 0) {
      const remaining = Math.max(0, cap - usage);
      remainingPercentage = Math.round((remaining / cap) * 100);
    }
    
    // Format reset time
    let timeUntilReset = "";
    if (win.reset_at) {
      const resetDate = new Date(win.reset_at);
      const diffMs = resetDate - new Date();
      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        timeUntilReset = `${hours}h ${minutes}m`;
      } else {
        timeUntilReset = "Resetting...";
      }
    }

    return {
      displayName: formatModelName(win.model_slug),
      modelSlug: win.model_slug,
      cap,
      usage,
      remainingPercentage,
      timeUntilReset,
    };
  });

  return {
    models,
    fetchedAt: new Date().toISOString(),
  };
}

function formatModelName(slug) {
  if (!slug) return "Unknown Model";
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
