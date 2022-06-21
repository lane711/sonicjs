var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");

var moment = require("moment");
var _ = require("underscore");

module.exports = announcementMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "ANNOUNCEMENT") {
        options.moduleName = "announcement";
        await moduleService.processModuleInColumn(options);
      }
    });
    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name === "ANNOUNCEMENT") {
        await announcementMainService.getViewData(options);
      }
    });
  },

  getViewData: async function (options) {


    let id = options.shortcode.properties.id;
    let groupId = options.req.content ? options.req.content.id : null;

    let announcements = await dataService.getContentByTypeAndGroup(
        'announcement',
        groupId,
        options.req.sessionID
      );



    // let announcements = await dataService.getContentByContentType(
    //   "announcement"
    // );

    const now = new Date().getTime();

    announcements = _.sortBy(announcements, function (p) {
      return p.data.date;
    }).reverse();

    announcements.map((a) => {
      a.data.dateFormatted = moment(a.data.date).format("MMMM Do YYYY, h:mm a");
    });

    options.viewModel.items = announcements;

    //emit so we can talley votes
    await emitterService.emit("postModuleGetData2", options);

  },


};
