const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')

module.exports = alertMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'ALERT') {
        options.moduleName = 'alert'
        await moduleService.processModuleInColumn(options)
      }
    })
  }

}
