import { NextResponse } from "next/server";
import { getDatabaseConfig } from "../../../../lib/server/database-config";
import { requireSessionUser } from "../../../../lib/server/auth/service";
import {
  setLessonCompletion,
  setLessonCurrentStep
} from "../../../../lib/server/learning/service";
import { assertLessonStepCanEnter } from "../../../../lib/server/lesson-runtime/service";
import { getLessonHelpfulnessStateByLessonId } from "../../../../lib/server/learning-insights/service";
import { createRuntimeTiming } from "../../../../lib/server/runtime-performance";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  if (!getDatabaseConfig().configured) {
    return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  if (
    typeof body?.courseSlug !== "string" ||
    typeof body?.lessonSlug !== "string" ||
    typeof body?.completed !== "boolean"
  ) {
    return NextResponse.json({ error: "INVALID_PROGRESS_INPUT" }, { status: 400 });
  }

  try {
    const user = await requireSessionUser(request);
    const timing = createRuntimeTiming("lesson_completion");
    const completion = await setLessonCompletion(user.id, {
      courseSlug: body.courseSlug,
      lessonSlug: body.lessonSlug,
      completed: body.completed
    });
    timing.mark("completion_core_ms");
    const ratingState = body.completed
      ? await getLessonHelpfulnessStateByLessonId(user.id, completion.lessonId)
      : { canRate: false };
    timing.mark("rating_eligibility_ms");
    timing.finish({ completed: body.completed });
    return NextResponse.json({
      ok: true,
      completed: body.completed,
      canRate: body.completed && ratingState.canRate
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "LESSON_LOCKED") {
      return NextResponse.json(
        { error: "OFFICIAL_ACCOUNT_FOLLOW_REQUIRED" },
        { status: 403 }
      );
    }
    if (error instanceof Error && error.message === "STAGE_PREREQUISITE_REQUIRED") {
      return NextResponse.json(
        { error: "STAGE_PREREQUISITE_REQUIRED" },
        { status: 409 }
      );
    }
    if (error instanceof Error && error.message === "LESSON_NOT_FOUND") {
      return NextResponse.json({ error: "LESSON_NOT_FOUND" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "CHECK_REQUIRED") {
      return NextResponse.json({ error: "CHECK_REQUIRED" }, { status: 409 });
    }
    if (error instanceof Error && error.message === "PRACTICE_REQUIRED") {
      return NextResponse.json({ error: "PRACTICE_REQUIRED" }, { status: 409 });
    }
    if (error instanceof Error && error.message === "REAL_AI_REQUIRED") {
      return NextResponse.json({ error: "REAL_AI_REQUIRED" }, { status: 409 });
    }
    console.error("[OPC AI] progress update failed", error);
    return NextResponse.json({ error: "PROGRESS_UPDATE_FAILED" }, { status: 500 });
  }
}



export async function PATCH(request: Request) {
  if (!getDatabaseConfig().configured) {
    return NextResponse.json({ error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  if (
    typeof body?.courseSlug !== "string" ||
    typeof body?.lessonSlug !== "string" ||
    typeof body?.currentStep !== "number"
  ) {
    return NextResponse.json({ error: "INVALID_PROGRESS_INPUT" }, { status: 400 });
  }

  try {
    const user = await requireSessionUser(request);
    await assertLessonStepCanEnter(
      user.id,
      body.courseSlug,
      body.lessonSlug,
      body.currentStep
    );

    return NextResponse.json(
      await setLessonCurrentStep(user.id, {
        courseSlug: body.courseSlug,
        lessonSlug: body.lessonSlug,
        currentStep: body.currentStep
      })
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "PROGRESS_UPDATE_FAILED";
    if (code === "UNAUTHENTICATED") {
      return NextResponse.json({ error: code }, { status: 401 });
    }
    if (code === "INVALID_CURRENT_STEP") {
      return NextResponse.json({ error: code }, { status: 400 });
    }
    if (code === "LESSON_NOT_FOUND") {
      return NextResponse.json({ error: code }, { status: 404 });
    }
    if (code === "LESSON_LOCKED") {
      return NextResponse.json({ error: "OFFICIAL_ACCOUNT_FOLLOW_REQUIRED" }, { status: 403 });
    }
    if (code === "STAGE_PREREQUISITE_REQUIRED") {
      return NextResponse.json({ error: code }, { status: 409 });
    }
    if (code === "CHECK_REQUIRED" || code === "PRACTICE_REQUIRED" || code === "REAL_AI_REQUIRED") {
      return NextResponse.json({ error: code }, { status: 409 });
    }
    console.error("[OPC AI] current step update failed", error);
    return NextResponse.json({ error: "PROGRESS_UPDATE_FAILED" }, { status: 500 });
  }
}
