var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = newsletterMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'NEWSLETTER') {

                options.moduleName = 'newsletter';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

