const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')
const menuService = require('../../../services/menu.service')

module.exports = menuAccordionMainService = {

  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'MENU-ACCORDION') {
        options.moduleName = 'menu-accordion'

        await moduleService.processModuleInColumn(options)
      }
    })

    emitterService.on('postModuleGetData', async function (options) {
      if (options.shortcode.name === 'MENU-ACCORDION') {
        const menuToDisplay = options.viewModel.data.menuTitle
        const menuData = await menuService.getMenu(menuToDisplay, options.req.sessionID)
        options.viewModel.data.menuData = menuData
      }
    })
  }

}
