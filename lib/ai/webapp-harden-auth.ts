import type { GeneratedProjectFile } from "@/lib/ai/types";
import { buildCanonicalAuthModule } from "@/lib/ai/webapp-auth-scaffold";
import {
  BUFFER_SOURCE_HELPER,
  insertAfterImports,
  normalizePath,
} from "@/lib/ai/webapp-harden-shared";

export function hardenCryptoFile(content: string): string {
  const needsSubtle = content.includes("crypto.subtle");
  const hasAsyncNodeCrypto =
    /(?:^|[^\w])(?:crypto\.)?scrypt\s*\(/.test(content) ||
    /(?:^|[^\w])(?:crypto\.)?pbkdf2\s*\(/.test(content);

  if (!needsSubtle && !hasAsyncNodeCrypto) return content;

  let next = content;
  if (needsSubtle) {
    next = next.includes("function toBufferSource")
      ? next
      : insertAfterImports(next, BUFFER_SOURCE_HELPER);

    next = next.replace(
      /crypto\.subtle\.importKey\(\s*(['"]raw['"])\s*,\s*(?!toBufferSource\()([^,]+),/g,
      "crypto.subtle.importKey($1, toBufferSource($2),",
    );
    next = next.replace(
      /salt\s*:\s*(?!toBufferSource\()(salt)\b/g,
      "salt: toBufferSource($1)",
    );
    next = next.replace(
      /crypto\.subtle\.sign\(\s*([^,]+),\s*([^,]+),\s*(?!toBufferSource\()([^)]+)\)/g,
      "crypto.subtle.sign($1, $2, toBufferSource($3))",
    );
    next = next.replace(
      /crypto\.subtle\.verify\(\s*([^,]+),\s*([^,]+),\s*(?!toBufferSource\()([^,]+),\s*(?!toBufferSource\()([^)]+)\)/g,
      "crypto.subtle.verify($1, $2, toBufferSource($3), toBufferSource($4))",
    );
  }

  // Node crypto.scrypt / pbkdf2 without callback returns void — force Sync forms.
  next = next.replace(
    /\(\s*(?:await\s+)?(?:crypto\.)?scrypt\(\s*([^,]+),\s*([^,]+),\s*([^,\)]+)\s*\)\s+as\s+[^)]+\)/g,
    "crypto.scryptSync($1, $2, $3)",
  );
  next = next.replace(
    /(?:await\s+)?(?:crypto\.)?scrypt\(\s*([^,]+),\s*([^,]+),\s*([^,\)]+)\s*\)(?!\s*\.)/g,
    "crypto.scryptSync($1, $2, $3)",
  );
  next = next.replace(
    /\(\s*(?:await\s+)?(?:crypto\.)?pbkdf2\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,\)]+)\s*\)\s+as\s+[^)]+\)/g,
    'crypto.pbkdf2Sync($1, $2, $3, $4, "sha512")',
  );
  next = next.replace(
    /(?:await\s+)?(?:crypto\.)?pbkdf2\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,\)]+)\s*\)(?!\s*\.)/g,
    'crypto.pbkdf2Sync($1, $2, $3, $4, "sha512")',
  );

  if (
    /\bcrypto\.(?:scryptSync|pbkdf2Sync)\b/.test(next) &&
    !/from\s+['"](?:node:)?crypto['"]/.test(next) &&
    !/require\(\s*['"](?:node:)?crypto['"]\s*\)/.test(next)
  ) {
    next = insertAfterImports(next, 'import crypto from "crypto";');
  }

  return next;
}

export function hardenCanonicalSessionConsumers(content: string): string {
  let next = content;
  next = next.replace(/\bsession\?\.user\?\.(?:email|name)\b/g, "session?.email");
  next = next.replace(/\bsession\.user\.(?:email|name)\b/g, "session.email");
  next = next.replace(/\bsession\?\.user\?\.id\b/g, "session?.userId");
  next = next.replace(/\bsession\.user\.id\b/g, "session.userId");
  next = next.replace(/\bsession\?\.user\?\.role\b/g, "session?.sessionId");
  next = next.replace(/\bsession\.user\.role\b/g, "session.sessionId");
  next = next.replace(/\bsession\?\.user\b/g, "session");
  next = next.replace(/\bsession\.user\b/g, "session");
  return next;
}

export function findCanonicalSessionContractIssues(
  content: string,
  path: string,
): string[] {
  if (/\bsession(?:\?)?\.user\b/.test(content)) {
    return [
      `${path}: session.user is invalid for canonical Session; use session.email / session.userId / session.sessionId.`,
    ];
  }
  return [];
}

export function hardenAuthOptions(content: string): string {
  if (!/NextAuthOptions|authOptions/.test(content)) return content;
  if (/\bsecret\s*:/.test(content)) return content;
  return content.replace(
    /(export const authOptions\s*(?::\s*NextAuthOptions)?\s*=\s*\{)/,
    `$1\n  secret: process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET || "dev-session-secret-change-me",`,
  );
}

export function canonicalAuthModuleContent(): string {
  return buildCanonicalAuthModule();
}

export function needsAuthModuleRewrite(content: string): boolean {
  return (
    /from\s+["']next-auth/.test(content) ||
    /\bCredentialsProvider\b/.test(content) ||
    /\bauthOptions\b/.test(content) ||
    /\bNextAuthOptions\b/.test(content)
  );
}

/** True when auth reads DB-backed sessions with userId + email. */
export function authUsesCanonicalSession(content: string): boolean {
  const sessionType = content.match(/export\s+type\s+Session\s*=\s*\{[^}]*\}/)?.[0] ?? "";
  return (
    /sessionId\s*:\s*string/.test(sessionType) &&
    /userId\s*:\s*string/.test(sessionType) &&
    /email\s*:\s*string/.test(sessionType) &&
    /export\s+async\s+function\s+getSession\s*\(\s*\)\s*:\s*Promise<\s*Session\s*\|\s*null\s*>/.test(
      content,
    ) &&
    /db\.session/.test(content) &&
    !/\buser\s*:/.test(sessionType)
  );
}

export function ensureCanonicalAuthModule(
  files: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  const auth = files.find((file) => normalizePath(file.path) === "lib/auth.ts");
  const mustRewrite =
    !auth ||
    needsAuthModuleRewrite(auth.content) ||
    !authUsesCanonicalSession(auth.content);

  if (!mustRewrite) return files;

  const canonical = canonicalAuthModuleContent();
  let next = files.filter(
    (file) =>
      !/\[\.\.\.(?:nextauth|auth)\]/.test(normalizePath(file.path)) &&
      !/^app\/api\/auth\/\[\.\.\./.test(normalizePath(file.path)),
  );

  if (!auth) {
    next.push({ path: "lib/auth.ts", language: "typescript", content: canonical });
  } else {
    next = next.map((file) =>
      normalizePath(file.path) === "lib/auth.ts"
        ? { ...file, content: canonical }
        : file,
    );
  }

  return next;
}

export function findAuthContractIssues(
  files: GeneratedProjectFile[],
): string[] {
  const issues: string[] = [];

  for (const file of files) {
    const path = normalizePath(file.path);
    if (path !== "lib/auth.ts") continue;

    if (/import\s+\{\s*CredentialsProvider\s*\}/.test(file.content)) {
      issues.push(
        `${path}: CredentialsProvider must use a default import (import CredentialsProvider from "next-auth/providers/credentials").`,
      );
    }
    if (/import\s+type\s+\{[^}]*\bCredentialsProvider\b/.test(file.content)) {
      issues.push(
        `${path}: CredentialsProvider must be imported as a value, not type-only.`,
      );
    }
    if (
      /\bauthorize\s*\(\s*credentials\s*\)/.test(file.content) &&
      !/\bauthorize\s*\(\s*credentials\s*:/.test(file.content)
    ) {
      issues.push(
        `${path}: authorize(credentials) must declare an explicit credentials parameter type.`,
      );
    }
    if (needsAuthModuleRewrite(file.content)) {
      issues.push(
        `${path}: must use DB-backed cookie sessions (getSession) — NextAuth CredentialsProvider scaffolding is not supported.`,
      );
    }
    if (!authUsesCanonicalSession(file.content)) {
      issues.push(
        `${path}: Session must be { sessionId, userId, email } with DB-backed getSession(): Promise<Session | null>.`,
      );
    }
  }

  for (const file of files) {
    const path = normalizePath(file.path);
    if (path === "lib/auth.ts") continue;
    issues.push(...findCanonicalSessionContractIssues(file.content, path));
  }

  return issues;
}
