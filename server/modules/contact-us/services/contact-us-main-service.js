var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');
var formService = require('../../../services/form.service')

module.exports = contactUsMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name !== 'CONTACT-US') {
                return;
            }

            options.moduleName = 'contact-us';
            await moduleService.processModuleInColumn(options);


        });

        eventBusService.on('afterProcessModuleShortCodeProccessedViewModel', async function (options) {

            if (options.shortcode.name !== 'CONTACT-US') {
                return;
            }

            // options.viewModel.data.form = await formService.getForm('contact', undefined, "addModuleToColumn(submission)");
            options.viewModel.data.form = "<script type='text/javascript'>alert('df');</script>"

            console.log('contact module after view model', options.viewModel);

        });

    },

}