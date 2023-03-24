var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = serviceCompareMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'SERVICE-COMPARE') {

                options.moduleName = 'service-compare';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

