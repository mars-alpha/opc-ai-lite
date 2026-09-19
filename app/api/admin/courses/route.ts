import { NextResponse } from "next/server";
import { getSessionUser, readSessionToken } from "../../../../lib/server/auth/service";
import { listAdminCourseTree, requireAdminUser } from "../../../../lib/server/admin/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(readSessionToken(request));
    requireAdminUser(user);
    return NextResponse.json({ items: await listAdminCourseTree() });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    console.error("[OPC AI] admin course list failed", error);
    return NextResponse.json({ error: "ADMIN_LIST_FAILED" }, { status: 500 });
  }
}

