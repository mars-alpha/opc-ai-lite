import { NextResponse } from "next/server";
import {
  createSession,
  loginUser,
  SESSION_COOKIE,
  sessionCookieOptions
} from "../../../../lib/server/auth/service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  try {
    const user = await loginUser(body ?? {});
    const session = await createSession(user.id);
    const response = NextResponse.json({ user });
    response.cookies.set(
      SESSION_COOKIE,
      session.token,
      sessionCookieOptions(session.expiresAt)
    );
    return response;
  } catch (error) {
    const code = error instanceof Error ? error.message : "LOGIN_FAILED";
    if (code === "INVALID_CREDENTIALS") {
      return NextResponse.json({ error: code }, { status: 401 });
    }
    console.error("[OPC AI] login failed", error);
    return NextResponse.json({ error: "LOGIN_FAILED" }, { status: 500 });
  }
}

