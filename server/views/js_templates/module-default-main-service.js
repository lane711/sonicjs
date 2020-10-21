var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = {{ systemidCamelCase }}MainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === '{{ systemidUpperCase }}') {

                options.moduleName = '{{ systemid }}';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}
