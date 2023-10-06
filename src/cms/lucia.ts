// lucia.ts
import { lucia } from "lucia";
import { d1 } from "@lucia-auth/adapter-sqlite";
import { web } from "lucia/middleware";
import { Bindings } from "./types/bindings";
import { Context } from "hono";
import { getD1Binding } from "./util/d1-binding";
import { insertRecord } from "./data/data";

export const initializeLucia = (db: D1Database, env) => {
  const auth = lucia({
    env: env.ENVIRONMENT === "development" ? "DEV" : "PROD", // "PROD" if deployed to HTTPS,
    middleware: web(),
    sessionCookie: {
      expires: false,
    },
    adapter: d1(db, {
      key: "user_keys",
      user: "users",
      session: "user_sessions",
    }),
    getUserAttributes: (data) => {
      return {
        email: data.email,
      };
    },
  });
  return auth;
};
export type LuciaAPIArgs = {
  ctx: Context<
    {
      Bindings: Bindings;
    },
    `/${string}`,
    {}
  >;
  content: any;
  table: string;
  route: string;
};
export const createUser = async (args: LuciaAPIArgs) => {
  const { ctx, content, table, route } = args;
  const kv = ctx.env.KVDATA;
  const d1 = getD1Binding(ctx);
  const auth = initializeLucia(d1, ctx.env);

  const email: string | undefined = content.data?.email;
  const password = content.data?.password;
  delete content.data?.password;
  await insertRecord(d1, kv, content, true);
  if (!email?.includes("@")) {
    return ctx.text("invalid email", 400);
  } else if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 255
  ) {
    console.log({ password });
    return ctx.text("invalid password", 400);
  }

  const user = await auth.createUser({
    key: {
      providerId: "email",
      providerUserId: email.toLowerCase(),
      password, // hashed by lucia
    },
    attributes: {
      email,
    },
  });
  const session = await auth.createSession({
    userId: user.userId,
    attributes: {},
  });

  console.log("Create user", user, session);
  return new Response(user, {
    headers: {
      Authorization: `Bearer ${session.sessionId}`,
      "Content-Type": "application/json",
    },
  });
};

export type Auth = ReturnType<typeof initializeLucia>;
