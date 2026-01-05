// Google Antigravity OAuth Config (from AntigravityQuotaWatcher)
export const ANTIGRAVITY_CLIENT_ID = "1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com";
export const ANTIGRAVITY_CLIENT_SECRET = "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";
export const ANTIGRAVITY_CALLBACK_PORT = 3000;
export const ANTIGRAVITY_REDIRECT_URI = `http://localhost:${ANTIGRAVITY_CALLBACK_PORT}/auth/google/callback`;

export const ANTIGRAVITY_SCOPES = [
  "https://www.googleapis.com/auth/cloud-platform",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/cclog",
  "https://www.googleapis.com/auth/experimentsandconfigs",
];

export const ANTIGRAVITY_USER_AGENT = "antigravity/1.11.5 windows/amd64";
export const ANTIGRAVITY_API_CLIENT = "google-cloud-sdk vscode_cloudshelleditor/0.1";

// Antigravity API Endpoints
export const CODE_ASSIST_ENDPOINTS = [
  "https://cloudcode-pa.googleapis.com",
  "https://daily-cloudcode-pa.sandbox.googleapis.com",
  "https://autopush-cloudcode-pa.sandbox.googleapis.com",
];

// GLM API Config
export const GLM_BASE_URLS = {
  ZAI: "https://api.z.ai",
  ZHIPU: "https://open.bigmodel.cn",
};

// Server Config
export const PORT = process.env.PORT || 3000;
export const DATA_DIR = process.env.DATA_DIR || ".data";
