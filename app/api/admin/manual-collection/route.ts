import { NextResponse } from "next/server";
import { contentWorkbenchError, requireAdminRequest } from "../../../../lib/server/admin/api";

export const dynamic = "force-dynamic";

function retiredResponse() {
  return NextResponse.json(
    {
      error: "MANUAL_COLLECTION_PRODUCT_RETIRED",
      message: "人工采集已退出当前产品架构；来源、账号、连接与持续关注统一在来源管理配置。",
      sourceManagementPath: "/admin/sources"
    },
    { status: 410 }
  );
}

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    return retiredResponse();
  } catch (error) {
    return contentWorkbenchError(error, "MANUAL_COLLECTION_RETIRED_READ_FAILED") ??
      NextResponse.json({ error: "MANUAL_COLLECTION_RETIRED_READ_FAILED" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminRequest(request);
    return retiredResponse();
  } catch (error) {
    return contentWorkbenchError(error, "MANUAL_COLLECTION_RETIRED_ACTION_FAILED") ??
      NextResponse.json(
        { error: error instanceof Error ? error.message : "MANUAL_COLLECTION_RETIRED_ACTION_FAILED" },
        { status: 400 }
      );
  }
}
