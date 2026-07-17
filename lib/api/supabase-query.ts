/**
 * Narrow Supabase client shapes for helpers that only need chained select/eq.
 * Avoids deep generic instantiation errors when passing auth.supabase around.
 */

export type SupabaseSingleQueryClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (col: string, val: string) => {
        single: () => PromiseLike<{ data: unknown; error: unknown }>;
      };
    };
  };
};

export type SupabaseMaybeSingleQueryClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => PromiseLike<{ data: unknown; error: unknown }>;
        };
      };
    };
  };
};

export function asSupabaseSingleClient(client: unknown): SupabaseSingleQueryClient {
  return client as SupabaseSingleQueryClient;
}

export function asSupabaseMaybeSingleClient(
  client: unknown,
): SupabaseMaybeSingleQueryClient {
  return client as SupabaseMaybeSingleQueryClient;
}
