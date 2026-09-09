export const BUFFER_SOURCE_HELPER = `function toBufferSource(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
`;

export const PRISMA_DEFAULT_URL = "file:./dev.db";

export function normalizePath(path: string) {
  return path.replaceAll("\\", "/");
}

export function insertAfterImports(content: string, insertion: string): string {
  if (content.includes(insertion.trim())) return content;

  const matches = [
    ...content.matchAll(/^import[\s\S]*?from\s+['"][^'"]+['"];?/gm),
    ...content.matchAll(/^import\s+['"][^'"]+['"];?/gm),
  ].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  const last = matches.at(-1);
  if (!last || last.index === undefined) {
    const directive = content.match(/^(?:['"]use (?:client|server)['"];\s*\n)+/);
    if (directive) {
      return `${directive[0]}\n${insertion}${content.slice(directive[0].length)}`;
    }
    return `${insertion}\n${content}`;
  }

  const at = last.index + last[0].length;
  const before = content.slice(0, at);
  const after = content.slice(at);
  const spacer = after.startsWith("\n") ? "\n" : "\n\n";
  return `${before}${spacer}${insertion}${after.replace(/^\n*/, "\n")}`;
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findMatchingParen(content: string, openIndex: number): number {
  if (content[openIndex] !== "(") return -1;
  let depth = 0;
  for (let i = openIndex; i < content.length; i += 1) {
    const ch = content[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export function findMatchingBrace(content: string, openIndex: number): number {
  if (content[openIndex] !== "{") return -1;
  let depth = 0;
  for (let i = openIndex; i < content.length; i += 1) {
    const ch = content[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export function extractStatement(content: string, start: number): string | null {
  let parens = 0;
  let braces = 0;
  let brackets = 0;
  let inStr: string | null = null;
  let escape = false;

  for (let i = start; i < content.length; i += 1) {
    const char = content[i];
    if (inStr) {
      if (escape) {
        escape = false;
        continue;
      }
      if (char === "\\") {
        escape = true;
        continue;
      }
      if (char === inStr) inStr = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      inStr = char;
      continue;
    }
    if (char === "(") parens += 1;
    else if (char === ")") parens -= 1;
    else if (char === "{") braces += 1;
    else if (char === "}") braces -= 1;
    else if (char === "[") brackets += 1;
    else if (char === "]") brackets -= 1;
    else if (char === ";" && parens === 0 && braces === 0 && brackets === 0) {
      return content.slice(start, i + 1);
    }
  }
  return null;
}
