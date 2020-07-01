var dataService = require("../../../services/data.service");
var eventBusService = require("../../../services/event-bus.service");
var globalService = require("../../../services/global.service");
var formService = require("../../../services/form.service");
var dataService = require("../../../services/data.service");
var emailService = require("../../../services/email.service");

module.exports = contactUsMainService = {
  startup: async function () {
    eventBusService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name !== "CONTACT-US") {
        return;
      }

      options.moduleName = "contact-us";
      await moduleService.processModuleInColumn(options);
    });

    eventBusService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name !== "CONTACT-US") {
        return;
      }

      options.viewModel.data.form = await formService.getForm(
        "contact",
        undefined,
        "submitForm(submission)"
      );

      // console.log('contact module after view model', options.viewModel);
    });

    eventBusService.on("afterFormSubmit", async function (options) {
      if (options.data.contentType !== "contact") {
        return;
      }

      // save the form
      await dataService.createContentInstance(options);

      // send the emails
      let contact = options.data;

      //confirmation to user
      let body = `Hi ${contact.name}, \n\nThanks for reaching out. We'll get back to you ASAP.\n\nFor your reference, here was your message:\n${contact.message}`;
      await emailService.sendEmail(
        contact.email,
        "lane@sonicjs.com",
        "SoncisJs Message Received",
        body
      );

      //admin notification
      let adminBody = `${contact.name} (${contact.email}) wrote: \n\n${contact.message}`;
      await emailService.sendEmail(
        "lane@sonicjs.com",
        contact.email,
        "SoncisJs Contact",
        adminBody
      );
    });
  },
};
