import { randomUUID } from 'crypto';

// src/utils/telemetry-config.ts
var DEFAULT_TELEMETRY_CONFIG = {
  enabled: true,
  apiKey: process.env.POSTHOG_API_KEY || "phc_VuhFUIJLXzwyGjlgQ67dbNeSh5x4cp9F8i15hZFIDhs",
  host: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
  debug: process.env.NODE_ENV === "development"
};
function isTelemetryEnabled() {
  const telemetryEnv = process.env.SONICJS_TELEMETRY;
  if (telemetryEnv === "false" || telemetryEnv === "0" || telemetryEnv === "disabled") {
    return false;
  }
  const doNotTrack = process.env.DO_NOT_TRACK;
  if (doNotTrack === "1" || doNotTrack === "true") {
    return false;
  }
  return true;
}
function getTelemetryConfig() {
  return {
    ...DEFAULT_TELEMETRY_CONFIG,
    enabled: isTelemetryEnabled()
  };
}
function shouldSkipEvent(eventName, sampleRate = 1) {
  if (sampleRate >= 1) return false;
  if (sampleRate <= 0) return true;
  let hash = 0;
  for (let i = 0; i < eventName.length; i++) {
    hash = (hash << 5) - hash + eventName.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash % 100) / 100 > sampleRate;
}
function generateInstallationId() {
  return randomUUID();
}
function generateProjectId(projectName) {
  let hash = 0;
  for (let i = 0; i < projectName.length; i++) {
    const char = projectName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `proj_${Math.abs(hash).toString(36)}`;
}
function sanitizeErrorMessage(error) {
  const message = typeof error === "string" ? error : error.message;
  const errorType = message.split(":")[0].trim();
  const sanitized = errorType.replace(/\/Users\/[^/]+/g, "/Users/***").replace(/\/home\/[^/]+/g, "/home/***").replace(/C:\\Users\\[^\\]+/g, "C:\\Users\\***").replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "***@***.***");
  return sanitized;
}
function sanitizeRoute(route) {
  return route.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, ":id").replace(/\/\d+/g, "/:id").replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ":email");
}

export { DEFAULT_TELEMETRY_CONFIG, generateInstallationId, generateProjectId, getTelemetryConfig, isTelemetryEnabled, sanitizeErrorMessage, sanitizeRoute, shouldSkipEvent };
//# sourceMappingURL=chunk-RKNHW6QU.js.map
//# sourceMappingURL=chunk-RKNHW6QU.js.map