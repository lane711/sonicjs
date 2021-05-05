var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = newsletterMainService = {

    startup: async function (app) {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'NEWSLETTER') {

                options.moduleName = 'newsletter';
                await moduleService.processModuleInColumn(options);
            }

        });

        emitterService.on("afterFormSubmit", async function (options) {
            if (options.contentType !== "newsletter") {
              return;
            }

            let payload = {
                data: {
                  contentType: options.contentType,
                  email: options.email,
                },
              };
      
            // save the form
            await dataService.contentCreate(payload);
      
            // send the emails
      
            //confirmation to user
            let body = `Hi Fellow Patriot, \n\nThanks for signing up for our mailing list. We'll be in touch soon!`;
            await emailService.sendEmail(
                options.email,
              "admin@ocunite.org",
              "Newsletter SignUp Confirmed",
              body
            );
      
            //admin notification
            let adminBody = `${options.email}`;
            await emailService.sendEmail(
              "admin@ocunite.org",
              options.email,
              "OCUnite Newsletter SignUp",
              adminBody
            );
          });

    },

    

}

