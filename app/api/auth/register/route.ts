import { NextResponse } from "next/server";
import {
  createSession,
  registerUser,
  SESSION_COOKIE,
  sessionCookieOptions
} from "../../../../lib/server/auth/service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  try {
    const user = await registerUser(body ?? {});
    const session = await createSession(user.id);
    const response = NextResponse.json({ user });
    response.cookies.set(
      SESSION_COOKIE,
      session.token,
      sessionCookieOptions(session.expiresAt)
    );
    return response;
  } catch (error) {
    const code = error instanceof Error ? error.message : "REGISTER_FAILED";
    const status =
      code === "EMAIL_EXISTS" ? 409 :
      code === "INVALID_EMAIL" || code === "INVALID_PASSWORD" ? 400 :
      500;

    if (status === 500) console.error("[OPC AI] registration failed", error);
    return NextResponse.json({ error: code }, { status });
  }
}

