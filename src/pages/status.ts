import { return200 } from "@services/return-types";

export const GET = async (context) => {
  const status = {
    webServer: "ok",
    d1: "ok",
    drizzle: "ok",
    kv: "ok",
    env: {
      ASSETS: {},
      CF_PAGES: "1",
      CF_PAGES_BRANCH: "main",
      CF_PAGES_COMMIT_SHA: "450099b920e1ea178a5bf0c48619c40d25ecd4ae",
      CF_PAGES_URL: "https://2c1d1144.sonicjs-emx.pages.dev",
      D1DATA: {
        fetcher: {},
      },
      KVDATA: {},
    },
  };
  return return200(status);
};
