var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var formService = require("../../../services/form.service");

module.exports = commentMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "COMMENT") {
        options.moduleName = "comment";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name !== "COMMENT") {
        return;
      }

      options.viewModel.data.form = await formService.getForm(
        "comment",
        undefined,
        "submitForm(submission)"
      );
    });

    emitterService.on("afterFormSubmit", async function (options) {
      if (options.data.contentType !== "comment") {
        return;
      }

      // save the form
      await dataService.contentCreate(options);

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
