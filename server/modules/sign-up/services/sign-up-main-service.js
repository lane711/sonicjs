var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var formService = require("../../../services/form.service");
var dataService = require("../../../services/data.service");
var emailService = require("../../../services/email.service");
var viewService = require("../../../services/view.service");

module.exports = signUpMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'SIGN-UP') {

                options.moduleName = 'sign-up';
                await moduleService.processModuleInColumn(options);
            }

        });

        emitterService.on("postModuleGetData", async function (options) {
            if (options.shortcode.name !== "SIGN-UP") {
              return;
            }
      
            let contactFormSettingsId = options.shortcode.properties.id;
      
            options.viewModel.data.form = await formService.getForm(
              "sign-up",
              undefined,
              "submitForm(submission)",
              false,
              contactFormSettingsId,
              options.req.sessionID
            );
      
            // console.log('contact module after view model', options.viewModel);
          });
      
          emitterService.on("afterFormSubmit", async function (options) {
            if (options.data.contentType !== "sign-up") {
              return;
            }
      
            let formSettings = await dataService.getContentById(options.data.formSettingsId);
      
            // save the form
            await dataService.contentCreate(options, true, options.sessionID);
      
            // send the emails
            let contact = options.data;
      
            //confirmation to user
            // let body = `Hi ${contact.name}, \n\nThanks for reaching out. We'll get back to you ASAP.\n\nFor your reference, here was your message:\n${contact.message}`;
            let body = viewService.processTemplateString(formSettings.data.emailMessageBody, {contact});
      
            //to user - confirmation
            await emailService.sendEmail(
              formSettings.data.adminEmail,
              formSettings.data.fromName,
              formSettings.data.adminEmail,
              contact.email,
              formSettings.data.emailMessageSubject,
              body
            );
      
            //admin notification
            let adminBody = `${contact.name} (${contact.email}) wrote: <br/><br/>${contact.message}`;
            await emailService.sendEmail(
              formSettings.data.adminEmail,
              contact.name,
              contact.email,
              formSettings.data.adminEmail,
              formSettings.data.emailMessageSubjectAdmin,
              adminBody
            );
      
          });
    },

}
