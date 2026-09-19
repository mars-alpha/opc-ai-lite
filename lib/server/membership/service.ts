import "server-only";

import { OPC_MEMBERSHIP_PRODUCT, type MembershipFeature } from "../../membership/policy";
import { hasActiveEntitlement } from "../entitlements/service";

export type MembershipStatus = {
  active: boolean;
  productId: typeof OPC_MEMBERSHIP_PRODUCT.resourceId;
};

export async function getMembershipStatus(userId: string | null): Promise<MembershipStatus> {
  if (!userId) {
    return { active: false, productId: OPC_MEMBERSHIP_PRODUCT.resourceId };
  }

  const active = await hasActiveEntitlement(userId, {
    type: OPC_MEMBERSHIP_PRODUCT.entitlementType,
    resourceType: OPC_MEMBERSHIP_PRODUCT.resourceType,
    resourceId: OPC_MEMBERSHIP_PRODUCT.resourceId
  });

  return { active, productId: OPC_MEMBERSHIP_PRODUCT.resourceId };
}

export async function resolveMembershipFeatureAccess(
  userId: string | null,
  feature: MembershipFeature
): Promise<{ allowed: boolean; reason: "MEMBERSHIP" | "MEMBERSHIP_REQUIRED"; feature: MembershipFeature }> {
  const membership = await getMembershipStatus(userId);
  return {
    allowed: membership.active,
    reason: membership.active ? "MEMBERSHIP" : "MEMBERSHIP_REQUIRED",
    feature
  };
}
