/** Typed chainable mock for Supabase-style query builders in unit tests. */
export type MemoryQueryBuilder = {
  insert: (payload: unknown) => MemoryQueryBuilder;
  update: (payload: unknown) => MemoryQueryBuilder;
  select: (cols?: string) => MemoryQueryBuilder;
  eq: (key: string, value: unknown) => MemoryQueryBuilder;
  maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
  single: () => Promise<{ data: unknown; error: unknown }>;
  then: (
    resolve: (value: { data: unknown; error: unknown }) => unknown,
    reject?: (reason: unknown) => unknown,
  ) => Promise<unknown>;
  delete?: () => MemoryQueryBuilder;
  in?: (key: string, value: unknown) => MemoryQueryBuilder;
  order?: (col: string, opts?: { ascending?: boolean }) => MemoryQueryBuilder;
  limit?: (n: number) => MemoryQueryBuilder;
  upsert?: (payload: unknown) => MemoryQueryBuilder;
};
