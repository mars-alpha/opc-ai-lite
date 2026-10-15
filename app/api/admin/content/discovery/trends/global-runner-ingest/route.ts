import { NextResponse } from "next/server";
import {
  contentWorkbenchError,
  requireAdminRequest
} from "../../../../../../../lib/server/admin/api";
import { ingestGlobalTrendRunnerPayload } from "../../../../../../../lib/server/content/global-trend-runner";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireAdminRequest(request);
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await ingestGlobalTrendRunnerPayload(user, body ?? {}));
  } catch (error) {
    return contentWorkbenchError(error, "GLOBAL_TREND_RUNNER_FAILED") ??
      NextResponse.json({ error: "GLOBAL_TREND_RUNNER_FAILED" }, { status: 500 });
  }
}
