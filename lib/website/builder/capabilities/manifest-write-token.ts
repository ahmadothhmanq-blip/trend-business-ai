/** Internal write authorization — only manifest.ts (via service) may persist manifests. */
export const MANIFEST_WRITE_TOKEN = Symbol("website-capability-manifest-write");
