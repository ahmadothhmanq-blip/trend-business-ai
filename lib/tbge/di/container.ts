/**
 * Minimal TBGE dependency injection container.
 */

import type { TbgeContainer, TbgeFactory, TbgeRegistration } from "@/lib/tbge/di/types";
import type { TbgeToken } from "@/lib/tbge/di/tokens";

type Entry = {
  factory: TbgeFactory<unknown>;
  singleton: boolean;
  instance?: unknown;
};

export function createTbgeContainer(): TbgeContainer {
  const registry = new Map<TbgeToken, Entry>();

  function register<T>(
    token: TbgeToken,
    factory: TbgeFactory<T>,
    singleton = true,
  ): void {
    registry.set(token, { factory: factory as TbgeFactory<unknown>, singleton });
  }

  function resolve<T>(token: TbgeToken): T {
    const entry = registry.get(token);
    if (!entry) {
      throw new Error(`TBGE DI: unregistered token "${token}"`);
    }
    if (entry.singleton) {
      if (entry.instance === undefined) {
        entry.instance = entry.factory();
      }
      return entry.instance as T;
    }
    return entry.factory() as T;
  }

  function has(token: TbgeToken): boolean {
    return registry.has(token);
  }

  function clear(): void {
    registry.clear();
  }

  return { register, resolve, has, clear };
}

export function registerTbgeDefaults(
  container: TbgeContainer,
  registrations: TbgeRegistration<unknown>[],
): void {
  for (const reg of registrations) {
    container.register(reg.token, reg.factory, reg.singleton);
  }
}
