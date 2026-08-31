import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isHostPlatformFilePath,
  isHostPlatformImport,
  relativeImportEscapesProject,
  shouldDropHostPlatformFile,
} from "@/lib/ai/webapp-isolation";

describe("webapp isolation", () => {
  it("rejects host-platform import specifiers", () => {
    assert.equal(isHostPlatformImport("@/lib/supabase/proxy"), true);
    assert.equal(isHostPlatformImport("@/lib/ai-core/domains/resolve"), true);
    assert.equal(isHostPlatformImport("@/lib/i18n/paths"), true);
    assert.equal(isHostPlatformImport("@/plugins/webapp/generate"), true);
    assert.equal(isHostPlatformImport("trend-business-ai/lib/auth"), true);
    assert.equal(isHostPlatformImport("@/lib/auth"), false);
    assert.equal(isHostPlatformImport("@/lib/supabase/client"), false);
    assert.equal(isHostPlatformImport("next/server"), false);
  });

  it("rejects host-only generated paths and copied proxy files", () => {
    assert.equal(isHostPlatformFilePath("lib/supabase/proxy.ts"), true);
    assert.equal(isHostPlatformFilePath("lib/ai-core/domains/resolve.ts"), true);
    assert.equal(isHostPlatformFilePath("lib/auth.ts"), false);
    assert.equal(isHostPlatformFilePath("lib/supabase/client.ts"), false);

    assert.equal(
      shouldDropHostPlatformFile(
        "proxy.ts",
        `import { updateSession } from "@/lib/supabase/proxy";`,
      ),
      true,
    );
    assert.equal(
      shouldDropHostPlatformFile(
        "proxy.ts",
        `import { NextResponse } from "next/server";
export function proxy() { return NextResponse.next(); }
`,
      ),
      false,
    );
  });

  it("detects relative imports that escape the generated tree", () => {
    assert.equal(
      relativeImportEscapesProject("app/page.tsx", "../../lib/i18n/paths"),
      true,
    );
    assert.equal(
      relativeImportEscapesProject("lib/auth.ts", "./session"),
      false,
    );
    assert.equal(
      relativeImportEscapesProject("app/login/page.tsx", "../../../proxy"),
      true,
    );
  });
});
