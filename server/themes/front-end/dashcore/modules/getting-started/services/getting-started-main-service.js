var dataService = require('../../../../../../services/data.service');
var emitterService = require('../../../../../../services/emitter.service');
var globalService = require('../../../../../../services/global.service');

module.exports = gettingStartedMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'GETTING-STARTED') {

                options.moduleName = 'getting-started';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

