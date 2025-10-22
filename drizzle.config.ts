// drizzle.config.ts
import type { Config } from "drizzle-kit";

// Use better-sqlite driver for local development
export default {
	schema: "./src/custom/custom.config.ts",
	out: "./migrations",
	dialect: "sqlite",
	driver: "d1-http"
} satisfies Config
