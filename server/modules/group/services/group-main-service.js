var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = groupMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'GROUP') {

                options.moduleName = 'group';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}
