import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildStructuredAppModel } from "@/lib/ai-core/app-design-platform/model-builder";
import {
  buildAppPreviewHtml,
  finalizeLivePreviewHtml,
} from "@/lib/webapp/build-app-preview";
import { buildAppPreviewManifest } from "@/lib/webapp/interactive-preview/manifest";
import {
  createPreviewSimState,
  previewSimLogin,
  previewSimNavigate,
  previewSimSignup,
} from "@/lib/webapp/interactive-preview/sim";
import {
  APP_LIVE_PREVIEW_CONTENT_SECURITY_POLICY,
  appPreviewSecurityHeaders,
} from "@/lib/webapp/sanitize-app-preview-html";

describe("interactive preview login flow only", () => {
  it("Arabic CRM preview wires clickable login → dashboard session contracts", () => {
    const model = buildStructuredAppModel({
      templateId: "crm",
      appName: "نظام المبيعات",
      prompt: "تطبيق إدارة علاقات العملاء للفريق التجاري",
      language: "Arabic",
      features: [],
    });
    const html = finalizeLivePreviewHtml(buildAppPreviewHtml({ model }));
    const manifest = buildAppPreviewManifest(model);

    assert.equal(manifest.loginPath, "/login");
    assert.equal(manifest.dashboardPath, "/dashboard");
    assert.match(html, /تسجيل الدخول/);
    assert.match(html, /إنشاء حساب|createAccount|mockSignup/);
    assert.match(html, /action === "login"|mockLogin/);
    assert.match(html, /action === "signup"|mockSignup/);
    assert.match(html, /show-signup/);
    assert.match(html, /type=\\"submit\\"|type="submit"/);
    assert.match(html, /class=\\"secondary\\"|class="secondary"/);
    assert.match(html, /sessionStorage/);
    assert.match(html, /M\.dashboardPath|dashboardPath/);
    assert.match(html, /data-action=\\"logout\\"|data-action="logout"/);

    const headers = appPreviewSecurityHeaders({ interactive: true });
    assert.equal(
      headers["Content-Security-Policy"],
      APP_LIVE_PREVIEW_CONTENT_SECURITY_POLICY,
    );
    assert.match(headers["Content-Security-Policy"], /form-action 'self'/);
    assert.doesNotMatch(
      headers["Content-Security-Policy"],
      /form-action 'none'/,
    );
  });

  it("login stores session, opens dashboard, survives reload state, logout returns", () => {
    const model = buildStructuredAppModel({
      templateId: "crm",
      appName: "نظام المبيعات",
      prompt: "تطبيق CRM عربي",
      language: "Arabic",
      features: [],
    });
    const manifest = buildAppPreviewManifest(model);
    let state = createPreviewSimState(manifest);

    assert.equal(previewSimLogin(state, manifest, "a", "short").ok, false);
    const firstLogin = previewSimLogin(
      state,
      manifest,
      "demo@example.com",
      "password1",
    );
    assert.equal(
      firstLogin.ok,
      true,
      "first valid login auto-creates a preview account",
    );
    state = firstLogin.state;
    assert.ok(state.session);
    assert.equal(state.route, "/dashboard");
    assert.equal(state.users.length, 1);

    // Wrong password for existing account must fail
    state = { ...state, session: null, route: "/login" };
    assert.equal(
      previewSimLogin(state, manifest, "demo@example.com", "password2").ok,
      false,
    );

    const signedUp = previewSimSignup(
      state,
      manifest,
      "second@example.com",
      "password1",
    );
    assert.equal(signedUp.ok, true);
    state = signedUp.state;
    assert.ok(state.session);
    assert.equal(state.route, "/dashboard");

    // Logout then login with real credentials
    state = { ...state, session: null, route: "/login" };
    const loggedIn = previewSimLogin(
      state,
      manifest,
      "demo@example.com",
      "password1",
    );
    assert.equal(loggedIn.ok, true);
    state = loggedIn.state;
    assert.equal(state.route, "/dashboard");

    // Simulate refresh: restore session + route
    const restored = {
      ...state,
      session: { ...state.session! },
      users: [...state.users],
      route: state.route,
    };
    assert.ok(restored.session);
    assert.equal(restored.route, "/dashboard");

    for (const nav of manifest.navigation) {
      const moved = previewSimNavigate(restored, manifest, nav.href);
      assert.equal(moved.ok, true, `nav ${nav.href}`);
      restored.route = moved.state.route;
      restored.session = moved.state.session;
    }

    // Logout
    restored.session = null;
    const back = previewSimNavigate(
      restored,
      manifest,
      manifest.loginPath || "/login",
    );
    assert.equal(back.ok, true);
    assert.equal(back.state.route, "/login");
  });
});
