var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");

var axios = require("axios");
var axiosInstance;

module.exports = appAnalyticsMainService = {
  startup: async function (app) {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "APP-ANALYTICS") {
        options.moduleName = "app-analytics";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("postPageRender", async function (options) {
      appAnalyticsMainService.trackEventSend({
        eventName: "page_load",
        url: options.page.data.url,
      });
    });

    emitterService.on("postAdminPageRender", async function (options) {
      appAnalyticsMainService.trackEventSend({
        eventName: "admin_page_load",
        url: options.req.url,
      });
    });

    emitterService.on("firstPageLoaded", async function (options) {
      let pageCount = await dataService.getContentByType("page", 0);
      appAnalyticsMainService.trackEventSend({
        eventName: "startup",
        pageCount: pageCount.length,
      });
    });

    app.post(process.env.ANALYTICS_RECEIVE_URL, async function (req, res) {
      appAnalyticsMainService.processEvent(req.body);
      res.json({ ok: "ok" });
    });
  },

  trackEventSend: async function (data) {
    if (await appAnalyticsMainService.trackingEnabled()) {
      const { installId } = require("../../../data/config/installId.json");
      data.installId = installId;
      let axios = await appAnalyticsMainService.getAxios();
      let url =
        process.env.ANALYTICS_POST_URL ??
        "https://sonicjs.com/sonicjs-app-analytics";
      let result = axios.post(url, data);
    }
  },

  processEvent: async function (data) {
    let profileUrl = `/analytics/${data.installId}`;
    let profile = await dataService.getContentByUrl(profileUrl);
    let timeStamp = new Date().toISOString();

    if (!profile || profile.data.status === "Not Found") {
      let payload = {
        data: {
          contentType: "app-analytics",
          title: "app-analytics",
          url: profileUrl,
          installId: data.installId,
          firstSeenOn: timeStamp,
          events: [],
          pageCount: 0,
          pageVisits: 0,
          adminPageVisits: 0,
          bootCount: 1,
        },
      };
      profile = await dataService.contentCreate(payload, false, 0);
    }

    if (profile && profile.data.events) {
      if (data.eventName == "startup") {
        profile.data.pageCount = data.pageCount;

        profile.data.events.push({
          name: data.eventName,
          timeStamp: timeStamp,
        });
      }

      if (data.eventName === "page_load") {
        profile.data.events.push({
          name: data.eventName,
          timeStamp: timeStamp,
          url: data.url,
        });

        profile.data.pageVisits += 1;
      }

      if (data.eventName === "admin_page_load") {
        profile.data.events.push({
          name: data.eventName,
          timeStamp: timeStamp,
          url: data.url,
        });

        profile.data.adminPageVisits += 1;
      }

      profile = await dataService.editInstance(profile, 0);
    }
  },

  getEmail: async function (req) {
    if (req.user && req.user.username) {
      return req.user.username;
    }
  },

  trackingEnabled: async function (host) {
    if (
      process.env.LOCAL_ANALYTICS &&
      process.env.LOCAL_ANALYTICS.toLowerCase() === "false"
    ) {
      return false;
    }
    if (host.indexOf("localhost") > -1) {
      return true;
    }
    return false;
  },

  getAxios: async function () {
    if (!appAnalyticsMainService.axiosInstance) {
      const defaultOptions = {
        headers: {},
        baseURL: globalService.baseUrl,
      };

      appAnalyticsMainService.axiosInstance = axios.create(defaultOptions);
    }
    return appAnalyticsMainService.axiosInstance;
  },
};
