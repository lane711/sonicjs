var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');
var viewService = require('../../../services/view.service');



module.exports = contactUsMainService = {

    startup: async function () {
        eventBusService.on('beforeSave', async function (options) {

            if(options.data.contenType === 'contact-us'){
                
            }
            // if (options.shortcode.name === 'MODULE-HELLO-WORLD') {
            //     let id = options.shortcode.properties.id;
            //     let contentType = options.shortcode.properties.contentType;
            //     let viewPath = __dirname + `/../views/main.handlebars`;
            //     let viewModel = await dataService.getContentById(id);
            //     let proccessedHtml = await helloWorldMainService.processView(contentType, viewModel, viewPath);

            //     globalService.pageContent = globalService.pageContent.replace(options.shortcode.codeText, proccessedHtml);
            // }

        });
    },

    // processView: async function (contentType, viewModel, viewPath) {
    //     var result = await viewService.getProccessedView(contentType, viewModel, viewPath);

    //     return result;
    // }

}