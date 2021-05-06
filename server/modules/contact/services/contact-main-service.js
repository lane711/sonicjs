var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var formService = require("../../../services/form.service");
var dataService = require("../../../services/data.service");
var emailService = require("../../../services/email.service");

module.exports = contactUsMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name !== "CONTACT") {
        return;
      }

      options.moduleName = "contact";
      await moduleService.processModuleInColumn(options);
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name !== "CONTACT") {
        return;
      }

      options.viewModel.data.form = await formService.getForm(
        "contact",
        undefined,
        "submitForm(submission)"
      );

      // console.log('contact module after view model', options.viewModel);
    });

    emitterService.on("afterFormSubmit", async function (options) {
      if (options.data.contentType !== "contact") {
        return;
      }

      // save the form
      await dataService.contentCreate(options);

      // send the emails
      let contact = options.data;

      //confirmation to user
      let body = `Hi ${contact.name}, \n\nThanks for reaching out. We'll get back to you ASAP.\n\nFor your reference, here was your message:\n${contact.message}`;
      await emailService.sendEmail(
        "admin@ocunite.org",
        contact.email,
        "OCUnite.org Message Received",
        body
      );

      //admin notification
      let adminBody = `${contact.name} (${contact.email}) wrote: \n\n${contact.message}`;
      await emailService.sendEmail(
        contact.email,
        "admin@ocunite.org",
        "OCUnite.org Contact",
        adminBody
      );
    });
  },
};
