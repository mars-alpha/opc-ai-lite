import { NextResponse } from "next/server";
import { requireSessionUser } from "../../../../../lib/server/auth/service";
import {
  grantOfficialAccountFollowEntitlement,
  revokeOfficialAccountFollowEntitlement
} from "../../../../../lib/server/entitlements/service";

function unavailable() {
  return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return unavailable();

  try {
    const user = await requireSessionUser(request);
    await grantOfficialAccountFollowEntitlement(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    console.error("[OPC AI] dev entitlement grant failed", error);
    return NextResponse.json({ error: "GRANT_FAILED" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (process.env.NODE_ENV === "production") return unavailable();

  try {
    const user = await requireSessionUser(request);
    await revokeOfficialAccountFollowEntitlement(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    console.error("[OPC AI] dev entitlement revoke failed", error);
    return NextResponse.json({ error: "REVOKE_FAILED" }, { status: 500 });
  }
}

