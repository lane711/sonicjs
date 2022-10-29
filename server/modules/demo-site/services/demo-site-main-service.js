var userService = require("../../../services/user.service");
var dalService = require("../../../services/dal.service");
var adminService = require("../../../services/admin.service");

module.exports = demoSiteMainService = {
  startup: async function (app) {
    // emitterService.on('beginProcessModuleShortCode', async function (options) {

    //     if (options.shortcode.name === 'DEMO-SITE') {

    //         options.moduleName = 'demo-site';
    //         await moduleService.processModuleInColumn(options);
    //     }

    // });

    app.on("modulesLoaded", demoSiteMainService.setupDemoSite);
    app.on("pagePreRender", demoSiteMainService.addDemoSiteHeader);

  },

  setupDemoSite: async function () {
    // console.log("demo site moduleLoaded");
    //check that demo user admin account is available
    demoSiteMainService.checkDemoAdminAccount();
  },

  checkDemoAdminAccount: async function () {
    // console.log("checkDemoAdminAccount");

    let session = { user: { id: "69413190-833b-4318-ae46-219d690260a9" } };

    let demoAdminUser = await dalService.userGetByLogin(
      "demo@sonicjs.com",
      "demo123"
    );

    // console.log("demoAdminUser", demoAdminUser);

    if (!demoAdminUser || demoAdminUser.length === 0) {
      let newDemoUser = await userService.registerUser(
        "demo@demo.com",
        "demo123",
        true
      );

      console.log("created newDemoUser:", newDemoUser);

      adminService.checkIfAdminAccountIsCreated();
    }
  },

  addDemoSiteHeader: async function (options) {
    // console.log('postProcessPage', options.page.data);
    options.page.data.preHeader = `  <div class="alert alert-danger demo-alert fixed-top text-center" >
    <strong>SonicJs Demo Site</strong><i class="bi bi-chevron-double-right mx-3"></i><a href="/admin">Click here to login</a>
    <i class="bi bi-chevron-left mx-1"></i>username: <strong>demo@demo.com</strong> , password: <strong>demo123</strong>
    <i class="bi bi-chevron-right mx-1"></i>
  </div>`;
  },
};
