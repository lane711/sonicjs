var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var formService = require("../../../services/form.service");
var s3Service = require("../../../services/s3.service");

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
        "submitForm(submission)",
        undefined, 
        undefined,
        options.req.sessionID
      );
    });

    emitterService.on("afterFormSubmit", async function (options) {
      if (options.data && options.data.contentType !== "comment") {
        return;
      }

      // save the form
      await dataService.contentCreate(options);

      s3Service.upload(
        options.data.videoUpload[0].name,
        options.cookies.videoPath
      );

      // send the emails
      let contact = options.data;

      if (contact.email) {
        //confirmation to user
        let body = `Hi ${contact.name}, \n\nThanks for submitting your comment. It will be live within several hours.\n\nFor your reference, here was your message:\n${contact.message}`;
        await emailService.sendEmail(
          "admin@ocunite.org",
          "Test123",
          contact.email,
          "OCUnite.org Comment Received",
          body
        );

        //admin notification
        let adminBody = `${contact.name} (${contact.email}) wrote: \n\n${contact.message}`;
        await emailService.sendEmail(
          contact.email,
          "Test123",
          "admin@ocunite.org",
          "OCUnite.org Comment Received",
          adminBody
        );
      }
    });
  },
};
