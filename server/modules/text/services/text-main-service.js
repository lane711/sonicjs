var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');
var contentService = require('../../../services/content.service');

module.exports = textMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'TEXT') {

                options.moduleName = 'text';
                await moduleService.processModuleInColumn(options);
            }
        });
    },

}
