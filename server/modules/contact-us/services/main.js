var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');
var viewService = require('../../../services/view.service');



module.exports = contactUsMainService = {

    startup: async function () {
        eventBusService.on('beforeSave', async function (options) {

            if (options.instance.contentType === 'contact') {

                var helper = require('sendgrid').mail;
                var from_email = new helper.Email('ldc0618@gmail.com');
                var to_email = new helper.Email('ldc0618@gmail.com');
                var subject = 'Hello World from the SendGrid Node.js Library!';
                var content = new helper.Content('text/plain', 'Hello, Email!');
                var mail = new helper.Mail(from_email, subject, to_email, content);

                var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
                var request = sg.emptyRequest({
                    method: 'POST',
                    path: '/v3/mail/send',
                    body: mail.toJSON(),
                });

                sg.API(request, function (error, response) {
                    if(error){
                        console.log(error);
                    }
                    console.log(response.statusCode);
                    console.log(response.body);
                    console.log(response.headers);
                });

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