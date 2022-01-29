const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')

module.exports = commentGalleryMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'COMMENT-GALLERY') {
        options.moduleName = 'comment-gallery'
        await moduleService.processModuleInColumn(options)
      }
    })

    emitterService.on('postModuleGetData', async function (options) {
      if (options.shortcode.name === 'COMMENT-GALLERY') {
        await commentGalleryMainService.getCommentData(options)
      }
    })
  },

  getCommentData: async function (options) {
    const id = options.shortcode.properties.id
    const moduleData = await dataService.getContentById(id)
    const contentType = 'comment'
    const viewModel = moduleData

    const listRaw = await dataService.getContentByType(contentType)

    // listRaw = listRaw.filter((x) => x.data.title);
    // let list = listRaw.map(function (record) {
    //   return {
    //     data: {
    //       title: record.data.title,
    //       body: formatService.stripHtmlTags(
    //         helperService.truncateString(record.data.body, 400)
    //       ),
    //       image: record.data.fileName
    //         ? dataService.getImageUrl(record.data.fileName)
    //         : undefined,
    //       url: record.data.url,
    //       createdOn: record.data.createdOn,
    //     },
    //   };
    // });

    options.viewModel.data.list = listRaw
  },

  processView: async function (contentType, viewModel, viewPath) {
    const result = await viewService.getProcessedView(
      contentType,
      viewModel,
      viewPath
    )

    return result
  }

}
