import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../../lib/server/admin/api";
import { createContentSource, listContentSources } from "../../../../../lib/server/content/workbench";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    return NextResponse.json({ items: await listContentSources() });
  } catch (error) {
    return contentWorkbenchError(error, "SOURCE_LIST_FAILED") ??
      NextResponse.json({ error: "SOURCE_LIST_FAILED" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdminRequest(request);
    const body = await request.json().catch(() => null);
    return NextResponse.json({ item: await createContentSource(user, body) }, { status: 201 });
  } catch (error) {
    return contentWorkbenchError(error, "SOURCE_CREATE_FAILED") ??
      NextResponse.json({ error: "SOURCE_CREATE_FAILED" }, { status: 500 });
  }
}
