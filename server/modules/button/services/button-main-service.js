const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')

module.exports = buttonMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'BUTTON') {
        options.moduleName = 'button'
        await moduleService.processModuleInColumn(options)
      }
    })
  }

}
