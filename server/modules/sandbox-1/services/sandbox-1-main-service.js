var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');

module.exports = sandbox1MainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'MODULE-SANDBOX-1') {
                let id = options.shortcode.properties.id;
                let contentType = options.shortcode.properties.contentType;
                let viewPath = __dirname + `/../views/sandbox-1-main.handlebars`;
                let viewModel = await dataService.getContentById(id);
                let proccessedHtml = await helloWorldMainService.processView(contentType, viewModel, viewPath);

                globalService.pageContent = globalService.pageContent.replace(options.shortcode.codeText, proccessedHtml);
            }

        });
    },

    processView: async function (contentType, viewModel, viewPath) {
        var result = await viewService.getProccessedView(contentType, viewModel, viewPath);

        return result;
    }

}