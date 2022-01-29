const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')
const contentService = require('../../../services/content.service')

module.exports = textMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'TEXT') {
        options.moduleName = 'text'
        await moduleService.processModuleInColumn(options)
      }
    })
  }

}
