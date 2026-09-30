import { NextResponse } from "next/server";
import { getSessionUser, readSessionToken } from "../../../../../../lib/server/auth/service";
import { requireAdminUser } from "../../../../../../lib/server/admin/service";
import { updateAdminMembership } from "../../../../../../lib/server/admin/users";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = requireAdminUser(await getSessionUser(readSessionToken(request)));
    const { userId } = await params;
    const body = await request.json().catch(() => null);
    return NextResponse.json({ user: await updateAdminMembership(userId, body, admin) });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    const code = error instanceof Error ? error.message : "MEMBERSHIP_UPDATE_FAILED";
    if (code === "USER_NOT_FOUND") return NextResponse.json({ error: code }, { status: 404 });
    if (code.startsWith("INVALID_")) return NextResponse.json({ error: code }, { status: 400 });
    console.error("[OPC AI] admin membership update failed", error);
    return NextResponse.json({ error: "MEMBERSHIP_UPDATE_FAILED" }, { status: 500 });
  }
}
