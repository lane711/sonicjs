var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = faqMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'FAQ') {

                options.moduleName = 'faq';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

