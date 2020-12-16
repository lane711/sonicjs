var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = {{ systemidCamelCase }}MainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === '{{ systemidUpperCase }}') {

                options.moduleName = '{{ systemId }}';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

