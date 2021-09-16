var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');
var formService = require('../../../services/form.service');

module.exports = newsletterMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'NEWSLETTER') {

                options.moduleName = 'newsletter';
                await moduleService.processModuleInColumn(options);
            }

        });

        emitterService.on("postModuleGetData", async function (options) {
            if (options.shortcode.name !== "NEWSLETTER") {
              return;
            }
      
            let contactFormSettingsId = options.shortcode.properties.id;
      
            options.viewModel.data.form = await formService.getForm(
              "newsletter",
              undefined,
              "submitForm(submission)",
              false,
              contactFormSettingsId,
              options.req.sessionID
            );
      
            // console.log('contact module after view model', options.viewModel);
          });
    },

}

