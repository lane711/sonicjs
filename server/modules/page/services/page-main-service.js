const dalService = require('../../../services/dal.service')
const emitterService = require('../../../services/emitter.service')
const contentService = require('../../../services/content.service')
const urlService = require('../../../services/url.service')

let sourceColumnId
const titleModules = []

module.exports = pageMainService = {
  startup: async function () {
    emitterService.on('modulesLoaded', async function (options) {
      const pages = await dalService.contentGet(
        null,
        'page',
        null,
        null,
        null,
        null,
        null,
        null,
        true
      )
      pages.map((page) => {
        const pageData = JSON.parse(page.data)
        urlService.addUrl(page.url, 'pageHandler', 'exact', pageData.title, page.id)
      })
    })

    emitterService.on('contentCreatedOrUpdated', async function (options) {
      if (options.contentTypeId === 'page') {
        const pageData = JSON.parse(options.data)
        urlService.addUrl(pageData.url, 'pageHandler', 'exact', pageData.title, options.id)
      }
    })

    emitterService.on('processUrl', async function (options) {
      if (options.urlKey?.handler === 'pageHandler') {
        const { page: pageData } = await contentService.getRenderedPage(options.req)
        options.page = pageData
      }
    })
  }
}
