var dataService = require('../../../../server/services/data.service');
var emitterService = require('../../../../server/services/emitter.service');
var globalService = require('../../../../server/services/global.service');

module.exports = rfeMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'RFE') {

                options.moduleName = 'rfe';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

