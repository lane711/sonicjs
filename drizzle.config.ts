// drizzle.config.ts
import type { Config } from "drizzle-kit";

const { LOCAL_DB_PATH, DB_ID, D1_TOKEN, CF_ACCOUNT_ID } = process.env;

console.log("LOCAL_DB_PATH", LOCAL_DB_PATH);

// Use better-sqlite driver for local development
export default LOCAL_DB_PATH
	? ({
			schema: "./src/custom/custom.config.ts",
			dialect: "sqlite",
			dbCredentials: {
				url: LOCAL_DB_PATH,
			},
		} satisfies Config)
	: ({
			schema: "./src/custom/custom.config.ts",
			out: "./migrations",
			dialect: "sqlite",
			driver: "d1-http",
			dbCredentials: {
				databaseId: DB_ID!,
				token: D1_TOKEN!,
				accountId: CF_ACCOUNT_ID!,
			},
		} satisfies Config);
