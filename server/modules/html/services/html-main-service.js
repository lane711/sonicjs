const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')

module.exports = htmlMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'HTML') {
        options.moduleName = 'html'
        await moduleService.processModuleInColumn(options)
      }
    })
  }

}
