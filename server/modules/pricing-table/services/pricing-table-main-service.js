var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = pricingTableMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'PRICING-TABLE') {

                options.moduleName = 'pricing-table';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

