var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");

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
    options.viewModel.openProposals = proposals.filter(
      (p) => p.data.approved
    );
  },
};
