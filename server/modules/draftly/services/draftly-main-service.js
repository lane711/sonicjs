var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = draftlyMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'DRAFTLY') {

                options.moduleName = 'draftly';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

