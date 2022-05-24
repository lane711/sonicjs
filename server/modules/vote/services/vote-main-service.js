var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = voteMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'VOTE') {

                options.moduleName = 'vote';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

