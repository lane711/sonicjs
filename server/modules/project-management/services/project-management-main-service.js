var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = projectManagementMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'PROJECT-MANAGEMENT') {

                options.moduleName = 'project-management';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

