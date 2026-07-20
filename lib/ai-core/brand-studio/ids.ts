export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createShareToken(): string {
  return `bs_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}
