/**
 * Strip business-demo leakage from design scaffolds at inject time.
 * Templates on disk stay unchanged; injected copies are business-pure.
 */

const DEMO_CONSTANT_RE =
  /const ((?:DEFAULT|CHAPTERS|TRUST)_[A-Z0-9_]+)\s*=\s*/g;

type ValueKind = "array" | "object" | "string" | "other";

/**
 * Scan a JS/TS initializer starting at `start` and return the index after its
 * terminating semicolon. Tracks strings and brace/bracket depth so object
 * constants and multi-line strings are closed correctly — unlike the old
 * line-based `];` heuristic that also matched TypeScript `Foo[];` annotations.
 */
function scanInitializerEnd(content: string, start: number): {
  end: number;
  kind: ValueKind;
  raw: string;
} {
  let i = start;
  while (i < content.length && /\s/.test(content[i]!)) i++;

  const first = content[i];
  let kind: ValueKind = "other";
  if (first === "[") kind = "array";
  else if (first === "{") kind = "object";
  else if (first === '"' || first === "'" || first === "`") kind = "string";

  let depth = 0;
  let inString: '"' | "'" | "`" | null = null;
  let escaped = false;
  const valueStart = i;

  for (; i < content.length; i++) {
    const c = content[i]!;

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (c === "\\") {
        escaped = true;
        continue;
      }
      if (c === inString) inString = null;
      continue;
    }

    if (c === '"' || c === "'" || c === "`") {
      inString = c;
      continue;
    }

    if (c === "[" || c === "{") {
      depth++;
      continue;
    }
    if (c === "]" || c === "}") {
      depth--;
      continue;
    }

    if (c === ";" && depth === 0) {
      return {
        end: i + 1,
        kind,
        raw: content.slice(valueStart, i).trim(),
      };
    }
  }

  return {
    end: content.length,
    kind,
    raw: content.slice(valueStart).trim(),
  };
}

/** Build `{ key: [], ... }` / `{ key: "", ... }` from an object literal source. */
function emptyObjectLiteral(rawObject: string): string {
  const body = rawObject.startsWith("{")
    ? rawObject.slice(1, rawObject.lastIndexOf("}"))
    : rawObject;
  const keys: Array<{ key: string; empty: string }> = [];
  let depth = 0;
  let inString: '"' | "'" | "`" | null = null;
  let escaped = false;
  let token = "";

  const flushKey = (from: number, to: number, valueHint: string) => {
    const key = body.slice(from, to).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return;
    const hint = valueHint.trimStart();
    const empty =
      hint.startsWith("[") ? "[]" : hint.startsWith("{") ? "{}" : '""';
    keys.push({ key, empty });
  };

  let keyStart = -1;
  for (let i = 0; i < body.length; i++) {
    const c = body[i]!;

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (c === "\\") {
        escaped = true;
        continue;
      }
      if (c === inString) inString = null;
      continue;
    }

    if (c === '"' || c === "'" || c === "`") {
      inString = c;
      continue;
    }

    if (c === "[" || c === "{") {
      depth++;
      continue;
    }
    if (c === "]" || c === "}") {
      depth--;
      continue;
    }

    if (depth !== 0) continue;

    if (c === ":" && keyStart >= 0) {
      const valueStart = i + 1;
      flushKey(keyStart, i, body.slice(valueStart));
      keyStart = -1;
      token = "";
      continue;
    }

    if (c === "," || c === "\n") {
      keyStart = -1;
      token = "";
      continue;
    }

    if (/[A-Za-z_]/.test(c)) {
      if (keyStart < 0) keyStart = i;
      token += c;
    } else if (keyStart >= 0 && /[A-Za-z0-9_]/.test(c)) {
      token += c;
    } else if (!/\s/.test(c)) {
      keyStart = -1;
      token = "";
    }
  }

  if (!keys.length) return "{}";
  return `{ ${keys.map((k) => `${k.key}: ${k.empty}`).join(", ")} }`;
}

function emptyReplacement(name: string, kind: ValueKind, raw: string): string {
  if (kind === "array") return `const ${name} = [];`;
  if (kind === "string") return `const ${name} = "";`;
  if (kind === "object") return `const ${name} = ${emptyObjectLiteral(raw)};`;
  return `const ${name} = undefined;`;
}

function stripDemoConstantBlocks(content: string): string {
  DEMO_CONSTANT_RE.lastIndex = 0;
  let out = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = DEMO_CONSTANT_RE.exec(content)) !== null) {
    const name = match[1]!;
    const valueStart = match.index + match[0].length;
    const scanned = scanInitializerEnd(content, valueStart);
    out += content.slice(lastIndex, match.index);
    out += emptyReplacement(name, scanned.kind, scanned.raw);
    lastIndex = scanned.end;
    DEMO_CONSTANT_RE.lastIndex = scanned.end;
  }

  out += content.slice(lastIndex);
  return out;
}

function stripDestructuringParamBlock(params: string): string {
  const lines = params.split("\n");
  const out: string[] = [];
  let skippingMultilineDefault = false;
  let depth = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    const indent = line.match(/^\s*/)?.[0] ?? "  ";

    if (skippingMultilineDefault) {
      depth += (line.match(/\[/g) ?? []).length;
      depth -= (line.match(/\]/g) ?? []).length;
      depth += (line.match(/\{/g) ?? []).length;
      depth -= (line.match(/\}/g) ?? []).length;
      if (
        depth <= 0 &&
        (trimmed.endsWith("],") ||
          trimmed.endsWith("},") ||
          trimmed === "]," ||
          trimmed === "},")
      ) {
        skippingMultilineDefault = false;
      }
      continue;
    }

    if (!trimmed || trimmed === ",") {
      out.push(line);
      continue;
    }
    if (/^(\w+)\s*,?$/.test(trimmed)) {
      out.push(line);
      continue;
    }

    const multilineArray = trimmed.match(/^(\w+)\s*=\s*\[/);
    if (multilineArray?.[1] && !trimmed.endsWith("],")) {
      out.push(`${indent}${multilineArray[1]} = [],`);
      skippingMultilineDefault = true;
      depth =
        (line.match(/\[/g) ?? []).length - (line.match(/\]/g) ?? []).length;
      continue;
    }

    const multilineObject = trimmed.match(/^(\w+)\s*=\s*\{/);
    if (multilineObject?.[1] && !trimmed.endsWith("},")) {
      out.push(`${indent}${multilineObject[1]} = {},`);
      skippingMultilineDefault = true;
      depth =
        (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
      continue;
    }

    // Keep `param = DEFAULT_*` / `TRUST_*` references. Demo values were already
    // emptied above; forcing `= []` broke object/string constants and left
    // props undefined when page bindings omit the field.
    if (
      /^(\w+)\s*=\s*(?:DEFAULT|CHAPTERS|TRUST|FOOTER|NAV|[A-Z][A-Z0-9_]*)\b/.test(
        trimmed,
      )
    ) {
      out.push(line);
      continue;
    }

    const withoutDefault = trimmed.replace(/^(\w+)\s*=\s*.+?,?$/, "$1,");
    if (withoutDefault !== trimmed) {
      out.push(`${indent}${withoutDefault}`);
      continue;
    }

    out.push(line);
  }

  return out.join("\n");
}

function stripDestructuringDefaults(content: string): string {
  return content.replace(
    /export function (\w+)\(\{([\s\S]*?)\}:\s*([^)]+)\)/g,
    (_match, name, params, propsType) => {
      const cleaned = stripDestructuringParamBlock(params);
      return `export function ${name}({\n${cleaned}\n}: ${propsType})`;
    },
  );
}

function stripDefaultObjectParams(content: string): string {
  return content.replace(
    /export function (\w+)\(\s*props:\s*Partial<[\s\S]*?>\s*=\s*\{\s*\}\s*\)/g,
    (match, name) => {
      const typeMatch = match.match(/props:\s*(Partial<[\s\S]*?>)/);
      const typeName = typeMatch?.[1] ?? "Record<string, unknown>";
      return `export function ${name}(props: ${typeName})`;
    },
  );
}

function stripPropsDestructuringDefaults(content: string): string {
  return content.replace(
    /const \{\s*([\s\S]*?)\s*\} = props;/g,
    (_match, block: string) => {
      const cleaned = block
        .split("\n")
        .map((line: string) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed === ",") return line;
          if (/^(\w+)\s*,?$/.test(trimmed)) return line;
          if (
            /^(\w+)\s*=\s*(?:DEFAULT|CHAPTERS|TRUST|FOOTER|NAV|[A-Z][A-Z0-9_]*)\b/.test(
              trimmed,
            )
          ) {
            return line;
          }
          const withoutDefault = trimmed.replace(/^(\w+)\s*=\s*.+?,?$/, "$1,");
          if (withoutDefault !== trimmed) {
            const indent = line.match(/^\s*/)?.[0] ?? "  ";
            return `${indent}${withoutDefault}`;
          }
          return line;
        })
        .join("\n");
      return `const {\n${cleaned}\n  } = props;`;
    },
  );
}

function stripHardcodedFlagshipProps(content: string): string {
  let out = content;
  out = out.replace(/\s+email="[^"]*"/g, "");
  out = out.replace(/\s+phone="[^"]*"/g, "");
  out = out.replace(/\s+address="[^"]*"/g, "");
  out = out.replace(/\s+items=\{\[[\s\S]*?\]\}/g, "");
  return out;
}

function stripKnownDemoLiterals(content: string): string {
  return content
    .replace(/Meridian Atlas/g, "")
    .replace(/Meridian Advisory/g, "")
    .replace(/Meridian Capital/g, "")
    .replace(/Meridian/g, "")
    .replace(/Azure Haven/g, "")
    .replace(/Book Now/g, "")
    .replace(/Reserve Your Table/g, "")
    .replace(/Corporate advisory/gi, "")
    .replace(/Schedule consultation/g, "")
    .replace(/<p className="[a-z]{2}-eyebrow[^"]*">Reservations<\/p>/g, "");
}

export type SanitizeDesignScaffoldOptions = {
  /** Keep DEFAULT_* arrays and destructuring defaults (flagship / visual skin apply). */
  preserveDefaults?: boolean;
};

export function sanitizeDesignScaffold(
  content: string,
  _componentId: string,
  options?: SanitizeDesignScaffoldOptions,
): string {
  if (options?.preserveDefaults) {
    return content;
  }
  let out = content;
  out = stripDemoConstantBlocks(out);
  out = stripDefaultObjectParams(out);
  out = stripDestructuringDefaults(out);
  out = stripPropsDestructuringDefaults(out);
  out = stripHardcodedFlagshipProps(out);
  out = stripKnownDemoLiterals(out);
  return out;
}
