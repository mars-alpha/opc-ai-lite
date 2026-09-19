import { NextResponse } from "next/server";
import { getSessionUser, readSessionToken } from "../../../../../lib/server/auth/service";
import { getPracticeReadModel } from "../../../../../lib/server/practices/service";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ practiceId: string }> }
) {
  try {
    const { practiceId } = await params;
    const user = await getSessionUser(readSessionToken(request));
    const result = await getPracticeReadModel(user?.id ?? null, practiceId);
    return NextResponse.json(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : "PRACTICE_READ_FAILED";
    if (code === "PRACTICE_NOT_FOUND") {
      return NextResponse.json({ error: code }, { status: 404 });
    }
    console.error("[OPC AI] practice read failed", error);
    return NextResponse.json({ error: "PRACTICE_READ_FAILED" }, { status: 500 });
  }
}
