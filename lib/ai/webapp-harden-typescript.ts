import type { GeneratedProjectFile } from "@/lib/ai/types";
import { findAuthContractIssues, findCanonicalSessionContractIssues } from "@/lib/ai/webapp-harden-auth";
import { findUseClientDirectiveIssues } from "@/lib/ai/webapp-harden-next";
import { findApiRouteConflictIssues } from "@/lib/ai/webapp-harden-routes";
import {
  findMatchingBrace,
  findMatchingParen,
  normalizePath,
} from "@/lib/ai/webapp-harden-shared";
import {
  extractBadgeVariantBlockBody,
  extractQuotedUnionMembers,
  findBadgeDangerVariantIssues,
  findMisplacedAsChildIssues,
  projectUsesButtonAsChild,
} from "@/lib/ai/webapp-harden-ui";
import ts from "typescript";

export { findMatchingBrace, findMatchingParen };

/**
 * Only mark sync exported functions async when their body needs await.
 * Avoids turning helpers like isStaffRole into Promise-returning APIs.
 */
export function markExportedFunctionsAsyncWhenBodyMatches(
  content: string,
  bodyPattern: RegExp,
): string {
  const signatureRe = /export\s+(default\s+)?function\s+(\w+\s*)?\(/g;
  const replacements: Array<{ start: number; end: number; text: string }> = [];

  for (const match of content.matchAll(signatureRe)) {
    const openParen = match.index! + match[0].length - 1;
    const closeParen = findMatchingParen(content, openParen);
    if (closeParen === -1) continue;

    const afterParams = content.slice(closeParen + 1);
    const braceOffset = afterParams.search(/\{/);
    if (braceOffset === -1) continue;
    // Skip if a semicolon/statement ends the signature before a brace (overload/declare).
    const between = afterParams.slice(0, braceOffset);
    if (/;/.test(between)) continue;

    const bodyOpen = closeParen + 1 + braceOffset;
    const bodyClose = findMatchingBrace(content, bodyOpen);
    if (bodyClose === -1) continue;

    const body = content.slice(bodyOpen, bodyClose + 1);
    if (!bodyPattern.test(body)) continue;

    const header = match[0];
    const asyncHeader = header.replace(
      /^export\s+(default\s+)?function/,
      (_full, defaultPart: string | undefined) =>
        defaultPart ? "export default async function" : "export async function",
    );
    replacements.push({
      start: match.index!,
      end: match.index! + header.length,
      text: asyncHeader,
    });
  }

  let next = content;
  for (const entry of replacements.sort((a, b) => b.start - a.start)) {
    next = `${next.slice(0, entry.start)}${entry.text}${next.slice(entry.end)}`;
  }
  return next;
}

export function hardenAsyncCookies(content: string): string {
  if (!/from\s+['"]next\/headers['"]/.test(content)) return content;
  if (!/\bcookies\s*\(\s*\)/.test(content)) return content;

  let next = content.replace(/\bcookies\s*\(\s*\)\s*\./g, "(await cookies()).");
  next = next.replace(
    /\b(const|let)\s+(\w+)\s*=\s*cookies\s*\(\s*\)/g,
    "$1 $2 = await cookies()",
  );
  if (!/\bawait\s+cookies\s*\(\s*\)/.test(next)) return content;

  return markExportedFunctionsAsyncWhenBodyMatches(
    next,
    /\bawait\s+cookies\s*\(\s*\)/,
  );
}

export function hardenAsyncHeaders(content: string): string {
  if (!/from\s+['"]next\/headers['"]/.test(content)) return content;
  if (!/\bheaders\s*\(\s*\)/.test(content)) return content;

  let next = content.replace(/\bheaders\s*\(\s*\)\s*\./g, "(await headers()).");
  next = next.replace(
    /\b(const|let)\s+(\w+)\s*=\s*headers\s*\(\s*\)/g,
    "$1 $2 = await headers()",
  );
  if (!/\bawait\s+headers\s*\(\s*\)/.test(next)) return content;

  return markExportedFunctionsAsyncWhenBodyMatches(
    next,
    /\bawait\s+headers\s*\(\s*\)/,
  );
}

export function hardenAsyncFunctionReturnTypes(content: string): string {
  const signatureRe = /(?:export\s+)?async\s+function\s+\w+\s*\(/g;
  let next = content;
  const replacements: Array<{ start: number; end: number; text: string }> = [];

  for (const match of content.matchAll(signatureRe)) {
    const openParen = match.index + match[0].length - 1;
    const closeParen = findMatchingParen(content, openParen);
    if (closeParen === -1) continue;

    const afterParams = content.slice(closeParen + 1);
    const returnMatch = afterParams.match(
      /^\s*:\s*(?!\s*Promise<)([^;\n{]+?)\s*(\{)/,
    );
    if (!returnMatch) continue;

    const replaceStart = closeParen + 1 + (returnMatch.index ?? 0);
    const replaceEnd = replaceStart + returnMatch[0].length;
    replacements.push({
      start: replaceStart,
      end: replaceEnd,
      text: `: Promise<${returnMatch[1].trim()}>${returnMatch[2]}`,
    });
  }

  for (const entry of replacements.sort((a, b) => b.start - a.start)) {
    next = `${next.slice(0, entry.start)}${entry.text}${next.slice(entry.end)}`;
  }

  return next;
}

export function findBareAsyncReturnTypeIssues(content: string, path: string): string[] {
  const issues: string[] = [];
  const signatureRe = /(?:export\s+)?async\s+function\s+(\w+)\s*\(/g;

  for (const match of content.matchAll(signatureRe)) {
    const name = match[1];
    const openParen = match.index + match[0].length - 1;
    const closeParen = findMatchingParen(content, openParen);
    if (closeParen === -1) continue;

    const afterParams = content.slice(closeParen + 1);
    const returnMatch = afterParams.match(
      /^\s*:\s*(?!\s*Promise<)([^;\n{]+?)\s*\{/,
    );
    if (!returnMatch) continue;

    issues.push(
      `${path}: async function ${name} return type must be Promise<T>, not bare ${returnMatch[1].trim()}.`,
    );
  }

  return issues;
}

export function findWebAppTypeScriptContractIssues(
  files: GeneratedProjectFile[],
): string[] {
  const issues: string[] = [];

  for (const file of files) {
    const path = normalizePath(file.path);
    if (
      /import\s+\{[^}]*\bLink\b[^}]*\}\s+from\s+['"]next\/navigation['"]/.test(
        file.content,
      )
    ) {
      issues.push(
        `${path}: Link must be imported from "next/link", not "next/navigation".`,
      );
    }
    if (
      /\bcookies\s*\(\s*\)\s*\.(get|set|delete|has)\b/.test(file.content) ||
      /\b(?:const|let)\s+\w+\s*=\s*cookies\s*\(\s*\)/.test(file.content)
    ) {
      issues.push(
        `${path}: cookies() must be awaited for Next.js 15+ compatibility.`,
      );
    }
    if (
      /\bheaders\s*\(\s*\)\s*\.(get|has|entries|keys|values)\b/.test(file.content) ||
      /\b(?:const|let)\s+\w+\s*=\s*headers\s*\(\s*\)/.test(file.content)
    ) {
      issues.push(
        `${path}: headers() must be awaited for Next.js 15+ compatibility.`,
      );
    }
    issues.push(...findBareAsyncReturnTypeIssues(file.content, path));
    issues.push(...findCanonicalSessionContractIssues(file.content, path));
    issues.push(...findBadgeDangerVariantIssues(file.content, path));
    if (path.endsWith(".ts") || path.endsWith(".tsx") || path.endsWith(".js") || path.endsWith(".jsx")) {
      issues.push(...findUseClientDirectiveIssues(file.content, path));
      issues.push(...findTypescriptParseIssues(file.content, path));
    }
    if (path === "components/ui.tsx" || path === "components/ui.ts") {
      if (/\bHMLAttributes\b/.test(file.content)) {
        issues.push(`${path}: invalid React type "HMLAttributes" (typo).`);
      }
      if (
        /interface\s+SearchInputProps[^}]*\bonSubmit\s*\?\s*:\s*\(value:\s*string\)/.test(
          file.content,
        )
      ) {
        issues.push(
          `${path}: SearchInputProps.onSubmit conflicts with native onSubmit typing.`,
        );
      }
      const badgeUnion = file.content.match(
        /(?:export )?type\s+BadgeVariant\s*=\s*([^;]+);/,
      )?.[1];
      if (badgeUnion && /\bbadgeVariants\b/.test(file.content)) {
        const members = extractQuotedUnionMembers(badgeUnion);
        const body = extractBadgeVariantBlockBody(file.content);
        for (const variant of members) {
          if (!new RegExp(`\\b${variant}\\s*:`).test(body)) {
            issues.push(
              `${path}: badgeVariants is missing required "${variant}" entry for BadgeVariant.`,
            );
          }
        }
      }
      issues.push(...findMisplacedAsChildIssues(file.content, path));
      if (
        /\basChild\b/.test(file.content) &&
        /React\.cloneElement\(\s*children\b/.test(file.content) &&
        !/React\.ReactElement<\{\s*className\?\s*:\s*string\s*\}>/.test(file.content) &&
        /(?:export\s+)?const\s+Button[\s\S]*React\.cloneElement\(\s*children\b/.test(file.content)
      ) {
        issues.push(
          `${path}: Button asChild cloneElement must type children with className.`,
        );
      }
    }
  }

  issues.push(...findApiRouteConflictIssues(files));

  if (projectUsesButtonAsChild(files)) {
    const ui = files.find(
      (file) =>
        normalizePath(file.path) === "components/ui.tsx" ||
        normalizePath(file.path) === "components/ui.ts",
    );
    if (
      ui &&
      !/interface\s+ButtonProps[^{]*\{[^}]*\basChild\s*\??\s*:/.test(ui.content)
    ) {
      issues.push(`${ui.path}: Button must declare asChild when pages pass asChild.`);
    }
  }

  const usesBcrypt = files.some((file) =>
    /from\s+['"]bcryptjs['"]/.test(file.content),
  );
  if (usesBcrypt) {
    const pkg = files.find((file) => normalizePath(file.path) === "package.json");
    if (pkg && !/"@types\/bcryptjs"/.test(pkg.content)) {
      issues.push("package.json: missing @types/bcryptjs for bcryptjs imports.");
    }
  }

  issues.push(...findAuthContractIssues(files));

  return issues;
}

export function isNullishBinaryExpression(node: ts.Expression): boolean {
  return (
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
  );
}

export function isLogicalBinaryExpression(node: ts.Expression): boolean {
  return (
    ts.isBinaryExpression(node) &&
    (node.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
      node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken)
  );
}

export function scriptKindForPath(path: string): ts.ScriptKind {
  if (path.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (path.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (path.endsWith(".js")) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

export function parseGeneratedTypescript(path: string, content: string): ts.SourceFile {
  return ts.createSourceFile(
    path,
    content,
    ts.ScriptTarget.ESNext,
    true,
    scriptKindForPath(path),
  );
}

export function sourceFileHasUnparenthesizedNullishLogicalMix(
  sourceFile: ts.SourceFile,
): boolean {
  let found = false;
  const visit = (node: ts.Node) => {
    if (found) return;
    if (ts.isBinaryExpression(node)) {
      const op = node.operatorToken.kind;
      if (
        (op === ts.SyntaxKind.BarBarToken ||
          op === ts.SyntaxKind.AmpersandAmpersandToken) &&
        (isNullishBinaryExpression(node.left) ||
          isNullishBinaryExpression(node.right))
      ) {
        found = true;
        return;
      }
      if (
        op === ts.SyntaxKind.QuestionQuestionToken &&
        (isLogicalBinaryExpression(node.left) ||
          isLogicalBinaryExpression(node.right))
      ) {
        found = true;
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

/**
 * AST-only fix: parenthesize nullish/logical operands that SWC rejects when mixed.
 * Does not use regex rewriting of expressions.
 */
export function hardenNullishCoalescingPrecedenceAst(
  path: string,
  content: string,
): string {
  const sourceFile = parseGeneratedTypescript(path, content);
  if (!sourceFileHasUnparenthesizedNullishLogicalMix(sourceFile)) {
    return content;
  }

  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visit: ts.Visitor = (node) => {
      const visited = ts.visitEachChild(node, visit, context);
      if (!ts.isBinaryExpression(visited)) return visited;

      const op = visited.operatorToken.kind;
      if (
        op === ts.SyntaxKind.BarBarToken ||
        op === ts.SyntaxKind.AmpersandAmpersandToken
      ) {
        const left = isNullishBinaryExpression(visited.left)
          ? ts.factory.createParenthesizedExpression(visited.left)
          : visited.left;
        const right = isNullishBinaryExpression(visited.right)
          ? ts.factory.createParenthesizedExpression(visited.right)
          : visited.right;
        if (left !== visited.left || right !== visited.right) {
          return ts.factory.updateBinaryExpression(
            visited,
            left,
            visited.operatorToken,
            right,
          );
        }
      }

      if (op === ts.SyntaxKind.QuestionQuestionToken) {
        const left = isLogicalBinaryExpression(visited.left)
          ? ts.factory.createParenthesizedExpression(visited.left)
          : visited.left;
        const right = isLogicalBinaryExpression(visited.right)
          ? ts.factory.createParenthesizedExpression(visited.right)
          : visited.right;
        if (left !== visited.left || right !== visited.right) {
          return ts.factory.updateBinaryExpression(
            visited,
            left,
            visited.operatorToken,
            right,
          );
        }
      }

      return visited;
    };
    return (file) => ts.visitNode(file, visit) as ts.SourceFile;
  };

  const transformed = ts.transform(sourceFile, [transformer]);
  try {
    const resultFile = transformed.transformed[0];
    if (!resultFile) return content;
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      removeComments: false,
    });
    return printer.printFile(resultFile);
  } finally {
    transformed.dispose();
  }
}

export function getTypescriptParseDiagnostics(
  path: string,
  content: string,
): readonly ts.Diagnostic[] {
  const sourceFile = parseGeneratedTypescript(path, content);
  return (
    (sourceFile as ts.SourceFile & { parseDiagnostics?: readonly ts.Diagnostic[] })
      .parseDiagnostics ?? []
  );
}

export function assertGeneratedTypescriptParses(
  path: string,
  content: string,
): void {
  const diagnostics = getTypescriptParseDiagnostics(path, content);
  if (diagnostics.length > 0) {
    throw new Error(
      diagnostics
        .map((diagnostic) =>
          ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
        )
        .join("\n"),
    );
  }
  // Also reject SWC-invalid ?? / || mixes that TS may still parse into an AST.
  if (
    sourceFileHasUnparenthesizedNullishLogicalMix(
      parseGeneratedTypescript(path, content),
    )
  ) {
    throw new Error(
      `${path}: nullish coalescing (??) must not mix with || or && without parentheses.`,
    );
  }
}

export function findTypescriptParseIssues(
  content: string,
  path: string,
): string[] {
  const sourceFile = parseGeneratedTypescript(path, content);
  const issues: string[] = [];

  if (sourceFileHasUnparenthesizedNullishLogicalMix(sourceFile)) {
    issues.push(
      `${path}: nullish coalescing (??) must not mix with || or && without parentheses.`,
    );
  }

  const diagnostics =
    (sourceFile as ts.SourceFile & { parseDiagnostics?: readonly ts.Diagnostic[] })
      .parseDiagnostics ?? [];

  for (const diagnostic of diagnostics) {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, " ");
    const line =
      diagnostic.start != null
        ? sourceFile.getLineAndCharacterOfPosition(diagnostic.start).line + 1
        : null;
    issues.push(
      line
        ? `${path}:${line}: TypeScript parse error TS${diagnostic.code}: ${message}`
        : `${path}: TypeScript parse error TS${diagnostic.code}: ${message}`,
    );
  }

  return issues;
}
