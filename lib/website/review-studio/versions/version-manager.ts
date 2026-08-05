import { randomUUID } from "node:crypto";
import { REVIEW_STUDIO_MAX_VERSIONS } from "@/lib/website/review-studio/constants";
import type {
  GeneratedProjectFile,
} from "@/lib/ai/types";
import type {
  ReviewStudioInput,
  ReviewStudioSession,
  WebsiteVersion,
} from "@/lib/website/review-studio/types";
import type { WqbsCategoryScores } from "@/lib/website/quality-benchmark";

const sessions = new Map<string, ReviewStudioSession>();

function cloneFiles(files: GeneratedProjectFile[]): GeneratedProjectFile[] {
  return files.map((f) => ({ ...f, content: f.content }));
}

export function getOrCreateSession(input: ReviewStudioInput): ReviewStudioSession {
  const sessionId = input.sessionId ?? randomUUID();
  const existing = sessions.get(sessionId);
  if (existing) return existing;

  const versionId = randomUUID();
  const initialVersion: WebsiteVersion = {
    versionNumber: 1,
    id: versionId,
    sessionId,
    createdAt: new Date().toISOString(),
    files: cloneFiles(input.files),
    appliedImprovements: [],
    improvementTitles: [],
    qualityScores: emptyScores(),
  };

  const session: ReviewStudioSession = {
    sessionId,
    input: { ...input, sessionId },
    versions: [initialVersion],
    improvements: [],
    currentVersionId: versionId,
  };
  sessions.set(sessionId, session);
  return session;
}

export function registerSessionReview(
  sessionId: string,
  review: import("@/lib/website/review-studio/types").ReviewStudioResult,
  improvements: import("@/lib/website/review-studio/types").StudioImprovement[],
): void {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.review = review;
  session.improvements = improvements;
  const current = session.versions.find((v) => v.id === session.currentVersionId);
  if (current) {
    current.qualityScores = review.review.categoryScores;
  }
}

export function createVersion(input: {
  sessionId: string;
  files: GeneratedProjectFile[];
  appliedImprovements: string[];
  improvementTitles: string[];
  qualityScores: WqbsCategoryScores;
  parentVersionId?: string;
}): WebsiteVersion {
  const session = sessions.get(input.sessionId);
  if (!session) {
    throw new Error(`Review session not found: ${input.sessionId}`);
  }

  const versionNumber = session.versions.length + 1;
  const version: WebsiteVersion = {
    versionNumber,
    id: randomUUID(),
    sessionId: input.sessionId,
    createdAt: new Date().toISOString(),
    files: cloneFiles(input.files),
    appliedImprovements: input.appliedImprovements,
    improvementTitles: input.improvementTitles,
    qualityScores: input.qualityScores,
    parentVersionId: input.parentVersionId ?? session.currentVersionId,
  };

  session.versions.push(version);
  if (session.versions.length > REVIEW_STUDIO_MAX_VERSIONS) {
    session.versions.shift();
  }
  session.currentVersionId = version.id;
  return version;
}

export function rollbackToVersion(sessionId: string, versionId: string): WebsiteVersion {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`Review session not found: ${sessionId}`);
  const version = session.versions.find((v) => v.id === versionId);
  if (!version) throw new Error(`Version not found: ${versionId}`);
  session.currentVersionId = version.id;
  return version;
}

export function getCurrentVersion(sessionId: string): WebsiteVersion | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;
  return session.versions.find((v) => v.id === session.currentVersionId);
}

export function listVersions(sessionId: string): WebsiteVersion[] {
  return sessions.get(sessionId)?.versions ?? [];
}

export function getSession(sessionId: string): ReviewStudioSession | undefined {
  return sessions.get(sessionId);
}

/** Test helper — clear in-memory sessions */
export function clearReviewSessions(): void {
  sessions.clear();
}

function emptyScores(): WqbsCategoryScores {
  return {
    overall: 0,
    visualDesign: 0,
    userExperience: 0,
    business: 0,
    seo: 0,
    performance: 0,
    accessibility: 0,
    content: 0,
    localization: 0,
  };
}
