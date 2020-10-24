var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = youtubeMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'YOUTUBE') {

                options.moduleName = 'youtube';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}
