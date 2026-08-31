import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyTranslatedSegments,
  extractTranslatableSegments,
} from "@/lib/website/visitor-locale/llm-translate";

describe("visitor locale LLM translate", () => {
  it("extracts title and visible nav text", () => {
    const html =
      '<html><head><title>Demo Cafe</title></head><body><nav><a>Home</a><a>Contact</a></nav></body></html>';
    const segments = extractTranslatableSegments(html);
    assert.ok(segments.some((s) => s.text === "Demo Cafe"));
    assert.ok(segments.some((s) => s.text === "Home"));
    assert.ok(segments.some((s) => s.text === "Contact"));
  });

  it("applies translated segments back into HTML", () => {
    const html = "<body><a>Home</a></body>";
    const segments = [{ id: "s0", text: "Home" }];
    const out = applyTranslatedSegments(html, segments, { s0: "الرئيسية" });
    assert.ok(out.includes("الرئيسية"));
    assert.ok(!out.includes(">Home<"));
  });
});
