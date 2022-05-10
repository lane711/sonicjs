require("./app-analytics-main-service");
var dataService = require("../../../services/data.service");
var dalService = require("../../../services/dal.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var moment = require("moment");
var axios = require("axios");
var axiosInstance;
const _ = require("lodash");

module.exports = appAnalyticsReportService = {
  getAggregates: async function (sessionID) {
    let contents = await dataService.getContentByType(
      "app-analytics",
      sessionID
    );

    contents.forEach((log) => {
      if (log.data.firstSeenOn && log.data.lastSeenOn) {
        let age = moment(log.data.firstSeenOn).diff(
          log.data.lastSeenOn,
          "days"
        );
        log.data.age = age;
      } else {
        log.data.age = "?";
      }
    });

    let data = {};
    data.count = contents.length;
    data.installs = contents;
    return data;
  },

  getOptins: async function (sessionID) {
    let contents = await dataService.getContentByType(
      "app-analytics",
      sessionID
    );
    let optins = [];

    contents.map((log) => {
      if (log.data.emailOptin) {
        optins.push(log.data.email);
      }
    });

    const distinctOptins = _.uniqBy(optins, function (e) {
      return e;
    });

    return distinctOptins;
  },
};
