export type Bindings = {
  USERNAME: string;
  PASSWORD: string;
  ASSETS: string;
  KVDATA: KVNamespace;
  D1DATA: D1Database;
  R2_BUCKET: R2_BUCKET;
  __D1_BETA__D1DATA: D1Database;
};

declare global {
  function getMiniflareBindings(): Bindings;
}
