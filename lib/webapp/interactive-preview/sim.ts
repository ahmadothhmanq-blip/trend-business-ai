/**
 * Pure in-memory preview store used by readiness/behavior tests.
 * Mirrors the iframe runtime contracts (auth → dashboard, CRUD, search, pagination).
 */

export type PreviewSimEntity = {
  name: string;
  fields: Array<{ name: string; required?: boolean; type?: string; enumValues?: string[] }>;
  crud: string[];
  seed: Record<string, unknown>[];
};

export type PreviewSimManifest = {
  loginPath: string | null;
  dashboardPath: string;
  screens: Array<{ path: string; isAuth?: boolean; dataBindings?: string[] }>;
  navigation: Array<{ href: string }>;
  entities: PreviewSimEntity[];
};

export type PreviewSimState = {
  route: string;
  session: { email: string; role: string } | null;
  role: string;
  users: Array<{ email: string; password: string }>;
  store: Record<string, Record<string, unknown>[]>;
  ui: { search: string; filter: string; page: number };
};

const PAGE_SIZE = 5;

export function createPreviewSimState(manifest: PreviewSimManifest): PreviewSimState {
  const store: PreviewSimState["store"] = {};
  for (const entity of manifest.entities) {
    store[entity.name] = entity.seed.map((row) => ({ ...row }));
  }
  return {
    route: manifest.loginPath || manifest.dashboardPath,
    session: null,
    role: "Admin",
    users: [],
    store,
    ui: { search: "", filter: "", page: 1 },
  };
}

export function previewSimSignup(
  state: PreviewSimState,
  manifest: PreviewSimManifest,
  email: string,
  password: string,
): { ok: boolean; state: PreviewSimState } {
  if (!email.includes("@") || password.length < 8) {
    return { ok: false, state };
  }
  const users = [...(state.users || [])];
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, state };
  }
  users.push({ email: email.toLowerCase(), password });
  return {
    ok: true,
    state: {
      ...state,
      users,
      session: { email: email.toLowerCase(), role: state.role },
      route: manifest.dashboardPath,
    },
  };
}

export function previewSimLogin(
  state: PreviewSimState,
  manifest: PreviewSimManifest,
  email: string,
  password: string,
): { ok: boolean; state: PreviewSimState } {
  if (!email.includes("@") || password.length < 8) {
    return { ok: false, state };
  }
  const users = [...(state.users || [])];
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing && existing.password !== password) {
    return { ok: false, state };
  }
  if (!existing) {
    users.push({ email: email.toLowerCase(), password });
  }
  const user = existing ?? users[users.length - 1]!;
  return {
    ok: true,
    state: {
      ...state,
      users,
      session: { email: user.email, role: state.role },
      route: manifest.dashboardPath,
    },
  };
}

export function previewSimNavigate(
  state: PreviewSimState,
  manifest: PreviewSimManifest,
  path: string,
): { ok: boolean; state: PreviewSimState } {
  const screen = manifest.screens.find((s) => s.path === path);
  if (!screen) return { ok: false, state };
  if (!state.session && !screen.isAuth && manifest.loginPath) {
    return { ok: false, state: { ...state, route: manifest.loginPath } };
  }
  return { ok: true, state: { ...state, route: path, ui: { ...state.ui, page: 1 } } };
}

export function previewSimCreate(
  state: PreviewSimState,
  entityName: string,
  values: Record<string, unknown>,
): PreviewSimState {
  const list = [...(state.store[entityName] || [])];
  list.unshift({ ...values, id: `${entityName.toLowerCase()}-${Date.now()}` });
  return { ...state, store: { ...state.store, [entityName]: list } };
}

export function previewSimUpdate(
  state: PreviewSimState,
  entityName: string,
  id: string,
  values: Record<string, unknown>,
): PreviewSimState {
  const list = (state.store[entityName] || []).map((row) =>
    String(row.id) === String(id) ? { ...row, ...values, id } : row,
  );
  return { ...state, store: { ...state.store, [entityName]: list } };
}

export function previewSimDelete(
  state: PreviewSimState,
  entityName: string,
  id: string,
): PreviewSimState {
  const list = (state.store[entityName] || []).filter((row) => String(row.id) !== String(id));
  return { ...state, store: { ...state.store, [entityName]: list } };
}

export function previewSimQuery(
  state: PreviewSimState,
  entityName: string,
): { rows: Record<string, unknown>[]; page: number; pages: number; total: number } {
  let rows = [...(state.store[entityName] || [])];
  const q = state.ui.search.trim().toLowerCase();
  if (q) rows = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  if (state.ui.filter) {
    rows = rows.filter((row) =>
      Object.values(row).some((v) => String(v) === state.ui.filter),
    );
  }
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, state.ui.page), pages);
  const start = (page - 1) * PAGE_SIZE;
  return { rows: rows.slice(start, start + PAGE_SIZE), page, pages, total };
}
