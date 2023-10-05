// lucia.ts
import { lucia } from "lucia";
import { d1 } from "@lucia-auth/adapter-sqlite";
import { web } from "lucia/middleware";

const env = getMiniflareBindings();

console.log({ env, ENVIRONMENT });
const auth = lucia({
  env: ENVIRONMENT === "development" ? "DEV" : "PROD", // "PROD" if deployed to HTTPS,
  middleware: web(),
  sessionCookie: {
    expires: false,
  },
  adapter: d1(env.D1DATA ?? env.__D1_BETA__D1DATA, {
    key: "user_keys",
    user: "user",
    session: "user_sessions",
  }),
});
export type Auth = typeof auth;
