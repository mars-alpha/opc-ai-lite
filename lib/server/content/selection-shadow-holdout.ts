import "server-only";

import fs from "node:fs";
import path from "node:path";
import {
  SELECTION_SHADOW_PROMPT_VERSION,
  SELECTION_SHADOW_RULE_VERSION,
  type SelectionShadowT2PolicyVersion
} from "../../content/selection-shadow";
import {
  listSelectionShadowCalibrationPool,
  type SelectionShadowGoldCase
} from "./selection-shadow-calibration";

export const SELECTION_SHADOW_HOLDOUT_VERSION = "aihot-selection-holdout-v1";
export const SELECTION_SHADOW_FROZEN_POLICY: SelectionShadowT2PolicyVersion =
  "T2_80_STRONG_PRACTICAL_FACT_V2";
export const SELECTION_SHADOW_HOLDOUT_PATH =
  ".data/selection-shadow/holdout-new-window.jsonl";
export const SELECTION_SHADOW_HOLDOUT_MANIFEST_PATH =
  ".data/selection-shadow/holdout-new-window.manifest.json";
const TRAINING_GOLD_PATH =
  ".data/selection-shadow/gold-sample-origin-tier-v1.jsonl";

function resolveProjectPath(relativePath: string) {
  return path.resolve(process.cwd(), relativePath);
}

function readJsonl<T>(relativePath: string): T[] {
  const file = resolveProjectPath(relativePath);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

function maxEventAt(rows: SelectionShadowGoldCase[]) {
  const times = rows
    .map((row) => row.material.eventAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => Date.parse(value))
    .filter(Number.isFinite);
  if (!times.length) throw new Error("SELECTION_SHADOW_HOLDOUT_CUTOFF_MISSING");
  return new Date(Math.max(...times)).toISOString();
}

function provisional(
  item: Awaited<ReturnType<typeof listSelectionShadowCalibrationPool>>[number]
): SelectionShadowGoldCase {
  return {
    ...item,
    gold: { decision: "either", contentType: null },
    reviewStatus: "PROVISIONAL",
    reviewerId: "HUMAN_REVIEW_REQUIRED",
    reviewedAt: "",
    reason: ""
  };
}

export async function refreshSelectionShadowHoldout(input: {
  windowDays?: number;
  maxCases?: number;
} = {}) {
  const training = readJsonl<SelectionShadowGoldCase>(TRAINING_GOLD_PATH);
  if (!training.length) throw new Error("SELECTION_SHADOW_TRAINING_GOLD_MISSING");

  const cutoff = maxEventAt(training);
  const trainingIds = new Set(training.map((row) => row.eventId));
  const previous = readJsonl<SelectionShadowGoldCase>(SELECTION_SHADOW_HOLDOUT_PATH);
  const previousByEvent = new Map(previous.map((row) => [row.eventId, row] as const));
  const pool = await listSelectionShadowCalibrationPool(input.windowDays ?? 7);

  const candidates = pool
    .filter((item) =>
      !trainingIds.has(item.eventId) &&
      Boolean(item.material.eventAt) &&
      Date.parse(item.material.eventAt as string) > Date.parse(cutoff)
    )
    .sort((a, b) =>
      Date.parse(a.material.eventAt ?? "") - Date.parse(b.material.eventAt ?? "") ||
      a.eventId.localeCompare(b.eventId)
    )
    .slice(0, Math.max(20, Math.min(200, input.maxCases ?? 120)));

  const rows = candidates.map((item) => {
    const existing = previousByEvent.get(item.eventId);
    return existing?.reviewStatus === "HUMAN_APPROVED"
      ? {
          ...provisional(item),
          gold: existing.gold,
          reviewStatus: existing.reviewStatus,
          reviewerId: existing.reviewerId,
          reviewedAt: existing.reviewedAt,
          reason: existing.reason
        }
      : provisional(item);
  });

  const holdoutFile = resolveProjectPath(SELECTION_SHADOW_HOLDOUT_PATH);
  fs.mkdirSync(path.dirname(holdoutFile), { recursive: true });
  fs.writeFileSync(
    holdoutFile,
    rows.length ? rows.map((row) => JSON.stringify(row)).join("\n") + "\n" : "",
    "utf8"
  );

  const manifest = {
    version: SELECTION_SHADOW_HOLDOUT_VERSION,
    status: rows.length ? "READY_FOR_HUMAN_REVIEW" : "WAITING_NEW_WINDOW",
    generatedAt: new Date().toISOString(),
    cutoff,
    windowDays: input.windowDays ?? 7,
    frozen: {
      ruleVersion: SELECTION_SHADOW_RULE_VERSION,
      promptVersion: SELECTION_SHADOW_PROMPT_VERSION,
      policy: SELECTION_SHADOW_FROZEN_POLICY,
      originAuthorityResolver: "selection-shadow-origin-tier-refresh-v1",
      ruleMutationAllowed: false
    },
    trainingGold: {
      file: TRAINING_GOLD_PATH,
      caseCount: training.length,
      eventIds: [...trainingIds].sort()
    },
    holdout: {
      file: SELECTION_SHADOW_HOLDOUT_PATH,
      caseCount: rows.length,
      reviewedCount: rows.filter((row) => row.reviewStatus === "HUMAN_APPROVED").length,
      eventIds: rows.map((row) => row.eventId)
    }
  };

  fs.writeFileSync(
    resolveProjectPath(SELECTION_SHADOW_HOLDOUT_MANIFEST_PATH),
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8"
  );

  return manifest;
}

export function validateSelectionShadowHoldoutDataset() {
  const manifest = readSelectionShadowHoldoutManifest();
  if (!manifest) throw new Error("SELECTION_SHADOW_HOLDOUT_MANIFEST_MISSING");
  const training = readJsonl<SelectionShadowGoldCase>(TRAINING_GOLD_PATH);
  const holdout = readJsonl<SelectionShadowGoldCase>(SELECTION_SHADOW_HOLDOUT_PATH);
  const trainingIds = new Set(training.map((row) => row.eventId));
  const holdoutIds = new Set<string>();
  const violations: string[] = [];

  for (const row of holdout) {
    if (trainingIds.has(row.eventId)) violations.push("TRAINING_OVERLAP:" + row.eventId);
    if (holdoutIds.has(row.eventId)) violations.push("DUPLICATE_EVENT:" + row.eventId);
    holdoutIds.add(row.eventId);
    if (!row.material.eventAt || Date.parse(row.material.eventAt) <= Date.parse(manifest.cutoff)) {
      violations.push("NOT_AFTER_CUTOFF:" + row.eventId);
    }
  }

  if (manifest.frozen.ruleVersion !== SELECTION_SHADOW_RULE_VERSION) violations.push("RULE_VERSION_DRIFT");
  if (manifest.frozen.promptVersion !== SELECTION_SHADOW_PROMPT_VERSION) violations.push("PROMPT_VERSION_DRIFT");
  if (manifest.frozen.policy !== SELECTION_SHADOW_FROZEN_POLICY) violations.push("POLICY_VERSION_DRIFT");
  if (manifest.frozen.ruleMutationAllowed !== false) violations.push("FREEZE_MUTATION_GUARD_MISSING");
  if (manifest.holdout.caseCount !== holdout.length) violations.push("MANIFEST_CASE_COUNT_DRIFT");

  return {
    valid: violations.length === 0,
    violations,
    cutoff: manifest.cutoff,
    status: manifest.status,
    trainingCaseCount: training.length,
    holdoutCaseCount: holdout.length,
    reviewedCount: holdout.filter((row) => row.reviewStatus === "HUMAN_APPROVED").length,
    binaryLabeledCount: holdout.filter((row) =>
      row.reviewStatus === "HUMAN_APPROVED" &&
      (row.gold.decision === "select" || row.gold.decision === "reject")
    ).length,
    frozen: manifest.frozen
  };
}

export function readSelectionShadowHoldoutManifest() {
  const file = resolveProjectPath(SELECTION_SHADOW_HOLDOUT_MANIFEST_PATH);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as {
    version: string;
    status: "READY_FOR_HUMAN_REVIEW" | "WAITING_NEW_WINDOW";
    generatedAt: string;
    cutoff: string;
    frozen: {
      ruleVersion: string;
      promptVersion: string;
      policy: SelectionShadowT2PolicyVersion;
      originAuthorityResolver: string;
      ruleMutationAllowed: boolean;
    };
    holdout: {
      file: string;
      caseCount: number;
      reviewedCount: number;
      eventIds: string[];
    };
  };
}
