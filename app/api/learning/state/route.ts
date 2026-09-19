import { NextResponse } from "next/server";
import { getDatabaseConfig } from "../../../../lib/server/database-config";
import { requireSessionUser } from "../../../../lib/server/auth/service";
import { getLearningState } from "../../../../lib/server/learning/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!getDatabaseConfig().configured) {
    return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
  }

  try {
    const user = await requireSessionUser(request);
    return NextResponse.json(await getLearningState(user.id));
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    console.error("[OPC AI] learning state failed", error);
    return NextResponse.json({ error: "LEARNING_STATE_FAILED" }, { status: 500 });
  }
}

