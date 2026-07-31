/** Default Next.js dev server port when PORT / DEV_PORT are unset. */
export const DEFAULT_DEV_PORT = 3003;

/** Resolved dev server port from PORT, then DEV_PORT, then {@link DEFAULT_DEV_PORT}. */
export function resolveDevPort(): number {
  const raw =
    process.env.PORT?.trim() ||
    process.env.DEV_PORT?.trim() ||
    String(DEFAULT_DEV_PORT);
  const port = Number.parseInt(raw, 10);
  return Number.isFinite(port) && port > 0 ? port : DEFAULT_DEV_PORT;
}

/** Local dev origin, e.g. `http://localhost:3003`. */
export function getLocalDevOrigin(host = "localhost"): string {
  return `http://${host}:${resolveDevPort()}`;
}
