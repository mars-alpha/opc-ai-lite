import { NextResponse } from "next/server";
import {
  deleteSession,
  readSessionToken,
  SESSION_COOKIE,
  shouldUseSecureSessionCookie
} from "../../../../lib/server/auth/service";

export async function POST(request: Request) {
  await deleteSession(readSessionToken(request));
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureSessionCookie(),
    path: "/",
    expires: new Date(0)
  });
  return response;
}

