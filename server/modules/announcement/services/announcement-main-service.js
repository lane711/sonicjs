var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");

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
    let announcements = await dataService.getContentByContentType("announcement");

    const now = new Date().getTime();

    announcements = _.sortBy(announcements, function (p) {
      return p.data;
    });

    options.viewModel.items = announcements;

    await proposalMainService.processPagePermissions(options);
  },

  processPagePermissions: async function (options) {
    options.viewModel.canAdd = false;
    options.viewModel.canReview = false;
    options.viewModel.canEdit = false;
    options.viewModel.canVote = false;

    let userRole = options.req.user?.profile.roles[0];
    //TODO: need to check that club admin is for the current club(not just has the role)
    if (userRole === "communityAdmin" || userRole === "clubAdmin") {
      options.viewModel.canAdd = true;
      options.viewModel.canReview = true;
      options.viewModel.canEdit = true;
      options.viewModel.canVote = true;
    }

    if (userRole === "gm") {
      options.viewModel.canVote = true;
    }
  },
};
