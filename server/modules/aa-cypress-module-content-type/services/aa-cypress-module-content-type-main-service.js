var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = aaCypressModuleContentTypeMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'AA-CYPRESS-MODULE-CONTENT-TYPE') {

                options.moduleName = 'aa-cypress-module-content-type';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

