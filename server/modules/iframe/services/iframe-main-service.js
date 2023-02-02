var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = iframeMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'IFRAME') {

                options.moduleName = 'iframe';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

