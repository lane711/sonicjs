var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = eventMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'EVENT') {

                options.moduleName = 'event';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

