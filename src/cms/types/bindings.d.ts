export type Bindings = {
  USERNAME: string;
  PASSWORD: string;
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  KVDATA: KVNamespace;
  D1DATA: D1Database;
  __D1_BETA__D1DATA: D1Database;
  useAuth?: string;
  AUTH_SECRET?: string;
  AUTH_ITERATIONS?: string;
};

declare global {
  function getMiniflareBindings(): Bindings;
  const ENVIRONMENT: string;
}
