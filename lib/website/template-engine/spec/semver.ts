const SEMVER_CORE =
  /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/;

export type SemverParts = {
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
  build: string | null;
};

export function parseSemver(value: string): SemverParts | null {
  const match = value.trim().match(SEMVER_CORE);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ?? null,
    build: match[5] ?? null,
  };
}

function comparePrerelease(left: string | null, right: string | null): number {
  if (left === right) return 0;
  if (!left) return 1;
  if (!right) return -1;
  const leftParts = left.split(".");
  const rightParts = right.split(".");
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index += 1) {
    const a = leftParts[index];
    const b = rightParts[index];
    if (a === undefined) return -1;
    if (b === undefined) return 1;
    const aNum = /^\d+$/.test(a) ? Number(a) : null;
    const bNum = /^\d+$/.test(b) ? Number(b) : null;
    if (aNum !== null && bNum !== null) {
      if (aNum !== bNum) return aNum < bNum ? -1 : 1;
      continue;
    }
    if (aNum !== null) return -1;
    if (bNum !== null) return 1;
    if (a !== b) return a < b ? -1 : 1;
  }
  return 0;
}

export function compareSemver(left: string, right: string): number | null {
  const a = parseSemver(left);
  const b = parseSemver(right);
  if (!a || !b) return null;
  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
  return comparePrerelease(a.prerelease, b.prerelease);
}

type Comparator = {
  operator: string;
  version: string;
};

function parseComparator(token: string): Comparator | null {
  const trimmed = token.trim();
  const match = trimmed.match(/^(>=|<=|>|<|=)?\s*(.+)$/);
  if (!match) return null;
  const operator = match[1] || "=";
  const version = match[2].trim();
  if (!parseSemver(version)) return null;
  return { operator, version };
}

function satisfiesComparator(version: string, comparator: Comparator): boolean {
  const cmp = compareSemver(version, comparator.version);
  if (cmp === null) return false;
  switch (comparator.operator) {
    case "=":
      return cmp === 0;
    case ">":
      return cmp > 0;
    case ">=":
      return cmp >= 0;
    case "<":
      return cmp < 0;
    case "<=":
      return cmp <= 0;
    default:
      return false;
  }
}

/**
 * Supports simple semver ranges such as `>=1.0.0`, `1.0.0`, `>=1.0.0 <2.0.0`.
 */
export function satisfiesSemverRange(
  version: string,
  range: string,
): boolean {
  const comparators = range
    .split(/\s+/)
    .map(parseComparator)
    .filter((value): value is Comparator => value !== null);
  if (!comparators.length) return false;
  return comparators.every((comparator) =>
    satisfiesComparator(version, comparator),
  );
}
