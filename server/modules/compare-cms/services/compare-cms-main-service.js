var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');
var helperService = require('../../../services/helper.service');

module.exports = compareCmsMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'COMPARE-CMS') {

                options.moduleName = 'compare-cms';
                await moduleService.processModuleInColumn(options);
            }

        });

        emitterService.on("postModuleGetData", async function (options) {
            if (options.shortcode.name === "COMPARE-CMS") {
              await compareCmsMainService.getCompareRowData(options);
            }
          });
    },

    getCompareRowData: async function (options) {
   
        let list = await dataService.getContentByType("compare-row", options.req.sessionID);
        // list = list.sort((a, b) => (a.title > b.title) ? 1 : -1)

        options.viewModel.data.list = list[0].data.cmsList;
        //add anchor ids
        options.viewModel.data.list.forEach(row => {
          if(row.title){
            row.anchor = helperService.slugify(row.title);
          }
        });



        options.viewModel.data.rows = list[0].data.dataGrid;

        //add anchor ids
        options.viewModel.data.rows.forEach(row => {
          if(row.category){
            row.anchor = helperService.slugify(row.title);
          }
        });
      },

}

