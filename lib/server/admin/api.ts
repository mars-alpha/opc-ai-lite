import { NextResponse } from "next/server";
import { getSessionUser, readSessionToken } from "../auth/service";
import { requireAdminUser } from "./service";

export async function requireAdminRequest(request: Request) {
  const user = await getSessionUser(readSessionToken(request));
  return requireAdminUser(user);
}

export function adminAuthError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHENTICATED") {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  return null;
}

export function contentWorkbenchError(error: unknown, fallback: string) {
  const auth = adminAuthError(error);
  if (auth) return auth;
  const code = error instanceof Error ? error.message : fallback;
  if (code.endsWith("_NOT_FOUND")) return NextResponse.json({ error: code }, { status: 404 });
  if (
    code.startsWith("INVALID_") ||
    code === "CONTENT_EVIDENCE_REQUIRED" ||
    code === "CONTENT_VERIFIED_EVIDENCE_REQUIRED"
  ) {
    return NextResponse.json({ error: code }, { status: 400 });
  }
  if (
    code === "CONTENT_NOT_REVIEW_READY" ||
    code === "CONTENT_APPROVAL_REQUIRED" ||
    code === "CONTENT_REVIEW_STALE" ||
    code === "CONTENT_ALREADY_PUBLISHED" ||
    code === "CONTENT_PUBLISHED_IMMUTABLE" ||
    code === "CONTENT_ARCHIVED_IMMUTABLE"
  ) {
    return NextResponse.json({ error: code }, { status: 409 });
  }
  return null;
}
