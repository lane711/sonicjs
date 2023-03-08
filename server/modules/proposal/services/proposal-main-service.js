var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = proposalMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'PROPOSAL') {

                options.moduleName = 'proposal';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

