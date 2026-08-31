import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertGeneratedTypescriptParses,
  findTypescriptParseIssues,
  findWebAppTypeScriptContractIssues,
  hardenGeneratedWebApp,
} from "@/lib/ai/webapp-harden";
import type { GeneratedProjectFile } from "@/lib/ai/types";

function file(path: string, content: string): GeneratedProjectFile {
  return { path, content, language: "typescript" };
}

describe("hardenGeneratedWebApp", () => {
  it("disables typedRoutes and runs prisma generate before next build", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "next.config.ts",
        `import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  experimental: { typedRoutes: true },
};
export default nextConfig;
`,
      ),
      file(
        "package.json",
        JSON.stringify({
          scripts: { dev: "next dev", build: "next build", start: "next start" },
          dependencies: { next: "^16.0.0", "@prisma/client": "^6.2.1" },
        }),
      ),
      file(
        "prisma/schema.prisma",
        `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
enum Status { OPEN CLOSED }
model InventoryMovement {
  id          String @id @default(cuid())
  referenceId String
  productId   String
  status      Status @default(OPEN)
}
`,
      ),
    ]);

    const nextConfig = hardened.find((entry) => entry.path === "next.config.ts")!.content;
    const pkg = JSON.parse(
      hardened.find((entry) => entry.path === "package.json")!.content,
    ) as { scripts: Record<string, string> };
    const schema = hardened.find((entry) => entry.path === "prisma/schema.prisma")!.content;

    assert.match(nextConfig, /typedRoutes:\s*false/);
    assert.equal(/experimental[\s\S]*typedRoutes/.test(nextConfig), false);
    assert.equal(nextConfig.includes("typedRoutes: true"), false);
    assert.equal(nextConfig.includes("eslint"), false);
    assert.equal(pkg.scripts.postinstall, "prisma generate");
    assert.equal(pkg.scripts.build, "prisma generate && next build");
    assert.match(schema, /provider = "sqlite"/);
    assert.match(schema, /referenceId String @default\(""\)/);
    assert.match(schema, /productId\s+String/);
    assert.equal(/productId\s+String @default/.test(schema), false);
    assert.match(schema, /status\s+String @default\("OPEN"\)/);
    assert.equal(schema.includes("enum Status"), false);
    assert.ok(hardened.some((entry) => entry.path === ".env"));
    assert.match(
      hardened.find((entry) => entry.path === ".env")!.content,
      /file:\.\/dev\.db/,
    );
  });

  it("drops colliding App Router pages and wraps crypto.subtle bytes", () => {
    const hardened = hardenGeneratedWebApp([
      file("app/page.tsx", "export default function Home() { return null; }"),
      file(
        "app/(dashboard)/page.tsx",
        "export default function DashHome() { return null; }",
      ),
      file(
        "app/(dashboard)/layout.tsx",
        "export default function Layout({ children }: { children: React.ReactNode }) { return children; }",
      ),
      file(
        "lib/auth.ts",
        `export type Session = { user: { email: string } };
export async function getSession() { return null; }
`,
      ),
      file(
        "lib/crypto.ts",
        `async function deriveKey(password: string, salt: Uint8Array) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 1, hash: 'SHA-256' }, keyMaterial, 256);
}
`,
      ),
      file(
        "components/ui.tsx",
        `export type BadgeVariant = 'default' | 'danger' | 'outline';
const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-primary',
  danger: 'bg-danger/10 text-danger',
  outline: 'border',
};
`,
      ),
      file("postcss.config.js", "module.exports = { plugins: {} };"),
      file("postcss.config.mjs", "export default { plugins: {} };"),
      file(
        "eslint.config.mjs",
        `export default [
  { ignores: ['.next/**'] },
];
`,
      ),
    ]);

    const paths = hardened.map((entry) => entry.path);
    assert.equal(paths.includes("app/page.tsx"), true);
    assert.equal(paths.includes("app/(dashboard)/page.tsx"), false);
    assert.equal(paths.includes("app/(dashboard)/layout.tsx"), false);
    assert.equal(paths.includes("postcss.config.mjs"), false);

    const auth = hardened.find((entry) => entry.path === "lib/auth.ts")!.content;
    assert.match(auth, /sessionId:\s*string/);
    assert.doesNotMatch(auth, /user:\s*\{/);

    const crypto = hardened.find((entry) => entry.path === "lib/crypto.ts")!.content;
    assert.match(crypto, /function toBufferSource/);
    assert.match(crypto, /toBufferSource\(new TextEncoder\(\)\.encode\(password\)\)/);
    assert.match(crypto, /salt: toBufferSource\(salt\)/);

    const ui = hardened.find((entry) => entry.path === "components/ui.tsx")!.content;
    assert.match(ui, /destructive/);
    assert.doesNotMatch(ui, /buttonVariants[\s\S]*destructive/);
    assert.doesNotMatch(ui, /['"]danger['"]/);

    const eslint = hardened.find((entry) => entry.path === "eslint.config.mjs")!.content;
    assert.match(eslint, /react-hooks\/set-state-in-effect/);
  });

  it("splits client schema imports away from next/headers barrels", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "lib/index.ts",
        `import { cookies } from "next/headers";
import { z } from "zod";
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export async function logout() {
  "use server";
  cookies();
}
`,
      ),
      file(
        "app/login/page.tsx",
        `"use client";
import { loginSchema } from "@/lib/index";
export default function Login() { return loginSchema; }
`,
      ),
    ]);

    const login = hardened.find((entry) => entry.path === "app/login/page.tsx")!.content;
    assert.match(login, /@\/lib\/shared-schema/);
    assert.equal(login.includes("@/lib/index"), false);
    assert.ok(hardened.some((entry) => entry.path === "lib/shared-schema.ts"));
  });

  it("drops next.config.js when next.config.ts exists and removes type module", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "package.json",
        JSON.stringify({
          type: "module",
          scripts: { dev: "next dev", build: "next build", start: "next start" },
          dependencies: { next: "^16.0.0", react: "^19.0.0" },
          devDependencies: {
            typescript: "^5.5.0",
            tailwindcss: "^4.0.0",
            eslint: "^8.57.0",
            "eslint-config-next": "^15.0.0",
            prettier: "^3.3.2",
          },
          eslintConfig: { extends: ["next/core-web-vitals"] },
        }),
      ),
      file(
        "next.config.js",
        `const nextConfig = { reactStrictMode: true };
module.exports = nextConfig;
`,
      ),
      file(
        "next.config.ts",
        `import type { NextConfig } from "next";
const nextConfig: NextConfig = { reactStrictMode: true };
export default nextConfig;
`,
      ),
      file("eslint.config.mjs", `export default [];`),
    ]);

    const pkg = JSON.parse(
      hardened.find((entry) => entry.path === "package.json")!.content,
    ) as {
      type?: string;
      eslintConfig?: unknown;
      devDependencies: Record<string, string>;
    };
    assert.equal(pkg.type, undefined);
    assert.equal(pkg.eslintConfig, undefined);
    assert.equal(pkg.devDependencies.eslint, "^9.0.0");
    assert.equal(pkg.devDependencies["eslint-config-next"], "^16.0.0");
    assert.equal(
      hardened.some((entry) => entry.path === "next.config.js"),
      false,
    );
    assert.equal(
      hardened.some((entry) => entry.path === "eslint.config.mjs"),
      true,
    );
    const nextConfig = hardened.find((entry) => entry.path === "next.config.ts")!.content;
    assert.match(nextConfig, /turbopack:\s*\{\s*root:/);
    assert.match(nextConfig, /outputFileTracingRoot/);
    assert.match(nextConfig, /path\.join\(__dirname\)/);
    assert.ok(hardened.some((entry) => entry.path === "next.config.ts"));
  });

  it("isolates generated apps from the host platform", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "proxy.ts",
        `import { updateSession } from "@/lib/supabase/proxy";
import { resolveHostToSlug } from "@/lib/ai-core/domains/resolve";
import { routingLocales } from "@/lib/i18n/paths";
export default async function proxy() { return updateSession(); }
`,
      ),
      file(
        "lib/supabase/proxy.ts",
        `export async function updateSession() { return null; }
`,
      ),
      file(
        "lib/ai-core/domains/resolve.ts",
        `export function resolveHostToSlug() { return "host"; }
`,
      ),
      file(
        "middleware.ts",
        `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
export function middleware(request: NextRequest) {
  if (!getSession()) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}
`,
      ),
      file(
        "lib/auth.ts",
        `export function getSession() { return true; }
`,
      ),
      file(
        "app/page.tsx",
        `import { resolveHostToSlug } from "@/lib/ai-core/domains/resolve";
import { Button } from "@/components/ui";
export default function Home() {
  return <Button>{resolveHostToSlug()}</Button>;
}
`,
      ),
      file("components/ui.tsx", "export function Button() { return null; }"),
      file(
        "app/escape.ts",
        `import { paths } from "../../../lib/i18n/paths";
export const leaked = paths;
`,
      ),
      file(
        "tsconfig.json",
        JSON.stringify({
          compilerOptions: {
            baseUrl: "../..",
            paths: { "@/*": ["../../lib/*"] },
          },
        }),
      ),
      file(
        "next.config.js",
        `export default { reactStrictMode: true };
`,
      ),
    ]);

    const paths = hardened.map((entry) => entry.path);
    assert.equal(paths.includes("proxy.ts"), false);
    assert.equal(paths.includes("lib/supabase/proxy.ts"), false);
    assert.equal(paths.includes("lib/ai-core/domains/resolve.ts"), false);
    assert.equal(paths.includes("app/escape.ts"), false);
    assert.equal(paths.includes("middleware.ts"), true);
    assert.equal(paths.includes("lib/auth.ts"), true);
    assert.equal(paths.includes("next.config.js"), false);

    const nextConfig = hardened.find((entry) => entry.path === "next.config.ts")!.content;
    assert.match(nextConfig, /typedRoutes:\s*false/);
    assert.match(nextConfig, /turbopack:\s*\{\s*root:\s*turbopackRoot\s*\}/);
    assert.match(nextConfig, /outputFileTracingRoot:\s*turbopackRoot/);
    assert.match(nextConfig, /WEBAPP_TURBOPACK_ROOT|\.webapp-turbopack-root/);
    assert.match(nextConfig, /path\.join\(__dirname\)/);

    const home = hardened.find((entry) => entry.path === "app/page.tsx")!.content;
    assert.equal(home.includes("@/lib/ai-core"), false);
    assert.match(home, /@\/components\/ui/);

    const tsconfig = JSON.parse(
      hardened.find((entry) => entry.path === "tsconfig.json")!.content,
    ) as { compilerOptions: { baseUrl: string; paths: Record<string, string[]> } };
    assert.equal(tsconfig.compilerOptions.baseUrl, ".");
    assert.deepEqual(tsconfig.compilerOptions.paths, { "@/*": ["./*"] });

    const middleware = hardened.find((entry) => entry.path === "middleware.ts")!.content;
    assert.match(middleware, /@\/lib\/auth/);
  });

  it("always emits an isolated next.config.ts even when the model omitted one", () => {
    const hardened = hardenGeneratedWebApp([
      file("app/page.tsx", "export default function Home() { return null; }"),
    ]);

    const nextConfig = hardened.find((entry) => entry.path === "next.config.ts");
    assert.ok(nextConfig);
    assert.match(nextConfig!.content, /outputFileTracingRoot:\s*turbopackRoot/);
    assert.match(nextConfig!.content, /turbopack:\s*\{\s*root:\s*turbopackRoot\s*\}/);
    assert.match(nextConfig!.content, /WEBAPP_TURBOPACK_ROOT|\.webapp-turbopack-root/);
  });

  it("drops colliding /[param] pages and the ui.tsx vs ui/ folder clash", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "app/login/page.tsx",
        `"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
export default function Login() { return <Button>Login</Button>; }
`,
      ),
      file(
        "app/(auth)/[mode]/page.tsx",
        `"use client";
export default function AuthMode() { return <div>login or register</div>; }
`,
      ),
      file(
        "app/(dashboard)/[resource]/page.tsx",
        `export default async function ResourcePage() {
  return <div>contacts and deals CRUD table with forms</div>;
}
`,
      ),
      file("components/ui.tsx", "export function Button() { return null; }"),
      file("components/ui/button.tsx", "export function Button() { return null; }"),
      file("components/ui/card.tsx", "export function Card() { return null; }"),
    ]);

    const paths = hardened.map((entry) => entry.path);
    assert.equal(paths.includes("app/(auth)/[mode]/page.tsx"), false);
    assert.equal(paths.includes("app/(dashboard)/[resource]/page.tsx"), true);
    assert.equal(paths.includes("components/ui.tsx"), true);
    assert.equal(paths.includes("components/ui/button.tsx"), false);
    assert.equal(paths.includes("components/ui/card.tsx"), false);

    const login = hardened.find((entry) => entry.path === "app/login/page.tsx")!.content;
    assert.match(login, /from "@\/components\/ui"/);
    assert.equal(login.includes("@/components/ui/button"), false);
    assert.equal([...login.matchAll(/from ["']@\/components\/ui["']/g)].length, 1);
    assert.match(login, /Button/);
    assert.match(login, /Card/);
  });

  it("injects missing Select/Checkbox UI exports without LLM repair", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "components/ui.tsx",
        `import { cn } from "@/lib/utils";
export function Button() { return null; }
`,
      ),
      file(
        "app/page.tsx",
        `import { Select, Checkbox, Separator } from "@/components/ui";
export default function Page() {
  return (
    <div>
      <Select><option>A</option></Select>
      <Checkbox />
      <Separator />
    </div>
  );
}
`,
      ),
    ]);

    const ui = hardened.find((entry) => entry.path === "components/ui.tsx")!.content;
    assert.match(ui, /export function Select/);
    assert.match(ui, /export function Checkbox/);
    assert.match(ui, /export function Separator/);
  });

  it("injects missing Table family exports without LLM repair", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "components/ui.tsx",
        `import * as React from "react";
import { cn } from "@/lib/utils";
export function Button() { return null; }
`,
      ),
      file(
        "app/dashboard/page.tsx",
        `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
export default function Page() {
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader>
      <TableBody><TableRow><TableCell>A</TableCell></TableRow></TableBody>
    </Table>
  );
}
`,
      ),
    ]);

    const ui = hardened.find((entry) => entry.path === "components/ui.tsx")!.content;
    for (const name of [
      "Table",
      "TableHeader",
      "TableBody",
      "TableRow",
      "TableHead",
      "TableCell",
    ]) {
      assert.match(ui, new RegExp(`export function ${name}`));
    }
  });

  it("corrects Button icon size and darkMode without LLM repair", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "components/ui.tsx",
        `import * as React from "react";
import { cn } from "@/lib/utils";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "default", asChild = false, children, ...props }, ref) => {
    const classes = cn(size === "lg" && "h-11", className);
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(classes),
        ref,
      });
    }
    return <button ref={ref} className={classes} {...props}>{children}</button>;
  },
);
Button.displayName = "Button";
`,
      ),
      file(
        "app/page.tsx",
        `import { Button } from "@/components/ui";
export default function Page() {
  return <Button size="icon">X</Button>;
}
`,
      ),
      file(
        "tailwind.config.ts",
        `import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}"],
};
export default config;
`,
      ),
    ]);

    const ui = hardened.find((entry) => entry.path === "components/ui.tsx")!.content;
    assert.match(ui, /size\?:\s*"default"\s*\|\s*"sm"\s*\|\s*"lg"\s*\|\s*"icon"/);
    assert.match(ui, /size === "icon"/);
    assert.doesNotMatch(ui, /cloneElement\([^)]*\{[^}]*\bref\b/);
    const tw = hardened.find((entry) => entry.path === "tailwind.config.ts")!.content;
    assert.match(tw, /darkMode:\s*"class"/);
    assert.doesNotMatch(tw, /darkMode:\s*\["class"\]/);
  });

  it("injects missing Card import when JSX uses Card without importing it", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "components/ui.tsx",
        `export function Card() { return null; }
export function Button() { return null; }
`,
      ),
      file(
        "app/page.tsx",
        `import { Button } from "@/components/ui";
export default function Page() {
  return (
    <div>
      <Button>Go</Button>
      <Card>Missing import</Card>
    </div>
  );
}
`,
      ),
    ]);

    const page = hardened.find((entry) => entry.path === "app/page.tsx")!.content;
    assert.match(page, /import\s*\{[^}]*\bCard\b[^}]*\}\s*from\s*["']@\/components\/ui["']/);
  });

  it("rewrites void crypto.scrypt casts to scryptSync", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "app/api/auth/route.ts",
        `import { NextResponse } from "next/server";
import crypto from "crypto";
export async function POST() {
  const hash = (crypto.scrypt("pw", "salt", 64) as Buffer);
  return NextResponse.json({ ok: Boolean(hash) });
}
`,
      ),
    ]);
    const route = hardened.find((entry) => entry.path === "app/api/auth/route.ts")!.content;
    assert.match(route, /crypto\.scryptSync\(/);
    assert.doesNotMatch(route, /crypto\.scrypt\(/);
  });

  it("adds use client when login page uses useState/useRouter", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "app/login/page.tsx",
        `import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  return <Button onClick={() => router.push("/")}>{email || "Sign in"}</Button>;
}
`,
      ),
      file("components/ui.tsx", "export function Button() { return null; }"),
    ]);
    const login = hardened.find((entry) => entry.path === "app/login/page.tsx")!.content;
    assert.match(login, /^"use client";/);
  });

  it("injects isolated runtime scaffolds for gitignore, prisma client, middleware, and CRUD", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "package.json",
        JSON.stringify({
          scripts: { dev: "next dev", build: "next build", start: "next start" },
          dependencies: { next: "^16.0.0", react: "^19.0.0" },
        }),
      ),
      file(
        "prisma/schema.prisma",
        `generator client { provider = "prisma-client-js" }
datasource db { provider = "sqlite" url = env("DATABASE_URL") }
model User { id String @id }
model Product { id String @id name String }
`,
      ),
      file("app/login/page.tsx", "export default function Login() { return null; }"),
      file("app/dashboard/page.tsx", "export default function Dash() { return null; }"),
      file("app/globals.css", "body { margin: 0; }"),
    ]);

    const paths = hardened.map((entry) => entry.path);
    assert.equal(paths.includes(".gitignore"), true);
    assert.equal(paths.includes("lib/db.ts"), true);
    assert.equal(paths.includes("middleware.ts"), true);
    assert.equal(paths.includes("app/api/products/route.ts"), true);
    assert.equal(paths.includes("README.md"), true);
    assert.equal(paths.includes("next-env.d.ts"), true);

    const pkg = JSON.parse(
      hardened.find((entry) => entry.path === "package.json")!.content,
    ) as { scripts: Record<string, string>; devDependencies: Record<string, string> };
    assert.equal(pkg.scripts.typecheck, "tsc --noEmit");
    assert.ok(pkg.devDependencies["@tailwindcss/postcss"]);

    const api = hardened.find((entry) => entry.path === "app/api/products/route.ts")!.content;
    assert.match(api, /Unauthorized/);
    assert.match(api, /db\.product/);
    assert.equal(api.includes("db.user"), false);

    const css = hardened.find((entry) => entry.path === "app/globals.css")!.content;
    assert.match(css, /@import "tailwindcss"/);
  });

  it("injects deterministic cookie auth login routes and rewrites the login page", () => {
    const hardened = hardenGeneratedWebApp([
      file("app/login/page.tsx", `export default function Login() { return null; }`),
      file("app/globals.css", "body { margin: 0; }"),
    ]);

    const paths = hardened.map((entry) => entry.path);
    assert.equal(paths.includes("lib/auth.ts"), true);
    assert.equal(paths.includes("app/api/auth/login/route.ts"), true);
    assert.equal(paths.includes("app/api/auth/logout/route.ts"), true);
    assert.equal(paths.includes("middleware.ts"), true);

    const login = hardened.find((entry) => entry.path === "app/login/page.tsx")!.content;
    assert.match(login, /\"use client\"/);
    assert.match(login, /\/api\/auth\/login/);
    assert.match(login, /router\.push\(\"\/dashboard\"\)/);
  });

  it("drops static API collection routes that conflict with optional catch-all handlers", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "app/api/products/route.ts",
        `export async function GET() { return Response.json({ items: [] }); }
export async function POST() { return Response.json({ ok: true }, { status: 201 }); }
`,
      ),
      file(
        "app/api/products/[[...id]]/route.ts",
        `export async function GET() { return Response.json({ ok: true }); }
export async function POST() { return Response.json({ ok: true }, { status: 201 }); }
export async function DELETE() { return Response.json({ ok: true }); }
`,
      ),
    ]);

    const paths = hardened.map((entry) => entry.path);
    assert.equal(paths.includes("app/api/products/route.ts"), false);
    assert.equal(paths.includes("app/api/products/[[...id]]/route.ts"), true);
  });

  it("fills missing cva badgeVariants entries for BadgeVariant union members", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "components/ui.tsx",
        `import { cva } from "class-variance-authority";
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
const badgeVariants = cva("base", {
  variants: {
    variant: {
      ghost: "hover:bg-muted",
    },
  },
  defaultVariants: { variant: "default" },
});
`,
      ),
    ]);

    const ui = hardened.find((entry) => entry.path === "components/ui.tsx")!.content;
    assert.match(ui, /\bdefault:/);
    assert.match(ui, /\bsecondary:/);
    assert.match(ui, /\bdestructive:/);
    assert.match(ui, /\boutline:/);
  });

  it("does not rewrite JSX ternary null branches inside async tsx pages", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "app/dashboard/page.tsx",
        `export default async function DashboardPage() {
  const error = "";
  return (
    <main>
      {error ? (
        <div>{error}</div>
      ) : null}
    </main>
  );
}
`,
      ),
    ]);

    const page = hardened.find((entry) => entry.path === "app/dashboard/page.tsx")!.content;
    assert.doesNotMatch(page, /Promise<null>/);
    assert.match(page, /: null\}/);
  });

  it("rewrites session.user to canonical session.sessionId and danger badges to destructive", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "lib/auth.ts",
        `export type Session = { user: { email: string } };
export async function getSession() { return null; }
`,
      ),
      file(
        "app/dashboard/layout.tsx",
        `import { getSession } from "@/lib/auth";
export default async function Layout() {
  const session = await getSession();
  return <div>{session.user.email}{session?.user?.id}</div>;
}
`,
      ),
      file(
        "app/dashboard/stock-items/page.tsx",
        `import { Badge } from "@/components/ui";
export default function Page() {
  return <Badge variant="danger">Out</Badge>;
}
`,
      ),
      file(
        "components/ui.tsx",
        `export type BadgeVariant = "default" | "danger";
const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-primary",
  danger: "bg-red-100",
};
export function Badge(props: { variant?: BadgeVariant }) { return null; }
`,
      ),
    ]);

    const auth = hardened.find((entry) => entry.path === "lib/auth.ts")!.content;
    assert.match(auth, /sessionId:\s*string/);
    assert.doesNotMatch(auth, /user:\s*\{/);

    const layout = hardened.find((entry) => entry.path === "app/dashboard/layout.tsx")!.content;
    assert.doesNotMatch(layout, /session(?:\?)?\.user/);
    assert.match(layout, /session\.sessionId/);

    const page = hardened.find(
      (entry) => entry.path === "app/dashboard/stock-items/page.tsx",
    )!.content;
    assert.doesNotMatch(page, /variant=["']danger["']/);
    assert.match(page, /variant="destructive"/);
  });

  it("repairs malformed use client directives without rewriting ?? expressions", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "components/ui.tsx",
        `use client";
export function Button() { return null; }
`,
      ),
      file(
        "app/inventory/page.tsx",
        `"use client";
const PAGE_SIZE = 10;
export default function InventoryPage({
  json,
  totalCount,
}: {
  json: { totalPages?: number; meta?: { totalPages?: number } };
  totalCount: number;
}) {
  const totalPages =
    (json.totalPages ??
      json.meta?.totalPages ??
      Math.ceil(totalCount / PAGE_SIZE)) || 1;
  const page = parseInt(String(json.totalPages ?? "1"), 10);
  return <div>{totalPages}{page}</div>;
}
`,
      ),
    ]);

    const ui = hardened.find((entry) => entry.path === "components/ui.tsx")!.content;
    assert.match(ui, /^"use client";/m);
    assert.doesNotMatch(ui, /^use client";/m);

    const page = hardened.find((entry) => entry.path === "app/inventory/page.tsx")!.content;
    assert.match(page, /parseInt\(String\(json\.totalPages \?\? "1"\), 10\)/);
    assert.doesNotMatch(page, /const page = \(parseInt/);
    assertGeneratedTypescriptParses("app/inventory/page.tsx", page);
    assertGeneratedTypescriptParses("components/ui.tsx", ui);
  });

  it("strips unused cn imports that only cause ESLint warnings", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "app/dashboard/page.tsx",
        `import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
export default function Page() {
  return <Button>Go</Button>;
}
`,
      ),
      file("components/ui.tsx", "export function Button() { return null; }"),
    ]);
    const page = hardened.find((entry) => entry.path === "app/dashboard/page.tsx")!.content;
    assert.doesNotMatch(page, /import\s*\{[^}]*\bcn\b[^}]*\}\s*from\s*["']@\/lib\/utils["']/);
  });

  it("rewrites eslint-config-next .js subpaths to package exports", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "eslint.config.mjs",
        `import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTypescript from "eslint-config-next/typescript.js";
export default [...nextVitals, ...nextTypescript];
`,
      ),
    ]);
    const eslint = hardened.find((entry) => entry.path === "eslint.config.mjs")!.content;
    assert.match(eslint, /eslint-config-next\/core-web-vitals"/);
    assert.match(eslint, /eslint-config-next\/typescript"/);
    assert.doesNotMatch(eslint, /core-web-vitals\.js/);
  });

  it("adds jose dependency when imported", () => {
    const hardened = hardenGeneratedWebApp([
      file(
        "package.json",
        JSON.stringify({
          scripts: { build: "next build" },
          dependencies: { next: "^16.0.0" },
        }),
      ),
      file("lib/db.ts", `import { SignJWT } from "jose";\nexport const jwt = SignJWT;\n`),
    ]);
    const pkg = JSON.parse(
      hardened.find((entry) => entry.path === "package.json")!.content,
    ) as { dependencies: Record<string, string> };
    assert.ok(pkg.dependencies.jose);
  });

  it("preserves parse validity for nullish args and AST-fixes unparenthesized ?? / || mixes", () => {
    const valid = `const page = parseInt(searchParams.get("page") ?? "1", 10);
const ok = (value ?? 0) || 1;
const matches =
  item.name.includes(query) ||
  item.sku.includes(query) ||
  (item.supplier ?? "").toLowerCase().includes(query);
`;
    const hardenedValid = hardenGeneratedWebApp([
      file("lib/query.ts", valid),
    ]);
    const out = hardenedValid.find((entry) => entry.path === "lib/query.ts")!.content;
    assert.equal(out, valid);
    assertGeneratedTypescriptParses("lib/query.ts", out);
    assert.equal(findTypescriptParseIssues(out, "lib/query.ts").length, 0);

    const mixed = `const totalPages =
  json.totalPages ??
  json.meta?.totalPages ??
  Math.ceil(totalCount / PAGE_SIZE) || 1;
`;
    assert.equal(
      findWebAppTypeScriptContractIssues([
        file("app/inventory/page.tsx", mixed),
      ]).some((issue) =>
        issue.includes("nullish coalescing (??) must not mix with || or &&"),
      ),
      true,
    );

    const hardenedMixed = hardenGeneratedWebApp([
      file("app/inventory/fix.ts", mixed),
    ]);
    const fixed = hardenedMixed.find(
      (entry) => entry.path === "app/inventory/fix.ts",
    )!.content;
    assertGeneratedTypescriptParses("app/inventory/fix.ts", fixed);
    assert.equal(findTypescriptParseIssues(fixed, "app/inventory/fix.ts").length, 0);
    assert.match(fixed, /\([\s\S]*\?\?[\s\S]*\)\s*\|\|/);
    assert.doesNotMatch(fixed, /const page = \(parseInt/);
  });
});
