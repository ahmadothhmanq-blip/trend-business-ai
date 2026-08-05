/**
 * Coordinates post-SSE recovery when a handoff poll may already be in flight.
 */

export async function recoverAfterIncompleteSse(
  handoffRecoveryStarted: boolean,
  handoffRecoveryPromise: Promise<boolean> | null,
  recoveryId: string,
  lastProgressMessage: string | null,
  tryApplyRecoveredGeneration: (
    generationId: string,
    lastProgressMessage: string | null,
  ) => Promise<boolean>,
): Promise<boolean> {
  if (handoffRecoveryStarted && handoffRecoveryPromise) {
    const recovered = await handoffRecoveryPromise;
    if (recovered) return true;
  }

  return tryApplyRecoveredGeneration(recoveryId, lastProgressMessage);
}
