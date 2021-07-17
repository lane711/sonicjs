var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");

module.exports = amplitudeMainService = {
  startup: async function() {
    emitterService.on("getRenderedPagePostDataFetch", async function(options) {
      if (options && options.page) {
        await amplitudeMainService.addHeaderJs(options);
      }
    });
  },

  addHeaderJs: async function(options) {
    let amplitudeSettings = await dataService.getContentTopOne("amplitude", options.req.sessionID);
    if (!options.page.data.headerJs) {
      options.page.data.headerJs = "";
    }

    if (amplitudeTrackingCode) {
      options.page.data.headerJs +=
        amplitudeSettings.data.amplitudeTrackingCode;
    }

    let params = {};
    if (options.page.data.contentType) {
      params.contentType = options.page.data.contentType;
    }
    if (options.page.data.title) {
      params.title = options.page.data.title;
    }

    options.page.data.headerJs += `<script>amplitude.getInstance().logEvent('PAGE_LOAD',${JSON.stringify(
      params
    )});</script>`;
  }
};
