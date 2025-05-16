import {
  createSession,
  generateSessionToken,
  invalidateUserSessions,
} from "./sessions";
import { eq } from "drizzle-orm";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { table as userTable } from "@schema/users";
import { compareStringToHash } from "./cyrpt";
import { updateRecord } from "./data";
import { sendEmailConfirmationEmail } from "./email";

export const login = async (
  d1,
  email: string,
  password: string,
  otp: string,
  context: any
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

  let isPasswordCorrect = false;
  let isOTPCorrect = false;
  let error = null;

  if (password) {
    isPasswordCorrect = await compareStringToHash(
      password,
      userPassword as string
    );
    if(!isPasswordCorrect) {
      error = "Email/Password combination invalid";
      console.log("password incorrect for ", user.email );
    }
  }
  if (otp && !password) {
    isOTPCorrect = otp === user.passwordOTP;
    // Check if OTP is expired by comparing current time with OTP timestamp
    if (user.passwordOTPExpiresOn) {
      const otpExpirationTime = context.locals.runtime.env.ONE_TIME_PASSWORD_EXPIRATION_TIME;
      const now = Date.now();
      const otpTimestamp = new Date(user.passwordOTPExpiresOn).getTime();
      if (now - otpTimestamp > otpExpirationTime) {
        isOTPCorrect = false;
        error = "OTP Expired";
        console.log("OTP expired for", user.email);
      }
    }
    if (isOTPCorrect) {
      console.log("otp correct for ", user.email);
      // invalidate the otp so user can only use it once
      const updated = await updateRecord(
        context.locals.runtime.env.D1,
        {},
        {
          table: "users",
          id: user.id,
          data: {
            passwordOTP: null,
            passwordOTPExpiresOn: null,
          },
        },
        {}
      );
    } else {
      console.log("otp incorrect for ", user.email);
      error = "OTP Not Valid";

    }
  }

  if (isPasswordCorrect || isOTPCorrect) {
    console.log("password or otp correct for ", user.email);
    const token = generateSessionToken();
    const invalidateUserSessionsOption =
      context.locals.runtime.env.INVALIDATE_USER_SESSIONS === "true"
        ? true
        : false;
    if (invalidateUserSessionsOption) {
      // TODO: invalidate all user sessions could be async if we send session id that we don't want to invalidate
      await invalidateUserSessions(d1, user.id);
    }

    const session = await createSession(d1, token, user.id as string);

    return { bearer: token, expires: session.activeExpires };
  } else {
    console.log("login failed, password incorrect for ", user.email);
    return { error };
  }
};

export const doesEmailExist = async (d1, email: string): Promise<{exists: boolean, confirmed: boolean}> => {
  const db = drizzle(d1);

  let record;
  try {
    record = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));
  } catch (error) {
    throw error;
  }
  const user = record[0];

  if (!user) {
    return {exists: false, confirmed: false};
  }
  const confirmed = user.confirmed;
  return {exists: true, confirmed};
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
    console.error(
      "\x1b[31m\x1b[1m\n\n\nSonicJs Error checking for admin account. Please ensure that your database has been created, tables exist, and that your wrangler.toml (if local) or you variables are set (if on cloudflare). \n\nAlso make sure that you have run the migrations per the readme (for local) and the docs (for cloudflare) https://sonicjs.com/deploy.\n\n\n\x1b[0m",
      error
    );
    throw error;
  }
  const adminUser = record[0];

  if (!adminUser) {
    return false;
  }
  return true;
};

export const sendEmailConfirmation = async (context, email: string) => {
  const db = drizzle(context.locals.runtime.env.D1);

  const emailConfirmationToken = crypto.randomUUID();

  const user = await db.select().from(userTable).where(eq(userTable.email, email));

  //user should not exist
  if (user.length > 0 && user[0].emailConfirmedOn) {
    throw new Error("User already confirmed");
  }

  await sendEmailConfirmationEmail(context, user[0], emailConfirmationToken);
  
};



