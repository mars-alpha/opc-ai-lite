import "server-only";

import { and, desc, eq, ne, notInArray, sql } from "drizzle-orm";
import type { AuthUser } from "../auth/service";
import type { AdminCourseSnapshot } from "./course-snapshot";
import {
  ensureFormalLearningIdentity,
  formalRuntimePracticeId
} from "../learning/formal-identity";
import { getDatabase } from "../db";
import {
  courseUpdateCandidates,
  lessonChecks,
  lessons,
  modules,
  practices,
  stages
} from "../db/schema";
import {
  listAdminCourseRegistry,
  type AdminCourseRegistryItem
} from "./course-registry";

export type { AdminCourseSnapshot } from "./course-snapshot";
export type AdminCourseCandidateStatus =
  | "DRAFT"
  | "REVIEW"
  | "PUBLISHED"
  | "CANCELLED";

type CandidateSourceContext = {
  type: "LEARNING_INSIGHT" | "KNOWLEDGE";
  sourceCandidateId: string;
  insightId?: string | null;
  sourceKnowledgeId?: string | null;
};

type CandidateProposal = {
  schemaVersion: "ADMIN_COURSE_CANDIDATE_V1";
  runtimeCourseSlug: string;
  runtimeLessonId: string;
  baseSpecVersion: string;
  baseLessonVersion: number;
  updateReason: string;
  createdBy: string;
  baseSnapshot: AdminCourseSnapshot;
  snapshot: AdminCourseSnapshot;
  publishedVersion?: number;
  sourceContext?: CandidateSourceContext;
};

const ACTIVE_STATUSES: AdminCourseCandidateStatus[] = ["DRAFT", "REVIEW"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function requireText(value: unknown, code: string, maxLength = 4000) {
  if (typeof value !== "string") throw new Error(code);
  const text = value.trim();
  if (!text || text.length > maxLength) throw new Error(code);
  return text;
}

function assertSnapshot(value: unknown): asserts value is AdminCourseSnapshot {
  if (!isRecord(value)) throw new Error("INVALID_CANDIDATE_SNAPSHOT");
  const encoded = JSON.stringify(value);
  if (encoded.length > 250_000) throw new Error("CANDIDATE_SNAPSHOT_TOO_LARGE");

  const courseHeader = value.courseHeader;
  const intro = value.intro;
  const example = value.example;
  const practice = value.practice;
  const review = value.review;
  const capability = value.capability;

  if (
    !isRecord(courseHeader) ||
    typeof courseHeader.title !== "string" ||
    (courseHeader.catalogTitle !== undefined && typeof courseHeader.catalogTitle !== "string") ||
    typeof courseHeader.catalogSubtitle !== "string" ||
    typeof courseHeader.lessonPageLead !== "string" ||
    !Array.isArray(value.stepMeta) ||
    value.stepMeta.length !== 6 ||
    !isRecord(intro) ||
    !Array.isArray(intro.approaches) ||
    !isRecord(example) ||
    !Array.isArray(value.checks) ||
    !isRecord(practice) ||
    !Array.isArray(practice.instructions) ||
    !Array.isArray(practice.rubric) ||
    !isRecord(review) ||
    !Array.isArray(review.items) ||
    !isRecord(capability) ||
    !Array.isArray(capability.gain)
  ) {
    throw new Error("INVALID_CANDIDATE_SNAPSHOT");
  }
}

function parseProposal(value: unknown): CandidateProposal | null {
  if (!isRecord(value) || value.schemaVersion !== "ADMIN_COURSE_CANDIDATE_V1") return null;
  try {
    assertSnapshot(value.baseSnapshot);
    assertSnapshot(value.snapshot);
  } catch {
    return null;
  }
  if (
    typeof value.runtimeCourseSlug !== "string" ||
    typeof value.runtimeLessonId !== "string" ||
    typeof value.baseSpecVersion !== "string" ||
    typeof value.baseLessonVersion !== "number" ||
    typeof value.updateReason !== "string" ||
    typeof value.createdBy !== "string"
  ) {
    return null;
  }
  return value as CandidateProposal;
}

async function resolveLessonIdentity(courseSlug: string, lessonSlug: string) {
  const [row] = await getDatabase()
    .select({
      id: lessons.id,
      version: lessons.version,
      status: lessons.status
    })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(stages, eq(modules.stageId, stages.id))
    .where(and(eq(stages.slug, courseSlug), eq(lessons.slug, lessonSlug)))
    .limit(1);

  if (!row) throw new Error("LESSON_NOT_FOUND");
  return row;
}

async function ensureLessonIdentity(courseSlug: string, lessonSlug: string) {
  try {
    return await resolveLessonIdentity(courseSlug, lessonSlug);
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "LESSON_NOT_FOUND") throw error;
  }

  await ensureFormalLearningIdentity(courseSlug, lessonSlug);
  return resolveLessonIdentity(courseSlug, lessonSlug);
}

function registryItem(courseSlug: string, lessonSlug: string) {
  const item = listAdminCourseRegistry().items.find(
    (entry) =>
      entry.runtimeCourseSlug === courseSlug &&
      entry.runtimeLessonId === lessonSlug
  );
  if (!item) throw new Error("ADMIN_COURSE_NOT_FOUND");
  return item;
}

function serializeCandidate(row: {
  id: string;
  status: string;
  proposal: unknown;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  const proposal = parseProposal(row.proposal);
  if (!proposal) return null;
  return {
    id: row.id,
    status: row.status as AdminCourseCandidateStatus,
    updateReason: proposal.updateReason,
    baseSnapshot: proposal.baseSnapshot,
    snapshot: proposal.snapshot,
    baseSpecVersion: proposal.baseSpecVersion,
    baseLessonVersion: proposal.baseLessonVersion,
    publishedVersion: proposal.publishedVersion ?? null,
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export async function getAdminCourseMaintenanceRegistry() {
  const base = listAdminCourseRegistry();
  const db = getDatabase();

  const items = await Promise.all(
    base.items.map(async (item) => {
      if (!item.preview) return { ...item, maintenance: null };

      let identity: Awaited<ReturnType<typeof resolveLessonIdentity>>;
      try {
        identity = await resolveLessonIdentity(item.runtimeCourseSlug, item.runtimeLessonId);
      } catch {
        return {
          ...item,
          maintenance: {
            currentVersion: 1,
            activeCandidate: null,
            versions: [],
            lastPublishedAt: null
          }
        };
      }

      const rows = await db
        .select({
          id: courseUpdateCandidates.id,
          status: courseUpdateCandidates.status,
          proposal: courseUpdateCandidates.proposal,
          reviewedBy: courseUpdateCandidates.reviewedBy,
          reviewedAt: courseUpdateCandidates.reviewedAt,
          createdAt: courseUpdateCandidates.createdAt,
          updatedAt: courseUpdateCandidates.updatedAt
        })
        .from(courseUpdateCandidates)
        .where(
          and(
            eq(courseUpdateCandidates.lessonId, identity.id),
            eq(courseUpdateCandidates.sourceType, "ADMIN_MANUAL")
          )
        )
        .orderBy(desc(courseUpdateCandidates.updatedAt));

      const serialized = rows.map(serializeCandidate).filter(Boolean);
      const active = serialized.find((row) =>
        ACTIVE_STATUSES.includes(row!.status)
      ) ?? null;
      const versions = serialized
        .filter((row) => row!.status === "PUBLISHED")
        .sort((a, b) => (b!.publishedVersion ?? 0) - (a!.publishedVersion ?? 0))
        .slice(0, 6);
      const latestPublished = versions[0] ?? null;

      return {
        ...item,
        lessonTitle: latestPublished
          ? latestPublished.snapshot.courseHeader.catalogTitle?.trim() || latestPublished.snapshot.courseHeader.title
          : item.lessonTitle,
        lessonSubtitle: latestPublished?.snapshot.courseHeader.catalogSubtitle ?? item.lessonSubtitle,
        preview: latestPublished?.snapshot ?? item.preview,
        maintenance: {
          currentVersion: identity.version,
          activeCandidate: active,
          versions,
          lastPublishedAt: latestPublished?.updatedAt ?? null
        }
      };
    })
  );

  return { ...base, items };
}

export async function startAdminCourseCandidate(
  user: AuthUser,
  courseSlug: string,
  lessonSlug: string,
  options?: {
    updateReason?: string;
    sourceContext?: CandidateSourceContext;
  }
) {
  const item = registryItem(courseSlug, lessonSlug);
  if (!item.preview) throw new Error("COURSE_PREVIEW_NOT_AVAILABLE");

  const identity = await ensureLessonIdentity(courseSlug, lessonSlug);
  const db = getDatabase();
  const existingRows = await db
    .select({
      id: courseUpdateCandidates.id,
      status: courseUpdateCandidates.status,
      proposal: courseUpdateCandidates.proposal,
      reviewedBy: courseUpdateCandidates.reviewedBy,
      reviewedAt: courseUpdateCandidates.reviewedAt,
      createdAt: courseUpdateCandidates.createdAt,
      updatedAt: courseUpdateCandidates.updatedAt
    })
    .from(courseUpdateCandidates)
    .where(
      and(
        eq(courseUpdateCandidates.lessonId, identity.id),
        eq(courseUpdateCandidates.sourceType, "ADMIN_MANUAL")
      )
    )
    .orderBy(desc(courseUpdateCandidates.createdAt));

  const existing = existingRows
    .map(serializeCandidate)
    .filter(Boolean)
    .find((row) => ACTIVE_STATUSES.includes(row!.status));
  if (existing) return existing;

  const published = existingRows
    .map(serializeCandidate)
    .filter(Boolean)
    .filter((row) => row!.status === "PUBLISHED")
    .sort((a, b) => (b!.publishedVersion ?? 0) - (a!.publishedVersion ?? 0))[0] ?? null;

  const snapshot = published?.snapshot ?? item.preview;
  const proposal: CandidateProposal = {
    schemaVersion: "ADMIN_COURSE_CANDIDATE_V1",
    runtimeCourseSlug: courseSlug,
    runtimeLessonId: lessonSlug,
    baseSpecVersion: item.specVersion,
    baseLessonVersion: identity.version,
    updateReason: options?.updateReason?.trim().slice(0, 4000) ?? "",
    createdBy: user.email,
    baseSnapshot: snapshot,
    snapshot,
    sourceContext: options?.sourceContext
  };

  const [created] = await db
    .insert(courseUpdateCandidates)
    .values({
      lessonId: identity.id,
      sourceType: "ADMIN_MANUAL",
      disposition: "CONTENT_UPDATE",
      proposal,
      status: "DRAFT"
    })
    .returning({
      id: courseUpdateCandidates.id,
      status: courseUpdateCandidates.status,
      proposal: courseUpdateCandidates.proposal,
      reviewedBy: courseUpdateCandidates.reviewedBy,
      reviewedAt: courseUpdateCandidates.reviewedAt,
      createdAt: courseUpdateCandidates.createdAt,
      updatedAt: courseUpdateCandidates.updatedAt
    });

  return serializeCandidate(created);
}

async function getCandidateRow(candidateId: string) {
  const [row] = await getDatabase()
    .select()
    .from(courseUpdateCandidates)
    .where(eq(courseUpdateCandidates.id, candidateId))
    .limit(1);
  if (!row || row.sourceType !== "ADMIN_MANUAL") throw new Error("CANDIDATE_NOT_FOUND");
  const proposal = parseProposal(row.proposal);
  if (!proposal) throw new Error("CANDIDATE_PROPOSAL_INVALID");
  return { row, proposal };
}


export async function startAdminCourseRestoreCandidate(
  user: AuthUser,
  sourceCandidateId: string
) {
  const { row: sourceRow, proposal: sourceProposal } = await getCandidateRow(sourceCandidateId);
  if (sourceRow.status !== "PUBLISHED") throw new Error("RESTORE_SOURCE_NOT_PUBLISHED");

  const item = registryItem(sourceProposal.runtimeCourseSlug, sourceProposal.runtimeLessonId);
  if (!item.preview) throw new Error("COURSE_PREVIEW_NOT_AVAILABLE");

  const identity = await ensureLessonIdentity(
    sourceProposal.runtimeCourseSlug,
    sourceProposal.runtimeLessonId
  );
  const db = getDatabase();

  const rows = await db
    .select({
      id: courseUpdateCandidates.id,
      status: courseUpdateCandidates.status,
      proposal: courseUpdateCandidates.proposal,
      reviewedBy: courseUpdateCandidates.reviewedBy,
      reviewedAt: courseUpdateCandidates.reviewedAt,
      createdAt: courseUpdateCandidates.createdAt,
      updatedAt: courseUpdateCandidates.updatedAt
    })
    .from(courseUpdateCandidates)
    .where(
      and(
        eq(courseUpdateCandidates.lessonId, identity.id),
        eq(courseUpdateCandidates.sourceType, "ADMIN_MANUAL")
      )
    );

  const serialized = rows.map(serializeCandidate).filter(Boolean);
  const active = serialized.find((candidate) =>
    ACTIVE_STATUSES.includes(candidate!.status)
  );
  if (active) throw new Error("CANDIDATE_ALREADY_ACTIVE");

  const latestPublished = serialized
    .filter((candidate) => candidate!.status === "PUBLISHED")
    .sort((a, b) => (b!.publishedVersion ?? 0) - (a!.publishedVersion ?? 0))[0] ?? null;

  const sourceVersion =
    sourceProposal.publishedVersion ?? sourceProposal.baseLessonVersion;
  if (sourceVersion === identity.version) {
    throw new Error("CANNOT_RESTORE_CURRENT_VERSION");
  }

  const baseSnapshot = latestPublished?.snapshot ?? item.preview;
  const proposal: CandidateProposal = {
    schemaVersion: "ADMIN_COURSE_CANDIDATE_V1",
    runtimeCourseSlug: sourceProposal.runtimeCourseSlug,
    runtimeLessonId: sourceProposal.runtimeLessonId,
    baseSpecVersion: item.specVersion,
    baseLessonVersion: identity.version,
    updateReason: "恢复第 " + sourceVersion + " 版课程内容",
    createdBy: user.email,
    baseSnapshot,
    snapshot: sourceProposal.snapshot
  };

  const [created] = await db
    .insert(courseUpdateCandidates)
    .values({
      lessonId: identity.id,
      sourceType: "ADMIN_MANUAL",
      disposition: "CONTENT_UPDATE",
      proposal,
      status: "DRAFT"
    })
    .returning({
      id: courseUpdateCandidates.id,
      status: courseUpdateCandidates.status,
      proposal: courseUpdateCandidates.proposal,
      reviewedBy: courseUpdateCandidates.reviewedBy,
      reviewedAt: courseUpdateCandidates.reviewedAt,
      createdAt: courseUpdateCandidates.createdAt,
      updatedAt: courseUpdateCandidates.updatedAt
    });

  return serializeCandidate(created);
}

export async function saveAdminCourseCandidate(
  candidateId: string,
  input: { updateReason?: unknown; snapshot?: unknown }
) {
  const { row, proposal } = await getCandidateRow(candidateId);
  if (row.status !== "DRAFT") throw new Error("CANDIDATE_NOT_EDITABLE");

  const updateReason =
    typeof input.updateReason === "string"
      ? input.updateReason.trim().slice(0, 4000)
      : proposal.updateReason;
  const snapshot = structuredClone(
    (input.snapshot ?? proposal.snapshot) as AdminCourseSnapshot
  );
  snapshot.courseHeader.catalogTitle = snapshot.courseHeader.title;
  assertSnapshot(snapshot);

  const nextProposal: CandidateProposal = {
    ...proposal,
    updateReason,
    snapshot
  };

  const [updated] = await getDatabase()
    .update(courseUpdateCandidates)
    .set({ proposal: nextProposal, updatedAt: sql`now()` })
    .where(eq(courseUpdateCandidates.id, candidateId))
    .returning({
      id: courseUpdateCandidates.id,
      status: courseUpdateCandidates.status,
      proposal: courseUpdateCandidates.proposal,
      reviewedBy: courseUpdateCandidates.reviewedBy,
      reviewedAt: courseUpdateCandidates.reviewedAt,
      createdAt: courseUpdateCandidates.createdAt,
      updatedAt: courseUpdateCandidates.updatedAt
    });

  return serializeCandidate(updated);
}

export async function submitAdminCourseCandidate(candidateId: string) {
  const { row, proposal } = await getCandidateRow(candidateId);
  if (row.status !== "DRAFT") throw new Error("CANDIDATE_NOT_EDITABLE");
  requireText(proposal.updateReason, "UPDATE_REASON_REQUIRED", 4000);
  assertSnapshot(proposal.snapshot);

  const [updated] = await getDatabase()
    .update(courseUpdateCandidates)
    .set({ status: "REVIEW", updatedAt: sql`now()` })
    .where(eq(courseUpdateCandidates.id, candidateId))
    .returning({
      id: courseUpdateCandidates.id,
      status: courseUpdateCandidates.status,
      proposal: courseUpdateCandidates.proposal,
      reviewedBy: courseUpdateCandidates.reviewedBy,
      reviewedAt: courseUpdateCandidates.reviewedAt,
      createdAt: courseUpdateCandidates.createdAt,
      updatedAt: courseUpdateCandidates.updatedAt
    });

  return serializeCandidate(updated);
}

export async function returnAdminCourseCandidateToEdit(candidateId: string) {
  const { row } = await getCandidateRow(candidateId);
  if (row.status !== "REVIEW") {
    throw new Error("CANDIDATE_NOT_REVIEWABLE");
  }
  await getDatabase()
    .update(courseUpdateCandidates)
    .set({
      status: "DRAFT",
      reviewedBy: null,
      reviewedAt: null,
      updatedAt: sql`now()`
    })
    .where(eq(courseUpdateCandidates.id, candidateId));
}

export async function cancelAdminCourseCandidate(candidateId: string) {
  const { row } = await getCandidateRow(candidateId);
  if (!ACTIVE_STATUSES.includes(row.status as AdminCourseCandidateStatus)) {
    throw new Error("CANDIDATE_NOT_ACTIVE");
  }
  await getDatabase()
    .update(courseUpdateCandidates)
    .set({ status: "CANCELLED", updatedAt: sql`now()` })
    .where(eq(courseUpdateCandidates.id, candidateId));
}

export async function publishAdminCourseCandidate(candidateId: string, user: AuthUser) {
  const { row, proposal } = await getCandidateRow(candidateId);
  if (row.status !== "REVIEW") throw new Error("CANDIDATE_NOT_IN_REVIEW");
  assertSnapshot(proposal.snapshot);

  const identity = await resolveLessonIdentity(
    proposal.runtimeCourseSlug,
    proposal.runtimeLessonId
  );
  if (identity.version !== proposal.baseLessonVersion) {
    throw new Error("CANDIDATE_BASE_VERSION_CONFLICT");
  }

  const snapshot = proposal.snapshot;
  const nextVersion = identity.version + 1;
  const db = getDatabase();

  await db.transaction(async (tx) => {
    const publishedRows = await tx
      .select({ proposal: courseUpdateCandidates.proposal })
      .from(courseUpdateCandidates)
      .where(
        and(
          eq(courseUpdateCandidates.lessonId, identity.id),
          eq(courseUpdateCandidates.sourceType, "ADMIN_MANUAL"),
          eq(courseUpdateCandidates.status, "PUBLISHED")
        )
      );

    const hasBaseVersion = publishedRows.some((item) => {
      const parsed = parseProposal(item.proposal);
      return parsed?.publishedVersion === proposal.baseLessonVersion;
    });

    if (!hasBaseVersion) {
      const baseProposal: CandidateProposal = {
        schemaVersion: "ADMIN_COURSE_CANDIDATE_V1",
        runtimeCourseSlug: proposal.runtimeCourseSlug,
        runtimeLessonId: proposal.runtimeLessonId,
        baseSpecVersion: proposal.baseSpecVersion,
        baseLessonVersion: proposal.baseLessonVersion,
        updateReason: "初始正式版本",
        createdBy: proposal.createdBy,
        baseSnapshot: proposal.baseSnapshot,
        snapshot: proposal.baseSnapshot,
        publishedVersion: proposal.baseLessonVersion
      };
      await tx.insert(courseUpdateCandidates).values({
        lessonId: identity.id,
        sourceType: "ADMIN_MANUAL",
        disposition: "CONTENT_UPDATE",
        proposal: baseProposal,
        status: "PUBLISHED"
      });
    }
    await tx
      .update(lessons)
      .set({
        title: snapshot.courseHeader.title,
        summary: snapshot.courseHeader.catalogSubtitle,
        version: nextVersion,
        updatedAt: sql`now()`
      })
      .where(eq(lessons.id, identity.id));

    for (const [index, check] of snapshot.checks.entries()) {
      const correctValues = check.correctValues.filter(Boolean);
      if (!correctValues.length) throw new Error("CANDIDATE_CHECK_ANSWER_REQUIRED");

      await tx
        .insert(lessonChecks)
        .values({
          id: check.id,
          lessonId: identity.id,
          type: check.questionType,
          question: check.question,
          options: check.options,
          correctAnswer: correctValues[0],
          correctAnswers: correctValues,
          explanation: check.correctFeedback,
          incorrectExplanation: check.incorrectFeedback,
          required: true,
          order: index + 1,
          status: "PUBLISHED",
          updatedAt: sql`now()`
        })
        .onConflictDoUpdate({
          target: lessonChecks.id,
          set: {
            lessonId: identity.id,
            type: check.questionType,
            question: check.question,
            options: check.options,
            correctAnswer: correctValues[0],
            correctAnswers: correctValues,
            explanation: check.correctFeedback,
            incorrectExplanation: check.incorrectFeedback,
            required: true,
            order: index + 1,
            status: "PUBLISHED",
            updatedAt: sql`now()`
          }
        });
    }

    const checkIds = snapshot.checks.map((check) => check.id);
    if (checkIds.length > 0) {
      await tx
        .update(lessonChecks)
        .set({ status: "ARCHIVED", updatedAt: sql`now()` })
        .where(
          and(
            eq(lessonChecks.lessonId, identity.id),
            eq(lessonChecks.status, "PUBLISHED"),
            notInArray(lessonChecks.id, checkIds)
          )
        );
    }

    const practice = snapshot.practice;
    const runtimePracticeId = formalRuntimePracticeId(
      proposal.runtimeCourseSlug,
      proposal.runtimeLessonId
    );
    const [runtimePractice] = await tx
      .select({
        id: practices.id,
        submissionSchema: practices.submissionSchema
      })
      .from(practices)
      .where(
        and(
          eq(practices.lessonId, identity.id),
          eq(practices.id, runtimePracticeId),
          eq(practices.type, "LESSON_PRACTICE"),
          eq(practices.status, "PUBLISHED")
        )
      )
      .limit(1);
    if (!runtimePractice) {
      throw new Error("CANDIDATE_RUNTIME_PRACTICE_NOT_FOUND");
    }
    await tx
      .insert(practices)
      .values({
        id: runtimePractice.id,
        type: "LESSON_PRACTICE",
        accessTier: "INHERIT",
        lessonId: identity.id,
        title: practice.title,
        goal: practice.goal,
        instructions: practice.instructions,
        hints: practice.hints,
        rubric: practice.rubric,
        submissionSchema: runtimePractice.submissionSchema,
        passScore: practice.passScore,
        required: true,
        status: "PUBLISHED",
        updatedAt: sql`now()`
      })
      .onConflictDoUpdate({
        target: practices.id,
        set: {
          type: "LESSON_PRACTICE",
          accessTier: "INHERIT",
          lessonId: identity.id,
          title: practice.title,
          goal: practice.goal,
          instructions: practice.instructions,
          hints: practice.hints,
          rubric: practice.rubric,
          submissionSchema: runtimePractice.submissionSchema,
          passScore: practice.passScore,
          required: true,
          status: "PUBLISHED",
          updatedAt: sql`now()`
        }
      });

    await tx
      .update(practices)
      .set({ status: "ARCHIVED", updatedAt: sql`now()` })
      .where(
        and(
          eq(practices.lessonId, identity.id),
          eq(practices.type, "LESSON_PRACTICE"),
          eq(practices.status, "PUBLISHED"),
          ne(practices.id, runtimePractice.id)
        )
      );

    const publishedProposal: CandidateProposal = {
      ...proposal,
      publishedVersion: nextVersion
    };

    await tx
      .update(courseUpdateCandidates)
      .set({
        status: "PUBLISHED",
        proposal: publishedProposal,
        reviewedBy: user.email,
        reviewedAt: sql`now()`,
        updatedAt: sql`now()`
      })
      .where(eq(courseUpdateCandidates.id, candidateId));
  });

  return {
    version: nextVersion,
    courseSlug: proposal.runtimeCourseSlug,
    lessonSlug: proposal.runtimeLessonId
  };
}


export async function getPublishedAdminCourseOverrides() {
  const overrides = new Map<string, {
    version: number;
    updateReason: string;
    snapshot: AdminCourseSnapshot;
  }>();

  try {
    const rows = await getDatabase()
      .select({ proposal: courseUpdateCandidates.proposal })
      .from(courseUpdateCandidates)
      .where(
        and(
          eq(courseUpdateCandidates.sourceType, "ADMIN_MANUAL"),
          eq(courseUpdateCandidates.status, "PUBLISHED")
        )
      );

    for (const row of rows) {
      const proposal = parseProposal(row.proposal);
      if (!proposal?.publishedVersion) continue;
      const key = proposal.runtimeCourseSlug + "/" + proposal.runtimeLessonId;
      const current = overrides.get(key);
      if (!current || proposal.publishedVersion > current.version) {
        overrides.set(key, {
          version: proposal.publishedVersion,
          updateReason: proposal.updateReason,
          snapshot: proposal.snapshot
        });
      }
    }
  } catch (error) {
    console.error("[OPC AI] published course override batch read failed", error);
  }

  return overrides;
}

export async function getPublishedAdminCourseOverride(
  courseSlug: string,
  lessonSlug: string
) {
  let identity: Awaited<ReturnType<typeof resolveLessonIdentity>>;
  try {
    identity = await resolveLessonIdentity(courseSlug, lessonSlug);
  } catch {
    return null;
  }

  const rows = await getDatabase()
    .select({
      id: courseUpdateCandidates.id,
      proposal: courseUpdateCandidates.proposal,
      updatedAt: courseUpdateCandidates.updatedAt
    })
    .from(courseUpdateCandidates)
    .where(
      and(
        eq(courseUpdateCandidates.lessonId, identity.id),
        eq(courseUpdateCandidates.sourceType, "ADMIN_MANUAL"),
        eq(courseUpdateCandidates.status, "PUBLISHED")
      )
    );

  const latest = rows
    .map((row) => ({ row, proposal: parseProposal(row.proposal) }))
    .filter((item): item is { row: typeof rows[number]; proposal: CandidateProposal } => Boolean(item.proposal))
    .sort((a, b) => (b.proposal.publishedVersion ?? 0) - (a.proposal.publishedVersion ?? 0))[0];
  if (!latest) return null;
  const proposal = latest.proposal;

  return {
    candidateId: latest.row.id,
    version: proposal.publishedVersion ?? identity.version,
    updateReason: proposal.updateReason,
    snapshot: proposal.snapshot
  };
}
