var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = htmlMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

                if (options.shortcode.name === 'HTML') {

                    options.moduleName = 'html';
                    await moduleService.processModuleInColumn(options);
                }

        });
    },

}
