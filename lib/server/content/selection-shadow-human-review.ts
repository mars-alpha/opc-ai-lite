import "server-only";

import fs from "node:fs";
import path from "node:path";
import {
  SELECTION_SHADOW_CONTENT_TYPES,
  type SelectionShadowContentType
} from "../../content/selection-shadow";
import type { SelectionShadowGoldCase } from "./selection-shadow-calibration";

const DEFAULT_GOLD_PATH = ".data/selection-shadow/gold-sample.jsonl";

function goldPath(filePath = process.env.OPC_SELECTION_SHADOW_GOLD_PATH ?? DEFAULT_GOLD_PATH) {
  return path.resolve(process.cwd(), filePath);
}

function readRows(filePath?: string): SelectionShadowGoldCase[] {
  const file = goldPath(filePath);
  if (!fs.existsSync(file)) throw new Error("SELECTION_SHADOW_GOLD_FILE_NOT_FOUND");
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as SelectionShadowGoldCase);
}

function writeRows(rows: SelectionShadowGoldCase[], filePath?: string) {
  const file = goldPath(filePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = file + ".tmp";
  fs.writeFileSync(temp, rows.map((row) => JSON.stringify(row)).join("\n") + "\n", "utf8");
  fs.renameSync(temp, file);
}

function publicCase(item: SelectionShadowGoldCase) {
  return {
    caseId: item.caseId,
    eventId: item.eventId,
    titleSnapshot: item.titleSnapshot,
    sourceType: item.sourceType,
    material: item.material,
    gold: item.gold,
    reviewStatus: item.reviewStatus,
    reviewerId: item.reviewerId === "HUMAN_REVIEW_REQUIRED" ? null : item.reviewerId,
    reviewedAt: item.reviewedAt || null,
    reason: item.reason
  };
}

export function listSelectionShadowHumanReview(filePath?: string) {
  const rows = readRows(filePath);
  const reviewed = rows.filter((row) => row.reviewStatus === "HUMAN_APPROVED");
  const counts = {
    total: rows.length,
    reviewed: reviewed.length,
    pending: rows.length - reviewed.length,
    select: reviewed.filter((row) => row.gold.decision === "select").length,
    reject: reviewed.filter((row) => row.gold.decision === "reject").length,
    either: reviewed.filter((row) => row.gold.decision === "either").length
  };
  return {
    version: "aihot-selection-human-review-v1",
    authority: "CALIBRATION_ONLY",
    blindReview: {
      hidesCurrentCuration: true,
      hidesShadowScores: true,
      hidesThresholds: true,
      hidesSourceTier: true
    },
    counts,
    items: rows.map(publicCase)
  };
}

export function saveSelectionShadowHumanReview(input: {
  caseId?: unknown;
  decision?: unknown;
  contentType?: unknown;
  reason?: unknown;
  reviewerEmail: string;
  filePath?: string;
}) {
  const caseId = typeof input.caseId === "string" ? input.caseId.trim() : "";
  const decision = input.decision;
  const reason = typeof input.reason === "string" ? input.reason.trim().slice(0, 1200) : "";
  const contentType = typeof input.contentType === "string" && input.contentType.trim()
    ? input.contentType.trim()
    : null;

  if (!caseId) throw new Error("INVALID_SELECTION_SHADOW_CASE_ID");
  if (decision !== "select" && decision !== "reject" && decision !== "either") {
    throw new Error("INVALID_SELECTION_SHADOW_DECISION");
  }
  if (!reason) throw new Error("INVALID_SELECTION_SHADOW_REASON");
  if (
    contentType !== null &&
    !SELECTION_SHADOW_CONTENT_TYPES.includes(contentType as SelectionShadowContentType)
  ) {
    throw new Error("INVALID_SELECTION_SHADOW_CONTENT_TYPE");
  }

  const rows = readRows(input.filePath);
  const index = rows.findIndex((row) => row.caseId === caseId);
  if (index < 0) throw new Error("SELECTION_SHADOW_CASE_NOT_FOUND");

  rows[index] = {
    ...rows[index],
    gold: {
      decision,
      contentType: contentType as SelectionShadowContentType | null
    },
    reviewStatus: "HUMAN_APPROVED",
    reviewerId: input.reviewerEmail,
    reviewedAt: new Date().toISOString(),
    reason
  };
  writeRows(rows, input.filePath);
  return publicCase(rows[index]);
}
