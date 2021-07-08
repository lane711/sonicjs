var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = servicesMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'SERVICES') {

                options.moduleName = 'services';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

