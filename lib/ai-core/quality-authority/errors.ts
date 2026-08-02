export class QualityGateBlockedError extends Error {
  readonly blockingIssues: string[];

  constructor(blockingIssues: string[]) {
    super(
      `Generation blocked by quality gates (${blockingIssues.length} critical issue${
        blockingIssues.length === 1 ? "" : "s"
      }).`,
    );
    this.name = "QualityGateBlockedError";
    this.blockingIssues = blockingIssues;
  }
}
