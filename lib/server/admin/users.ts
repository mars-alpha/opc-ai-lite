import "server-only";

import { and, desc, eq, gt, ilike, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { OPC_MEMBERSHIP_PRODUCT } from "../../membership/policy";
import { courses, getAllLessons } from "../../courses";
import type { AuthUser } from "../auth/service";
import { isBootstrapAdminEmail } from "./service";
import { getDatabase } from "../db";
import {
  adminAuditRecords,
  contentItems,
  courseInsights,
  entitlements,
  lessonProgress,
  lessons,
  sessions,
  userIdentities,
  users
} from "../db/schema";

export type AdminAccountStatus = "ACTIVE" | "DISABLED";
export type AdminUserRole = "USER" | "ADMIN";
export type AdminMembershipState = "ACTIVE" | "SCHEDULED" | "EXPIRED" | "REVOKED" | "NONE";

export type AdminUserListItem = {
  id: string;
  email: string;
  displayName: string | null;
  role: AdminUserRole;
  isAdmin: boolean;
  isBootstrapAdmin: boolean;
  accountStatus: AdminAccountStatus;
  createdAt: Date;
  membership: {
    state: AdminMembershipState;
    startsAt: Date | null;
    expiresAt: Date | null;
    source: string | null;
    note: string | null;
  };
};

type AdminActor = Pick<AuthUser, "id" | "email">;

const membershipCondition = and(
  eq(entitlements.type, OPC_MEMBERSHIP_PRODUCT.entitlementType),
  eq(entitlements.resourceType, OPC_MEMBERSHIP_PRODUCT.resourceType),
  eq(entitlements.resourceId, OPC_MEMBERSHIP_PRODUCT.resourceId)
);

const CURRENT_CURRICULUM_SLUGS = new Set(["foundation-ai", "ai-work", "ai-growth", "ai-workflow", "fde"]);

function currentCurriculumLessonCount() {
  return courses
    .filter((course) => CURRENT_CURRICULUM_SLUGS.has(course.slug))
    .reduce((total, course) => total + getAllLessons(course).length, 0);
}

function membershipState(row: {
  membershipId: string | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  revokedAt: Date | null;
}): AdminMembershipState {
  if (!row.membershipId) return "NONE";
  if (row.revokedAt) return "REVOKED";
  const now = Date.now();
  if (row.startsAt && row.startsAt.getTime() > now) return "SCHEDULED";
  if (row.expiresAt && row.expiresAt.getTime() <= now) return "EXPIRED";
  return "ACTIVE";
}

function normalizeQuery(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}

function toListItem(row: {
  id: string;
  email: string;
  displayName: string | null;
  role: AdminUserRole;
  accountStatus: AdminAccountStatus;
  createdAt: Date;
  membershipId: string | null;
  membershipStartsAt: Date | null;
  membershipExpiresAt: Date | null;
  membershipRevokedAt: Date | null;
  membershipSource: string | null;
  membershipNote: string | null;
}): AdminUserListItem {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    role: row.role,
    isAdmin: row.role === "ADMIN" || isBootstrapAdminEmail(row.email),
    isBootstrapAdmin: isBootstrapAdminEmail(row.email),
    accountStatus: row.accountStatus,
    createdAt: row.createdAt,
    membership: {
      state: membershipState({
        membershipId: row.membershipId,
        startsAt: row.membershipStartsAt,
        expiresAt: row.membershipExpiresAt,
        revokedAt: row.membershipRevokedAt
      }),
      startsAt: row.membershipStartsAt,
      expiresAt: row.membershipExpiresAt,
      source: row.membershipSource,
      note: row.membershipNote
    }
  };
}

export async function listAdminUsers(input?: {
  q?: unknown;
  accountStatus?: unknown;
  membership?: unknown;
  role?: unknown;
}) {
  const q = normalizeQuery(input?.q);
  const accountStatus =
    input?.accountStatus === "ACTIVE" || input?.accountStatus === "DISABLED"
      ? input.accountStatus
      : null;
  const membership =
    typeof input?.membership === "string" && input.membership
      ? input.membership.toUpperCase()
      : null;
  const role = input?.role === "ADMIN" || input?.role === "USER" ? input.role : null;

  const filters = [
    eq(userIdentities.provider, "EMAIL"),
    accountStatus ? eq(users.accountStatus, accountStatus) : undefined,
    q
      ? or(
          ilike(userIdentities.providerUserId, `%${q}%`),
          ilike(users.displayName, `%${q}%`)
        )
      : undefined
  ].filter(Boolean);

  const rows = await getDatabase()
    .select({
      id: users.id,
      email: userIdentities.providerUserId,
      displayName: users.displayName,
      role: users.role,
      accountStatus: users.accountStatus,
      createdAt: users.createdAt,
      membershipId: entitlements.id,
      membershipStartsAt: entitlements.grantedAt,
      membershipExpiresAt: entitlements.expiresAt,
      membershipRevokedAt: entitlements.revokedAt,
      membershipSource: entitlements.source,
      membershipNote: entitlements.note
    })
    .from(users)
    .innerJoin(
      userIdentities,
      and(eq(userIdentities.userId, users.id), eq(userIdentities.provider, "EMAIL"))
    )
    .leftJoin(entitlements, and(eq(entitlements.userId, users.id), membershipCondition))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(500);

  const items = rows
    .map((row) =>
      toListItem(
        row as typeof row & { accountStatus: AdminAccountStatus; role: AdminUserRole }
      )
    )
    .sort((a, b) => {
      if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  const roleItems =
    role === "ADMIN"
      ? items.filter((item) => item.isAdmin)
      : role === "USER"
        ? items.filter((item) => !item.isAdmin)
        : items;
  if (membership === "EXPIRING") {
    const cutoff = Date.now() + 30 * 24 * 60 * 60 * 1000;
    return roleItems.filter(
      (item) =>
        item.membership.state === "ACTIVE" &&
        item.membership.expiresAt !== null &&
        item.membership.expiresAt.getTime() <= cutoff
    );
  }
  if (membership === "INACTIVE") {
    return roleItems.filter(
      (item) => item.membership.state === "EXPIRED" || item.membership.state === "REVOKED"
    );
  }
  return membership && membership !== "ALL"
    ? roleItems.filter((item) => item.membership.state === membership)
    : roleItems;
}

export async function getAdminUserDetail(userId: string) {
  const items = await listAdminUsers();
  const user = items.find((item) => item.id === userId);
  if (!user) return null;

  const [learning] = await getDatabase()
    .select({
      completedLessons: sql<number>`count(*) filter (where ${lessonProgress.status} = 'COMPLETED')::int`,
      lastLearningAt: sql<Date | null>`max(${lessonProgress.updatedAt})`
    })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));

  const audit = await getDatabase()
    .select({
      id: adminAuditRecords.id,
      action: adminAuditRecords.action,
      actorEmail: adminAuditRecords.actorEmail,
      before: adminAuditRecords.before,
      after: adminAuditRecords.after,
      note: adminAuditRecords.note,
      createdAt: adminAuditRecords.createdAt
    })
    .from(adminAuditRecords)
    .where(and(eq(adminAuditRecords.entityType, "USER"), eq(adminAuditRecords.entityId, userId)))
    .orderBy(desc(adminAuditRecords.createdAt))
    .limit(20);

  return {
    ...user,
    learning: {
      completedLessons: Number(learning?.completedLessons ?? 0),
      lastLearningAt: learning?.lastLearningAt ?? null
    },
    audit
  };
}

async function writeAudit(input: {
  actor: AdminActor;
  action: string;
  entityId: string;
  before: unknown;
  after: unknown;
  note?: string | null;
}) {
  await getDatabase().insert(adminAuditRecords).values({
    actorId: input.actor.id,
    actorEmail: input.actor.email,
    action: input.action,
    entityType: "USER",
    entityId: input.entityId,
    before: input.before ?? null,
    after: input.after ?? null,
    note: input.note?.trim().slice(0, 500) || null
  });
}

export async function updateAdminUser(
  userId: string,
  input: unknown,
  actor: AdminActor
) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("INVALID_INPUT");
  const record = input as Record<string, unknown>;
  const existing = await getAdminUserDetail(userId);
  if (!existing) throw new Error("USER_NOT_FOUND");

  const accountStatus =
    record.accountStatus === "ACTIVE" || record.accountStatus === "DISABLED"
      ? record.accountStatus
      : existing.accountStatus;
  const role =
    record.role === "ADMIN" || record.role === "USER"
      ? record.role
      : existing.role;
  if (existing.role === "ADMIN" && role === "USER") {
    const [adminCount] = await getDatabase()
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, "ADMIN"));
    if (Number(adminCount?.count ?? 0) <= 1) throw new Error("LAST_ADMIN");
  }

  if (
    existing.role === "ADMIN" &&
    existing.accountStatus === "ACTIVE" &&
    accountStatus === "DISABLED"
  ) {
    const [activeAdminCount] = await getDatabase()
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.role, "ADMIN"), eq(users.accountStatus, "ACTIVE")));
    if (Number(activeAdminCount?.count ?? 0) <= 1) throw new Error("LAST_ACTIVE_ADMIN");
  }

  const [updated] = await getDatabase()
    .update(users)
    .set({ role, accountStatus, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      role: users.role,
      accountStatus: users.accountStatus,
      updatedAt: users.updatedAt
    });

  if (existing.accountStatus !== accountStatus && accountStatus === "DISABLED") {
    await getDatabase().delete(sessions).where(eq(sessions.userId, userId));
  }

  await writeAudit({
    actor,
    action:
      existing.role !== role ? "USER_ROLE_UPDATED" : "USER_STATUS_UPDATED",
    entityId: userId,
    before: {
      role: existing.role,
      accountStatus: existing.accountStatus
    },
    after: {
      role: updated.role,
      accountStatus: updated.accountStatus
    },
    note: typeof record.changeNote === "string" ? record.changeNote : null
  });

  return getAdminUserDetail(userId);
}

function parseDate(value: unknown, code: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(code);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(code);
  return date;
}

export async function updateAdminMembership(
  userId: string,
  input: unknown,
  actor: AdminActor
) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("INVALID_INPUT");
  const record = input as Record<string, unknown>;
  const existing = await getAdminUserDetail(userId);
  if (!existing) throw new Error("USER_NOT_FOUND");

  const action = record.action === "REVOKE" ? "REVOKE" : "SET";
  const changeNote =
    typeof record.changeNote === "string" ? record.changeNote.trim().slice(0, 500) : "";

  if (action === "REVOKE") {
    await getDatabase()
      .update(entitlements)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(entitlements.userId, userId), membershipCondition));

    await writeAudit({
      actor,
      action: "MEMBERSHIP_REVOKED",
      entityId: userId,
      before: existing.membership,
      after: { state: "REVOKED" },
      note: changeNote
    });
    return getAdminUserDetail(userId);
  }

  const startsAt = parseDate(record.startsAt, "INVALID_STARTS_AT");
  const permanent = record.permanent === true;
  const expiresAt = permanent ? null : parseDate(record.expiresAt, "INVALID_EXPIRES_AT");
  if (expiresAt && expiresAt <= startsAt) throw new Error("INVALID_MEMBERSHIP_RANGE");
  const membershipNote =
    typeof record.membershipNote === "string"
      ? record.membershipNote.trim().slice(0, 1000) || null
      : null;

  await getDatabase()
    .insert(entitlements)
    .values({
      userId,
      type: OPC_MEMBERSHIP_PRODUCT.entitlementType,
      resourceType: OPC_MEMBERSHIP_PRODUCT.resourceType,
      resourceId: OPC_MEMBERSHIP_PRODUCT.resourceId,
      source: "ADMIN",
      note: membershipNote,
      grantedAt: startsAt,
      expiresAt,
      revokedAt: null,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: [
        entitlements.userId,
        entitlements.type,
        entitlements.resourceType,
        entitlements.resourceId
      ],
      set: {
        source: "ADMIN",
        note: membershipNote,
        grantedAt: startsAt,
        expiresAt,
        revokedAt: null,
        updatedAt: new Date()
      }
    });

  await writeAudit({
    actor,
    action: "MEMBERSHIP_UPDATED",
    entityId: userId,
    before: existing.membership,
    after: {
      state: startsAt > new Date() ? "SCHEDULED" : "ACTIVE",
      startsAt,
      expiresAt,
      source: "ADMIN",
      note: membershipNote
    },
    note: changeNote
  });

  return getAdminUserDetail(userId);
}

export async function getAdminPlatformSummary() {
  const now = new Date();
  const inThirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [
    [usersCount],
    [activeMembers],
    [expiringMembers],
    [reviewContent],
    [openInsights]
  ] = await Promise.all([
    getDatabase().select({ count: sql<number>`count(*)::int` }).from(users),
    getDatabase()
      .select({ count: sql<number>`count(*)::int` })
      .from(entitlements)
      .where(
        and(
          membershipCondition,
          isNull(entitlements.revokedAt),
          lte(entitlements.grantedAt, now),
          or(isNull(entitlements.expiresAt), gt(entitlements.expiresAt, now))
        )
      ),
    getDatabase()
      .select({ count: sql<number>`count(*)::int` })
      .from(entitlements)
      .where(
        and(
          membershipCondition,
          isNull(entitlements.revokedAt),
          gt(entitlements.expiresAt, now),
          lte(entitlements.expiresAt, inThirtyDays)
        )
      ),
    getDatabase()
      .select({ count: sql<number>`count(*)::int` })
      .from(contentItems)
      .where(inArray(contentItems.status, ["DRAFT", "REVIEW"])),
    getDatabase()
      .select({ count: sql<number>`count(*)::int` })
      .from(courseInsights)
      .where(inArray(courseInsights.status, ["OPEN", "ANALYSIS_READY", "UNDER_REVIEW"]))
  ]);

  return {
    users: Number(usersCount?.count ?? 0),
    activeMembers: Number(activeMembers?.count ?? 0),
    expiringMembers: Number(expiringMembers?.count ?? 0),
    reviewContent: Number(reviewContent?.count ?? 0),
    publishedLessons: currentCurriculumLessonCount(),
    openInsights: Number(openInsights?.count ?? 0)
  };
}
