import "server-only";

import { hasOfficialAccountFollowEntitlement } from "../entitlements/service";
import { getMembershipStatus } from "../membership/service";

export type ResourceAccessTarget =
  | "AI_DAILY_FULL"
  | "KNOWLEDGE_BODY"
  | "DEEP_RESOURCE"
  | "LATEST_PRACTICE_DETAIL"
  | "ADVANCED_COURSE_ENTRY";

export type ResourceAccessMode = "ALLOW" | "PREVIEW" | "DENY";

export type ResourceAccessReason =
  | "PUBLIC"
  | "MEMBERSHIP"
  | "OFFICIAL_ACCOUNT_FOLLOW"
  | "MEMBERSHIP_REQUIRED"
  | "FOLLOW_OR_MEMBERSHIP_REQUIRED";

export type ResourceAccessResult = {
  target: ResourceAccessTarget;
  mode: ResourceAccessMode;
  allowed: boolean;
  previewAllowed: boolean;
  reason: ResourceAccessReason;
};

function allow(target: ResourceAccessTarget, reason: ResourceAccessReason): ResourceAccessResult {
  return { target, mode: "ALLOW", allowed: true, previewAllowed: true, reason };
}

function preview(target: ResourceAccessTarget, reason: ResourceAccessReason): ResourceAccessResult {
  return { target, mode: "PREVIEW", allowed: false, previewAllowed: true, reason };
}

function deny(target: ResourceAccessTarget, reason: ResourceAccessReason): ResourceAccessResult {
  return { target, mode: "DENY", allowed: false, previewAllowed: false, reason };
}

export async function resolveResourceAccess(
  userId: string | null,
  target: ResourceAccessTarget
): Promise<ResourceAccessResult> {
  const membership = await getMembershipStatus(userId);

  if (target === "AI_DAILY_FULL") {
    if (membership.active) return allow(target, "MEMBERSHIP");
    if (userId && (await hasOfficialAccountFollowEntitlement(userId))) {
      return allow(target, "OFFICIAL_ACCOUNT_FOLLOW");
    }
    return preview(target, "FOLLOW_OR_MEMBERSHIP_REQUIRED");
  }

  if (membership.active) return allow(target, "MEMBERSHIP");

  if (target === "ADVANCED_COURSE_ENTRY") {
    return deny(target, "MEMBERSHIP_REQUIRED");
  }

  return preview(target, "MEMBERSHIP_REQUIRED");
}
