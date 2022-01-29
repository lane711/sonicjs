const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')

module.exports = faqMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'FAQ') {
        options.moduleName = 'faq'
        await moduleService.processModuleInColumn(options)
      }
    })
  }

}
