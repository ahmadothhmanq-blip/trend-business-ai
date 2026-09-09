import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertSafeRuntimeHostUrl,
  probeRuntimeHostUrl,
  registerRuntimeHost,
} from "@/lib/webapp/runtime-host";
import {
  extractDeploymentState,
  resolveStoreProductionUrl,
  setRuntimeHostOnDeploymentState,
} from "@/lib/ai-core/app-design-platform/deploy";

describe("runtime host registration", () => {
  it("rejects unsafe and preview-host URLs", () => {
    assert.equal(assertSafeRuntimeHostUrl("http://app.example.com").ok, false);
    assert.equal(assertSafeRuntimeHostUrl("https://localhost/app").ok, false);
    assert.equal(assertSafeRuntimeHostUrl("https://192.168.1.10").ok, false);
    assert.equal(
      assertSafeRuntimeHostUrl("https://example.com/w/app/my-crm-abc").ok,
      false,
    );
    assert.equal(assertSafeRuntimeHostUrl("https://user:pass@evil.com").ok, false);
  });

  it("accepts public HTTPS hosts", () => {
    const safe = assertSafeRuntimeHostUrl("https://crm.example.com/app/");
    assert.equal(safe.ok, true);
    if (safe.ok) {
      assert.equal(safe.url, "https://crm.example.com/app");
    }
  });

  it("probes reachable hosts and stores verified status", async () => {
    const probe = await probeRuntimeHostUrl("https://crm.example.com", {
      fetchImpl: (async () =>
        new Response("ok", { status: 200 })) as unknown as typeof fetch,
    });
    assert.equal(probe.ok, true);
    const record = registerRuntimeHost({
      url: "https://crm.example.com",
      probe,
    });
    assert.equal(record.status, "verified");
    assert.ok(record.verifiedAt);

    const state = setRuntimeHostOnDeploymentState(extractDeploymentState({}), record);
    assert.equal(resolveStoreProductionUrl(state), "https://crm.example.com");
  });

  it("marks unreachable hosts without throwing", async () => {
    const probe = await probeRuntimeHostUrl("https://down.example.com", {
      fetchImpl: (async () => {
        throw new Error("network");
      }) as unknown as typeof fetch,
    });
    assert.equal(probe.ok, false);
    const record = registerRuntimeHost({
      url: "https://down.example.com",
      probe,
    });
    assert.equal(record.status, "unreachable");
    assert.equal(record.verifiedAt, null);
  });
});
