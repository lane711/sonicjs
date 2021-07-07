var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = appAnalyticsMainService = {

    startup: async function (app) {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'APP-ANALYTICS') {

                options.moduleName = 'app-analytics';
                await moduleService.processModuleInColumn(options);
            }

        });

        app.get("/app1", async function (req, res) {
            res.json({});
          });
    },

    


}

