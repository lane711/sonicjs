/// <reference types="astro/client" />

type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type ENV = {
  // replace `MY_KV` with your KV namespace
  //   MY_KV: KVNamespace;
  D1: D1Namespace;
  R2: R2Namespace;
  KV: KVNamespace;
};

// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
  interface Locals extends Runtime {
    session: import("./lib/server/session").Session | null;
		user: import("./lib/server/session").User | null;
  }
}

// /// <reference path="../.astro/types.d.ts" />
// /// <reference types="astro/client" />

// type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

// declare namespace App {
// 	interface Locals extends Runtime { user: {} }
// }
