var dataService = require('../../../../server/services/data.service');
var emitterService = require('../../../../server/services/emitter.service');
var globalService = require('../../../../server/services/global.service');

module.exports = apiServiceMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'API-SERVICE') {

                options.moduleName = 'api-service';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

