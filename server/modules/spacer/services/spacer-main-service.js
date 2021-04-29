var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = spacerMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'SPACER') {

                options.moduleName = 'spacer';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

