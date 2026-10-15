import "server-only";

import {
  RADAR_SOURCE_PORTFOLIO,
  type RadarPortfolioEntry
} from "../../content/radar-source-portfolio";

export const SOURCE_COVERAGE_CONTRACT_VERSION = "source-coverage-precision-v1";

export const SOURCE_COVERAGE_MINIMUMS = {
  roles: {
    OFFICIAL: 4,
    PROFESSIONAL_MEDIA: 3,
    RESEARCH: 1,
    CREATOR: 2,
    DEVELOPER_COMMUNITY: 2
  },
  evidence: {
    PRIMARY_FACT: 4,
    MEDIA_CONFIRMATION: 3,
    EXPERIENCE: 2,
    TUTORIAL: 2,
    ADOPTION: 3
  },
  languages: {
    ZH: 2,
    EN: 8
  }
} as const;

type SourceUniverseRole =
  | "OFFICIAL"
  | "PROFESSIONAL_MEDIA"
  | "RESEARCH"
  | "CREATOR"
  | "DEVELOPER_COMMUNITY"
  | "DISCOVERY_AGGREGATOR"
  | "SOCIAL";

type EvidenceRole =
  | "PRIMARY_FACT"
  | "MEDIA_CONFIRMATION"
  | "ANALYSIS"
  | "BENCHMARK"
  | "TUTORIAL"
  | "EXPERIENCE"
  | "ADOPTION"
  | "SOCIAL_SIGNAL"
  | "DEMAND_SIGNAL";

type LanguageScope = "ZH" | "EN" | "MIXED";

function defaultRole(entry: RadarPortfolioEntry): SourceUniverseRole {
  if (entry.sourceType === "OFFICIAL") return "OFFICIAL";
  if (entry.sourceType === "MEDIA") return "PROFESSIONAL_MEDIA";
  if (entry.sourceType === "RESEARCH") return "RESEARCH";
  if (entry.sourceType === "DEVELOPER") return "DEVELOPER_COMMUNITY";
  return "DISCOVERY_AGGREGATOR";
}

function defaultEvidenceRoles(entry: RadarPortfolioEntry): EvidenceRole[] {
  if (entry.sourceType === "OFFICIAL") return ["PRIMARY_FACT"];
  if (entry.sourceType === "MEDIA") return ["MEDIA_CONFIRMATION"];
  if (entry.sourceType === "RESEARCH") return ["PRIMARY_FACT", "BENCHMARK"];
  if (entry.sourceType === "DEVELOPER") return ["ADOPTION", "SOCIAL_SIGNAL"];
  return ["SOCIAL_SIGNAL"];
}

function increment(map: Record<string, number>, key: string) {
  map[key] = (map[key] ?? 0) + 1;
}

export function resolvePortfolioCoverage(entry: RadarPortfolioEntry) {
  return {
    sourceUniverseRole: entry.coverage?.sourceUniverseRole ?? defaultRole(entry),
    evidenceRoles: entry.coverage?.evidenceRoles ?? defaultEvidenceRoles(entry),
    languageScope: entry.coverage?.languageScope ?? "EN" as LanguageScope,
    primaryRouteCost: entry.acquisition.routes.find((route) => route.role === "PRIMARY")?.costLevel ?? "VERY_HIGH"
  };
}

export function buildSourceCoverageMatrix(
  portfolio: readonly RadarPortfolioEntry[] = RADAR_SOURCE_PORTFOLIO
) {
  const roleCoverage: Record<string, number> = {};
  const evidenceCoverage: Record<string, number> = {};
  const languageCoverage: Record<string, number> = {};
  const costCoverage: Record<string, number> = {};
  const rows = portfolio.map((entry) => {
    const coverage = resolvePortfolioCoverage(entry);
    increment(roleCoverage, coverage.sourceUniverseRole);
    for (const evidenceRole of coverage.evidenceRoles) increment(evidenceCoverage, evidenceRole);
    if (coverage.languageScope === "MIXED") {
      increment(languageCoverage, "ZH");
      increment(languageCoverage, "EN");
      increment(languageCoverage, "MIXED");
    } else {
      increment(languageCoverage, coverage.languageScope);
    }
    increment(costCoverage, coverage.primaryRouteCost);
    return {
      sourceId: entry.sourceId,
      name: entry.name,
      group: entry.group,
      ...coverage
    };
  });

  const gaps: Array<{
    dimension: "ROLE" | "EVIDENCE" | "LANGUAGE";
    key: string;
    actual: number;
    minimum: number;
  }> = [];
  for (const [key, minimum] of Object.entries(SOURCE_COVERAGE_MINIMUMS.roles)) {
    const actual = roleCoverage[key] ?? 0;
    if (actual < minimum) gaps.push({ dimension: "ROLE", key, actual, minimum });
  }
  for (const [key, minimum] of Object.entries(SOURCE_COVERAGE_MINIMUMS.evidence)) {
    const actual = evidenceCoverage[key] ?? 0;
    if (actual < minimum) gaps.push({ dimension: "EVIDENCE", key, actual, minimum });
  }
  for (const [key, minimum] of Object.entries(SOURCE_COVERAGE_MINIMUMS.languages)) {
    const actual = languageCoverage[key] ?? 0;
    if (actual < minimum) gaps.push({ dimension: "LANGUAGE", key, actual, minimum });
  }

  const lowMaintenanceSourceCount = rows.filter((row) =>
    row.primaryRouteCost === "LOW" || row.primaryRouteCost === "MEDIUM"
  ).length;
  const veryHighCostDefaultSources = rows
    .filter((row) => row.primaryRouteCost === "VERY_HIGH")
    .map((row) => row.sourceId);

  return {
    version: SOURCE_COVERAGE_CONTRACT_VERSION,
    totalSources: rows.length,
    rows,
    roleCoverage,
    evidenceCoverage,
    languageCoverage,
    costCoverage,
    lowMaintenanceSourceCount,
    veryHighCostDefaultSources,
    gaps
  };
}
