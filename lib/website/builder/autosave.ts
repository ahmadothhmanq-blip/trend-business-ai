/**
 * Website Builder autosave configuration (Milestone 1).
 */

export const BUILDER_AUTOSAVE_DEBOUNCE_MS = 3000;

export type BuilderAutosaveScheduler = {
  schedule: (callback: () => void) => void;
  cancel: () => void;
};

export function createBuilderAutosaveScheduler(
  debounceMs = BUILDER_AUTOSAVE_DEBOUNCE_MS,
): BuilderAutosaveScheduler {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return {
    schedule(callback) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        callback();
      }, debounceMs);
    },
    cancel() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}
