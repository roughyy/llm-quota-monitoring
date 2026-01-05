import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { DATA_DIR } from "./constants.js";

const dataDir = join(process.cwd(), DATA_DIR);
const tokensFile = join(dataDir, "tokens.json");
const settingsFile = join(dataDir, "settings.json");

function ensureDataDir() {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

function readJson(filePath, defaultValue = {}) {
  try {
    if (existsSync(filePath)) {
      return JSON.parse(readFileSync(filePath, "utf-8"));
    }
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e.message);
  }
  return defaultValue;
}

function writeJson(filePath, data) {
  ensureDataDir();
  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Antigravity tokens
export function getAntigravityTokens() {
  const data = readJson(tokensFile);
  return data.antigravity || null;
}

export function saveAntigravityTokens(tokens) {
  const data = readJson(tokensFile);
  data.antigravity = tokens;
  writeJson(tokensFile, data);
}

export function clearAntigravityTokens() {
  const data = readJson(tokensFile);
  delete data.antigravity;
  writeJson(tokensFile, data);
}

// GLM settings
export function getGlmSettings() {
  const data = readJson(settingsFile);
  return data.glm || null;
}

export function saveGlmSettings(settings) {
  const data = readJson(settingsFile);
  data.glm = settings;
  writeJson(settingsFile, data);
}

export function clearGlmSettings() {
  const data = readJson(settingsFile);
  delete data.glm;
  writeJson(settingsFile, data);
}

// OpenAI tokens
export function getOpenaiTokens() {
  const data = readJson(tokensFile);
  return data.openai || null;
}

export function saveOpenaiTokens(tokens) {
  const data = readJson(tokensFile);
  data.openai = tokens;
  writeJson(tokensFile, data);
}

export function clearOpenaiTokens() {
  const data = readJson(tokensFile);
  delete data.openai;
  writeJson(tokensFile, data);
}
