var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = taxonomyMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'TAXONOMY') {

                options.moduleName = 'taxonomy';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

