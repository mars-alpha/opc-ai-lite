import { INTELLIGENCE_POLICY_VERSION } from "../lib/content/intelligence-policy";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  contentEventClusterMembers,
  contentEventClusters,
  contentEventRawItems,
  contentEvents,
  contentRawItemObservations
} from "../lib/server/db/schema";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function originOfObservation(value: unknown) {
  const metadata = record(value);
  const provenance = record(metadata.provenance);
  return typeof provenance.origin === "string"
    ? provenance.origin
    : typeof metadata.origin === "string"
      ? metadata.origin
      : null;
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
    throw new Error("DEVELOPMENT_DATABASE_REQUIRED");
  }

  const db = getDatabase();
  const [events, clusters, members, eventRawLinks, observations] = await Promise.all([
    db.select().from(contentEvents),
    db.select().from(contentEventClusters),
    db.select().from(contentEventClusterMembers),
    db.select().from(contentEventRawItems),
    db.select().from(contentRawItemObservations)
  ]);

  const linksByEvent = new Map<string, string[]>();
  for (const link of eventRawLinks) {
    const current = linksByEvent.get(link.eventId) ?? [];
    current.push(link.rawItemId);
    linksByEvent.set(link.eventId, current);
  }
  const observationsByRaw = new Map<string, typeof observations>();
  for (const observation of observations) {
    const current = observationsByRaw.get(observation.rawItemId) ?? [];
    current.push(observation);
    observationsByRaw.set(observation.rawItemId, current);
  }
  const membersByCluster = new Map<string, typeof members>();
  for (const member of members) {
    const current = membersByCluster.get(member.clusterId) ?? [];
    current.push(member);
    membersByCluster.set(member.clusterId, current);
  }

  const currentPolicyEvents = events.filter((event) => {
    const policy = record(record(event.metadata).eventPolicy);
    return event.policyVersion === INTELLIGENCE_POLICY_VERSION
      && policy.version === INTELLIGENCE_POLICY_VERSION;
  });
  const currentPolicyEventIds = new Set(currentPolicyEvents.map((event) => event.id));

  const historicalOrphanEvents = events.filter((event) => (linksByEvent.get(event.id) ?? []).length === 0);
  const currentPolicyOrphanEvents = historicalOrphanEvents.filter((event) => currentPolicyEventIds.has(event.id));

  const brokenClusters = clusters.flatMap((cluster) => {
    const clusterMembers = membersByCluster.get(cluster.id) ?? [];
    const primaryMembership = clusterMembers.find((member) => member.eventId === cluster.primaryEventId);
    const primaryRoleCount = clusterMembers.filter((member) => member.role === "PRIMARY").length;
    const duplicateEventIds = clusterMembers
      .map((member) => member.eventId)
      .filter((eventId, index, all) => all.indexOf(eventId) !== index);
    const reasons: string[] = [];
    if (!primaryMembership) reasons.push("PRIMARY_EVENT_NOT_MEMBER");
    if (primaryMembership && primaryMembership.role !== "PRIMARY") reasons.push("PRIMARY_EVENT_ROLE_INVALID");
    if (primaryRoleCount !== 1) reasons.push("PRIMARY_ROLE_COUNT_INVALID");
    if (duplicateEventIds.length) reasons.push("DUPLICATE_CLUSTER_MEMBER");
    if (cluster.memberEventCount !== clusterMembers.length) reasons.push("MEMBER_COUNT_DRIFT");
    return reasons.length ? [{ clusterId: cluster.id, reasons }] : [];
  });

  const manualOnlyFormalEligible = currentPolicyEvents.flatMap((event) => {
    const policy = record(record(event.metadata).eventPolicy);
    const formalEligible = policy.officialNewsEligible === true || policy.hotspotEligible === true;
    if (!formalEligible) return [];
    const rawIds = linksByEvent.get(event.id) ?? [];
    const origins = rawIds.flatMap((rawId) =>
      (observationsByRaw.get(rawId) ?? []).map((observation) => originOfObservation(observation.metadata))
    ).filter((origin): origin is string => Boolean(origin));
    const explicitManual = origins.includes("MANUAL");
    const explicitSystem = origins.includes("SYSTEM");
    // Historical SYSTEM observations created before provenance metadata was
    // introduced can legitimately have no explicit origin. Only an explicit
    // MANUAL-only chain is a privilege-boundary violation.
    return explicitManual && !explicitSystem ? [{
      eventId: event.id,
      title: event.title,
      officialNewsEligible: policy.officialNewsEligible === true,
      hotspotEligible: policy.hotspotEligible === true,
      origins: [...new Set(origins)]
    }] : [];
  });

  const violations = {
    currentPolicyOrphanEvents: currentPolicyOrphanEvents.map((event) => ({ id: event.id, title: event.title })),
    brokenClusters,
    manualOnlyFormalEligible
  };

  console.log(JSON.stringify({
    version: "ai-collection-integrity-v1",
    database: target.databaseName,
    totals: {
      events: events.length,
      currentPolicyEvents: currentPolicyEvents.length,
      clusters: clusters.length,
      historicalOrphanEvents: historicalOrphanEvents.length
    },
    violations,
    historicalIsolation: {
      orphanEventsNotInCurrentPolicy: historicalOrphanEvents.filter((event) => !currentPolicyEventIds.has(event.id)).length,
      action: "REPORT_ONLY"
    }
  }, null, 2));

  if (
    violations.currentPolicyOrphanEvents.length
    || violations.brokenClusters.length
    || violations.manualOnlyFormalEligible.length
  ) {
    throw new Error("AI_COLLECTION_INTEGRITY_FAILED");
  }

  console.log("AI_COLLECTION_INTEGRITY=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
