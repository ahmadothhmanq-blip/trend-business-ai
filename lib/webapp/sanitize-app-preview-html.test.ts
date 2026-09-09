import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildStructuredAppModel } from "@/lib/ai-core/app-design-platform/model-builder";
import { findWebAppReadinessIssues } from "@/lib/ai/webapp-readiness";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";
import { extractAppPreviewFromFiles } from "@/lib/webapp/build-app-preview";
import {
  APP_PREVIEW_CONTENT_SECURITY_POLICY,
  appPreviewSecurityHeaders,
  previewHtmlHasUnsafeVectors,
  sanitizeAppPreviewHtml,
} from "@/lib/webapp/sanitize-app-preview-html";

const fallbackModel = buildStructuredAppModel({
  templateId: "crm",
  appName: "Ops",
  prompt: "Ops CRM",
  language: "English",
  features: [],
});

describe("app preview HTML sanitization (P1-4)", () => {
  it("strips script tags including nested and uppercase variants", () => {
    const dirty = `<!DOCTYPE html><html><body>
<script>alert(1)</script>
<SCRIPT SRC="https://evil.test/x.js"></SCRIPT>
<div>ok</div>
<script type="text/javascript">alert(2)</script>
</body></html>`;
    const clean = sanitizeAppPreviewHtml(dirty);
    assert.equal(previewHtmlHasUnsafeVectors(clean), false);
    assert.doesNotMatch(clean, /<script/i);
    assert.match(clean, /<div>ok<\/div>/);
  });

  it("rejects malformed script smuggling that bypasses naive regex", () => {
    const dirty = `<html><body>
<script src=//evil.test/a.js</script>
<img src=x onerror="alert(1)">
<a href="javascript:alert(2)">x</a>
<div onclick=alert(3)>y</div>
</body></html>`;
    const clean = sanitizeAppPreviewHtml(dirty);
    assert.doesNotMatch(clean, /<script/i);
    assert.doesNotMatch(clean, /onerror/i);
    assert.doesNotMatch(clean, /onclick/i);
    assert.doesNotMatch(clean, /javascript:/i);
    assert.match(clean, /<div>y<\/div>|<div>y/);
  });

  it("removes iframe/object/embed/svg and javascript URLs", () => {
    const dirty = `<html><body>
<iframe src="https://evil.test"></iframe>
<object data="https://evil.test"></object>
<embed src="https://evil.test" />
<svg onload="alert(1)"><script>alert(1)</script></svg>
<a href="javascript:alert(1)">bad</a>
<a href="/safe">good</a>
<img src="data:text/html,<script>1</script>" />
<img src="https://cdn.example/a.png" alt="ok" />
</body></html>`;
    const clean = sanitizeAppPreviewHtml(dirty);
    assert.doesNotMatch(clean, /<iframe/i);
    assert.doesNotMatch(clean, /<object/i);
    assert.doesNotMatch(clean, /<embed/i);
    assert.doesNotMatch(clean, /<svg/i);
    assert.doesNotMatch(clean, /javascript:/i);
    assert.doesNotMatch(clean, /data:text\/html/i);
    assert.match(clean, /href="\/safe"/);
    assert.match(clean, /cdn\.example\/a\.png/);
  });

  it("keeps safe structure and style blocks without executable CSS", () => {
    const dirty = `<!DOCTYPE html><html><head>
<style>body{color:red} @import url("https://evil.test/x.css");
div{background:url(javascript:alert(1))}</style>
</head><body><h1 class="title">Hello</h1></body></html>`;
    const clean = sanitizeAppPreviewHtml(dirty);
    assert.match(clean, /<!DOCTYPE html>/i);
    assert.match(clean, /<style>/);
    assert.match(clean, /Hello/);
    assert.doesNotMatch(clean, /@import/i);
    assert.doesNotMatch(clean, /javascript:/i);
  });

  it("extractAppPreviewFromFiles prefers interactive model runtime over LLM stubs", () => {
    const html = extractAppPreviewFromFiles(
      [
        {
          path: "preview/index.html",
          language: "html",
          content: `<html><body><script>alert(1)</script><p onmouseover="x">Hi</p></body></html>`,
        },
      ],
      { model: fallbackModel },
    );
    assert.match(html, /data-preview-runtime="interactive"/);
    assert.match(html, /__PREVIEW_RUNTIME__/);
    assert.doesNotMatch(html, /onmouseover/i);
    assert.doesNotMatch(html, /alert\(1\)/);
  });

  it("CSP headers remain defense-in-depth; static CSP has no script-src", () => {
    const headers = appPreviewSecurityHeaders();
    assert.equal(
      headers["Content-Security-Policy"],
      APP_PREVIEW_CONTENT_SECURITY_POLICY,
    );
    assert.match(headers["Content-Security-Policy"], /default-src 'none'/);
    assert.doesNotMatch(headers["Content-Security-Policy"], /script-src/);
    assert.match(headers["Content-Security-Policy"], /style-src 'unsafe-inline'/);
  });

  it("readiness rejects unsanitized XSS preview files and hardener cleans them", () => {
    const dirty = {
      path: "preview/index.html",
      language: "html" as const,
      content: `<html><body><script>alert(1)</script><p>ok</p></body></html>`,
    };
    const before = findWebAppReadinessIssues([dirty], {});
    assert.ok(
      before.some((issue) => issue.includes("preview/index.html")),
      before.join("\n"),
    );

    const hardened = hardenGeneratedWebApp([dirty]);
    const preview = hardened.find((file) => file.path === "preview/index.html");
    assert.ok(preview);
    assert.equal(previewHtmlHasUnsafeVectors(preview!.content), false);
    const after = findWebAppReadinessIssues(hardened, {});
    assert.equal(
      after.some((issue) => issue.includes("preview/index.html")),
      false,
      after.join("\n"),
    );
  });
});
