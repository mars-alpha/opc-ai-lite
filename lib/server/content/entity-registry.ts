import "server-only";

import { eq, inArray } from "drizzle-orm";
import { CORE_ENTITY_SEEDS, INTELLIGENCE_POLICY_VERSION } from "../../content/intelligence-policy";
import { getDatabase } from "../db";
import { contentEntities, contentSources } from "../db/schema";

function normalize(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function strings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim())
    : [];
}

export async function syncCoreEntityRegistry() {
  const db = getDatabase();
  const rows = [];
  for (const seed of CORE_ENTITY_SEEDS) {
    const [existing] = await db.select().from(contentEntities).where(eq(contentEntities.id, seed.entityId)).limit(1);
    const values = {
      entityType: seed.entityType,
      canonicalName: seed.canonicalName,
      displayNameZh: seed.displayNameZh,
      aliases: seed.aliases,
      officialDomains: seed.officialDomains,
      parentEntityId: seed.parentEntityId ?? null,
      ownedByEntityId: seed.ownedByEntityId ?? null,
      successorOfEntityId: seed.successorOfEntityId ?? null,
      predecessorOfEntityId: seed.predecessorOfEntityId ?? null,
      referenceStrength: seed.referenceStrength,
      status: seed.status,
      mergedIntoEntityId: null,
      metadata: { policyVersion: INTELLIGENCE_POLICY_VERSION, registryOwner: "AI-ENTITY-REGISTRY-001", seeded: true },
      updatedAt: new Date()
    };
    if (existing) {
      const [updated] = await db.update(contentEntities).set(values).where(eq(contentEntities.id, seed.entityId)).returning();
      rows.push(updated);
    } else {
      const [created] = await db.insert(contentEntities).values({ id: seed.entityId, ...values }).returning();
      rows.push(created);
    }
  }
  return rows;
}

export async function resolveKnownEntities(input: { title: string; excerpt?: string | null }) {
  const rows = await getDatabase().select().from(contentEntities)
    .where(inArray(contentEntities.status, ["KNOWN", "TEMPORARY", "UNCOVERED"]));
  const haystack = normalize([input.title, input.excerpt ?? ""].join(" "));
  return rows.flatMap((row) => {
    const terms = [row.canonicalName, ...strings(row.aliases)].map(normalize).filter((value) => value.length >= 2).sort((a, b) => b.length - a.length);
    const matchedTerm = terms.find((term) => {
      if (/^[a-z0-9_.+-]+$/i.test(term)) {
        const escaped = term.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
        return new RegExp("(^|[^a-z0-9])" + escaped + "([^a-z0-9]|$)", "i").test(haystack);
      }
      return haystack.includes(term);
    });
    return matchedTerm ? [{
      entityId: row.id,
      entityType: row.entityType,
      canonicalName: row.canonicalName,
      displayNameZh: row.displayNameZh,
      matchedTerm,
      status: row.status,
      referenceStrength: row.referenceStrength
    }] : [];
  }).sort((a, b) => b.matchedTerm.length - a.matchedTerm.length);
}

export async function createTemporaryEntity(input: { canonicalName: string; entityType: string; aliases?: string[]; firstSeenAt?: Date }) {
  const db = getDatabase();
  const canonicalName = input.canonicalName.trim();
  if (!canonicalName) throw new Error("ENTITY_CANONICAL_NAME_REQUIRED");
  const slug = normalize(canonicalName).replace(/[^a-z0-9\p{Script=Han}]+/gu, "_").replace(/^_+|_+$/g, "").slice(0, 80) || "entity";
  const id = "temp_" + slug;
  const [existing] = await db.select().from(contentEntities).where(eq(contentEntities.id, id)).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(contentEntities).values({
    id,
    entityType: input.entityType,
    canonicalName,
    displayNameZh: canonicalName,
    aliases: input.aliases ?? [],
    officialDomains: [],
    referenceStrength: "NONE",
    status: "TEMPORARY",
    firstSeenAt: input.firstSeenAt ?? new Date(),
    metadata: { policyVersion: INTELLIGENCE_POLICY_VERSION, registryOwner: "AI-ENTITY-REGISTRY-001", temporary: true, requiresHumanReview: true }
  }).returning();
  return created;
}

export async function refreshEntityCoverage(entityId: string) {
  const db = getDatabase();
  const [entity] = await db.select().from(contentEntities).where(eq(contentEntities.id, entityId)).limit(1);
  if (!entity) throw new Error("ENTITY_NOT_FOUND");
  const domains = strings(entity.officialDomains).map((item) => item.toLocaleLowerCase());
  const sources = await db.select().from(contentSources).where(eq(contentSources.enabled, true));
  const covered = sources.filter((source) => {
    if (!source.canonicalUrl || !domains.length) return false;
    try {
      const sourceHost = new URL(source.canonicalUrl).hostname.toLocaleLowerCase();
      return domains.some((domain) => sourceHost === domain || sourceHost.endsWith("." + domain));
    } catch { return false; }
  });
  const status = covered.length
    ? ["TEMPORARY", "UNCOVERED"].includes(entity.status) ? "KNOWN" : entity.status
    : entity.status === "TEMPORARY" ? "UNCOVERED" : entity.status;
  const [updated] = await db.update(contentEntities).set({
    status,
    metadata: {
      ...(entity.metadata && typeof entity.metadata === "object" && !Array.isArray(entity.metadata) ? entity.metadata as Record<string, unknown> : {}),
      coverageSourceIds: covered.map((source) => source.id),
      coverageCheckedAt: new Date().toISOString()
    },
    updatedAt: new Date()
  }).where(eq(contentEntities.id, entity.id)).returning();
  return { entity: updated, sourceIds: covered.map((source) => source.id) };
}

export async function refreshCoreEntityCoverage() {
  await syncCoreEntityRegistry();
  const results = [];
  for (const seed of CORE_ENTITY_SEEDS) results.push(await refreshEntityCoverage(seed.entityId));
  return results;
}
