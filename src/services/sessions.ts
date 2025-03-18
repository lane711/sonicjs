// import { db, userSessions } from "./db.js";
import { table as userTable } from "@schema/users";
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
import { getRepoFromTable } from "./d1-data";
import { tableSchemas } from "db/routes";

// import type { User, Session } from "./db.js";

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
    console.error('error', error);
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
    .select({ user: tableSchemas.users.table, session: tableSchemas.userSessions.table })
    .from(tableSchemas.userSessions.table)
    .innerJoin(tableSchemas.users.table, eq(tableSchemas.userSessions.table.userId, tableSchemas.users.table.id))
    .where(eq(tableSchemas.userSessions.table.id, sessionId));

  if (result.length < 1) {
    return { session: null, user: null };
  }
  const { user, session } = result[0];
  delete user.password;
  user.profile = user.profile ? JSON.parse(user.profile) : {};
  
  if (Date.now() >= session.activeExpires) {
    await db.delete(userSessions).where(eq(userSessions.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.activeExpires - 1000 * 60 * 60 * 24 * 15) {
    session.activeExpires = Date.now() + 1000 * 60 * 60 * 24 * 30;
    await db
      .update(userSessions)
      .set({
        activeExpires: session.activeExpires,
      })
      .where(eq(userSessions.id, session.id));
  }
  return { session, user };
}

export async function invalidateSession(
  d1: D1Database,
  sessionId: string
): Promise<void> {
  const db = drizzle(d1);
  const schema = getRepoFromTable('userSessions');
  await db.delete(userSessions).where(eq(userSessions.id, sessionId));
}

export async function invalidateUserSessions(
  d1: D1Database,
  userId: string
): Promise<void> {
  const db = drizzle(d1);
  const schema = getRepoFromTable('userSessions');
  await db.delete(userSessions).where(eq(userSessions.userId, userId));
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
