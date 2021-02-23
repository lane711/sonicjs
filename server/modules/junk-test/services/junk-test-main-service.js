var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = junkTestMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'JUNK-TEST') {

                options.moduleName = 'junk-test';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

