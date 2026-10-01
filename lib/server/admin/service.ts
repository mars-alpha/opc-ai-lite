import "server-only";

import type { AuthUser } from "../auth/service";

function adminEmails() {
  return new Set(
    (process.env.OPC_ADMIN_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isBootstrapAdminEmail(email: string) {
  return adminEmails().has(email.trim().toLowerCase());
}

export function isAdminUser(user: AuthUser | null) {
  return Boolean(user && (user.role === "ADMIN" || isBootstrapAdminEmail(user.email)));
}

export function requireAdminUser(user: AuthUser | null) {
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!isAdminUser(user)) throw new Error("FORBIDDEN");
  return user;
}
