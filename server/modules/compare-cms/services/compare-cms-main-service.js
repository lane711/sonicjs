var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = compareCmsMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'COMPARE-CMS') {

                options.moduleName = 'compare-cms';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

