import { resolveBatchCreditLeaseAction } from "../lib/ai-core/video-production-platform/batch";
import { assertSafeRemoteFetchUrl, UnsafeRemoteUrlError } from "../lib/website/url-safety";
import { requireUser, parseUuidParam, parseJsonBody } from "../lib/api/helpers";

async function main() {
  const policy = resolveBatchCreditLeaseAction({
    planOnly: false,
    successfulGenerations: 2,
  });
  if (policy !== "settle") throw new Error(`expected settle, got ${policy}`);

  let httpBlocked = false;
  try {
    await assertSafeRemoteFetchUrl("http://example.com/a.png");
  } catch (e) {
    httpBlocked = e instanceof UnsafeRemoteUrlError;
  }
  if (!httpBlocked) throw new Error("expected HTTP URLs to be blocked");

  let loopbackBlocked = false;
  try {
    await assertSafeRemoteFetchUrl("https://127.0.0.1/x.png");
  } catch (e) {
    loopbackBlocked = e instanceof UnsafeRemoteUrlError;
  }
  if (!loopbackBlocked) throw new Error("expected loopback HTTPS to be blocked");

  if (typeof requireUser !== "function") throw new Error("requireUser missing");
  if (typeof parseUuidParam !== "function") throw new Error("parseUuidParam missing");
  if (typeof parseJsonBody !== "function") throw new Error("parseJsonBody missing");

  // Confirm regenerate route source contains required imports (compile-time wiring check).
  const fs = await import("node:fs/promises");
  const regen = await fs.readFile(
    "app/api/video-studio/projects/[id]/scenes/[sceneId]/regenerate/route.ts",
    "utf8",
  );
  for (const needle of [
    'from "@/lib/api/helpers"',
    "requireUser",
    "parseUuidParam",
    "parseJsonBody",
    "serverErrorResponse(\"video-studio.scene-regenerate\"",
  ]) {
    if (!regen.includes(needle)) throw new Error(`regenerate route missing: ${needle}`);
  }

  const manage = await fs.readFile("app/api/video-studio/[id]/manage/route.ts", "utf8");
  if (!manage.includes('from "@/lib/website/url-safety"')) {
    throw new Error("manage route missing url-safety import");
  }
  if (!manage.includes("assertSafeRemoteFetchUrl")) {
    throw new Error("manage route missing assertSafeRemoteFetchUrl usage");
  }

  const batch = await fs.readFile("app/api/video-studio/batch/route.ts", "utf8");
  if (!batch.includes("resolveBatchCreditLeaseAction")) {
    throw new Error("batch route missing resolveBatchCreditLeaseAction");
  }
  if (!batch.includes("creditLease.settle")) {
    throw new Error("batch route missing settle");
  }

  console.log("P0 static verification PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
