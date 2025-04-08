import {
  createSession,
  generateSessionToken,
  invalidateUserSessions,
} from "./sessions";
import { eq } from "drizzle-orm";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { table as userTable } from "@schema/users";
import { compareStringToHash } from "./cyrpt";

export const login = async (
  d1,
  email: string,
  password: string
): Promise<object> => {
  const db = drizzle(d1);

  const record = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));
  const user = record[0];

  let userPassword = user?.password;
  if (!user) {
    return null;
  }
  const isPasswordCorrect = await compareStringToHash(password, userPassword);

  if (isPasswordCorrect) {
    console.log("password correct for ", user.email);
    const token = generateSessionToken();
    // TODO: invalidate all user sessions could be async if we send session id that we don't want to invalidate
    await invalidateUserSessions(d1, user.id);

    const session = await createSession(d1, token, user.id);

    return { bearer: token, expires: session.activeExpires };
  }else{
    console.log("login failed, password incorrect for ", user.email);

  }
};

export const doesAdminAccountExist = async (d1): Promise<boolean> => {
  const db = drizzle(d1);

  let record;
  try {
    record = await db
      .select()
      .from(userTable)
      .where(eq(userTable.role, "admin"));
  } catch (error) {
    console.error("\x1b[31m\x1b[1m\n\n\nSonicJs Error checking for admin account. Please ensure that your database has been created, tables exist, and that your wrangler.toml (if local) or you variables are set (if on cloudflare). \n\nAlso make sure that you have run the migrations per the readme (for local) and the docs (for cloudflare) https://sonicjs.com/deploy.\n\n\n\x1b[0m", error);
    throw error;
  }
  const adminUser = record[0];

  if (!adminUser) {
    return false;
  }
  return true;
};
