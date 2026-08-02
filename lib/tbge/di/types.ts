/**
 * TBGE DI container types.
 */

import type { TbgeToken } from "@/lib/tbge/di/tokens";

export type TbgeFactory<T> = () => T;

export type TbgeRegistration<T> = {
  token: TbgeToken;
  factory: TbgeFactory<T>;
  singleton: boolean;
};

export type TbgeContainer = {
  register<T>(token: TbgeToken, factory: TbgeFactory<T>, singleton?: boolean): void;
  resolve<T>(token: TbgeToken): T;
  has(token: TbgeToken): boolean;
  clear(): void;
};
