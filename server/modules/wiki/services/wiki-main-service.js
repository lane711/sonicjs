var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = wikiMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'WIKI') {

                options.moduleName = 'wiki';
                await moduleService.processModuleInColumn(options);
            }

        });


    },

}
