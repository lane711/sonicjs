const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')
const moduleService = require('../../../services/module.service')
const ShortcodeTree = require('shortcode-tree').ShortcodeTree

module.exports = bodyTextShortcodesMainService = {
  startup: async function () {
    emitterService.on('postModuleGetData', async function (options) {
      if (options.viewModel && options.viewModel.data && options.viewModel.data.body) {
        const parsedBlock = ShortcodeTree.parse(options.viewModel.data.body)

        if (parsedBlock.children) {
          for (const bodyBlock of parsedBlock.children) {
            if (bodyBlock.shortcode) {
              const id = bodyBlock.shortcode.properties.id
              if (!id) continue
              const contentType = bodyBlock.shortcode.name.toLowerCase()
              const viewPath = await moduleService.getModuleViewFile(contentType)
              const viewModel = await dataService.getContentById(id, options.req.sessionID)

              const processedHtml = {
                id: id,
                contentType: contentType,
                shortCode: options.shortcode,
                body: await moduleService.processView(contentType, viewModel, viewPath)
              }

              options.viewModel.data.body = options.viewModel.data.body.replace(
                bodyBlock.shortcode.codeText,
                processedHtml.body
              )
            }
          }
        }
      }
    })
  }
}
