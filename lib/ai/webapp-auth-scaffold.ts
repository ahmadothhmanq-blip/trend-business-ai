/**
 * Production auth scaffolds for App Builder — password hashing + DB sessions.
 * Uses node:crypto scrypt (no extra npm dependency).
 */

export function buildCanonicalPasswordCryptoModule(): string {
  return `import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return \`\${salt}:\${hash}\`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, "hex");
  if (prev.length !== next.length) return false;
  return timingSafeEqual(prev, next);
}
`;
}

export function buildCanonicalAuthModule(): string {
  return `import { cookies } from "next/headers";
import { db } from "@/lib/db";

export type Session = {
  sessionId: string;
  userId: string;
  email: string;
};

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get("session")?.value ?? jar.get("app_session")?.value;
  if (!token) return null;

  const row = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: row.id } }).catch(() => null);
    return null;
  }

  return {
    sessionId: row.token,
    userId: row.userId,
    email: row.user.email,
  };
}

export async function getServerSession(): Promise<Session | null> {
  return getSession();
}
`;
}

export function buildCanonicalAuthLoginRoute(): string {
  return `import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 400 },
    );
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  await db.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  const jar = await cookies();
  jar.set({
    name: "session",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
`;
}

export function buildCanonicalAuthSignupRoute(): string {
  return `import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email or password (min 8 characters)." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const user = await db.user.create({
    data: {
      email,
      passwordHash: hashPassword(parsed.data.password),
    },
  });

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  await db.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  const jar = await cookies();
  jar.set({
    name: "session",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
`;
}

export function buildCanonicalAuthLogoutRoute(): string {
  return `import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const jar = await cookies();
  const token = jar.get("session")?.value ?? jar.get("app_session")?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => null);
  }
  jar.delete("session");
  jar.delete("app_session");
  return NextResponse.json({ ok: true }, { status: 200 });
}
`;
}

export function buildCanonicalLoginPage(): string {
  return `"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Label } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submitDisabled = useMemo(
    () => pending || !email.trim() || password.length < 8,
    [pending, email, password],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "Unable to sign in. Please try again.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-4 p-6">
        <header>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-muted-foreground">Access your dashboard and saved records.</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={submitDisabled}>
            {pending ? "Signing in..." : "Continue"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/signup" className="font-medium text-foreground underline">
            Create one
          </Link>
        </p>
      </Card>
    </main>
  );
}
`;
}

export function buildCanonicalSignupPage(): string {
  return `"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Label } from "@/components/ui";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submitDisabled = useMemo(
    () => pending || !email.trim() || password.length < 8,
    [pending, email, password],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "Unable to create account.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-4 p-6">
        <header>
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-muted-foreground">Register with email and a secure password.</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={submitDisabled}>
            {pending ? "Creating..." : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-foreground underline">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
`;
}

export function buildCanonicalUseAuthHook(): string {
  return `"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error || "Unable to sign in.");
        return false;
      }
      router.push("/dashboard");
      return true;
    } catch {
      setError("Unable to reach the server.");
      return false;
    } finally {
      setPending(false);
    }
  }, [router]);

  const signup = useCallback(async (email: string, password: string) => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error || "Unable to create account.");
        return false;
      }
      router.push("/dashboard");
      return true;
    } catch {
      setError("Unable to reach the server.");
      return false;
    } finally {
      setPending(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setPending(true);
    setError(null);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setPending(false);
    }
  }, [router]);

  return { login, signup, logout, pending, error };
}
`;
}
