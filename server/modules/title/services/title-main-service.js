const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')

module.exports = titleMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'TITLE') {
        options.moduleName = 'title'
        await moduleService.processModuleInColumn(options)
      }
    })
  }

}
