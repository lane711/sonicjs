var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = titleMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'TITLE') {

                options.moduleName = 'title';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}
