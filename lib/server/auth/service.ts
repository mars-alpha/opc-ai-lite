import "server-only";

import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { and, eq, gt } from "drizzle-orm";
import { getDatabase } from "../db";
import {
  sessions,
  userCredentials,
  userIdentities,
  users
} from "../db/schema";

const scrypt = promisify(scryptCallback);
export const SESSION_COOKIE = "opc_session";
const SESSION_DAYS = 30;

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
};

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validateRegistrationInput(input: {
  email?: unknown;
  password?: unknown;
  displayName?: unknown;
}) {
  const email = typeof input.email === "string" ? normalizeEmail(input.email) : "";
  const password = typeof input.password === "string" ? input.password : "";
  const displayName =
    typeof input.displayName === "string" && input.displayName.trim()
      ? input.displayName.trim().slice(0, 80)
      : null;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new Error("INVALID_EMAIL");
  }
  if (password.length < 8 || password.length > 128) {
    throw new Error("INVALID_PASSWORD");
  }

  return { email, password, displayName };
}

async function hashPassword(password: string, salt?: Buffer) {
  const actualSalt = salt ?? randomBytes(16);
  const derived = (await scrypt(password, actualSalt, 64)) as Buffer;
  return {
    hash: derived.toString("base64"),
    salt: actualSalt.toString("base64")
  };
}

async function verifyPassword(password: string, hash: string, salt: string) {
  const actual = await hashPassword(password, Buffer.from(salt, "base64"));
  const expectedBuffer = Buffer.from(hash, "base64");
  const actualBuffer = Buffer.from(actual.hash, "base64");
  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function registerUser(input: {
  email?: unknown;
  password?: unknown;
  displayName?: unknown;
}): Promise<AuthUser> {
  const { email, password, displayName } = validateRegistrationInput(input);
  const db = getDatabase();

  const existing = await db
    .select({ id: userIdentities.id })
    .from(userIdentities)
    .where(
      and(
        eq(userIdentities.provider, "EMAIL"),
        eq(userIdentities.providerUserId, email)
      )
    )
    .limit(1);

  if (existing.length) throw new Error("EMAIL_EXISTS");

  const credential = await hashPassword(password);

  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ displayName })
        .returning({ id: users.id, displayName: users.displayName });

      await tx.insert(userIdentities).values({
        userId: user.id,
        provider: "EMAIL",
        providerUserId: email
      });

      await tx.insert(userCredentials).values({
        userId: user.id,
        passwordHash: credential.hash,
        passwordSalt: credential.salt
      });

      return { id: user.id, email, displayName: user.displayName };
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      throw new Error("EMAIL_EXISTS");
    }
    throw error;
  }
}

export async function loginUser(input: {
  email?: unknown;
  password?: unknown;
}): Promise<AuthUser> {
  const email = typeof input.email === "string" ? normalizeEmail(input.email) : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (!email || !password) throw new Error("INVALID_CREDENTIALS");

  const db = getDatabase();
  const [row] = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      passwordHash: userCredentials.passwordHash,
      passwordSalt: userCredentials.passwordSalt
    })
    .from(userIdentities)
    .innerJoin(users, eq(userIdentities.userId, users.id))
    .innerJoin(userCredentials, eq(userCredentials.userId, users.id))
    .where(
      and(
        eq(userIdentities.provider, "EMAIL"),
        eq(userIdentities.providerUserId, email)
      )
    )
    .limit(1);

  if (!row || !(await verifyPassword(password, row.passwordHash, row.passwordSalt))) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return { id: row.id, email, displayName: row.displayName };
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await getDatabase().insert(sessions).values({
    userId,
    tokenHash,
    expiresAt
  });

  return { token, expiresAt };
}

export async function getSessionUser(token: string | null): Promise<AuthUser | null> {
  if (!token) return null;
  const db = getDatabase();
  const tokenHash = hashSessionToken(token);

  const [row] = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      email: userIdentities.providerUserId
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .innerJoin(
      userIdentities,
      and(
        eq(userIdentities.userId, users.id),
        eq(userIdentities.provider, "EMAIL")
      )
    )
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return row ?? null;
}

export async function deleteSession(token: string | null) {
  if (!token) return;
  await getDatabase()
    .delete(sessions)
    .where(eq(sessions.tokenHash, hashSessionToken(token)));
}

export function readSessionToken(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const pair = cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(SESSION_COOKIE + "="));
  return pair ? decodeURIComponent(pair.slice(SESSION_COOKIE.length + 1)) : null;
}

export async function requireSessionUser(request: Request) {
  const user = await getSessionUser(readSessionToken(request));
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  };
}

