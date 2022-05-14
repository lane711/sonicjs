var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = viewMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'VIEW') {

                options.moduleName = 'view';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

