import { NextResponse } from "next/server";
import {
  clearRecentRuntimeTimings,
  getRecentRuntimeTimings
} from "../../../../lib/server/runtime-performance";

export const dynamic = "force-dynamic";

function allowed() {
  return process.env.NODE_ENV !== "production" || process.env.OPC_RUNTIME_TIMING === "1";
}

export async function GET() {
  if (!allowed()) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ timings: getRecentRuntimeTimings() });
}

export async function DELETE() {
  if (!allowed()) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  clearRecentRuntimeTimings();
  return NextResponse.json({ ok: true });
}
