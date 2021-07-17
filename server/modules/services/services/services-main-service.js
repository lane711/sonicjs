var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = servicesMainService = {

    startup: async function () {

        // This is boilerplate for proccessing the module inside of a column
        // You will rarely need to alter this
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'SERVICES') {
                options.moduleName = 'services';
                await moduleService.processModuleInColumn(options);
            }

        });

        // We want to get a list of all services
        // By default SonicJs will pass in the view settings, so we'll extend the 
        // view model to include our list of services
        emitterService.on("postModuleGetData", async function (options) {
            if (options.shortcode.name === "SERVICES") {
              await servicesMainService.getServicesData(options);
            }
          });
    },

    //get all content of type "services", sort it and send it to the view
    getServicesData: async function (options) {
   
        let list = await dataService.getContentByType("services", options.req.sessionID);
        list = list.sort((a, b) => (a.title > b.title) ? 1 : -1)

        options.viewModel.data.list = list;
      },

}
