import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    databaseId: '874cad37-313c-4d71-97fa-ad7184526f5a',
    token: process.env.CLOUDFLARE_API_TOKEN!,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  },
} satisfies Config;