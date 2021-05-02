var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');
var formService = require("../../../services/form.service");

module.exports = commentMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'COMMENT') {

                options.moduleName = 'comment';
                await moduleService.processModuleInColumn(options);
            }

        });

        emitterService.on("postModuleGetData", async function (options) {
            if (options.shortcode.name !== "COMMENT") {
              return;
            }
      
            options.viewModel.data.form = await formService.getForm(
              "comment",
              undefined,
              "submitForm(submission)"
            );
      
          });
    },

}

