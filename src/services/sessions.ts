import type { User } from "@schema/users";
import { table as userSessions } from "@schema/userSessions";
import type { Session } from "@schema/userSessions";

import { eq } from "drizzle-orm";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { tableSchemas } from "@custom/custom.config";

// import type { User, Session } from "./db.js";

type SessionWithToken = Session & {
  token: string;
};

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  d1: D1Database,
  token: string,
  userId: string
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId: userId,
    idleExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).getTime(),
    activeExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).getTime(),
    createdOn: new Date(Date.now()).getTime(),
    updatedOn: new Date(Date.now()).getTime(),
  };

  const db = drizzle(d1);
  try {
    await db.insert(tableSchemas.userSessions.table).values(session);
  } catch (error) {
    console.error("error", error);
  }
  return session;
}

export async function validateSessionToken(
  d1: D1Database,
  token: string
): Promise<SessionValidationResult> {
  const db = drizzle(d1);
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const result = await db
    .select({
      user: tableSchemas.users.table,
      session: tableSchemas.userSessions.table,
    })
    .from(tableSchemas.userSessions.table)
    .innerJoin(
      tableSchemas.users.table,
      eq(tableSchemas.userSessions.table.userId, tableSchemas.users.table.id)
    )
    .where(eq(tableSchemas.userSessions.table.id, sessionId));

  if (result.length < 1) {
    return { session: null, user: null };
  }
  const { user, session } = result[0];
  delete user.password;
  user.profile = user.profile ? JSON.parse(user.profile as string) : {};
  delete session.id;
  const sessionWithToken: SessionWithToken = { ...session, token };

  if (Date.now() >= sessionWithToken.activeExpires) {
    await db.delete(userSessions).where(eq(userSessions.id, sessionWithToken.id));
    return { session: null, user: null };
  }
  if (Date.now() >= sessionWithToken.activeExpires - 1000 * 60 * 60 * 24 * 15) {
    sessionWithToken.activeExpires = Date.now() + 1000 * 60 * 60 * 24 * 30;
    await db
      .update(userSessions)
      .set({
        activeExpires: sessionWithToken.activeExpires,
      })
      .where(eq(userSessions.id, sessionWithToken.id));
  }
  return { session: sessionWithToken, user };
}

export async function invalidateSession(
  d1: D1Database,
  token: string
): Promise<void> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const db = drizzle(d1);
  await db
    .delete(userSessions)
    .where(eq(userSessions.id, sessionId));
}

export async function invalidateUserSessions(
  d1: D1Database,
  userId: string
): Promise<void> {
  const db = drizzle(d1);
  await db.delete(userSessions).where(eq(userSessions.userId, userId));
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
