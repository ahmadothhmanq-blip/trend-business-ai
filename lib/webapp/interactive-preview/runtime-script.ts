/**
 * In-iframe SPA runtime for App Builder live preview.
 * Isolated in-memory state only — no network, no backend.
 */

/** Returns the interactive preview runtime script (no user-data interpolation). */
export function getInteractivePreviewRuntimeScript(): string {
  return `(() => {
  "use strict";

  const PAGE_SIZE = 5;
  const STORAGE_PREFIX = "tbai-app-preview:";

  function readManifest() {
    const el = document.getElementById("__PREVIEW_MANIFEST__");
    if (!el || !el.textContent) throw new Error("Preview manifest missing");
    return JSON.parse(el.textContent);
  }

  const M = readManifest();
  const t = (key, vars) => {
    let s = (M.i18n && M.i18n[key]) || key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        s = s.replace(new RegExp("\\\\{" + k + "\\\\}", "g"), String(vars[k]));
      });
    }
    return s;
  };

  function storageKey() {
    return STORAGE_PREFIX + encodeURIComponent(M.appName || "app");
  }

  function defaultStore() {
    const store = {};
    (M.entities || []).forEach((e) => {
      store[e.name] = (e.seed || []).map((row) => Object.assign({}, row));
    });
    return store;
  }

  function loadState() {
    try {
      const raw = sessionStorage.getItem(storageKey());
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveState(state) {
    try {
      sessionStorage.setItem(storageKey(), JSON.stringify(state));
    } catch (_) {}
  }

  function createState() {
    const existing = loadState();
    if (existing && existing.runtime === M.runtime) {
      if (!existing.ui || typeof existing.ui !== "object") existing.ui = {};
      if (!existing.ui.authMode) existing.ui.authMode = "login";
      if (!existing.ui.formErrors) existing.ui.formErrors = {};
      if (typeof existing.ui.draftEmail !== "string") existing.ui.draftEmail = "";
      if (typeof existing.ui.draftPassword !== "string") existing.ui.draftPassword = "";
      if (!Array.isArray(existing.users)) existing.users = [];
      if (!existing.store || typeof existing.store !== "object") {
        existing.store = defaultStore();
      }
      return existing;
    }
    const state = {
      runtime: M.runtime,
      route: M.initialPath || M.homePath || "/",
      session: null,
      role: (M.roles[0] && M.roles[0].name) || "Admin",
      users: [],
      store: defaultStore(),
      ui: {
        search: "",
        filter: "",
        page: 1,
        editingId: null,
        showForm: false,
        authMode: "login",
        flash: null,
        formErrors: {},
        draftEmail: "",
        draftPassword: "",
      },
    };
    saveState(state);
    return state;
  }

  let state = createState();

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizePath(path) {
    const trimmed = String(path || "/").trim();
    if (!trimmed || trimmed === "/") return "/";
    return "/" + trimmed.replace(/^\\/+/, "").replace(/\\/+$/, "");
  }

  function screenByPath(path) {
    const p = normalizePath(path);
    return (M.screens || []).find((s) => s.path === p) || null;
  }

  function entityByName(name) {
    return (M.entities || []).find((e) => e.name === name) || null;
  }

  function entityForScreen(screen) {
    if (!screen) return null;
    for (let i = 0; i < (screen.dataBindings || []).length; i++) {
      const ent = entityByName(screen.dataBindings[i]);
      if (ent) return ent;
    }
    return null;
  }

  function roleAllowsPath(path) {
    const role = (M.roles || []).find(
      (r) => r.name.toLowerCase() === String(state.role || "").toLowerCase()
    );
    if (!role) return true;
    const screens = role.screens || [];
    if (!screens.length || screens.includes("*")) return true;
    const p = normalizePath(path);
    return screens.some((s) => normalizePath(s) === p || s === "*");
  }

  function setFlash(type, message) {
    state.ui.flash = { type: type, message: message };
  }

  function clearFlash() {
    state.ui.flash = null;
  }

  function navigate(path, options) {
    const next = normalizePath(path);
    const screen = screenByPath(next);
    if (!screen) {
      setFlash("error", "Broken navigation: " + next);
      saveState(state);
      render();
      return false;
    }
    if (screen.isAuth) {
      state.route = next;
      state.ui.page = 1;
      state.ui.editingId = null;
      state.ui.showForm = false;
      state.ui.formErrors = {};
      if (!options || !options.keepFlash) clearFlash();
      saveState(state);
      location.hash = "#" + next;
      render();
      return true;
    }
    if (!state.session && M.loginPath) {
      setFlash("error", t("auth.unableSignIn"));
      state.route = M.loginPath;
      saveState(state);
      location.hash = "#" + M.loginPath;
      render();
      return false;
    }
    if (state.session && !roleAllowsPath(next)) {
      setFlash("error", t("preview.noAccess"));
      saveState(state);
      render();
      return false;
    }
    state.route = next;
    state.ui.page = 1;
    state.ui.search = "";
    state.ui.filter = "";
    state.ui.editingId = null;
    state.ui.showForm = false;
    state.ui.formErrors = {};
    if (!options || !options.keepFlash) clearFlash();
    saveState(state);
    location.hash = "#" + next;
    render();
    return true;
  }

  function findUser(email) {
    const key = String(email || "").trim().toLowerCase();
    return (state.users || []).find(
      (u) => String(u.email || "").toLowerCase() === key
    ) || null;
  }

  function completeSignIn(email) {
    state.session = {
      email: String(email).trim(),
      role: state.role,
      signedInAt: new Date().toISOString(),
    };
    state.ui.formErrors = {};
    state.ui.authMode = "login";
    state.ui.draftEmail = "";
    state.ui.draftPassword = "";
    setFlash("success", t("preview.loginOk"));
    saveState(state);
    const destination = M.dashboardPath || "/dashboard";
    state.route = destination;
    saveState(state);
    if (normalizePath(location.hash.replace(/^#/, "")) !== normalizePath(destination)) {
      location.hash = "#" + destination;
    }
    render();
    return true;
  }

  function mockLogin(email, password) {
    const errors = {};
    if (!email || !String(email).includes("@")) {
      errors.email = t("preview.required");
    }
    if (!password || String(password).length < 8) {
      errors.password = t("preview.required");
    }
    if (Object.keys(errors).length) {
      state.ui.formErrors = errors;
      setFlash("error", t("auth.invalidCredentials"));
      saveState(state);
      render();
      return false;
    }
    let user = findUser(email);
    if (user && String(user.password) !== String(password)) {
      state.ui.formErrors = {
        email: t("auth.invalidCredentials"),
        password: t("auth.invalidCredentials"),
      };
      setFlash("error", t("auth.invalidCredentials"));
      saveState(state);
      render();
      return false;
    }
    // Interactive preview: first valid sign-in auto-creates a session account.
    if (!user) {
      if (!state.users) state.users = [];
      user = {
        email: String(email).trim().toLowerCase(),
        password: String(password),
        createdAt: new Date().toISOString(),
      };
      state.users.push(user);
      saveState(state);
    }
    return completeSignIn(user.email);
  }

  function mockSignup(email, password) {
    const errors = {};
    if (!email || !String(email).includes("@")) {
      errors.email = t("preview.required");
    }
    if (!password || String(password).length < 8) {
      errors.password = t("preview.required");
    }
    if (Object.keys(errors).length) {
      state.ui.formErrors = errors;
      setFlash("error", t("auth.invalidSignup"));
      saveState(state);
      render();
      return false;
    }
    if (findUser(email)) {
      state.ui.formErrors = { email: t("auth.accountExists") };
      setFlash("error", t("auth.accountExists"));
      saveState(state);
      render();
      return false;
    }
    if (!state.users) state.users = [];
    state.users.push({
      email: String(email).trim().toLowerCase(),
      password: String(password),
      createdAt: new Date().toISOString(),
    });
    setFlash("success", t("preview.signupOk"));
    saveState(state);
    return completeSignIn(String(email).trim().toLowerCase());
  }

  function logout() {
    state.session = null;
    state.ui.formErrors = {};
    state.ui.authMode = "login";
    clearFlash();
    saveState(state);
    navigate(M.loginPath || M.homePath || "/");
  }

  function primaryField(entity) {
    const preferred = ["name", "title", "email", "type"];
    for (let i = 0; i < preferred.length; i++) {
      if (entity.fields.some((f) => f.name === preferred[i])) return preferred[i];
    }
    return (entity.fields[0] && entity.fields[0].name) || "id";
  }

  function statusField(entity) {
    const f = entity.fields.find(
      (x) => x.name === "status" || x.name === "stage" || x.type === "enum"
    );
    return f ? f.name : null;
  }

  function isPipelineEntity(entity) {
    const stage = statusField(entity);
    if (!stage) return false;
    const field = entity.fields.find((f) => f.name === stage);
    return Boolean(field && field.enumValues && field.enumValues.length >= 3);
  }

  function entityKey(entity) {
    return String(entity && entity.name ? entity.name : "")
      .trim()
      .toLowerCase();
  }

  function formatWhen(value) {
    if (value == null || value === "") return "—";
    const raw = String(value);
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      try {
        return d.toLocaleString(M.htmlLang || undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return raw.slice(0, 16).replace("T", " ");
      }
    }
    return raw;
  }

  function formatMoney(value) {
    if (value == null || value === "") return "—";
    const n = Number(value);
    if (Number.isFinite(n)) {
      try {
        return new Intl.NumberFormat(M.htmlLang || undefined, {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(n);
      } catch {
        return String(n);
      }
    }
    return String(value);
  }

  function agendaBoard(titleKey, rows, timeKey, titleFn, metaFn, statusKey) {
    const items = rows
      .slice()
      .sort(function (a, b) {
        return String(a[timeKey] || "").localeCompare(String(b[timeKey] || ""));
      })
      .map(function (row) {
        return (
          '<article class="agenda-item" data-vertical-board="agenda">' +
          '<div class="when">' +
          escapeHtml(formatWhen(row[timeKey])) +
          "</div>" +
          "<div><strong>" +
          escapeHtml(titleFn(row)) +
          '</strong><div class="meta">' +
          escapeHtml(metaFn(row)) +
          "</div></div>" +
          (statusKey
            ? '<span class="badge">' +
              escapeHtml(row[statusKey] == null ? "" : String(row[statusKey])) +
              "</span>"
            : "") +
          "</article>"
        );
      })
      .join("");
    return (
      '<div class="card" data-vertical-view="agenda"><h3>' +
      escapeHtml(t(titleKey)) +
      '</h3><div class="agenda">' +
      (items ||
        '<p class="muted">' + escapeHtml(t("crud.empty")) + "</p>") +
      "</div></div>"
    );
  }

  function catalogBoard(rows) {
    const cards = rows
      .map(function (row) {
        const title =
          row.title != null
            ? row.title
            : row.name != null
              ? row.name
              : row.id;
        const price =
          row.price != null
            ? formatMoney(row.price)
            : row.amount != null
              ? formatMoney(row.amount)
              : "";
        const stock =
          row.stock != null
            ? "Stock " + String(row.stock)
            : row.category != null
              ? String(row.category)
              : "";
        return (
          '<article class="product-card" data-vertical-board="catalog">' +
          "<strong>" +
          escapeHtml(title) +
          '</strong><div class="price">' +
          escapeHtml(price) +
          '</div><div class="meta">' +
          escapeHtml(stock) +
          "</div><p class=\\"muted\\">" +
          escapeHtml(row.description == null ? "" : String(row.description)) +
          "</p></article>"
        );
      })
      .join("");
    return (
      '<div class="card" data-vertical-view="catalog"><h3>' +
      escapeHtml(t("preview.catalogBoard")) +
      '</h3><div class="product-grid">' +
      (cards ||
        '<p class="muted">' + escapeHtml(t("crud.empty")) + "</p>") +
      "</div></div>"
    );
  }

  function ledgerBoard(rows) {
    const cards = rows
      .map(function (row) {
        return (
          '<article class="ledger-card" data-vertical-board="ledger">' +
          '<div class="code">' +
          escapeHtml(row.code == null ? row.id : String(row.code)) +
          "</div><strong>" +
          escapeHtml(row.name == null ? row.id : String(row.name)) +
          '</strong><div class="balance">' +
          escapeHtml(
            formatMoney(row.balance != null ? row.balance : row.amount)
          ) +
          '</div><div class="type">' +
          escapeHtml(row.type == null ? "" : String(row.type)) +
          "</div></article>"
        );
      })
      .join("");
    return (
      '<div class="card" data-vertical-view="ledger"><h3>' +
      escapeHtml(t("preview.ledgerBoard")) +
      '</h3><div class="ledger-grid">' +
      (cards ||
        '<p class="muted">' + escapeHtml(t("crud.empty")) + "</p>") +
      "</div></div>"
    );
  }

  function transactionBoard(rows) {
    const items = rows
      .slice()
      .sort(function (a, b) {
        return String(b.date || "").localeCompare(String(a.date || ""));
      })
      .map(function (row) {
        const amount = Number(row.amount);
        const cls = Number.isFinite(amount) && amount < 0 ? "neg" : "pos";
        return (
          '<div class="tx-row" data-vertical-board="transactions">' +
          "<div><strong>" +
          escapeHtml(
            row.memo == null ? row.reference || row.id : String(row.memo)
          ) +
          '</strong><div class="muted">' +
          escapeHtml(row.date == null ? "" : String(row.date)) +
          " · " +
          escapeHtml(row.reference == null ? "" : String(row.reference)) +
          '</div></div><div class="amt ' +
          cls +
          '">' +
          escapeHtml(formatMoney(row.amount)) +
          "</div></div>"
        );
      })
      .join("");
    return (
      '<div class="card" data-vertical-view="transactions"><h3>' +
      escapeHtml(t("preview.ledgerBoard")) +
      '</h3><div class="tx-list">' +
      (items ||
        '<p class="muted">' + escapeHtml(t("crud.empty")) + "</p>") +
      "</div></div>"
    );
  }

  function verticalSpecialtyBoard(entity, rowsAll) {
    const key = entityKey(entity);
    if (key === "booking") {
      return agendaBoard(
        "preview.agenda",
        rowsAll,
        "startsAt",
        function (row) {
          return String(row.notes || row.serviceId || row.id);
        },
        function (row) {
          return (
            String(row.customerId || "") +
            (row.serviceId ? " · " + row.serviceId : "")
          );
        },
        "status"
      );
    }
    if (key === "appointment") {
      return agendaBoard(
        "preview.clinicBoard",
        rowsAll,
        "startsAt",
        function (row) {
          return String(row.reason || row.providerName || row.id);
        },
        function (row) {
          return (
            String(row.providerName || "") +
            (row.patientId ? " · " + row.patientId : "")
          );
        },
        "status"
      );
    }
    if (key === "product") {
      return catalogBoard(rowsAll);
    }
    if (key === "ledgeraccount" || key === "account") {
      return ledgerBoard(rowsAll);
    }
    if (key === "transaction") {
      return transactionBoard(rowsAll);
    }
    return "";
  }

  function honestyBanner() {
    return (
      '<div class="trust-banner" role="note">' +
      "<span>" +
      escapeHtml(t("preview.zipHonesty")) +
      "</span> " +
      '<button type="button" data-action="reset-demo" class="secondary" style="margin-inline-start:8px;min-height:28px;padding:4px 8px;font-size:11px;background:transparent;color:inherit;border:1px solid color-mix(in srgb, var(--primary) 35%, transparent);border-radius:8px;cursor:pointer;">' +
      escapeHtml(t("preview.resetDemo")) +
      "</button></div>"
    );
  }

  function filteredRows(entity) {
    let rows = (state.store[entity.name] || []).slice();
    const q = String(state.ui.search || "").trim().toLowerCase();
    const filter = String(state.ui.filter || "").trim();
    const statusKey = statusField(entity);
    if (q) {
      rows = rows.filter((row) =>
        JSON.stringify(row).toLowerCase().includes(q)
      );
    }
    if (filter && statusKey) {
      rows = rows.filter((row) => String(row[statusKey]) === filter);
    }
    return rows;
  }

  function paginate(rows) {
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(Math.max(1, state.ui.page || 1), pages);
    const start = (page - 1) * PAGE_SIZE;
    return {
      rows: rows.slice(start, start + PAGE_SIZE),
      total: total,
      page: page,
      pages: pages,
    };
  }

  function validateForm(entity, values) {
    const errors = {};
    entity.fields.forEach((field) => {
      if (!field.required) return;
      const v = values[field.name];
      if (v == null || String(v).trim() === "") {
        errors[field.name] = t("preview.required");
      }
    });
    return errors;
  }

  function upsertRecord(entity, values, editingId) {
    const errors = validateForm(entity, values);
    if (Object.keys(errors).length) {
      state.ui.formErrors = errors;
      setFlash("error", t("crud.unableCreate"));
      saveState(state);
      render();
      return false;
    }
    const list = state.store[entity.name] || (state.store[entity.name] = []);
    if (editingId) {
      const idx = list.findIndex((r) => String(r.id) === String(editingId));
      if (idx >= 0) {
        list[idx] = Object.assign({}, list[idx], values, { id: editingId });
      }
    } else {
      const id = entity.name.toLowerCase() + "-" + Date.now();
      list.unshift(Object.assign({}, values, { id: id }));
    }
    state.ui.editingId = null;
    state.ui.showForm = false;
    state.ui.formErrors = {};
    setFlash("success", t("preview.saved"));
    saveState(state);
    render();
    return true;
  }

  function deleteRecord(entity, id) {
    const list = state.store[entity.name] || [];
    state.store[entity.name] = list.filter((r) => String(r.id) !== String(id));
    setFlash("success", t("preview.deleted"));
    saveState(state);
    render();
  }

  function flashHtml() {
    if (!state.ui.flash) return "";
    const cls = state.ui.flash.type === "success" ? "flash ok" : "flash err";
    return '<div class="' + cls + '" data-action="dismiss-flash">' +
      escapeHtml(state.ui.flash.message) + "</div>";
  }

  function topbarHtml() {
    const roles = (M.roles || [])
      .map(
        (r) =>
          '<option value="' +
          escapeHtml(r.name) +
          '"' +
          (r.name === state.role ? " selected" : "") +
          ">" +
          escapeHtml(r.label || r.name) +
          "</option>"
      )
      .join("");
    const sessionLabel = state.session
      ? escapeHtml(state.session.email)
      : escapeHtml(t("preview.session"));
    return (
      '<div class="topbar">' +
      "<strong>" + escapeHtml(M.appName) + "</strong>" +
      '<div class="topbar-meta">' +
      '<label class="role-switch">' + escapeHtml(t("preview.role")) +
      ' <select data-action="switch-role">' + roles + "</select></label>" +
      '<span class="session">' + sessionLabel + "</span>" +
      (state.session
        ? '<button type="button" data-action="logout">' +
          escapeHtml(t("preview.logout")) +
          "</button>"
        : "") +
      "</div></div>"
    );
  }

  function navHtml(currentPath) {
    if (!state.session) return "";
    const items = (M.navigation || [])
      .filter((n) => roleAllowsPath(n.href))
      .map((n) => {
        const active = normalizePath(n.href) === normalizePath(currentPath);
        return (
          '<a href="#' +
          escapeHtml(n.href) +
          '" data-action="nav" data-path="' +
          escapeHtml(n.href) +
          '" class="' +
          (active ? "active" : "") +
          '">' +
          escapeHtml(n.label) +
          "</a>"
        );
      })
      .join("");
    return '<nav class="nav">' + items + "</nav>";
  }

  function authView(screen) {
    const isSignup = state.ui.authMode === "signup";
    const errEmail = state.ui.formErrors.email
      ? '<div class="field-error">' + escapeHtml(state.ui.formErrors.email) + "</div>"
      : "";
    const errPass = state.ui.formErrors.password
      ? '<div class="field-error">' + escapeHtml(state.ui.formErrors.password) + "</div>"
      : "";
    const title = isSignup ? t("auth.createAccount") : screen.title;
    const subtitle = isSignup
      ? t("auth.createAccountSubtitle")
      : t("auth.signInSubtitle");
    const submitAction = isSignup ? "signup" : "login";
    const submitLabel = isSignup ? t("auth.createAccount") : t("auth.signIn");
    const switchAction = isSignup ? "show-login" : "show-signup";
    const switchText = isSignup
      ? t("auth.alreadyRegistered") + " " + t("auth.signIn")
      : t("auth.noAccount") + " " + t("auth.createOne");
    return (
      '<section class="screen auth">' +
      '<header class="screen-head"><h2>' +
      escapeHtml(title) +
      "</h2><p class=\\"muted\\">" +
      escapeHtml(subtitle) +
      "</p><p class=\\"muted\\">" +
      escapeHtml(t("preview.demoHint")) +
      "</p></header>" +
      flashHtml() +
      '<form class="card form" data-action="' +
      submitAction +
      '" onsubmit="return false;">' +
      '<div class="field">' +
      "<label for=\\"preview-email\\">" +
      escapeHtml(t("common.email")) +
      "</label>" +
      '<input id="preview-email" name="email" type="text" inputmode="email" autocomplete="email" required value="' +
      escapeHtml((state.ui && state.ui.draftEmail) || "") +
      '" />' +
      errEmail +
      "</div>" +
      '<div class="field">' +
      "<label for=\\"preview-password\\">" +
      escapeHtml(t("common.password")) +
      "</label>" +
      '<input id="preview-password" name="password" type="password" autocomplete="' +
      (isSignup ? "new-password" : "current-password") +
      '" minlength="8" required value="' +
      escapeHtml((state.ui && state.ui.draftPassword) || "") +
      '" />' +
      errPass +
      "</div>" +
      '<button type="submit" data-action="' +
      submitAction +
      '">' +
      escapeHtml(submitLabel) +
      "</button>" +
      '<button type="button" class="secondary" data-action="' +
      switchAction +
      '">' +
      escapeHtml(switchText) +
      "</button></form></section>"
    );
  }

  function dashboardView(screen) {
    const cards = (M.entities || [])
      .map((ent) => {
        const count = (state.store[ent.name] || []).length;
        const target =
          (M.screens || []).find(
            (s) =>
              !s.isAuth &&
              (s.dataBindings || []).includes(ent.name)
          ) || null;
        const href = target ? target.path : M.dashboardPath;
        return (
          '<button type="button" class="card stat" data-action="nav" data-path="' +
          escapeHtml(href) +
          '"><div class="label">' +
          escapeHtml(ent.label) +
          '</div><div class="kpi">' +
          count +
          '</div><div class="cta">' +
          escapeHtml(t("preview.open")) +
          "</div></button>"
        );
      })
      .join("");
    const catalog = (M.catalog || [])
      .slice(0, 6)
      .map(
        (item) =>
          '<article class="product"><strong>' +
          escapeHtml(item.title) +
          "</strong><span>" +
          escapeHtml(item.price || "") +
          '</span><p class="muted">' +
          escapeHtml(item.description || item.category || "") +
          "</p></article>"
      )
      .join("");
    return (
      '<section class="screen">' +
      '<header class="screen-head"><h2>' +
      escapeHtml(screen.title) +
      "</h2>" +
      (screen.purpose
        ? '<p class="muted">' + escapeHtml(screen.purpose) + "</p>"
        : "") +
      "</header>" +
      flashHtml() +
      '<div class="grid stats">' +
      (cards ||
        '<div class="card empty-state"><p class="title">' +
          escapeHtml(t("preview.emptyTitle")) +
          '</p><p class="muted">' +
          escapeHtml(t("dashboard.emptyHint")) +
          "</p></div>") +
      "</div>" +
      (catalog
        ? '<div class="card"><h3>' +
          escapeHtml(t("common.records")) +
          '</h3><div class="grid">' +
          catalog +
          "</div></div>"
        : "") +
      "</section>"
    );
  }

  function fieldInput(field, value) {
    const v = value == null ? "" : String(value);
    if (field.type === "boolean") {
      return (
        '<select name="' +
        escapeHtml(field.name) +
        '"><option value="true"' +
        (v === "true" || value === true ? " selected" : "") +
        ">true</option><option value=\\"false\\"" +
        (v === "false" || value === false ? " selected" : "") +
        ">false</option></select>"
      );
    }
    if (field.type === "enum" && field.enumValues && field.enumValues.length) {
      return (
        '<select name="' +
        escapeHtml(field.name) +
        '">' +
        field.enumValues
          .map(
            (opt) =>
              '<option value="' +
              escapeHtml(opt) +
              '"' +
              (v === opt ? " selected" : "") +
              ">" +
              escapeHtml(opt) +
              "</option>"
          )
          .join("") +
        "</select>"
      );
    }
    const inputType =
      field.type === "number" || field.type === "money"
        ? "number"
        : field.type === "date"
          ? "date"
          : "text";
    return (
      '<input name="' +
      escapeHtml(field.name) +
      '" type="' +
      inputType +
      '" value="' +
      escapeHtml(v) +
      '"' +
      (field.required ? " required" : "") +
      " />"
    );
  }

  function crudView(screen, entity) {
    const canCreate = entity.crud.includes("create");
    const canUpdate = entity.crud.includes("update");
    const canDelete = entity.crud.includes("delete");
    const rowsAll = filteredRows(entity);
    const page = paginate(rowsAll);
    const statusKey = statusField(entity);
    const statusFieldDef = statusKey
      ? entity.fields.find((f) => f.name === statusKey)
      : null;
    const filterOptions =
      statusFieldDef && statusFieldDef.enumValues
        ? statusFieldDef.enumValues
        : [];
    const pf = primaryField(entity);
    const editing =
      state.ui.editingId &&
      (state.store[entity.name] || []).find(
        (r) => String(r.id) === String(state.ui.editingId)
      );

    const filters =
      '<div class="toolbar">' +
      '<input data-action="search" placeholder="' +
      escapeHtml(t("preview.search")) +
      '" value="' +
      escapeHtml(state.ui.search || "") +
      '" />' +
      (filterOptions.length
        ? '<select data-action="filter"><option value="">' +
          escapeHtml(t("preview.all")) +
          "</option>" +
          filterOptions
            .map(
              (opt) =>
                '<option value="' +
                escapeHtml(opt) +
                '"' +
                (state.ui.filter === opt ? " selected" : "") +
                ">" +
                escapeHtml(opt) +
                "</option>"
            )
            .join("") +
          "</select>"
        : "") +
      (canCreate
        ? '<button type="button" data-action="new-record">' +
          escapeHtml(t("crud.newRecord")) +
          "</button>"
        : "") +
      "</div>";

    const displayFields = entity.fields
      .filter((f) => f.name !== pf)
      .slice(0, 6);

    const tableRows = page.rows
      .map((row) => {
        const cells = displayFields
          .map(
            (f) =>
              "<td>" +
              escapeHtml(row[f.name] == null ? t("common.emptyValue") : row[f.name]) +
              "</td>"
          )
          .join("");
        return (
          "<tr><td>" +
          escapeHtml(row[pf] == null ? row.id : row[pf]) +
          "</td>" +
          cells +
          "<td class=\\"actions\\">" +
          (canUpdate
            ? '<button type="button" data-action="edit-record" data-id="' +
              escapeHtml(row.id) +
              '">' +
              escapeHtml(t("preview.edit")) +
              "</button>"
            : "") +
          (canDelete
            ? '<button type="button" data-action="delete-record" data-id="' +
              escapeHtml(row.id) +
              '">' +
              escapeHtml(t("common.delete")) +
              "</button>"
            : "") +
          "</td></tr>"
        );
      })
      .join("");

    const head = displayFields
      .map((f) => "<th>" + escapeHtml(f.label) + "</th>")
      .join("");

    const formFields = entity.fields
      .map((f) => {
        const err = state.ui.formErrors[f.name]
          ? '<div class="field-error">' +
            escapeHtml(state.ui.formErrors[f.name]) +
            "</div>"
          : "";
        const val = editing ? editing[f.name] : "";
        return (
          "<label>" +
          escapeHtml(f.label) +
          (f.required ? " *" : "") +
          fieldInput(f, val) +
          err +
          "</label>"
        );
      })
      .join("");

    const formVisible = Boolean(state.ui.showForm || state.ui.editingId);
    const form =
      formVisible
        ? '<form class="card form" data-action="save-record">' +
          "<h3>" +
          escapeHtml(
            state.ui.editingId ? t("preview.edit") : t("crud.newRecord")
          ) +
          "</h3>" +
          formFields +
          '<div class="form-actions">' +
          '<button type="submit">' +
          escapeHtml(t("preview.save")) +
          "</button>" +
          '<button type="button" data-action="cancel-edit">' +
          escapeHtml(t("preview.cancel")) +
          "</button></div></form>"
        : "";

    const pager =
      '<div class="pager">' +
      '<button type="button" data-action="page-prev"' +
      (page.page <= 1 ? " disabled" : "") +
      ">" +
      escapeHtml(t("preview.prev")) +
      "</button>" +
      "<span>" +
      escapeHtml(t("preview.page")) +
      " " +
      page.page +
      " / " +
      page.pages +
      " · " +
      page.total +
      "</span>" +
      '<button type="button" data-action="page-next"' +
      (page.page >= page.pages ? " disabled" : "") +
      ">" +
      escapeHtml(t("preview.next")) +
      "</button></div>";

    let board = verticalSpecialtyBoard(entity, rowsAll);
    const pipelineTitle =
      entityKey(entity) === "order"
        ? "preview.fulfillment"
        : "preview.pipeline";
    if (!board && isPipelineEntity(entity) && statusKey && filterOptions.length) {
      const columns = filterOptions
        .map((stage) => {
          const cards = rowsAll
            .filter((row) => String(row[statusKey]) === String(stage))
            .map((row) => {
              const valueField = entity.fields.find(
                (f) =>
                  f.name === "value" ||
                  f.name === "amount" ||
                  f.type === "money"
              );
              const meta = valueField
                ? '<div class="meta">' +
                  escapeHtml(
                    row[valueField.name] == null
                      ? ""
                      : String(row[valueField.name])
                  ) +
                  "</div>"
                : "";
              const moves = filterOptions
                .filter((s) => s !== stage)
                .slice(0, 4)
                .map(
                  (nextStage) =>
                    '<button type="button" data-action="move-stage" data-id="' +
                    escapeHtml(row.id) +
                    '" data-stage="' +
                    escapeHtml(nextStage) +
                    '">' +
                    escapeHtml(nextStage) +
                    "</button>"
                )
                .join("");
              return (
                '<div class="kanban-card"><strong>' +
                escapeHtml(row[pf] == null ? row.id : row[pf]) +
                "</strong>" +
                meta +
                (canUpdate
                  ? '<div class="actions">' + moves + "</div>"
                  : "") +
                "</div>"
              );
            })
            .join("");
          return (
            '<div class="kanban-col"><h4><span>' +
            escapeHtml(stage) +
            "</span><span>" +
            String(
              rowsAll.filter((row) => String(row[statusKey]) === String(stage))
                .length
            ) +
            "</span></h4>" +
            (cards ||
              '<p class="muted">' + escapeHtml(t("crud.empty")) + "</p>") +
            "</div>"
          );
        })
        .join("");
      board =
        '<div class="card" data-vertical-view="pipeline"><h3>' +
        escapeHtml(t(pipelineTitle)) +
        '</h3><div class="kanban">' +
        columns +
        "</div></div>";
    }

    return (
      '<section class="screen">' +
      '<header class="screen-head"><h2>' +
      escapeHtml(screen.title) +
      "</h2><p class=\\"muted\\">" +
      escapeHtml(t("crud.recordsSubtitle")) +
      "</p></header>" +
      flashHtml() +
      filters +
      board +
      '<div class="card"><div class="table-wrap"><table><thead><tr><th>' +
      escapeHtml(t("common.name")) +
      "</th>" +
      head +
      "<th>" +
      escapeHtml(t("common.actions")) +
      "</th></tr></thead><tbody>" +
      (tableRows ||
        '<tr><td colspan="' +
          String(displayFields.length + 2) +
          '"><div class="empty-state"><p class="title">' +
          escapeHtml(t("preview.emptyTitle")) +
          '</p><p class="muted">' +
          escapeHtml(t("crud.empty")) +
          "</p>" +
          (canCreate
            ? '<button type="button" data-action="new-record">' +
              escapeHtml(t("preview.addFirst")) +
              "</button>"
            : "") +
          "</div></td></tr>") +
      "</tbody></table></div>" +
      pager +
      "</div>" +
      form +
      "</section>"
    );
  }

  function genericView(screen) {
    const comps = (screen.componentTypes || [])
      .map(
        (type) =>
          '<div class="card"><h3>' +
          escapeHtml(type) +
          '</h3><p class="muted">' +
          escapeHtml(t("dashboard.emptyHint")) +
          '</p><button type="button" data-action="nav" data-path="' +
          escapeHtml(M.dashboardPath) +
          '">' +
          escapeHtml(t("home.openDashboard")) +
          "</button></div>"
      )
      .join("");
    return (
      '<section class="screen">' +
      '<header class="screen-head"><h2>' +
      escapeHtml(screen.title) +
      "</h2></header>" +
      flashHtml() +
      '<div class="screen-body">' +
      (comps ||
        '<div class="card empty-state"><p class="title">' +
          escapeHtml(t("preview.emptyTitle")) +
          '</p><p class="muted">' +
          escapeHtml(t("dashboard.emptyHint")) +
          '</p><button type="button" data-action="nav" data-path="' +
          escapeHtml(M.dashboardPath) +
          '">' +
          escapeHtml(t("home.openDashboard")) +
          "</button></div>") +
      "</div></section>"
    );
  }

  function render() {
    const root = document.getElementById("app");
    if (!root) return;
    const path = normalizePath(state.route || M.homePath);
    let screen = screenByPath(path);
    if (!screen) {
      screen = screenByPath(M.homePath) || M.screens[0];
      state.route = screen ? screen.path : "/";
    }
    if (screen && !screen.isAuth && !state.session && M.loginPath) {
      screen = screenByPath(M.loginPath);
      state.route = M.loginPath;
    }

    let body = "";
    if (!screen) {
      body = '<div class="card err">Unreachable screen</div>';
    } else if (screen.isAuth) {
      body = authView(screen);
    } else {
      const entity = entityForScreen(screen);
      if (screen.isDashboard) body = dashboardView(screen);
      else if (entity) body = crudView(screen, entity);
      else body = genericView(screen);
    }

    root.innerHTML =
      '<div class="app-shell" data-preview-runtime="interactive" data-route="' +
      escapeHtml(state.route) +
      '" data-authenticated="' +
      (state.session ? "1" : "0") +
      '">' +
      topbarHtml() +
      navHtml(state.route) +
      (state.session && screen && !screen.isAuth ? honestyBanner() : "") +
      "<main>" +
      body +
      "</main>" +
      "<footer>" +
      escapeHtml(M.appName) +
      "</footer></div>";
  }

  function readForm(form) {
    const data = {};
    const fd = new FormData(form);
    fd.forEach((value, key) => {
      data[key] = value;
    });
    return data;
  }

  function onClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.getAttribute("data-action");
    if (action === "login") {
      event.preventDefault();
      const form = target.closest("form");
      if (!form) return;
      const values = readForm(form);
      mockLogin(values.email, values.password);
      return;
    }
    if (action === "signup") {
      event.preventDefault();
      const form = target.closest("form");
      if (!form) return;
      const values = readForm(form);
      mockSignup(values.email, values.password);
      return;
    }
    if (action === "show-signup") {
      event.preventDefault();
      state.ui.authMode = "signup";
      state.ui.formErrors = {};
      clearFlash();
      saveState(state);
      render();
      return;
    }
    if (action === "show-login") {
      event.preventDefault();
      state.ui.authMode = "login";
      state.ui.formErrors = {};
      clearFlash();
      saveState(state);
      render();
      return;
    }
    if (action === "nav") {
      event.preventDefault();
      navigate(target.getAttribute("data-path") || "/");
      return;
    }
    if (action === "logout") {
      event.preventDefault();
      logout();
      return;
    }
    if (action === "reset-demo") {
      event.preventDefault();
      state.store = defaultStore();
      state.ui.page = 1;
      state.ui.search = "";
      state.ui.filter = "";
      state.ui.editingId = null;
      state.ui.showForm = false;
      state.ui.formErrors = {};
      setFlash("success", t("preview.saved"));
      saveState(state);
      render();
      return;
    }
    if (action === "dismiss-flash") {
      clearFlash();
      saveState(state);
      render();
      return;
    }
    if (action === "new-record") {
      state.ui.editingId = null;
      state.ui.showForm = true;
      state.ui.formErrors = {};
      saveState(state);
      render();
      return;
    }
    if (action === "cancel-edit") {
      state.ui.editingId = null;
      state.ui.showForm = false;
      state.ui.formErrors = {};
      saveState(state);
      render();
      return;
    }
    if (action === "edit-record") {
      state.ui.editingId = target.getAttribute("data-id");
      state.ui.showForm = true;
      state.ui.formErrors = {};
      saveState(state);
      render();
      return;
    }
    if (action === "delete-record") {
      const screen = screenByPath(state.route);
      const entity = entityForScreen(screen);
      if (entity) deleteRecord(entity, target.getAttribute("data-id"));
      return;
    }
    if (action === "move-stage") {
      event.preventDefault();
      const screen = screenByPath(state.route);
      const entity = entityForScreen(screen);
      if (!entity) return;
      const id = target.getAttribute("data-id");
      const stage = target.getAttribute("data-stage");
      const key = statusField(entity);
      if (!id || !stage || !key) return;
      const list = state.store[entity.name] || [];
      const idx = list.findIndex((r) => String(r.id) === String(id));
      if (idx < 0) return;
      list[idx] = Object.assign({}, list[idx], { [key]: stage });
      setFlash("success", t("preview.saved"));
      saveState(state);
      render();
      return;
    }
    if (action === "page-prev") {
      state.ui.page = Math.max(1, (state.ui.page || 1) - 1);
      saveState(state);
      render();
      return;
    }
    if (action === "page-next") {
      state.ui.page = (state.ui.page || 1) + 1;
      saveState(state);
      render();
      return;
    }
  }

  function onChange(event) {
    const target = event.target;
    if (!target || !target.getAttribute) return;
    const action = target.getAttribute("data-action");
    if (action === "switch-role") {
      state.role = target.value;
      if (state.session) state.session.role = state.role;
      saveState(state);
      render();
      return;
    }
    if (action === "search") {
      state.ui.search = target.value;
      state.ui.page = 1;
      saveState(state);
      render();
      return;
    }
    if (action === "filter") {
      state.ui.filter = target.value;
      state.ui.page = 1;
      saveState(state);
      render();
    }
  }

  function onSubmit(event) {
    const form = event.target;
    if (!form || !form.getAttribute) return;
    const action = form.getAttribute("data-action");
    if (!action) return;
    event.preventDefault();
    const values = readForm(form);
    if (action === "login") {
      mockLogin(values.email, values.password);
      return;
    }
    if (action === "signup") {
      mockSignup(values.email, values.password);
      return;
    }
    if (action === "save-record") {
      const screen = screenByPath(state.route);
      const entity = entityForScreen(screen);
      if (!entity) return;
      const normalized = Object.assign({}, values);
      entity.fields.forEach((f) => {
        if (f.type === "boolean") {
          normalized[f.name] = String(values[f.name]) === "true";
        }
        if (f.type === "number" || f.type === "money") {
          const n = Number(values[f.name]);
          normalized[f.name] = Number.isFinite(n) ? n : values[f.name];
        }
      });
      upsertRecord(entity, normalized, state.ui.editingId);
    }
  }

  function syncHash() {
    const hash = normalizePath((location.hash || "").replace(/^#/, "") || state.route);
    if (hash !== normalizePath(state.route)) {
      navigate(hash, { keepFlash: true });
    } else {
      render();
    }
  }

  document.addEventListener("click", onClick);
  document.addEventListener("change", onChange);
  document.addEventListener("input", (event) => {
    const target = event.target;
    if (!target || !target.getAttribute) return;
    if (target.getAttribute("data-action") === "search") {
      onChange(event);
      return;
    }
    const name = target.getAttribute("name");
    if (name === "email") {
      state.ui.draftEmail = String(target.value || "");
      saveState(state);
      return;
    }
    if (name === "password") {
      state.ui.draftPassword = String(target.value || "");
      saveState(state);
      return;
    }
  });
  document.addEventListener("submit", onSubmit);
  window.addEventListener("hashchange", syncHash);

  if (!location.hash) {
    location.hash = "#" + (state.route || M.homePath || "/");
  }
  syncHash();
})();`;
}
