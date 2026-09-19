import { NextResponse } from "next/server";
import {
  HELP_ISSUE_TYPES,
  resolveLearningHelp
} from "../../../../../lib/server/learning-insights/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const courseSlug = typeof body?.courseSlug === "string" ? body.courseSlug : "";
  const lessonSlug = typeof body?.lessonSlug === "string" ? body.lessonSlug : "";
  const issueType = typeof body?.issueType === "string" ? body.issueType : "";
  const detail = typeof body?.detail === "string" ? body.detail : "";

  if (
    !courseSlug ||
    !lessonSlug ||
    !HELP_ISSUE_TYPES.includes(issueType as (typeof HELP_ISSUE_TYPES)[number])
  ) {
    return NextResponse.json({ error: "INVALID_HELP_INPUT" }, { status: 400 });
  }

  try {
    return NextResponse.json(
      resolveLearningHelp({
        courseSlug,
        lessonSlug,
        issueType: issueType as (typeof HELP_ISSUE_TYPES)[number],
        detail
      })
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "HELP_RESOLUTION_FAILED";
    if (code === "LESSON_NOT_FOUND") {
      return NextResponse.json({ error: code }, { status: 404 });
    }
    return NextResponse.json({ error: "HELP_RESOLUTION_FAILED" }, { status: 500 });
  }
}
