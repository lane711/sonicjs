var dataService = require("../../../../../../services/data.service");
var emitterService = require("../../../../../../services/emitter.service");
var globalService = require("../../../../../../services/global.service");
var formService = require("../../../../../../services/form.service");
var dataService = require("../../../../../../services/data.service");
var emailService = require("../../../../../../services/email.service");
var viewService = require("../../../../../../services/view.service");

module.exports = contactKevantUsMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name !== "CONTACT-KEVANT") {
        return;
      }

      options.moduleName = "contact-kevant";
      await moduleService.processModuleInColumn(options);
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name !== "CONTACT-KEVANT") {
        return;
      }

      let contactFormSettingsId = options.shortcode.properties.id;

      options.viewModel.data.tagLine = options.req.url.includes("sonicjs") ? "Ready to learn how Kevant can leverage SonicJs for your project?" : "Ready to learn more?"

      options.viewModel.data.form = await formService.getForm(
        "contact-kevant",
        undefined,
        "submitFormAndRedirect(submission, '/thank-you')",
        false,
        contactFormSettingsId,
        options.req.sessionID
      );

      // console.log('contact module after view model', options.viewModel);
    });

    emitterService.on("afterFormSubmit", async function (options) {
      if (options.data.contentType !== "contact-kevant") {
        return;
      }

      let formSettings = await dataService.getContentById(options.data.formSettingsId);

      // save the form
      let result = await dataService.contentCreate(options, true, options.sessionID);

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
      adminBody += `<br/>${contact.phone}`;
      adminBody += `<br/>${JSON.stringify(contact.interest)}`;
      adminBody += `<br/>${contact.services}`;
      adminBody += `<br/>${contact.budget}`;

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
};
