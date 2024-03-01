export type Bindings = {
  USERNAME: string;
  PASSWORD: string;
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  KVDATA: KVNamespace;
  D1DATA: D1Database;
  __D1_BETA__D1DATA: D1Database;
  AUTH_ITERATIONS?: string;
  AUTH_HASH?: 'SHA512' | 'SHA384' | 'SHA256';
  AUTH_KDF?: 'pbkdf2' | 'scrypt';
  ENVIRONMENT?: 'production' | 'development';
  R2STORAGE?: R2Bucket;
};

declare global {
  function getMiniflareBindings(): Bindings;
  const ENVIRONMENT: string;
}
