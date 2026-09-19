import { NextResponse } from "next/server";
import { requireSessionUser } from "../../../../lib/server/auth/service";
import {
  CLIENT_LEARNING_EVENTS,
  recordClientLearningEvent
} from "../../../../lib/server/learning-insights/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser(request);
    const body = await request.json().catch(() => null);
    const eventName = typeof body?.eventName === "string" ? body.eventName : "";

    if (!CLIENT_LEARNING_EVENTS.includes(eventName as (typeof CLIENT_LEARNING_EVENTS)[number])) {
      return NextResponse.json({ error: "EVENT_NOT_ALLOWED" }, { status: 400 });
    }

    await recordClientLearningEvent(user.id, {
      courseSlug: typeof body?.courseSlug === "string" ? body.courseSlug : "",
      lessonSlug: typeof body?.lessonSlug === "string" ? body.lessonSlug : "",
      eventName: eventName as (typeof CLIENT_LEARNING_EVENTS)[number],
      targetType: typeof body?.targetType === "string" ? body.targetType : undefined,
      targetId: typeof body?.targetId === "string" ? body.targetId : undefined,
      properties:
        body?.properties && typeof body.properties === "object" && !Array.isArray(body.properties)
          ? body.properties
          : {}
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "EVENT_FAILED";
    if (code === "UNAUTHENTICATED") {
      return NextResponse.json({ error: code }, { status: 401 });
    }
    if (code === "LESSON_NOT_FOUND") {
      return NextResponse.json({ error: code }, { status: 404 });
    }
    console.error("[OPC AI] learning event failed", error);
    return NextResponse.json({ error: "EVENT_FAILED" }, { status: 500 });
  }
}
