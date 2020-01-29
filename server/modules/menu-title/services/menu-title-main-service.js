var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');

module.exports = menuTitleMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'MENU-TITLE') {

                options.moduleName = 'menu-title';
                await moduleService.processModuleInColumn(options);
            }

        });


        eventBusService.on('alterModuleViewModule', async function (options) {

          if (options.shortcode.name !== 'MENU-TITLE') {
              return;
          }

          let sourceColumnId = options.viewModel.data.sourceColumnId;
          let sourceColumn = findColumnById(options.section, sourceColumnId)
          let content = options.section.data.rows[options.rowIndex].columns[options.columnIndex].content;
          options.viewModel.data.menu = "Lane"

          // console.log('contact module after view model', options.viewModel);

      });

      function findColumnById(section, columnId){
        section.data.rows.forEach(row => {
          row.columns.forEach(column => {
            if(column.id === columnId){
              return column;
            }
          });
        });

      }

    },

}
