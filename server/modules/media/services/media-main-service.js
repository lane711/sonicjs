var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = mediaMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'MEDIA') {

                options.moduleName = 'media';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

