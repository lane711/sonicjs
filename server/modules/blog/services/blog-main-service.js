var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = blogMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'BLOG') {

                options.moduleName = 'blog';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}
