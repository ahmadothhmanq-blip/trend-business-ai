import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AppTemplateId } from "@/lib/ai-core/app-design-platform/types";
import { buildStructuredAppModel } from "@/lib/ai-core/app-design-platform/model-builder";
import {
  buildAppPreviewHtml,
  finalizeLivePreviewHtml,
} from "@/lib/webapp/build-app-preview";
import {
  assertInteractiveAppPreviewReady,
  buildAppPreviewManifest,
} from "@/lib/webapp/interactive-preview";
import {
  createPreviewSimState,
  previewSimCreate,
  previewSimDelete,
  previewSimLogin,
  previewSimNavigate,
  previewSimQuery,
  previewSimSignup,
  previewSimUpdate,
} from "@/lib/webapp/interactive-preview/sim";
import {
  APP_LIVE_PREVIEW_CONTENT_SECURITY_POLICY,
  appPreviewSecurityHeaders,
  sanitizeTrustedInteractivePreviewHtml,
} from "@/lib/webapp/sanitize-app-preview-html";

const TEMPLATE_CASES: Array<{
  id: AppTemplateId;
  label: string;
  appName: string;
  verticalMarker: RegExp;
}> = [
  { id: "crm", label: "CRM", appName: "CRM Preview", verticalMarker: /data-vertical-view=\\"pipeline\\"|data-vertical-view="pipeline"/ },
  { id: "booking", label: "Booking", appName: "Booking Preview", verticalMarker: /data-vertical-view=\\"agenda\\"|preview\.agenda/ },
  { id: "education", label: "LMS", appName: "LMS Preview", verticalMarker: /data-preview-runtime="interactive"/ },
  { id: "ecommerce", label: "Marketplace", appName: "Marketplace Preview", verticalMarker: /data-vertical-view=\\"catalog\\"|preview\.catalogBoard/ },
  { id: "healthcare", label: "Healthcare", appName: "Healthcare Preview", verticalMarker: /data-vertical-view=\\"agenda\\"|preview\.clinicBoard/ },
  { id: "finance", label: "Finance", appName: "Finance Preview", verticalMarker: /data-vertical-view=\\"ledger\\"|preview\.ledgerBoard/ },
];

function buildModel(templateId: AppTemplateId, appName: string) {
  return buildStructuredAppModel({
    templateId,
    appName,
    prompt: `${appName} production app`,
    language: "English",
    features: [],
  });
}

describe("interactive App Builder live preview", () => {
  for (const tpl of TEMPLATE_CASES) {
    it(`${tpl.label}: interactive preview is GO (login, nav, CRUD contracts)`, () => {
      const model = buildModel(tpl.id, tpl.appName);
      const ready = assertInteractiveAppPreviewReady(model);
      assert.equal(ready.ready, true, ready.issues.join("\n"));

      const html = finalizeLivePreviewHtml(buildAppPreviewHtml({ model }));
      assert.match(html, /data-preview-runtime="interactive"/);
      assert.match(html, /__PREVIEW_MANIFEST__/);
      assert.match(html, /__PREVIEW_RUNTIME__/);
      assert.match(html, /sessionStorage/);
      assert.match(html, /action === "login"|action === \\"login\\"/);
      assert.match(html, /action === "signup"|action === \\"signup\\"/);
      assert.match(html, /mockLogin/);
      assert.match(html, /mockSignup/);
      assert.match(html, /data-action=\\"nav\\"|data-action="nav"/);
      assert.match(html, /data-action=\\"save-record\\"|data-action="save-record"/);
      assert.match(html, /data-action=\\"delete-record\\"|data-action="delete-record"/);
      assert.match(html, /data-action=\\"search\\"|data-action="search"/);
      assert.match(html, /data-action=\\"page-next\\"|data-action="page-next"/);
      assert.match(html, /data-action=\\"switch-role\\"|data-action="switch-role"/);
      assert.match(html, /interactive-v9/);
      assert.match(html, tpl.verticalMarker);

      const manifest = buildAppPreviewManifest(model);
      assert.equal(manifest.templateId, tpl.id);
      assert.ok(manifest.loginPath, `${tpl.label} missing login`);
      assert.ok(manifest.dashboardPath, `${tpl.label} missing dashboard`);
      assert.ok(manifest.screens.length >= 3, `${tpl.label} too few screens`);
      assert.ok(manifest.navigation.length >= 2, `${tpl.label} too few nav items`);
      assert.ok(manifest.entities.length >= 1, `${tpl.label} missing entities`);

      for (const nav of manifest.navigation) {
        assert.ok(
          manifest.screens.some((s) => s.path === nav.href),
          `${tpl.label} broken nav ${nav.href}`,
        );
      }
      for (const screen of model.screens) {
        const path = screen.path === "/" ? "/" : `/${screen.path.replace(/^\/+/, "")}`;
        assert.ok(
          manifest.screens.some((s) => s.path === path || s.path === screen.path),
          `${tpl.label} unreachable screen ${screen.path}`,
        );
      }
      for (const entity of manifest.entities) {
        assert.ok(entity.seed.length > 0, `${tpl.label} empty seed for ${entity.name}`);
        assert.ok(
          entity.crud.includes("create") ||
            entity.crud.includes("list") ||
            entity.crud.includes("read"),
          `${tpl.label} entity ${entity.name} has no usable CRUD`,
        );
      }
    });
  }

  it("localizes preview chrome for Spanish (not English leftovers)", () => {
    const model = buildStructuredAppModel({
      templateId: "booking",
      appName: "Cita Studio",
      prompt: "Cita Studio production app",
      language: "Spanish",
      features: [],
    });
    const manifest = buildAppPreviewManifest(model);
    assert.equal(manifest.i18n["preview.role"], "Rol");
    assert.match(manifest.i18n["preview.session"], /[Ss]esi/);
    assert.doesNotMatch(manifest.i18n["preview.demoHint"], /^Interactive preview/);
    assert.match(manifest.i18n["auth.signIn"], /Iniciar/);
  });

  it("trusted sanitizer keeps inline runtime and strips external scripts", () => {
    const model = buildModel("crm", "Sanitize CRM");
    const raw = buildAppPreviewHtml({ model });
    const poisoned = raw.replace(
      "</body>",
      `<script src="https://evil.test/x.js"></script><img src=x onerror="alert(1)"></body>`,
    );
    const clean = sanitizeTrustedInteractivePreviewHtml(poisoned);
    assert.match(clean, /__PREVIEW_RUNTIME__/);
    assert.match(clean, /sessionStorage/);
    assert.doesNotMatch(clean, /evil\.test/);
    assert.doesNotMatch(clean, /onerror/i);
  });

  it("live preview CSP allows first-party inline scripts", () => {
    const headers = appPreviewSecurityHeaders({ interactive: true });
    assert.equal(
      headers["Content-Security-Policy"],
      APP_LIVE_PREVIEW_CONTENT_SECURITY_POLICY,
    );
    assert.match(headers["Content-Security-Policy"], /script-src 'unsafe-inline'/);
  });

  it("fails readiness when a navigation link is broken", () => {
    const model = buildModel("crm", "Broken Nav CRM");
    model.navigation.push({
      id: "nav-broken",
      label: "Ghost",
      href: "/does-not-exist",
    });
    const ready = assertInteractiveAppPreviewReady(model);
    assert.equal(ready.ready, false);
    assert.ok(
      ready.issues.some((issue) => issue.includes("Broken navigation")),
      ready.issues.join("\n"),
    );
  });

  for (const tpl of TEMPLATE_CASES) {
    it(`${tpl.label}: simulated login, nav, CRUD, search, filter, pagination work`, () => {
      const model = buildModel(tpl.id, tpl.appName);
      const manifest = buildAppPreviewManifest(model);
      let state = createPreviewSimState(manifest);

      const badLogin = previewSimLogin(state, manifest, "bad", "short");
      assert.equal(badLogin.ok, false);

      const signedUp = previewSimSignup(
        state,
        manifest,
        "demo@example.com",
        "password1",
      );
      assert.equal(signedUp.ok, true);
      state = signedUp.state;
      assert.equal(state.route, manifest.dashboardPath);
      assert.ok(state.session);

      for (const nav of manifest.navigation) {
        const moved = previewSimNavigate(state, manifest, nav.href);
        assert.equal(moved.ok, true, `${tpl.label} nav failed: ${nav.href}`);
        state = moved.state;
        assert.equal(state.route, nav.href);
      }

      const entity = manifest.entities[0]!;
      const before = state.store[entity.name]!.length;
      state = previewSimCreate(state, entity.name, {
        [entity.fields[0]?.name || "name"]: "New Item",
      });
      assert.equal(state.store[entity.name]!.length, before + 1);

      const createdId = String(state.store[entity.name]![0]!.id);
      state = previewSimUpdate(state, entity.name, createdId, {
        [entity.fields[0]?.name || "name"]: "Updated Item",
      });
      assert.equal(
        state.store[entity.name]!.find((r) => String(r.id) === createdId)?.[
          entity.fields[0]?.name || "name"
        ],
        "Updated Item",
      );

      state = {
        ...state,
        ui: { ...state.ui, search: "Updated", filter: "", page: 1 },
      };
      const searched = previewSimQuery(state, entity.name);
      assert.ok(searched.total >= 1);

      state = {
        ...state,
        ui: { ...state.ui, search: "", filter: "", page: 2 },
      };
      const page2 = previewSimQuery(state, entity.name);
      assert.ok(page2.page >= 1);
      assert.ok(page2.pages >= 1);

      state = previewSimDelete(state, entity.name, createdId);
      assert.equal(
        state.store[entity.name]!.some((r) => String(r.id) === createdId),
        false,
      );
    });
  }
});
