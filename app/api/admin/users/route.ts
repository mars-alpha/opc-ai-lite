import { NextResponse } from "next/server";
import { getSessionUser, readSessionToken } from "../../../../lib/server/auth/service";
import { requireAdminUser } from "../../../../lib/server/admin/service";
import { listAdminUsers } from "../../../../lib/server/admin/users";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(readSessionToken(request));
    requireAdminUser(user);
    const url = new URL(request.url);
    const items = await listAdminUsers({
      q: url.searchParams.get("q"),
      accountStatus: url.searchParams.get("accountStatus"),
      membership: url.searchParams.get("membership"),
      role: url.searchParams.get("role")
    });
    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    console.error("[OPC AI] admin users list failed", error);
    return NextResponse.json({ error: "ADMIN_USERS_LIST_FAILED" }, { status: 500 });
  }
}
