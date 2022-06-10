var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = aaCypressModuleMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'AA-CYPRESS-MODULE') {

                options.moduleName = 'aa-cypress-module';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

