const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')
const contentService = require('../../../services/content.service')

module.exports = featureBoxMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'FEATURE-BOX') {
        options.moduleName = 'feature-box'
        await moduleService.processModuleInColumn(options)
      }
    })
  }

}
