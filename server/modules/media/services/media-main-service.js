var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');
var viewService = require('../../../services/view.service');
var mediaService = require('../../../services/media.service');



module.exports = mediaMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'MODULE-MEDIA') {
                let id = options.shortcode.properties.id;
                let contentType = options.shortcode.properties.contentType;
                let viewPath = __dirname + `/../views/media-main.handlebars`;
                let viewModel = await dataService.getContentById(id);
                let files = await dataService.getContentByContentTypeAndTag('media', viewModel.data.tags);
                let sortedFiles = files.sort((a, b) => (a.data.sortOrder > b.data.sortOrder) ? 1 : -1)
                await mediaService.addMediaUrl(sortedFiles);
                viewModel.data.files = sortedFiles;
                let proccessedHtml = await mediaMainService.processView(contentType, viewModel, viewPath);

                globalService.pageContent = globalService.pageContent.replace(options.shortcode.codeText, proccessedHtml);
            }

        });
    },

    processView: async function (contentType, viewModel, viewPath) {
        var result = await viewService.getProccessedView(contentType, viewModel, viewPath);

        return result;
    }

}