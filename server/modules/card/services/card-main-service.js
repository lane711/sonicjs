var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = cardMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'CARD') {

                options.moduleName = 'card';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

