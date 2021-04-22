var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = bodyTextShortcodesMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'BODY-TEXT-SHORTCODES') {

                options.moduleName = 'body-text-shortcodes';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

