var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var helperService = require("../../../services/helper.service");

var moment = require("moment");
var _ = require("underscore");

module.exports = proposalMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "PROPOSAL") {
        options.moduleName = "proposal";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name === "PROPOSAL") {
        await proposalMainService.getViewData(options);
      }
    });
  },

  getViewData: async function (options) {
    let proposals = await dataService.getContentByContentType("proposal");

    const now = new Date().getTime();
    console.log("non", now);

    proposals.map((p) => {
      p.data.ticks = new Date(p.data.expires).getTime();
      p.data.remainingDays =
        moment(p.data.expires, "YYYYMMDD").fromNow(true) + " left to vote";
      console.log(p.data.remainingDays);
      p.data.preview = helperService.truncateString(p.data.body, 85);
    });

    proposals = _.sortBy(proposals, function (p) {
      return p.data.ticks;
    });

    options.viewModel.openProposals = proposals.filter(
      (p) => p.data.approved && p.data.ticks > now
    );

    // proposals.map((p) => {
    //     console.log(p.data.ticks, p.data.expires);
    //   });

    options.viewModel.closedProposals = proposals.filter(
      (p) => p.data.ticks < now
    );

    options.viewModel.pendingProposals = proposals.filter(
      (p) => p.data.approved === false
    );
  },
};
