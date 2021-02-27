var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = menuAccordionMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'MENU-ACCORDION') {

                options.moduleName = 'menu-accordion';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}

