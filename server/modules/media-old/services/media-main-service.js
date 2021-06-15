var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');
var viewService = require('../../../services/view.service');
var mediaService = require('../../../services/media.service');



module.exports = mediaMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'MODULE-MEDIA') {
                let id = options.shortcode.properties.id;
                let contentType = options.shortcode.properties.contentType;
                let viewPath = __dirname + `/../views/media-main.handlebars`;
                let viewModel = await dataService.getContentById(id);
                let files = await dataService.getContentByContentTypeAndTag('media', viewModel.data.tags, options.req.sessionID);
                let sortedFiles = files.sort((a, b) => (a.data.sortOrder > b.data.sortOrder) ? 1 : -1)
                await mediaService.addMediaUrl(sortedFiles);
                viewModel.data.files = sortedFiles;
                let processedHtml = await mediaMainService.processView(contentType, viewModel, viewPath);

                options.page.data.html = options.page.data.html.replace(options.shortcode.codeText, processedHtml);
            }

        });
    },

    processView: async function (contentType, viewModel, viewPath) {
        var result = await viewService.getProcessedView(contentType, viewModel, viewPath);

        return result;
    }

}
