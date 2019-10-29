var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');



module.exports = mainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'MODULE-HELLO-WORLD') {
                let blockId = options.shortcode.properties.id;
                let contentType = options.shortcode.properties.contentType;

                // let form = await formService.getForm(contentType);

                globalService.pageContent = globalService.pageContent.replace(options.shortcode.codeText, 'processed module view here');
            }

        });
    },

    processView: async function (contentTypeId, content) {

    }

}