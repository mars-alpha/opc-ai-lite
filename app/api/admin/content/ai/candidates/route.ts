import { NextResponse } from "next/server";
import { requireAdminUser } from "../../../../../../lib/server/admin/service";
import { requireSessionUser } from "../../../../../../lib/server/auth/service";
import { generateOfficialContentCandidates } from "../../../../../../lib/server/content/ai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireAdminUser(await requireSessionUser(request));
    const body = await request.json().catch(() => null);
    return NextResponse.json(await generateOfficialContentCandidates(body));
  } catch (error) {
    const code = error instanceof Error ? error.message : "CONTENT_AI_CANDIDATE_FAILED";
    if (code === "UNAUTHENTICATED") return NextResponse.json({ error: code }, { status: 401 });
    if (code === "FORBIDDEN") return NextResponse.json({ error: code }, { status: 403 });
    if (["INVALID_INPUT","EVIDENCE_REQUIRED"].includes(code)) {
      return NextResponse.json({ error: code }, { status: 400 });
    }
    console.error("[OPC AI] content candidate generation failed", error);
    return NextResponse.json({ error: "CONTENT_AI_CANDIDATE_FAILED" }, { status: 500 });
  }
}
