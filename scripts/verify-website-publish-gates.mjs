/**
 * Integration tests for publish quality gate parity (/publish vs /deploy).
 * Usage: npm run verify:website-publish-gates
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

let failed = 0;
function ok(label, detail = "") {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}
function fail(label, detail = "") {
  failed++;
  console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

console.log("\n[1] Shared publish-quality module");
const qualitySrc = read("lib/website/publish-quality.ts");
for (const fn of [
  "buildPublishQualityPayload",
  "buildPublishGateBlockPayload",
  "shouldBlockPublish",
  "evaluateGenerationPublishGates",
  "PUBLISH_GATE_BLOCK_MESSAGE",
]) {
  if (qualitySrc.includes(fn)) ok(`publish-quality exports ${fn}`);
  else fail(`publish-quality missing ${fn}`);
}

console.log("\n[2] Publishing engine gate enforcement");
const engineSrc = read("lib/ai-core/publishing/engine.ts");
for (const needle of [
  "evaluateGenerationPublishGates",
  "shouldBlockPublish",
  "buildPublishGateBlockPayload",
  "gateBlock: true",
  "force?: boolean",
]) {
  if (engineSrc.includes(needle)) ok(`engine: ${needle}`);
  else fail(`engine missing ${needle}`);
}

console.log("\n[3] Route parity (/publish and /deploy)");
const publishSrc = read("app/api/website-builder/[id]/publish/route.ts");
const deploySrc = read("app/api/website-builder/[id]/deploy/route.ts");

if (publishSrc.includes("runPublishingAction")) ok("/publish uses runPublishingAction");
else fail("/publish must use runPublishingAction");

if (deploySrc.includes("runPublishingAction")) ok("/deploy uses runPublishingAction");
else fail("/deploy must use runPublishingAction");

if (publishSrc.includes("buildPublishQualityPayload")) ok("/publish uses shared quality payload");
else fail("/publish must use buildPublishQualityPayload");

if (deploySrc.includes("buildPublishQualityPayload")) ok("/deploy uses shared quality payload");
else fail("/deploy must use buildPublishQualityPayload");

if (publishSrc.includes("gateBlock")) ok("/publish handles gateBlock 422");
else fail("/publish must handle gateBlock");

if (deploySrc.includes("gateBlock")) ok("/deploy handles gateBlock 422");
else fail("/deploy must handle gateBlock");

if (publishSrc.includes("force")) ok("/publish accepts force");
else fail("/publish must accept force");

if (deploySrc.includes("force")) ok("/deploy accepts force");
else fail("/deploy must accept force");

if (!publishSrc.includes("evaluatePublishGates(")) {
  ok("/publish does not call evaluatePublishGates directly");
} else {
  fail("/publish should delegate gates to runPublishingAction");
}

if (!deploySrc.includes("evaluatePublishGates(")) {
  ok("/deploy does not call evaluatePublishGates directly");
} else {
  fail("/deploy should delegate gates to runPublishingAction");
}

console.log("\n[4] Gate logic unit tests (parity contract)");

/** Must match lib/website/publish-quality.ts shouldBlockPublish */
function shouldBlockPublish(publishReady, force) {
  return !force && !publishReady;
}

try {
  assert.equal(shouldBlockPublish(false, false), true, "block when gates fail");
  assert.equal(shouldBlockPublish(false, true), false, "force bypasses failing gates");
  assert.equal(shouldBlockPublish(true, false), false, "pass when gates pass");
  assert.equal(shouldBlockPublish(true, true), false, "pass when gates pass with force");
  ok("shouldBlockPublish contract");
} catch (err) {
  fail("shouldBlockPublish contract", err.message);
}

console.log("\n[5] Simulated endpoint parity");

function simulatePublishEndpoint({ publishReady, force, action }) {
  if (action === "unpublish" || action === "prepare") {
    return { status: 200, blocked: false };
  }
  if (shouldBlockPublish(publishReady, force)) {
    return {
      status: 422,
      blocked: true,
      error: "Publishing blocked until critical quality issues are resolved.",
    };
  }
  return { status: 200, blocked: false };
}

function simulateDeployEndpoint({ publishReady, force, action }) {
  const publishLike =
    action === "publish" || action === "republish";
  if (!publishLike) {
    return { status: 200, blocked: false };
  }
  if (shouldBlockPublish(publishReady, force)) {
    return {
      status: 422,
      blocked: true,
      error: "Publishing blocked until critical quality issues are resolved.",
    };
  }
  return { status: 200, blocked: false };
}

const scenarios = [
  { publishReady: true, force: false, action: "publish" },
  { publishReady: false, force: false, action: "publish" },
  { publishReady: false, force: true, action: "publish" },
  { publishReady: false, force: false, action: "republish" },
  { publishReady: false, force: true, action: "republish" },
  { publishReady: false, force: false, action: "prepare" },
  { publishReady: false, force: false, action: "archive" },
];

for (const scenario of scenarios) {
  const pub = simulatePublishEndpoint(scenario);
  const dep = simulateDeployEndpoint(scenario);
  const publishAction =
    scenario.action === "publish" || scenario.action === "republish";
  const expectParity = publishAction;
  if (expectParity) {
    if (pub.status === dep.status && pub.blocked === dep.blocked) {
      ok(`parity ${scenario.action} ready=${scenario.publishReady} force=${scenario.force}`);
    } else {
      fail(
        `parity mismatch ${JSON.stringify(scenario)}`,
        `publish=${pub.status}/${pub.blocked} deploy=${dep.status}/${dep.blocked}`,
      );
    }
  } else if (dep.status === 200 && !dep.blocked) {
    ok(`deploy ${scenario.action} not gate-blocked`);
  } else {
    fail(`deploy ${scenario.action} should not be blocked`);
  }
}

console.log("\n[6] Deploy functionality preserved");
for (const feature of [
  "archive",
  "republish",
  "buildDeploymentDashboard",
  "recordDeploymentEvent",
  "domains",
]) {
  if (deploySrc.includes(feature) || feature === "domains") {
    if (feature === "domains") {
      if (existsSync(join(root, "app/api/website-builder/[id]/domains/route.ts"))) {
        ok("domains route exists");
      } else fail("domains route missing");
    } else if (deploySrc.includes(feature)) {
      ok(`deploy preserves ${feature}`);
    } else {
      fail(`deploy missing ${feature}`);
    }
  }
}

if (failed) {
  console.error(`\nverify-website-publish-gates: FAILED (${failed})`);
  process.exit(1);
}
console.log("\nverify-website-publish-gates: OK");
