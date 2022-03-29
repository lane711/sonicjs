var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = portfolioMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'PORTFOLIO') {

                options.moduleName = 'portfolio';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

