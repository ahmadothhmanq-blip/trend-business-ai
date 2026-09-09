/**
 * Signed session cookie helpers for App Builder (platform + generated apps).
 * Uses Web Crypto HMAC-SHA256 so verification works in Edge middleware and Node.
 */

export type SessionCookieClaims = {
  sid: string;
  userId: string;
  role: string;
};

function sessionSecret(): string {
  return process.env.SESSION_SECRET?.trim() || "dev-session-secret-change-me";
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

function encodeJson(value: unknown): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function decodeJson<T>(value: string): T | null {
  try {
    return JSON.parse(new TextDecoder().decode(fromBase64Url(value))) as T;
  } catch {
    return null;
  }
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

export async function signSessionCookie(input: {
  token: string;
  userId: string;
  role: string;
  expiresAt: Date;
}): Promise<string> {
  const body = encodeJson({
    sid: input.token,
    userId: input.userId,
    role: input.role,
    exp: Math.floor(input.expiresAt.getTime() / 1000),
  });
  const key = await hmacKey(sessionSecret());
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)),
  );
  return `${body}.${toBase64Url(signature)}`;
}

export async function verifySessionCookie(
  value: string | undefined | null,
): Promise<SessionCookieClaims | null> {
  if (!value) return null;
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const key = await hmacKey(sessionSecret());
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)),
  );
  const actual = fromBase64Url(signature);
  if (!timingSafeEqual(expected, actual)) return null;

  const payload = decodeJson<{
    sid?: unknown;
    userId?: unknown;
    role?: unknown;
    exp?: unknown;
  }>(body);
  if (!payload) return null;

  const sid = typeof payload.sid === "string" ? payload.sid : null;
  const userId = typeof payload.userId === "string" ? payload.userId : null;
  const role = typeof payload.role === "string" ? payload.role : null;
  const exp = typeof payload.exp === "number" ? payload.exp : null;
  if (!sid || !userId || !role || exp === null) return null;
  if (exp * 1000 <= Date.now()) return null;

  return { sid, userId, role };
}

/** Source emitted into generated apps as lib/session-cookie.ts */
export function buildCanonicalSessionCookieModule(): string {
  return `export type SessionCookieClaims = {
  sid: string;
  userId: string;
  role: string;
};

function sessionSecret(): string {
  return process.env.SESSION_SECRET?.trim() || "dev-session-secret-change-me";
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

function encodeJson(value: unknown): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function decodeJson<T>(value: string): T | null {
  try {
    return JSON.parse(new TextDecoder().decode(fromBase64Url(value))) as T;
  } catch {
    return null;
  }
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

export async function signSessionCookie(input: {
  token: string;
  userId: string;
  role: string;
  expiresAt: Date;
}): Promise<string> {
  const body = encodeJson({
    sid: input.token,
    userId: input.userId,
    role: input.role,
    exp: Math.floor(input.expiresAt.getTime() / 1000),
  });
  const key = await hmacKey(sessionSecret());
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)),
  );
  return \`\${body}.\${toBase64Url(signature)}\`;
}

export async function verifySessionCookie(
  value: string | undefined | null,
): Promise<SessionCookieClaims | null> {
  if (!value) return null;
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const key = await hmacKey(sessionSecret());
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)),
  );
  const actual = fromBase64Url(signature);
  if (!timingSafeEqual(expected, actual)) return null;

  const payload = decodeJson<{
    sid?: unknown;
    userId?: unknown;
    role?: unknown;
    exp?: unknown;
  }>(body);
  if (!payload) return null;

  const sid = typeof payload.sid === "string" ? payload.sid : null;
  const userId = typeof payload.userId === "string" ? payload.userId : null;
  const role = typeof payload.role === "string" ? payload.role : null;
  const exp = typeof payload.exp === "number" ? payload.exp : null;
  if (!sid || !userId || !role || exp === null) return null;
  if (exp * 1000 <= Date.now()) return null;

  return { sid, userId, role };
}
`;
}
