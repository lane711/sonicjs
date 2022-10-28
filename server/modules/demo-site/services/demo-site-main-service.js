var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = demoSiteMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'DEMO-SITE') {

                options.moduleName = 'demo-site';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

