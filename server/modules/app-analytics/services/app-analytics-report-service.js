require("./app-analytics-main-service");
var dataService = require("../../../services/data.service");
var dalService = require("../../../services/dal.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var moment = require('moment');
var axios = require("axios");
var axiosInstance;

module.exports = appAnalyticsReportService = {
  getAggregates: async function (sessionID) {
    let contents = await dataService.getContentByType(
      "app-analytics",
      sessionID
    );

    contents.forEach(log => {
      if(log.data.firstSeenOn && log.data.lastSeenOn){
        let age = moment(log.data.firstSeenOn).diff(log.data.lastSeenOn,'days');
        log.data.age = age;
      }else{
        log.data.age='?'
      }
    });

    let data = {};
    data.count = contents.length;
    data.installs = contents;
    return data;
  },
};
 