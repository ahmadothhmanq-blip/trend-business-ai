/**
 * Artifact collection pipeline — merges generator outputs into a run store.
 */

import type { TbgeArtifactFile } from "@/lib/tbge/kernel/types";

export type ArtifactStore = {
  set(file: TbgeArtifactFile): void;
  get(path: string): TbgeArtifactFile | undefined;
  has(path: string): boolean;
  values(): TbgeArtifactFile[];
  size(): number;
};

export function createArtifactStore(): ArtifactStore {
  const files = new Map<string, TbgeArtifactFile>();

  return {
    set(file) {
      if (!file.path.trim()) {
        throw new Error("Artifact path is required");
      }
      files.set(file.path, file);
    },
    get(path) {
      return files.get(path);
    },
    has(path) {
      return files.has(path);
    },
    values() {
      return [...files.values()].sort((a, b) => a.path.localeCompare(b.path));
    },
    size() {
      return files.size;
    },
  };
}

export function artifactsToMap(files: TbgeArtifactFile[]): ReadonlyMap<string, TbgeArtifactFile> {
  return new Map(files.map((file) => [file.path, file]));
}
