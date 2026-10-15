import "server-only";

import { createHash } from "node:crypto";
import { eq, or, sql } from "drizzle-orm";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import { contentSources } from "../db/schema";
import { collectRss, collectSitemap, fetchPublicText, parseFeedDocument, runSourceCollection } from "./collection-runner";
import { resolveSourceAcquisitionPlan } from "./source-acquisition-plan";
import { listSourceQualificationSnapshots, type SourceQualificationSnapshot } from "./source-qualification";
import {discoverPublicFeed} from "./public-feed-discovery";
import { resolveSourceTarget } from "./source-target";
import { recordContentAudit } from "./workbench";

export const SOURCE_ONBOARDING_VERSION = "source-onboarding-v2";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function isSupersededSourceRegistration(source: typeof contentSources.$inferSelect) {
  const metadata = record(source.metadata);
  const registry = record(metadata.sourceRegistry);
  const onboarding = record(metadata.sourceOnboarding);
  return (
    onboarding.version !== SOURCE_ONBOARDING_VERSION &&
    (
      String(registry.usageMode ?? "").toUpperCase() === "MANUAL" ||
      source.id.startsWith("source_manual_")
    )
  );
}

type Candidate = {
  inputUrl: string;
  canonicalUrl: string;
  name: string;
  platform: string;
  objectType: string;
  kind: "WEBSITE" | "CREATOR";
  acquisition: "RSS_ATOM" | "SITEMAP" | "UNRESOLVED";
  acquisitionUrl: string | null;
  collectionMethod: "RSS" | "SITEMAP" | "UNRESOLVED";
  providerRef: string;
  sourceType: "MANAGED_SOURCE" | "CREATOR";
  check: {
    passed: boolean;
    reason: string;
    sampleCount: number;
  };
  samples: Array<{ title: string; url: string; publishedAt: string | null }>;
};

function fingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 20);
}

async function discoverFeed(canonicalUrl: string, signal:AbortSignal) {
  return discoverPublicFeed(canonicalUrl,{fetchPage:url=>fetchPublicText(url,undefined,signal),parseFeed:parseFeedDocument,collectFeed:url=>collectRss(url,signal)});
}

async function discoverSitemap(canonicalUrl: string, signal:AbortSignal) {
  const target = new URL(canonicalUrl);
  const candidates: string[] = [];
  try {
    const robots = await fetchPublicText(
      new URL("/robots.txt", target.origin).toString(),
      "text/plain, */*;q=0.5", signal
    );
    for (const match of robots.body.matchAll(/^Sitemap:\s*(\S+)/gmi)) {
      try {
        const sitemapUrl = new URL(match[1]!, target.origin);
        if (sitemapUrl.hostname.toLowerCase() === target.hostname.toLowerCase()) {
          candidates.push(sitemapUrl.toString());
        }
      } catch {}
    }
  } catch {}
  candidates.push(new URL("/sitemap.xml", target.origin).toString());

  for (const url of [...new Set(candidates)].slice(0, 5)) {
    try {
      const items = await collectSitemap(url, canonicalUrl,signal);
      if (items.length) {
        return {
          url,
          sampleCount: Math.min(items.length, 5),
          samples: items.slice(0, 3).map((item) => ({
            title: item.title,
            url: item.originalUrl ?? url,
            publishedAt: item.publishedAt ?? null
          }))
        };
      }
    } catch {}
  }
  return null;
}

export async function discoverSource(input: { url?: unknown; kind?: unknown; name?: unknown }): Promise<Candidate> {
  const signal=AbortSignal.timeout(30000);
  const target = resolveSourceTarget(input.url);
  if (!target.longTermEligible) throw new Error("SOURCE_ONBOARDING_REQUIRES_SITE_OR_HOMEPAGE");
  const requestedKind = String(input.kind ?? "").toUpperCase();
  const kind: "WEBSITE" | "CREATOR" =
    requestedKind === "CREATOR" || ["ACCOUNT", "CHANNEL", "PAGE"].includes(target.objectType)
      ? "CREATOR"
      : "WEBSITE";
  const suppliedName = typeof input.name === "string" && input.name.trim() ? input.name.trim().slice(0, 200) : null;
  const name = suppliedName ?? target.displayName;

  if (kind === "WEBSITE" || kind === "CREATOR") {
    const feed = await discoverFeed(target.canonicalUrl,AbortSignal.any([signal,AbortSignal.timeout(20000)]));
    if (feed) {
      return {
        inputUrl: String(input.url),
        canonicalUrl: target.canonicalUrl,
        name,
        platform: target.platform,
        objectType: target.objectType,
        kind,
        acquisition: "RSS_ATOM",
        acquisitionUrl: feed.url,
        collectionMethod: "RSS",
        providerRef: "ONBOARDING:RSS:" + fingerprint(feed.url),
        sourceType: kind === "CREATOR" ? "CREATOR" : "MANAGED_SOURCE",
        check: { passed: true, reason: "RSS_ATOM_LIVE_CHECK_PASSED", sampleCount: feed.sampleCount },
        samples: feed.samples
      };
    }
    const sitemap = await discoverSitemap(target.canonicalUrl,signal);
    if (sitemap) {
      return {
        inputUrl: String(input.url),
        canonicalUrl: target.canonicalUrl,
        name,
        platform: target.platform,
        objectType: target.objectType,
        kind,
        acquisition: "SITEMAP",
        acquisitionUrl: sitemap.url,
        collectionMethod: "SITEMAP",
        providerRef: "ONBOARDING:SITEMAP:" + fingerprint(sitemap.url + "|" + target.canonicalUrl),
        sourceType: kind === "CREATOR" ? "CREATOR" : "MANAGED_SOURCE",
        check: { passed: true, reason: "SITEMAP_LIVE_CHECK_PASSED", sampleCount: sitemap.sampleCount },
        samples: sitemap.samples
      };
    }
  }

  return {
    inputUrl: String(input.url),
    canonicalUrl: target.canonicalUrl,
    name,
    platform: target.platform,
    objectType: target.objectType,
    kind,
    acquisition: "UNRESOLVED",
    acquisitionUrl: null,
    collectionMethod: "UNRESOLVED",
    providerRef: "ONBOARDING:UNRESOLVED:" + fingerprint(target.canonicalUrl),
    sourceType: kind === "CREATOR" ? "CREATOR" : "MANAGED_SOURCE",
    check: { passed: false, reason: signal.aborted ? "SOURCE_DISCOVERY_TIMEOUT" : "NO_SERVER_RUNNABLE_PUBLIC_ROUTE", sampleCount: 0 },
    samples: []
  };
}

export async function previewSourceOnboarding(input: { url?: unknown; kind?: unknown; name?: unknown }) {
  const candidate = await discoverSource(input);
  const db = getDatabase();
  const [byUrl] = await db.select().from(contentSources).where(eq(contentSources.canonicalUrl, candidate.canonicalUrl)).limit(1);
  const [byProvider] = await db.select().from(contentSources).where(eq(contentSources.providerRef, candidate.providerRef)).limit(1);
  const existing = byUrl ?? byProvider ?? null;
  return {
    candidate,
    duplicate: existing ? { sourceId: existing.id, name: existing.name, status: existing.status, enabled: existing.enabled } : null,
    canRegister: candidate.check.passed && !existing,
    initialQualification: "CONDITIONAL" as const
  };
}

export async function registerOnboardedSource(user: AuthUser, input: { url?: unknown; kind?: unknown; name?: unknown }) {
  const preview = await previewSourceOnboarding(input);
  const candidate = preview.candidate;
  if (!candidate.check.passed || candidate.check.sampleCount < 1) throw new Error(candidate.check.reason);
  return getDatabase().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('source-onboarding-register'))`);
    const [superseded] = await tx.select().from(contentSources).where(or(eq(contentSources.canonicalUrl,candidate.canonicalUrl),eq(contentSources.providerRef,candidate.providerRef))).limit(1);
    if (superseded && !isSupersededSourceRegistration(superseded)) {
      throw new Error("SOURCE_ONBOARDING_DUPLICATE");
    }
    const sourceId = "source_operator_" + fingerprint(candidate.providerRef);
    const primaryRoute = {
      id: "primary",
      role: "PRIMARY" as const,
      kind: candidate.acquisition,
      url: candidate.acquisitionUrl,
      costLevel:
        candidate.acquisition === "RSS_ATOM" || candidate.acquisition === "SITEMAP"
          ? "LOW"
          : "MEDIUM"
    };
    const acquisition = {
      routes: [primaryRoute],
      // Legacy mirror retained during 004 migration; resolver ownership is acquisition.routes.
      kind: primaryRoute.kind,
      url: primaryRoute.url
    };
    const onboardingMetadata = {
      systemManaged: false,
      sourceRegistry: {
        managed: true,
        usageMode: "SYSTEM",
        sourceRoles: [candidate.kind === "CREATOR" ? "CREATOR" : "GENERAL"],
        owner: "SOURCE_MANAGEMENT"
      },
      sourceOnboarding: {
        version: SOURCE_ONBOARDING_VERSION,
        stage: "REGISTERED",
        objectType: candidate.objectType,
        discoveredAt: new Date().toISOString(),
        checkReason: candidate.check.reason,
        checkSampleCount: candidate.check.sampleCount
      },
      watchlist: candidate.kind === "CREATOR" ? { enabled: true, objectType: candidate.objectType } : undefined,
      factualSource: false,
      signalSource: true,
      referenceOnly: true,
      mediaPolicy: "REFERENCE_ONLY"
    };

    if (superseded) {
      const oldMetadata = record(superseded.metadata);
      const [adopted] = await tx.update(contentSources).set({
        name: candidate.name,
        sourceType: candidate.sourceType,
        canonicalUrl: candidate.canonicalUrl,
        providerRef: candidate.providerRef,
        status: "ACTIVE",
        platform: candidate.platform,
        collectionMethod: candidate.collectionMethod,
        enabled: true,
        authorityScore: 55,
        topics: ["AI"],
        collectionConfig: { acquisition, sourceOnboardingVersion: SOURCE_ONBOARDING_VERSION },
        signalConfig: candidate.kind === "CREATOR" ? { signalOnly: true } : {},
        metadata: {
          ...oldMetadata,
          ...onboardingMetadata,
          legacyRegistration: {
            migratedAt: new Date().toISOString(),
            previousUsageMode: record(oldMetadata.sourceRegistry).usageMode ?? null,
            previousCollectionMethod: superseded.collectionMethod,
            previousProviderRef: superseded.providerRef
          }
        },
        updatedAt: new Date()
      }).where(eq(contentSources.id, superseded.id)).returning();
      await recordContentAudit(user, {
        action: "SOURCE_ONBOARDING_SUPERSEDED_REGISTRATION_ADOPTED",
        entityType: "CONTENT_SOURCE",
        entityId: adopted.id,
        before: superseded,
        after: adopted
      }, tx);
      return adopted;
    }

    const [created] = await tx.insert(contentSources).values({
      id: sourceId,
      name: candidate.name,
      sourceType: candidate.sourceType,
      canonicalUrl: candidate.canonicalUrl,
      providerRef: candidate.providerRef,
      status: "ACTIVE",
      platform: candidate.platform,
      collectionMethod: candidate.collectionMethod,
      enabled: true,
      authorityScore: 55,
      topics: ["AI"],
      collectionConfig: { acquisition, sourceOnboardingVersion: SOURCE_ONBOARDING_VERSION },
      signalConfig: candidate.kind === "CREATOR" ? { signalOnly: true } : {},
      metadata: onboardingMetadata
    }).returning();
    await recordContentAudit(user, { action: "SOURCE_ONBOARDING_REGISTERED", entityType: "CONTENT_SOURCE", entityId: created.id, after: created }, tx);
    return created;
  });
}

async function sourceById(sourceId: string) {
  const [source] = await getDatabase().select().from(contentSources).where(eq(contentSources.id, sourceId)).limit(1);
  if (!source) throw new Error("SOURCE_NOT_FOUND");
  return source;
}

export async function runOnboardedSourceCollection(user: AuthUser, sourceId: string, qualificationOnly = false) {
  const source = await sourceById(sourceId);
  const acquisition = resolveSourceAcquisitionPlan({
    collectionMethod: source.collectionMethod,
    platform: source.platform,
    providerRef: source.providerRef,
    canonicalUrl: source.canonicalUrl,
    metadata: source.metadata,
    collectionConfig: source.collectionConfig
  });
  if (!acquisition.routes.some((route) => route.serverRuntimeSupported)) {
    throw new Error("SOURCE_ACQUISITION_NOT_RUNNABLE");
  }
  return runSourceCollection(user, source.id, {
    provenance: { origin: "SYSTEM", collectionPurpose: "LATEST", runKind: qualificationOnly ? "SOURCE_QUALIFICATION:ONBOARDING" : "SYSTEM_SOURCE_PORTFOLIO" },
    qualificationOnly
  });
}

export async function qualifyOnboardedSource(user: AuthUser, sourceId: string) {
  const source = await sourceById(sourceId);
  const config = source.collectionConfig && typeof source.collectionConfig === "object" && !Array.isArray(source.collectionConfig)
    ? source.collectionConfig as Record<string, unknown> : {};
  const acquisition = config.acquisition && typeof config.acquisition === "object" && !Array.isArray(config.acquisition)
    ? config.acquisition as Record<string, unknown> : {};
  let probe: unknown = null;
  if (acquisition.kind === "RSS_ATOM" || acquisition.kind === "SITEMAP") {
    probe = await runOnboardedSourceCollection(user, sourceId, true);
  }
  const [qualification] = await listSourceQualificationSnapshots([sourceId]);
  const stage = resolveOnboardingStage(qualification ?? null, record(probe).status === "SUCCEEDED");
  await getDatabase().transaction(async (tx) => {
    const [current] = await tx.select().from(contentSources).where(eq(contentSources.id, sourceId)).limit(1).for("update");
    if (!current) throw new Error("SOURCE_NOT_FOUND");
    const before = record(current.metadata);
    const updatedOnboarding = { ...record(before.sourceOnboarding), stage,
      qualificationCheckedAt: new Date().toISOString(),
      qualifiedAt: stage === "QUALIFIED" ? new Date().toISOString() : null };
    await tx.update(contentSources).set({ metadata: { ...before, sourceOnboarding: updatedOnboarding }, updatedAt: new Date() }).where(eq(contentSources.id, sourceId));
    await recordContentAudit(user, { action: "SOURCE_QUALIFICATION_CHECKED", entityType: "CONTENT_SOURCE", entityId: sourceId,
      before: { sourceOnboarding: before.sourceOnboarding ?? null }, after: { sourceOnboarding: updatedOnboarding },
      metadata: { reason: "ADMIN_QUALIFICATION_CHECK", qualification: qualification?.qualification ?? null } }, tx);
  });
  return { sourceId, probe, qualification: qualification ?? null, stage };
}

export function resolveOnboardingStage(qualification: { qualification: SourceQualificationSnapshot["qualification"]; evidence: { liveRunCount: number } } | null, probeSucceeded: boolean) {
  if (qualification?.qualification === "AUTO_READY") return "QUALIFIED";
  if ((qualification?.evidence.liveRunCount ?? 0) > 0) return "OBSERVING";
  return probeSucceeded ? "PROBED" : "REGISTERED";
}
