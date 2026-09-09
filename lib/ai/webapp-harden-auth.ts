import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  buildCanonicalAuthModule,
  buildCanonicalSessionCookieModule,
} from "@/lib/ai/webapp-auth-scaffold";
import {
  BUFFER_SOURCE_HELPER,
  findMatchingParen,
  insertAfterImports,
  normalizePath,
} from "@/lib/ai/webapp-harden-shared";

function splitTopLevelArgs(inside: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let start = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escaped = false;

  for (let i = 0; i < inside.length; i += 1) {
    const ch = inside[i]!;
    if (inSingle) {
      if (!escaped && ch === "'") inSingle = false;
      escaped = !escaped && ch === "\\";
      if (ch !== "\\") escaped = false;
      continue;
    }
    if (inDouble) {
      if (!escaped && ch === '"') inDouble = false;
      escaped = !escaped && ch === "\\";
      if (ch !== "\\") escaped = false;
      continue;
    }
    if (inTemplate) {
      if (!escaped && ch === "`") inTemplate = false;
      escaped = !escaped && ch === "\\";
      if (ch !== "\\") escaped = false;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      escaped = false;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      escaped = false;
      continue;
    }
    if (ch === "`") {
      inTemplate = true;
      escaped = false;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth += 1;
    else if (ch === ")" || ch === "]" || ch === "}") depth = Math.max(0, depth - 1);
    else if (ch === "," && depth === 0) {
      args.push(inside.slice(start, i));
      start = i + 1;
    }
  }
  args.push(inside.slice(start));
  return args;
}

function wrapBufferSourceExpr(expr: string): string {
  const trimmed = expr.trim();
  if (!trimmed || trimmed.startsWith("toBufferSource(")) return expr;
  const leading = expr.match(/^\s*/)?.[0] ?? "";
  const trailing = expr.match(/\s*$/)?.[0] ?? "";
  return `${leading}toBufferSource(${trimmed})${trailing}`;
}

/** Wrap BufferSource args with toBufferSource without breaking nested parentheses. */
export function wrapCryptoSubtleBufferSourceArgs(content: string): string {
  const callRe = /crypto\.subtle\.(importKey|sign|verify)\s*\(/g;
  const replacements: Array<{ start: number; end: number; text: string }> = [];

  for (const match of content.matchAll(callRe)) {
    const method = match[1]!;
    const openParen = match.index! + match[0].length - 1;
    const closeParen = findMatchingParen(content, openParen);
    if (closeParen === -1) continue;

    const inside = content.slice(openParen + 1, closeParen);
    const args = splitTopLevelArgs(inside);
    let changed = false;

    if (method === "importKey" && args.length >= 2) {
      const format = args[0]!.trim();
      if (/^['"]raw['"]$/.test(format)) {
        const wrapped = wrapBufferSourceExpr(args[1]!);
        if (wrapped !== args[1]) {
          args[1] = wrapped;
          changed = true;
        }
      }
    } else if (method === "sign" && args.length >= 3) {
      const wrapped = wrapBufferSourceExpr(args[2]!);
      if (wrapped !== args[2]) {
        args[2] = wrapped;
        changed = true;
      }
    } else if (method === "verify" && args.length >= 4) {
      const wrappedSig = wrapBufferSourceExpr(args[2]!);
      const wrappedData = wrapBufferSourceExpr(args[3]!);
      if (wrappedSig !== args[2] || wrappedData !== args[3]) {
        args[2] = wrappedSig;
        args[3] = wrappedData;
        changed = true;
      }
    }

    if (!changed) continue;
    replacements.push({
      start: openParen + 1,
      end: closeParen,
      text: args.join(","),
    });
  }

  let next = content;
  for (const entry of replacements.sort((a, b) => b.start - a.start)) {
    next = `${next.slice(0, entry.start)}${entry.text}${next.slice(entry.end)}`;
  }
  return next;
}

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

    next = wrapCryptoSubtleBufferSourceArgs(next);
    next = next.replace(
      /salt\s*:\s*(?!toBufferSource\()(salt)\b/g,
      "salt: toBufferSource($1)",
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
  next = next.replace(/\bsession\?\.user\?\.role\b/g, "session?.role");
  next = next.replace(/\bsession\.user\.role\b/g, "session.role");
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
      `${path}: session.user is invalid for canonical Session; use session.email / session.userId / session.sessionId / session.role.`,
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

/** True when auth reads DB-backed sessions with userId + email + role. */
export function authUsesCanonicalSession(content: string): boolean {
  const sessionType = content.match(/export\s+type\s+Session\s*=\s*\{[^}]*\}/)?.[0] ?? "";
  return (
    /sessionId\s*:\s*string/.test(sessionType) &&
    /userId\s*:\s*string/.test(sessionType) &&
    /email\s*:\s*string/.test(sessionType) &&
    /role\s*:\s*string/.test(sessionType) &&
    /export\s+async\s+function\s+getSession\s*\(\s*\)\s*:\s*Promise<\s*Session\s*\|\s*null\s*>/.test(
      content,
    ) &&
    /verifySessionCookie/.test(content) &&
    /db\.session/.test(content) &&
    /isStaffRole/.test(content) &&
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

  if (!next.some((file) => normalizePath(file.path) === "lib/session-cookie.ts")) {
    next.push({
      path: "lib/session-cookie.ts",
      language: "typescript",
      content: buildCanonicalSessionCookieModule(),
    });
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
        `${path}: Session must be { sessionId, userId, email, role } with DB-backed getSession(), isStaffRole, and Promise<Session | null>.`,
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
