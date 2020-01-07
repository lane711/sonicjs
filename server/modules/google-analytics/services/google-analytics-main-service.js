var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');

module.exports = googleAnalyticsMainService = {

    startup: async function () {
        // eventBusService.on('beginProcessModuleShortCode', async function (options) {

        //     if (options.shortcode.name === 'GOOGLE-ANALYTICS') {

        //         options.moduleName = 'google-analytics';
        //         await moduleService.processModuleInColumn(options);
        //     }

        // });

        eventBusService.on('getRenderedPagePostDataFetch', async function (options) {
            if (options && options.page) {
                await googleAnalyticsMainService.addHeaderJs(options);
            }
        });
    },

    addHeaderJs: async function (options) {
        let googleAnalyticUSCode = '12344';
        options.page.data.headerJs = `  <script async="" src="https://www.googletagmanager.com/gtag/js?id=${googleAnalyticUSCode}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag() { dataLayer.push(arguments); }
          gtag('js', new Date());
      
          gtag('config', '${googleAnalyticUSCode}');
        </script>`;

    },

}