var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = headerMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'HEADER') {

                options.moduleName = 'header';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

