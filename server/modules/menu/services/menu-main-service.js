var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = menuMainService = {

    startup: async function (app) {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'MENU') {

                options.moduleName = 'menu';
                await moduleService.processModuleInColumn(options);
            }

        });

        emitterService.on('postModuleGetData', async function (options) {

          if (options.shortcode.name === 'MENU') {
    
              let menuToDisplay = options.viewModel.data.menuTitle;
              let menuData = await dataService.getContentById(options.viewModel.data.menu, options.req.sessionID);
              options.viewModel.data.links = menuData.data.links;

          }
          
      });

        if (app) {
          app.get("/api-admin/menus", async function (req, res) {
            let data = await dataService.getContentByContentType('menu');
            let menus = data.map((r) => {
              return { id: r.id, name: r.data.title };
            });
            res.send(menus);
          });
        }
    },

}
