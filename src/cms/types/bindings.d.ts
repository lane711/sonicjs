export type Bindings = {
  USERNAME: string;
  PASSWORD: string;
  ASSETS: string;
  KVDATA: KVNamespace;
  D1DATA: D1Database;
  R2_BUCKET: R2_BUCKET;
  __D1_BETA__D1DATA: D1Database;
  BUCKET_NAME: string;
  BUCKET_ACCESS_KEY_ID: string;
  BUCKET_SECRET_ACCESS_KEY: string;
  BUCKET_CUSTOM_DOMAIN: string;
  ACCOUNT_ID: string;
};

declare global {
  function getMiniflareBindings(): Bindings;
}
