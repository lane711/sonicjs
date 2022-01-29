const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')

module.exports = youtubeMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'YOUTUBE') {
        options.moduleName = 'youtube'
        await moduleService.processModuleInColumn(options)
      }
    })
  }

}
