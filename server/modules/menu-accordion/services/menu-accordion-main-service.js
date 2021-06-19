var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');
var menuService = require('../../../services/menu.service');

module.exports = menuAccordionMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'MENU-ACCORDION') {

                options.moduleName = 'menu-accordion';


                await moduleService.processModuleInColumn(options);
            }

        });


        emitterService.on('postModuleGetData', async function (options) {

            if (options.shortcode.name === 'MENU-ACCORDION') {
      
                let menuToDisplay = options.viewModel.data.menuTitle;
                let menuData = await menuService.getMenu(menuToDisplay, options.req.sessionID);
                options.viewModel.data.menuData = menuData;

            }
            
        });
        
    },

}

