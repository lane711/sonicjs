const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')
const viewService = require('../../../services/view.service')
const mediaService = require('../../../services/media.service')

module.exports = mediaMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'MODULE-MEDIA') {
        const id = options.shortcode.properties.id
        const contentType = options.shortcode.properties.contentType
        const viewPath = __dirname + '/../views/media-main.handlebars'
        const viewModel = await dataService.getContentById(id)
        const files = await dataService.getContentByContentTypeAndTag('media', viewModel.data.tags, options.req.sessionID)
        const sortedFiles = files.sort((a, b) => (a.data.sortOrder > b.data.sortOrder) ? 1 : -1)
        await mediaService.addMediaUrl(sortedFiles)
        viewModel.data.files = sortedFiles
        const processedHtml = await mediaMainService.processView(contentType, viewModel, viewPath)

        options.page.data.html = options.page.data.html.replace(options.shortcode.codeText, processedHtml)
      }
    })
  },

  processView: async function (contentType, viewModel, viewPath) {
    const result = await viewService.getProcessedView(contentType, viewModel, viewPath)

    return result
  }

}
