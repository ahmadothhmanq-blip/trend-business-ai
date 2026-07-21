/**
 * Encrypt/decrypt OAuth tokens at rest (AES-256-GCM).
 * Set SOCIAL_TOKEN_ENCRYPTION_KEY to a 32-byte base64 secret.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;
const SALT = "trend-social-token-v1";

function deriveKey(): Buffer {
  const secret = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY ?? process.env.ENCRYPTION_KEY ?? "";
  if (!secret) {
    throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY is not configured.");
  }
  return scryptSync(secret, SALT, 32);
}

export function encryptToken(plaintext: string): string {
  if (!plaintext) return "";
  const key = deriveKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptToken(ciphertext: string): string {
  if (!ciphertext) return "";
  const key = deriveKey();
  const buf = Buffer.from(ciphertext, "base64");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const data = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function isEncryptionConfigured(): boolean {
  return Boolean(process.env.SOCIAL_TOKEN_ENCRYPTION_KEY ?? process.env.ENCRYPTION_KEY);
}
