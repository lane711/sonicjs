var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');
var contentService = require('../../../services/content.service');

module.exports = featureBoxMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'MODULE-FEATURE-BOX') {
                let id = options.shortcode.properties.id;
                let contentType = options.shortcode.properties.contentType;
                let viewPath = __dirname + `/../views/feature-box-main.handlebars`;
                let viewModel = await dataService.getContentById(id);
                var proccessedHtml = { id: id,  body: await helloWorldMainService.processView(contentType, viewModel, viewPath) };

                eventBusService.emit("afterProcessModuleShortCodeProccessedHtml", proccessedHtml);

                globalService.pageContent = globalService.pageContent.replace(options.shortcode.codeText, proccessedHtml.body);
            }

        });
    },

    processView: async function (contentType, viewModel, viewPath) {
        var result = await viewService.getProccessedView(contentType, viewModel, viewPath);

        return result;
    }

}