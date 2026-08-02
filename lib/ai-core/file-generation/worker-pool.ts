/**
 * Bounded worker pool — deterministic result ordering by input index.
 */
export async function runBoundedWorkerPool<TItem, TResult>(options: {
  items: readonly TItem[];
  concurrency: number;
  worker: (item: TItem, index: number) => Promise<TResult>;
}): Promise<TResult[]> {
  const { items, worker } = options;
  const concurrency = Math.max(1, Math.min(options.concurrency, items.length || 1));

  if (items.length === 0) {
    return [];
  }

  const results: TResult[] = new Array(items.length);
  let nextIndex = 0;

  async function runWorker(): Promise<void> {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) {
        return;
      }
      results[index] = await worker(items[index]!, index);
    }
  }

  await Promise.all(
    Array.from({ length: concurrency }, () => runWorker()),
  );

  return results;
}
