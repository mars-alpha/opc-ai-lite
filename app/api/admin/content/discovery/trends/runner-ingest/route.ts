import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { error: "LOGIN_BROWSER_RUNNER_RETIRED_USE_SERVER_DISCOVERY" },
    { status: 410 }
  );
}
