type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: { message: string; stack?: string };
}

const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const MIN_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ??
  (process.env.NODE_ENV === "production" ? "info" : "debug");

const SENSITIVE_KEY =
  /(token|secret|password|authorization|cookie|api[_-]?key|private[_-]?key|access[_-]?token|refresh[_-]?token|credit.?card|ssn|email)/i;

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      out[key] = SENSITIVE_KEY.test(key) ? "[REDACTED]" : redactValue(nested);
    }
    return out;
  }
  if (typeof value === "string" && value.length > 500) {
    return `${value.slice(0, 120)}…[truncated ${value.length} chars]`;
  }
  return value;
}

function formatEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === "production") {
    return JSON.stringify(entry);
  }
  const prefix = `[${entry.level.toUpperCase()}]`;
  const ctx = entry.context ? ` (${entry.context})` : "";
  const extra = entry.data ? ` ${JSON.stringify(entry.data)}` : "";
  return `${prefix}${ctx} ${entry.message}${extra}`;
}

function log(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>, err?: unknown) {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context && { context }),
    ...(data && { data: redactValue(data) as Record<string, unknown> }),
  };

  if (err instanceof Error) {
    entry.error = {
      message: err.message,
      ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
    };
  }

  const formatted = formatEntry(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (msg: string, ctx?: string, data?: Record<string, unknown>) => log("debug", msg, ctx, data),
  info: (msg: string, ctx?: string, data?: Record<string, unknown>) => log("info", msg, ctx, data),
  warn: (msg: string, ctx?: string, data?: Record<string, unknown>) => log("warn", msg, ctx, data),
  error: (msg: string, ctx?: string, data?: Record<string, unknown>, err?: unknown) => log("error", msg, ctx, data, err),
};
