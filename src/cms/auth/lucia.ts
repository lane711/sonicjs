import { LuciaError, lucia } from "lucia";
import { d1 } from "@lucia-auth/adapter-sqlite";
import { hono } from "lucia/middleware";
import { Bindings } from "../types/bindings";
import { Context } from "hono";
import { prepareD1Data } from "../data/d1-data";
import { v4 as uuidv4 } from "uuid";
import { sonicAdapter } from "./sonicAdapter";
import { Variables } from "../../server";

export type Session = {
  user: any;
};

async function hashPassword(
  password: string,
  salt: Uint8Array,
  iterations = 100000
) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const importedKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const hashedPassword = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations,
      hash: "SHA-256",
    },
    importedKey,
    { name: "HMAC", hash: "SHA-1" },
    true,
    ["sign", "verify"]
  );

  let exportedKey = await crypto.subtle.exportKey("raw", hashedPassword);
  let uint8Array = new Uint8Array(exportedKey);
  let decoder = new TextDecoder();
  let hash = decoder.decode(uint8Array);
  return hash;
}
function getIterations(env) {
  let iterations = 100000;
  if (env.AUTH_ITERATIONS) {
    try {
      iterations = +env.AUTH_ITERATIONS;
    } catch (e) {
      console.error("failed to parse AUTH_ITERATIONS", e);
    }
  }
  return Math.min(iterations, 100000);
}
export const initializeLucia = (db: D1Database, env) => {
  const d1Adapter = d1(db, {
    key: "user_keys",
    user: "users",
    session: "user_sessions",
  });

  const auth = lucia({
    env: env.ENVIRONMENT === "development" ? "DEV" : "PROD", // "PROD" if deployed to HTTPS,
    middleware: hono(),
    adapter: sonicAdapter(d1Adapter, env.KVDATA),
    getUserAttributes: (data) => {
      return {
        email: data.email,
        role: data.role,
      };
    },
    passwordHash: {
      async generate(userPassword) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const secret = env.AUTH_SECRET || "";

        const hash = await hashPassword(
          userPassword + secret,
          salt,
          getIterations(env)
        );
        return `${hash}$${salt}`;
      },
      async validate(userPassword, hash) {
        const [hashedPassword, saltString] = hash.split("$");
        const salt = new Uint8Array(saltString.split(",").map(Number));
        const secret = env.AUTH_SECRET || "";
        const verifyHash = await hashPassword(
          userPassword + secret,
          salt,
          getIterations(env)
        );
        return hashedPassword === verifyHash;
      },
    },
  });
  return auth;
};
export type LuciaAPIArgs<T extends string> = {
  ctx: Context<
    {
      Bindings: Bindings;
      Variables: Variables;
    },
    T,
    {}
  >;
  content?: any;
};
export async function createUser<T extends string>(args: LuciaAPIArgs<T>) {
  const { ctx, content } = args;
  if (ctx && content) {
    const d1 = ctx.env.D1DATA;
    const auth = initializeLucia(d1, ctx.env);

    const email = content.data?.email;

    const password = content.data?.password;
    delete content.data?.password;
    const id = uuidv4();
    content.data.id = id;
    const d1Data = prepareD1Data(content.data);
    if (typeof email !== "string" || !email?.includes("@")) {
      return ctx.text("invalid email", 400);
    } else if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 255
    ) {
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
    return ctx.json({ user });
  }
  return new Response("Invalid request", { status: 400 });
}

export async function deleteUser<T extends string>(
  args: LuciaAPIArgs<T>,
  id: string
) {
  const { ctx } = args;
  const d1 = ctx.env.D1DATA;
  const auth = initializeLucia(d1, ctx.env);
  try {
    await auth.deleteUser(id);
    return ctx.text("", 204);
  } catch (e) {
    if (e instanceof LuciaError && e.message === "AUTH_INVALID_KEY_ID") {
      return ctx.text("", 404);
    }
    return ctx.text("", 500);
  }
}

export async function updateUser<T extends string>(
  args: LuciaAPIArgs<T>,
  id: string
) {
  const { ctx, content } = args;
  const user = ctx.get("user");
  if (ctx && content && id) {
    const d1 = ctx.env.D1DATA;
    const auth = initializeLucia(d1, ctx.env);
    const authRequest = ctx.get("authRequest");

    const email = content.data?.email;
    const password = content.data?.password;
    delete content.data?.password;
    const d1Data = prepareD1Data(content.data, "users");
    if (email && (typeof email !== "string" || !email?.includes("@"))) {
      return ctx.text("invalid email", 400);
    } else if (
      password &&
      (typeof password !== "string" ||
        password.length < 8 ||
        password.length > 255)
    ) {
      return ctx.text("invalid password", 400);
    }

    await auth.updateUserAttributes(id, {
      ...d1Data,
    });

    if (password) {
      let hasKey = false;
      try {
        hasKey = !!(await auth.getKey("email", email.toLowerCase()));
      } catch (e) {
        hasKey = false;
      }
      if (hasKey) {
        await auth.updateKeyPassword("email", email.toLowerCase(), password);
      } else {
        await auth.createKey({
          userId: id,
          providerId: "email",
          providerUserId: email.toLowerCase(),
          password,
        });
      }
    }

    let session = ctx.get("session");
    if (password || d1Data.role) {
      await auth.invalidateAllUserSessions(id);
      if (user.userId === id) {
        session = await auth.createSession({
          userId: id,
          attributes: {},
        });
      } else {
        session = null;
      }
    }

    if (authRequest) {
      authRequest.setSession(session);
    }
    ctx.header("Authorization", `Bearer ${session.sessionId}`);
    return ctx.json({ bearer: session.sessionId });
  }
  return new Response("Invalid request", { status: 400 });
}

export async function login<T extends string>(args: LuciaAPIArgs<T>) {
  const { ctx, content } = args;
  const d1 = ctx.env.D1DATA;
  const auth = initializeLucia(d1, ctx.env);
  const email = content?.email;
  const password = content?.password;
  const authRequest = ctx.get("authRequest");
  try {
    // find user by key
    // and validate password
    const key = await auth.useKey("email", email.toLowerCase(), password);
    const session = await auth.createSession({
      userId: key.userId,
      attributes: {},
    });
    if (authRequest) {
      authRequest.setSession(session);
    }
    ctx.header("Authorization", `Bearer ${session.sessionId}`);

    return ctx.json({ bearer: session.sessionId });
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

export async function logout<T extends string>(ctx: LuciaAPIArgs<T>["ctx"]) {
  const d1 = ctx.env.D1DATA;
  const auth = initializeLucia(d1, ctx.env);
  const authRequest = ctx.get("authRequest");
  try {
    const sessionId = ctx.get("session")?.sessionId;
    if (sessionId) {
      await auth.invalidateSession(sessionId);
    }
    if (authRequest) {
      authRequest.setSession(null);
    }
    return ctx.redirect("/admin/login");
  } catch (e) {
    return new Response("An unknown error occurred", {
      status: 500,
    });
  }
}

export type Auth = ReturnType<typeof initializeLucia>;
