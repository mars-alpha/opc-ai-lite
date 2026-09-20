import { NextResponse } from "next/server";
import { resolveResourceAccess } from "../../../../lib/server/access/service";
import { getSessionUser, readSessionToken } from "../../../../lib/server/auth/service";
import { listPublishedContentItems } from "../../../../lib/server/content/reader";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const [items, user] = await Promise.all([
      listPublishedContentItems(),
      getSessionUser(readSessionToken(request))
    ]);
    const access = await resolveResourceAccess(user?.id ?? null, "AI_DAILY_FULL");
    const visibleItems = access.allowed ? items : items.slice(0, 3);

    return NextResponse.json({
      items: visibleItems,
      access,
      lockedCount: Math.max(0, items.length - visibleItems.length)
    });
  } catch (error) {
    console.error("[OPC AI] published content API failed", error);
    return NextResponse.json({ error: "CONTENT_READ_FAILED" }, { status: 500 });
  }
}
