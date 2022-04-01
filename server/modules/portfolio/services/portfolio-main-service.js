var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = portfolioMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'PORTFOLIO') {

                options.moduleName = 'portfolio';
                await moduleService.processModuleInColumn(options);
            }

        });

        emitterService.on("postModuleGetData", async function (options) {
            if (options.shortcode.name === "PORTFOLIO") {
              await portfolioMainService.processPortfolioData(options);
            }
          });
    },

    processPortfolioData: async function (options) {
        let enabledRecords = [];
        options.viewModel.data.items.map(function(record, index) {

            if(record.description.length > 0){
                record.isEven = false;
                if (index % 2 === 0) {
                    record.isEven = true;
                }
                enabledRecords.push(record);
            }
        })
        options.viewModel.data.items = enabledRecords;
    }

}

