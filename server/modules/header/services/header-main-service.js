const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')

module.exports = headerMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'HEADER') {
        options.moduleName = 'header'
        await moduleService.processModuleInColumn(options)
      }
    })
  }

}
