/**
 * Parallel execution engine — runs independent tasks concurrently.
 */

import { availableParallelism } from "node:os";

export const DEFAULT_ASSEMBLY_CONCURRENCY = Math.max(4, availableParallelism());

export async function mapParallel<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency = DEFAULT_ASSEMBLY_CONCURRENCY,
): Promise<R[]> {
  if (!items.length) return [];
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }

  const poolSize = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: poolSize }, () => runWorker()));
  return results;
}
