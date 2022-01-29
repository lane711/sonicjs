const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')

module.exports = videoMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'VIDEO') {
        options.moduleName = 'video'
        await moduleService.processModuleInColumn(options)
      }
    })
  }

}
