const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')

module.exports = mediaMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'MEDIA') {
        options.moduleName = 'media'
        await moduleService.processModuleInColumn(options)
      }
    })
  }

}
