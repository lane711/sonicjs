var userService = require("../../../services/user.service");
var dalService = require("../../../services/dal.service");

module.exports = demoSiteMainService = {
  startup: async function (app) {
    // emitterService.on('beginProcessModuleShortCode', async function (options) {

    //     if (options.shortcode.name === 'DEMO-SITE') {

    //         options.moduleName = 'demo-site';
    //         await moduleService.processModuleInColumn(options);
    //     }

    // });

    app.on("modulesLoaded", demoSiteMainService.setupDemoSite);
  },

  setupDemoSite: async function () {
    // console.log("demo site moduleLoaded");
    //check that demo user admin account is available
    demoSiteMainService.checkDemoAdminAccount();
    //add demo site header
  },

  checkDemoAdminAccount: async function () {
    console.log("checkDemoAdminAccount");

    let session = { user: { id: "69413190-833b-4318-ae46-219d690260a9" } };

    let demoAdminUser = await dalService.userGetByLogin(
      "demo@sonicjs.com",
      "demo123"
    );

    console.log("demoAdminUser", demoAdminUser);

    if (!demoAdminUser || demoAdminUser.length === 0) {
      let newDemoUser = await userService.registerUser(
        "demo@sonicjs.com",
        "demo123",
        true
      );

      console.log("created newDemoUser:", newDemoUser);
    }
  },
};
