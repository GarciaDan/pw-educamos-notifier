import pino from "pino";

export const Logger = pino({
  level: process.env["LOG_LEVEL"] || "info",
  base: { service: process.env["SERVICE_NAME"] || "pw-educamos-notifier" },
  timestamp: pino.stdTimeFunctions.isoTime,
});
