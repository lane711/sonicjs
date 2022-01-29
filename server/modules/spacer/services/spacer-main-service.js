const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')

module.exports = spacerMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'SPACER') {
        options.moduleName = 'spacer'
        await moduleService.processModuleInColumn(options)
      }
    })
  }

}
