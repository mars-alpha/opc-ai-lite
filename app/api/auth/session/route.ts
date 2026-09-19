import { NextResponse } from "next/server";
import {
  getSessionUser,
  readSessionToken
} from "../../../../lib/server/auth/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getSessionUser(readSessionToken(request));
  return NextResponse.json({
    authenticated: Boolean(user),
    user
  });
}

