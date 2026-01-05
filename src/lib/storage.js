import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import crypto from "crypto";
import { DATA_DIR, ADMIN_PASSWORD } from "./constants.js";

const dataDir = join(process.cwd(), DATA_DIR);
const tokensFile = join(dataDir, "tokens.enc"); // Changed extension
const settingsFile = join(dataDir, "settings.json");

const ALGORITHM = "aes-256-cbc";
const KEY = crypto.scryptSync(ADMIN_PASSWORD, "ai-monitor-salt", 32);
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text) {
  try {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (e) {
    return null;
  }
}

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

// Helper for encrypted tokens
function readTokens() {
  try {
    if (existsSync(tokensFile)) {
      const encrypted = readFileSync(tokensFile, "utf-8");
      const decrypted = decrypt(encrypted);
      return decrypted ? JSON.parse(decrypted) : {};
    }
    // Migration check for old tokens.json
    const oldFile = join(dataDir, "tokens.json");
    const oldSettingsFile = join(dataDir, "settings.json");
    if (existsSync(oldFile) || existsSync(oldSettingsFile)) {
      const tokensData = existsSync(oldFile) ? JSON.parse(readFileSync(oldFile, "utf-8")) : {};
      const settingsData = existsSync(oldSettingsFile) ? JSON.parse(readFileSync(oldSettingsFile, "utf-8")) : {};
      const merged = { ...tokensData, ...settingsData };
      saveTokens(merged);
      return merged;
    }
  } catch (e) {
    console.error(`Error reading tokens:`, e.message);
  }
  return {};
}

function saveTokens(data) {
  ensureDataDir();
  const encrypted = encrypt(JSON.stringify(data));
  writeFileSync(tokensFile, encrypted, "utf-8");
}

// Antigravity tokens
export function getAntigravityTokens() {
  const data = readTokens();
  return data.antigravity || null;
}

export function saveAntigravityTokens(tokens) {
  const data = readTokens();
  data.antigravity = tokens;
  saveTokens(data);
}

export function clearAntigravityTokens() {
  const data = readTokens();
  delete data.antigravity;
  saveTokens(data);
}

// GLM settings
export function getGlmSettings() {
  const data = readTokens();
  return data.glm || null;
}

export function saveGlmSettings(settings) {
  const data = readTokens();
  data.glm = settings;
  saveTokens(data);
}

export function clearGlmSettings() {
  const data = readTokens();
  delete data.glm;
  saveTokens(data);
}

// OpenAI tokens
export function getOpenaiTokens() {
  const data = readTokens();
  return data.openai || null;
}

export function saveOpenaiTokens(tokens) {
  const data = readTokens();
  data.openai = tokens;
  saveTokens(data);
}

export function clearOpenaiTokens() {
  const data = readTokens();
  delete data.openai;
  saveTokens(data);
}
