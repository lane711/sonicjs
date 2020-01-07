var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');

module.exports = amplitudeMainService = {

    startup: async function () {
        eventBusService.on('getRenderedPagePostDataFetch', async function (options) {
            if (options && options.page) {
                await amplitudeMainService.addHeaderJs(options);
            }
        });
    },

    addHeaderJs: async function (options) {
        let amplitudeSettings = await dataService.getContentTopOne('amplitude');
        options.page.data.headerJs += amplitudeSettings.data.amplitudeTrackingCode;
        options.page.data.headerJs += `<script>amplitude.getInstance().logEvent('PAGE_LOAD');</script>`;

    },

}