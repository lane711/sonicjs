var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var userService = require("../../../services/user.service");

module.exports = userMainService = {
  startup: async function() {

    emitterService.on("afterFormSubmit", async function (options) {
      if (options.data && options.data.contentType !== "user-register") {
        return;
      }

      // save the form
      await userService.registerUser(options.data.email, options.data.password);
    });
  }

};
