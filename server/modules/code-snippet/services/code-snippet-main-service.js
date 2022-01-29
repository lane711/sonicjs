const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')

module.exports = codeSnippetMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'CODE-SNIPPET') {
        options.moduleName = 'code-snippet'
        await moduleService.processModuleInColumn(options)
      }
    })
  }

}
