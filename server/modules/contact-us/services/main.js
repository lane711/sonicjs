var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');
var viewService = require('../../../services/view.service');
var emailService = require('../../../services/email.service');



module.exports = contactUsMainService = {

    startup: async function () {
        eventBusService.on('beforeSave', async function (options) {

            if (options.instance.contentType === 'contact') {

                let contact = options.instance;

                //confirmation to user
                let body = `Hi ${contact.name}, \n\nThanks for reaching out. We'll get back to you ASAP.\n\nFor your reference, here was your message:\n\n${contact.message}`
                emailService.sendEmail(contact.email, 'admin@sonicjs.com', 'SoncisJs Message Recieved', body);

                //admin notification
                let adminBody = `${contact.name} (${contact.email}) wrote: \n\n${contact.message}`
                emailService.sendEmail('admin@sonicjs.com', contact.email, 'SoncisJs Contact', adminBody);


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