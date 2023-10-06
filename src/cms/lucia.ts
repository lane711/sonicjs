// lucia.ts
import { LuciaError, lucia } from "lucia";
import { d1 } from "@lucia-auth/adapter-sqlite";
import { web } from "lucia/middleware";
import { Bindings } from "./types/bindings";
import { Context } from "hono";
import { getD1Binding } from "./util/d1-binding";
import { insertRecord } from "./data/data";
import { prepareD1Data } from "./data/d1-data";

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
export type LuciaAPIArgs<T extends string> = {
  ctx: Context<
    {
      Bindings: Bindings;
    },
    T,
    {}
  >;
  content: any;
};
export async function createUser<T extends string>(args: LuciaAPIArgs<T>) {
  const { ctx, content } = args;
  const kv = ctx.env.KVDATA;
  const d1 = getD1Binding(ctx);
  const auth = initializeLucia(d1, ctx.env);

  const email = content.data?.email;
  const password = content.data?.password;
  delete content.data?.password;
  const recordResult = await insertRecord(d1, kv, content, true);
  const d1Data = prepareD1Data(content.data);
  console.log({ recordResult });
  if (typeof email !== "string" || !email?.includes("@")) {
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
    attributes: d1Data,
  });
  const session = await auth.createSession({
    userId: user.userId,
    attributes: {},
  });

  return new Response(JSON.stringify(user), {
    headers: {
      Authorization: `Bearer ${session.sessionId}`,
      "Content-Type": "application/json",
    },
  });
}

export async function login<T extends string>(args: LuciaAPIArgs<T>) {
  const { ctx, content } = args;
  const d1 = getD1Binding(ctx);
  const auth = initializeLucia(d1, ctx.env);
  const email = content.data?.email;
  const password = content.data?.password;
  console.log("LOGIN", email, password);
  try {
    // find user by key
    // and validate password
    const key = await auth.useKey("email", email.toLowerCase(), password);
    const session = await auth.createSession({
      userId: key.userId,
      attributes: {},
    });
    return new Response(
      JSON.stringify({
        id: key.userId,
      }),
      {
        headers: {
          Authorization: `Bearer ${session.sessionId}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (e) {
    if (
      e instanceof LuciaError &&
      (e.message === "AUTH_INVALID_KEY_ID" ||
        e.message === "AUTH_INVALID_PASSWORD")
    ) {
      // user does not exist
      // or invalid password
      return new Response("Incorrect username or password", {
        status: 400,
      });
    }
    return new Response("An unknown error occurred", {
      status: 500,
    });
  }
}

export type Auth = ReturnType<typeof initializeLucia>;
