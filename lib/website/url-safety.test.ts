import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertSafeRemoteFetchUrl,
  isSafeOutboundUrl,
  UnsafeRemoteUrlError,
} from "@/lib/website/url-safety";

test("blocks localhost and loopback hostnames without DNS", () => {
  assert.equal(isSafeOutboundUrl("https://localhost/x"), false);
  assert.equal(isSafeOutboundUrl("https://127.0.0.1/x"), false);
  assert.equal(isSafeOutboundUrl("http://example.com/x"), false);
});

test("assertSafeRemoteFetchUrl rejects localhost, private IP, metadata, and invalid URLs", async () => {
  await assert.rejects(
    () => assertSafeRemoteFetchUrl("https://localhost/secret"),
    UnsafeRemoteUrlError,
  );
  await assert.rejects(
    () => assertSafeRemoteFetchUrl("https://127.0.0.1/secret"),
    UnsafeRemoteUrlError,
  );
  await assert.rejects(
    () => assertSafeRemoteFetchUrl("https://192.168.1.10/x"),
    UnsafeRemoteUrlError,
  );
  await assert.rejects(
    () => assertSafeRemoteFetchUrl("https://169.254.169.254/latest/meta-data"),
    UnsafeRemoteUrlError,
  );
  await assert.rejects(() => assertSafeRemoteFetchUrl("not-a-url"), UnsafeRemoteUrlError);
  await assert.rejects(() => assertSafeRemoteFetchUrl("http://example.com"), UnsafeRemoteUrlError);
});

test("rejects DNS that resolves to private or metadata IPs", async () => {
  await assert.rejects(
    () =>
      assertSafeRemoteFetchUrl("https://evil.example/x", async () => [
        { address: "127.0.0.1", family: 4 },
      ]),
    /private or metadata/,
  );
  await assert.rejects(
    () =>
      assertSafeRemoteFetchUrl("https://evil.example/x", async () => [
        { address: "10.0.0.8", family: 4 },
      ]),
    /private or metadata/,
  );
  await assert.rejects(
    () =>
      assertSafeRemoteFetchUrl("https://evil.example/x", async () => [
        { address: "169.254.169.254", family: 4 },
      ]),
    /private or metadata/,
  );
});

test("allows a public resolved HTTPS host", async () => {
  const url = await assertSafeRemoteFetchUrl("https://cdn.example/video.mp4", async () => [
    { address: "1.1.1.1", family: 4 },
  ]);
  assert.equal(url, "https://cdn.example/video.mp4");
});
