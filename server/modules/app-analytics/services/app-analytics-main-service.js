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
      appAnalyticsMainService.trackEventSend(options);
    });

    emitterService.on("startup", async function (options) {
      appAnalyticsMainService.trackEventSend(options);
    });

    app.post(process.env.ANALYTICS_RECEIVE_URL, async function (req, res) {
      appAnalyticsMainService.processEvent(req.body);
      res.json({ ok: "ok" });
    });
  },

  trackEventSend: async function (options) {
    const installId = require("../../../data/config/installId.json");

    let data = {
      installId: installId.installId,
      eventName: "page_load",
      url: options.page.data.url,
      timestamp: Date.now(),
    };

    let axios = await appAnalyticsMainService.getAxios();

    let result = axios.post(process.env.ANALYTICS_POST_URL, data);
  },

  processEvent: async function (data) {
    let profileUrl = `/analytics/${data.installId}`;
    let profile = await dataService.getContentByUrl(profileUrl);

    if (!profile || profile.data.status === "Not Found") {
      let payload = {
        data: {
          contentType: "app-analytics",
          url: profileUrl,
          installId: data.installId,
          firstSeenOn: data.timestamp,
          events: []
        },
      };
      profile = await dataService.contentCreate(payload, false, "anonymous");
    } else{
      profile.events.push({name: data.eventName, timestamp: data.timestamp, url: data.url});
      profile = await dataService.editInstance(payload, "anonymous");
    }
    // if (!mixpanel) {
    //   return;
    // }

    // let enabled = await appAnalyticsMainService.trackingEnabled(
    //   req.headers.host
    // );
    // if (!enabled) {
    //   return;
    // }

    // let email;
    // email = await appAnalyticsMainService.getEmail(req);

    // //add app version
    // data.appVersion = globalService.getAppVersion();

    // mixpanel.track(eventName, {
    //   $email: email,
    //   distinct_id: email,
    //   data: data,
    // });

    // if (email) {
    // if (eventName === "PAGE_LOAD") {
      // mixpanel.people.increment(email, "page_viewed");
    // } else if (eventName === "PAGE_LOAD_ADMIN") {
      // mixpanel.people.increment(email, "page_viewed_admin");
      //   }
    // }
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
    //TODO add auth
    // debugger;
    if (!appAnalyticsMainService.axiosInstance) {
      // if (true) {

      const defaultOptions = {
        headers: {},
        baseURL: globalService.baseUrl,
      };

      //   let token = helperService.getCookie("sonicjs_access_token");
      //   if (token) {
      //     defaultOptions.headers.Authorization = token;
      //   }

      appAnalyticsMainService.axiosInstance = axios.create(defaultOptions);
    }
    // debugger;
    return appAnalyticsMainService.axiosInstance;
  },
};
